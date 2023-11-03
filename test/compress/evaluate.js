and: {
    options = {
        evaluate: true,
        side_effects: true,
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
        evaluate: true,
        side_effects: true,
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
        evaluate: true,
        side_effects: true,
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
    options = {
        evaluate: true,
    }
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
            -1/0,
            -1/0
        );
    }
    expect_stdout: true
}

positive_zero: {
    options = {
        evaluate: true,
    }
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
            1/0,
            1/0
        );
    }
    expect_stdout: true
}

unsafe_constant: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(true.a, false.a);
        console.log(true.valueOf(), false.valueOf());
        try {
            console.log(null.a);
        } catch (e) {
            console.log("PASS");
        }
        try {
            console.log(undefined.a);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        console.log(void 0, void 0);
        console.log(true, false);
        try {
            console.log(null.a);
        } catch (e) {
            console.log("PASS");
        }
        try {
            console.log((void 0).a);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: [
        "undefined undefined",
        "true false",
        "PASS",
        "PASS",
    ]
}

unsafe_object: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var o = { a: 1 };
        console.log(
            o + 1,
            o.a + 1,
            o.b + 1,
            o.a.b + 1
        );
    }
    expect: {
        var o = { a: 1 };
        console.log(
            o + 1,
            2,
            o.b + 1,
            NaN
        );
    }
    expect_stdout: true
}

unsafe_object_nested: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var o = { a: { b: 1 } };
        console.log(
            o + 1,
            o.a + 1,
            o.b + 1,
            o.a.b + 1
        );
    }
    expect: {
        var o = { a: { b: 1 } };
        console.log(
            o + 1,
            o.a + 1,
            o.b + 1,
            2
        );
    }
    expect_stdout: true
}

unsafe_object_complex: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var o = { a: { b: 1 }, b: 1 };
        console.log(
            o + 1,
            o.a + 1,
            o.b + 1,
            o.a.b + 1
        );
    }
    expect: {
        var o = { a: { b: 1 }, b: 1 };
        console.log(
            o + 1,
            o.a + 1,
            2,
            2
        );
    }
    expect_stdout: true
}

unsafe_object_repeated: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var o = { a: { b: 1 }, a: 1 };
        console.log(
            o + 1,
            o.a + 1,
            o.b + 1,
            o.a.b + 1
        );
    }
    expect: {
        var o = { a: { b: 1 }, a: 1 };
        console.log(
            o + 1,
            2,
            o.b + 1,
            NaN
        );
    }
    expect_stdout: true
}

unsafe_object_accessor: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        function f() {
            var a = {
                get b() {},
                set b(v) {},
            };
            return { a: a };
        }
    }
    expect: {
        function f() {
            var a = {
                get b() {},
                set b(v) {},
            };
            return { a: a };
        }
    }
}

prop_function: {
    options = {
        evaluate: true,
        properties: true,
        side_effects: true,
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
            ({b:1}) + 1,
            function(){} + 1,
            2
        );
    }
    expect_stdout: true
}

unsafe_integer_key: {
    options = {
        evaluate: true,
        unsafe: true,
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
            NaN,
            NaN
        );
    }
    expect_stdout: true
}

unsafe_integer_key_complex: {
    options = {
        evaluate: true,
        unsafe: true,
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
        evaluate: true,
        unsafe: true,
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
            NaN,
            NaN
        );
    }
    expect_stdout: true
}

unsafe_float_key_complex: {
    options = {
        evaluate: true,
        unsafe: true,
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
        evaluate: true,
        unsafe: true,
    }
    input: {
        var a = "PASS";
        Array.prototype[1] = a;
        console.log([, ].length);
        console.log("" + [, , ]);
        console.log([1, , 3][1]);
        console.log([1, 2, 3, a] + 1);
        console.log([1, 2, 3, 4] + 1);
        console.log([1, 2, 3, a][0] + 1);
        console.log([1, 2, 3, 4][0] + 1);
        console.log([1, 2, 3, 4][6 - 5] + 1);
        console.log([1, , 3, 4][6 - 5] + 1);
        console.log([[1, 2], [3, 4]][0] + 1);
        console.log([[1, 2], [3, 4]][6 - 5][1] + 1);
        console.log([[1, 2], , [3, 4]][6 - 5][1] + 1);
    }
    expect: {
        var a = "PASS";
        Array.prototype[1] = a;
        console.log([, ].length);
        console.log("" + [, , ]);
        console.log([1, , 3][1]);
        console.log([1, 2, 3, a] + 1);
        console.log("1,2,3,41");
        console.log([1, 2, 3, a][0] + 1);
        console.log(2);
        console.log(3);
        console.log([1, , 3, 4][1] + 1);
        console.log("1,21");
        console.log(5);
        console.log([[1, 2], , [3, 4]][1][1] + 1);
    }
    expect_stdout: [
        "1",
        ",PASS",
        "PASS",
        "1,2,3,PASS1",
        "1,2,3,41",
        "2",
        "2",
        "3",
        "PASS1",
        "1,21",
        "5",
        "A1",
    ]
}

unsafe_string: {
    options = {
        evaluate: true,
        unsafe: true,
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
        evaluate: true,
        unsafe: true,
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
        evaluate: true,
        unsafe: true,
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
            NaN,
            NaN,
            NaN
        );
    }
    expect_stdout: "NaN NaN NaN"
}

