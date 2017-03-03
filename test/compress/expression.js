pow: {
    input: {
        var a = 2 ** 7;
        var b = 3;
        b **= 2;
    }
    expect: {
        var a = 2 ** 7;
        var b = 3;
        b **= 2;
    }
}

pow_with_number_constants: {
    input: {
        var a = 5 ** NaN;
        var b = 42 ** +0;
        var c = 42 ** -0;
        var d = NaN ** 1;
        var e = 2 ** Infinity;
        var f = 2 ** -Infinity;
    }
    expect: {
        var a = 5 ** NaN;
        var b = 42 ** +0;
        var c = 42 ** -0;
        var d = NaN ** 1;
        var e = 2 ** (1/0);
        var f = 2 ** -(1/0);
    }
}

pow_with_parentheses: {
    input: {
        var g = (-7) ** (0.5);
        var h = 2324334 ** 34343443;
        var i = (-2324334) ** 34343443;
        var j = 2 ** (-3);
        var k = 2.0 ** -3;
        var l = 2.0 ** (5 - 7);
    }
    expect_exact: "var g=(-7)**.5;var h=2324334**34343443;var i=(-2324334)**34343443;var j=2**-3;var k=2**-3;var l=2**(5-7);"
}

pow_with_unary_between_brackets: {
    input: {
        var a = (-(+5)) ** 3;
    }
    expect: {
        var a = (-+5)**3;
    }
}
