keep_fargs_false: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function f(a) {
            return f.length;
        }(), function g(b) {
            return g;
        }().length);
        function h(c) {
            return h.length;
        }
        function i(d) {
            return i;
        }
        function j(e) {}
        console.log(h(), i().length, j.length);
    }
    expect: {
        console.log(function f() {
            return f.length;
        }(), function g() {
            return g;
        }().length);
        function h() {
            return h.length;
        }
        function i() {
            return i;
        }
        function j() {}
        console.log(h(), i().length, j.length);
    }
}

keep_fargs_strict: {
    options = {
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        console.log(function f(a) {
            return f.length;
        }(), function g(b) {
            return g;
        }().length);
        function h(c) {
            return h.length;
        }
        function i(d) {
            return i;
        }
        function j(e) {}
        console.log(h(), i().length, j.length);
    }
    expect: {
        console.log(function f(a) {
            return f.length;
        }(), function g(b) {
            return g;
        }().length);
        function h(c) {
            return h.length;
        }
        function i(d) {
            return i;
        }
        function j(e) {}
        console.log(h(), i().length, j.length);
    }
    expect_stdout: [
        "1 1",
        "1 1 1",
    ]
}

keep_fargs_true: {
    options = {
        keep_fargs: true,
        unused: true,
    }
    input: {
        console.log(function f(a) {
            return f.length;
        }(), function g(b) {
            return g;
        }().length);
        function h(c) {
            return h.length;
        }
        function i(d) {
            return i;
        }
        function j(e) {}
        console.log(h(), i().length, j.length);
    }
    expect: {
        console.log(function f(a) {
            return f.length;
        }(), function g(b) {
            return g;
        }().length);
        function h(c) {
            return h.length;
        }
        function i(d) {
            return i;
        }
        function j(e) {}
        console.log(h(), i().length, j.length);
    }
    expect_stdout: [
        "1 1",
        "1 1 1",
    ]
}

replace_index: {
    options = {
        arguments: true,
        evaluate: true,
        keep_fargs: "strict",
        properties: true,
    }
    input: {
        var arguments = [];
        console.log(arguments[0]);
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        var arguments = [];
        console.log(arguments[0]);
        (function(argument_0, argument_1) {
            console.log(argument_1, argument_1, arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "undefined",
        "42 42 undefined",
        "42 42 undefined",
        "a a undefined",
        "42 42 undefined",
    ]
}

replace_index_strict: {
    options = {
        arguments: true,
        evaluate: true,
        keep_fargs: "strict",
        properties: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        "use strict";
        (function(argument_0, argument_1) {
            console.log(argument_1, argument_1, arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "42 42 undefined",
        "42 42 undefined",
    ]
}

issue_1858: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        pure_getters: true,
        unused: true,
    }
    input: {
        console.log(function(x) {
            var a = {}, b = a.b = x;
            return a.b + b;
        }(1));
    }
    expect: {
        console.log(function() {
            var a = {}, b = a.b = 1;
            return a.b + b;
        }());
    }
    expect_stdout: "2"
}

issue_2187_2: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        var b = 1;
        console.log(function(a) {
            return a && ++b;
        }(b--));
    }
    expect: {
        var b = 1;
        console.log(function() {
            return b-- && ++b;
        }());
    }
    expect_stdout: "1"
}

issue_2203_2: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        a = "PASS";
        console.log({
            a: "FAIL",
            b: function() {
                return function(c) {
                    return c.a;
                }((String, (Object, function() {
                    return this;
                }())));
            }
        }.b());
    }
    expect: {
        a = "PASS";
        console.log({
            a: "FAIL",
            b: function() {
                return function() {
                    return (String, (Object, function() {
                        return this;
                    }())).a;
                }();
            }
        }.b());
    }
    expect_stdout: "PASS"
}

issue_2298: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            function f() {
                var a = undefined;
                var undefined = a++;
                try {
                    !function g(b) {
                        b[1] = "foo";
                    }();
                    console.log("FAIL");
                } catch (e) {
                    console.log("PASS");
                }
            }
            f();
        }();
    }
    expect: {
        !function() {
            (function() {
                var a = undefined;
                var undefined = a++;
                try {
                    !function() {
                        (void 0)[1] = "foo";
                    }();
                    console.log("FAIL");
                } catch (e) {
                    console.log("PASS");
                }
            })();
        }();
    }
    expect_stdout: "PASS"
}

issue_2319_1: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        console.log(function(a) {
            return a;
        }(!function() {
            return this;
        }()));
    }
    expect: {
        console.log(function() {
            return !function() {
                return this;
            }();
        }());
    }
    expect_stdout: "false"
}

issue_2319_2: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        console.log(function(a) {
            "use strict";
            return a;
        }(!function() {
            return this;
        }()));
    }
    expect: {
        console.log(function(a) {
            "use strict";
            return a;
        }(!function() {
            return this;
        }()));
    }
    expect_stdout: "false"
}

