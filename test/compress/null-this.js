keep_null_this: {
    options = {
    };
    input: {
        foo(null,42);
        call(null,42);
        apply(null,42);
        bind(null,42);
        foo.call(null,42);
        foo.apply(null,42);
        foo.bind(null,42);
    }
    expect: {
        foo(null,42);
        call(null,42);
        apply(null,42);
        bind(null,42);
        foo.call(null,42);
        foo.apply(null,42);
        foo.bind(null,42);
    }
}

drop_null_this: {
    options = {
        null_this: true
    };
    input: {
        foo(null,42);
        call(null,42);
        apply(null,42);
        bind(null,42);
        foo.call(null,42);
        foo.apply(null,42);
        foo.bind(null,42);
    }
    expect: {
        foo(null,42);
        call(null,42);
        apply(null,42);
        bind(null,42);
        foo.call(0,42);
        foo.apply(0,42);
        foo.bind(0,42);
    }
}
