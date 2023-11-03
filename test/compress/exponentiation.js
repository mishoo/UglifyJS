precedence_1: {
    input: {
        console.log(-4 ** 3 ** 2);
    }
    expect_exact: "console.log((-4)**3**2);"
    expect_stdout: "-262144"
    node_version: ">=8"
}

precedence_2: {
    input: {
        console.log(-4 ** (3 ** 2));
    }
    expect_exact: "console.log((-4)**3**2);"
    expect_stdout: "-262144"
    node_version: ">=8"
}

precedence_3: {
    input: {
        console.log(-(4 ** 3) ** 2);
    }
    expect_exact: "console.log((-(4**3))**2);"
    expect_stdout: "4096"
    node_version: ">=8"
}

precedence_4: {
    input: {
        console.log((-4 ** 3) ** 2);
    }
    expect_exact: "console.log(((-4)**3)**2);"
    expect_stdout: "4096"
    node_version: ">=8"
}

await: {
    input: {
        (async a => a * await a ** ++a % a)(2).then(console.log);
    }
    expect_exact: "(async a=>a*(await a)**++a%a)(2).then(console.log);"
    expect_stdout: "1"
    node_version: ">=8"
}

assignment_1: {
    input: {
        var a = 2;
        a **= 5;
        console.log(a);
    }
    expect_exact: "var a=2;a**=5;console.log(a);"
    expect_stdout: "32"
    node_version: ">=8"
}

assignment_2: {
    input: {
        var a = 8n;
        a **= a;
        console.log(a);
    }
    expect_exact: "var a=8n;a**=a;console.log(a);"
    expect_stdout: "16777216n"
    node_version: ">=10.4.0"
}

evaluate: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(1 + 2 ** 3 - 4);
    }
    expect: {
        console.log(5);
    }
    expect_stdout: "5"
    node_version: ">=8"
}

issue_4664: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            new function(a) {
                console.log(typeof f, a, typeof this);
            }((A = 0, (NaN ^ 1) * 2 ** 30), 0);
        }
        f();
    }
    expect: {
        (function f() {
            new function(a) {
                console.log(typeof f, 2 ** 30, typeof this);
            }(A = 0);
        })();
    }
    expect_stdout: "function 1073741824 object"
    node_version: ">=8"
}

issue_4715: {
    options = {
        evaluate: true,
    }
    input: {
        A = 1;
        console.log((-0) ** A + 0);
        console.log((-0) ** A - 0);
        console.log((-0) ** A * 1);
        console.log((-0) ** A / 1);
        console.log(Math.pow(-0, A) + 0);
        console.log(Math.pow(-0, A) - 0);
        console.log(Math.pow(-0, A) * 1);
        console.log(Math.pow(-0, A) / 1);
    }
    expect: {
        A = 1;
        console.log((-0) ** A + 0);
        console.log((-0) ** A);
        console.log((-0) ** A * 1);
        console.log((-0) ** A);
        console.log(Math.pow(-0, A) + 0);
        console.log(+Math.pow(-0, A));
        console.log(+Math.pow(-0, A));
        console.log(+Math.pow(-0, A));
    }
    expect_stdout: [
        "0",
        "-0",
        "-0",
        "-0",
        "0",
        "-0",
        "-0",
        "-0",
    ]
    node_version: ">=8"
}
