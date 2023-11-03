unused_funarg_1: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function f(a, b, c, d, e) {
            return a + b;
        }(14, 28));
    }
    expect: {
        console.log(function(a, b) {
            return a + b;
        }(14, 28));
    }
    expect_stdout: "42"
}

unused_funarg_2: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function f(a, b, c, d, e) {
            return a + c;
        }(14, 21, 28));
    }
    expect: {
        console.log(function(a, c) {
            return a + c;
        }(14, 28));
    }
    expect_stdout: "42"
}

unused_nested_function: {
    options = {
        unused: true,
    }
    input: {
        function f(x, y) {
            function g() {
                something();
            }
            return x + y;
        }
    };
    expect: {
        function f(x, y) {
            return x + y;
        }
    }
}

unused_circular_references_1: {
    options = {
        unused: true,
    }
    input: {
        function f(x, y) {
            // circular reference
            function g() {
                return h();
            }
            function h() {
                return g();
            }
            return x + y;
        }
    };
    expect: {
        function f(x, y) {
            return x + y;
        }
    }
}

unused_circular_references_2: {
    options = {
        unused: true,
    }
    input: {
        function f(x, y) {
            var foo = 1, bar = baz, baz = foo + bar, qwe = moo();
            return x + y;
        }
    };
    expect: {
        function f(x, y) {
            moo();              // keeps side effect
            return x + y;
        }
    }
}

unused_circular_references_3: {
    options = {
        unused: true,
    }
    input: {
        function f(x, y) {
            var g = function() { return h() };
            var h = function() { return g() };
            return x + y;
        }
    };
    expect: {
        function f(x, y) {
            return x + y;
        }
    }
}

unused_keep_setter_arg: {
    options = {
        unused: true,
    }
    input: {
        var x = {
            _foo: null,
            set foo(val) {
            },
            get foo() {
                return this._foo;
            }
        }
    }
    expect: {
        var x = {
            _foo: null,
            set foo(val) {
            },
            get foo() {
                return this._foo;
            }
        }
    }
}

unused_var_in_catch: {
    options = {
        unused: true,
    }
    input: {
        function foo() {
            try {
                foo();
            } catch (ex) {
                var x = 10;
            }
        }
    }
    expect: {
        function foo() {
            try {
                foo();
            } catch (ex) {}
        }
    }
}

used_var_in_catch: {
    options = {
        unused: true,
    }
    input: {
        function foo() {
            try {
                foo();
            } catch (ex) {
                var x = 10;
            }
            return x;
        }
    }
    expect: {
        function foo() {
            try {
                foo();
            } catch (ex) {
                var x = 10;
            }
            return x;
        }
    }
}

keep_fnames: {
    options = {
        keep_fnames: true,
        unsafe: true,
        unused: true,
    }
    input: {
        function foo() {
            return function bar(baz) {};
        }
    }
    expect: {
        function foo() {
            return function bar(baz) {};
        }
    }
}

drop_assign: {
    options = {
        unused: true,
    }
    input: {
        function f1() {
            var a;
            a = 1;
        }
        function f2() {
            var a = 1;
            a = 2;
        }
        function f3(a) {
            a = 1;
        }
        function f4() {
            var a;
            return a = 1;
        }
        function f5() {
            var a;
            return function() {
                a = 1;
            };
        }
    }
    expect: {
        function f1() {
            1;
        }
        function f2() {
            2;
        }
        function f3(a) {
            1;
        }
        function f4() {
            return 1;
        }
        function f5() {
            return function() {
                1;
            };
        }
    }
}

keep_assign: {
    options = {
        unused: "keep_assign",
    }
    input: {
        function f1() {
            var a;
            a = 1;
        }
        function f2() {
            var a = 1;
            a = 2;
        }
        function f3(a) {
            a = 1;
        }
        function f4() {
            var a;
            return a = 1;
        }
        function f5() {
            var a;
            return function() {
                a = 1;
            };
        }
    }
    expect: {
        function f1() {
            var a;
            a = 1;
        }
        function f2() {
            var a = 1;
            a = 2;
        }
        function f3(a) {
            a = 1;
        }
        function f4() {
            var a;
            return a = 1;
        }
        function f5() {
            var a;
            return function() {
                a = 1;
            };
        }
    }
}

drop_toplevel_funcs: {
    options = {
        toplevel: "funcs",
        unused: true,
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a, b = 1, c = g;
        a = 2;
        function g() {}
        console.log(b = 3);
    }
}

drop_toplevel_vars: {
    options = {
        toplevel: "vars",
        unused: true,
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        function f(d) {
            return function() {
                2;
            };
        }
        2;
        function g() {}
        function h() {}
        console.log(3);
    }
}

drop_toplevel_all: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        2;
        console.log(3);
    }
}

drop_toplevel_retain: {
    options = {
        top_retain: "f,a,o",
        unused: true,
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a;
        function f(d) {
            return function() {
                2;
            };
        }
        a = 2;
        console.log(3);
    }
    expect_stdout: "3"
    expect_warnings: [
        "INFO: Retaining variable a",
        "INFO: Retaining variable f",
        "INFO: Dropping unused variable b [test/compress/drop-unused.js:1,15]",
        "INFO: Dropping unused variable c [test/compress/drop-unused.js:1,22]",
        "INFO: Dropping unused function g [test/compress/drop-unused.js:8,17]",
        "WARN: Dropping unused function h [test/compress/drop-unused.js:9,17]",
    ]
}

drop_toplevel_retain_array: {
    options = {
        top_retain: [
            "f",
            "a",
            "o"
        ],
        unused: true,
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a;
        function f(d) {
            return function() {
                2;
            };
        }
        a = 2;
        console.log(3);
    }
    expect_stdout: "3"
    expect_warnings: [
        "INFO: Retaining variable a",
        "INFO: Retaining variable f",
        "INFO: Dropping unused variable b [test/compress/drop-unused.js:1,15]",
        "INFO: Dropping unused variable c [test/compress/drop-unused.js:1,22]",
        "INFO: Dropping unused function g [test/compress/drop-unused.js:8,17]",
        "WARN: Dropping unused function h [test/compress/drop-unused.js:9,17]",
    ]
}

