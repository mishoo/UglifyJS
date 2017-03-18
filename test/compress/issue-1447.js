else_with_empty_block: {
    options = {}
    input: {
        if (x)
            yes();
        else {
        }
    }
    expect_exact: "if(x)yes();"
}

else_with_empty_statement: {
    options = {}
    input: {
        if (x)
            yes();
        else
            ;
    }
    expect_exact: "if(x)yes();"
}

conditional_false_stray_else_in_loop: {
    options = {
        evaluate     : true,
        comparisons  : true,
        booleans     : true,
        unused       : true,
        loops        : true,
        side_effects : true,
        dead_code    : true,
        hoist_vars   : true,
        join_vars    : true,
        if_return    : true,
        cascade      : true,
        conditionals : false,
    }
    input: {
        for (var i = 1; i <= 4; ++i) {
            if (i <= 2) continue;
            console.log(i);
        }
    }
    expect_exact: "for(var i=1;i<=4;++i)if(!(i<=2))console.log(i);"
    expect_stdout: true
}
