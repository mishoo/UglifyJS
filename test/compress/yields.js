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
            var c = function*(c) {
                return c;
            };
            if (yield* c(yield* b(yield* a()))) {
                function* d() {}
                function* e() {
                    return typeof e;
                }
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
    expect_stdout: "a true 42 function function function"
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

inline_nested_yield: {
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
