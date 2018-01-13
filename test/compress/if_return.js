if_return_1: {
    options = {
        if_return    : true,
        sequences    : true,
        conditionals : true,
        comparisons  : true,
        evaluate     : true,
        booleans     : true,
        unused       : true,
        side_effects : true,
        dead_code    : true,
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
        if_return    : true,
        sequences    : true,
        conditionals : true,
        comparisons  : true,
        evaluate     : true,
        booleans     : true,
        unused       : true,
        side_effects : true,
        dead_code    : true,
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
        if_return    : true,
        sequences    : true,
        conditionals : true,
        comparisons  : true,
        evaluate     : true,
        booleans     : true,
        unused       : true,
        side_effects : true,
        dead_code    : true,
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
        if_return    : true,
        sequences    : true,
        conditionals : true,
        comparisons  : true,
        evaluate     : true,
        booleans     : true,
        unused       : true,
        side_effects : true,
        dead_code    : true,
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
        if_return    : true,
        sequences    : true,
        conditionals : true,
        comparisons  : true,
        evaluate     : true,
        booleans     : true,
        unused       : true,
        side_effects : true,
        dead_code    : true,
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
        if_return    : true,
        sequences    : true,
        conditionals : true,
        comparisons  : true,
        evaluate     : true,
        booleans     : true,
        unused       : true,
        side_effects : true,
        dead_code    : true,
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
        if_return    : true,
        sequences    : true,
        conditionals : true,
        comparisons  : true,
        evaluate     : true,
        booleans     : true,
        unused       : true,
        side_effects : true,
        dead_code    : true,
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
        if_return:     true,
        sequences:     true,
        conditionals:  true,
        side_effects : true,
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
        if_return    : true,
        sequences    : true,
        conditionals : true,
        comparisons  : true,
        evaluate     : true,
        booleans     : true,
        unused       : true,
        side_effects : true,
        dead_code    : true,
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
            if (f.files[0].size > 12345)
                return alert("alert"), f.focus(), !1;
        }
    }
}

issue_1437: {
    options = {
        if_return    : true,
        sequences    : true,
        conditionals : false
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
        conditionals : true,
        if_return    : true,
        sequences    : true
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

issue_1317: {
    options = {
        if_return: true,
    }
    input: {
        !function(a) {
            if (a) return;
            let b = 1;
            function g() {
                return b;
            }
            console.log(g());
        }();
    }
    expect: {
        !function(a) {
            if (a) return;
            let b = 1;
            function g() {
                return b;
            }
            console.log(g());
        }();
    }
    expect_stdout: "1"
    node_version: ">=6"
}

issue_1317_strict: {
    options = {
        if_return: true,
    }
    input: {
        "use strict";
        !function(a) {
            if (a) return;
            let b = 1;
            function g() {
                return b;
            }
            console.log(g());
        }();
    }
    expect: {
        "use strict";
        !function(a) {
            if (a) return;
            let b = 1;
            function g() {
                return b;
            }
            console.log(g());
        }();
    }
    expect_stdout: "1"
    node_version: ">=4"
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

issue_2747: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
        unused: true,
    }
    input: {
        "use strict";
        function f(baz) {
            if (baz === 0) {
                return null;
            }
            let r;
            if (baz > 2) {
                r = 4;
            } else {
                r = 5;
            }
            return r;
        }
        console.log(f(0), f(1), f(3));
    }
    expect: {
        "use strict";
        function f(baz) {
            if (0 === baz) return null;
            let r;
            return r = baz > 2 ? 4 : 5, r;
        }
        console.log(f(0), f(1), f(3));
    }
    expect_stdout: "null 5 4"
    node_version: ">=4"
}
