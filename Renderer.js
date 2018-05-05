const { EventEmitter } = require('events')

module.exports = class Renderer extends EventEmitter {

    constructor() {
        super()
    }

    static htmlToFragment( str ) {
        const range = document.createRange();
        range.selectNode(document.getElementsByTagName("div").item(0))
        return range.createContextualFragment( str )
    }

    static insertToDom( fragment, options ) {
        const insertion = typeof options.insertion === 'function' ? options.insertion() : options.insertion;

        insertion.method === 'insertBefore'
            ? insertion.el.parentNode.insertBefore( fragment, insertion.el )
            : insertion.el[ insertion.method || 'appendChild' ]( fragment )
    }

    static slurp = { attr: 'data-js', view: 'data-view', name: 'data-name', img: 'data-src' }

    static slurpEl( el ) {
        const key = el.getAttribute( this.slurp.attr ) || 'container'
        this.emit( 'elSlurped', el, key )
        el.removeAttribute(this.slurp.attr)
    }

    static slurpTemplate( options ) {
        const fragment = this.htmlToFragment( options.template ),
            selector = `[${this.slurp.attr}]`,
            viewSelector = `[${this.slurp.view}]`,
            imgSelector = `[${this.slurp.img}]`,
            firstEl = fragment.querySelector('*')

        if( options.isView || firstEl.getAttribute( this.slurp.attr ) ) this.slurpEl( firstEl )

        Array.from( fragment.querySelectorAll( `${selector}, ${viewSelector}, ${imgSelector}` ) ).forEach( el => {
            if( el.hasAttribute( this.slurp.attr ) ) { this.slurpEl( el ) }
            else if( el.hasAttribute( this.slurp.img ) ) { this.emit( 'imgSlurped', el ) }
            else if( el.hasAttribute( this.slurp.view ) ) { this.emit( 'viewSlurped', { el, view: el.getAttribute(this.slurp.view), name: el.getAttribute(this.slurp.name) } ) }
        } )
   
        if( options.storeFragment ) return this.emit( 'storeFragment', { fragment } )

        this.insertToDom( fragment, options )

        if( options.renderSubviews ) this.emit('renderSubviews')
    }

}