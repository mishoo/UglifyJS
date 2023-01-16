collapse_vars_side_effects_1: {
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
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
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
            console.log.bind(console)(s.charAt(i++), s.charAt(+i), s.charAt(4), 7);
        }
        function f2() {
            var s = "abcdef", i = 2;
            console.log.bind(console)(s.charAt(i++), 5, s.charAt(i++), s.charAt(+i), 7);
        }
        function f3() {
            var s = "abcdef",
                i = 2,
                log = console.log.bind(console),
                x = s.charAt(i++),
                y = s.charAt(+i);
            log(x, s.charAt(4), y, 7);
        }
        function f4() {
            var i = 10;
            i += 2,
            i += 3,
            i += 4;
            console.log.bind(console)(12, 19, 15, 19);
        }
        f1(), f2(), f3(), f4();
    }
    expect_stdout: true
}

collapse_vars_side_effects_2: {
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
        passes: 2,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        define(["require", "exports", 'handlebars'], function(require, exports, hb) {
            var win = window;
            var _hb = win.Handlebars = hb;
            return _hb;
        });
        def(function(hb) {
            var win = window;
            var prop = 'Handlebars';
            var _hb = win[prop] = hb;
            return _hb;
        });
        def(function(hb) {
            var prop = 'Handlebars';
            var win = window;
            var _hb = win[prop] = hb;
            return _hb;
        });
        def(function(hb) {
            var prop = 'Handlebars';
            var win = g();
            var _hb = win[prop] = hb;
            return _hb;
        });
        def(function(hb) {
            var prop = g1();
            var win = g2();
            var _hb = win[prop] = hb;
            return _hb;
        });
        def(function(hb) {
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
        def(function(hb) {
            return g().Handlebars = hb;
        }),
        def(function(hb) {
            var prop = g1();
            return g2()[prop] = hb;
        }),
        def(function(hb) {
            return g2()[g1()] = hb;
        });
    }
}

collapse_vars_properties: {
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
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
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
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
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
            return x ? 1 : 2;
        }
    }
}

collapse_vars_while: {
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
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
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
        booleans: false,
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
        properties: true,
        sequences: true,
        side_effects: true,
        unused: "keep_assign",
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
        booleans: false,
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
        properties: true,
        sequences: true,
        side_effects: true,
        unused: true,
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

collapse_vars_switch_1: {
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

collapse_vars_switch_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var c = 0;
        (function(b) {
            switch (b && [ b = 0, (c++, 0) ]) {
              case c = 1 + c:
            }
        })();
        console.log(c);
    }
    expect: {
        var c = 0;
        (function(b) {
            switch (b && [ b = 0, (c++, 0) ]) {
              case c = 1 + c:
            }
        })();
        console.log(c);
    }
    expect_stdout: "1"
}

collapse_vars_assignment: {
    options = {
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
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
            return 3 / c;
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
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        properties: true,
        sequences: true,
        side_effects: true,
        unused: "keep_assign",
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
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        passes: 3,
        properties: true,
        sequences: true,
        side_effects: true,
        unused: true,
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

collapse_vars_misc: {
    options = {
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
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
            return o.run(3 - a)[7] = h;
        }
        function f1(x) { return 5 - x }
        function f2(x) { return foo() / (5 - x) }
        function f3(x) { return (5 - x) / foo() }
        function f4(x) { var z = foo(); return (5 - u) / z }
        function f5(x) { var z = foo(); return (5 - window.x) / z }
        function f6() { return window.a * window.z && zap() }
        function f7() { var b = window.a * window.z; return b + b }
        function f8() { var b = window.a * window.z; return b + (5 + b) }
        function f9() { var b = window.a * window.z; return bar() || b }
        function f10(x) { return 8; }
        function f11(x) { return 7; }
    }
}

collapse_vars_self_reference: {
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
        unused: false,
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
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
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
        (function(x) {
             var a = "GOOD" + x, e = "BAD", k = "!", e = a;
             console.log(e + k);
        })("!"),
        (function(x) {
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
        (function(x) {
             console.log("GOOD!!");
        })(),
        (function(x) {
             console.log("GOOD!!");
        })();
    }
    expect_stdout: true
}

collapse_vars_closures: {
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
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
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
            return +!!n < n;
        }
        function f2(n) {
            var k = 7;
            return k--;
        }
        function f3(n) {
            var k = 7;
            return ++k;
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
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
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

collapse_vars_array_1: {
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

collapse_vars_array_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            return [ (b = a, b.g()) ];
        }
        console.log(f({
            g: function() {
                return "PASS";
            }
        })[0]);
    }
    expect: {
        function f(a) {
            return [ a.g() ];
        }
        console.log(f({
            g: function() {
                return "PASS";
            }
        })[0]);
    }
    expect_stdout: "PASS"
}

collapse_vars_array_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            return [ b = a, b, b ];
        }
        console.log(f().length);
    }
    expect: {
        function f(a) {
            return [ a, a, a ];
        }
        console.log(f().length);
    }
    expect_stdout: "3"
}

collapse_vars_object_1: {
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

collapse_vars_object_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            return {
                p: (b = a, b.g())
            };
        }
        console.log(f({
            g: function() {
                return "PASS";
            }
        }).p);
    }
    expect: {
        function f(a) {
            return {
                p: a.g()
            };
        }
        console.log(f({
            g: function() {
                return "PASS";
            }
        }).p);
    }
    expect_stdout: "PASS"
}

collapse_vars_object_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            return {
                p: b = a,
                q: b,
                r: b,
            };
        }
        console.log(f("PASS").r);
    }
    expect: {
        function f(a) {
            return {
                p: a,
                q: a,
                r: a,
            };
        }
        console.log(f("PASS").r);
    }
    expect_stdout: "PASS"
}

collapse_vars_eval_and_with: {
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
        sequences: false,
        side_effects: true,
        unused: true,
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
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
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
            return b + -9;
        }
    }
}

collapse_vars_arguments_1: {
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
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
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

collapse_vars_arguments_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        function log(a, b) {
            console.log(b);
        }
        function f(c) {
            var d = arguments[0];
            c = "FAIL";
            log(c, d);
        }
        f();
        f("PASS");
    }
    expect: {
        function log(a, b) {
            console.log(b);
        }
        function f(c) {
            var d = arguments[0];
            log(c = "FAIL", d);
        }
        f();
        f("PASS");
    }
    expect_stdout: [
        "undefined",
        "PASS",
    ]
}

collapse_vars_arguments_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        function log(a, b) {
            console.log(b);
        }
        function f(c) {
            var args = arguments;
            console.log(c);
            var d = args[0];
            c = "FAIL";
            log(c, d);
        }
        f();
        f("PASS");
    }
    expect: {
        function log(a, b) {
            console.log(b);
        }
        function f(c) {
            var args = arguments;
            console.log(c);
            var d = args[0];
            log(c = "FAIL", d);
        }
        f();
        f("PASS");
    }
    expect_stdout: [
        "undefined",
        "undefined",
        "PASS",
        "PASS",
    ]
}

collapse_vars_short_circuit: {
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
        booleans: true,
        collapse_vars: true,
        comparisons: false,
        conditionals: false,
        dead_code: true,
        evaluate: true,
        hoist_funs: true,
        if_return: false,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        sequences: false,
        side_effects: true,
        unused: true,
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

collapse_arg_sequence: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            a("foo");
        })((console.log("bar"), console.log));
    }
    expect: {
        (function(a) {
            (0, console.log)("foo");
        })(console.log("bar"));
    }
    expect_stdout: [
        "bar",
        "foo",
    ]
}

collapse_for_init: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        for (var a = (Math, console), b = a.log("PASS"); b;);
    }
    expect: {
        Math;
        for (var a, b = console.log("PASS"); b;);
    }
    expect_stdout: "PASS"
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
        unused: true,
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
            var a = 0, t = f();
            return a + t;
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
        unsafe: true,
        unused: true,
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
            var r = x + y;
            console.log(r * r - r + 7);
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
        reduce_vars: true,
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

undeclared_1: {
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
            return (b = y) + x;
        }
    }
}

undeclared_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(x, y) {
            var a;
            a = x;
            b = y;
            return a + b;
        }
    }
    expect: {
        function f(x, y) {
            return x + (b = y);
        }
    }
}

undeclared_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(x, y) {
            var a;
            a = x;
            b = y;
            return b + a();
        }
    }
    expect: {
        function f(x, y) {
            return (b = y) + x();
        }
    }
}

undeclared_4: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(x, y) {
            var a;
            a = x;
            b = y;
            return a() + b;
        }
    }
    expect: {
        function f(x, y) {
            b = y;
            return x() + b;
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
            var c = 1, c = b;
            b++;
            return c;
        }(0, 2));
    }
    expect_stdout: "2"
}

chained_4: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "foo", b = 42;
        var b = void (b = a);
        console.log(a, b);
    }
    expect: {
        var a = "foo", b = 42;
        var b = void (b = a);
        console.log(a, b);
    }
    expect_stdout: "foo undefined"
}

chained_5: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "PASS";
        var a = (console, console.log(a));
        a && ++a;
    }
    expect: {
        var a = "PASS";
        console;
        var a;
        (a = console.log(a)) && ++a;
    }
    expect_stdout: "PASS"
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
        var a = x;
        (a = a && y)();
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
            var a = b;
            b(b);
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

compound_assignment_1: {
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

compound_assignment_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        a = 1;
        for (a += a + 2; console.log(a););
    }
    expect: {
        var a;
        a = 1;
        for (a += a + 2; console.log(a););
    }
    expect_stdout: "4"
}

compound_assignment_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 1;
        a += (console.log("PASS"), 2);
        a.p;
    }
    expect: {
        var a = 1;
        (a += (console.log("PASS"), 2)).p;
    }
    expect_stdout: "PASS"
}

compound_assignment_4: {
    options = {
        collapse_vars: true,
        evaluate: true,
    }
    input: {
        A = "PASS";
        var a = "";
        a += (a = "FAIL", A);
        a.p;
        console.log(a);
    }
    expect: {
        var a = "";
        (a += (a = "FAIL", A = "PASS")).p;
        console.log(a);
    }
    expect_stdout: "PASS"
}

compound_assignment_5: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0, b;
        a += 42;
        b && (a *= null);
        console.log(a);
    }
    expect: {
        var a = 0, b;
        a += 42;
        b && (a *= null);
        console.log(a);
    }
    expect_stdout: "42"
}

