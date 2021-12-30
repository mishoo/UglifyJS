dont_mangle_arguments: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        drop_debugger: true,
        evaluate: true,
        hoist_funs: true,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        keep_fnames: false,
        loops: true,
        negate_iife: false,
        properties: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    mangle = {}
    input: {
        (function(){
            var arguments = arguments, not_arguments = 9;
            console.log(not_arguments, arguments);
        })(5, 6, 7);
    }
    expect_exact: "(function(){var arguments,o=9;console.log(o,arguments)})(5,6,7);"
    expect_stdout: true
}
