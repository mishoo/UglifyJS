make_sequences_1: {
    options = {
        sequences: true,
    }
    input: {
        foo();
        bar();
        baz();
    }
    expect: {
        foo(),bar(),baz();
    }
}

make_sequences_2: {
    options = {
        sequences: true,
    }
    input: {
        if (boo) {
            foo();
            bar();
            baz();
        } else {
            x();
            y();
            z();
        }
    }
    expect: {
        if (boo) foo(),bar(),baz();
        else x(),y(),z();
    }
}

make_sequences_3: {
    options = {
        sequences: true,
    }
    input: {
        function f() {
            foo();
            bar();
            return baz();
        }
        function g() {
            foo();
            bar();
            throw new Error();
        }
    }
    expect: {
        function f() {
            return foo(), bar(), baz();
        }
        function g() {
            throw foo(), bar(), new Error();
        }
    }
}

make_sequences_4: {
    options = {
        sequences: true,
    }
    input: {
        x = 5;
        if (y) z();

        x = 5;
        for (i = 0; i < 5; i++) console.log(i);

        x = 5;
        for (; i < 5; i++) console.log(i);

        x = 5;
        switch (y) {}

        x = 5;
        with (obj) {}
    }
    expect: {
        if (x = 5, y) z();
        for (x = 5, i = 0; i < 5; i++) console.log(i);
        for (x = 5; i < 5; i++) console.log(i);
        switch (x = 5, y) {}
        with (x = 5, obj);
    }
    expect_stdout: true
}

lift_sequences_1: {
    options = {
        sequences: true,
    }
    input: {
        var foo, x, y, bar;
        foo = !(x(), y(), bar());
    }
    expect: {
        var foo, x, y, bar;
        x(), y(), foo = !bar();
    }
}

lift_sequences_2: {
    options = {
        evaluate: true,
        sequences: true,
    }
    input: {
        var foo = 1, bar;
        foo.x = (foo = {}, 10);
        bar = (bar = {}, 10);
        console.log(foo, bar);
    }
    expect: {
        var foo = 1, bar;
        foo.x = (foo = {}, 10),
        bar = {}, bar = 10,
        console.log(foo, bar);
    }
    expect_stdout: true
}

lift_sequences_3: {
    options = {
        conditionals: true,
        sequences: true,
    }
    input: {
        var x, foo, bar, baz;
        x = (foo(), bar(), baz()) ? 10 : 20;
    }
    expect: {
        var x, foo, bar, baz;
        foo(), bar(), x = baz() ? 10 : 20;
    }
}

lift_sequences_4: {
    options = {
        side_effects: true,
    }
    input: {
        var x, foo, bar, baz;
        x = (foo, bar, baz);
    }
    expect: {
        var x, foo, bar, baz;
        x = baz;
    }
}

lift_sequences_5: {
    options = {
        sequences: true,
    }
    input: {
        var a = 2, b;
        a *= (b, a = 4, 3);
        console.log(a);
    }
    expect: {
        var a = 2, b;
        b, a *= (a = 4, 3),
        console.log(a);
    }
    expect_stdout: "6"
}

for_sequences: {
    options = {
        sequences: true,
    }
    input: {
        // 1
        foo();
        bar();
        for (; false;);
        // 2
        foo();
        bar();
        for (x = 5; false;);
        // 3
        x = (foo in bar);
        for (; false;);
        // 4
        x = (foo in bar);
        for (y = 5; false;);
        // 5
        x = function() {
            foo in bar;
        };
        for (y = 5; false;);
    }
    expect: {
        // 1
        for (foo(), bar(); false;);
        // 2
        for (foo(), bar(), x = 5; false;);
        // 3
        x = (foo in bar);
        for (; false;);
        // 4
        x = (foo in bar);
        for (y = 5; false;);
        // 5
        for (x = function() {
            foo in bar;
        }, y = 5; false;);
    }
}

