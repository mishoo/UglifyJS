collapse_vars_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        [ ...a = "PASS", "PASS"].slice();
        console.log(a);
    }
    expect: {
        var a;
        [ ...a = "PASS", "PASS"].slice();
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
            [ ...42, "PASS"].slice();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = "FAIL";
        try {
            a = "PASS";
            [ ...42, "PASS"].slice();
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
            [ ...(a = "PASS", 42), "PASS"].slice();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = "FAIL";
        try {
            [ ...(a = "PASS", 42), "PASS"].slice();
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

do_inline: {
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

convert_hole: {
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8 <=10"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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
    node_version: ">=8"
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

issue_4560_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        (function(...{
            [a++]: {},
        }) {})(2);
        console.log(a);
    }
    expect: {
        var a = 0;
        (function(...{
            [a++]: {},
        }) {})(2);
        console.log(a);
    }
    expect_stdout: "1"
    node_version: ">=6"
}

issue_4560_2: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        (function(...{
            [a++]: {},
        }) {})(2);
        console.log(a);
    }
    expect: {
        var a = 0;
        (function(...{
            [a++]: {},
        }) {})(2);
        console.log(a);
    }
    expect_stdout: "1"
    node_version: ">=6"
}

issue_4560_3: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0, b;
        [ ...{
            [a++]: b,
        } ] = [ "PASS" ];
        console.log(b);
    }
    expect: {
        var a = 0, b;
        [ ...{
            [a++]: b,
        } ] = [ "PASS" ];
        console.log(b);
    }
    expect_stdout: "PASS"
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
