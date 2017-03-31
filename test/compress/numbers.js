hex_numbers_in_parentheses_for_prototype_functions: {
    input: {
        (-2);
        (-2).toFixed(0);

        (2);
        (2).toFixed(0);

        (0.2);
        (0.2).toFixed(0);

        (0.00000002);
        (0.00000002).toFixed(0);

        (1000000000000000128);
        (1000000000000000128).toFixed(0);
    }
    expect_exact: "-2;(-2).toFixed(0);2;2..toFixed(0);.2;.2.toFixed(0);2e-8;2e-8.toFixed(0);0xde0b6b3a7640080;(0xde0b6b3a7640080).toFixed(0);"
}

comparisons: {
    options = {
        comparisons: true,
    }
    input: {
        console.log(
            ~x === 42,
            x % n === 42
        );
    }
    expect: {
        console.log(
            42 == ~x,
            x % n == 42
        );
    }
}

evaluate_1: {
    options = {
        evaluate: true,
        unsafe_math: false,
    }
    input: {
        console.log(
            x + 1 + 2,
            x * 1 * 2,
            +x + 1 + 2,
            1 + x + 2 + 3,
            1 | x | 2 | 3,
            1 + x-- + 2 + 3,
            1 + (x*y + 2) + 3,
            1 + (2 + x + 3),
            1 + (2 + ~x + 3),
            -y + (2 + ~x + 3),
            1 & (2 & x & 3),
            1 + (2 + (x |= 0) + 3)
        );
    }
    expect: {
        console.log(
            x + 1 + 2,
            1 * x * 2,
            +x + 1 + 2,
            1 + x + 2 + 3,
            3 | x,
            1 + x-- + 2 + 3,
            x*y + 2 + 1 + 3,
            1 + (2 + x + 3),
            2 + ~x + 3 + 1,
            -y + (2 + ~x + 3),
            0 & x,
            2 + (x |= 0) + 3 + 1
        );
    }
}

evaluate_2: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        console.log(
            x + 1 + 2,
            x * 1 * 2,
            +x + 1 + 2,
            1 + x + 2 + 3,
            1 | x | 2 | 3,
            1 + x-- + 2 + 3,
            1 + (x*y + 2) + 3,
            1 + (2 + x + 3),
            1 & (2 & x & 3),
            1 + (2 + (x |= 0) + 3)
        );
    }
    expect: {
        console.log(
            x + 1 + 2,
            2 * x,
            3 + +x,
            1 + x + 2 + 3,
            3 | x,
            6 + x--,
            6 + x*y,
            1 + (2 + x + 3),
            0 & x,
            6 + (x |= 0)
        );
    }
}

evaluate_3: {
    options = {
        evaluate: true,
        unsafe: true,
        unsafe_math: true,
    }
    input: {
        console.log(1 + Number(x) + 2);
    }
    expect: {
        console.log(3 + +x);
    }
}

evaluate_4: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(
            1+ +a,
            +a+1,
            1+-a,
            -a+1,
            +a+ +b,
            +a+-b,
            -a+ +b,
            -a+-b
        );
    }
    expect: {
        console.log(
            +a+1,
            +a+1,
            1-a,
            1-a,
            +a+ +b,
            +a-b,
            -a+ +b,
            -a-b
        );
    }
}

issue_1710: {
    options = {
        evaluate: true,
    }
    input: {
        var x = {};
        console.log((x += 1) + -x);
    }
    expect: {
        var x = {};
        console.log((x += 1) + -x);
    }
    expect_stdout: true
}

unary_binary_parenthesis: {
    input: {
        var v = [ 0, 1, NaN, Infinity, null, undefined, true, false, "", "foo", /foo/ ];
        v.forEach(function(x) {
            v.forEach(function(y) {
                console.log(
                    +(x*y),
                    +(x/y),
                    +(x%y),
                    -(x*y),
                    -(x/y),
                    -(x%y)
                );
            });
        });
    }
    expect: {
        var v = [ 0, 1, NaN, 1/0, null, void 0, true, false, "", "foo", /foo/ ];
        v.forEach(function(x) {
            v.forEach(function(y) {
                console.log(
                    +x*y,
                    +x/y,
                    +x%y,
                    -x*y,
                    -x/y,
                    -x%y
                );
            });
        });
    }
    expect_stdout: true
}
