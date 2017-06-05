reduce_vars: {
    options = {
        conditionals  : true,
        evaluate      : true,
        inline        : true,
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
        "yes";
        console.log(A + 1);
    }
    expect_stdout: true
}

modified: {
    options = {
        conditionals  : true,
        evaluate      : true,
        reduce_vars   : true,
        unused        : true,
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
            3;
            console.log(4);
            console.log(6);
            console.log(4);
            console.log(7);
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

unsafe_evaluate_equality_1: {
    options = {
        evaluate     : true,
        reduce_vars  : true,
        unsafe       : true,
        unused       : true
    }
    input: {
        function f0() {
            var a = {};
            return a === a;
        }
        function f1() {
            var a = [];
            return a === a;
        }
        console.log(f0(), f1());
    }
    expect: {
        function f0() {
            return true;
        }
        function f1() {
            return true;
        }
        console.log(f0(), f1());
    }
    expect_stdout: true
}

unsafe_evaluate_equality_2: {
    options = {
        collapse_vars: true,
        evaluate     : true,
        passes       : 2,
        reduce_vars  : true,
        unsafe       : true,
        unused       : true
    }
    input: {
        function f2() {
            var a = {a:1, b:2};
            var b = a;
            var c = a;
            return b === c;
        }
        function f3() {
            var a = [1, 2, 3];
            var b = a;
            var c = a;
            return b === c;
        }
        console.log(f2(), f3());
    }
    expect: {
        function f2() {
            return true;
        }
        function f3() {
            return true;
        }
        console.log(f2(), f3());
    }
    expect_stdout: true
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
            3;
            console.log(4);
            console.log(6);
            console.log(4);
            console.log(7);
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
    expect_stdout: true
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
    expect_stdout: true
}

multi_def_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f(a) {
            if (a)
                var b = 1;
            else
                var b = 2;
            console.log(b + 1);
        }
    }
    expect: {
        function f(a) {
            if (a)
                var b = 1;
            else
                var b = 2;
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

multi_def_3: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        function f(a) {
            var b = 2;
            if (a)
                var b;
            else
                var b;
            console.log(b + 1);
        }
    }
    expect: {
        function f(a) {
            var b = 2;
            if (a)
                var b;
            else
                var b;
            console.log(3);
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

inner_var_for_1: {
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

inner_var_for_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            var a = 1;
            for (var b = 1; --b;) var a = 2;
            console.log(a);
        }();
    }
    expect: {
        !function() {
            a = 1;
            for (var b = 1; --b;) var a = 2;
            console.log(a);
        }();
    }
    expect_stdout: "1"
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
    expect_stdout: true
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
    expect_stdout: true
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
    expect_stdout: true
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
    expect_stdout: true
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
        inline: true,
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
        inline: true,
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
        inline: true,
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
        inline: true,
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
        inline: true,
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
    expect_stdout: true
}

double_reference: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            var g = function g() {
                g();
            };
            g();
        }
    }
    expect: {
        function f() {
            (function g() {
                g();
            })();
        }
    }
}

iife_arguments_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(x) {
            console.log(x() === arguments[0]);
        })(function f() {
            return f;
        });
    }
    expect: {
        (function(x) {
            console.log(x() === arguments[0]);
        })(function f() {
            return f;
        });
    }
    expect_stdout: true
}

iife_arguments_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var x = function f() {
                return f;
            };
            console.log(x() === arguments[0]);
        })();
    }
    expect: {
        (function() {
            console.log(function f() {
                return f;
            }() === arguments[0]);
        })();
    }
    expect_stdout: true
}

iife_eval_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(x) {
            console.log(x() === eval("x"));
        })(function f() {
            return f;
        });
    }
    expect: {
        (function(x) {
            console.log(x() === eval("x"));
        })(function f() {
            return f;
        });
    }
    expect_stdout: true
}

iife_eval_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var x = function f() {
                return f;
            };
            console.log(x() === eval("x"));
        })();
    }
    expect: {
        (function() {
            var x = function f() {
                return f;
            };
            console.log(x() === eval("x"));
        })();
    }
    expect_stdout: true
}

