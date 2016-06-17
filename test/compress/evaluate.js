negative_zero: {
    options = { evaluate: true }
    input: {
        console.log(
            -"",
            - -"",
            1 / (-0),
            1 / (-"")
        );
    }
    expect: {
        console.log(
            -0,
            0,
            1 / (-0),
            1 / (-0)
        );
    }
}

positive_zero: {
    options = { evaluate: true }
    input: {
        console.log(
            +"",
            + -"",
            1 / (+0),
            1 / (+"")
        );
    }
    expect: {
        console.log(
            0,
            -0,
            1 / (0),
            1 / (0)
        );
    }
}

pow: {
    options = { evaluate: true }
    input: {
        var a = 5 ** 3;
    }
    expect: {
        var a = 125;
    }
}

pow_sequence: {
    options = {
        evaluate: true
    }
    input: {
        var a = 2 ** 3 ** 2;
    }
    expect: {
        var a = 512;
    }
}

pow_mixed: {
    options = {
        evaluate: true
    }
    input: {
        var a = 5 + 2 ** 3 + 5;
        var b = 5 * 3 ** 2;
        var c = 5 ** 3 * 2;
        var d = 5 ** +3;
    }
    expect: {
        var a = 18;
        var b = 45;
        var c = 250;
        var d = 125;
    }
}

pow_with_right_side_evaluating_to_unary: {
    options = {
        evaluate: true
    }
    input: {
        var a = (4 - 7) ** foo;
        var b = ++bar ** 3;
        var c = --baz ** 2;
    }
    expect_exact: "var a=(-3)**foo;var b=++bar**3;var c=--baz**2;"
}

pow_with_number_constants: {
    options = {
        evaluate: true
    }
    input: {
        var a = 5 ** NaN; /* NaN exponent results to NaN */
        var b = 42 ** +0; /* +0 exponent results to NaN */
        var c = 42 ** -0; /* -0 exponent results to NaN */
        var d = NaN ** 1; /* NaN with non-zero exponent is NaN */
        var e = 2 ** Infinity; /* abs(base) > 1 with Infinity as exponent is Infinity */
        var f = 2 ** -Infinity; /* abs(base) > 1 with -Infinity as exponent is +0 */
        var g = (-7) ** (0.5);
        var h = 2324334 ** 34343443;
        var i = (-2324334) ** 34343443;
        var j = 2 ** (-3);
        var k = 2.0 ** -3;
        var l = 2.0 ** (5 - 7);
        var m = 3 ** -10;  // Result will be 0.000016935087808430286, which is too long
    }
    expect: {
        var a = NaN;
        var b = 1;
        var c = 1;
        var d = NaN;
        var e = Infinity;
        var f = 0;
        var g = NaN;
        var h = Infinity;
        var i = -Infinity;
        var j = .125;
        var k = .125;
        var l = .25;
        var m = 3 ** -10;
    }
}
