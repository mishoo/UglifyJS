reduce_vars: {
    options = {
        conditionals  : true,
        evaluate      : true,
        global_defs   : {
            C : 0
        },
        reduce_vars   : true,
        toplevel      : true,
        unused        : true
    }
    input: {
        var A = 1;
        (function f0() {
            var a = 2;
            console.log(a - 5);
            console.log(A - 5);
        })();
        (function f1() {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })();
        (function f2(eval) {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })(eval);
        (function f3() {
            var b = typeof C !== "undefined";
            var c = 4;
            if (b) {
                return 'yes';
            } else {
                return 'no';
            }
        })();
        console.log(A + 1);
    }
    expect: {
        var A = 1;
        (function() {
            console.log(-3);
            console.log(-4);
        })();
        (function f1() {
            var a = 2;
            console.log(-3);
            eval("console.log(a);");
        })();
        (function f2(eval) {
            var a = 2;
            console.log(-3);
            eval("console.log(a);");
        })(eval);
        (function() {
            return "yes";
        })();
        console.log(2);
    }
}

modified: {
    options = {
        conditionals  : true,
        evaluate      : true,
        reduce_vars   : true,
        unused        : true
    }
    input: {
        function f0() {
            var a = 1, b = 2;
            b++;
            console.log(a + 1);
            console.log(b + 1);
        }

        function f1() {
            var a = 1, b = 2;
            --b;
            console.log(a + 1);
            console.log(b + 1);
        }

        function f2() {
            var a = 1, b = 2, c = 3;
            b = c;
            console.log(a + b);
            console.log(b + c);
            console.log(a + c);
            console.log(a + b + c);
        }

        function f3() {
            var a = 1, b = 2, c = 3;
            b *= c;
            console.log(a + b);
            console.log(b + c);
            console.log(a + c);
            console.log(a + b + c);
        }

        function f4() {
            var a = 1, b = 2, c = 3;
            if (a) {
                b = c;
            } else {
                c = b;
            }
            console.log(a + b);
            console.log(b + c);
            console.log(a + c);
            console.log(a + b + c);
        }

        function f5(a) {
            B = a;
            console.log(A ? 'yes' : 'no');
            console.log(B ? 'yes' : 'no');
        }
    }
    expect: {
        function f0() {
            var b = 2;
            b++;
            console.log(2);
            console.log(b + 1);
        }

        function f1() {
            var b = 2;
            --b;
            console.log(2);
            console.log(b + 1);
        }

        function f2() {
            var b = 2;
            b = 3;
            console.log(1 + b);
            console.log(b + 3);
            console.log(4);
            console.log(1 + b + 3);
        }

        function f3() {
            var b = 2;
            b *= 3;
            console.log(1 + b);
            console.log(b + 3);
            console.log(4);
            console.log(1 + b + 3);
        }

        function f4() {
            var b = 2, c = 3;
            b = c;
            console.log(1 + b);
            console.log(b + c);
            console.log(1 + c);
            console.log(1 + b + c);
        }

        function f5(a) {
            B = a;
            console.log(A ? 'yes' : 'no');
            console.log(B ? 'yes' : 'no');
        }
   }
}

unsafe_evaluate: {
    options = {
        evaluate     : true,
        reduce_vars  : true,
        unsafe       : true,
        unused       : true
    }
    input: {
        function f0(){
            var a = {
                b:1
            };
            console.log(a.b + 3);
        }

        function f1(){
            var a = {
                b:{
                    c:1
                },
                d:2
            };
            console.log(a.b + 3, a.d + 4, a.b.c + 5, a.d.c + 6);
        }
    }
    expect: {
        function f0(){
            console.log(4);
        }

        function f1(){
            var a = {
                b:{
                    c:1
                },
                d:2
            };
            console.log(a.b + 3, 6, 6, 2..c + 6);
        }
    }
}

