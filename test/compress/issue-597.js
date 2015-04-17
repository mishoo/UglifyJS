NaN_and_Infinity_must_have_parens: {
    options = {};
    input: {
        Infinity.toString();
        NaN.toString();
    }
    expect: {
        (1/0).toString();
        NaN.toString();         // transformation to 0/0 dropped
    }
}

NaN_and_Infinity_should_not_be_replaced_when_they_are_redefined: {
    options = {};
    input: {
        var Infinity, NaN;
        Infinity.toString();
        NaN.toString();
    }
    expect: {
        var Infinity, NaN;
        Infinity.toString();
        NaN.toString();
    }
}
