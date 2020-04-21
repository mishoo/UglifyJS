ifs_1: {
    options = {
        conditionals: true,
    }
    input: {
        if (foo) bar();
        if (!foo); else bar();
        if (foo); else bar();
        if (foo); else;
    }
    expect: {
        foo&&bar();
        foo&&bar();
        foo||bar();
        foo;
    }
}

ifs_2: {
    options = {
        conditionals: true,
    }
    input: {
        if (foo) {
            x();
        } else if (bar) {
            y();
        } else if (baz) {
            z();
        }

        if (foo) {
            x();
        } else if (bar) {
            y();
        } else if (baz) {
            z();
        } else {
            t();
        }
    }
    expect: {
        foo ? x() : bar ? y() : baz && z();
        (foo ? x : bar ? y : baz ? z : t)();
    }
}

ifs_3_should_warn: {
    options = {
        booleans: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        var x, y;
        if (x && !(x + "1") && y) { // 1
            var qq;
            foo();
        } else {
            bar();
        }

        if (x || !!(x + "1") || y) { // 2
            foo();
        } else {
            var jj;
            bar();
        }
    }
    expect: {
        var x, y;
        var qq; bar();          // 1
        var jj; foo();          // 2
    }
}

ifs_4: {
    options = {
        conditionals: true,
    }
    input: {
        if (foo && bar) {
            x(foo)[10].bar.baz = something();
        } else
            x(foo)[10].bar.baz = something_else();
    }
    expect: {
        foo && bar
            ? x(foo)[10].bar.baz = something()
            : x(foo)[10].bar.baz = something_else();
    }
}

ifs_5: {
    options = {
        comparisons: true,
        conditionals: true,
        if_return: true,
    }
    input: {
        function f() {
            if (foo) return;
            bar();
            baz();
        }
        function g() {
            if (foo) return;
            if (bar) return;
            if (baz) return;
            if (baa) return;
            a();
            b();
        }
    }
    expect: {
        function f() {
            if (!foo) {
                bar();
                baz();
            }
        }
        function g() {
            if (!(foo || bar || baz || baa)) {
                a();
                b();
            }
        }
    }
}

ifs_6: {
    options = {
        comparisons: true,
        conditionals: true,
    }
    input: {
        var x, y;
        if (!foo && !bar && !baz && !boo) {
            x = 10;
        } else {
            x = 20;
        }
        if (y) {
            x[foo] = 10;
        } else {
            x[foo] = 20;
        }
        if (foo) {
            x[bar] = 10;
        } else {
            x[bar] = 20;
        }
    }
    expect: {
        var x, y;
        x = foo || bar || baz || boo ? 20 : 10;
        x[foo] = y ? 10 : 20;
        foo ? x[bar] = 10 : x[bar] = 20;
    }
}

ifs_7: {
    options = {
        conditionals: true,
    }
    input: {
        if (A); else;
        if (A) while (B); else;
        if (A); else while (C);
        if (A) while (B); else while (C);
    }
    expect: {
        A;
        if (A) while (B);
        if (!A) while (C);
        if (A) while (B); else while (C);
    }
}

cond_1: {
    options = {
        conditionals: true,
    }
    input: {
        function foo(do_something, some_condition) {
            if (some_condition) {
                do_something(x);
            } else {
                do_something(y);
            }
            if (some_condition) {
                side_effects(x);
            } else {
                side_effects(y);
            }
        }
    }
    expect: {
        function foo(do_something, some_condition) {
            do_something(some_condition ? x : y);
            some_condition ? side_effects(x) : side_effects(y);
        }
    }
}

cond_2: {
    options = {
        conditionals: true,
    }
    input: {
        function foo(x, FooBar, some_condition) {
            if (some_condition) {
                x = new FooBar(1);
            } else {
                x = new FooBar(2);
            }
        }
    }
    expect: {
        function foo(x, FooBar, some_condition) {
            x = new FooBar(some_condition ? 1 : 2);
        }
    }
}

cond_3: {
    options = {
        conditionals: true,
    }
    input: {
        var FooBar;
        if (some_condition()) {
            new FooBar(1);
        } else {
            FooBar(2);
        }
    }
    expect: {
        var FooBar;
        some_condition() ? new FooBar(1) : FooBar(2);
    }
}

