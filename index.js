function err (msg) { throw Error(msg) }

var utf8_to_str = require('qb-utf8-to-str-tiny')
var utf8_from_str = require('qb-utf8-from-str-tiny')
var illegal_bytes = require('qb-utf8-illegal-bytes')

function buffer (v, opt) {
  opt = opt || {}
  switch (typeof v) {
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
  if (opt.fill_to_length != null) {
    ret = new Array(opt.fill_to_length)
    fill(ret, v, opt)
  } else {
    ret = v
  }
  return ret
}

function hex (v) {
  return v + ((v < 10) ? 48 : 55)
}

// opt.escape is an ascii char
function escape_ranges (src, ranges, escape, opt) {
  opt = opt || {}
  if (!ranges.length) { return src }

  // opt.escape can be an ascii character '?' for in-place substitution, or a string expression "!{%H}" for hex escape
  if (typeof escape === 'number' || escape.length === 1) {
    // fill-in-place (replace illegal bytes with fill byte)
    var fill = buffer(escape)[0]
    ranges.forEach(function (range) {
      for (var i = range[0]; i < range[1]; i++) {
        src[i] = fill
      }
    })
    return src
  } else {
    var parts = escape.split('%H')
    parts.length === 2 || err('opt.escape must be a single asci character or number or a string with %H like: "!{%H}"')
    var prefix = buffer(parts[0])
    var suffix = buffer(parts[1])
    // create new larger buffer with escaped values
    var off = opt.off || 0
    var lim = opt.lim == null ? src.length : opt.lim
    var ret = [], ri = 0, bi = off
    ranges.forEach(function (range) {
      var rbeg = off > range[0] ? off : range[0]
      var rend = lim < range[1] ? lim : range[1]
      if (rbeg < rend) {
        var i
        while (bi < rbeg) {
          ret[ri++] = src[bi++]
        }
        for (i = 0; i < prefix.length; i++) {
          ret[ri++] = prefix[i]
        }
        while (bi < rend) {
          // hex ascii high and low
          ret[ri++] = hex(src[bi] >>> 4)
          ret[ri++] = hex(src[bi] & 0xF)
          bi++
        }
        for (i = 0; i < suffix.length; i++) {
          ret[ri++] = suffix[i]
        }
      }
    })
    while (bi < lim) { ret[ri++] = src[bi++] }
    return ret
  }
}

function fill (dst, sample, opt) {
  sample = buffer(sample)
  opt = opt || {}
  var off = opt.off || 0
  var lim = opt.lim == null ? dst.length : opt.lim
  var slen = sample.length
  for (var base = off; base < lim; base += slen) {
    var slim = slen > lim - base ? lim - base : slen
    for (var si = 0; si < slim; si++) {
      dst[si + base] = sample[si]
    }
  }
    // replace truncated code-point with padding character
  if (dst[lim - 1] >= 0x80) {
    var i = lim - 1
    while ((dst[i] & 0xC0) === 0x80 && i > off) { i-- }  // point to last non-trailing
    escape_ranges(
            dst,
            illegal_bytes(dst, i, lim),
            opt.escape || '?',
            opt
        )
  }
}

// return the selection of UTF-8 encoded bytes as a javascript string.
function string (buf, opt) {
  opt = opt || {}
  var off = opt.off || 0
  var lim = opt.lim == null ? buf.length : opt.lim
  buf = buf.slice(off, lim)
  buf = escape_ranges(buf, illegal_bytes(buf), opt.escape || '?')
  return utf8_to_str(buf)
}

// like String.join(), but joins together array-like buffers
function join (buffers, joinbuf) {
  var ret = [], ri = 0
  joinbuf = buffer(joinbuf)
  var jlen = joinbuf.length
  buffers.forEach(function (buf, i) {
    if (i !== 0) {
      for (var ji = 0; ji < jlen; ji++) { ret[ri++] = joinbuf[ji] }
    }
    for (var bi = 0, blen = buf.length; bi < blen; bi++) { ret[ri++] = buf[bi] }
  })
  return ret
}

function escape_illegal (src, opt) {
  opt = opt || {}
  return escape_ranges(
    src,
    illegal_bytes(src, opt.off, opt.lim),
    (opt && opt.escape) || '?',
    opt
  )
}

module.exports = {
  buffer: buffer,
  escape_illegal: escape_illegal,
  escape_ranges: escape_ranges,
  fill: fill,
  illegal_bytes: illegal_bytes,
  join: join,
  string: string
}
