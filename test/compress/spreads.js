decimal: {
    input: {
        console.log({... 0.42});
    }
    expect_exact: "console.log({....42});"
    expect_stdout: "{}"
    node_version: ">=8.3.0"
}

collapse_vars_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        [ ...a = "PASS", "PASS" ].slice();
        console.log(a);
    }
    expect: {
        var a;
        [ ...a = "PASS", "PASS" ].slice();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_vars_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        try {
            a = "PASS";
            [ ...42, "PASS" ].slice();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = "FAIL";
        try {
            a = "PASS";
            [ ...42, "PASS" ].slice();
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_vars_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        try {
            [ ...(a = "PASS", 42), "PASS" ].slice();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = "FAIL";
        try {
            [ ...(a = "PASS", 42), "PASS" ].slice();
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_vars_4: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            return a;
        }(...[ "PASS", "FAIL" ]));
    }
    expect: {
        console.log(function(a) {
            return a;
        }(...[ "PASS", "FAIL" ]));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

conditionals_farg_1: {
    options = {
        conditionals: true,
    }
    input: {
        function log(msg) {
            console.log(msg);
        }
        var a = 42, b = [ "PASS" ], c = [ "FAIL" ];
        a ? log(...b) : log(...c);
    }
    expect: {
        function log(msg) {
            console.log(msg);
        }
        var a = 42, b = [ "PASS" ], c = [ "FAIL" ];
        log(...a ? b : c);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

conditionals_farg_2: {
    options = {
        conditionals: true,
        pure_getters: "strict",
        reduce_vars: true,
    }
    input: {
        var log = console.log;
        (function(a) {
            return a.length ? log(...a) : log("FAIL");
        })([ "PASS" ]);
    }
    expect: {
        var log = console.log;
        (function(a) {
            return a.length ? log(...a) : log("FAIL");
        })([ "PASS" ]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

dont_inline: {
    options = {
        inline: true,
    }
    input: {
        console.log(function(a) {
            return a;
        }(...[ "PASS", "FAIL" ]));
    }
    expect: {
        console.log(function(a) {
            return a;
        }(...[ "PASS", "FAIL" ]));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

do_inline_1: {
    options = {
        inline: true,
        spreads: true,
    }
    input: {
        console.log(function(a) {
            return a;
        }(...[ "PASS", "FAIL" ]));
    }
    expect: {
        console.log(("FAIL", "PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

do_inline_2: {
    options = {
        inline: true,
        side_effects: true,
    }
    input: {
        (function() {
            (function() {
                console.log("PASS");
            })(..."");
        })();
    }
    expect: {
        [] = [ ..."" ],
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

do_inline_3: {
    options = {
        if_return: true,
        inline: true,
    }
    input: {
        (function() {
            (function() {
                while (console.log("PASS"));
            })(..."");
        })();
    }
    expect: {
        var [] = [ ..."" ];
        while (console.log("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_empty_call_1: {
    options = {
        side_effects: true,
    }
    input: {
        try {
            (function() {})(...null);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            [ ...null ];
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_empty_call_2: {
    options = {
        side_effects: true,
        spreads: true,
    }
    input: {
        (function() {})(...[ console.log("PASS") ]);
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

convert_hole_array: {
    options = {
        spreads: true,
    }
    input: {
        [ ...[ "PASS", , 42 ] ].forEach(function(a) {
            console.log(a);
        });
    }
    expect: {
        [ "PASS", void 0, 42 ].forEach(function(a) {
            console.log(a);
        });
    }
    expect_stdout: [
        "PASS",
        "undefined",
        "42",
    ]
    node_version: ">=6"
}

convert_hole_call: {
    options = {
        spreads: true,
    }
    input: {
        console.log(...[ "PASS", , 42 ]);
    }
    expect: {
        console.log("PASS", void 0, 42);
    }
    expect_stdout: "PASS undefined 42"
    node_version: ">=6"
}

keep_property_access: {
    options = {
        properties: true,
        side_effects: true,
    }
    input: {
        console.log(function() {
            return [ ..."foo" ][0];
        }());
    }
    expect: {
        console.log(function() {
            return [ ..."foo" ][0];
        }());
    }
    expect_stdout: "f"
    node_version: ">=6"
}

keep_fargs: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        var a = [ "PASS" ];
        (function(b, c) {
            console.log(c);
        })(console, ...a);
    }
    expect: {
        var a = [ "PASS" ];
        (function(b, c) {
            console.log(c);
        })(console, ...a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

reduce_vars_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function(b, c) {
            return c ? "PASS" : "FAIL";
        }(..."foo"));
    }
    expect: {
        console.log(function(b, c) {
            return c ? "PASS" : "FAIL";
        }(..."foo"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

reduce_vars_2: {
    options = {
        conditionals: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        console.log(function(b, c) {
            return c ? "PASS" : "FAIL";
        }(..."foo"));
    }
    expect: {
        console.log(function(b, c) {
            return c ? "PASS" : "FAIL";
        }(..."foo"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

reduce_vars_3: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {}
        function g() {
            return (a => a)(...[ f ]);
        }
        console.log(g() === g() ? "PASS" : "FAIL");
    }
    expect: {
        function f() {}
        function g() {
            return (a => a)(...[ f ]);
        }
        console.log(g() === g() ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

convert_setter: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            ...{
                set PASS(v) {},
            },
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            PASS: void 0,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: "PASS undefined"
    node_version: ">=8.3.0"
}

keep_getter_1: {
    options = {
        side_effects: true,
    }
    input: {
        ({
            ...{
                get p() {
                    console.log("PASS");
                },
            },
            get q() {
                console.log("FAIL");
            },
        });
    }
    expect: {
        ({
            ...{
                get p() {
                    console.log("PASS");
                },
            },
        });
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

keep_getter_2: {
    options = {
        side_effects: true,
    }
    input: {
        ({
            ...(console.log("foo"), {
                get p() {
                    console.log("bar");
                },
            }),
        });
    }
    expect: {
        ({
            ...(console.log("foo"), {
                get p() {
                    console.log("bar");
                },
            }),
        });
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=8.3.0"
}

keep_getter_3: {
    options = {
        side_effects: true,
    }
    input: {
        ({
            ...function() {
                return {
                    get p() {
                        console.log("PASS");
                    },
                };
            }(),
        });
    }
    expect: {
        ({
            ...function() {
                return {
                    get p() {
                        console.log("PASS");
                    },
                };
            }(),
        });
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

keep_getter_4: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var o = {
            get p() {
                console.log("PASS");
            },
        };
        ({
            q: o,
            ...o,
        });
    }
    expect: {
        var o = {
            get p() {
                console.log("PASS");
            },
        };
        ({
            ...o,
        });
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

keep_accessor: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            ...{
                get p() {
                    console.log("GET");
                    return this.r;
                },
                set q(v) {
                    console.log("SET", v);
                },
                r: 42,
            },
            r: null,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            ...{
                get p() {
                    console.log("GET");
                    return this.r;
                },
                set q(v) {
                    console.log("SET", v);
                },
                r: 42,
            },
            r: null,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "GET",
        "p 42",
        "q undefined",
        "r null",
    ]
    node_version: ">=8.3.0"
}

object_key_order_1: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            ...{},
            a: 1,
            b: 2,
            a: 3,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            a: (1, 3),
            b: 2,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "a 3",
        "b 2",
    ]
    node_version: ">=8.3.0 <=10"
}

object_key_order_2: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            a: 1,
            ...{},
            b: 2,
            a: 3,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            a: (1, 3),
            b: 2,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "a 3",
        "b 2",
    ]
    node_version: ">=8.3.0"
}

object_key_order_3: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
            ...{},
            a: 3,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            a: (1, 3),
            b: 2,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "a 3",
        "b 2",
    ]
    node_version: ">=8.3.0"
}

object_key_order_4: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
            a: 3,
            ...{},
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            a: (1, 3),
            b: 2,
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "a 3",
        "b 2",
    ]
    node_version: ">=8.3.0"
}

object_spread_array: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            ...[ "foo", "bar" ],
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            ...[ "foo", "bar" ],
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "0 foo",
        "1 bar",
    ]
    node_version: ">=8.3.0"
}

object_spread_string: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            ..."foo",
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            ..."foo",
        };
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "0 f",
        "1 o",
        "2 o",
    ]
    node_version: ">=8.3.0"
}

unused_var_side_effects: {
    options = {
        unused: true,
    }
    input: {
        (function f(a) {
            var b = {
                ...a,
            };
        })({
            get p() {
                console.log("PASS");
            },
        });
    }
    expect: {
        (function(a) {
            ({
                ...a,
            });
        })({
            get p() {
                console.log("PASS");
            },
        });
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

unsafe_join_1: {
    options = {
        unsafe: true,
    }
    input: {
        console.log([ ..."foo" ].join());
    }
    expect: {
        console.log([ ..."foo" ].join());
    }
    expect_stdout: "f,o,o"
    node_version: ">=6"
}

unsafe_join_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log([ "foo", ..."bar" ].join(""));
    }
    expect: {
        console.log([ "foo", ..."bar" ].join(""));
    }
    expect_stdout: "foobar"
    node_version: ">=6"
}

unsafe_join_3: {
    options = {
        unsafe: true,
    }
    input: {
        try {
            [].join(...console);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            [].join(...console);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4329: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        console.log({
            ...{
                get 0() {
                    return "FAIL";
                },
                ...{
                    0: "PASS",
                },
            },
        }[0]);
    }
    expect: {
        console.log({
            ...{
                get 0() {
                    return "FAIL";
                },
                [0]: "PASS",
            },
        }[0]);
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

issue_4331: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var a = "PASS", b;
        console,
        b = a;
        (function() {
            a++;
        })(...a);
        console.log(b);
    }
    expect: {
        var a = "PASS", b;
        console;
        (function() {
            a++;
        })(...b = a);
        console.log(b);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4342: {
    options = {
        side_effects: true,
    }
    input: {
        try {
            new function() {}(...42);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            [ ...42 ];
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4345: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        console.log({
            ...{
                get 42() {
                    return "FAIL";
                },
                ...{},
                42: "PASS",
            },
        }[42]);
    }
    expect: {
        console.log({
            ...{
                get 42() {
                    return "FAIL";
                },
                [42]: "PASS",
            },
        }[42]);
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

issue_4361: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = console.log("foo");
            console;
            var b = {
                ...a,
            };
        }());
    }
    expect: {
        console.log(function() {
            var a = console.log("foo");
            console;
            ({
                ...a,
            });
        }());
    }
    expect_stdout: [
        "foo",
        "undefined",
    ]
    node_version: ">=8.3.0"
}

issue_4363: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        ({
            ...{
                set [console.log("PASS")](v) {},
            },
        });
    }
    expect: {
        ({
            [console.log("PASS")]: void 0,
        });
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

issue_4556: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = "" + [ a++ ];
            var b = [ ...a ];
        }());
    }
    expect: {
        console.log(function() {
            var a;
        }());
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_4614: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        try {
            (function(...[]) {
                var arguments;
                arguments[0];
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function(...[]) {
                var arguments;
                arguments[0];
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4849: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        while (function() {
            while (!console);
        }(new function(a) {
            console.log(typeof { ...a });
        }(function() {})));
    }
    expect: {
        while (function() {
            while (!console);
        }(function(a) {
            console.log(typeof { ...function() {} });
        }()));
    }
    expect_stdout: "object"
    node_version: ">=8.3.0"
}

issue_4882_1: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            p: "PASS",
            ... {
                __proto__: {
                    p: "FAIL 1",
                    q: "FAIL 2",
                },
            },
        };
        console.log(o.p);
        console.log(o.q);
    }
    expect: {
        var o = {
            p: "PASS",
        };
        console.log(o.p);
        console.log(o.q);
    }
    expect_stdout: [
        "PASS",
        "undefined",
    ]
    node_version: ">=8.3.0"
}

issue_4882_2: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        console.log(null == Object.getPrototypeOf({
            ... {
                __proto__: (console.log(42), null),
            },
        }) ? "FAIL" : "PASS");
    }
    expect: {
        console.log(null == Object.getPrototypeOf({
            ... {
                __proto__: (console.log(42), null),
            },
        }) ? "FAIL" : "PASS");
    }
    expect_stdout: [
        "42",
        "PASS",
    ]
    node_version: ">=8.3.0"
}

issue_4882_3: {
    options = {
        objects: true,
        spreads: true,
    }
    input: {
        var o = {
            __proto__: { p: 42 },
            ... {
                set __proto__(v) {},
            },
        };
        console.log(o.__proto__ === Object.getPrototypeOf(o) ? "FAIL" : "PASS");
        console.log(o.p);
    }
    expect: {
        var o = {
            __proto__: { p: 42 },
            ["__proto__"]: void 0,
        };
        console.log(o.__proto__ === Object.getPrototypeOf(o) ? "FAIL" : "PASS");
        console.log(o.p);
    }
    expect_stdout: [
        "PASS",
        "42",
    ]
    node_version: ">=8.3.0"
}

issue_5006: {
    options = {
        arguments: true,
    }
    input: {
        console.log(function(b, c) {
            c = "FAIL 2";
            return arguments[1];
        }(...[], "FAIL 1") || "PASS");
    }
    expect: {
        console.log(function(b, c) {
            c = "FAIL 2";
            return arguments[1];
        }(...[], "FAIL 1") || "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5382: {
    options = {
        side_effects: true,
    }
    input: {
        ({
            f() {
                ({ ...this });
            },
            get p() {
                console.log("PASS");
            },
        }).f();
    }
    expect: {
        ({
            f() {
                ({ ...this });
            },
            get p() {
                console.log("PASS");
            },
        }).f();
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

issue_5602: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        if_return: true,
        inline: true,
        passes: 2,
        sequences: true,
        spreads: true,
        unused: true,
    }
    input: {
        (function() {
            try {
                var b = function(c) {
                    if (c)
                        return FAIL;
                    var d = 42;
                }(...[ null, A = 0 ]);
            } catch (e) {
                b();
            }
        })();
        console.log(A);
    }
    expect: {
        (function() {
            try {
                var b = void (A = 0);
            } catch (e) {
                b();
            }
        })(),
        console.log(A);
    }
    expect_stdout: "0"
    expect_warnings: [
        "INFO: Dropping unused variable d [test/compress/spreads.js:6,24]",
        "INFO: Collapsing c [test/compress/spreads.js:4,24]",
        "INFO: Dropping unused variable c [test/compress/spreads.js:3,33]",
        "INFO: pass 0: last_count: Infinity, count: 27",
        "WARN: Condition always false [test/compress/spreads.js:4,20]",
        "INFO: Collapsing null [test/compress/spreads.js:7,23]",
        "INFO: Collapsing 0 [test/compress/spreads.js:3,24]",
        "INFO: pass 1: last_count: 27, count: 22",
    ]
    node_version: ">=6"
}
