collapse_vars_side_effects_1: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true
    }
    input: {
        function f1() {
            var e = 7;
            var s = "abcdef";
            var i = 2;
            var log = console.log.bind(console);
            var x = s.charAt(i++);
            var y = s.charAt(i++);
            var z = s.charAt(i++);
            log(x, y, z, e);
        }
        function f2() {
            var e = 7;
            var log = console.log.bind(console);
            var s = "abcdef";
            var i = 2;
            var x = s.charAt(i++);
            var y = s.charAt(i++);
            var z = s.charAt(i++);
            log(x, i, y, z, e);
        }
        function f3() {
            var e = 7;
            var s = "abcdef";
            var i = 2;
            var log = console.log.bind(console);
            var x = s.charAt(i++);
            var y = s.charAt(i++);
            var z = s.charAt(i++);
            log(x, z, y, e);
        }
        function f4() {
            var log = console.log.bind(console),
                i = 10,
                x = i += 2,
                y = i += 3,
                z = i += 4;
            log(x, z, y, i);
        }
        f1(), f2(), f3(), f4();
    }
    expect: {
        function f1() {
            var s = "abcdef", i = 2;
            console.log.bind(console)(s.charAt(i++), s.charAt(i++), s.charAt(i++), 7);
        }
        function f2() {
            var s = "abcdef", i = 2;
            console.log.bind(console)(s.charAt(i++), 5, s.charAt(i++), s.charAt(i++), 7);
        }
        function f3() {
            var s = "abcdef",
                i = 2,
                log = console.log.bind(console),
                x = s.charAt(i++),
                y = s.charAt(i++);
            log(x, s.charAt(i++), y, 7);
        }
        function f4() {
            var i = 10,
                x = i += 2,
                y = i += 3;
            console.log.bind(console)(x, i += 4, y, 19);
        }
        f1(), f2(), f3(), f4();
    }
    expect_stdout: true
}

collapse_vars_side_effects_2: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function fn(x) { return console.log(x), x; }

        function p1() { var a = foo(), b = bar(), c = baz(); return a + b + c; }
        function p2() { var a = foo(), c = bar(), b = baz(); return a + b + c; }
        function p3() { var b = foo(), a = bar(), c = baz(); return a + b + c; }
        function p4() { var b = foo(), c = bar(), a = baz(); return a + b + c; }
        function p5() { var c = foo(), a = bar(), b = baz(); return a + b + c; }
        function p6() { var c = foo(), b = bar(), a = baz(); return a + b + c; }

        function q1() { var a = foo(), b = bar(), c = baz(); return fn(a + b + c); }
        function q2() { var a = foo(), c = bar(), b = baz(); return fn(a + b + c); }
        function q3() { var b = foo(), a = bar(), c = baz(); return fn(a + b + c); }
        function q4() { var b = foo(), c = bar(), a = baz(); return fn(a + b + c); }
        function q5() { var c = foo(), a = bar(), b = baz(); return fn(a + b + c); }
        function q6() { var c = foo(), b = bar(), a = baz(); return fn(a + b + c); }

        function r1() { var a = foo(), b = bar(), c = baz(); return fn(a) + fn(b) + fn(c); }
        function r2() { var a = foo(), c = bar(), b = baz(); return fn(a) + fn(b) + fn(c); }
        function r3() { var b = foo(), a = bar(), c = baz(); return fn(a) + fn(b) + fn(c); }
        function r4() { var b = foo(), c = bar(), a = baz(); return fn(a) + fn(b) + fn(c); }
        function r5() { var c = foo(), a = bar(), b = baz(); return fn(a) + fn(b) + fn(c); }
        function r6() { var c = foo(), b = bar(), a = baz(); return fn(a) + fn(b) + fn(c); }

        function s1() { var a = foo(), b = bar(), c = baz(); return g(a + b + c); }
        function s6() { var c = foo(), b = bar(), a = baz(); return g(a + b + c); }

        function t1() { var a = foo(), b = bar(), c = baz(); return g(a) + g(b) + g(c); }
        function t6() { var c = foo(), b = bar(), a = baz(); return g(a) + g(b) + g(c); }
    }
    expect: {
        function fn(x) { return console.log(x), x; }

        function p1() { return foo() + bar() + baz(); }
        function p2() { var a = foo(), c = bar(); return a + baz() + c; }
        function p3() { var b = foo(); return bar() + b + baz(); }
        function p4() { var b = foo(), c = bar(); return baz() + b + c; }
        function p5() { var c = foo(); return bar() + baz() + c; }
        function p6() { var c = foo(), b = bar(); return baz() + b + c; }

        function q1() { return fn(foo() + bar() + baz()); }
        function q2() { var a = foo(), c = bar(); return fn(a + baz() + c); }
        function q3() { var b = foo(); return fn(bar() + b + baz()); }
        function q4() { var b = foo(), c = bar(); return fn(baz() + b + c); }
        function q5() { var c = foo(); return fn(bar() + baz() + c); }
        function q6() { var c = foo(), b = bar(); return fn(baz() + b + c); }

        function r1() { var a = foo(), b = bar(), c = baz(); return fn(a) + fn(b) + fn(c); }
        function r2() { var a = foo(), c = bar(), b = baz(); return fn(a) + fn(b) + fn(c); }
        function r3() { var b = foo(), a = bar(), c = baz(); return fn(a) + fn(b) + fn(c); }
        function r4() { var b = foo(), c = bar(); return fn(baz()) + fn(b) + fn(c); }
        function r5() { var c = foo(), a = bar(), b = baz(); return fn(a) + fn(b) + fn(c); }
        function r6() { var c = foo(), b = bar(); return fn(baz()) + fn(b) + fn(c); }

        function s1() { var a = foo(), b = bar(), c = baz(); return g(a + b + c); }
        function s6() { var c = foo(), b = bar(), a = baz(); return g(a + b + c); }

        function t1() { var a = foo(), b = bar(), c = baz(); return g(a) + g(b) + g(c); }
        function t6() { var c = foo(), b = bar(), a = baz(); return g(a) + g(b) + g(c); }
    }
}

collapse_vars_issue_721: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true, passes:2
    }
    input: {
        define(["require", "exports", 'handlebars'], function (require, exports, hb) {
            var win = window;
            var _hb = win.Handlebars = hb;
            return _hb;
        });
        def(function (hb) {
            var win = window;
            var prop = 'Handlebars';
            var _hb = win[prop] = hb;
            return _hb;
        });
        def(function (hb) {
            var prop = 'Handlebars';
            var win = window;
            var _hb = win[prop] = hb;
            return _hb;
        });
        def(function (hb) {
            var prop = 'Handlebars';
            var win = g();
            var _hb = win[prop] = hb;
            return _hb;
        });
        def(function (hb) {
            var prop = g1();
            var win = g2();
            var _hb = win[prop] = hb;
            return _hb;
        });
        def(function (hb) {
            var win = g2();
            var prop = g1();
            var _hb = win[prop] = hb;
            return _hb;
        });
    }
    expect: {
        define([ "require", "exports", "handlebars" ], function(require, exports, hb) {
            return window.Handlebars = hb;
        }),
        def(function(hb) {
            return window.Handlebars = hb;
        }),
        def(function(hb) {
            return window.Handlebars = hb;
        }),
        def(function (hb) {
            return g().Handlebars = hb;
        }),
        def(function (hb) {
            var prop = g1();
            return g2()[prop] = hb;
        }),
        def(function (hb) {
            return g2()[g1()] = hb;
        });
    }
}

collapse_vars_properties: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true
    }
    input: {
        function f1(obj) {
            var prop = 'LiteralProperty';
            return !!-+obj[prop];
        }
        function f2(obj) {
            var prop1 = 'One';
            var prop2 = 'Two';
            return ~!!-+obj[prop1 + prop2];
        }
    }
    expect: {
        function f1(obj) {
            return !!-+obj.LiteralProperty;
        }
        function f2(obj) {
            return ~!!-+obj.OneTwo;
        }
    }
}

collapse_vars_if: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true
    }
    input: {
        function f1() {
            var not_used = sideeffect(), x = g1 + g2;
            var y = x / 4, z = 'Bar' + y;
            if ('x' != z) { return g9; }
            else return g5;
        }
        function f2() {
            var  x = g1 + g2, not_used = sideeffect();
            var y = x / 4
            var z = 'Bar' + y;
            if ('x' != z) { return g9; }
            else return g5;
        }
        function f3(x) {
            if (x) {
                var a = 1;
                return a;
            }
            else {
                var b = 2;
                return b;
            }
        }
    }
    expect: {
        function f1() {
            sideeffect();
            return "x" != "Bar" + (g1 + g2) / 4 ? g9 : g5;
        }
        function f2() {
            var x = g1 + g2;
            sideeffect();
            return "x" != "Bar" + x / 4 ? g9 : g5;
        }
        function f3(x) {
            if (x) {
                return 1;
            }
            return 2;
        }
    }
}

collapse_vars_while: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:false, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true
    }
    input: {
        function f1(y) {
            // Neither the non-constant while condition `c` will be
            // replaced, nor the non-constant `x` in the body.
            var x = y, c = 3 - y;
            while (c) { return x; }
            var z = y * y;
            return z;
        }
        function f2(y) {
            // The constant `x` will be replaced in the while body.
            var x = 7;
            while (y) { return x; }
            var z = y * y;
            return z;
        }
        function f3(y) {
            // The non-constant `n` will not be replaced in the while body.
            var n = 5 - y;
            while (y) { return n; }
            var z = y * y;
            return z;
        }
    }
    expect: {
        function f1(y) {
            var x = y, c = 3 - y;
            while (c) return x;
            return y * y;
        }
        function f2(y) {
            while (y) return 7;
            return y * y
        }
        function f3(y) {
            var n = 5 - y;
            while (y) return n;
            return y * y;
        }
    }
}

