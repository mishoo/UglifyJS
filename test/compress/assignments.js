op_equals_left_local_var: {
    options = {
        assignments: true,
        evaluate: true,
    }
    input: {
        var x;

        x = x +   3;
        x = x -   3;
        x = x /   3;
        x = x *   3;
        x = x >>  3;
        x = x <<  3;
        x = x >>> 3;
        x = x |   3;
        x = x ^   3;
        x = x %   3;
        x = x &   3;

        x = x +   g();
        x = x -   g();
        x = x /   g();
        x = x *   g();
        x = x >>  g();
        x = x <<  g();
        x = x >>> g();
        x = x |   g();
        x = x ^   g();
        x = x %   g();
        x = x &   g();
    }
    expect: {
        var x;

        x   += 3;
        x   -= 3;
        x   /= 3;
        x   *= 3;
        x  >>= 3;
        x  <<= 3;
        x >>>= 3;
        x   |= 3;
        x   ^= 3;
        x   %= 3;
        x   &= 3;

        x   += g();
        x   -= g();
        x   /= g();
        x   *= g();
        x  >>= g();
        x  <<= g();
        x >>>= g();
        x   |= g();
        x   ^= g();
        x   %= g();
        x   &= g();
    }
}

op_equals_right_local_var: {
    options = {
        assignments: true,
        evaluate: true,
    }
    input: {
        var x;

        x = (x -= 2) ^ x;

        x = 3 +   x;
        x = 3 -   x;
        x = 3 /   x;
        x = 3 *   x;
        x = 3 >>  x;
        x = 3 <<  x;
        x = 3 >>> x;
        x = 3 |   x;
        x = 3 ^   x;
        x = 3 %   x;
        x = 3 &   x;

        x = g() +   x;
        x = g() -   x;
        x = g() /   x;
        x = g() *   x;
        x = g() >>  x;
        x = g() <<  x;
        x = g() >>> x;
        x = g() |   x;
        x = g() ^   x;
        x = g() %   x;
        x = g() &   x;
    }
    expect: {
        var x;

        x = (x -= 2) ^ x;

        x = 3 + x;
        x = 3 - x;
        x = 3 / x;
        x *= 3;
        x = 3 >> x;
        x = 3 << x;
        x = 3 >>> x;
        x |= 3;
        x ^= 3;
        x = 3 % x;
        x &= 3;

        x = g() +   x;
        x = g() -   x;
        x = g() /   x;
        x = g() *   x;
        x = g() >>  x;
        x = g() <<  x;
        x = g() >>> x;
        x = g() |   x;
        x = g() ^   x;
        x = g() %   x;
        x = g() &   x;
    }
}
op_equals_left_global_var: {
    options = {
        assignments: true,
        evaluate: true,
    }
    input: {
        x = x +   3;
        x = x -   3;
        x = x /   3;
        x = x *   3;
        x = x >>  3;
        x = x <<  3;
        x = x >>> 3;
        x = x |   3;
        x = x ^   3;
        x = x %   3;
        x = x &   3;

        x = x +   g();
        x = x -   g();
        x = x /   g();
        x = x *   g();
        x = x >>  g();
        x = x <<  g();
        x = x >>> g();
        x = x |   g();
        x = x ^   g();
        x = x %   g();
        x = x &   g();
    }
    expect: {
        x   += 3;
        x   -= 3;
        x   /= 3;
        x   *= 3;
        x  >>= 3;
        x  <<= 3;
        x >>>= 3;
        x   |= 3;
        x   ^= 3;
        x   %= 3;
        x   &= 3;

        x   += g();
        x   -= g();
        x   /= g();
        x   *= g();
        x  >>= g();
        x  <<= g();
        x >>>= g();
        x   |= g();
        x   ^= g();
        x   %= g();
        x   &= g();
    }
}

