non_ascii_function_identifier_name: {
    input: {
        function fooλ(δλ) {}
        function λ(δλ) {}
        (function λ(δλ) {})()
    }
    expect_exact: "function fooλ(δλ){}function λ(δλ){}(function λ(δλ){})();"
}

iifes_returning_constants_keep_fargs_true: {
    options = {
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        inline: true,
        join_vars: true,
        keep_fargs: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(){ return -1.23; }());
        console.log( function foo(){ return "okay"; }() );
        console.log( function foo(x, y, z){ return 123; }() );
        console.log( function(x, y, z){ return z; }() );
        console.log( function(x, y, z){ if (x) return y; return z; }(1, 2, 3) );
        console.log( function(x, y){ return x * y; }(2, 3) );
        console.log( function(x, y){ return x * y; }(2, 3, a(), b()) );
    }
    expect: {
        console.log("okay");
        console.log(123);
        console.log(void 0);
        console.log(2);
        console.log(6);
        console.log((a(), b(), 6));
    }
    expect_stdout: true
}

iifes_returning_constants_keep_fargs_false: {
    options = {
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        inline: true,
        join_vars: true,
        keep_fargs: false,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(){ return -1.23; }());
        console.log( function foo(){ return "okay"; }() );
        console.log( function foo(x, y, z){ return 123; }() );
        console.log( function(x, y, z){ return z; }() );
        console.log( function(x, y, z){ if (x) return y; return z; }(1, 2, 3) );
        console.log( function(x, y){ return x * y; }(2, 3) );
        console.log( function(x, y){ return x * y; }(2, 3, a(), b()) );
    }
    expect: {
        console.log("okay");
        console.log(123);
        console.log(void 0);
        console.log(2);
        console.log(6);
        console.log((a(), b(), 6));
    }
    expect_stdout: true
}

issue_485_crashing_1530: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        inline: true,
        side_effects: true,
    }
    input: {
        (function(a) {
            if (true) return;
            var b = 42;
        })(this);
    }
    expect: {}
}

issue_1841_1: {
    options = {
        keep_fargs: false,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var b = 10;
        !function(arg) {
            for (var key in "hi")
                var n = arg.baz, n = [ b = 42 ];
        }(--b);
        console.log(b);
    }
    expect: {
        var b = 10;
        !function() {
            for (var key in "hi")
                b = 42;
        }(--b);
        console.log(b);
    }
    expect_exact: "42"
}

issue_1841_2: {
    options = {
        keep_fargs: false,
        pure_getters: false,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var b = 10;
        !function(arg) {
            for (var key in "hi")
                var n = arg.baz, n = [ b = 42 ];
        }(--b);
        console.log(b);
    }
    expect: {
        var b = 10;
        !function(arg) {
            for (var key in "hi")
                arg.baz, b = 42;
        }(--b);
        console.log(b);
    }
    expect_exact: "42"
}

function_returning_constant_literal: {
    options = {
        inline: true,
        passes: 2,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function greeter() {
            return { message: 'Hello there' };
        }
        var greeting = greeter();
        console.log(greeting.message);
    }
    expect: {
        console.log("Hello there");
    }
    expect_stdout: "Hello there"
}

hoist_funs: {
    options = {
        hoist_funs: true,
    }
    input: {
        console.log(1, typeof f, typeof g);
        if (console.log(2, typeof f, typeof g))
            console.log(3, typeof f, typeof g);
        else {
            console.log(4, typeof f, typeof g);
            function f() {}
            console.log(5, typeof f, typeof g);
        }
        function g() {}
        console.log(6, typeof f, typeof g);
    }
    expect: {
        function f() {}
        function g() {}
        console.log(1, typeof f, typeof g);
        if (console.log(2, typeof f, typeof g))
            console.log(3, typeof f, typeof g);
        else {
            console.log(4, typeof f, typeof g);
            console.log(5, typeof f, typeof g);
        }
        console.log(6, typeof f, typeof g);
    }
    expect_stdout: [
        "1 'function' 'function'",
        "2 'function' 'function'",
        "4 'function' 'function'",
        "5 'function' 'function'",
        "6 'function' 'function'",
    ]
    node_version: "<=4"
}

issue_203: {
    options = {
        keep_fargs: false,
        side_effects: true,
        unsafe_Function: true,
        unused: true,
    }
    input: {
        var m = {};
        var fn = Function("require", "module", "exports", "module.exports = 42;");
        fn(null, m, m.exports);
        console.log(m.exports);
    }
    expect: {
        var m = {};
        var fn = Function("n,o,t", "o.exports=42");
        fn(null, m, m.exports);
        console.log(m.exports);
    }
    expect_stdout: "42"
}

issue_2084: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        !function() {
            !function(c) {
                c = 1 + c;
                var c = 0;
                function f14(a_1) {
                    if (c = 1 + c, 0 !== 23..toString())
                        c = 1 + c, a_1 && (a_1[0] = 0);
                }
                f14();
            }(-1);
        }();
        console.log(c);
    }
    expect: {
        var c = 0;
        23..toString(),
        console.log(c);
    }
    expect_stdout: "0"
}

issue_2097: {
    options = {
        negate_iife: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            try {
                throw 0;
            } catch (e) {
                console.log(arguments[0]);
            }
        }
        f(1);
    }
    expect: {
        !function() {
            try {
                throw 0;
            } catch (e) {
                console.log(arguments[0]);
            }
        }(1);
    }
    expect_stdout: "1"
}

issue_2101: {
    options = {
        inline: true,
    }
    input: {
        a = {};
        console.log(function() {
            return function() {
                return this.a;
            }();
        }() === function() {
            return a;
        }());
    }
    expect: {
        a = {};
        console.log(function() {
            return this.a;
        }() === a);
    }
    expect_stdout: "true"
}

inner_ref: {
    options = {
        inline: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            return function() {
                return a;
            }();
        }(1), function(a) {
            return function(a) {
                return a;
            }();
        }(2));
    }
    expect: {
        console.log(1, void 0);
    }
    expect_stdout: "1 undefined"
}

issue_2107: {
    options = {
        assignments: true,
        collapse_vars: true,
        inline: true,
        passes: 3,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        !function() {
            c++;
        }(c++ + new function() {
            this.a = 0;
            var a = (c = c + 1) + (c = 1 + c);
            return c++ + a;
        }());
        console.log(c);
    }
    expect: {
        var c = 0;
        c++, new function() {
            this.a = 0, c = 1 + (c += 1), c++;
        }(), c++, console.log(c);
    }
    expect_stdout: "5"
}

issue_2114_1: {
    options = {
        assignments: true,
        collapse_vars: true,
        if_return: true,
        inline: true,
        keep_fargs: false,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        !function(a) {
            a = 0;
        }([ {
            0: c = c + 1,
            length: c = 1 + c
        }, typeof void function a() {
            var b = function f1(a) {
            }(b && (b.b += (c = c + 1, 0)));
        }() ]);
        console.log(c);
    }
    expect: {
        var c = 0;
        c = 1 + (c += 1), function() {
            var b = void (b && (b.b += (c += 1, 0)));
        }();
        console.log(c);
    }
    expect_stdout: "2"
}

issue_2114_2: {
    options = {
        assignments: true,
        collapse_vars: true,
        if_return: true,
        inline: true,
        keep_fargs: false,
        passes: 2,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        !function(a) {
            a = 0;
        }([ {
            0: c = c + 1,
            length: c = 1 + c
        }, typeof void function a() {
            var b = function f1(a) {
            }(b && (b.b += (c = c + 1, 0)));
        }() ]);
        console.log(c);
    }
    expect: {
        var c = 0;
        c = 1 + (c += 1), function() {
            var b = void (b && (b.b += (c += 1, 0)));
        }();
        console.log(c);
    }
    expect_stdout: "2"
}

issue_2428: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 3,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        function bar(k) {
            console.log(k);
        }
        function foo(x) {
            return bar(x);
        }
        function baz(a) {
            foo(a);
        }
        baz(42);
        baz("PASS");
    }
    expect: {
        function baz(a) {
            console.log(a);
        }
        baz(42);
        baz("PASS");
    }
    expect_stdout: [
        "42",
        "PASS",
    ]
}

issue_2531_1: {
    options = {
        evaluate: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function outer() {
            function inner(value) {
                function closure() {
                    return value;
                }
                return function() {
                    return closure();
                };
            }
            return inner("Hello");
        }
        console.log("Greeting:", outer()());
    }
    expect: {
        function outer() {
            return value = "Hello", function() {
                return value;
            };
            var value;
        }
        console.log("Greeting:", outer()());
    }
    expect_stdout: "Greeting: Hello"
}

issue_2531_2: {
    options = {
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function outer() {
            function inner(value) {
                function closure() {
                    return value;
                }
                return function() {
                    return closure();
                };
            }
            return inner("Hello");
        }
        console.log("Greeting:", outer()());
    }
    expect: {
        function outer() {
            return function() {
                return "Hello";
            };
        }
        console.log("Greeting:", outer()());
    }
    expect_stdout: "Greeting: Hello"
}

issue_2531_3: {
    options = {
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function outer() {
            function inner(value) {
                function closure() {
                    return value;
                }
                return function() {
                    return closure();
                };
            }
            return inner("Hello");
        }
        console.log("Greeting:", outer()());
    }
    expect: {
        console.log("Greeting:", "Hello");
    }
    expect_stdout: "Greeting: Hello"
}

empty_body: {
    options = {
        reduce_vars: true,
        side_effects: true,
    }
    input: {
        function f() {
            function noop() {}
            noop();
            return noop;
        }
    }
    expect: {
        function f() {
            function noop() {}
            return noop;
        }
    }
}

inline_binary_and: {
    options = {
        inline: true,
    }
    input: {
        console.log(function() {
            (function() {
                while (console.log("foo"));
                return "bar";
            })() && (function() {
                while (console.log("baz"));
                return "moo";
            })();
        }());
    }
    expect: {
        console.log(function() {
            if (function() {
                while (console.log("foo"));
                return "bar";
            }()) {
                while (console.log("baz"));
                return void "moo";
                return;
            } else
                return void 0;
        }());
    }
    expect_stdout: [
        "foo",
        "baz",
        "undefined",
    ]
}

inline_binary_or: {
    options = {
        inline: true,
    }
    input: {
        (function() {
            while (console.log("foo"));
        })() || (function() {
            while (console.log("bar"));
        })();
    }
    expect: {
        if (!function() {
            while (console.log("foo"));
        }())
            while (console.log("bar"));
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

inline_conditional: {
    options = {
        inline: true,
    }
    input: {
        (function() {
            while (console.log("foo"));
        })() ? (function() {
            while (console.log("bar"));
        })() : (function() {
            while (console.log("baz"));
        })();
    }
    expect: {
        if (function() {
            while (console.log("foo"));
        }())
            while (console.log("bar"));
        else
            while (console.log("baz"));
    }
    expect_stdout: [
        "foo",
        "baz",
    ]
}

inline_do: {
    options = {
        inline: true,
    }
    input: {
        do (function() {
            while (console.log("foo"));
        })();
        while (function() {
            while (console.log("bar"));
        }());
    }
    expect: {
        do {
            while (console.log("foo"));
        } while (function() {
            while (console.log("bar"));
        }());
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

inline_finally_return: {
    options = {
        inline: true,
    }
    input: {
        console.log(function() {
            try {
                throw "FAIL";
            } finally {
                return function() {
                    while (console.log("PASS"));
                }(), 42;
            }
        }());
    }
    expect: {
        console.log(function() {
            try {
                throw "FAIL";
            } finally {
                while (console.log("PASS"));
                return 42;
            }
        }());
    }
    expect_stdout: [
        "PASS",
        "42",
    ]
}

inline_for_init: {
    options = {
        inline: true,
    }
    input: {
        for (function() {
            while (console.log("foo"));
        }(); function() {
            while (console.log("bar"));
        }(); function() {
            while (console.log("baz"));
        }()) (function() {
            while (console.log("moo"));
        })();
    }
    expect: {
        while (console.log("foo"));
        for (; function() {
            while (console.log("bar"));
        }(); function() {
            while (console.log("baz"));
        }()) {
            while (console.log("moo"));
        }
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

inline_for_object: {
    options = {
        inline: true,
    }
    input: {
        for (var a in function() {
            while (console.log("foo"));
        }(), function() {
            while (console.log("bar"));
        }()) (function() {
            while (console.log("baz"));
        })();
    }
    expect: {
        while (console.log("foo"));
        for (var a in function() {
            while (console.log("bar"));
        }()) {
            while (console.log("baz"));
        }
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

inline_if_else: {
    options = {
        inline: true,
    }
    input: {
        if (function() {
            while (console.log("foo"));
        }(), function() {
            while (console.log("bar"));
        }()) (function() {
            while (console.log("baz"));
        })();
        else (function() {
            while (console.log("moo"));
        })();
    }
    expect: {
        while (console.log("foo"));
        if (function() {
            while (console.log("bar"));
        }()) {
            while (console.log("baz"));
        } else {
            while (console.log("moo"));
        }
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
    ]
}

inline_label: {
    options = {
        inline: true,
    }
    input: {
        L: (function() {
            while (console.log("PASS"));
        })()
    }
    expect: {
        L: {
            while (console.log("PASS"));
        }
    }
    expect_stdout: "PASS"
}

inline_loop_1: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            return x();
        }
        for (;;) f();
    }
    expect: {
        for (;;) x();
    }
}

inline_loop_2: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (;;) f();
        function f() {
            return x();
        }
    }
    expect: {
        for (;;) x();
    }
}

inline_loop_3: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var f = function() {
            return x();
        };
        for (;;) f();
    }
    expect: {
        for (;;) x();
    }
}

inline_loop_4: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (;;) f();
        var f = function() {
            return x();
        };
    }
    expect: {
        for (;;) f();
        var f = function() {
            return x();
        };
    }
}

inline_loop_5: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        for (var a in "foo") {
            (function() {
                function f() {}
                var f;
                console.log(typeof f, a - f);
            })();
        }
    }
    expect: {
        for (var a in "foo")
            f = void 0,
            f = function() {},
            void console.log(typeof f, a - f);
        var f;
    }
    expect_stdout: [
        "function NaN",
        "function NaN",
        "function NaN",
    ]
}

inline_loop_6: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        for (var a in "foo") {
            (function() {
                var f;
                function f() {}
                console.log(typeof f, a - f);
            })();
        }
    }
    expect: {
        for (var a in "foo")
            f = void 0,
            f = function() {},
            void console.log(typeof f, a - f);
        var f;
    }
    expect_stdout: [
        "function NaN",
        "function NaN",
        "function NaN",
    ]
}

