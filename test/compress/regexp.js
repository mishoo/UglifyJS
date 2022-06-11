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

regexp_properties: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(/abc/g.source, /abc/g.global, /abc/g.ignoreCase, /abc/g.lastIndex, /abc/g.multiline);
    }
    expect: {
        console.log("abc", true, false, /abc/g.lastIndex, false);
    }
    expect_stdout: "abc true false 0 false"
}

instanceof_1: {
    input: {
        console.log(/foo/ instanceof RegExp);
    }
    expect_exact: "console.log(/foo/ instanceof RegExp);"
    expect_stdout: "true"
}

instanceof_2: {
    input: {
        console.log(42 + /foo/ instanceof Object);
    }
    expect_exact: "console.log(42+/foo/ instanceof Object);"
    expect_stdout: "false"
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

issue_3434_4: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        [
            [ "", RegExp("") ],
            [ "/", RegExp("/") ],
            [ "//", RegExp("//") ],
            [ "\/", RegExp("\\/") ],
            [ "///", RegExp("///") ],
            [ "/\/", RegExp("/\\/") ],
            [ "\//", RegExp("\\//") ],
            [ "\\/", RegExp("\\\\/") ],
            [ "////", RegExp("////") ],
            [ "//\/", RegExp("//\\/") ],
            [ "/\//", RegExp("/\\//") ],
            [ "/\\/", RegExp("/\\\\/") ],
            [ "\///", RegExp("\\///") ],
            [ "\/\/", RegExp("\\/\\/") ],
            [ "\\//", RegExp("\\\\//") ],
            [ "\\\/", RegExp("\\\\\\/") ],
        ].forEach(function(test) {
            console.log(test[1].test("\\"), test[1].test(test[0]));
        });
    }
    expect: {
        [
            [ "", /(?:)/ ],
            [ "/", /\// ],
            [ "//", /\/\// ],
            [ "/", /\// ],
            [ "///", /\/\/\// ],
            [ "//", /\/\// ],
            [ "//", /\/\// ],
            [ "\\/", /\\\// ],
            [ "////", /\/\/\/\// ],
            [ "///", /\/\/\// ],
            [ "///", /\/\/\// ],
            [ "/\\/", /\/\\\// ],
            [ "///", /\/\/\// ],
            [ "//", /\/\// ],
            [ "\\//", /\\\/\// ],
            [ "\\/", /\\\// ],
        ].forEach(function(test) {
            console.log(test[1].test("\\"), test[1].test(test[0]));
        });
    }
    expect_stdout: [
        "true true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
        "false true",
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

exec: {
    options = {
        evaluate: true,
        loops: true,
        unsafe: true,
    }
    input: {
        while (/a/.exec("AAA"))
            console.log("FAIL");
        console.log("PASS");
    }
    expect: {
        for (;null;)
            console.log("FAIL");
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

exec_global: {
    options = {
        evaluate: true,
        loops: true,
        unsafe: true,
    }
    input: {
        while (/a/g.exec("AAA"))
            console.log("FAIL");
        console.log("PASS");
    }
    expect: {
        for (;null;)
            console.log("FAIL");
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

test: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        while (/a/.test("AAA"))
            console.log("FAIL");
        console.log("PASS");
    }
    expect: {
        while (false)
            console.log("FAIL");
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

test_global: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        while (/a/g.test("AAA"))
            console.log("FAIL");
        console.log("PASS");
    }
    expect: {
        while (false)
            console.log("FAIL");
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

var_exec: {
    options = {
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var r = /a/;
        while (r.exec("AAA"))
            console.log("FAIL");
        console.log("PASS");
    }
    expect: {
        var r = /a/;
        for (;null;)
            console.log("FAIL");
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

var_exec_global: {
    options = {
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var r = /a/g;
        while (r.exec("aaa"))
            console.log("PASS");
    }
    expect: {
        var r = /a/g;
        for (;r.exec("aaa");)
            console.log("PASS");
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
    ]
}

var_test: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var r = /a/;
        while (r.test("AAA"))
            console.log("FAIL");
        console.log("PASS");
    }
    expect: {
        var r = /a/;
        while (false)
            console.log("FAIL");
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

var_test_global: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var r = /a/g;
        while (r.test("aaa"))
            console.log("PASS");
    }
    expect: {
        var r = /a/g;
        while (r.test("aaa"))
            console.log("PASS");
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
    ]
}

lazy_boolean: {
    options = {
        evaluate: true,
        passes: 2,
        side_effects: true,
        unsafe: true,
    }
    input: {
        /b/.exec({}) && console.log("PASS");
        /b/.test({}) && console.log("PASS");
        /b/g.exec({}) && console.log("PASS");
        /b/g.test({}) && console.log("PASS");
    }
    expect: {
        console.log("PASS");
        console.log("PASS");
        console.log("PASS");
        console.log("PASS");
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
        "PASS",
    ]
}

reset_state_between_evaluate: {
    options = {
        evaluate: true,
        passes: 2,
        unsafe: true,
    }
    input: {
        console.log(function() {
            for (var a in /[abc4]/g.exec("a"))
                return "PASS";
            return "FAIL";
        }());
    }
    expect: {
        console.log(function() {
            for (var a in /[abc4]/g.exec("a"))
                return "PASS";
            return "FAIL";
        }());
    }
    expect_stdout: "PASS"
}
