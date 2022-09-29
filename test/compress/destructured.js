redefine_arguments_1: {
    options = {
        toplevel: false,
        unused: true,
    }
    input: {
        function f([ arguments ]) {}
    }
    expect: {
        function f([]) {}
    }
    expect_stdout: true
    node_version: ">=8"
}

redefine_arguments_1_toplevel: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        function f([ arguments ]) {}
    }
    expect: {}
    expect_stdout: true
    node_version: ">=8"
}

redefine_arguments_2: {
    options = {
        side_effects: true,
    }
    input: {
        (function([], arguments) {});
    }
    expect: {}
    expect_stdout: true
    node_version: ">=8"
}

redefine_arguments_3: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function([], arguments) {})([]);
    }
    expect: {
        (function() {})();
    }
    expect_stdout: true
    node_version: ">=8"
}

redefine_arguments_4: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            (function({}, arguments) {});
        }
    }
    expect: {}
    expect_stdout: true
    node_version: ">=8"
}

uses_arguments_1_merge_vars: {
    options = {
        merge_vars: true,
    }
    input: {
        console.log(typeof function({}) {
            return arguments;
        }(42));
    }
    expect: {
        console.log(typeof function({}) {
            return arguments;
        }(42));
    }
    expect_stdout: "object"
    node_version: ">=6"
}

uses_arguments_1_unused: {
    options = {
        unused: true,
    }
    input: {
        console.log(typeof function({}) {
            return arguments;
        }(42));
    }
    expect: {
        console.log(typeof function({}) {
            return arguments;
        }(42));
    }
    expect_stdout: "object"
    node_version: ">=6"
}

uses_arguments_2: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
    }
    input: {
        console.log(typeof function({ a }) {
            a[1] = 2;
            return arguments;
        }({ a: 42 }));
    }
    expect: {
        console.log(typeof function({ a }) {
            a[1] = 2;
            return arguments;
        }({ a: 42 }));
    }
    expect_stdout: "object"
    node_version: ">=6"
}