issue_2319_3: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        "use strict";
        console.log(function(a) {
            return a;
        }(!function() {
            return this;
        }()));
    }
    expect: {
        "use strict";
        console.log(function() {
            return !function() {
                return this;
            }();
        }());
    }
    expect_stdout: "true"
}

issue_2425_1: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        var a = 8;
        (function(b) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect: {
        var a = 8;
        (function(b) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect_stdout: "15"
}

issue_2425_2: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        var a = 8;
        (function(b, c) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect: {
        var a = 8;
        (function(b) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect_stdout: "15"
}

issue_2425_3: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        var a = 8;
        (function(b, b) {
            b.toString();
        })(--a, a |= 10);
        console.log(a);
    }
    expect: {
        var a = 8;
        (function() {
            (a |= 10).toString();
        })(--a);
        console.log(a);
    }
    expect_stdout: "15"
}

issue_2436_13: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function() {
            function f(b) {
                (function g(b) {
                    var b = b && (b.null = "FAIL");
                })(a);
            }
            f();
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function() {
            (function() {
                (function() {
                    a && (a.null = "FAIL");
                })();
            })();
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2506: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var c = 0;
        function f0(bar) {
            function f1(Infinity_2) {
                function f13(NaN) {
                    if (false <= NaN & this >> 1 >= 0) {
                        c++;
                    }
                }
                var b_2 = f13(NaN, c++);
            }
            var bar = f1(-3, -1);
        }
        f0(false);
        console.log(c);
    }
    expect: {
        var c = 0;
        function f0(bar) {
            (function() {
                (function() {
                    if (false <= 0/0 & this >> 1 >= 0)
                        c++;
                })(c++);
            })();
        }
        f0(false);
        console.log(c);
    }
    expect_stdout: "1"
}

issue_2226_1: {
    options = {
        keep_fargs: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        function f1() {
            var a = b;
            a += c;
        }
        function f2(a) {
            a <<= b;
        }
        function f3(a) {
            --a;
        }
        function f4() {
            var a = b;
            return a *= c;
        }
        function f5(a) {
            x(a /= b);
        }
    }
    expect: {
        function f1() {
            b;
            c;
        }
        function f2(a) {
            b;
        }
        function f3(a) {
            0;
        }
        function f4() {
            var a = b;
            return a *= c;
        }
        function f5(a) {
            x(a /= b);
        }
    }
}

issue_2226_2: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function(a, b) {
            a += b;
            return a;
        }(1, 2));
    }
    expect: {
        console.log(function(a) {
            return a += 2;
        }(1));
    }
    expect_stdout: "3"
}

issue_2226_3: {
    options = {
        collapse_vars: true,
        keep_fargs: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function(a, b) {
            a += b;
            return a;
        }(1, 2));
    }
    expect: {
        console.log(function(a) {
            return a += 2;
        }(1));
    }
    expect_stdout: "3"
}

issue_3192: {
    options = {
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        (function(a) {
            console.log(a = "foo", arguments[0]);
        })("bar");
        (function(a) {
            "use strict";
            console.log(a = "foo", arguments[0]);
        })("bar");
    }
    expect: {
        (function(a) {
            console.log(a = "foo", arguments[0]);
        })("bar");
        (function() {
            "use strict";
            console.log("foo", arguments[0]);
        })("bar");
    }
    expect_stdout: [
        "foo foo",
        "foo bar",
    ]
}

if_increment: {
    options = {
        evaluate: true,
        keep_fargs: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            if (console)
                return ++a;
        }(0));
    }
    expect: {
        console.log(function() {
            if (console)
                return 1;
        }());
    }
    expect_stdout: "1"
}

try_increment: {
    options = {
        evaluate: true,
        keep_fargs: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            try {
                return ++a;
            } catch (e) {}
        }(0));
    }
    expect: {
        console.log(function() {
            try {
                return 1;
            } catch (e) {}
        }());
    }
    expect_stdout: "1"
}

issue_2630_3: {
    options = {
        inline: true,
        keep_fargs: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        var x = 2, a = 1;
        (function() {
            function f1(a) {
                f2();
                --x >= 0 && f1({});
            }
            f1(a++);
            function f2() {
                a++;
            }
        })();
        console.log(a);
    }
    expect: {
        var x = 2, a = 1;
        (function() {
            (function f1() {
                f2();
                --x >= 0 && f1({});
            })(a++);
            function f2() {
                a++;
            }
        })();
        console.log(a);
    }
    expect_stdout: "5"
}

