literal_infinity: {
    input: {
        console.log(2e308, -1e2345);
    }
    expect_exact: "console.log(1/0,-(1/0));"
}

parentheses_for_prototype_functions: {
    beautify = {
        beautify: true,
    }
    input: {
        (function() {
            console.log((-2));
            console.log((-2).toFixed(0));

            console.log((2));
            console.log((2).toFixed(0));

            console.log((0.2));
            console.log((0.2).toFixed(0));

            console.log((2.34e20));
            console.log((2.34e20).toFixed(0));

            console.log((0.00000002));
            console.log((0.00000002).toFixed(0));

            console.log((1000000000000000128));
            console.log((1000000000000000128).toFixed(0));

            console.log((-1000000000000000128));
            console.log((-1000000000000000128).toFixed(0));
        })();
    }
    expect_exact: [
        "(function() {",
        "    console.log(-2);",
        "    console.log((-2).toFixed(0));",
        "    console.log(2);",
        "    console.log(2..toFixed(0));",
        "    console.log(.2);",
        "    console.log(.2.toFixed(0));",
        "    console.log(234e18);",
        "    console.log(234e18.toFixed(0));",
        "    console.log(2e-8);",
        "    console.log(2e-8.toFixed(0));",
        "    console.log(0xde0b6b3a7640080);",
        "    console.log(0xde0b6b3a7640080.toFixed(0));",
        "    console.log(-0xde0b6b3a7640080);",
        "    console.log((-0xde0b6b3a7640080).toFixed(0));",
        "})();",
    ]
    expect_stdout: true
}

parentheses_for_prototype_functions_galio: {
    beautify = {
        beautify: true,
        galio: true,
    }
    input: {
        (function() {
            console.log((-2));
            console.log((-2).toFixed(0));

            console.log((2));
            console.log((2).toFixed(0));

            console.log((0.2));
            console.log((0.2).toFixed(0));

            console.log((2.34e20));
            console.log((2.34e20).toFixed(0));

            console.log((0.00000002));
            console.log((0.00000002).toFixed(0));

            console.log((1000000000000000128));
            console.log((1000000000000000128).toFixed(0));

            console.log((-1000000000000000128));
            console.log((-1000000000000000128).toFixed(0));
        })();
    }
    expect_exact: [
        "(function() {",
        "    console.log(-2);",
        "    console.log((-2).toFixed(0));",
        "    console.log(2);",
        "    console.log(2..toFixed(0));",
        "    console.log(.2);",
        "    console.log(.2.toFixed(0));",
        "    console.log(234e18);",
        "    console.log(234e18.toFixed(0));",
        "    console.log(2e-8);",
        "    console.log(2e-8.toFixed(0));",
        "    console.log(0xde0b6b3a7640080);",
        "    console.log((0xde0b6b3a7640080).toFixed(0));",
        "    console.log(-0xde0b6b3a7640080);",
        "    console.log((-0xde0b6b3a7640080).toFixed(0));",
        "})();",
    ]
    expect_stdout: true
}

