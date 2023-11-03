binary: {
    input: {
        var a = function*() {
            console.log(6 * (yield "PA" + "SS"));
        }();
        console.log(a.next("FAIL").value);
        console.log(a.next(7).done);
    }
    expect_exact: 'var a=function*(){console.log(6*(yield"PA"+"SS"))}();console.log(a.next("FAIL").value);console.log(a.next(7).done);'
    expect_stdout: [
        "PASS",
        "42",
        "true",
    ]
    node_version: ">=4"
}

empty_yield: {
    input: {
        var a = function*() {
            yield;
            console.log(yield);
            yield
            "FAIL 1";
        }();
        console.log(a.next("FAIL 2").value);
        console.log(a.next("FAIL 3").value);
        console.log(a.next("PASS").value);
        console.log(a.next("FAIL 4").done);
    }
    expect_exact: 'var a=function*(){yield;console.log(yield);yield;"FAIL 1"}();console.log(a.next("FAIL 2").value);console.log(a.next("FAIL 3").value);console.log(a.next("PASS").value);console.log(a.next("FAIL 4").done);'
    expect_stdout: [
        "undefined",
        "undefined",
        "PASS",
        "undefined",
        "true",
    ]
    node_version: ">=4"
}

empty_yield_conditional: {
    input: {
        var a = function*() {
            console.log((yield) ? yield : yield);
        }();
        console.log(a.next("FAIL 1").value);
        console.log(a.next("FAIL 2").value);
        console.log(a.next("PASS").value);
        console.log(a.next("FAIL 3").done);
    }
    expect_exact: 'var a=function*(){console.log((yield)?yield:yield)}();console.log(a.next("FAIL 1").value);console.log(a.next("FAIL 2").value);console.log(a.next("PASS").value);console.log(a.next("FAIL 3").done);'
    expect_stdout: [
        "undefined",
        "undefined",
        "PASS",
        "undefined",
        "true",
    ]
    node_version: ">=4"
}

nested_yield: {
    input: {
        console.log(function*() {
            (yield*
            f())
            function* f() {
                return "FAIL";
            }
            yield*
            f();
            yield *f();
        }().next().value || "PASS");
    }
    expect_exact: 'console.log(function*(){yield*f();function*f(){return"FAIL"}yield*f();yield*f()}().next().value||"PASS");'
    expect_stdout: "PASS"
    node_version: ">=4"
}

pause_resume: {
    input: {
        function* f() {
            console.log(yield "PASS");
        }
        var a = f();
        console.log(a.next("FAIL").value);
        console.log(a.next(42).done);
    }
    expect_exact: 'function*f(){console.log(yield"PASS")}var a=f();console.log(a.next("FAIL").value);console.log(a.next(42).done);'
    expect_stdout: [
        "PASS",
        "42",
        "true",
    ]
    node_version: ">=4"
}

arrow_yield_1: {
    input: {
        yield = "PASS";
        console.log(function*() {
            return () => yield || "FAIL";
        }().next().value());
    }
    expect_exact: 'yield="PASS";console.log(function*(){return()=>yield||"FAIL"}().next().value());'
    expect_stdout: "PASS"
    node_version: ">=4"
}

arrow_yield_2: {
    input: {
        console.log(typeof function *() {
            // Syntax error on Node.js v6+
            return (yield) => {};
        }().next().value);
    }
    expect_exact: "console.log(typeof function*(){return(yield)=>{}}().next().value);"
    expect_stdout: "function"
    node_version: "4"
}

for_of: {
    input: {
        function* f() {
            if (yield "PASS") yield "FAIL 1";
            yield 42;
            return "FAIL 2";
        }
        for (var a of f())
            console.log(a);
    }
    expect_exact: 'function*f(){if(yield"PASS")yield"FAIL 1";yield 42;return"FAIL 2"}for(var a of f())console.log(a);'
    expect_stdout: [
        "PASS",
        "42",
    ]
    node_version: ">=4"
}