compound_assignment_6: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        a ^= 6;
        a *= a + 1;
        console.log(a);
    }
    expect: {
        var a;
        a = (a ^= 6) * (a + 1);
        console.log(a);
    }
    expect_stdout: "42"
}

compound_assignment_7: {
    options = {
        assignments: true,
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = "FA";
        a = a + "I";
        a = a + "L";
        if (console)
            a = "PASS";
        console.log(a);
    }
    expect: {
        var a = "FA";
        a = a + "I" + "L";
        if (console)
            a = "PASS";
        console.log(a);
    }
    expect_stdout: "PASS"
}

compound_assignment_8: {
    options = {
        assignments: true,
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 2;
        a = 3 * a;
        a = 7 * a;
        console || (a = "FAIL");
        console.log(a);
    }
    expect: {
        var a = 2;
        a = a * 3 * 7;
        console || (a = "FAIL");
        console.log(a);
    }
    expect_stdout: "42"
}

issue_2187_1: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
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
            console.log(2);
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
                    return (Object, function() {
                        return this;
                    }()).a;
                }(String);
            }
        }.b());
    }
    expect_stdout: "PASS"
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
            var a;
            (a = 0) && c++;
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
        properties: true,
        pure_getters: true,
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

issue_2437_1: {
    options = {
        collapse_vars: true,
        conditionals: true,
        if_return: true,
        inline: true,
        join_vars: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function foo() {
            return bar();
        }
        function bar() {
            if (xhrDesc) {
                var req = new XMLHttpRequest();
                var result = !!req.onreadystatechange;
                Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', xhrDesc || {});
                return result;
            } else {
                var req = new XMLHttpRequest();
                var detectFunc = function(){};
                req.onreadystatechange = detectFunc;
                var result = req[SYMBOL_FAKE_ONREADYSTATECHANGE_1] === detectFunc;
                req.onreadystatechange = null;
                return result;
            }
        }
        console.log(foo());
    }
    expect: {
        var req, detectFunc, result;
        console.log((
            xhrDesc ? (result = !!(req = new XMLHttpRequest).onreadystatechange,
                Object.defineProperty(XMLHttpRequest.prototype, "onreadystatechange", xhrDesc||{})
            ) : (
                (req = new XMLHttpRequest).onreadystatechange = detectFunc = function(){},
                result = req[SYMBOL_FAKE_ONREADYSTATECHANGE_1] === detectFunc,
                req.onreadystatechange = null
            ),
            result
        ));
    }
}

issue_2437_2: {
    options = {
        collapse_vars: true,
        conditionals: true,
        inline: true,
        join_vars: true,
        negate_iife: true,
        passes: 3,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
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
                var detectFunc = function(){};
                req.onreadystatechange = detectFunc;
                var result = req[SYMBOL_FAKE_ONREADYSTATECHANGE_1] === detectFunc;
                req.onreadystatechange = null;
                return result;
            }
        }
        foo();
    }
    expect: {
        var req;
        xhrDesc ? (
            (req = new XMLHttpRequest).onreadystatechange,
            Object.defineProperty(XMLHttpRequest.prototype, "onreadystatechange", xhrDesc || {})
        ) : (
            (req = new XMLHttpRequest).onreadystatechange = function(){},
            req[SYMBOL_FAKE_ONREADYSTATECHANGE_1],
            req.onreadystatechange = null
        );
    }
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
        console.log(function(c) {
            ({
                a: 3,
                b: 4,
            });
            return {
                x: c.a,
                y: c.b,
            };
        }({
            a: 1,
            b: 2,
        }));
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
        unsafe: true,
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
            x: o.a,
            y: o.b,
        });
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
        function f(n) {
            ({ b: 3 });
            return n;
        }
        console.log([
            (c = {
                a: 1,
                b: 2,
            }).a,
            f(c.b),
            c.b,
        ].join(" "));
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
            } else
                return _randomInt(min = arg1, max = arg2);
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
        unsafe: true,
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
                console.log(b, d);
            }(0, a);
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
                    for (var k = 0; k < 1; ++k)
                        value = (value = 1) ? value + 1 : 0;
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
            } catch (e) {}
            console.log(b);
        }
        f(0);
    }
    expect: {
        function f(b) {
            try {
                var a = x();
                return (++b)(a);
            } catch (e) {}
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

replace_all_var_scope: {
    rename = true
    options = {
        collapse_vars: true,
        unused: true,
    }
    mangle = {}
    input: {
        var a = 100, b = 10;
        (function(r, a) {
            switch (~a) {
              case (b += a):
              case a++:
            }
        })(--b, a);
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        (function(c, o) {
            switch (~a) {
              case (b += a):
              case o++:
            }
        })(--b, a);
        console.log(a, b);
    }
    expect_stdout: "100 109"
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
        reduce_vars: true,
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
        (function(a, b) {
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
        (function(a, b) {
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

issue_2908: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0, b = 0;
        function f(c) {
            if (1 == c) return;
            a++;
            if (2 == c) b = a;
        }
        f(0);
        f(2);
        console.log(b);
    }
    expect: {
        var a = 0, b = 0;
        function f(c) {
            if (1 == c) return;
            a++;
            if (2 == c) b = a;
        }
        f(0);
        f(2);
        console.log(b);
    }
    expect_stdout: "2"
}

issue_2914_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        function read(input) {
            var i = 0;
            var e = 0;
            var t = 0;
            while (e < 32) {
                var n = input[i++];
                t |= (127 & n) << e;
                if (0 === (128 & n))
                    return t;
                e += 7;
            }
        }
        console.log(read([129]));
    }
    expect: {
        function read(input) {
            var i = 0;
            var e = 0;
            var t = 0;
            while (e < 32) {
                var n = input[i++];
                t |= (127 & n) << e;
                if (0 === (128 & n))
                    return t;
                e += 7;
            }
        }
        console.log(read([129]));
    }
    expect_stdout: "1"
}

issue_2914_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        function read(input) {
            var i = 0;
            var e = 0;
            var t = 0;
            while (e < 32) {
                var n = input[i++];
                t = (127 & n) << e;
                if (0 === (128 & n))
                    return t;
                e += 7;
            }
        }
        console.log(read([129]));
    }
    expect: {
        function read(input) {
            var i = 0;
            var e = 0;
            var t = 0;
            while (e < 32) {
                var n = input[i++];
                if (0 === (128 & n))
                    return t = (127 & n) << e;
                e += 7;
            }
        }
        console.log(read([129]));
    }
    expect_stdout: "0"
}

issue_805: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
    }
    input: {
        function f() {
            function Foo(){}
            Foo.prototype = {};
            Foo.prototype.bar = 42;
            return Foo;
        }
    }
    expect: {
        function f() {
            function Foo(){}
            (Foo.prototype = {}).bar = 42;
            return Foo;
        }
    }
}

issue_2931: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = function() {
                return;
            }();
            return a;
        }());
    }
    expect: {
        console.log(function() {
            return function() {
                return;
            }();
        }());
    }
    expect_stdout: "undefined"
}

issue_2954_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "PASS", b;
        try {
            do {
                b = function() {
                    throw 0;
                }();
                a = "FAIL";
                b && b.c;
            } while (0);
        } catch (e) {
        }
        console.log(a);
    }
    expect: {
        var a = "PASS", b;
        try {
            do {
                b = function() {
                    throw 0;
                }();
                a = "FAIL";
                b && b.c;
            } while (0);
        } catch (e) {
        }
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2954_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL_1", b;
        try {
            throw 0;
        } catch (e) {
            do {
                b = function() {
                    throw new Error("PASS");
                }();
                a = "FAIL_2";
                b && b.c;
            } while (0);
        }
        console.log(a);
    }
    expect: {
        var a = "FAIL_1", b;
        try {
            throw 0;
        } catch (e) {
            do {
                a = "FAIL_2";
                (b = function() {
                    throw new Error("PASS");
                }()) && b.c;
            } while (0);
        }
        console.log(a);
    }
    expect_stdout: Error("PASS")
}

issue_2954_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL_1", b;
        try {
        } finally {
            do {
                b = function() {
                    throw new Error("PASS");
                }();
                a = "FAIL_2";
                b && b.c;
            } while (0);
        }
        console.log(a);
    }
    expect: {
        var a = "FAIL_1", b;
        try {
        } finally {
            do {
                a = "FAIL_2";
                (b = function() {
                    throw new Error("PASS");
                }()) && b.c;
            } while (0);
        }
        console.log(a);
    }
    expect_stdout: Error("PASS")
}

collapse_rhs_conditional_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "PASS", b = "FAIL";
        b = a;
        "function" == typeof f && f(a);
        console.log(a, b);
    }
    expect: {
        var a = "PASS", b = "FAIL";
        b = a;
        "function" == typeof f && f(a);
        console.log(a, b);
    }
    expect_stdout: "PASS PASS"
}

collapse_rhs_conditional_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL", b;
        while ((a = "PASS", --b) && "PASS" == b);
        console.log(a, b);
    }
    expect: {
        var a = "FAIL", b;
        while ((a = "PASS", --b) && "PASS" == b);
        console.log(a, b);
    }
    expect_stdout: "PASS NaN"
}

collapse_rhs_lhs_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var c = 0;
        new function() {
            this[c++] = 1;
            c += 1;
        }();
        console.log(c);
    }
    expect: {
        var c = 0;
        new function() {
            this[c++] = 1;
            c += 1;
        }();
        console.log(c);
    }
    expect_stdout: "2"
}

collapse_rhs_lhs_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var b = 1;
        (function f(f) {
            f = b;
            f[b] = 0;
        })();
        console.log("PASS");
    }
    expect: {
        var b = 1;
        (function f(f) {
            b[b] = 0;
        })();
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

collapse_rhs_loop: {
    options = {
        collapse_vars: true,
    }
    input: {
        var s;
        s = "<tpl>PASS</tpl>";
        for (var m, r = /<tpl>(.*)<\/tpl>/; m = s.match(r);)
            s = s.replace(m[0], m[1]);
        console.log(s);
    }
    expect: {
        var s;
        s = "<tpl>PASS</tpl>";
        for (var m, r = /<tpl>(.*)<\/tpl>/; m = s.match(r);)
            s = s.replace(m[0], m[1]);
        console.log(s);
    }
    expect_stdout: "PASS"
}

collapse_rhs_side_effects: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 1, c = 0;
        new function f() {
            this[a-- && f()] = 1;
            c += 1;
        }();
        console.log(c);
    }
    expect: {
        var a = 1, c = 0;
        new function f() {
            this[a-- && f()] = 1;
            c += 1;
        }();
        console.log(c);
    }
    expect_stdout: "2"
}

