ascii_only_false: {
    options = {}
    beautify = {
        ascii_only: false,
    }
    input: {
        console.log(
            "\x000\x001\x007\x008\x00",
            "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
            "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f",
            "\x20\x21\x22\x23 ... \x7d\x7e\x7f\x80\x81 ... \xfe\xff\u0fff\uffff"
        );
    }
    expect_exact: 'console.log("\\x000\\x001\\x007\\x008\\0","\\0\x01\x02\x03\x04\x05\x06\x07\\b\\t\\n\\v\\f\\r\x0e\x0f","\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f",\' !"# ... }~\x7f\x80\x81 ... \xfe\xff\u0fff\uffff\');'
    expect_stdout: true
}

ascii_only_true: {
    options = {}
    beautify = {
        ascii_only: true,
    }
    input: {
        console.log(
            "\x000\x001\x007\x008\x00",
            "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
            "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f",
            "\x20\x21\x22\x23 ... \x7d\x7e\x7f\x80\x81 ... \xfe\xff\u0fff\uffff"
        );
    }
    expect_exact: 'console.log("\\x000\\x001\\x007\\x008\\0","\\0\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\b\\t\\n\\v\\f\\r\\x0e\\x0f","\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f",\' !"# ... }~\\x7f\\x80\\x81 ... \\xfe\\xff\\u0fff\\uffff\');'
    expect_stdout: true
}