cond_4: {
    options = {
        conditionals: true,
    }
    input: {
        var do_something;
        if (some_condition()) {
            do_something();
        } else {
            do_something();
        }
        if (some_condition()) {
            side_effects();
        } else {
            side_effects();
        }
    }
    expect: {
        var do_something;
        some_condition(), do_something();
        some_condition(), side_effects();
    }
}

cond_5: {
    options = {
        conditionals: true,
    }
    input: {
        if (some_condition()) {
            if (some_other_condition()) {
                do_something();
            } else {
                alternate();
            }
        } else {
            alternate();
        }

        if (some_condition()) {
            if (some_other_condition()) {
                do_something();
            }
        }
    }
    expect: {
        (some_condition() && some_other_condition() ? do_something : alternate)();
        some_condition() && some_other_condition() && do_something();
    }
}

cond_6: {
    options = {
        booleans: true,
        conditionals: true,
    }
    input: {
        x ? a : b;
        x ? a : a;

        x ? y ? a : b : c;
        x ? y ? a : a : b;
        x ? y ? a : b : b;
        x ? y ? a : b : a;
        x ? y ? a : a : a;

        x ? a : y ? b : c;
        x ? a : y ? a : b;
        x ? a : y ? b : b;
        x ? a : y ? b : a;
        x ? a : y ? a : a;
    }
    expect: {
        x ? a : b;
        x, a;

        x ? y ? a : b : c;
        x ? (y, a) : b;
        x && y ? a : b;
        !x || y ? a : b;
        x && y, a;

        x ? a : y ? b : c;
        x || y ? a : b;
        x ? a : (y, b);
        !x && y ? b : a;
        !x && y, a;
    }
}

cond_7: {
    options = {
        conditionals: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        var x, y, z, a, b;
        // compress these
        if (y) {
            x = 1+1;
        } else {
            x = 2;
        }

        if (y) {
            x = 1+1;
        } else if (z) {
            x = 2;
        } else {
            x = 3-1;
        }

        x = y ? 'foo' : 'fo'+'o';

        x = y ? 'foo' : y ? 'foo' : 'fo'+'o';

        // Compress conditions that have side effects
        if (condition()) {
            x = 10+10;
        } else {
            x = 20;
        }

        if (z) {
            x = 'fuji';
        } else if (condition()) {
            x = 'fu'+'ji';
        } else {
            x = 'fuji';
        }

        x = condition() ? 'foobar' : 'foo'+'bar';

        // don't compress these
        x = y ? a : b;

        x = y ? 'foo' : 'fo';
    }
    expect: {
        var x, y, z, a, b;
        x = 2;
        x = 2;
        x = 'foo';
        x = 'foo';
        x = (condition(), 20);
        x = (z || condition(), 'fuji');
        x = (condition(), 'foobar');
        x = y ? a : b;
        x = y ? 'foo' : 'fo';
    }
}

cond_7_1: {
    options = {
        conditionals: true,
        evaluate: true,
    }
    input: {
        var x;
        // access to global should be assumed to have side effects
        if (y) {
            x = 1+1;
        } else {
            x = 2;
        }
    }
    expect: {
        var x;
        x = (y, 2);
    }
}

cond_8: {
    options = {
        booleans: false,
        conditionals: true,
        evaluate: true,
    }
    input: {
        var a;
        // compress these
        a = condition ? true : false;
        a = !condition ? true : false;
        a = condition() ? true : false;

        a = condition ? !0 : !1;
        a = !condition ? !null : !2;
        a = condition() ? !0 : !-3.5;

        if (condition) {
            a = true;
        } else {
            a = false;
        }

        if (condition) {
            a = !0;
        } else {
            a = !1;
        }

        a = condition ? false : true;
        a = !condition ? false : true;
        a = condition() ? false : true;

        a = condition ? !3 : !0;
        a = !condition ? !2 : !0;
        a = condition() ? !1 : !0;

        if (condition) {
            a = false;
        } else {
            a = true;
        }

        if (condition) {
            a = !1;
        } else {
            a = !0;
        }

        // don't compress these
        a = condition ? 1 : false;
        a = !condition ? true : 0;
        a = condition ? 1 : 0;
    }
    expect: {
        var a;
        a = !!condition;
        a = !condition;
        a = !!condition();

        a = !!condition;
        a = !condition;
        a = !!condition();

        a = !!condition;
        a = !!condition;

        a = !condition;
        a = !!condition;
        a = !condition();

        a = !condition;
        a = !!condition;
        a = !condition();

        a = !condition;
        a = !condition;

        a = !!condition && 1;
        a = !condition || 0;
        a = condition ? 1 : 0;
    }
}

