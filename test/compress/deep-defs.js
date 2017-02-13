
global_defs_works_deeply: {
    options = {
        global_defs: {
            "foo.bar": false,
            "window[1]": 0,
            "foo.undef": undefined,
        },
    };
    input: {
        foo.bar;
        foo["bar"];
        window[1];
        foo.undef;
    }
    expect: {
        false;
        false;
        0;
        void 0;
    }
}


