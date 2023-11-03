arithmetic: {
    input: {
        console.log(((1n + 0x2n) * (0o3n - -4n)) >> (5n - 6n));
    }
    expect_exact: "console.log((1n+0x2n)*(0o3n- -4n)>>5n-6n);"
    expect_stdout: "42n"
    node_version: ">=10.4.0"
}

minus_dot: {
    input: {
        console.log(typeof -42n.toString(), typeof (-42n).toString());
    }
    expect_exact: "console.log(typeof-42n.toString(),typeof(-42n).toString());"
    expect_stdout: "number string"
    node_version: ">=10.4.0"
}

evaluate: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log((0xDEAD_BEEFn).toString(16));
    }
    expect: {
        console.log(0xdeadbeefn.toString(16));
    }
    expect_stdout: "deadbeef"
    node_version: ">=10.4.0"
}

Number: {
    options = {
        unsafe: true,
    }
    input: {
        console.log(Number(-0xfeed_dead_beef_badn));
    }
    expect: {
        console.log(+("" + -0xfeed_dead_beef_badn));
    }
    expect_stdout: "-1148098955808013200"
    node_version: ">=10.4.0"
}

issue_4590: {
    options = {
        collapse_vars: true,
    }
    input: {
        A = 1;
        0n || console.log("PASS");
    }
    expect: {
        A = 1;
        0n || console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=10.4.0"
}

issue_4801: {
    options = {
        booleans: true,
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        try {
            (function(a) {
                A = 42;
                a || A;
            })(!(0 == 42 >> 0o644n));
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function(a) {
                0 != (A = 42) >> 0o644n || A;
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=10.4.0"
}

issue_5728: {
    options = {
        evaluate: true,
    }
    input: {
        console.log("" + 4n + 2);
    }
    expect: {
        console.log("42");
    }
    expect_stdout: "42"
    node_version: ">=10.4.0"
}