for_await_of: {
    input: {
        async function* f() {
            if (yield "PASS") yield "FAIL 1";
            yield {
                then: function(r) {
                    r(42);
                },
            };
            return "FAIL 2";
        }
        (async function(a) {
            for await (a of f())
                console.log(a);
        })();
    }
    expect_exact: 'async function*f(){if(yield"PASS")yield"FAIL 1";yield{then:function(r){r(42)}};return"FAIL 2"}(async function(a){for await(a of f())console.log(a)})();'
    expect_stdout: [
        "PASS",
        "42",
    ]
    node_version: ">=10"
}

comment_newline: {
    beautify = {
        comments: "all",
    }
    input: {
        console.log(function*() {
            yield (
                /* */
                "PASS"
            );
        }().next().value);
    }
    expect_exact: [
        "console.log(function*(){",
        "/* */",
        'yield"PASS"}().next().value);',
    ]
    expect_stdout: "PASS"
    node_version: ">=4"
}

collapse_vars_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (function*() {
            a = "PASS";
            yield 42;
            return "PASS";
        })().next();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function*() {
            a = "PASS";
            yield 42;
            return "PASS";
        })().next();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

collapse_vars_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (function*() {
            yield (a = "PASS");
            return "PASS";
        })().next();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function*() {
            yield (a = "PASS");
            return "PASS";
        })().next();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

collapse_vars_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (function*() {
            yield (a = "PASS", 42);
            return "PASS";
        })().next();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function*() {
            yield (a = "PASS", 42);
            return "PASS";
        })().next();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

collapse_vars_4: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        var b = function*(c) {
            return c;
        }(a = "PASS");
        console.log(a, b.next().done);
    }
    expect: {
        var a = "FAIL";
        var b = function*(c) {
            return c;
        }(a = "PASS");
        console.log(a, b.next().done);
    }
    expect_stdout: "PASS true"
    node_version: ">=4"
}

collapse_vars_5: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = function* f(b, c) {
            b = yield c = b;
            console.log(c);
        }("PASS");
        a.next();
        a.next("FAIL");
    }
    expect: {
        var a = function* f(b, c) {
            b = yield c = b;
            console.log(c);
        }("PASS");
        a.next();
        a.next("FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

collapse_property_lambda: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
    }
    input: {
        console.log(function* f() {
            f.g = () => 42;
            return f.g();
        }().next().value);
    }
    expect: {
        console.log(function* f() {
            return (f.g = () => 42)();
        }().next().value);
    }
    expect_stdout: "42"
    node_version: ">=4"
}

defun_name: {
    input: {
        function* yield() {
            console.log("PASS");
        }
        yield().next();
    }
    expect: {
        function* yield() {
            console.log("PASS");
        }
        yield().next();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

drop_fname: {
    rename = true
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    mangle = {
        toplevel: true,
    }
    input: {
        function* yield() {
            console.log("PASS");
        }
        yield().next();
    }
    expect: {
        (function*() {
            console.log("PASS");
        })().next();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

keep_fname: {
    options = {
        keep_fnames: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function* yield() {
            console.log("PASS");
        }
        yield().next();
    }
    expect: {
        function* yield() {
            console.log("PASS");
        }
        yield().next();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

evaluate: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function*() {}();
        console.log(typeof a);
    }
    expect: {
        var a = function*() {}();
        console.log(typeof a);
    }
    expect_stdout: "object"
    node_version: ">=4"
}

functions: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function*() {
            var a = function* a() {
                return a && "a";
            };
            var b = function* x() {
                return !!x;
            };
            var c = function*(c) {
                return c;
            };
            if (yield* c(yield* b(yield* a()))) {
                var d = function*() {};
                var e = function* y() {
                    return typeof y;
                };
                var f = function*(f) {
                    return f;
                };
                console.log(yield* a(yield* d()), yield* b(yield* e()), yield* c(yield* f(42)), typeof d, yield* e(), typeof f);
            }
        }().next();
    }
    expect: {
        !function*() {
            function* a() {
                return a && "a";
            }
            function* b() {
                return !!b;
            }
            function* c(c) {
                return c;
            }
            if (yield* c(yield* b(yield* a()))) {
                var d = function*() {};
                var e = function* y() {
                    return typeof y;
                };
                var f = function*(f) {
                    return f;
                };
                console.log(yield* a(yield* d()), yield* b(yield* e()), yield* c(yield* f(42)), typeof d, yield* e(), typeof f);
            }
        }().next();
    }
    expect_stdout: "a true 42 function function function"
    node_version: ">=4"
}

functions_use_strict: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        !function*() {
            var a = function* a() {
                return a && "a";
            };
            var b = function* x() {
                return !!x;
            };
            var c = function*(c) {
                return c;
            };
            if (yield* c(yield* b(yield* a()))) {
                var d = function*() {};
                var e = function* y() {
                    return typeof y;
                };
                var f = function*(f) {
                    return f;
                };
                console.log(yield* a(yield* d()), yield* b(yield* e()), yield* c(yield* f(42)), typeof d, yield* e(), typeof f);
            }
        }().next();
    }
    expect: {
        "use strict";
        !function*() {
            function* a() {
                return a && "a";
            }
            function* b() {
                return !!b;
            }
            function* c(c) {
                return c;
            }
            if (yield* c(yield* b(yield* a()))) {
                var d = function*() {};
                var e = function* y() {
                    return typeof y;
                };
                var f = function*(f) {
                    return f;
                };
                console.log(yield* a(yield* d()), yield* b(yield* e()), yield* c(yield* f(42)), typeof d, yield* e(), typeof f);
            }
        }().next();
    }
    expect_stdout: "a true 42 function function function"
    node_version: ">=4"
}