collapse_rhs_vardef: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b = 1;
        a = --b + function c() {
            var b;
            c[--b] = 1;
        }();
        b |= a;
        console.log(a, b);
    }
    expect: {
        var a, b = 1;
        a = --b + function c() {
            var b;
            c[--b] = 1;
        }();
        b |= a;
        console.log(a, b);
    }
    expect_stdout: "NaN 0"
}

collapse_rhs_array: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b;
        function f() {
            a = [];
            b = [];
            return [];
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            a = [];
            b = [];
            return [];
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "false false false"
}

collapse_rhs_boolean_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
    }
    input: {
        var a, b;
        function f() {
            a = !0;
            b = !0;
            return !0;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            return b = a = !0;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "true true true"
}

collapse_rhs_boolean_2: {
    options = {
        collapse_vars: true,
        evaluate: true,
    }
    input: {
        var a;
        (function f1() {
            a = function() {};
            if (/foo/)
                console.log(typeof a);
        })();
        console.log(function f2() {
            a = [];
            return !1;
        }());
    }
    expect: {
        var a;
        (function f1() {
            if (a = function() {})
                console.log(typeof a);
        })();
        console.log(function f2() {
            return !(a = []);
        }());
    }
    expect_stdout: [
        "function",
        "false",
    ]
}

collapse_rhs_boolean_3: {
    options = {
        booleans: true,
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
    }
    input: {
        var a, f, g, h, i, n, s, t, x, y;
        if (x()) {
            n = a;
        } else if (y()) {
            n = f();
        } else if (s) {
            i = false;
            n = g(true);
        } else if (t) {
            i = false;
            n = h(true);
        } else {
            n = [];
        }
    }
    expect: {
        var a, f, g, h, i, n, s, t, x, y;
        n = x() ? a : y() ? f() : s ? g(!(i = !1)) : t ? h(!(i = !1)) : [];
    }
}

collapse_rhs_function: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b;
        function f() {
            a = function() {};
            b = function() {};
            return function() {};
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            a = function() {};
            b = function() {};
            return function() {};
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "false false false"
}

collapse_rhs_number: {
    options = {
        collapse_vars: true,
        evaluate: true,
    }
    input: {
        var a, b;
        function f() {
            a = 42;
            b = 42;
            return 42;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            return b = a = 42;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "true true true"
}

collapse_rhs_object: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b;
        function f() {
            a = {};
            b = {};
            return {};
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            a = {};
            b = {};
            return {};
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "false false false"
}

collapse_rhs_regexp: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b;
        function f() {
            a = /bar/;
            b = /bar/;
            return /bar/;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            a = /bar/;
            b = /bar/;
            return /bar/;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "false false false"
}

collapse_rhs_string: {
    options = {
        collapse_vars: true,
        evaluate: true,
    }
    input: {
        var a, b;
        function f() {
            a = "foo";
            b = "foo";
            return "foo";
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            return b = a = "foo";
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "true true true"
}

collapse_rhs_var: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b;
        function f() {
            a = f;
            b = f;
            return f;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            return b = a = f;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "true true true"
}

collapse_rhs_this: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b;
        function f() {
            a = this;
            b = this;
            return this;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            return b = a = this;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "true true true"
}

collapse_rhs_undefined: {
    options = {
        collapse_vars: true,
        side_effects: true,
    }
    input: {
        var a, b;
        function f() {
            a = void 0;
            b = void 0;
            return void 0;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect: {
        var a, b;
        function f() {
            b = a = void 0;
            return;
        }
        var c = f();
        console.log(a === b, b === c, c === a);
    }
    expect_stdout: "true true true"
}

issue_2974: {
    options = {
        booleans: true,
        collapse_vars: true,
        evaluate: true,
        loops: true,
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        (function f(b) {
            var a = 2;
            do {
                b && b[b];
                b && (b.null = -4);
                c++;
            } while (b.null && --a > 0);
        })(true);
        console.log(c);
    }
    expect: {
        var c = 0;
        (function(b) {
            var a = 2;
            for (;c++, (!0).null && --a > 0;);
        })(),
        console.log(c);
    }
    expect_stdout: "1"
}

issue_3032: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        console.log({
            f: function() {
                this.a = 42;
                return [ this.a, !1 ];
            }
        }.f()[0]);
    }
    expect: {
        console.log({
            f: function() {
                this.a = 42;
                return [ this.a, !1 ];
            }
        }.f()[0]);
    }
    expect_stdout: "42"
}

issue_3096: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function() {
            var ar = ["a", "b"];
            var first = ar.pop();
            return ar + "" + first;
        }());
    }
    expect: {
        console.log(function() {
            var ar = ["a", "b"];
            var first = ar.pop();
            return ar + "" + first;
        }());
    }
    expect_stdout: "ab"
}

issue_3215_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        ie: false,
        inline: true,
        passes: 2,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function a() {
            var a = 42;
            return typeof a;
        }());
    }
    expect: {
        console.log("number");
    }
    expect_stdout: "number"
}

issue_3215_2: {
    options = {
        collapse_vars: true,
        evaluate: true,
        ie: true,
        inline: true,
        passes: 2,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function a() {
            var a = 42;
            return typeof a;
        }());
    }
    expect: {
        console.log(function a() {
            var a = 42;
            return typeof a;
        }());
    }
    expect_stdout: "number"
}

issue_3215_3: {
    options = {
        collapse_vars: true,
        evaluate: true,
        ie: false,
        inline: true,
        passes: 2,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = 42;
            (function a() {});
            return typeof a;
        }());
    }
    expect: {
        console.log("number");
    }
    expect_stdout: "number"
}

issue_3215_4: {
    options = {
        collapse_vars: true,
        evaluate: true,
        ie: true,
        inline: true,
        passes: 2,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = 42;
            (function a() {});
            return typeof a;
        }());
    }
    expect: {
        console.log(function() {
            var a = 42;
            (function a() {});
            return typeof a;
        }());
    }
    expect_stdout: "number"
}

issue_3238_1: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        function f(a) {
            var b, c;
            if (a) {
                b = Object.create(null);
                c = Object.create(null);
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect: {
        function f(a) {
            var b, c;
            if (a) {
                b = Object.create(null);
                c = Object.create(null);
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect_stdout: "true false"
}

issue_3238_2: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        function f(a) {
            var b, c;
            if (a) {
                b = Error();
                c = Error();
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect: {
        function f(a) {
            var b, c;
            if (a) {
                b = Error();
                c = Error();
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect_stdout: "true false"
}

issue_3238_3: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        function f(a) {
            var b, c;
            if (a) {
                b = new Date();
                c = new Date();
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect: {
        function f(a) {
            var b, c;
            if (a) {
                b = new Date();
                c = new Date();
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect_stdout: "true false"
}

issue_3238_4: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        function f(a) {
            var b, c;
            if (a) {
                b = a && {};
                c = a && {};
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect: {
        function f(a) {
            var b, c;
            if (a) {
                b = a && {};
                c = a && {};
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect_stdout: "true false"
}

issue_3238_5: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        function f(a) {
            var b, c;
            if (a) {
                b = a ? [] : 42;
                c = a ? [] : 42;
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect: {
        function f(a) {
            var b, c;
            if (a) {
                b = a ? [] : 42;
                c = a ? [] : 42;
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect_stdout: "true false"
}

issue_3238_6: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        function f(a) {
            var b, c;
            if (a) {
                b = a && 0 || [];
                c = a && 0 || [];
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect: {
        function f(a) {
            var b, c;
            if (a) {
                b = a && 0 || [];
                c = a && 0 || [];
            }
            return b === c;
        }
        console.log(f(0), f(1));
    }
    expect_stdout: "true false"
}

issue_3247: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f(o) {
            console.log(o.p);
        }
        var a;
        a = Object({ p: "PASS" });
        a.q = true;
        f(a, true);
    }
    expect: {
        function f(o) {
            console.log(o.p);
        }
        var a;
        (a = Object({ p: "PASS" })).q = true;
        f(a, true);
    }
    expect_stdout: "PASS"
}

issue_3305: {
    options = {
        collapse_vars: true,
        conditionals: true,
        sequences: true,
    }
    input: {
        function calc(a) {
            var x, w;
            if (a) {
                x = a;
                w = 1;
            } else {
                x = 1;
                w = 0;
            }
            return add(x, w);
        }
        function add(x, w) {
            return x + w;
        }
        console.log(calc(41));
    }
    expect: {
        function calc(a) {
            var x, w;
            return w = a ? (x = a, 1) : (x = 1, 0), add(x, w);
        }
        function add(x, w) {
            return x + w;
        }
        console.log(calc(41));
    }
    expect_stdout: "42"
}

issue_3314: {
    options = {
        collapse_vars: true,
    }
    input: {
        function test(a, b) {
            console.log(a, b);
        }
        var a = "FAIL", b;
        b = a = "PASS";
        test(a, b);
    }
    expect: {
        function test(a, b) {
            console.log(a, b);
        }
        var a = "FAIL", b;
        b = a = "PASS";
        test(a, b);
    }
    expect_stdout: "PASS PASS"
}

issue_3327: {
    options = {
        collapse_vars: true,
        conditionals: true,
        sequences: true,
    }
    input: {
        var a, b, l = ["PASS", 42];
        if (l.length === 1) {
            a = l[0].a;
            b = l[0].b;
        } else {
            a = l[0];
            b = l[1];
        }
        function echo(a, b) {
            console.log(a, b);
        }
        echo(a, b);
    }
    expect: {
        var a, b, l = ["PASS", 42];
        function echo(a, b) {
            console.log(a, b);
        }
        b = 1 === l.length ? (a = l[0].a, l[0].b) : (a = l[0], l[1]),
        echo(a,b);
    }
    expect_stdout: "PASS 42"
}

assign_left: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function(a, b) {
            (b = a, b.p).q = "PASS";
            return a.p.q;
        }({p: {}}));
    }
    expect: {
        console.log(function(a, b) {
            a.p.q = "PASS";
            return a.p.q;
        }({p: {}}));
    }
    expect_stdout: "PASS"
}

sub_property: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function(a, b) {
            return a[b = a, b.length - 1];
        }([ "FAIL", "PASS" ]));
    }
    expect: {
        console.log(function(a, b) {
            return a[a.length - 1];
        }([ "FAIL", "PASS" ]));
    }
    expect_stdout: "PASS"
}

assign_undeclared: {
    options = {
        collapse_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var A = (console.log(42), function() {});
        B = new A();
        console.log(typeof B);
    }
    expect: {
        console.log(42);
        B = new function() {}();
        console.log(typeof B);
    }
    expect_stdout: [
        "42",
        "object",
    ]
}

Infinity_assignment: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        unsafe: true,
    }
    input: {
        var Infinity;
        Infinity = 42;
        console.log(Infinity);
    }
    expect: {
        var Infinity;
        Infinity = 42;
        console.log(Infinity);
    }
    expect_stdout: true
}

issue_3439_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function(a) {
            function a() {}
            return a;
        }(42));
    }
    expect: {
        console.log(typeof function(a) {
            function a() {}
            return a;
        }(42));
    }
    expect_stdout: "function"
}

issue_3439_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function() {
            var a = 42;
            function a() {}
            return a;
        }());
    }
    expect: {
        console.log(typeof function() {
            return 42;
        }());
    }
    expect_stdout: "number"
}

cond_sequence_return_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function(n) {
            var c = 0;
            for (var k in [0, 1])
                if (c++, k == n) return c;
        }(1));
    }
    expect: {
        console.log(function(n) {
            var c = 0;
            for (var k in [0, 1])
                if (c++, k == n) return c;
        }(1));
    }
    expect_stdout: "2"
}

cond_sequence_return_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function(n) {
            var c = 0;
            for (var k in [0, 1])
                if (c += 1, k == n) return c;
        }(1));
    }
    expect: {
        console.log(function(n) {
            var c = 0;
            for (var k in [0, 1])
                if (c += 1, k == n) return c;
        }(1));
    }
    expect_stdout: "2"
}

