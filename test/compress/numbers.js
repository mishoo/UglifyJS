hex_numbers_in_parentheses_for_prototype_functions: {
    beautify = {
        beautify: true,
    }
    input: {
        function f() {
            (-2);
            (-2).toFixed(0);

            (2);
            (2).toFixed(0);

            (0.2);
            (0.2).toFixed(0);

            (2.34e20);
            (2.34e20).toFixed(0);

            (0.00000002);
            (0.00000002).toFixed(0);

            (1000000000000000128);
            (1000000000000000128).toFixed(0);

            (-1000000000000000128);
            (-1000000000000000128).toFixed(0);
        }
    }
    expect_exact: [
        "function f() {",
        "    -2;",
        "    (-2).toFixed(0);",
        "    2;",
        "    2..toFixed(0);",
        "    .2;",
        "    .2.toFixed(0);",
        "    234e18;",
        "    234e18.toFixed(0);",
        "    2e-8;",
        "    2e-8.toFixed(0);",
        "    0xde0b6b3a7640080;",
        "    (0xde0b6b3a7640080).toFixed(0);",
        "    -0xde0b6b3a7640080;",
        "    (-0xde0b6b3a7640080).toFixed(0);",
        "}",
    ]
}

comparisons: {
    options = {
        comparisons: true,
    }
    input: {
        var x = "42", y = "0x30";
        console.log(
            ~x === 42,
            x % y === 42
        );
    }
    expect: {
        var x = "42", y = "0x30";
        console.log(
            42 == ~x,
            x % y == 42
        );
    }
    expect_stdout: "false true"
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

evaluate_1_unsafe_math: {
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
            1 + (2 + ~x + 3),
            -y + (2 + ~x + 3),
            1 & (2 & x & 3),
            1 + (2 + (x |= 0) + 3)
        );
    }
    expect: {
        console.log(
            x + 1 + 2,
            2 * x,
            +x + 3,
            1 + x + 2 + 3,
            3 | x,
            6 + x--,
            x*y + 6,
            1 + (2 + x + 3),
            6 + ~x,
            5 - y + ~x,
            0 & x,
            6 + (x |= 0)
        );
    }
}

evaluate_2: {
    options = {
        evaluate: true,
        unsafe_math: false,
    }
    input: {
        var x = "42", y = null;
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
        var x = "42", y = null;
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
            2 + ~x + 3 - y,
            0 & x,
            2 + (x |= 0) + 3 + 1
        );
    }
    expect_stdout: "4212 84 45 14223 43 48 6 47 -36 -37 0 47"
}

evaluate_2_unsafe_math: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var x = "42", y = null;
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
        var x = "42", y = null;
        console.log(
            x + 1 + 2,
            2 * x,
            +x + 3,
            1 + x + 2 + 3,
            3 | x,
            6 + x--,
            x*y + 6,
            1 + (2 + x + 3),
            6 + ~x,
            5 + ~x - y,
            0 & x,
            6 + (x |= 0)
        );
    }
    expect_stdout: "4212 84 45 14223 43 48 6 47 -36 -37 0 47"
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
        console.log(+x + 3);
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

evaluate_5: {
    options = {
        evaluate: true,
        unsafe_math: false,
    }
    input: {
        var a = true;
        console.log(
            +a + 2 + 3,
            +a + 2 - 3,
            +a - 2 + 3,
            +a - 2 - 3,
            2 + +a + 3,
            2 + +a - 3,
            2 - +a + 3,
            2 - +a - 3,
            2 + 3 + +a,
            2 + 3 - +a,
            2 - 3 + +a,
            2 - 3 - +a
        );
    }
    expect: {
        var a = true;
        console.log(
            +a + 2 + 3,
            +a + 2 - 3,
            a - 2 + 3,
            a - 2 - 3,
            +a + 2 + 3,
            +a + 2 - 3,
            2 - a + 3,
            2 - a - 3,
            +a + 5,
            5 - a,
            +a - 1,
            -1 - a
        );
    }
    expect_stdout: "6 0 2 -4 6 0 4 -2 6 4 0 -2"
}

