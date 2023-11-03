if_return_1: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x) {
            if (x) {
                return true;
            }
        }
    }
    expect: {
        function f(x){if(x)return!0}
    }
}

if_return_2: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x, y) {
            if (x)
                return 3;
            if (y)
                return c();
        }
    }
    expect: {
        function f(x,y){return x?3:y?c():void 0}
    }
}

if_return_3: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x) {
            a();
            if (x) {
                b();
                return false;
            }
        }
    }
    expect: {
        function f(x){if(a(),x)return b(),!1}
    }
}

if_return_4: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x, y) {
            a();
            if (x) return 3;
            b();
            if (y) return c();
        }
    }
    expect: {
        function f(x,y){return a(),x?3:(b(),y?c():void 0)}
    }
}

if_return_5: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f() {
            if (x)
                return;
            return 7;
            if (y)
                return j;
        }
    }
    expect: {
        function f(){if(!x)return 7}
    }
}

if_return_6: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x) {
          return x ? true : void 0;
          return y;
        }
    }
    expect: {
        // suboptimal
        function f(x){return!!x||void 0}
    }
}

if_return_7: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x) {
            if (x) {
                return true;
            }
            foo();
            bar();
        }
    }
    expect: {
        function f(x){if(x)return!0;foo(),bar()}
    }
}

if_return_8: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function f(e) {
            if (2 == e) return foo();
            if (3 == e) return bar();
            if (4 == e) return baz();
            fail(e);
        }

        function g(e) {
            if (a(e)) return foo();
            if (b(e)) return bar();
            if (c(e)) return baz();
            fail(e);
        }

        function h(e) {
            if (a(e)) return foo();
            else if (b(e)) return bar();
            else if (c(e)) return baz();
            else fail(e);
        }

        function i(e) {
            if (a(e)) return foo();
            else if (b(e)) return bar();
            else if (c(e)) return baz();
            fail(e);
        }
    }
    expect: {
        function f(e){return 2==e?foo():3==e?bar():4==e?baz():void fail(e)}
        function g(e){return a(e)?foo():b(e)?bar():c(e)?baz():void fail(e)}
        function h(e){return a(e)?foo():b(e)?bar():c(e)?baz():void fail(e)}
        function i(e){return a(e)?foo():b(e)?bar():c(e)?baz():void fail(e)}
    }
}

if_return_9: {
    options = {
        booleans: true,
        conditionals: true,
        if_return: true,
        sequences: true,
    }
    input: {
        !function() {
            if (console.log("foo"))
                return 42;
            var a = console.log("bar");
        }();
    }
    expect: {
        !function() {
            var a;
            return console.log("foo") || (a = console.log("bar"), void 0);
        }();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

if_return_10: {
    options = {
        booleans: true,
        conditionals: true,
        if_return: true,
        sequences: true,
    }
    input: {
        !function() {
            if (console.log("foo"))
                return 42;
            if (console.log("bar"))
                return null;
            var a = console.log("baz");
        }();
    }
    expect: {
        !function() {
            var a;
            return console.log("foo") || !console.log("bar") && (a = console.log("baz"), void 0);
        }();
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
}

if_return_cond_void_1: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a) {
            if (a)
                return console.log("foo") ? console.log("bar") : void 0;
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            return a && console.log("foo") ? console.log("bar") : void 0;
        }
        f();
        f(42);
    }
    expect_stdout: "foo"
}

if_return_cond_void_2: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a) {
            if (a)
                return console.log("foo") ? void 0 : console.log("bar");
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            return !a || console.log("foo") ? void 0 : console.log("bar");
        }
        f();
        f(42);
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

if_return_cond_void_3: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            if (a)
                return console.log("foo") ? void console.log("bar") : void console.log("baz");
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            if (a)
                return console.log("foo") ? void console.log("bar") : void console.log("baz");
        }
        f();
        f(42);
    }
    expect_stdout: [
        "foo",
        "baz",
    ]
}

