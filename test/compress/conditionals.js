ifs_1: {
    options = {
        conditionals: true
    };
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
        conditionals: true
    };
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
        foo ? x() : bar ? y() : baz ? z() : t();
    }
}

ifs_3_should_warn: {
    options = {
        conditionals : true,
        dead_code    : true,
        evaluate     : true,
        booleans     : true
    };
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
        conditionals: true
    };
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
        if_return: true,
        conditionals: true,
        comparisons: true,
    };
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
        conditionals: true,
        comparisons: true
    };
    input: {
        var x;
        if (!foo && !bar && !baz && !boo) {
            x = 10;
        } else {
            x = 20;
        }
    }
    expect: {
        var x;
        x = foo || bar || baz || boo ? 20 : 10;
    }
}

cond_1: {
    options = {
        conditionals: true
    };
    input: {
        var do_something; // if undeclared it's assumed to have side-effects
        if (some_condition()) {
            do_something(x);
        } else {
            do_something(y);
        }
    }
    expect: {
        var do_something;
        do_something(some_condition() ? x : y);
    }
}

cond_2: {
    options = {
        conditionals: true
    };
    input: {
        var x, FooBar;
        if (some_condition()) {
            x = new FooBar(1);
        } else {
            x = new FooBar(2);
        }
    }
    expect: {
        var x, FooBar;
        x = new FooBar(some_condition() ? 1 : 2);
    }
}

cond_3: {
    options = {
        conditionals: true
    };
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
        conditionals: true
    };
    input: {
        var do_something;
        if (some_condition()) {
            do_something();
        } else {
            do_something();
        }
    }
    expect: {
        var do_something;
        some_condition(), do_something();
    }
}

cond_5: {
    options = {
        conditionals: true
    };
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
        some_condition() && some_other_condition() ? do_something() : alternate();
        some_condition() && some_other_condition() && do_something();
    }
}

cond_7: {
    options = {
        conditionals: true,
        evaluate    : true
    };
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
        x = z ? 'fuji' : (condition(), 'fuji');
        x = (condition(), 'foobar');
        x = y ? a : b;
        x = y ? 'foo' : 'fo';
    }
}

cond_7_1: {
    options = {
        conditionals: true,
        evaluate    : true
    };
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
        conditionals: true,
        evaluate    : true,
        booleans    : false
    };
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
        conditionals: true,
        evaluate    : true,
        booleans    : true
    };
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
        conditionals: true,
        evaluate    : false,
        booleans    : false
    };
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

ternary_boolean_consequent: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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

conditional_and: {
    options = {
        conditionals: true,
        evaluate    : true
    };
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

conditional_or: {
    options = {
        conditionals: true,
        evaluate    : true
    };
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

trivial_boolean_ternary_expressions : {
    options = {
        conditionals: true,
        evaluate    : true,
        booleans    : true
    };
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
        conditionals: true,
        evaluate    : true,
        booleans    : true,
    };
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
        function g5() { return g(), void 0; }
        function g6() { return g(), "number"; }
    }
}
