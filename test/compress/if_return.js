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
        // suboptimal
        function f(x){return!!x||(foo(),void bar())}
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