issue_1089: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function x() {
            var f = document.getElementById("fname");
            if (f.files[0].size > 12345) {
                alert("alert");
                f.focus();
                return false;
            }
        }
    }
    expect: {
        function x() {
            var f = document.getElementById("fname");
            if (12345 < f.files[0].size)
                return alert("alert"), f.focus(), !1;
        }
    }
}

issue_1437: {
    options = {
        conditionals: false,
        if_return: true,
        sequences: true,
    }
    input: {
        function x() {
            if (a())
                return b();
            if (c())
                return d();
            else
                e();
            f();
        }
    }
    expect: {
        function x() {
            if (a())
                return b();
            if (c())
                return d();
            else
                e()
            f();
        }
    }
}

issue_1437_conditionals: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
    }
    input: {
        function x() {
            if (a())
                return b();
            if (c())
                return d();
            else
                e();
            f();
        }
    }
    expect: {
        function x() {
            return a() ? b() : c() ? d() : (e(), f(), void 0);
        }
    }
}

issue_512: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function a() {
            if (b()) {
                c();
                return;
            }
            throw e;
        }
    }
    expect: {
        function a() {
            if (!b()) throw e;
            c();
        }
    }
}

if_var_return_1: {
    options = {
        conditionals: true,
        if_return: true,
        join_vars: true,
        sequences: true,
    }
    input: {
        function f() {
            var a;
            return;
            var b;
        }
        function g() {
            var a;
            if (u()) {
                var b;
                return v();
                var c;
            }
            var d;
            if (w()) {
                var e;
                return x();
                var f;
            } else {
                var g;
                y();
                var h;
            }
            var i;
            z();
            var j;
        }
    }
    expect: {
        function f() {
            var a, b;
        }
        function g() {
            var a, b, c, d, e, f, g, h, i, j;
            return u() ? v() : w() ? x() : (y(), z(), void 0);
        }
    }
}

if_var_return_2: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
    }
    input: {
        (function() {
            var a = w();
            if (x())
                return y();
            z();
        })();
    }
    expect: {
        (function() {
            var a = w();
            return x() ? y() : (z(), void 0);
        })();
    }
}

if_var_return_3: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
    }
    input: {
        f(function() {
            var a = w();
            if (x())
                return y(a);
            z();
        });
    }
    expect: {
        f(function() {
            var a = w();
            if (x())
                return y(a);
            z();
        });
    }
}

if_var_return_4: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
    }
    input: {
        function f() {
            if (u())
                return v();
            var a = w();
            if (x())
                return y(a);
            z();
        }
    }
    expect: {
        function f() {
            var a;
            return u() ? v() : (a = w(), x() ? y(a) : (z(), void 0));
        }
    }
}

if_var_return_5: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f() {
            if (w())
                return x();
            var a = y();
            return z(a);
        }
    }
    expect: {
        function f() {
            var a;
            return w() ? x() : (a = y(), z(a));
        }
    }
}

if_defns_return_1: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function f() {
            if (u())
                return v();
            function g() {}
            if (w())
                return x(g);
            var a = y();
            z(a);
        }
    }
    expect: {
        function f() {
            var a;
            return u() ? v() : w() ? x(g) : (a = y(), void z(a));
            function g() {}
        }
    }
}

if_defns_return_2: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a, b, c) {
            if (v())
                return a();
            if (w())
                return b();
            if (x()) {
                var d = c();
                return y(d);
            }
            return z();
        }
    }
    expect: {
        function f(a, b, c) {
            var d;
            return v() ? a() : w() ? b() : x() ? (d = c(), y(d)) : z();
        }
    }
}

if_if_return_return: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a, b) {
            if (a) {
                if (b)
                    return b;
                return;
            }
            g();
        }
    }
    expect: {
        function f(a, b) {
            if (a)
                return b || void 0;
            g();
        }
    }
}