issue_3520: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = 0;
        var b = function(c) {
            for (var i = 2; --i >= 0;) {
                (function f() {
                    c = 0;
                    var i = void 0;
                    var f = f && f[i];
                })();
                a += b;
                c && b++;
            }
        }(b = 1);
        console.log(a);
    }
    expect: {
        var a = 0;
        var b = function(c) {
            for (var i = 2; --i >= 0;) {
                (function() {
                    c = 0;
                    var f = f && f[void 0];
                })();
                a += b;
                c && b++;
            }
        }(b = 1);
        console.log(a);
    }
    expect_stdout: "2"
}

issue_3526_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var b = function() {
            this.a = "FAIL";
        }();
        var a = "PASS";
        var b;
        var c = b;
        console.log(a);
    }
    expect: {
        var b = function() {
            this.a = "FAIL";
        }();
        var a = "PASS";
        var b;
        var c = b;
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3526_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f() {
            this.a = "FAIL";
        }
        var b = f();
        var a = "PASS";
        var b;
        var c = b;
        console.log(a);
    }
    expect: {
        function f() {
            this.a = "FAIL";
        }
        var b = f();
        var a = "PASS";
        var b;
        var c = b;
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3562: {
    options = {
        collapse_vars: true,
        conditionals: true,
        sequences: true,
    }
    input: {
        function f(a) {
            console.log("PASS", a);
        }
        function g(b) {
            console.log("FAIL", b);
        }
        var h;
        var c;
        if (console) {
            h = f;
            c = "PASS";
        } else {
            h = g;
            c = "FAIL";
        }
        h(c);
    }
    expect: {
        function f(a) {
            console.log("PASS", a);
        }
        function g(b) {
            console.log("FAIL", b);
        }
        var h;
        var c;
        c = console ? (h = f, "PASS") : (h = g, "FAIL"),
        h(c);
    }
    expect_stdout: "PASS PASS"
}

dot_throw_assign_sequence: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        try {
            var b;
            b[0] = (a = "PASS", 0);
            a = 1 + a;
        } catch (c) {
        }
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        try {
            var b;
            b[0] = (a = "PASS", 0);
            a = 1 + a;
        } catch (c) {
        }
        console.log(a);
    }
    expect_stdout: "PASS"
}

call_assign_order: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b = 1, c = 0, log = console.log;
        (function() {
            a = b = "PASS";
        })((b = "FAIL", c++));
        log(a, b);
    }
    expect: {
        var a, b = 1, c = 0, log = console.log;
        (function() {
            a = b = "PASS";
        })((b = "FAIL", c++));
        log(a, b);
    }
    expect_stdout: "PASS PASS"
}

issue_3573: {
    options = {
        collapse_vars: true,
    }
    input: {
        var c = 0;
        (function(b) {
            while (--b) {
                b = NaN;
                switch (0 / this < 0) {
                  case c++, false:
                  case c++, NaN:
                }
            }
        })(3);
        console.log(c);
    }
    expect: {
        var c = 0;
        (function(b) {
            while (--b) {
                b = NaN;
                switch (0 / this < 0) {
                  case c++, false:
                  case c++, NaN:
                }
            }
        })(3);
        console.log(c);
    }
    expect_stdout: "1"
}

issue_3581_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "PASS", b = "FAIL";
        try {
            b = "PASS";
            if (a) throw 0;
            b = 1 + b;
            a = "FAIL";
        } catch (e) {}
        console.log(a, b);
    }
    expect: {
        var a = "PASS", b = "FAIL";
        try {
            b = "PASS";
            if (a) throw 0;
            b = 1 + b;
            a = "FAIL";
        } catch (e) {}
        console.log(a, b);
    }
    expect_stdout: "PASS PASS"
}

issue_3581_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        (function() {
            var a = "PASS", b = "FAIL";
            try {
                b = "PASS";
                if (a) return;
                b = 1 + b;
                a = "FAIL";
            } finally {
                console.log(a, b);
            }
        })();
    }
    expect: {
        (function() {
            var a = "PASS", b = "FAIL";
            try {
                b = "PASS";
                if (a) return;
                b = 1 + b;
                a = "FAIL";
            } finally {
                console.log(a, b);
            }
        })();
    }
    expect_stdout: "PASS PASS"
}

issue_3596: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
    }
    input: {
        console.log(function f() {
            return f[[ ][f.undefined = 42, 0]] += !1;
        }());
    }
    expect: {
        console.log(function f() {
            return f[[ ][f.undefined = 42, 0]] += !1;
        }());
    }
    expect_stdout: "42"
}

local_value_replacement: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            (a = b) && g(a);
        }
        function g(c) {
            console.log(c);
        }
        f("FAIL", "PASS");
    }
    expect: {
        function f(a, b) {
            b && g(b);
        }
        function g(c) {
            console.log(c);
        }
        f("FAIL", "PASS");
    }
    expect_stdout: "PASS"
}

array_in_object_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 2;
        console.log({
            p: [ a, a-- ],
            q: a,
        }.q, a);
    }
    expect: {
        var a = 2;
        console.log({
            p: [ a, a-- ],
            q: a,
        }.q, a);
    }
    expect_stdout: "1 1"
}

array_in_object_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 2;
        console.log({
            p: [ a, (a--, 42) ],
            q: a,
        }.q, a);
    }
    expect: {
        var a = 2;
        console.log({
            p: [ a, 42 ],
            q: --a,
        }.q, a);
    }
    expect_stdout: "1 1"
}

array_in_conditional: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 1, b = 2, c;
        console.log(c && [ b = a ], a, b);
    }
    expect: {
        var a = 1, b = 2, c;
        console.log(c && [ b = a ], a, b);
    }
    expect_stdout: "undefined 1 2"
}

object_in_conditional: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 1, b = 2, c;
        console.log(c && {
            p: b = a
        }, a, b);
    }
    expect: {
        var a = 1, b = 2, c;
        console.log(c && {
            p: b = a
        }, a, b);
    }
    expect_stdout: "undefined 1 2"
}

sequence_in_iife_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "foo", b = 42;
        (function() {
            var c = (b = a, b);
        })();
        console.log(a, b);
    }
    expect: {
        var a = "foo", b = 42;
        (function() {
            var c = b = a;
        })();
        console.log(a, b);
    }
    expect_stdout: "foo foo"
}

sequence_in_iife_2: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var a = "foo", b = 42;
        (function() {
            var c = (b = a, b);
        })();
        console.log(a, b);
    }
    expect: {
        var a = "foo", b = 42;
        console.log(b = a, b);
    }
    expect_stdout: "foo foo"
}

sequence_in_iife_3: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        side_effects: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var a = "foo", b = 42;
        (function() {
            var c = (b = a, b);
        })();
        console.log(a, b);
    }
    expect: {
        var a = "foo";
        console.log(a, a);
    }
    expect_stdout: "foo foo"
}

retain_assign: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 42, b, c = "FAIL";
        b = a;
        b++ && (c = "PASS");
        console.log(c);
    }
    expect: {
        var a = 42, b, c = "FAIL";
        b = a;
        b++ && (c = "PASS");
        console.log(c);
    }
    expect_stdout: "PASS"
}

getter_side_effect: {
    options = {
        collapse_vars: true,
    }
    input: {
        var c = "FAIL";
        (function(a) {
            var b;
            (b = a) && {
                get foo() {
                    a = 0;
                }
            }.foo;
            b && (c = "PASS");
        })(42);
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function(a) {
            var b;
            (b = a) && {
                get foo() {
                    a = 0;
                }
            }.foo;
            b && (c = "PASS");
        })(42);
        console.log(c);
    }
    expect_stdout: "PASS"
}

setter_side_effect: {
    options = {
        collapse_vars: true,
    }
    input: {
        var c = "FAIL";
        (function(a) {
            var b;
            (b = a) && ({
                set foo(v) {
                    a = v;
                }
            }.foo = 0);
            b && (c = "PASS");
        })(42);
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function(a) {
            var b;
            (b = a) && ({
                set foo(v) {
                    a = v;
                }
            }.foo = 0);
            b && (c = "PASS");
        })(42);
        console.log(c);
    }
    expect_stdout: "PASS"
}

