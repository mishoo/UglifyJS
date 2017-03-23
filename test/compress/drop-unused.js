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
                t = (function() {
                    return (function(a) {
                        return a;
                    })(function(a) {});
                })();
            })();
        }
    }
}
