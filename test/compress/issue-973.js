this_binding_conditionals: {
    options = {
        conditionals: true,
        evaluate    : true
    };
    input: {
        (1 && a)();
        (0 || a)();
        (0 || 1 && a)();
        (1 ? a : 0)();

        (1 && a.b)();
        (0 || a.b)();
        (0 || 1 && a.b)();
        (1 ? a.b : 0)();

        (1 && a[b])();
        (0 || a[b])();
        (0 || 1 && a[b])();
        (1 ? a[b] : 0)();
    }
    expect: {
        a();
        a();
        a();
        a();

        (0, a.b)();
        (0, a.b)();
        (0, a.b)();
        (0, a.b)();

        (0, a[b])();
        (0, a[b])();
        (0, a[b])();
        (0, a[b])();
    }
}

this_binding_collapse_vars: {
    options = {
        collapse_vars: true,
    };
    input: {
        var c = a; c();
        var d = a.b; d();
    }
    expect: {
        a();
        (0, a.b)();
    }
}