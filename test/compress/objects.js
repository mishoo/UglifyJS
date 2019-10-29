duplicate_key: {
    options = {
        objects: true,
        side_effects: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
            a: 3,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            a: 3,
            b: 2,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "a 3",
        "b 2",
    ]
}

duplicate_key_strict: {
    options = {
        objects: true,
        side_effects: true,
    }
    input: {
        "use strict";
        var o = {
            a: 1,
            b: 2,
            a: 3,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        "use strict";
        var o = {
            a: 1,
            b: 2,
            a: 3,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: true
}

duplicate_key_side_effect: {
    options = {
        objects: true,
        side_effects: true,
    }
    input: {
        var o = {
            a: 1,
            b: o = 2,
            a: 3,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            a: 1,
            b: o = 2,
            a: 3,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "a 3",
        "b 2",
    ]
}

duplicate_key_with_accessor: {
    options = {
        objects: true,
        side_effects: true,
    }
    input: {
        [
            {
                a: 0,
                b: 1,
                a: 2,
                set b(v) {},
            },
            {
                a: 3,
                b: 4,
                get a() {
                    return 5;
                },
                a: 6,
                b: 7,
                a: 8,
                b: 9,
            },
        ].forEach(function(o) {
            for (var k in o)
                console.log(k, o[k]);
        });
    }
    expect: {
        [
            {
                a: 2,
                b: 1,
                set b(v) {},
            },
            {
                a: 3,
                b: 4,
                get a() {
                    return 5;
                },
                a: 8,
                b: 9,
            },
        ].forEach(function(o) {
            for (var k in o)
                console.log(k, o[k]);
        });
    }
    expect_stdout: true
}

unsafe_object_repeated: {
    options = {
        evaluate: true,
        objects: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var o = { a: { b: 1 }, a: 1 };
        console.log(
            o + 1,
            o.a + 1,
            o.b + 1,
            o.a.b + 1
        );
    }
    expect: {
        var o = { a: 1 };
        console.log(
            o + 1,
            2,
            o.b + 1,
            NaN
        );
    }
    expect_stdout: true
}

numeric_literal: {
    options = {
        objects: true,
        side_effects: true,
    }
    mangle = {
        properties: true,
    }
    beautify = {
        beautify: true,
    }
    input: {
        var obj = {
            0: 0,
            "-0": 1,
            42: 2,
            "42": 3,
            0x25: 4,
            "0x25": 5,
            1E42: 6,
            "1E42": 7,
            "1e+42": 8,
        };
        console.log(obj[-0], obj[-""], obj["-0"]);
        console.log(obj[42], obj["42"]);
        console.log(obj[0x25], obj["0x25"], obj[37], obj["37"]);
        console.log(obj[1E42], obj["1E42"], obj["1e+42"]);
    }
    expect_exact: [
        'var obj = {',
        '    0: 0,',
        '    "-0": 1,',
        '    42: 3,',
        '    37: 4,',
        '    o: 5,',
        '    1e42: 8,',
        '    b: 7',
        '};',
        '',
        'console.log(obj[-0], obj[-""], obj["-0"]);',
        '',
        'console.log(obj[42], obj["42"]);',
        '',
        'console.log(obj[37], obj["o"], obj[37], obj["37"]);',
        '',
        'console.log(obj[1e42], obj["b"], obj["1e+42"]);',
    ]
    expect_stdout: [
        "0 0 1",
        "3 3",
        "4 5 4 4",
        "8 7 8",
    ]
}
