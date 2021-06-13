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
        void 0;
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

await_unary: {
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

await_void: {
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
            await console.log("PASS");
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
        (async function() {
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
            void (a *= 7);
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
        function f(b) {
            (async function(c = console.log(b)) {})();
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
        void a++;
        console.log(a ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}
