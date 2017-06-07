make_sequences_1: {
    options = {
        sequences: true
    };
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
        sequences: true
    };
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
        sequences: true
    };
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
        sequences: true
    };
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
    options = { sequences: true };
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
    options = { sequences: true, evaluate: true };
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
    options = { sequences: true, conditionals: true };
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
    options = { side_effects: true };
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
    options = { sequences: true };
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
    }
}

limit_1: {
    options = {
        sequences: 3,
    };
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
    };
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
        sequences: true,
        negate_iife: true,
    };
    input: {
        (function() {})();
        for (i = 0; i < 5; i++) console.log(i);

        (function() {})();
        for (; i < 5; i++) console.log(i);
    }
    expect: {
        for (!function() {}(), i = 0; i < 5; i++) console.log(i);
        for (function() {}(); i < 5; i++) console.log(i);
    }
    expect_stdout: true
}

iife: {
    options = {
        sequences: true,
    };
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
        x = 42, function a() {}(), function b() {}(), function c() {}(),
        function d() {}(), function e() {}(), function f() {}(), function g() {}();
    }
}

unsafe_undefined: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unsafe: true,
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
        cascade: true,
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
        cascade: true,
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
        cascade: true,
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
        cascade: true,
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
        cascade: true,
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
        cascade: true,
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
        cascade: true,
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
    }
    expect: {
        function f(a, b) {
            (a -= 42) < 0 && (a = 0), b.a = a;
        }
    }
}

side_effects_cascade_2: {
    options = {
        cascade: true,
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
            b = a,
            !a + (b += a) || (b += a),
            b = a;
        }
    }
}

side_effects_cascade_3: {
    options = {
        cascade: true,
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
            !(b += a) && ((b = a) || (b -= a, b ^= a)),
            --a;
        }
    }
}

issue_27: {
    options = {
        cascade: true,
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
        cascade: true,
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
