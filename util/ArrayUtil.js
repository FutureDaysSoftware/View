module.exports = class ArrayUtil {

    static Reducer( arr, fn ) {
        return arr.reduce( ( memo, item, i ) => ( { ...memo, ...fn( item, i ) } ), { } )
    }

}