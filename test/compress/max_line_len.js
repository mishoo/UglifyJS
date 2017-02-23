too_short: {
    beautify = {
        max_line_len: 10,
    }
    input: {
        function f(a) {
            return { c: 42, d: a(), e: "foo"};
        }
    }
    expect_exact: 'function f(a){\nreturn{\nc:42,\nd:a(),\ne:"foo"}}'
    expect_warnings: [
        "WARN: Output exceeds 10 characters"
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
    expect_exact: 'function f(a){\nreturn{c:42,\nd:a(),e:"foo"}\n}'
    expect_warnings: [
    ]
}