inline_loop_7: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        for (var a in "foo") {
            (function() {
                function f() {}
                var f;
                while (console.log(typeof f, a - f));
            })();
        }
    }
    expect: {
        for (var a in "foo") {
            f = void 0;
            var f = function() {};
            var f;
            while (console.log(typeof f, a - f));
        }
    }
    expect_stdout: [
        "function NaN",
        "function NaN",
        "function NaN",
    ]
}

inline_loop_8: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        for (var a in "foo") {
            (function() {
                var f;
                function f() {}
                while (console.log(typeof f, a - f));
            })();
        }
    }
    expect: {
        for (var a in "foo") {
            f = void 0;
            var f = function() {};
            var f;
            while (console.log(typeof f, a - f));
        }
    }
    expect_stdout: [
        "function NaN",
        "function NaN",
        "function NaN",
    ]
}

inline_loop_9: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        for (var a = 0; a < 2; a++) {
            (function() {
                var b = b && b[console.log("FAIL")] || "PASS";
                while (console.log(b));
            })();
        }
    }
    expect: {
        for (var a = 0; a < 2; a++) {
            b = void 0;
            var b = b && b[console.log("FAIL")] || "PASS";
            while (console.log(b));
        }
    }
    expect_stdout: [
        "PASS",
        "PASS",
    ]
}

inline_negate_iife: {
    options = {
        inline: true,
    }
    input: {
        console.log(function() {
            return !function() {
                while (!console);
            }();
        }());
    }
    expect: {
        console.log(function() {
            while (!console);
            return !void 0;
        }());
    }
    expect_stdout: "true"
}

inline_return_binary: {
    options = {
        inline: true,
    }
    input: {
        console.log(function() {
            return function() {
                while (console.log("foo"));
                return "bar";
            }() || function() {
                while (console.log("baz"));
                return "moo";
            }();
        }());
    }
    expect: {
        console.log(function() {
            while (console.log("foo"));
            return "bar";
        }() || function() {
            while (console.log("baz"));
            return "moo";
        }());
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

inline_return_conditional: {
    options = {
        inline: true,
    }
    input: {
        console.log(function() {
            return console ? "foo" : function() {
                while (console.log("bar"));
                return "baz";
            }();
        }());
    }
    expect: {
        console.log(function() {
            if (console)
                return "foo";
            else {
                while (console.log("bar"));
                return "baz";
                return;
            }
        }());
    }
    expect_stdout: "foo"
}

inline_while: {
    options = {
        inline: true,
    }
    input: {
        while (function() {
            while (console.log("foo"));
        }()) (function() {
            while (console.log("bar"));
        })();
    }
    expect: {
        while (function() {
            while (console.log("foo"));
        }()) {
            while (console.log("bar"));
        }
    }
    expect_stdout: "foo"
}

inline_with: {
    options = {
        inline: true,
    }
    input: {
        with (+function() {
            while (console.log("foo"));
        }(), -function() {
            while (console.log("bar"));
        }()) ~function() {
            while (console.log("baz"));
        }();
    }
    expect: {
        while (console.log("foo"));
        with (-function() {
            while (console.log("bar"));
        }()) {
            while (console.log("baz"));
        }
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
}

issue_2476: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function foo(x, y, z) {
            return x < y ? x * y + z : x * z - y;
        }
        for (var sum = 0, i = 0; i < 10; i++)
            sum += foo(i, i + 1, 3 * i);
        console.log(sum);
    }
    expect: {
        for (var sum = 0, i = 0; i < 10; i++)
            sum += (x = i, y = i + 1, z = 3 * i, x < y ? x * y + z : x * z - y);
        var x, y, z;
        console.log(sum);
    }
    expect_stdout: "465"
}

issue_2601_1: {
    options = {
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function() {
            function f(b) {
                function g(b) {
                    b && b();
                }
                g();
                (function() {
                    b && (a = "PASS");
                })();
            }
            f("foo");
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function() {
            var b;
            b = "foo",
            function(b) {
                b && b();
            }(),
            b && (a = "PASS");
        })(),
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2601_2: {
    rename = true
    options = {
        evaluate: true,
        inline: true,
        passes: 3,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    mangle = {}
    input: {
        var a = "FAIL";
        (function() {
            function f(b) {
                function g(b) {
                    b && b();
                }
                g();
                (function() {
                    b && (a = "PASS");
                })();
            }
            f("foo");
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        a = "PASS",
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2604_1: {
    options = {
        inline: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function() {
            try {
                throw 1;
            } catch (b) {
                (function f(b) {
                    b && b();
                })();
                b && (a = "PASS");
            }
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (b) {
            (function(b) {
                b && b();
            })();
            b && (a = "PASS");
        }
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2604_2: {
    rename = true
    options = {
        evaluate: true,
        inline: true,
        passes: 3,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    mangle = {}
    input: {
        var a = "FAIL";
        (function() {
            try {
                throw 1;
            } catch (b) {
                (function f(b) {
                    b && b();
                })();
                b && (a = "PASS");
            }
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (o) {
            o && (a = "PASS");
        }
        console.log(a);
    }
    expect_stdout: "PASS"
}

unsafe_apply_1: {
    options = {
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        (function(a, b) {
            console.log(a, b);
        }).apply("foo", [ "bar" ]);
        (function(a, b) {
            console.log(this, a, b);
        }).apply("foo", [ "bar" ]);
        (function(a, b) {
            console.log(a, b);
        }).apply("foo", [ "bar" ], "baz");
    }
    expect: {
        console.log("bar", void 0);
        (function(a, b) {
            console.log(this, a, b);
        }).call("foo", "bar");
        (function(a, b) {
            console.log(a, b);
        }).apply("foo", [ "bar" ], "baz");
    }
    expect_stdout: true
}

unsafe_apply_2: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        function foo() {
            console.log(a, b);
        }
        var bar = function(a, b) {
            console.log(this, a, b);
        }
        (function() {
            foo.apply("foo", [ "bar" ]);
            bar.apply("foo", [ "bar" ]);
        })();
    }
    expect: {
        function foo() {
            console.log(a, b);
        }
        var bar = function(a, b) {
            console.log(this, a, b);
        }
        (function() {
            foo("bar");
            bar.call("foo", "bar");
        })();
    }
    expect_stdout: true
}

unsafe_call_1: {
    options = {
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        (function(a, b) {
            console.log(a, b);
        }).call("foo", "bar");
        (function(a, b) {
            console.log(this, a, b);
        }).call("foo", "bar");
    }
    expect: {
        console.log("bar", void 0);
        (function(a, b) {
            console.log(this, a, b);
        }).call("foo", "bar");
    }
    expect_stdout: true
}

unsafe_call_2: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        function foo() {
            console.log(a, b);
        }
        var bar = function(a, b) {
            console.log(this, a, b);
        }
        (function() {
            foo.call("foo", "bar");
            bar.call("foo", "bar");
        })();
    }
    expect: {
        function foo() {
            console.log(a, b);
        }
        var bar = function(a, b) {
            console.log(this, a, b);
        }
        (function() {
            foo("bar");
            bar.call("foo", "bar");
        })();
    }
    expect_stdout: true
}

unsafe_call_3: {
    options = {
        side_effects: true,
        unsafe: true,
    }
    input: {
        console.log(function() {
            return arguments[0] + eval("arguments")[1];
        }.call(0, 1, 2));
    }
    expect: {
        console.log(function() {
            return arguments[0] + eval("arguments")[1];
        }(1, 2));
    }
    expect_stdout: "3"
}

inline_eval_inner: {
    options = {
        inline: true,
    }
    input: {
        (function() {
            console.log(typeof eval("arguments"));
        })();
    }
    expect: {
        (function() {
            console.log(typeof eval("arguments"));
        })();
    }
    expect_stdout: "object"
}

inline_eval_outer: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        A = 42;
        (function(a) {
            console.log(a);
        })(A);
        console.log(eval("typeof a"));
    }
    expect: {
        A = 42;
        (function(a) {
            console.log(a);
        })(A);
        console.log(eval("typeof a"));
    }
    expect_stdout: [
        "42",
        "undefined",
    ]
}

issue_2616: {
    options = {
        evaluate: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            function f() {
                function g(NaN) {
                    (true << NaN) - 0/0 || (c = "PASS");
                }
                g([]);
            }
            f();
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (true << []) - NaN || (c = "PASS");
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2620_1: {
    options = {
        inline: 3,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            function f(a) {
                var b = function g(a) {
                    a && a();
                }();
                if (a) {
                    var d = c = "PASS";
                }
            }
            f(1);
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        !function(a) {
            if (function(a) {
                a && a();
            }(), a) c = "PASS";
        }(1),
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2620_2: {
    options = {
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            function f(a) {
                var b = function g(a) {
                    a && a();
                }();
                if (a) {
                    var d = c = "PASS";
                }
            }
            f(1);
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function() {
            var a = 1;
            if (function(a) {
                a && a();
            }(), a) c = "PASS";
        })(),
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2620_3: {
    options = {
        conditionals: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            function f(a) {
                var b = function g(a) {
                    a && a();
                }();
                if (a) {
                    var d = c = "PASS";
                }
            }
            f(1);
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        c = "PASS",
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2620_4: {
    options = {
        evaluate: true,
        inline: 3,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            function f(a, NaN) {
                function g() {
                    switch (a) {
                      case a:
                        break;
                      case c = "PASS", NaN:
                        break;
                    }
                }
                g();
            }
            f(0/0);
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        !function(a, NaN) {
            (function() {
                switch (a) {
                    case a:
                    break;
                    case c = "PASS", NaN:
                    break;
                }
            })();
        }(NaN);
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2620_5: {
    options = {
        evaluate: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            function f(a, NaN) {
                function g() {
                    switch (a) {
                      case a:
                        break;
                      case c = "PASS", NaN:
                        break;
                    }
                }
                g();
            }
            f(0/0);
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        !function(a, NaN) {
            switch (a) {
              case a:
                break;
              case c = "PASS", NaN:
                break;
            }
        }(NaN);
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2620_6: {
    rename = true
    options = {
        dead_code: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        switches: true,
        unused: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            function f(a, NaN) {
                function g() {
                    switch (a) {
                      case a:
                        break;
                      case c = "PASS", NaN:
                        break;
                    }
                }
                g();
            }
            f(0/0);
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function() {
            switch (NaN) {
              case void (c = "PASS"):
            }
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2630_1: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        (function() {
            while (f());
            function f() {
                var a = function() {
                    var b = c++, d = c = 1 + c;
                }();
            }
        })();
        console.log(c);
    }
    expect: {
        var c = 0;
        while (void (c = 1 + ++c));
        console.log(c);
    }
    expect_stdout: "2"
}

issue_2630_2: {
    options = {
        assignments: true,
        collapse_vars: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        !function() {
            while (f()) {}
            function f() {
                var not_used = function() {
                    c = 1 + c;
                }(c = c + 1);
            }
        }();
        console.log(c);
    }
    expect: {
        var c = 0;
        while (void (c = 1 + (c += 1)));
        console.log(c);
    }
    expect_stdout: "2"
}

issue_2630_3: {
    options = {
        inline: true,
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
            (function f1(a) {
                f2();
                --x >= 0 && f1();
            })(a++);
            function f2() {
                a++;
            }
        })();
        console.log(a);
    }
    expect_stdout: "5"
}

issue_2630_4: {
    options = {
        collapse_vars: true,
        inline: 3,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var x = 3, a = 1, b = 2;
        (function() {
            (function f1() {
                while (--x >= 0 && f2());
            }());
            function f2() {
                a++ + (b += a);
            }
        })();
        console.log(a);
    }
    expect: {
        var x = 3, a = 1, b = 2;
        !function() {
            while (--x >= 0 && void (b += ++a));
        }();
        console.log(a);
    }
    expect_stdout: "2"
}

issue_2630_5: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var x = 3, a = 1, b = 2;
        (function() {
            (function f1() {
                while (--x >= 0 && f2());
            }());
            function f2() {
                a++ + (b += a);
            }
        })();
        console.log(a);
    }
    expect: {
        var x = 3, a = 1, b = 2;
        while (--x >= 0 && void (b += ++a));
        console.log(a);
    }
    expect_stdout: "2"
}

issue_2630_6: {
    options = {
        assignments: true,
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var c = 1;
        !function() {
            do {
                c *= 10;
            } while (f());
            function f() {
                return function() {
                    return (c = 2 + c) < 100;
                }(c = c + 3);
            }
        }();
        console.log(c);
    }
    expect: {
        var c = 1;
        !function() {
            do {
                c *= 10;
            } while ((c = 2 + (c += 3)) < 100);
        }();
        console.log(c);
    }
    expect_stdout: "155"
}

recursive_inline_1: {
    options = {
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            h();
        }
        function g(a) {
            a();
        }
        function h(b) {
            g();
            if (b) x();
        }
    }
    expect: {}
}

recursive_inline_2: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(n) {
            return n ? n * f(n - 1) : 1;
        }
        console.log(f(5));
    }
    expect: {
        console.log(function f(n) {
            return n ? n * f(n - 1) : 1;
        }(5));
    }
    expect_stdout: "120"
}

issue_2657: {
    options = {
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        unused: true,
    }
    input: {
        "use strict";
        console.log(function f() {
            return h;
            function g(b) {
                return b || b();
            }
            function h(a) {
                g(a);
                return a;
            }
        }()(42));
    }
    expect: {
        "use strict";
        console.log(function(a) {
            return b = a, b || b(), a;
            var b;
        }(42));
    }
    expect_stdout: "42"
}

issue_2663_1: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var i, o = {};
            function createFn(j) {
                return function() {
                    console.log(j);
                };
            }
            for (i in { a: 1, b: 2, c: 3 })
                o[i] = createFn(i);
            for (i in o)
                o[i]();
        })();
    }
    expect: {
        (function() {
            var i, o = {};
            function createFn(j) {
                return function() {
                    console.log(j);
                };
            }
            for (i in { a: 1, b: 2, c: 3 })
                o[i] = createFn(i);
            for (i in o)
                o[i]();
        })();
    }
    expect_stdout: [
        "a",
        "b",
        "c",
    ]
}

issue_2663_2: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            var i;
            function fn(j) {
                return function() {
                    console.log(j);
                }();
            }
            for (i in { a: 1, b: 2, c: 3 })
                fn(i);
        })();
    }
    expect: {
        (function() {
            for (var i in { a: 1, b: 2, c: 3 })
                j = i, console.log(j);
            var j;
        })();
    }
    expect_stdout: [
        "a",
        "b",
        "c",
    ]
}

issue_2663_3: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var outputs = [
                { type: 0, target: null, eventName: "ngSubmit", propName: null },
                { type: 0, target: null, eventName: "submit", propName: null },
                { type: 0, target: null, eventName: "reset", propName: null },
            ];
            function listenToElementOutputs(outputs) {
                var handlers = [];
                for (var i = 0; i < outputs.length; i++) {
                    var output = outputs[i];
                    var handleEventClosure = renderEventHandlerClosure(output.eventName);
                    handlers.push(handleEventClosure)
                }
                var target, name;
                return handlers;
            }
            function renderEventHandlerClosure(eventName) {
                return function() {
                    return console.log(eventName);
                };
            }
            listenToElementOutputs(outputs).forEach(function(handler) {
                return handler()
            });
        })();
    }
    expect: {
        (function() {
            function renderEventHandlerClosure(eventName) {
                return function() {
                    return console.log(eventName);
                };
            }
            (function(outputs) {
                var handlers = [];
                for (var i = 0; i < outputs.length; i++) {
                    var output = outputs[i];
                    var handleEventClosure = renderEventHandlerClosure(output.eventName);
                    handlers.push(handleEventClosure);
                }
                return handlers;
            })([ {
                type: 0,
                target: null,
                eventName: "ngSubmit",
                propName: null
            }, {
                type: 0,
                target: null,
                eventName: "submit",
                propName: null
            }, {
                type: 0,
                target: null,
                eventName: "reset",
                propName: null
            } ]).forEach(function(handler) {
                return handler();
            });
        })();
    }
    expect_stdout: [
        "ngSubmit",
        "submit",
        "reset",
    ]
}

duplicate_argnames_1: {
    options = {
        inline: true,
        side_effects: true,
    }
    input: {
        console.log(function(a, a, a) {
            return a;
        }("FAIL", 42, "PASS"));
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

duplicate_argnames_2: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        function f(b, b, b) {
            b && (a = "FAIL");
        }
        f(0, console);
        console.log(a);
    }
    expect: {
        var a = "PASS";
        console, void 0 && (a = "FAIL");
        console.log(a);
    }
    expect_stdout: "PASS"
}

duplicate_argnames_3: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        function f(b, b, b) {
            b && (a = "PASS");
        }
        f(null, 0, console, "42".toString());
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        b = console, "42".toString(), b && (a = "PASS");
        var b;
        console.log(a);
    }
    expect_stdout: "PASS"
}

