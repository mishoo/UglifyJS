and: {
    options = {
        evaluate: true
    }
    input: {
        var a;
        // compress these

        a = true     && condition;
        a = 1        && console.log("a");
        a = 2 * 3    && 2 * condition;
        a = 5 == 5   && condition + 3;
        a = "string" && 4 - condition;
        a = 5 + ""   && condition / 5;
        a = -4.5     && 6 << condition;
        a = 6        && 7;

        a = false     && condition;
        a = NaN       && console.log("b");
        a = 0         && console.log("c");
        a = undefined && 2 * condition;
        a = null      && condition + 3;
        a = 2 * 3 - 6 && 4 - condition;
        a = 10 == 7   && condition / 5;
        a = !"string" && 6 % condition;
        a = 0         && 7;

        // don't compress these

        a = condition        && true;
        a = console.log("a") && 2;
        a = 4 - condition    && "string";
        a = 6 << condition   && -4.5;

        a = condition        && false;
        a = console.log("b") && NaN;
        a = console.log("c") && 0;
        a = 2 * condition    && undefined;
        a = condition + 3    && null;

    }
    expect: {
        var a;

        a = condition;
        a = console.log("a");
        a = 2 * condition;
        a = condition + 3;
        a = 4 - condition;
        a = condition / 5;
        a = 6 << condition;
        a = 7;

        a = false;
        a = NaN;
        a = 0;
        a = void 0;
        a = null;
        a = 0;
        a = false;
        a = false;
        a = 0;

        a = condition        && true;
        a = console.log("a") && 2;
        a = 4 - condition    && "string";
        a = 6 << condition   && -4.5;

        a = condition        && false;
        a = console.log("b") && NaN;
        a = console.log("c") && 0;
        a = 2 * condition    && void 0;
        a = condition + 3    && null;
    }
}

or: {
    options = {
        evaluate: true
    }
    input: {
        var a;
        // compress these

        a = true     || condition;
        a = 1        || console.log("a");
        a = 2 * 3    || 2 * condition;
        a = 5 == 5   || condition + 3;
        a = "string" || 4 - condition;
        a = 5 + ""   || condition / 5;
        a = -4.5     || 6 << condition;
        a = 6        || 7;

        a = false     || condition;
        a = 0         || console.log("b");
        a = NaN       || console.log("c");
        a = undefined || 2 * condition;
        a = null      || condition + 3;
        a = 2 * 3 - 6 || 4 - condition;
        a = 10 == 7   || condition / 5;
        a = !"string" || 6 % condition;
        a = null      || 7;

        a = console.log(undefined && condition || null);
        a = console.log(undefined || condition && null);

        // don't compress these

        a = condition        || true;
        a = console.log("a") || 2;
        a = 4 - condition    || "string";
        a = 6 << condition   || -4.5;

        a = condition        || false;
        a = console.log("b") || NaN;
        a = console.log("c") || 0;
        a = 2 * condition    || undefined;
        a = condition + 3    || null;

    }
    expect: {
        var a;

        a = true;
        a = 1;
        a = 6;
        a = true;
        a = "string";
        a = "5";
        a = -4.5;
        a = 6;

        a = condition;
        a = console.log("b");
        a = console.log("c");
        a = 2 * condition;
        a = condition + 3;
        a = 4 - condition;
        a = condition / 5;
        a = 6 % condition;
        a = 7;

        a = console.log(null);
        a = console.log(condition && null);

        a = condition        || true;
        a = console.log("a") || 2;
        a = 4 - condition    || "string";
        a = 6 << condition   || -4.5;

        a = condition        || false;
        a = console.log("b") || NaN;
        a = console.log("c") || 0;
        a = 2 * condition    || void 0;
        a = condition + 3    || null;
    }
}

unary_prefix: {
    options = {
        evaluate: true
    }
    input: {
        a = !0 && b;
        a = !0 || b;
        a = ~1 && b;
        a = ~1 || b;
        a = -2 && b;
        a = -2 || b;
        a = +3 && b;
        a = +3 || b;
    }
    expect: {
        a = b;
        a = !0;
        a = b;
        a = -2;
        a = b;
        a = -2;
        a = b;
        a = 3;
    }
}

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
    expect_stdout: true
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
    expect_stdout: true
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
        var a = 5 ** NaN;
        /* NaN exponent results to NaN */
        var b = 42 ** +0;
        /* +0 exponent results to NaN */
        var c = 42 ** -0;
        /* -0 exponent results to NaN */
        var d = NaN ** 1;
        /* NaN with non-zero exponent is NaN */
        var e = 2 ** Infinity;
        /* abs(base) > 1 with Infinity as exponent is Infinity */
        var f = 2 ** -Infinity;
        /* abs(base) > 1 with -Infinity as exponent is +0 */
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