iife_func_side_effects: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function x() {
            console.log("x");
        }
        function y() {
            console.log("y");
        }
        function z() {
            console.log("z");
        }
        (function(a, b, c) {
            function y() {
                console.log("FAIL");
            }
            return y + b();
        })(x(), function() {
            return y();
        }, z());
    }
    expect: {
        function x() {
            console.log("x");
        }
        function y() {
            console.log("y");
        }
        function z() {
            console.log("z");
        }
        (function(a, b, c) {
            return function() {
                console.log("FAIL");
            } + b();
        })(x(), function() {
            return y();
        }, z());
    }
    expect_stdout: [
        "x",
        "z",
        "y",
    ]
}

issue_1595_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function f(a) {
            return f(a + 1);
        })(2);
    }
    expect: {
        (function f(a) {
            return f(a + 1);
        })(2);
    }
}

issue_1595_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function f(a) {
            return g(a + 1);
        })(2);
    }
    expect: {
        (function(a) {
            return g(a + 1);
        })(2);
    }
}

issue_1595_3: {
    options = {
        evaluate: true,
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function f(a) {
            return g(a + 1);
        })(2);
    }
    expect: {
        (function(a) {
            return g(3);
        })();
    }
}

issue_1595_4: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function iife(a, b, c) {
            console.log(a, b, c);
            if (a) iife(a - 1, b, c);
        })(3, 4, 5);
    }
    expect: {
        (function iife(a, b, c) {
            console.log(a, b, c);
            if (a) iife(a - 1, b, c);
        })(3, 4, 5);
    }
    expect_stdout: true
}

issue_1606: {
    options = {
        evaluate: true,
        hoist_vars: true,
        reduce_vars: true,
    }
    input: {
        function f() {
            var a;
            function g(){};
            var b = 2;
            x(b);
        }
    }
    expect: {
        function f() {
            var a, b;
            function g(){};
            b = 2;
            x(b);
        }
    }
}

issue_1670_1: {
    options = {
        comparisons: true,
        conditionals: true,
        evaluate: true,
        dead_code: true,
        reduce_vars: true,
        side_effects: true,
        switches: true,
        unused: true,
    }
    input: {
        (function f() {
            switch (1) {
              case 0:
                var a = true;
                break;
              default:
                if (typeof a === "undefined") console.log("PASS");
                else console.log("FAIL");
            }
        })();
    }
    expect: {
        (function() {
            var a;
            void 0 === a ? console.log("PASS") : console.log("FAIL");
        })();
    }
    expect_stdout: "PASS"
}

