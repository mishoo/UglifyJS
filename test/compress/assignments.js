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
