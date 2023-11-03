merge: {
    options = {
        merge_vars: true,
        toplevel: false,
    }
    input: {
        var a = "foo";
        console.log(a);
        function f(b) {
            var c;
            console.log(b);
            c = "bar";
            console.log(c);
        }
        f("baz");
        var d = "moo";
        console.log(d);
    }
    expect: {
        var a = "foo";
        console.log(a);
        function f(b) {
            var b;
            console.log(b);
            b = "bar";
            console.log(b);
        }
        f("baz");
        var d = "moo";
        console.log(d);
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
        "moo",
    ]
}

merge_toplevel: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = "foo";
        console.log(a);
        function f(b) {
            var c;
            console.log(b);
            c = "bar";
            console.log(c);
        }
        f("baz");
        var d = "moo";
        console.log(d);
    }
    expect: {
        var a = "foo";
        console.log(a);
        function f(b) {
            var b;
            console.log(b);
            b = "bar";
            console.log(b);
        }
        f("baz");
        var a = "moo";
        console.log(a);
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
        "moo",
    ]
}

segment: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = "foo";
        console.log(a);
        for (var c, i = 0; i < 1; i++) {
            var b = "bar";
            console.log(b);
            c = "baz";
            console.log(c);
        }
        var d = "moo";
        console.log(d);
    }
    expect: {
        var a = "foo";
        console.log(a);
        for (var b, i = 0; i < 1; i++) {
            var b = "bar";
            console.log(b);
            b = "baz";
            console.log(b);
        }
        var a = "moo";
        console.log(a);
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
        "moo",
    ]
}

init_scope_vars: {
    options = {
        merge_vars: true,
        unsafe_proto: true,
    }
    input: {
        Function.prototype.call();
    }
    expect: {
        (function() {}).call();
    }
    expect_stdout: true
}

binary_branch: {
    options = {
        merge_vars: true,
    }
    input: {
        console.log(function(a) {
            var b = "FAIL", c;
            a && (c = b);
            return c || "PASS";
        }());
    }
    expect: {
        console.log(function(a) {
            var b = "FAIL", c;
            a && (c = b);
            return c || "PASS";
        }());
    }
    expect_stdout: "PASS"
}

conditional_branch: {
    options = {
        merge_vars: true,
    }
    input: {
        console.log(function(a) {
            var b = "FAIL", c;
            a ? (c = b) : void 0;
            return c || "PASS";
        }());
    }
    expect: {
        console.log(function(a) {
            var b = "FAIL", c;
            a ? (c = b) : void 0;
            return c || "PASS";
        }());
    }
    expect_stdout: "PASS"
}

conditional_chain_1: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a, b) {
            var c, d;
            if (a && (c = a))
                console.log(c);
            else
                b || (d = b) ? console.log("foo") : console.log(d);
        }
        f("", null);
        f("", true);
        f(42, null);
        f(42, true);
    }
    expect: {
        function f(a, b) {
            var a, a;
            if (a && (a = a))
                console.log(a);
            else
                b || (a = b) ? console.log("foo") : console.log(a);
        }
        f("", null);
        f("", true);
        f(42, null);
        f(42, true);
    }
    expect_stdout: [
        "null",
        "foo",
        "42",
        "42",
    ]
}

conditional_chain_2: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a, b) {
            var c, d;
            if (a && (c = a))
                console.log(c);
            else
                b || (d = b) ? console.log(c) : console.log(d);
        }
        f("", null);
        f("", true);
        f(42, null);
        f(42, true);
    }
    expect: {
        function f(a, b) {
            var c, a;
            if (a && (c = a))
                console.log(c);
            else
                b || (a = b) ? console.log(c) : console.log(a);
        }
        f("", null);
        f("", true);
        f(42, null);
        f(42, true);
    }
    expect_stdout: [
        "null",
        "undefined",
        "42",
        "42",
    ]
}

conditional_chain_3: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a, b) {
            var c, d;
            if (a && (c = a) || b || (d = b))
                console.log(c);
            else
                console.log(d);
        }
        f("", null);
        f("", true);
        f(42, null);
        f(42, true);
    }
    expect: {
        function f(a, b) {
            var c, a;
            if (a && (c = a) || b || (a = b))
                console.log(c);
            else
                console.log(a);
        }
        f("", null);
        f("", true);
        f(42, null);
        f(42, true);
    }
    expect_stdout: [
        "null",
        "undefined",
        "42",
        "42",
    ]
}

conditional_chain_4: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a, b) {
            var c, d;
            if (a && b ? c = a : d = b)
                console.log(c);
            else
                console.log(d);
        }
        f("", null);
        f("", true);
        f(42, null);
        f(42, true);
    }
    expect: {
        function f(a, b) {
            var c, d;
            if (a && b ? c = a : d = b)
                console.log(c);
            else
                console.log(d);
        }
        f("", null);
        f("", true);
        f(42, null);
        f(42, true);
    }
    expect_stdout: [
        "null",
        "undefined",
        "null",
        "42",
    ]
}