if_body_return_1: {
    options = {
        if_return: true,
    }
    input: {
        var c = "PASS";
        function f(a, b) {
            if (a) {
                if (b) throw new Error(c);
                return 42;
            }
            return true;
        }
        console.log(f(0, 0));
        console.log(f(0, 1));
        console.log(f(1, 0));
        try {
            f(1, 1);
            console.log("FAIL");
        } catch (e) {
            console.log(e.message);
        }
    }
    expect: {
        var c = "PASS";
        function f(a, b) {
            if (a) {
                if (b) throw new Error(c);
                return 42;
            }
            return true;
        }
        console.log(f(0, 0));
        console.log(f(0, 1));
        console.log(f(1, 0));
        try {
            f(1, 1);
            console.log("FAIL");
        } catch (e) {
            console.log(e.message);
        }
    }
    expect_stdout: [
        "true",
        "true",
        "42",
        "PASS",
    ]
}

if_body_return_2: {
    options = {
        if_return: true,
    }
    input: {
        var c = "PASS";
        function f(a, b) {
            if (0 + a) {
                if (b) throw new Error(c);
                return 42;
            }
            return true;
        }
        console.log(f(0, 0));
        console.log(f(0, 1));
        console.log(f(1, 0));
        try {
            f(1, 1);
            console.log("FAIL");
        } catch (e) {
            console.log(e.message);
        }
    }
    expect: {
        var c = "PASS";
        function f(a, b) {
            if (0 + a) {
                if (b) throw new Error(c);
                return 42;
            }
            return true;
        }
        console.log(f(0, 0));
        console.log(f(0, 1));
        console.log(f(1, 0));
        try {
            f(1, 1);
            console.log("FAIL");
        } catch (e) {
            console.log(e.message);
        }
    }
    expect_stdout: [
        "true",
        "true",
        "42",
        "PASS",
    ]
}

if_body_return_3: {
    options = {
        if_return: true,
    }
    input: {
        var c = "PASS";
        function f(a, b) {
            if (1 == a) {
                if (b) throw new Error(c);
                return 42;
            }
            return true;
        }
        console.log(f(0, 0));
        console.log(f(0, 1));
        console.log(f(1, 0));
        try {
            f(1, 1);
            console.log("FAIL");
        } catch (e) {
            console.log(e.message);
        }
    }
    expect: {
        var c = "PASS";
        function f(a, b) {
            if (1 != a) return true;
            if (b) throw new Error(c);
            return 42;
        }
        console.log(f(0, 0));
        console.log(f(0, 1));
        console.log(f(1, 0));
        try {
            f(1, 1);
            console.log("FAIL");
        } catch (e) {
            console.log(e.message);
        }
    }
    expect_stdout: [
        "true",
        "true",
        "42",
        "PASS",
    ]
}

issue_3600_1: {
    options = {
        if_return: true,
        inline: 3,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        (function() {
            if ([ ][c++]); else return;
            return void function() {
                var b = --b, a = c = 42;
                return c;
            }();
        })();
        console.log(c);
    }
    expect: {
        var c = 0;
        (function() {
            if ([][c++]) b = --b, c = 42;
            var b;
        })();
        console.log(c);
    }
    expect_stdout: "1"
}

issue_3600_2: {
    options = {
        if_return: true,
        inline: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        (function() {
            if ([ ][c++]); else return;
            return void function() {
                var b = --b, a = c = 42;
                return c;
            }();
        })();
        console.log(c);
    }
    expect: {
        var c = 0;
        (function() {
            if ([][c++])
                b = --b,
                c = 42;
            var b;
        })();
        console.log(c);
    }
    expect_stdout: "1"
}

iife_if_return_simple: {
    options = {
        conditionals: true,
        if_return: true,
        inline: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        (function() {
            if (console)
                return console.log("PASS");
            console.log("FAIL");
        })();
    }
    expect: {
        console ? console.log("PASS") : console.log("FAIL");
    }
    expect_stdout: "PASS"
}

nested_if_break: {
    options = {
        conditionals: true,
        if_return: true,
        side_effects: true,
    }
    input: {
        for (var i = 0; i < 3; i++)
            L1: if ("number" == typeof i) {
                if (0 === i) break L1;
                console.log(i);
            }
    }
    expect: {
        for (var i = 0; i < 3; i++)
            L1: "number" == typeof i && 0 !== i && console.log(i);
    }
    expect_stdout: [
        "1",
        "2",
    ]
}