issue_3364: {
    options = {
        functions: true,
        keep_fargs: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    mangle = {}
    input: {
        var s = 2, a = 100, b = 10, c = 0;
        function f(p, e, r) {
            try {
                for (var i = 1; i-- > 0;)
                    var a = function(x) {
                        function g(y) {
                            y && y[a++];
                        }
                        var x = g(--s >= 0 && f(c++));
                        for (var j = 1; --j > 0;);
                    }();
            } catch (e) {
                try {
                    return;
                } catch (z) {
                    for (var k = 1; --k > 0;) {
                        for (var l = 1; l > 0; --l) {
                            var n = function() {};
                            for (var k in n)
                                var o = (n, k);
                        }
                    }
                }
            }
        }
        var r = f();
        console.log(c);
    }
    expect: {
        var s = 2, c = 0;
        (function o() {
            try {
                for (var r = 1; r-- > 0;)
                    var n = function() {
                        (function(r) {
                            r && r[n++];
                        })(--s >= 0 && o(c++));
                        for (var r = 1; --r > 0;);
                    }();
            } catch (r) {
                try {
                    return;
                } catch (r) {
                    for (var a = 1; --a > 0;)
                        for (var f = 1; f > 0; --f) {
                            function t() {}
                            for (var a in t);
                        }
                }
            }
        })();
        console.log(c);
    }
    expect_stdout: "2"
}

defun_label: {
    options = {
        keep_fargs: "strict",
        passes: 2,
        reduce_funcs: true,
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
            console.log(function() {
                L: {
                    if (2) break L;
                    return 1;
                }
            }());
        }();
    }
    expect_stdout: true
}

iife_func_side_effects: {
    options = {
        keep_fargs: "strict",
        reduce_funcs: true,
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
        (function(a, b) {
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
        keep_fargs: "strict",
        reduce_funcs: true,
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
        keep_fargs: "strict",
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
        (function(a) {
            return g(a + 1);
        })(2);
    }
}

issue_1595_3: {
    options = {
        evaluate: true,
        keep_fargs: "strict",
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
        (function() {
            return g(3);
        })();
    }
}

issue_1595_4: {
    options = {
        evaluate: true,
        keep_fargs: "strict",
        reduce_funcs: true,
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

duplicate_lambda_defun_name_1: {
    options = {
        keep_fargs: "strict",
        reduce_vars: true,
    }
    input: {
        console.log(function f(a) {
            function f() {}
            return f.length;
        }());
    }
    expect: {
        console.log(function f(a) {
            function f() {}
            return f.length;
        }());
    }
    expect_stdout: "0"
}

duplicate_lambda_defun_name_2: {
    options = {
        keep_fargs: "strict",
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function f(a) {
            function f() {}
            return f.length;
        }());
    }
    expect: {
        console.log(function() {
            return function() {}.length;
        }());
    }
    expect_stdout: "0"
}

function_name_mangle: {
    options = {
        keep_fargs: "strict",
        keep_fnames: true,
        reduce_vars: true,
        unused: true,
    }
    mangle = {}
    input: {
        (function() {
            function foo(bar) {}
            console.log(typeof foo);
        })();
    }
    expect_exact: "(function(){console.log(typeof function o(){})})();"
    expect_stdout: "function"
}

function_name_mangle_ie8: {
    options = {
        keep_fargs: "strict",
        keep_fnames: true,
        reduce_vars: true,
        unused: true,
    }
    mangle = {
        ie8: true,
        toplevel: true,
    }
    input: {
        (function() {
            function foo(bar) {}
            console.log(typeof foo);
        })();
    }
    expect_exact: "(function(){console.log(typeof function o(){})})();"
    expect_stdout: "function"
}

issue_3420_1: {
    options = {
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        console.log(function() {
            return function(a, b, c, d) {
                return a + b;
            };
        }().length);
    }
    expect: {
        console.log(function() {
            return function(a, b, c, d) {
                return a + b;
            };
        }().length);
    }
    expect_stdout: "4"
}

issue_3420_2: {
    options = {
        inline: true,
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        console.log(function() {
            return function(a, b, c, d) {
                return a + b;
            };
        }().length);
    }
    expect: {
        console.log(function(a, b, c, d) {
            return a + b;
        }.length);
    }
    expect_stdout: "4"
}

issue_3420_3: {
    options = {
        inline: true,
        keep_fargs: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            function f(a, b, c, d) {
                return a + b;
            }
            return f;
        }().length);
    }
    expect: {
        console.log(function(a, b, c, d) {
            return a + b;
        }.length);
    }
    expect_stdout: "4"
}

issue_3423_1: {
    options = {
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        function f(g) {
            console.log(g.length);
        }
        f(function(a) {});
    }
    expect: {
        function f(g) {
            console.log(g.length);
        }
        f(function(a) {});
    }
    expect_stdout: "1"
}

issue_3423_2: {
    options = {
        keep_fargs: "strict",
        unused: true,
    }
    input: {
        new function(a) {
            console.log(this.constructor.length);
        }();
    }
    expect: {
        new function(a) {
            console.log(this.constructor.length);
        }();
    }
    expect_stdout: "1"
}
