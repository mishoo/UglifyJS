collapse_vars_constants: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
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
    }
    expect: {
        function f1(x) {
            var b = x.prop, d = sideeffect1(), e = sideeffect2();
            return b + (d - 4 * e - 5);
        }
        function f2(x) {
            var b = x.prop;
            sideeffect1();
            return b + (-4 * sideeffect2() - 5);
        }
    }
}

modified: {
    options = {
        collapse_vars: true,
        inline: true,
        unused: true,
    }
    input: {
        function f5(b) {
            var a = function() {
                return b;
            }();
            return b++ + a;
        }
        console.log(f5(1));
    }
    expect: {
        function f5(b) {
            var a = b;
            return b++ + a;
        }
        console.log(f5(1));
    }
    expect_stdout: "2"
}

ref_scope: {
    options = {
        collapse_vars: true,
        inline: true,
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
            return a + b;
        }());
    }
    expect_stdout: true
}

safe_undefined: {
    options = {
        conditionals: true,
        if_return: true,
        inline: true,
        unsafe: false,
        unused: true,
    }
    mangle = {}
    input: {
        var a, c;
        console.log(function(undefined) {
            return function() {
                if (a)
                    return b;
                if (c)
                    return d;
            };
        }(1)());
    }
    expect: {
        var a, c;
        console.log(a ? b : c ? d : void 0);
    }
    expect_stdout: true
}

negate_iife_3: {
    expression = true
    options = {
        conditionals: true,
        expression: true,
        inline: true,
        negate_iife: true,
    }
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
    }
    expect: {
        t ? console.log(true) : console.log(false);
    }
}

negate_iife_3_off: {
    expression = true
    options = {
        conditionals: true,
        expression: true,
        inline: true,
        negate_iife: false,
    }
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
    }
    expect: {
        t ? console.log(true) : console.log(false);
    }
}

negate_iife_4: {
    options = {
        conditionals: true,
        expression: true,
        inline: true,
        negate_iife: true,
        sequences: true,
    }
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
        (function(){
            console.log("something");
        })();
    }
    expect: {
        t ? console.log(true) : console.log(false), void console.log("something");
    }
}

negate_iife_5: {
    options = {
        conditionals: true,
        expression: true,
        inline: true,
        negate_iife: true,
        sequences: true,
    }
    input: {
        if ((function(){ return t })()) {
            foo(true);
        } else {
            bar(false);
        }
        (function(){
            console.log("something");
        })();
    }
    expect: {
        t ? foo(true) : bar(false), void console.log("something");
    }
}

negate_iife_5_off: {
    options = {
        conditionals: true,
        expression: true,
        inline: true,
        negate_iife: false,
        sequences: true,
    }
    input: {
        if ((function(){ return t })()) {
            foo(true);
        } else {
            bar(false);
        }
        (function(){
            console.log("something");
        })();
    }
    expect: {
        t ? foo(true) : bar(false), void console.log("something");
    }
}

issue_1254_negate_iife_true: {
    expression = true
    options = {
        expression: true,
        inline: true,
        negate_iife: true,
    }
    input: {
        (function() {
            return function() {
                console.log('test')
            };
        })()();
    }
    expect_exact: 'void console.log("test")'
    expect_stdout: true
}

issue_1254_negate_iife_nested: {
    expression = true
    options = {
        expression: true,
        inline: true,
        negate_iife: true,
    }
    input: {
        (function() {
            return function() {
                console.log('test')
            };
        })()()()()();
    }
    expect_exact: '(void console.log("test"))()()()'
}

negate_iife_issue_1073: {
    options = {
        conditionals: true,
        evaluate: true,
        inline: true,
        negate_iife: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        unused: true,
    }
    input: {
        new (function(a) {
            return function Foo() {
                this.x = a;
                console.log(this);
            };
        }(7))();
    }
    expect: {
        new function() {
            this.x = 7,
            console.log(this);
        }();
    }
    expect_stdout: true
}

issue_1288_side_effects: {
    options = {
        conditionals: true,
        evaluate: true,
        inline: true,
        negate_iife: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        if (w) ;
        else {
            (function f() {})();
        }
        if (!x) {
            (function() {
                x = {};
            })();
        }
        if (y)
            (function() {})();
        else
            (function(z) {
                return z;
            })(0);
    }
    expect: {
        w;
        x || (x = {});
        y;
    }
}

inner_var_for_in_1: {
    options = {
        evaluate: true,
        inline: true,
        reduce_funcs: true,
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
            for (b in x(1, b, c)) {
                var c = 3, d = 4;
                x(1, b, c, d);
            }
            x(1, b, c, d);
        }
    }
}

issue_1595_3: {
    options = {
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function f(a) {
            return g(a + 1);
        })(2);
    }
    expect: {
        g(3);
    }
}

issue_1758: {
    options = {
        inline: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        console.log(function(c) {
            var undefined = 42;
            return function() {
                c--;
                c--, c.toString();
                return;
            }();
        }());
    }
    expect: {
        console.log(function(c) {
            var undefined = 42;
            return c--, c--, void c.toString();
        }());
    }
    expect_stdout: "undefined"
}
wrap_iife: {
    options = {
        inline: true,
        negate_iife: false,
    }
    beautify = {
        wrap_iife: true,
    }
    input: {
        (function() {
            return function() {
                console.log('test')
            };
        })()();
    }
    expect_exact: 'void console.log("test");'
}

wrap_iife_in_expression: {
    options = {
        inline: true,
        negate_iife: false,
    }
    beautify = {
        wrap_iife: true,
    }
    input: {
        foo = (function() {
            return bar();
        })();
    }
    expect_exact: 'foo=bar();'
}

wrap_iife_in_return_call: {
    options = {
        inline: true,
        negate_iife: false,
    }
    beautify = {
        wrap_iife: true,
    }
    input: {
        (function() {
            return (function() {
                console.log('test')
            })();
        })()();
    }
    expect_exact: '(void console.log("test"))();'
}

pure_annotation_1: {
    options = {
        annotations: true,
        inline: true,
        side_effects: true,
    }
    input: {
        /*@__PURE__*/(function() {
            console.log("hello");
        }());
    }
    expect_exact: ""
}

pure_annotation_2: {
    options = {
        annotations: true,
        collapse_vars: true,
        inline: true,
        side_effects: true,
    }
    input: {
        /*@__PURE__*/(function(n) {
            console.log("hello", n);
        }(42));
    }
    expect_exact: ""
}

drop_fargs: {
    options = {
        collapse_vars: true,
        inline: true,
        keep_fargs: false,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = 1;
        !function(a_1) {
            a++;
        }(a++ + (a && console.log(a)));
        console.log(a);
    }
    expect: {
        var a = 1;
        ++a && console.log(a),
        a++;
        console.log(a);
    }
    expect_stdout: [
        "2",
        "3",
    ]
}

keep_fargs: {
    options = {
        collapse_vars: true,
        inline: true,
        keep_fargs: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = 1;
        !function(a_1) {
            a++;
        }(a++ + (a && console.log(a)));
        console.log(a);
    }
    expect: {
        var a = 1;
        ++a && console.log(a),
        a++;
        console.log(a);
    }
    expect_stdout: [
        "2",
        "3",
    ]
}
