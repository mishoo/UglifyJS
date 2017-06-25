issue_1321_no_debug: {
    mangle_props = {
        keep_quoted: true
    }
    input: {
        var x = {};
        x.foo = 1;
        x["a"] = 2 * x.foo;
        console.log(x.foo, x["a"]);
    }
    expect: {
        var x = {};
        x.o = 1;
        x["a"] = 2 * x.o;
        console.log(x.o, x["a"]);
    }
    expect_stdout: true
}

issue_1321_debug: {
    mangle_props = {
        keep_quoted: true,
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
        x.o = 1;
        x["_$foo$_"] = 2 * x.o;
        console.log(x.o, x["_$foo$_"]);
    }
    expect_stdout: true
}

issue_1321_with_quoted: {
    mangle_props = {
        keep_quoted: false
    }
    input: {
        var x = {};
        x.foo = 1;
        x["a"] = 2 * x.foo;
        console.log(x.foo, x["a"]);
    }
    expect: {
        var x = {};
        x.o = 1;
        x["x"] = 2 * x.o;
        console.log(x.o, x["x"]);
    }
    expect_stdout: true
}