if_branch: {
    options = {
        merge_vars: true,
    }
    input: {
        console.log(function(a) {
            var b = "FAIL", c;
            if (a) c = b;
            return c || "PASS";
        }());
    }
    expect: {
        console.log(function(a) {
            var b = "FAIL", c;
            if (a) c = b;
            return c || "PASS";
        }());
    }
    expect_stdout: "PASS"
}

switch_branch: {
    options = {
        merge_vars: true,
    }
    input: {
        console.log(function(a) {
            var b = "FAIL", c;
            switch (a) {
              case 1:
                c = b;
                break;
            }
            return c || "PASS";
        }());
    }
    expect: {
        console.log(function(a) {
            var b = "FAIL", c;
            switch (a) {
              case 1:
                c = b;
                break;
            }
            return c || "PASS";
        }());
    }
    expect_stdout: "PASS"
}

try_branch: {
    options = {
        merge_vars: true,
    }
    input: {
        console.log(function(a) {
            var b = "FAIL", c;
            try {
                a && F();
            } catch (e) {
                c = b;
            }
            return c || "PASS";
        }());
    }
    expect: {
        console.log(function(a) {
            var b = "FAIL", c;
            try {
                a && F();
            } catch (e) {
                c = b;
            }
            return c || "PASS";
        }());
    }
    expect_stdout: "PASS"
}

read_before_assign_1: {
    options = {
        inline: true,
        merge_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var c = 0;
        c = 0;
        (function() {
            var a = console.log(++a);
            a;
        })();
        c;
    }
    expect: {
        var c = 0;
        var a;
        c = 0,
        a = console.log(++a);
    }
    expect_stdout: "NaN"
}

read_before_assign_2: {
    options = {
        dead_code: true,
        loops: true,
        merge_vars: true,
    }
    input: {
        console.log(function(a, a) {
            while (b)
                return "FAIL";
            var b = 1;
            return "PASS";
        }(0, []));
    }
    expect: {
        console.log(function(a, a) {
            if (b)
                return "FAIL";
            var b = 1;
            return "PASS";
        }(0, []));
    }
    expect_stdout: "PASS"
}

collapse_vars_1: {
    options = {
        collapse_vars: true,
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = a && a.p;
        var b = "PASS";
        var b = b && console.log(b);
    }
    expect: {
        var a = a && a.p;
        var a;
        var a = (a = "PASS") && console.log(a);
    }
    expect_stdout: "PASS"
}

collapse_vars_2: {
    options = {
        collapse_vars: true,
        merge_vars: true,
    }
    input: {
        "use strict";
        var log = console.log;
        (function g(a) {
            var b = a;
            var c = Math.random();
            var c = b;
            log(c);
            return c;
        })("PASS");
    }
    expect: {
        "use strict";
        var log = console.log;
        (function g(a) {
            var a = a;
            var c = Math.random();
            var c;
            log(c = a);
            return c;
        })("PASS");
    }
    expect_stdout: "PASS"
}

not_redefined: {
    options = {
        inline: true,
        join_vars: true,
        merge_vars: true,
        reduce_vars: true,
        unused: true,
        varify: true,
    }
    input: {
        var log = console.log;
        (function() {
            return f("PASS");
            function f(a) {
                const b = a;
                const c = log(b);
                const d = log;
                c && log(d);
            }
        })();
    }
    expect: {
        var log = console.log;
        (function() {
            return a = "PASS",
                a = log(a),
                d = log,
                void (a && log(d));
            var a, d;
        })();
    }
    expect_stdout: "PASS"
}

issue_4103: {
    options = {
        merge_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        function f(a) {
            console.log(a);
        }
        var b = 0;
        var c = f(b++ + (c %= 1 >> console.log(c = 0)));
        b;
    }
    expect: {
        function f(a) {
            console.log(a);
        }
        var b = 0;
        var c = f(b++ + (c %= 1 >> console.log(c = 0)));
    }
    expect_stdout: [
        "0",
        "NaN",
    ]
}

issue_4107_1: {
    options = {
        keep_fargs: false,
        merge_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            function f(b, b, c) {
                var d = 1 && a, a = console || c;
                console.log(typeof a);
            }
            f();
        })();
        console.log(typeof a);
    }
    expect: {
        (function() {
            (function(c) {
                c = console || c;
                console.log(typeof c);
            })();
        })();
        console.log(typeof a);
    }
    expect_stdout: [
        "object",
        "undefined",
    ]
}

issue_4107_2: {
    options = {
        keep_fargs: false,
        merge_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            function f(b, b, a) {
                var d = 1 && c, c = console || a;
                console.log(typeof c);
            }
            f();
        })();
        console.log(typeof a);
    }
    expect: {
        (function() {
            (function(a) {
                a = console || a;
                console.log(typeof a);
            })();
        })();
        console.log(typeof a);
    }
    expect_stdout: [
        "object",
        "undefined",
    ]
}