prototype_function: {
    options = {
        evaluate: true,
        properties: true,
        side_effects: true,
    }
    input: {
        function v() {
            return this.valueOf === v ? "PASS" : "FAIL";
        }
        console.log(({ valueOf: v }) < 1);
        console.log(({ valueOf: v }) + "");
        console.log((( {valueOf: v }) + "")[2]);
        console.log(({ valueOf: v }).valueOf());
        function t() {
            return this.toString === t ? "PASS" : "FAIL";
        }
        console.log(({ toString: t }) < 1);
        console.log(({ toString: t }) + "");
        console.log((( {toString: t }) + "")[2]);
        console.log(({ toString: t }).toString());
    }
    expect: {
        function v() {
            return this.valueOf === v ? "PASS" : "FAIL";
        }
        console.log(({ valueOf: v }) < 1);
        console.log(({ valueOf: v }) + "");
        console.log((( {valueOf: v }) + "")[2]);
        console.log(({ valueOf: v }).valueOf());
        function t() {
            return this.toString === t ? "PASS" : "FAIL";
        }
        console.log(({ toString: t }) < 1);
        console.log(({ toString: t }) + "");
        console.log((( {toString: t }) + "")[2]);
        console.log(({ toString: t }).toString());
    }
    expect_stdout: [
        "false",
        "PASS",
        "S",
        "PASS",
        "false",
        "PASS",
        "S",
        "PASS",
    ]
}

call_args: {
    options = {
        evaluate: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        console.log(a);
        +function(a) {
            return a;
        }(a);
    }
    expect: {
        var a = 1;
        console.log(1);
        1, 1;
    }
    expect_stdout: true
}

call_args_drop_param: {
    options = {
        evaluate: true,
        inline: true,
        keep_fargs: false,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1;
        console.log(a);
        +function(a) {
            return a;
        }(a, b);
    }
    expect: {
        console.log(1);
        b, 1;
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
            (foo(), !1),
            (foo(), !1)
        );
    }
    expect_stdout: true
}

unsafe_charAt: {
    options = {
        evaluate: true,
        unsafe: true,
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
        evaluate: true,
        unsafe: true,
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
        evaluate: true,
        unsafe: true,
    }
    input: {
        s = "foo";
        x = 42;
        console.log(
            s.charAt(0),
            "string".charAt(x),
            (typeof x).charAt()
        );
    }
    expect: {
        s = "foo";
        x = 42;
        console.log(
            s[0] || "",
            "string"[0 | x] || "",
            (typeof x)[0] || ""
        );
    }
    expect_stdout: "f  n"
}

chained_side_effects: {
    options = {
        evaluate: true,
    }
    input: {
        console.log("foo") || (console.log("bar"), "baz") || console.log("moo");
    }
    expect: {
        console.log("foo") || (console.log("bar"), "baz");
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    expect_warnings: [
        "WARN: Condition left of || always true [test/compress/evaluate.js:1,8]",
    ]
}

instanceof_lambda: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log(42 instanceof function() {});
    }
    expect: {
        console.log(false);
    }
    expect_stdout: "false"
}

issue_1649: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(-1 + -1);
    }
    expect: {
        console.log(-2);
    }
    expect_stdout: "-2";
}

issue_1760_1: {
    options = {
        evaluate: true,
    }
    input: {
        !function(a) {
            try {
                throw 0;
            } catch (NaN) {
                a = +"foo";
            }
            console.log(a);
        }();
    }
    expect: {
        !function(a) {
            try {
                throw 0;
            } catch (NaN) {
                a = 0 / 0;
            }
            console.log(a);
        }();
    }
    expect_stdout: "NaN"
}

issue_1760_2: {
    options = {
        evaluate: true,
        keep_infinity: true,
    }
    input: {
        !function(a) {
            try {
                throw 0;
            } catch (Infinity) {
                a = 123456789 / 0;
            }
            console.log(a);
        }();
    }
    expect: {
        !function(a) {
            try {
                throw 0;
            } catch (Infinity) {
                a = 1 / 0;
            }
            console.log(a);
        }();
    }
    expect_stdout: "Infinity"
}

delete_expr_1: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        console.log(delete undefined);
        console.log(delete void 0);
        console.log(delete Infinity);
        console.log(delete (1 / 0));
        console.log(delete NaN);
        console.log(delete (0 / 0));
    }
    expect: {
        console.log(delete undefined);
        console.log((void 0, !0));
        console.log(delete Infinity);
        console.log((1 / 0, !0));
        console.log(delete NaN);
        console.log((0 / 0, !0));
    }
    expect_stdout: true
}

delete_expr_2: {
    options = {
        booleans: true,
        evaluate: true,
        keep_infinity: true,
    }
    input: {
        console.log(delete undefined);
        console.log(delete void 0);
        console.log(delete Infinity);
        console.log(delete (1 / 0));
        console.log(delete NaN);
        console.log(delete (0 / 0));
    }
    expect: {
        console.log(delete undefined);
        console.log((void 0, !0));
        console.log(delete Infinity);
        console.log((1 / 0, !0));
        console.log(delete NaN);
        console.log((0 / 0, !0));
    }
    expect_stdout: true
}

delete_binary_1: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log(delete (true && undefined));
        console.log(delete (true && void 0));
        console.log(delete (true && Infinity));
        console.log(delete (true && (1 / 0)));
        console.log(delete (true && NaN));
        console.log(delete (true && (0 / 0)));
    }
    expect: {
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
    }
    expect_stdout: true
}

delete_binary_2: {
    options = {
        booleans: true,
        evaluate: true,
        keep_infinity: true,
        side_effects: true,
    }
    input: {
        console.log(delete (false || undefined));
        console.log(delete (false || void 0));
        console.log(delete (false || Infinity));
        console.log(delete (false || (1 / 0)));
        console.log(delete (false || NaN));
        console.log(delete (false || (0 / 0)));
    }
    expect: {
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
    }
    expect_stdout: true
}

