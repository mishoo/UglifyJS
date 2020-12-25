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
    expect_exact: '({a:a="PASS"}=42);console.log(a);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

object_shorthand_declaration: {
    input: {
        var { a = "PASS" } = 42;
        console.log(a);
    }
    expect_exact: 'var{a:a="PASS"}=42;console.log(a);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

object_shorthand_function: {
    input: {
        (function({ a = "PASS" }) {
            console.log(a);
        })(42);
    }
    expect_exact: '(function({a:a="PASS"}){console.log(a)})(42);'
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
            return a() ? "PASS" : "FAIL 2";
        }(function() {
            return 1;
        }));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_value_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        console.log(function(a = "PASS") {
            return a;
        }());
    }
    expect: {
        console.log(function(a) {
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_value_2: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        (function(a = console) {
            return a;
        })().log("PASS");
    }
    expect: {
        (function(a) {
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

reduce_value: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
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
        toplevel: true,
    }
    input: {
        while (function(a = [ "PASS" ]) {
            var a = function f(b) {
                console.log(a[b]);
            }(0);
        }());
    }
    expect: {
        while (a = [ "PASS" ], a = function f(b) {
            console.log(a[b]);
        }(0), void 0) ;
        var a;
    }
    expect_stdout: "PASS"
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
        "WARN: Dropping unused function argument c [test/compress/default-values.js:1,61]",
        "WARN: Side effects in default value of unused variable b [test/compress/default-values.js:1,37]",
    ]
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
        var {
            p: [] = [ console.log("FAIL") ],
        } = {
            p: [ console.log("PASS") ],
        };
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
        var [ a ] = [ "PASS" ];
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
    node_version: ">=6"
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
    node_version: ">=6"
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
    node_version: ">=6"
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
