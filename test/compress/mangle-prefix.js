prefix_no_debug: {
    mangle_props = {
        ignore_quoted: true,
        prefix: "__"
    }
    input: {
        var x = {};
        x.foo = 1;
        x["a"] = 2 * x.foo;
        console.log(x.foo, x["a"]);
    }
    expect: {
        var x = {};
        x.__a = 1;
        x["a"] = 2 * x.__a;
        console.log(x.__a, x["a"]);
    }
}

prefix_debug: {
    mangle_props = {
        ignore_quoted: true,
        debug: "",
        prefix: "__"
    }
    input: {
        var x = {};
        x.foo = 1;
        x["_$foo$_"] = 2 * x.foo;
        console.log(x.foo, x["_$foo$_"]);
    }
    expect: {
        var x = {};
        x.__a = 1;
        x["_$foo$_"] = 2 * x.__a;
        console.log(x.__a, x["_$foo$_"]);
    }
}

prefix_with_quoted: {
    mangle_props = {
        ignore_quoted: false,
        prefix: "__"
    }
    input: {
        var x = {};
        x.foo = 1;
        x["a"] = 2 * x.foo;
        console.log(x.foo, x["a"]);
    }
    expect: {
        var x = {};
        x.__a = 1;
        x["__b"] = 2 * x.__a;
        console.log(x.__a, x["__b"]);
    }
}
