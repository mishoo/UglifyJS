NaN_and_Infinity_must_have_parens: {
    options = {}
    input: {
        Infinity.toString();
        NaN.toString();
    }
    expect: {
        (1/0).toString();
        NaN.toString();
    }
}

NaN_and_Infinity_should_not_be_replaced_when_they_are_redefined: {
    options = {}
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

NaN_and_Infinity_must_have_parens_evaluate: {
    options = {
        evaluate: true,
    }
    input: {
        (123456789 / 0).toString();
        (+"foo").toString();
    }
    expect: {
        (1/0).toString();
        NaN.toString();
    }
}

NaN_and_Infinity_should_not_be_replaced_when_they_are_redefined_evaluate: {
    options = {
        evaluate: true,
    }
    input: {
        var Infinity, NaN;
        (123456789 / 0).toString();
        (+"foo").toString();
    }
    expect: {
        var Infinity, NaN;
        (1/0).toString();
        (0/0).toString();
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

issue_1724: {
    input: {
        var a = 0;
        ++a % Infinity | Infinity ? a++ : 0;
        console.log(a);
    }
    expect_exact: "var a=0;++a%(1/0)|1/0?a++:0;console.log(a);"
    expect_stdout: "2"
}

issue_1725: {
    input: {
        ([].length === 0) % Infinity ? console.log("PASS") : console.log("FAIL");
    }
    expect_exact: '(0===[].length)%(1/0)?console.log("PASS"):console.log("FAIL");'
    expect_stdout: "PASS"
}