nested_if_continue: {
    options = {
        conditionals: true,
        if_return: true,
        join_vars: true,
        loops: true,
    }
    input: {
        function f(n) {
            var i = 0;
            do {
                if ("number" == typeof n) {
                    if (0 === n) {
                        console.log("even", i);
                        continue;
                    }
                    if (1 === n) {
                        console.log("odd", i);
                        continue;
                    }
                    i++;
                }
            } while (0 <= (n -= 2));
        }
        f(37);
        f(42);
    }
    expect: {
        function f(n) {
            for (var i = 0;
                "number" == typeof n
                    && (0 === n
                        ? console.log("even", i)
                        : 1 === n
                        ? console.log("odd", i)
                        : i++),
                0 <= (n -= 2););
        }
        f(37);
        f(42);
    }
    expect_stdout: [
        "odd 18",
        "even 21",
    ]
}

nested_if_return: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f() {
            if (A) {
                if (B)
                    return B;
                if (C)
                    return D;
                if (E)
                    return F;
                if (G)
                    return H;
                if (I) {
                    if (J)
                        return K;
                    return;
                }
                if (L) {
                    if (M)
                        return;
                    return N;
                }
            }
        }
    }
    expect: {
        function f() {
            if (A)
                return B || (C ? D : E ? F : G ? H : I ? J ? K : void 0 : L && !M ? N : void 0);
        }
    }
}

issue_866_1: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: false,
    };
    input: {
        function f(a) {
            if (a)
                return "";
            console.log(a);
        }
    }
    expect: {
        function f(a) {
            if (a)
                return "";
            console.log(a);
        }
    }
}

issue_866_2: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
    }
    input: {
        (function() {
            if (a)
                if (b)
                    c;
                else
                    return d;
        })();
    }
    expect: {
        (function() {
            if (a) {
                if (!b)
                    return d;
                c;
            }
        })();
    }
}

identical_returns_1: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        console.log(function() {
            if (console.log("foo"))
                return 42;
            else
                while (console.log("bar"));
            return 42;
        }());
    }
    expect: {
        console.log(function() {
            if (!console.log("foo"))
                while (console.log("bar"));
            return 42;
        }());
    }
    expect_stdout: [
        "foo",
        "bar",
        "42",
    ]
}

identical_returns_2: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        console.log(function() {
            if (console.log("foo"))
                while (console.log("FAIL"));
            else
                return "bar";
            return "bar";
        }());
    }
    expect: {
        console.log(function() {
            if (console.log("foo"))
                while (console.log("FAIL"));
            return "bar";
        }());
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

identical_returns_3: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            if (a)
                return 42;
            if (a)
                return;
            return 42;
        }
        if (f(console))
            console.log("PASS");
    }
    expect: {
        function f(a) {
            if (a)
                return 42;
            if (a)
                ;
            else
                return 42;
        }
        if (f(console))
            console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4374: {
    options = {
        booleans: true,
        conditionals: true,
        if_return: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            console.log(f(console));
            function f(a) {
                if (console) return 0;
                if (a) return 1;
                return 0;
            }
        })();
    }
    expect: {
        (function() {
            console.log(function(a) {
                return !console && a ? 1 : 0;
            }(console));
        })();
    }
    expect_stdout: "0"
}

issue_5521: {
    options = {
        if_return: true,
    }
    input: {
        console.log(function() {
            if (console)
                try {
                    return "FAIL";
                } finally {
                    return;
                }
        }());
    }
    expect: {
        console.log(function() {
            if (console)
                try {
                    return "FAIL";
                } finally {
                    return;
                }
        }());
    }
    expect_stdout: "undefined"
}

