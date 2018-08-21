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

if_var_return: {
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
