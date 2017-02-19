function err(msg) { throw Error(msg) }

var utf8_to_str = require('qb-utf8-to-str-tiny')
var utf8_from_str = require('qb-utf8-from-str-tiny')

// Return an array of UTF-8 encoded bytes for the given value 'v'
// v may be:
//      an unicode code point, such as 0x10400 '𐐀'
//      an array of code points
//      a string
function utf8(v) {
    switch(typeof v) {
        case 'number':
            v = [v]                                   // array of code points and fall through...
        case 'object':
            Array.isArray(v) || err('cannot encode non-array object ' + v)
            v = String.fromCodePoint.apply(null, v)   // string and fall through...
        case 'string':
            return utf8_from_str(v)
        default:
            throw Error('cannot encode type ' + (typeof v))
    }
}

// return the selection of UTF-8 encoded bytes as a javascript string.
function to_str(a, off, len) {
    if(len === 0) {
        return ''
    }
    off = off || 0
    len = len || a.length - off
    return utf8_to_str(a.slice(off, off + len))
}

module.exports = {
    utf8: utf8,
    utf8_to_str: to_str
}