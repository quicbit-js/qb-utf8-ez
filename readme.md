# qb-utf8-ez

Easy-to-use UTF-8 encoding and decoding that work in all browsers (except ancient < IE 5.5).
Based on tiny implementations (qb-utf8-to-str-tiny and qb-utf8-from-str-tiny), which are
tiny and good for small decoding jobs, but not fast for very large files.

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

// Return an array of UTF-8 encoded bytes for the given value 'v'
// v may be:
//
// options:
//      fill_to_length: <integer> if set, a buffer of the given length will be returned, filled with encoded values
//                                copied from v.  Invalid truncated encodings are replaced with the
//                                option.fill_byte value (defaults to ascii '.').
//      fill_byte: <string>       defaults to '.'.  This ascii padding will be used to fill end of buffer to avoid truncated encodings.
//

Convert a value to a buffer (array) of UTF-8 encoded bytes.  

    options
        beg:            index to start reading (inclusive)
        end:            index to end reading (exclusive)
        fill_to_length  if set, a buffer of this length is returned, filled with repeating
                        inserts of the value after it is converted to UTF-8.

For convenience, <code>value</code> may be:

    an unicode code point, such as 0x10400 '𐐀'
    an array of code points
    a string

... in any case, buffer(value) will return an array.
    
## string(buf, options)

Convert an array-like object (buffer) to a javascript string.  

    options
        beg:        index to start reading (inclusive)
        end:        index to end reading (exclusive)
        
        escape:     string expression, single ascii character or integer.  (default is '?')
        
                    If ascii integer or character, illegal bytes will be replaced 1-for-1 by this value. 
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

## fill(buf, sample, options)

Fill up a buffer with a smaller buffer sample which may be a string or array-like object.

    options
        beg:        index to start reading (inclusive)
        end:        index to end reading (exclusive)
        escape:     handling for illegal bytes (same as string(), above) (default is '?')
        
## join(buffers, joinbuf)

Like string.join(), but joins together arrays/buffers of bytes.  Joins together buffers
into one buffer with <code>joinbuf</code> as a separator between each.
<code>buffers</code> can
be an array of array-like objects with byte/integer values.  joinbuf can value accepted
by the <code>buffer()</code> function such as string or array of code points.