issue_4109: {
    options = {
        ie: true,
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = "foo";
        try {
            throw "bar";
        } catch (e) {
            console.log(e);
        } finally {
            var o = a;
            for (var k in o);
            (function() {
                a++;
            });
        }
        console.log(a);
    }
    expect: {
        var a = "foo";
        try {
            throw "bar";
        } catch (e) {
            console.log(e);
        } finally {
            var o = a;
            for (var k in o);
            (function() {
                a++;
            });
        }
        console.log(a);
    }
    expect_stdout: [
        "bar",
        "foo",
    ]
}

issue_4110: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        while (a)
            var c;
        var b, a = c += b = a;
        console.log(b);
    }
    expect: {
        while (a)
            var c;
        var b, a = c += b = a;
        console.log(b);
    }
    expect_stdout: "undefined"
}

issue_4111: {
    options = {
        join_vars: true,
        loops: true,
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        if (a)
            a = 0;
        else
            for (var b = 0; --b && ++a < 2;) {
                var o = console, k;
                for (k in o);
            }
        console.log(a);
    }
    expect: {
        var a = 0;
        if (a)
            a = 0;
        else
            for (var b = 0; --b && ++a < 2;) {
                var o = console, k;
                for (k in o);
            }
        console.log(a);
    }
    expect_stdout: "2"
}

issue_4112: {
    options = {
        functions: true,
        merge_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function() {
            try {
                throw 42;
            } catch (e) {
                var o = e;
                for (e in o);
                var a = function() {};
                console.log(typeof a);
                return a;
            }
        }());
    }
    expect: {
        console.log(typeof function() {
            try {
                throw 42;
            } catch (e) {
                var o = e;
                for (e in o);
                function a() {}
                console.log(typeof a);
                return a;
            }
        }());
    }
    expect_stdout: [
        "function",
        "function",
    ]
}

issue_4115: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        L: {
            var o = typeof console;
            for (var k in o)
                break L;
            var a = 0;
        }
        console.log(typeof a);
    }
    expect: {
        L: {
            var o = typeof console;
            for (var k in o)
                break L;
            var a = 0;
        }
        console.log(typeof a);
    }
    expect_stdout: "undefined"
}