duplicate_argnames_4: {
    options = {
        if_return: true,
        inline: true,
    }
    input: {
        (function() {
            (function(a, a) {
                while (console.log(a || "PASS"));
            })("FAIL");
        })();
    }
    expect: {
        (function() {
            var a = "FAIL";
            var a = void 0;
            while (console.log(a || "PASS"));
        })();
    }
    expect_stdout: "PASS"
}

loop_init_arg: {
    options = {
        inline: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = "PASS";
        for (var k in "12") (function(b) {
            (b >>= 1) && (a = "FAIL"), b = 2;
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        for (var k in "12")
            b = void 0, (b >>= 1) && (a = "FAIL"), b = 2;
        var b;
        console.log(a);
    }
    expect_stdout: "PASS"
}

inline_false: {
    options = {
        inline: false,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (function() {
            console.log(1);
        })();
        (function(a) {
            console.log(a);
        })(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect: {
        (function() {
            console.log(1);
        })();
        (function(a) {
            console.log(a);
        })(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect_stdout: [
        "1",
        "2",
        "3",
    ]
}

inline_0: {
    options = {
        inline: 0,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (function() {
            console.log(1);
        })();
        (function(a) {
            console.log(a);
        })(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect: {
        (function() {
            console.log(1);
        })();
        (function(a) {
            console.log(a);
        })(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect_stdout: [
        "1",
        "2",
        "3",
    ]
}

inline_1: {
    options = {
        inline: 1,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (function() {
            console.log(1);
        })();
        (function(a) {
            console.log(a);
        })(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect: {
        console.log(1);
        (function(a) {
            console.log(a);
        })(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect_stdout: [
        "1",
        "2",
        "3",
    ]
}

inline_2: {
    options = {
        inline: 2,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (function() {
            console.log(1);
        })();
        (function(a) {
            console.log(a);
        })(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect: {
        console.log(1);
        console.log(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect_stdout: [
        "1",
        "2",
        "3",
    ]
}

inline_3: {
    options = {
        inline: 3,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (function() {
            console.log(1);
        })();
        (function(a) {
            console.log(a);
        })(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect: {
        console.log(1);
        console.log(2);
        b = 3, c = b, console.log(c);
        var b, c;
    }
    expect_stdout: [
        "1",
        "2",
        "3",
    ]
}

inline_true: {
    options = {
        inline: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (function() {
            console.log(1);
        })();
        (function(a) {
            console.log(a);
        })(2);
        (function(b) {
            var c = b;
            console.log(c);
        })(3);
    }
    expect: {
        console.log(1);
        console.log(2);
        b = 3, c = b, console.log(c);
        var b, c;
    }
    expect_stdout: [
        "1",
        "2",
        "3",
    ]
}

use_before_init_in_loop: {
    options = {
        inline: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = "PASS";
        for (var b = 2; --b >= 0;) (function() {
            var c = function() {
                return 1;
            }(c && (a = "FAIL"));
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        for (var b = 2; --b >= 0;)
            c = void 0, c = (c && (a = "FAIL"), 1);
        var c;
        console.log(a);
    }
    expect_stdout: "PASS"
}

duplicate_arg_var_1: {
    options = {
        inline: true,
    }
    input: {
        console.log(function(b) {
            return b;
            var b;
        }("PASS"));
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

duplicate_arg_var_2: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        console.log(function(b) {
            return b + "SS";
            var b;
        }("PA"));
    }
    expect: {
        console.log("PA" + "SS");
    }
    expect_stdout: "PASS"
}

duplicate_arg_var_3: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        console.log(function(b) {
            return b + "SS";
            var b;
        }("PA", "42".toString()));
    }
    expect: {
        console.log((b = "PA", "42".toString(), b + "SS"));
        var b;
    }
    expect_stdout: "PASS"
}

issue_2737_1: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            while (a());
        })(function f() {
            console.log(typeof f);
        });
    }
    expect: {
        (function(a) {
            while (a());
        })(function f() {
            console.log(typeof f);
        });
    }
    expect_stdout: "function"
}

issue_2737_2: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(bar) {
            for (;bar();) break;
        })(function qux() {
            return console.log("PASS"), qux;
        });
    }
    expect: {
        (function(bar) {
            for (;bar();) break;
        })(function qux() {
            return console.log("PASS"), qux;
        });
    }
    expect_stdout: "PASS"
}

issue_2783: {
    options = {
        collapse_vars: true,
        conditionals: true,
        if_return: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            return g;
            function f(a) {
                var b = a.b;
                if (b) return b;
                return a;
            }
            function g(o, i) {
                while (i--) {
                    console.log(f(o));
                }
            }
        })()({ b: "PASS" }, 1);
    }
    expect: {
        (function() {
            return function(o,i) {
                while (i--) console.log(f(o));
            };
            function f(a) {
                var b = a.b;
                return b || a;
            }
        })()({ b: "PASS" },1);
    }
    expect_stdout: "PASS"
}

issue_2898: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        unused: true,
    }
    input: {
        var c = 0;
        (function() {
            while (f());
            function f() {
                var b = (c = 1 + c, void (c = 1 + c));
                b && b[0];
            }
        })();
        console.log(c);
    }
    expect: {
        var c = 0;
        (function() {
            while (b = void 0, void ((b = void (c = 1 + (c = 1 + c))) && b[0]));
            var b;
        })(),
        console.log(c);
    }
    expect_stdout: "2"
}

deduplicate_parentheses: {
    input: {
        ({}).a = b;
        (({}).a = b)();
        (function() {}).a = b;
        ((function() {}).a = b)();
    }
    expect_exact: "({}).a=b;({}.a=b)();(function(){}).a=b;(function(){}.a=b)();"
}

issue_3016_1: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        var b = 1;
        do {
            (function(a) {
                return a[b];
                var a;
            })(3);
        } while (0);
        console.log(b);
    }
    expect: {
        var b = 1;
        do {
            3[b];
        } while (0);
        console.log(b);
    }
    expect_stdout: "1"
}

issue_3016_2: {
    options = {
        dead_code: true,
        inline: true,
        toplevel: true,
    }
    input: {
        var b = 1;
        do {
            (function(a) {
                return a[b];
                try {
                    a = 2;
                } catch (a) {
                    var a;
                }
            })(3);
        } while (0);
        console.log(b);
    }
    expect: {
        var b = 1;
        do {
            a = 3,
            a[b];
        } while (0);
        var a;
        console.log(b);
    }
    expect_stdout: "1"
}

issue_3016_2_ie8: {
    options = {
        dead_code: true,
        ie: true,
        inline: true,
        toplevel: true,
    }
    input: {
        var b = 1;
        do {
            (function(a) {
                return a[b];
                try {
                    a = 2;
                } catch (a) {
                    var a;
                }
            })(3);
        } while (0);
        console.log(b);
    }
    expect: {
        var b = 1;
        do {
            a = 3,
            a[b];
        } while (0);
        var a;
        console.log(b);
    }
    expect_stdout: "1"
}

issue_3016_3: {
    options = {
        dead_code: true,
        inline: true,
        toplevel: true,
    }
    input: {
        var b = 1;
        do {
            console.log(function() {
                return a ? "FAIL" : a = "PASS";
                try {
                    a = 2;
                } catch (a) {
                    var a;
                }
            }());
        } while (b--);
    }
    expect: {
        var b = 1;
        do {
            console.log((a = void 0, a ? "FAIL" : "PASS"));
        } while (b--);
        var a;
    }
    expect_stdout: [
        "PASS",
        "PASS",
    ]
}

issue_3016_3_ie8: {
    options = {
        dead_code: true,
        ie: true,
        inline: true,
        toplevel: true,
    }
    input: {
        var b = 1;
        do {
            console.log(function() {
                return a ? "FAIL" : a = "PASS";
                try {
                    a = 2;
                } catch (a) {
                    var a;
                }
            }());
        } while (b--);
    }
    expect: {
        var b = 1;
        do {
            console.log((a = void 0, a ? "FAIL" : "PASS"));
        } while (b--);
        var a;
    }
    expect_stdout: [
        "PASS",
        "PASS",
    ]
}

issue_3018: {
    options = {
        inline: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var b = 1, c = "PASS";
        do {
            (function() {
                (function(a) {
                    a = 0 != (a && (c = "FAIL"));
                })();
            })();
        } while (b--);
        console.log(c);
    }
    expect: {
        var b = 1, c = "PASS";
        do {
            a = void 0,
            a = 0 != (a && (c = "FAIL"));
        } while (b--);
        var a;
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3054: {
    options = {
        booleans: true,
        collapse_vars: true,
        inline: 1,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        function f() {
            return { a: true };
        }
        console.log(function(b) {
            b = false;
            return f();
        }().a, f.call().a);
    }
    expect: {
        "use strict";
        function f() {
            return { a: !0 };
        }
        console.log(function(b) {
            b = !1;
            return f();
        }().a, f.call().a);
    }
    expect_stdout: "true true"
}

issue_3076: {
    options = {
        dead_code: true,
        inline: true,
        sequences: true,
        unused: true,
    }
    input: {
        var c = "PASS";
        (function(b) {
            var n = 2;
            while (--b + function() {
                e && (c = "FAIL");
                e = 5;
                return 1;
                try {
                    var a = 5;
                } catch (e) {
                    var e;
                }
            }().toString() && --n > 0);
        })(2);
        console.log(c);
    }
    expect: {
        var c = "PASS";
        (function(b) {
            var n = 2;
            while (--b + (e = void 0, e && (c = "FAIL"), e = 5, 1..toString()) && --n > 0);
            var e;
        })(2),
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3125: {
    options = {
        inline: true,
        unsafe: true,
    }
    input: {
        console.log(function() {
            return "PASS";
        }.call());
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_3274: {
    options = {
        collapse_vars: true,
        inline: true,
        join_vars: true,
        loops: true,
        passes: 2,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var g = function(a) {
                var c = a.p, b = c;
                return b != c;
            };
            while (g(1))
                console.log("FAIL");
            console.log("PASS");
        })();
    }
    expect: {
        (function() {
            for (var c; (c = 1..p) != c;)
                console.log("FAIL");
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

issue_3297_1: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    mangle = {}
    input: {
        function function1() {
            var r = {
                function2: function2
            };
            function function2() {
                alert(1234);
                function function3() {
                    function2();
                };
                function3();
            }
            return r;
        }
    }
    expect: {
        function function1() {
            return {
                function2: function n() {
                    alert(1234);
                    function t() {
                        n();
                    }
                    t();
                }
            };
        }
    }
}

issue_3297_2: {
    options = {
        collapse_vars: true,
        conditionals: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    mangle = {}
    input: {
        function function1(session) {
            var public = {
                processBulk: processBulk
            };
            return public;
            function processBulk(bulk) {
                var subparam1 = session();
                function processOne(param1) {
                    var param2 = {
                        subparam1: subparam1
                    };
                    doProcessOne({
                        param1: param1,
                        param2: param2,
                    }, function() {
                        processBulk(bulk);
                    });
                };
                if (bulk && bulk.length > 0)
                    processOne(bulk.shift());
            }
            function doProcessOne(config, callback) {
                console.log(JSON.stringify(config));
                callback();
            }
        }
        function1(function session() {
            return 42;
        }).processBulk([1, 2, 3]);
    }
    expect: {
        function function1(o) {
            return {
                processBulk: function t(u) {
                    var r = o();
                    function n(n) {
                        var o = {
                            subparam1: r
                        };
                        c({
                            param1: n,
                            param2: o
                        }, function() {
                            t(u);
                        });
                    }
                    u && u.length > 0 && n(u.shift());
                }
            };
            function c(n, o) {
                console.log(JSON.stringify(n));
                o();
            }
        }
        function1(function() {
            return 42;
        }).processBulk([ 1, 2, 3 ]);
    }
    expect_stdout: [
        '{"param1":1,"param2":{"subparam1":42}}',
        '{"param1":2,"param2":{"subparam1":42}}',
        '{"param1":3,"param2":{"subparam1":42}}',
    ]
}

issue_3297_3: {
    options = {
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        inline: true,
        join_vars: true,
        passes: 3,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    mangle = {}
    input: {
        function function1(session) {
            var public = {
                processBulk: processBulk,
            };
            return public;
            function processBulk(bulk) {
                var subparam1 = session();
                function processOne(param1) {
                    var param2 = {
                        subparam1: subparam1,
                    };
                    doProcessOne({
                        param1: param1,
                        param2: param2,
                    }, function() {
                        processBulk(bulk);
                    });
                };
                if (bulk && bulk.length > 0)
                    processOne(bulk.shift());
            }
            function doProcessOne(config, callback) {
                console.log(JSON.stringify(config));
                callback();
            }
        }
        function1(function session() {
            return 42;
        }).processBulk([1, 2, 3]);
    }
    expect: {
        function function1(c) {
            return {
                processBulk: function n(o) {
                    var r, t, u = c();
                    o && 0 < o.length && (r = o.shift(),
                    t = function() {
                        n(o);
                    },
                    console.log(JSON.stringify({
                        param1: r,
                        param2: {
                            subparam1: u,
                        },
                    })),
                    t());
                },
            };
        }
        function1(function() {
            return 42;
        }).processBulk([ 1, 2, 3 ]);
    }
    expect_stdout: [
        '{"param1":1,"param2":{"subparam1":42}}',
        '{"param1":2,"param2":{"subparam1":42}}',
        '{"param1":3,"param2":{"subparam1":42}}',
    ]
}

cross_references_1: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var Math = {
            square: function(n) {
                return n * n;
            }
        };
        console.log((function(factory) {
            return factory();
        })(function() {
            return function(Math) {
                return function(n) {
                    return Math.square(n);
                };
            }(Math);
        })(3));
    }
    expect: {
        var Math = {
            square: function(n) {
                return n * n;
            }
        };
        console.log(function(Math) {
            return function(n) {
                return Math.square(n);
            };
        }(Math)(3));
    }
    expect_stdout: "9"
}

cross_references_2: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        passes: 6,
        properties: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var Math = {
            square: function(n) {
                return n * n;
            }
        };
        console.log((function(factory) {
            return factory();
        })(function() {
            return function(Math) {
                return function(n) {
                    return Math.square(n);
                };
            }(Math);
        })(3));
    }
    expect: {
        console.log(9);
    }
    expect_stdout: "9"
}

cross_references_3: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var Math = {
            square: function(n) {
                return n * n;
            },
            cube: function(n) {
                return n * n * n;
            }
        };
        console.log(function(factory) {
            return factory();
        }(function() {
            return function(Math) {
                return function(n) {
                    Math = {
                        square: function(x) {
                            return "(SQUARE" + x + ")";
                        },
                        cube: function(x) {
                            return "(CUBE" + x + ")";
                        }
                    };
                    return Math.square(n) + Math.cube(n);
                };
            }(Math);
        })(2));
        console.log(Math.square(3), Math.cube(3));
    }
    expect: {
        var Math = {
            square: function(n) {
                return n * n;
            },
            cube: function(n) {
                return n * n * n;
            }
        };
        console.log(function(Math) {
            return function(n) {
                Math = {
                    square: function(x) {
                        return "(SQUARE" + x + ")";
                    },
                    cube: function(x) {
                        return "(CUBE" + x + ")";
                    }
                };
                return Math.square(n) + Math.cube(n);
            };
        }()(2));
        console.log(Math.square(3), Math.cube(3));
    }
    expect_stdout: [
        "(SQUARE2)(CUBE2)",
        "9 27",
    ]
}

loop_inline: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(o) {
            function g(p) {
                return o[p];
            }
            function h(q) {
                while (g(q));
            }
            return h;
        }([ 1, "foo", 0 ])(2));
    }
    expect: {
        console.log(function(o) {
            return function(q) {
                while (p = q, o[p]);
                var p;
            };
        }([ 1, "foo", 0 ])(2));
    }
    expect_stdout: "undefined"
}

functions: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function() {
            var a = function a() {
                return a && "a";
            };
            var b = function x() {
                return !!x;
            };
            var c = function(c) {
                return c;
            };
            if (c(b(a()))) {
                var d = function() {};
                var e = function y() {
                    return typeof y;
                };
                var f = function(f) {
                    return f;
                };
                console.log(a(d()), b(e()), c(f(42)), typeof d, e(), typeof f);
            }
        }();
    }
    expect: {
        !function() {
            function a() {
                return a && "a";
            }
            function b() {
                return !!b;
            }
            function c(c) {
                return c;
            }
            if (c(b(a()))) {
                function d() {}
                function e() {
                    return typeof e;
                }
                function f(f) {
                    return f;
                }
                console.log(a(d()), b(e()), c(f(42)), typeof d, e(), typeof f);
            }
        }();
    }
    expect_stdout: "a true 42 function function function"
}

functions_use_strict: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        !function() {
            var a = function a() {
                return a && "a";
            };
            var b = function x() {
                return !!x;
            };
            var c = function(c) {
                return c;
            };
            if (c(b(a()))) {
                var d = function() {};
                var e = function y() {
                    return typeof y;
                };
                var f = function(f) {
                    return f;
                };
                console.log(a(d()), b(e()), c(f(42)), typeof d, e(), typeof f);
            }
        }();
    }
    expect: {
        "use strict";
        !function() {
            function a() {
                return a && "a";
            }
            function b() {
                return !!b;
            }
            function c(c) {
                return c;
            }
            if (c(b(a()))) {
                var d = function() {};
                var e = function y() {
                    return typeof y;
                };
                var f = function(f) {
                    return f;
                };
                console.log(a(d()), b(e()), c(f(42)), typeof d, e(), typeof f);
            }
        }();
    }
    expect_stdout: "a true 42 function function function"
}

functions_cross_scope_reference: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        log = function(fn) {
            console.log(typeof fn());
        };
        var a = function() {};
        function f() {
            return a;
        }
        while (log(f));
    }
    expect: {
        log = function(fn) {
            console.log(typeof fn());
        };
        function a() {}
        function f() {
            return a;
        }
        while (log(f));
    }
    expect_stdout: "function"
}

functions_inner_var: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function() {
            var a;
            console.log(a, a);
        };
        a(a);
    }
    expect: {
        function a() {
            var a;
            console.log(a, a);
        }
        a();
    }
    expect_stdout: "undefined undefined"
}