substitution_assign: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        function f1(a, b) {
            f1 = b = a;
            console.log(a, b);
        }
        function f2(a, b) {
            a = 1 + (b = a);
            console.log(a, b);
        }
        function f3(a, b) {
            b = 1 + (b = a);
            console.log(a, b);
        }
        f1(42, "foo");
        f2(42, "foo");
        f3(42, "foo");
    }
    expect: {
        function f1(a, b) {
            console.log(f1 = a, a);
        }
        function f2(a, b) {
            a = 1 + (b = a);
            console.log(a, b);
        }
        function f3(a, b) {
            b = 1 + (b = a);
            console.log(a, b);
        }
        f1(42, "foo");
        f2(42, "foo");
        f3(42, "foo");
    }
    expect_stdout: [
        "42 42",
        "43 42",
        "42 43",
    ]
}

substitution_arithmetic: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f1(a, b) {
            console.log((b = a) + a, b);
        }
        function f2(a, b) {
            console.log(a - (b = a), b);
        }
        function f3(a, b) {
            console.log(a / (b = a) + b, b);
        }
        f1(42, "foo");
        f2(42, "foo");
        f3(42, "foo");
    }
    expect: {
        function f1(a, b) {
            console.log(a + a, a);
        }
        function f2(a, b) {
            console.log(a - a, a);
        }
        function f3(a, b) {
            console.log(a / a + a, a);
        }
        f1(42, "foo");
        f2(42, "foo");
        f3(42, "foo");
    }
    expect_stdout: [
        "84 42",
        "0 42",
        "43 42",
    ]
}

substitution_logical_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f1(a, b) {
            console.log((b = a) && a, b);
        }
        function f2(a, b) {
            console.log(a && (b = a), b);
        }
        f1(42, "foo");
        f1(null, true);
        f2(42, "foo");
        f2(null, true);
    }
    expect: {
        function f1(a, b) {
            console.log(a && a, a);
        }
        function f2(a, b) {
            console.log(a && (b = a), b);
        }
        f1(42, "foo");
        f1(null, true);
        f2(42, "foo");
        f2(null, true);
    }
    expect_stdout: [
        "42 42",
        "null null",
        "42 42",
        "null true"
    ]
}

substitution_logical_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f1(a, b) {
            console.log((b = a) && a && b);
        }
        function f2(a, b) {
            console.log((b = a) && a || b);
        }
        function f3(a, b) {
            console.log((b = a) || a && b);
        }
        function f4(a, b) {
            console.log((b = a) || a || b);
        }
        f1(42, "foo");
        f1(null, true);
        f2(42, "foo");
        f2(null, true);
        f3(42, "foo");
        f3(null, true);
        f4(42, "foo");
        f4(null, true);
    }
    expect: {
        function f1(a, b) {
            console.log(a && a && a);
        }
        function f2(a, b) {
            console.log(a && a || a);
        }
        function f3(a, b) {
            console.log(a || a && a);
        }
        function f4(a, b) {
            console.log(a || a || a);
        }
        f1(42, "foo");
        f1(null, true);
        f2(42, "foo");
        f2(null, true);
        f3(42, "foo");
        f3(null, true);
        f4(42, "foo");
        f4(null, true);
    }
    expect_stdout: [
        "42",
        "null",
        "42",
        "null",
        "42",
        "null",
        "42",
        "null",
    ]
}

substitution_logical_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f1(a, b) {
            console.log(a && (b = a) && b);
        }
        function f2(a, b) {
            console.log(a && (b = a) || b);
        }
        function f3(a, b) {
            console.log(a || (b = a) && b);
        }
        function f4(a, b) {
            console.log(a || (b = a) || b);
        }
        f1(42, "foo");
        f1(null, true);
        f2(42, "foo");
        f2(null, true);
        f3(42, "foo");
        f3(null, true);
        f4(42, "foo");
        f4(null, true);
    }
    expect: {
        function f1(a, b) {
            console.log(a && a && a);
        }
        function f2(a, b) {
            console.log(a && (b = a) || b);
        }
        function f3(a, b) {
            console.log(a || a && a);
        }
        function f4(a, b) {
            console.log(a || a || a);
        }
        f1(42, "foo");
        f1(null, true);
        f2(42, "foo");
        f2(null, true);
        f3(42, "foo");
        f3(null, true);
        f4(42, "foo");
        f4(null, true);
    }
    expect_stdout: [
        "42",
        "null",
        "42",
        "true",
        "42",
        "null",
        "42",
        "null",
    ]
}

substitution_conditional: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f1(a, b) {
            console.log((b = a) ? a : b, a, b);
        }
        function f2(a, b) {
            console.log(a ? b = a : b, a, b);
        }
        function f3(a, b) {
            console.log(a ? a : b = a, a, b);
        }
        f1("foo", "bar");
        f1(null, true);
        f2("foo", "bar");
        f2(null, true);
        f3("foo", "bar");
        f3(null, true);
    }
    expect: {
        function f1(a, b) {
            console.log(a ? a : a, a, a);
        }
        function f2(a, b) {
            console.log(a ? b = a : b, a, b);
        }
        function f3(a, b) {
            console.log(a ? a : b = a, a, b);
        }
        f1("foo", "bar");
        f1(null, true);
        f2("foo", "bar");
        f2(null, true);
        f3("foo", "bar");
        f3(null, true);
    }
    expect_stdout: [
        "foo foo foo",
        "null null null",
        "foo foo foo",
        "true null true",
        "foo foo bar",
        "null null null",
    ]
}

substitution_unary: {
    options = {
        collapse_vars: true,
    }
    input: {
        function f1(a, b) {
            console.log(typeof (b = a), a, b);
        }
        function f2(a, b) {
            console.log(void (b = a), a, b);
        }
        function f3(a, b) {
            console.log(delete (b = a), a, b);
        }
        f1(42, "foo");
        f2(42, "foo");
        f3(42, "foo");
    }
    expect: {
        function f1(a, b) {
            console.log(typeof a, a, a);
        }
        function f2(a, b) {
            console.log(void a, a, a);
        }
        function f3(a, b) {
            console.log(delete (b = a), a, b);
        }
        f1(42, "foo");
        f2(42, "foo");
        f3(42, "foo");
    }
    expect_stdout: [
        "number 42 42",
        "undefined 42 42",
        "true 42 42",
    ]
}

issue_3626_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "foo", b = 42;
        a.p && (b = a) && a;
        console.log(a, b);
    }
    expect: {
        var a = "foo", b = 42;
        a.p && (b = a) && a;
        console.log(a, b);
    }
    expect_stdout: "foo 42"
}

issue_3626_2: {
    options = {
        collapse_vars: true,
        conditionals: true,
    }
    input: {
        var a = "foo", b = 42, c = null;
        if (a && a.p)
            if (b = a)
                c++ + a;
        console.log(a, b, c);
    }
    expect: {
        var a = "foo", b = 42, c = null;
        a && a.p && (b = a) && c++ + a;
        console.log(a, b, c);
    }
    expect_stdout: "foo 42 null"
}

issue_3628_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "bar", b;
        ({
            get p() {
                a = "foo";
            },
            q: b = a
        }).p;
        console.log(a, b);
    }
    expect: {
        var a = "bar", b;
        ({
            get p() {
                a = "foo";
            },
            q: b = a
        }).p;
        console.log(a, b);
    }
    expect_stdout: "foo bar"
}

issue_3628_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "bar", b;
        ({
            get p() {
                a = "foo";
            },
            q: (b = a, 42)
        }).p;
        console.log(a, b);
    }
    expect: {
        var a = "bar", b;
        ({
            get p() {
                a = "foo";
            },
            q: (b = a, 42)
        }).p;
        console.log(a, b);
    }
    expect_stdout: "foo bar"
}

issue_3641: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b;
        try {
            a = "foo";
            b = (a += (A.p = 0, "bar")) % 0;
        } catch (e) {}
        console.log(a, b);
    }
    expect: {
        var a, b;
        try {
            a = "foo";
            b = (a += (A.p = 0, "bar")) % 0;
        } catch (e) {}
        console.log(a, b);
    }
    expect_stdout: "foo undefined"
}

issue_3651: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var a, b = "PASS";
        try {
            a = function() {
                try {
                    var c = 1;
                    while (0 < --c);
                } catch (e) {} finally {
                    throw 42;
                }
            }();
            b = "FAIL";
            a.p;
        } catch (e) {
            console.log(b);
        }
    }
    expect: {
        var a, b = "PASS";
        try {
            a = function() {
                try {
                    var c = 1;
                    while (0 < --c);
                } catch (e) {} finally {
                    throw 42;
                }
            }();
            b = "FAIL";
            a.p;
        } catch (e) {
            console.log(b);
        }
    }
    expect_stdout: "PASS"
}

issue_3671: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0;
        try {
            a++;
            A += 0;
            a = 1 + a;
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = 0;
        try {
            a++;
            A += 0;
            a = 1 + a;
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "1"
}

call_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        (function(a) {
            a = console;
            (function() {})();
            a.log("PASS");
        })();
    }
    expect: {
        (function(a) {
            (function() {})();
            (a = console).log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

call_1_symbol: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        (function(a) {
            function f() {}
            a = console;
            f();
            a.log(typeof f);
        })();
    }
    expect: {
        (function(a) {
            function f() {}
            f();
            (a = console).log(typeof f);
        })();
    }
    expect_stdout: "function"
}

call_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        (function(a) {
            a = console;
            (function() {
                return 42;
                console.log("FAIL");
            })();
            a.log("PASS");
        })();
    }
    expect: {
        (function(a) {
            (function() {
                return 42;
                console.log("FAIL");
            })();
            (a = console).log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

call_2_symbol: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        (function(a) {
            function f() {
                return 42;
                console.log("FAIL");
            }
            a = console;
            f();
            a.log(typeof f);
        })();
    }
    expect: {
        (function(a) {
            function f() {
                return 42;
                console.log("FAIL");
            }
            f();
            (a = console).log(typeof f);
        })();
    }
    expect_stdout: "function"
}

call_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        (function(a) {
            a = console;
            (function() {
                a = {
                    log: function() {
                        console.log("PASS");
                    }
                }
            })();
            a.log("FAIL");
        })();
    }
    expect: {
        (function(a) {
            a = console;
            (function() {
                a = {
                    log: function() {
                        console.log("PASS");
                    }
                }
            })();
            a.log("FAIL");
        })();
    }
    expect_stdout: "PASS"
}