cond_8b: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
    }
    input: {
        var a;
        // compress these
        a = condition ? true : false;
        a = !condition ? true : false;
        a = condition() ? true : false;

        a = condition ? !0 : !1;
        a = !condition ? !null : !2;
        a = condition() ? !0 : !-3.5;

        if (condition) {
            a = true;
        } else {
            a = false;
        }

        if (condition) {
            a = !0;
        } else {
            a = !1;
        }

        a = condition ? false : true;
        a = !condition ? false : true;
        a = condition() ? false : true;

        a = condition ? !3 : !0;
        a = !condition ? !2 : !0;
        a = condition() ? !1 : !0;

        if (condition) {
            a = false;
        } else {
            a = true;
        }

        if (condition) {
            a = !1;
        } else {
            a = !0;
        }

        a = condition ? 1 : false;
        a = !condition ? true : 0;
        a = condition ? 1 : 0;
    }
    expect: {
        var a;
        a = !!condition;
        a = !condition;
        a = !!condition();

        a = !!condition;
        a = !condition;
        a = !!condition();

        a = !!condition;
        a = !!condition;

        a = !condition;
        a = !!condition;
        a = !condition();

        a = !condition;
        a = !!condition;
        a = !condition();

        a = !condition;
        a = !condition;

        a = !!condition && 1;
        a = !condition || 0;
        a = condition ? 1 : 0;
    }
}

cond_8c: {
    options = {
        booleans: false,
        conditionals: true,
        evaluate: false,
    }
    input: {
        var a;
        // compress these
        a = condition ? true : false;
        a = !condition ? true : false;
        a = condition() ? true : false;

        a = condition ? !0 : !1;
        a = !condition ? !null : !2;
        a = condition() ? !0 : !-3.5;

        if (condition) {
            a = true;
        } else {
            a = false;
        }

        if (condition) {
            a = !0;
        } else {
            a = !1;
        }

        a = condition ? false : true;
        a = !condition ? false : true;
        a = condition() ? false : true;

        a = condition ? !3 : !0;
        a = !condition ? !2 : !0;
        a = condition() ? !1 : !0;

        if (condition) {
            a = false;
        } else {
            a = true;
        }

        if (condition) {
            a = !1;
        } else {
            a = !0;
        }

        a = condition ? 1 : false;
        a = !condition ? true : 0;
        a = condition ? 1 : 0;
    }
    expect: {
        var a;
        a = !!condition;
        a = !condition;
        a = !!condition();

        a = !!condition;
        a = !condition;
        a = !!condition() || !-3.5;

        a = !!condition;
        a = !!condition;

        a = !condition;
        a = !!condition;
        a = !condition();

        a = !condition;
        a = !!condition;
        a = !condition();

        a = !condition;
        a = !condition;

        a = !!condition && 1;
        a = !condition || 0;
        a = condition ? 1 : 0;
    }
}

cond_9: {
    options = {
        conditionals: true,
    }
    input: {
        function f(x, y) {
            g() ? x(1) : x(2);
            x ? (y || x)() : (y || x)();
            x ? y(a, b) : y(d, b, c);
            x ? y(a, b, c) : y(a, b, c);
            x ? y(a, b, c) : y(a, b, f);
            x ? y(a, b, c) : y(a, e, c);
            x ? y(a, b, c) : y(a, e, f);
            x ? y(a, b, c) : y(d, b, c);
            x ? y(a, b, c) : y(d, b, f);
            x ? y(a, b, c) : y(d, e, c);
            x ? y(a, b, c) : y(d, e, f);
        }
    }
    expect: {
        function f(x, y) {
            g() ? x(1) : x(2);
            x, (y || x)();
            x ? y(a, b) : y(d, b, c);
            x, y(a, b, c);
            y(a, b, x ? c : f);
            y(a, x ? b : e, c);
            x ? y(a, b, c) : y(a, e, f);
            y(x ? a : d, b, c);
            x ? y(a, b, c) : y(d, b, f);
            x ? y(a, b, c) : y(d, e, c);
            x ? y(a, b, c) : y(d, e, f);
        }
    }
}

