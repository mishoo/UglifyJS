statements: {
    options = {
        hoist_funs: false,
        hoist_vars: true,
        join_vars: true,
        unused: true,
    }
    input: {
        function f() {
            var a = 1;
            var b = 2;
            var c = 3;
            function g() {}
            return g(a, b, c);
        }
    }
    expect: {
        function f() {
            var a = 1, b = 2, c = 3;
            function g() {}
            return g(a, b, c);
        }
    }
}

statements_funs: {
    options = {
        hoist_funs: true,
        hoist_vars: true,
        join_vars: true,
        unused: true,
    }
    input: {
        function f() {
            var a = 1;
            var b = 2;
            var c = 3;
            function g() {}
            return g(a, b, c);
        }
    }
    expect: {
        function f() {
            function g() {}
            var a = 1, b = 2, c = 3;
            return g(a, b, c);
        }
    }
}

sequences: {
    options = {
        hoist_funs: false,
        hoist_vars: true,
        join_vars: true,
        unused: true,
    }
    input: {
        function f() {
            var a = 1, b = 2;
            function g() {}
            var c = 3;
            return g(a, b, c);
        }
    }
    expect: {
        function f() {
            var c, a = 1, b = 2;
            function g() {}
            c = 3;
            return g(a, b, c);
        }
    }
}

sequences_funs: {
    options = {
        hoist_funs: true,
        hoist_vars: true,
        join_vars: true,
        unused: true,
    }
    input: {
        function f() {
            var a = 1, b = 2;
            function g() {}
            var c = 3;
            return g(a, b, c);
        }
    }
    expect: {
        function f() {
            function g() {}
            var a = 1, b = 2, c = 3;
            return g(a, b, c);
        }
    }
}

catch_var: {
    options = {
        dead_code: true,
        hoist_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        try {
            a;
        } catch (a) {
            var a = 0;
            a;
        }
        console.log(a);
    }
    expect: {
        a = "PASS";
        var a;
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2295: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
        join_vars: true,
        unused: true,
    }
    input: {
        function foo(o) {
            var a = o.a;
            if (a) return a;
            var a = 1;
        }
    }
    expect: {
        function foo(o) {
            var a = o.a;
            if (a) return a;
            a = 1;
        }
    }
}

issue_4487_1: {
    options = {
        functions: true,
        hoist_vars: true,
        join_vars: true,
        keep_fnames: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f() {
            var f = console.log(typeof f);
        };
        var b = a();
    }
    expect: {
        var a = function f() {
            var f = console.log(typeof f);
        };
        a();
    }
    expect_stdout: "undefined"
}

issue_4487_2: {
    options = {
        functions: true,
        hoist_vars: true,
        join_vars: true,
        keep_fnames: true,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f() {
            var f = console.log(typeof f);
        };
        var b = a();
    }
    expect: {
        function a() {
            var f = console.log(typeof f);
        }
        a();
    }
    expect_stdout: "undefined"
}

issue_4487_3: {
    options = {
        functions: true,
        hoist_vars: true,
        join_vars: true,
        keep_fnames: true,
        passes: 3,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f() {
            var f = console.log(typeof f);
        };
        var b = a();
    }
    expect: {
        (function a() {
            console.log(typeof void 0);
        })();
    }
    expect_stdout: "undefined"
}

issue_4489: {
    options = {
        collapse_vars: true,
        evaluate: true,
        hoist_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        A = 0;
        var o = !0 || null;
        for (var k in o);
        console.log(k);
    }
    expect: {
        for (var k in !(A = 0));
        console.log(k);
    }
    expect_stdout: "undefined"
}

issue_4517: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
        join_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = 2;
            A = a;
            var b = typeof !1;
            return A + b;
        }());
    }
    expect: {
        console.log(function() {
            return (A = 2) + typeof !1;
        }());
    }
    expect_stdout: "2boolean"
}

issue_4736: {
    options = {
        collapse_vars: true,
        evaluate: true,
        hoist_vars: true,
        join_vars: true,
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        function f() {
            (function g() {
                var b = (a = 0, 1 << 30);
                var c = (a = 0, console.log(b));
                var d = c;
            })(f);
        }
        f();
    }
    expect: {
        (function() {
            (function() {
                0;
                console.log(1 << 30);
            })();
        })();
    }
    expect_stdout: "1073741824"
}