issue_5523: {
    options = {
        if_return: true,
    }
    input: {
        console.log(function() {
            if (console)
                try {
                    FAIL;
                } finally {
                    return;
                }
        }());
    }
    expect: {
        console.log(function() {
            if (console)
                try {
                    FAIL;
                } finally {
                    return;
                }
        }());
    }
    expect_stdout: "undefined"
}

drop_catch: {
    options = {
        if_return: true,
    }
    input: {
        function f() {
            try {
                throw 42;
            } catch (e) {
                return console.log("foo"), "bar";
            } finally {
                console.log("baz");
            }
            return "bar";
        }
        console.log(f());
    }
    expect: {
        function f() {
            try {
                throw 42;
            } catch (e) {
                console.log("foo");
            } finally {
                console.log("baz");
            }
            return "bar";
        }
        console.log(f());
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
    ]
}

retain_catch: {
    options = {
        if_return: true,
    }
    input: {
        function f() {
            try {
                throw 42;
            } catch (e) {
                return console.log("foo");
            } finally {
                console.log("bar");
            }
            return console.log("foo");
        }
        f();
    }
    expect: {
        function f() {
            try {
                throw 42;
            } catch (e) {
                return console.log("foo");
            } finally {
                console.log("bar");
            }
            return console.log("foo");
        }
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

retain_finally: {
    options = {
        if_return: true,
    }
    input: {
        function f() {
            try {
                return console.log("foo"), FAIL;
            } catch (e) {
                return console.log("bar"), "FAIL";
            } finally {
                return console.log("baz"), console.log("moo");
            }
            return console.log("moo");
        }
        console.log(f());
    }
    expect: {
        function f() {
            try {
                return console.log("foo"), FAIL;
            } catch (e) {
                return console.log("bar"), "FAIL";
            } finally {
                return console.log("baz"), console.log("moo");
            }
            return console.log("moo");
        }
        console.log(f());
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
        "moo",
        "undefined",
    ]
}

drop_try: {
    options = {
        if_return: true,
    }
    input: {
        function f() {
            try {
                return console.log("foo"), "bar";
            } finally {
                console.log("baz");
            }
            return "bar";
        }
        console.log(f());
    }
    expect: {
        function f() {
            try {
                console.log("foo");
            } finally {
                console.log("baz");
            }
            return "bar";
        }
        console.log(f());
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
    ]
}

retain_try: {
    options = {
        if_return: true,
    }
    input: {
        function f() {
            try {
                return console.log("foo");
            } finally {
                console.log("bar");
            }
            return console.log("foo");
        }
        f();
    }
    expect: {
        function f() {
            try {
                return console.log("foo");
            } finally {
                console.log("bar");
            }
            return console.log("foo");
        }
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

drop_try_catch: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            try {
                if (a())
                    return console.log("foo"), console.log("baz");
            } catch (e) {
                return console.log("bar"), console.log("baz");
            }
            return console.log("baz");
        }
        f(function() {
            return 42;
        });
        f(function() {});
        f();
    }
    expect: {
        function f(a) {
            try {
                if (a())
                    console.log("foo");
            } catch (e) {
                console.log("bar");
            }
            return console.log("baz");
        }
        f(function() {
            return 42;
        });
        f(function() {});
        f();
    }
    expect_stdout: [
        "foo",
        "baz",
        "baz",
        "bar",
        "baz",
    ]
}

empty_try: {
    options = {
        if_return: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            return f;
            function f() {
                try {} finally {}
                return "PASS";
            }
        }()());
    }
    expect: {
        console.log(function() {
            return function() {
                try {} finally {}
                return "PASS";
            };
        }()());
    }
    expect_stdout: "PASS"
}

sequence_void_1: {
    options = {
        if_return: true,
    }
    input: {
        function f() {
            {
                if (console)
                    return console, void console.log("PASS");
                return;
            }
        }
        f();
    }
    expect: {
        function f() {
            if (console)
                console, void console.log("PASS");
        }
        f();
    }
    expect_stdout: "PASS"
}

