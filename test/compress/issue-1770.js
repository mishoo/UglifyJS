mangle_props: {
    mangle = {
        properties: true,
    }
    input: {
        var obj = {
            undefined: 1,
            NaN: 2,
            Infinity: 3,
            "-Infinity": 4,
            null: 5,
        };
        console.log(
            obj[void 0],
            obj[undefined],
            obj["undefined"],
            obj[0/0],
            obj[NaN],
            obj["NaN"],
            obj[1/0],
            obj[Infinity],
            obj["Infinity"],
            obj[-1/0],
            obj[-Infinity],
            obj["-Infinity"],
            obj[null],
            obj["null"]
        );
    }
    expect: {
        var obj = {
            undefined: 1,
            NaN: 2,
            Infinity: 3,
            "-Infinity": 4,
            null: 5,
        };
        console.log(
            obj[void 0],
            obj[void 0],
            obj["undefined"],
            obj[0/0],
            obj[NaN],
            obj["NaN"],
            obj[1/0],
            obj[1/0],
            obj["Infinity"],
            obj[-1/0],
            obj[-1/0],
            obj["-Infinity"],
            obj[null],
            obj["null"]
        );
    }
    expect_stdout: "1 1 1 2 2 2 3 3 3 4 4 4 5 5"
}

numeric_literal: {
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
        '    42: 2,',
        '    42: 3,',
        '    37: 4,',
        '    o: 5,',
        '    1e42: 6,',
        '    b: 7,',
        '    1e42: 8',
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
