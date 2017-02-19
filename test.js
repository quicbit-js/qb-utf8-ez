var test = require('test-kit').tape()
var utf8 = require('.').utf8
var utf8_to_str = require('.').utf8_to_str

test('utf8', function(t) {
    t.tableAssert(
        [
            [ 'v',                   'exp'                                  ],
            [ 0x61,                  [0x61]                                 ],
            [ 'abc\uD801\uDC00',     [0x61,0x62,0x63,0xF0,0x90,0x90,0x80]   ],
            [ '在嚴寒的冬日裡',        [229,156,168,229,154,180,229,175,146,231,154,132,229,134,172,230,151,165,232,163,161] ],
            [ '"abc"%',              [ 34,97,98,99,34,37 ] ],
        ],
        utf8
    )
})

test('utf8_to_str', function(t) {
    t.tableAssert(
        [
            [ 'a',                                  'off',    'len',       'v'                      ],
            [ [0x61],                                null,     null,       'a'                      ],
            [ [0x61,0x62,0x63,0xF0,0x90,0x90,0x80],  null,     null,       'abc\uD801\uDC00'        ],
            [ [0x61,0x62,0x63,0xF0,0x90,0x90,0x80],  0,        0,          ''                       ],
            [ [0x61,0x62,0x63,0xF0,0x90,0x90,0x80],  0,        1,          'a'                      ],
            [ [0x61,0x62,0x63,0xF0,0x90,0x90,0x80],  1,        1,          'b'                      ],
            [ [0x61,0x62,0x63,0xF0,0x90,0x90,0x80],  2,        null,       'c\uD801\uDC00'          ],
            [ [0x61,0x62,0x63,0xF0,0x90,0x90,0x80],  2,        5,          'c\uD801\uDC00'          ],
            [ [ 34,97,98,99,34,37 ],                 null,     null,       '"abc"%'                 ],
        ],
        utf8_to_str
    )
})

test('utf8 and utf8_to_str in harmony and at peace with the world', function(t) {
    t.tableAssert(
        [
            [ 'v',                                  'exp'               ],
            [ '在嚴寒的冬日裡',                       '在嚴寒的冬日裡'      ],
            [ 'abc𐐀defg,é',                         'abc𐐀defg,é'        ],
            [ 'gîddñup𐂃!',                         'gîddñup𐂃!'       ],
            [ 'ᄒ,ᅡ,ᆫ,한',                           'ᄒ,ᅡ,ᆫ,한'        ],
        ],
        function(v) { return utf8_to_str(utf8(v)) }
    )
})

test('utf8 and utf8_to_str - all ascii', function(t) {
    for(var i=1; i<128; i+=11) {
        t.same(utf8(utf8_to_str([i])), [i], t.desc('ascii', [i], i))
    }
    t.end()
})

test('utf8 errors', function(t) {
    t.tableAssert(
        [
            [ 'fn',           'input',                         'expect' ],
            [ utf8,         [new Date()],                       /cannot encode non-array object/    ],
            [ utf8,         [true],                             /cannot encode type/    ],
        ],
        function(fn, input){ fn.apply(null, input) },
        { assert: 'throws' }
    )
})