cross_branch_1_1: {
    options = {
        merge_vars: true,
    }
    input: {
        var a;
        function f() {
            var x, y;
            if (a)
                x = "foo";
            console.log(x);
            y = "bar";
            console.log(y);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect: {
        var a;
        function f() {
            var x, x;
            if (a)
                x = "foo";
            console.log(x);
            x = "bar";
            console.log(x);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_1_2: {
    options = {
        merge_vars: true,
    }
    input: {
        var a;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                console.log(x);
            }
            y = "bar";
            console.log(y);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect: {
        var a;
        function f() {
            var x, x;
            if (a) {
                x = "foo";
                console.log(x);
            }
            x = "bar";
            console.log(x);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect_stdout: [
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_1_3: {
    options = {
        merge_vars: true,
    }
    input: {
        var a;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                console.log(x);
                y = "bar";
            }
            console.log(y);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect: {
        var a;
        function f() {
            var x, x;
            if (a) {
                x = "foo";
                console.log(x);
                x = "bar";
            }
            console.log(x);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_1_4: {
    options = {
        merge_vars: true,
    }
    input: {
        var a;
        function f() {
            var x, y;
            x = "foo";
            if (a)
                console.log(x);
            y = "bar";
            console.log(y);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect: {
        var a;
        function f() {
            var x, x;
            x = "foo";
            if (a)
                console.log(x);
            x = "bar";
            console.log(x);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect_stdout: [
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_1_5: {
    options = {
        merge_vars: true,
    }
    input: {
        var a;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                y = "bar";
            }
            console.log(y);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect: {
        var a;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                y = "bar";
            }
            console.log(y);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_1_6: {
    options = {
        merge_vars: true,
    }
    input: {
        var a;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                y = "bar";
                console.log(y);
            }
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect: {
        var a;
        function f() {
            var x, x;
            x = "foo";
            if (a) {
                console.log(x);
                x = "bar";
                console.log(x);
            }
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

cross_branch_1_7: {
    options = {
        merge_vars: true,
    }
    input: {
        var a;
        function f() {
            var x, y;
            x = "foo";
            console.log(x);
            if (a)
                y = "bar";
            console.log(y);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect: {
        var a;
        function f() {
            var x, y;
            x = "foo";
            console.log(x);
            if (a)
                y = "bar";
            console.log(y);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_1_8: {
    options = {
        merge_vars: true,
    }
    input: {
        var a;
        function f() {
            var x, y;
            x = "foo";
            console.log(x);
            if (a) {
                y = "bar";
                console.log(y);
            }
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect: {
        var a;
        function f() {
            var x, x;
            x = "foo";
            console.log(x);
            if (a) {
                x = "bar";
                console.log(x);
            }
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "foo",
        "bar",
    ]
}

cross_branch_1_9: {
    options = {
        merge_vars: true,
    }
    input: {
        var a;
        function f() {
            var x, y;
            x = "foo";
            console.log(x);
            y = "bar";
            if (a)
                console.log(y);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect: {
        var a;
        function f() {
            var x, x;
            x = "foo";
            console.log(x);
            x = "bar";
            if (a)
                console.log(x);
        }
        a = 0;
        f();
        a = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "foo",
        "bar",
    ]
}

cross_branch_2a_1: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                if (b)
                    x = "foo";
                console.log(x);
            }
            y = "bar";
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a) {
                if (b)
                    x = "foo";
                console.log(x);
            }
            x = "bar";
            console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "bar",
        "undefined",
        "bar",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2a_2: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                if (b)
                    console.log(x);
            }
            y = "bar";
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a) {
                x = "foo";
                if (b)
                    console.log(x);
            }
            x = "bar";
            console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "bar",
        "bar",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2a_3: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                if (b)
                    x = "foo";
                console.log(x);
                y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a) {
                if (b)
                    x = "foo";
                console.log(x);
                x = "bar";
            }
            console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "undefined",
        "bar",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2a_4: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                if (b) {
                    x = "foo";
                    console.log(x);
                }
                y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a) {
                if (b) {
                    x = "foo";
                    console.log(x);
                }
                x = "bar";
            }
            console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "bar",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2a_5: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                if (b)
                    console.log(x);
                y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a) {
                x = "foo";
                if (b)
                    console.log(x);
                x = "bar";
            }
            console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "bar",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2a_6: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                if (b) {
                    console.log(x);
                    y = "bar";
                }
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                if (b) {
                    console.log(x);
                    y = "bar";
                }
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "undefined",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2a_7: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                console.log(x);
                if (b)
                    y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                console.log(x);
                if (b)
                    y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "undefined",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2a_8: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                if (b)
                    console.log(x);
                y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                if (b)
                    console.log(x);
                y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "bar",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2a_9: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                if (b)
                    y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                if (b)
                    y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "undefined",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2a_10: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                if (b)
                    console.log(x);
                y = "bar";
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            x = "foo";
            if (a) {
                if (b)
                    console.log(x);
                x = "bar";
                console.log(x);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2a_11: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                if (b) {
                    console.log(x);
                    y = "bar";
                }
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                if (b) {
                    console.log(x);
                    y = "bar";
                }
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2a_12: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                if (b)
                    y = "bar";
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                if (b)
                    y = "bar";
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2a_13: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                if (b) {
                    y = "bar";
                    console.log(y);
                }
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            x = "foo";
            if (a) {
                console.log(x);
                if (b) {
                    x = "bar";
                    console.log(x);
                }
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "foo",
        "bar",
    ]
}

cross_branch_2a_14: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                y = "bar";
                if (b)
                    console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            x = "foo";
            if (a) {
                console.log(x);
                x = "bar";
                if (b)
                    console.log(x);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "foo",
        "bar",
    ]
}

cross_branch_2a_15: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            console.log(x);
            if (a) {
                if (b)
                    y = "bar";
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            console.log(x);
            if (a) {
                if (b)
                    y = "bar";
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "foo",
        "undefined",
        "foo",
        "foo",
        "bar",
    ]
}

cross_branch_2a_16: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            console.log(x);
            if (a) {
                y = "bar";
                if (b)
                    console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            x = "foo";
            console.log(x);
            if (a) {
                x = "bar";
                if (b)
                    console.log(x);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "foo",
        "foo",
        "foo",
        "bar",
    ]
}

cross_branch_2b_1: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a)
                x = "foo";
            if (b)
                console.log(x);
            y = "bar";
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a)
                x = "foo";
            if (b)
                console.log(x);
            x = "bar";
            console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "bar",
        "bar",
        "undefined",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_2: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a)
                x = "foo";
            if (b) {
                console.log(x);
                y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            if (a)
                x = "foo";
            if (b) {
                console.log(x);
                y = "bar";
            }
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "undefined",
        "undefined",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_3: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a)
                x = "foo";
            if (b) {
                console.log(x);
                y = "bar";
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a)
                x = "foo";
            if (b) {
                console.log(x);
                x = "bar";
                console.log(x);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_4: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a)
                x = "foo";
            console.log(x);
            if (b)
                y = "bar";
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            if (a)
                x = "foo";
            console.log(x);
            if (b)
                y = "bar";
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "undefined",
        "foo",
        "undefined",
        "undefined",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_5: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a)
                x = "foo";
            console.log(x);
            if (b) {
                y = "bar";
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a)
                x = "foo";
            console.log(x);
            if (b) {
                x = "bar";
                console.log(x);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "undefined",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_6: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                console.log(x);
            }
            if (b)
                y = "bar";
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                console.log(x);
            }
            if (b)
                y = "bar";
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "undefined",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_7: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                console.log(x);
            }
            if (b) {
                y = "bar";
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a) {
                x = "foo";
                console.log(x);
            }
            if (b) {
                x = "bar";
                console.log(x);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_8: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a)
                x = "foo";
            console.log(x);
            y = "bar";
            if (b)
                console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a)
                x = "foo";
            console.log(x);
            x = "bar";
            if (b)
                console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "undefined",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_9: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                console.log(x);
            }
            y = "bar";
            if (b)
                console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a) {
                x = "foo";
                console.log(x);
            }
            x = "bar";
            if (b)
                console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_10: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            if (a) {
                x = "foo";
                console.log(x);
                y = "bar";
            }
            if (b)
                console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            if (a) {
                x = "foo";
                console.log(x);
                x = "bar";
            }
            if (b)
                console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2b_11: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a)
                console.log(x);
            if (b)
                y = "bar";
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a)
                console.log(x);
            if (b)
                y = "bar";
            console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "undefined",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_12: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a)
                console.log(x);
            if (b) {
                y = "bar";
                console.log(y);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            x = "foo";
            if (a)
                console.log(x);
            if (b) {
                x = "bar";
                console.log(x);
            }
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_13: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a)
                console.log(x);
            y = "bar";
            if (b)
                console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, x;
            x = "foo";
            if (a)
                console.log(x);
            x = "bar";
            if (b)
                console.log(x);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
        "foo",
        "bar",
    ]
}

cross_branch_2b_14: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                y = "bar";
            }
            if (b)
                console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            if (a) {
                console.log(x);
                y = "bar";
            }
            if (b)
                console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "undefined",
        "foo",
        "bar",
    ]
}

cross_branch_2b_15: {
    options = {
        merge_vars: true,
    }
    input: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            console.log(x);
            if (a)
                y = "bar";
            if (b)
                console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect: {
        var a, b;
        function f() {
            var x, y;
            x = "foo";
            console.log(x);
            if (a)
                y = "bar";
            if (b)
                console.log(y);
        }
        a = 0, b = 0;
        f();
        a = 1, b = 0;
        f();
        a = 0, b = 1;
        f();
        a = 1, b = 1;
        f();
    }
    expect_stdout: [
        "foo",
        "foo",
        "foo",
        "undefined",
        "foo",
        "bar",
    ]
}

issue_4126_1: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a) {
            try {
                console.log("PASS");
            } catch (e) {
                var b = a;
            } finally {
                var c = b;
            }
            console.log(c);
        }
        f("FAIL");
    }
    expect: {
        function f(a) {
            try {
                console.log("PASS");
            } catch (e) {
                var b = a;
            } finally {
                var a = b;
            }
            console.log(a);
        }
        f("FAIL");
    }
    expect_stdout: [
        "PASS",
        "undefined",
    ]
}

issue_4126_2: {
    options = {
        inline: true,
        merge_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        try {
            var a = function() {
                var b = 0;
                function f() {
                    b;
                }
                THROW(b);
            }();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        try {
            var a = (b = 0, void THROW(b));
        } catch (e) {
            console.log(a);
        }
        function f() {}
        var b;
    }
    expect_stdout: "undefined"
}

issue_4130: {
    options = {
        merge_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = 2;
        while (a)
            try {
                console.log(a);
            } catch (e) {
                var b = 0;
            } finally {
                b && console.log("FAIL");
                var c = --a;
                for (var k in c)
                    c;
            }
    }
    expect: {
        var a = 2;
        while (a)
            try {
                console.log(a);
            } catch (e) {
                var b = 0;
            } finally {
                b && console.log("FAIL");
                var c = --a;
                for (var k in c);
            }
    }
    expect_stdout: [
        "2",
        "1",
    ]
}

issue_4135: {
    options = {
        evaluate: true,
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0, b = 0;
        --b;
        a++;
        if (!a)
            var c = function() {
                var d = 0;
                function f() {
                    d && d.p;
                }
                f();
                this;
            }(a++);
        console.log(a, b, c);
    }
    expect: {
        var a = 0;
        0;
        a++;
        if (!a)
            var c = void a++;
        console.log(a, -1, c);
    }
    expect_stdout: "1 -1 undefined"
}

issue_4139: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        try {
            console.log;
        } catch (e) {
            var a, arguments = 0;
        } finally {
            a = typeof arguments;
            console.log(a);
        }
    }
    expect: {
        try {
            console.log;
        } catch (e) {
            var a, arguments = 0;
        } finally {
            a = typeof arguments;
            console.log(a);
        }
    }
    expect_stdout: "object"
}

lambda_reuse: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a, b, f = function() {
            console.log(a);
        };
        f();
        a = "PASS";
        b = "FAIL";
        f();
        if (console.log(typeof b))
            console.log(b);
    }
    expect: {
        var a, b, f = function() {
            console.log(a);
        };
        f();
        a = "PASS";
        b = "FAIL";
        f();
        if (console.log(typeof b))
            console.log(b);
    }
    expect_stdout: [
        "undefined",
        "PASS",
        "string",
    ]
}

conditional_write: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = "FAIL", b;
        if (console)
            a = "PASS";
        b = [a, 42].join();
        console.log(b);
    }
    expect: {
        var a = "FAIL", a;
        if (console)
            a = "PASS";
        a = [a, 42].join();
        console.log(a);
    }
    expect_stdout: "PASS,42"
}

