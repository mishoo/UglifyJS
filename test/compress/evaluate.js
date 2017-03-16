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
}