collapse_vars_do_while: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:false, loops:false, unused:"keep_assign",
        hoist_funs:true, keep_fargs:true, if_return:true, join_vars:true,
        side_effects:true
    }
    input: {
        function f1(y) {
            // The constant do-while condition `c` will not be replaced.
            var c = 9;
            do {} while (c === 77);
        }
        function f2(y) {
            // The non-constant do-while condition `c` will not be replaced.
            var c = 5 - y;
            do { } while (c);
        }
        function f3(y) {
            // The constant `x` will be replaced in the do loop body.
            function fn(n) { console.log(n); }
            var a = 2, x = 7;
            do {
                fn(a = x);
                break;
            } while (y);
        }
        function f4(y) {
            // The non-constant `a` will not be replaced in the do loop body.
            var a = y / 4;
            do {
                return a;
            } while (y);
        }
        function f5(y) {
            function p(x) { console.log(x); }
            do {
                // The non-constant `a` will be replaced in p(a)
                // because it is declared in same block.
                var a = y - 3;
                p(a);
            } while (--y);
        }
    }
    expect: {
        function f1(y) {
            var c = 9;
            do ; while (77 === c);
        }
        function f2(y) {
            var c = 5 - y;
            do ; while (c);
        }
        function f3(y) {
            function fn(n) { console.log(n); }
            var a = 2, x = 7;
            do {
                fn(a = x);
                break;
            } while (y);
        }
        function f4(y) {
            var a = y / 4;
            do
                return a;
            while (y);
        }
        function f5(y) {
            function p(x) { console.log(x); }
            do {
                p(y - 3);
            } while (--y);
        }
    }
}

collapse_vars_do_while_drop_assign: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:false, loops:false, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function f1(y) {
            // The constant do-while condition `c` will be not replaced.
            var c = 9;
            do {} while (c === 77);
        }
        function f2(y) {
            // The non-constant do-while condition `c` will not be replaced.
            var c = 5 - y;
            do { } while (c);
        }
        function f3(y) {
            // The constant `x` will be replaced in the do loop body.
            function fn(n) { console.log(n); }
            var a = 2, x = 7;
            do {
                fn(a = x);
                break;
            } while (y);
        }
        function f4(y) {
            // The non-constant `a` will not be replaced in the do loop body.
            var a = y / 4;
            do {
                return a;
            } while (y);
        }
        function f5(y) {
            function p(x) { console.log(x); }
            do {
                // The non-constant `a` will be replaced in p(a)
                // because it is declared in same block.
                var a = y - 3;
                p(a);
            } while (--y);
        }
    }
    expect: {
        function f1(y) {
            var c = 9;
            do ; while (77 === c);
        }
        function f2(y) {
            var c = 5 - y;
            do ; while (c);
        }
        function f3(y) {
            function fn(n) { console.log(n); }
            var x = 7;
            do {
                fn(x);
                break;
            } while (y);
        }
        function f4(y) {
            var a = y / 4;
            do
                return a;
            while (y);
        }
        function f5(y) {
            function p(x) { console.log(x); }
            do {
                p(y - 3);
            } while (--y);
        }
    }
}

collapse_vars_seq: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        var f1 = function(x, y) {
            var a, b, r = x + y, q = r * r, z = q - r;
            a = z, b = 7;
            return a + b;
        };
        console.log(f1(1, 2));
    }
    expect: {
        var f1 = function(x, y) {
            var r = x + y;
            return r * r - r + 7;
        };
        console.log(f1(1, 2));
    }
    expect_stdout: "13"
}

collapse_vars_throw: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        var f1 = function(x, y) {
            var a, b, r = x + y, q = r * r, z = q - r;
            a = z, b = 7;
            throw a + b;
        };
        try {
            f1(1, 2);
        } catch (e) {
            console.log(e);
        }
    }
    expect: {
        var f1 = function(x, y) {
            var r = x + y;
            throw r * r - r + 7;
        };
        try {
            f1(1, 2);
        } catch (e) {
            console.log(e);
        }
    }
    expect_stdout: "13"
}

collapse_vars_switch: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function f1() {
            var not_used = sideeffect(), x = g1 + g2;
            var y = x / 4, z = 'Bar' + y;
            switch (z) { case 0: return g9; }
        }
        function f2() {
            var  x = g1 + g2, not_used = sideeffect();
            var y = x / 4
            var z = 'Bar' + y;
            switch (z) { case 0: return g9; }
        }
        function f3(x) {
            switch(x) { case 1: var a = 3 - x; return a; }
        }
    }
    expect: {
        function f1() {
            sideeffect();
            switch ("Bar" + (g1 + g2) / 4) { case 0: return g9 }
        }
        function f2() {
            var x = g1 + g2;
            sideeffect();
            switch ("Bar" + x / 4) { case 0: return g9 }
        }
        function f3(x) {
            // verify no extraneous semicolon in case block before return
            // when the var definition was eliminated
            switch(x) { case 1: return 3 - x; }
        }
    }
}

collapse_vars_assignment: {
    options = {
        collapse_vars:true, sequences:true, properties:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function log(x) { return console.log(x), x; }
        function f0(c) {
            var a = 3 / c;
            return a = a;
        }
        function f1(c) {
            const a = 3 / c;
            const b = 1 - a;
            return b;
        }
        function f2(c) {
            var a = 3 / c;
            var b = a - 7;
            return log(c = b);
        }
        function f3(c) {
            var a = 3 / c;
            var b = a - 7;
            return log(c |= b);
        }
        function f4(c) {
            var a = 3 / c;
            var b = 2;
            return log(b += a);
        }
        function f5(c) {
            var b = 2;
            var a = 3 / c;
            return log(b += a);
        }
        function f6(c) {
            var b = g();
            var a = 3 / c;
            return log(b += a);
        }
    }
    expect: {
        function log(x) { return console.log(x), x; }
        function f0(c) {
            var a = 3 / c;
            return a = a;
        }
        function f1(c) {
            return 1 - 3 / c;
        }
        function f2(c) {
            return log(c = 3 / c - 7);
        }
        function f3(c) {
            return log(c |= 3 / c - 7);
        }
        function f4(c) {
            var b = 2;
            return log(b += 3 / c);
        }
        function f5(c) {
            var b = 2;
            return log(b += 3 / c);
        }
        function f6(c) {
            var b = g();
            return log(b += 3 / c);
        }
    }
}

collapse_vars_lvalues: {
    options = {
        collapse_vars:true, sequences:true, properties:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:"keep_assign",
        hoist_funs:true, keep_fargs:true, if_return:true, join_vars:true,
        side_effects:true
    }
    input: {
        function f0(x) { var i = ++x; return x += i; }
        function f1(x) { var a = (x -= 3); return x += a; }
        function f2(x) { var z = x, a = ++z; return z += a; }
        function f3(x) { var a = (x -= 3), b = x + a; return b; }
        function f4(x) { var a = (x -= 3); return x + a; }
        function f5(x) { var w = e1(), v = e2(), c = v = --x, b = w = x; return b - c; }
        function f6(x) { var w = e1(), v = e2(), c = v = --x, b = w = x; return c - b; }
        function f7(x) { var w = e1(), v = e2(), c = v - x, b = w = x; return b - c; }
        function f8(x) { var w = e1(), v = e2(), b = w = x, c = v - x; return b - c; }
        function f9(x) { var w = e1(), v = e2(), b = w = x, c = v - x; return c - b; }
    }
    expect: {
        function f0(x) { var i = ++x; return x += i; }
        function f1(x) { var a = (x -= 3); return x += a; }
        function f2(x) { var z = x, a = ++z; return z += a; }
        function f3(x) { var a = (x -= 3); return x + a; }
        function f4(x) { var a = (x -= 3); return x + a; }
        function f5(x) { var w = e1(), v = e2(), c = v = --x; return (w = x) - c; }
        function f6(x) { var w = e1(), v = e2(); return (v = --x) - (w = x); }
        function f7(x) { var w = e1(); return (w = x) - (e2() - x); }
        function f8(x) { var w = e1(); return (w = x) - (e2() - x); }
        function f9(x) { var w = e1(); return e2() - x - (w = x); }
    }
}

collapse_vars_lvalues_drop_assign: {
    options = {
        collapse_vars:true, sequences:true, properties:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true, passes:3
    }
    input: {
        function f0(x) { var i = ++x; return x += i; }
        function f1(x) { var a = (x -= 3); return x += a; }
        function f2(x) { var z = x, a = ++z; return z += a; }
        function f3(x) { var a = (x -= 3), b = x + a; return b; }
        function f4(x) { var a = (x -= 3); return x + a; }
        function f5(x) { var w = e1(), v = e2(), c = v = --x, b = w = x; return b - c; }
        function f6(x) { var w = e1(), v = e2(), c = v = --x, b = w = x; return c - b; }
        function f7(x) { var w = e1(), v = e2(), c = v - x, b = w = x; return b - c; }
        function f8(x) { var w = e1(), v = e2(), b = w = x, c = v - x; return b - c; }
        function f9(x) { var w = e1(), v = e2(), b = w = x, c = v - x; return c - b; }
    }
    expect: {
        function f0(x) { var i = ++x; return x += i; }
        function f1(x) { var a = (x -= 3); return x += a; }
        function f2(x) { var z = x, a = ++z; return z += a; }
        function f3(x) { var a = (x -= 3); return x + a; }
        function f4(x) { var a = (x -= 3); return x + a; }
        function f5(x) { e1(), e2(); var c = --x; return x - c; }
        function f6(x) { return e1(), e2(), --x - x; }
        function f7(x) { return e1(), x - (e2() - x); }
        function f8(x) { return e1(), x - (e2() - x); }
        function f9(x) { return e1(), e2() - x - x; }
    }
}

collapse_vars_misc1: {
    options = {
        collapse_vars:true, sequences:true, properties:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true
    }
    input: {
        function f0(o, a, h) {
            var b = 3 - a;
            var obj = o;
            var seven = 7;
            var prop = 'run';
            var t = obj[prop](b)[seven] = h;
            return t;
        }
        function f1(x) { var y = 5 - x; return y; }
        function f2(x) { const z = foo(), y = z / (5 - x); return y; }
        function f3(x) { var z = foo(), y = (5 - x) / z; return y; }
        function f4(x) { var z = foo(), y = (5 - u) / z; return y; }
        function f5(x) { const z = foo(), y = (5 - window.x) / z; return y; }
        function f6() { var b = window.a * window.z; return b && zap(); }
        function f7() { var b = window.a * window.z; return b + b; }
        function f8() { var b = window.a * window.z; var c = b + 5; return b + c; }
        function f9() { var b = window.a * window.z; return bar() || b; }
        function f10(x) { var a = 5, b = 3; return a += b; }
        function f11(x) { var a = 5, b = 3; return a += --b; }
    }
    expect: {
        function f0(o, a, h) {
            var b = 3 - a;
            return o.run(b)[7] = h;
        }
        function f1(x) { return 5 - x }
        function f2(x) { return foo() / (5 - x) }
        function f3(x) { return (5 - x) / foo() }
        function f4(x) { var z = foo(); return (5 - u) / z }
        function f5(x) { const z = foo(); return (5 - window.x) / z }
        function f6() { return window.a * window.z && zap() }
        function f7() { var b = window.a * window.z; return b + b }
        function f8() { var b = window.a * window.z; return b + (b + 5) }
        function f9() { var b = window.a * window.z; return bar() || b }
        function f10(x) { var a = 5; return a += 3; }
        function f11(x) { var a = 5, b = 3; return a += --b; }
    }
}

