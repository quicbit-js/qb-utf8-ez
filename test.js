var test = require('test-kit').tape()
var utf8 = require('.')

test('buffer', function(t) {
    t.tableAssert(
        [
            [ 'v',                  'opt',                'exp'                 ],
            [ 0x61,                 null,                 'a'                   ],
            [ 'abc\uD801\uDC00',    null,                 'abc\uD801\uDC00'     ],
            [ '在嚴寒的冬日裡',       null,                 '在嚴寒的冬日裡'        ],
            [ '"abc"%',             null,                 '"abc"%'              ],
            [ 'abé',                {fill_to_length: 5},  'abéa'                ],
            [ 'abé',                {fill_to_length: 4},  'abé'                 ],
            [ 'abé',                {fill_to_length: 3},  'ab?'                 ],   // 0x3F is '?'
            [ 'abé',                {fill_to_length: 2},  'ab'                  ],
            [ 'abé',                {fill_to_length: 1},  'a'                   ],
            [ 'abé',                {fill_to_length: 0},  ''                    ],
        ],
        function(v, opt) {
            return utf8.string(utf8.buffer(v, opt))
        }
    )
})

test('string', function(t) {
    t.tableAssert(
        [
            [ 'a',                             'opt',            'exp'                    ],
            [ [0x61],                          null,             'a'                      ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], null,             'ab𐂃'        ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:0,end:0},    ''                       ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:0,end:1},    'a'                      ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:1,end:2},    'b'                      ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:1},          'b𐂃'          ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:1,end:6},    'b𐂃'          ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:0,end:5},    'ab???'           ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:0,end:5},    'ab???'           ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:0,end:4},    'ab??'           ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:0,end:3},    'ab?'           ],
            [ [0x61,0x62,0xF0,0x90,0x82,0x83], {beg:0,end:2},    'ab'           ],
            [ [ 34,97,98,99,34,37 ],           null,             '"abc"%'                 ],
        ],
        utf8.string
    )
})

test('escape_ranges - byte', function(t) {
    t.tableAssert(
        [
            [ 'buf',            'ranges',  'escape',      'exp'             ],
            [ [1,2,3],          [[0,1]],   4,             [4,2,3]           ],
            [ [1,2,3],          [[1,2]],   4,             [1,4,3]           ],
            [ [1,2,3],          [[2,3]],   4,             [1,2,4]           ],
            [ [1,2,3],          [[0,3]],   4,             [4,4,4]           ],
        ],
        utf8.escape_ranges
    )
})
test('escape_ranges - hex', function(t) {
    t.tableAssert(
        [
            [ 'buf',              'ranges',  'escape',  'opt',           'exp'          ],
            [ [0x6A,0x6B,0x6C],   [[0,3]],   '!{%H}',   null,            '!{6A6B6C}'    ],
            [ [0x6A,0x6B,0x6C],   [[0,1]],   '!{%H}',     null,            '!{6A}kl'      ],
            [ [0x6A,0x6B,0x6C],   [[1,2]],   '!{%H}',     null,            'j!{6B}l'      ],
            [ [0x6A,0x6B,0x6C],   [[2,3]],   '!{%H}',     null,            'jk!{6C}'      ],
            [ [0x6A,0x6B,0x6C],   [[2,3]],   '!{%H}',     {beg:1},         'k!{6C}'       ],
            [ [0x6A,0x6B,0x6C],   [[2,3]],   '!{%H}',     {beg:3},         ''         ],
            [ [0x6A,0x6B,0x6C],   [[2,3]],   '!{%H}',     {beg:1, end:2},  'k'       ],
        ],
        function(buf, ranges, escape, opt) {
            return utf8.string(utf8.escape_ranges(buf, ranges, escape, opt))
        }

    )
})

test('escape_illegal', function(t) {
    t.tableAssert([
        [ 'buf',       'opt',           'exp'                                   ],
        [ '在嚴',       null,            [0xE5,0x9C,0xA8,0xE5,0x9A,0xB4]        ],
        [ '在嚴',       {beg:1},         [0xE5,0x3F,0x3F,0xE5,0x9A,0xB4]        ],
        [ '在嚴',       {beg:2},         [0xE5,0x9C,0x3F,0xE5,0x9A,0xB4]        ],
        [ '在嚴',       {beg:2,end:5},   [0xE5,0x9C,0x3F,0x3F,0x3F,0xB4]        ],
    ], function(buf, opt) {
        return utf8.escape_illegal(utf8.buffer(buf), opt)
    })

})