op_equals_right_global_var: {
    options = {
        assignments: true,
        evaluate: true,
    }
    input: {
        x = (x -= 2) ^ x;

        x = 3 +   x;
        x = 3 -   x;
        x = 3 /   x;
        x = 3 *   x;
        x = 3 >>  x;
        x = 3 <<  x;
        x = 3 >>> x;
        x = 3 |   x;
        x = 3 ^   x;
        x = 3 %   x;
        x = 3 &   x;

        x = g() +   x;
        x = g() -   x;
        x = g() /   x;
        x = g() *   x;
        x = g() >>  x;
        x = g() <<  x;
        x = g() >>> x;
        x = g() |   x;
        x = g() ^   x;
        x = g() %   x;
        x = g() &   x;
    }
    expect: {
        x = (x -= 2) ^ x;

        x = 3 +   x;
        x = 3 -   x;
        x = 3 /   x;
        x *= 3;
        x = 3 >>  x;
        x = 3 <<  x;
        x = 3 >>> x;
        x |= 3;
        x ^= 3;
        x = 3 %   x;
        x &= 3;

        x = g() +   x;
        x = g() -   x;
        x = g() /   x;
        x = g() *   x;
        x = g() >>  x;
        x = g() <<  x;
        x = g() >>> x;
        x = g() |   x;
        x = g() ^   x;
        x = g() %   x;
        x = g() &   x;
    }
}

increment_decrement_1: {
    options = {
        assignments: true,
        reduce_vars: true,
    }
    input: {
        console.log(function(a) {
            a += 1;
            a -= 1;
            return a;
        }(42));
    }
    expect: {
        console.log(function(a){
            ++a;
            --a;
            return a;
        }(42));
    }
    expect_stdout: "42"
}

increment_decrement_2: {
    options = {
        assignments: true,
        passes: 2,
        reduce_vars: true,
    }
    input: {
        console.log(function(a) {
            a = a + 1;
            a = a - 1;
            a += 1;
            a -= 1;
            return a;
        }(42));
    }
    expect: {
        console.log(function(a){
            ++a;
            --a;
            ++a;
            --a;
            return a;
        }(42));
    }
    expect_stdout: "42"
}

lazily_chained_assignments: {
    options = {
        assignments: true,
        collapse_vars: true,
        conditionals: true,
        unused: true,
    }
    input: {
        function f(a) {
            if (a = console.log("foo"))
                a = console.log("bar");
            return a;
        }
        function g(b) {
            if (b = console.log("baz"))
                ;
            else
                b = console.log("moo");
            return b;
        }
        console.log(f(), g());
    }
    expect: {
        function f(a) {
            return console.log("foo") && console.log("bar");
        }
        function g(b) {
            return console.log("baz") || console.log("moo");
        }
        console.log(f(), g());
    }
    expect_stdout: [
        "foo",
        "baz",
        "moo",
        "undefined undefined",
    ]
}

issue_3375_1: {
    options = {
        assignments: true,
        reduce_vars: true,
    }
    input: {
        function p(o) {
            console.log(typeof o, o);
        }
        p(function(b) {
            var a = b += 1;
            --b;
            return a;
        }("object"));
    }
    expect: {
        function p(o) {
            console.log(typeof o, o);
        }
        p(function(b) {
            var a = b += 1;
            --b;
            return a;
        }("object"));
    }
    expect_stdout: "string object1"
}

issue_3375_2: {
    options = {
        assignments: true,
        reduce_vars: true,
    }
    input: {
        function p(o) {
            console.log(typeof o, o);
        }
        p(function(b) {
            var a = b -= 1;
            --b;
            return a;
        }("object"));
    }
    expect: {
        function p(o) {
            console.log(typeof o, o);
        }
        p(function(b) {
            var a = --b;
            --b;
            return a;
        }("object"));
    }
    expect_stdout: "number NaN"
}

issue_3427: {
    options = {
        assignments: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            var a;
            a || (a = {});
        })();
    }
    expect: {}
}