cond_10: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a) {
            if (1 == a) return "foo";
            if (2 == a) return "foo";
            if (3 == a) return "foo";
            if (4 == a) return 42;
            if (5 == a) return "foo";
            if (6 == a) return "foo";
            return "bar";
        }
        console.log(f(1), f(2), f(3), f(4), f(5), f(6), f(7));
    }
    expect: {
        function f(a) {
            return 1 == a || 2 == a || 3 == a ? "foo" : 4 == a ? 42 : 5 == a || 6 == a ? "foo" : "bar";
        }
        console.log(f(1), f(2), f(3), f(4), f(5), f(6), f(7));
    }
    expect_stdout: "foo foo foo 42 foo foo bar"
}

cond_11: {
    options = {
        conditionals: true,
    }
    input: {
        var o = {
            p: "foo",
            q: function() {
                return this.p;
            }
        };
        function f() {
            return "bar";
        }
        function g(a) {
            return a ? f() : o.q();
        }
        console.log(g(0), g(1));
    }
    expect: {
        var o = {
            p: "foo",
            q: function() {
                return this.p;
            }
        };
        function f() {
            return "bar";
        }
        function g(a) {
            return a ? f() : o.q();
        }
        console.log(g(0), g(1));
    }
    expect_stdout: "foo bar"
}

cond_12: {
    options = {
        conditionals: true,
    }
    input: {
        x ? y && a : a;
        x ? y || a : a;
        x ? a : y && a;
        x ? a : y || a;
    }
    expect: {
        (!x || y) && a;
        x && y || a;
        (x || y) && a;
        !x && y || a;
    }
}

ternary_boolean_consequent: {
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
        loops: true,
        properties: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f1() { return a == b ? true : x; }
        function f2() { return a == b ? false : x; }
        function f3() { return a < b ? !0 : x; }
        function f4() { return a < b ? !1 : x; }
        function f5() { return c ? !0 : x; }
        function f6() { return c ? false : x; }
        function f7() { return !c ? true : x; }
        function f8() { return !c ? !1 : x; }
    }
    expect: {
        function f1() { return a == b || x; }
        function f2() { return a != b && x; }
        function f3() { return a < b || x; }
        function f4() { return !(a < b) && x; }
        function f5() { return !!c || x; }
        function f6() { return !c && x; }
        function f7() { return !c || x; }
        function f8() { return !!c && x; }
    }
}

ternary_boolean_alternative: {
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
        loops: true,
        properties: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f1() { return a == b ? x : true; }
        function f2() { return a == b ? x : false; }
        function f3() { return a < b ? x : !0; }
        function f4() { return a < b ? x : !1; }
        function f5() { return c ? x : true; }
        function f6() { return c ? x : !1; }
        function f7() { return !c ? x : !0; }
        function f8() { return !c ? x : false; }
    }
    expect: {
        function f1() { return a != b || x; }
        function f2() { return a == b && x; }
        function f3() { return !(a < b) || x; }
        function f4() { return a < b && x; }
        function f5() { return !c || x; }
        function f6() { return !!c && x; }
        function f7() { return !!c || x; }
        function f8() { return !c && x; }
    }
}