unsafe_evaluate_object: {
    options = {
        evaluate     : true,
        reduce_vars  : true,
        unsafe       : true
    }
    input: {
        function f0(){
            var a = 1;
            var b = {};
            b[a] = 2;
            console.log(a + 3);
        }

        function f1(){
            var a = {
                b:1
            };
            a.b = 2;
            console.log(a.b + 3);
        }
    }
    expect: {
        function f0(){
            var a = 1;
            var b = {};
            b[1] = 2;
            console.log(4);
        }

        function f1(){
            var a = {
                b:1
            };
            a.b = 2;
            console.log(a.b + 3);
        }
    }
}

unsafe_evaluate_array: {
    options = {
        evaluate     : true,
        reduce_vars  : true,
        unsafe       : true
    }
    input: {
        function f0(){
            var a = 1;
            var b = [];
            b[a] = 2;
            console.log(a + 3);
        }

        function f1(){
            var a = [1];
            a[2] = 3;
            console.log(a.length);
        }

        function f2(){
            var a = [1];
            a.push(2);
            console.log(a.length);
        }
    }
    expect: {
        function f0(){
            var a = 1;
            var b = [];
            b[1] = 2;
            console.log(4);
        }

        function f1(){
            var a = [1];
            a[2] = 3;
            console.log(a.length);
        }

        function f2(){
            var a = [1];
            a.push(2);
            console.log(a.length);
        }
    }
}

unsafe_evaluate_equality: {
    options = {
        evaluate     : true,
        reduce_vars  : true,
        unsafe       : true,
        unused       : true
    }
    input: {
        function f0(){
            var a = {};
            console.log(a === a);
        }

        function f1(){
            var a = [];
            console.log(a === a);
        }

        function f2(){
            var a = {a:1, b:2};
            var b = a;
            var c = a;
            console.log(b === c);
        }

        function f3(){
            var a = [1, 2, 3];
            var b = a;
            var c = a;
            console.log(b === c);
        }
    }
    expect: {
        function f0(){
            console.log(true);
        }

        function f1(){
            console.log(true);
        }

        function f2(){
            console.log(true);
        }

        function f3(){
            console.log(true);
        }
    }
}

passes: {
    options = {
        conditionals: true,
        evaluate: true,
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            var a = 1, b = 2, c = 3;
            if (a) {
                b = c;
            } else {
                c = b;
            }
            console.log(a + b);
            console.log(b + c);
            console.log(a + c);
            console.log(a + b + c);
        }
    }
    expect: {
        function f() {
            var b = 2;
            b = 3;
            console.log(1 + b);
            console.log(b + 3);
            console.log(4);
            console.log(1 + b + 3);
        }
    }
}

iife: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        !function(a, b, c) {
            b++;
            console.log(a - 1, b * 1, c + 2);
        }(1, 2, 3);
    }
    expect: {
        !function(a, b, c) {
            b++;
            console.log(0, 1 * b, 5);
        }(1, 2, 3);
    }
}

iife_new: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        var A = new function(a, b, c) {
            b++;
            console.log(a - 1, b * 1, c + 2);
        }(1, 2, 3);
    }
    expect: {
        var A = new function(a, b, c) {
            b++;
            console.log(0, 1 * b, 5);
        }(1, 2, 3);
    }
}

multi_def: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f(a) {
            if (a)
                var b = 1;
            else
                var b = 2
            console.log(b + 1);
        }
    }
    expect: {
        function f(a) {
            if (a)
                var b = 1;
            else
                var b = 2
            console.log(b + 1);
        }
    }
}

multi_def_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f(){
            if (code == 16)
                var bitsLength = 2, bitsOffset = 3, what = len;
            else if (code == 17)
                var bitsLength = 3, bitsOffset = 3, what = (len = 0);
            else if (code == 18)
                var bitsLength = 7, bitsOffset = 11, what = (len = 0);
            var repeatLength = this.getBits(bitsLength) + bitsOffset;
        }
    }
    expect: {
        function f(){
            if (16 == code)
                var bitsLength = 2, bitsOffset = 3, what = len;
            else if (17 == code)
                var bitsLength = 3, bitsOffset = 3, what = (len = 0);
            else if (18 == code)
                var bitsLength = 7, bitsOffset = 11, what = (len = 0);
            var repeatLength = this.getBits(bitsLength) + bitsOffset;
        }
    }
}

