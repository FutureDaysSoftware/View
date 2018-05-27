const { EventEmitter } = require('events')

module.exports = class View extends EventEmitter {
    
    static Error = require('./lib/MyError')
    static Factory = require('./Factory')
    //Model = require('../models/__proto__')
    static OptimizedResize = require('./lib/OptimizedResize')
    static Slurper = require('./Slurper')
    static TemplateContext = require('./TemplateContext')
    static Util = require('./lib/Util')
    static UUID = require('uuid/v4')
    static Xhr = require('./Xhr')

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

    constructor( opts={} ) {
        super()
        Object.assign( this, opts, { els: { }, views: { } } )

        if( this.requiresLogin && ( !this.user.isLoggedIn() ) ) return this.handleLogin()
        if( this.user && !this.isAllowed( this.user ) ) return this.scootAway()

        return this.render()
    }

    content = document.querySelector('#content')

    async delete( { silent } = { silent: false } ) {
        await this.hide()

        const { container } = this.els,
            parent = container.parentNode
        if( container && parent ) parent.removeChild( container )
        if( !silent ) this.emit('deleted')
    }

    events = { }

    getTemplateOptions() {
       return { user: this.user ? this.user.data : {}, model: this.model }
    }

    handleLogin() {
        this.Factory.create( 'login', { insertion: { el: document.querySelector('#content') } } )
        .on( "loggedIn", () => this.onLogin() )

        return this
    }

    hide() { return this.hideEl( this.els.container ) }

    async hideEl( el ) { await this.animate( el, 'hide' ); el.classList.add('hidden') }

    hideSync() { this.els.container.classList.add('hidden'); return this }

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
        this.render()
    }

    onNavigation() {
        return this.show().catch( this.Error )
    }

    showNoAccess() {
        alert("No privileges, son")
        return this
    }

    postRender() { return this }

    render() {
        if( this.data ) this.model = Object.create( this.Model, { } ).constructor( this.data )

        this.slurp( {
            insertion: this.insertion || { el: document.body },
            isView: true,
            template: Reflect.apply( this.template, this.TemplateContext, [ this.getTemplateOptions() ] )
        } )

        this.els.container.classList.add( this.name )
        if( this.templateName ) this.els.container.classList.add( this.templateName )
        if( this.klass ) this.els.container.classList.add( this.klass )

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

            this.views[ name ] = this.Factory.create( obj.view, { insertion: { el: obj.el, method: 'insertBefore' }, ...opts } )

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
        } catch( err ) { this.Error( e ); this.emit( 'navigate', `/` ) }

        return this
    }

    show() { return this.showEl( this.els.container ) }

    showEl( el ) { el.classList.remove('hidden'); return this.animate( el, 'show' ) }

    showSync() { this.els.container.classList.remove('hidden'); return this }

    slurp( opts ) { return Reflect.apply( this.Slurper.slurpTemplate, this, [ this.els, this.events, this.subviewElements, opts ] ) }

    subviewElements = [ ]

    unbindEvent( key, event, el ) {
        const els = el ? [ el ] : Array.isArray( this.els[ key ] ) ? this.els[ key ] : [ this.els[ key ] ],
           name = this.getEventMethodName( key, event )

        els.forEach( el => el.removeEventListener( event || 'click', this[ `_${name}` ] ) )
    }

}