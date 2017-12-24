dont_mangle_arguments: {
    mangle = {
    };
    options = {
        sequences     : true,
        properties    : true,
        dead_code     : true,
        drop_debugger : true,
        conditionals  : true,
        comparisons   : true,
        evaluate      : true,
        booleans      : true,
        loops         : true,
        unused        : true,
        hoist_funs    : true,
        keep_fargs    : true,
        keep_fnames   : false,
        hoist_vars    : true,
        if_return     : true,
        join_vars     : true,
        side_effects  : true,
        negate_iife   : false
    };
    input: {
        (function(){
            var arguments = arguments, not_arguments = 9;
            console.log(not_arguments, arguments);
        })(5,6,7);
    }
    expect_exact: "(function(){var arguments=arguments,o=9;console.log(o,arguments)})(5,6,7);"
    expect_stdout: true
}
