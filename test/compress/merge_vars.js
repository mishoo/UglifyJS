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
        function f(c) {
            var c;
            console.log(c);
            c = "bar";
            console.log(c);
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
        var d = "foo";
        console.log(d);
        function f(c) {
            var c;
            console.log(c);
            c = "bar";
            console.log(c);
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
        var d = "foo";
        console.log(d);
        for (var c, i = 0; i < 1; i++) {
            var c = "bar";
            console.log(c);
            c = "baz";
            console.log(c);
        }
        var d = "moo";
        console.log(d);
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

issue_4107: {
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
        ie8: true,
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
                var a = e;
                for (e in a);
                a = function() {};
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
            var y, y;
            if (a)
                y = "foo";
            console.log(y);
            y = "bar";
            console.log(y);
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
            var y, y;
            if (a) {
                y = "foo";
                console.log(y);
            }
            y = "bar";
            console.log(y);
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
            var y, y;
            if (a) {
                y = "foo";
                console.log(y);
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
            var y, y;
            y = "foo";
            if (a)
                console.log(y);
            y = "bar";
            console.log(y);
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
            var y, y;
            y = "foo";
            if (a) {
                console.log(y);
                y = "bar";
                console.log(y);
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
            var y, y;
            y = "foo";
            console.log(y);
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
            var y, y;
            y = "foo";
            console.log(y);
            y = "bar";
            if (a)
                console.log(y);
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
            var y, y;
            if (a) {
                if (b)
                    y = "foo";
                console.log(y);
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
            var y, y;
            if (a) {
                y = "foo";
                if (b)
                    console.log(y);
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
            var y, y;
            if (a) {
                if (b)
                    y = "foo";
                console.log(y);
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
            var y, y;
            if (a) {
                if (b) {
                    y = "foo";
                    console.log(y);
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
            var y, y;
            if (a) {
                y = "foo";
                if (b)
                    console.log(y);
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
            var y, y;
            y = "foo";
            if (a) {
                if (b)
                    console.log(y);
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
            var y, y;
            y = "foo";
            if (a) {
                console.log(y);
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
            var y, y;
            y = "foo";
            if (a) {
                console.log(y);
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
            var y, y;
            y = "foo";
            console.log(y);
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
            var y, y;
            if (a)
                y = "foo";
            if (b)
                console.log(y);
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
            var y, y;
            if (a)
                y = "foo";
            if (b) {
                console.log(y);
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
            var y, y;
            if (a)
                y = "foo";
            console.log(y);
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
            var y, y;
            if (a) {
                y = "foo";
                console.log(y);
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
            var y, y;
            if (a)
                y = "foo";
            console.log(y);
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
            var y, y;
            if (a) {
                y = "foo";
                console.log(y);
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
            var y, y;
            if (a) {
                y = "foo";
                console.log(y);
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
            var y, y;
            y = "foo";
            if (a)
                console.log(y);
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
            var y, y;
            y = "foo";
            if (a)
                console.log(y);
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
                var c = b;
            }
            console.log(c);
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
            c = (a++, c = 0, void (c && c.p));
        var c;
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
        var b = "FAIL", b;
        if (console)
            b = "PASS";
        b = [b, 42].join();
        console.log(b);
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
            f: function(d, e, f) {
                var d = d.d;
                var e = e.e;
                var f = f.f;
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
                  case 0:
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