sequence_void_2: {
    options = {
        if_return: true,
    }
    input: {
        function f() {
            {
                if (console)
                    return console, void console.log("PASS");
                return;
            }
            FAIL;
        }
        f();
    }
    expect: {
        function f() {
            if (console)
                console, void console.log("PASS");
            else {
                return;
                FAIL;
            }
        }
        f();
    }
    expect_stdout: "PASS"
}

tail_match: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            if (a) {
                console.log("foo");
                return console.log("bar");
            }
            while (console.log("baz"));
            return console.log("moo"), console.log("bar");
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            if (a)
                console.log("foo");
            else {
                while (console.log("baz"));
                console.log("moo");
            }
            return console.log("bar");
        }
        f();
        f(42);
    }
    expect_stdout: [
        "baz",
        "moo",
        "bar",
        "foo",
        "bar",
    ]
}

void_match: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            if (a) {
                console.log("foo");
                return;
            }
            while (console.log("bar"));
            return console.log("baz"), void console.log("moo");
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            if (a)
                console.log("foo");
            else {
                while (console.log("bar"));
                console.log("baz"),
                console.log("moo");
            }
        }
        f();
        f(42);
    }
    expect_stdout: [
        "bar",
        "baz",
        "moo",
        "foo",
    ]
}

switch_break: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a) {
            switch (a) {
              default:
                if (console.log("foo"))
                    break;
                while (console.log("bar"));
              case 42:
                if (console.log("baz"))
                    break;
                while (console.log("moo"));
                break;
              case null:
                if (console.log("moz"))
                    break;
            }
        }
        f();
        f(42);
        f(null);
    }
    expect: {
        function f(a) {
            switch (a) {
              default:
                if (console.log("foo"))
                    break;
                while (console.log("bar"));
              case 42:
                if (!console.log("baz"))
                    while (console.log("moo"));
                break;
              case null:
                console.log("moz");
            }
        }
        f();
        f(42);
        f(null);
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
        "moo",
        "baz",
        "moo",
        "moz",
    ]
}

switch_return_1: {
    options = {
        dead_code: true,
        if_return: true,
    }
    input: {
        function f(a) {
            switch (a) {
              case console.log("PASS"):
                return;
                break;
              case 42:
                FAIL;
            }
        }
        f();
    }
    expect: {
        function f(a) {
            switch (a) {
              case console.log("PASS"):
                return;
              case 42:
                FAIL;
            }
        }
        f();
    }
    expect_stdout: "PASS"
}

switch_return_2: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            switch (a) {
              case console.log("PASS"):
                if (console)
                    return;
                break;
              case 42:
                FAIL;
            }
        }
        f();
    }
    expect: {
        function f(a) {
            switch (a) {
              case console.log("PASS"):
                if (console);
                break;
              case 42:
                FAIL;
            }
        }
        f();
    }
    expect_stdout: "PASS"
}

