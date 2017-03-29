NaN_and_Infinity_must_have_parens: {
    options = {};
    input: {
        Infinity.toString();
        NaN.toString();
    }
    expect: {
        (1/0).toString();
        (0/0).toString();
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

beautify_off_1: {
    options = {
        evaluate: true,
    }
    beautify = {
        beautify: false,
    }
    input: {
        var NaN;
        console.log(
            null,
            undefined,
            Infinity,
            NaN,
            Infinity * undefined,
            Infinity.toString(),
            NaN.toString(),
            (Infinity * undefined).toString()
        );
    }
    expect_exact: "var NaN;console.log(null,void 0,1/0,NaN,0/0,(1/0).toString(),NaN.toString(),(0/0).toString());"
    expect_stdout: true
}

beautify_off_2: {
    options = {
        evaluate: true,
    }
    beautify = {
        beautify: false,
    }
    input: {
        console.log(
            null.toString(),
            undefined.toString()
        );
    }
    expect_exact: "console.log(null.toString(),(void 0).toString());"
}

beautify_on_1: {
    options = {
        evaluate: true,
    }
    beautify = {
        beautify: true,
    }
    input: {
        var NaN;
        console.log(
            null,
            undefined,
            Infinity,
            NaN,
            Infinity * undefined,
            Infinity.toString(),
            NaN.toString(),
            (Infinity * undefined).toString()
        );
    }
    expect_exact: [
        "var NaN;",
        "",
        "console.log(null, void 0, 1 / 0, NaN, 0 / 0, (1 / 0).toString(), NaN.toString(), (0 / 0).toString());",
    ]
    expect_stdout: true
}

beautify_on_2: {
    options = {
        evaluate: true,
    }
    beautify = {
        beautify: true,
    }
    input: {
        console.log(
            null.toString(),
            undefined.toString()
        );
    }
    expect_exact: "console.log(null.toString(), (void 0).toString());"
}
