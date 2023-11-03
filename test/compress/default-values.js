arrow_1: {
    input: {
        console.log(((a = "PASS") => a)());
    }
    expect_exact: 'console.log(((a="PASS")=>a)());'
    expect_stdout: "PASS"
    node_version: ">=6"
}

arrow_2: {
    input: {
        console.log((([ a = "FAIL" ]) => a)([ "PASS" ]));
    }
    expect_exact: 'console.log((([a="FAIL"])=>a)(["PASS"]));'
    expect_stdout: "PASS"
    node_version: ">=6"
}

arrow_3: {
    input: {
        (([ a = console ] = null) => a.log("PASS"))("");
    }
    expect_exact: '(([a=console]=null)=>a.log("PASS"))("");'
    expect_stdout: "PASS"
    node_version: ">=6"
}

assign: {
    input: {
        [ a = "PASS" ] = [];
        console.log(a);
    }
    expect_exact: '[a="PASS"]=[];console.log(a);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

declaration_var: {
    input: {
        var [ a = "PASS" ] = [ , ];
        console.log(a);
    }
    expect_exact: 'var[a="PASS"]=[,];console.log(a);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

declaration_const: {
    input: {
        const [ a = "FAIL" ] = [ "PASS" ];
        console.log(a);
    }
    expect_exact: 'const[a="FAIL"]=["PASS"];console.log(a);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

declaration_let: {
    input: {
        let [ a = "PASS" ] = [ void 42 ];
        console.log(a);
    }
    expect_exact: 'let[a="PASS"]=[void 42];console.log(a);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

object_shorthand_assign: {
    input: {
        ({ a = "PASS" } = 42);
        console.log(a);
    }
    expect_exact: '({a="PASS"}=42);console.log(a);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

object_shorthand_declaration: {
    input: {
        var { a = "PASS" } = 42;
        console.log(a);
    }
    expect_exact: 'var{a="PASS"}=42;console.log(a);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

object_shorthand_function: {
    input: {
        (function({ a = "PASS" }) {
            console.log(a);
        })(42);
    }
    expect_exact: '(function({a="PASS"}){console.log(a)})(42);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

retain_arguments_1: {
    options = {
        arguments: true,
    }
    input: {
        console.log(function(a = "FAIL") {
            return arguments[0];
        }() || "PASS");
    }
    expect: {
        console.log(function(a = "FAIL") {
            return arguments[0];
        }() || "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

retain_arguments_2: {
    options = {
        arguments: true,
    }
    input: {
        console.log(function(a, b = null) {
            a = "FAIL";
            return arguments[0];
        }("PASS", 42));
    }
    expect: {
        console.log(function(a, b = null) {
            a = "FAIL";
            return arguments[0];
        }("PASS", 42));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

process_boolean_returns: {
    options = {
        booleans: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        console.log(function(a = console.log("FAIL 1")) {
            return a() ? "PASS" : "FAIL 2";
        }(function() {
            return 42;
        }));
    }
    expect: {
        console.log(function(a = console.log("FAIL 1")) {
            return 42 ? "PASS" : "FAIL 2";
        }(function() {
            return 1;
        }));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_arg_sequence: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        (function(a = (console.log("bar"), console.log)) {
            a("foo");
        })();
    }
    expect: {
        (function(a = console.log("bar")) {
            (0, console.log)("foo");
        })();
    }
    expect_stdout: [
        "bar",
        "foo",
    ]
    node_version: ">=6"
}

collapse_in_arg: {
    options = {
        collapse_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function(a, b = a) {
            b("PASS");
        })(console.log);
    }
    expect: {
        (function(a) {
            a("PASS");
        })(console.log);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_value_1: {
    options = {
        collapse_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function(a = "PASS") {
            return a;
        }());
    }
    expect: {
        console.log(function() {
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_value_2: {
    options = {
        collapse_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function(a = console) {
            return a;
        })().log("PASS");
    }
    expect: {
        (function() {
            return console;
        })().log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

flatten_if: {
    options = {
        conditionals: true,
    }
    input: {
        if (console.log("PASS")) {
            var [
                a = function b() {
                    for (c in b);
                },
            ] = 0;
        }
    }
    expect: {
        var a;
        console.log("PASS") && ([
            a = function b() {
                for (c in b);
            },
        ] = 0);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

maintain_if: {
    options = {
        conditionals: true,
    }
    input: {
        if (a)
            for (;;);
        else
            var [ a = "PASS" ] = [];
        console.log(a);
    }
    expect: {
        if (a)
            for (;;);
        else
            var [ a = "PASS" ] = [];
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

reduce_funarg: {
    options = {
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(...function(a = "foo", b = "bar", c = "baz") {
            return [ a, b, c ];
        }(void 0, null));
    }
    expect: {
        console.log(...function() {
            return [ "foo", null, "baz" ];
        }());
    }
    expect_stdout: "foo null baz"
    node_version: ">=6"
}

reduce_array: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var [ a = "foo", b = "bar", c = "baz" ] = [ void 0, null ];
        console.log(a, b, c);
    }
    expect: {
        var [ c = "baz" ] = [];
        console.log("foo", null, c);
    }
    expect_stdout: "foo null baz"
    node_version: ">=6"
}

reduce_object: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var { a = "foo", b = "bar", c = "baz" } = { a: void 0, b: null };
        console.log(a, b, c);
    }
    expect: {
        var { c = "baz" } = {};
        console.log("foo", null, c);
    }
    expect_stdout: "foo null baz"
    node_version: ">=6"
}

evaluate_iife: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(function(a = "PASS") {
            return a;
        }());
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

unsafe_evaluate_iife_1: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(function([ a ] = []) {
            return "PASS";
        }());
    }
    expect: {
        console.log(function([ a ] = []) {
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

unsafe_evaluate_iife_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        console.log(function([ a ] = []) {
            return a[0];
        }([ [ "PASS" ] ]));
    }
    expect: {
        console.log(function([ a ] = []) {
            return a[0];
        }([ [ "PASS" ] ]));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

inline_direct: {
    options = {
        default_values: true,
        inline: true,
        unused: true,
    }
    input: {
        console.log(function(a = "FAIL") {
            return a;
        }("PASS"));
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

inline_constant: {
    options = {
        inline: true,
    }
    input: {
        console.log(function(a = console.log("foo")) {
            return "bar";
        }(void console.log("baz")));
    }
    expect: {
        console.log((void console.log("baz"), console.log("foo"), "bar"));
    }
    expect_stdout: [
        "baz",
        "foo",
        "bar",
    ]
    node_version: ">=6"
}

inline_destructured: {
    options = {
        inline: true,
    }
    input: {
        console.log(function([ a ] = []) {
            return "PASS";
        }());
    }
    expect: {
        console.log(([ [] = [] ] = [], "PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

inline_function: {
    options = {
        default_values: true,
        inline: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        (function(a = console.log("foo"), b = console.log("bar")) {
            console.log("baz");
        }(void console.log("moo"), 42));
    }
    expect: {
        console.log("moo"),
        console.log("foo"),
        console.log("baz");
    }
    expect_stdout: [
        "moo",
        "foo",
        "baz",
    ]
    node_version: ">=6"
}

inline_loop_1: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        while (function f(a = "PASS") {
            console.log(a);
        }());
    }
    expect: {
        while (a = "PASS", void console.log(a));
        var a;
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

inline_loop_2: {
    options = {
        inline: true,
        sequences: true,
        toplevel: true,
        unused: true,
    }
    input: {
        while (function(a = [ "PASS" ]) {
            var a = function f(b) {
                console.log(a[b]);
            }(0);
        }());
    }
    expect: {
        while (a = [ "PASS" ],
            b = void 0,
            b = 0,
            void (a = void console.log(a[b])));
        var a, b;
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

inline_side_effects_1: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        var a = 42;
        (function(b = --a) {})(console);
        console.log(a);
    }
    expect: {
        var a = 42;
        [ b = --a ] = [ console ],
        void 0;
        var b;
        console.log(a);
    }
    expect_stdout: "42"
    node_version: ">=6"
}

inline_side_effects_2: {
    options = {
        side_effects: true,
    }
    input: {
        var a = 42;
        (function(b = --a) {})(console);
        console.log(a);
    }
    expect: {
        var a = 42;
        [ [][0] = --a ] = [ console ];
        console.log(a);
    }
    expect_stdout: "42"
    node_version: ">=6"
}

drop_empty_iife: {
    options = {
        side_effects: true,
    }
    input: {
        console.log(function(a = console.log("foo")) {}(void console.log("baz")));
    }
    expect: {
        console.log((console.log("baz"), void console.log("foo")));
    }
    expect_stdout: [
        "baz",
        "foo",
        "undefined",
    ]
    node_version: ">=6"
}

retain_empty_iife: {
    options = {
        side_effects: true,
    }
    input: {
        var a;
        try {
            (function(a = a) {})();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        var a;
        try {
            (function(a = a) {})();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_new_function: {
    options = {
        side_effects: true,
    }
    input: {
        new function(a = console.log("PASS")) {}();
    }
    expect: {
        void console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

retain_fargs: {
    options = {
        unused: true,
    }
    input: {
        (function([ a = console.log("PASS") ]) {})([]);
    }
    expect: {
        (function([ a = console.log("PASS") ]) {})([]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_fargs: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function(a = 42, b = console.log("foo"), c = true) {
            return "bar";
        }(console.log("baz"), "moo", false));
    }
    expect: {
        console.log(function(b = console.log("foo")) {
            return "bar";
        }((console.log("baz"), "moo")));
    }
    expect_stdout: [
        "baz",
        "bar",
    ]
    expect_warnings: [
        "WARN: Dropping unused default argument c [test/compress/default-values.js:1,61]",
        "WARN: Side effects in default value of unused variable b [test/compress/default-values.js:1,37]",
        "WARN: Dropping unused default argument assignment a [test/compress/default-values.js:1,29]",
    ]
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
        var [ b = 42 ] = [];
        console.log(a, b);
    }
    expect: {
        var a = "PASS", [ b = 42 ] = [];
        console.log(a, b);
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

unused_var_1: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var [ a = 42 ] = [ console.log("PASS") ];
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

unused_var_2: {
    options = {
        pure_getters: "strict",
        toplevel: true,
        unused: true,
    }
    input: {
        var {
            p: [ a ] = "" + console.log("FAIL"),
        } = {
            p: [ console.log("PASS") ],
        };
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

unused_value_assign_1: {
    options = {
        default_values: true,
        unused: true,
    }
    input: {
        [] = [ console.log("PASS") ];
    }
    expect: {
        [ console.log("PASS") ];
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

unused_value_assign_2: {
    options = {
        default_values: true,
        unused: true,
    }
    input: {
        [ a = console.log("FAIL") ] = [ "PASS" ];
        console.log(a);
    }
    expect: {
        [ a ] = [ "PASS" ];
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

unused_value_var_1: {
    options = {
        default_values: true,
        unused: true,
    }
    input: {
        var [] = [ console.log("PASS") ];
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

unused_value_var_2: {
    options = {
        default_values: true,
        unused: true,
    }
    input: {
        var [ a = console.log("FAIL") ] = [ "PASS" ];
        console.log(a);
    }
    expect: {
        var a = [ "PASS" ][0];
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_var_1: {
    mangle = {
        toplevel: false,
    }
    input: {
        var N = 1, [ {
            pname: p = "x",
            i: n = N,
        }, {
            [p + n]: v,
        } ] = [ {}, {
            x1: "PASS",
        } ];
        console.log(v);
    }
    expect: {
        var N = 1, [ {
            pname: p = "x",
            i: n = N,
        }, {
            [p + n]: v,
        } ] = [ {}, {
            x1: "PASS",
        } ];
        console.log(v);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_var_1_toplevel: {
    mangle = {
        toplevel: true,
    }
    input: {
        var N = 1, [ {
            pname: p = "x",
            i: n = N,
        }, {
            [p + n]: v,
        } ] = [ {}, {
            x1: "PASS",
        } ];
        console.log(v);
    }
    expect: {
        var o = 1, [ {
            pname: a = "x",
            i: e = o,
        }, {
            [a + e]: l,
        } ] = [ {}, {
            x1: "PASS",
        } ];
        console.log(l);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_var_2: {
    mangle = {
        toplevel: false,
    }
    input: {
        var N = 1, [ {
            pname: p = "x",
            i: n = N,
        } = {}, {
            [p + n]: v,
        } ] = [ , {
            x1: "PASS",
        } ];
        console.log(v);
    }
    expect: {
        var N = 1, [ {
            pname: p = "x",
            i: n = N,
        } = {}, {
            [p + n]: v,
        } ] = [ , {
            x1: "PASS",
        } ];
        console.log(v);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_var_2_toplevel: {
    mangle = {
        toplevel: true,
    }
    input: {
        var N = 1, [ {
            pname: p = "x",
            i: n = N,
        } = {}, {
            [p + n]: v,
        } ] = [ , {
            x1: "PASS",
        } ];
        console.log(v);
    }
    expect: {
        var o = 1, [ {
            pname: a = "x",
            i: e = o,
        } = {}, {
            [a + e]: l,
        } ] = [ , {
            x1: "PASS",
        } ];
        console.log(l);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_function_1: {
    mangle = {
        toplevel: false,
    }
    input: {
        var N = 1;
        (function(o, {
            pname: p,
        } = o, {
            [p + N]: v,
        } = o) {
            let N;
            console.log(v);
        })({
            pname: "x",
            x1: "PASS",
        });
    }
    expect: {
        var N = 1;
        (function(n, {
            pname: e,
        } = n, {
            [e + N]: o,
        } = n) {
            let a;
            console.log(o);
        })({
            pname: "x",
            x1: "PASS",
        });
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_function_1_toplevel: {
    mangle = {
        toplevel: true,
    }
    input: {
        var N = 1;
        (function(o, {
            pname: p,
        } = o, {
            [p + N]: v,
        } = o) {
            let N;
            console.log(v);
        })({
            pname: "x",
            x1: "PASS",
        });
    }
    expect: {
        var l = 1;
        (function(n, {
            pname: e,
        } = n, {
            [e + l]: o,
        } = n) {
            let a;
            console.log(o);
        })({
            pname: "x",
            x1: "PASS",
        });
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_function_2: {
    mangle = {
        toplevel: false,
    }
    input: {
        var N = 1;
        (function({
            pname: p = "x",
            i: n = N,
        }, {
            [p + n]: v,
        }) {
            let N;
            console.log(v);
        })({}, {
            x1: "PASS",
        });
    }
    expect: {
        var N = 1;
        (function({
            pname: n = "x",
            i: o = N,
        }, {
            [n + o]: e,
        }) {
            let l;
            console.log(e);
        })({}, {
            x1: "PASS",
        });
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_function_2_toplevel: {
    mangle = {
        toplevel: true,
    }
    input: {
        var N = 1;
        (function({
            pname: p = "x",
            i: n = N,
        }, {
            [p + n]: v,
        }) {
            let N;
            console.log(v);
        })({}, {
            x1: "PASS",
        });
    }
    expect: {
        var a = 1;
        (function({
            pname: n = "x",
            i: o = a,
        }, {
            [n + o]: e,
        }) {
            let l;
            console.log(e);
        })({}, {
            x1: "PASS",
        });
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_arrow_1: {
    mangle = {
        toplevel: false,
    }
    input: {
        var N = 1;
        ((o, {
            pname: p,
        } = o, {
            [p + N]: v,
        } = o) => {
            let N;
            console.log(v);
        })({
            pname: "x",
            x1: "PASS",
        });
    }
    expect: {
        var N = 1;
        ((e, {
            pname: a,
        } = e, {
            [a + N]: l,
        } = e) => {
            let n;
            console.log(l);
        })({
            pname: "x",
            x1: "PASS",
        });
    }
    expect_stdout: "PASS"
    node_version: ">=6.9.3"
}

mangle_arrow_1_toplevel: {
    mangle = {
        toplevel: true,
    }
    input: {
        var N = 1;
        ((o, {
            pname: p,
        } = o, {
            [p + N]: v,
        } = o) => {
            let N;
            console.log(v);
        })({
            pname: "x",
            x1: "PASS",
        });
    }
    expect: {
        var o = 1;
        ((e, {
            pname: a,
        } = e, {
            [a + o]: l,
        } = e) => {
            let n;
            console.log(l);
        })({
            pname: "x",
            x1: "PASS",
        });
    }
    expect_stdout: "PASS"
    node_version: ">=6.9.3"
}

mangle_arrow_2: {
    mangle = {
        toplevel: false,
    }
    input: {
        var N = 1;
        (({
            pname: p = "x",
            i: n = N,
        }, {
            [p + n]: v,
        }) => {
            let N;
            console.log(v);
        })({}, {
            x1: "PASS",
        });
    }
    expect: {
        var N = 1;
        (({
            pname: e = "x",
            i: l = N,
        }, {
            [e + l]: o,
        }) => {
            let a;
            console.log(o);
        })({}, {
            x1: "PASS",
        });
    }
    expect_stdout: "PASS"
    node_version: ">=6.9.3"
}

mangle_arrow_2_toplevel: {
    mangle = {
        toplevel: true,
    }
    input: {
        var N = 1;
        (({
            pname: p = "x",
            i: n = N,
        }, {
            [p + n]: v,
        }) => {
            let N;
            console.log(v);
        })({}, {
            x1: "PASS",
        });
    }
    expect: {
        var n = 1;
        (({
            pname: e = "x",
            i: l = n,
        }, {
            [e + l]: o,
        }) => {
            let a;
            console.log(o);
        })({}, {
            x1: "PASS",
        });
    }
    expect_stdout: "PASS"
    node_version: ">=6.9.3"
}

collapse_preceding_simple_arg: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = "foo";
        console.log(function(b, c = "bar") {
            return b + c;
        }(a, a));
    }
    expect: {
        var a = "foo";
        console.log(function(b, c = "bar") {
            return a + c;
        }(0, a));
    }
    expect_stdout: "foofoo"
    node_version: ">=6"
}

drop_preceding_simple_arg: {
    options = {
        collapse_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        var a = "foo";
        console.log(function(b, c = "bar") {
            return b + c;
        }(a, a));
    }
    expect: {
        var a = "foo";
        console.log(function(c = "bar") {
            return a + c;
        }(a));
    }
    expect_stdout: "foofoo"
    node_version: ">=6"
}

issue_4444: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "PASS";
        console.log(function(b) {
            b = a;
            (function(c = b.p) {})();
            return a;
        }());
    }
    expect: {
        var a = "PASS";
        console.log(function(b) {
            b = a;
            (function(c = b.p) {})();
            return a;
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4446_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        a = 42;
        [ b = 42 ] = [ "PASS" ];
        c = 42;
        console.log(b, a);
    }
    expect: {
        [ b = 42 ] = [ "PASS" ];
        c = a = 42;
        console.log(b, a);
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

issue_4446_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        a = 42;
        var [ b = 42 ] = [ "PASS" ];
        c = 42;
        console.log(b, a);
    }
    expect: {
        var [ b = 42 ] = [ "PASS" ];
        c = a = 42;
        console.log(b, a);
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

issue_4458: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        function f(b = a = "FAIL") {
            console.log(a, b);
        }
        f(42);
    }
    expect: {
        var a = "PASS";
        (function(b = a = "FAIL") {
            console.log(a, b);
        })(42);
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

issue_4460: {
    options = {
        collapse_vars: true,
    }
    input: {
        var log = console.log, a = "FAIL";
        var [ b = a ] = (a = "PASS", []);
        log(a, b);
    }
    expect: {
        var log = console.log, a = "FAIL";
        var [ b = a ] = (a = "PASS", []);
        log(a, b);
    }
    expect_stdout: "PASS PASS"
    node_version: ">=6"
}

issue_4461_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = 0;
        (function(b = a && console.log("PASS"), c) {
            return c;
        })(void 0, a++);
    }
    expect: {
        var a = 0;
        (function(b = a && console.log("PASS"), c) {
            return c;
        })(void 0, a++);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4461_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = 0;
        (function([ b = a && console.log("PASS") ], c) {
            return c;
        })([], a++);
    }
    expect: {
        var a = 0;
        (function([ b = a && console.log("PASS") ], c) {
            return c;
        })([], a++);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4468: {
    options = {
        evaluate: true,
        keep_fargs: false,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(a) {
            var {
                [console.log("PASS")]: b = a && (a.p = 0),
            } = 0;
            a;
        })(1234);
    }
    expect: {
        (function() {
            var {
                [console.log("PASS")]: b,
            } = 0;
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4483: {
    options = {
        conditionals: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        if (console)
            var [ a = "FAIL" ] = [], b = a = "PASS";
        console.log(b);
    }
    expect: {
        var a, b;
        console && ([ a = "FAIL" ] = [], b = "PASS");
        console.log(b);
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
        (function(a = null) {
            var arguments;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })();
    }
    expect: {
        (function(a = null) {
            var arguments;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })();
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
        (function(a = null) {
            var arguments = null;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })();
    }
    expect: {
        (function(a = null) {
            var arguments = null;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4485_3: {
    options = {
        unused: true,
    }
    input: {
        (function(a = null) {
            var arguments;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })();
    }
    expect: {
        (function(a = null) {
            var arguments;
            try {
                arguments.length;
            } catch (e) {
                console.log("PASS");
            }
        })();
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4496: {
    options = {
        default_values: true,
        unused: true,
    }
    input: {
        (function f(a = 0) {
            console.log(function(b) {
                a && b();
                return a;
            }(f));
        })(42);
    }
    expect: {
        (function f(a = 0) {
            console.log(function(b) {
                a && b();
                return a;
            }(f));
        })(42);
    }
    expect_stdout: [
        "0",
        "42",
    ]
    node_version: ">=6"
}

issue_4502_1: {
    options = {
        inline: true,
        unused: true,
    }
    input: {
        (function() {
            var a = "PASS";
            (function(b = a++) {
                var a;
            })(void 0, console.log(a));
        })();
    }
    expect: {
        (function() {
            var a = "PASS";
            void 0,
            console.log(a),
            a++,
            void 0;
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4502_2: {
    options = {
        inline: true,
        unused: true,
    }
    input: {
        (function() {
            var a = "PASS";
            (function(b = a++) {})(void 0, console.log(a));
        })();
    }
    expect: {
        (function() {
            var a = "PASS";
            void 0,
            console.log(a),
            a++,
            void 0;
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4502_3: {
    options = {
        side_effects: true,
    }
    input: {
        (function() {
            var a = "PASS";
            (function(b = a++) {})(void 0, console.log(a));
        })();
    }
    expect: {
        (function() {
            var a = "PASS";
            console.log(a),
            a++;
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4502_4: {
    options = {
        side_effects: true,
    }
    input: {
        (function(a, b = console.log("FAIL")) {})(..."" + console.log(42));
    }
    expect: {
        [ , [][0] = console.log("FAIL") ] = [ ..."" + console.log(42) ];
    }
    expect_stdout: "42"
    node_version: ">=6"
}

issue_4510_1: {
    options = {
        default_values: true,
        unused: true,
    }
    input: {
        var a = [];
        var [ , b = console.log("PASS") ] = [ ...a, null ];
    }
    expect: {
        var a = [];
        var [ , b = console.log("PASS") ] = [ ...a, null ];
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4510_2: {
    options = {
        default_values: true,
        unused: true,
    }
    input: {
        var o = {
            p: void 0,
        };
        var {
            p: a = console.log("PASS"),
        } = {
            p: null,
            ...o,
        };
    }
    expect: {
        var o = {
            p: void 0,
        };
        var {
            p: a = console.log("PASS"),
        } = {
            p: null,
            ...o,
        };
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

issue_4523: {
    options = {
        merge_vars: true,
    }
    input: {
        console.log(function() {
            var a, b;
            [ a = b = false ] = [ "FAIL" ];
            return b || "PASS";
        }());
    }
    expect: {
        console.log(function() {
            var a, b;
            [ a = b = false ] = [ "FAIL" ];
            return b || "PASS";
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4540: {
    options = {
        reduce_vars: true,
        side_effects: true,
    }
    input: {
        console.log(function() {
            function f([ a = 0 ]) {}
            f([]);
        }());
    }
    expect: {
        console.log(function() {
            function f([ a = 0 ]) {}
            f([]);
        }());
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_4548_1: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        A = "foo";
        var a = A;
        [ b = c = "bar" ] = [ console, console.log(a) ];
        console.log(c);
        var c;
    }
    expect: {
        A = "foo";
        var a = A;
        [ b = c = "bar" ] = [ console, console.log(a) ];
        console.log(c);
        var c;
    }
    expect_stdout: [
        "foo",
        "undefined",
    ]
    node_version: ">=6"
}

issue_4548_2: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        A = "foo";
        var a = A;
        var [ b = c = "bar" ] = [ console, console.log(a) ];
        console.log(c);
        var c;
    }
    expect: {
        A = "foo";
        var a = A;
        var [ b = c = "bar" ] = [ console, console.log(a) ];
        console.log(c);
        var c;
    }
    expect_stdout: [
        "foo",
        "undefined",
    ]
    node_version: ">=6"
}

issue_4588_1_unused: {
    options = {
        unused: true,
    }
    input: {
        console.log(function(a = 42) {}.length);
    }
    expect: {
        console.log(function(a = 0) {}.length);
    }
    expect_stdout: "0"
    node_version: ">=6"
}

issue_4588_2_unused: {
    options = {
        unused: true,
    }
    input: {
        console.log(function(a, b = void 0, c, d = "foo") {}.length);
    }
    expect: {
        console.log(function(a, b = 0, c, d) {}.length);
    }
    expect_stdout: "1"
    expect_warnings: [
        "WARN: Dropping unused default argument assignment d [test/compress/default-values.js:1,47]",
        "WARN: Dropping unused default argument value b [test/compress/default-values.js:1,32]",
    ]
    node_version: ">=6"
}

issue_4588_1_evaluate: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(function(a = 42) {}.length);
    }
    expect: {
        console.log(0);
    }
    expect_stdout: "0"
    node_version: ">=6"
}

issue_4588_2_evaluate: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(function(a, b = void 0, c, d = "foo") {}.length);
    }
    expect: {
        console.log(1);
    }
    expect_stdout: "1"
    node_version: ">=6"
}

issue_4817: {
    options = {
        ie: true,
        inline: true,
        unused: true,
    }
    input: {
        (function f(a = console.log(typeof f)) {
            return 42;
        })();
    }
    expect: {
        (function f(a = console.log(typeof f)) {
            return 42;
        })();
    }
    expect_stdout: "function"
    node_version: ">=6"
}

issue_4854: {
    options = {
        collapse_vars: true,
        inline: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            (function(b = a = "foo") {
                [] = "foo";
            })();
            a;
        }());
    }
    expect: {
        console.log(void 0);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_4916: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
    }
    input: {
        var log = console.log;
        (function(b = "foo") {
            b.value = "FAIL";
            b;
            log(b.value);
        })();
    }
    expect: {
        var log = console.log;
        (function(b = "foo") {
            b.value = "FAIL";
            b;
            log(b.value);
        })();
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_4994: {
    options = {
        loops: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function(b = function() {
            for (a in { PASS: 42 });
        }()) {
            var a;
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function(b = function() {
            for (a in { PASS: 42 });
        }()) {})();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5057_1: {
    options = {
        collapse_vars: true,
        inline: true,
        sequences: true,
        unused: true,
    }
    input: {
        var a = 42;
        (function() {
            var b = function(c = (console.log("foo"), b = a)) {
                a && console.log("bar");
            }();
        })();
    }
    expect: {
        var a = 42;
        console.log("foo"),
        void (a && console.log("bar"));
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=6"
}

issue_5057_2: {
    options = {
        inline: true,
        unused: true,
    }
    input: {
        (function f(a) {
            (function(b = console.log("FAIL")) {})(a);
        })(42);
        console.log(typeof b);
    }
    expect: {
        (function(a) {
            [ b = console.log("FAIL") ] = [ a ],
            void 0;
            var b;
        })(42);
        console.log(typeof b);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_5057_3: {
    options = {
        inline: 3,
        unused: true,
    }
    input: {
        (function(a) {
            (function f(b) {
                (function(a = console.log("FAIL 1")) {})(b);
                console.log(a);
            })("FAIL 2");
        })("PASS");
    }
    expect: {
        (function(a) {
            (function(b) {
                (function(a = console.log("FAIL 1")) {})(b);
                console.log(a);
            })("FAIL 2");
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5057_4: {
    options = {
        if_return: true,
        inline: true,
        unused: true,
    }
    input: {
        (function(a) {
            (function f(b) {
                (function(a = console.log("FAIL 1")) {})(b);
                console.log(a);
            })("FAIL 2");
        })("PASS");
    }
    expect: {
        (function(a) {
            var b = "FAIL 2";
            (function(a = console.log("FAIL 1")) {})(b);
            console.log(a);
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5065: {
    options = {
        pure_getters: "strict",
        toplevel: true,
        unused: true,
    }
    input: {
        var [ a = console.log("PASS") ] = [ (A = 42).p ];
    }
    expect: {
        var [ a = console.log("PASS") ] = [ (A = 42).p ];
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5138_1: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(function(a, b = a = "FAIL") {
            return a;
        }() && "PASS");
    }
    expect: {
        console.log(function(a, b = a = "FAIL") {
            return a;
        }() && "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5138_2: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(function(a, b = a = "FAIL 1") {
            return a;
        }(null, "FAIL 2") || "PASS");
    }
    expect: {
        console.log((null, "PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5192: {
    options = {
        dead_code: true,
        ie: true,
    }
    input: {
        (function a(a,  [] = a = "PASS") {
            console.log(a);
        })("FAIL");
    }
    expect: {
        (function a(a,  [] = a = "PASS") {
            console.log(a);
        })("FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5246_1: {
    options = {
        keep_fargs: false,
        pure_getters: true,
        unused: true,
    }
    input: {
        console.log(function({} = 42) {
            return "PASS";
        }("foo"));
    }
    expect: {
        console.log(function() {
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
    expect_warnings: [
        "INFO: Dropping unused default argument {} [test/compress/default-values.js:1,29]",
    ]
    node_version: ">=6"
}

issue_5246_2: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function f(a = "FAIL", [] = 42) {
            console.log(a);
        })("PASS", []);
    }
    expect: {
        (function(a = "FAIL") {
            console.log(a);
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5246_3: {
    options = {
        default_values: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function f([ , {} ] = null){}([ , {} ]));
    }
    expect: {
        console.log(function([ {} ]){}([ {} ]));
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_5256: {
    options = {
        inline: true,
    }
    input: {
        (function(arguments = console.log) {
            console;
        })();
        console.log(typeof arguments);
    }
    expect: {
        // Syntax error on Node.js v6
        (function(arguments = console.log) {
            console;
        })();
        console.log(typeof arguments);
    }
    expect_stdout: "undefined"
    node_version: ">=8"
}

issue_5314_1: {
    options = {
        side_effects: true,
    }
    input: {
        A = this;
        new function() {
            (function(a = console.log(this === A ? "PASS" : "FAIL")) {})();
        }();
    }
    expect: {
        A = this;
        (function() {
            (function(a = console.log(this === A ? "PASS" : "FAIL")) {})();
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
            ((a = console.log(this === A ? "FAIL" : "PASS")) => {})();
        }();
    }
    expect: {
        A = this;
        new function() {
            console.log(this === A ? "FAIL" : "PASS");
        }();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5336: {
    options = {
        default_values: true,
        unused: true,
    }
    input: {
        var a;
        do {
            (function f(b = console.log("PASS")) {
                a = f;
            })(42);
        } while (a());
    }
    expect: {
        var a;
        do {
            (function f(b = console.log("PASS")) {
                a = f;
            })(42);
        } while (a());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5340_1: {
    options = {
        keep_fargs: true,
        pure_getters: "strict",
        unused: true,
    }
    input: {
        var a;
        (function(b = 42) {})(({ p: a } = true).q);
        console.log(a);
    }
    expect: {
        var a;
        (function(b = 0) {})(({ p: a } = true).q);
        console.log(a);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_5340_2: {
    options = {
        keep_fargs: true,
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        var a;
        (function(b = 42) {})(({ p: a } = true).q);
        console.log(a);
    }
    expect: {
        var a;
        [ [][0] = 0 ] = [ ({ p: a } = true).q ];
        console.log(a);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_5340_3: {
    options = {
        keep_fargs: false,
        pure_getters: "strict",
        unused: true,
    }
    input: {
        var a;
        (function(b = 42) {})(({ p: a } = true).q);
        console.log(a);
    }
    expect: {
        var a;
        (function() {})(a = true["p"]);
        console.log(a);
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_5407: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        (function(a) {
            for (var i = 0; i < 2; i++)
                (function(b = 4) {
                    console.log(b);
                    a = 2;
                })(a);
        })();
    }
    expect: {
        (function(a) {
            for (var i = 0; i < 2; i++)
                (function(b = 4) {
                    console.log(b);
                    a = 2;
                })(a);
        })();
    }
    expect_stdout: [
        "4",
        "2",
    ]
    node_version: ">=6"
}

issue_5444_1: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = 42;
        var b = function({} = setImmediate(function() {
            console.log(a++);
        })) {
            return this;
        }();
        console.log(typeof b);
    }
    expect: {
        var a = 42;
        var b = function({} = setImmediate(function() {
            console.log(a++);
        })) {
            return this;
        }();
        console.log(typeof b);
    }
    expect_stdout: [
        "object",
        "42",
    ]
    node_version: ">=6"
}

issue_5444_2: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a, b = a++) {
            return b;
        }
        console.log(f("FAIL") || "PASS");
    }
    expect: {
        function f(a, b = a++) {
            return b;
        }
        console.log(f("FAIL") || "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5444_3: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a, b = function(c = a *= this) {
            return c;
        }()) {
            return b;
        }
        console.log(f("FAIL") || "PASS");
    }
    expect: {
        function f(a, b = function(c = a *= this) {
            return c;
        }()) {
            return b;
        }
        console.log(f("FAIL") || "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5448_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a = typeof console.log) {
            do {
                var b = [ ...a ];
            } while (console.log("PASS"));
        })();
    }
    expect: {
        (function(a = console.log) {
            do {} while (console.log("PASS"));
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5448_2: {
    options = {
        keep_fargs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a = typeof console) {
            do {
                var b = [ ...a ];
            } while (console.log("PASS"));
        })();
    }
    expect: {
        (function(a = 0) {
            do {} while (console.log("PASS"));
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5448_3: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var [ a = typeof console ] = [ void console.log("PASS") ];
        var b = [ ...a ];
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5448_4: {
    options = {
        evaluate: true,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var { p: a = typeof console } = { p: void console.log("PASS") };
        var b = [ ...a ];
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5463: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        if (console.log("PASS"))
            var a = void 0,
                b = void 0,
                b = ([ a = FAIL ] = b && b);
    }
    expect: {
        var a, b, b;
        console.log("PASS") && (
            b = a = void 0,
            b = [a = FAIL] = a
        );
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5465: {
    options = {
        inline: true,
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            (function(c = b = "FAIL 2") {
                this && console.log(b || "PASS");
            })(42 - a && a);
        }
        f("FAIL 1");
    }
    expect: {
        a = "FAIL 1",
        void function(c = b = "FAIL 2") {
            this && console.log(b || "PASS");
        }(42 - a && a);
        var a, b;
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5485: {
    options = {
        comparisons: true,
    }
    input: {
        (function f(f, a = console.log(void 0 === f ? "PASS" : "FAIL")) {})();
    }
    expect: {
        (function f(f, a = console.log(void 0 === f ? "PASS" : "FAIL")) {})();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5533_1_keep_fargs: {
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
                        (function f(b = 42) {
                            b;
                            throw "PASS";
                        })();
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

issue_5533_1_drop_fargs: {
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
                        (function f(b = 42) {
                            b;
                            throw "PASS";
                        })();
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

issue_5533_2_keep_fargs: {
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
                        (function f([ b ] = []) {
                            b;
                            throw "PASS";
                        })();
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
                for (;;) {
                    var [ [] = [] ] = [];
                    throw "PASS";
                }
            })();
        } catch (e) {
            console.log(e);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5533_2_drop_fargs: {
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
                        (function f([ b ] = []) {
                            b;
                            throw "PASS";
                        })();
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
                for (;;) {
                    var [ [ , ] = [] ] = [];
                    throw "PASS";
                }
            })();
        } catch (e) {
            console.log(e);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5533_3_keep_fargs: {
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
                        (function f(b = 42, c = null) {
                            c;
                            throw "PASS";
                        })();
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

issue_5533_3_drop_fargs: {
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
                        (function f(b = 42, c = null) {
                            c;
                            throw "PASS";
                        })();
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

issue_5533_4_keep_fargs: {
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
                        (function f(b = 42, [ c ] = []) {
                            c;
                            throw "PASS";
                        })();
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
                for (;;) {
                    var [ [] = [] ] = [];
                    throw "PASS";
                }
            })();
        } catch (e) {
            console.log(e);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5533_4_drop_fargs: {
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
                        (function f(b = 42, [ c ] = []) {
                            c;
                            throw "PASS";
                        })();
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
                for (;;) {
                    var [ [] = [] ] = [];
                    throw "PASS";
                }
            })();
        } catch (e) {
            console.log(e);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5536: {
    options = {
        inline: true,
        keep_fargs: true,
        unused: true,
    }
    input: {
        (function*() {
            (([], a = 42) => {})([]);
            console.log(typeof a);
        })().next();
    }
    expect: {
        (function*() {
            [ , [][0] = 0 ] = [ [] ],
            void 0;
            console.log(typeof a);
        })().next();
    }
    expect_stdout: "undefined"
    node_version: ">=6"
}

issue_5566_1: {
    options = {
        unused: true,
    }
    input: {
        (function(a, f = function() {
            return a;
        }) {
            var a = "foo";
            console.log(a, f());
        })("bar");
    }
    expect: {
        (function(a, f = function() {
            return a;
        }) {
            var a = "foo";
            console.log(a, f());
        })("bar");
    }
    expect_stdout: "foo bar"
    node_version: ">=6"
}

issue_5566_2: {
    options = {
        inline: true,
        reduce_vars: true,
    }
    input: {
        (function(a, f = function() {
            return a;
        }) {
            function a() {}
            console.log(typeof a, typeof f());
        })(42);
    }
    expect: {
        (function(a, f = function() {
            return a;
        }) {
            function a() {}
            console.log(typeof a, typeof f());
        })(42);
    }
    expect_stdout: "function number"
    node_version: ">=6"
}

issue_5566_3: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a, f = function() {
            return a;
        }) {
            function a() {}
            console.log(typeof a, typeof f());
        })(42);
    }
    expect: {
        (function(a, f = function() {
            return a;
        }) {
            function a() {}
            console.log(typeof a, typeof f());
        })(42);
    }
    expect_stdout: "function number"
    node_version: ">=6"
}

issue_5566_4: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        (function(a, b = function() {
            return a;
        }) {
            var a = 0;
            b()("PASS");
        })(console.log);
    }
    expect: {
        (function(a, b = function() {
            return a;
        }) {
            var a = 0;
            b()("PASS");
        })(console.log);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5566_5: {
    options = {
        hoist_vars: true,
    }
    input: {
        (function(a, f = function() {
            return a;
        }) {
            var a = "foo";
            var b;
            console.log(a, f());
        })("bar");
    }
    expect: {
        (function(a, f = function() {
            return a;
        }) {
            var a, b;
            a = "foo";
            console.log(a, f());
        })("bar");
    }
    expect_stdout: "foo bar"
    node_version: ">=6"
}

issue_5651: {
    options = {
        ie: true,
        unused: true,
    }
    input: {
        console.log(function arguments(a = "FAIL") {
            try {} catch (arguments) {
                var arguments;
            }
            return arguments[0];
        }());
    }
    expect: {
        console.log(function arguments(a = "FAIL") {
            try {} catch (arguments) {
                var arguments;
            }
            return arguments[0];
        }());
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_5774: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        join_vars: true,
        reduce_vars: true,
        sequences: true,
        unsafe: true,
    }
    input: {
        (function() {
            while (console.log("PASS")) {
                if (console) {
                    a = void 0;
                    var b = void 0;
                    var c = void 0;
                    ([ a = 0 ] = [ b, b ]);
                    var a;
                }
            }
        })();
    }
    expect: {
        (function() {
            while (console.log("PASS")) {
                var a, b, c, a;
                console && (
                    c = b = a = void 0,
                    [ a = 0 ] = [ a, a ]
                );
            }
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}