issue_3429_1: {
    options = {
        assignments: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function(b) {
            b && (b = a = "FAIL");
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function(b) {
            b = b && (a = "FAIL");
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3429_2: {
    options = {
        assignments: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a;
        (function(b) {
            b || (b = a = "FAIL");
        })(42);
        console.log(a);
    }
    expect: {
        var a;
        (function(b) {
            b = b || (a = "FAIL");
        })(42);
        console.log(a);
    }
    expect_stdout: "undefined"
}

issue_3949_1: {
    options = {
        assignments: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        var a = 42;
        function f() {
            var b = a;
            b = b >> 2;
            return 100 + b;
        }
        console.log(f());
    }
    expect: {
        var a = 42;
        function f() {
            var b = a;
            b >>= 2;
            return 100 + b;
        }
        console.log(f());
    }
    expect_stdout: "110"
}

issue_3949_2: {
    options = {
        assignments: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        var a = 42;
        function f() {
            var b = a;
            b = 5 & b;
            return 100 + b;
        }
        console.log(f());
    }
    expect: {
        var a = 42;
        function f() {
            var b = a;
            b &= 5;
            return 100 + b;
        }
        console.log(f());
    }
    expect_stdout: "100"
}

issue_4521: {
    options = {
        assignments: true,
        dead_code: true,
    }
    input: {
        var a = (a = 42 | a) ? console.log(a) : 0;
    }
    expect: {
        var a = (a |= 42) ? console.log(a) : 0;
    }
    expect_stdout: "42"
}

logical_assignments: {
    input: {
        var a = 42, b = null, c;
        a &&= "foo";
        b ||= "bar";
        c ??= "baz";
        console.log(a, b, c);
    }
    expect_exact: 'var a=42,b=null,c;a&&="foo";b||="bar";c??="baz";console.log(a,b,c);'
    expect_stdout: "foo bar baz"
    node_version: ">=15"
}

logical_collapse_vars_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL", b = false;
        a = "PASS";
        b ??= a;
        console.log(a);
    }
    expect: {
        var a = "FAIL", b = false;
        a = "PASS";
        b ??= a;
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

logical_collapse_vars_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "PASS";
        (function(b) {
            b ||= (a = "FAIL", {});
            return b;
        })(console).log(a);
    }
    expect: {
        var a = "PASS";
        (function(b) {
            return b ||= (a = "FAIL", {});
        })(console).log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

logical_collapse_vars_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 6;
        a *= 7;
        a ??= "FAIL";
        console.log(a);
    }
    expect: {
        var a = 6;
        a = a * 7 ?? "FAIL";
        console.log(a);
    }
    expect_stdout: "42"
    node_version: ">=15"
}

logical_reduce_vars: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS", b = 42;
        b ??= a = "FAIL";
        console.log(a);
    }
    expect: {
        var a = "PASS", b = 42;
        b ??= a = "FAIL";
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

logical_side_effects: {
    options = {
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS", b = 42;
        b ??= a = "FAIL";
        console.log(a);
    }
    expect: {
        var a = "PASS", b = 42;
        b ??= a = "FAIL";
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

evaluate_lazy_assignment: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 42;
        console.log(a &&= "PASS");
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

issue_4815_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        42..p &&= a = "FAIL";
        console.log(a);
    }
    expect: {
        var a = "PASS";
        42..p &&= a = "FAIL";
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

issue_4815_2: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        var a = "PASS";
        42..p &&= a = "FAIL";
        console.log(a);
    }
    expect: {
        var a = "PASS";
        42..p &&= a = "FAIL";
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

issue_4819: {
    options = {
        comparisons: true,
    }
    input: {
        console.log(void 0 === ([].p &&= 42));
    }
    expect: {
        console.log(void 0 === ([].p &&= 42));
    }
    expect_stdout: "true"
    node_version: ">=15"
}

issue_4827_1: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        A = "FAIL";
        var a = A, b = "PASS", c;
        c &&= b = a, console.log(b);
    }
    expect: {
        var a = A = "FAIL", b = "PASS", c;
        c &&= b = a, console.log(b);
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

issue_4827_2: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0, b = "PASS";
        function f(c) {
            a++,
            c &&= b = a;
        }
        f();
        console.log(b);
    }
    expect: {
        var a = 0, b = "PASS";
        a++,
        c &&= b = a;
        var c;
        console.log(b);
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

issue_4827_3: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0, b, c;
        a++;
        c &&= b = a;
        console.log(b);
    }
    expect: {
        var a = 0, b, c;
        a++;
        c &&= b = a;
        console.log(b);
    }
    expect_stdout: "undefined"
    node_version: ">=15"
}

issue_4876: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        try {
            var a = null;
            var b = a &&= 42;
            b.p;
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            var a = null;
            var b = a &&= 42;
            b.p;
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

issue_4924_1: {
    options = {
        collapse_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a, b;
        console.log("PASS");
        a = function() {};
        b = function() {}(b ||= a);
    }
    expect: {
        var b;
        console.log("PASS");
        b = void (b ||= function() {});
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

issue_4924_2: {
    options = {
        collapse_vars: true,
        dead_code: true,
        passes: 2,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a, b;
        console.log("PASS");
        a = function() {};
        b = function() {}(b ||= a);
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

issue_5670: {
    options = {
        assignments: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        (function(a, b) {
            a && a && (a = b += "") || console.log("PASS");
        })();
    }
    expect: {
        (function(a, b) {
            a = a,
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}