Infinity_NaN_undefined_LHS: {
    beautify = {
        beautify: true,
    }
    input: {
        function f() {
            Infinity = Infinity;
            ++Infinity;
            Infinity--;
            NaN *= NaN;
            ++NaN;
            NaN--;
            undefined |= undefined;
            ++undefined;
            undefined--;
        }
    }
    expect_exact: [
        "function f() {",
        "    Infinity = 1 / 0;",
        "    ++Infinity;",
        "    Infinity--;",
        "    NaN *= NaN;",
        "    ++NaN;",
        "    NaN--;",
        "    undefined |= void 0;",
        "    ++undefined;",
        "    undefined--;",
        "}",
    ]
}

issue_1964_1: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        unsafe_regexp: false,
        unused: true,
    }
    input: {
        function f() {
            var long_variable_name = /\s/;
            console.log(long_variable_name.source);
            return "a b c".split(long_variable_name)[1];
        }
        console.log(f());
    }
    expect: {
        function f() {
            var long_variable_name = /\s/;
            console.log(long_variable_name.source);
            return "a b c".split(long_variable_name)[1];
        }
        console.log(f());
    }
    expect_stdout: [
        "\\s",
        "b",
    ]
}

issue_1964_2: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        unsafe_regexp: true,
        unused: true,
    }
    input: {
        function f() {
            var long_variable_name = /\s/;
            console.log(long_variable_name.source);
            return "a b c".split(long_variable_name)[1];
        }
        console.log(f());
    }
    expect: {
        function f() {
            console.log(/\s/.source);
            return "a b c".split(/\s/)[1];
        }
        console.log(f());
    }
    expect_stdout: [
        "\\s",
        "b",
    ]
}

array_slice_index: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log([1,2,3].slice(1)[1]);
    }
    expect: {
        console.log(3);
    }
    expect_stdout: "3"
}

string_charCodeAt: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log("foo".charCodeAt("bar".length));
    }
    expect: {
        console.log(NaN);
    }
    expect_stdout: "NaN"
}

issue_2207_1: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(String.fromCharCode(65));
        console.log(Math.max(3, 6, 2, 7, 3, 4));
        console.log(Math.cos(1.2345));
        console.log(Math.cos(1.2345) - Math.sin(4.321));
        console.log(Math.pow(Math.PI, Math.E - Math.LN10).toFixed(15));
    }
    expect: {
        console.log("A");
        console.log(7);
        console.log(Math.cos(1.2345));
        console.log(1.2543732512566947);
        console.log("1.609398451447204");
    }
    expect_stdout: true
}

issue_2207_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(Math.E);
        console.log(Math.LN10);
        console.log(Math.LN2);
        console.log(Math.LOG2E);
        console.log(Math.LOG10E);
        console.log(Math.PI);
        console.log(Math.SQRT1_2);
        console.log(Math.SQRT2);
    }
    expect: {
        console.log(Math.E);
        console.log(Math.LN10);
        console.log(Math.LN2);
        console.log(Math.LOG2E);
        console.log(Math.LOG10E);
        console.log(Math.PI);
        console.log(Math.SQRT1_2);
        console.log(Math.SQRT2);
    }
    expect_stdout: true
}

issue_2207_3: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(Number.MAX_VALUE);
        console.log(Number.MIN_VALUE);
        console.log(Number.NaN);
        console.log(Number.NEGATIVE_INFINITY);
        console.log(Number.POSITIVE_INFINITY);
    }
    expect: {
        console.log(Number.MAX_VALUE);
        console.log(5e-324);
        console.log(NaN);
        console.log(-1/0);
        console.log(1/0);
    }
    expect_stdout: true
}

issue_2231_1: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(Object.keys(void 0));
    }
    expect: {
        console.log(Object.keys(void 0));
    }
    expect_stdout: true
    expect_warnings: [
        "WARN: Error evaluating Object.keys(void 0) [test/compress/evaluate.js:1,20]",
    ]
}

issue_2231_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(Object.getOwnPropertyNames(null));
    }
    expect: {
        console.log(Object.getOwnPropertyNames(null));
    }
    expect_stdout: true
    expect_warnings: [
        "WARN: Error evaluating Object.getOwnPropertyNames(null) [test/compress/evaluate.js:1,20]",
    ]
}

issue_2231_3: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(Object.keys({ foo: "bar" })[0]);
    }
    expect: {
        console.log("foo");
    }
    expect_stdout: "foo"
}

self_comparison_1: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var o = { n: NaN };
        console.log(typeof o.n, o.n == o.n, o.n === o.n, o.n != o.n, o.n !== o.n);
    }
    expect: {
        console.log("number", false, false, true, true);
    }
    expect_stdout: "number false false true true"
}

self_comparison_2: {
    options = {
        evaluate: true,
        hoist_props: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = { n: NaN };
        console.log(typeof o.n, o.n == o.n, o.n === o.n, o.n != o.n, o.n !== o.n);
    }
    expect: {
        console.log("number", false, false, true, true);
    }
    expect_stdout: "number false false true true"
}

issue_2535_1: {
    options = {
        booleans: true,
        evaluate: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        if ((x() || true) || y()) z();
        if ((x() || true) && y()) z();
        if ((x() && true) || y()) z();
        if ((x() && true) && y()) z();
        if ((x() || false) || y()) z();
        if ((x() || false) && y()) z();
        if ((x() && false) || y()) z();
        if ((x() && false) && y()) z();
    }
    expect: {
        if (x(), 1) z();
        if (x(), y()) z();
        if (x() || y()) z();
        if (x() && y()) z();
        if (x() || y()) z();
        if (x() && y()) z();
        if (x(), y()) z();
        if (x(), 0) z();
    }
}

issue_2535_2: {
    options = {
        booleans: true,
        evaluate: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        (x() || true) || y();
        (x() || true) && y();
        (x() && true) || y();
        (x() && true) && y();
        (x() || false) || y();
        (x() || false) && y();
        (x() && false) || y();
        (x() && false) && y();
    }
    expect: {
        x(),
        x(), y(),
        x() || y(),
        x() && y(),
        x() || y(),
        x() && y(),
        x(), y(),
        x();
    }
}