limit_1: {
    options = {
        sequences: 3,
    }
    input: {
        a;
        b;
        c;
        d;
        e;
        f;
        g;
        h;
        i;
        j;
        k;
    }
    expect: {
        a, b, c;
        d, e, f;
        g, h, i;
        j, k;
    }
}

limit_2: {
    options = {
        sequences: 3,
    }
    input: {
        a, b;
        c, d;
        e, f;
        g, h;
        i, j;
        k;
    }
    expect: {
        a, b, c, d;
        e, f, g, h;
        i, j, k;
    }
}

negate_iife_for: {
    options = {
        negate_iife: true,
        sequences: true,
    }
    input: {
        (function() {})();
        for (i = 0; i < 5; i++) console.log(i);
        (function() {})();
        for (; i < 10; i++) console.log(i);
    }
    expect: {
        for (!function() {}(), i = 0; i < 5; i++) console.log(i);
        for (!function() {}(); i < 10; i++) console.log(i);
    }
    expect_stdout: true
}

iife: {
    options = {
        sequences: true,
    }
    input: {
        x = 42;
        (function a() {})();
        !function b() {}();
        ~function c() {}();
        +function d() {}();
        -function e() {}();
        void function f() {}();
        typeof function g() {}();
    }
    expect: {
        x = 42,
        function a() {}(),
        !function b() {}(),
        ~function c() {}(),
        +function d() {}(),
        -function e() {}(),
        void function f() {}(),
        typeof function g() {}();
    }
}

iife_drop_side_effect_free: {
    options = {
        sequences: true,
        side_effects: true,
    }
    input: {
        x = 42;
        (function a() {})();
        !function b() {}();
        ~function c() {}();
        +function d() {}();
        -function e() {}();
        void function f() {}();
        typeof function g() {}();
    }
    expect: {
        x = 42;
    }
}

unsafe_undefined: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unsafe_undefined: true,
    }
    input: {
        function f(undefined) {
            if (a)
                return b;
            if (c)
                return d;
        }
        function g(undefined) {
            if (a)
                return b;
            if (c)
                return d;
            e();
        }
    }
    expect: {
        function f(undefined) {
            return a ? b : c ? d : undefined;
        }
        function g(undefined) {
            return a ? b : c ? d : void e();
        }
    }
}

issue_1685: {
    options = {
        collapse_vars: true,
        side_effects: true,
    }
    input: {
        var a = 100, b = 10;
        function f() {
            var a = (a--, delete a && --b);
        }
        f();
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        function f() {
            var a = (a--, delete a && --b);
        }
        f();
        console.log(a, b);
    }
    expect_stdout: true
}

func_def_1: {
    options = {
        collapse_vars: true,
        side_effects: true,
    }
    input: {
        function f() {
            return f = 0, !!f;
        }
        console.log(f());
    }
    expect: {
        function f() {
            return !!(f = 0);
        }
        console.log(f());
    }
    expect_stdout: "false"
}

func_def_2: {
    options = {
        collapse_vars: true,
        side_effects: true,
    }
    input: {
        console.log(function f() {
            return f = 0, !!f;
        }());
    }
    expect: {
        console.log(function f() {
            return f = 0, !!f;
        }());
    }
    expect_stdout: "true"
}

func_def_3: {
    options = {
        collapse_vars: true,
        side_effects: true,
    }
    input: {
        function f() {
            function g() {}
            return g = 0, !!g;
        }
        console.log(f());
    }
    expect: {
        function f() {
            function g() {}
            return !!(g = 0);
        }
        console.log(f());
    }
    expect_stdout: "false"
}

func_def_4: {
    options = {
        collapse_vars: true,
        side_effects: true,
    }
    input: {
        function f() {
            function g() {
                return g = 0, !!g;
            }
            return g();
        }
        console.log(f());
    }
    expect: {
        function f() {
            function g() {
                return !!(g = 0);
            }
            return g();
        }
        console.log(f());
    }
    expect_stdout: "false"
}

