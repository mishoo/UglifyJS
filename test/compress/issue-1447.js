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
        booleans: true,
        comparisons: true,
        conditionals: false,
        dead_code: true,
        evaluate: true,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        loops: true,
        side_effects: true,
        unused: true,
    }
    input: {
        for (var i = 1; i <= 4; ++i) {
            if (i <= 2) continue;
            console.log(i);
        }
    }
    expect_exact: "for(var i=1;i<=4;++i)if(i<=2);else console.log(i);"
    expect_stdout: [
        "3",
        "4",
    ]
}
