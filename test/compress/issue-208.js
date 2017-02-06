do_not_update_lhs: {
    options = {
        evaluate: true,
        global_defs: { DEBUG: 0 }
    }
    input: {
        DEBUG++;
        DEBUG += 1;
        DEBUG = 1;
    }
    expect: {
        DEBUG++;
        DEBUG += 1;
        DEBUG = 1;
    }
}

do_update_rhs: {
    options = {
        evaluate: true,
        global_defs: { DEBUG: 0 }
    }
    input: {
        MY_DEBUG = DEBUG;
        MY_DEBUG += DEBUG;
    }
    expect: {
        MY_DEBUG = 0;
        MY_DEBUG += 0;
    }
}

mixed: {
    options = {
        evaluate: true,
        global_defs: { DEBUG: 0 }
    }
    input: {
        DEBUG = 1;
        DEBUG++;
        DEBUG += 1;
        f(DEBUG);
        x = DEBUG;
    }
    expect: {
        DEBUG = 1;
        DEBUG++;
        DEBUG += 1;
        f(0);
        x = 0;
    }
    expect_warnings: [
        'WARN: global_defs DEBUG redefined [test/compress/issue-208.js:39,8]',
        'WARN: global_defs DEBUG redefined [test/compress/issue-208.js:40,8]',
        'WARN: global_defs DEBUG redefined [test/compress/issue-208.js:41,8]',
    ]
}
