f7: {
    options = {
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        drop_debugger: true,
        evaluate: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        loops: true,
        negate_iife: true,
        passes: 3,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    beautify = {
        beautify: true,
    }
    input: {
        var a = 100, b = 10;
        function f22464() {
            var brake146670 = 5;
            while (((b = a) ? !a : ~a ? null : b += a) && --brake146670 > 0) {
            }
        }
        f22464();
        console.log(a, b);
    }
    expect_exact: [
        "console.log(100, 100);",
    ]
    expect_stdout: "100 100"
}
