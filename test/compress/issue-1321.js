issue_1321_no_debug: {
    mangle = {
        properties: {
            domprops: true,
            keep_quoted: true,
        },
    }
    input: {
        var x = {};
        x.foo = 1;
        x["a"] = 2 * x.foo;
        console.log(x.foo, x["a"]);
    }
    expect: {
        var x = {};
        x.x = 1;
        x["a"] = 2 * x.x;
        console.log(x.x, x["a"]);
    }
    expect_stdout: true
}

issue_1321_debug: {
    mangle = {
        properties: {
            debug: "",
            domprops: true,
            keep_quoted: true,
        },
    }
    input: {
        var x = {};
        x.foo = 1;
        x["_$foo$_"] = 2 * x.foo;
        console.log(x.foo, x["_$foo$_"]);
    }
    expect: {
        var x = {};
        x.x = 1;
        x["_$foo$_"] = 2 * x.x;
        console.log(x.x, x["_$foo$_"]);
    }
    expect_stdout: true
}

issue_1321_with_quoted: {
    mangle = {
        properties: {
            domprops: true,
            keep_quoted: false,
        },
    }
    input: {
        var x = {};
        x.foo = 1;
        x["a"] = 2 * x.foo;
        console.log(x.foo, x["a"]);
    }
    expect: {
        var x = {};
        x.x = 1;
        x["o"] = 2 * x.x;
        console.log(x.x, x["o"]);
    }
    expect_stdout: true
}
