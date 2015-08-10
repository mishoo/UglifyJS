do_not_update_lhs: {
    options = { global_defs: { DEBUG: false } };
    input: { DEBUG = false; }
    expect: { DEBUG = false; }
}

do_update_rhs: {
    options = { global_defs: { DEBUG: false } };
    input: { MY_DEBUG = DEBUG; }
    expect: { MY_DEBUG = false; }
}
