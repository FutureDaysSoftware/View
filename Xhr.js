module.exports = class Xhr {

    static Request( data ) {
        let req = new XMLHttpRequest()

        if( data.onProgress ) req.addEventListener( "progress", e =>
            data.onProgress( e.lengthComputable ? Math.floor( ( e.loaded / e.total ) * 100 ) : 0 ) 
        )

        return new Promise( ( resolve, reject ) => {

            req.onload = function() {
                [ 500, 404, 401 ].includes( this.status )
                    ? reject( this.response ? JSON.parse( this.response ) : this.status )
                    : resolve( JSON.parse( this.response ) )
            }

            data.method = data.method || "get"

            const path = `/${data.resource}` + ( data.id ? `/${data.id}` : '' )
            if( data.method === "get" || data.method === "options" ) {
                let qs = data.qs ? `?${window.encodeURIComponent( data.qs )}` : '' 
                req.open( data.method, `${path}${qs}` )
                this.setHeaders( req, data.headers )
                req.send(null)
            } else {
                req.open( data.method.toUpperCase(), path, true)
                this.SetHeaders( req, data.headers )
                req.send( data.data || null )
            }

            if( data.onProgress ) data.onProgress( 'sent' )
        } )
    }

    static SetHeaders( req, headers={} ) {
        req.setRequestHeader( "Accept", headers.accept || 'application/json' )
        req.setRequestHeader( "Content-Type", headers.contentType || 'text/plain' )
    }

}