issue_4155: {
    options = {
        inline: true,
        merge_vars: true,
    }
    input: {
        (function() {
            try {
                throw "PASS";
            } catch (e) {
                var a;
                (function() {
                    console.log(e, a);
                })(a = NaN);
            }
            var e = function() {};
            e && console.log(typeof e);
        })();
    }
    expect: {
        (function() {
            try {
                throw "PASS";
            } catch (e) {
                var a;
                a = NaN,
                void console.log(e, a);
            }
            var e = function() {};
            e && console.log(typeof e);
        })();
    }
    expect_stdout: [
        "PASS NaN",
        "function",
    ]
}

issue_4157_1: {
    options = {
        dead_code: true,
        loops: true,
        merge_vars: true,
    }
    input: {
        (function() {
            try {
                for (var a = "FAIL"; a; a++)
                    return;
                var b = 0;
            } finally {
                console.log(b);
            }
        })();
    }
    expect: {
        (function() {
            try {
                var a = "FAIL";
                if (a)
                    return;
                var b = 0;
            } finally {
                console.log(b);
            }
        })();
    }
    expect_stdout: "undefined"
}

issue_4157_2: {
    options = {
        dead_code: true,
        loops: true,
        merge_vars: true,
    }
    input: {
        (function() {
            try {
                throw "FAIL";
            } catch (e) {
                for (var a = e; a; a++)
                    return;
                var b = 0;
            } finally {
                console.log(b);
            }
        })();
    }
    expect: {
        (function() {
            try {
                throw "FAIL";
            } catch (e) {
                var a = e;
                if (a)
                    return;
                var b = 0;
            } finally {
                console.log(b);
            }
        })();
    }
    expect_stdout: "undefined"
}