funarg_merge_vars_1: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a, {
            [a]: b
        }) {
            console.log(b);
        }
        f(0, [ "PASS" ]);
    }
    expect: {
        function f(a, {
            [a]: b
        }) {
            console.log(b);
        }
        f(0, [ "PASS" ]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_merge_vars_2: {
    options = {
        merge_vars: true,
    }
    input: {
        var a = 0;
        (function f({
            [a]: b,
        }) {
            var a = typeof b;
            console.log(a);
        })([ 42 ]);
    }
    expect: {
        var a = 0;
        (function f({
            [a]: b,
        }) {
            var a = typeof b;
            console.log(a);
        })([ 42 ]);
    }
    expect_stdout: "number"
    node_version: ">=6"
}

funarg_side_effects_1: {
    options = {
        side_effects: true,
    }
    input: {
        try {
            (function({}) {})();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            [ {} ] = [];
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_side_effects_2: {
    options = {
        side_effects: true,
    }
    input: {
        try {
            (function({
                [(a, 0)]: a,
            }) {})(1);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function({
                [(a, 0)]: a,
            }) {})(1);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6.9.2"
}

funarg_side_effects_3: {
    options = {
        side_effects: true,
    }
    input: {
        try {
            (function({
                p: {
                    [(a, 0)]: a,
                },
            }) {})({
                p: 1,
            });
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function({
                p: {
                    [(a, 0)]: a,
                },
            }) {})({
                p: 1,
            });
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6.9.2"
}

funarg_unused_1: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function([]) {})([ console.log("PASS") ]);
    }
    expect: {
        (function() {})(console.log("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_unused_2: {
    options = {
        unused: true,
    }
    input: {
        function f([ a, b, c ]) {
            console.log(b);
        }
        f([ "FAIL", "PASS" ]);
    }
    expect: {
        function f([ , b ]) {
            console.log(b);
        }
        f([ "FAIL", "PASS" ]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_unused_3: {
    options = {
        objects: true,
        evaluate: true,
        unused: true,
    }
    input: {
        function f({
            [0]: a,
        }) {
            return "PASS";
        }
        console.log(f([ "FAIL" ]));
    }
    expect: {
        function f({}) {
            return "PASS";
        }
        console.log(f([ "FAIL" ]));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_unused_4: {
    options = {
        keep_fargs: false,
        pure_getters: "strict",
        unused: true,
    }
    input: {
        console.log(function([ a ], { b }, c) {
            return "PASS";
        }([ 1 ], { b: 2 }, 3));
    }
    expect: {
        console.log(function() {
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_unused_5: {
    options = {
        unused: true,
    }
    input: {
        try {
            (function({
                [c = 0]: c
            }) {})(1);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function({
                [c = 0]: c
            }) {})(1);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_unused_6_inline: {
    options = {
        inline: true,
        pure_getters: "strict",
        unused: true,
    }
    input: {
        (function(a) {
            var {} = (a = console, 42);
        })();
        console.log(typeof a);
    }
    expect: {
        void console;
        console.log(typeof a);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

funarg_unused_6_keep_fargs: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function(a) {
            var {} = (a = console, 42);
        })();
        console.log(typeof a);
    }
    expect: {
        (function() {
            console;
            var {} = 42;
        })();
        console.log(typeof a);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

funarg_collapse_vars_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a, {}) {
            return typeof a;
            var b;
        }(console, {}));
    }
    expect: {
        console.log(function(a, {}) {
            return typeof (0, console);
        }(0, {}));
    }
    expect_stdout: "object"
    node_version: ">=6"
}

funarg_collapse_vars_2: {
    options = {
        collapse_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function([ a ], { b }, c) {
            return a + b + c;
        }([ "P" ], { b: "A" }, "SS"));
    }
    expect: {
        console.log(function([ a ], { b }) {
            return a + b + "SS";
        }([ "P" ], { b: "A" }));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_collapse_vars_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        try {
            a = "PASS";
            (function({}) {})();
            throw "PASS";
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = "FAIL";
        try {
            a = "PASS";
            (function({}) {})();
            throw "PASS";
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_collapse_vars_4: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function(b, { log: c }) {
            c(b);
        })(a, console);
    }
    expect: {
        var a = "PASS";
        (function(b, { log: c }) {
            c(a);
        })(0, console);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_collapse_vars_5: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        A = "FAIL";
        B = "PASS";
        try {
            console.log(function({}, a) {
                return a;
            }(null, A = B));
        } catch (e) {}
        console.log(A);
    }
    expect: {
        A = "FAIL";
        B = "PASS";
        try {
            console.log(function({}, a) {
                return a;
            }(null, A = B));
        } catch (e) {}
        console.log(A);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_collapse_vars_6: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        A = "FAIL";
        B = "PASS";
        function f() {
            console.log(function({}, a) {
                return a;
            }(null, A = B));
        }
        try {
            f();
        } catch (e) {
            console.log(A);
        }
    }
    expect: {
        A = "FAIL";
        B = "PASS";
        function f() {
            console.log(function({}, a) {
                return a;
            }(null, A = B));
        }
        try {
            f();
        } catch (e) {
            console.log(A);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_reduce_vars_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        try {
            (function({
                [a]: b,
            }, a) {
                console.log("FAIL");
            })({});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function({
                [a]: b,
            }, a) {
                console.log("FAIL");
            })({});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_reduce_vars_2: {
    options = {
        evaluate: true,
        keep_fargs: false,
        pure_getters: "strict",
        reduce_vars: true,
        unsafe: true,
        unused: true,
    }
    input: {
        console.log(function([ a ], { b }, c) {
            return a + b + c;
        }([ "P" ], { b: "A" }, "SS"));
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_reduce_vars_3: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        (function({
            [a++]: b
        }) {})(0);
        console.log(a);
    }
    expect: {
        var a = 0;
        (function({
            [a++]: b
        }) {})(0);
        console.log(a);
    }
    expect_stdout: "1"
    node_version: ">=6"
}

funarg_reduce_vars_4: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        try {
            (function f({
                [a = 1]: a,
            }) {})(2);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function f({
                [a = 1]: a,
            }) {})(2);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

funarg_computed_key_scope_1: {
    rename = true
    input: {
        var b = 0;
        function f({
            [b]: a
        }) {
            var b = 42;
            console.log(a, b);
        }
        f([ "PASS" ]);
    }
    expect: {
        var b = 0;
        function f({
            [b]: a
        }) {
            var c = 42;
            console.log(a, c);
        }
        f([ "PASS" ]);
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

funarg_computed_key_scope_2: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function({
            [function() {
                console.log(typeof f);
            }()]: a
        }) {
            function f() {}
        })(0);
    }
    expect: {
        (function({
            [function() {
                console.log(typeof f);
            }()]: a
        }) {})(0);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

funarg_computed_key_scope_3: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function({
            [function() {
                (function({
                    [function() {
                        console.log(typeof f, typeof g, typeof h);
                    }()]: a
                }) {
                    function f() {}
                })(1);
                function g() {}
            }()]: b
        }) {
            function h() {}
        })(2);
    }
    expect: {
        (function({
            [function() {
                (function({
                    [function() {
                        console.log(typeof f, typeof function() {}, typeof h);
                    }()]: a
                }) {})(1);
            }()]: b
        }) {})(2);
    }
    expect_stdout: "undefined function undefined"
    node_version: ">=6"
}

funarg_inline: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            function f({}) {
                return 42;
            }
            var a = f();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            [ {} ] = [];
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

process_returns: {
    options = {
        booleans: true,
    }
    input: {
        console.log(function({ length }) {
            return length ? "FAIL" : "PASS";
        }(function() {
            return 42;
        }));
    }
    expect: {
        console.log(function({ length }) {
            return length ? "FAIL" : "PASS";
        }(function() {}));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

simple_const: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
        varify: true,
    }
    input: {
        const [ a ] = [ "PASS" ];
        console.log(a);
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

simple_let: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
        varify: true,
    }
    input: {
        let [ a ] = [ "PASS" ];
        console.log(a);
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

simple_var: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var [ a ] = [ "PASS" ];
        console.log(a);
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_catch: {
    options = {
        dead_code: true,
    }
    input: {
        try {} catch ({
            [console.log("FAIL")]: e,
        }) {} finally {
            console.log("PASS");
        }
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_catch_var: {
    options = {
        unused: true,
    }
    input: {
        try {
            throw new Error("PASS");
        } catch ({ name, message }) {
            console.log(message);
        }
    }
    expect: {
        try {
            throw new Error("PASS");
        } catch ({ message }) {
            console.log(message);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_vars_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "PASS";
        var {
            [a.p]: a,
        } = !console.log(a);
    }
    expect: {
        var a = "PASS";
        var {
            [a.p]: a,
        } = !console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_vars_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function() {
            [] = [];
            return "PASS";
        }());
    }
    expect: {
        console.log(function() {
            [] = [];
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_vars_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function(a) {
            [ a ] = (a = "FAIL", [ "PASS" ]);
            return a;
        }());
    }
    expect: {
        console.log(function(a) {
            [ a ] = (a = "FAIL", [ "PASS" ]);
            return a;
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_vars_4: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        try {
            a = 42;
            [ 42..p ] = null;
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a;
        try {
            a = 42;
            [ 42..p ] = null;
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "42"
    node_version: ">=6"
}

collapse_vars_5: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        try {
            [] = (a = 42, null);
            a = 42;
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a;
        try {
            [] = (a = 42, null);
            a = 42;
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "42"
    node_version: ">=6"
}

collapse_vars_6: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        try {
            var [] = (a = 42, null);
            a = 42;
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a;
        try {
            var [] = (a = 42, null);
            a = 42;
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "42"
    node_version: ">=6"
}

collapse_vars_7: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        try {
            (function() {
                [] = (a = "PASS", null);
                return "PASS";
            })();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = "FAIL";
        try {
            (function() {
                [] = (a = "PASS", null);
                return "PASS";
            })();
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_vars_8: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        try {
            (function() {
                var {} = (a = "PASS", null);
                return "PASS";
            })();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = "FAIL";
        try {
            (function() {
                var {} = (a = "PASS", null);
                return "PASS";
            })();
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_vars_9: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function(a) {
            try {
                var b = function([ c ]) {
                    if (c)
                        return "FAIL 1";
                }();
                a = "FAIL 2";
                return b;
            } catch (e) {
                return a;
            }
        }("PASS"));
    }
    expect: {
        console.log(function(a) {
            try {
                var b = function([ c ]) {
                    if (c)
                        return "FAIL 1";
                }();
                a = "FAIL 2";
                return b;
            } catch (e) {
                return a;
            }
        }("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

conditionals: {
    options = {
        conditionals: true,
    }
    input: {
        if (console.log("PASS")) {
            var [] = 0;
        }
    }
    expect: {
        console.log("PASS") && ([] = 0);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

dead_code: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
    }
    input: {
        if (0) {
            let [] = 42;
            var { a, b: [ c ] } = null;
        }
        console.log("PASS");
    }
    expect: {
        0;
        var a, c;
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_unused_1: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        switch (0) {
          case console.log(a, a):
            try {
                throw 42;
            } catch (a) {
                var [ a ] = [];
            }
        }
    }
    expect: {
        switch (0) {
          case console.log(a, a):
            try {
                throw 42;
            } catch (a) {
                var a = [][0];
            }
        }
    }
    expect_stdout: "undefined undefined"
    node_version: ">=6"
}

drop_unused_2: {
    options = {
        merge_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b = [ console.log("PASS"), a ], {
                p: a,
            } = 0;
        }
        f();
    }
    expect: {
        (function(a) {
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_hole: {
    options = {
        unused: true,
    }
    input: {
        var [ a ] = [ , ];
        console.log(a);
    }
    expect: {
        var a = [][0];
        console.log(a);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

keep_key_1: {
    options = {
        evaluate: true,
        side_effects: true,
        unused: true,
    }
    input: {
        ({} = {
            [(console.log("PASS"), 42)]: null,
        });
    }
    expect: {
        ({} = {
            [(console.log("PASS"), 42)]: 0,
        });
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

keep_key_2: {
    options = {
        evaluate: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var { 42: a } = { [(console.log("PASS"), 42)](){} };
    }
    expect: {
        var {} = { [(console.log("PASS"), 42)]: 0 };
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

keep_key_2_pure_getters: {
    options = {
        evaluate: true,
        pure_getters: "strict",
        toplevel: true,
        unused: true,
    }
    input: {
        var { 42: a } = { [(console.log("PASS"), 42)](){} };
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

keep_reference: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = [ {}, 42 ];
        var [ b, c ] = a;
        console.log(a[0] === b ? "PASS" : "FAIL");
    }
    expect: {
        var a = [ {}, 42 ];
        var b = a[0];
        console.log(a[0] === b ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

maintain_position_assign: {
    options = {
        unused: true,
    }
    input: {
        console.log(([ , ] = [ , "PASS" ])[1]);
    }
    expect: {
        console.log([ , "PASS" ][1]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

maintain_position_var: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        A = "FAIL";
        var [ a, b ] = [ A ];
        console.log(b || "PASS");
    }
    expect: {
        A = "FAIL";
        var [ , b ] = [ A ];
        console.log(b || "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

side_effects_array: {
    options = {
        unused: true,
    }
    input: {
        try {
            var [ a ] = 42;
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            var [ a ] = 42;
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

side_effects_object: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var a = null, b = console, { c } = 42;
        try {
            c[a = "PASS"];
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = null, c = (console, 42["c"]);
        try {
            c[a = "PASS"];
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

join_vars: {
    options = {
        conditionals: true,
        join_vars: true,
    }
    input: {
        const [ a ] = [ "PASS" ];
        a,
        console.log(a);
    }
    expect: {
        const [ a ] = [ "PASS" ];
        a,
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

keep_fargs: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function f(a) {
            var {} = a;
        }(0));
    }
    expect: {
        console.log(function(a) {
            var {} = a;
        }(0));
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

reduce_vars_1: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        console.log("PASS") && ([ a ] = 0);
    }
    expect: {
        var a;
        console.log("PASS") && ([ a ] = 0);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

reduce_vars_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL", b = 42;
        ({
            [console.log(a, b)]: b.p
        } = a = "PASS");
    }
    expect: {
        ({
            [console.log("PASS", 42)]: 42..p
        } = "PASS");
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

computed_key_evaluate: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0, {
            [++a]: b,
        } = [ "FAIL 1", a ? "FAIL 2" : "PASS" ];
        console.log(b);
    }
    expect: {
        var a = 0, {
            [1]: b,
        } = [ "FAIL 1", 0 ? "FAIL 2" : "PASS" ];
        console.log(b);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

computed_key_unused: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var {
            [console.log("bar")]: a,
            [console.log("baz")]: { b },
            [console.log("moo")]: [
                c,
                {
                    [console.log("moz")]: d,
                    e,
                },
            ],
        } = {
            [console.log("foo")]: [ null, 42 ],
        };
    }
    expect: {
        var {
            [console.log("bar")]: a,
            [console.log("baz")]: {},
            [console.log("moo")]: [
                ,
                {
                    [console.log("moz")]: d,
                },
            ],
        } = {
            [console.log("foo")]: [ null, 42 ],
        };
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
        "moo",
        "moz",
    ]
    node_version: ">=6"
}

for_in_1: {
    options = {
        loops: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var { a } in console.log("PASS"));
    }
    expect: {
        for (var { a } in console.log("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

for_in_2: {
    options = {
        join_vars: true,
    }
    input: {
        var a;
        for (var { b } in console.log("PASS"));
    }
    expect: {
        var a, b;
        for ({ b } in console.log("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

for_in_3: {
    options = {
        merge_vars: true,
        reduce_vars: true,
    }
    input: {
        for (var { length: a } in [ 42 ])
            console.log(a);
    }
    expect: {
        for (var { length: a } in [ 42 ])
            console.log(a);
    }
    expect_stdout: "1"
    node_version: ">=6"
}

fn_name_evaluate: {
    options = {
        evaluate: true,
        objects: true,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        console.log(function f({
            [typeof f]: a,
        }) {
            var f;
            return a;
        }({
            function: "PASS",
            undefined: "FAIL",
        }));
    }
    expect: {
        console.log(function f({
            function: a,
        }) {
            var f;
            return a;
        }({
            function: "PASS",
            undefined: "FAIL",
        }));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

fn_name_unused: {
    options = {
        unused: true,
    }
    input: {
        console.log(function f({
            [typeof f]: a,
        }) {
            var f;
            return a;
        }({
            function: "PASS",
            undefined: "FAIL",
        }));
    }
    expect: {
        console.log(function f({
            [typeof f]: a,
        }) {
            var f;
            return a;
        }({
            function: "PASS",
            undefined: "FAIL",
        }));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

hoist_vars: {
    options = {
        hoist_vars: true,
        join_vars: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        var [ b ] = [ 42 ];
        console.log(a, b);
    }
    expect: {
        var a = "PASS", b = [ 42 ][0];
        console.log(a, b);
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

singleton_1: {
    options = {
        pure_getters: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var [ a ] = "P", b, o = {};
        [ { 1: o.p } ] = [ "FAIL" ];
        ({ foo: [ o.q ] } = { foo: "S" });
        [ b = "S" ] = [];
        console.log(a + o.p + o.q + b);
    }
    expect: {
        var b, a = "P"[0], o = {};
        o.p = [ "FAIL"["1"] ][0];
        o.q = { foo: "S"[0] }["foo"];
        [ b = "S" ] = [];
        console.log(a + o.p + o.q + b);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

singleton_2: {
    options = {
        evaluate: true,
        passes: 2,
        pure_getters: true,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var [ a ] = "P", b, o = {};
        [ { 1: o.p } ] = [ "FAIL" ];
        ({ foo: [ o.q ] } = { foo: "S" });
        [ b = "S" ] = [];
        console.log(a + o.p + o.q + b);
    }
    expect: {
        var b, a = "P", o = {};
        o.p = "A";
        o.q = "S";
        [ b = "S" ] = [];
        console.log(a + o.p + o.q + b);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

singleton_side_effects: {
    options = {
        side_effects: true,
        unused: true,
    }
    input: {
        [ 42[console.log("foo")] ] = [ console.log("bar") ];
    }
    expect: {
        [ 42[console.log("foo")] ] = [ console.log("bar") ];
    }
    expect_stdout: [
        "bar",
        "foo",
    ]
    node_version: ">=6"
}

mangle_properties: {
    mangle = {
        properties: {
            domprops: true,
        },
    }
    input: {
        function f({ p: a }) {
            return a;
        }
        console.log(f({ p: "PASS" }));
    }
    expect_exact: 'function f({n}){return n}console.log(f({n:"PASS"}));'
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4280: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var {
            1: a,
        } = 2;
        console.log(a);
    }
    expect: {
        var {} = 2;
        console.log(void 0);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_4282: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            ({
                [a = "bar"]: 0[console.log(a)],
            } = 0);
        })("foo");
    }
    expect: {
        (function(a) {
            ({
                [a = "bar"]: 0[console.log(a)],
            } = 0);
        })("foo");
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4284_1: {
    options = {
        dead_code: true,
    }
    input: {
        var a, {
            0: b,
        } = a = "foo";
        console.log(a, b);
    }
    expect: {
        var a, {
            0: b,
        } = a = "foo";
        console.log(a, b);
    }
    expect_stdout: "foo f"
    node_version: ">=6"
}

issue_4284_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, {
            [console.log(a)]: b,
        } = (a = "PASS", 0);
        var c = a;
    }
    expect: {
        var a, {
            [console.log(a)]: b,
        } = (a = "PASS", 0);
        var c = a;
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4284_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a, b;
        ({
            [console.log(a)]: b,
        } = (a = "PASS", 0));
        var c = a;
    }
    expect: {
        var a, b;
        ({
            [console.log(a)]: b,
        } = (a = "PASS", 0));
        var c = a;
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4286_1: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var a = "PASS", b;
        (0 && a)[{ a } = b = a];
        console.log(b);
    }
    expect: {
        var a = "PASS", b;
        (0 && a)[{ a } = b = a];
        console.log(b);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4286_2: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        a = [ "PASS" ];
        var b, { a } = b = a;
        console.log(b[0]);
    }
    expect: {
        var b, { a } = b = a = [ "PASS" ];
        console.log(b[0]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4288: {
    options = {
        merge_vars: true,
    }
    input: {
        function f({
            [new function() {
                console.log(typeof b);
            }()]: a,
        }) {
            var b = a;
            b++;
        }
        f(0);
    }
    expect: {
        function f({
            [new function() {
                console.log(typeof b);
            }()]: a,
        }) {
            var a = a;
            a++;
        }
        f(0);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_4294: {
    options = {
        merge_vars: true,
    }
    input: {
        A = "PASS";
        (function() {
            var a = function({
                [a]: {},
            }) {}({
                [a]: 0,
            });
            var b = A;
            console.log(b);
        })();
    }
    expect: {
        A = "PASS";
        (function() {
            var a = function({
                [a]: {},
            }) {}({
                [a]: 0,
            });
            var b = A;
            console.log(b);
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4297: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function(a) {
            return { a } = a;
        }(function() {}));
    }
    expect: {
        console.log(typeof function(a) {
            return { a } = a;
        }(function() {}));
    }
    expect_stdout: "function"
    node_version: ">=6"
}

issue_4298: {
    options = {
        merge_vars: true,
    }
    input: {
        (function() {
            var a = {
                object: "PASS",
            };
            function f({
                [typeof a]: b,
            }) {
                var a = b;
                return a;
            }
            var c = f(a);
            console.log(c);
        })();
    }
    expect: {
        (function() {
            var a = {
                object: "PASS",
            };
            function f({
                [typeof a]: b,
            }) {
                var a = b;
                return a;
            }
            var c = f(a);
            console.log(c);
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4301: {
    options = {
        merge_vars: true,
    }
    input: {
        try {
            console.log(function() {
                var a, b = console;
                return {
                    [a = b]: a.p,
                } = "foo";
            }());
        } catch (e) {
            console.log("bar");
        }
    }
    expect: {
        try {
            console.log(function() {
                var a, b = console;
                return {
                    [a = b]: a.p,
                } = "foo";
            }());
        } catch (e) {
            console.log("bar");
        }
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4308: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        console.log(function({
            [a = "FAIL"]: b
        }, c) {
            return c;
        }(0, a));
    }
    expect: {
        var a = "PASS";
        console.log(function({
            [a = "FAIL"]: b
        }, c) {
            return c;
        }(0, a));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4312: {
    options = {
        collapse_vars: true,
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        (function f(b, c) {
            return function({
                [a = b]: d,
            }) {}(c && c);
        })("PASS", "FAIL");
        console.log(a);
    }
    expect: {
        b = "PASS",
        c = "FAIL",
        [
            {
                [c = b]: d,
            },
        ] = [ c && c ],
        void 0;
        var b, c, d;
        console.log(c);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4315: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            console;
        }
        var a = function() {
            if ([ 0[f && f] ] = [])
                return this;
        }(), b;
        do {
            console.log("PASS");
        } while (0 && (b = 0), b && a);
    }
    expect: {
        [ 0[function() {
            console
        }] ] = [];
        do {
            console.log("PASS");
        } while (void 0);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4319: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        function f(a) {
            while (!a);
        }
        console.log(function({}) {
            return f(console);
        }(0));
    }
    expect: {
        function f(a) {
            while (!a);
        }
        console.log(([ {} ] = [ 0 ], f(console)));
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_4321: {
    options = {
        inline: 3,
        keep_fargs: false,
    }
    input: {
        try {
            console.log(function({}) {
                return function() {
                    while (!console);
                }();
            }());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            console.log(([ {} ] = [], function() {
                while (!console);
            }()));
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4323: {
    options = {
        ie: true,
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        (function b({
            [function a() {
                console.log(typeof a);
            }()]: d,
        }) {})(0);
        (function c(e) {
            e.p;
        })(1, console.log);
    }
    expect: {
        var a = 0;
        [
            {
                [function a() {
                    console.log(typeof a);
                }()]: d,
            },
        ] = [ 0 ],
        void 0;
        var d;
        e = 1,
        console.log,
        void e.p;
        var e;
    }
    expect_stdout: "function"
    node_version: ">=6"
}

issue_4355: {
    options = {
        loops: true,
        unused: true,
    }
    input: {
        var a;
        (function({
            [function() {
                for (a in "foo");
            }()]: b,
        }) {
            var a;
        })(0);
        console.log(a);
    }
    expect: {
        var a;
        (function({
            [function() {
                for (a in "foo");
            }()]: b,
        }) {})(0);
        console.log(a);
    }
    expect_stdout: "2"
    node_version: ">=6"
}

issue_4372_1: {
    options = {
        dead_code: true,
    }
    input: {
        var a = "FAIL";
        a += {
            [console.log(a)]: a,
        } = a = "PASS";
    }
    expect: {
        var a = "FAIL";
        a += {
            [console.log(a)]: a,
        } = a = "PASS";
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4372_2: {
    options = {
        dead_code: true,
    }
    input: {
        var a;
        [ a ] = a = [ "PASS", "FAIL" ];
        console.log(a);
    }
    expect: {
        var a;
        [ a ] = a = [ "PASS", "FAIL" ];
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4383: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        console.log(function(a) {
            [ a[0] ] = [];
            return a.length;
        }([]));
    }
    expect: {
        console.log(function(a) {
            [ a[0] ] = [];
            return a.length;
        }([]));
    }
    expect_stdout: "1"
    node_version: ">=6"
}

issue_4386: {
    options = {
        arguments: true,
    }
    input: {
        function f({}) {
            return arguments[0];
        }
        console.log(f("PASS"));
    }
    expect: {
        function f({}) {
            return arguments[0];
        }
        console.log(f("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4395: {
    options = {
        arguments: true,
    }
    input: {
        console.log(function(a, {}) {
            a = "FAIL";
            return arguments[0];
        }("PASS", 42));
    }
    expect: {
        console.log(function(a, {}) {
            a = "FAIL";
            return arguments[0];
        }("PASS", 42));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4399: {
    options = {
        arguments: true,
    }
    input: {
        console.log(function({
            [arguments[1]]: a,
        }, b) {
            return a;
        }([ "PASS" ], 0));
    }
    expect: {
        console.log(function({
            [arguments[1]]: a,
        }, b) {
            return a;
        }([ "PASS" ], 0));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4420: {
    options = {
        unused: true,
    }
    input: {
        console.log(function() {
            var a = 1;
            try {
                throw [ "FAIL", "PASS" ];
            } catch ({
                [a]: b,
            }) {
                let a = 0;
                return b;
            }
        }());
    }
    expect: {
        console.log(function() {
            var a = 1;
            try {
                throw [ "FAIL", "PASS" ];
            } catch ({
                [a]: b,
            }) {
                return b;
            }
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4425: {
    rename = true
    input: {
        var a;
        console.log(function() {
            try {
                try {
                    throw 42;
                } catch ({
                    [a]: a,
                }) {}
                return "FAIL";
            } catch (e) {
                return "PASS";
            }
        }());
    }
    expect: {
        var a;
        console.log(function() {
            try {
                try {
                    throw 42;
                } catch ({
                    [b]: b,
                }) {}
                return "FAIL";
            } catch (c) {
                return "PASS";
            }
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4436_Infinity: {
    options = {
        unused: true,
    }
    input: {
        console.log(function({
            [delete Infinity]: a,
        }) {
            var Infinity;
            return a;
        }({
            true: "FAIL",
            false: "PASS",
        }));
    }
    expect: {
        console.log(function({
            [delete Infinity]: a,
        }) {
            return a;
        }({
            true: "FAIL",
            false: "PASS",
        }));
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4436_NaN: {
    options = {
        unused: true,
    }
    input: {
        console.log(function({
            [delete NaN]: a,
        }) {
            var NaN;
            return a;
        }({
            true: "FAIL",
            false: "PASS",
        }));
    }
    expect: {
        console.log(function({
            [delete NaN]: a,
        }) {
            return a;
        }({
            true: "FAIL",
            false: "PASS",
        }));
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4436_undefined: {
    options = {
        unused: true,
    }
    input: {
        console.log(function({
            [delete undefined]: a,
        }) {
            var undefined;
            return a;
        }({
            true: "FAIL",
            false: "PASS",
        }));
    }
    expect: {
        console.log(function({
            [delete undefined]: a,
        }) {
            return a;
        }({
            true: "FAIL",
            false: "PASS",
        }));
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4446: {
    options = {
        collapse_vars: true,
    }
    input: {
        a = "PASS";
        var a = [ a[0] ] = [ a ];
        console.log(a[0]);
    }
    expect: {
        a = "PASS";
        var a = [ a[0] ] = [ a ];
        console.log(a[0]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4456: {
    options = {
        pure_getters: "strict",
        unused: true,
    }
    input: {
        var o = {
            set p(v) {
                console.log(v);
            },
        };
        [ function() {
            try {
                return o;
            } catch ({}) {}
        }().p ] = [ "PASS" ];
    }
    expect: {
        var o = {
            set p(v) {
                console.log(v);
            },
        };
        [ function() {
            try {
                return o;
            } catch ({}) {}
        }().p ] = [ "PASS" ];
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4485_1: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        (function([]) {
            var arguments;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })([]);
    }
    expect: {
        (function([]) {
            var arguments;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })([]);
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4485_2: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        (function([]) {
            var arguments = null;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })([]);
    }
    expect: {
        (function([]) {
            var arguments = null;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })([]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4485_3: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function([]) {
            var arguments;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })([]);
    }
    expect: {
        (function([]) {
            var arguments;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })([]);
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4500: {
    options = {
        evaluate: true,
        keep_fnames: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f(b) {
            return [ b ] = [], b;
        }("FAIL");
        console.log(a || "PASS");
    }
    expect: {
        var a = function f(b) {
            return [ b ] = [], b;
        }("FAIL");
        console.log(a || "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4504: {
    options = {
        inline: true,
        merge_vars: true,
    }
    input: {
        A = "FAIL";
        (function f(a) {
            ({
                [console.log(a)]: 0[(b => console + b)(A)]
            } = 0);
        })("PASS");
    }
    expect: {
        A = "FAIL";
        (function f(a) {
            ({
                [console.log(a)]: 0[b = A, console + b]
            } = 0);
            var b;
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4508: {
    options = {
        inline: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var i = 0; i < 2; i++)
            (function f([ a ]) {
                var a = console.log(a) && b, b = null;
            })([ "PASS" ]);
    }
    expect: {
        for (var i = 0; i < 2; i++)
            [ [ a ] ] = [ [ "PASS" ] ],
            b = void 0,
            a = console.log(a) && b,
            b = null,
            void 0;
        var a, b;
    }
    expect_stdout: [
        "PASS",
        "PASS",
    ]
    node_version: ">=6"
}

issue_4512: {
    options = {
        side_effects: true,
    }
    input: {
        console.log(function([ a, b = a ]) {}([]));
    }
    expect: {
        console.log(function([ a, b = a ]) {}([]));
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_4519_1: {
    options = {
        arguments: true,
        keep_fargs: false,
    }
    input: {
        try {
            (function() {
                var [ arguments ] = [];
                arguments[0];
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function() {
                var [ arguments ] = [];
                arguments[0];
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4519_2: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        try {
            (function() {
                var [ arguments ] = [];
                arguments[0];
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function() {
                var [ arguments ] = [];
                arguments[0];
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4554: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        A = "PASS";
        var a = "FAIL";
        try {
            (function({}, b) {
                return b;
            })(void 0, a = A);
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        A = "PASS";
        var a = "FAIL";
        try {
            (function({}, b) {
                return b;
            })(void 0, a = A);
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4584: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        try {
            (function f({
                [console.log(a = "FAIL")]: a,
            }) {})(0);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function f({
                [console.log(a = "FAIL")]: a,
            }) {})(0);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4608_1: {
    options = {
        arguments: true,
        keep_fargs: false,
    }
    input: {
        (function() {
            [ arguments ] = [ "foo" ];
            console.log(arguments[0]);
        })();
    }
    expect: {
        (function() {
            [ arguments ] = [ "foo" ];
            console.log(arguments[0]);
        })();
    }
    expect_stdout: "f"
    node_version: ">=6"
}

issue_4608_2: {
    options = {
        arguments: true,
        reduce_vars: true,
    }
    input: {
        (function(a) {
            [ arguments ] = [ "foo" ];
            console.log(arguments[0]);
        })();
    }
    expect: {
        (function(a) {
            [ arguments ] = [ "foo" ];
            console.log(arguments[0]);
        })();
    }
    expect_stdout: "f"
    node_version: ">=6"
}

issue_4994: {
    options = {
        loops: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function([
            {
                [function() {
                    for (a in { PASS: null });
                }()]: b,
            },
        ]) {
            var a;
        })([ 42 ]);
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function([
            {
                [function() {
                    for (a in { PASS: null });
                }()]: b,
            },
        ]) {})([ 42 ]);
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5017: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = function() {};
        var b = c = a;
        var c = [ c ] = [ c ];
        console.log(c[0] === a ? "PASS" : "FAIL");
    }
    expect: {
        var a = function() {};
        var b = a;
        var c = [ c ] = [ c = a ];
        console.log(c[0] === a ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5071_1: {
    options = {
        unused: true,
    }
    input: {
        var a;
        console.log(([ , a ] = [ "PA", , ]).join("SS"));
    }
    expect: {
        var a;
        console.log(([ , a ] = [ "PA", , ]).join("SS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5071_2: {
    options = {
        pure_getters: "strict",
        unused: true,
    }
    input: {
        var a;
        ([ a ] = []).p = console.log("PASS");
    }
    expect: {
        var a;
        ([ a ] = []).p = console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5074_getter: {
    options = {
        evaluate: true,
        side_effects: true,
        unused: true,
    }
    input: {
        ({} = { get [(console.log("PASS"), 42)]() {} });
    }
    expect: {
        ({} = { [(console.log("PASS"), 42)]: 0 });
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5074_getter_pure_getters: {
    options = {
        evaluate: true,
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        ({} = { get [(console.log("PASS"), 42)]() {} });
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5074_setter: {
    options = {
        evaluate: true,
        side_effects: true,
        unused: true,
    }
    input: {
        ({} = { set [(console.log("PASS"), 42)](v) {} });
    }
    expect: {
        ({} = { [(console.log("PASS"), 42)]: 0 });
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5074_setter_pure_getters: {
    options = {
        evaluate: true,
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        ({} = { set [(console.log("PASS"), 42)](v) {} });
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5074_method: {
    options = {
        evaluate: true,
        side_effects: true,
        unused: true,
    }
    input: {
        ({} = { [(console.log("PASS"), 42)]() {} });
    }
    expect: {
        ({} = { [(console.log("PASS"), 42)]: 0 });
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5074_method_pure_getters: {
    options = {
        evaluate: true,
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        ({} = { [(console.log("PASS"), 42)]() {} });
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5085_1: {
    options = {
        evaluate: true,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        var [ b ] = [ 42, a ], c = b ? 0 : a = "FAIL";
        console.log(a);
    }
    expect: {
        var a = "PASS";
        42;
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5085_2: {
    options = {
        evaluate: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function(b) {
            [ b ] = [ 42, a ];
            var c = b ? 0 : a = "FAIL";
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function(b) {
            0;
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5087_1: {
    options = {
        collapse_vars: true,
        inline: true,
        properties: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function() {
            (function() {
                (function([ b ]) {
                    b && console.log(b);
                })([ a ]);
            })();
        })();
    }
    expect: {
        var a = "PASS";
        (function() {
            var b;
            (b = a) && console.log(b);
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5087_2: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        properties: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function() {
            (function() {
                (function([ b ]) {
                    b && console.log(b);
                })([ a ]);
            })();
        })();
    }
    expect: {
        var a = "PASS";
        a && console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5114_1: {
    options = {
        inline: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function({}, a) {})(42);
        console.log(a);
    }
    expect: {
        var a = "PASS";
        [ {} ] = [ 42 ],
        void 0;
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5114_2: {
    options = {
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function f([], a) {
            f.length;
        })([]);
        console.log(a);
    }
    expect: {
        var a = "PASS";
        0;
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5114_3: {
    options = {
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function f(a, {}) {
            f.length;
        })(null, 42);
        console.log(a);
    }
    expect: {
        var a = "PASS";
        0;
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5153_array_assign: {
    options = {
        dead_code: true,
    }
    input: {
        var a = function*() {
            yield b;
        }(), b;
        [ b ] = b = a;
        console.log(a === b ? "PASS" : "FAIL");
    }
    expect: {
        var a = function*() {
            yield b;
        }(), b;
        [ b ] = b = a;
        console.log(a === b ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5153_array_var: {
    options = {
        dead_code: true,
    }
    input: {
        var a = function*() {
            yield b;
        }(), [ b ] = b = a;
        console.log(a === b ? "PASS" : "FAIL");
    }
    expect: {
        var a = function*() {
            yield b;
        }(), [ b ] = b = a;
        console.log(a === b ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5153_object_assign: {
    options = {
        dead_code: true,
    }
    input: {
        var a = {
            get p() {
                return b;
            },
        }, b;
        ({
            p: b
        } = b = a);
        console.log(a === b ? "PASS" : "FAIL");
    }
    expect: {
        var a = {
            get p() {
                return b;
            },
        }, b;
        ({
            p: b
        } = b = a);
        console.log(a === b ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5153_object_var: {
    options = {
        dead_code: true,
    }
    input: {
        var a = {
            get p() {
                return b;
            },
        }, {
            p: b
        } = b = a;
        console.log(a === b ? "PASS" : "FAIL");
    }
    expect: {
        var a = {
            get p() {
                return b;
            },
        }, {
            p: b
        } = b = a;
        console.log(a === b ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5168: {
    options = {
        collapse_vars: true,
    }
    input: {
        (function a({
            [console.log(typeof function() {
                ++a;
                return a;
            }())]: b,
        }) {
            var a;
        })({});
    }
    expect: {
        (function a({
            [console.log(typeof function() {
                ++a;
                return a;
            }())]: b,
        }) {
            var a;
        })({});
    }
    expect_stdout: "function"
    node_version: ">=6"
}

issue_5189_1: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 42;
        [ a.p ] = a = "PASS";
        console.log(a);
    }
    expect: {
        var a;
        [ a.p ] = a = "PASS";
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5189_2: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 42;
        ({ p: a.q } = a = "PASS");
        console.log(a);
    }
    expect: {
        var a;
        ({ p: a.q } = a = "PASS");
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5222: {
    options = {
        hoist_props: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            do {
                (function() {
                    var a = {
                        p: [ a ] = [],
                    };
                })();
            } while (console.log("PASS"));
        }
        f();
    }
    expect: {
        do {
            a = void 0,
            a = {
                p: [ a ] = [],
            };
        } while (console.log("PASS"));
        var a;
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5288_1: {
    options = {
        conditionals: true,
        inline: true,
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        while (function([]) {}([ function f() {
            if (console)
                return console.log("PASS");
            else {
                let a = 0;
            }
        }() ]));
    }
    expect: {
        while (function() {
            if (console)
                console.log("PASS");
        }(), void 0);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5288_2: {
    options = {
        conditionals: true,
        inline: true,
        keep_fargs: false,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        while (function([]) {}([ function f() {
            if (console)
                return console.log("PASS");
            else {
                let a = 0;
            }
        }() ]));
    }
    expect: {
        while (console && console.log("PASS"), void 0);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5314_1: {
    options = {
        side_effects: true,
    }
    input: {
        A = this;
        new function() {
            (function({
                [console.log(this === A ? "PASS" : "FAIL")]: a,
            }) {})(42);
        }();
    }
    expect: {
        A = this;
        (function() {
            (function({
                [console.log(this === A ? "PASS" : "FAIL")]: a,
            }) {})(42);
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5314_2: {
    options = {
        side_effects: true,
    }
    input: {
        A = this;
        new function() {
            (({
                [console.log(this === A ? "FAIL" : "PASS")]: a,
            }) => {})(42);
        }();
    }
    expect: {
        A = this;
        new function() {
            [ {
                [console.log(this === A ? "FAIL" : "PASS")]: [][0],
            } ] = [ 42 ];
        }();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5370: {
    options = {
        dead_code: true,
        ie: true,
        unused: true,
    }
    input: {
        console.log(function arguments({}) {
            return arguments;
            try {} catch (e) {
                var arguments;
            }
        }(42));
    }
    expect: {
        console.log(function arguments({}) {
            return arguments;
            var arguments;
        }(42));
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_5405_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var [ a ] = [ {} ];
        console.log(a === a ? "PASS" : "FAIL");
    }
    expect: {
        var [ a ] = [ {} ];
        console.log(true ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5405_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var { p: a } = { p: [] };
        console.log(a === a ? "PASS" : "FAIL");
    }
    expect: {
        var { p: a } = { p: [] };
        console.log(true ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5423: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a, b;
        function f({
            [function() {
                if (++a)
                    return 42;
            }()]: c
        }) {}
        f(b = f);
        console.log(typeof b);
    }
    expect: {
        var a, b;
        function f({
            [function() {
                if (++a)
                    return 42;
            }()]: c
        }) {}
        f(b = f);
        console.log(typeof b);
    }
    expect_stdout: "function"
    node_version: ">=6"
}

issue_5454: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            var a = 42, a = {
                p: [ a ] = [],
            };
            return "PASS";
        }
        console.log(f());
    }
    expect: {
        console.log(function(a) {
            a = 42, a = {
                p: [ a ] = [],
            };
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5485: {
    options = {
        comparisons: true,
    }
    input: {
        (function f({
            p: f,
            [console.log(void 0 === f ? "PASS" : "FAIL")]: a,
        }) {})(42);
    }
    expect: {
        (function f({
            p: f,
            [console.log(void 0 === f ? "PASS" : "FAIL")]: a,
        }) {})(42);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
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
                        (function f([ b ]) {
                            b;
                            throw "PASS";
                        })([]);
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
    node_version: ">=6"
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
                        (function f([ b ]) {
                            b;
                            throw "PASS";
                        })([]);
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
    node_version: ">=6"
}

issue_5573: {
    options = {
        collapse_vars: true,
    }
    input: {
        var log = console.log;
        var a = "FAIL";
        (function([ { [log(a)]: b } ]) {
            A = 42;
        })((a = "PASS", [ {} ]));
        log(a, A);
    }
    expect: {
        var log = console.log;
        var a = "FAIL";
        (function([ { [log(a)]: b } ]) {
            A = 42;
        })((a = "PASS", [ {} ]));
        log(a, A);
    }
    expect_stdout: [
        "PASS",
        "PASS 42",
    ]
    node_version: ">=6"
}

issue_5651: {
    options = {
        ie: true,
        unused: true,
    }
    input: {
        console.log(function arguments({}) {
            try {} catch (arguments) {
                var arguments;
            }
            return arguments[0];
        }("PASS"));
    }
    expect: {
        console.log(function arguments({}) {
            try {} catch (arguments) {
                var arguments;
            }
            return arguments[0];
        }("PASS"));
    }
    expect_stdout: true
    node_version: ">=6"
}
