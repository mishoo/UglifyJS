simple: {
    input: {
        console.log(`foo
        bar\nbaz`);
    }
    expect_exact: "console.log(`foo\n        bar\\nbaz`);"
    expect_stdout: [
        "foo",
        "        bar",
        "baz",
    ]
    node_version: ">=4"
}

placeholder: {
    input: {
        console.log(`foo ${ function(a, b) {
            return a * b;
        }(6, 7) }`);
    }
    expect_exact: "console.log(`foo ${function(a,b){return a*b}(6,7)}`);"
    expect_stdout: "foo 42"
    node_version: ">=4"
}

nested: {
    input: {
        console.log(`P${`A${"S"}`}S`);
    }
    expect_exact: 'console.log(`P${`A${"S"}`}S`);'
    expect_stdout: "PASS"
    node_version: ">=4"
}

tagged: {
    input: {
        console.log(String.raw`foo\nbar`);
    }
    expect_exact: "console.log(String.raw`foo\\nbar`);"
    expect_stdout: "foo\\nbar"
    node_version: ">=4"
}

tagged_chain: {
    input: {
        function f(strings) {
            return strings.join("") || f;
        }
        console.log(f```${42}``pass`.toUpperCase());
    }
    expect_exact: 'function f(strings){return strings.join("")||f}console.log(f```${42}``pass`.toUpperCase());'
    expect_stdout: "PASS"
    node_version: ">=4"
}

tag_parentheses_arrow: {
    input: {
        console.log((s => s.raw[0])`\tPASS`.slice(2));
    }
    expect_exact: "console.log((s=>s.raw[0])`\\tPASS`.slice(2));"
    expect_stdout: "PASS"
    node_version: ">=4"
}

tag_parentheses_binary: {
    options = {
        collapse_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var f = function() {
            console.log("PASS");
        } || console
        f``;
    }
    expect_exact: '(function(){console.log("PASS")}||console)``;'
    expect_stdout: "PASS"
    node_version: ">=4"
}

tag_parentheses_new: {
    input: {
        (new function() {
            return console.log;
        })`foo`;
    }
    expect_exact: "(new function(){return console.log})`foo`;"
    expect_stdout: true
    node_version: ">=4"
}

tag_parentheses_sequence: {
    input: {
        var o = {
            f() {
                console.log(this === o ? "FAIL" : "PASS");
            },
        };
        (42, o.f)``;
    }
    expect_exact: 'var o={f(){console.log(this===o?"FAIL":"PASS")}};(42,o.f)``;'
    expect_stdout: "PASS"
    node_version: ">=4"
}