drop_toplevel_retain_regex: {
    options = {
        top_retain: /^[fao]$/,
        unused: true,
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a;
        function f(d) {
            return function() {
                2;
            };
        }
        a = 2;
        console.log(3);
    }
    expect_stdout: "3"
    expect_warnings: [
        "INFO: Retaining variable a",
        "INFO: Retaining variable f",
        "INFO: Dropping unused variable b [test/compress/drop-unused.js:1,15]",
        "INFO: Dropping unused variable c [test/compress/drop-unused.js:1,22]",
        "INFO: Dropping unused function g [test/compress/drop-unused.js:8,17]",
        "WARN: Dropping unused function h [test/compress/drop-unused.js:9,17]",
    ]
}

drop_toplevel_all_retain: {
    options = {
        top_retain: "f,a,o",
        toplevel: true,
        unused: true,
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a;
        function f(d) {
            return function() {
                2;
            };
        }
        a = 2;
        console.log(3);
    }
    expect_stdout: "3"
    expect_warnings: [
        "INFO: Retaining variable a",
        "INFO: Retaining variable f",
        "INFO: Dropping unused variable b [test/compress/drop-unused.js:1,15]",
        "INFO: Dropping unused variable c [test/compress/drop-unused.js:1,22]",
        "INFO: Dropping unused function g [test/compress/drop-unused.js:8,17]",
        "WARN: Dropping unused function h [test/compress/drop-unused.js:9,17]",
    ]
}

drop_toplevel_funcs_retain: {
    options = {
        top_retain: "f,a,o",
        toplevel: "funcs",
        unused: true,
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        console.log(b = 3);
    }
    expect_stdout: "3"
    expect_warnings: [
        "INFO: Retaining variable a",
        "INFO: Retaining variable f",
        "WARN: Dropping unused function h [test/compress/drop-unused.js:9,17]",
    ]
}

drop_toplevel_vars_retain: {
    options = {
        top_retain: "f,a,o",
        toplevel: "vars",
        unused: true,
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a;
        function f(d) {
            return function() {
                2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(3);
    }
    expect_stdout: "3"
    expect_warnings: [
        "INFO: Retaining variable a",
        "INFO: Retaining variable f",
        "INFO: Dropping unused variable b [test/compress/drop-unused.js:1,15]",
        "INFO: Dropping unused variable c [test/compress/drop-unused.js:1,22]",
    ]
}

drop_toplevel_keep_assign: {
    options = {
        toplevel: true,
        unused: "keep_assign",
    }
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            };
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a, b = 1;
        a = 2;
        console.log(b = 3);
    }
}

drop_fargs: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function f(a) {
            var b = a;
        }());
    }
    expect: {
        console.log(function() {}());
    }
    expect_stdout: "undefined"
}

drop_fnames: {
    options = {
        keep_fnames: false,
        unused: true,
    }
    input: {
        function f() {
            return function g() {
                var a = g;
            };
        }
    }
    expect: {
        function f() {
            return function() {};
        }
    }
}

global_var: {
    options = {
        side_effects: true,
        unused: true,
    }
    input: {
        var a;
        function foo(b) {
            a;
            b;
            c;
            typeof c === "undefined";
            c + b + a;
            b && b.ar();
            return b;
        }
    }
    expect: {
        var a;
        function foo(b) {
            c;
            c;
            b && b.ar();
            return b;
        }
    }
}

iife: {
    options = {
        side_effects: true,
        unused: true,
    }
    input: {
        function f() {
            var a;
            ~function() {}(b);
        }
    }
    expect: {
        function f() {
            b;
        }
    }
}

drop_instanceof: {
    options = {
        booleans: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {}
        console.log({} instanceof f, Math instanceof f);
    }
    expect: {
        console.log(!1, (Math, !1));
    }
    expect_stdout: "false false"
}

keep_instanceof_1: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {}
        var f;
        console.log({} instanceof f, Math instanceof f);
    }
    expect: {
        function f() {}
        var f;
        console.log({} instanceof f, Math instanceof f);
    }
    expect_stdout: "false false"
}

keep_instanceof_2: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {}
        var f = Object;
        console.log({} instanceof f, Math instanceof f);
    }
    expect: {
        function f() {}
        var f = Object;
        console.log({} instanceof f, Math instanceof f);
    }
    expect_stdout: "true true"
}

keep_instanceof_3: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        f = Object;
        function f() {}
        console.log({} instanceof f, Math instanceof f);
    }
    expect: {
        f = Object;
        function f() {}
        console.log({} instanceof f, Math instanceof f);
    }
    expect_stdout: "true true"
}

issue_1539: {
    options = {
        collapse_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f() {
            var a, b;
            a = b = 42;
            return a;
        }
    }
    expect: {
        function f() {
            return 42;
        }
    }
}

vardef_value: {
    options = {
        keep_fnames: false,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            function g(){
                return x();
            }
            var a = g();
            return a(42);
        }
    }
    expect: {
        function f() {
            var a = function(){
                return x();
            }();
            return a(42);
        }
    }
}

assign_binding: {
    options = {
        collapse_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f() {
            var a;
            a = f.g, a();
        }
    }
    expect: {
        function f() {
            (0, f.g)();
        }
    }
}

assign_chain: {
    options = {
        unused: true,
    }
    input: {
        function f() {
            var a, b;
            x = a = y = b = 42;
        }
    }
    expect: {
        function f() {
            x = y = 42;
        }
    }
}

issue_1583: {
    options = {
        keep_fargs: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function m(t) {
            (function(e) {
                t = e();
            })(function() {
                return (function(a) {
                    return a;
                })(function(a) {});
            });
        }
    }
    expect: {
        function m(t) {
            (function(e) {
                (function() {
                    return (function(a) {
                        return function(a) {};
                    })();
                })();
            })();
        }
    }
}

issue_1656: {
    options = {
        toplevel: true,
        unused: true,
    }
    beautify = {
        beautify: true,
    }
    input: {
        for (var a=0;;);
    }
    expect_exact: "for (;;);"
}

issue_1709: {
    options = {
        unused: true,
    }
    input: {
        console.log(
            function x() {
                var x = 1;
                return x;
            }(),
            function z() {
                function z() {}
                return z;
            }()
        );
    }
    expect: {
        console.log(
            function() {
                var x = 1;
                return x;
            }(),
            function() {
                function z() {}
                return z;
            }()
        );
    }
    expect_stdout: true
}