octal: {
    beautify = {
        beautify: true,
    }
    input: {
        (function() {
            console.log(052);
            console.log(-052);

            console.log(018);
            console.log(-018);

            console.log(052.toFixed(0));
            console.log(-052.toFixed(0));

            console.log(018..toFixed(0));
            console.log(-018..toFixed(0));
        })();
    }
    expect_exact: [
        "(function() {",
        "    console.log(42);",
        "    console.log(-42);",
        "    console.log(18);",
        "    console.log(-18);",
        "    console.log(42..toFixed(0));",
        "    console.log(-42..toFixed(0));",
        "    console.log(18..toFixed(0));",
        "    console.log(-18..toFixed(0));",
        "})();",
    ]
    expect_stdout: true
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
            2 * +x,
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
            2 * +x,
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
        reduce_vars: true,
        unsafe_math: false,
    }
    input: {
        function f(num) {
            var x = "" + num, y = null;
            [
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
                1 + (2 + (x |= 0) + 3),
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(42);
    }
    expect: {
        function f(num) {
            var x = "" + num, y = null;
            [
                x + "12",
                2 * x,
                +x + 1 + 2,
                1 + x + "23",
                3 | x,
                1 + x-- + 2 + 3,
                x*y + 2 + 1 + 3,
                2 + x + 3 + 1,
                2 + ~x + 3 + 1,
                2 + ~x + 3,
                0 & x,
                2 + (x |= 0) + 3 + 1,
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(42);
    }
    expect_stdout: [
        "string 4212",
        "number 84",
        "number 45",
        "string 14223",
        "number 43",
        "number 48",
        "number 6",
        "number 47",
        "number -36",
        "number -37",
        "number 0",
        "number 47",
    ]
}

evaluate_2_unsafe_math: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe_math: true,
    }
    input: {
        function f(num) {
            var x = "" + num, y = null;
            [
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
                1 + (2 + (x |= 0) + 3),
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(42);
    }
    expect: {
        function f(num) {
            var x = "" + num, y = null;
            [
                x + "12",
                2 * x,
                +x + 3,
                1 + x + "23",
                3 | x,
                6 + x--,
                x*y + 6,
                6 + x,
                6 + ~x,
                5 + ~x,
                0 & x,
                6 + (x |= 0),
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(42);
    }
    expect_stdout: [
        "string 4212",
        "number 84",
        "number 45",
        "string 14223",
        "number 43",
        "number 48",
        "number 6",
        "number 47",
        "number -36",
        "number -37",
        "number 0",
        "number 47",
    ]
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
        console.log(+("" + x) + 3);
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
        reduce_vars: true,
        unsafe_math: false,
    }
    input: {
        function f(num) {
            var a = "" + num;
            [
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
                2 - 3 - +a,
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(1);
    }
    expect: {
        function f(num) {
            var a = "" + num;
            [
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
                -1 - a,
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(1);
    }
    expect_stdout: [
        "number 6",
        "number 0",
        "number 2",
        "number -4",
        "number 6",
        "number 0",
        "number 4",
        "number -2",
        "number 6",
        "number 4",
        "number 0",
        "number -2",
    ]
}

evaluate_5_unsafe_math: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe_math: true,
    }
    input: {
        function f(num) {
            var a = "" + num;
            [
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
                2 - 3 - +a,
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(1);
    }
    expect: {
        function f(num) {
            var a = "" + num;
            [
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
                -1 - a,
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(1);
    }
    expect_stdout: [
        "number 6",
        "number 0",
        "number 2",
        "number -4",
        "number 6",
        "number 0",
        "number 4",
        "number -2",
        "number 6",
        "number 4",
        "number 0",
        "number -2",
    ]
}

evaluate_6: {
    options = {
        evaluate: true,
        unsafe_math: false,
    }
    input: {
        var a = "1";
        [
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
            2 - 3 - -a,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect: {
        var a = "1";
        [
            2 - a + 3,
            2 - a - 3,
            -a - 2 + 3,
            -a - 2 - 3,
            2 - a + 3,
            2 - a - 3,
            2 - -a + 3,
            2 - -a - 3,
            5 - a,
            5 - -a,
            -1 - a,
            -1 - -a,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect_stdout: [
        "number 4",
        "number -2",
        "number 0",
        "number -6",
        "number 4",
        "number -2",
        "number 6",
        "number 0",
        "number 4",
        "number 6",
        "number -2",
        "number 0",
    ]
}

evaluate_6_unsafe_math: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = "1";
        [
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
            2 - 3 - -a,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect: {
        var a = "1";
        [
            5 - a,
            -1 - a,
            -a - -1,
            -a - 5,
            5 - a,
            -1 - a,
            5 - -a,
            -1 - -a,
            5 - a,
            5 - -a,
            -1 - a,
            -1 - -a,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect_stdout: [
        "number 4",
        "number -2",
        "number 0",
        "number -6",
        "number 4",
        "number -2",
        "number 6",
        "number 0",
        "number 4",
        "number 6",
        "number -2",
        "number 0",
    ]
}

evaluate_7: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe_math: false,
    }
    input: {
        function f(num, y) {
            var x = "" + num;
            [
                +x + 2 + (3 + !y),
                +x + 2 + (3 - !y),
                +x + 2 - (3 + !y),
                +x + 2 - (3 - !y),
                +x - 2 + (3 + !y),
                +x - 2 + (3 - !y),
                +x - 2 - (3 + !y),
                +x - 2 - (3 - !y),
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(42);
    }
    expect: {
        function f(num, y) {
            var x = "" + num;
            [
                +x + 2 + (3 + !y),
                +x + 2 + (3 - !y),
                +x + 2 - (3 + !y),
                +x + 2 - (3 - !y),
                x - 2 + (3 + !y),
                x - 2 + (3 - !y),
                x - 2 - (3 + !y),
                x - 2 - (3 - !y),
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(42);
    }
    expect_stdout: [
        "number 48",
        "number 46",
        "number 40",
        "number 42",
        "number 44",
        "number 42",
        "number 36",
        "number 38",
    ]
}

evaluate_7_unsafe_math: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe_math: true,
    }
    input: {
        function f(num, y) {
            var x = "" + num;
            [
                +x + 2 + (3 + !y),
                +x + 2 + (3 - !y),
                +x + 2 - (3 + !y),
                +x + 2 - (3 - !y),
                +x - 2 + (3 + !y),
                +x - 2 + (3 - !y),
                +x - 2 - (3 + !y),
                +x - 2 - (3 - !y),
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(42);
    }
    expect: {
        function f(num, y) {
            var x = "" + num;
            [
                +x + 5 + !y,
                +x + 5 - !y,
                +x + -1 - !y,
                +x + -1 + !y,
                x - -1 + !y,
                x - -1 - !y,
                x - 5 - !y,
                x - 5 + !y,
            ].forEach(function(n) {
                console.log(typeof n, n);
            });
        }
        f(42);
    }
    expect_stdout: [
        "number 48",
        "number 46",
        "number 40",
        "number 42",
        "number 44",
        "number 42",
        "number 36",
        "number 38",
    ]
}

evaluate_8_unsafe_math: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = [ "42" ];
        console.log(a * (1 / 7));
    }
    expect: {
        var a = [ "42" ];
        console.log(+a / 7);
    }
    expect_stdout: "6"
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

unary_binary_parentheses: {
    options = {
        evaluate: true,
    }
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
                    x*y,
                    x/y,
                    x%y,
                    -x*y,
                    -x/y,
                    -x%y
                );
            });
        });
    }
    expect_stdout: true
}

issue_3531_1: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = "1";
        console.log(typeof (a + 1 - .1 - .1 - .1));
    }
    expect: {
        var a = "1";
        console.log(typeof (a + 1 - .3));
    }
    expect_stdout: "number"
}

issue_3531_2: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        console.log(1 - (2 - {}));
    }
    expect: {
        console.log(-1 + +{});
    }
    expect_stdout: "NaN"
}

issue_3531_3: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = "3";
        console.log(1 - (2 + a));
    }
    expect: {
        var a = "3";
        console.log(1 - (2 + a));
    }
    expect_stdout: "-22"
}

issue_3536: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = 100, b = 10;
        var c = --a + ("23" - (b++, 1));
        console.log(typeof c, a, b, c);
    }
    expect: {
        var a = 100, b = 10;
        var c = --a + ("23" - (b++, 1));
        console.log(typeof c, a, b, c);
    }
    expect_stdout: "number 99 11 121"
}

issue_3539: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = -0 + -"";
        console.log(0/a, 1/a, -1/a);
    }
    expect: {
        var a = -0;
        console.log(0/a, 1/a, -1/a);
    }
    expect_stdout: "NaN -Infinity Infinity"
}

issue_3547_1: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        [
            1/0 + "1" + 0,
            1/0 + "1" - 0,
            1/0 - "1" + 0,
            1/0 - "1" - 0,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect: {
        [
            1/0 + "10",
            NaN,
            1/0,
            1/0,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect_stdout: [
        "string Infinity10",
        "number NaN",
        "number Infinity",
        "number Infinity",
    ]
}

issue_3547_2: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        [
            "1" + 1/0 + 0,
            "1" + 1/0 - 0,
            "1" - 1/0 + 0,
            "1" - 1/0 - 0,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect: {
        [
            "1" + 1/0 + 0,
            NaN,
            -1/0,
            -1/0,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect_stdout: [
        "string 1Infinity0",
        "number NaN",
        "number -Infinity",
        "number -Infinity",
    ]
}

issue_3547_3: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = "3";
        [
            a + "2" + 1,
            a + "2" - 1,
            a - "2" + 1,
            a - "2" - 1,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect: {
        var a = "3";
        [
            a + "21",
            a + "2" - 1,
            a - 1,
            a - 3,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect_stdout: [
        "string 321",
        "number 31",
        "number 2",
        "number 0",
    ]
}

issue_3547_4: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = "2";
        [
            "3" + a + 1,
            "3" + a - 1,
            "3" - a + 1,
            "3" - a - 1,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect: {
        var a = "2";
        [
            "3" + a + 1,
            "3" + a - 1,
            4 - a,
            2 - a,
        ].forEach(function(n) {
            console.log(typeof n, n);
        });
    }
    expect_stdout: [
        "string 321",
        "number 31",
        "number 2",
        "number 0",
    ]
}

unsafe_math_rounding: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        console.log(4 / -3 + 1 === 1 / -3);
    }
    expect: {
        console.log(false);
    }
    expect_stdout: "false"
}

issue_3593: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        console.log((0 === this) - 1 - "1");
    }
    expect: {
        console.log((0 === this) - 2);
    }
    expect_stdout: "-2"
}

unsafe_math_swap_constant: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = 1, b = 2;
        console.log(
            a++ + b-- + 3,
            a++ + b + 3,
            a + b-- + 3,
            a + b + 3,
            a++ - b-- + 3,
            a++ - b + 3,
            a - b-- + 3,
            a - b + 3
        );
    }
    expect: {
        var a = 1, b = 2;
        console.log(
            3 + a++ + b--,
            a++ + b + 3,
            a + b-- + 3,
            a + b + 3,
            3 + a++ - b--,
            3 + a++ - b,
            a - b-- + 3,
            a - b + 3
        );
    }
    expect_stdout: "6 6 7 6 6 8 9 10"
}

identity_1: {
    options = {
        evaluate: true,
    }
    input: {
        0 + a;
        a + 0;
        0 - a;
        a - 0;
        1 * a;
        a * 1;
        1 / a;
        a / 1;
    }
    expect: {
        0 + a;
        a + 0;
        0 - a;
        +a;
        +a;
        +a;
        1 / a;
        +a;
    }
}

identity_2: {
    options = {
        evaluate: true,
    }
    input: {
        0 + !a;
        !a + 0;
        0 - !a;
        !a - 0;
        1 * !a;
        !a * 1;
        1 / !a;
        !a / 1;
    }
    expect: {
        +!a;
        +!a;
        0 - !a;
        +!a;
        +!a;
        +!a;
        1 / !a;
        +!a;
    }
}

identity_3: {
    options = {
        evaluate: true,
    }
    input: {
        0 + --a;
        --a + 0;
        0 - --a;
        --a - 0;
        1 * --a;
        --a * 1;
        1 / --a;
        --a / 1;
    }
    expect: {
        --a;
        --a;
        0 - --a;
        --a;
        --a;
        --a;
        1 / --a;
        --a;
    }
}

issue_3653: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(0 - (console && 0));
        console.log(0 + (0 - (console && 0)));
        console.log(0 - (0 - (console && 0)));
        console.log(1 * (0 - (console && 0)));
        console.log(1 / (0 - (console && 0)));
        console.log((0 - (console && 0)) + 0);
        console.log((0 - (console && 0)) - 0);
        console.log((0 - (console && 0)) * 1);
        console.log((0 - (console && 0)) / 1);
    }
    expect: {
        console.log(0 - (console && 0));
        console.log(0 - (console && 0));
        console.log(0 - (0 - (console && 0)));
        console.log(0 - (console && 0));
        console.log(1 / (0 - (console && 0)));
        console.log(0 - (console && 0));
        console.log(0 - (console && 0));
        console.log(0 - (console && 0));
        console.log(0 - (console && 0));
    }
    expect_stdout: [
        "0",
        "0",
        "0",
        "0",
        "Infinity",
        "0",
        "0",
        "0",
        "0",
    ]
}