unsafe_constant: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            true.a,
            false.a,
            null.a,
            undefined.a
        );
    }
    expect: {
        console.log(
            true.a,
            false.a,
            null.a,
            (void 0).a
        );
    }
    expect_stdout: true
}

unsafe_object: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:1}) + 1,
            ({a:1}).a + 1,
            ({a:1}).b + 1,
            ({a:1}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:1}) + 1,
            2,
            ({a:1}).b + 1,
            1..b + 1
        );
    }
    expect_stdout: true
}

unsafe_object_nested: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:{b:1}}) + 1,
            ({a:{b:1}}).a + 1,
            ({a:{b:1}}).b + 1,
            ({a:{b:1}}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:{b:1}}) + 1,
            ({a:{b:1}}).a + 1,
            ({a:{b:1}}).b + 1,
            2
        );
    }
    expect_stdout: true
}

unsafe_object_complex: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:{b:1},b:1}) + 1,
            ({a:{b:1},b:1}).a + 1,
            ({a:{b:1},b:1}).b + 1,
            ({a:{b:1},b:1}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:{b:1},b:1}) + 1,
            ({a:{b:1},b:1}).a + 1,
            2,
            2
        );
    }
    expect_stdout: true
}

unsafe_object_repeated: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:{b:1},a:1}) + 1,
            ({a:{b:1},a:1}).a + 1,
            ({a:{b:1},a:1}).b + 1,
            ({a:{b:1},a:1}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:{b:1},a:1}) + 1,
            2,
            ({a:{b:1},a:1}).b + 1,
            1..b + 1
        );
    }
    expect_stdout: true
}

unsafe_object_accessor: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        function f() {
            var a = {
                get b() {},
                set b() {}
            };
            return {a:a};
        }
    }
    expect: {
        function f() {
            var a = {
                get b() {},
                set b() {}
            };
            return {a:a};
        }
    }
}

unsafe_function: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:{b:1},b:function(){}}) + 1,
            ({a:{b:1},b:function(){}}).a + 1,
            ({a:{b:1},b:function(){}}).b + 1,
            ({a:{b:1},b:function(){}}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:{b:1},b:function(){}}) + 1,
            ({a:{b:1},b:function(){}}).a + 1,
            ({a:{b:1},b:function(){}}).b + 1,
            ({a:{b:1},b:function(){}}).a.b + 1
        );
    }
    expect_stdout: true
}

unsafe_integer_key: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({0:1}) + 1,
            ({0:1})[0] + 1,
            ({0:1})["0"] + 1,
            ({0:1})[1] + 1,
            ({0:1})[0][1] + 1,
            ({0:1})[0]["1"] + 1
        );
    }
    expect: {
        console.log(
            ({0:1}) + 1,
            2,
            2,
            ({0:1})[1] + 1,
            1[1] + 1,
            1["1"] + 1
        );
    }
    expect_stdout: true
}

unsafe_integer_key_complex: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({0:{1:1},1:1}) + 1,
            ({0:{1:1},1:1})[0] + 1,
            ({0:{1:1},1:1})["0"] + 1,
            ({0:{1:1},1:1})[1] + 1,
            ({0:{1:1},1:1})[0][1] + 1,
            ({0:{1:1},1:1})[0]["1"] + 1
        );
    }
    expect: {
        console.log(
            ({0:{1:1},1:1}) + 1,
            "[object Object]1",
            "[object Object]1",
            2,
            2,
            2
        );
    }
    expect_stdout: true
}

unsafe_float_key: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({2.72:1}) + 1,
            ({2.72:1})[2.72] + 1,
            ({2.72:1})["2.72"] + 1,
            ({2.72:1})[3.14] + 1,
            ({2.72:1})[2.72][3.14] + 1,
            ({2.72:1})[2.72]["3.14"] + 1
        );
    }
    expect: {
        console.log(
            ({2.72:1}) + 1,
            2,
            2,
            ({2.72:1})[3.14] + 1,
            1[3.14] + 1,
            1["3.14"] + 1
        );
    }
    expect_stdout: true
}

unsafe_float_key_complex: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({2.72:{3.14:1},3.14:1}) + 1,
            ({2.72:{3.14:1},3.14:1})[2.72] + 1,
            ({2.72:{3.14:1},3.14:1})["2.72"] + 1,
            ({2.72:{3.14:1},3.14:1})[3.14] + 1,
            ({2.72:{3.14:1},3.14:1})[2.72][3.14] + 1,
            ({2.72:{3.14:1},3.14:1})[2.72]["3.14"] + 1
        );
    }
    expect: {
        console.log(
            "[object Object]1",
            "[object Object]1",
            "[object Object]1",
            2,
            2,
            2
        );
    }
    expect_stdout: true
}

