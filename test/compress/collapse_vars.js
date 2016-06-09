collapse_vars_side_effects_1: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
            var log = console.log.bind(console),
                i = 10,
                x = i += 2,
                y = i += 3;
            log(x, i += 4, y, i);
        }
    }
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        comparisons:true, evaluate:true, booleans:false, loops:false, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
    }
    input: {
        function f1(y) {
            // The constant do-while condition `c` will be replaced.
            var c = 9;
            do { } while (c === 77);
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
            do ; while (false);
        }
        function f2(y) {
            var c = 5 - y;
            do ; while (c);
        }
        function f3(y) {
            function fn(n) { console.log(n); }
            var a = 2;
            do {
                fn(a = 7);
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
        function f5(x) { var w = e1(), v = e2(), c = v = --x; return (w = x) - c; }
        function f6(x) { var w = e1(), v = e2(); return (v = --x) - (w = x); }
        function f7(x) { var w = e1(), v = e2(), c = v - x; return (w = x) - c; }
        function f8(x) { var w = e1(), v = e2(); return (w = x) - (v - x); }
        function f9(x) { var w = e1(); return e2() - x - (w = x); }

    }
}

collapse_vars_misc1: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
            return -3
        }
        function f2(x) {
            return x
        }
        (function(x){
             var a = "GOOD" + x, e = "BAD", e = a;
             console.log(e + "!");
        })("!"),
        (function(x){
            var a = "GOOD" + x, e = "BAD" + x, e = a;
            console.log(e + "!");
        })("!");
    }
}

collapse_vars_closures: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
            delete o[p];
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
            var z = x + y;
            return {
                get b() { return 7; },
                r: z
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
}

collapse_vars_constants: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
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
            while (result = rx.exec('acdabcdeabbb'))
                console.log(result[0]);
        })();
    }
}