issue_1715_1: {
    options = {
        unused: true,
    }
    input: {
        var a = 1;
        function f() {
            a++;
            try {
                x();
            } catch (a) {
                var a;
            }
        }
        f();
        console.log(a);
    }
    expect: {
        var a = 1;
        function f() {
            a++;
            try {
                x();
            } catch (a) {
                var a;
            }
        }
        f();
        console.log(a);
    }
    expect_stdout: "1"
}

issue_1715_2: {
    options = {
        unused: true,
    }
    input: {
        var a = 1;
        function f() {
            a++;
            try {
                x();
            } catch (a) {
                var a = 2;
            }
        }
        f();
        console.log(a);
    }
    expect: {
        var a = 1;
        function f() {
            a++;
            try {
                x();
            } catch (a) {
                var a;
            }
        }
        f();
        console.log(a);
    }
    expect_stdout: "1"
}

issue_1715_3: {
    options = {
        unused: true,
    }
    input: {
        var a = 1;
        function f() {
            a++;
            try {
                console;
            } catch (a) {
                var a = 2 + x();
            }
        }
        f();
        console.log(a);
    }
    expect: {
        var a = 1;
        function f() {
            a++;
            try {
                console;
            } catch (a) {
                var a;
                x();
            }
        }
        f();
        console.log(a);
    }
    expect_stdout: "1"
}

issue_1715_4: {
    options = {
        unused: true,
    }
    input: {
        var a = 1;
        !function a() {
            a++;
            try {
                x();
            } catch (a) {
                var a;
            }
        }();
        console.log(a);
    }
    expect: {
        var a = 1;
        !function() {
            a++;
            try {
                x();
            } catch (a) {
                var a;
            }
        }();
        console.log(a);
    }
    expect_stdout: "1"
}

delete_assign_1: {
    options = {
        booleans: true,
        evaluate: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        console.log(delete (a = undefined));
        console.log(delete (a = void 0));
        console.log(delete (a = Infinity));
        console.log(delete (a = 1 / 0));
        console.log(delete (a = NaN));
        console.log(delete (a = 0 / 0));
    }
    expect: {
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
    }
    expect_stdout: [
        "true",
        "true",
        "true",
        "true",
        "true",
        "true",
    ]
}

delete_assign_2: {
    options = {
        booleans: true,
        evaluate: true,
        keep_infinity: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        console.log(delete (a = undefined));
        console.log(delete (a = void 0));
        console.log(delete (a = Infinity));
        console.log(delete (a = 1 / 0));
        console.log(delete (a = NaN));
        console.log(delete (a = 0 / 0));
    }
    expect: {
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
        console.log(!0);
    }
    expect_stdout: [
        "true",
        "true",
        "true",
        "true",
        "true",
        "true",
    ]
}

drop_var: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        console.log(a, b);
        var a = 1, b = 2;
        console.log(a, b);
        var a = 3;
        console.log(a, b);
    }
    expect: {
        console.log(a, b);
        var a = 1, b = 2;
        console.log(a, b);
        a = 3;
        console.log(a, b);
    }
    expect_stdout: [
        "undefined undefined",
        "1 2",
        "3 2",
    ]
}

issue_1830_1: {
    options = {
        unused: true,
    }
    input: {
        !function() {
            L: for (var b = console.log(1); !1;) continue L;
        }();
    }
    expect: {
        !function() {
            L: for (console.log(1); !1;) continue L;
        }();
    }
    expect_stdout: "1"
}

issue_1830_2: {
    options = {
        unused: true,
    }
    input: {
        !function() {
            L: for (var a = 1, b = console.log(a); --a;) continue L;
        }();
    }
    expect: {
        !function() {
            var a = 1;
            L: for (console.log(a); --a;) continue L;
        }();
    }
    expect_stdout: "1"
}

issue_1838: {
    options = {
        join_vars: true,
        loops: true,
        unused: true,
    }
    beautify = {
        beautify: true,
    }
    input: {
        function f() {
            var b = a;
            while (c);
        }
    }
    expect_exact: [
        "function f() {",
        "    for (a; c; );",
        "}",
    ]
}

var_catch_toplevel: {
    options = {
        conditionals: true,
        negate_iife: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            a--;
            try {
                a++;
                x();
            } catch (a) {
                if (a) var a;
                var a = 10;
            }
        }
        f();
    }
    expect: {
        !function() {
            try {
                x();
            } catch (a) {
                var a;
            }
        }();
    }
}

issue_2105_1: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 3,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        !function(factory) {
            factory();
        }(function() {
            return function(fn) {
                fn()().prop();
            }(function() {
                function bar() {
                    var quux = function() {
                        console.log("PASS");
                    }, foo = function() {
                        console.log;
                        quux();
                    };
                    return { prop: foo };
                }
                return bar;
            });
        });
    }
    expect: {
        ({
            prop: function() {
                console.log;
                console.log("PASS");
            }
        }).prop();
    }
    expect_stdout: "PASS"
}

issue_2105_2: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 3,
        properties: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        !function(factory) {
            factory();
        }(function() {
            return function(fn) {
                fn()().prop();
            }(function() {
                function bar() {
                    var quux = function() {
                        console.log("PASS");
                    }, foo = function() {
                        console.log;
                        quux();
                    };
                    return { prop: foo };
                }
                return bar;
            });
        });
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_2105_3: {
    options = {
        inline: true,
        join_vars: true,
        passes: 3,
        reduce_vars: true,
        side_effects: true,
        sequences: true,
        unused: true,
    }
    input: {
        !function(factory) {
            factory();
        }(function() {
            return function(fn) {
                fn()().prop();
            }(function() {
                function bar() {
                    var quux = function() {
                        console.log("PASS");
                    }, foo = function() {
                        console.log;
                        quux();
                    };
                    return { prop: foo };
                }
                return bar;
            });
        });
    }
    expect: {
        ({
            prop: function() {
                console.log,
                console.log("PASS");
            },
        }).prop();
    }
    expect_stdout: "PASS"
}

issue_2226_1: {
    options = {
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
        console.log(function(a, b) {
            return a += 2;
        }(1));
    }
    expect_stdout: "3"
}