func_def_5: {
    options = {
        collapse_vars: true,
        side_effects: true,
    }
    input: {
        function f() {
            return function g(){
                return g = 0, !!g;
            }();
        }
        console.log(f());
    }
    expect: {
        function f() {
            return function g(){
                return g = 0, !!g;
            }();
        }
        console.log(f());
    }
    expect_stdout: "true"
}

issue_1758: {
    options = {
        sequences: true,
        side_effects: true,
    }
    input: {
        console.log(function(c) {
            var undefined = 42;
            return function() {
                c--;
                c--, c.toString();
                return;
            }();
        }());
    }
    expect: {
        console.log(function(c) {
            var undefined = 42;
            return function() {
                return c--, c--, void c.toString();
            }();
        }());
    }
    expect_stdout: "undefined"
}

delete_seq_1: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log(delete (1, undefined));
        console.log(delete (1, void 0));
        console.log(delete (1, Infinity));
        console.log(delete (1, 1 / 0));
        console.log(delete (1, NaN));
        console.log(delete (1, 0 / 0));
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

delete_seq_2: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log(delete (1, 2, undefined));
        console.log(delete (1, 2, void 0));
        console.log(delete (1, 2, Infinity));
        console.log(delete (1, 2, 1 / 0));
        console.log(delete (1, 2, NaN));
        console.log(delete (1, 2, 0 / 0));
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

delete_seq_3: {
    options = {
        booleans: true,
        evaluate: true,
        keep_infinity: true,
        side_effects: true,
    }
    input: {
        console.log(delete (1, 2, undefined));
        console.log(delete (1, 2, void 0));
        console.log(delete (1, 2, Infinity));
        console.log(delete (1, 2, 1 / 0));
        console.log(delete (1, 2, NaN));
        console.log(delete (1, 2, 0 / 0));
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

delete_seq_4: {
    options = {
        booleans: true,
        evaluate: false,
        sequences: true,
        side_effects: true,
    }
    input: {
        function f() {}
        console.log(delete (f(), undefined));
        console.log(delete (f(), void 0));
        console.log(delete (f(), Infinity));
        console.log(delete (f(), 1 / 0));
        console.log(delete (f(), NaN));
        console.log(delete (f(), 0 / 0));
    }
    expect: {
        function f() {}
        console.log(delete void f()),
        console.log(delete void f()),
        console.log((f(), delete (1 / 0))),
        console.log((f(), delete (1 / 0))),
        console.log(delete (f(), NaN)),
        console.log((f(), delete(0 / 0)));
    }
    expect_stdout: true
}

delete_seq_4_evaluate: {
    options = {
        booleans: true,
        evaluate: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function f() {}
        console.log(delete (f(), undefined));
        console.log(delete (f(), void 0));
        console.log(delete (f(), Infinity));
        console.log(delete (f(), 1 / 0));
        console.log(delete (f(), NaN));
        console.log(delete (f(), 0 / 0));
    }
    expect: {
        function f() {}
        console.log((f(), !0)),
        console.log((f(), !0)),
        console.log((f(), !0)),
        console.log((f(), !0)),
        console.log((f(), !0)),
        console.log((f(), !0));
    }
    expect_stdout: true
}

delete_seq_5: {
    options = {
        booleans: true,
        evaluate: false,
        keep_infinity: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function f() {}
        console.log(delete (f(), undefined));
        console.log(delete (f(), void 0));
        console.log(delete (f(), Infinity));
        console.log(delete (f(), 1 / 0));
        console.log(delete (f(), NaN));
        console.log(delete (f(), 0 / 0));
    }
    expect: {
        function f() {}
        console.log(delete void f()),
        console.log(delete void f()),
        console.log(delete (f(), Infinity)),
        console.log((f(), delete (1 / 0))),
        console.log(delete (f(), NaN)),
        console.log((f(), delete (0 / 0)));
    }
    expect_stdout: true
}

delete_seq_5_evaluate: {
    options = {
        booleans: true,
        evaluate: true,
        keep_infinity: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function f() {}
        console.log(delete (f(), undefined));
        console.log(delete (f(), void 0));
        console.log(delete (f(), Infinity));
        console.log(delete (f(), 1 / 0));
        console.log(delete (f(), NaN));
        console.log(delete (f(), 0 / 0));
    }
    expect: {
        function f() {}
        console.log((f(), !0)),
        console.log((f(), !0)),
        console.log((f(), !0)),
        console.log((f(), !0)),
        console.log((f(), !0)),
        console.log((f(), !0));
    }
    expect_stdout: true
}

delete_seq_6: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        var a;
        console.log(delete (1, a));
    }
    expect: {
        var a;
        console.log(!0);
    }
    expect_stdout: true
}