switch_return_3: {
    options = {
        if_return: true,
        side_effects: true,
    }
    input: {
        function f(a) {
            switch (a) {
              case console.log("foo"):
                if (console)
                    return void console.log("bar");
                break;
              case 42:
                FAIL;
            }
        }
        f();
    }
    expect: {
        function f(a) {
            switch (a) {
              case console.log("foo"):
                if (console)
                    console.log("bar");
                break;
              case 42:
                FAIL;
            }
        }
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

switch_return_4: {
    options = {
        conditionals: true,
        if_return: true,
        side_effects: true,
    }
    input: {
        function f(a) {
            switch (a) {
              case console.log("foo"):
                if (console) {
                    console.log("bar");
                    return;
                }
                break;
              case 42:
                FAIL;
            }
        }
        f();
    }
    expect: {
        function f(a) {
            switch (a) {
              case console.log("foo"):
                console && console.log("bar");
                break;
              case 42:
                FAIL;
            }
        }
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

switch_return_5: {
    options = {
        dead_code: true,
        if_return: true,
    }
    input: {
        function f(a) {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (a)
                    return;
                return;
                break;
              case null:
                FAIL;
            }
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (a);
                return;
              case null:
                FAIL;
            }
        }
        f();
        f(42);
    }
    expect_stdout: [
        "foo",
        "bar",
        "foo",
        "bar",
    ]
}

merged_references_1: {
    options = {
        if_return: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a, b = "PASS";
        console.log(function(c) {
            if (c = b)
                return a || c;
            c = FAIL;
            return a || c;
        }());
    }
    expect: {
        var a, b = "PASS";
        console.log(function(c) {
            if (c = b);
            else
                c = FAIL;
            return a || c;
        }());
    }
    expect_stdout: "PASS"
}

merged_references_2: {
    options = {
        if_return: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        A = "PASS";
        var a;
        console.log(function(b) {
            if (a = b)
                return console && a;
            a = FAIL;
            return console && a;
        }(A));
    }
    expect: {
        A = "PASS";
        var a;
        console.log(function(b) {
            if (a = b);
            else
                a = FAIL;
            return console && a;
        }(A));
    }
    expect_stdout: "PASS"
}

issue_5583: {
    options = {
        conditionals: true,
        if_return: true,
        side_effects: true,
    }
    input: {
        do {
            switch (console) {
              default:
                if (!console.log("foo"))
                    continue;
                break;
              case console.log("bar"):
                FAIL;
            }
        } while (console.log("baz"));
    }
    expect: {
        do {
            switch (console) {
              default:
                console.log("foo");
                break;
              case console.log("bar"):
                FAIL;
            }
        } while (console.log("baz"));
    }
    expect_stdout: [
        "bar",
        "foo",
        "baz",
    ]
}

issue_5584_1: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a) {
            switch (a) {
              case 42:
                if (!console.log("PASS"))
                    return;
                return FAIL;
            }
        }
        f(42);
    }
    expect: {
        function f(a) {
            switch (a) {
              case 42:
                if (console.log("PASS"))
                    return FAIL;
            }
        }
        f(42);
    }
    expect_stdout: "PASS"
}

issue_5584_2: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            switch (a) {
              case console.log("PASS"):
                if (console)
                    break;
                return FAIL;
            }
        }
        f();
    }
    expect: {
        function f(a) {
            switch (a) {
              case console.log("PASS"):
                if (console)
                    break;
                return FAIL;
            }
        }
        f();
    }
    expect_stdout: "PASS"
}

issue_5584_3: {
    options = {
        if_return: true,
    }
    input: {
        function f() {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (console)
                    break;
                return;
            }
            console.log("baz");
        }
        f();
    }
    expect: {
        function f() {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (console)
                    break;
                return;
            }
            console.log("baz");
        }
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
}

issue_5584_4: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (a)
                    return;
                break;
            }
            console.log("baz");
        }
        f();
    }
    expect: {
        function f(a) {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (a)
                    return;
                break;
            }
            console.log("baz");
        }
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
}

issue_5586: {
    options = {
        if_return: true,
    }
    input: {
        L: do {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (console)
                    break;
                break L;
            }
        } while (console.log("baz"));
    }
    expect: {
        L: do {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (console)
                    break;
                break L;
            }
        } while (console.log("baz"));
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
}

issue_5587_1: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a) {
            if (console)
                return a ? void 0 : console.log("PASS");
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            return !console || a ? void 0 : console.log("PASS");
        }
        f();
        f(42);
    }
    expect_stdout: "PASS"
}

issue_5587_2: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a) {
            if (console)
                return a ? console.log("PASS") : void 0;
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            return console && a ? console.log("PASS") : void 0;
        }
        f();
        f(42);
    }
    expect_stdout: "PASS"
}

issue_5589_1: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            switch (a) {
              case 42:
                if (!console.log("PASS"))
                    return;
                return 0;
                break;
              case null:
                FAIL;
            }
        }
        f(42);
    }
    expect: {
        function f(a) {
            switch (a) {
              case 42:
                if (console.log("PASS"))
                    return 0;
                break;
              case null:
                FAIL;
            }
        }
        f(42);
    }
    expect_stdout: "PASS"
}

