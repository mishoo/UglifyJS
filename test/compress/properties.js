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
    }
    expect: {
        a.foo = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a.\u0EB3 = "unicode";
        a[""] = "whitespace";
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
        a.\u0EB3 = "unicode";
        a[""] = "whitespace";
    }
}