unsafe_array: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            [1, , 3][1],
            [1, 2, 3, a] + 1,
            [1, 2, 3, 4] + 1,
            [1, 2, 3, a][0] + 1,
            [1, 2, 3, 4][0] + 1,
            [1, 2, 3, 4][6 - 5] + 1,
            [1, , 3, 4][6 - 5] + 1,
            [[1, 2], [3, 4]][0] + 1,
            [[1, 2], [3, 4]][6 - 5][1] + 1,
            [[1, 2], , [3, 4]][6 - 5][1] + 1
        );
    }
    expect: {
        console.log(
            void 0,
            [1, 2, 3, a] + 1,
            "1,2,3,41",
            [1, 2, 3, a][0] + 1,
            2,
            3,
            NaN,
            "1,21",
            5,
            (void 0)[1] + 1
        );
    }
    expect_stdout: true
}

unsafe_string: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            "1234" + 1,
            "1234"[0] + 1,
            "1234"[6 - 5] + 1,
            ("12" + "34")[0] + 1,
            ("12" + "34")[6 - 5] + 1,
            [1, 2, 3, 4].join("")[0] + 1
        );
    }
    expect: {
        console.log(
            "12341",
            "11",
            "21",
            "11",
            "21",
            "11"
        );
    }
    expect_stdout: true
}

unsafe_array_bad_index: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            [1, 2, 3, 4].a + 1,
            [1, 2, 3, 4]["a"] + 1,
            [1, 2, 3, 4][3.14] + 1
        );
    }
    expect: {
        console.log(
            [1, 2, 3, 4].a + 1,
            [1, 2, 3, 4]["a"] + 1,
            [1, 2, 3, 4][3.14] + 1
        );
    }
    expect_stdout: true
}

unsafe_string_bad_index: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            "1234".a + 1,
            "1234"["a"] + 1,
            "1234"[3.14] + 1
        );
    }
    expect: {
        console.log(
            "1234".a + 1,
            "1234"["a"] + 1,
            "1234"[3.14] + 1
        );
    }
    expect_stdout: true
}

unsafe_prototype_function: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        var a = ({valueOf: 0}) < 1;
        var b = ({toString: 0}) < 1;
        var c = ({valueOf: 0}) + "";
        var d = ({toString: 0}) + "";
        var e = (({valueOf: 0}) + "")[2];
        var f = (({toString: 0}) + "")[2];
        var g = ({valueOf: 0}).valueOf();
        var h = ({toString: 0}).toString();
    }
    expect: {
        var a = ({valueOf: 0}) < 1;
        var b = ({toString: 0}) < 1;
        var c = ({valueOf: 0}) + "";
        var d = ({toString: 0}) + "";
        var e = (({valueOf: 0}) + "")[2];
        var f = (({toString: 0}) + "")[2];
        var g = ({valueOf: 0}).valueOf();
        var h = "" + ({toString: 0});
    }
}

call_args: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        const a = 1;
        console.log(a);
        +function(a) {
            return a;
        }(a);
    }
    expect: {
        const a = 1;
        console.log(1);
        +(1, 1);
    }
    expect_stdout: true
}

call_args_drop_param: {
    options = {
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        unused: true,
    }
    input: {
        const a = 1;
        console.log(a);
        +function(a) {
            return a;
        }(a, b);
    }
    expect: {
        const a = 1;
        console.log(1);
        +(b, 1);
    }
    expect_stdout: true
}

in_boolean_context: {
    options = {
        booleans: true,
        evaluate: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        console.log(
            !42,
            !"foo",
            ![1, 2],
            !/foo/,
            !b(42),
            !b("foo"),
            !b([1, 2]),
            !b(/foo/),
            ![1, foo()],
            ![1, foo(), 2]
        );
    }
    expect: {
        console.log(
            !1,
            !1,
            !1,
            !1,
            !b(42),
            !b("foo"),
            !b([1, 2]),
            !b(/foo/),
            ![1, foo()],
            (foo(), !1)
        );
    }
    expect_stdout: true
}

unsafe_charAt: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            "1234" + 1,
            "1234".charAt(0) + 1,
            "1234".charAt(6 - 5) + 1,
            ("12" + "34").charAt(0) + 1,
            ("12" + "34").charAt(6 - 5) + 1,
            [1, 2, 3, 4].join("").charAt(0) + 1
        );
    }
    expect: {
        console.log(
            "12341",
            "11",
            "21",
            "11",
            "21",
            "11"
        );
    }
    expect_stdout: true
}

unsafe_charAt_bad_index: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            "1234".charAt() + 1,
            "1234".charAt("a") + 1,
            "1234".charAt(3.14) + 1
        );
    }
    expect: {
        console.log(
            "11",
            "11",
            "41"
        );
    }
    expect_stdout: true
}

unsafe_charAt_noop: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            s.charAt(0),
            "string".charAt(x)
        );
    }
    expect: {
        console.log(
            s.charAt(0),
            "string".charAt(x)
        );
    }
}
