issue_269_1: {
    options = {
        unsafe: true,
    }
    input: {
        var x = {};
        console.log(
            String(x),
            Number(x),
            Boolean(x),

            String(),
            Number(),
            Boolean()
        );
    }
    expect: {
        var x = {};
        console.log(
            "" + x, +("" + x), !!x,
            "", 0, false
        );
    }
    expect_stdout: true
}

issue_269_dangers: {
    options = {
        unsafe: true,
    }
    input: {
        var x = {};
        console.log(
            String(x, x),
            Number(x, x),
            Boolean(x, x)
        );
    }
    expect: {
        var x = {};
        console.log(String(x, x), Number(x, x), Boolean(x, x));
    }
    expect_stdout: true
}

issue_269_in_scope: {
    options = {
        unsafe: true,
    }
    input: {
        var String, Number, Boolean;
        var x = {};
        console.log(
            String(x),
            Number(x, x),
            Boolean(x)
        );
    }
    expect: {
        var String, Number, Boolean;
        var x = {};
        console.log(String(x), Number(x, x), Boolean(x));
    }
    expect_stdout: true
}

strings_concat: {
    options = {
        strings: true,
        unsafe: true,
    }
    input: {
        var x = {};
        console.log(
            String(x + "str"),
            String("str" + x)
        );
    }
    expect: {
        var x = {};
        console.log(
            x + "str",
            "str" + x
        );
    }
    expect_stdout: true
}

regexp: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        RegExp("foo");
        RegExp("bar", "ig");
        RegExp(foo);
        RegExp("bar", ig);
        RegExp("should", "fail");
    }
    expect: {
        /foo/;
        /bar/ig;
        RegExp(foo);
        RegExp("bar", ig);
        RegExp("should", "fail");
    }
    expect_warnings: [
        'WARN: Error converting RegExp("should","fail") [test/compress/issue-269.js:5,8]',
    ]
}