issue_5589_2: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (a)
                    return void console.log("baz");
                return;
            }
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (a)
                    void console.log("baz");
                return;
            }
        }
        f();
        f(42);
    }
    expect_stdout: [
        "foo",
        "bar",
        "foo",
        "bar",
        "baz",
    ]
}

issue_5589_3: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            do {
                switch (console.log("foo")) {
                  case console.log("bar"):
                    if (a)
                        return void console.log("baz");
                    continue;
                }
            } while (console.log("moo"));
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            do {
                switch (console.log("foo")) {
                  case console.log("bar"):
                    if (a)
                        return void console.log("baz");
                    continue;
                }
            } while (console.log("moo"));
        }
        f();
        f(42);
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
        "foo",
        "bar",
        "baz",
    ]
}

issue_5592_1: {
    options = {
        if_return: true,
    }
    input: {
        L: {
            do {
                switch (console.log("foo")) {
                  case console.log("bar"):
                    if (console)
                        break;
                    break L;
                }
            } while (console.log("baz"));
        }
    }
    expect: {
        L: do {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (console)
                    break;
                break L;
            }
        } while (console.log("baz"));
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
}

issue_5592_2: {
    options = {
        if_return: true,
    }
    input: {
        L: {
            do {
                switch (console.log("foo")) {
                  case console.log("bar"):
                    if (!console)
                        break L;
                    break;
                }
            } while (console.log("baz"));
        }
    }
    expect: {
        L: do {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (console)
                    break;
                break L;
            }
        } while (console.log("baz"));
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
}

issue_5595: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        function f(a) {
            if (a) {
                var b;
                if (b++)
                    return "FAIL";
            } else
                return "PASS";
        }
        console.log(f());
    }
    expect: {
        function f(a) {
            var b;
            return a ? b++ ? "FAIL" : void 0 : "PASS";
        }
        console.log(f());
    }
    expect_stdout: "PASS"
}

issue_5597: {
    options = {
        conditionals: true,
        if_return: true,
        unused: true,
    }
    input: {
        function f(a) {
            if (a) L: {
                return;
                var b;
            } else
                return "FAIL";
        }
        console.log(f(42) || "PASS");
    }
    expect: {
        function f(a) {
            if (!a)
                return "FAIL";
        }
        console.log(f(42) || "PASS");
    }
    expect_stdout: "PASS"
}

issue_5619_1: {
    options = {
        if_return: true,
    }
    input: {
        console.log(function() {
            if (console)
                if (console)
                    return "PASS";
            var a = FAIL;
            return "PASS";
        }());
    }
    expect: {
        console.log(function() {
            if (console)
                if (console)
                    return "PASS";
            var a = FAIL;
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
}

issue_5619_2: {
    options = {
        dead_code: true,
        if_return: true,
        loops: true,
    }
    input: {
        console.log(function() {
            if (console)
                while (console)
                    return "PASS";
            var a = FAIL;
            return "PASS";
        }());
    }
    expect: {
        console.log(function() {
            if (console) {
                if (console)
                    return "PASS";
            }
            var a = FAIL;
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
}

issue_5649: {
    options = {
        if_return: true,
    }
    input: {
        console.log(function() {
            try {
                throw new Error("FAIL");
            } catch (e) {
                return "PASS";
            }
            throw new Error("FAIL");
        }());
    }
    expect: {
        console.log(function() {
            try {
                throw new Error("FAIL");
            } catch (e) {
                return "PASS";
            }
            throw new Error("FAIL");
        }());
    }
    expect_stdout: "PASS"
}

issue_5688: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        L: do {
            switch (console) {
              default:
                if (console)
                    break;
                if (FAIL_1)
                    ;
                else
                    break L;
                break;
              case 42:
                FAIL_2;
            }
        } while (console.log("PASS"));
    }
    expect: {
        L: do {
            switch (console) {
              default:
                if (console)
                    break;
                if (FAIL_1)
                    break;
                break L;
              case 42:
                FAIL_2;
            }
        } while (console.log("PASS"));
    }
    expect_stdout: "PASS"
}