functions_keep_fnames: {
    options = {
        functions: true,
        keep_fnames: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var FAIL = function PASS() {};
        FAIL.p = 42;
        console.log(FAIL.name, FAIL.p);
    }
    expect: {
        var FAIL = function PASS() {};
        FAIL.p = 42;
        console.log(FAIL.name, FAIL.p);
    }
    expect_stdout: "PASS 42"
}

issue_2437: {
    options = {
        collapse_vars: true,
        conditionals: true,
        functions: true,
        if_return: true,
        inline: true,
        join_vars: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function foo() {
            return bar();
        }
        function bar() {
            if (xhrDesc) {
                var req = new XMLHttpRequest();
                var result = !!req.onreadystatechange;
                Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', xhrDesc || {});
                return result;
            } else {
                var req = new XMLHttpRequest();
                var detectFunc = function(){};
                req.onreadystatechange = detectFunc;
                var result = req[SYMBOL_FAKE_ONREADYSTATECHANGE_1] === detectFunc;
                req.onreadystatechange = null;
                return result;
            }
        }
        console.log(foo());
    }
    expect: {
        var req, detectFunc, result;
        console.log((
            xhrDesc ? (
                result = !!(req = new XMLHttpRequest).onreadystatechange,
                Object.defineProperty(XMLHttpRequest.prototype, "onreadystatechange", xhrDesc || {})
            ) : (
                (req = new XMLHttpRequest).onreadystatechange = detectFunc = function(){},
                result = req[SYMBOL_FAKE_ONREADYSTATECHANGE_1] === detectFunc,req.onreadystatechange = null
            ),
            result
        ));
    }
}

issue_2485_1: {
    options = {
        functions: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var foo = function(bar) {
            var n = function(a, b) {
                return a + b;
            };
            var sumAll = function(arg) {
                return arg.reduce(n, 0);
            };
            var runSumAll = function(arg) {
                return sumAll(arg);
            };
            bar.baz = function(arg) {
                var n = runSumAll(arg);
                return (n.get = 1), n;
            };
            return bar;
        };
        var bar = foo({});
        console.log(bar.baz([1, 2, 3]));
    }
    expect: {
        var foo = function(bar) {
            function n(a, b) {
                return a + b;
            }
            function runSumAll(arg) {
                return function(arg) {
                    return arg.reduce(n, 0);
                }(arg);
            }
            bar.baz = function(arg) {
                var n = runSumAll(arg);
                return (n.get = 1), n;
            };
            return bar;
        };
        var bar = foo({});
        console.log(bar.baz([1, 2, 3]));
    }
    expect_stdout: "6"
}

issue_2485_2: {
    options = {
        functions: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var foo = function(bar) {
            var n = function(a, b) {
                return a + b;
            };
            var sumAll = function(arg) {
                return arg.reduce(n, 0);
            };
            var runSumAll = function(arg) {
                return sumAll(arg);
            };
            bar.baz = function(arg) {
                var n = runSumAll(arg);
                return (n.get = 1), n;
            };
            return bar;
        };
        var bar = foo({});
        console.log(bar.baz([1, 2, 3]));
    }
    expect: {
        var foo = function(bar) {
            function n(a, b) {
                return a + b;
            }
            function runSumAll(arg) {
                return arg.reduce(n, 0);
            }
            bar.baz = function(arg) {
                var n = runSumAll(arg);
                return (n.get = 1), n;
            };
            return bar;
        };
        var bar = foo({});
        console.log(bar.baz([1, 2, 3]));
    }
    expect_stdout: "6"
}

issue_3364: {
    options = {
        functions: true,
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
        (function n(r, o, a) {
            try {
                for (var f = 1; f-- >0;)
                    var t = function(r) {
                        (function(r) {
                            r && r[t++];
                        })(--s >= 0 && n(c++));
                        for (var o = 1; --o > 0;);
                    }();
            } catch (o) {
                try {
                    return;
                } catch (r) {
                    for (var v = 1; --v > 0;)
                        for (var i = 1; i > 0;--i) {
                            function u() {}
                            for (var v in u);
                        }
                }
            }
        })();
        console.log(c);
    }
    expect_stdout: "2"
}

issue_3366: {
    options = {
        functions: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {
                return function() {};
            }
            var a = g();
            (function() {
                this && a && console.log("PASS");
            })();
        }
        f();
    }
    expect: {
        void function() {
            this && a && console.log("PASS");
        }();
        function a() {}
    }
    expect_stdout: "PASS"
}

issue_3371: {
    options = {
        functions: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            var a = function f() {
                (function() {
                    console.log(typeof f);
                })();
            };
            while (a());
        })();
    }
    expect: {
        (function() {
            function a() {
                console.log(typeof a);
            }
            while (a());
        })();
    }
    expect_stdout: "function"
}

class_iife: {
    options = {
        inline: true,
        sequences: true,
        toplevel: true,
    }
    input: {
        var A = function() {
            function B() {}
            B.prototype.m = function() {
                console.log("PASS");
            };
            return B;
        }();
        new A().m();
    }
    expect: {
        var A = (B.prototype.m = function() {
            console.log("PASS");
        }, B);
        function B() {}
        new A().m();
    }
    expect_stdout: "PASS"
}

issue_3400_1: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(f) {
            console.log(f()()[0].p);
        })(function() {
            function g() {
                function h(u) {
                    var o = {
                        p: u
                    };
                    return console.log(o[g]), o;
                }
                function e() {
                    return [ 42 ].map(function(v) {
                        return h(v);
                    });
                }
                return e();
            }
            return g;
        });
    }
    expect: {
        void console.log(function g() {
            function h(u) {
                var o = {
                    p: u
                };
                return console.log(o[g]), o;
            }
            function e() {
                return [ 42 ].map(h);
            }
            return e();
        }()[0].p);
    }
    expect_stdout: [
        "undefined",
        "42",
    ]
}

issue_3400_2: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 3,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(f) {
            console.log(f()()[0].p);
        })(function() {
            function g() {
                function h(u) {
                    var o = {
                        p: u
                    };
                    return console.log(o[g]), o;
                }
                function e() {
                    return [ 42 ].map(function(v) {
                        return h(v);
                    });
                }
                return e();
            }
            return g;
        });
    }
    expect: {
        void console.log(function g() {
            return [ 42 ].map(function(u) {
                var o = {
                    p: u
                };
                return console.log(o[g]), o;
            });
        }()[0].p);
    }
    expect_stdout: [
        "undefined",
        "42",
    ]
}

issue_3402: {
    options = {
        evaluate: true,
        functions: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        var f = function f() {
            f = 42;
            console.log(typeof f);
        };
        "function" == typeof f && f();
        "function" == typeof f && f();
        console.log(typeof f);
    }
    expect: {
        var f = function f() {
            f = 42;
            console.log(typeof f);
        };
        f();
        f();
        console.log(typeof f);
    }
    expect_stdout: [
        "function",
        "function",
        "function",
    ]
}

issue_3439_1: {
    options = {
        inline: 3,
    }
    input: {
        console.log(typeof function() {
            return function(a) {
                function a() {}
                return a;
            }(42);
        }());
    }
    expect: {
        console.log(typeof function(a) {
            function a() {}
            return a;
        }(42));
    }
    expect_stdout: "function"
}

issue_3439_2: {
    options = {
        inline: true,
    }
    input: {
        console.log(typeof function() {
            return function(a) {
                function a() {}
                return a;
            }(42);
        }());
    }
    expect: {
        console.log(typeof function(a) {
            function a() {}
            return a;
        }(42));
    }
    expect_stdout: "function"
}

issue_3444: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(h) {
            return f;
            function f() {
                g();
            }
            function g() {
                h("PASS");
            }
        })(console.log)();
    }
    expect: {
        (function(h) {
            return function() {
                void h("PASS");
            };
        })(console.log)();
    }
    expect_stdout: "PASS"
}