side_effects: {
    options = {
        sequences: true,
        side_effects: true,
    }
    input: {
        0, a(), 1, b(), 2, c(), 3;
    }
    expect: {
        a(), b(), c();
    }
}

side_effects_cascade_1: {
    options = {
        collapse_vars: true,
        conditionals: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function f(a, b) {
            a -= 42;
            if (a < 0) a = 0;
            b.a = a;
        }
        var m = {}, n = {};
        f(13, m);
        f("foo", n);
        console.log(m.a, n.a);
    }
    expect: {
        function f(a, b) {
            b.a = a = (a -= 42) < 0 ? 0 : a;
        }
        var m = {}, n = {};
        f(13, m),
        f("foo", n),
        console.log(m.a, n.a);
    }
    expect_stdout: "0 NaN"
}

side_effects_cascade_2: {
    options = {
        collapse_vars: true,
        side_effects: true,
    }
    input: {
        function f(a, b) {
            b = a,
            !a + (b += a) || (b += a),
            b = a,
            b;
        }
    }
    expect: {
        function f(a, b) {
            !(b = a) + (b += a) || (b += a),
            b = a;
        }
    }
}

side_effects_cascade_3: {
    options = {
        collapse_vars: true,
        conditionals: true,
        side_effects: true,
    }
    input: {
        function f(a, b) {
            "foo" ^ (b += a),
            b ? false : (b = a) ? -1 : (b -= a) - (b ^= a),
            a-- || !a,
            a;
        }
    }
    expect: {
        function f(a, b) {
            (b += a) || (b = a) || (b = b - a ^ a),
            a--;
        }
    }
}

issue_27: {
    options = {
        collapse_vars: true,
        passes: 2,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(jQuery) {
            var $;
            $ = jQuery;
            $("body").addClass("foo");
        })(jQuery);
    }
    expect: {
        (function(jQuery) {
            jQuery("body").addClass("foo");
        })(jQuery);
    }
}

issue_2062: {
    options = {
        booleans: true,
        collapse_vars: true,
        conditionals: true,
        side_effects: true,
    }
    input: {
        var a = 1;
        if ([ a || a++ + a--, a++ + a--, a && a.var ]);
        console.log(a);
    }
    expect: {
        var a = 1;
        a || (a++, a--), a++, --a && a.var;
        console.log(a);
    }
    expect_stdout: "1"
}

issue_2313: {
    options = {
        collapse_vars: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        var a = 0, b = 0;
        var foo = {
            get c() {
                a++;
                return 42;
            },
            set c(c) {
                b++;
            },
            d: function() {
                this.c++;
                if (this.c) console.log(a, b);
            }
        }
        foo.d();
    }
    expect: {
        var a = 0, b = 0;
        var foo = {
            get c() {
                return a++, 42;
            },
            set c(c) {
                b++;
            },
            d: function() {
                if (this.c++, this.c) console.log(a, b);
            }
        }
        foo.d();
    }
    expect_stdout: "2 1"
}

