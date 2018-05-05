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
        return Object.keys( obj ).filter( key => !keys.includes( key ) ).reduce( ( memo, key ) => Object.assign( memo, { [key]: obj[key] } ), { } )
    },

    pick( obj, keys ) {
        return keys.reduce( ( memo, key ) => Object.assign( memo, { [key]: obj[key] } ), { } )
    },

    reducer( arr, fn ) { return arr.reduce( ( memo, item, i ) => Object.assign( memo, fn( item, i ) ), { } ) },

    shuffleArray( arr ) {
        const rv = Array.from( arr )
       
        rv.forEach( ( item, i ) => {
            if( i === rv.length - 1 ) return 
            const int = this.getRandomInclusiveInteger( i, rv.length - 1 ),
                holder = rv[ i ]

            rv[i] = rv[int]
            rv[int] = holder
        } )

        return rv
    },

    Error: require('./MyError'),

    P: ( fun, args=[ ], thisArg ) =>
        new Promise( ( resolve, reject ) => Reflect.apply( fun, thisArg || this, args.concat( ( e, ...callback ) => e ? reject(e) : resolve(callback) ) ) ),
    
    constructor() { return this }
}
