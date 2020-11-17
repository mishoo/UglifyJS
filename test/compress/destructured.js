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
        keep_fargs: "strict",
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
            (function({}) {})();
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
    node_version: ">=6"
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
    node_version: ">=6"
}

funarg_unused_1: {
    options = {
        keep_fargs: "strict",
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
        keep_fargs: "strict",
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
        keep_fargs: "strict",
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
            var {} = (console, 42);
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
        keep_fargs: "strict",
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
        keep_fargs: "strict",
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
            (function({}) {})();
        } catch (e) {
            console.log("PASS");
        }
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
                var [ a ] = [];
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
    expect:{
        (function(a) {
            console.log("PASS");
        })();
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
        keep_fargs: "strict",
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
            var b = a;
            b++;
        }
        f(0);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}
