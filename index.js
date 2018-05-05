const { EventEmitter } = require('events')
const MyObject = require('./lib/MyObject')

module.exports = class View extends EventEmitter {

    TemplateContext = require('./TemplateContext')
    UUID = require('uuid/v4')
    //Model = require('../models/__proto__')
    OptimizedResize = require('./lib/OptimizedResize')
    Xhr = require('./Xhr')
    Renderer = require('./Renderer')

    $( el, selector ) { return Array.from( el.querySelectorAll( selector ) ) }

    addEl( el, key ) {
        if( key === 'container' ) {
            el.classList.add( this.name )
            if( this.templateName ) el.classList.add( this.templateName )
            if( this.klass ) el.classList.add( this.klass )
        }

        this.els[ key ] = Array.isArray( this.els[ key ] )
            ? this.els[ key ].concat( el )
            : ( this.els[ key ] !== undefined )
                ? [ this.els[ key ], el ]
                : el

        if( this.events[ key ] ) this.delegateEvents( key, el )
    }

    bindEvent( key, event, el ) {
        const els = el ? [ el ] : Array.isArray( this.els[ key ] ) ? this.els[ key ] : [ this.els[ key ] ],
           name = this.getEventMethodName( key, event )

        if( !this[ `_${name}` ] ) this[ `_${name}` ] = e => this[ name ](e)

        els.forEach( el => el.addEventListener( event || 'click', this[ `_${name}` ] ) )
    }

    constructor( opts={} ) {
        super()
        
        if( opts.events ) { Object.assign( this.events, opts.events ); delete opts.events; }
        Object.assign( MyObject, this, opts )

        this.subviewElements = [ ]

        this.Renderer
        .on( 'elSlurped', ( el, key ) => this.addEl( el, key ) )
        .on( 'imgSlurped', el => this.fadeInImage( el ) )
        .on( 'viewSlurped', viewDatum => this.subviewElements.push( [ viewDatum ] ) )
        .on( 'storeFragment', fragment => Object.assign( this, fragment ) )
        .on( 'renderSubviews', () => this.renderSubviews() )

        if( this.requiresLogin && ( !this.user.isLoggedIn() ) ) return this.handleLogin()
        if( this.user && !this.isAllowed( this.user ) ) return this.scootAway()

        return this.initialize().render()
    }

    delegateEvents( key, el ) {
        const type = typeof this.events[key]

        if( type === "string" ) { this.bindEvent( key, this.events[key], el ) }
        else if( Array.isArray( this.events[key] ) ) {
            this.events[ key ].forEach( eventObj => this.bindEvent( key, eventObj ) )
        } else {
            this.bindEvent( key, this.events[key].event )
        }
    }

    async delete( { silent } = { silent: false } ) {
        await this.hide()

        const container = this.els.container,
            parent = container.parentNode
        if( container && parent ) parent.removeChild( container )
        if( !silent ) this.emit('deleted')
    }

    events = { }

    fadeInImage( el ) {
        el.onload = () => {
            this.emit( 'imgLoaded', el )
            el.removeAttribute('data-src')
        }

        el.setAttribute( 'src', el.getAttribute('data-src') )
    }

    getEventMethodName( key, event ) { return `on${this.capitalizeFirstLetter(key)}${this.capitalizeFirstLetter(event)}` }

    getContainer() { return this.els.container }

    getTemplateOptions() {
       return { user: this.user ? this.user.data : {}, model: this.model }
    }

    handleLogin() {
        this.factory.create( 'login', { insertion: { el: document.querySelector('#content') } } )
        .on( "loggedIn", () => this.onLogin() )

        return this
    }

    async hide( isSlow ) {
        if( !this.els || this.isHiding ) return

        this.isHiding = true;
        await this.hideEl( this.els.container, isSlow )
        this.isHiding = false
    }

    hideSync() { this.els.container.classList.add('hidden'); return this }

    _hideEl( el, resolve, hash, isSlow ) {
        el.removeEventListener( 'animationend', this[ hash ] )
        el.classList.add('hidden')
        el.classList.remove(`animate-out${ isSlow ? '-slow' : ''}`)
        delete this[hash]
        resolve()
    }

    hideEl( el, isSlow ) {
        if( this.isHidden( el ) ) return

        const uuid = this.UUID(),
            hash = `${uuid}Hide`

        return new Promise( resolve => {
            this[ hash ] = e => this._hideEl( el, resolve, hash, isSlow )
            el.addEventListener( 'animationend', this[ hash ] )
            el.classList.add(`animate-out${ isSlow ? '-slow' : ''}`)
        } )
    }

    initialize() {
        return { ...this, els: { }, views: { } }
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

    onLogin() {

        if( !this.isAllowed( this.user ) ) return this.scootAway()

        this.initialize().render()
    }

    async onNavigation() {
        await this.show()
    }

    showNoAccess() {
        alert("No privileges, son")
        return this
    }

    postRender() { return this }

    render() {
        if( this.data ) this.model = Object.create( this.Model, { } ).constructor( this.data )

        this.Renderer.slurpTemplate( {
            insertion: this.insertion || { el: document.body },
            isView: true,
            storeFragment: this.storeFragment,
            template: Reflect.apply( this.template, this.TemplateContext, [ this.getTemplateOptions() ] )
        } )

        this.renderSubviews()

        if( this.size ) { this.size(); this.OptimizedResize.add( this.size.bind(this) ) }

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

            this.views[ name ] = this.factory.create( obj.view, Object.assign( { insertion: { el: obj.el, method: 'insertBefore' } }, opts ) )

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

    scootAway() {
        this.Toast.showMessage( 'error', 'You are not allowed here.')
        .catch( e => { this.Error( e ); this.emit( 'navigate', `/` ) } )
        .then( () => this.emit( 'navigate', `/` ) )

        return this
    }

    async show( isSlow ) {
        await this.showEl( this.els.container, isSlow )
    }

    showSync() { this.els.container.classList.remove('hidden'); return this }

    _showEl( el, resolve, hash, isSlow ) {
        el.removeEventListener( 'animationend', this[hash] )
        el.classList.remove(`animate-in${ isSlow ? '-slow' : ''}`)
        delete this[ hash ]
        resolve()
    }

    showEl( el, isSlow ) {
        const uuid = this.UUID(),
            hash = `${uuid}Show`

        return new Promise( resolve => {
            this[ hash ] = e => this._showEl( el, resolve, hash, isSlow )
            el.addEventListener( 'animationend', this[ hash ] )
            el.classList.remove('hidden')
            el.classList.add(`animate-in${ isSlow ? '-slow' : ''}`)
        } )        
    }

    unbindEvent( key, event, el ) {
        const els = el ? [ el ] : Array.isArray( this.els[ key ] ) ? this.els[ key ] : [ this.els[ key ] ],
           name = this.getEventMethodName( key, event )

        els.forEach( el => el.removeEventListener( event || 'click', this[ `_${name}` ] ) )
    }

}