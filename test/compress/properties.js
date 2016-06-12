keep_properties: {
    options = {
        properties: false
    };
    input: {
        a["foo"] = "bar";
    }
    expect: {
        a["foo"] = "bar";
    }
}

dot_properties: {
    options = {
        properties: true
    };
    input: {
        a["foo"] = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
        a["1_1"] = "foo";
    }
    expect: {
        a.foo = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
        a["1_1"] = "foo";
    }
}

dot_properties_es5: {
    options = {
        properties: true,
        screw_ie8: true
    };
    input: {
        a["foo"] = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
    }
    expect: {
        a.foo = "bar";
        a.if = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
    }
}

evaluate_length: {
    options = {
        properties: true,
        unsafe: true,
        evaluate: true
    };
    input: {
        a = "foo".length;
        a = ("foo" + "bar")["len" + "gth"];
        a = b.length;
        a = ("foo" + b).length;
    }
    expect: {
        a = 3;
        a = 6;
        a = b.length;
        a = ("foo" + b).length;
    }
}

mangle_properties: {
    mangle_props = {
        ignore_quoted: false
    };
    input: {
        a["foo"] = "bar";
        a.color = "red";
        x = {"bar": 10};
    }
    expect: {
        a["a"] = "bar";
        a.b = "red";
        x = {c: 10};
    }
}

mangle_unquoted_properties: {
    mangle_props = {
        ignore_quoted: true
    }
    beautify = {
        beautify: false,
        quote_style: 3,
        keep_quoted_props: true,
    }
    input: {
        function f1() {
            a["foo"] = "bar";
            a.color = "red";
            x = {"bar": 10};
        }
        function f2() {
            a.foo = "bar";
            a['color'] = "red";
            x = {bar: 10};
        }
    }
    expect: {
        function f1() {
            a["foo"] = "bar";
            a.a = "red";
            x = {"bar": 10};
        }
        function f2() {
            a.b = "bar";
            a['color'] = "red";
            x = {c: 10};
        }
    }
}
