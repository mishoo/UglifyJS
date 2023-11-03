eval_collapse_vars: {
    options = {
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        properties: true,
        sequences: false,
        side_effects: true,
        unused: true,
    }
    input: {
        function f1() {
            var e = 7;
            var s = "abcdef";
            var i = 2;
            var eval = console.log.bind(console);
            var x = s.charAt(i++);
            var y = s.charAt(i++);
            var z = s.charAt(i++);
            eval(x, y, z, e);
        }
        function p1() { var a = foo(), b = bar(), eval = baz(); return a + b + eval; }
        function p2() { var a = foo(), b = bar(), eval = baz; return a + b + eval(); }
        (function f2(eval) {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })(eval);
    }
    expect: {
        function f1() {
            var e = 7,
                s = "abcdef",
                i = 2,
                eval = console.log.bind(console),
                x = s.charAt(i++),
                y = s.charAt(i++),
                z = s.charAt(i++);
            eval(x, y, z, e);
        }
        function p1() { return foo() + bar() + baz(); }
        function p2() { var a = foo(), b = bar(), eval = baz; return a + b + eval(); }
        (function f2(eval) {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })(eval);
    }
    expect_stdout: true
}

eval_unused: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        function o(k) {
            return { c: 14 }[k];
        }
        console.log(function f1(a, eval, c, d, e) {
            return a("c") + eval;
        }(o, 28, true));
        console.log(function f2(a, b, c, d, e) {
            return a + eval("c");
        }(14, true, 28));
        console.log(function f3(a, eval, c, d, e) {
            return a + eval("c");
        }(28, o, true));
    }
    expect: {
        function o(k) {
            return { c: 14 }[k];
        }
        console.log(function(a, eval) {
            return a("c") + eval;
        }(o, 28));
        console.log(function f2(a, b, c, d, e) {
            return a + eval("c");
        }(14, true, 28));
        console.log(function f3(a, eval, c, d, e) {
            return a + eval("c");
        }(28, o, true));
    }
    expect_stdout: [
        "42",
        "42",
        "42",
    ]
}

eval_mangle: {
    mangle = {}
    beautify = {
        beautify: true,
    }
    input: {
        function o(k) {
            return { cc: 14 }[k + "c"];
        }
        console.log(function f1(a, eval, c, d, e) {
            return a("c") + eval;
        }(o, 28, true));
        console.log(function f2(a, b, c, d, e) {
            return a + eval("c");
        }(14, true, 28));
        console.log(function f3(a, eval, c, d, e) {
            return a + eval("c");
        }(28, o, true));
    }
    expect_exact: [
        "function o(o) {",
        "    return {",
        "        cc: 14",
        '    }[o + "c"];',
        "}",
        "",
        "console.log(function o(c, e, n, r, t) {",
        '    return c("c") + e;',
        "}(o, 28, true));",
        "",
        "console.log(function f2(a, b, c, d, e) {",
        '    return a + eval("c");',
        "}(14, true, 28));",
        "",
        "console.log(function f3(a, eval, c, d, e) {",
        '    return a + eval("c");',
        "}(28, o, true));",
    ]
    expect_stdout: [
        "42",
        "42",
        "42",
    ]
}
