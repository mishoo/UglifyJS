unicode_parse_variables: {
    options = {};
    input: {
        var a = {};
        a.你好 = 456;

        var ↂωↂ = 123;
        var l০ = 3; // 2nd char is a unicode digit
    }
    expect: {
        var a = {};
        a.你好 = 456;

        var ↂωↂ = 123;
        var l০ = 3;
    }
}

unicode_escaped_identifier: {
    input: {
        var \u{61} = "foo";
        var \u{10000} = "bar";
    }
    expect_exact: 'var a="foo";var \u{10000}="bar";';
}

unicode_identifier_ascii_only: {
    beautify = {ascii_only: true}
    input: {
        var \u{0061} = "hi";
        var bar = "h\u{0065}llo";
        var \u{10000} = "testing \u{101111}";
    }
    expect_exact: 'var a="hi";var bar="hello";var \\u{10000}="testing \\u{101111}";'
}

unicode_string_literals: {
    beautify = {ascii_only: true}
    input: {
        var a = "6 length unicode character: \u{101111}";
    }
    expect_exact: 'var a="6 length unicode character: \\u{101111}";'
}