issue_2535_3: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        console.log(Object(1) && 1 && 2);
        console.log(Object(1) && true && 1 && 2 && Object(2));
        console.log(Object(1) && true && 1 && null && 2 && Object(2));
        console.log(2 == Object(1) || 0 || void 0 || null);
        console.log(2 == Object(1) || 0 || void 0 || null || Object(2));
        console.log(2 == Object(1) || 0 || void 0 || "ok" || null || Object(2));
    }
    expect: {
        console.log(Object(1) && 2);
        console.log(Object(1) && Object(2));
        console.log(Object(1) && null);
        console.log(2 == Object(1) || null);
        console.log(2 == Object(1) || Object(2));
        console.log(2 == Object(1) || "ok");
    }
    expect_stdout: true
    expect_warnings: [
        "WARN: Dropping side-effect-free && [test/compress/evaluate.js:1,20]",
        "WARN: Dropping side-effect-free && [test/compress/evaluate.js:2,20]",
        "WARN: Dropping side-effect-free && [test/compress/evaluate.js:3,20]",
        "WARN: Condition left of && always false [test/compress/evaluate.js:3,20]",
        "WARN: Dropping side-effect-free || [test/compress/evaluate.js:4,20]",
        "WARN: Dropping side-effect-free || [test/compress/evaluate.js:5,20]",
        "WARN: Dropping side-effect-free || [test/compress/evaluate.js:6,20]",
        "WARN: Condition left of || always true [test/compress/evaluate.js:6,20]",
    ]
}

issue_2822: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log([ function() {}, "PASS", "FAIL" ][1]);
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

string_case: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log("İ".toLowerCase().charCodeAt(0));
        console.log("I".toLowerCase().charCodeAt(0));
        console.log("Ş".toLowerCase().charCodeAt(0));
        console.log("Ğ".toLowerCase().charCodeAt(0));
        console.log("Ü".toLowerCase().charCodeAt(0));
        console.log("Ö".toLowerCase().charCodeAt(0));
        console.log("Ç".toLowerCase().charCodeAt(0));
        console.log("i".toUpperCase().charCodeAt(0));
        console.log("ı".toUpperCase().charCodeAt(0));
        console.log("ş".toUpperCase().charCodeAt(0));
        console.log("ğ".toUpperCase().charCodeAt(0));
        console.log("ü".toUpperCase().charCodeAt(0));
        console.log("ö".toUpperCase().charCodeAt(0));
        console.log("ç".toUpperCase().charCodeAt(0));
    }
    expect: {
        console.log(105);
        console.log(105);
        console.log(351);
        console.log(287);
        console.log(252);
        console.log(246);
        console.log(231);
        console.log(73);
        console.log(73);
        console.log(350);
        console.log(286);
        console.log(220);
        console.log(214);
        console.log(199);
    }
    expect_stdout: [
        "105",
        "105",
        "351",
        "287",
        "252",
        "246",
        "231",
        "73",
        "73",
        "350",
        "286",
        "220",
        "214",
        "199",
    ]
}

issue_2916_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        var c = "PASS";
        (function(a, b) {
            (function(d) {
                d[0] = 1;
            })(b);
            a == b && (c = "FAIL");
        })("", []);
        console.log(c);
    }
    expect: {
        var c = "PASS";
        (function(a, b) {
            (function(d) {
                d[0] = 1;
            })(b);
            a == b && (c = "FAIL");
        })("", []);
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2916_2: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function(b) {
            (function(d) {
                d[0] = 1;
            })(b);
            +b && (c = "PASS");
        })([]);
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function(b) {
            b[0] = 1;
            +b && (c = "PASS");
        })([]);
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2919: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log([ function() {} ].toString());
    }
    expect: {
        console.log("function(){}");
    }
}

issue_2926_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        (function f(a) {
            console.log(f.name.length, f.length);
        })();
    }
    expect: {
        (function f(a) {
            console.log(1, 1);
        })();
    }
    expect_stdout: "1 1"
}

issue_2926_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(typeof function() {}.valueOf());
    }
    expect: {
        console.log("function");
    }
    expect_stdout: "function"
}

issue_2968_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            (function(a, b) {
                a <<= 0;
                a && (a[(c = "PASS", 0 >>> (b += 1))] = 0);
            })(42, -42);
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function() {
            a = 42,
            void ((a <<= 0) && (a[(c = "PASS", 0)] = 0));
            var a;
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2968_2: {
    options = {
        assignments: true,
        collapse_vars: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            (function(a, b) {
                a <<= 0;
                a && (a[(c = "PASS", 0 >>> (b += 1))] = 0);
            })(42, -42);
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function() {
            a = 42,
            ((a <<= 0) && (a[(c = "PASS", 0)] = 0));
            var a;
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

truthy_conditionals: {
    options = {
        conditionals: true,
        evaluate: true,
    }
    input: {
        if (a = {}) x();
        (b = /foo/) && y();
        (c = function() {}) || z();
    }
    expect: {
        a = {}, x();
        b = /foo/, y();
        c = function() {};
    }
}

truthy_loops: {
    options = {
        evaluate: true,
        loops: true,
    }
    input: {
        while ([]) x();
        do {
            y();
        } while(a = {});
    }
    expect: {
        for (;;) {
            [];
            x();
        }
        for (;;) {
            y();
            a = {};
        }
    }
}

if_increment: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            if (console)
                return ++a;
        }(0));
    }
    expect: {
        console.log(function(a) {
            if (console)
                return 1;
        }());
    }
    expect_stdout: "1"
}

try_increment: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            try {
                return ++a;
            } catch (e) {}
        }(0));
    }
    expect: {
        console.log(function(a) {
            try {
                return 1;
            } catch (e) {}
        }());
    }
    expect_stdout: "1"
}

