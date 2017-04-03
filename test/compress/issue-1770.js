mangle_props: {
    mangle_props = {}
    input: {
        var obj = {
            undefined: 1,
            NaN: 2,
            Infinity: 3,
            "-Infinity": 4,
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
            obj["-Infinity"]
        );
    }
    expect: {
        var obj = {
            undefined: 1,
            NaN: 2,
            Infinity: 3,
            "-Infinity": 4,
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
            obj["-Infinity"]
        );
    }
    expect_stdout: true
}