evaluate_5_unsafe_math: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = true;
        console.log(
            +a + 2 + 3,
            +a + 2 - 3,
            +a - 2 + 3,
            +a - 2 - 3,
            2 + +a + 3,
            2 + +a - 3,
            2 - +a + 3,
            2 - +a - 3,
            2 + 3 + +a,
            2 + 3 - +a,
            2 - 3 + +a,
            2 - 3 - +a
        );
    }
    expect: {
        var a = true;
        console.log(
            +a + 5,
            +a + -1,
            a - -1,
            a - 5,
            +a + 5,
            +a + -1,
            5 - a,
            -1 - a,
            +a + 5,
            5 - a,
            +a - 1,
            -1 - a
        );
    }
    expect_stdout: "6 0 2 -4 6 0 4 -2 6 4 0 -2"
}

evaluate_6: {
    options = {
        evaluate: true,
        unsafe_math: false,
    }
    input: {
        var a = true;
        console.log(
            -a + 2 + 3,
            -a + 2 - 3,
            -a - 2 + 3,
            -a - 2 - 3,
            2 + -a + 3,
            2 + -a - 3,
            2 - -a + 3,
            2 - -a - 3,
            2 + 3 + -a,
            2 + 3 - -a,
            2 - 3 + -a,
            2 - 3 - -a
        );
    }
    expect: {
        var a = true;
        console.log(
            2 - a + 3,
            2 - a - 3,
            -a - 2 + 3,
            -a - 2 - 3,
            2 - a + 3,
            2 - a - 3,
            2 + a + 3,
            2 + a - 3,
            5 - a,
            5 + a,
            -1 - a,
            -1 + a
        );
    }
    expect_stdout: "4 -2 0 -6 4 -2 6 0 4 6 -2 0"
}

evaluate_6_unsafe_math: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = true;
        console.log(
            -a + 2 + 3,
            -a + 2 - 3,
            -a - 2 + 3,
            -a - 2 - 3,
            2 + -a + 3,
            2 + -a - 3,
            2 - -a + 3,
            2 - -a - 3,
            2 + 3 + -a,
            2 + 3 - -a,
            2 - 3 + -a,
            2 - 3 - -a
        );
    }
    expect: {
        var a = true;
        console.log(
            5 - a,
            -1 - a,
            -a - -1,
            -a - 5,
            5 - a,
            -1 - a,
            2 + a + 3,
            -1 + a,
            5 - a,
            5 + a,
            -1 - a,
            -1 + a
        );
    }
    expect_stdout: "4 -2 0 -6 4 -2 6 0 4 6 -2 0"
}

evaluate_7: {
    options = {
        evaluate: true,
        unsafe_math: false,
    }
    input: {
        var x = "42", y;
        console.log(
            +x + 2 + (3 + !y),
            +x + 2 + (3 - !y),
            +x + 2 - (3 + !y),
            +x + 2 - (3 - !y),
            +x - 2 + (3 + !y),
            +x - 2 + (3 - !y),
            +x - 2 - (3 + !y),
            +x - 2 - (3 - !y)
        );
    }
    expect: {
        var x = "42", y;
        console.log(
            +x + 2 + (3 + !y),
            +x + 2 + (3 - !y),
            +x + 2 - (3 + !y),
            +x + 2 - (3 - !y),
            x - 2 + (3 + !y),
            x - 2 + (3 - !y),
            x - 2 - (3 + !y),
            x - 2 - (3 - !y)
        );
    }
    expect_stdout: "48 46 40 42 44 42 36 38"
}

evaluate_7_unsafe_math: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var x = "42", y;
        console.log(
            +x + 2 + (3 + !y),
            +x + 2 + (3 - !y),
            +x + 2 - (3 + !y),
            +x + 2 - (3 - !y),
            +x - 2 + (3 + !y),
            +x - 2 + (3 - !y),
            +x - 2 - (3 + !y),
            +x - 2 - (3 - !y)
        );
    }
    expect: {
        var x = "42", y;
        console.log(
            +x + 5 + !y,
            +x + 5 - !y,
            +x + -1 - !y,
            +x + -1 + !y,
            x - -1 + !y,
            x - -1 - !y,
            x - 5 - !y,
            x - 5 + !y
        );
    }
    expect_stdout: "48 46 40 42 44 42 36 38"
}

NaN_redefined: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var NaN;
        console.log(1 / (0 / 0));
    }
    expect: {
        var NaN;
        console.log(0 / 0);
    }
    expect_stdout: "NaN"
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