use_before_var: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f(){
            console.log(t);
            var t = 1;
        }
    }
    expect: {
        function f(){
            console.log(t);
            var t = 1;
        }
    }
}

inner_var_if: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f(a){
            if (a)
                var t = 1;
            if (!t)
                console.log(t);
        }
    }
    expect: {
        function f(a){
            if (a)
                var t = 1;
            if (!t)
                console.log(t);
        }
    }
}

inner_var_label: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f(a){
            l: {
                if (a) break l;
                var t = 1;
            }
            console.log(t);
        }
    }
    expect: {
        function f(a){
            l: {
                if (a) break l;
                var t = 1;
            }
            console.log(t);
        }
    }
}

inner_var_for: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f() {
            var a = 1;
            x(a, b, d);
            for (var b = 2, c = 3; x(a, b, c, d); x(a, b, c, d)) {
                var d = 4, e = 5;
                x(a, b, c, d, e);
            }
            x(a, b, c, d, e);
        }
    }
    expect: {
        function f() {
            var a = 1;
            x(1, b, d);
            for (var b = 2, c = 3; x(1, b, 3, d); x(1, b, 3, d)) {
                var d = 4, e = 5;
                x(1, b, 3, d, e);
            }
            x(1, b, 3, d, e);
        }
    }
}

inner_var_for_in_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f() {
            var a = 1, b = 2;
            for (b in (function() {
                return x(a, b, c);
            })()) {
                var c = 3, d = 4;
                x(a, b, c, d);
            }
            x(a, b, c, d);
        }
    }
    expect: {
        function f() {
            var a = 1, b = 2;
            for (b in (function() {
                return x(1, b, c);
            })()) {
                var c = 3, d = 4;
                x(1, b, c, d);
            }
            x(1, b, c, d);
        }
    }
}

inner_var_for_in_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f() {
            for (var long_name in {})
                console.log(long_name);
        }
    }
    expect: {
        function f() {
            for (var long_name in {})
                console.log(long_name);
        }
    }
}

inner_var_catch: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f() {
            try {
                a();
            } catch (e) {
                var b = 1;
            }
            console.log(b);
        }
    }
    expect: {
        function f() {
            try {
                a();
            } catch (e) {
                var b = 1;
            }
            console.log(b);
        }
    }
}

issue_1533_1: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        function f() {
            var id = "";
            for (id in {break: "me"})
                console.log(id);
        }
    }
    expect: {
        function f() {
            var id = "";
            for (id in {break: "me"})
                console.log(id);
        }
    }
}

issue_1533_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f() {
            var id = "";
            for (var id in {break: "me"})
                console.log(id);
            console.log(id);
        }
    }
    expect: {
        function f() {
            var id = "";
            for (var id in {break: "me"})
                console.log(id);
            console.log(id);
        }
    }
}

toplevel_on: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel:true,
        unused: true,
    }
    input: {
        var x = 3;
        console.log(x);
    }
    expect: {
        console.log(3);
    }
}

toplevel_off: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel:false,
        unused: true,
    }
    input: {
        var x = 3;
        console.log(x);
    }
    expect: {
        var x = 3;
        console.log(x);
    }
}

toplevel_on_loops_1: {
    options = {
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel:true,
        unused: true,
    }
    input: {
        function bar() {
            console.log("bar:", --x);
        }
        var x = 3;
        do
            bar();
        while (x);
    }
    expect: {
        var x = 3;
        do
            (function() {
                console.log("bar:", --x);
            })();
        while (x);
    }
}

toplevel_off_loops_1: {
    options = {
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel:false,
        unused: true,
    }
    input: {
        function bar() {
            console.log("bar:", --x);
        }
        var x = 3;
        do
            bar();
        while (x);
    }
    expect: {
        function bar() {
            console.log("bar:", --x);
        }
        var x = 3;
        do
            bar();
        while (x);
    }
}