issue_3506_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function(b) {
            (function(b) {
                b && (a = "PASS");
            })(b);
        })(a);
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        !function(b) {
            b && (a = "PASS");
        }(a);
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3506_2: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: 3,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function(b) {
            (function(c) {
                var d = 1;
                for (;c && (a = "PASS") && 0 < --d;);
            })(b);
        })(a);
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        !function(c) {
            var d = 1;
            for (;c && (a = "PASS") && 0 < --d;);
        }(a);
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3506_3: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function(b) {
            (function(c) {
                var d = 1;
                for (;c && (a = "PASS") && 0 < --d;);
            })(b);
        })(a);
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function(b) {
            var c = a;
            var d = 1;
            for (;c && (a = "PASS") && 0 < --d;);
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3506_4: {
    options = {
        collapse_vars: true,
        dead_code: true,
        evaluate: true,
        inline: 3,
        loops: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function(b) {
            (function(c) {
                var d = 1;
                for (;c && (a = "PASS") && 0 < --d;);
            })(b);
        })(a);
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        !function(c) {
            var d = 1;
            for (;c && (a = "PASS") && 0 < --d;);
        }(a);
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3506_5: {
    options = {
        collapse_vars: true,
        dead_code: true,
        evaluate: true,
        inline: true,
        loops: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function(b) {
            (function(c) {
                var d = 1;
                for (;c && (a = "PASS") && 0 < --d;);
            })(b);
        })(a);
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function(b) {
            var c = a;
            var d = 1;
            for (;c && (a = "PASS") && 0 < --d;);
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3512: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function(b) {
            (function() {
                b <<= this || 1;
                b.a = "FAIL";
            })();
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function(b) {
            (function() {
                (b <<= this || 1).a = "FAIL";
            })();
        })(),
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3562: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        var a = "PASS";
        function f(b) {
            f = function() {
                console.log(b);
            };
            return "FAIL";
        }
        a = f(a);
        f(a);
    }
    expect: {
        var a = "PASS";
        function f(b) {
            f = function() {
                console.log(b);
            };
            return "FAIL";
        }
        a = f(a);
        f(a);
    }
    expect_stdout: "PASS"
}

hoisted_inline: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            console.log("PASS");
        }
        function g() {
            for (var console in [ 0 ])
                h();
        }
        function h() {
            f();
        }
        g();
    }
    expect: {
        function f() {
            console.log("PASS");
        }
        (function() {
            for (var console in [ 0 ])
                void f();
        })();
    }
    expect_stdout: "PASS"
}

hoisted_single_use: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            for (var r in a) g(r);
        }
        function g(a) {
            console.log(a);
        }
        function h(a) {
            var g = a.bar;
            g();
            g();
            i(a);
        }
        function i(b) {
            f(b);
        }
        h({
            bar: function() {
                console.log("foo");
            }
        });
    }
    expect: {
        function f(a) {
            for (var r in a) (function(a) {
                console.log(a);
            })(r);
        }
        (function(a) {
            var g = a.bar;
            g();
            g();
            (function(b) {
                f(b);
            })(a);
        })({
            bar: function() {
                console.log("foo");
            }
        });
    }
    expect_stdout: [
        "foo",
        "foo",
        "bar",
    ]
}

inlined_single_use: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(f) {
            f();
        }(function() {
            var a = function() {
                A;
            };
            var b = function() {
                a(B);
            };
            (function() {
                b;
            });
            var c = 42;
        }));
    }
    expect: {
        console.log(function(f) {
            a = function() {
                A;
            },
            b = function() {
                a(B);
            },
            void 0;
            var a, b;
        }());
    }
    expect_stdout: "undefined"
}

pr_3592_1: {
    options = {
        inline: true,
        reduce_funcs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function problem(w) {
            return g.indexOf(w);
        }
        function unused(x) {
            return problem(x);
        }
        function B(problem) {
            return g[problem];
        }
        function A(y) {
            return problem(y);
        }
        function main(z) {
            return B(A(z));
        }
        var g = [ "PASS" ];
        console.log(main("PASS"));
    }
    expect: {
        function problem(w) {
            return g.indexOf(w);
        }
        function B(problem) {
            return g[problem];
        }
        var g = [ "PASS" ];
        console.log((z = "PASS", B((y = z, problem(y)))));
        var z, y;
    }
    expect_stdout: "PASS"
}

pr_3592_2: {
    options = {
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function problem(w) {
            return g.indexOf(w);
        }
        function unused(x) {
            return problem(x);
        }
        function B(problem) {
            return g[problem];
        }
        function A(y) {
            return problem(y);
        }
        function main(z) {
            return B(A(z));
        }
        var g = [ "PASS" ];
        console.log(main("PASS"));
    }
    expect: {
        function problem(w) {
            return g.indexOf(w);
        }
        var g = [ "PASS" ];
        console.log((z = "PASS", function(problem) {
            return g[problem];
        }(problem(z))));
        var z;
    }
    expect_stdout: "PASS"
}

inline_use_strict: {
    options = {
        evaluate: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            "use strict";
            return function() {
                "use strict";
                var a = "foo";
                a += "bar";
                return a;
            };
        }()());
    }
    expect: {
        console.log("foobar");
    }
    expect_stdout: "foobar"
}

pr_3595_1: {
    options = {
        collapse_vars: false,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var g = [ "PASS" ];
        function problem(arg) {
            return g.indexOf(arg);
        }
        function unused(arg) {
            return problem(arg);
        }
        function a(arg) {
            return problem(arg);
        }
        function b(problem) {
            return g[problem];
        }
        function c(arg) {
            return b(a(arg));
        }
        console.log(c("PASS"));
    }
    expect: {
        var g = [ "PASS" ];
        function problem(arg) {
            return g.indexOf(arg);
        }
        console.log((arg = "PASS", function(problem) {
            return g[problem];
        }(problem(arg))));
        var arg;
    }
    expect_stdout: "PASS"
}

pr_3595_2: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var g = [ "PASS" ];
        function problem(arg) {
            return g.indexOf(arg);
        }
        function unused(arg) {
            return problem(arg);
        }
        function a(arg) {
            return problem(arg);
        }
        function b(problem) {
            return g[problem];
        }
        function c(arg) {
            return b(a(arg));
        }
        console.log(c("PASS"));
    }
    expect: {
        var g = [ "PASS" ];
        function problem(arg) {
            return g.indexOf(arg);
        }
        console.log(function(problem) {
            return g[problem];
        }(problem("PASS")));
    }
    expect_stdout: "PASS"
}

pr_3595_3: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var g = [ "PASS" ];
        function problem(arg) {
            return g.indexOf(arg);
        }
        function unused(arg) {
            return problem(arg);
        }
        function a(arg) {
            return problem(arg);
        }
        function b(problem) {
            return g[problem];
        }
        function c(arg) {
            return b(a(arg));
        }
        console.log(c("PASS"));
    }
    expect: {
        var g = [ "PASS" ];
        console.log(function(problem) {
            return g[problem];
        }(g.indexOf("PASS")));
    }
    expect_stdout: "PASS"
}

pr_3595_4: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 3,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var g = [ "PASS" ];
        function problem(arg) {
            return g.indexOf(arg);
        }
        function unused(arg) {
            return problem(arg);
        }
        function a(arg) {
            return problem(arg);
        }
        function b(problem) {
            return g[problem];
        }
        function c(arg) {
            return b(a(arg));
        }
        console.log(c("PASS"));
    }
    expect: {
        var g = [ "PASS" ];
        console.log((problem = g.indexOf("PASS"), g[problem]));
        var problem;
    }
    expect_stdout: "PASS"
}

issue_3679_1: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            var f = function() {};
            f.g = function() {
                console.log("PASS");
            };
            f.g();
        })();
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_3679_2: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            "use strict";
            var f = function() {};
            f.g = function() {
                console.log("PASS");
            };
            f.g();
        })();
    }
    expect: {
        (function() {
            "use strict";
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

issue_3679_3: {
    options = {
        collapse_vars: true,
        inline: true,
        functions: true,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            var f = function() {};
            f.p = "PASS";
            f.g = function() {
                console.log(f.p);
            };
            f.g();
        })();
    }
    expect: {
        (function() {
            function f() {};
            f.p = "PASS";
            (f.g = function() {
                console.log(f.p);
            })();
        })();
    }
    expect_stdout: "PASS"
}

preceding_side_effects: {
    options = {
        inline: true,
    }
    input: {
        console.log(function(a, b, c) {
            return b;
        }(console, "PASS", 42));
    }
    expect: {
        console.log((console, 42, "PASS"));
    }
    expect_stdout: "PASS"
}

trailing_side_effects: {
    options = {
        inline: true,
    }
    input: {
        console.log(function(a, b, c) {
            return b;
        }(42, "PASS", console));
    }
    expect: {
        console.log(function(a, b, c) {
            return b;
        }(42, "PASS", console));
    }
    expect_stdout: "PASS"
}

preserve_binding_1: {
    options = {
        inline: true,
    }
    input: {
        var o = {
            f: function() {
                return this === o ? "FAIL" : "PASS";
            },
        };
        console.log(function(a) {
            return a;
        }(o.f)());
    }
    expect: {
        var o = {
            f: function() {
                return this === o ? "FAIL" : "PASS";
            },
        };
        console.log((0, o.f)());
    }
    expect_stdout: "PASS"
}

preserve_binding_2: {
    options = {
        collapse_vars: true,
        inline: true,
        unused: true,
    }
    input: {
        var o = {
            f: function() {
                return this === o ? "FAIL" : "PASS";
            },
        };
        console.log(function(a) {
            return a;
        }(o.f)());
    }
    expect: {
        var o = {
            f: function() {
                return this === o ? "FAIL" : "PASS";
            },
        };
        console.log((0, o.f)());
    }
    expect_stdout: "PASS"
}

issue_3770: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            function f(a, a) {
                var b = function() {
                    return a || "PASS";
                }();
                console.log(b);
            }
            f("FAIL");
        })();
    }
    expect: {
        (function() {
            b = a || "PASS",
            console.log(b);
            var a, b;
        })();
    }
    expect_stdout: "PASS"
}

issue_3771: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            function f(a) {
                var a = f(1234);
            }
            f();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function f(a) {
                f();
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_3772: {
    options = {
        collapse_vars: true,
        dead_code: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        function f() {
            return a;
        }
        var b = f();
        function g() {
            console.log(f());
        }
        g();
    }
    expect: {
        var a = "PASS";
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3777_1: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
    }
    input: {
        (function() {
            ff && ff(NaN);
            function ff(a) {
                var a = console.log("PASS");
            }
        })();
    }
    expect: {
        (function() {
            ff && ff(NaN);
            function ff(a) {
                var a = console.log("PASS");
            }
        })();
    }
    expect_stdout: "PASS"
}

issue_3777_2: {
    options = {
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        ff(ff.p);
        function ff(a) {
            var a = console.log("PASS");
        }
    }
    expect: {
        ff(ff.p);
        function ff(a) {
            var a = console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_3821_1: {
    options = {
        inline: true,
    }
    input: {
        var a = 0;
        console.log(function(b) {
            return +a + b;
        }(--a));
    }
    expect: {
        var a = 0;
        console.log(function(b) {
            return +a + b;
        }(--a));
    }
    expect_stdout: "-2"
}

issue_3821_2: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = "PASS";
        function f(g, b) {
            return g(), b;
        }
        console.log(f(function() {
            a = "FAIL";
        }, a));
    }
    expect: {
        var a = "PASS";
        function f(g, b) {
            return g(), b;
        }
        console.log(f(function() {
            a = "FAIL";
        }, a));
    }
    expect_stdout: "PASS"
}

substitute: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var o = {};
        function f(a) {
            return a === o ? "PASS" : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return function(b) {
                    return f(b);
                };
            },
            function() {
                "use strict";
                return function(c) {
                    return f(c);
                };
            },
            function() {
                return function(c) {
                    "use strict";
                    return f(c);
                };
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o), g().length);
        });
    }
    expect: {
        var o = {};
        function f(a) {
            return a === o ? "PASS" : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return f;
            },
            function() {
                "use strict";
                return f;
            },
            function() {
                return f;
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o), g().length);
        });
    }
    expect_stdout: [
        "PASS PASS 1",
        "PASS PASS 1",
        "PASS PASS 1",
        "PASS PASS 1",
        "PASS PASS 2",
    ]
}

substitute_add_farg_1: {
    options = {
        inline: 3,
        keep_fargs: false,
    }
    input: {
        function f(g) {
            console.log(g.length);
            g(null, "FAIL");
        }
        f(function() {
            return function(a, b) {
                return function(c) {
                    do {
                        console.log("PASS");
                    } while (c);
                }(a, b);
            };
        }());
    }
    expect: {
        function f(g) {
            console.log(g.length);
            g(null, "FAIL");
        }
        f(function(c, argument_1) {
            do {
                console.log("PASS");
            } while (c);
        });
    }
    expect_stdout: [
        "2",
        "PASS",
    ]
}

substitute_add_farg_2: {
    options = {
        if_return: true,
        inline: true,
        keep_fargs: false,
        side_effects: true,
    }
    input: {
        function f(g) {
            console.log(g.length);
            g(null, "FAIL");
        }
        f(function() {
            return function(a, b) {
                return function(c) {
                    do {
                        console.log("PASS");
                    } while (c);
                }(a, b);
            };
        }());
    }
    expect: {
        function f(g) {
            console.log(g.length);
            g(null, "FAIL");
        }
        f(function(a, b) {
            var c = a;
            do {
                console.log("PASS");
            } while (c);
        });
    }
    expect_stdout: [
        "2",
        "PASS",
    ]
}

substitute_arguments: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var o = {};
        function f(a) {
            return arguments[0] === o ? "PASS" : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return function(b) {
                    return f(b);
                };
            },
            function() {
                "use strict";
                return function(c) {
                    return f(c);
                };
            },
            function() {
                return function(c) {
                    "use strict";
                    return f(c);
                };
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o), g().length);
        });
    }
    expect: {
        var o = {};
        function f(a) {
            return arguments[0] === o ? "PASS" : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return function(b) {
                    return f(b);
                };
            },
            function() {
                "use strict";
                return function(c) {
                    return f(c);
                };
            },
            function() {
                return function(c) {
                    "use strict";
                    return f(c);
                };
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o), g().length);
        });
    }
    expect_stdout: [
        "PASS PASS 1",
        "PASS PASS 1",
        "PASS PASS 1",
        "PASS PASS 1",
        "PASS PASS 2",
    ]
}