unicode_parse_variables: {
    options = {}
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

unicode_escaped_identifier_1: {
    input: {
        var \u0061 = "\ud800\udc00";
        console.log(a);
    }
    expect_exact: 'var a="\ud800\udc00";console.log(a);'
    expect_stdout: "\ud800\udc00"
}

unicode_escaped_identifier_2: {
    input: {
        var \u{61} = "foo";
        var \u{10000} = "bar";
        console.log(a, \u{10000});
    }
    expect_exact: 'var a="foo";var \u{10000}="bar";console.log(a,\u{10000});'
    expect_stdout: "foo bar"
    // non-BMP support is platform-dependent on Node.js v4
    node_version: ">=6"
}

unicode_identifier_ascii_only: {
    beautify = {
        ascii_only: true,
    }
    input: {
        var \u0061 = "testing \udbc4\udd11";
        var bar = "h\u0065llo";
        console.log(a, \u0062\u0061r);
    }
    expect_exact: 'var a="testing \\udbc4\\udd11";var bar="hello";console.log(a,bar);'
    expect_stdout: "testing \udbc4\udd11 hello"
}

unicode_string_literals: {
    beautify = {
        ascii_only: true,
    }
    input: {
        var a = "6 length unicode character: \udbc4\udd11";
        console.log(\u0061);
    }
    expect_exact: 'var a="6 length unicode character: \\udbc4\\udd11";console.log(a);'
    expect_stdout: "6 length unicode character: \udbc4\udd11"
}

check_escape_style: {
    beautify = {
        ascii_only: true,
    }
    input: {
        var a = "\x01";
        var \ua0081 = "\x10"; // \u0081 only in ID_Continue
        var \u0100 = "\u0100";
        var \u1000 = "\u1000";
        var \u1000 = "\ud800\udc00";
        var \u3f80 = "\udbc0\udc00";
        console.log(\u0061, \ua0081, \u0100, \u1000, \u3f80);
    }
    expect_exact: 'var a="\\x01";var \\ua0081="\\x10";var \\u0100="\\u0100";var \\u1000="\\u1000";var \\u1000="\\ud800\\udc00";var \\u3f80="\\udbc0\\udc00";console.log(a,\\ua0081,\\u0100,\\u1000,\\u3f80);'
    expect_stdout: "\u0001 \u0010 \u0100 \ud800\udc00 \udbc0\udc00"
}

escape_non_escaped_identifier: {
    beautify = {
        ascii_only: true,
    }
    input: {
        var µþ = "µþ";
        console.log(\u00b5þ);
    }
    expect_exact: 'var \\u00b5\\u00fe="\\xb5\\xfe";console.log(\\u00b5\\u00fe);'
    expect_stdout: "µþ"
}

non_escape_2_non_escape: {
    beautify = {
        ascii_only: false,
    }
    input: {
        var µþ = "µþ";
        console.log(\u00b5þ);
    }
    expect_exact: 'var µþ="µþ";console.log(µþ);'
    expect_stdout: "µþ"
}

issue_2242_1: {
    beautify = {
        ascii_only: false,
    }
    input: {
        console.log("\ud83d", "\ude00", "\ud83d\ude00", "\ud83d@\ude00");
    }
    expect_exact: 'console.log("\\ud83d","\\ude00","\ud83d\ude00","\\ud83d@\\ude00");'
    expect_stdout: "\ud83d \ude00 \ud83d\ude00 \ud83d@\ude00"
}

issue_2242_2: {
    beautify = {
        ascii_only: true,
    }
    input: {
        console.log("\ud83d", "\ude00", "\ud83d\ude00", "\ud83d@\ude00");
    }
    expect_exact: 'console.log("\\ud83d","\\ude00","\\ud83d\\ude00","\\ud83d@\\ude00");'
    expect_stdout: "\ud83d \ude00 \ud83d\ude00 \ud83d@\ude00"
}

issue_2242_3: {
    options = {
        evaluate: false,
    }
    input: {
        console.log("\ud83d" + "\ude00", "\ud83d" + "@" + "\ude00");
    }
    expect_exact: 'console.log("\\ud83d"+"\\ude00","\\ud83d"+"@"+"\\ude00");'
    expect_stdout: "\ud83d\ude00 \ud83d@\ude00"
}

issue_2242_4: {
    options = {
        evaluate: true,
    }
    input: {
        console.log("\ud83d" + "\ude00", "\ud83d" + "@" + "\ude00");
    }
    expect_exact: 'console.log("\ud83d\ude00","\\ud83d@\\ude00");'
    expect_stdout: "\ud83d\ude00 \ud83d@\ude00"
}

issue_2569: {
    input: {
        new RegExp("[\udc42-\udcaa\udd74-\udd96\ude45-\ude4f\udea3-\udecc]");
    }
    expect_exact: 'new RegExp("[\\udc42-\\udcaa\\udd74-\\udd96\\ude45-\\ude4f\\udea3-\\udecc]");'
}

surrogate_pair: {
    beautify = {
        ascii_only: false,
    }
    input: {
        var \u{2f800} = {
            \u{2f801}: "\u{100000}",
        };
        \u{2f800}.\u{2f802} = "\u{100001}";
        console.log(typeof \u{2f800}, \u{2f800}.\u{2f801}, \u{2f800}["\u{2f802}"]);
    }
    expect_exact: 'var \ud87e\udc00={"\ud87e\udc01":"\udbc0\udc00"};\ud87e\udc00.\ud87e\udc02="\udbc0\udc01";console.log(typeof \ud87e\udc00,\ud87e\udc00.\ud87e\udc01,\ud87e\udc00["\ud87e\udc02"]);'
    expect_stdout: "object \udbc0\udc00 \udbc0\udc01"
    // non-BMP support is platform-dependent on Node.js v4
    node_version: ">=6"
}

surrogate_pair_ascii: {
    beautify = {
        ascii_only: true,
    }
    input: {
        var \u{2f800} = {
            \u{2f801}: "\u{100000}",
        };
        \u{2f800}.\u{2f802} = "\u{100001}";
        console.log(typeof \u{2f800}, \u{2f800}.\u{2f801}, \u{2f800}["\u{2f802}"]);
    }
    expect_exact: 'var \\u{2f800}={"\\ud87e\\udc01":"\\udbc0\\udc00"};\\u{2f800}.\\u{2f802}="\\udbc0\\udc01";console.log(typeof \\u{2f800},\\u{2f800}.\\u{2f801},\\u{2f800}["\\ud87e\\udc02"]);'
    expect_stdout: "object \udbc0\udc00 \udbc0\udc01"
    // non-BMP support is platform-dependent on Node.js v4
    node_version: ">=6"
}
