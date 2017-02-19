# qb-utf8-ez

Easy-to-use UTF-8 encoding functions that work in all browsers (except ancient < IE 5.5).

    var utf8 = require('qb-utf8-ez').utf8;
    var buf = utf8('hello. 你好');
    console.log(buf);
    
Prints a buffer with UTF-8 code points:

    > [ 104, 101, 108, 108, 111, 46, 32, 228, 189, 160, 229, 165, 189 ]
    
and

    var utf8_to_str = require('qb-utf8-ez').utf8_to_str;
    var s = utf8_to_str(buf);
    console.log(s);
    
Prints:

    > hello. 你好

    

    

