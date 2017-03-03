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
    beautify = {ecma: 6}
    input: {
        var \u{61} = "foo";
        var \u{10000} = "bar";
    }
    expect_exact: 'var a="foo";var \u{10000}="bar";';
}

unicode_identifier_ascii_only: {
    beautify = {ascii_only: true, ecma: 6}
    input: {
        var \u{0061} = "hi";
        var bar = "h\u{0065}llo";
        var \u{10000} = "testing \u{101111}";
    }
    expect_exact: 'var a="hi";var bar="hello";var \\u{10000}="testing \\u{101111}";'
}

unicode_string_literals: {
    beautify = {ascii_only: true, ecma: 6}
    input: {
        var a = "6 length unicode character: \u{101111}";
    }
    expect_exact: 'var a="6 length unicode character: \\u{101111}";'
}

// Don't escape identifiers below es6 (or in this case double escaped in expect_exact)
unicode_output_es5_surrogates: {
    beautify = {ascii_only: true, ecma: 5}
    input: {
        var \u{10000} = "6 length unicode character: \u{10FFFF}";
    }
    expect_exact: 'var \u{10000}="6 length unicode character: \\udbff\\udfff";'
}

check_escape_style: {
    beautify = {ascii_only: true, ecma: 6}
    input: {
        var a = "\x01";
        var \ua0081 = "\x10"; // \u0081 only in ID_Continue
        var \u0100 = "\u0100";
        var \u1000 = "\u1000";
        var \u{10000} = "\u{10000}";
        var \u{2f800} = "\u{100000}";
    }
    expect_exact: 'var a="\\x01";var \\ua0081="\\x10";var \\u0100="\\u0100";var \\u1000="\\u1000";var \\u{10000}="\\u{10000}";var \\u{2f800}="\\u{100000}";'
}

// Don't escape identifiers below es6, no escaped identifiers support and no \u{} syntax
check_escape_style_es5: {
    beautify = {ascii_only: true, ecma: 5}
    input: {
        var a = "\x01";
        var \ua0081 = "\x10"; // \u0081 only in ID_Continue
        var \u0100 = "\u0100";
        var \u1000 = "\u1000";
        var \u{10000} = "\u{10000}"; // Identifier won't be escaped in es 5.1
        var \u{2f800} = "\u{100000}"; // Same
    }
    expect_exact: 'var a="\\x01";var \\ua0081="\\x10";var \\u0100="\\u0100";var \\u1000="\\u1000";var \ud800\udc00="\\ud800\\udc00";var \ud87e\udc00="\\udbc0\\udc00";'
}

ID_continue_with_surrogate_pair: {
    beautify = {ascii_only: true, ecma: 6}
    input: {
        var \u{2f800}\u{2f800}\u{2f800}\u{2f800} = "\u{100000}\u{100000}\u{100000}\u{100000}\u{100000}";
    }
    expect_exact: 'var \\u{2f800}\\u{2f800}\\u{2f800}\\u{2f800}="\\u{100000}\\u{100000}\\u{100000}\\u{100000}\\u{100000}";'
}

escape_non_escaped_identifier: {
    beautify = {ascii_only: true, ecma: 6}
    input: {
        var µþ = "µþ";
    }
    expect_exact: 'var \\u00b5\\u00fe="\\xb5\\xfe";'
}

non_escape_2_non_escape: {
    beautify = {ascii_only: false, ecma: 6}
    input: {
        var µþ = "µþ";
    }
    expect_exact: 'var µþ="µþ";'
}

non_escape_2_half_escape1: {
    beautify = {ascii_only: false, ascii_identifiers: true, ecma: 6}
    input: {
        var µþ = "µþ";
    }
    expect_exact: 'var \\u00b5\\u00fe="µþ";'
}

non_escape_2_half_escape2: {
    beautify = {ascii_only: true, ascii_identifiers: false, ecma: 6}
    input: {
        var µþ = "µþ";
    }
    expect_exact: 'var µþ="\\xb5\\xfe";'
}