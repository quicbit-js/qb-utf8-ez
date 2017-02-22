function err(msg) { throw Error(msg) }

var utf8_to_str = require('qb-utf8-to-str-tiny')
var utf8_from_str = require('qb-utf8-from-str-tiny')
var illegal_bytes = require('qb-utf8-illegal-bytes')

function buffer(v, opt) {
    switch(typeof v) {
        case 'number':
            v = [v]
            break
        case 'object':
            Array.isArray(v) || err('cannot encode non-array object ' + v)
            break
        case 'string':
            v = utf8_from_str(v)
            break
        default:
            throw Error('cannot encode type ' + (typeof v))
    }

    var ret
    if(opt && opt.fill_to_length != null) {
        ret = new Array(opt.fill_to_length)
        fill(ret, v, opt)
    } else {
        ret = v
    }
    return ret
}

function hex(v) {
    return v + ((v < 10) ? 48 : 55)
}

// opt.escape is an ascii char
function escape_ranges(buf, ranges, escape, opt) {
    opt = opt || {}
    if(!ranges.length) { return buf }

    // opt.escape can be an ascii character '?' for in-place substitution, or a string expression "!{%H}" for hex escape
    if(typeof escape === 'number' || escape.length === 1) {
        // fill-in-place (replace illegal bytes with fill byte)
        var fill = buffer(escape)[0]
        ranges.forEach(function(range) {
            for(var i=range[0]; i<range[1]; i++) {
                buf[i] = fill
            }
        })
        return buf
    } else {
        var parts = escape.split('%H')
        parts.length === 2 || err('opt.escape must be a single asci character or number or a string with %H like: "!{%H}"')
        var prefix = buffer(parts[0])
        var suffix = buffer(parts[1])
        // create new larger buffer with escaped values
        var beg = opt.beg || 0
        var end = opt.end == null ? buf.length : opt.end
        var ret = [], ri =0, bi = beg
        ranges.forEach(function(range) {
            var rbeg = beg > range[0] ? beg : range[0]
            var rend = end < range[1] ? end : range[1]
            if(rbeg < rend) {
                var i
                while(bi < rbeg) {
                    ret[ri++] = buf[bi++]
                }
                for(i = 0; i < prefix.length; i++) {
                    ret[ri++] = prefix[i]
                }
                while(bi < rend) {
                    // hex ascii high and low
                    ret[ri++] = hex(buf[bi] >>> 4)
                    ret[ri++] = hex(buf[bi] & 0xF)
                    bi++
                }
                for(i = 0; i < suffix.length; i++) {
                    ret[ri++] = suffix[i]
                }
            }
        })
        while(bi < end) { ret[ri++] = buf[bi++] }
        return ret
    }
}

function fill(buf, sample, opt) {
    sample = buffer(sample)
    opt = opt || {}
    var beg = opt.beg || 0
    var end = opt.end == null ? buf.length : opt.end
    var slen = sample.length
    for(var base=beg; base<end; base+=slen) {
        var lim = slen > end - base ? end - base : slen
        for(var si=0; si<lim; si++) {
            buf[si + base] = sample[si]
        }
    }
    // replace truncated code-point with padding character
    if(buf[end - 1] >= 0x80) {
        var i = end - 1
        while((buf[i] & 0xC0) === 0x80 && i > beg) {i--}  // point to last non-trailing
        escape_ranges(
            buf,
            illegal_bytes(buf, {beg: i, end: end}),
            opt.escape || '?',
            opt
        )
    }
}

// return the selection of UTF-8 encoded bytes as a javascript string.
function string(buf, opt) {
    opt = opt || {}
    var beg = opt.beg || 0
    var end = opt.end == null ? buf.length : opt.end
    buf = buf.slice(beg, end)
    buf = escape_ranges(buf, illegal_bytes(buf), opt.escape || '?')
    return utf8_to_str(buf)
}

// like String.join(), but joins together array-like buffers
function join(buffers, joinbuf) {
    var ret = [], ri = 0
    joinbuf = buffer(joinbuf)
    var jlen = joinbuf.length
    buffers.forEach(function(buf, i) {
        if(i !== 0) {
            for(var ji=0; ji<jlen; ji++) { ret[ri++] = joinbuf[ji] }
        }
        for(var bi=0, blen=buf.length; bi<blen; bi++) { ret[ri++] = buf[bi] }
    })
    return ret
}

module.exports = {
    buffer: buffer,
    escape_ranges: escape_ranges,
    fill: fill,
    illegal_bytes: illegal_bytes,
    join: join,
    string: string
}