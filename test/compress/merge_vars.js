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