unsafe_escaped: {
    options = {
        evaluate: true,
        inline: true,
        passes: 3,
        reduce_vars: true,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        (function(a) {
            console.log(function(index) {
                return a[index];
            }(function(term) {
                return a.indexOf(term);
            }("PASS")));
        })([ "PASS" ]);
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

unsafe_string_replace: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        "foo".replace("f", function() {
            console.log("PASS");
        });
    }
    expect: {
        "foo".replace("f", function() {
            console.log("PASS");
        });
    }
    expect_stdout: "PASS"
}

issue_3387_1: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(1 + (2 + "3"[4]));
    }
    expect: {
        console.log(1 + (2 + "3"[4]));
    }
    expect_stdout: "NaN"
}

issue_3387_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(1 + (2 + "3"[4]));
    }
    expect: {
        console.log(NaN);
    }
    expect_stdout: "NaN"
}

simple_function_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function sum(a, b) {
            return a + b;
        }
        console.log(sum(1, 2) * sum(3, 4));
    }
    expect: {
        console.log(21);
    }
    expect_stdout: "21"
}

simple_function_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var sum = function(a, b) {
            return a + b;
        }
        console.log(sum(1, 2) * sum(3, 4));
    }
    expect: {
        console.log(21);
    }
    expect_stdout: "21"
}

recursive_function_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function factorial(a) {
            return a > 0 ? a * factorial(a - 1) : 1;
        }
        console.log(factorial(5));
    }
    expect: {
        console.log(function factorial(a) {
            return a > 0 ? a * factorial(a - 1) : 1;
        }(5));
    }
    expect_stdout: "120"
}

recursive_function_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var factorial = function(a) {
            return a > 0 ? a * factorial(a - 1) : 1;
        }
        console.log(factorial(5));
    }
    expect: {
        var factorial = function(a) {
            return a > 0 ? a * factorial(a - 1) : 1;
        }
        console.log(factorial(5));
    }
    expect_stdout: "120"
}

issue_3558: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        function f(a) {
            return 1 + --a;
        }
        console.log(f(true), f(false));
    }
    expect: {
        function f(a) {
            return 1 + --a;
        }
        console.log(1, 0);
    }
    expect_stdout: "1 0"
}

issue_3568: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var a = 0;
        function f(b) {
            return b && b.p;
        }
        console.log(f(++a + f()));
    }
    expect: {
        var a = 0;
        function f(b) {
            return b && b.p;
        }
        console.log(NaN);
    }
    expect_stdout: "NaN"
}

conditional_function: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        function f(a) {
            return a && "undefined" != typeof A ? A : 42;
        }
        console.log(f(0), f(1));
    }
    expect: {
        function f(a) {
            return a && "undefined" != typeof A ? A : 42;
        }
        console.log(42, f(1));
    }
    expect_stdout: "42 42"
}

best_of_evaluate: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function d(x, y) {
            return x / y;
        }
        console.log(0 / 3, 1 / 64, 4 / 7, 7 / 7);
        console.log(d(0, 3), d(1, 64), d(4, 7), d(7, 7));
    }
    expect: {
        function d(x, y) {
            return x / y;
        }
        console.log(0, 1 / 64, 4 / 7, 1);
        console.log(0, .015625, d(4, 7), 1);
    }
    expect_stdout: [
        "0 0.015625 0.5714285714285714 1",
        "0 0.015625 0.5714285714285714 1",
    ]
}

eager_evaluate: {
    options = {
        evaluate: "eager",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function d(x, y) {
            return x / y;
        }
        console.log(0 / 3, 1 / 64, 4 / 7, 7 / 7);
        console.log(d(0, 3), d(1, 64), d(4, 7), d(7, 7));
    }
    expect: {
        console.log(0, .015625, .5714285714285714, 1);
        console.log(0, .015625, .5714285714285714, 1);
    }
    expect_stdout: [
        "0 0.015625 0.5714285714285714 1",
        "0 0.015625 0.5714285714285714 1",
    ]
}

threshold_evaluate_default: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function b(x) {
            return x + x + x;
        }
        console.log(b("1"), b(2), b(b(b("ABCDEFGHIJK"))));
    }
    expect: {
        function b(x) {
            return x + x + x;
        }
        console.log("111", 6, b(b(b("ABCDEFGHIJK"))));
    }
    expect_stdout: "111 6 ABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJK"
}

threshold_evaluate_30: {
    options = {
        evaluate: 30,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function b(x) {
            return x + x + x;
        }
        console.log(b("1"), b(2), b(b(b("ABCDEFGHIJK"))));
    }
    expect: {
        function b(x) {
            return x + x + x;
        }
        console.log("111", 6, b(b("ABCDEFGHIJKABCDEFGHIJKABCDEFGHIJK")));
    }
    expect_stdout: "111 6 ABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJK"
}

threshold_evaluate_100: {
    options = {
        evaluate: 100,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function b(x) {
            return x + x + x;
        }
        console.log(b("1"), b(2), b(b(b("ABCDEFGHIJK"))));
    }
    expect: {
        function b(x) {
            return x + x + x;
        }
        console.log("111", 6, b("ABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJK"));
    }
    expect_stdout: "111 6 ABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJK"
}

threshold_evaluate_999: {
    options = {
        evaluate: 999,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function b(x) {
            return x + x + x;
        }
        console.log(b("1"), b(2), b(b(b("ABCDEFGHIJK"))));
    }
    expect: {
        console.log("111", 6, "ABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJK");
    }
    expect_stdout: "111 6 ABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJKABCDEFGHIJK"
}

