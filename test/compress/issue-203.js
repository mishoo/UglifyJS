
compress_new_function: {
    options = {
        unsafe: true,
        unsafe_Func: true,
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
        unsafe: true,
        unsafe_Func: true,
        ecma: 6
    }
    beautify = {
        ecma: 6
    }
    input: {
        new Function("aa, [bb]", 'return aa;');
        new Function("aa, {bb}", 'return aa;');
        new Function("[[aa]], [{bb}]", 'return aa;');
    }
    expect: {
        Function("a", "[b]", "return a");
        Function("a", "{bb:b}", "return a");
        Function("[[a]]", "[{bb:b}]", 'return a');
    }
}

compress_new_function_with_destruct_arrows: {
    options = {
        arrows: true,
        unsafe: true,
        unsafe_Func: true,
        ecma: 6
    }
    beautify = {
        ecma: 6
    }
    input: {
        new Function("aa, [bb]", 'return aa;');
        new Function("aa, {bb}", 'return aa;');
        new Function("[[aa]], [{bb}]", 'return aa;');
    }
    expect: {
        Function("aa, [bb]", 'return aa;');
        Function("aa, {bb}", 'return aa;');
        Function("[[aa]], [{bb}]", 'return aa;');
    }
}