call_3_symbol: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        (function(a) {
            function f() {
                a = {
                    log: function() {
                        console.log(typeof f);
                    }
                }
            }
            a = console;
            f();
            a.log("FAIL");
        })();
    }
    expect: {
        (function(a) {
            function f() {
                a = {
                    log: function() {
                        console.log(typeof f);
                    }
                }
            }
            a = console;
            f();
            a.log("FAIL");
        })();
    }
    expect_stdout: "function"
}

issue_3698_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var log = console.log;
        var a, b = 0, c = 0;
        (function() {
            a = b;
        })(b++, (b++, c++));
        log(a, b, c);
    }
    expect: {
        var log = console.log;
        var a, b = 0, c = 0;
        (function() {
            a = b;
        })(b++, (b++, c++));
        log(a, b, c);
    }
    expect_stdout: "2 2 1"
}

issue_3698_2: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        var log = console.log;
        var a, b = 0, c = 0, d = 1;
        (function f() {
            a = b;
            d-- && f();
        })(b++, (b++, c++));
        log(a, b, c, d);
    }
    expect: {
        var log = console.log;
        var a, b = 0, c = 0, d = 1;
        (function f() {
            a = b;
            d-- && f();
        })(b++, (b++, c++));
        log(a, b, c, d);
    }
    expect_stdout: "2 2 1 -1"
}

issue_3698_3: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        var a = 0, b = 0;
        (function f(c) {
            {
                b++;
                var bar_1 = (b = 1 + b, c = 0);
                a-- && f();
            }
        })();
        console.log(b);
    }
    expect: {
        var a = 0, b = 0;
        (function f(c) {
            var bar_1 = (b = 1 + ++b, c = 0);
            a-- && f();
        })();
        console.log(b);
    }
    expect_stdout: "2"
}

issue_3700: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        try {
            a = "PASS";
            (function() {
                throw 0;
            })();
            a = 1 + a;
        } catch (e) {
        }
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        try {
            a = "PASS";
            (function() {
                throw 0;
            })();
            a = 1 + a;
        } catch (e) {
        }
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3744: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function f(a) {
            ({
                get p() {
                    switch (1) {
                      case 0:
                        f((a = 2, 3));
                      case 1:
                        console.log(function g(b) {
                            return b || "PASS";
                        }());
                    }
                }
            }).p;
        })();
    }
    expect: {
        (function f(a) {
            ({
                get p() {
                    switch (1) {
                      case 0:
                        f();
                      case 1:
                        console.log(b || "PASS");
                    }
                    var b;
                }
            }).p;
        })();
    }
    expect_stdout: "PASS"
}

assign_value_def: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            while (1) {
                var b = a[0], c = a[1];
                d = b;
                e = c;
                if (c[0] - e[0] > c[1] - d[1]) break;
                return "PASS";
            }
            var d, e;
            return "FAIL";
        }
        console.log(f([
            [ 1, 2 ],
            [ 3, 4 ],
        ]));
    }
    expect: {
        function f(a) {
            while (1) {
                var b = a[0], c = a[1];
                if (c[0] - c[0] > c[1] - b[1]) break;
                return "PASS";
            }
            return "FAIL";
        }
        console.log(f([
            [ 1, 2 ],
            [ 3, 4 ],
        ]));
    }
    expect_stdout: "PASS"
}

join_vars_value_def: {
    options = {
        collapse_vars: true,
        join_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            while (1) {
                var b = a[0], c = a[1];
                d = b;
                e = c;
                if (c[0] - e[0] > c[1] - d[1]) break;
                return "PASS";
            }
            var d, e;
            return "FAIL";
        }
        console.log(f([
            [ 1, 2 ],
            [ 3, 4 ],
        ]));
    }
    expect: {
        function f(a) {
            while (1) {
                var b = a[0], c = a[1];
                if (c[0] - c[0] > c[1] - b[1]) break;
                return "PASS";
            }
            return "FAIL";
        }
        console.log(f([
            [ 1, 2 ],
            [ 3, 4 ],
        ]));
    }
    expect_stdout: "PASS"
}

var_value_def: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            while (1) {
                var b = a[0], c = a[1], d = b, e = c;
                if (c[0] - e[0] > c[1] - d[1]) break;
                return "PASS";
            }
            var d, e;
            return "FAIL";
        }
        console.log(f([
            [ 1, 2 ],
            [ 3, 4 ],
        ]));
    }
    expect: {
        function f(a) {
            while (1) {
                var b = a[0], c = a[1];
                if (c[0] - c[0] > c[1] - b[1]) break;
                return "PASS";
            }
            return "FAIL";
        }
        console.log(f([
            [ 1, 2 ],
            [ 3, 4 ],
        ]));
    }
    expect_stdout: "PASS"
}

mangleable_var: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b = a(), c = a(), d = b;
            return c.p(c, d);
        }
        console.log(f(function() {
            return {
                p: function() {
                    return "PASS"
                },
            };
        }));
    }
    expect: {
        function f(a) {
            var b = a(), c = a();
            return c.p(c, b);
        }
        console.log(f(function() {
            return {
                p: function() {
                    return "PASS";
                }
            };
        }));
    }
    expect_stdout: "PASS"
}

mangleable_assignment_1: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var o = {
            p: function() {
                return 6;
            },
        };
        (function() {
            var a, b = a = o.p();
            console.log(a * (b / a + b));
        })();
    }
    expect: {
        var o = {
            p: function() {
                return 6;
            },
        };
        (function() {
            var a;
            a = o.p();
            console.log(a * (a / a + a));
        })();
    }
    expect_stdout: "42"
}

mangleable_assignment_2: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var o = {
            p: function() {
                return 6;
            },
        };
        (function(a, b) {
            b = a = o.p();
            console.log(a * (b / a + b));
        })();
    }
    expect: {
        var o = {
            p: function() {
                return 6;
            },
        };
        (function(a, b) {
            a = o.p();
            console.log(a * (a / a + a));
        })();
    }
    expect_stdout: "42"
}

issue_3884_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 100, b = 1;
        {
            a++ + a || a;
            b <<= a;
        }
        console.log(a, b);
    }
    expect: {
        var a = 100;
        ++a;
        console.log(a, 32);
    }
    expect_stdout: "101 32"
}

issue_3884_2: {
    options = {
        collapse_vars: true,
        evaluate: true,
        passes: 3,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 100, b = 1;
        {
            a++ + a || a;
            b <<= a;
        }
        console.log(a, b);
    }
    expect: {
        console.log(101, 32);
    }
    expect_stdout: "101 32"
}

issue_3891: {
    options = {
        collapse_vars: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function log(a) {
            console.log(typeof a);
        }
        log(function f() {
            try {
                do {
                    var b = function() {}();
                } while (f = 0, b.p);
            } catch (e) {
                var f;
                b;
            }
        });
    }
    expect: {
        function log(a) {
            console.log(typeof a);
        }
        log(function() {
            try {
                do {} while ((void 0).p);
            } catch (e) {}
        });
    }
    expect_stdout: "function"
}

issue_3894: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function log(msg) {
            console.log(msg ? "FAIL" : "PASS");
        }
        var a, c;
        (function(b) {
            a = c = 0,
            log(b);
        })(-0);
        log(a);
        log(c);
    }
    expect: {
        function log(msg) {
            console.log(msg ? "FAIL" : "PASS");
        }
        var a, c;
        void log(-(a = c = 0));
        log(a);
        log(c);
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
    ]
}

issue_3897: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0;
        (function() {
            function f(b) {
                b = a = 1 + a;
                a = 1 + a;
                console.log(b);
            }
            f();
        })();
        console.log(a);
    }
    expect: {
        var a = 0;
        (function() {
            function f(b) {
                b = a = 1 + a;
                a = 1 + a;
                console.log(b);
            }
            f();
        })();
        console.log(a);
    }
    expect_stdout: [
        "1",
        "2",
    ]
}

issue_3908: {
    options = {
        collapse_vars: true,
        conditionals: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        if (console) {
            var o = {
                p: !1
            }, a = o;
        }
        console.log("PASS");
    }
    expect: {
        console && 0;
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_3927: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0;
        console.log(function(b) {
            try {
                try {
                    if (a + (b = "PASS", true)) return;
                    b.p;
                } finally {
                    return b;
                }
            } catch (e) {
            }
        }());
    }
    expect: {
        var a = 0;
        console.log(function(b) {
            try {
                try {
                    if (a + (b = "PASS", true)) return;
                    b.p;
                } finally {
                    return b;
                }
            } catch (e) {}
        }());
    }
    expect_stdout: "PASS"
}

operator_in: {
    options = {
        collapse_vars: true,
    }
    input: {
        function log(msg) {
            console.log(msg);
        }
        var a = "FAIL";
        try {
            a = "PASS";
            0 in null;
            log("FAIL", a);
        } catch (e) {}
        log(a);
    }
    expect: {
        function log(msg) {
            console.log(msg);
        }
        var a = "FAIL";
        try {
            a = "PASS";
            0 in null;
            log("FAIL", a);
        } catch (e) {}
        log(a);
    }
    expect_stdout: "PASS"
}

issue_3971: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = 0 == typeof f, b = 0;
        {
            var a = void (a++ + (b |= a));
        }
        console.log(b);
    }
    expect: {
        var a = 0 == typeof f, b = 0;
        var a = void (b |= ++a);
        console.log(b);
    }
    expect_stdout: "1"
}

issue_3976: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            console.log("FAIL");
        }
        (function(a) {
            function g() {
                if ((a = 0) || f(0)) {
                    f();
                } else {
                    f();
                }
                if (h(a = 0));
            }
            function h() {
                g();
            }
        })();
        console.log("PASS");
    }
    expect: {
        function f() {
            console.log("FAIL");
        }
        void 0;
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4012: {
    options = {
        collapse_vars: true,
        dead_code: true,
        evaluate: true,
    }
    input: {
        (function(a) {
            try {
                throw 2;
            } catch (b) {
                a = "PASS";
                if (--b)
                    return;
                if (3);
            } finally {
                console.log(a);
            }
        })();
    }
    expect: {
        (function(a) {
            try {
                throw 2;
            } catch (b) {
                a = "PASS";
                if (--b)
                    return;
                if (3);
            } finally {
                console.log(a);
            }
        })();
    }
    expect_stdout: "PASS"
}

global_assign: {
    options = {
        collapse_vars: true,
    }
    input: {
        this.A = "FAIL";
        A = "PASS";
        B = "FAIL";
        console.log(A);
    }
    expect: {
        this.A = "FAIL";
        A = "PASS";
        B = "FAIL";
        console.log(A);
    }
    expect_stdout: "PASS"
}

global_read: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0;
        a = this.A;
        A = 1;
        a ? console.log("FAIL") : console.log("PASS");
    }
    expect: {
        var a = 0;
        a = this.A;
        A = 1;
        a ? console.log("FAIL") : console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4038: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0;
        a = this;
        a = a.A;
        A = 1;
        a ? console.log("FAIL") : console.log("PASS");
    }
    expect: {
        var a = 0;
        a = (a = this).A;
        A = 1;
        a ? console.log("FAIL") : console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4040: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var a = console.log("PASS") && a.p;
        delete NaN;
    }
    expect: {
        var a = console.log("PASS") && a.p;
        delete NaN;
    }
    expect_stdout: "PASS"
}

