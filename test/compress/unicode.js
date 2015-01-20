unicode_parse_variables: {
    options = {};
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
