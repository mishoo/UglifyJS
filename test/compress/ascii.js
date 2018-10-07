ascii_only_true: {
    options = {}
    beautify = {
        ascii_only : true,
        ie8        : false,
        beautify   : false,
    }
    input: {
        function f() {
            return "\x000\x001\x007\x008\x00" +
                   "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f" +
                   "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f" +
                   "\x20\x21\x22\x23 ... \x7d\x7e\x7f\x80\x81 ... \xfe\xff\u0fff\uffff";
        }
    }
    expect_exact: 'function f(){return"\\x000\\x001\\x007\\x008\\0"+"\\0\\01\\02\\03\\04\\05\\06\\07\\b\\t\\n\\v\\f\\r\\x0e\\x0f"+"\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f"+\' !"# ... }~\\x7f\\x80\\x81 ... \\xfe\\xff\\u0fff\\uffff\'}'
}

ascii_only_false: {
    options = {}
    beautify = {
        ascii_only : false,
        ie8        : false,
        beautify   : false,
    }
    input: {
        function f() {
            return "\x000\x001\x007\x008\x00" +
                   "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f" +
                   "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f" +
                   "\x20\x21\x22\x23 ... \x7d\x7e\x7f\x80\x81 ... \xfe\xff\u0fff\uffff";
        }
    }
    expect_exact: 'function f(){return"\\x000\\x001\\x007\\x008\\0"+"\\0\\01\\02\\03\\04\\05\\06\\07\\b\\t\\n\\v\\f\\r\\x0e\\x0f"+"\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f"+\' !"# ... }~\\x7f\x80\x81 ... \xfe\xff\u0fff\uffff\'}'
}
