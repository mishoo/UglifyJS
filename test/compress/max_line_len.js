too_short: {
    beautify = {
        max_line_len: 10,
    }
    input: {
        function f(a) {
            return { c: 42, d: a(), e: "foo"};
        }
    }
    expect_exact: [
        "function f(",
        "a){return{",
        "c:42,d:a(",
        '),e:"foo"}',
        "}",
    ]
    expect_warnings: [
        "WARN: Output exceeds 10 characters",
    ]
}

just_enough: {
    beautify = {
        max_line_len: 14,
    }
    input: {
        function f(a) {
            return { c: 42, d: a(), e: "foo"};
        }
    }
    expect_exact: [
        "function f(a){",
        "return{c:42,",
        'd:a(),e:"foo"}',
        "}",
    ]
    expect_warnings: []
}

drop_semicolon: {
    beautify = {
        max_line_len: 5,
        semicolons: true,
    }
    input: {
        var a;
        console.log(a || 42);
    }
    expect_exact: [
        "var a",
        "console.log(",
        "a||42",
        ");",
    ]
    expect_stdout: "42"
    expect_warnings: [
        "WARN: Output exceeds 5 characters",
    ]
}

template_newline: {
    beautify = {
        max_line_len: 2,
    }
    input: {
        console.log(`foo
bar`);
    }
    expect_exact: [
        "console.log(",
        "`foo",
        "bar`",
        ");",
    ]
    expect_stdout: [
        "foo",
        "bar",
    ]
    expect_warnings: [
        "WARN: Output exceeds 2 characters",
    ]
    node_version: ">=4"
}

issue_304: {
    beautify = {
        max_line_len: 10,
    }
    input: {
        var a = 0, b = 0, c = 0, d = 0, e = 0;
    }
    expect_exact: [
        "var a=0,",
        "b=0,c=0,",
        "d=0,e=0;",
    ]
    expect_warnings: []
}