issue_4168: {
    options = {
        merge_vars: true,
    }
    input: {
        var o = {
            f: function(a, b, c) {
                var d = a.d;
                var e = b.e;
                var f = c.f;
                this.g(arguments);
                if (d)
                    console.log(e, f);
            },
            g: function(args) {
                console.log(args[0], args[1], args[2]);
            },
        };
        o.f("PASS", true, 42);
    }
    expect: {
        var o = {
            f: function(a, b, c) {
                var d = a.d;
                var e = b.e;
                var f = c.f;
                this.g(arguments);
                if (d)
                    console.log(e, f);
            },
            g: function(args) {
                console.log(args[0], args[1], args[2]);
            },
        };
        o.f("PASS", true, 42);
    }
    expect_stdout: "PASS true 42"
}

issue_4168_use_strict: {
    options = {
        merge_vars: true,
    }
    input: {
        "use strict";
        var o = {
            f: function(a, b, c) {
                var d = a.d;
                var e = b.e;
                var f = c.f;
                this.g(arguments);
                if (d)
                    console.log(e, f);
            },
            g: function(args) {
                console.log(args[0], args[1], args[2]);
            },
        };
        o.f("PASS", true, 42);
    }
    expect: {
        "use strict";
        var o = {
            f: function(a, b, c) {
                var a = a.d;
                var b = b.e;
                var c = c.f;
                this.g(arguments);
                if (a)
                    console.log(b, c);
            },
            g: function(args) {
                console.log(args[0], args[1], args[2]);
            },
        };
        o.f("PASS", true, 42);
    }
    expect_stdout: "PASS true 42"
}

issue_4237_1: {
    options = {
        merge_vars: true,
    }
    input: {
        console.log(function(a) {
            do {
                var b = a++;
                if (b)
                    return "FAIL";
                continue;
                var c = 42;
            } while ("undefined" != typeof c);
            return "PASS";
        }(0));
    }
    expect: {
        console.log(function(a) {
            do {
                var b = a++;
                if (b)
                    return "FAIL";
                continue;
                var c = 42;
            } while ("undefined" != typeof c);
            return "PASS";
        }(0));
    }
    expect_stdout: "PASS"
}

issue_4237_2: {
    options = {
        dead_code: true,
        evaluate: true,
        loops: true,
        merge_vars: true,
        switches: true,
    }
    input: {
        console.log(function(a) {
            do {
                switch (0) {
                  case 0:
                    var b = a++;
                  default:
                    while (b)
                        return "FAIL";
                }
                try {
                    var c = 0;
                } finally {
                    continue;
                }
                var d = 0;
            } while ("undefined" != typeof d);
            return "PASS";
        }(0));
    }
    expect: {
        console.log(function(a) {
            do {
                switch (0) {
                  default:
                    var b = a++;
                    if (b)
                        return "FAIL";
                }
                try {
                    var c = 0;
                } finally {
                    continue;
                }
                var d = 0;
            } while ("undefined" != typeof d);
            return "PASS";
        }(0));
    }
    expect_stdout: "PASS"
}

issue_4253: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        switch (0) {
          default:
            var a = "FAIL";
            a = a && a;
            try {
                break;
            } catch (e) {}
            var b = 42;
        }
        console.log(b);
    }
    expect: {
        switch (0) {
          default:
            var a = "FAIL";
            a = a && a;
            try {
                break;
            } catch (e) {}
            var b = 42;
        }
        console.log(b);
    }
    expect_stdout: "undefined"
}

