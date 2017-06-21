unused_funarg_1: {
    options = { unused: true, keep_fargs: false };
    input: {
        function f(a, b, c, d, e) {
            return a + b;
        }
    }
    expect: {
        function f(a, b) {
            return a + b;
        }
    }
}

unused_funarg_2: {
    options = { unused: true, keep_fargs: false };
    input: {
        function f(a, b, c, d, e) {
            return a + c;
        }
    }
    expect: {
        function f(a, b, c) {
            return a + c;
        }
    }
}

unused_nested_function: {
    options = { unused: true };
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
    options = { unused: true };
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
    options = { unused: true };
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
    options = { unused: true };
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
    options = { unused: true };
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
    options = { unused: true };
    input: {
        function foo() {
            try {
                foo();
            } catch(ex) {
                var x = 10;
            }
        }
    }
    expect: {
        function foo() {
            try {
                foo();
            } catch(ex) {}
        }
    }
}

used_var_in_catch: {
    options = { unused: true };
    input: {
        function foo() {
            try {
                foo();
            } catch(ex) {
                var x = 10;
            }
            return x;
        }
    }
    expect: {
        function foo() {
            try {
                foo();
            } catch(ex) {
                var x = 10;
            }
            return x;
        }
    }
}

unused_block_decls_in_catch: {
    options = { unused: true };
    input: {
        function foo() {
            try {
                foo();
            } catch(ex) {
                let x = 10;
                const y = 10;
                class Zee {};
            }
        }
    }
    expect: {
        function foo() {
            try {
                foo();
            } catch(ex) {}
        }
    }
}

used_block_decls_in_catch: {
    options = { unused: true };
    input: {
        function foo() {
            try {
                foo();
            } catch(ex) {
                let x = 10;
                const y = 10;
                class Zee {};
            }
            console.log(x, y, Zee);
        }
    }
    expect: {
        function foo() {
            try {
                foo();
            } catch(ex) {}
            console.log(x, y, Zee);
        }
    }
}

unused_block_decls: {
    options = { unused: true };
    input: {
        function foo() {
            {
                const x;
            }
            {
                let y;
            }
            console.log(x, y);
        }
    }
    expect: {
        function foo() {
            console.log(x, y);
        }
    }
}

unused_keep_harmony_destructuring: {
    options = { unused: true };
    input: {
        function foo() {
            var {x, y} = foo;
            var a = foo;
        }
    }
    expect:  {
        function foo() {
            var {x, y} = foo;
        }
    }
}

keep_fnames: {
    options = { unused: true, keep_fnames: true, unsafe: true };
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
    options = { unused: true };
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
            }
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
            var a;
            return function() {
                a = 1;
            }
        }
    }
}

keep_assign: {
    options = { unused: "keep_assign" };
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
            }
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
            }
        }
    }
}

drop_toplevel_funcs: {
    options = { toplevel: "funcs", unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
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
    options = { toplevel: "vars", unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        2;
        function g() {}
        function h() {}
        console.log(3);
    }
}

drop_toplevel_vars_fargs: {
    options = { keep_fargs: false, toplevel: "vars", unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var c = g;
        function f() {
            return function() {
                c = 2;
            }
        }
        2;
        function g() {}
        function h() {}
        console.log(3);
    }
}

drop_toplevel_all: {
    options = { toplevel: true, unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
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
    options = { top_retain: "f,a,o", unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        console.log(3);
    }
}

drop_toplevel_retain_array: {
    options = { top_retain: [ "f", "a", "o" ], unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        console.log(3);
    }
}

drop_toplevel_retain_regex: {
    options = { top_retain: /^[fao]$/, unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        console.log(3);
    }
}

drop_toplevel_all_retain: {
    options = { toplevel: true, top_retain: "f,a,o", unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        console.log(3);
    }
}

drop_toplevel_funcs_retain: {
    options = { toplevel: "funcs", top_retain: "f,a,o", unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
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
            }
        }
        a = 2;
        function g() {}
        console.log(b = 3);
    }
}

drop_toplevel_vars_retain: {
    options = { toplevel: "vars", top_retain: "f,a,o", unused: true };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(b = 3);
    }
    expect: {
        var a, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
        }
        a = 2;
        function g() {}
        function h() {}
        console.log(3);
    }
}