functions_anonymous: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var yield = function*() {
            return "PASS";
        };
        console.log(yield().next(yield).value);
    }
    expect: {
        function* yield() {
            return "PASS";
        }
        console.log(yield().next(yield).value);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

functions_inner_var: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var yield = function* a() {
            var a;
            console.log(a, a);
        };
        yield().next(yield);
    }
    expect: {
        function* yield() {
            var a;
            console.log(a, a);
        }
        yield().next(yield);
    }
    expect_stdout: "undefined undefined"
    node_version: ">=4"
}

negate_iife: {
    options = {
        negate_iife: true,
        side_effects: true,
    }
    input: {
        (function*(a) {
            console.log(a);
        })("PASS").next();
    }
    expect: {
        !function*(a) {
            console.log(a);
        }("PASS").next();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

reduce_iife_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function*(a) {
            yield a;
        }(42).next().value);
    }
    expect: {
        console.log(function*(a) {
            yield 42;
        }().next().value);
    }
    expect_stdout: "42"
    node_version: ">=4"
}

reduce_iife_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function*() {
            a = "FAIL";
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function*() {
            a = "FAIL";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

reduce_single_use_defun: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function* f(a) {
            console.log(a);
        }
        f("PASS").next();
    }
    expect: {
        (function*(a) {
            console.log(a);
        })("PASS").next();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

reduce_tagged: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function* f() {
            function g() {
                h`foo`;
            }
            g();
            function h(s) {
                console.log(s[0]);
            }
            h([ "bar" ]);
        }
        f().next();
    }
    expect: {
        function* f() {
            (function() {
                h`foo`;
            })();
            function h(s) {
                console.log(s[0]);
            }
            h([ "bar" ]);
        }
        f().next();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

reduce_tagged_async: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        async function* f() {
            function g() {
                h`foo`;
            }
            g();
            function h(s) {
                console.log(s[0]);
            }
            h([ "bar" ]);
        }
        f().next();
    }
    expect: {
        async function* f() {
            (function() {
                h`foo`;
            })();
            function h(s) {
                console.log(s[0]);
            }
            h([ "bar" ]);
        }
        f().next();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=10"
}

lift_sequence: {
    options = {
        sequences: true,
        yields: true,
    }
    input: {
        console.log(function*() {
            yield (console, "PASS");
        }().next().value);
    }
    expect: {
        console.log(function*() {
            console, yield "PASS";
        }().next().value);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

inline_nested: {
    options = {
        inline: true,
        sequences: true,
        yields: true,
    }
    input: {
        var a = function*() {
            yield* function*() {
                yield "foo";
                return "FAIL";
            }();
        }(), b;
        do {
            b = a.next();
            console.log(b.value);
        } while (!b.done);
    }
    expect: {
        var a = function*() {
            yield "foo",
            "FAIL";
        }(), b;
        do {
            b = a.next(),
            console.log(b.value);
        } while (!b.done);
    }
    expect_stdout: [
        "foo",
        "undefined",
    ]
    node_version: ">=4"
}

inline_nested_async: {
    options = {
        awaits: true,
        inline: true,
        sequences: true,
        side_effects: true,
        yields: true,
    }
    input: {
        console.log("foo");
        var a = async function*() {
            console.log(await(yield* async function*() {
                yield {
                    then: r => r("bar"),
                };
                return "baz";
            }()));
        }();
        console.log("moo");
        a.next().then(function f(b) {
            console.log(b.value);
            b.done || a.next().then(f);
        });
        console.log("moz");
    }
    expect: {
        console.log("foo");
        var a = async function*() {
            console.log((yield {
                then: r => r("bar"),
            }, await "baz"));
        }();
        console.log("moo"),
        a.next().then(function f(b) {
            console.log(b.value),
            b.done || a.next().then(f);
        }),
        console.log("moz");
    }
    expect_stdout: [
        "foo",
        "moo",
        "moz",
        "bar",
        "baz",
        "undefined",
    ]
    node_version: ">=10"
}

inline_nested_block: {
    options = {
        if_return: true,
        inline: true,
        yields: true,
    }
    input: {
        var a = function*() {
            yield* function*() {
                for (var a of [ "foo", "bar" ])
                    yield a;
                return "FAIL";
            }();
        }(), b;
        do {
            b = a.next();
            console.log(b.value);
        } while (!b.done);
    }
    expect: {
        var a = function*() {
            for (var a of [ "foo", "bar" ])
                yield a;
            "FAIL";
        }(), b;
        do {
            b = a.next();
            console.log(b.value);
        } while (!b.done);
    }
    expect_stdout: [
        "foo",
        "bar",
        "undefined",
    ]
    node_version: ">=4"
}

dont_inline_nested: {
    options = {
        inline: true,
    }
    input: {
        var yield = "PASS";
        (function*() {
            (function() {
                console.log(yield);
            })();
        })().next();
    }
    expect: {
        var yield = "PASS";
        (function*() {
            (function() {
                console.log(yield);
            })();
        })().next();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

drop_body_1: {
    options = {
        side_effects: true,
        yields: true,
    }
    input: {
        (function*([ , a = console.log("foo") ]) {
            console.log("bar");
        })([ console.log("baz") ]);
    }
    expect: {
        void ([ [ , [][0] = console.log("foo") ] ] = [ [ console.log("baz") ] ]);
    }
    expect_stdout: [
        "baz",
        "foo",
    ]
    node_version: ">=6"
}

drop_body_2: {
    options = {
        passes: 2,
        side_effects: true,
        yields: true,
    }
    input: {
        (function*([ , a = console.log("foo") ]) {
            console.log("bar");
        })([ console.log("baz") ]);
    }
    expect: {
        [ [ , [][0] = console.log("foo") ] ] = [ [ console.log("baz") ] ];
    }
    expect_stdout: [
        "baz",
        "foo",
    ]
    node_version: ">=6"
}

drop_unused_call: {
    options = {
        inline: true,
        side_effects: true,
        toplevel: true,
        unused: true,
        yields: true,
    }
    input: {
        var a = function*(){}(console.log("PASS"));
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

instanceof_lambda: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log(42 instanceof function*() {});
    }
    expect: {
        console.log(false);
    }
    expect_stdout: "false"
    node_version: ">=4"
}

issue_4454_1: {
    rename = false
    options = {
        merge_vars: true,
    }
    input: {
        function f(a) {
            (function*(b = console.log(a)) {})();
            var yield = 42..toString();
            console.log(yield);
        }
        f("PASS");
    }
    expect: {
        function f(a) {
            (function*(b = console.log(a)) {})();
            var yield = 42..toString();
            console.log(yield);
        }
        f("PASS");
    }
    expect_stdout: [
        "PASS",
        "42",
    ]
    node_version: ">=6"
}

issue_4454_2: {
    rename = true
    options = {
        merge_vars: true,
    }
    input: {
        function f(a) {
            (function*(b = console.log(a)) {})();
            var yield = 42..toString();
            console.log(yield);
        }
        f("PASS");
    }
    expect: {
        function f(a) {
            (function*(c = console.log(a)) {})();
            var b = 42..toString();
            console.log(b);
        }
        f("PASS");
    }
    expect_stdout: [
        "PASS",
        "42",
    ]
    node_version: ">=6"
}

issue_4618: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function() {
            var yield = function* f() {
                console || f();
            };
            console.log;
            return yield;
        }());
    }
    expect: {
        console.log(typeof function() {
            var yield = function* f() {
                console || f();
            };
            console.log;
            return yield;
        }());
    }
    expect_stdout: "function"
    node_version: ">=4"
}

issue_4623: {
    options = {
        conditionals: true,
    }
    input: {
        if (console ? function*() {} : 0)
            console.log("PASS");
    }
    expect: {
        (console ? function*() {} : 0) && console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4633: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = function*() {
            (function(log) {
                log(typeof this);
            })(yield "PASS");
        }();
        console.log(a.next().value);
        a.next(console.log);
    }
    expect: {
        var a = function*() {
            (function(log) {
                log(typeof this);
            })(yield "PASS");
        }();
        console.log(a.next().value);
        a.next(console.log);
    }
    expect_stdout: [
        "PASS",
        "object",
    ]
    node_version: ">=4"
}

issue_4639_1: {
    options = {
        inline: true,
    }
    input: {
        console.log(function*() {
            return function() {
                return yield => "PASS";
            }();
        }().next().value());
    }
    expect: {
        console.log(function*() {
            return function() {
                return yield => "PASS";
            }();
        }().next().value());
    }
    expect_stdout: "PASS"
    node_version: ">=4 <7 || >=8.7.0"
}

issue_4639_2: {
    options = {
        inline: true,
    }
    input: {
        (function*() {
            console.log(function() {
                return typeof yield;
            }());
        })().next();
    }
    expect: {
        (function*() {
            console.log(function() {
                return typeof yield;
            }());
        })().next();
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_4641_1: {
    options = {
        sequences: true,
    }
    input: {
        console.log(typeof async function*() {
            try {
                console.log("foo");
                return;
            } finally {
                console.log("bar");
            }
        }().next().then);
    }
    expect: {
        console.log(typeof async function*() {
            try {
                console.log("foo");
                return;
            } finally {
                console.log("bar");
            }
        }().next().then);
    }
    expect_stdout: [
        "foo",
        "bar",
        "function",
    ]
    node_version: ">=10"
}

issue_4641_2: {
    options = {
        side_effects: true,
    }
    input: {
        console.log(typeof async function*() {
            try {
                return void "FAIL";
            } finally {
                console.log("PASS");
            }
        }().next().then);
    }
    expect: {
        console.log(typeof async function*() {
            try {
                return void 0;
            } finally {
                console.log("PASS");
            }
        }().next().then);
    }
    expect_stdout: [
        "function",
        "PASS",
    ]
    node_version: ">=10"
}

issue_4641_3: {
    options = {
        if_return: true,
    }
    input: {
        console.log(typeof async function*() {
            try {
                return void "FAIL";
            } finally {
                console.log("PASS");
            }
        }().next().then);
    }
    expect: {
        console.log(typeof async function*() {
            try {
                return void "FAIL";
            } finally {
                console.log("PASS");
            }
        }().next().then);
    }
    expect_stdout: [
        "function",
        "PASS",
    ]
    node_version: ">=10"
}

issue_4769_1: {
    options = {
        side_effects: true,
    }
    input: {
        console.log(function*() {
            (function({} = yield => {}) {})();
        }().next().done);
    }
    expect: {
        console.log(function*() {
            (function({} = yield => {}) {})();
        }().next().done);
    }
    expect_stdout: "true"
    node_version: ">=6"
}

issue_4769_2: {
    options = {
        inline: true,
    }
    input: {
        console.log(function*() {
            return function({} = yield => {}) {
                return "PASS";
            }();
        }().next().value);
    }
    expect: {
        console.log(function*() {
            return function({} = yield => {}) {
                return "PASS";
            }();
        }().next().value);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5019_1: {
    options = {
        dead_code: true,
    }
    input: {
        (function(a) {
            return a = function*() {
                console.log(typeof a);
            }();
        })().next();
    }
    expect: {
        (function(a) {
            return a = function*() {
                console.log(typeof a);
            }();
        })().next();
    }
    expect_stdout: "object"
    node_version: ">=4"
}

issue_5019_2: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        var a = [];
        for (var b in "foo")
            a.push(function(c) {
                return function*() {
                    console.log(c);
                }();
            }(b));
        a.map(function(d) {
            return d.next();
        });
    }
    expect: {
        var a = [];
        for (var b in "foo")
            a.push(function(c) {
                return function*() {
                    console.log(c);
                }();
            }(b));
        a.map(function(d) {
            return d.next();
        });
    }
    expect_stdout: [
        "0",
        "1",
        "2",
    ]
    node_version: ">=4"
}

issue_5034: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var yield = function f() {
                return function*() {
                    return f;
                };
            };
            return yield()().next().value === yield;
        }() ? "PASS" : "FAIL");
    }
    expect: {
        console.log(function() {
            var yield = function f() {
                return function*() {
                    return f;
                };
            };
            return yield()().next().value === yield;
        }() ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5076_1: {
    options = {
        evaluate: true,
        hoist_vars: true,
        keep_fargs: false,
        pure_getters: "strict",
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
        yields: true,
    }
    input: {
        var a;
        console.log("PASS");
        var b = function*({
            p: {},
        }) {}({
            p: { a } = 42,
        });
    }
    expect: {
        var a;
        console.log("PASS"),
        a = 42["a"];
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5076_2: {
    options = {
        evaluate: true,
        hoist_vars: true,
        keep_fargs: false,
        passes: 2,
        pure_getters: "strict",
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
        yields: true,
    }
    input: {
        var a;
        console.log("PASS");
        var b = function*({
            p: {},
        }) {}({
            p: { a } = 42,
        });
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5177: {
    options = {
        properties: true,
    }
    input: {
        console.log(typeof function*() {
            return {
                p(yield) {},
            }.p;
        }().next().value);
    }
    expect: {
        console.log(typeof function*() {
            return {
                p(yield) {},
            }.p;
        }().next().value);
    }
    expect_stdout: "function"
    node_version: ">=4"
}

issue_5385_1: {
    options = {
        inline: true,
    }
    input: {
        (async function*() {
            (function() {
                try {
                    return console.log("foo");
                } finally {
                    return console.log("bar");
                }
                console.log("baz");
            })();
        })().next();
        console.log("moo");
    }
    expect: {
        (async function*() {
            (function() {
                try {
                    return console.log("foo");
                } finally {
                    return console.log("bar");
                }
                console.log("baz");
            })();
        })().next();
        console.log("moo");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
    ]
    node_version: ">=10"
}

issue_5385_2: {
    options = {
        inline: true,
    }
    input: {
        (async function*() {
            return function() {
                try {
                    return console.log("foo");
                } finally {
                    return console.log("bar");
                }
            }();
        })().next();
        console.log("moo");
    }
    expect: {
        (async function*() {
            return function() {
                try {
                    return console.log("foo");
                } finally {
                    return console.log("bar");
                }
            }();
        })().next();
        console.log("moo");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
    ]
    node_version: ">=10"
}

issue_5385_3: {
    options = {
        inline: true,
    }
    input: {
        (async function*() {
            return function() {
                try {
                    throw console.log("foo");
                } catch (e) {
                    return console.log("bar");
                }
            }();
        })().next();
        console.log("moo");
    }
    expect: {
        (async function*() {
            try {
                throw console.log("foo");
            } catch (e) {
                return console.log("bar");
            }
            return void 0;
        })().next();
        console.log("moo");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
    ]
    node_version: ">=10"
}

issue_5385_4: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function*() {
            return async function() {
                try {
                    return {
                        then(resolve) {
                            resolve(console.log("FAIL"));
                        },
                    };
                } finally {
                    return "PASS";
                }
            }();
        })().next().then(o => console.log(o.value, o.done));
    }
    expect: {
        (async function*() {
            return async function() {
                try {
                    return {
                        then(resolve) {
                            resolve(console.log("FAIL"));
                        },
                    };
                } finally {
                    return "PASS";
                }
            }();
        })().next().then(o => console.log(o.value, o.done));
    }
    expect_stdout: "PASS true"
    node_version: ">=10"
}

issue_5425: {
    options = {
        assignments: true,
        ie: true,
        toplevel: true,
        unused: true,
        yields: true,
    }
    input: {
        var a = "FAIL";
        var b = function* f() {}(a ? a = "PASS" : 42);
        console.log(a, typeof f);
    }
    expect: {
        var a = "FAIL";
        (function* f() {})(a && (a = "PASS"));
        console.log(a, typeof f);
    }
    expect_stdout: "PASS undefined"
    node_version: ">=4"
}

issue_5456: {
    options = {
        inline: true,
        merge_vars: true,
    }
    input: {
        var a = true;
        (function() {
            (function(b, c) {
                var d = function*() {
                    c = null;
                }();
                var e = function() {
                    if (c)
                        console.log(typeof d);
                    while (b);
                }();
            })(function(i) {
                return console.log("foo") && i;
            }(a));
        })();
    }
    expect: {
        var a = true;
        (function() {
            b = (i = a, console.log("foo") && i),
            d = function*() {
                c = null;
            }(),
            e = function() {
                if (c) console.log(typeof d);
                while (b);
            }(),
            void 0;
            var b, c, d, e;
            var i;
        })();
    }
    expect_stdout: "foo"
    node_version: ">=4"
}

issue_5506: {
    options = {
        dead_code: true,
    }
    input: {
        console.log(function(a) {
            var b = function*() {
                a = null in (a = "PASS");
            }();
            try {
                b.next();
            } catch (e) {
                return a;
            }
        }("FAIL"));
    }
    expect: {
        console.log(function(a) {
            var b = function*() {
                a = null in (a = "PASS");
            }();
            try {
                b.next();
            } catch (e) {
                return a;
            }
        }("FAIL"));
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5526: {
    options = {
        inline: true,
        side_effects: true,
    }
    input: {
        (async function*() {
            try {
                return function() {
                    while (console.log("foo"));
                }();
            } finally {
                console.log("bar");
            }
        })().next();
        console.log("baz");
    }
    expect: {
        (async function*() {
            try {
                while (console.log("foo"));
                return void 0;
            } finally {
                console.log("bar");
            }
        })().next();
        console.log("baz");
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
    ]
    node_version: ">=10"
}

issue_5576: {
    options = {
        inline: true,
    }
    input: {
        (async function*() {
            try {
                (function() {
                    while (console.log("foo"));
                })();
            } finally {
                console.log("bar");
            }
        })().next();
        console.log("baz");
    }
    expect: {
        (async function*() {
            try {
                while (console.log("foo"));
            } finally {
                console.log("bar");
            }
        })().next();
        console.log("baz");
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
    node_version: ">=10"
}

issue_5663: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var [ , a ] = function*() {
            console.log("foo");
            yield console.log("bar");
            console.log("baz");
            yield console.log("moo");
            console.log("moz");
            yield FAIL;
        }();
    }
    expect: {
        var [ , , ] = function*() {
            console.log("foo");
            yield console.log("bar");
            console.log("baz");
            yield console.log("moo");
            console.log("moz");
            yield FAIL;
        }();
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
        "moo",
    ]
    node_version: ">=6"
}

issue_5679_1: {
    options = {
        conditionals: true,
    }
    input: {
        var a = "FAIL";
        async function* f(b) {
            try {
                if (b)
                    return;
                else
                    return;
            } finally {
                a = "PASS";
            }
        }
        f().next();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        async function* f(b) {
            try {
                b;
                return;
            } finally {
                a = "PASS";
            }
        }
        f().next();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_5679_2: {
    options = {
        conditionals: true,
    }
    input: {
        var a = "FAIL";
        async function* f(b) {
            try {
                if (b)
                    return undefined;
                else
                    return;
            } finally {
                a = "PASS";
            }
        }
        f().next();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        async function* f(b) {
            try {
                if (b)
                    return void 0;
                return;
            } finally {
                a = "PASS";
            }
        }
        f().next();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_5679_3: {
    options = {
        conditionals: true,
    }
    input: {
        var a = "FAIL";
        async function* f(b) {
            try {
                if (b)
                    return;
                else
                    return undefined;
            } finally {
                a = "PASS";
            }
        }
        f(42).next();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        async function* f(b) {
            try {
                if (b)
                    return;
                return void 0;
            } finally {
                a = "PASS";
            }
        }
        f(42).next();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_5679_4: {
    options = {
        conditionals: true,
    }
    input: {
        var a = "PASS";
        async function* f(b) {
            try {
                if (b)
                    return undefined;
                else
                    return undefined;
            } finally {
                a = "FAIL";
            }
        }
        f(null).next();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        async function* f(b) {
            try {
                return b, void 0;
            } finally {
                a = "FAIL";
            }
        }
        f(null).next();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_5679_5: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        var a = "FAIL";
        async function* f(b) {
            try {
                if (b)
                    return console;
                else
                    return;
            } finally {
                a = "PASS";
            }
        }
        f().next();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        async function* f(b) {
            try {
                if (b)
                    return console;
                return;
            } finally {
                a = "PASS";
            }
        }
        f().next();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_5679_6: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        var a = "PASS";
        async function* f(b) {
            try {
                if (b)
                    return;
                else
                    return console;
            } finally {
                a = "FAIL";
            }
        }
        f().next();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        async function* f(b) {
            try {
                if (!b)
                    return console;
            } finally {
                a = "FAIL";
            }
        }
        f().next();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_5684: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        (async function*() {
            switch (42) {
              default:
                if (console.log("PASS"))
                    return;
                return null;
              case false:
            }
        })().next();
    }
    expect: {
        (async function*() {
            switch (42) {
              default:
                return console.log("PASS") ? void 0 : null;
              case false:
            }
        })().next();
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_5707_1: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
        yields: true,
    }
    input: {
        var a, b;
        function* f(c = (b = 42, console.log("PASS"))) {}
        b = f();
    }
    expect: {
        (function(c = console.log("PASS")) {})();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5707_2: {
    options = {
        hoist_props: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
        yields: true,
    }
    input: {
        var a, b;
        function* f(c = (b = 42, console.log("PASS"))) {}
        b = f();
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5710: {
    options = {
        conditionals: true,
        if_return: true,
    }
    input: {
        (async function*() {
            try {
                switch (42) {
                  case 42:
                    {
                        if (console.log("PASS"))
                            return;
                        return null;
                    }
                    break;
                }
            } finally {}
        })().next();
    }
    expect: {
        (async function*() {
            try {
                switch (42) {
                  case 42:
                    if (console.log("PASS"))
                        return;
                    return null;
                    break;
                }
            } finally {}
        })().next();
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_5749_1: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
        yields: true,
    }
    input: {
        var a;
        function* f() {}
        a = f(new function() {
            var b = a |= 0, c = a += console.log("PASS");
        }());
    }
    expect: {
        (function() {})(function() {
            console.log("PASS");
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5749_2: {
    options = {
        collapse_vars: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
        yields: true,
    }
    input: {
        var a;
        function* f() {}
        a = f(new function() {
            var b = a |= 0, c = a += console.log("PASS");
        }());
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5754: {
    options = {
        if_return: true,
    }
    input: {
        async function* f(a, b) {
            try {
                if (a)
                    return void 0;
            } finally {
                console.log(b);
            }
        }
        f(42, "foo").next();
        f(null, "bar").next();
        console.log("baz");
    }
    expect: {
        async function* f(a, b) {
            try {
                if (a)
                    return void 0;
            } finally {
                console.log(b);
            }
        }
        f(42, "foo").next();
        f(null, "bar").next();
        console.log("baz");
    }
    expect_stdout: [
        "bar",
        "baz",
        "foo",
    ]
    node_version: ">=10"
}
