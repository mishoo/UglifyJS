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

if_var_retrn_3: {
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
                return y();
            z();
        }
    }
    expect: {
        function f() {
            return u() ? v() : (a = w(), x() ? y() : (z(), void 0));
            var a;
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