collapse_vars_self_reference: {
    options = {
        collapse_vars:true, unused:false,
        sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        // avoid bug in self-referential declaration.
        function f1() {
            var self = {
                inner: function() { return self; }
            };
        }
        function f2() {
            var self = { inner: self };
        }
    }
    expect: {
        // note: `unused` option is false
        function f1() {
            var self = {
                inner: function() { return self }
            };
        }
        function f2() {
            var self = { inner: self };
        }
    }
}

collapse_vars_repeated: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true
    }
    input: {
        function f1() {
            var dummy = 3, a = 5, unused = 2, a = 1, a = 3;
            return -a;
        }
        function f2(x) {
            var a = 3, a = x;
            return a;
        }
        (function(x){
             var a = "GOOD" + x, e = "BAD", k = "!", e = a;
             console.log(e + k);
        })("!"),

        (function(x){
            var a = "GOOD" + x, e = "BAD" + x, k = "!", e = a;
            console.log(e + k);
        })("!");
    }
    expect: {
        function f1() {
            return -3;
        }
        function f2(x) {
            return x;
        }
        (function(x){
             console.log("GOOD!!");
        })(),
        (function(x){
             console.log("GOOD!!");
        })();
    }
    expect_stdout: true
}

collapse_vars_closures: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true
    }
    input: {
        function constant_vars_can_be_replaced_in_any_scope() {
            var outer = 3;
            return function() { return outer; }
        }
        function non_constant_vars_can_only_be_replace_in_same_scope(x) {
            var outer = x;
            return function() { return outer; }
        }
    }
    expect: {
        function constant_vars_can_be_replaced_in_any_scope() {
            return function() { return 3 }
        }
        function non_constant_vars_can_only_be_replace_in_same_scope(x) {
            var outer = x
            return function() { return outer }
        }
    }
}

collapse_vars_unary: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function f0(o, p) {
            var x = o[p];
            return delete x;
        }
        function f1(n) {
            var k = !!n;
            return n > +k;
        }
        function f2(n) {
            // test unary with constant
            var k = 7;
            return k--;
        }
        function f3(n) {
            // test unary with constant
            var k = 7;
            return ++k;
        }
        function f4(n) {
            // test unary with non-constant
            var k = 8 - n;
            return k--;
        }
        function f5(n) {
            // test unary with non-constant
            var k = 9 - n;
            return ++k;
        }
    }
    expect: {
        function f0(o, p) {
            var x = o[p];
            return delete x;
        }
        function f1(n) {
            return n > +!!n
        }
        function f2(n) {
            var k = 7;
            return k--
        }
        function f3(n) {
            var k = 7;
            return ++k
        }
        function f4(n) {
            var k = 8 - n;
            return k--;
        }
        function f5(n) {
            var k = 9 - n;
            return ++k;
        }
    }
}

collapse_vars_try: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true
    }
    input: {
        function f1() {
            try {
                var a = 1;
                return a;
            }
            catch (ex) {
                var b = 2;
                return b;
            }
            finally {
                var c = 3;
                return c;
            }
        }
        function f2() {
            var t = could_throw(); // shouldn't be replaced in try block
            try {
                return t + might_throw();
            }
            catch (ex) {
                return 3;
            }
        }
    }
    expect: {
        function f1() {
            try {
                return 1;
            }
            catch (ex) {
                return 2;
            }
            finally {
                return 3;
            }
        }
        function f2() {
            var t = could_throw();
            try {
                return t + might_throw();
            }
            catch (ex) {
                return 3;
            }
        }
    }
}

collapse_vars_array: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function f1(x, y) {
            var z = x + y;
            return [z];
        }
        function f2(x, y) {
            var z = x + y;
            return [x, side_effect(), z];
        }
        function f3(x, y) {
            var z = f(x + y);
            return [ [3], [z, x, y], [g()] ];
        }
    }
    expect: {
        function f1(x, y) {
            return [x + y]
        }
        function f2(x, y) {
            var z = x + y
            return [x, side_effect(), z]
        }
        function f3(x, y) {
            return [ [3], [f(x + y), x, y], [g()] ]
        }
    }
}

collapse_vars_object: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function f0(x, y) {
            var z = x + y;
            return {
                get b() { return 7; },
                r: z
            };
        }
        function f1(x, y) {
            var z = x + y;
            return {
                r: z,
                get b() { return 7; }
            };
        }
        function f2(x, y) {
            var z = x + y;
            var k = x - y;
            return {
                q: k,
                r: g(x),
                s: z
            };
        }
        function f3(x, y) {
            var z = f(x + y);
            return [{
                a: {q: x, r: y, s: z},
                b: g()
            }];
        }
    }
    expect: {
        function f0(x, y) {
            return {
                get b() { return 7; },
                r: x + y
            };
        }
        function f1(x, y) {
            return {
                r: x + y,
                get b() { return 7; }
            };
        }
        function f2(x, y) {
            var z = x + y;
            return {
                q: x - y,
                r: g(x),
                s: z
            };
        }
        function f3(x, y) {
            return [{
                a: {q: x, r: y, s: f(x + y)},
                b: g()
            }];
        }
    }
}

collapse_vars_eval_and_with: {
    options = {
        collapse_vars:true, sequences:false, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        // Don't attempt to collapse vars in presence of eval() or with statement.
        (function f0() {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })();
        (function f1() {
            var o = {a: 1}, a = 2;
            with (o) console.log(a);
        })();
        (function f2() {
            var o = {a: 1}, a = 2;
            return function() { with (o) console.log(a) };
        })()();
    }
    expect: {
        (function f0() {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })();
        (function f1() {
            var o = {a: 1}, a = 2;
            with(o) console.log(a);
        })();
        (function f2() {
            var o = {a: 1}, a = 2;
            return function() { with (o) console.log(a) };
        })()();
    }
    expect_stdout: true
}

collapse_vars_constants: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        reduce_funcs: true, reduce_vars:true
    }
    input: {
        function f1(x) {
            var a = 4, b = x.prop, c = 5, d = sideeffect1(), e = sideeffect2();
            return b + (function() { return d - a * e - c; })();
        }
        function f2(x) {
            var a = 4, b = x.prop, c = 5, not_used = sideeffect1(), e = sideeffect2();
            return b + (function() { return -a * e - c; })();
        }
        function f3(x) {
            var a = 4, b = x.prop, c = 5, not_used = sideeffect1();
            return b + (function() { return -a - c; })();
        }
    }
    expect: {
        function f1(x) {
            var b = x.prop, d = sideeffect1(), e = sideeffect2();
            return b + (function() { return d - 4 * e - 5; })();
        }
        function f2(x) {
            var b = x.prop, e = (sideeffect1(), sideeffect2());
            return b + (function() { return -4 * e - 5; })();
        }
        function f3(x) {
            var b = x.prop;
            sideeffect1();
            return b + (function() { return -9; })();
        }
    }
}

collapse_vars_arguments: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true,
        toplevel:true, reduce_funcs: true, reduce_vars:true
    }
    input: {
        var outer = function() {
            // Do not replace `arguments` but do replace the constant `k` before it.
            var k = 7, arguments = 5, inner = function() { console.log(arguments); }
            inner(k, 1);
        }
        outer();
    }
    expect: {
        (function() {
            (function(){console.log(arguments);})(7, 1);
        })();
    }
    expect_stdout: true
}

collapse_vars_short_circuit: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function f0(x) { var a = foo(), b = bar(); return b || x; }
        function f1(x) { var a = foo(), b = bar(); return b && x; }
        function f2(x) { var a = foo(), b = bar(); return x && a && b; }
        function f3(x) { var a = foo(), b = bar(); return a && x; }
        function f4(x) { var a = foo(), b = bar(); return a && x && b; }
        function f5(x) { var a = foo(), b = bar(); return x || a || b; }
        function f6(x) { var a = foo(), b = bar(); return a || x || b; }
        function f7(x) { var a = foo(), b = bar(); return a && b && x; }
        function f8(x,y) { var a = foo(), b = bar(); return (x || a) && (y || b); }
        function f9(x,y) { var a = foo(), b = bar(); return (x && a) || (y && b); }
        function f10(x,y) { var a = foo(), b = bar(); return (x - a) || (y - b); }
        function f11(x,y) { var a = foo(), b = bar(); return (x - b) || (y - a); }
        function f12(x,y) { var a = foo(), b = bar(); return (x - y) || (b - a); }
        function f13(x,y) { var a = foo(), b = bar(); return (a - b) || (x - y); }
        function f14(x,y) { var a = foo(), b = bar(); return (b - a) || (x - y); }
    }
    expect: {
        function f0(x) { foo(); return bar() || x; }
        function f1(x) { foo(); return bar() && x; }
        function f2(x) { var a = foo(), b = bar(); return x && a && b; }
        function f3(x) { var a = foo(); bar(); return a && x; }
        function f4(x) { var a = foo(), b = bar(); return a && x && b; }
        function f5(x) { var a = foo(), b = bar(); return x || a || b; }
        function f6(x) { var a = foo(), b = bar(); return a || x || b; }
        function f7(x) { var a = foo(), b = bar(); return a && b && x; }
        function f8(x,y) { var a = foo(), b = bar(); return (x || a) && (y || b); }
        function f9(x,y) { var a = foo(), b = bar(); return (x && a) || (y && b); }
        function f10(x,y) { var a = foo(), b = bar(); return (x - a) || (y - b); }
        function f11(x,y) { var a = foo(); return (x - bar()) || (y - a); }
        function f12(x,y) { var a = foo(), b = bar(); return (x - y) || (b - a); }
        function f13(x,y) { return (foo() - bar()) || (x - y); }
        function f14(x,y) { var a = foo(); return (bar() - a) || (x - y); }
    }
}