issue_3655: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(0 + 0 * -[].length);
        console.log(0 + (0 + 0 * -[].length));
        console.log(0 - (0 + 0 * -[].length));
        console.log(1 * (0 + 0 * -[].length));
        console.log(1 / (0 + 0 * -[].length));
        console.log((0 + 0 * -[].length) + 0);
        console.log((0 + 0 * -[].length) - 0);
        console.log((0 + 0 * -[].length) * 1);
        console.log((0 + 0 * -[].length) / 1);
    }
    expect: {
        console.log(0 + 0 * -[].length);
        console.log(0 + 0 * -[].length);
        console.log(0 - (0 + 0 * -[].length));
        console.log(0 + 0 * -[].length);
        console.log(1 / (0 + 0 * -[].length));
        console.log(0 + 0 * -[].length);
        console.log(0 + 0 * -[].length);
        console.log(0 + 0 * -[].length);
        console.log(0 + 0 * -[].length);
    }
    expect_stdout: [
        "0",
        "0",
        "0",
        "0",
        "Infinity",
        "0",
        "0",
        "0",
        "0",
    ]
}

issue_3676_1: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = [];
        console.log(false - (a - (a[1] = 42)));
    }
    expect: {
        var a = [];
        console.log(false - (a - (a[1] = 42)));
    }
    expect_stdout: "NaN"
}