trivial_boolean_ternary_expressions : {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        f('foo' in m ? true  : false);
        f('foo' in m ? false : true);

        f(g       ? true : false);
        f(foo()   ? true : false);
        f("bar"   ? true : false);
        f(5       ? true : false);
        f(5.7     ? true : false);
        f(x - y   ? true : false);

        f(x == y  ? true : false);
        f(x === y ?   !0 :    !1);
        f(x < y   ?   !0 : false);
        f(x <= y  ? true : false);
        f(x > y   ? true :    !1);
        f(x >= y  ?   !0 :    !1);

        f(g       ? false : true);
        f(foo()   ? false : true);
        f("bar"   ? false : true);
        f(5       ? false : true);
        f(5.7     ? false : true);
        f(x - y   ? false : true);

        f(x == y  ?    !1 :   !0);
        f(x === y ? false : true);

        f(x < y   ? false : true);
        f(x <= y  ? false :   !0);
        f(x > y   ?    !1 : true);
        f(x >= y  ?    !1 :   !0);
    }
    expect: {
        f('foo' in m);
        f(!('foo' in m));

        f(!!g);
        f(!!foo());
        f(!0);
        f(!0);
        f(!0);
        f(!!(x - y));

        f(x == y);
        f(x === y);
        f(x < y);
        f(x <= y);
        f(x > y);
        f(x >= y);

        f(!g);
        f(!foo());
        f(!1);
        f(!1);
        f(!1);
        f(!(x - y));

        f(x != y);
        f(x !== y);

        f(!(x < y));
        f(!(x <= y));
        f(!(x > y));
        f(!(x >= y));
    }
}

issue_1154: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        function f1(x) { return x ? -1 : -1; }
        function f2(x) { return x ? +2 : +2; }
        function f3(x) { return x ? ~3 : ~3; }
        function f4(x) { return x ? !4 : !4; }
        function f5(x) { return x ? void 5 : void 5; }
        function f6(x) { return x ? typeof 6 : typeof 6; }

        function g1() { return g() ? -1 : -1; }
        function g2() { return g() ? +2 : +2; }
        function g3() { return g() ? ~3 : ~3; }
        function g4() { return g() ? !4 : !4; }
        function g5() { return g() ? void 5 : void 5; }
        function g6() { return g() ? typeof 6 : typeof 6; }
    }
    expect: {
        function f1(x) { return -1; }
        function f2(x) { return 2; }
        function f3(x) { return -4; }
        function f4(x) { return !1; }
        function f5(x) { return; }
        function f6(x) { return "number"; }

        function g1() { return g(), -1; }
        function g2() { return g(), 2; }
        function g3() { return g(), -4; }
        function g4() { return g(), !1; }
        function g5() { return void g(); }
        function g6() { return g(), "number"; }
    }
}

no_evaluate: {
    options = {
        conditionals: true,
        evaluate: false,
        side_effects: true,
    }
    input: {
        function f(b) {
            a = b ? !0 : !0;
            a = b ? ~1 : ~1;
            a = b ? -2 : -2;
            a = b ? +3 : +3;
        }
    }
    expect: {
        function f(b) {
            a = !0;
            a = ~1;
            a = -2;
            a = +3;
        }
    }
}

equality_conditionals_false: {
    options = {
        conditionals: false,
        sequences: true,
    }
    input: {
        function f(a, b, c) {
            console.log(
                a == (b ? a : a),
                a == (b ? a : c),
                a != (b ? a : a),
                a != (b ? a : c),
                a === (b ? a : a),
                a === (b ? a : c),
                a !== (b ? a : a),
                a !== (b ? a : c)
            );
        }
        f(0, 0, 0);
        f(0, true, 0);
        f(1, 2, 3);
        f(1, null, 3);
        f(NaN);
        f(NaN, "foo");
    }
    expect: {
        function f(a, b, c) {
            console.log(
                a == (b ? a : a),
                a == (b ? a : c),
                a != (b ? a : a),
                a != (b ? a : c),
                a === (b ? a : a),
                a === (b ? a : c),
                a !== (b ? a : a),
                a !== (b ? a : c)
            );
        }
        f(0, 0, 0),
        f(0, true, 0),
        f(1, 2, 3),
        f(1, null, 3),
        f(NaN),
        f(NaN, "foo");
    }
    expect_stdout: true
}

