module.exports = Object.create( Object.assign( {}, require('./lib/MyObject'), {

    Request: {

        constructor( data ) {
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
                    this.setHeaders( req, data.headers )
                    req.send( data.data || null )
                }

                if( data.onProgress ) data.onProgress( 'sent' )
            } )
        },

        setHeaders( req, headers={} ) {
            req.setRequestHeader( "Accept", headers.accept || 'application/json' )
            req.setRequestHeader( "Content-Type", headers.contentType || 'text/plain' )
        }
    },

    _factory( data ) {
        return Object.create( this.Request, { } ).constructor( data )
    },

    constructor() {

        if( !XMLHttpRequest.prototype.sendAsBinary ) {
          XMLHttpRequest.prototype.sendAsBinary = function(sData) {
            var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
            for (var nIdx = 0; nIdx < nBytes; nIdx++) {
              ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
            }
            this.send(ui8Data);
          };
        }

        return this._factory.bind(this)
    }

} ), { } ).constructor()