issue_3676_2: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a;
        console.log(false - ((a = []) - (a[1] = 42)));
    }
    expect: {
        var a;
        console.log(false - ((a = []) - (a[1] = 42)));
    }
    expect_stdout: "NaN"
}

issue_3682_1: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = -0;
        console.log(1 / (a - 1 + 1));
    }
    expect: {
        var a = -0;
        console.log(1 / (a - 1 + 1));
    }
    expect_stdout: "Infinity"
}

issue_3682_2: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = -0, b = 1;
        console.log(1 / (a - (b - b)));
    }
    expect: {
        var a = -0, b = 1;
        console.log(1 / (a - (b - b)));
    }
    expect_stdout: "-Infinity"
}

issue_3682_3: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        var a = -0, b = 1, c = -1;
        console.log(1 / (a - (+b + +c)));
    }
    expect: {
        var a = -0, b = 1, c = -1;
        console.log(1 / (a - (+b + +c)));
    }
    expect_stdout: "-Infinity"
}

issue_3684: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(1 / (-1 * (0 & console) + 0));
        console.log(1 / ((0 & console) / -1 + 0));
    }
    expect: {
        console.log(1 / (-1 * (0 & console) + 0));
        console.log(1 / ((0 & console) / -1 + 0));
    }
    expect_stdout: [
        "Infinity",
        "Infinity",
    ]
}