equality_conditionals_true: {
    options = {
        conditionals: true,
        sequences: true,
    }
    input: {
        function f(a, b, c) {
            console.log(
                a == (b ? a : a),
                a == (b ? a : c),
                a != (b ? a : a),
                a != (b ? a : c),
                a === (b ? a : a),
                a === (b ? a : c),
                a !== (b ? a : a),
                a !== (b ? a : c)
            );
        }
        f(0, 0, 0);
        f(0, true, 0);
        f(1, 2, 3);
        f(1, null, 3);
        f(NaN);
        f(NaN, "foo");
    }
    expect: {
        function f(a, b, c) {
            console.log(
                (b, a == a),
                a == (b ? a : c),
                (b, a != a),
                a != (b ? a : c),
                (b, a === a),
                a === (b ? a : c),
                (b, a !== a),
                a !== (b ? a : c)
            );
        }
        f(0, 0, 0),
        f(0, true, 0),
        f(1, 2, 3),
        f(1, null, 3),
        f(NaN),
        f(NaN, "foo");
    }
    expect_stdout: true
}

issue_1645_1: {
    options = {
        conditionals: true,
    }
    input: {
        var a = 100, b = 10;
        (b = a) ? a++ + (b += a) ? b += a : b += a : b ^= a;
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        (b = a) ? (a++ + (b += a), b += a) : b ^= a;
        console.log(a,b);
    }
    expect_stdout: true
}

issue_1645_2: {
    options = {
        conditionals: true,
    }
    input: {
        var a = 0;
        function f() {
            return a++;
        }
        f() ? a += 2 : a += 4;
        console.log(a);
    }
    expect: {
        var a = 0;
        function f(){
            return a++;
        }
        f() ? a += 2 : a += 4;
        console.log(a);
    }
    expect_stdout: true
}

condition_symbol_matches_consequent: {
    options = {
        conditionals: true,
    }
    input: {
        function foo(x, y) {
            return x ? x : y;
        }
        function bar() {
            return g ? g : h;
        }
        var g = 4;
        var h = 5;
        console.log(foo(3, null), foo(0, 7), foo(true, false), bar());
    }
    expect: {
        function foo(x, y) {
            return x || y;
        }
        function bar() {
            return g || h;
        }
        var g = 4;
        var h = 5;
        console.log(foo(3, null), foo(0, 7), foo(true, false), bar());
    }
    expect_stdout: "3 7 true 4"
}

delete_conditional_1: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log(delete (1 ? undefined : x));
        console.log(delete (1 ? void 0 : x));
        console.log(delete (1 ? Infinity : x));
        console.log(delete (1 ? 1 / 0 : x));
        console.log(delete (1 ? NaN : x));
        console.log(delete (1 ? 0 / 0 : x));
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

delete_conditional_2: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
        keep_infinity: true,
        side_effects: true,
    }
    input: {
        console.log(delete (0 ? x : undefined));
        console.log(delete (0 ? x : void 0));
        console.log(delete (0 ? x : Infinity));
        console.log(delete (0 ? x : 1 / 0));
        console.log(delete (0 ? x : NaN));
        console.log(delete (0 ? x : 0 / 0));
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

issue_2535_1: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
        passes: 2,
        side_effects: true,
    }
    input: {
        if (true || x()) y();
        if (true && x()) y();
        if (x() || true) y();
        if (x() && true) y();
        if (false || x()) y();
        if (false && x()) y();
        if (x() || false) y();
        if (x() && false) y();
    }
    expect: {
        y();
        x() && y();
        x(), y();
        x() && y();
        x() && y();
        x() && y();
        x();
    }
}

issue_2535_2: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        function x() {}
        function y() {
            return "foo";
        }
        console.log((x() || true) || y());
        console.log((y() || true) || x());
        console.log((x() || true) && y());
        console.log((y() || true) && x());
        console.log((x() && true) || y());
        console.log((y() && true) || x());
        console.log((x() && true) && y());
        console.log((y() && true) && x());
        console.log((x() || false) || y());
        console.log((y() || false) || x());
        console.log((x() || false) && y());
        console.log((y() || false) && x());
        console.log((x() && false) || y());
        console.log((y() && false) || x());
        console.log((x() && false) && y());
        console.log((y() && false) && x());
    }
    expect: {
        function x() {}
        function y() {
            return "foo";
        }
        console.log(x() || !0);
        console.log(y() || !0);
        console.log((x(), y()));
        console.log((y(), x()));
        console.log(!!x() || y());
        console.log(!!y() || x());
        console.log(x() && y());
        console.log(y() && x());
        console.log(x() || y());
        console.log(y() || x());
        console.log(!!x() && y());
        console.log(!!y() && x());
        console.log((x(), y()));
        console.log((y(), x()));
        console.log(x() && !1);
        console.log(y() && !1);
    }
    expect_stdout: [
        "true",
        "foo",
        "foo",
        "undefined",
        "foo",
        "true",
        "undefined",
        "undefined",
        "foo",
        "foo",
        "false",
        "undefined",
        "foo",
        "undefined",
        "undefined",
        "false",
    ]
}