issue_2226_3: {
    options = {
        collapse_vars: true,
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
        console.log(function(a, b) {
            return a += 2;
        }(1));
    }
    expect_stdout: "3"
}

issue_2288: {
    options = {
        unused: true,
    }
    beautify = {
        beautify: true,
    }
    input: {
        function foo(o) {
            for (var j = o.a, i = 0; i < 0; i++);
            for (var i = 0; i < 0; i++);
        }
    }
    expect: {
        function foo(o) {
            o.a;
            for (var i = 0; i < 0; i++);
            for (i = 0; i < 0; i++);
        }
    }
}

issue_2516_1: {
    options = {
        collapse_vars: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function foo() {
            function qux(x) {
                bar.call(null, x);
            }
            function bar(x) {
                var FOUR = 4;
                var trouble = x || never_called();
                var value = (FOUR - 1) * trouble;
                console.log(value == 6 ? "PASS" : value);
            }
            Baz = qux;
        }
        var Baz;
        foo();
        Baz(2);
    }
    expect: {
        function foo() {
            Baz = function(x) {
                (function(x) {
                    var trouble = x || never_called();
                    var value = (4 - 1) * trouble;
                    console.log(6 == value ? "PASS" : value);
                }).call(null, x);
            };
        }
        var Baz;
        foo();
        Baz(2);
    }
}

issue_2516_2: {
    options = {
        collapse_vars: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function foo() {
            function qux(x) {
                bar.call(null, x);
            }
            function bar(x) {
                var FOUR = 4;
                var trouble = x || never_called();
                var value = (FOUR - 1) * trouble;
                console.log(value == 6 ? "PASS" : value);
            }
            Baz = qux;
        }
        var Baz;
        foo();
        Baz(2);
    }
    expect: {
        function foo() {
            Baz = function(x) {
                (function(x) {
                    var value = (4 - 1) * (x || never_called());
                    console.log(6 == value ? "PASS" : value);
                }).call(null, x);
            };
        }
        var Baz;
        foo();
        Baz(2);
    }
}

defun_lambda_same_name: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        function f(n) {
            return n ? n * f(n - 1) : 1;
        }
        console.log(function f(n) {
            return n ? n * f(n - 1) : 1;
        }(5));
    }
    expect: {
        console.log(function f(n) {
            return n ? n * f(n - 1) : 1;
        }(5));
    }
    expect_stdout: "120"
}

issue_2660_1: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 2;
        function f(b) {
            return b && f() || a--;
        }
        f(1);
        console.log(a);
    }
    expect: {
        var a = 2;
        (function f(b) {
            return b && f() || a--;
        })(1);
        console.log(a);
    }
    expect_stdout: "1"
}

issue_2660_2: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1;
        function f(b) {
            b && f();
            --a, a.toString();
        }
        f();
        console.log(a);
    }
    expect: {
        var a = 1;
        (function f(b) {
            b && f(),
            (--a).toString();
        })(),
        console.log(a);
    }
    expect_stdout: "0"
}

issue_2665: {
    options = {
        evaluate: true,
        inline: true,
        keep_fargs: false,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        var a = 1;
        function g() {
            a-- && g();
        }
        typeof h == "function" && h();
        function h() {
            typeof g == "function" && g();
        }
        console.log(a);
    }
    expect: {
        var a = 1;
        (function g() {
            a-- && g();
        })();
        console.log(a);
    }
    expect_stdout: "-1"
}

double_assign_1: {
    options = {
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f1() {
            var a = {};
            var a = [];
            return a;
        }
        function f2() {
            var a = {};
            a = [];
            return a;
        }
        function f3() {
            a = {};
            var a = [];
            return a;
        }
        function f4(a) {
            a = {};
            a = [];
            return a;
        }
        function f5(a) {
            var a = {};
            a = [];
            return a;
        }
        function f6(a) {
            a = {};
            var a = [];
            return a;
        }
        console.log(f1(), f2(), f3(), f4(), f5(), f6());
    }
    expect: {
        function f1() {
            return [];
        }
        function f2() {
            var a;
            a = [];
            return a;
        }
        function f3() {
            return [];
        }
        function f4(a) {
            a = [];
            return a;
        }
        function f5(a) {
            a = [];
            return a;
        }
        function f6(a) {
            a = [];
            return a;
        }
        console.log(f1(), f2(), f3(), f4(), f5(), f6());
    }
    expect_stdout: true
}

double_assign_2: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var i = 0; i < 2; i++)
            a = void 0, a = {}, console.log(a);
        var a;
    }
    expect: {
        for (var i = 0; i < 2; i++)
            a = {}, console.log(a);
        var a;
    }
}

double_assign_3: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var i = 0; i < 2; i++)
            a = void 0, a = { a: a }, console.log(a);
        var a;
    }
    expect: {
        for (var i = 0; i < 2; i++)
            a = void 0, a = { a: a }, console.log(a);
        var a;
    }
}

cascade_drop_assign: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a, b = a = "PASS";
        console.log(b);
    }
    expect: {
        var b = "PASS";
        console.log(b);
    }
    expect_stdout: "PASS"
}

chained_3: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a, b) {
            var c = a, c = b;
            b++;
            return c;
        }(1, 2));
    }
    expect: {
        console.log(function(a, b) {
            var c = b;
            +b;
            return c;
        }(0, 2));
    }
    expect_stdout: "2"
}

issue_2768: {
    options = {
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL", c = 1;
        var c = function(b) {
            var d = b = a;
            var e = --b + (d && (a = "PASS"));
        }();
        console.log(a, typeof c);
    }
    expect: {
        var a = "FAIL";
        d = a;
        var c = void (d && (a = "PASS"));
        var d;
        console.log(a, typeof c);
    }
    expect_stdout: "PASS undefined"
}

issue_2846: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            var a = 0;
            b && b(a);
            return a++;
        }
        var c = f();
        console.log(c);
    }
    expect: {
        var c = function(a, b) {
            a = 0;
            b && b(a);
            return +a;
        }();
        console.log(c);
    }
    expect_stdout: "0"
}