toplevel_on_loops_2: {
    options = {
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel:true,
        unused: true,
    }
    input: {
        function bar() {
            console.log("bar:");
        }
        var x = 3;
        do
            bar();
        while (x);
    }
    expect: {
        for (;;) (function() {
            console.log("bar:");
        })();
    }
}

toplevel_off_loops_2: {
    options = {
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel:false,
        unused: true,
    }
    input: {
        function bar() {
            console.log("bar:");
        }
        var x = 3;
        do
            bar();
        while (x);
    }
    expect: {
        function bar() {
            console.log("bar:");
        }
        var x = 3;
        do
            bar();
        while (x);
    }
}

toplevel_on_loops_3: {
    options = {
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel:true,
        unused: true,
    }
    input: {
        var x = 3;
        while (x) bar();
    }
    expect: {
        for (;;) bar();
    }
}

toplevel_off_loops_3: {
    options = {
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel:false,
        unused: true,
    }
    input: {
        var x = 3;
        while (x) bar();
    }
    expect: {
        var x = 3;
        for (;x;) bar();
    }
}

defun_reference: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f() {
            function g() {
                x();
                return a;
            }
            var a = h();
            var b = 2;
            return a + b;
            function h() {
                y();
                return b;
            }
        }
    }
    expect: {
        function f() {
            function g() {
                x();
                return a;
            }
            var a = h();
            var b = 2;
            return a + b;
            function h() {
                y();
                return b;
            }
        }
    }
}

defun_inline_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            return g(2) + h();
            function g(b) {
                return b;
            }
            function h() {
                return h();
            }
        }
    }
    expect: {
        function f() {
            return function(b) {
                return b;
            }(2) + h();
            function h() {
                return h();
            }
        }
    }
}

defun_inline_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            function g(b) {
                return b;
            }
            function h() {
                return h();
            }
            return g(2) + h();
        }
    }
    expect: {
        function f() {
            function h() {
                return h();
            }
            return function(b) {
                return b;
            }(2) + h();
        }
    }
}

defun_inline_3: {
    options = {
        evaluate: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f() {
            return g(2);
            function g(b) {
                return b;
            }
        }
    }
    expect: {
        function f() {
            return 2;
        }
    }
}

defun_call: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            return g() + h(1) - h(g(), 2, 3);
            function g() {
                return 4;
            }
            function h(a) {
                return a;
            }
        }
    }
    expect: {
        function f() {
            return 4 + h(1) - h(4);
            function h(a) {
                return a;
            }
        }
    }
}

defun_redefine: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {
                return 1;
            }
            function h() {
                return 2;
            }
            g = function() {
                return 3;
            };
            return g() + h();
        }
    }
    expect:  {
        function f() {
            function g() {
                return 1;
            }
            g = function() {
                return 3;
            };
            return g() + 2;
        }
    }
}

func_inline: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            var g = function() {
                return 1;
            };
            console.log(g() + h());
            var h = function() {
                return 2;
            };
        }
    }
    expect: {
        function f() {
            console.log(1 + h());
            var h = function() {
                return 2;
            };
        }
    }
}

func_modified: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            function a() { return 1; }
            function b() { return 2; }
            function c() { return 3; }
            b.inject = [];
            c = function() { return 4; };
            return a() + b() + c();
        }
    }
    expect: {
        function f(a) {
            function b() { return 2; }
            function c() { return 3; }
            b.inject = [];
            c = function() { return 4; };
            return 1 + 2 + c();
        }
    }
}

defun_label: {
    options = {
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            function f(a) {
                L: {
                    if (a) break L;
                    return 1;
                }
            }
            console.log(f(2));
        }();
    }
    expect: {
        !function() {
            console.log(function(a) {
                L: {
                    if (a) break L;
                    return 1;
                }
            }(2));
        }();
    }
}