issue_2560: {
    options = {
        conditionals: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function log(x) {
            console.log(x);
        }
        function foo() {
            return log;
        }
        function bar() {
            if (x !== (x = foo())) {
                x(1);
            } else {
                x(2);
            }
        }
        var x = function() {
            console.log("init");
        };
        bar();
        bar();
    }
    expect: {
        function log(x) {
            console.log(x);
        }
        function bar() {
            x !== (x = log) ? x(1) : x(2);
        }
        var x = function() {
            console.log("init");
        };
        bar();
        bar();
    }
    expect_stdout: [
        "1",
        "2",
    ]
}

hoist_decl: {
    options = {
        conditionals: true,
        join_vars: true,
        sequences: true,
    }
    input: {
        if (x()) {
            var a;
            y();
        } else {
            z();
            var b;
        }
    }
    expect: {
        var a, b;
        (x() ? y : z)();
    }
}

to_and_or: {
    options = {
        conditionals: true,
    }
    input: {
        var values = [
            0,
            null,
            true,
            "foo",
            false,
            -1 / 0,
            void 0,
        ];
        values.forEach(function(x) {
            values.forEach(function(y) {
                values.forEach(function(z) {
                    console.log(x ? y || z : z);
                });
            });
        });
    }
    expect: {
        var values = [
            0,
            null,
            true,
            "foo",
            false,
            -1 / 0,
            void 0,
        ];
        values.forEach(function(x) {
            values.forEach(function(y) {
                values.forEach(function(z) {
                    console.log(x && y || z);
                });
            });
        });
    }
    expect_stdout: true
}

cond_seq_assign_1: {
    options = {
        conditionals: true,
        sequences: true,
    }
    input: {
        function f(a) {
            var t;
            if (a) {
                t = "foo";
                t = "bar";
            } else {
                console.log(t);
                t = 42;
            }
            console.log(t);
        }
        f(f);
        f();
    }
    expect: {
        function f(a) {
            var t;
            t = a ? (t = "foo", "bar") : (console.log(t), 42),
            console.log(t);
        }
        f(f),
        f();
    }
    expect_stdout: [
        "bar",
        "undefined",
        "42",
    ]
}

cond_seq_assign_2: {
    options = {
        conditionals: true,
        sequences: true,
    }
    input: {
        function f(a) {
            var t;
            if (a) {
                t = "foo";
                a = "bar";
            } else {
                console.log(t);
                t = 42;
            }
            console.log(t);
        }
        f(f);
        f();
    }
    expect: {
        function f(a) {
            var t;
            a ? (t = "foo", a = "bar") : (console.log(t), t = 42),
            console.log(t);
        }
        f(f),
        f();
    }
    expect_stdout: [
        "foo",
        "undefined",
        "42",
    ]
}

cond_seq_assign_3: {
    options = {
        assignments: true,
        conditionals: true,
    }
    input: {
        var c = 0;
        if (this)
            c = 1 + c, c = c + 1;
        else
            c = 1 + c, c = c + 1;
        console.log(c);
    }
    expect: {
        var c = 0;
        this, c = 1 + c, c += 1;
        console.log(c);
    }
    expect_stdout: "2"
}

issue_3271: {
    options = {
        conditionals: true,
    }
    input: {
        function f(a) {
            var i = 0, b = [];
            if (a) {
                b[i++] = 4,
                b[i++] = 1;
            } else {
                b[i++] = 3,
                b[i++] = 2,
                b[i++] = 1;
            }
            return b;
        }
        console.log(f(0).pop(), f(1).pop());
    }
    expect: {
        function f(a) {
            var i = 0, b = [];
            a ? b[i++] = 4 : (b[i++] = 3, b[i++] = 2),
            b[i++] = 1;
            return b;
        }
        console.log(f(0).pop(), f(1).pop());
    }
    expect_stdout: "1 1"
}

