parenthesis_strings_in_parenthesis: {
    input: {
        var foo = ('(');
        a(')');

    }
    expect_exact: 'var foo="(";a(")");'
}