issue_4255: {
    options = {
        dead_code: true,
        loops: true,
        merge_vars: true,
        toplevel: true,
    }
    input: {
        L: for (var a = 2; --a;)
            for (var b = 0; console.log(b); --b)
                break L;
    }
    expect: {
        L: for (var a = 2; --a;) {
            var b = 0;
            if (console.log(b))
                break L;
        }
    }
    expect_stdout: "0"
}

issue_4257: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        for (var i = 0; i < 2; i++)
            switch (--a) {
              case 0:
                var b = 0;
                break;
              case 0:
              default:
                var c = 1 + (0 | (b && A));
                console.log(c);
            }
    }
    expect: {
        var a = 0;
        for (var i = 0; i < 2; i++)
            switch (--a) {
              case 0:
                var b = 0;
                break;
              case 0:
              default:
                var c = 1 + (0 | (b && A));
                console.log(c);
            }
    }
    expect_stdout: [
        "1",
        "1",
    ]
}

issue_4628: {
    options = {
        merge_vars: true,
    }
    input: {
        (function() {
            try {
                console;
            } finally {
                var b = a;
            }
            for (var a in "foo");
            console.log(b);
        })();
    }
    expect: {
        (function() {
            try {
                console;
            } finally {
                var b = a;
            }
            for (var a in "foo");
            console.log(b);
        })();
    }
    expect_stdout: "undefined"
}

issue_4653: {
    options = {
        evaluate: true,
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1, b;
        function f(c, d) {
            c || console.log(d);
        }
        f(a++ + (b = b), b |= console.log(a));
    }
    expect: {
        var b, a = 1;
        (function(c, d) {
            c || console.log(d);
        })(+a + (b = b), b |= console.log(2));
    }
    expect_stdout: [
        "2",
        "0",
    ]
}

issue_4759: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var i = 2, a = 1, b, c, d;
        while (i--) {
            try {
                if (1 != b) {
                    d = [];
                    null.p;
                    c = d;
                } else {
                    b = 0;
                    a = c;
                }
            } catch (e) {}
            b = a;
        }
        console.log(a);
    }
    expect: {
        var i = 2, a = 1, b, c, d;
        while (i--) {
            try {
                if (1 != b) {
                    d = [];
                    null.p;
                    c = d;
                } else {
                    b = 0;
                    a = c;
                }
            } catch (e) {}
            b = a;
        }
        console.log(a);
    }
    expect_stdout: "undefined"
}

issue_4761: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = "FAIL", b;
        try {
            !a && --a && (b = 0)[console] || console.log(b);
        } catch (e) {}
    }
    expect: {
        var a = "FAIL", b;
        try {
            !a && --a && (b = 0)[console] || console.log(b);
        } catch (e) {}
    }
    expect_stdout: "undefined"
}

issue_4956_1: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a, b;
        function f(c) {
            switch (c) {
              case 0:
                a = { p: 42 };

              case 1:
                b = a.p;
                console.log(b);
            }
        }
        f(0);
        f(1);
    }
    expect: {
        var a, b;
        function f(c) {
            switch (c) {
              case 0:
                a = { p: 42 };

              case 1:
                b = a.p;
                console.log(b);
            }
        }
        f(0);
        f(1);
    }
    expect_stdout: [
        "42",
        "42",
    ]
}

issue_4956_2: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a, b;
        function f(c) {
            if (0 == c) {
                console;
                a = { p: 42 };
            }
            b = a.p;
            if (1 == c)
                console.log(b);
        }
        f(0);
        f(1);
    }
    expect: {
        var a, b;
        function f(c) {
            if (0 == c) {
                console;
                a = { p: 42 };
            }
            b = a.p;
            if (1 == c)
                console.log(b);
        }
        f(0);
        f(1);
    }
    expect_stdout: "42"
}

issue_5182: {
    options = {
        arrows: true,
        collapse_vars: true,
        evaluate: true,
        hoist_props: true,
        inline: true,
        merge_vars: true,
        passes: 4,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            var con = console;
        } catch (x) {}
        global.log = con.log;
        var jump = function(x) {
            console.log("JUMP:", x * 10);
            return x + x;
        };
        var jump2 = jump;
        var run = function(x) {
            console.log("RUN:", x * -10);
            return x * x;
        };
        var run2 = run;
        var bar = (x, y) => {
            console.log("BAR:", x + y);
            return x - y;
        };
        var bar2 = bar;
        var obj = {
            foo: bar2,
            go: run2,
            not_used: jump2,
        };
        console.log(obj.foo(1, 2), global.log("PASS"));
    }
    expect: {
        try {
            var con = console;
        } catch (x) {}
        global.log = con.log,
        console.log((console.log("BAR:", 3), -1), global.log("PASS"));
    }
    expect_stdout: [
        "BAR: 3",
        "PASS",
        "-1 undefined",
    ]
    node_version: ">=4"
}

