
compress_new_function: {
    options = {
        unsafe: true,
        unsafe_Function: true,
    }
    input: {
        new Function("aa, bb", 'return aa;');
    }
    expect: {
        Function("n,r", "return n");
    }
}

compress_new_function_with_destruct: {
    options = {
        unsafe: true,
        unsafe_Function: true,
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
        Function("n,[r]", "return n");
        Function("n,{bb:b}", "return n");
        Function("[[n]],[{bb:b}]", "return n");
    }
}

compress_new_function_with_destruct_arrows: {
    options = {
        arrows: true,
        unsafe_arrows: true,
        unsafe: true,
        unsafe_Function: true,
        ecma: 6,
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
        Function("n,[a]", "return n");
        Function("b,{bb:n}", "return b");
        Function("[[b]],[{bb:n}]", "return b");
    }
}
