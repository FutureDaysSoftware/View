module.exports = class ObjectUtil {

    static Omit( obj, keys ) {
        return Object.keys( obj ).filter( key => !keys.includes( key ) ).reduce( ( memo, key ) => ( { ...memo, [key]: obj[key] } ), { } )
    }

    static Pick( obj, keys ) {
        return keys.reduce( ( memo, key ) => ( { ...memo, [key]: obj[key] } ), { } )
    }

}