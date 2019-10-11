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
        console.log(
            true.a,
            false.a,
            null.a,
            undefined.a
        );
    }
    expect: {
        console.log(
            void 0,
            false.a,
            null.a,
            (void 0).a
        );
    }
    expect_stdout: true
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
        var g = 0();
        var h = 0();
    }
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
        +(1, 1);
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
        console.log(
            s.charAt(0),
            "string".charAt(x),
            (typeof x).charAt()
        );
    }
    expect: {
        console.log(
            s[0],
            "string"[0 | x],
            (typeof x)[0]
        );
    }
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
            b = -(a = 42),
            void ((a <<= 0) && (a[(c = "PASS", 0 >>> (b += 1))] = 0));
            var a, b;
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