issue_5420: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        do {
            var a = "FAIL 1";
            a && a.p;
            a = "FAIL 2";
            try {
                continue;
            } catch (e) {}
            var b = "FAIL 3";
        } while (console.log(b || "PASS"));
    }
    expect: {
        do {
            var a = "FAIL 1";
            a && a.p;
            a = "FAIL 2";
            try {
                continue;
            } catch (e) {}
            var b = "FAIL 3";
        } while (console.log(b || "PASS"));
    }
    expect_stdout: "PASS"
}

issue_5451: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        A = 1;
        var a = 1, b;
        console.log(function f() {
            return a-- && f(b = A, b);
        }());
    }
    expect: {
        A = 1;
        var a = 1, b;
        console.log(function f() {
            return a-- && f(b = A, b);
        }());
    }
    expect_stdout: "0"
}

issue_5471_1: {
    options = {
        conditionals: true,
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL 1";
        function f(b, c) {
            function g() {
                if (console)
                    return 42;
                else
                    c = "FAIL 2";
            }
            var d = g();
            console.log(c || "PASS");
            var e = function h() {
                while (b && e);
            }();
        }
        f(a++) && a;
    }
    expect: {
        var a = "FAIL 1";
        var b, c, e;
        b = +a,
        function() {
            if (console)
                return;
            c = "FAIL 2";
        }(),
        console.log(c || "PASS"),
        e = function() {
            while (b && e);
        }();
    }
    expect_stdout: "PASS"
}

issue_5471_2: {
    options = {
        conditionals: true,
        evaluate: true,
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        sequences: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL 1";
        function f(b, c) {
            function g() {
                if (console)
                    return 42;
                else
                    c = "FAIL 2";
            }
            var d = g();
            console.log(c || "PASS");
            var e = function h() {
                while (b && e);
            }();
        }
        f(a++) && a;
    }
    expect: {
        var a = "FAIL 1";
        var b, c, e;
        b = +a,
        function() {
            if (console)
                return;
            c = "FAIL 2";
        }(),
        console.log(c || "PASS"),
        e = function() {
            while (b && e);
        }(),
        void 0;
    }
    expect_stdout: "PASS"
}

issue_5714: {
    options = {
        inline: true,
        join_vars: true,
        loops: true,
        merge_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        console.log(function() {
            var i = 1;
            while (i--) {
                var a = function f(b) {
                    console.log(b);
                    var c = function(d) {
                        console.log(typeof d);
                    }(console);
                }();
                var e = 42;
            }
            return e;
        }());
    }
    expect: {
        "use strict";
        console.log(function() {
            for (var i = 1; i--;) {
                var b = void 0;
                console.log(b);
                b = console,
                console.log(typeof b);
                var e = 42;
            }
            return e;
        }());
    }
    expect_stdout: [
        "undefined",
        "object",
        "42",
    ]
}

issue_5770_1: {
    options = {
        dead_code: true,
        loops: true,
        merge_vars: true,
        toplevel: true,
    }
    input: {
        L: do {
            if (console)
                for (var a = "FAIL 1"; a; a--)
                    continue L;
            var b = "FAIL 2";
        } while (console.log(b || "PASS"));
    }
    expect: {
        L: do {
            if (console) {
                var a = "FAIL 1";
                if (a)
                    continue L;
            }
            var b = "FAIL 2";
        } while (console.log(b || "PASS"));
    }
    expect_stdout: "PASS"
}

issue_5770_2: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
        loops: true,
        merge_vars: true,
        toplevel: true,
    }
    input: {
        L: do {
            for (var a = "FAIL 1"; a; a--)
                continue L;
            var b = "FAIL 2";
        } while (console.log(b || "PASS"));
    }
    expect: {
        L: do {
            var a = "FAIL 1";
            var b;
        } while (a || (b = "FAIL 2"), console.log(b || "PASS"));
    }
    expect_stdout: "PASS"
}

issue_5772_1: {
    options = {
        dead_code: true,
        merge_vars: true,
        loops: true,
    }
    input: {
        (function(a) {
            while (--a)
                return;
            var b = console.log("foo") && (c = 42) ? 0 : console.log(c);
            var c = b;
        })();
    }
    expect: {
        (function(a) {
            if (--a)
                return;
            var a = console.log("foo") && (c = 42) ? 0 : console.log(c);
            var c = a;
        })();
    }
    expect_stdout: [
        "foo",
        "undefined",
    ]
}

issue_5772_2: {
    options = {
        dead_code: true,
        merge_vars: true,
        loops: true,
    }
    input: {
        (function(a) {
            while (--a)
                return;
            var b;
            var c = console.log("foo") && (b = 1) ? 2 : 3;
            console.log(b, c);
        })();
    }
    expect: {
        (function(a) {
            if (--a)
                return;
            var b;
            var a = console.log("foo") && (b = 1) ? 2 : 3;
            console.log(b, a);
        })();
    }
    expect_stdout: [
        "foo",
        "undefined 3",
    ]
}
