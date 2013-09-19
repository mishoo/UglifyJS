concatenate_rhs_strings: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        foo(bar() + 123 + "Hello" + "World");
        foo("Hello" + bar() + 123 + "World");
    }
    expect: {
        foo(bar() + 123 + "HelloWorld");
        foo("Hello" + bar() + "123World");
    }
}