issue_1670_2: {
    options = {
        conditionals: true,
        evaluate: true,
        dead_code: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        switches: true,
        unused: true,
    }
    input: {
        (function f() {
            switch (1) {
              case 0:
                var a = true;
                break;
              default:
                if (typeof a === "undefined") console.log("PASS");
                else console.log("FAIL");
            }
        })();
    }
    expect: {
        (function() {
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

issue_1670_3: {
    options = {
        comparisons: true,
        conditionals: true,
        evaluate: true,
        dead_code: true,
        reduce_vars: true,
        side_effects: true,
        switches: true,
        unused: true,
    }
    input: {
        (function f() {
            switch (1) {
              case 0:
                var a = true;
                break;
              case 1:
                if (typeof a === "undefined") console.log("PASS");
                else console.log("FAIL");
            }
        })();
    }
    expect: {
        (function() {
            var a;
            void 0 === a ? console.log("PASS") : console.log("FAIL");
        })();
    }
    expect_stdout: "PASS"
}

issue_1670_4: {
    options = {
        conditionals: true,
        evaluate: true,
        dead_code: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        switches: true,
        unused: true,
    }
    input: {
        (function f() {
            switch (1) {
              case 0:
                var a = true;
                break;
              case 1:
                if (typeof a === "undefined") console.log("PASS");
                else console.log("FAIL");
            }
        })();
    }
    expect: {
        (function() {
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

issue_1670_5: {
    options = {
        dead_code: true,
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        side_effects: true,
        switches: true,
        unused: true,
    }
    input: {
        (function(a) {
            switch (1) {
              case a:
                console.log(a);
                break;
              default:
                console.log(2);
                break;
            }
        })(1);
    }
    expect: {
        (function() {
            console.log(1);
        })();
    }
    expect_stdout: "1"
}

issue_1670_6: {
    options = {
        dead_code: true,
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        side_effects: true,
        switches: true,
        unused: true,
    }
    input: {
        (function(a) {
            switch (1) {
              case a = 1:
                console.log(a);
                break;
              default:
                console.log(2);
                break;
            }
        })(1);
    }
    expect: {
        (function(a) {
            switch (1) {
              case a = 1:
                console.log(a);
                break;
              default:
                console.log(2);
            }
        })(1);
    }
    expect_stdout: "1"
}

unary_delete: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var b = 10;
        function f() {
            var a;
            if (delete a) b--;
        }
        f();
        console.log(b);
    }
    expect: {
        var b = 10;
        function f() {
            var a;
            if (delete a) b--;
        }
        f();
        console.log(b);
    }
    expect_stdout: true
}

redefine_arguments_1: {
    options = {
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            var arguments;
            return typeof arguments;
        }
        function g() {
            var arguments = 42;
            return typeof arguments;
        }
        function h(x) {
            var arguments = x;
            return typeof arguments;
        }
        console.log(f(), g(), h());
    }
    expect: {
        function f() {
            var arguments;
            return typeof arguments;
        }
        function g() {
            return "number";
        }
        function h(x) {
            var arguments = x;
            return typeof arguments;
        }
        console.log(f(), g(), h());
    }
    expect_stdout: "object number undefined"
}

redefine_arguments_2: {
    options = {
        evaluate: true,
        inline: true,
        keep_fargs: false,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            var arguments;
            return typeof arguments;
        }
        function g() {
            var arguments = 42;
            return typeof arguments;
        }
        function h(x) {
            var arguments = x;
            return typeof arguments;
        }
        console.log(f(), g(), h());
    }
    expect: {
        console.log(function() {
            var arguments;
            return typeof arguments;
        }(), "number", function(x) {
            var arguments = x;
            return typeof arguments;
        }());
    }
    expect_stdout: "object number undefined"
}

redefine_arguments_3: {
    options = {
        evaluate: true,
        inline: true,
        keep_fargs: false,
        passes: 3,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            var arguments;
            return typeof arguments;
        }
        function g() {
            var arguments = 42;
            return typeof arguments;
        }
        function h(x) {
            var arguments = x;
            return typeof arguments;
        }
        console.log(f(), g(), h());
    }
    expect: {
        console.log(function() {
            var arguments;
            return typeof arguments;
        }(), "number", function(x) {
            var arguments = x;
            return typeof arguments;
        }());
    }
    expect_stdout: "object number undefined"
}

redefine_farg_1: {
    options = {
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var a;
            return typeof a;
        }
        function g(a) {
            var a = 42;
            return typeof a;
        }
        function h(a, b) {
            var a = b;
            return typeof a;
        }
        console.log(f([]), g([]), h([]));
    }
    expect: {
        function f(a) {
            var a;
            return typeof a;
        }
        function g() {
            return"number";
        }
        function h(a, b) {
            var a = b;
            return typeof a;
        }
        console.log(f([]), g([]), h([]));
    }
    expect_stdout: "object number undefined"
}

redefine_farg_2: {
    options = {
        evaluate: true,
        inline: true,
        keep_fargs: false,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            var a;
            return typeof a;
        }
        function g(a) {
            var a = 42;
            return typeof a;
        }
        function h(a, b) {
            var a = b;
            return typeof a;
        }
        console.log(f([]), g([]), h([]));
    }
    expect: {
        console.log(function(a) {
            var a;
            return typeof a;
        }([]), "number",function(a, b) {
            var a = b;
            return typeof a;
        }([]));
    }
    expect_stdout: "object number undefined"
}

redefine_farg_3: {
    options = {
        evaluate: true,
        inline: true,
        keep_fargs: false,
        passes: 3,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            var a;
            return typeof a;
        }
        function g(a) {
            var a = 42;
            return typeof a;
        }
        function h(a, b) {
            var a = b;
            return typeof a;
        }
        console.log(f([]), g([]), h([]));
    }
    expect: {
        console.log(function(a) {
            var a;
            return typeof a;
        }([]), "number", "undefined");
    }
    expect_stdout: "object number undefined"
}

