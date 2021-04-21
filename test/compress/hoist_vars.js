statements: {
    options = {
        hoist_funs: false,
        hoist_vars: true,
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
        var a = "PASS";
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2295: {
    options = {
        collapse_vars: true,
        hoist_vars: true,
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

issue_4487: {
    options = {
        functions: true,
        hoist_vars: true,
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
        function a() {
            var f = console.log(typeof f);
        }
        a();
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
        !(A = 0);
        for (var k in true);
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
            var a = 2;
            A = a;
            return A + typeof !1;
        }());
    }
    expect_stdout: "2boolean"
}

issue_4736: {
    options = {
        collapse_vars: true,
        evaluate: true,
        hoist_vars: true,
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
                0,
                console.log(1073741824);
            })();
        })();
    }
    expect_stdout: "1073741824"
}

issue_4839: {
    options = {
        evaluate: true,
        hoist_vars: true,
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = function(a, b) {
            return b && b;
        }("foo");
        for (var k in o)
            throw "FAIL";
        console.log("PASS");
    }
    expect: {
        var k, o = void 0;
        for (k in o)
            throw "FAIL";
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4859: {
    options = {
        evaluate: true,
        hoist_vars: true,
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
            var d = 1 / 0, d = Infinity;
            console.log(d);
            return f;
        })();
    }
    expect_stdout: "Infinity"
}