drop_toplevel_keep_assign: {
    options = { toplevel: true, unused: "keep_assign" };
    input: {
        var a, b = 1, c = g;
        function f(d) {
            return function() {
                c = 2;
            }
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
        function f(a) {
            var b = a;
        }
    }
    expect: {
        function f() {}
    }
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

drop_value: {
    options = {
        side_effects: true,
    }
    input: {
        (1, [2, foo()], 3, {a:1, b:bar()});
    }
    expect: {
        foo(), bar();
    }
}

const_assign: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            const b = 2;
            return 1 + b;
        }

        function g() {
            const b = 2;
            b = 3;
            return 1 + b;
        }
    }
    expect: {
        function f() {
            return 3;
        }

        function g() {
            const b = 2;
            b = 3;
            return 1 + b;
        }
    }
}

issue_1539: {
    options = {
        cascade: true,
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
        cascade: true,
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
                t = e();
            })(function() {
                return (function(a) {
                    return a;
                })(function(a) {});
            });
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
        for(var a=0;;);
    }
    expect_exact: "for (;;) ;"
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
            function y() {
                const y = 2;
                return y;
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
                const y = 2;
                return y;
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
        side_effects: true,
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
        console.log((void 0, !0));
        console.log((void 0, !0));
        console.log((1 / 0, !0));
        console.log((1 / 0, !0));
        console.log((NaN, !0));
        console.log((0 / 0, !0));
    }
    expect_stdout: true
}

delete_assign_2: {
    options = {
        booleans: true,
        keep_infinity: true,
        side_effects: true,
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
        console.log((void 0, !0));
        console.log((void 0, !0));
        console.log((Infinity, !0));
        console.log((1 / 0, !0));
        console.log((NaN, !0));
        console.log((0 / 0, !0));
    }
    expect_stdout: true
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
        "    for (a; c; ) ;",
        "}",
    ]
}

var_catch_toplevel: {
    options = {
        conditionals: true,
        negate_iife: true,
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
            } catch(a) {
                if (a) var a;
                var a = 10;
            }
        }
        f();
    }
    expect: {
        !function() {
            a--;
            try {
                a++;
            } catch(a) {
                var a;
            }
        }();
    }
}

reassign_const: {
    options = {
        cascade: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f() {
            const a = 1;
            a = 2;
            return a;
        }
        console.log(f());
    }
    expect: {
        function f() {
            const a = 1;
            return a = 2, a;
        }
        console.log(f());
    }
    expect_stdout: true
}

issue_1968: {
    options = {
        unused: true,
    }
    input: {
        function f(c) {
            var a;
            if (c) {
                let b;
                return (a = 2) + (b = 3);
            }
        }
        console.log(f(1));
    }
    expect: {
        function f(c) {
            if (c) {
                let b;
                return 2 + (b = 3);
            }
        }
        console.log(f(1));
    }
    expect_stdout: "5"
    node_version: ">=6"
}

issue_2063: {
    options = {
        unused: true,
    }
    input: {
        var a;
        var a;
    }
    expect: {
        var a;
        var a;
    }
}

issue_2105: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        !function(factory) {
            factory();
        }( function() {
            return function(fn) {
                fn()().prop();
            }( function() {
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
            } );
        });
    }
    expect: {
        !void function() {
            var quux = function() {
                console.log("PASS");
            };
            return {
                prop: function() {
                    console.log;
                    quux();
                }
            };
        }().prop();
    }
    expect_stdout: "PASS"
}

issue_2136_1: {
    options = {
        inline: true,
        unused: true,
    }
    input: {
        !function(a, ...b) {
            console.log(b);
        }();
    }
    expect: {
        !function(a, ...b) {
            console.log(b);
        }();
    }
    expect_stdout: "[]"
    node_version: ">=6"
}

issue_2136_2: {
    options = {
        collapse_vars: true,
        inline: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x) {
            console.log(x);
        }
        !function(a, ...b) {
            f(b[0]);
        }(1, 2, 3);
    }
    expect: {
        function f(x) {
            console.log(x);
        }
        f([2,3][0]);
    }
    expect_stdout: "2"
    node_version: ">=6"
}

issue_2136_3: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        passes: 3,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        function f(x) {
            console.log(x);
        }
        !function(a, ...b) {
            f(b[0]);
        }(1, 2, 3);
    }
    expect: {
        console.log(2);
    }
    expect_stdout: "2"
    node_version: ">=6"
}