collapse_vars_short_circuited_conditions: {
    options = {
        collapse_vars: true,
        sequences:     false,
        dead_code:     true,
        conditionals:  false,
        comparisons:   false,
        evaluate:      true,
        booleans:      true,
        loops:         true,
        unused:        true,
        hoist_funs:    true,
        keep_fargs:    true,
        if_return:     false,
        join_vars:     true,
        side_effects:  true,
    }
    input: {
        function c1(x) { var a = foo(), b = bar(), c = baz(); return a ? b : c; }
        function c2(x) { var a = foo(), b = bar(), c = baz(); return a ? c : b; }
        function c3(x) { var a = foo(), b = bar(), c = baz(); return b ? a : c; }
        function c4(x) { var a = foo(), b = bar(), c = baz(); return b ? c : a; }
        function c5(x) { var a = foo(), b = bar(), c = baz(); return c ? a : b; }
        function c6(x) { var a = foo(), b = bar(), c = baz(); return c ? b : a; }

        function i1(x) { var a = foo(), b = bar(), c = baz(); if (a) return b; else return c; }
        function i2(x) { var a = foo(), b = bar(), c = baz(); if (a) return c; else return b; }
        function i3(x) { var a = foo(), b = bar(), c = baz(); if (b) return a; else return c; }
        function i4(x) { var a = foo(), b = bar(), c = baz(); if (b) return c; else return a; }
        function i5(x) { var a = foo(), b = bar(), c = baz(); if (c) return a; else return b; }
        function i6(x) { var a = foo(), b = bar(), c = baz(); if (c) return b; else return a; }
    }
    expect: {
        function c1(x) { var a = foo(), b = bar(), c = baz(); return a ? b : c; }
        function c2(x) { var a = foo(), b = bar(), c = baz(); return a ? c : b; }
        function c3(x) { var a = foo(), b = bar(), c = baz(); return b ? a : c; }
        function c4(x) { var a = foo(), b = bar(), c = baz(); return b ? c : a; }
        function c5(x) { var a = foo(), b = bar(); return baz() ? a : b; }
        function c6(x) { var a = foo(), b = bar(); return baz() ? b : a; }

        function i1(x) { var a = foo(), b = bar(), c = baz(); if (a) return b; else return c; }
        function i2(x) { var a = foo(), b = bar(), c = baz(); if (a) return c; else return b; }
        function i3(x) { var a = foo(), b = bar(), c = baz(); if (b) return a; else return c; }
        function i4(x) { var a = foo(), b = bar(), c = baz(); if (b) return c; else return a; }
        function i5(x) { var a = foo(), b = bar(); if (baz()) return a; else return b; }
        function i6(x) { var a = foo(), b = bar(); if (baz()) return b; else return a; }
    }
}

collapse_vars_regexp: {
    options = {
        booleans:      true,
        collapse_vars: true,
        comparisons:   true,
        conditionals:  true,
        dead_code:     true,
        evaluate:      true,
        if_return:     true,
        join_vars:     true,
        hoist_funs:    true,
        keep_fargs:    true,
        loops:         false,
        reduce_funcs:  true,
        reduce_vars:   true,
        side_effects:  true,
        unused:        true,
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
        (function() {
            var result;
            var s = 'acdabcdeabbb';
            var rx = /ab*/g;
            while (result = rx.exec(s)) {
                console.log(result[0]);
            }
        })();
        (function() {
            var result;
            var s = 'acdabcdeabbb';
            var rx = f2();
            while (result = rx(s)) {
                console.log(result[0]);
            }
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
    }
    expect_stdout: true
}

issue_1537: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var k = '';
        for (k in {prop: 'val'}){}
    }
    expect: {
        var k = '';
        for (k in {prop: 'val'});
    }
}

issue_1537_for_of: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var k = '';
        for (k of {prop: 'val'}){}
    }
    expect: {
        var k = '';
        for (k of {prop: 'val'});
    }
}

issue_1537_destructuring_1: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var x = 1, y = 2;
        [x] = [y];
    }
    expect: {
        var x = 1, y = 2;
        [x] = [y];
    }
}

issue_1537_destructuring_2: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var x = foo();
        [x] = [1];
    }
    expect: {
        var x = foo();
        [x] = [1];
    }
}

issue_1537_destructuring_3: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var x = Math.random();
        ({p: x = 9} = {v: 1});
    }
    expect: {
        var x = Math.random();
        ({p: x = 9} = {v: 1});
    }
}

issue_1537_destructuring_for_in: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var x = 1, y = 2;
        (function() {
            for ([[x], y] in a);
        })();
    }
    expect: {
        var x = 1, y = 2;
        (function() {
            for ([[x], y] in a);
        })();
    }
}

issue_1537_destructuring_for_of: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var x = 1, y = 2;
        (function() {
            for ([[x], y] of a);
        })();
    }
    expect: {
        var x = 1, y = 2;
        (function() {
            for ([[x], y] of a);
        })();
    }
}

issue_1562: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var v = 1, B = 2;
        for (v in objs) f(B);

        var x = 3, C = 10;
        while(x + 2) bar(C);

        var y = 4, D = 20;
        do bar(D); while(y + 2);

        var z = 5, E = 30;
        for (; f(z + 2) ;) bar(E);
    }
    expect: {
        var v = 1;
        for (v in objs) f(2);

        while(5) bar(10);

        do bar(20); while(6);

        for (; f(7) ;) bar(30);
    }
}

issue_1605_1: {
    options = {
        collapse_vars: true,
        toplevel: false,
        unused: true,
    }
    input: {
        function foo(x) {
            var y = x;
            return y;
        }
        var o = new Object;
        o.p = 1;
    }
    expect: {
        function foo(x) {
            return x;
        }
        var o = new Object;
        o.p = 1;
    }
}

issue_1605_2: {
    options = {
        collapse_vars: true,
        toplevel: "vars",
        unused: true,
    }
    input: {
        function foo(x) {
            var y = x;
            return y;
        }
        var o = new Object;
        o.p = 1;
    }
    expect: {
        function foo(x) {
            return x;
        }
        (new Object).p = 1;
    }
}

issue_1631_1: {
    options = {
        collapse_vars: true,
        hoist_funs: true,
        join_vars: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        var pc = 0;
        function f(x) {
            pc = 200;
            return 100;
        }
        function x() {
            var t = f();
            pc += t;
            return pc;
        }
        console.log(x());
    }
    expect: {
        function f(x) {
            return pc = 200, 100;
        }
        function x() {
            var t = f();
            return pc += t;
        }
        var pc = 0;
        console.log(x());
    }
    expect_stdout: "300"
}

issue_1631_2: {
    options = {
        collapse_vars: true,
        hoist_funs: true,
        join_vars: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        var a = 0, b = 1;
        function f() {
            a = 2;
            return 4;
        }
        function g() {
            var t = f();
            b = a + t;
            return b;
        }
        console.log(g());
    }
    expect: {
        function f() {
            return a = 2, 4;
        }
        function g() {
            var t = f();
            return b = a + t;
        }
        var a = 0, b = 1;
        console.log(g());
    }
    expect_stdout: "6"
}

issue_1631_3: {
    options = {
        collapse_vars: true,
        hoist_funs: true,
        join_vars: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function g() {
            var a = 0, b = 1;
            function f() {
                a = 2;
                return 4;
            }
            var t = f();
            b = a + t;
            return b;
        }
        console.log(g());
    }
    expect: {
        function g() {
            function f() {
                return a = 2, 4;
            }
            var a = 0, b = 1, t = f();
            return b = a + t;
        }
        console.log(g());
    }
    expect_stdout: "6"
}

var_side_effects_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var print = console.log.bind(console);
        function foo(x) {
            var twice = x * 2;
            print('Foo:', twice);
        }
        foo(10);
    }
    expect: {
        var print = console.log.bind(console);
        function foo(x) {
            print('Foo:', 2 * x);
        }
        foo(10);
    }
    expect_stdout: true
}

var_side_effects_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var print = console.log.bind(console);
        function foo(x) {
            var twice = x.y * 2;
            print('Foo:', twice);
        }
        foo({ y: 10 });
    }
    expect: {
        var print = console.log.bind(console);
        function foo(x) {
            var twice = 2 * x.y;
            print('Foo:', twice);
        }
        foo({ y: 10 });
    }
    expect_stdout: true
}

var_side_effects_3: {
    options = {
        collapse_vars: true,
        pure_getters: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var print = console.log.bind(console);
        function foo(x) {
            var twice = x.y * 2;
            print('Foo:', twice);
        }
        foo({ y: 10 });
    }
    expect: {
        var print = console.log.bind(console);
        function foo(x) {
            print('Foo:', 2 * x.y);
        }
        foo({ y: 10 });
    }
    expect_stdout: true
}

reduce_vars_assign: {
    options = {
        collapse_vars: true,
        reduce_funcs: true,
        reduce_vars: true,
    }
    input: {
        !function() {
            var a = 1;
            a = [].length,
            console.log(a);
        }();
    }
    expect: {
        !function() {
            var a = 1;
            a = [].length,
            console.log(a);
        }();
    }
    expect_stdout: "0"
}

iife_1: {
    options = {
        collapse_vars: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var log = function(x) {
            console.log(x);
        }, foo = bar();
        log(foo);
    }
    expect: {
        (function(x) {
            console.log(x);
        })(bar());
    }
}

iife_2: {
    options = {
        collapse_vars: true,
        reduce_funcs: false,
        reduce_vars: false,
        toplevel: true,
        unused: false,
    }
    input: {
        var foo = bar();
        !function(x) {
            console.log(x);
        }(foo);
    }
    expect: {
        var foo;
        !function(x) {
            console.log(x);
        }(bar());
    }
}

var_defs: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        var f1 = function(x, y) {
            var a, b, r = x + y, q = r * r, z = q - r, a = z, b = 7;
            console.log(a + b);
        };
        f1("1", 0);
    }
    expect: {
        var f1 = function(x, y) {
            var r = x + y, a = r * r - r, b = 7;
            console.log(a + b);
        };
        f1("1", 0);
    }
    expect_stdout: "97"
}