issue_805_1: {
    options = {
        inline: true,
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(a) {
            var unused = function() {};
            unused.prototype[a()] = 42;
            (unused.prototype.bar = function() {
                console.log("bar");
            })();
            return unused;
        })(function() {
            console.log("foo");
            return "foo";
        });
    }
    expect: {
        console.log("foo"),
        console.log("bar");
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

issue_805_2: {
    options = {
        inline: true,
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(a) {
            function unused() {}
            unused.prototype[a()] = 42;
            (unused.prototype.bar = function() {
                console.log("bar");
            })();
            return unused;
        })(function() {
            console.log("foo");
            return "foo";
        });
    }
    expect: {
        console.log("foo"),
        console.log("bar");
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

issue_2995: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            a.b = b = function() {};
            b.c = "PASS";
        }
        var o = {};
        f(o);
        console.log(o.b.c);
    }
    expect: {
        function f(a) {
            var b;
            a.b = b = function() {};
            b.c = "PASS";
        }
        var o = {};
        f(o);
        console.log(o.b.c);
    }
    expect_stdout: "PASS"
}

issue_3146_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        (function(f) {
            f("g()");
        })(function(a) {
            eval(a);
            function g(b) {
                if (!b) b = "PASS";
                console.log(b);
            }
        });
    }
    expect: {
        (function(f) {
            f("g()");
        })(function(a) {
            eval(a);
            function g(b) {
                if (!b) b = "PASS";
                console.log(b);
            }
        });
    }
    expect_stdout: "PASS"
}

issue_3146_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(f) {
            f("g()");
        })(function(a) {
            eval(a);
            function g(b) {
                if (!b) b = "PASS";
                console.log(b);
            }
        });
    }
    expect: {
        (function(f) {
            f("g()");
        })(function(a) {
            eval(a);
            function g(b) {
                if (!b) b = "PASS";
                console.log(b);
            }
        });
    }
    expect_stdout: "PASS"
}

issue_3146_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var g = "PASS";
        (function(f) {
            var g = "FAIL";
            f("console.log(g)", g[g]);
        })(function(a) {
            eval(a);
        });
    }
    expect: {
        var g = "PASS";
        (function(f) {
            var g = "FAIL";
            f("console.log(g)", g[g]);
        })(function(a) {
            eval(a);
        });
    }
    expect_stdout: "PASS"
}

issue_3146_4: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        var g = "PASS";
        (function(f) {
            var g = "FAIL";
            f("console.log(g)", g[g]);
        })(function(a) {
            eval(a);
        });
    }
    expect: {
        var g = "PASS";
        (function(f) {
            var g = "FAIL";
            f("console.log(g)", g[g]);
        })(function(a) {
            eval(a);
        });
    }
    expect_stdout: "PASS"
}

issue_3192_1: {
    options = {
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
        (function(a) {
            "use strict";
            console.log("foo", arguments[0]);
        })("bar");
    }
    expect_stdout: [
        "foo foo",
        "foo bar",
    ]
}

issue_3192_2: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        "use strict";
        (function(a) {
            console.log(a = "foo", arguments[0]);
        })("bar");
    }
    expect: {
        "use strict";
        (function() {
            console.log("foo", arguments[0]);
        })("bar");
    }
    expect_stdout: "foo bar"
}

issue_3233: {
    options = {
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        var a = function b() {
            b.c = "PASS";
        };
        a();
        console.log(a.c);
    }
    expect: {
        var a = function b() {
            b.c = "PASS";
        };
        a();
        console.log(a.c);
    }
    expect_stdout: "PASS"
}

issue_3375: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var b = 1;
        var a = c = [], c = --b + ("function" == typeof f && f());
        var a = c && c[a];
        console.log(a, b);
    }
    expect: {
        var b = 1;
        var a = [], c = --b + ("function" == typeof f && f());
        a = c && c[a];
        console.log(a, b);
    }
    expect_stdout: "0 0"
}

issue_3427_1: {
    options = {
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            var a;
            a = a || {};
        })();
    }
    expect: {}
}

issue_3427_2: {
    options = {
        unused: true,
    }
    input: {
        (function() {
            var s = "PASS";
            console.log(s = s || "FAIL");
        })();
    }
    expect: {
        (function() {
            var s = "PASS";
            console.log(s = s || "FAIL");
        })();
    }
    expect_stdout: "PASS"
}

issue_3495: {
    options = {
        dead_code: true,
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function f() {
            f = 0;
            var a = f.p;
        }());
    }
    expect: {
        console.log(void 0);
    }
    expect_stdout: "undefined"
}

issue_3497: {
    options = {
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        var a;
        console.log(function(b) {
            (b += a).p = 0;
        }());
    }
    expect: {
        var a;
        console.log(function(b) {
            (b += a).p = 0;
        }());
    }
    expect_stdout: "undefined"
}

issue_3515_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var c = 0;
        (function() {
            this[c++] = 0;
            var expr20 = !0;
            for (var key20 in expr20);
        })();
        console.log(c);
    }
    expect: {
        var c = 0;
        (function() {
            for (var key20 in !(this[c++] = 0));
        })();
        console.log(c);
    }
    expect_stdout: "1"
}

issue_3515_2: {
    options = {
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        function f() {
            typeof b === "number";
            delete a;
        }
        var b = f(a = "PASS");
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        function f() {
            delete a;
        }
        f(a = "PASS");
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3515_3: {
    options = {
        collapse_vars: true,
        evaluate: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            function f() {
                c = "PASS";
            }
            var a = f();
            var a = function g(b) {
                b && (b.p = this);
            }(a);
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function() {
            function f() {
                c = "PASS";
            }
            (function(b) {
                b && (b.p = this);
            })(f());
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

function_assign: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = "PASS";
            function g(b) {
                return b;
            }
            g.p = a;
            function h(c) {
                return c;
            }
            h.p = a;
            return h;
        }().p);
    }
    expect: {
        console.log(function() {
            var a = "PASS";
            function h(c) {
                return c;
            }
            h.p = a;
            return h;
        }().p);
    }
    expect_stdout: "PASS"
}

issue_3598: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        try {
            (function() {
                var b = void 0;
                a = "PASS";
                c.p = 0;
                var c = b[!1];
            })();
        } catch (e) {}
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        try {
            (function() {
                a = "PASS";
                (void ((void 0).p = 0))[!1];
            })();
        } catch (e) {}
        console.log(a);
    }
    expect_stdout: "PASS"
}