collapse_vars_regexp: {
    options = {
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: false,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unsafe_regexp: true,
        unused: true,
    }
    input: {
        function f1() {
            var k = 9;
            var rx = /[A-Z]+/;
            return [rx, k];
        }
        function f2() {
            var rx = /ab*/g;
            return function(s) {
                return rx.exec(s);
            };
        }
        function f3() {
            var rx = /ab*/g;
            return function() {
                return rx;
            };
        }
        (function() {
            var result;
            var s = "acdabcdeabbb";
            var rx = /ab*/g;
            while (result = rx.exec(s))
                console.log(result[0]);
        })();
        (function() {
            var result;
            var s = "acdabcdeabbb";
            var rx = f2();
            while (result = rx(s))
                console.log(result[0]);
        })();
        (function() {
            var result;
            var s = "acdabcdeabbb";
            var rx = f3();
            while (result = rx().exec(s))
                console.log(result[0]);
        })();
    }
    expect: {
        function f1() {
            return [/[A-Z]+/, 9];
        }
        function f2() {
            var rx = /ab*/g;
            return function(s) {
                return rx.exec(s);
            };
        }
        function f3() {
            var rx = /ab*/g;
            return function() {
                return rx;
            };
        }
        (function() {
            var result, rx = /ab*/g;
            while (result = rx.exec("acdabcdeabbb"))
                console.log(result[0]);
        })();
        (function() {
            var result, rx = f2();
            while (result = rx("acdabcdeabbb"))
                console.log(result[0]);
        })();
        (function() {
            var result, rx = f3();
            while (result = rx().exec("acdabcdeabbb"))
                console.log(result[0]);
        })();
    }
    expect_stdout: [
        "a",
        "ab",
        "abbb",
        "a",
        "ab",
        "abbb",
        "a",
        "ab",
        "abbb",
    ]
}

issue_3738: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(1 / (0 + ([] - 1) % 1));
    }
    expect: {
        console.log(1 / (0 + ([] - 1) % 1));
    }
    expect_stdout: "Infinity"
}

issue_3755: {
    options = {
        booleans: true,
        evaluate: true,
        unsafe: true,
        unsafe_math: true,
    }
    input: {
        console.log((/4/.exec(1 + (!0 - 5 / "23")) || 0).p);
    }
    expect: {
        console.log((/4/.exec(!0 - 5 / "23" + 1), 0).p);
    }
    expect_stdout: "undefined"
}

void_side_effects: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = void console.log("PASS");
        console.log(a);
    }
    expect: {
        console.log("PASS");
        console.log(void 0);
    }
    expect_stdout: [
        "PASS",
        "undefined",
    ]
}

no_returns: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function() {
            console.log("PASS");
        }();
        console.log(a);
    }
    expect: {
        (function() {
            console.log("PASS");
        })();
        console.log(void 0);
    }
    expect_stdout: [
        "PASS",
        "undefined",
    ]
}

void_returns: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f() {
            function g(b) {
                if (b) console.log("FAIL");
            }
            while (1) {
                console.log("PASS");
                try {
                    if (console) return;
                } catch (e) {
                    return g(e);
                }
            }
        }();
        console.log(a);
    }
    expect: {
        (function() {
            function g(b) {
                if (b) console.log("FAIL");
            }
            while (1) {
                console.log("PASS");
                try {
                    if (console) return;
                } catch (e) {
                    return g(e);
                }
            }
        })();
        console.log(void 0);
    }
    expect_stdout: [
        "PASS",
        "undefined",
    ]
}

void_returns_recursive: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f() {
            function g(b) {
                return f();
            }
            while (1) {
                console.log("PASS");
                try {
                    if (console) return;
                } catch (e) {
                    return g(e);
                }
            }
        }();
        console.log(a);
    }
    expect: {
        var a = function f() {
            function g(b) {
                return f();
            }
            while (1) {
                console.log("PASS");
                try {
                    if (console) return;
                } catch (e) {
                    return g();
                }
            }
        }();
        console.log(a);
    }
    expect_stdout: [
        "PASS",
        "undefined",
    ]
}

issue_3878_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var b = function(a) {
            return (a = 0) == (a && this > (a += 0));
        }();
        console.log(b ? "PASS" : "FAIL");
    }
    expect: {
        console.log(true ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

issue_3878_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = "foo";
        a++ + a;
        a && a;
        console.log(a);
    }
    expect: {
        var a = "foo";
        a++ + a;
        a;
        console.log(a);
    }
    expect_stdout: "NaN"
}

issue_3882: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            return console.log(a++), a && this;
        }
        var b = f();
        console.log(b);
    }
    expect: {
        var b = function(a) {
            return console.log(a++), a && this;
        }();
        console.log(b);
    }
    expect_stdout: [
        "NaN",
        "NaN",
    ]
}

issue_3887: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(b) {
            try {
                b-- && console.log("PASS");
            } catch (a_2) {}
        })(1);
    }
    expect: {
        (function(b) {
            try {
                1, console.log("PASS");
            } catch (a_2) {}
        })();
    }
    expect_stdout: "PASS"
}

issue_3903: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        function f(b, c) {
            return console, c;
        }
        var d = f(f(), a = a);
        console.log(d);
    }
    expect: {
        function f(b, c) {
            return console, c;
        }
        f(f(), "PASS");
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_3905: {
    options = {
        evaluate: true,
        passes: 2,
        unused: true,
    }
    input: {
        (function(a, a) {
            return console.log(a = 0), a && console.log("FAIL");
        })("foo", 42);
    }
    expect: {
        (function(a, a) {
            return console.log(a = 0), a && console.log("FAIL");
        })("foo", 42);
    }
    expect_stdout: "0"
}

issue_3920: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function(b) {
            return (b[b = 0] = 0) >= (b ? 0 : 1);
        }("foo");
        console.log(a);
    }
    expect: {
        (function(b) {
            "foo"[0] = 0;
        })();
        console.log(false);
    }
    expect_stdout: "false"
}