cascade_assignment_in_return: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            return a = x(), b(a);
        }
    }
    expect: {
        function f(a, b) {
            return b(x());
        }
    }
}

hoist_defun: {
    options = {
        join_vars: true,
        sequences: true,
    }
    input: {
        x();
        function f() {}
        y();
    }
    expect: {
        function f() {}
        x(), y();
    }
}

hoist_decl: {
    options = {
        join_vars: true,
        sequences: true,
    }
    input: {
        var a;
        w();
        var b = x();
        y();
        for (var c; 0;) z();
        var d;
    }
    expect: {
        var a, b = (w(), x()), c, d;
        for (y(); 0;) z();
    }
}

for_init_var: {
    options = {
        join_vars: true,
        unused: false,
    }
    input: {
        var a = "PASS";
        (function() {
            var b = 42;
            for (var c = 5; c > 0;) c--;
            a = "FAIL";
            var a;
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function() {
            for (var b = 42, c = 5, a; c > 0;) c--;
            a = "FAIL";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

forin_1: {
    options = {
        sequences: true,
    }
    input: {
        var o = [];
        o.push("PASS");
        for (var a in o)
            console.log(o[a]);
    }
    expect: {
        var o = [];
        for (var a in o.push("PASS"), o)
            console.log(o[a]);
    }
    expect_stdout: "PASS"
}

forin_2: {
    options = {
        evaluate: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            p: 1,
            q: 2,
        };
        var k = "k";
        for ((console.log("exp"), o)[function() {
            console.log("prop");
            return k;
        }()] in function() {
            console.log("obj");
            return o;
        }())
            console.log(o.k, o[o.k]);
    }
    expect: {
        var o = {
            p: 1,
            q: 2,
        };
        for ((console.log("exp"), o)[console.log("prop"), "k"] in console.log("obj"), o)
            console.log(o.k, o[o.k]);
    }
    expect_stdout: [
        "obj",
        "exp",
        "prop",
        "p 1",
        "exp",
        "prop",
        "q 2",
    ]
}

call: {
    options = {
        sequences: true,
    }
    input: {
        var a = function() {
            return this;
        }();
        function b() {
            console.log("foo");
        }
        b.c = function() {
            console.log(this === b ? "bar" : "baz");
        };
        (a, b)();
        (a, b).c();
        (a, b.c)();
        (a, b)["c"]();
        (a, b["c"])();
        (a, function() {
            console.log(this === a);
        })();
        new (a, b)();
        new (a, b).c();
        new (a, b.c)();
        new (a, b)["c"]();
        new (a, b["c"])();
        new (a, function() {
            console.log(this === a);
        })();
        console.log(typeof (a, b).c);
        console.log(typeof (a, b)["c"]);
    }
    expect: {
        var a = function() {
            return this;
        }();
        function b() {
            console.log("foo");
        }
        b.c = function() {
            console.log(this === b ? "bar" : "baz");
        },
        a,
        b(),
        a,
        b.c(),
        (a, b.c)(),
        a,
        b["c"](),
        (a, b["c"])(),
        a,
        function() {
            console.log(this === a);
        }(),
        a,
        new b(),
        a,
        new b.c(),
        a,
        new b.c(),
        a,
        new b["c"](),
        a,
        new b["c"](),
        a,
        new function() {
            console.log(this === a);
        }(),
        console.log((a, typeof b.c)),
        console.log((a, typeof b["c"]));
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
        "bar",
        "baz",
        "true",
        "foo",
        "baz",
        "baz",
        "baz",
        "baz",
        "false",
        "function",
        "function",
    ]
}

call_drop_side_effect_free: {
    options = {
        sequences: true,
        side_effects: true,
    }
    input: {
        var a = function() {
            return this;
        }();
        function b() {
            console.log("foo");
        }
        b.c = function() {
            console.log(this === b ? "bar" : "baz");
        };
        (a, b)();
        (a, b).c();
        (a, b.c)();
        (a, b)["c"]();
        (a, b["c"])();
        (a, function() {
            console.log(this === a);
        })();
        new (a, b)();
        new (a, b).c();
        new (a, b.c)();
        new (a, b)["c"]();
        new (a, b["c"])();
        new (a, function() {
            console.log(this === a);
        })();
        console.log(typeof (a, b).c);
        console.log(typeof (a, b)["c"]);
    }
    expect: {
        var a = function() {
            return this;
        }();
        function b() {
            console.log("foo");
        }
        b.c = function() {
            console.log(this === b ? "bar" : "baz");
        },
        b(),
        b.c(),
        (0, b.c)(),
        b["c"](),
        (0, b["c"])(),
        function() {
            console.log(this === a);
        }(),
        new b(),
        new b.c(),
        new b.c(),
        new b["c"](),
        new b["c"](),
        new function() {
            console.log(this === a);
        }(),
        console.log(typeof b.c),
        console.log(typeof b["c"]);
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
        "bar",
        "baz",
        "true",
        "foo",
        "baz",
        "baz",
        "baz",
        "baz",
        "false",
        "function",
        "function",
    ]
}

missing_link: {
    options = {
        conditionals: true,
        evaluate: true,
        sequences: true,
    }
    input: {
        var a = 100;
        a;
        a++ + (0 ? 2 : 1);
        console.log(a);
    }
    expect: {
        var a = 100;
        a,
        a++ + (0, 1),
        console.log(a);
    }
}

missing_link_drop_side_effect_free: {
    options = {
        conditionals: true,
        evaluate: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        var a = 100;
        a;
        a++ + (0 ? 2 : 1);
        console.log(a);
    }
    expect: {
        var a = 100;
        a++,
        console.log(a);
    }
}

angularjs_chain: {
    options = {
        conditionals: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function nonComputedMember(left, right, context, create) {
            var lhs = left();
            if (create && create !== 1) {
                if (lhs && lhs[right] == null) {
                    lhs[right] = {};
                }
            }
            var value = lhs != null ? lhs[right] : undefined;
            if (context) {
                return { context: lhs, name: right, value: value };
            } else {
                return value;
            }
        }
    }
    expect: {
        function nonComputedMember(left, right, context, create) {
            var lhs = left();
            create && 1 !== create && lhs && null == lhs[right] && (lhs[right] = {});
            var value = null != lhs ? lhs[right] : void 0;
            return context ? {
                context: lhs,
                name: right,
                value: value
            } : value;
        }
    }
}

issue_3490_1: {
    options = {
        conditionals: true,
        dead_code: true,
        inline: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var b = 42, c = "FAIL";
        if ({
            3: function() {
                var a;
                return (a && a.p) < this;
            }(),
        }) c = "PASS";
        if (b) while ("" == typeof d);
        console.log(c, b);
    }
    expect: {
        var b = 42, c = "FAIL";
        var a;
        if (a && a.p, c = "PASS", b) while ("" == typeof d);
        console.log(c, b);
    }
    expect_stdout: "PASS 42"
}

issue_3490_2: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var b = 42, c = "FAIL";
        if ({
            3: function() {
                var a;
                return (a && a.p) < this;
            }(),
        }) c = "PASS";
        if (b) for (; "" == typeof d;);
        console.log(c, b);
    }
    expect: {
        var b = 42, c = "FAIL";
        var a;
        for (c = "PASS"; "" == typeof d;);
        console.log(c, b);
    }
    expect_stdout: "PASS 42"
}

issue_3703: {
    options = {
        evaluate: true,
        sequences: true,
        unsafe: true,
    }
    input: {
        var a = "FAIL";
        while ((a = "PASS", 0).foo = 0);
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        while (a = "PASS", (0).foo = 0);
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_4079: {
    options = {
        sequences: true,
        side_effects: true,
    }
    input: {
        try {
            typeof (0, A);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            A;
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}