assignment: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f() {
            var a;
            a = x;
            return a;
        }
    }
    expect: {
        function f() {
            return x;
        }
    }
}

for_init: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(x, y) {
            var a = x;
            var b = y;
            for (a; b;);
        }
    }
    expect: {
        function f(x, y) {
            var b = y;
            for (x; b;);
        }
    }
}

switch_case_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(x, y, z) {
            var a = x();
            var b = y();
            var c = z;
            switch (a) {
              default: d();
              case b: e();
              case c: f();
            }
        }
    }
    expect: {
        function f(x, y, z) {
            switch (x()) {
              default: d();
              case y(): e();
              case z: f();
            }
        }
    }
}

switch_case_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 1, b = 2;
        switch (b++) {
          case b:
            var c = a;
            var a;
            break;
        }
        console.log(a);
    }
    expect: {
        var a = 1, b = 2;
        switch (b++) {
          case b:
            var c = a;
            var a;
            break;
        }
        console.log(a);
    }
    expect_stdout: "1"
}

switch_case_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 1, b = 2;
        switch (a) {
          case a:
            var b;
            break;
          case b:
            break;
        }
        console.log(b);
    }
    expect: {
        var a = 1, b = 2;
        switch (a) {
          case a:
            var b;
            break;
          case b:
            break;
        }
        console.log(b);
    }
    expect_stdout: "2"
}

issue_27: {
    options = {
        collapse_vars: true,
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

modified: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f1(b) {
            var a = b;
            return b + a;
        }
        function f2(b) {
            var a = b;
            return b++ + a;
        }
        function f3(b) {
            var a = b++;
            return b + a;
        }
        function f4(b) {
            var a = b++;
            return b++ + a;
        }
        function f5(b) {
            var a = function() {
                return b;
            }();
            return b++ + a;
        }
        console.log(f1(1), f2(1), f3(1), f4(1), f5(1));
    }
    expect: {
        function f1(b) {
            return b + b;
        }
        function f2(b) {
            var a = b;
            return b++ + a;
        }
        function f3(b) {
            var a = b++;
            return b + a;
        }
        function f4(b) {
            var a = b++;
            return b++ + a;
        }
        function f5(b) {
            var a = function() {
                return b;
            }();
            return b++ + a;
        }
        console.log(f1(1), f2(1), f3(1), f4(1), f5(1));
    }
    expect_stdout: "2 2 3 3 2"
}

issue_1858: {
    options = {
        collapse_vars: true,
        pure_getters: true,
        unused: true,
    }
    input: {
        console.log(function(x) {
            var a = {}, b = a.b = x;
            return a.b + b;
        }(1));
    }
    expect: {
        console.log(function(x) {
            var a = {}, b = a.b = 1;
            return a.b + b;
        }());
    }
    expect_stdout: "2"
}

anonymous_function: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function f(a) {
            f ^= 0;
            return f * a;
        }(1));
    }
    expect: {
        console.log(function f(a) {
            f ^= 0;
            return f * a;
        }(1));
    }
    expect_stdout: true
}

side_effects_property: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = [];
        var b = 0;
        a[b++] = function() { return 42;};
        var c = a[b++]();
        console.log(c);
    }
    expect: {
        var a = [];
        var b = 0;
        a[b++] = function() { return 42;};
        var c = a[b++]();
        console.log(c);
    }
    expect_stdout: true
}

undeclared: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(x, y) {
            var a;
            a = x;
            b = y;
            return b + a;
        }
    }
    expect: {
        function f(x, y) {
            b = y;
            return b + x;
        }
    }
}

ref_scope: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = 1, b = 2, c = 3;
            var a = c++, b = b /= a;
            return function() {
                return a;
            }() + b;
        }());
    }
    expect: {
        console.log(function() {
            var a = 1, b = 2, c = 3;
            b = b /= a = c++;
            return function() {
                return a;
            }() + b;
        }());
    }
    expect_stdout: true
}

chained_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = 2;
        var a = 3 / a;
        console.log(a);
    }
    expect: {
        var a = 3 / (a = 2);
        console.log(a);
    }
    expect_stdout: true
}

chained_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a;
        var a = 2;
        a = 3 / a;
        console.log(a);
    }
    expect: {
        var a;
        a = 3 / (a = 2);
        console.log(a);
    }
    expect_stdout: true
}

chained_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a, b) {
            var c = a, c = b;
            b++;
            return c;
        }(1, 2));
    }
    expect: {
        console.log(function(a, b) {
            var c = 1;
            c = b;
            b++;
            return c;
        }(0, 2));
    }
    expect_stdout: "2"
}

boolean_binary_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 1;
        a++;
        (function() {} || a || 3).toString();
        console.log(a);
    }
    expect: {
        var a = 1;
        a++;
        (function() {} || a || 3).toString();
        console.log(a);
    }
    expect_stdout: true
}

boolean_binary_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var c = 0;
        c += 1;
        (function() {
            c = 1 + c;
        } || 9).toString();
        console.log(c);
    }
    expect: {
        var c = 0;
        c += 1;
        (function() {
            c = 1 + c;
        } || 9).toString();
        console.log(c);
    }
    expect_stdout: true
}

inner_lvalues: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a, b = 10;
        var a = (--b || a || 3).toString(), c = --b + -a;
        console.log(null, a, b);
    }
    expect: {
        var b = 10;
        var a = (--b || a || 3).toString(), c = --b + -a;
        console.log(null, a, b);
    }
    expect_stdout: true
}

double_def_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = x, a = a && y;
        a();
    }
    expect: {
        var a;
        (a = (a = x) && y)();
    }
}

double_def_2: {
    options = {
        collapse_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = x, a = a && y;
        a();
    }
    expect: {
        (x && y)();
    }
}

toplevel_single_reference: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a;
        for (var b in x) {
            var a = b;
            b(a);
        }
    }
    expect: {
        for (var b in x) {
            var a;
            b(a = b);
        }
    }
}

unused_orig: {
    options = {
        collapse_vars: true,
        dead_code: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = 1;
        console.log(function(b) {
            var a;
            var c = b;
            for (var d in c) {
                var a = c[0];
                return --b + a;
            }
            try {
            } catch (e) {
                --b + a;
            }
            a && a.NaN;
        }([2]), a);
    }
    expect: {
        var a = 1;
        console.log(function(b) {
            var c = b;
            for (var d in c) {
                var a;
                return --b + c[0];
            }
            a && a.NaN;
        }([2]), a);
    }
    expect_stdout: "3 1"
}

issue_315: {
    options = {
        collapse_vars: true,
        evaluate: true,
        keep_fargs: false,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        unused: true,
    }
    input: {
        console.log(function(s) {
            var w, _i, _len, _ref, _results;
            _ref = s.trim().split(" ");
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                w = _ref[_i];
                _results.push(w.toLowerCase());
            }
            return _results;
        }("test"));
    }
    expect: {
        console.log(function() {
            var w, _i, _len, _ref, _results;
            for (_results = [], _i = 0, _len = (_ref = "test".trim().split(" ")).length; _i < _len ; _i++)
                w = _ref[_i], _results.push(w.toLowerCase());
            return _results;
        }());
    }
    expect_stdout: true
}

lvalues_def: {
    options = {
        collapse_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = 0, b = 1;
        var a = b++, b = +function() {}();
        a && a[a++];
        console.log(a, b);
    }
    expect: {
        var a = 0, b = 1;
        a = b++, b = +void 0;
        a && a[a++];
        console.log(a, b);
    }
    expect_stdout: true
}

compound_assignment: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        a = 1;
        a += a + 2;
        console.log(a);
    }
    expect: {
        var a;
        a = 1;
        a += a + 2;
        console.log(a);
    }
    expect_stdout: "4"
}

reassign_const_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f() {
            const a = 1;
            a = 2;
            return a;
        }
        console.log(f());
    }
    expect: {
        function f() {
            const a = 1;
            a = 2;
            return a;
        }
        console.log(f());
    }
    expect_stdout: true
}

reassign_const_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f() {
            const a = 1;
            ++a;
            return a;
        }
        console.log(f());
    }
    expect: {
        function f() {
            const a = 1;
            ++a;
            return a;
        }
        console.log(f());
    }
    expect_stdout: true
}

issue_2187_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = 1;
        !function(foo) {
            foo();
            var a = 2;
            console.log(a);
        }(function() {
            console.log(a);
        });
    }
    expect: {
        var a = 1;
        !function(foo) {
            foo();
            var a = 2;
            console.log(a);
        }(function() {
            console.log(a);
        });
    }
    expect_stdout: [
        "1",
        "2",
    ]
}

issue_2187_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var b = 1;
        console.log(function(a) {
            return a && ++b;
        }(b--));
    }
    expect: {
        var b = 1;
        console.log(function(a) {
            return b-- && ++b;
        }());
    }
    expect_stdout: "1"
}

issue_2187_3: {
    options = {
        collapse_vars: true,
        inline: true,
        unused: true,
    }
    input: {
        var b = 1;
        console.log(function(a) {
            return a && ++b;
        }(b--));
    }
    expect: {
        var b = 1;
        console.log(b-- && ++b);
    }
    expect_stdout: "1"
}

issue_2203_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        a = "FAIL";
        console.log({
            a: "PASS",
            b: function() {
                return function(c) {
                    return c.a;
                }((String, (Object, this)));
            }
        }.b());
    }
    expect: {
        a = "FAIL";
        console.log({
            a: "PASS",
            b: function() {
                return function(c) {
                    return c.a;
                }((String, (Object, this)));
            }
        }.b());
    }
    expect_stdout: "PASS"
}

issue_2203_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        a = "PASS";
        console.log({
            a: "FAIL",
            b: function() {
                return function(c) {
                    return c.a;
                }((String, (Object, function() {
                    return this;
                }())));
            }
        }.b());
    }
    expect: {
        a = "PASS";
        console.log({
            a: "FAIL",
            b: function() {
                return function(c) {
                    return (String, (Object, function() {
                        return this;
                    }())).a;
                }();
            }
        }.b());
    }
    expect_stdout: "PASS"
}