substitute_drop_farg: {
    options = {
        inline: true,
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var o = {};
        function f(a) {
            return a === o ? "PASS" : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return function(b) {
                    return f(b);
                };
            },
            function() {
                "use strict";
                return function(c) {
                    return f(c);
                };
            },
            function() {
                return function(c) {
                    "use strict";
                    return f(c);
                };
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o));
        });
    }
    expect: {
        var o = {};
        function f(a) {
            return a === o ? "PASS" : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return f;
            },
            function() {
                "use strict";
                return f;
            },
            function() {
                return f;
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o));
        });
    }
    expect_stdout: [
        "PASS PASS",
        "PASS PASS",
        "PASS PASS",
        "PASS PASS",
        "PASS PASS",
    ]
}

substitute_this: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var o = {};
        function f(a) {
            return a === o ? this === o : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return function(b) {
                    return f(b);
                };
            },
            function() {
                "use strict";
                return function(c) {
                    return f(c);
                };
            },
            function() {
                return function(c) {
                    "use strict";
                    return f(c);
                };
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o), g().length);
        });
    }
    expect: {
        var o = {};
        function f(a) {
            return a === o ? this === o : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return function(b) {
                    return f(b);
                };
            },
            function() {
                "use strict";
                return function(c) {
                    return f(c);
                };
            },
            function() {
                return function(c) {
                    "use strict";
                    return f(c);
                };
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o), g().length);
        });
    }
    expect_stdout: [
        "false true 1",
        "false false 1",
        "false false 1",
        "false false 1",
        "false false 2",
    ]
}

substitute_use_strict: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var o = {};
        function f(a) {
            "use strict";
            return a === o ? "PASS" : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return function(b) {
                    return f(b);
                };
            },
            function() {
                "use strict";
                return function(c) {
                    return f(c);
                };
            },
            function() {
                return function(c) {
                    "use strict";
                    return f(c);
                };
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o), g().length);
        });
    }
    expect: {
        var o = {};
        function f(a) {
            "use strict";
            return a === o ? "PASS" : "FAIL";
        }
        [
            function() {
                return f;
            },
            function() {
                return f;
            },
            function() {
                "use strict";
                return f;
            },
            function() {
                return f;
            },
            function() {
                return function(d, e) {
                    return f(d, e);
                };
            },
        ].forEach(function(g) {
            console.log(g()(o), g().call(o, o), g().length);
        });
    }
    expect_stdout: [
        "PASS PASS 1",
        "PASS PASS 1",
        "PASS PASS 1",
        "PASS PASS 1",
        "PASS PASS 2",
    ]
}

substitute_assignment: {
    options = {
        evaluate: true,
        inline: true,
        passes: 2,
        properties: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a, b, c) {
            a[b] = c;
        }
        var o = {};
        f(o, 42, null);
        f(o, "foo", "bar");
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {};
        o[42] = null;
        o.foo = "bar";
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "42 null",
        "foo bar",
    ]
}

issue_3833_1: {
    options = {
        inline: 3,
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            return function() {
                while (a);
                console.log("PASS");
            }();
        }
        f();
    }
    expect: {
        (function() {
            while (a);
            console.log("PASS");
        })();
        var a;
    }
    expect_stdout: "PASS"
}

issue_3833_2: {
    options = {
        if_return: true,
        inline: true,
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            return function() {
                while (a);
                console.log("PASS");
            }();
        }
        f();
    }
    expect: {
        var a = void 0;
        while (a);
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_3835: {
    options = {
        inline: true,
        reduce_vars: true,
    }
    input: {
        (function f() {
            return function() {
                return f();
            }();
        })();
    }
    expect: {
        (function f() {
            return f();
        })();
    }
    expect_stdout: RangeError("Maximum call stack size exceeded")
}

issue_3836_1: {
    options = {
        inline: 3,
    }
    input: {
        (function() {
            return function() {
                for (var a in 0)
                    console.log(k);
            }(console.log("PASS"));
        })();
    }
    expect: {
        (function() {
            for (var a in 0)
                console.log(k);
        })(console.log("PASS"));
    }
    expect_stdout: "PASS"
}

issue_3836_2: {
    options = {
        if_return: true,
        inline: true,
    }
    input: {
        (function() {
            return function() {
                for (var a in 0)
                    console.log(k);
            }(console.log("PASS"));
        })();
    }
    expect: {
        (function() {
            console.log("PASS");
            for (var a in 0)
                console.log(k);
        })();
    }
    expect_stdout: "PASS"
}

issue_3852: {
    options = {
        collapse_vars: true,
        inline: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            return function(b) {
                return b && (b[0] = 0), "PASS";
            }(a);
        }(42));
    }
    expect: {
        console.log(function(a) {
            return a && (a[0] = 0), "PASS";
        }(42));
    }
    expect_stdout: "PASS"
}

issue_3911: {
    options = {
        collapse_vars: true,
        conditionals: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            return function() {
                if (a) (a++, b += a);
                f();
            };
        }
        var a = f, b;
        console.log("PASS");
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_3929: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var abc = function f() {
                (function() {
                    switch (f) {
                    default:
                        var abc = 0;
                    case 0:
                        abc.p;
                    }
                    console.log(typeof f);
                })();
            };
            typeof abc && abc();
        })();
    }
    expect: {
        (function() {
            var abc = function f() {
                (function() {
                    switch (f) {
                    default:
                        var abc = 0;
                    case 0:
                        abc.p;
                    }
                    console.log(typeof f);
                })();
            };
            typeof abc && abc();
        })();
    }
    expect_stdout: "function"
}

issue_4006: {
    options = {
        dead_code: true,
        evaluate: true,
        inline: true,
        keep_fargs: false,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = 0;
        (function() {
            (function(b, c) {
                for (var k in console.log(c), 0)
                    return b += 0;
            })(0, --a);
            return a ? 0 : --a;
        })();
    }
    expect: {
        var a = 0;
        (function(c) {
            for (var k in console.log(c), 0)
                return;
        })(--a), a || --a;
    }
    expect_stdout: "-1"
}

issue_4155: {
    options = {
        functions: true,
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var a;
            (function() {
                console.log(a);
            })(a);
            var b = function() {};
            b && console.log(typeof b);
        })();
    }
    expect: {
        (function() {
            var a;
            void console.log(a);
            function b() {}
            b && console.log(typeof b);
        })();
    }
    expect_stdout: [
        "undefined",
        "function",
    ]
}

issue_4159: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 42, c = function(b) {
            (b = a) && console.log(a++, b);
        }(c = a);
    }
    expect: {
        var a = 42;
        (b = a) && console.log(a++, b);
        var b;
    }
    expect_stdout: "42 42"
}

direct_inline: {
    options = {
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            function g(c) {
                return c >> 1;
            }
            return g(a) + g(b);
        }
        console.log(f(13, 31));
    }
    expect: {
        function f(a, b) {
            return (a >> 1) + (b >> 1);
        }
        console.log(f(13, 31));
    }
    expect_stdout: "21"
}

direct_inline_catch_redefined: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        function f() {
            return a;
        }
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
            console.log(a, f(), g());
        }
        console.log(a, f(), g());
    }
    expect: {
        var a = 1;
        function f() {
            return a;
        }
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
            console.log(a, f(), g());
        }
        console.log(a, a, g());
    }
    expect_stdout: true
}

statement_var_inline: {
    options = {
        inline: true,
        join_vars: true,
        unused: true,
    }
    input: {
        function f() {
            (function() {
                var a = {};
                function g() {
                    a.p;
                }
                g(console.log("PASS"));
                var b = function h(c) {
                    c && c.q;
                }();
            })();
        }
        f();
    }
    expect: {
        function f() {
            var c, a = {};
            function g() {
                a.p;
            }
            g(console.log("PASS"));
            c && c.q;
            return;
        }
        f();
    }
    expect_stdout: "PASS"
}

issue_4171_1: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            try {
                while (a)
                    var e = function() {};
            } catch (e) {
                return function() {
                    return e;
                };
            }
        }(!console));
    }
    expect: {
        console.log(function(a) {
            try {
                while (a)
                    var e = function() {};
            } catch (e) {
                return function() {
                    return e;
                };
            }
        }(!console));
    }
    expect_stdout: "undefined"
}

issue_4171_2: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            try {
                while (a);
            } catch (e) {
                return function() {
                    return e;
                };
            } finally {
                var e = function() {};
            }
        }(!console));
    }
    expect: {
        console.log(function(a) {
            try {
                while (a);
            } catch (e) {
                return function() {
                    return e;
                };
            } finally {
                function e() {}
            }
        }(!console));
    }
    expect_stdout: "undefined"
}

catch_defun: {
    mangle = {
        toplevel: true,
    }
    input: {
        try {
            throw 42;
        } catch (a) {
            function f() {
                return typeof a;
            }
        }
        console.log(f());
    }
    expect: {
        try {
            throw 42;
        } catch (o) {
            function t() {
                return typeof o;
            }
        }
        console.log(t());
    }
    expect_stdout: true
}

catch_no_argname: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        function f() {
            return a;
        }
        try {
            throw a;
        } catch {
            function g() {
                return a;
            }
            console.log(a, f(), g());
        }
        console.log(a, f(), g());
    }
    expect: {
        var a = "PASS";
        try {
            throw a;
        } catch {
            function g() {
                return a;
            }
            console.log(a, a, g());
        }
        console.log(a, a, g());
    }
    expect_stdout: [
        "PASS PASS PASS",
        "PASS PASS PASS",
    ]
    node_version: ">=10"
}

issue_4186: {
    options = {
        conditionals: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        unused: true,
    }
    input: {
        console.log(typeof function() {
            return function() {
                function f() {
                    if (1)
                        g();
                    else
                        (function() {
                            return f;
                        });
                }
                return f;
                function g() {
                    if (1) {
                        if (0)
                            h;
                        else
                            h();
                        var key = 0;
                    }
                }
                function h() {
                    return factory;
                }
            };
        }()());
    }
    expect: {
        console.log(typeof function() {
            return function f() {
                1 ? void (1 && (0 ? h : h(), 0)) : function() {
                    return f;
                };
            };
            function h() {
                return factory;
            }
        }());
    }
    expect_stdout: "function"
}

issue_4233: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            try {
                var a = function() {};
                try {
                    throw 42;
                } catch (a) {
                    (function() {
                        console.log(typeof a);
                    })();
                    var a;
                }
            } catch (e) {}
        })();
    }
    expect: {
        (function() {
            try {
                var a = function() {};
                try {
                    throw 42;
                } catch (a) {
                    (function() {
                        console.log(typeof a);
                    })();
                    var a;
                }
            } catch (e) {}
        })();
    }
    expect_stdout: "number"
}

issue_4259: {
    options = {
        collapse_vars: true,
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function b() {
            var c = b;
            for (b in c);
        };
        a();
        console.log(typeof a);
    }
    expect: {
        var a = function b() {
            for (b in b);
        }
        a();
        console.log(typeof a);
    }
    expect_stdout: "function"
}

issue_4261: {
    options = {
        if_return: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            throw 42;
        } catch (e) {
            (function() {
                function f() {
                    e.p;
                }
                function g() {
                    while (f());
                }
                (function() {
                    while (console.log(g()));
                })();
            })();
        }
    }
    expect: {
        try {
            throw 42;
        } catch (e) {
            function g() {
                // `ReferenceError: e is not defined` on Node.js v4-
                while (void e.p);
            }
            while (console.log(g()));
        }
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_4265: {
    options = {
        conditionals: true,
        dead_code: true,
        inline: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function f() {
            console;
            if ([ function() {
                return this + console.log(a);
                a;
                var a;
            }() ]);
            return 42;
        }
        console.log(f());
    }
    expect: {
        function f() {
            var a;
            return console, console.log(a), 42;
        }
        console.log(f());
    }
    expect_stdout: [
        "undefined",
        "42",
    ]
}

trailing_comma: {
    input: {
        new function(a, b,) {
            console.log(b, a,);
        }(42, "PASS",);
    }
    expect_exact: 'new function(a,b){console.log(b,a)}(42,"PASS");'
    expect_stdout: "PASS 42"
}

issue_4451: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f() {
            for (f in "foo")
                return f;
        };
        while (console.log(typeof a()));
    }
    expect: {
        var a = function f() {
            for (f in "foo")
                return f;
        };
        while (console.log(typeof a()));
    }
    expect_stdout: "function"
}

issue_4471: {
    options = {
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        f(f());
        function f() {
            return g();
        }
        function g() {
            {
                console.log("PASS");
            }
        }
    }
    expect: {
        f(g());
        function f() {
            return g();
        }
        function g() {
            console.log("PASS");
        }
    }
    expect_stdout: [
        "PASS",
        "PASS",
    ]
}

issue_4612_1: {
    options = {
        evaluate: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            function f() {
                return g();
            }
            function g(a) {
                return a || f();
            }
            return g("PASS");
        }());
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4612_2: {
    options = {
        evaluate: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            function fn() {
                return h();
            }
            function g() {
                return fn();
            }
            function h(a) {
                return a || fn();
            }
            return h("PASS");
        }());
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4612_3: {
    options = {
        inline: true,
        reduce_vars: true,
    }
    input: {
        console.log(typeof function() {
            return g();
            function f() {
                return g;
            }
            function g() {
                {
                    return f;
                }
            }
        }());
    }
    expect: {
        console.log(typeof function() {
            return g();
            function f() {
                return g;
            }
            function g() {
                return f;
            }
        }());
    }
    expect_stdout: "function"
}

issue_4612_4: {
    options = {
        booleans: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        console.log(function() {
            function f() {
                return h();
            }
            function g() {
                {
                    return h();
                }
            }
            function h() {
                {
                    return g();
                }
            }
        }());
    }
    expect: {
        console.log(function() {
            function f() {
                h();
            }
            function g() {
                return h();
            }
            function h() {
                return g();
            }
        }());
    }
    expect_stdout: "undefined"
}

issue_4655: {
    options = {
        functions: true,
        loops: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function f() {
            while (console.log("PASS")) {
                var g = function() {};
                for (var a in g)
                    g();
            }
        })();
    }
    expect: {
        (function() {
            for (; console.log("PASS");) {
                function g() {};
            }
        })();
    }
    expect_stdout: "PASS"
}

issue_4659_1: {
    options = {
        if_return: true,
        inline: true,
        reduce_vars: true,
    }
    input: {
        var a = 0;
        (function() {
            function f() {
                return a++;
            }
            (function() {
                f && f();
                (function() {
                    var a = console && a;
                })();
            })();
        })();
        console.log(a);
    }
    expect: {
        var a = 0;
        (function() {
            function f() {
                return a++;
            }
            f && a++;
            (function() {
                var a = console && a;
            })();
        })();
        console.log(a);
    }
    expect_stdout: "1"
}