delay_def: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            return a;
            var a;
        }
        function g() {
            return a;
            var a = 1;
        }
        console.log(f(), g());
    }
    expect: {
        function f() {
            return a;
            var a;
        }
        function g() {
            return a;
            var a = 1;
        }
        console.log(f(), g());
    }
    expect_stdout: true
}

booleans: {
    options = {
        booleans: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        console.log(function(a) {
            if (a != 0);
            switch (a) {
              case 0:
                return "FAIL";
              case false:
                return "PASS";
            }
        }(false));
    }
    expect: {
        console.log(function(a) {
            if (!1);
            switch (!1) {
              case 0:
                return "FAIL";
              case !1:
                return "PASS";
            }
        }(!1));
    }
    expect_stdout: "PASS"
}

side_effects_assign: {
    options = {
        evaluate: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = typeof void (a && a.in == 1, 0);
        console.log(a);
    }
    expect: {
        var a = typeof void (a && a.in);
        console.log(a);
    }
    expect_stdout: "undefined"
}

pure_getters_1: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        try {
            var a = (a.b, 2);
        } catch (e) {}
        console.log(a);
    }
    expect: {
        try {
            var a = (a.b, 2);
        } catch (e) {}
        console.log(a);
    }
    expect_stdout: "undefined"
}

pure_getters_2: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        var a = a && a.b;
    }
    expect: {
        var a = a && a.b;
    }
}

pure_getters_3: {
    options = {
        pure_getters: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        var a = a && a.b;
    }
    expect: {
    }
}

catch_var: {
    options = {
        booleans: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        try {
            throw {};
        } catch (e) {
            var e;
            console.log(!!e);
        }
    }
    expect: {
        try {
            throw {};
        } catch (e) {
            var e;
            console.log(!!e);
        }
    }
    expect_stdout: "true"
}

var_assign_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        !function() {
            var a;
            a = 2;
            console.log(a);
        }();
    }
    expect: {
        !function() {
            console.log(2);
        }();
    }
    expect_stdout: "2"
}

var_assign_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        !function() {
            var a;
            if (a = 2) console.log(a);
        }();
    }
    expect: {
        !function() {
            if (2) console.log(2);
        }();
    }
    expect_stdout: "2"
}

var_assign_3: {
    options = {
        evaluate: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        !function() {
            var a;
            while (a = 2);
            console.log(a);
        }();
    }
    expect: {
        !function() {
            var a;
            while (a = 2);
            console.log(a);
        }();
    }
}

var_assign_4: {
    options = {
        evaluate: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        !function a() {
            a = 2;
            console.log(a);
        }();
    }
    expect: {
        !function a() {
            a = 2,
            console.log(a);
        }();
    }
}

var_assign_5: {
    options = {
        evaluate: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        !function() {
            var a;
            !function(b) {
                a = 2;
                console.log(a, b);
            }(a);
        }();
    }
    expect: {
        !function() {
            var a;
            !function(b) {
                a = 2,
                console.log(a, b);
            }(a);
        }();
    }
    expect_stdout: "2 undefined"
}

var_assign_6: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            var a = function(){}(a = 1);
            console.log(a);
        }();
    }
    expect: {
        !function() {
            var a = function(){}(a = 1);
            console.log(a);
        }();
    }
    expect_stdout: "undefined"
}

immutable: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            var a = "test";
            console.log(a.indexOf("e"));
        }();
    }
    expect: {
        !function() {
            console.log("test".indexOf("e"));
        }();
    }
    expect_stdout: "1"
}

issue_1814_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 42;
        !function() {
            var b = a;
            !function(a) {
                console.log(a++, b);
            }(0);
        }();
    }
    expect: {
        !function() {
            !function(a) {
                console.log(a++, 42);
            }(0);
        }();
    }
    expect_stdout: "0 42"
}

