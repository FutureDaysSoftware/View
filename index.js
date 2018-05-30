const { EventEmitter } = require('events')

module.exports = class View extends EventEmitter {
    
    static Error = require('./lib/MyError')
    //static Factory = require('Factory')
    //static Model = require('Model')
    static OptimizedResize = require('./lib/OptimizedResize')
    static Util = require('./util/index')
    static TemplateContext = require('./TemplateContext')
    static Xhr = require('./lib/Xhr')

    animate( el, klass ) {
        return new Promise( resolve => {
            const onAnimationEnd = e => {
                el.classList.remove( klass )
                el.removeEventListener( 'animationend', onAnimationEnd )
                resolve()
            }

            el.addEventListener( 'animationend', onAnimationEnd )
            el.classList.add( klass )
        } )
    }

    bindEvent( key, event, el ) {
        const els = el ? [ el ] : Array.isArray( this.els[ key ] ) ? this.els[ key ] : [ this.els[ key ] ],
           name = this.getEventMethodName( key, event )

        if( !this[ `_${name}` ] ) this[ `_${name}` ] = e => this[ name ](e)

        els.forEach( el => el.addEventListener( event || 'click', this[ `_${name}` ] ) )
    }

    constructor( opts={} ) {
        super()
        Object.assign( this, opts )

        if( this.requiresLogin && ( !this.user.isLoggedIn() ) ) return this.handleLogin()
        if( this.user && !this.isAllowed( this.user ) ) return this.scootAway()

        return this.render()
    }

    content = document.querySelector('#content')

    delegateEvents( key, el ) {
        var type = typeof this.events[key]

        if( type === "string" ) { this.bindEvent( key, this.events[key], el ) }
        else if( Array.isArray( this.events[key] ) ) {
            this.events[ key ].forEach( eventObj => this.bindEvent( key, eventObj ) )
        } else {
            this.bindEvent( key, this.events[key].event )
        }
    }

    async delete() {
        await this.hide()

        const { container } = this.els,
            parent = container.parentNode
        if( container && parent ) parent.removeChild( container )
        this.emit('deleted')
    }

    els = { }

    events = { }

    fadeInImage( el ) {
        el.onload = () => this.onImgLoad( el )
        el.setAttribute( 'src', el.getAttribute('data-src') )
    }

    getEventMethodName( key, event ) { return `on${View.Util.capitalizeFirstLetter(key)}${View.Util.capitalizeFirstLetter(event)}` }

    getTemplateOptions() {
       return { user: this.user ? this.user.data : {}, model: this.model }
    }

    handleLogin() {
        View.Factory.create( 'login', { insertion: { el: document.querySelector('#content') } } )
        .on( "loggedIn", () => this.onLogin() )

        return this
    }

    hide() { return this.hideEl( this.els.container ) }

    async hideEl( el ) { await this.animate( el, 'hide' ); el.classList.add('hidden') }

    hideSync() { this.els.container.classList.add('hidden'); return this }

    htmlToFragment( str ) {
        return View.Factory.range.createContextualFragment( str )
    }

    insertToDom( fragment, options ) {
        const insertion = typeof options.insertion === 'function' ? options.insertion() : options.insertion;

        insertion.method === 'insertBefore'
            ? insertion.el.parentNode.insertBefore( fragment, insertion.el )
            : insertion.el[ insertion.method || 'appendChild' ]( fragment )
    }

    isAllowed( user ) {
        if( !this.requiresRole ) return true
            
        const userRoles = new Set( user.data.roles )

        if( typeof this.requiresRole === 'string' ) return userRoles.has( this.requiresRole )

        if( Array.isArray( this.requiresRole ) ) {
            const result = this.requiresRole.find( role => userRoles.has( role ) )

            return result !== undefined
        }

        return false
    }
    
    isHidden( el ) { return el ? el.classList.contains('hidden') : this.els.container.classList.contains('hidden') }

    onImgLoad() {
        this.emit( 'imgLoaded', el )
        el.removeAttribute('data-src')
    }

    onLogin() {
        if( !this.isAllowed( this.user ) ) return this.scootAway()
        this.render()
    }

    onNavigation() {
        return this.show().catch( View.Error )
    }

    showNoAccess() {
        alert("No privileges, son")
        return this
    }

    slurp = { attr: 'data-js', view: 'data-view', name: 'data-name', img: 'data-src' }

    postRender() { return this }

    render() {
        if( this.data ) this.model = Object.create( this.Model, { } ).constructor( this.data )

        this.slurpTemplate( {
            insertion: this.insertion || { el: document.body },
            isView: true,
            template: Reflect.apply( this.template, View.TemplateContext, [ this.getTemplateOptions() ] )
        } )

        this.els.container.classList.add( this.name )
        if( this.templateName ) this.els.container.classList.add( this.templateName )
        if( this.klass ) this.els.container.classList.add( this.klass )

        this.renderSubviews()

        if( this.size ) { this.size(); View.OptimizedResize.add( this.size.bind(this) ) }

        return this.postRender()
    }

    removeChildren( el ) {
        while( el.firstChild ) el.removeChild( el.firstChild )
        return this
    }

    renderSubviews() {
        this.subviewElements.forEach( obj => {
            const name = obj.name || obj.view

            let opts = { }

            if( this.Views && this.Views[ obj.view ] ) opts = typeof this.Views[ obj.view ] === "object" ? this.Views[ obj.view ] : Reflect.apply( this.Views[ obj.view ], this, [ ] )
            if( this.Views && this.Views[ name ] ) opts = typeof this.Views[ name ] === "object" ? this.Views[ name ] : Reflect.apply( this.Views[ name ], this, [ ] )

            this.views[ name ] = View.Factory.create( obj.view, { insertion: { el: obj.el, method: 'insertBefore' }, ...opts } )

            if( this.events.views ) {
                if( this.events.views[ name ] ) this.events.views[ name ].forEach( arr => this.views[ name ].on( arr[0], eventData => Reflect.apply( arr[1], this, [ eventData ] ) ) )
                else if( this.events.views[ obj.view ] ) this.events.views[ obj.view ].forEach( arr => this.views[ name ].on( arr[0], eventData => Reflect.apply( arr[1], this, [ eventData ] ) ) )
            }

            if( obj.el.classList.contains('hidden') ) this.views[name].hideSync()
            obj.el.remove()
        } )

        this.subviewElements = [ ]

        return this
    }

    async scootAway() {
        try {
            await this.Toast.showMessage( 'error', 'You are not allowed here.')
            this.emit( 'navigate', `/` )
        } catch( err ) { View.Error( e ); this.emit( 'navigate', `/` ) }

        return this
    }

    show() { return this.showEl( this.els.container ) }

    showEl( el ) { el.classList.remove('hidden'); return this.animate( el, 'show' ) }

    showSync() { this.els.container.classList.remove('hidden'); return this }

    slurpEl( el ) {
        const key = el.getAttribute( this.slurp.attr ) || 'container'

        this.els[ key ] = Array.isArray( this.els[ key ] )
            ? this.els[ key ].concat( el )
            : ( this.els[ key ] !== undefined )
                ? [ this.els[ key ], el ]
                : el

        el.removeAttribute( this.slurp.attr )

        if( this.events[ key ] ) this.delegateEvents( key, el )
    }

    slurpTemplate( options ) {
        const fragment = this.htmlToFragment( options.template ),
            { attr, view, name, img } = this.slurp,
            selector = `[${attr}]`,
            viewSelector = `[${view}]`,
            imgSelector = `[${img}]`,
            firstEl = fragment.querySelector('*')

        if( options.isView || firstEl.getAttribute( attr ) ) this.slurpEl( firstEl );

        [ ...fragment.querySelectorAll( `${selector}, ${viewSelector}, ${imgSelector}` ) ].forEach( el => {
            if( el.hasAttribute( attr ) ) { this.slurpEl( el ) }
            else if( el.hasAttribute( img ) ) { this.fadeInImage( el ) }
            else if( el.hasAttribute( view ) ) {
                this.subviewElements.push( { el, view: el.getAttribute( view ), name: el.getAttribute( name ) } )
            }
        } )

        this.InsertToDom( fragment, options )
    }

    subviewElements = [ ]

    unbindEvent( key, event, el ) {
        const els = el ? [ el ] : Array.isArray( this.els[ key ] ) ? this.els[ key ] : [ this.els[ key ] ],
           name = this.getEventMethodName( key, event )

        els.forEach( el => el.removeEventListener( event || 'click', this[ `_${name}` ] ) )
    }

    views = { }

}