regexp_simple: {
    input: {
        /rx/ig
    }
    expect_exact: "/rx/gi;"
}

regexp_slashes: {
    input: {
        /\\\/rx\/\\/ig
    }
    expect_exact: "/\\\\\\/rx\\/\\\\/gi;"
}

regexp_1: {
    input: {
        console.log(JSON.stringify("COMPASS? Overpass.".match(/([Sap]+)/ig)));
    }
    expect: {
        console.log(JSON.stringify("COMPASS? Overpass.".match(/([Sap]+)/gi)));
    }
    expect_stdout: '["PASS","pass"]'
}

regexp_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(JSON.stringify("COMPASS? Overpass.".match(new RegExp("([Sap]+)", "ig"))));
    }
    expect: {
        console.log(JSON.stringify("COMPASS? Overpass.".match(/([Sap]+)/gi)));
    }
    expect_stdout: '["PASS","pass"]'
}

issue_3434_1: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    beautify = {
        beautify: true,
    }
    input: {
        var o = {
            "\n": RegExp("\n"),
            "\r": RegExp("\r"),
            "\t": RegExp("\t"),
            "\b": RegExp("\b"),
            "\f": RegExp("\f"),
            "\0": RegExp("\0"),
            "\x0B": RegExp("\x0B"),
            "\u2028": RegExp("\u2028"),
            "\u2029": RegExp("\u2029"),
        };
        for (var c in o)
            console.log(o[c].test("\\"), o[c].test(c));
    }
    expect_exact: [
        "var o = {",
        '    "\\n": /\\n/,',
        '    "\\r": /\\r/,',
        '    "\\t": /\t/,',
        '    "\\b": /\b/,',
        '    "\\f": /\f/,',
        '    "\\0": /\0/,',
        '    "\\v": /\v/,',
        '    "\\u2028": /\\u2028/,',
        '    "\\u2029": /\\u2029/',
        "};",
        "",
        'for (var c in o) console.log(o[c].test("\\\\"), o[c].test(c));',
    ]
    expect_stdout: [
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
    ]
}

issue_3434_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    beautify = {
        beautify: true,
    }
    input: {
        var o = {
            "\n": RegExp("\\\n"),
            "\r": RegExp("\\\r"),
            "\t": RegExp("\\\t"),
            "\b": RegExp("\\\b"),
            "\f": RegExp("\\\f"),
            "\0": RegExp("\\\0"),
            "\x0B": RegExp("\\\x0B"),
            "\u2028": RegExp("\\\u2028"),
            "\u2029": RegExp("\\\u2029"),
        };
        for (var c in o)
            console.log(o[c].test("\\"), o[c].test(c));
    }
    expect_exact: [
        "var o = {",
        '    "\\n": /\\n/,',
        '    "\\r": /\\r/,',
        '    "\\t": /\t/,',
        '    "\\b": /\b/,',
        '    "\\f": /\f/,',
        '    "\\0": /\0/,',
        '    "\\v": /\v/,',
        '    "\\u2028": /\\u2028/,',
        '    "\\u2029": /\\u2029/',
        "};",
        "",
        'for (var c in o) console.log(o[c].test("\\\\"), o[c].test(c));',
    ]
    expect_stdout: [
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
    ]
}

issue_3434_3: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        RegExp("\n");
        RegExp("\r");
        RegExp("\\n");
        RegExp("\\\n");
        RegExp("\\\\n");
        RegExp("\\\\\n");
        RegExp("\\\\\\n");
        RegExp("\\\\\\\n");
        RegExp("\u2028");
        RegExp("\u2029");
        RegExp("\n\r\u2028\u2029");
        RegExp("\\\nfo\n[\n]o\\bbb");
    }
    expect: {
        /\n/;
        /\r/;
        /\n/;
        /\n/;
        /\\n/;
        /\\\n/;
        /\\\n/;
        /\\\n/;
        /\u2028/;
        /\u2029/;
        /\n\r\u2028\u2029/;
        /\nfo\n[\n]o\bbb/;
    }
}
