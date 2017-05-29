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