issue_2203_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        a = "FAIL";
        console.log({
            a: "PASS",
            b: function() {
                return function(c) {
                    return c.a;
                }((String, (Object, (() => this)())));
            }
        }.b());
    }
    expect: {
        a = "FAIL";
        console.log({
            a: "PASS",
            b: function() {
                return function(c) {
                    return c.a;
                }((String, (Object, (() => this)())));
            }
        }.b());
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_2203_4: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        a = "FAIL";
        console.log({
            a: "PASS",
            b: function() {
                return (c => {
                    return c.a;
                })((String, (Object, (() => this)())));
            }
        }.b());
    }
    expect: {
        a = "FAIL";
        console.log({
            a: "PASS",
            b: function() {
                return (c => {
                    return (String, (Object, (() => this)())).a;
                })();
            }
        }.b());
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

duplicate_argname: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f() { return "PASS"; }
        console.log(function(a, a) {
            f++;
            return a;
        }("FAIL", f()));
    }
    expect: {
        function f() { return "PASS"; }
        console.log(function(a, a) {
            f++;
            return a;
        }("FAIL", f()));
    }
    expect_stdout: "PASS"
}

issue_2250_1: {
    options = {
        collapse_vars: true,
        conditionals: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(x) {
            if (x) {
                const a = foo();
                x(a);
            }
        }
        function g(x) {
            if (x) {
                let a = foo();
                x(a);
            }
        }
        function h(x) {
            if (x) {
                var a = foo();
                x(a);
            }
        }
    }
    expect: {
        function f(x) {
            x && x(foo());
        }
        function g(x) {
            x && x(foo());
        }
        function h(x) {
            x && x(foo());
        }
    }
}

issue_2250_2: {
    options = {
        collapse_vars: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        {
            const foo = function(){};
            foo(bar());
        }
        {
            let foo = function(){};
            foo(bar());
        }
        {
            var foo = function(){};
            foo(bar());
        }
    }
    expect: {
        bar();
        bar();
        bar();
    }
}

issue_2298: {
    options = {
        collapse_vars: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            function f() {
                var a = undefined;
                var undefined = a++;
                try {
                    !function g(b) {
                        b[1] = "foo";
                    }();
                    console.log("FAIL");
                } catch (e) {
                    console.log("PASS");
                }
            }
            f();
        }();
    }
    expect: {
        !function() {
            (function() {
                var a = undefined;
                var undefined = a++;
                try {
                    !function(b) {
                        (void 0)[1] = "foo";
                    }();
                    console.log("FAIL");
                } catch (e) {
                    console.log("PASS");
                }
            })();
        }();
    }
    expect_stdout: "PASS"
}

issue_2313_1: {
    options = {
        collapse_vars: true,
        conditionals: true,
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
                a++;
                return 42;
            },
            set c(c) {
                b++;
            },
            d: function() {
                this.c++;
                this.c && console.log(a, b);
            }
        }
        foo.d();
    }
    expect_stdout: "2 1"
}

issue_2313_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var c = 0;
        !function a() {
            a && c++;
            var a = 0;
            a && c++;
        }();
        console.log(c);
    }
    expect: {
        var c = 0;
        !function a() {
            a && c++;
            var a = 0;
            a && c++;
        }();
        console.log(c);
    }
    expect_stdout: "0"
}

issue_2319_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            return a;
        }(!function() {
            return this;
        }()));
    }
    expect: {
        console.log(function(a) {
            return !function() {
                return this;
            }();
        }());
    }
    expect_stdout: "false"
}

issue_2319_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            "use strict";
            return a;
        }(!function() {
            return this;
        }()));
    }
    expect: {
        console.log(function(a) {
            "use strict";
            return a;
        }(!function() {
            return this;
        }()));
    }
    expect_stdout: "false"
}

issue_2319_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        console.log(function(a) {
            return a;
        }(!function() {
            return this;
        }()));
    }
    expect: {
        "use strict";
        console.log(function(a) {
            return !function() {
                return this;
            }();
        }());
    }
    expect_stdout: "true"
}

issue_2365: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        console.log(function(a) {
            var b = a.f;
            a.f++;
            return b;
        }({ f: 1 }));
        console.log(function() {
            var a = { f: 1 }, b = a.f;
            a.f++;
            return b;
        }());
        console.log({
            f: 1,
            g: function() {
                var b = this.f;
                this.f++;
                return b;
            }
        }.g());
    }
    expect: {
        console.log(function(a) {
            var b = a.f;
            a.f++;
            return b;
        }({ f: 1 }));
        console.log(function() {
            var a = { f: 1 }, b = a.f;
            a.f++;
            return b;
        }());
        console.log({
            f: 1,
            g: function() {
                var b = this.f;
                this.f++;
                return b;
            }
        }.g());
    }
    expect_stdout: [
        "1",
        "1",
        "1",
    ]
}

issue_2364_1: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        function inc(obj) {
            return obj.count++;
        }
        function foo() {
            var first = arguments[0];
            var result = inc(first);
            return foo.amount = first.count, result;
        }
        var data = {
            count: 0,
        };
        var answer = foo(data);
        console.log(foo.amount, answer);
    }
    expect: {
        function inc(obj) {
            return obj.count++;
        }
        function foo() {
            var first = arguments[0];
            var result = inc(first);
            return foo.amount = first.count, result;
        }
        var data = {
            count: 0
        };
        var answer = foo(data);
        console.log(foo.amount, answer);
    }
    expect_stdout: "1 0"
}

issue_2364_2: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        function callValidate() {
            var validate = compilation.validate;
            var result = validate.apply(null, arguments);
            return callValidate.errors = validate.errors, result;
        }
    }
    expect: {
        function callValidate() {
            var validate = compilation.validate;
            var result = validate.apply(null, arguments);
            return callValidate.errors = validate.errors, result;
        }
    }
}

issue_2364_3: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        function inc(obj) {
            return obj.count++;
        }
        function foo(bar) {
            var result = inc(bar);
            return foo.amount = bar.count, result;
        }
        var data = {
            count: 0,
        };
        var answer = foo(data);
        console.log(foo.amount, answer);
    }
    expect: {
        function inc(obj) {
            return obj.count++;
        }
        function foo(bar) {
            var result = inc(bar);
            return foo.amount = bar.count, result;
        }
        var data = {
            count: 0,
        };
        var answer = foo(data);
        console.log(foo.amount, answer);
    }
    expect_stdout: "1 0"
}

issue_2364_4: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        function inc(obj) {
            return obj.count++;
        }
        function foo(bar, baz) {
            var result = inc(bar);
            return foo.amount = baz.count, result;
        }
        var data = {
            count: 0,
        };
        var answer = foo(data, data);
        console.log(foo.amount, answer);
    }
    expect: {
        function inc(obj) {
            return obj.count++;
        }
        function foo(bar, baz) {
            var result = inc(bar);
            return foo.amount = baz.count, result;
        }
        var data = {
            count: 0,
        };
        var answer = foo(data, data);
        console.log(foo.amount, answer);
    }
    expect_stdout: "1 0"
}

issue_2364_5: {
    options = {
        collapse_vars: true,
        evaluate: true,
        pure_getters: true,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f0(o, a, h) {
            var b = 3 - a;
            var obj = o;
            var seven = 7;
            var prop = 'run';
            var t = obj[prop](b)[seven] = h;
            return t;
        }
    }
    expect: {
        function f0(o, a, h) {
            return o.run(3 - a)[7] = h;
        }
    }
}

issue_2364_6: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        function f(a, b) {
            var c = a.p;
            b.p = "FAIL";
            return c;
        }
        var o = {
            p: "PASS"
        }
        console.log(f(o, o));
    }
    expect: {
        function f(a, b) {
            var c = a.p;
            b.p = "FAIL";
            return c;
        }
        var o = {
            p: "PASS"
        }
        console.log(f(o, o));
    }
    expect_stdout: "PASS"
}

issue_2364_7: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        function f(a, b) {
            var c = a.p;
            b.f();
            return c;
        }
        var o = {
            p: "PASS",
            f: function() {
                this.p = "FAIL";
            }
        }
        console.log(f(o, o));
    }
    expect: {
        function f(a, b) {
            var c = a.p;
            b.f();
            return c;
        }
        var o = {
            p: "PASS",
            f: function() {
                this.p = "FAIL";
            }
        }
        console.log(f(o, o));
    }
    expect_stdout: "PASS"
}

issue_2364_8: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        function f(a, b, c) {
            var d = a[b.f = function() {
                return "PASS";
            }];
            return c.f(d);
        }
        var o = {
            f: function() {
                return "FAIL";
            }
        };
        console.log(f({}, o, o));
    }
    expect: {
        function f(a, b, c) {
            var d = a[b.f = function() {
                return "PASS";
            }];
            return c.f(d);
        }
        var o = {
            f: function() {
                return "FAIL";
            }
        };
        console.log(f({}, o, o));
    }
    expect_stdout: "PASS"
}

issue_2364_9: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        function f(a, b) {
            var d = a();
            return b.f(d);
        }
        var o = {
            f: function() {
                return "FAIL";
            }
        };
        console.log(f(function() {
            o.f = function() {
                return "PASS";
            };
        }, o));
    }
    expect: {
        function f(a, b) {
            var d = a();
            return b.f(d);
        }
        var o = {
            f: function() {
                return "FAIL";
            }
        };
        console.log(f(function() {
            o.f = function() {
                return "PASS";
            };
        }, o));
    }
    expect_stdout: "PASS"
}

pure_getters_chain: {
    options = {
        collapse_vars: true,
        pure_getters: true,
        unused: true,
    }
    input: {
        function o(t, r) {
            var a = t[1], s = t[2], o = t[3], i = t[5];
            return a <= 23 && s <= 59 && o <= 59 && (!r || i);
        }
        console.log(o([ , 23, 59, 59, , 42], 1));
    }
    expect: {
        function o(t, r) {
            return t[1] <= 23 && t[2] <= 59 && t[3] <= 59 && (!r || t[5]);
        }
        console.log(o([ , 23, 59, 59, , 42], 1));
    }
    expect_stdout: "42"
}