issue_4047_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var b = 1;
        console.log(+function(a) {
            b = a;
            (a >>= 0) && console.log("PASS");
        }(--b + (0 !== typeof A)));
    }
    expect: {
        var b = 1;
        var a;
        console.log((a = --b + (0 !== typeof A), +void ((a >>= 0) && console.log("PASS"))));
    }
    expect_stdout: [
        "PASS",
        "NaN",
    ]
}

issue_4047_2: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        sequences: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var b = 1;
        console.log(+function(a) {
            b = a;
            (a >>= 0) && console.log("PASS");
        }(--b + (0 !== typeof A)));
    }
    expect: {
        var a;
        console.log((a = +(0 !== typeof A), +void ((a >>= 0) && console.log("PASS"))));
    }
    expect_stdout: [
        "PASS",
        "NaN",
    ]
}

issue_4051: {
    options = {
        collapse_vars: true,
    }
    input: {
        try {
            var a = (b = b.p, "FAIL"), b = b;
        } catch (e) {}
        console.log(a);
    }
    expect: {
        try {
            var a = (b = b.p, "FAIL"), b = b;
        } catch (e) {}
        console.log(a);
    }
    expect_stdout: "undefined"
}

issue_4070: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
    }
    input: {
        console.log(function f() {
            function g() {}
            g.p++;
            return f.p = g.p;
        }());
    }
    expect: {
        console.log(function f() {
            function g() {}
            return f.p = ++g.p;
        }());
    }
    expect_stdout: "NaN"
}

issue_4242: {
    options = {
        collapse_vars: true,
        conditionals: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            if (console)
                var a = function(){}, b = (!1 === console || a)();
        }());
    }
    expect: {
        console.log(function() {
            console && (!1 === console || function(){})();
        }());
    }
    expect_stdout: "undefined"
}

issue_4248: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0;
        try {
            a = 1;
            b[1];
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = 0;
        try {
            a = 1;
            b[1];
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "1"
}

issue_4430_1: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
    }
    input: {
        function f(a) {
            switch (a = 1, arguments[0]) {
              case 1:
                return "PASS";
              case 2:
                return "FAIL";
            }
        }
        console.log(f(2));
    }
    expect: {
        function f(a) {
            switch (a = 1, arguments[0]) {
              case 1:
                return "PASS";
              case 2:
                return "FAIL";
            }
        }
        console.log(f(2));
    }
    expect_stdout: "PASS"
}

issue_4430_2: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
    }
    input: {
        function f(a) {
            switch (a = 0, arguments[0]) {
              case 0:
                return "PASS";
              case 1:
                return "FAIL";
            }
        }
        console.log(f(1));
    }
    expect: {
        function f(a) {
            switch (arguments[a = 0]) {
              case 0:
                return "PASS";
              case 1:
                return "FAIL";
            }
        }
        console.log(f(1));
    }
    expect_stdout: "PASS"
}

collapse_and_assign: {
    options = {
        collapse_vars: true,
    }
    input: {
        var log = console.log;
        var a = {
            p: "PASS",
        };
        console && (a = a.p);
        log(a);
    }
    expect: {
        var log = console.log;
        var a = {
            p: "PASS",
        };
        log(a = console ? a.p : a);
    }
    expect_stdout: "PASS"
}

collapse_and_assign_property: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function f() {
            f && (f.p = "PASS");
            return f.p;
        }());
    }
    expect: {
        console.log(function f() {
            return f.p = f ? "PASS" : f.p;
        }());
    }
    expect_stdout: "PASS"
}

collapse_or_assign: {
    options = {
        collapse_vars: true,
    }
    input: {
        var log = console.log;
        var a = {
            p: "PASS",
        };
        a.q || (a = a.p);
        log(a);
    }
    expect: {
        var log = console.log;
        var a = {
            p: "PASS",
        };
        log(a = a.q ? a: a.p);
    }
    expect_stdout: "PASS"
}

issue_4586_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 42;
        (function f(b) {
            var b = a;
            if (b === arguments[0])
                console.log("PASS");
        })(console);
    }
    expect: {
        var a = 42;
        (function f(b) {
            var b = a;
            if (b === arguments[0])
                console.log("PASS");
        })(console);
    }
    expect_stdout: "PASS"
}

issue_4586_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 42;
        (function f(b) {
            b = a;
            if (b === arguments[0])
                console.log("PASS");
        })(console);
    }
    expect: {
        var a = 42;
        (function f(b) {
            if ((b = a) === arguments[0])
                console.log("PASS");
        })(console);
    }
    expect_stdout: "PASS"
}

issue_4732_1: {
    options = {
        booleans: true,
        collapse_vars: true,
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = 0;
        (function(b) {
            var b = a++;
            var c = b ? b && console.log("PASS") : 0;
        })(a++);
    }
    expect: {
        var a = 0;
        (function(b) {
            (b = a++) && console.log("PASS");
        })(a++);
    }
    expect_stdout: "PASS"
}

issue_4732_2: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = 0;
        (function(b) {
            var b = a++;
            var c = b ? b && console.log("PASS") : 0;
        })(a++);
    }
    expect: {
        var a = 0;
        (function(b) {
            (b = a++) && b && console.log("PASS");
        })(a++);
    }
    expect_stdout: "PASS"
}

dot_in_try: {
    options = {
        collapse_vars: true,
    }
    input: {
        var o, a = 6, b = 7, c;
        try {
            c = a * b;
            o.p(c);
        } catch (e) {
            console.log(c);
        }
    }
    expect: {
        var o, a = 6, b = 7, c;
        try {
            c = a * b;
            o.p(c);
        } catch (e) {
            console.log(c);
        }
    }
    expect_stdout: "42"
}

dot_non_local: {
    options = {
        collapse_vars: true,
    }
    input: {
        var o, a = 6, b = 7, c;
        function f() {
            c = a * b;
            o.p(c);
        }
        try {
            f();
        } catch (e) {
            console.log(c);
        }
    }
    expect: {
        var o, a = 6, b = 7, c;
        function f() {
            c = a * b;
            o.p(c);
        }
        try {
            f();
        } catch (e) {
            console.log(c);
        }
    }
    expect_stdout: "42"
}

issue_4806: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a, o = {
            f: function() {
                console.log(this === o ? "FAIL" : "PASS");
            },
        };
        (a = 42, o.f)(42);
    }
    expect: {
        var a, o = {
            f: function() {
                console.log(this === o ? "FAIL" : "PASS");
            },
        };
        (0, o.f)(a = 42);
    }
    expect_stdout: "PASS"
}

issue_4852: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        var a = "PASS";
        (function(b) {
            switch (b = a) {
              case 42:
                try {
                    console;
                } catch (b) {
                    b.p;
                }
              case console.log(b):
            }
        })("FAIL");
    }
    expect: {
        var a = "PASS";
        (function(b) {
            switch (a) {
              case 42:
                try {
                    console;
                } catch (b) {
                    b.p;
                }
              case console.log(a):
            }
        })("FAIL");
    }
    expect_stdout: "PASS"
}

issue_4865: {
    options = {
        collapse_vars: true,
    }
    input: {
        var NaN;
        var a = NaN = "PASS";
        console.log(a, NaN);
    }
    expect: {
        var NaN;
        var a = NaN = "PASS";
        console.log(a, NaN);
    }
    expect_stdout: true
}

issue_4868: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a;
        (function(b) {
            console.log(b[0]);
        })(a = [ "PASS" ], a = [ "FAIL" ]);
    }
    expect: {
        var a;
        (function(b) {
            console.log(b[0]);
        })(a = [ "PASS" ], a = [ "FAIL" ]);
    }
    expect_stdout: "PASS"
}

issue_4874: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        a = null;
        (function(b) {
            for (var c in b = b && b[console.log("PASS")])
                console;
        })(a = 42);
    }
    expect: {
        null;
        (function(b) {
            for (var c in 42, 42[console.log("PASS")])
                console;
        })();
    }
    expect_stdout: "PASS"
}

issue_4891: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0, b;
        a++;
        console.log(b = a, b);
        b--;
        a.a += 0;
        console.log(b);
    }
    expect: {
        var a = 0, b;
        a++;
        console.log(a, b = a);
        b--;
        a.a += 0;
        console.log(b);
    }
    expect_stdout: [
        "1 1",
        "0",
    ]
}

issue_4895: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var a, b;
        (function f() {
            a = 42;
        })();
        console.log((b = a) || b, b += 0);
    }
    expect: {
        var a, b;
        (function f() {
            a = 42;
        })();
        console.log((b = a) || b, b += 0);
    }
    expect_stdout: "42 42"
}

issue_4908: {
    options = {
        collapse_vars: true,
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        var b;
        console || a++;
        var c = d = a, d = [ c && c, d += 42 ];
        console.log(d[1]);
    }
    expect: {
        var a = 0, b, c = (console || a++, a), d = [ (d = a) && d, d += 42 ];
        console.log(d[1]);
    }
    expect_stdout: "42"
}

issue_4910: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = "foo", b;
        var c = b = a;
        1 && c[a = "bar"];
        console.log(a, b);
    }
    expect: {
        var a = "foo", b;
        var c = b = a;
        1 && b[a = "bar"];
        console.log(a, b);
    }
    expect_stdout: "bar foo"
}

issue_4914: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
    }
    input: {
        console.log(typeof function f() {
            f.__proto__ = 42;
            return f.__proto__;
        }());
    }
    expect: {
        console.log(typeof function f() {
            f.__proto__ = 42;
            return f.__proto__;
        }());
    }
    expect_stdout: "function"
}

