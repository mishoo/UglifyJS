issue_1321_no_debug: {
    mangle_props = {
        ignore_quoted: true
    }
    input: {
        var x = {};
        x.foo = 1;
        x["a"] = 2 * x.foo;
        console.log(x.foo, x["a"]);
    }
    expect: {
        var x = {};
        x.b = 1;
        x["a"] = 2 * x.b;
        console.log(x.b, x["a"]);
    }
}

issue_1321_debug: {
    mangle_props = {
        ignore_quoted: true,
        debug: ""
    }
    input: {
        var x = {};
        x.foo = 1;
        x["_$foo$_"] = 2 * x.foo;
        console.log(x.foo, x["_$foo$_"]);
    }
    expect: {
        var x = {};
        x.a = 1;
        x["_$foo$_"] = 2 * x.a;
        console.log(x.a, x["_$foo$_"]);
    }
}

issue_1321_with_quoted: {
    mangle_props = {
        ignore_quoted: false
    }
    input: {
        var x = {};
        x.foo = 1;
        x["a"] = 2 * x.foo;
        console.log(x.foo, x["a"]);
    }
    expect: {
        var x = {};
        x.a = 1;
        x["b"] = 2 * x.a;
        console.log(x.a, x["b"]);
    }
}
