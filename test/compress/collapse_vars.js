collapse_vars_side_effects_1: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
            var log = console.log.bind(console),
                s = "abcdef",
                i = 2,
                x = s.charAt(i++),
                y = s.charAt(i++),
                z = s.charAt(i++);
            log(x, i, y, z, 7);
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
            console.log.bind(console)(x, i += 4, y, i);
        }
        f1(), f2(), f3(), f4();
    }
    expect_stdout: true
}

collapse_vars_side_effects_2: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
        hoist_funs:true, keep_fargs:true, if_return:true, join_vars:true, cascade:true,
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
    }
    input: {
        var f1 = function(x, y) {
            var a, b, r = x + y, q = r * r, z = q - r;
            a = z, b = 7;
            return a + b;
        };
    }
    expect: {
        var f1 = function(x, y) {
            var a, b, r = x + y;
            return a = r * r - r, b = 7, a + b
        };
    }
}

collapse_vars_throw: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
    }
    input: {
        var f1 = function(x, y) {
            var a, b, r = x + y, q = r * r, z = q - r;
            a = z, b = 7;
            throw a + b;
        };
    }
    expect: {
        var f1 = function(x, y) {
            var a, b, r = x + y;
            throw a = r * r - r, b = 7, a + b
        };
    }
}

collapse_vars_switch: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
    }
    input: {
        function log(x) { return console.log(x), x; }
        function f0(c) {
            var a = 3 / c;
            return a = a;
        }
        function f1(c) {
            var a = 3 / c;
            var b = 1 - a;
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
            return 1 - 3 / c
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
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:"keep_assign",
        hoist_funs:true, keep_fargs:true, if_return:true, join_vars:true, cascade:true,
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
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        function f5(x) { e1(); var v = e2(), c = v = --x; return x - c; }
        function f6(x) { e1(), e2(); return --x - x; }
        function f7(x) { e1(); return x - (e2() - x); }
        function f8(x) { e1(); return x - (e2() - x); }
        function f9(x) { e1(); return e2() - x - x; }
    }
}

collapse_vars_misc1: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
        function f2(x) { var z = foo(), y = z / (5 - x); return y; }
        function f3(x) { var z = foo(), y = (5 - x) / z; return y; }
        function f4(x) { var z = foo(), y = (5 - u) / z; return y; }
        function f5(x) { var z = foo(), y = (5 - window.x) / z; return y; }
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
        function f5(x) { var z = foo(); return (5 - window.x) / z }
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
    }
    input: {
        function f0(o, p) {
            var x = o[p];
            delete x;
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
            delete x;
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true, reduce_vars:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true,
        toplevel:true, reduce_vars:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        cascade:       true,
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
        collapse_vars: true,
        loops:         false,
        sequences:     true,
        dead_code:     true,
        conditionals:  true,
        comparisons:   true,
        evaluate:      true,
        booleans:      true,
        unused:        true,
        hoist_funs:    true,
        keep_fargs:    true,
        if_return:     true,
        join_vars:     true,
        cascade:       true,
        side_effects:  true,
        reduce_vars:   true,
    }
    input: {
        function f1() {
            var k = 9;
            var rx = /[A-Z]+/;
            return [rx, k];
        }
        function f2() {
            var rx = /[abc123]+/;
            return function(s) {
                return rx.exec(s);
            };
        }
        (function(){
            var result;
            var s = 'acdabcdeabbb';
            var rx = /ab*/g;
            while (result = rx.exec(s)) {
                console.log(result[0]);
            }
        })();
    }
    expect: {
        function f1() {
            return [/[A-Z]+/, 9];
        }
        function f2() {
            var rx = /[abc123]+/;
            return function(s) {
                return rx.exec(s);
            };
        }
        (function(){
            var result, rx = /ab*/g;
            while (result = rx.exec("acdabcdeabbb"))
                console.log(result[0]);
        })();
    }
    expect_stdout: true
}

issue_1537: {
    options = {
        collapse_vars: true,
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

issue_1562: {
    options = {
        collapse_vars: true,
        evaluate: true,
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
        cascade: true,
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
        cascade: true,
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
        cascade: true,
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
        !function(x) {
            console.log(x);
        }(bar());
    }
}

var_defs: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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

switch_case: {
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
            var c = z;
            switch (x()) {
              default: d();
              case y(): e();
              case c: f();
            }
        }
    }
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
            var a = {}, b = a.b = x;
            return a.b + b;
        }(1));
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
            var a;
            a = x;
            b = y;
            return b + a;
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
            var c = a, c = b;
            b++;
            return c;
        }(1, 2));
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
        var a, b = 10;
        var a = (--b || a || 3).toString(), c = --b + -a;
        console.log(null, a, b);
    }
    expect_stdout: true
}

double_def: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = x, a = a && y;
        a();
    }
    expect: {
        var a = x;
        (a = a && y)();
    }
}

toplevel_single_reference: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        for (var b in x) {
            var a = b;
            b(a);
        }
    }
    expect: {
        var a;
        for (var b in x)
            b(a = b);
    }
}

unused_orig: {
    options = {
        collapse_vars: true,
        passes: 2,
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
                var a = c[0];
                return --b + a;
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
        var a = b++, b = +void 0;
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
