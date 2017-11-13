# qb-utf8-ez

[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![bitHound Dependencies][proddep-image]][proddep-link]
[![dev dependencies][devdep-image]][devdep-link]
[![code analysis][code-image]][code-link]

[npm-image]:       https://img.shields.io/npm/v/qb-utf8-ez.svg
[downloads-image]: https://img.shields.io/npm/dm/qb-utf8-ez.svg
[npm-url]:         https://npmjs.org/package/qb-utf8-ez
[proddep-image]:   https://www.bithound.io/github/quicbit-js/qb-utf8-ez/badges/dependencies.svg
[proddep-link]:    https://www.bithound.io/github/quicbit-js/qb-utf8-ez/master/dependencies/npm
[devdep-image]:    https://www.bithound.io/github/quicbit-js/qb-utf8-ez/badges/devDependencies.svg
[devdep-link]:     https://www.bithound.io/github/quicbit-js/qb-utf8-ez/master/dependencies/npm
[code-image]:      https://www.bithound.io/github/quicbit-js/qb-utf8-ez/badges/code.svg
[code-link]:       https://www.bithound.io/github/quicbit-js/qb-utf8-ez

Easy-to-use UTF-8 encoding and decoding that work in all browsers (except ancient < IE 5.5).
Based on tiny implementations (qb-utf8-to-str-tiny and qb-utf8-from-str-tiny), which are
tiny and good for small decoding jobs, but not fast for very large files.

**Complies with the 100% test coverage and minimum dependency requirements** of 
[qb-standard](http://github.com/quicbit-js/qb-standard) . 


# Install

    install qb-utf8-ez
    
# API Update 2.x -> 3.x

Functions that take array-like parameters and ranges have been updated to work with
terms defined in the [glossary](https://github.com/quicbit-js/qb-standard/blob/master/doc/variable-glossary.md).
Namely, functions of the form 
* **function ( buf, beg, end )** 
* **function ( buf, {beg:0, end:10} )**

have been updated to 
* **function ( [src][src-link], [off][off-link], [lim][lim-link] )** 
* **function ( [src][src-link], {[off][off-link]:0, [lim][lim-link]:10 } )** 



[src-link]: https://github.com/quicbit-js/qb-standard/blob/master/doc/variable-glossary.md#src-source
[off-link]: https://github.com/quicbit-js/qb-standard/blob/master/doc/variable-glossary.md#off-offset
[lim-link]: https://github.com/quicbit-js/qb-standard/blob/master/doc/variable-glossary.md#lim-limit
   
# Usage

    var utf8 = require('qb-utf8-ez');
    
    var buf = utf8.buffer('hello. 你好');
    console.log(buf);
    
Prints a buffer with UTF-8 code points:

    > [ 104, 101, 108, 108, 111, 46, 32, 228, 189, 160, 229, 165, 189 ]
    
and

    var s = utf8.string(buf);
    console.log(s);
    
Prints:

    > hello. 你好

## buffer(value, options)

same as utf8 (old function name)

## utf8(value, options)

    Return an array or buffer of UTF-8 encoded bytes for the given value 'v'
    v may be:
    
    options:
        ret_type:        (string) 'array', 'buffer', or 'uint8array' - the type to create and return.   
        fill_to_length:  (integer) if set, an array of the given length will be returned, 
                         filled with encoded values copied from v.  
                         Invalid truncated encodings are replaced with the
                         fill_byte.
        fill_byte:       (integer or string) ascii code or single character string used if needed to 
                         fill buffer at the end to prevent truncated utf8.
    

For convenience, <code>value</code> may be:

    an unicode code point, such as 0x10400 '𐐀'
    an array of code points
    a string

... in any case, buffer(value) will return an array.
    
## string([src][src-link], options)

Convert an array-like object (buffer) to a javascript string.  

options
* **[off][off-link]**: index to start at
* **[lim][lim-link]**: index to stop before
* **escape**: string expression, single ascii character or integer.  (default is '?').
    
  If ascii integer or string, illegal bytes will be replaced 1-for-1 by this value. 
  If expression of the form "!{%H}", then strings of illegal bytes will be prefixed 
  with the value before %H, such as '!{', and suffixed with value after %H, e.g. '}'
  and bytes will be written as ascii hex between these values.

string() makes use of [qb-utf8-illegal-bytes](https://github.com/quicbit-js/qb-utf8-illegal-bytes)
to automatically detect and escape illegal UTF-8 encodings.  The default decoding behavior
is to replace illegal values with '?':

    var utf8 = require('qb-utf8-ez');
    utf8.string([... some buffer with four illegal characters *** here *** then ok again.. ]);

    > ... some buffer with illegal characters ??? then ok again.. 

Another option is to use the <code>encode</code> option to substitute bad bytes in situ, keeping
all other buffer contents in place.

    utf8.string([...], { encode: '!{%H}' });
    
    > ... some buffer with illegal characters !{F09082} then ok again.. 


## compare( [src1][src-link], [off1][off-link], [lim1][lim-link],[src2][src-link], [off2][off-link], [lim2][lim-link] )

Compare code points of two byte ranges holding UTF8-encoded data.  The function works similarly
to the sort comparator in javascript.

return

* **1** if src1 selection is greater
* **-1** if src2 selection is greater
* **0** if selections are equal

(compare is also available as a 
[separate package with zero dependencies](https://github.com/quicbit-js/qb-utf8-compare))

## fill(dst, sample, options)

Fill up a buffer with a smaller buffer sample which may be a string or array-like object.

    options
        off:        index to start at
        lim:        index to stop before ( < lim )
        escape:     handling for illegal bytes (same as string(), above) (default is '?')
        
## join(buffers, joinbuf)

Like string.join(), but joins together arrays/buffers of bytes.  Joins together buffers
into one buffer with <code>joinbuf</code> as a separator between each.
<code>buffers</code> can
be an array of array-like objects with byte/integer values.  joinbuf can value accepted
by the <code>buffer()</code> function such as string or array of code points.


## escape_illegal([src][src-link], opt)

Return a buffer with illegal characters replaced.  If a single character or number escape is given, 
the buffer will be changed in place and returned.  If an escape expression is given, a new
(longer) buffer will be returned copied from the old with the escaped areas.
Options <code>escape</code>, <code>off</code>, and <code>lim</code> work as they
do with <code>string()</code>, above.

## illegal_bytes([src][src-link], [off][off-link], [lim][lim-link])

Return ranges of illegal UTF-8 encoding.  See [qb-utf8-illegal-bytes](https://github.com/quicbit-js/qb-utf8-illegal-bytes#illegal_bytessrc-off-lim)