self_assign: {
    options = {
        passes: 2,
        side_effects: true,
        unused: true,
    }
    input: {
        function d(a) {
            a = a;
        }
        function e(a, b) {
            a = b;
            b = a;
        }
        function f(a, b, c) {
            a = b;
            b = c;
            c = a;
        }
        function g(a, b, c) {
            a = a * b + c;
        }
    }
    expect: {
        function d(a) {}
        function e(a, b) {}
        function f(a, b, c) {}
        function g(a, b, c) {}
    }
}

function_argument_reference: {
    options = {
        keep_fargs: false,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = 1, b = 42;
        function f(a) {
            b <<= a;
        }
        f();
        console.log(a, b);
    }
    expect: {
        var a = 1, b = 42;
        function f(a) {
            b <<= a;
        }
        f();
        console.log(a, b);
    }
    expect_stdout: "1 42"
}

function_parameter_ie8: {
    options = {
        ie: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var a;
            function f() {
                console.log("PASS");
            }
            f(a = 1 + a);
        })();
    }
    expect: {
        (function() {
            (function() {
                console.log("PASS");
            })();
        })();
    }
    expect_stdout: "PASS"
}

issue_3664: {
    options = {
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a, b = (a = (a = [ b && console.log("FAIL") ]).p = 0, 0);
            return "PASS";
        }());
    }
    expect: {
        console.log(function() {
            a = (a = [ b && console.log("FAIL") ]).p = 0;
            var a, b = 0;
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
}

issue_3673: {
    options = {
        pure_getters: "strict",
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        (a = [ a ]).p = 42;
        console.log("PASS");
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_3746: {
    options = {
        keep_fargs: false,
        side_effects: true,
        unused: true,
    }
    input: {
        try {
            A;
        } catch (e) {
            var e;
        }
        (function f(a) {
            e = a;
        })();
        console.log("PASS");
    }
    expect: {
        try {
            A;
        } catch (e) {
            var e;
        }
        (function(a) {
            e = a;
        })();
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

drop_duplicated_side_effects: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        for (var i = 1; i--;)
            var a = 0, b = ++a;
        console.log(a);
    }
    expect: {
        var a = 0;
        for (var i = 1; i--;)
            a = 0, ++a;
        console.log(a);
    }
    expect_stdout: "1"
}

drop_duplicated_var_catch: {
    options = {
        unused: true,
    }
    input: {
        function f() {
            try {
                x();
            } catch (a) {
                var a, a;
            }
        }
    }
    expect: {
        function f() {
            try {
                x();
            } catch (a) {
                var a;
            }
        }
    }
}

issue_3802_1: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        a += 0;
        var a = function() {};
        console.log(typeof a);
    }
    expect: {
        var a = 0;
        a += 0;
        a = function() {};
        console.log(typeof a);
    }
    expect_stdout: "function"
}

issue_3802_2: {
    options = {
        functions: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        a += 0;
        var a = function() {};
        console.log(typeof a);
    }
    expect: {
        0;
        var a = function() {};
        console.log(typeof a);
    }
    expect_stdout: "function"
}

issue_3899: {
    options = {
        assignments: true,
        evaluate: true,
        functions: true,
        inline: true,
        join_vars: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        a = a + 1;
        var a = function f(b) {
            return function() {
                return b;
            };
        }(2);
        console.log(typeof a);
    }
    expect: {
        console.log(typeof function() {
            return 2;
        });
    }
    expect_stdout: "function"
}

cross_scope_assign_chain: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a, b = 0;
        (function() {
            a = b;
            a++;
            while (b++);
        })();
        console.log(a ? "PASS" : "FAIL");
    }
    expect: {
        var a, b = 0;
        (function() {
            a = b;
            a++;
            while (b++);
        })();
        console.log(a ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

assign_if_assign_read: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            var b;
            do {
                b = "FAIL";
                if (Array.isArray(a)) {
                    b = a[0];
                    console.log(b);
                }
            } while (!console);
        })([ "PASS" ]);
    }
    expect: {
        (function(a) {
            var b;
            do {
                "FAIL";
                if (Array.isArray(a)) {
                    b = a[0];
                    console.log(b);
                }
            } while (!console);
        })([ "PASS" ]);
    }
    expect_stdout: "PASS"
}

issue_3951: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = console.log("PASS");
        console.log(a);
        a = "0";
        console.log(a.p = 0);
        a && a;
    }
    expect: {
        var a = console.log("PASS");
        console.log(a);
        a = "0";
        console.log(a.p = 0);
    }
    expect_stdout: [
        "PASS",
        "undefined",
        "0",
    ]
}

issue_3956: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        passes: 3,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        (function(a) {
            function f(b) {
                console.log(b);
                a = 1;
            }
            var c = f(c += 0);
            (function(d) {
                console.log(d);
            })(console.log(a) ^ 1, c);
        })();
    }
    expect: {
        var d;
        console.log(NaN),
        d = 1 ^ console.log(1),
        console.log(d);
    }
    expect_stdout: [
        "NaN",
        "1",
        "1",
    ]
}

issue_3962_1: {
    options = {
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        function f(b, c) {
            do {
                var d = console + e, e = 0..toString() === b;
            } while (0);
            if (c) console.log("PASS");
        }
        var a = f(a--, 1);
        a;
    }
    expect: {
        var a = 0;
        (function(c) {
            do {
                console;
                0..toString();
            } while (0);
            if (c) console.log("PASS");
        })(1);
        void 0;
    }
    expect_stdout: "PASS"
}

issue_3962_2: {
    options = {
        keep_fargs: false,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        function f(b, c) {
            do {
                var d = console + e, e = 0..toString() === b;
            } while (0);
            if (c) console.log("PASS");
        }
        var a = f(a--, 1);
        a;
    }
    expect: {
        var a = 0;
        (function(c) {
            do {
                console;
                0..toString();
            } while (0);
            if (c) console.log("PASS");
        })(1);
    }
    expect_stdout: "PASS"
}

issue_3986: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0, b = 0;
        (function() {
            try {
                throw 42;
            } catch (e) {
                a++;
            }
            b = b && 0;
        })(b *= a);
        console.log(b);
    }
    expect: {
        var a = 0, b = 0;
        (function() {
            try {
                throw 42;
            } catch (e) {
                a++;
            }
            b = b && 0;
        })(b *= a);
        console.log(b);
    }
    expect_stdout: "0"
}