issue_4918: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        ({
            get 42() {
                console.log(a);
            }
        }[a = "PASS", 42] += "PASS");
    }
    expect: {
        var a = "FAIL";
        ({
            get 42() {
                console.log(a);
            }
        }[a = "PASS", 42] += "PASS");
    }
    expect_stdout: "PASS"
}

issue_4920_1: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var a = "PASS", b;
        ({
            get PASS() {
                a = "FAIL";
            },
        })[b = a];
        console.log(b);
    }
    expect: {
        var a = "PASS", b;
        ({
            get PASS() {
                a = "FAIL";
            },
        })[b = a];
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_4920_2: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var o = {
            get PASS() {
                a = "FAIL";
            },
        };
        var a = "PASS", b;
        o[b = a];
        console.log(b);
    }
    expect: {
        var o;
        var a = "PASS", b;
        ({
            get PASS() {
                a = "FAIL";
            },
        })[b = a];
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_4920_3: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var log = console.log;
        var o = {
            get PASS() {
                a = "FAIL";
            },
        };
        var a = "PASS", b;
        o[b = a];
        log(b);
    }
    expect: {
        var log = console.log;
        var o;
        var a = "PASS", b;
        ({
            get PASS() {
                a = "FAIL";
            },
        })[b = a];
        log(b);
    }
    expect_stdout: "PASS"
}

issue_4920_4: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var log = console.log;
        var o = {
            get [(a = "FAIL 1", "PASS")]() {
                a = "FAIL 2";
            },
        };
        var a = "PASS", b;
        o[b = a];
        log(b);
    }
    expect: {
        var log = console.log;
        var o = {
            get [(a = "FAIL 1", "PASS")]() {
                a = "FAIL 2";
            },
        };
        var a = "PASS", b;
        o[b = a];
        log(b);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4935: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        var b;
        var c = b = a;
        console || c(a++);
        --b;
        console.log(a, b);
    }
    expect: {
        var a = 1;
        var b;
        var c = b = a;
        console || a(a++);
        --b;
        console.log(a, b);
    }
    expect_stdout: "1 0"
}

inline_throw: {
    options = {
        collapse_vars: true,
        inline: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        try {
            (function() {
                return function(a) {
                    return function(b) {
                        throw b;
                    }(a);
                };
            })()("PASS");
        } catch (e) {
            console.log(e);
        }
    }
    expect: {
        try {
            (function(a) {
                throw a;
                return;
            })("PASS");
        } catch (e) {
            console.log(e);
        }
    }
    expect_stdout: "PASS"
}

issue_4977_1: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        var a = "FAIL";
        var o = {
            get p() {
                return a;
            }
        };
        a = "PASS";
        console.log(o.p, a);
    }
    expect: {
        var a = "FAIL";
        var o = {
            get p() {
                return a;
            }
        };
        a = "PASS";
        console.log(o.p, a);
    }
    expect_stdout: "PASS PASS"
}

issue_4977_2: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        var a, o = {
            get p() {
                return a = "PASS";
            },
        };
        if (console) {
            var a = "FAIL";
            console.log(o.p, a);
        }
    }
    expect: {
        var a, o = {
            get p() {
                return a = "PASS";
            },
        };
        if (console) {
            var a = "FAIL";
            console.log(o.p, a);
        }
    }
    expect_stdout: "PASS PASS"
}

issue_5112_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function(a) {
            try {
                try {
                    if (console + (a = "PASS", ""))
                        return "FAIL 1";
                    a.p;
                } catch (e) {}
            } finally {
                return a;
            }
        }("FAIL 2"));
    }
    expect: {
        console.log(function(a) {
            try {
                try {
                    if (console + (a = "PASS", ""))
                        return "FAIL 1";
                    a.p;
                } catch (e) {}
            } finally {
                return a;
            }
        }("FAIL 2"));
    }
    expect_stdout: "PASS"
}

issue_5112_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function(a) {
            try {
                return function() {
                    try {
                        if (console + (a = "PASS", ""))
                            return "FAIL 1";
                        a.p;
                    } catch (e) {}
                }();
            } finally {
                return a;
            }
        }("FAIL 2"));
    }
    expect: {
        console.log(function(a) {
            try {
                return function() {
                    try {
                        if (console + (a = "PASS", ""))
                            return "FAIL 1";
                        a.p;
                    } catch (e) {}
                }();
            } finally {
                return a;
            }
        }("FAIL 2"));
    }
    expect_stdout: "PASS"
}

issue_5182: {
    options = {
        arrows: true,
        collapse_vars: true,
        evaluate: true,
        hoist_props: true,
        inline: true,
        merge_vars: true,
        passes: 4,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var con = console;
        global.log = con.log;
        var jump = function(x) {
            console.log("JUMP:", x * 10);
            return x + x;
        };
        var jump2 = jump;
        var run = function(x) {
            console.log("RUN:", x * -10);
            return x * x;
        };
        var run2 = run;
        var bar = (x, y) => {
            console.log("BAR:", x + y);
            return x - y;
        };
        var bar2 = bar;
        var obj = {
            foo: bar2,
            go: run2,
            not_used: jump2,
        };
        console.log(obj.foo(1, 2), global.log("PASS"));
    }
    expect: {
        var con = console;
        global.log = con.log,
        console.log((console.log("BAR:", 3), -1), global.log("PASS"));
    }
    expect_stdout: [
        "BAR: 3",
        "PASS",
        "-1 undefined",
    ]
    node_version: ">=4"
}

issue_5273: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        toplevel: true,
    }
    input: {
        var a = "10", b = 1;
        function f(c, d) {
            return d;
        }
        f((b += a, b *= a), f);
        console.log(b);
    }
    expect: {
        var a = "10", b = 1;
        function f(c, d) {
            return d;
        }
        b = 1100,
        f,
        console.log(b);
    }
    expect_stdout: "1100"
}

issue_5276: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = A = "PASS";
        a.p += null;
        a.p -= 42;
        console.log(a);
    }
    expect: {
        var a = A = "PASS";
        a.p += null;
        a.p -= 42;
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_5277: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = function() {
                a += null;
                a -= 42;
            };
        }());
    }
    expect: {
        console.log(function() {}());
    }
    expect_stdout: "undefined"
}

issue_5309_1: {
    options = {
        collapse_vars: true,
        conditionals: true,
        toplevel: true,
    }
    input: {
        if (console)
            var a = (console.log("PASS"), b), b = a;
        else
            console.log("FAIL");
    }
    expect: {
        var a, b;
        console ? (console.log("PASS"), b = b) : console.log("FAIL");
    }
    expect_stdout: "PASS"
}

issue_5309_2: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var a, b;
        console ? (a = (console.log("PASS"), b), b = a) : console.log("FAIL");
    }
    expect: {
        var a, b;
        console ? (console.log("PASS"), b = b) : console.log("FAIL");
    }
    expect_stdout: "PASS"
}

issue_5394: {
    options = {
        collapse_vars: true,
        evaluate: true,
    }
    input: {
        try {
            throw A.p = (console.log("FAIL"), []), !1;
        } catch (e) {
            console.log(typeof e);
        }
    }
    expect: {
        try {
            throw !(A.p = (console.log("FAIL"), []));
        } catch (e) {
            console.log(typeof e);
        }
    }
    expect_stdout: "object"
}

issue_5396: {
    options = {
        collapse_vars: true,
        merge_vars: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a, b;
        function f() {}
        b = 0;
        new function g(c) {
            var d = a && g(e), e = ++d, i = [ 42 ];
            for (var j in i)
                console.log("PASS"),
                i;
        }();
    }
    expect: {
        var a, b;
        function f() {}
        b = 0;
        (function g(c) {
            a && g();
            for (var j in [ 42 ])
                console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

issue_5568: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        A = "FAIL";
        var a = (A = "PASS", !1);
        for (var b in a);
        console.log(A);
    }
    expect: {
        A = "FAIL";
        for (var b in !(A = "PASS"));
        console.log(A);
    }
    expect_stdout: "PASS"
}

issue_5638_1: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a;
        console;
        a = [ 42 ];
        console || FAIL(a);
        console.log(a++);
    }
    expect: {
        var a;
        console;
        a = [ 42 ];
        console || FAIL(a);
        console.log(a++);
    }
    expect_stdout: "42"
}

issue_5638_2: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a;
        console;
        a = [ 6 ];
        console || FAIL(a);
        console.log(a *= 7);
    }
    expect: {
        var a;
        console;
        a = [ 6 ];
        console || FAIL(a);
        console.log(a *= 7);
    }
    expect_stdout: "42"
}

issue_5638_3: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var log = console.log;
        var a = { foo: 42 }, b;
        for (var k in a) {
            b = a[k];
            log(k || b, b++);
        }
    }
    expect: {
        var log = console.log;
        var a = { foo: 42 }, b;
        for (var k in a) {
            b = a[k];
            log(k || b, b++);
        }
    }
    expect_stdout: "foo 42"
}

issue_5638_4: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var log = console.log;
        var a = { foo: 6 }, b;
        for (var k in a) {
            b = a[k];
            log(k || b, b *= 7);
        }
    }
    expect: {
        var log = console.log;
        var a = { foo: 6 }, b;
        for (var k in a) {
            b = a[k];
            log(k || b, b *= 7);
        }
    }
    expect_stdout: "foo 42"
}

issue_5643: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 3, b;
        a *= 7;
        b = !!this;
        console || console.log(b);
        console.log(a * ++b);
    }
    expect: {
        var a = 3, b;
        a *= 7;
        b = !!this;
        console || console.log(b);
        console.log(a * ++b);
    }
    expect_stdout: "42"
}

issue_5719: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 42, b;
        switch (b = a) {
          case a:
          case b:
          case a++:
        }
        console.log(a === b++ ? "PASS" : "FAIL");
    }
    expect: {
        var a = 42, b;
        switch (b = a) {
          case a:
          case b:
          case a++:
        }
        console.log(a === b++ ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

issue_5779: {
    options = {
        collapse_vars: true,
        evaluate: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = A = "foo";
        a.p = 42;
        if (a && !a.p)
            console.log("PASS");
    }
    expect: {
        var a = A = "foo";
        a.p = 42;
        if (a, !a.p)
            console.log("PASS");
    }
    expect_stdout: "PASS"
}
