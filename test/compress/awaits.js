async_arrow: {
    input: {
        (async a => console.log(a))("PASS");
        console.log(typeof (async () => 42)());
    }
    expect_exact: '(async a=>console.log(a))("PASS");console.log(typeof(async()=>42)());'
    expect_stdout: [
        "PASS",
        "object",
    ]
    node_version: ">=8"
}

async_computed: {
    input: {
        var o = {
            async [42]() {
                return this.p;
            },
            p: "PASS",
        };
        o[42]().then(console.log);
    }
    expect_exact: 'var o={async[42](){return this.p},p:"PASS"};o[42]().then(console.log);'
    expect_stdout: "PASS"
    node_version: ">=8"
}

async_label: {
    input: {
        (async function() {
            async: console.log("PASS");
        })();
    }
    expect_exact: '(async function(){async:console.log("PASS")})();'
    expect_stdout: "PASS"
    node_version: ">=8"
}

await_await: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function() {
            await await {
                then(resolve) {
                    resolve({
                        then() {
                            console.log("PASS");
                        },
                    });
                },
            };
        })();
    }
    expect: {
        (async function() {
            await {
                then(resolve) {
                    resolve({
                        then() {
                            console.log("PASS");
                        },
                    });
                },
            };
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

defun_name: {
    input: {
        async function await() {
            console.log("PASS");
        }
        await();
    }
    expect: {
        async function await() {
            console.log("PASS");
        }
        await();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
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
        async function await() {
            console.log("PASS");
        }
        await();
    }
    expect: {
        (async function() {
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

keep_fname: {
    options = {
        keep_fnames: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        async function await() {
            console.log("PASS");
        }
        await();
    }
    expect: {
        async function await() {
            console.log("PASS");
        }
        await();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

nested_await: {
    input: {
        (async function() {
            console.log(function(await) {
                return await;
            }("PASS"));
        })();
    }
    expect: {
        (async function() {
            console.log(function(await) {
                return await;
            }("PASS"));
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

reduce_single_use_defun: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        async function f(a) {
            console.log(a);
        }
        f("PASS");
    }
    expect: {
        (async function(a) {
            console.log(a);
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

dont_inline: {
    options = {
        inline: true,
    }
    input: {
        (async function() {
            A;
        })().catch(function() {});
        console.log("PASS");
    }
    expect: {
        (async function() {
            A;
        })().catch(function() {});
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

dont_inline_nested: {
    options = {
        inline: true,
    }
    input: {
        function await() {
            return "PASS";
        }
        (async function() {
            (function() {
                console.log(await("FAIL"));
            })();
        })();
    }
    expect: {
        function await() {
            return "PASS";
        }
        (async function() {
            (function() {
                console.log(await("FAIL"));
            })();
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

inline_await_1: {
    options = {
        awaits: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (async function() {
            async function f() {
                await 42;
            }
            return await f();
        })();
        console.log("PASS");
    }
    expect: {
        (async function() {
            return await void await 42;
        })();
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

inline_await_1_trim: {
    options = {
        awaits: true,
        if_return: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (async function() {
            async function f() {
                await 42;
            }
            return await f();
        })();
        console.log("PASS");
    }
    expect: {
        0;
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

inline_await_2: {
    options = {
        awaits: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (async function() {
            async function f(a) {
                await a;
            }
            return await f(console);
        })();
        console.log("PASS");
    }
    expect: {
        (async function() {
            return await void await console;
        })();
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

inline_await_2_trim: {
    options = {
        awaits: true,
        if_return: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (async function() {
            async function f(a) {
                await a.log;
            }
            return await f(console);
        })();
        console.log("PASS");
    }
    expect: {
        (async function() {
            await console.log;
        })();
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

inline_await_3: {
    options = {
        awaits: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (async function() {
            async function f(a, b) {
                return await b(a);
            }
            return await f("PASS", console.log);
        })();
    }
    expect: {
        (async function() {
            return await (a = "PASS", b = console.log, await b(a));
            var a, b;
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

inline_await_3_trim: {
    options = {
        awaits: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (async function() {
            async function f(a, b) {
                return await b(a);
            }
            return await f("PASS", console.log);
        })();
    }
    expect: {
        (async function() {
            return a = "PASS", b = console.log, b(a);
            var a, b;
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

inline_await_this: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        var p = "FAIL";
        ({
            p: "PASS",
            async f() {
                return await (async () => this.p)();
            },
        }).f().then(console.log);
    }
    expect: {
        var p = "FAIL";
        ({
            p: "PASS",
            async f() {
                return await this.p;
            },
        }).f().then(console.log);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

inline_block: {
    options = {
        awaits: true,
        if_return: true,
        inline: true,
    }
    input: {
        console.log("foo");
        (async function() {
            console.log("bar");
            (async function() {
                for (var a of [ "baz" ])
                    return a;
            })();
        })().then(console.log);
        console.log("moo");
    }
    expect: {
        console.log("foo");
        (async function() {
            console.log("bar");
            for (var a of [ "baz" ])
                return void await a;
        })().then(console.log);
        console.log("moo");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
        "undefined",
    ]
    node_version: ">=8"
}

inline_block_async: {
    options = {
        awaits: true,
        if_return: true,
        inline: true,
    }
    input: {
        console.log("foo");
        (async function() {
            console.log("bar");
            (async function() {
                for (var a of [ "baz" ])
                    return {
                        then(r) {
                            console.log("moo");
                            r(a);
                        },
                    };
            })();
        })().then(console.log);
        console.log("moz");
    }
    expect: {
        console.log("foo");
        (async function() {
            console.log("bar");
            for (var a of [ "baz" ])
                return void await {
                    then(r) {
                        console.log("moo");
                        r(a);
                    },
                };
        })().then(console.log);
        console.log("moz");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moz",
        "moo",
        "undefined",
    ]
    node_version: ">=8"
}

inline_block_await: {
    options = {
        awaits: true,
        if_return: true,
        inline: true,
        side_effects: true,
    }
    input: {
        console.log("foo");
        (async function() {
            console.log("bar");
            await async function() {
                for (var a of [ "baz" ])
                    return a;
            }();
        })().then(console.log);
        console.log("moo");
    }
    expect: {
        console.log("foo");
        (async function() {
            console.log("bar");
            for (var a of [ "baz" ])
                return void await a;
        })().then(console.log);
        console.log("moo");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
        "undefined",
    ]
    node_version: ">=8"
}

inline_block_await_async: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            console.log("foo");
            await (async function() {
                while (await console.log("bar"));
                console.log("baz");
            })();
            console.log("moo");
        })().then(console.log);
        console.log("moz");
    }
    expect: {
        (async function() {
            console.log("foo");
            while (await console.log("bar"));
            console.log("baz");
            await 0;
            console.log("moo");
        })().then(console.log);
        console.log("moz");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moz",
        "baz",
        "moo",
        "undefined",
    ]
    node_version: ">=8"
}

inline_block_await_async_return: {
    options = {
        awaits: true,
        if_return: true,
        inline: true,
        side_effects: true,
    }
    input: {
        console.log("foo");
        (async function() {
            console.log("bar");
            await async function() {
                for (var a of [ "baz" ])
                    return {
                        then(r) {
                            console.log("moo");
                            r(a);
                        },
                    };
            }();
        })().then(console.log);
        console.log("moz");
    }
    expect: {
        console.log("foo");
        (async function() {
            console.log("bar");
            for (var a of [ "baz" ])
                return void await {
                    then(r) {
                        console.log("moo");
                        r(a);
                    },
                };;
        })().then(console.log);
        console.log("moz");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moz",
        "moo",
        "undefined",
    ]
    node_version: ">=8"
}

inline_block_return: {
    options = {
        awaits: true,
        if_return: true,
        inline: true,
        passes: 2,
        side_effects: true,
    }
    input: {
        console.log("foo");
        (async function() {
            console.log("bar");
            return async function() {
                for (var a of [ "baz" ])
                    return a;
            }();
        })().then(console.log);
        console.log("moo");
    }
    expect: {
        console.log("foo");
        (async function() {
            console.log("bar");
            for (var a of [ "baz" ])
                return a;
        })().then(console.log);
        console.log("moo");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
        "baz",
    ]
    node_version: ">=8"
}

inline_block_return_async: {
    options = {
        awaits: true,
        if_return: true,
        inline: true,
        passes: 2,
        side_effects: true,
    }
    input: {
        console.log("foo");
        (async function() {
            console.log("bar");
            return async function() {
                for (var a of [ "baz" ])
                    return {
                        then(r) {
                            console.log("moo");
                            r(a);
                        },
                    };
            }();
        })().then(console.log);
        console.log("moz");
    }
    expect: {
        console.log("foo");
        (async function() {
            console.log("bar");
            for (var a of [ "baz" ])
                return {
                    then(r) {
                        console.log("moo");
                        r(a);
                    },
                };
        })().then(console.log);
        console.log("moz");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moz",
        "moo",
        "baz",
    ]
    node_version: ">=8"
}

await_then: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        var a = "PASS";
        function f() {
            return {
                then: function(r) {
                    a = "FAIL";
                    r();
                },
            };
        }
        (async function() {
            f(), await 42;
            while (console.log(a));
        })();
    }
    expect: {
        var a = "PASS";
        function f() {
            return {
                then: function(r) {
                    a = "FAIL";
                    r();
                },
            };
        }
        (async function() {
            await !f();
            while (console.log(a));
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

await_unary_1: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        var a = "PASS";
        function f() {
            return {
                then: function(r) {
                    a = "FAIL";
                    r();
                },
            };
        }
        (async function() {
            await !f();
            while (console.log(a));
        })();
    }
    expect: {
        var a = "PASS";
        function f() {
            return {
                then: function(r) {
                    a = "FAIL";
                    r();
                },
            };
        }
        (async function() {
            await !f();
            while (console.log(a));
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

await_unary_2: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        var a = "PASS";
        function f() {
            return {
                then: function(r) {
                    a = "FAIL";
                    r();
                },
            };
        }
        (async function() {
            await ~f();
            while (console.log(a));
        })();
    }
    expect: {
        var a = "PASS";
        function f() {
            return {
                then: function(r) {
                    a = "FAIL";
                    r();
                },
            };
        }
        (async function() {
            await !f();
            while (console.log(a));
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

await_unary_3: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        var a;
        (async function() {
            a = "PASS";
            await delete a.p;
            a = "FAIL";
        })();
        console.log(a);
    }
    expect: {
        var a;
        (async function() {
            a = "PASS";
            await delete a.p;
            a = "FAIL";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

await_void_1: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        var a = "PASS";
        function f() {
            return {
                then: function(r) {
                    a = "FAIL";
                    r();
                },
            };
        }
        (async function() {
            await void f();
            while (console.log(a));
        })();
    }
    expect: {
        var a = "PASS";
        function f() {
            return {
                then: function(r) {
                    a = "FAIL";
                    r();
                },
            };
        }
        (async function() {
            await !f();
            while (console.log(a));
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

await_void_2: {
    options = {
        awaits: true,
        if_return: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        (async function() {
            console.log("PASS");
            return await void 42;
        })();
    }
    expect: {
        (async function() {
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

evaluate: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = async function() {}();
        console.log(typeof a);
    }
    expect: {
        var a = async function() {}();
        console.log(typeof a);
    }
    expect_stdout: "object"
    node_version: ">=8"
}

negate: {
    options = {
        side_effects: true,
    }
    input: {
        console && async function() {} && console.log("PASS");
    }
    expect: {
        console && async function() {} && console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

negate_iife: {
    options = {
        negate_iife: true,
    }
    input: {
        (async function() {
            console.log("PASS");
        })();
    }
    expect: {
        !async function() {
            console.log("PASS");
        }();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

object_function: {
    options = {
        properties: true,
        side_effects: true,
    }
    input: {
        ({
            async f() {
                console.log("PASS");
            },
        }).f();
    }
    expect: {
        (async () => {
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

collapse_vars_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (async function() {
            a = "PASS";
            await 42;
            return "PASS";
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (async function() {
            a = "PASS";
            await 42;
            return "PASS";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

collapse_vars_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (async function() {
            await (a = "PASS");
            return "PASS";
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (async function() {
            await (a = "PASS");
            return "PASS";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

collapse_vars_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (async function() {
            await (a = "PASS", 42);
            return "PASS";
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (async function() {
            await (a = "PASS", 42);
            return "PASS";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

collapse_funarg_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        A = "FAIL";
        var a = "PASS";
        (async function({}, b) {
            return b;
        })(null, A = a);
        console.log(A);
    }
    expect: {
        A = "FAIL";
        var a = "PASS";
        (async function({}, b) {
            return b;
        })(null, A = a);
        console.log(A);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

collapse_funarg_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        A = "FAIL";
        B = "PASS";
        (async function() {
            console.log(function({}, a) {
                return a;
            }(null, A = B));
        })();
        console.log(A);
    }
    expect: {
        A = "FAIL";
        B = "PASS";
        (async function() {
            console.log(function({}, a) {
                return a;
            }(null, A = B));
        })();
        console.log(A);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

collapse_property_lambda: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
    }
    input: {
        (async function f() {
            f.g = () => 42;
            return f.g();
        })().then(console.log);
    }
    expect: {
        (async function f() {
            return (f.g = () => 42)();
        })().then(console.log);
    }
    expect_stdout: "42"
    node_version: ">=8"
}

drop_async_1: {
    options = {
        awaits: true,
        inline: true,
        side_effects: true,
    }
    input: {
        console.log(function(a) {
            (async function() {
                a *= 7;
            })();
            return a;
        }(6));
    }
    expect: {
        console.log(function(a) {
            a *= 7;
            return a;
        }(6));
    }
    expect_stdout: "42"
    node_version: ">=8"
}

drop_async_2: {
    options = {
        awaits: true,
        collapse_vars: true,
        evaluate: true,
        inline: true,
        side_effects: true,
    }
    input: {
        console.log(function(a) {
            (async b => await (a *= b))(7);
            return a;
        }(6));
    }
    expect: {
        console.log(42);
    }
    expect_stdout: "42"
    node_version: ">=8"
}

drop_return: {
    options = {
        side_effects: true,
    }
    input: {
        (async function(a) {
            while (!console);
            return !console.log(a);
        })(42);
    }
    expect: {
        (async function(a) {
            while (!console);
            console.log(a);
        })(42);
    }
    expect_stdout: "42"
    node_version: ">=8"
}

functions: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !async function() {
            var a = async function a() {
                return a && "a";
            };
            var b = async function x() {
                return !!x;
            };
            var c = async function(c) {
                return c;
            };
            if (await c(await b(await a()))) {
                var d = async function() {};
                var e = async function y() {
                    return typeof y;
                };
                var f = async function(f) {
                    return f;
                };
                console.log(await a(await d()), await b(await e()), await c(await f(42)), typeof d, await e(), typeof f);
            }
        }();
    }
    expect: {
        !async function() {
            async function a() {
                return a && "a";
            }
            async function b() {
                return !!b;
            }
            async function c(c) {
                return c;
            }
            if (await c(await b(await a()))) {
                var d = async function() {};
                var e = async function y() {
                    return typeof y;
                };
                var f = async function(f) {
                    return f;
                };
                console.log(await a(await d()), await b(await e()), await c(await f(42)), typeof d, await e(), typeof f);
            }
        }();
    }
    expect_stdout: "a true 42 function function function"
    node_version: ">=8"
}

functions_use_strict: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        !async function() {
            var a = async function a() {
                return a && "a";
            };
            var b = async function x() {
                return !!x;
            };
            var c = async function(c) {
                return c;
            };
            if (await c(await b(await a()))) {
                var d = async function() {};
                var e = async function y() {
                    return typeof y;
                };
                var f = async function(f) {
                    return f;
                };
                console.log(await a(await d()), await b(await e()), await c(await f(42)), typeof d, await e(), typeof f);
            }
        }();
    }
    expect: {
        "use strict";
        !async function() {
            async function a() {
                return a && "a";
            }
            async function b() {
                return !!b;
            }
            async function c(c) {
                return c;
            }
            if (await c(await b(await a()))) {
                var d = async function() {};
                var e = async function y() {
                    return typeof y;
                };
                var f = async function(f) {
                    return f;
                };
                console.log(await a(await d()), await b(await e()), await c(await f(42)), typeof d, await e(), typeof f);
            }
        }();
    }
    expect_stdout: "a true 42 function function function"
    node_version: ">=8"
}

functions_anonymous: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var await = async function() {
            console.log("PASS");
        };
        await(await);
    }
    expect: {
        async function await() {
            console.log("PASS");
        }
        await();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

functions_inner_var: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var await = function a() {
            var a;
            console.log(a, a);
        };
        await(await);
    }
    expect: {
        function await() {
            var a;
            console.log(a, a);
        }
        await();
    }
    expect_stdout: "undefined undefined"
    node_version: ">=8"
}

instanceof_lambda_1: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log(42 instanceof async function() {});
    }
    expect: {
        console.log(false);
    }
    expect_stdout: "false"
    node_version: ">=8"
}

instanceof_lambda_2: {
    options = {
        evaluate: true,
        side_effects: false,
    }
    input: {
        console.log(null instanceof async function() {});
    }
    expect: {
        console.log((null, async function() {}, false));
    }
    expect_stdout: "false"
    node_version: ">=8"
}

instanceof_lambda_3: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log({} instanceof async function() {});
    }
    expect: {
        console.log({} instanceof async function() {});
    }
    expect_stdout: TypeError("Function has non-object prototype 'undefined' in instanceof check")
    node_version: ">=8"
}

instanceof_lambda_4: {
    options = {
        side_effects: true,
    }
    input: {
        ({ p: "foo" }) instanceof async function() {};
    }
    expect: {
        [] instanceof async function() {};
    }
    expect_stdout: TypeError("Function has non-object prototype 'undefined' in instanceof check")
    node_version: ">=8"
}

issue_4335_1: {
    options = {
        inline: true,
    }
    input: {
        var await = "PASS";
        (async function() {
            console.log(function() {
                return await;
            }());
        })();
    }
    expect: {
        var await = "PASS";
        (async function() {
            console.log(function() {
                return await;
            }());
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4335_2: {
    options = {
        inline: true,
    }
    input: {
        (async function() {
            console.log(function() {
                function await() {}
                return "PASS";
            }());
        })();
    }
    expect: {
        (async function() {
            console.log(function() {
                function await() {}
                return "PASS";
            }());
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4337: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            a();
        })(async function() {
            console.log("PASS");
        });
    }
    expect: {
        (function(a) {
            (async function() {
                console.log("PASS");
            })();
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4340: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        (async function a(a) {
            console.log(a || "PASS");
        })();
    }
    expect: {
        (async function a(a) {
            console.log(a || "PASS");
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

call_expression: {
    input: {
        console.log(typeof async function(log) {
            (await log)("foo");
        }(console.log).then);
        console.log("bar");
    }
    expect_exact: 'console.log(typeof async function(log){(await log)("foo")}(console.log).then);console.log("bar");'
    expect_stdout: [
        "function",
        "bar",
        "foo",
    ]
    node_version: ">=8"
}

property_access_expression: {
    input: {
        console.log(typeof async function(con) {
            (await con).log("foo");
        }(console).then);
        console.log("bar");
    }
    expect_exact: 'console.log(typeof async function(con){(await con).log("foo")}(console).then);console.log("bar");'
    expect_stdout: [
        "function",
        "bar",
        "foo",
    ]
    node_version: ">=8"
}

reduce_iife_1: {
    options = {
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (async function(a) {
            console.log(a + a);
        })(21);
    }
    expect: {
        (async function() {
            console.log(42);
        })();
    }
    expect_stdout: "42"
    node_version: ">=8"
}

reduce_iife_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 21;
        (async function() {
            console.log(a + a);
        })();
    }
    expect: {
        (async function() {
            console.log(42);
        })();
    }
    expect_stdout: "42"
    node_version: ">=8"
}

reduce_iife_3: {
    options = {
        evaluate: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "foo";
        (async function() {
            console.log(a, await a, a, await a);
        })();
        a = "bar";
    }
    expect: {
        var a = "foo";
        (async function() {
            console.log(a, await a, a, await a);
        })();
        a = "bar";
    }
    expect_stdout: "foo foo bar bar"
    node_version: ">=8"
}

issue_4347_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "foo";
        f();
        a = "bar";
        f();
        async function f() {
            console.log(a);
        }
    }
    expect: {
        var a = "foo";
        f();
        a = "bar";
        f();
        async function f() {
            console.log(a);
        }
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=8"
}

issue_4347_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (async function() {
            throw 42;
            a = "FAIL";
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (async function() {
            throw 42;
            a = "FAIL";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4349_1: {
    input: {
        console.log(typeof async function() {
            await /abc/;
        }().then);
    }
    expect_exact: "console.log(typeof async function(){await/abc/}().then);"
    expect_stdout: "function"
    node_version: ">=8"
}

issue_4349_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof async function() {
            (function(a) {
                this[a];
            }(await 0));
        }().then);
    }
    expect: {
        console.log(typeof async function() {
            (function(a) {
                this[a];
            }(await 0));
        }().then);
    }
    expect_stdout: "function"
    node_version: ">=8"
}

issue_4349_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function(await) {
            return async function(a) {
                this[a];
            }(await);
        }(this).then);
    }
    expect: {
        console.log(typeof function(await) {
            return async function(a) {
                this[a];
            }(await);
        }(this).then);
    }
    expect_stdout: "function"
    node_version: ">=8"
}

issue_4359: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        try {
            (async function(a) {
                return a;
            })(A);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (async function(a) {
                return a;
            })(A);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4377: {
    options = {
        dead_code: true,
        inline: true,
        side_effects: true,
    }
    input: {
        console.log(typeof function() {
            return function() {
                f;
                async function f() {}
                return f();
            }();
        }().then);
    }
    expect: {
        console.log(typeof function() {
            return f();
            async function f() {}
        }().then);
    }
    expect_stdout: "function"
    node_version: ">=8"
}

issue_4406: {
    options = {
        merge_vars: true,
    }
    input: {
        A = "PASS";
        B = "FAIL";
        (function() {
            var a, b;
            a = A;
            (async function({
                [console.log(a)]: {},
            }) {})((b = B) && { undefined: b });
        })();
    }
    expect: {
        A = "PASS";
        B = "FAIL";
        (function() {
            var a, b;
            a = A;
            (async function({
                [console.log(a)]: {},
            }) {})((b = B) && { undefined: b });
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4417: {
    options = {
        inline: true,
    }
    input: {
        (async function() {
            console.log(function() {
                return await => 0;
            }().prototype);
        })();
    }
    expect: {
        (async function() {
            console.log(function() {
                return await => 0;
            }().prototype);
        })();
    }
    expect_stdout: "undefined"
    node_version: ">=8"
}

issue_4454_1: {
    rename = false
    options = {
        merge_vars: true,
    }
    input: {
        function f(a) {
            (async function(b = console.log(a)) {})();
            var await = 42..toString();
            console.log(await);
        }
        f("PASS");
    }
    expect: {
        function f(a) {
            (async function(b = console.log(a)) {})();
            var await = 42..toString();
            console.log(await);
        }
        f("PASS");
    }
    expect_stdout: [
        "PASS",
        "42",
    ]
    node_version: ">=8"
}

issue_4454_2: {
    rename = true
    options = {
        merge_vars: true,
    }
    input: {
        function f(a) {
            (async function(b = console.log(a)) {})();
            var await = 42..toString();
            console.log(await);
        }
        f("PASS");
    }
    expect: {
        function f(a) {
            (async function(c = console.log(a)) {})();
            var b = 42..toString();
            console.log(b);
        }
        f("PASS");
    }
    expect_stdout: [
        "PASS",
        "42",
    ]
    node_version: ">=8"
}

issue_4534: {
    options = {
        arguments: true,
    }
    input: {
        (function(await) {
            (async () => console.log(arguments[0]))();
        })("PASS");
    }
    expect: {
        (function(await) {
            (async () => console.log(arguments[0]))();
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4581: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (async () => (A, a = "FAIL"))();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (async () => (A, a = "FAIL"))();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4595: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            await async function f() {
                console.log(f.length);
            }();
        })();
    }
    expect: {
        (async function() {
            await async function f() {
                console.log(f.length);
            }();
        })();
    }
    expect_stdout: "0"
    node_version: ">=8"
}

issue_4598: {
    options = {
        conditionals: true,
    }
    input: {
        if (console.log("PASS")) {
            async function f() {}
        }
    }
    expect: {
        async function f() {}
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4618: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function() {
            var await = async function f() {
                console || f();
            };
            console.log;
            return await;
        }());
    }
    expect: {
        console.log(typeof function() {
            var await = async function f() {
                console || f();
            };
            console.log;
            return await;
        }());
    }
    expect_stdout: "function"
    node_version: ">=8"
}

issue_4717: {
    options = {
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            async function f() {
                var a = function() {
                    await;
                }();
                return "FAIL";
            }
            return f();
        })().then(console.log).catch(function() {
            console.log("PASS");
        });
    }
    expect: {
        (async function() {
            return function() {
                await;
            }(), "FAIL";
        })().then(console.log).catch(function() {
            console.log("PASS");
        });
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4738_1: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function() {
            await {
                then() {
                    console.log("PASS");
                },
            };
        })();
    }
    expect: {
        (async function() {
            await {
                then() {
                    console.log("PASS");
                },
            };
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4738_2: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function() {
            await {
                get then() {
                    console.log("PASS");
                },
            };
        })();
    }
    expect: {
        (async function() {
            await {
                get then() {
                    console.log("PASS");
                },
            };
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4738_3: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function() {
            await {
                then: function() {
                    console.log("PASS");
                },
            };
        })();
    }
    expect: {
        (async function() {
            await {
                then: function() {
                    console.log("PASS");
                },
            };
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4747: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            async function f() {
                a = "PASS";
                null.p += "PASS";
            }
            f();
            return a;
        }("FAIL"));
    }
    expect: {
        console.log(function(a) {
            (async function() {
                a = "PASS";
                null.p += "PASS";
            })();
            return a;
        }("FAIL"));
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4764_1: {
    options = {
        side_effects: true,
    }
    input: {
        (async function() {
            return {
                then() {
                    console.log("PASS");
                },
            };
        })();
    }
    expect: {
        (async function() {
            return {
                then() {
                    console.log("PASS");
                },
            };
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4764_2: {
    options = {
        arrows: true,
        side_effects: true,
    }
    input: {
        (async () => ({
            get then() {
                console.log("PASS");
            },
        }))();
    }
    expect: {
        (async () => ({
            get then() {
                console.log("PASS");
            },
        }))();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4764_3: {
    options = {
        side_effects: true,
    }
    input: {
        (async function(o) {
            return o;
        })({
            then() {
                console.log("PASS");
            },
        });
    }
    expect: {
        (async function(o) {
            return o;
        })({
            then() {
                console.log("PASS");
            },
        });
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4972_1: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        console.log("foo");
        (async function() {
            try {
                return await "bar";
            } finally {
                console.log("baz");
            }
        })().then(console.log);
        console.log("moo");
    }
    expect: {
        console.log("foo");
        (async function() {
            try {
                return await "bar";
            } finally {
                console.log("baz");
            }
        })().then(console.log);
        console.log("moo");
    }
    expect_stdout: [
        "foo",
        "moo",
        "baz",
        "bar",
    ]
    node_version: ">=8"
}

issue_4972_2: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        console.log("foo");
        (async function() {
            try {
                console.log("bar");
            } finally {
                return await "baz";
            }
        })().then(console.log);
        console.log("moo");
    }
    expect: {
        console.log("foo");
        (async function() {
            try {
                console.log("bar");
            } finally {
                return "baz";
            }
        })().then(console.log);
        console.log("moo");
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
        "baz",
    ]
    node_version: ">=8"
}

issue_4972_3: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        console.log("foo");
        try {
            (async function() {
                return await "bar";
            })().then(console.log);
        } finally {
            console.log("baz");
        }
        console.log("moo");
    }
    expect: {
        console.log("foo");
        try {
            (async function() {
                return "bar";
            })().then(console.log);
        } finally {
            console.log("baz");
        }
        console.log("moo");
    }
    expect_stdout: [
        "foo",
        "baz",
        "moo",
        "bar",
    ]
    node_version: ">=8"
}

issue_4974: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function f() {
            return 42 in f();
        })();
        console.log("PASS");
    }
    expect: {
        (async function f() {
            return 42 in f();
        })();
        console.log("PASS");
    }
    expect_stdout: true
    node_version: ">=8"
}

issue_4975: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function f(a) {
            try {
                if (a) console.log(typeof f());
            } catch (e) {}
        })(42);
    }
    expect: {
        (async function f(a) {
            try {
                if (a) console.log(typeof f());
            } catch (e) {}
        })(42);
    }
    expect_stdout: "object"
    node_version: ">=8"
}

issue_4987: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function() {
            try {
                await 42;
            } finally {
                console.log("foo");
            }
        })();
        console.log("bar");
    }
    expect: {
        (async function() {
            try {
                await 0;
            } finally {
                console.log("foo");
            }
        })();
        console.log("bar");
    }
    expect_stdout: [
        "bar",
        "foo",
    ]
    node_version: ">=8"
}

issue_5001: {
    options = {
        awaits: true,
        inline: true,
        side_effects: true,
    }
    input: {
        var a = 0;
        (async function() {
            a++ | await 42;
        })();
        console.log(a ? "PASS" : "FAIL");
    }
    expect: {
        var a = 0;
        a++;
        console.log(a ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5019_1: {
    options = {
        dead_code: true,
    }
    input: {
        (function(a) {
            (async function() {
                await 42;
                console.log(a);
            })();
            a = "PASS";
        })("FAIL");
    }
    expect: {
        (function(a) {
            (async function() {
                await 42;
                console.log(a);
            })();
            a = "PASS";
        })("FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5019_2: {
    options = {
        dead_code: true,
    }
    input: {
        console.log("sync", function(a) {
            (async function() {
                console.log(await "async", a);
            })();
            return a = "PASS";
        }("FAIL"));
    }
    expect: {
        console.log("sync", function(a) {
            (async function() {
                console.log(await "async", a);
            })();
            return a = "PASS";
        }("FAIL"));
    }
    expect_stdout: [
        "sync PASS",
        "async PASS",
    ]
    node_version: ">=8"
}

issue_5019_3: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        for (var i in "foo") {
            (function(a) {
                (async function() {
                    console.log(await "async", a);
                })();
            })(i);
            console.log("sync", i);
        }
    }
    expect: {
        for (var i in "foo") {
            (function(a) {
                (async function() {
                    console.log(await "async", a);
                })();
            })(i);
            console.log("sync", i);
        }
    }
    expect_stdout: [
        "sync 0",
        "sync 1",
        "sync 2",
        "async 0",
        "async 1",
        "async 2",
    ]
    node_version: ">=8"
}

issue_5023_1: {
    options = {
        awaits: true,
        reduce_vars: true,
        side_effects: true,
    }
    input: {
        (async function() {
            let a = a;
        })();
        console.log("PASS");
    }
    expect: {
        (async function() {
            let a = a;
        })();
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5023_2: {
    options = {
        awaits: true,
        reduce_vars: true,
        side_effects: true,
    }
    input: {
        (async function() {
            let a;
            a = a;
        })();
        console.log("PASS");
    }
    expect: {
        (function() {
            let a;
            a = a;
        })();
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5034: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var await = function f() {
                return async function() {
                    return f;
                };
            };
            await()().then(function(value) {
                console.log(value === await ? "PASS" : "FAIL");
            });
        })();
    }
    expect: {
        (function() {
            var await = function f() {
                return async function() {
                    return f;
                };
            };
            await()().then(function(value) {
                console.log(value === await ? "PASS" : "FAIL");
            });
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5070: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function() {
            try {
                for await (var a of console.log("PASS"));
            } catch (e) {}
        })();
    }
    expect: {
        (async function() {
            try {
                for await (var a of console.log("PASS"));
            } catch (e) {}
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_5157_async_function: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        async function f() {
            throw "FAIL";
        }
        (async function() {
            try {
                return await f();
            } catch (e) {
                return "PASS";
            }
        })().then(console.log);
    }
    expect: {
        async function f() {
            throw "FAIL";
        }
        (async function() {
            try {
                return await f();
            } catch (e) {
                return "PASS";
            }
        })().then(console.log);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5157_async_iife: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function() {
            try {
                return await async function() {
                    throw "FAIL";
                }();
            } catch (e) {
                return "PASS";
            }
        })().then(console.log);
    }
    expect: {
        (async function() {
            try {
                return await async function() {
                    throw "FAIL";
                }();
            } catch (e) {
                return "PASS";
            }
        })().then(console.log);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5157_promise: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        var p = new Promise(function(resolve, reject) {
            reject("FAIL");
        });
        (async function() {
            try {
                return await p;
            } catch (e) {
                return "PASS";
            }
        })().then(console.log);
    }
    expect: {
        var p = new Promise(function(resolve, reject) {
            reject("FAIL");
        });
        (async function() {
            try {
                return await p;
            } catch (e) {
                return "PASS";
            }
        })().then(console.log);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5159_1: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function() {
            try {
                throw "foo";
            } catch (e) {
                return await "bar";
            } finally {
                console.log("baz");
            }
        })().catch(console.log).then(console.log);
        console.log("moo");
    }
    expect: {
        (async function() {
            try {
                throw "foo";
            } catch (e) {
                return await "bar";
            } finally {
                console.log("baz");
            }
        })().catch(console.log).then(console.log);
        console.log("moo");
    }
    expect_stdout: [
        "moo",
        "baz",
        "bar",
    ]
    node_version: ">=8"
}

issue_5159_2: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        (async function() {
            try {
                throw "foo";
            } catch (e) {
                return await "bar";
            }
        })().catch(console.log).then(console.log);
        console.log("baz");
    }
    expect: {
        (async function() {
            try {
                throw "foo";
            } catch (e) {
                return "bar";
            }
        })().catch(console.log).then(console.log);
        console.log("baz");
    }
    expect_stdout: [
        "baz",
        "bar",
    ]
    node_version: ">=8"
}

issue_5177: {
    options = {
        properties: true,
    }
    input: {
        (async function() {
            return {
                p(await) {},
            }.p;
        })().then(function(a) {
            console.log(typeof a);
        });
    }
    expect: {
        (async function() {
            return {
                p(await) {},
            }.p;
        })().then(function(a) {
            console.log(typeof a);
        });
    }
    expect_stdout: "function"
    node_version: ">=8"
}

issue_5250: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            await function() {
                while (console.log("foo"));
            }();
            console.log("bar");
        })();
        console.log("baz");
    }
    expect: {
        (async function() {
            while (console.log("foo"));
            await 0;
            console.log("bar");
        })();
        console.log("baz");
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
    ]
    node_version: ">=8"
}

issue_5258_1: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            (async function() {
                throw "FAIL";
            })();
            return "PASS";
        })().catch(console.log).then(console.log);
    }
    expect: {
        (async function() {
            (async function() {
                throw "FAIL";
            })();
            return "PASS";
        })().catch(console.log).then(console.log);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5258_2: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        function f() {
            throw "FAIL";
        }
        (async function() {
            (async function() {
                f();
            })();
            return "PASS";
        })().catch(console.log).then(console.log);
    }
    expect: {
        function f() {
            throw "FAIL";
        }
        (async function() {
            (async function() {
                f();
            })();
            return "PASS";
        })().catch(console.log).then(console.log);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5298: {
    options = {
        awaits: true,
        side_effects: true,
    }
    input: {
        var a = "PASS";
        (async function() {
            for (a in [ 42 in null ]);
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (async function() {
            for (a in [ 42 in null ]);
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5305_1: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        var a = "PASS";
        (async function() {
            try {
                return await function() {
                    while (!console);
                }();
            } finally {
                a = "FAIL";
            }
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (async function() {
            try {
                while (!console);
                return await void 0;
            } finally {
                a = "FAIL";
            }
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5305_2: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        var a = "PASS";
        (async function() {
            try {
                throw null;
            } catch (e) {
                return await function() {
                    while (!console);
                }();
            } finally {
                a = "FAIL";
            }
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (async function() {
            try {
                throw null;
            } catch (e) {
                while (!console);
                return await void 0;
            } finally {
                a = "FAIL";
            }
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5305_3: {
    options = {
        awaits: true,
        inline: true,
        side_effects: true,
    }
    input: {
        var a = "PASS";
        (async function() {
            try {
                await function() {
                    while (!console);
                }();
            } catch (e) {
                a = "FAIL";
            }
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        try {
            while (!console);
        } catch (e) {
            a = "FAIL";
        }
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
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
                var d = async function() {
                    c = await null;
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
            d = async function() {
                c = await null;
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
    node_version: ">=8"
}

issue_5478: {
    options = {
        side_effects: true,
    }
    input: {
        A = {
            get then() {
                a = "FAIL";
            },
        };
        var a = "PASS";
        (async function() {
            for (var b in "foo")
                return void A;
        })();
        console.log(a);
    }
    expect: {
        A = {
            get then() {
                a = "FAIL";
            },
        };
        var a = "PASS";
        (async function() {
            for (var b in "foo")
                return !A;
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5493: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        (async function(a) {
            var b = await [ 42 || b, a = b ];
            console.log(a);
        })();
    }
    expect: {
        (async function(a) {
            var b = await [ 42 || b, a = b ];
            console.log(a);
        })();
    }
    expect_stdout: "undefined"
    node_version: ">=8"
}

issue_5506: {
    options = {
        dead_code: true,
    }
    input: {
        console.log(function(a) {
            (async function() {
                a = null in (a = "PASS");
            })();
            return a;
        }("FAIL"));
    }
    expect: {
        console.log(function(a) {
            (async function() {
                a = null in (a = "PASS");
            })();
            return a;
        }("FAIL"));
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_5528_1: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            await function() {
                try {
                    return;
                } finally {
                    console.log("foo");
                }
            }();
        })();
        console.log("bar");
    }
    expect: {
        (async function() {
            await function() {
                try {
                    return;
                } finally {
                    console.log("foo");
                }
            }();
        })();
        console.log("bar");
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=8"
}

issue_5528_2: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            await function() {
                try {
                    return 42;
                } finally {
                    console.log("foo");
                }
            }();
        })();
        console.log("bar");
    }
    expect: {
        (async function() {
            await function() {
                try {
                    return 42;
                } finally {
                    console.log("foo");
                }
            }();
        })();
        console.log("bar");
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=8"
}

issue_5528_3: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            await function() {
                try {
                    FAIL;
                } catch (e) {
                    return console.log("foo");
                } finally {
                    console.log("bar");
                }
            }();
        })();
        console.log("baz");
    }
    expect: {
        (async function() {
            await function() {
                try {
                    FAIL;
                } catch (e) {
                    return console.log("foo");
                } finally {
                    console.log("bar");
                }
            }();
        })();
        console.log("baz");
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
    node_version: ">=8"
}

issue_5528_4: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            await function() {
                try {
                    return {
                        then() {
                            console.log("foo");
                        },
                    };
                } finally {
                    console.log("bar");
                }
            }();
        })();
        console.log("baz");
    }
    expect: {
        (async function() {
            await function() {
                try {
                    return {
                        then() {
                            console.log("foo");
                        },
                    };
                } finally {
                    console.log("bar");
                }
            }();
        })();
        console.log("baz");
    }
    expect_stdout: [
        "bar",
        "baz",
        "foo",
    ]
    node_version: ">=8"
}

issue_5634_1: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        var a = "foo";
        (async function() {
            (async function() {
                try {
                    return {
                        then(resolve) {
                            console.log("bar");
                            resolve();
                            console.log("baz");
                        },
                    };
                } finally {
                    a = "moo";
                }
            })();
        })();
        console.log(a);
    }
    expect: {
        var a = "foo";
        (async function() {
            (async function() {
                try {
                    return {
                        then(resolve) {
                            console.log("bar");
                            resolve();
                            console.log("baz");
                        },
                    };
                } finally {
                    a = "moo";
                }
            })();
        })();
        console.log(a);
    }
    expect_stdout: [
        "moo",
        "bar",
        "baz",
    ]
    node_version: ">=8"
}

issue_5634_1_side_effects: {
    options = {
        awaits: true,
        inline: true,
        side_effects: true,
    }
    input: {
        var a = "foo";
        (async function() {
            (async function() {
                try {
                    return {
                        then(resolve) {
                            console.log("bar");
                            resolve();
                            console.log("baz");
                        },
                    };
                } finally {
                    a = "moo";
                }
            })();
        })();
        console.log(a);
    }
    expect: {
        var a = "foo";
        (async function() {
            try {
                return {
                    then(resolve) {
                        console.log("bar");
                        resolve();
                        console.log("baz");
                    },
                };
            } finally {
                a = "moo";
            }
        })();
        console.log(a);
    }
    expect_stdout: [
        "moo",
        "bar",
        "baz",
    ]
    node_version: ">=8"
}

issue_5634_2: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        var a = "foo";
        (async function() {
            await async function() {
                try {
                    return {
                        then(resolve) {
                            console.log("bar");
                            resolve();
                            console.log("baz");
                        },
                    };
                } finally {
                    a = "moo";
                }
            }();
        })();
        console.log(a);
    }
    expect: {
        var a = "foo";
        (async function() {
            await async function() {
                try {
                    return {
                        then(resolve) {
                            console.log("bar");
                            resolve();
                            console.log("baz");
                        },
                    };
                } finally {
                    a = "moo";
                }
            }();
        })();
        console.log(a);
    }
    expect_stdout: [
        "moo",
        "bar",
        "baz",
    ]
    node_version: ">=8"
}

issue_5634_2_side_effects: {
    options = {
        awaits: true,
        inline: true,
        side_effects: true,
    }
    input: {
        var a = "foo";
        (async function() {
            await async function() {
                try {
                    return {
                        then(resolve) {
                            console.log("bar");
                            resolve();
                            console.log("baz");
                        },
                    };
                } finally {
                    a = "moo";
                }
            }();
        })();
        console.log(a);
    }
    expect: {
        var a = "foo";
        (async function() {
            try {
                return {
                    then(resolve) {
                        console.log("bar");
                        resolve();
                        console.log("baz");
                    },
                };
            } finally {
                a = "moo";
            }
        })();
        console.log(a);
    }
    expect_stdout: [
        "moo",
        "bar",
        "baz",
    ]
    node_version: ">=8"
}

issue_5634_3: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        var a = "foo";
        (async function() {
            return async function() {
                try {
                    return {
                        then(resolve) {
                            console.log("bar");
                            resolve();
                            console.log("baz");
                        },
                    };
                } finally {
                    a = "moo";
                }
            }();
        })();
        console.log(a);
    }
    expect: {
        var a = "foo";
        (async function() {
            return async function() {
                try {
                    return {
                        then(resolve) {
                            console.log("bar");
                            resolve();
                            console.log("baz");
                        },
                    };
                } finally {
                    a = "moo";
                }
            }();
        })();
        console.log(a);
    }
    expect_stdout: [
        "moo",
        "bar",
        "baz",
    ]
    node_version: ">=8"
}

issue_5634_3_side_effects: {
    options = {
        awaits: true,
        inline: true,
        side_effects: true,
    }
    input: {
        var a = "foo";
        (async function() {
            return async function() {
                try {
                    return {
                        then(resolve) {
                            console.log("bar");
                            resolve();
                            console.log("baz");
                        },
                    };
                } finally {
                    a = "moo";
                }
            }();
        })();
        console.log(a);
    }
    expect: {
        var a = "foo";
        (async function() {
            try {
                return {
                    then(resolve) {
                        console.log("bar");
                        resolve();
                        console.log("baz");
                    },
                };
            } finally {
                a = "moo";
            }
        })();
        console.log(a);
    }
    expect_stdout: [
        "moo",
        "bar",
        "baz",
    ]
    node_version: ">=8"
}

issue_5692_1: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            (async function() {
                for await (var k of []);
            })();
            console.log("foo");
        })();
        console.log("bar");
    }
    expect: {
        (async function() {
            (async function() {
                for await (var k of []);
            })();
            console.log("foo");
        })();
        console.log("bar");
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=10"
}

issue_5692_2: {
    options = {
        awaits: true,
        inline: true,
    }
    input: {
        (async function() {
            (async function() {
                for (var k of []);
            })();
            console.log("foo");
        })();
        console.log("bar");
    }
    expect: {
        (async function() {
            for (var k of []);
            console.log("foo");
        })();
        console.log("bar");
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=8"
}