conditional_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            var c = "";
            var d = b ? ">" : "<";
            if (a) c += "=";
            return c += d;
        }
        console.log(f(0, 0), f(0, 1), f(1, 0), f(1, 1));
    }
    expect: {
        function f(a, b) {
            var c = "";
            if (a) c += "=";
            return c += b ? ">" : "<";
        }
        console.log(f(0, 0), f(0, 1), f(1, 0), f(1, 1));
    }
    expect_stdout: "< > =< =>"
}

conditional_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            var c = a + 1, d = a + 2;
            return b ? c : d;
        }
        console.log(f(3, 0), f(4, 1));
    }
    expect: {
        function f(a, b) {
            return b ? a + 1 : a + 2;
        }
        console.log(f(3, 0), f(4, 1));
    }
    expect_stdout: "5 5"
}

issue_2425_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = 8;
        (function(b) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect: {
        var a = 8;
        (function(b) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect_stdout: "15"
}

issue_2425_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = 8;
        (function(b, c) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect: {
        var a = 8;
        (function(b, c) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect_stdout: "15"
}

issue_2425_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = 8;
        (function(b, b) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect: {
        var a = 8;
        (function(b, b) {
            (a |= 10).toString();
        })(--a);
        console.log(a);
    }
    expect_stdout: "15"
}

issue_2437: {
    options = {
        collapse_vars: true,
        conditionals: true,
        inline: true,
        join_vars: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        sequences: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function foo() {
            bar();
        }
        function bar() {
            if (xhrDesc) {
                var req = new XMLHttpRequest();
                var result = !!req.onreadystatechange;
                Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', xhrDesc || {});
                return result;
            } else {
                var req = new XMLHttpRequest();
                var detectFunc = function () {};
                req.onreadystatechange = detectFunc;
                var result = req[SYMBOL_FAKE_ONREADYSTATECHANGE_1] === detectFunc;
                req.onreadystatechange = null;
                return result;
            }
        }
        foo();
    }
    expect: {
        !function() {
            if (xhrDesc) {
                var result = !!(req = new XMLHttpRequest()).onreadystatechange;
                return Object.defineProperty(XMLHttpRequest.prototype, "onreadystatechange", xhrDesc || {}),
                    result;
            }
            var req, detectFunc = function() {};
            (req = new XMLHttpRequest()).onreadystatechange = detectFunc;
            result = req[SYMBOL_FAKE_ONREADYSTATECHANGE_1] === detectFunc;
            req.onreadystatechange = null;
        }();
    }
}

issue_2453: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        function log(n) {
            console.log(n);
        }
        const a = 42;
        log(a);
    }
    expect: {
        function log(n) {
            console.log(n);
        }
        const a = 42;
        log(a);
    }
    expect_stdout: "42"
}

issue_2436_1: {
    options = {
        collapse_vars: true,
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(function(c) {
            return {
                x: c.a,
                y: c.b,
            };
        }(o));
    }
    expect: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log({
            x: o.a,
            y: o.b,
        });
    }
    expect_stdout: true
}

issue_2436_2: {
    options = {
        collapse_vars: true,
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(function(c) {
            o.a = 3;
            return {
                x: c.a,
                y: c.b,
            };
        }(o));
    }
    expect: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(function(c) {
            o.a = 3;
            return {
                x: c.a,
                y: c.b,
            };
        }(o));
    }
    expect_stdout: true
}

issue_2436_3: {
    options = {
        collapse_vars: true,
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(function(c) {
            o = {
                a: 3,
                b: 4,
            };
            return {
                x: c.a,
                y: c.b,
            };
        }(o));
    }
    expect: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(function(c) {
            o = {
                a: 3,
                b: 4,
            };
            return {
                x: c.a,
                y: c.b,
            };
        }(o));
    }
    expect_stdout: true
}

issue_2436_4: {
    options = {
        collapse_vars: true,
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(function(c) {
            return {
                x: c.a,
                y: c.b,
            };
            var o;
        }(o));
    }
    expect: {
        console.log({
            x: (c = {
            a: 1,
            b: 2,
        }).a,
            y: c.b,
        });
        var c;
    }
    expect_stdout: true
}

issue_2436_5: {
    options = {
        collapse_vars: true,
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(function(o) {
            return {
                x: o.a,
                y: o.b,
            };
        }(o));
    }
    expect: {
        console.log(function(o) {
            return {
                x: o.a,
                y: o.b,
            };
        }({
            a: 1,
            b: 2,
        }));
    }
    expect_stdout: true
}

issue_2436_6: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
        unsafe: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(function(c) {
            return {
                x: c.a,
                y: c.b,
            };
        }(o));
    }
    expect: {
        console.log({
            x: 1,
            y: 2,
        });
    }
    expect_stdout: true
}

issue_2436_7: {
    options = {
        collapse_vars: true,
        hoist_props: true,
        inline: true,
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(function(c) {
            return {
                x: c.a,
                y: c.b,
            };
        }(o));
    }
    expect: {
        console.log({
            x: 1,
            y: 2,
        });
    }
    expect_stdout: true
}

issue_2436_8: {
    options = {
        collapse_vars: true,
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        console.log(function(c) {
            return {
                x: c.a,
                y: c.b,
            };
        }(o));
    }
    expect: {
        console.log({
            x: (c = o).a,
            y: c.b,
        });
        var c;
    }
    expect_stdout: true
}

issue_2436_9: {
    options = {
        collapse_vars: true,
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = console;
        console.log(function(c) {
            return {
                x: c.a,
                y: c.b,
            };
        }(o));
    }
    expect: {
        var o = console;
        console.log({
            x: (c = o).a,
            y: c.b,
        });
        var c;
    }
    expect_stdout: true
}

issue_2436_10: {
    options = {
        collapse_vars: true,
        inline: true,
        pure_getters: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
        };
        function f(n) {
            o = { b: 3 };
            return n;
        }
        console.log(function(c) {
            return [
                c.a,
                f(c.b),
                c.b,
            ];
        }(o).join(" "));
    }
    expect: {
        var o = {
            a: 1,
            b: 2,
        };
        function f(n) {
            o = { b: 3 };
            return n;
        }
        console.log((c = o, [
            c.a,
            f(c.b),
            c.b,
        ]).join(" "));
        var c;
    }
    expect_stdout: "1 2 2"
}

issue_2436_11: {
    options = {
        collapse_vars: true,
        join_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function matrix() {}
        function isCollection() {}
        function _randomDataForMatrix() {}
        function _randomInt() {}
        function f(arg1, arg2) {
            if (isCollection(arg1)) {
                var size = arg1;
                var max = arg2;
                var min = 0;
                var res = _randomDataForMatrix(size.valueOf(), min, max, _randomInt);
                return size && true === size.isMatrix ? matrix(res) : res;
            } else {
                var min = arg1;
                var max = arg2;
                return _randomInt(min, max);
            }
        }
    }
    expect: {
        function matrix() {}
        function isCollection() {}
        function _randomDataForMatrix() {}
        function _randomInt() {}
        function f(arg1, arg2) {
            if (isCollection(arg1)) {
                var size = arg1, max = arg2, min = 0, res = _randomDataForMatrix(size.valueOf(), min, max, _randomInt);
                return size && true === size.isMatrix ? matrix(res) : res;
            } else {
                return _randomInt(min = arg1, max = arg2);
            }
        }
    }
}

issue_2436_12: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function isUndefined() {}
        function f() {
            var viewValue = this.$$lastCommittedViewValue;
            var modelValue = viewValue;
            return isUndefined(modelValue) ? modelValue : null;
        }
    }
    expect: {
        function isUndefined() {}
        function f() {
            var modelValue = this.$$lastCommittedViewValue;
            return isUndefined(modelValue) ? modelValue : null;
        }
    }
}

issue_2436_13: {
    options = {
        collapse_vars: true,
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function() {
            function f(b) {
                (function g(b) {
                    var b = b && (b.null = "FAIL");
                })(a);
            }
            f();
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function() {
            (function(b) {
                (function(b) {
                    a && (a.null = "FAIL");
                })();
            })();
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2436_14: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        var b = {};
        (function() {
            var c = a;
            c && function(c, d) {
                console.log(c, d);
            }(b, c);
        })();
    }
    expect: {
        var a = "PASS";
        var b = {};
        (function() {
            a && function(c, d) {
                console.log(c, d);
            }(b, a);
        })();
    }
    expect_stdout: true
}

issue_2497: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function sample() {
            if (true) {
                for (var i = 0; i < 1; ++i) {
                    for (var k = 0; k < 1; ++k) {
                        var value = 1;
                        var x = value;
                        value = x ? x + 1 : 0;
                    }
                }
            } else {
                for (var i = 0; i < 1; ++i) {
                    for (var k = 0; k < 1; ++k) {
                        var value = 1;
                    }
                }
            }
        }
    }
    expect: {
        function sample() {
            if (true)
                for (var i = 0; i < 1; ++i)
                    for (var k = 0; k < 1; ++k) {
                        value = 1;
                        value = value ? value + 1 : 0;
                    }
            else
                for (i = 0; i < 1; ++i)
                    for (k = 0; k < 1; ++k)
                        var value = 1;
        }
    }
}

issue_2506: {
    options = {
        collapse_vars: true,
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var c = 0;
        function f0(bar) {
            function f1(Infinity_2) {
                function f13(NaN) {
                    if (false <= NaN & this >> 1 >= 0) {
                        c++;
                    }
                }
                var b_2 = f13(NaN, c++);
            }
            var bar = f1(-3, -1);
        }
        f0(false);
        console.log(c);
    }
    expect: {
        var c = 0;
        function f0(bar) {
            (function(Infinity_2) {
                (function(NaN) {
                    if (false <= 0/0 & this >> 1 >= 0)
                        c++;
                })(0, c++);
            })();
        }
        f0(false);
        console.log(c);
    }
    expect_stdout: "1"
}

issue_2571_1: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var b = 1;
        try {
            var a = function f0(c) {
                throw c;
            }(2);
            var d = --b + a;
        } catch (e) {
        }
        console.log(b);
    }
    expect: {
        var b = 1;
        try {
            var a = function f0(c) {
                throw c;
            }(2);
            var d = --b + a;
        } catch (e) {
        }
        console.log(b);
    }
    expect_stdout: "1"
}

issue_2571_2: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        try {
            var a = A, b = 1;
            throw a;
        } catch (e) {
            console.log(b);
        }
    }
    expect: {
        try {
            var a = A, b = 1;
            throw a;
        } catch (e) {
            console.log(b);
        }
    }
    expect_stdout: "undefined"
}

