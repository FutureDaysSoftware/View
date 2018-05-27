const { EventEmitter } = require('events')
const { StringUtil } = require('./lib/Util')

module.exports = class Slurper extends EventEmitter {

    static BindEvent( key, event, el, els ) {
        const eventEls = el ? [ el ] : Array.isArray( els[ key ] ) ? els[ key ] : [ els[ key ] ],
           name = this.getEventMethodName( key, event )

        if( !this[ `_${name}` ] ) this[ `_${name}` ] = e => this[ name ](e)

        eventEls.forEach( el => el.addEventListener( event || 'click', this[ `_${name}` ] ) )
    }

    static DelegateEvents( key, el, els, events ) {
        if( typeof events[ key ] === "string" ) { this.bindEvent( key, events[ key ], el ) }
        else if( Array.isArray( events[ key ] ) ) {
            events[ key ].forEach( eventObj => this.bindEvent( key, eventObj ) )
        } else {
            this.bindEvent( key, events[ key ].event )
        }
    }

    static FadeInImage( el ) {
        el.onload = () => {
            this.emit( 'imgLoaded', el )
            el.removeAttribute('data-src')
        }

        el.setAttribute( 'src', el.getAttribute('data-src') )
    }

    static GetEventMethodName( key, event ) { return `on${StringUtil.capitalizeFirstLetter(key)}${StringUtil.capitalizeFirstLetter(event)}` }

    static HtmlToFragment( str ) {
        return this.Range.createContextualFragment( str )
    }

    static InsertToDom( fragment, options ) {
        const insertion = typeof options.insertion === 'function' ? options.insertion() : options.insertion;

        insertion.method === 'insertBefore'
            ? insertion.el.parentNode.insertBefore( fragment, insertion.el )
            : insertion.el[ insertion.method || 'appendChild' ]( fragment )
    }

    static Range = document.createRange().selectNode( document.getElementsByTagName("div").item(0) )

    static Slurp = { attr: 'data-js', view: 'data-view', name: 'data-name', img: 'data-src' }

    static SlurpEl( els, events, el ) {
        const key = el.getAttribute( this.slurp.attr ) || 'container'

        els[ key ] = Array.isArray( els[ key ] )
            ? els[ key ].concat( el )
            : ( els[ key ] !== undefined )
                ? [ els[ key ], el ]
                : el

        el.removeAttribute( this.slurp.attr )

        if( events[ key ] ) this.DelegateEvents( key, el, els, events )

    }

    static SlurpTemplate( els, events, subviewEls, options ) {
        const fragment = this.HtmlToFragment( options.template ),
            { attr, view, name, img } = this.Slurp,
            selector = `[${attr}]`,
            viewSelector = `[${view}]`,
            imgSelector = `[${img}]`,
            firstEl = fragment.querySelector('*')

        if( options.isView || firstEl.getAttribute( attr ) ) this.SlurpEl( els, el );

        [ ...fragment.querySelectorAll( `${selector}, ${viewSelector}, ${imgSelector}` ) ].forEach( el => {
            if( el.hasAttribute( attr ) ) { this.SlurpEl( els, events, el ) }
            else if( el.hasAttribute( img ) ) { this.FadeInImage( el ) }
            else if( el.hasAttribute( view ) ) {
                subviewEls.push( { el, view: el.getAttribute( view ), name: el.getAttribute( name ) } )
            }
        } )

        this.InsertToDom( fragment, options )
    }

}