issue_3695: {
    options = {
        evaluate: true,
    }
    input: {
        var a = [];
        console.log(+(a * (a[0] = false)));
    }
    expect: {
        var a = [];
        console.log(a * (a[0] = false));
    }
    expect_stdout: "NaN"
}

issue_4137: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(+(A = []) * (A[0] = 1));
    }
    expect: {
        console.log(+(A = []) * (A[0] = 1));
    }
    expect_stdout: "0"
}

issue_4142: {
    options = {
        evaluate: true,
    }
    input: {
        console.log("" + +(0 === console));
    }
    expect: {
        console.log("" + +(0 === console));
    }
    expect_stdout: "0"
}

issue_4542_1: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        console.log(function(a) {
            return a / (1 / (a[0] = 2));
        }([ 3 ]));
    }
    expect: {
        console.log(function(a) {
            return a / (1 / (a[0] = 2));
        }([ 3 ]));
    }
    expect_stdout: "4"
}

issue_4542_2: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        console.log(function(a) {
            return a / (1 / --a[0]);
        }([ 3 ]));
    }
    expect: {
        console.log(function(a) {
            return a / (1 / --a[0]);
        }([ 3 ]));
    }
    expect_stdout: "4"
}

issue_4542_3: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        console.log(function(a) {
            return a / (0 / (a[0] = 0, 1));
        }([ 1 ]));
    }
    expect: {
        console.log(function(a) {
            return a / (0 / (a[0] = 0, 1));
        }([ 1 ]));
    }
    expect_stdout: "NaN"
}

issue_4542_4: {
    options = {
        evaluate: true,
        unsafe_math: true,
    }
    input: {
        console.log(function(a) {
            return a / (1 / (a.length = 1));
        }([ 2, 3 ]));
    }
    expect: {
        console.log(function(a) {
            return a / (1 / (a.length = 1));
        }([ 2, 3 ]));
    }
    expect_stdout: "2"
}