may_throw_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f() {
            var a_2 = function() {
                var a;
            }();
        }
    }
    expect: {
        function f() {
            var a_2 = function() {
                var a;
            }();
        }
    }
}

may_throw_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(b) {
            try {
                var a = x();
                ++b;
                return b(a);
            } catch(e) {}
            console.log(b);
        }
        f(0);
    }
    expect: {
        function f(b) {
            try {
                var a = x();
                return (++b)(a);
            } catch(e) {}
            console.log(b);
        }
        f(0);
    }
    expect_stdout: "0"
}

side_effect_free_replacement: {
    options = {
        collapse_vars: true,
        inline: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var b;
        (function(a) {
            x(a);
        })(b);
    }
    expect: {
        var b;
        x(b);
    }
}

recursive_function_replacement: {
    rename = true
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    mangle = {}
    input: {
        function f(a) {
            return x(g(a));
        }
        function g(a) {
            return y(f(a));
        }
        console.log(f(c));
    }
    expect: {
        console.log(function n(o) {
            return x(y(n(o)));
        }(c));
    }
}

cascade_conditional: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f(a, b) {
            (a = x(), a) ? a++ : (b = y(a), b(a));
        }
    }
    expect: {
        function f(a, b) {
            (a = x()) ? a++ : (b = y(a))(a);
        }
    }
}

cascade_if_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        if (a = x(), a)
            if (a == y()) z();
    }
    expect: {
        var a;
        if (a = x())
            if (a == y()) z();
    }
}

cascade_if_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f(a, b) {
            if (a(), b = x()) return b;
        }
    }
    expect: {
        function f(a, b) {
            if (a(), b = x()) return b;
        }
    }
}

cascade_return: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f(a) {
            return a = x();
            return a;
        }
    }
    expect: {
        function f(a) {
            return a = x();
            return a;
        }
    }
}

cascade_switch: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f(a, b) {
            switch(a = x(), a) {
              case a = x(), b(a):
                break;
            }
        }
    }
    expect: {
        function f(a, b) {
            switch(a = x()) {
              case b(a = x()):
                break;
            }
        }
    }
}

cascade_call: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            return x((b = a, y(b)));
        }
    }
    expect: {
        function f(a) {
            return x(y(a));
        }
    }
}

replace_all_var: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function() {
            var b = b || c && c[a = "FAIL"], c = a;
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function() {
            var b = b || c && c[a = "FAIL"], c = a;
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

cascade_statement: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f1(a, b) {
            var c;
            if (a)
                return c = b, c || a;
            else
                c = a, c(b);
        }
        function f2(a, b) {
            var c;
            while (a)
                c = b, a = c + b;
            do
                throw c = a + b, c;
            while (c);
        }
        function f3(a, b) {
            for (; a < b; a++)
                if (c = a, c && b)
                    var c = (c = b(a), c);
        }
    }
    expect: {
        function f1(a, b) {
            var c;
            if (a)
                return (c = b) || a;
            else
                (c = a)(b);
        }
        function f2(a, b) {
            var c;
            while (a)
                a = (c = b) + b;
            do
                throw c = a + b;
            while (c);
        }
        function f3(a, b) {
            for (; a < b; a++)
                if ((c = a) && b)
                    var c = c = b(a);
        }
    }
}

cascade_forin: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        function f(b) {
            return [ b, b, b ];
        }
        for (var c in a = console, f(a))
            console.log(c);
    }
    expect: {
        var a;
        function f(b) {
            return [ b, b, b ];
        }
        for (var c in f(a = console))
            console.log(c);
    }
    expect_stdout: [
        "0",
        "1",
        "2",
    ]
}

unsafe_builtin: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        unsafe: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b = Math.abs(a);
            return Math.pow(b, 2);
        }
        console.log(f(-1), f(2));
    }
    expect: {
        function f(a) {
            return Math.pow(Math.abs(a), 2);
        }
        console.log(f(-1), f(2));
    }
    expect_stdout: "1 4"
}

return_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var log = console.log;
        function f(b, c) {
            var a = c;
            if (b) return b;
            log(a);
        }
        f(false, 1);
        f(true, 2);
    }
    expect: {
        var log = console.log;
        function f(b, c) {
            if (b) return b;
            log(c);
        }
        f(false, 1);
        f(true, 2);
    }
    expect_stdout: "1"
}

return_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var log = console.log;
        function f(b, c) {
            var a = c();
            if (b) return b;
            log(a);
        }
        f(false, function() { return 1 });
        f(true, function() { return 2 });
    }
    expect: {
        var log = console.log;
        function f(b, c) {
            var a = c();
            if (b) return b;
            log(a);
        }
        f(false, function() { return 1 });
        f(true, function() { return 2 });
    }
    expect_stdout: "1"
}

return_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var log = console.log;
        function f(b, c) {
            var a = b <<= c;
            if (b) return b;
            log(a);
        }
        f(false, 1);
        f(true, 2);
    }
    expect: {
        var log = console.log;
        function f(b, c) {
            var a = b <<= c;
            if (b) return b;
            log(a);
        }
        f(false, 1);
        f(true, 2);
    }
    expect_stdout: "0"
}

return_4: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (function(b) {
            a = "PASS";
            return;
            b(a);
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function(b) {
            a = "PASS";
            return;
            b(a);
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2858: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var b;
        (function() {
            function f() {
                a++;
            }
            f();
            var c = f();
            var a = void 0;
            c || (b = a);
        })();
        console.log(b);
    }
    expect: {
        var b;
        (function() {
            function f() {
                a++;
            }
            f();
            var c = f();
            var a = void 0;
            c || (b = a);
        })();
        console.log(b);
    }
    expect_stdout: "undefined"
}

cond_branch_1: {
    options = {
        collapse_vars: true,
        sequences: true,
        unused: true,
    }
    input: {
        function f1(b, c) {
            var log = console.log;
            var a = ++c;
            if (b) b++;
            log(a, b);
        }
        function f2(b, c) {
            var log = console.log;
            var a = ++c;
            b && b++;
            log(a, b);
        }
        function f3(b, c) {
            var log = console.log;
            var a = ++c;
            b ? b++ : b--;
            log(a, b);
        }
        f1(1, 2);
        f2(3, 4);
        f3(5, 6);
    }
    expect: {
        function f1(b, c) {
            if (b) b++;
            (0, console.log)(++c, b);
        }
        function f2(b, c) {
            b && b++,
            (0, console.log)(++c, b);
        }
        function f3(b, c) {
            b ? b++ : b--,
            (0, console.log)(++c, b);
        }
        f1(1, 2),
        f2(3, 4),
        f3(5, 6);
    }
    expect_stdout: [
        "3 2",
        "5 4",
        "7 6",
    ]
}

cond_branch_2: {
    options = {
        collapse_vars: true,
        sequences: true,
        unused: true,
    }
    input: {
        function f1(b, c) {
            var log = console.log;
            var a = ++c;
            if (b) b += a;
            log(a, b);
        }
        function f2(b, c) {
            var log = console.log;
            var a = ++c;
            b && (b += a);
            log(a, b);
        }
        function f3(b, c) {
            var log = console.log;
            var a = ++c;
            b ? b += a : b--;
            log(a, b);
        }
        f1(1, 2);
        f2(3, 4);
        f3(5, 6);
    }
    expect: {
        function f1(b, c) {
            var a = ++c;
            if (b) b += a;
            (0, console.log)(a, b);
        }
        function f2(b, c) {
            var a = ++c;
            b && (b += a),
            (0, console.log)(a, b);
        }
        function f3(b, c) {
            var a = ++c;
            b ? b += a : b--,
            (0, console.log)(a, b);
        }
        f1(1, 2),
        f2(3, 4),
        f3(5, 6);
    }
    expect_stdout: [
        "3 4",
        "5 8",
        "7 12",
    ]
}

cond_branch_switch: {
    options = {
        collapse_vars: true,
    }
    input: {
        var c = 0;
        if (c = 1 + c, 0) switch (c = 1 + c) {
        }
        console.log(c);
    }
    expect: {
        var c = 0;
        if (c = 1 + c, 0) switch (c = 1 + c) {
        }
        console.log(c);
    }
    expect_stdout: "1"
}

issue_2873_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var b = 1, c = 0;
        do {
            c++;
            if (!--b) break;
            c = 1 + c;
        } while (0);
        console.log(b, c);
    }
    expect: {
        var b = 1, c = 0;
        do {
            c++;
            if (!--b) break;
            c = 1 + c;
        } while (0);
        console.log(b, c);
    }
    expect_stdout: "0 1"
}

issue_2873_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var b = 1, c = 0;
        do {
            c++;
            if (!--b) continue;
            c = 1 + c;
        } while (0);
        console.log(b, c);
    }
    expect: {
        var b = 1, c = 0;
        do {
            c++;
            if (!--b) continue;
            c = 1 + c;
        } while (0);
        console.log(b, c);
    }
    expect_stdout: "0 1"
}

issue_2878: {
    options = {
        collapse_vars: true,
        sequences: true,
    }
    input: {
        var c = 0;
        (function (a, b) {
            function f2() {
                if (a) c++;
            }
            b = f2();
            a = 1;
            b && b.b;
            f2();
        })();
        console.log(c);
    }
    expect: {
        var c = 0;
        (function (a, b) {
            function f2() {
                if (a) c++;
            }
            b = f2(),
            a = 1,
            b && b.b,
            f2();
        })(),
        console.log(c);
    }
    expect_stdout: "1"
}

issue_2891_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "PASS", b;
        try {
            b = c.p = 0;
            a = "FAIL";
            b();
        } catch (e) {
        }
        console.log(a);
    }
    expect: {
        var a = "PASS", b;
        try {
            b = c.p = 0;
            a = "FAIL";
            b();
        } catch (e) {
        }
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2891_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        var a = "PASS", b;
        try {
            b = c = 0;
            a = "FAIL";
            b();
        } catch (e) {
        }
        console.log(a);
    }
    expect: {
        "use strict";
        var a = "PASS", b;
        try {
            b = c = 0;
            a = "FAIL";
            b();
        } catch (e) {
        }
        console.log(a);
    }
    expect_stdout: true
}