issue_4659_2: {
    options = {
        if_return: true,
        inline: true,
        reduce_vars: true,
    }
    input: {
        var a = 0;
        (function() {
            function f() {
                return a++;
            }
            (function() {
                (function() {
                    f && f();
                })();
                (function() {
                    var a = console && a;
                })();
            })();
        })();
        console.log(a);
    }
    expect: {
        var a = 0;
        (function() {
            function f() {
                return a++;
            }
            void (f && a++);
            (function() {
                var a = console && a;
            })();
        })();
        console.log(a);
    }
    expect_stdout: "1"
}

issue_4659_3: {
    options = {
        if_return: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = 0;
        (function() {
            function f() {
                return a++;
            }
            (function() {
                function g() {
                    while (!console);
                }
                g(f && f());
                (function() {
                    var a = console && a;
                })();
            })();
        })();
        console.log(a);
    }
    expect: {
        var a = 0;
        (function() {
            function f() {
                return a++;
            }
            f && a++;
            while (!console);
            (function() {
                var a = console && a;
            })();
        })();
        console.log(a);
    }
    expect_stdout: "1"
}

block_scope_1: {
    input: {
        console.log(typeof f);
        function f() {}
    }
    expect: {
        console.log(typeof f);
        function f() {}
    }
    expect_stdout: "function"
}

block_scope_1_compress: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        console.log(typeof f);
        function f() {}
    }
    expect: {
        console.log("function");
    }
    expect_stdout: "function"
}

block_scope_2: {
    input: {
        {
            console.log(typeof f);
        }
        function f() {}
    }
    expect: {
        console.log(typeof f);
        function f() {}
    }
    expect_stdout: "function"
}

block_scope_2_compress: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        {
            console.log(typeof f);
        }
        function f() {}
    }
    expect: {
        console.log("function");
    }
    expect_stdout: "function"
}

block_scope_3: {
    input: {
        console.log(typeof f);
        {
            function f() {}
        }
    }
    expect: {
        console.log(typeof f);
        {
            function f() {}
        }
    }
    expect_stdout: true
}

block_scope_3_compress: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        console.log(typeof f);
        {
            function f() {}
        }
    }
    expect: {
        console.log(typeof f);
        {
            function f() {}
        }
    }
    expect_stdout: true
}

block_scope_4: {
    input: {
        {
            console.log(typeof f);
            function f() {}
        }
    }
    expect: {
        console.log(typeof f);
        function f() {}
    }
    expect_stdout: "function"
}

block_scope_4_compress: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        {
            console.log(typeof f);
            function f() {}
        }
    }
    expect: {
        console.log("function");
    }
    expect_stdout: "function"
}

issue_4725_1: {
    options = {
        inline: true,
    }
    input: {
        var o = {
            f() {
                return function g() {
                    return g;
                }();
            }
        };
        console.log(typeof o.f());
    }
    expect: {
        var o = {
            f() {
                return function g() {
                    return g;
                }();
            }
        };
        console.log(typeof o.f());
    }
    expect_stdout: "function"
    node_version: ">=4"
}

issue_4725_2: {
    options = {
        if_return: true,
        inline: true,
    }
    input: {
        var o = {
            f() {
                return function() {
                    while (console.log("PASS"));
                }();
            }
        };
        o.f();
    }
    expect: {
        var o = {
            f() {
                while (console.log("PASS"));
            }
        };
        o.f();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

new_target_1: {
    input: {
        new function f() {
            console.log(new.target === f);
        }();
        console.log(function() {
            return new.target;
        }());
    }
    expect: {
        new function f() {
            console.log(new.target === f);
        }();
        console.log(function() {
            return new.target;
        }());
    }
    expect_stdout: [
        "true",
        "undefined",
    ]
    node_version: ">=6"
}

new_target_2: {
    input: {
        new function(a) {
            if (!new.target)
                console.log("FAIL");
            else if (a)
                console.log("PASS");
            else
                new new.target(new.target.length);
        }();
    }
    expect: {
        new function(a) {
            if (!new.target)
                console.log("FAIL");
            else if (a)
                console.log("PASS");
            else
                new new.target(new.target.length);
        }();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

new_target_collapse_vars: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        new function(a) {
            if (a)
                console.log("PASS");
            else
                new new.target(new.target.length);
        }(0);
    }
    expect: {
        new function(a) {
            if (a)
                console.log("PASS");
            else
                new new.target(new.target.length);
        }(0);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

new_target_delete: {
    options = {
        evaluate: true,
    }
    input: {
        new function() {
            console.log(delete new.target);
        }();
    }
    expect: {
        new function() {
            console.log(delete new.target);
        }();
    }
    expect_stdout: true
    node_version: ">=6"
}

new_target_reduce_vars: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        new function(a) {
            if (a)
                console.log("PASS");
            else
                new new.target(new.target.length);
        }(0);
    }
    expect: {
        new function(a) {
            if (a)
                console.log("PASS");
            else
                new new.target(new.target.length);
        }(0);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4753_1: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        for (var i in [ 1, 2 ])
            (function() {
                function f() {}
                f && console.log(f.p ^= 42);
            })();
    }
    expect: {
        for (var i in [ 1, 2 ])
            f = function() {},
            void (f && console.log(f.p ^= 42));
        var f;
    }
    expect_stdout: [
        "42",
        "42",
    ]
}

issue_4753_2: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        do {
            (function() {
                var a = f();
                function f() {
                    return "PASS";
                }
                f;
                function g() {
                    console.log(a);
                }
                g();
            })();
        } while (0);
    }
    expect: {
        do {
            a = void 0,
            f = function() {
                return "PASS";
            },
            a = f(),
            console.log(a);
        } while (0);
        var f, a;
    }
    expect_stdout: "PASS"
}

issue_4788: {
    options = {
        evaluate: true,
        functions: true,
        keep_fnames: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            var a = function g() {
                if (0) {
                    var g = 42;
                    f();
                }
                g || console.log("PASS");
            };
            a(a);
        }
        f();
    }
    expect: {
        (function f() {
            function a() {
                if (0) {
                    var g = 42;
                    f();
                }
                g || console.log("PASS");
            }
            a();
        })();
    }
    expect_stdout: "PASS"
}

issue_4823: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function() {
            {
                function f() {}
                var arguments = f();
                function g() {}
                var arguments = g;
            }
            return f && arguments;
        }());
    }
    expect: {
        console.log(typeof function() {
            {
                function f() {}
                f();
                var arguments = function() {};
            }
            return f && arguments;
        }());
    }
    expect_stdout: "function"
}

drop_unused_self_reference: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {}
        (f.p = f).q = console.log("PASS");
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

reduce_cross_reference_1: {
    options = {
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(a, b) {
            a = b = function() {};
            a.p = a;
            b = a = function() {};
            b.q = b;
        })();
    }
    expect: {}
    expect_stdout: true
}

reduce_cross_reference_1_toplevel: {
    options = {
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = b = function() {};
        a.p = a;
        var b = a = function() {};
        b.q = b;
    }
    expect: {}
    expect_stdout: true
}

reduce_cross_reference_2: {
    options = {
        collapse_vars: true,
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(a, b) {
            a = b = function() {};
            b.p = a;
            b = a = function() {};
            a.q = b;
        })();
    }
    expect: {}
    expect_stdout: true
}

reduce_cross_reference_2_toplevel: {
    options = {
        collapse_vars: true,
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = b = function() {};
        b.p = a;
        var b = a = function() {};
        a.q = b;
    }
    expect: {}
    expect_stdout: true
}

reduce_cross_reference_3: {
    options = {
        collapse_vars: true,
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(a, b) {
            a = b = function() {};
            a.p = b;
            b = a = function() {};
            b.q = a;
        })();
    }
    expect: {}
    expect_stdout: true
}

reduce_cross_reference_3_toplevel: {
    options = {
        collapse_vars: true,
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = b = function() {};
        a.p = b;
        var b = a = function() {};
        b.q = a;
    }
    expect: {}
    expect_stdout: true
}

reduce_cross_reference_4: {
    options = {
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(a, b) {
            a = b = function() {};
            b.p = b;
            b = a = function() {};
            a.q = a;
        })();
    }
    expect: {}
    expect_stdout: true
}

reduce_cross_reference_4_toplevel: {
    options = {
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = b = function() {};
        b.p = b;
        var b = a = function() {};
        a.q = a;
    }
    expect: {}
    expect_stdout: true
}

recursive_collapse: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        console.log(function f(a) {
            var b = a && f();
            return b;
        }("FAIL") || "PASS");
    }
    expect: {
        console.log(function f(a) {
            var b;
            return a && f();
        }("FAIL") || "PASS");
    }
    expect_stdout: "PASS"
}

issue_5025: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            function g() {
                b = 42;
            }
            g(b = a);
            var b = this;
            console.log(typeof b);
        }
        f();
    }
    expect: {
        function f(a) {
            b = a,
            void (b = 42);
            var b = this;
            console.log(typeof b);
        }
        f();
    }
    expect_stdout: "object"
}

issue_5036: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function() {
            var await = function f() {
                return f;
            };
            return await() === await;
        }() ? "PASS" : "FAIL");
    }
    expect: {
        console.log(typeof function() {
            function await() {
                return await;
            }
            return await() === await;
        }() ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

issue_5046: {
    options = {
        conditionals: true,
        evaluate: true,
        keep_fnames: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        if (a)
            0();
        else
            (function f() {
                f;
                return a = "PASS";
            })();
        console.log(a);
    }
    expect: {
        var a = 0;
        (a ? 0 : function f() {
            return a = "PASS";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_5061_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var f, a = 1;
        (f = function() {
            console.log(a ? "foo" : "bar");
        })();
        f(a = 0);
    }
    expect: {
        var f, a = 1;
        (f = function() {
            console.log(a ? "foo" : "bar");
        })();
        f(a = 0);
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

issue_5061_2: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var f, a = 1;
        (f = function() {
            console.log(a ? "foo" : "bar");
        })();
        f(a = 0);
    }
    expect: {
        var f, a = 1;
        (f = function() {
            console.log(a ? "foo" : "bar");
        })();
        f(a = 0);
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

issue_5067: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var f = function() {
            f();
        };
    }
    expect: {}
}

issue_5096_1: {
    options = {
        evaluate: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a, b = "FAIL", c = 1;
        do {
            a && a();
            a = function() {
                b = "PASS";
            };
        } while (c--);
        console.log(b);
    }
    expect: {
        var a, b = "FAIL", c = 1;
        do {
            a && a();
            a = function() {
                b = "PASS";
            };
        } while (c--);
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_5096_2: {
    options = {
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a, b = "FAIL", c = 1;
        do {
            a && a();
            a = function() {
                b = "PASS";
            };
        } while (c--);
        console.log(b);
    }
    expect: {
        var a, b = "FAIL", c = 1;
        do {
            a && a();
            a = function() {
                b = "PASS";
            };
        } while (c--);
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_5096_3: {
    options = {
        evaluate: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var b = "FAIL", c = 1;
        do {
            a && a();
            var a = function() {
                b = "PASS";
            };
        } while (c--);
        console.log(b);
    }
    expect: {
        var b = "FAIL", c = 1;
        do {
            a && a();
            var a = function() {
                b = "PASS";
            };
        } while (c--);
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_5096_4: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var b = "FAIL", c = 1;
        do {
            a && a();
            var a = function() {
                b = "PASS";
            };
        } while (c--);
        console.log(b);
    }
    expect: {
        var b = "FAIL", c = 1;
        do {
            a && a();
            var a = function() {
                b = "PASS";
            };
        } while (c--);
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_5098: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(o) {
            function f() {
                f = console.log;
                if (o.p++)
                    throw "FAIL";
                f("PASS");
            }
            return f;
        })({ p: 0 })();
    }
    expect: {
        (function(o) {
            function f() {
                f = console.log;
                if (o.p++)
                    throw "FAIL";
                f("PASS");
            }
            return f;
        })({ p: 0 })();
    }
    expect_stdout: "PASS"
}

shorter_without_void: {
    options = {
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a;
        function f(b) {
            a = b;
        }
        f("foo");
        console.log(a) || f("bar");
        console.log(a, f("baz"));
        console.log(a);
    }
    expect: {
        var a;
        function f(b) {
            a = b;
        }
        a = "foo";
        console.log(a) || (a = "bar");
        console.log(a, f("baz"));
        console.log(a);
    }
    expect_stdout: [
        "foo",
        "bar undefined",
        "baz",
    ]
}

issue_5120: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f() {
            function g() {
                f || g();
            }
            g();
            return f.valueOf();
        };
        console.log(a() === a ? "PASS" : "FAIL");
    }
    expect: {
        function a() {
            (function g() {
                a || g();
            })();
            return a.valueOf();
        }
        console.log(a() === a ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

issue_5140: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        A = 42;
        function f(b) {
            return b >> 0;
        }
        var a = f(42 in []);
        console.log(f(A));
    }
    expect: {
        function f(b) {
            return b >> 0;
        }
        A = 42;
        console.log(A >> 0);
    }
    expect_stdout: "42"
}

issue_5173_1: {
    options = {
        conditionals: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        function f(a, b) {
            console.log(b);
        }
        f([ A = 42, [] + "" || (A = f) ]);
    }
    expect: {
        function f(a, b) {
            console.log(b);
        }
        f([ A = 42, [] + "" || (A = f) ]);
    }
    expect_stdout: "undefined"
}

issue_5173_2: {
    options = {
        conditionals: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            console.log(b);
        }
        f([ A = 42, [] + "" || (A = f) ]);
    }
    expect: {
        function f(a, b) {
            console.log(b);
        }
        f(A = [] + "" ? 42 : f);
    }
    expect_stdout: "undefined"
}

issue_5230: {
    options = {
        collapse_vars: true,
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        while (function() {
            function f(a) {
                var b = 42, c = (console, [ a ]);
                for (var k in c)
                    c, console.log(b++);
            }
            f(f);
        }());
    }
    expect: {
        while (void (f = function(a) {
            var b = 42;
            console;
            var a;
            for (var k in a = [ a ])
                console.log(b++);
        })(f));
        var f;
    }
    expect_stdout: "42"
}

issue_5237: {
    options = {
        evaluate: true,
        inline: true,
    }
    input: {
        function f() {
            (function() {
                while (console.log(0/0));
            })();
            (function() {
                var NaN = console && console.log(NaN);
            })();
        }
        f();
    }
    expect: {
        function f() {
            while (console.log(NaN));
            (function() {
                var NaN = console && console.log(NaN);
            })();
        }
        f();
    }
    expect_stdout: [
        "NaN",
        "undefined",
    ]
}

issue_5239: {
    options = {
        functions: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            (function(f) {
                var a = 42, f = function() {};
                while (console.log(f.p || a++));
            })();
        })();
    }
    expect: {
        (function() {
            var f = void 0;
            var a = 42, f = function() {};
            while (console.log(f.p || a++));
            return;
        })();
    }
    expect_stdout: "42"
}

issue_5240_1: {
    options = {
        inline: true,
    }
    input: {
        function f() {
            try {
                throw "FAIL 1";
            } catch (e) {
                return function() {
                    if (console) {
                        console.log(e);
                        var e = "FAIL 2";
                    }
                }();
            }
        }
        f();
    }
    expect: {
        function f() {
            try {
                throw "FAIL 1";
            } catch (e) {
                return function() {
                    if (console) {
                        console.log(e);
                        var e = "FAIL 2";
                    }
                }();
            }
        }
        f();
    }
    expect_stdout: "undefined"
}

issue_5240_2: {
    options = {
        inline: true,
    }
    input: {
        function f() {
            try {
                throw "FAIL 1";
            } catch (e) {
                {
                    return function() {
                        if (console) {
                            console.log(e);
                            var e = "FAIL 2";
                        }
                    }();
                }
            }
        }
        f();
    }
    expect: {
        function f() {
            try {
                throw "FAIL 1";
            } catch (e) {
                return function() {
                    if (console) {
                        console.log(e);
                        var e = "FAIL 2";
                    }
                }();
            }
        }
        f();
    }
    expect_stdout: "undefined"
}

issue_5249_1: {
    options = {
        inline: true,
    }
    input: {
        console.log(function() {
            if (!console)
                var a = "FAIL 1";
            else
                return void (a && function() {
                    while (console.log("FAIL 2"));
                }());
            throw "FAIL 3";
        }());
    }
    expect: {
        console.log(function() {
            if (!console)
                var a = "FAIL 1";
            else if (a) {
                while (console.log("FAIL 2"));
                return;
            } else
                return void 0;
            throw "FAIL 3";
        }());
    }
    expect_stdout: "undefined"
}

issue_5249_2: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        inline: true,
        passes: 3,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            if (!console)
                var a = "FAIL 1";
            else
                return void (a && function() {
                    while (console.log("FAIL 2"));
                }());
            throw "FAIL 3";
        }());
    }
    expect: {
        console.log(function() {
            if (!console)
                throw "FAIL 3";
        }());
    }
    expect_stdout: "undefined"
}

