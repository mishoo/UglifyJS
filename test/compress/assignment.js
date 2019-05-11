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

issue_3375: {
    options = {
        assignments: true,
        reduce_vars: true,
    }
    input: {
        console.log(typeof function(b) {
            var a = b += 1;
            --b;
            return a;
        }("object"));
    }
    expect: {
        console.log(typeof function(b) {
            var a = b += 1;
            --b;
            return a;
        }("object"));
    }
    expect_stdout: "string"
}

issue_3402: {
    options = {
        assignments: true,
        evaluate: true,
        functions: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        var f = function f() {
            f = 42;
            console.log(typeof f);
        };
        "function" == typeof f && f();
        "function" == typeof f && f();
        console.log(typeof f);
    }
    expect: {
        function f() {
            console.log(typeof f);
        }
        f();
        f();
        console.log(typeof f);
    }
    expect_stdout: [
        "function",
        "function",
        "function",
    ]
}
