do_not_update_lhs: {
    options = {
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
