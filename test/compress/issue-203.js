
compress_new_function: {
    options = {
        unsafe: true
    }
    input: {
        new Function("aa, bb", 'return aa;');
    }
    expect: {
        Function("a", "b", "return a");
    }
}

compress_new_function_with_destruct: {
    options = {
        unsafe: true
    }
    input: {
        new Function("aa, [bb]", 'return aa;');
        new Function("aa, {bb}", 'return aa;');
        new Function("[[aa]], [{bb}]", 'return aa;');
    }
    expect: {
        Function("a", "[b]", "return a");
        Function("a", "{bb}", "return a");
        Function("[[a]]", "[{bb}]", 'return a');
    }
}


