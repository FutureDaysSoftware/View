class ArrayUtil {

    static Reducer( arr, fn ) {
        return arr.reduce( ( memo, item, i ) => ( { ...memo, ...fn( item, i ) } ), { } )
    }

    static ShuffleArray( arr ) {
        const rv = Array.from( arr )
       
        rv.forEach( ( item, i ) => {
            if( i === rv.length - 1 ) return 
            const int = this.getRandomInclusiveInteger( i, rv.length - 1 ),
                holder = rv[ i ]

            rv[i] = rv[int]
            rv[int] = holder
        } )

        return rv
    }

}

class NumUtil {

    static GetIntRange( int ) {
        return Array.from( Array( int ).keys() )
    }

    static GetRandomInclusiveInteger( min, max ) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

}

class ObjectUtil {

    static Omit( obj, keys ) {
        return Object.keys( obj ).filter( key => !keys.includes( key ) ).reduce( ( memo, key ) => ( { ...memo, [key]: obj[key] } ), { } )
    }

    static Pick( obj, keys ) {
        return keys.reduce( ( memo, key ) => ( { ...memo, [key]: obj[key] } ), { } )
    }

}

class StringUtil {

    static CapitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1)

}

module.exports = { ArrayUtil, NumUtil, ObjectUtil, StringUtil }