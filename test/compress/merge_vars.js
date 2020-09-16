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
        keep_fargs: "strict",
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
                var a = console || c;
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
                console.log;
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
                console.log;
                return a;
            }
        }());
    }
    expect_stdout: "function"
}