issue_4839: {
    options = {
        evaluate: true,
        hoist_vars: true,
        join_vars: true,
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var log = console.log, o = function(a, b) {
            return b && b;
        }("foo");
        for (var k in o)
            throw "FAIL";
        log("PASS");
    }
    expect: {
        var k, log = console.log;
        for (k in void 0)
            throw "FAIL";
        log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4859: {
    options = {
        evaluate: true,
        hoist_vars: true,
        join_vars: true,
        keep_infinity: true,
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b = (a = 2, 1 / 0), c = 3;
            var d = a + b;
            console.log(d);
            return f;
        }
        f();
    }
    expect: {
        (function f(a) {
            console.log(2 + 1 / 0);
            return f;
        })();
    }
    expect_stdout: "Infinity"
}

issue_4893_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        hoist_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {}
            var a = null;
            var b = null;
            var c = null;
            b.p += a = 42;
            f;
        }
        try {
            f();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try{
            (function f() {
                null.p += 42;
                f;
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_4893_2: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {}
            var a = null;
            var b = null;
            var c = null;
            b.p += a = 42;
            f;
        }
        try {
            f();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try{
            (function() {
                var a;
                a = null;
                a.p += 42;
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_4898: {
    options = {
        collapse_vars: true,
        evaluate: true,
        hoist_vars: true,
        loops: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        do {
            var b = [ console.log("PASS") ];
            var c = b;
        } while (c.p = 0);
    }
    expect: {
        var b;
        b = [ console.log("PASS") ];
        b.p = 0;
    }
    expect_stdout: "PASS"
}

issue_5187_1: {
    options = {
        hoist_props: true,
        hoist_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            var a = 42;
            do {
                var b = { 0: a++ };
            } while (console.log(b[b ^= 0]));
        }
        f();
    }
    expect: {
        (function() {
            var a, b;
            a = 42;
            do {
                b = { 0: a++ };
            } while (console.log(b[b ^= 0]));
        })();
    }
    expect_stdout: "42"
}

issue_5187_2: {
    options = {
        hoist_props: true,
        hoist_vars: true,
        join_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            var a = 42;
            do {
                var b = { 0: a++ };
            } while (console.log(b[b ^= 0]));
        }
        f();
    }
    expect: {
        (function() {
            var b, a = 42;
            do {
                b = { 0: a++ };
            } while (console.log(b[b ^= 0]));
        })();
    }
    expect_stdout: "42"
}

issue_5195: {
    options = {
        hoist_props: true,
        hoist_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            var a;
            do {
                var b = { p: a };
            } while (console.log(b += ""));
        }
        f();
    }
    expect: {
        (function() {
            var a, b;
            do {
                b = { p: a };
            } while (console.log(b += ""));
        })();
    }
    expect_stdout: "[object Object]"
}

issue_5378: {
    options = {
        hoist_vars: true,
        inline: true,
        toplevel: true,
    }
    input: {
        var a = 2;
        while (a--)
            (function() {
                var b;
                var c;
                while (console.log(b));
                --b;
            })();
    }
    expect: {
        var a = 2;
        while (a--) {
            b = void 0;
            var b, c;
            while (console.log(b));
            --b;
        }
    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
}

issue_5411_1: {
    options = {
        collapse_vars: true,
        dead_code: true,
        hoist_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = "PASS";
        b++;
        b = a;
        var b = b, c = c && c[b];
        console.log(b);
    }
    expect: {
        var a, b, c;
        b++;
        b = a = "PASS";
        c = c && c[b];
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_5411_2: {
    options = {
        collapse_vars: true,
        dead_code: true,
        evaluate: true,
        hoist_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        b++;
        b = a;
        var b = b, c = c && c[b];
        console.log(b);
    }
    expect: {
        var b, c;
        b++;
        b = "PASS",
        c;
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_5411_3: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = console;
        a++;
        var a = A = a;
        console.log(A);
    }
    expect: {
        var a;
        a = console;
        a = A = ++a;
        console.log(A);
    }
    expect_stdout: "NaN"
}

issue_5411_4: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = console;
        a++;
        var a = A = a;
        console.log(A);
    }
    expect: {
        var a = console;
        a = A = ++a;
        console.log(A);
    }
    expect_stdout: "NaN"
}

issue_5626: {
    options = {
        conditionals: true,
        evaluate: true,
        hoist_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function() {
            return console.log(arguments[0]), 42;
        }("PASS") ? null : "foo";
        for (var b in a)
            FAIL;
    }
    expect: {
        (function() {
            console.log(arguments[0]);
        }("PASS"));
        for (var b in null)
            FAIL;
    }
    expect_stdout: "PASS"
}

issue_5638_1: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = "FAIL";
        var a = [ 42 ];
        console || FAIL(a);
        console.log(a++);
    }
    expect: {
        var a;
        a = "FAIL";
        a = [ 42 ];
        console || FAIL(a);
        console.log(a++);
    }
    expect_stdout: "42"
}

issue_5638_2: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = "FAIL";
        var a = [ 6 ];
        console || FAIL(a);
        console.log(a *= 7);
    }
    expect: {
        var a;
        a = "FAIL";
        a = [ 6 ];
        console || FAIL(a);
        console.log(a *= 7);
    }
    expect_stdout: "42"
}

issue_5638_3: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var log = console.log;
        var o = { foo: 42 };
        for (var k in o) {
            var v = o[k];
            log(k || v, v++);
        }
    }
    expect: {
        var log, o, k, v;
        log = console.log;
        for (k in o = { foo: 42 }) {
            v = o[k];
            log(k || v, v++);
        }
    }
    expect_stdout: "foo 42"
}

issue_5638_4: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var log = console.log;
        var o = { foo: 6 };
        for (var k in o) {
            var v = o[k];
            log(k || v, v *= 7);
        }
    }
    expect: {
        var log, o, k, v;
        log = console.log;
        for (k in o = { foo: 6 }) {
            v = o[k];
            log(k || v, v *= 7);
        }
    }
    expect_stdout: "foo 42"
}
