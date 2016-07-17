issue_1212_debug_false: {
    options = {
        global_defs   : { DEBUG: false },
        sequences     : true,
        properties    : true,
        dead_code     : true,
        conditionals  : true,
        comparisons   : true,
        evaluate      : true,
        booleans      : true,
        loops         : true,
        unused        : true,
        hoist_funs    : true,
        keep_fargs    : true,
        if_return     : true,
        join_vars     : true,
        cascade       : true,
        side_effects  : true,
    }
    input: {
        class foo {
            bar() {
                if (DEBUG)
                    console.log("DEV");
                else
                    console.log("PROD");
            }
        }
        new foo().bar();
    }
    expect: {
        class foo{
            bar() { console.log("PROD") }
        }
        (new foo).bar();
    }
}

issue_1212_debug_true: {
    options = {
        global_defs   : { DEBUG: true },
        sequences     : true,
        properties    : true,
        dead_code     : true,
        conditionals  : true,
        comparisons   : true,
        evaluate      : true,
        booleans      : true,
        loops         : true,
        unused        : true,
        hoist_funs    : true,
        keep_fargs    : true,
        if_return     : true,
        join_vars     : true,
        cascade       : true,
        side_effects  : true,
    }
    input: {
        class foo {
            bar() {
                if (DEBUG)
                    console.log("DEV");
                else
                    console.log("PROD");
            }
        }
        new foo().bar();
    }
    expect: {
        class foo{
            bar() { console.log("DEV") }
        }
        (new foo).bar();
    }
}