test('buffer and string in harmony and at peace with the world', function(t) {
    t.tableAssert(
        [
            [ 'v',                                  'exp'               ],
            [ '在嚴寒的冬日裡',                       '在嚴寒的冬日裡'      ],
            [ 'abc𐐀defg,é',                         'abc𐐀defg,é'        ],
            [ 'gîddñup𐂃!',                         'gîddñup𐂃!'       ],
            [ 'ᄒ,ᅡ,ᆫ,한',                           'ᄒ,ᅡ,ᆫ,한'        ],
        ],
        function(v) { return utf8.string(utf8.buffer(v)) }
    )
})

test('fill', function(t) {
    t.tableAssert([
        [ 'blen',       'sample',    'opt',      'exp'          ],
        [ 14,           'ñup𐂃',     null,               'ñup𐂃ñup??'       ],
        [ 15,           'ñup𐂃',     null,               'ñup𐂃ñup???'      ],
        [ 16,           'ñup𐂃',     null,               'ñup𐂃ñup𐂃'       ],
        [ 17,           'ñup𐂃',     null,               'ñup𐂃ñup𐂃?'      ],
        [ 18,           'ñup𐂃',     null,               'ñup𐂃ñup𐂃ñ'      ],
        [ 19,           'ñup𐂃',     null,               'ñup𐂃ñup𐂃ñu'     ],
        [ 19,           'ñup𐂃',     {beg:1},            '?ñup𐂃ñup𐂃ñ'     ],     // buf[0] is undefined
        [ 19,           'ñup𐂃',     {beg:2},            '??ñup𐂃ñup𐂃?'    ],
        [ 19,           'ñup𐂃',     {beg:2, end:19},    '??ñup𐂃ñup𐂃?'    ],
        [ 19,           'ñup𐂃',     {beg:2, end:18},    '??ñup𐂃ñup𐂃?'    ],
        [ 19,           'ñup𐂃',     {beg:2, end:17},    '??ñup𐂃ñup?????'  ],
        [ 19,           'ñup𐂃',     {beg:2, end:16},    '??ñup𐂃ñup?????'  ],

    ], function(blen, sample, opt) {
        var buf = new Array(blen)
        utf8.fill(buf, sample, opt)
        return utf8.string(buf)
    })
})

test('buffer and string - all ascii', function(t) {
    for(var i=1; i<128; i+=11) {
        t.same(utf8.buffer(utf8.string([i])), [i], t.desc('ascii', [i], i))
    }
    t.end()
})

test('join', function(t) {
    t.tableAssert([
        [ 'buffers',                         'joinbuf',          'exp'     ],
        [ ['a'],                             ':',                'a'       ],
        [ ['a','b','c'],                     ':',                'a:b:c'   ],
        [ [0x61,0x62,0x63],                  ':',                'a:b:c'   ],
        [ [[0x61,0x62],[0x63,0x64]],         '',                 'abcd'    ],
        [ [[0x61,0x62],[0x63,0x64]],         0x40,        'ab@cd'    ],
        [ [[0x61,0x62],[0x63,0x64]],         [0x40],             'ab@cd'    ],
        [ [[0x61,0x62],[0x63,0x64]],         [0x39,0x40],        'ab9@cd'    ],
    ], function(buffers, joinbuf) {
        buffers = buffers.map(function(b) { return utf8.buffer(b) })
        var ret = utf8.join(buffers, joinbuf)
        return utf8.string(ret)
    })
})

test('utf8 errors', function(t) {
    t.tableAssert(
        [
            [ 'fn',              'input',                         'expect' ],
            [ utf8.buffer,         [new Date()],                    /cannot encode non-array object/    ],
            [ utf8.buffer,         [true],                          /cannot encode type/    ],
            [ utf8.escape_ranges,  [[1,2,3], [[0,1]], 'XX'],         /must be a single asci character or number or a string/    ],
        ],
        function(fn, input){ fn.apply(null, input) },
        { assert: 'throws' }
    )
})
