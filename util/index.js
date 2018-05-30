module.exports = {

    capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),

    getIntRange( int ) {
        return Array.from( Array( int ).keys() )
    },

    getRandomInclusiveInteger( min, max ) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    },

    omit( obj, keys ) {
        return Object.keys( obj ).filter( key => !keys.includes( key ) ).reduce( ( memo, key ) => ( { ...memo, [key]: obj[key] } ), { } )
    },

    pick( obj, keys ) {
        return keys.reduce( ( memo, key ) => ( { ...memo, [key]: obj[key] } ), { } )
    },

    reducer( arr, fn ) {
        return arr.reduce( ( memo, item, i ) => ( { ...memo, ...fn( item, i ) } ), { } )
    }

}