issue_4017_1: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = 0;
        console.log(function f() {
            var b = c &= 0;
            var c = a++ + (A = a);
            var d = c && c[f];
        }());
    }
    expect: {
        var a = 0;
        console.log(function() {
            c &= 0;
            var c = a++ + (A = a);
        }());
    }
    expect_stdout: "undefined"
}

issue_4017_2: {
    options = {
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = 0;
        console.log(function f() {
            var b = c &= 0;
            var c = a++ + (A = a);
            var d = c && c[f];
        }());
    }
    expect: {
        var a = 0;
        console.log(function() {
            0;
            a++,
            A = a;
        }());
    }
    expect_stdout: "undefined"
}

issue_4025: {
    options = {
        collapse_vars: true,
        evaluate: true,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0, b = 0, c = 0, d = a++;
        try {
            var e = console.log(c), f = b;
        } finally {
            var d = b = 1, d = c + 1;
            c = 0;
        }
        console.log(a, b, d);
    }
    expect: {
        try {
            console.log(0);
        } finally {
            0;
        }
        console.log(1, 1, 1);
    }
    expect_stdout: [
        "0",
        "1 1 1",
    ]
}

forin_var_1: {
    options = {
        unused: true,
    }
    input: {
        var k;
        for (k in [ 1, 2 ])
            console.log(k);
        for (k in { PASS: 3 })
            console.log(k);
        console.log(k);
    }
    expect: {
        for (var k in [ 1, 2 ])
            console.log(k);
        for (k in { PASS: 3 })
            console.log(k);
        console.log(k);
    }
    expect_stdout: [
        "0",
        "1",
        "PASS",
        "PASS",
    ]
}

forin_var_2: {
    options = {
        unused: true,
    }
    input: {
        console.log(function() {
            switch (0) {
              case function() {
                    for (a in 0);
                }:
                var b = 0;
            }
            for (var c = 0; a;);
            var a;
        }());
    }
    expect: {
        console.log(function() {
            switch (0) {
              case function() {
                    for (a in 0);
                }:
            }
            for (; a;);
            var a;
        }());
    }
    expect_stdout: "undefined"
}

issue_4133: {
    options = {
        evaluate: true,
        merge_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1;
        var b = [ a-- ], c = b && b[c];
        console.log(a);
    }
    expect: {
        var a = 1;
        console.log(0);
    }
    expect_stdout: "0"
}

issue_4144: {
    options = {
        keep_fargs: false,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a, b) {
            var b = console, c = ++b;
        })(console.log("PASS"), 0);
    }
    expect: {
        (function(b) {
            b = console,
            ++b;
        })(console.log("PASS"));
    }
    expect_stdout: "PASS"
}

issue_4146: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            function g() {}
            var a = g;
            var c = b;
            c.p;
            console.log(typeof a);
        }
        f("FAIL", 42);
    }
    expect: {
        (function(a, b) {
            a = function () {};
            var c = b;
            c.p;
            console.log(typeof a);
        })(0, 42);
    }
    expect_stdout: "function"
}

var_catch_redefined: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        try {
            throw "PASS";
        } catch (a) {
            function f() {
                return a;
            }
            console.log(a);
        }
        f();
    }
    expect: {
        var a = "FAIL";
        try {
            throw "PASS";
        } catch (a) {
            function f() {
                return a;
            }
            console.log(a);
        }
        f();
    }
    expect_stdout: "PASS"
}

single_use_catch_redefined: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1;
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
        }
        console.log(g());
    }
    expect: {
        var a = 1;
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
        }
        console.log(g());
    }
    expect_stdout: true
}

issue_4184: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var a = function() {}, b = [ a, 1 && b, a = {} ];
            try {
                throw 42;
            } catch (a) {
                {
                    console.log(a);
                }
            }
        })();
    }
    expect: {
        (function() {
            var b = [ function() {}, 1 && b, {} ];
            try {
                throw 42;
            } catch (a) {
                console.log(a);
            }
        })();
    }
    expect_stdout: "42"
}

issue_4235_1: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
        varify: true,
    }
    input: {
        (function() {
            {
                const f = 0;
            }
            (function f() {
                var f = console.log(f);
            })();
        })();
    }
    expect: {
        void function() {
            var f = console.log(f);
        }();
    }
    expect_stdout: "undefined"
}

issue_4235_2: {
    options = {
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unused: true,
        varify: true,
    }
    input: {
        (function() {
            {
                const f = 0;
            }
            (function f() {
                var f = console.log(f);
            })();
        })();
    }
    expect: {
        console.log(void 0);
    }
    expect_stdout: "undefined"
}

issue_4404: {
    options = {
        pure_getters: "strict",
        unused: true,
    }
    input: {
        function f(a) {
            arguments[0] = "PASS";
            console.log(a);
        }
        f("FAIL");
    }
    expect: {
        function f(a) {
            arguments[0] = "PASS";
            console.log(a);
        }
        f("FAIL");
    }
    expect_stdout: "PASS"
}

issue_4413: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function f(arguments) {
            var arguments = function() {};
            return arguments.length;
        }());
    }
    expect: {
        console.log(function(arguments) {
            return function() {}.length;
        }());
    }
    expect_stdout: "0"
}

issue_4464_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var a = function() {};
            return [ arguments, a ];
        }
        console.log(typeof f()[1]);
    }
    expect: {
        function f(a) {
            a = function() {};
            return [ arguments, a ];
        }
        console.log(typeof f()[1]);
    }
    expect_stdout: "function"
}

issue_4464_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var a = function() {};
            return [ arguments, a ];
        }
        console.log(typeof f(42)[0][0]);
    }
    expect: {
        function f(a) {
            a = function() {};
            return [ arguments, a ];
        }
        console.log(typeof f(42)[0][0]);
    }
    expect_stdout: "function"
}

issue_4464_3: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function a(a) {
            var a = function() {};
            return [ arguments[0], a ];
        })(42).forEach(function(b) {
            console.log(typeof b);
        });
    }
    expect: {
        (function(a) {
            a = function() {};
            return [ arguments[0], a ];
        })(42).forEach(function(b) {
            console.log(typeof b);
        });
    }
    expect_stdout: [
        "function",
        "function",
    ]
}

