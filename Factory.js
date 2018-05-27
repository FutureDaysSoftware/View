module.exports = Object.create( {

    constructor() {
        this.range = document.createRange();
        this.range.selectNode(document.getElementsByTagName("div").item(0))
        return this
    },

    create( name, opts ) {
        const lower = name
        name = ( name.charAt(0).toUpperCase() + name.slice(1) ).replace( '-', '' )

        return Object.create(
            this.Views[ name ],
            Object.assign( {
                Header: { value: this.Header },
                Toast: { value: this.Toast },
                name: { value: name },
                factory: { value: this },
                range: { value: this.range },
                template: { value: this.Templates[ name ], writable: true },
                model: { value: this.Models[name] ? Object.create( this.Models[ name ] ) : {}, writable: true },
                user: { value: this.User }
            } )
        ).constructor( opts )
    },

}, {
    //Header: { value: require('../views/Header') },
    //Models: { value: require('../.ModelMap') },
    //Templates: { value: require('../.TemplateMap') },
    //Toast: { value: require('../views/Toast') },
    //User: { value: require('../models/User') },
    //Views: { value: require('../.ViewMap') }
} )