tag_parentheses_unary: {
    input: {
        var a;
        try {
            (~a)``;
            (a++)``;
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_exact: 'var a;try{(~a)``;(a++)``}catch(e){console.log("PASS")}'
    expect_stdout: "PASS"
    node_version: ">=4"
}

malformed_escape: {
    input: {
        (function(s) {
            s.forEach((c, i) => console.log(i, c, s.raw[i]));
            return () => console.log(arguments);
        })`\uFo${42}`();
    }
    expect_exact: "(function(s){s.forEach((c,i)=>console.log(i,c,s.raw[i]));return()=>console.log(arguments)})`\\uFo${42}`();"
    expect_stdout: true
    node_version: ">=4"
}

evaluate: {
    options = {
        evaluate: true,
        templates: false,
    }
    input: {
        console.log(`foo ${ function(a, b) {
            return a * b;
        }(6, 7) }`);
    }
    expect: {
        console.log(`foo ${42}`);
    }
    expect_stdout: "foo 42"
    node_version: ">=4"
}

evaluate_templates: {
    options = {
        evaluate: true,
        templates: true,
    }
    input: {
        console.log(`foo ${ function(a, b) {
            return a * b;
        }(6, 7) }`);
    }
    expect: {
        console.log("foo 42");
    }
    expect_stdout: "foo 42"
    node_version: ">=4"
}

partial_evaluate: {
    options = {
        evaluate: true,
        templates: true,
    }
    input: {
        console.log(`${6 * 7} foo ${console ? `PA` + "SS" : `FA` + `IL`}`);
    }
    expect: {
        console.log(`42 foo ${console ? "PASS" : "FAIL"}`);
    }
    expect_stdout: "42 foo PASS"
    node_version: ">=4"
}

malformed_evaluate_1: {
    options = {
        evaluate: true,
        templates: true,
    }
    input: {
        console.log(`\67 ${6 * 7}`);
    }
    expect: {
        console.log(`\67 42`);
    }
    expect_stdout: true
    node_version: ">=4"
}

malformed_evaluate_2: {
    options = {
        evaluate: true,
        templates: true,
    }
    input: {
        console.log(`\u0${0}b${5}`);
    }
    expect: {
        console.log(`\u0${0}b5`);
    }
    expect_stdout: true
    node_version: ">=4"
}

malformed_evaluate_3: {
    options = {
        evaluate: true,
        templates: true,
    }
    input: {
        console.log(`\u${0}b${5}`);
    }
    expect: {
        console.log(`\u0b5`);
    }
    expect_stdout: true
    node_version: ">=4"
}

malformed_evaluate_4: {
    options = {
        evaluate: true,
        templates: true,
        unsafe: true,
    }
    input: {
        console.log(String.raw`\u0${0}b${5}`);
    }
    expect: {
        console.log("\\u00b5");
    }
    expect_stdout: "\\u00b5"
    node_version: ">=8"
}

unsafe_evaluate: {
    options = {
        evaluate: true,
        templates: true,
        unsafe: true,
    }
    input: {
        console.log(String.raw`\uFo`);
    }
    expect: {
        console.log("\\uFo");
    }
    expect_stdout: "\\uFo"
    node_version: ">=8"
}

side_effects_1: {
    options = {
        side_effects: true,
    }
    input: {
        `42`;
        `${console.log("foo")}`;
        console.log`\nbar`;
    }
    expect: {
        console.log("foo");
        console.log`\nbar`;
    }
    expect_stdout: true
    node_version: ">=4"
}

side_effects_2: {
    options = {
        side_effects: true,
    }
    input: {
        var o = {
            f() {
                console.log(this === o ? "FAIL" : "PASS");
            },
        };
        (42, o.f)``;
    }
    expect: {
        var o = {
            f() {
                console.log(this === o ? "FAIL" : "PASS");
            },
        };
        (0, o.f)``;
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

unsafe_side_effects: {
    options = {
        side_effects: true,
        unsafe: true,
    }
    input: {
        `42`;
        `${console.log("foo")}`;
        String.raw`\nbar`;
    }
    expect: {
        console.log("foo");
    }
    expect_stdout: "foo"
    node_version: ">=4"
}

issue_4604: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0, log = console.log;
        a = "FAIL";
        (function() {
            a = "PASS";
        })``;
        log(a);
    }
    expect: {
        var a = 0, log = console.log;
        a = "FAIL";
        (function() {
            a = "PASS";
        })``;
        log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4606: {
    options = {
        evaluate: true,
        templates: true,
    }
    input: {
        console.log(`${typeof A} ${"\r"} ${"\\"} ${"`"}`);
    }
    expect: {
        console.log(`${typeof A} \r \\ \``);
    }
    expect_stdout: "undefined \r \\ `"
    node_version: ">=4"
}

issue_4630: {
    options = {
        evaluate: true,
        templates: true,
    }
    input: {
        console.log(`${/PASS/}`);
    }
    expect: {
        console.log("/PASS/");
    }
    expect_stdout: "/PASS/"
    node_version: ">=4"
}

issue_4676: {
    options = {
        evaluate: true,
        reduce_vars: true,
        templates: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b = `foo${a = "PASS"}`;
            for (var c in f && b)
                b.p;
            return a;
        }
        console.log(f("FAIL"));
    }
    expect: {
        console.log(function f(a) {
            var b = "fooPASS";
            for (var c in f, b)
                b.p;
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4931: {
    options = {
        evaluate: true,
        templates: true,
        unsafe: true,
    }
    input: {
        console.log(String.raw`${typeof A} ${"\r"}`);
        console.log(String.raw`${"\\"} ${"`"}`);
    }
    expect: {
        console.log(String.raw`${typeof A} ${"\r"}`);
        console.log("\\ `");
    }
    expect_stdout: [
        "undefined \r",
        "\\ `",
    ]
    node_version: ">=4"
}