issue_5254_1: {
    options = {
        inline: 3,
        unused: true,
    }
    input: {
        (function(a) {
            while (a--)
                (function f() {
                    var f = new function() {
                        console.log(f);
                    }();
                })();
        })(2);
    }
    expect: {
        (function(a) {
            while (a--)
                f = void 0,
                f = new function() {
                    console.log(f);
                }(),
                void 0;
            var f;
        })(2);
    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
}

issue_5254_2: {
    options = {
        inline: true,
        unused: true,
    }
    input: {
        (function(a) {
            while (a--)
                (function f() {
                    var f = new function() {
                        console.log(f);
                    }();
                    while (!console);
                })();
        })(2);
    }
    expect: {
        (function(a) {
            while (a--) {
                f = void 0;
                var f = new function() {
                    console.log(f);
                }();
                while (!console);
            }
        })(2);
    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
}

issue_5263: {
    options = {
        inline: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        for (var i = 0; i < 2; i++) (function() {
            while (console.log(i));
            (function(a) {
                console.log(a) && a,
                a++;
            })();
        })();
    }
    expect: {
        for (var i = 0; i < 2; i++) {
            a = void 0;
            while (console.log(i));
            console.log(a),
            a++;
            var a;
        }
    }
    expect_stdout: [
        "0",
        "undefined",
        "1",
        "undefined",
    ]
}

issue_5264_1: {
    options = {
        if_return: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            function f(arguments) {
                console.log(arguments);
                (function() {
                    while (console.log("foo"));
                })();
            }
            f("bar");
            return arguments;
        }("baz")[0]);
    }
    expect: {
        console.log(function() {
            (function(arguments) {
                console.log(arguments);
                while (console.log("foo"));
            })("bar");
            return arguments;
        }("baz")[0]);
    }
    expect_stdout: [
        "bar",
        "foo",
        "baz",
    ]
}

issue_5264_2: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            function f(arguments) {
                console.log(arguments);
                (function() {
                    while (console.log("foo"));
                })();
            }
            f("bar");
            return arguments;
        }("baz")[0]);
    }
    expect: {
        console.log(function() {
            (function(arguments) {
                console.log(arguments);
                while (console.log("foo"));
            })("bar");
            return arguments;
        }("baz")[0]);
    }
    expect_stdout: [
        "bar",
        "foo",
        "baz",
    ]
}

issue_5283: {
    options = {
        conditionals: true,
        if_return: true,
        inline: true,
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "FAIL 1";
        (function() {
            (a = "PASS")[function() {
                if (console)
                    return null;
                var b = function f(a) {
                    console.log("FAIL 2");
                    var c = a.p;
                }();
            }()];
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL 1";
        (function() {
            a = "PASS";
            console || function(a) {
                console.log("FAIL 2");
                a.p;
            }();
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_5290: {
    options = {
        functions: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1;
        while (a--) new function(b) {
            switch (b) {
              case b.p:
              case console.log("PASS"):
            }
        }(function() {});
    }
    expect: {
        var a = 1;
        while (a--) {
            b = void 0;
            var b = function() {};
            switch (b) {
              case b.p:
              case console.log("PASS"):
            }
        }
    }
    expect_stdout: "PASS"
}

issue_5296: {
    options = {
        inline: true,
    }
    input: {
        var a = "PASS";
        (function() {
            for (var i = 0; i < 2; i++)
                try {
                    return function() {
                        while (!console);
                        var b = b && (a = b) || "FAIL";
                    }();
                } finally {
                    continue;
                }
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function() {
            for (var i = 0; i < 2; i++)
                try {
                    b = void 0;
                    while (!console);
                    var b = b && (a = b) || "FAIL";
                    return;
                } finally {
                    continue;
                }
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_5316_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        do {
            console.log("PASS");
        } while (function() {
            var a, b = 42 && (console[a = b] = a++);
        }());
    }
    expect: {
        do {
            console.log("PASS");
        } while (b = a = void 0, b = (42, console[a = a] = a++), void 0);
        var a, b;
    }
    expect_stdout: "PASS"
}

issue_5316_2: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        do {
            (function() {
                var a, b = 42 && (console[a = b] = a++);
                while (console.log("PASS"));
            })();
        } while (!console);
    }
    expect: {
        do {
            a = void 0;
            var a, b = (42, console[a = b = void 0] = a++);
            while (console.log("PASS"));
        } while (!console);
    }
    expect_stdout: "PASS"
}

issue_5328: {
    options = {
        inline: true,
    }
    input: {
        (function(arguments) {
            console.log(Object.keys(arguments).join());
        })(this);
    }
    expect: {
        (function(arguments) {
            console.log(Object.keys(arguments).join());
        })(this);
    }
    expect_stdout: ""
}

issue_5332_1: {
    options = {
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        do {
            var a = {};
            for (A in a)
                a;
        } while (function() {
            console.log(b);
            var b = b;
        }());
    }
    expect: {
        do {
            var a = {};
            for (A in a);
        } while (a = void 0, void console.log(a));
    }
    expect_stdout: "undefined"
}

issue_5332_2: {
    options = {
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        do {
            var a = 42 in [];
            for (A in a)
                a;
        } while (function() {
            console.log(++b);
            var b = b;
        }());
    }
    expect: {
        do {
            var a = 42 in [];
            for (A in a);
        } while (a = void 0, void console.log(++a));
    }
    expect_stdout: "NaN"
}

issue_5366: {
    options = {
        inline: true,
    }
    input: {
        for (console.log("foo") || function() {
            while (console.log("bar"));
        }(); console.log("baz") ;);
    }
    expect: {
        if (!console.log("foo"))
            while (console.log("bar"));
        for (;console.log("baz"););
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
}

issue_5376_1: {
    options = {
        evaluate: true,
        inline: true,
        join_vars: true,
        loops: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var a;
        for (;42;)
            var b = function() {
                var c;
                throw new Error(c++);
            }();
    }
    expect: {
        "use strict";
        for (;;) {
            42;
            throw new Error(NaN);
        }
    }
    expect_stdout: Error("NaN")
}

issue_5376_2: {
    options = {
        evaluate: true,
        inline: true,
        join_vars: true,
        loops: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var a;
        for (;42;)
            var b = function() {
                var c;
                c++;
                throw new Error("PASS");
            }();
    }
    expect: {
        "use strict";
        for (;;) {
            0;
            throw new Error("PASS");
        }
    }
    expect_stdout: Error("PASS")
}

issue_5401: {
    options = {
        inline: true,
    }
    input: {
        L: for (var a in function() {
            while (console.log("PASS"));
        }(), a) do {
            continue L;
        } while (console.log("FAIL"));
    }
    expect: {
        while (console.log("PASS"));
        L: for (var a in a) do {
            continue L;
        } while (console.log("FAIL"));
    }
    expect_stdout: "PASS"
}

issue_5409: {
    options = {
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            (a = console) || FAIL(a);
            (function(b) {
                console.log(b && b);
                while (!console);
            })();
        })();
    }
    expect: {
        (function(a) {
            (a = console) || FAIL(a);
            a = void 0;
            console.log(a && a);
            while (!console);
            return;
        })();
    }
    expect_stdout: "undefined"
}

mixed_mode_inline_1: {
    options = {
        directives: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            return this;
        }
        console.log(function() {
            return f();
        }() ? "PASS" : "FAIL");
    }
    expect: {
        console.log(function() {
            return this;
        }() ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

mixed_mode_inline_1_strict: {
    options = {
        directives: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {
            return this;
        }
        console.log(function() {
            return f();
        }() ? "FAIL" : "PASS");
    }
    expect: {
        "use strict";
        console.log(function() {
            return this;
        }() ? "FAIL" : "PASS");
    }
    expect_stdout: "PASS"
}

mixed_mode_inline_2: {
    options = {
        directives: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            "use strict";
            return this;
        }
        console.log(function() {
            return f();
        }() ? "FAIL" : "PASS");
    }
    expect: {
        console.log(function() {
            "use strict";
            return this;
        }() ? "FAIL" : "PASS");
    }
    expect_stdout: "PASS"
}

mixed_mode_inline_2_strict: {
    options = {
        directives: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {
            "use strict";
            return this;
        }
        console.log(function() {
            return f();
        }() ? "FAIL" : "PASS");
    }
    expect: {
        "use strict";
        console.log(function() {
            return this;
        }() ? "FAIL" : "PASS");
    }
    expect_stdout: "PASS"
}

mixed_mode_inline_3: {
    options = {
        directives: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            return this;
        }
        console.log(function() {
            "use strict";
            return f();
        }() ? "PASS" : "FAIL");
    }
    expect: {
        function f() {
            return this;
        }
        console.log(function() {
            "use strict";
            return f();
        }() ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

mixed_mode_inline_3_strict: {
    options = {
        directives: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {
            return this;
        }
        console.log(function() {
            "use strict";
            return f();
        }() ? "FAIL" : "PASS");
    }
    expect: {
        "use strict";
        console.log(function() {
            return this;
        }() ? "FAIL" : "PASS");
    }
    expect_stdout: "PASS"
}

mixed_mode_inline_4: {
    options = {
        directives: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            "use strict";
            return this;
        }
        console.log(function() {
            "use strict";
            return f();
        }() ? "FAIL" : "PASS");
    }
    expect: {
        console.log(function() {
            "use strict";
            return function() {
                "use strict";
                return this;
            }();
        }() ? "FAIL" : "PASS");
    }
    expect_stdout: "PASS"
}

mixed_mode_inline_4_strict: {
    options = {
        directives: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {
            "use strict";
            return this;
        }
        console.log(function() {
            "use strict";
            return f();
        }() ? "FAIL" : "PASS");
    }
    expect: {
        "use strict";
        console.log(function() {
            return this;
        }() ? "FAIL" : "PASS");
    }
    expect_stdout: "PASS"
}

module_inline: {
    options = {
        inline: true,
        module: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = f;
        function f() {
            return a;
        }
        console.log(f() === a);
    }
    expect: {
        var a = f;
        function f() {
            return a;
        }
        console.log(a === a);
    }
    expect_stdout: "true"
}

single_use_inline_collision: {
    options = {
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function() {
            var f = function() {
                while (console.log(a));
            };
            (function() {
                (function() {
                    f();
                })();
                (function(a) {
                    a || a("FAIL");
                })(console.log);
            })();
        })();
    }
    expect: {
        var a = "PASS";
        (function() {
            (function() {
                while (console.log(a));
                return;
            })();
            (function(a) {
                a || a("FAIL");
            })(console.log);
            return;
        })();
    }
    expect_stdout: "PASS"
}

issue_5692: {
    options = {
        inline: true,
    }
    input: {
        (function() {
            while (console.log("PASS"))
                if (console)
                    return;
        })();
    }
    expect: {
        (function() {
            while (console.log("PASS"))
                if (console)
                    return;
        })();
    }
    expect_stdout: "PASS"
}

issue_5766_1: {
    options = {
        booleans: true,
        evaluate: true,
        functions: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        log = function(a) {
            console.log(typeof a);
        };
        do {
            (function() {
                try {
                    var f = function() {};
                    log(f && f);
                } catch (e) {}
            })();
        } while (0);
    }
    expect: {
        log = function(a) {
            console.log(typeof a);
        };
        do {
            try {
                function f() {}
                log(f);
            } catch (e) {}
        } while (0);
    }
    expect_stdout: "function"
}

issue_5766_2: {
    options = {
        evaluate: true,
        functions: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        log = function(a) {
            console.log(typeof a);
        };
        do {
            (function() {
                try {
                    var f = function() {};
                    log(f && f);
                } catch (e) {}
            })();
        } while (0);
    }
    expect: {
        log = function(a) {
            console.log(typeof a);
        };
        do {
            try {
                function f() {}
                log(f);
            } catch (e) {}
        } while (0);
    }
    expect_stdout: "function"
}