issue_1814_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "32";
        !function() {
            var b = a + 1;
            !function(a) {
                console.log(a++, b);
            }(0);
        }();
    }
    expect: {
        !function() {
            !function(a) {
                console.log(a++, "321");
            }(0);
        }();
    }
    expect_stdout: "0 '321'"
}

try_abort: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            try {
                var a = 1;
                throw "";
                var b = 2;
            } catch (e) {
            }
            console.log(a, b);
        }();
    }
    expect: {
        !function() {
            try {
                var a = 1;
                throw "";
                var b = 2;
            } catch (e) {
            }
            console.log(a, b);
        }();
    }
    expect_stdout: "1 undefined"
}

boolean_binary_assign: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            var a;
            void 0 && (a = 1);
            console.log(a);
        }();
    }
    expect: {
        !function() {
            var a;
            void 0;
            console.log(a);
        }();
    }
    expect_stdout: "undefined"
}

cond_assign: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            var a;
            void 0 ? (a = 1) : 0;
            console.log(a);
        }();
    }
    expect: {
        !function() {
            var a;
            void 0 ? (a = 1) : 0;
            console.log(a);
        }();
    }
    expect_stdout: "undefined"
}

iife_assign: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            var a = 1, b = 0;
            !function() {
                b++;
                return;
                a = 2;
            }();
            console.log(a);
        }();
    }
    expect: {
        !function() {
            var a = 1, b = 0;
            !function() {
                b++;
                return;
                a = 2;
            }();
            console.log(a);
        }();
    }
    expect_stdout: "1"
}

issue_1850_1: {
    options = {
        reduce_vars: true,
        toplevel: false,
        unused: true,
    }
    input: {
        function f() {
            console.log(a, a, a);
        }
        var a = 1;
        f();
    }
    expect: {
        function f() {
            console.log(a, a, a);
        }
        var a = 1;
        f();
    }
    expect_stdout: true
}

issue_1850_2: {
    options = {
        reduce_vars: true,
        toplevel: "funcs",
        unused: true,
    }
    input: {
        function f() {
            console.log(a, a, a);
        }
        var a = 1;
        f();
    }
    expect: {
        var a = 1;
        (function() {
            console.log(a, a, a);
        })();
    }
    expect_stdout: true
}

issue_1850_3: {
    options = {
        reduce_vars: true,
        toplevel: "vars",
        unused: true,
    }
    input: {
        function f() {
            console.log(a, a, a);
        }
        var a = 1;
        f();
    }
    expect: {
        function f() {
            console.log(a, a, a);
        }
        var a = 1;
        f();
    }
    expect_stdout: true
}

issue_1850_4: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            console.log(a, a, a);
        }
        var a = 1;
        f();
    }
    expect: {
        var a = 1;
        (function() {
            console.log(a, a, a);
        })();
    }
    expect_stdout: true
}

issue_1865: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        function f(some) {
            some.thing = false;
        }
        console.log(function() {
            var some = { thing: true };
            f(some);
            return some.thing;
        }());
    }
    expect: {
        function f(some) {
            some.thing = false;
        }
        console.log(function() {
            var some = { thing: true };
            f(some);
            return some.thing;
        }());
    }
    expect_stdout: true
}

issue_1922_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            arguments[0] = 2;
            return a;
        }(1));
    }
    expect: {
        console.log(function(a) {
            arguments[0] = 2;
            return a;
        }(1));
    }
    expect_stdout: "2"
}

issue_1922_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a;
            eval("a = 1");
            return a;
        }(1));
    }
    expect: {
        console.log(function() {
            var a;
            eval("a = 1");
            return a;
        }(1));
    }
    expect_stdout: "1"
}

accessor: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        console.log({
            get a() {
                a = 2;
                return a;
            },
            b: 1
        }.b, a);
    }
    expect: {
        var a = 1;
        console.log({
            get a() {
                a = 2;
                return a;
            },
            b: 1
        }.b, a);
    }
    expect_stdout: "1 1"
}