inlined_increment_prefix: {
    options = {
        evaluate: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        (function() {
            ++a;
        })();
        console.log(a += 0);
    }
    expect: {
        var a = 0;
        void ++a;
        console.log(1);
    }
    expect_stdout: "1"
}

inlined_increment_postfix: {
    options = {
        evaluate: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        (function() {
            a++;
        })();
        console.log(a += 0);
    }
    expect: {
        var a = 0;
        void a++;
        console.log(1);
    }
    expect_stdout: "1"
}

compound_assignment_to_property: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        1 + (0..p >>= 0) && console.log("PASS");
    }
    expect: {
        1 + (0..p >>= 0),
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_2208_assign: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        a = 42;
        console.log({
            p: function() {
                return function() {
                    return this.a;
                }();
            }
        }.p());
    }
    expect: {
        a = 42;
        console.log({
            p: function() {
                return function() {
                    return this.a;
                }();
            }
        }.p());
    }
    expect_stdout: "42"
}

issue_2208_postfix: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        a = 41;
        a++;
        console.log({
            p: function() {
                return function() {
                    return this.a;
                }();
            }
        }.p());
    }
    expect: {
        a = 41;
        a++;
        console.log({
            p: function() {
                return function() {
                    return this.a;
                }();
            }
        }.p());
    }
    expect_stdout: "42"
}

issue_2208_prefix: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        a = 43;
        --a;
        console.log({
            p: function() {
                return function() {
                    return this.a;
                }();
            }
        }.p());
    }
    expect: {
        a = 43;
        --a;
        console.log({
            p: function() {
                return function() {
                    return this.a;
                }();
            }
        }.p());
    }
    expect_stdout: "42"
}

issue_3933: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a, b) {
            a && (b ^= 1) && console.log("PASS");
        })(1);
    }
    expect: {
        (function(a, b) {
            1, 1, console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

issue_3935: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(function f(a) {
            return a++;
        }());
    }
    expect: {
        console.log(NaN);
    }
    expect_stdout: "NaN"
}

issue_3937: {
    options = {
        conditionals: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var a = 123;
        (a++ + (b = a))[b] ? 0 ? a : b : 0 ? a : b;
        console.log(a, b);
    }
    expect: {
        var a = 123;
        (a++ + (b = a))[b], 0, b;
        console.log(a, b);
    }
    expect_stdout: "124 124"
}

issue_3944: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            function f() {
                while (function() {
                    var a = 0 == (b && b.p), b = console.log(a);
                }());
                f;
            }
            f();
        })();
    }
    expect: {
        void function f() {
            while (0 == void 0, console.log(false), void 0);
            f;
        }();
    }
    expect_stdout: "false"
}

issue_3953: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f(a) {
            (a += 0 * (a = 0)) && console.log("PASS");
        }
        f(1);
    }
    expect: {
        function f(a) {
            (a += 0 * (a = 0)) && console.log("PASS");
        }
        f(1);
    }
    expect_stdout: "PASS"
}

issue_3988: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        function f(b) {
            return ("" + (b &= 0))[b && this];
        }
        var a = f();
        console.log(a);
    }
    expect: {
        var a = function(b) {
            return ("" + (b &= 0))[b && this];
        }();
        console.log(a);
    }
    expect_stdout: "0"
}

operator_in: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        Object.prototype.PASS = 0;
        console.log(0 in [ 1 ]);
        console.log(0 in [ , ]);
        console.log(0 / 0 in { NaN: 2 });
        console.log("PASS" in { });
        console.log("FAIL" in { });
        console.log("toString" in { });
        console.log("toString" in { toString: 3 });
    }
    expect: {
        Object.prototype.PASS = 0;
        console.log(true);
        console.log(0 in [ , ]);
        console.log(true);
        console.log("PASS" in { });
        console.log("FAIL" in { });
        console.log("toString" in { });
        console.log("toString" in { toString: 3 });
    }
    expect_stdout: [
        "true",
        "false",
        "true",
        "true",
        "false",
        "true",
        "true",
    ]
}

issue_3997: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = function f(b) {
            return b[b += this] = b;
        }(0);
        console.log(typeof a);
    }
    expect: {
        var a = function f(b) {
            return b[b += this] = b;
        }(0);
        console.log(typeof a);
    }
    expect_stdout: "string"
}

issue_4035: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        var a = 0;
        (function() {
            var b = --a;
            console.log(delete (0 + b));
            console.log(delete (1 * b));
            console.log(delete (b + 0));
            console.log(delete (b - 0));
            console.log(delete (b / 1));
        })();
    }
    expect: {
        var a = 0;
        (function() {
            var b = --a;
            console.log((0 + b, true));
            console.log((1 * b, true));
            console.log((0 + b, true));
            console.log((b - 0, true));
            console.log((b / 1, true));
        })();
    }
    expect_stdout: [
        "true",
        "true",
        "true",
        "true",
        "true",
    ]
}

issue_4067: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        (function(a) {
            (function(b) {
                b[0] += 0;
                console.log(+a);
            })(a);
        })([]);
    }
    expect: {
        (function(a) {
            (function(b) {
                b[0] += 0;
                console.log(+a);
            })(a);
        })([]);
    }
    expect_stdout: "NaN"
}

issue_4077: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log((a = []) - (a[0]++, 1) || "PASS");
    }
    expect: {
        console.log((a = []) - (a[0]++, 1) || "PASS");
    }
    expect_stdout: "PASS"
}

