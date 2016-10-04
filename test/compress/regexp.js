regexp: {
    options = {}
    beautify = {
        ascii_only       : false,
        xml_safe         : false,
        unescape_regexps : true,
        screw_ie8        : true,
        beautify         : false,
    }
    input: {
        function f() {
            return /[\x00\x0d\x1f \x61\u0fff\ud800\ufffe\uffff]/;
        }
    }
    expect_exact: 'function f(){return/[\\x00\\x0d\x1f a\u0fff\ud800\ufffe\\uffff]/}'
}

regexp_ascii_only_true: {
    options = {}
    beautify = {
        ascii_only       : true,
        xml_safe         : false,
        unescape_regexps : true,
        screw_ie8        : true,
        beautify         : false,
    }
    input: {
        function f() {
            return /[\x00\x0d\x1f \x61\u0fff\ud800\ufffe\uffff]/;
        }
    }
    expect_exact: 'function f(){return/[\\x00\\x0d\\x1f \\x61\\u0fff\\ud800\\ufffe\\uffff]/}'
}

regexp_xml_safe_true: {
    options = {}
    beautify = {
        ascii_only       : false,
        xml_safe         : true,
        unescape_regexps : true,
        screw_ie8        : true,
        beautify         : false,
    }
    input: {
        function f() {
            return /[\x00\x0d\x1f \x61\u0fff\ud800\ufffe\uffff]/;
        }
    }
    expect_exact: 'function f(){return/[\\x00\\x0d\\x1f a\u0fff\\ud800\\ufffe\\uffff]/}'
}