iife_condition: {
    options = {
        conditionals: true,
        side_effects: true,
    }
    input: {
        if (function() {
            return console;
        }())
            console.log("PASS");
    }
    expect: {
        !function() {
            return console;
        }() || console.log("PASS");
    }
    expect_stdout: "PASS"
}

angularjs_chain: {
    options = {
        conditionals: true,
        passes: 2,
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

issue_3576: {
    options = {
        conditionals: true,
        evaluate: true,
        pure_getters: "strict",
        reduce_vars: true,
    }
    input: {
        var c = "FAIL";
        (function(a) {
            (a = -1) ? (a && (a.a = 0)) : (a && (a.a = 0));
            a && a[c = "PASS"]++;
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function(a) {
            a = -1, a, a.a = 0;
            a, a[c = "PASS"]++;
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3668: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f() {
            try {
                var undefined = typeof f;
                if (!f) return undefined;
                return;
            } catch (e) {
                return "FAIL";
            }
        }
        console.log(f());
    }
    expect: {
        function f() {
            try {
                var undefined = typeof f;
                return f ? void 0 : undefined;
            } catch (e) {
                return "FAIL";
            }
        }
        console.log(f());
    }
    expect_stdout: "undefined"
}

conditional_assignments_1: {
    options = {
        conditionals: true,
        sequences: true,
    }
    input: {
        function f(a, b, c, d) {
            a = b;
            if (c) a = d;
            return a;
        }
        function g(a, b, c, d) {
            a = b;
            if (c); else a = d;
            return a;
        }
        console.log(f(0, "FAIL", 1, "PASS"), g(0, "PASS", 1, "FAIL"));
    }
    expect: {
        function f(a, b, c, d) {
            return a = c ? d : b, a;
        }
        function g(a, b, c, d) {
            return a = c ? b : d, a;
        }
        console.log(f(0, "FAIL", 1, "PASS"), g(0, "PASS", 1, "FAIL"));
    }
    expect_stdout: "PASS PASS"
}

conditional_assignments_2: {
    options = {
        conditionals: true,
        sequences: true,
    }
    input: {
        function f1(b, c, d) {
            a = b;
            if (c) a = d;
            return a;
        }
        function f2(a, c, d) {
            a = b;
            if (c) a = d;
            return a;
        }
        function f3(a, b, d) {
            a = b;
            if (c) a = d;
            return a;
        }
        function f4(a, b, c) {
            a = b;
            if (c) a = d;
            return a;
        }
    }
    expect: {
        function f1(b, c, d) {
            return a = c ? d : b, a;
        }
        function f2(a, c, d) {
            return a = b, c && (a = d), a;
        }
        function f3(a, b, d) {
            return a = b, c && (a = d), a;
        }
        function f4(a, b, c) {
            return a = b, c && (a = d), a;
        }
    }
}

conditional_assignments_3: {
    options = {
        conditionals: true,
        sequences: true,
    }
    input: {
        console.log(function(a, b) {
            a = "PASS";
            if (b) a = a;
            return a;
        }(0, 1));
    }
    expect: {
        console.log(function(a, b) {
            return a = "PASS", b && (a = a), a;
        }(0, 1));
    }
    expect_stdout: "PASS"
}

issue_3808_1: {
    options = {
        conditionals: true,
        side_effects: true,
    }
    input: {
        var a;
        a = "PASS", [] + "" && (a = "FAIL");
        console.log(a);
    }
    expect: {
        var a;
        a = [] + "" ? "FAIL" : "PASS";
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3808_2: {
    options = {
        conditionals: true,
        side_effects: true,
    }
    input: {
        var a;
        console.log((a = "PASS", [] + "" && (a = "FAIL")), a);
    }
    expect: {
        var a;
        console.log((a = "PASS", [] + "" && (a = "FAIL")), a);
    }
    expect_stdout: " PASS"
}