issue_4558_1: {
    options = {
        evaluate: true,
        pure_getters: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        var b = 1, b = c >>>= a;
        var c = 0;
        b && 0[a++],
        console.log(a);
    }
    expect: {
        var a = 0;
        var b = c >>>= a;
        var c = 0;
        b && a++,
        console.log(a);
    }
    expect_stdout: "0"
}

issue_4558_2: {
    options = {
        evaluate: true,
        ie: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var a = 1;
            var b = (a = NaN) || (console.log("PASS"), 2);
            return a;
        })();
    }
    expect: {
        (function() {
            var a;
            (a = NaN) || console.log("PASS");
            return a;
        })();
    }
    expect_stdout: "PASS"
}

issue_4662: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        function f(b, c) {
            console.log(b, c);
        }
        f(++a, a = a, a);
    }
    expect: {
        var a = 0;
        (function(b, c) {
            console.log(b, c);
        })(++a, a = 1);
    }
    expect_stdout: "1 1"
}

issue_4806_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        O = {
            f: function() {
                console.log(this === O ? "FAIL" : "PASS");
            },
        };
        var a;
        (a = 42, O.f)();
        a;
    }
    expect: {
        O = {
            f: function() {
                console.log(this === O ? "FAIL" : "PASS");
            },
        };
        (0, O.f)();
        42;
    }
    expect_stdout: "PASS"
}

issue_4806_2: {
    options = {
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        O = {
            f: function() {
                console.log(this === O ? "FAIL" : "PASS");
            },
        };
        var a;
        (a = 42, O.f)();
        a;
    }
    expect: {
        O = {
            f: function() {
                console.log(this === O ? "FAIL" : "PASS");
            },
        },
        (0, O.f)();
    }
    expect_stdout: "PASS"
}

issue_4806_3: {
    options = {
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        O = {
            f: function() {
                console.log(this === O ? "FAIL" : "PASS");
            },
        };
        var a;
        (a = 42, O.f)();
        a;
    }
    expect: {
        O = {
            f: function() {
                console.log(this === O ? "FAIL" : "PASS");
            },
        };
        (0, O.f)();
    }
    expect_stdout: "PASS"
}

issue_4834: {
    options = {
        inline: true,
        keep_fargs: false,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            new function(a, b) {
                b;
                b.p;
            }(42);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            b.p;
        } catch (e) {
            console.log("PASS");
        }
        var b;
    }
    expect_stdout: "PASS"
}

issue_4912_1: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = A = function() {};
        A;
        a.prototype = {
            f: function() {
                console.log("PASS");
            },
        };
        new A().f();
    }
    expect: {
        var a = A = function() {};
        A;
        a.prototype = {
            f: function() {
                console.log("PASS");
            },
        };
        new A().f();
    }
    expect_stdout: "PASS"
}

issue_4912_2: {
    options = {
        pure_getters: "strict",
        unused: true,
    }
    input: {
        console.log(function() {
            var g, f = function() {};
            f.p = {};
            (g = f.p.q = function() {}).r = "PASS";
            return f;
        }().p.q.r);
    }
    expect: {
        console.log(function() {
            var g, f = function() {};
            f.p = {};
            (f.p.q = function() {}).r = "PASS";
            return f;
        }().p.q.r);
    }
    expect_stdout: "PASS"
}

issue_4912_3: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function(f, g) {
            f = function() {};
            f.p = {};
            g = f.p.q = function() {};
            g.r = "PASS";
            return f;
        }().p.q.r);
    }
    expect: {
        console.log(function(f, g) {
            f = function() {};
            f.p = {};
            g = f.p.q = function() {};
            g.r = "PASS";
            return f;
        }().p.q.r);
    }
    expect_stdout: "PASS"
}

issue_5079: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        do {
            (a = 123456).p = a;
            a.q = null;
        } while (console.log("PASS"));
    }
    expect: {
        do {
            0, 0, null;
        } while (console.log("PASS"));
    }
    expect_stdout: "PASS"
}

issue_5224: {
    options = {
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            try {
                var b = function() {
                    var a = "FAIL 1";
                    null && a;
                    a = console.log(a);
                }(new function(c, d) {
                    console.log(d);
                    a;
                }("FAIL 2", Infinity));
            } finally {
                return f;
            }
        }
        f();
    }
    expect: {
        (function f() {
            try {
                (function() {
                    var a = "FAIL 1";
                    null;
                    console.log(a);
                })(function() {
                    console.log(1 / 0);
                    a;
                }());
            } finally {
                return f;
            }
        })();
    }
    expect_stdout: "Infinity"
}

issue_5271: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            do {
                var a = b = 0 ^ f, b = b;
            } while (console.log(42 - b));
        }
        f();
    }
    expect: {
        (function f() {
            do {
                var b;
                b = 0 ^ f;
            } while (console.log(42 - b));
        })();
    }
    expect_stdout: "42"
}

issue_5533_keep_fargs: {
    options = {
        evaluate: true,
        inline: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        side_effects: true,
        unused: true,
    }
    input: {
        "use strict";
        try {
            (function() {
                var a;
                for (; 1;)
                    a = function() {
                        (function f(b) {
                            b;
                            throw "PASS";
                        })();
                    }();
            })();
        } catch (e) {
            console.log(e);
        }
    }
    expect: {
        "use strict";
        try {
            (function() {
                for (;;)
                    throw "PASS";
            })();
        } catch (e) {
            console.log(e);
        }
    }
    expect_stdout: "PASS"
}

issue_5533_drop_fargs: {
    options = {
        evaluate: true,
        inline: true,
        join_vars: true,
        keep_fargs: false,
        loops: true,
        side_effects: true,
        unused: true,
    }
    input: {
        "use strict";
        try {
            (function() {
                var a;
                for (; 1;)
                    a = function() {
                        (function f(b) {
                            b;
                            throw "PASS";
                        })();
                    }();
            })();
        } catch (e) {
            console.log(e);
        }
    }
    expect: {
        "use strict";
        try {
            (function() {
                for (;;)
                    throw "PASS";
            })();
        } catch (e) {
            console.log(e);
        }
    }
    expect_stdout: "PASS"
}