issue_4119_1: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var a, b;
        b = a = [];
        a[0] += 0;
        if (+b + 1) {
            console.log("FAIL");
        } else {
            console.log("PASS");
        }
    }
    expect: {
        var a, b;
        b = a = [];
        a[0] += 0;
        +b + 1 ? console.log("FAIL") : console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4119_2: {
    options = {
        conditionals: true,
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        var a;
        (function(b) {
            a[0] += 0;
            console.log(+b + 1 ? "FAIL" : "PASS");
        })(a = []);
    }
    expect: {
        var a;
        (function(b) {
            a[0] += 0;
            console.log(+b + 1 ? "FAIL" : "PASS");
        })(a = []);
    }
    expect_stdout: "PASS"
}

issue_4119_3: {
    options = {
        conditionals: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var a, b;
        b = a = {
            p: 42,
        };
        delete a.p;
        console.log(b.p ? "FAIL" : "PASS");
    }
    expect: {
        var a, b;
        b = a = {
            p: 42,
        };
        delete a.p;
        console.log(b.p ? "FAIL" : "PASS");
    }
    expect_stdout: "PASS"
}

issue_4119_4: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a, b;
        b = a = {
            p: 42,
        };
        delete a.p;
        console.log(!b ? "FAIL" : "PASS");
    }
    expect: {
        var a, b;
        b = a = {
            p: 42,
        };
        delete a.p;
        console.log((b, 0, "PASS"));
    }
    expect_stdout: "PASS"
}

issue_4214: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            return function() {
                try {
                    return a;
                } finally {
                    var b = 0;
                }
            }(a++ && this());
        }
        var c = f();
        console.log(c);
    }
    expect: {
        var c = function(a) {
            return function() {
                try {
                    return a;
                } finally {}
            }(a++ && this());
        }();
        console.log(c);
    }
    expect_stdout: "NaN"
}

issue_4271: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        ({
            p: null,
            q: (console.log("foo"), 42),
            p: function() {}
        })[console.log("bar"), "p"] && console.log("PASS");
    }
    expect: {
        ({
            p: null,
            q: (console.log("foo"), 42),
            p: function() {}
        })[console.log("bar"), "p"],
        console.log("PASS");
    }
    expect_stdout: [
        "foo",
        "bar",
        "PASS",
    ]
}

issue_4393: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        (function f(a) {
            a = "PASS";
            console.log(arguments[0]);
        })("FAIL");
    }
    expect: {
        (function f(a) {
            a = "PASS";
            console.log(arguments[0]);
        })("FAIL");
    }
    expect_stdout: "PASS"
}

issue_4422: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function f(a) {
            a = "FAIL 1";
            arguments[0] = "PASS";
            return a;
        }("FAIL 2"));
    }
    expect: {
        console.log(function(a) {
            a = "FAIL 1";
            arguments[0] = "PASS";
            return a;
        }("FAIL 2"));
    }
    expect_stdout: "PASS"
}

issue_4480: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = function f(b) {
            b = "FAIL";
            arguments[0] = "PASS";
            var arguments = 0;
            console.log(b);
        }(a);
    }
    expect: {
        var a = function(b) {
            b = "FAIL";
            arguments[0] = "PASS";
            var arguments = 0;
            console.log(b);
        }(a);
    }
    expect_stdout: "PASS"
}

issue_4552: {
    options = {
        evaluate: true,
        keep_fnames: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f(b) {
            return function() {
                b++;
                try {
                    return b;
                } catch (e) {}
            }();
        }();
        console.log(a);
    }
    expect: {
        var a = function f(b) {
            return function() {
                b++;
                try {
                    return b;
                } catch (e) {}
            }();
        }();
        console.log(a);
    }
    expect_stdout: "NaN"
}

issue_4886_1: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log("length" in {
            __proto__: function() {},
            length: void 0,
        });
    }
    expect: {
        console.log("length" in {
            __proto__: function() {},
            length: void 0,
        });
    }
    expect_stdout: "true"
}

issue_4886_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log("foo" in {
            "foo": null,
            __proto__: 42,
        });
    }
    expect: {
        console.log("foo" in {
            "foo": null,
            __proto__: 42,
        });
    }
    expect_stdout: "true"
}

issue_5354: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        function f(a) {
            return +a.toExponential(1);
        }
        function g(b) {
            return 0 + b.toFixed(2);
        }
        function h(c) {
            return 1 * c.toPrecision(3);
        }
        console.log(typeof f(45), typeof g(67), typeof h(89));
    }
    expect: {
        function f(a) {
            return +a.toExponential(1);
        }
        function g(b) {
            return 0 + b.toFixed(2);
        }
        function h(c) {
            return +c.toPrecision(3);
        }
        console.log(typeof f(45), typeof g(67), typeof h(89));
    }
    expect_stdout: "number string number"
}

issue_5356: {
    options = {
        evaluate: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        console.log(function() {
            return a++;
            var a = a;
        }());
    }
    expect: {
        console.log(+a);
        var a;
    }
    expect_stdout: "NaN"
}

issue_5362_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = -console;
        console.log(delete +a);
    }
    expect: {
        var a = -console;
        console.log((+a, true));
    }
    expect_stdout: "true"
}

issue_5362_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var a = -console;
        console.log(delete +a);
    }
    expect: {
        console.log(true);
    }
    expect_stdout: "true"
}

issue_5380: {
    options = {
        evaluate: true,
        keep_fnames: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f(b) {
            return function g() {
                for (b in { PASS: 42 });
            }(), b;
        }("FAIL");
        console.log(a);
    }
    expect: {
        var a = function f(b) {
            return function g() {
                for (b in { PASS: 42 });
            }(), b;
        }("FAIL");
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_5558: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_vars: true,
        sequences: true,
        toplevel: true,
    }
    input: {
        var a = 99, b = 0;
        a++;
        b++;
        b += a;
        b *= a;
        b += a;
        console.log(a);
    }
    expect: {
        var a = 99, b = 0;
        b++,
        b = (b += ++a) * a + a,
        console.log(a);
    }
    expect_stdout: "100"
}
