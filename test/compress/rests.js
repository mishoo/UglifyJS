arrow_1: {
    input: {
        console.log.apply(console, ((...a) => a)("PASS", 42));
    }
    expect_exact: 'console.log.apply(console,((...a)=>a)("PASS",42));'
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

arrow_2: {
    input: {
        console.log.apply(console, ((a, ...b) => b)("FAIL", "PASS", 42));
    }
    expect_exact: 'console.log.apply(console,((a,...b)=>b)("FAIL","PASS",42));'
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

arrow_destructured_array_1: {
    input: {
        console.log.apply(console, (([ ...a ]) => a)("PASS"));
    }
    expect_exact: 'console.log.apply(console,(([...a])=>a)("PASS"));'
    expect_stdout: "P A S S"
    node_version: ">=6"
}

arrow_destructured_array_2: {
    input: {
        console.log.apply(console, (([ a, ...b ]) => b)([ "FAIL", "PASS", 42 ]));
    }
    expect_exact: 'console.log.apply(console,(([a,...b])=>b)(["FAIL","PASS",42]));'
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

arrow_destructured_array_3: {
    input: {
        console.log((([ [ ...a ] = "FAIL" ]) => a)([ "PASS" ]).join("|"));
    }
    expect_exact: 'console.log((([[...a]="FAIL"])=>a)(["PASS"]).join("|"));'
    expect_stdout: "P|A|S|S"
    node_version: ">=6"
}

arrow_destructured_object_1: {
    input: {
        var f = ({ ...a }) => a, o = f({ PASS: 42 });
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_exact: "var f=({...a})=>a,o=f({PASS:42});for(var k in o)console.log(k,o[k]);"
    expect_stdout: "PASS 42"
    node_version: ">=8.3.0"
}

arrow_destructured_object_2: {
    input: {
        var f = ({ FAIL: a, ...b }) => b, o = f({ PASS: 42, FAIL: null });
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_exact: "var f=({FAIL:a,...b})=>b,o=f({PASS:42,FAIL:null});for(var k in o)console.log(k,o[k]);"
    expect_stdout: "PASS 42"
    node_version: ">=8.3.0"
}

arrow_destructured_object_3: {
    input: {
        var f = ([ { ...a } = [ "FAIL" ] ]) => a;
        var o = f([ "PASS" ]);
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_exact: 'var f=([{...a}=["FAIL"]])=>a;var o=f(["PASS"]);for(var k in o)console.log(k,o[k]);'
    expect_stdout: [
        "0 P",
        "1 A",
        "2 S",
        "3 S",
    ]
    node_version: ">=8.3.0"
}

funarg_1: {
    input: {
        console.log.apply(console, function(...a) {
            return a;
        }("PASS", 42));
    }
    expect_exact: 'console.log.apply(console,function(...a){return a}("PASS",42));'
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

funarg_2: {
    input: {
        console.log.apply(console, function(a, ...b) {
            return b;
        }("FAIL", "PASS", 42));
    }
    expect_exact: 'console.log.apply(console,function(a,...b){return b}("FAIL","PASS",42));'
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

destructured_array_1: {
    input: {
        var [ ...a ] = [ "PASS", 42 ];
        console.log.apply(console, a);
    }
    expect_exact: 'var[...a]=["PASS",42];console.log.apply(console,a);'
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

destructured_array_2: {
    input: {
        var [ a, ...b ] = [ "FAIL", "PASS", 42 ];
        console.log.apply(console, b);
    }
    expect_exact: 'var[a,...b]=["FAIL","PASS",42];console.log.apply(console,b);'
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

destructured_object_1: {
    input: {
        var { ...a } = [ "FAIL", "PASS", 42 ];
        console.log(a[1], a[2]);
    }
    expect_exact: 'var{...a}=["FAIL","PASS",42];console.log(a[1],a[2]);'
    expect_stdout: "PASS 42"
    node_version: ">=8.3.0"
}

destructured_object_2: {
    input: {
        var { 0: a, ...b } = [ "FAIL", "PASS", 42 ];
        console.log(b[1], b[2]);
    }
    expect_exact: 'var{0:a,...b}=["FAIL","PASS",42];console.log(b[1],b[2]);'
    expect_stdout: "PASS 42"
    node_version: ">=8.3.0"
}

drop_fargs: {
    options = {
        keep_fargs: false,
        rests: true,
        unused: true,
    }
    input: {
        console.log(function(a, ...b) {
            return b[0];
        }("FAIL", "PASS"));
    }
    expect: {
        console.log(function(b) {
            return b[0];
        }([ "PASS" ]));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

inline: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        console.log(function(a, ...[ b, c ]) {
            return c + b + a;
        }("SS", "A", "P"));
    }
    expect: {
        console.log(([ a, ...[ b, c ] ] = [ "SS", "A", "P" ], c + b + a));
        var a, b, c;
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

retain_var: {
    options = {
        unused: true,
    }
    input: {
        var [ ...a ] = [ "PASS" ];
        console.log(a[0]);
    }
    expect: {
        var [ ...a ] = [ "PASS" ];
        console.log(a[0]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

reduce_destructured_array: {
    options = {
        reduce_vars: true,
        rests: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var [ ...a ] = [ "PASS" ];
        console.log(a[0]);
    }
    expect: {
        console.log([ "PASS" ][0]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

reduce_destructured_object: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var { ...a } = [ "PASS" ];
        console.log(a[0]);
    }
    expect: {
        var { ...a } = [ "PASS" ];
        console.log(a[0]);
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

retain_destructured_array: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var [ a, ...b ] = [ "FAIL", "PASS", 42 ];
        console.log.apply(console, b);
    }
    expect: {
        var [ ...b ] = [ "PASS", 42 ];
        console.log.apply(console, b);
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

retain_destructured_object_1: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var { 0: a, ...b } = [ "FAIL", "PASS", 42 ];
        for (var k in b)
            console.log(k, b[k]);
    }
    expect: {
        var { 0: a, ...b } = [ "FAIL", "PASS", 42 ];
        for (var k in b)
            console.log(k, b[k]);
    }
    expect_stdout: [
        "1 PASS",
        "2 42",
    ]
    node_version: ">=8.3.0"
}

retain_destructured_object_2: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var { foo: [ a ], ...b } = { foo: [ "FAIL" ], bar: "PASS", baz: 42 };
        for (var k in b)
            console.log(k, b[k]);
    }
    expect: {
        var { foo: {}, ...b } = { foo: 0, bar: "PASS", baz: 42 };
        for (var k in b)
            console.log(k, b[k]);
    }
    expect_stdout: [
        "bar PASS",
        "baz 42",
    ]
    node_version: ">=8.3.0"
}

retain_funarg_destructured_array_1: {
    options = {
        inline: true,
        keep_fargs: false,
        pure_getters: "strict",
        unused: true,
    }
    input: {
        console.log((([ ...a ]) => a)([ "PASS" ])[0]);
    }
    expect: {
        console.log((([ ...a ]) => a)([ "PASS" ])[0]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

retain_funarg_destructured_array_2: {
    options = {
        unused: true,
    }
    input: {
        console.log(function([ a, ...b ]) {
            return b;
        }("bar")[1]);
    }
    expect: {
        console.log(function([ , ...b ]) {
            return b;
        }("bar")[1]);
    }
    expect_stdout: "r"
    node_version: ">=6"
}

retain_funarg_destructured_object_1: {
    options = {
        inline: true,
        keep_fargs: false,
        pure_getters: "strict",
        unused: true,
    }
    input: {
        console.log((({ ...a }) => a)([ "PASS" ])[0]);
    }
    expect: {
        console.log((({ ...a }) => a)([ "PASS" ])[0]);
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

retain_funarg_destructured_object_2: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        console.log(function({ p: a, ... b }) {
            return b;
        }({ p: "FAIL" }).p || "PASS");
    }
    expect: {
        console.log(function({ p: a, ... b }) {
            return b;
        }({}).p || "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

drop_unused_call_args_1: {
    options = {
        rests: true,
        unused: true,
    }
    input: {
        (function(...a) {
            console.log(a[0]);
        })(42, console.log("PASS"));
    }
    expect: {
        (function(a) {
            console.log(a[0]);
        })([ 42, console.log("PASS") ]);
    }
    expect_stdout: [
        "PASS",
        "42",
    ]
    node_version: ">=6"
}

drop_unused_call_args_2: {
    options = {
        keep_fargs: false,
        rests: true,
        unused: true,
    }
    input: {
        console.log(function(a, ...b) {
            return b;
        }(console).length);
    }
    expect: {
        console.log(function(b) {
            return b;
        }((console, [])).length);
    }
    expect_stdout: "0"
    node_version: ">=6"
}

maintain_position: {
    options = {
        unused: true,
    }
    input: {
        A = "FAIL";
        var [ , ...a ] = [ A, "PASS" ];
        console.log(a[0]);
    }
    expect: {
        A = "FAIL";
        var [ , ...a ] = [ A, "PASS" ];
        console.log(a[0]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

merge_funarg: {
    options = {
        merge_vars: true,
    }
    input: {
        (function(...a) {
            var b = a.length;
            console.log(b);
        })();
    }
    expect: {
        (function(...a) {
            var a = a.length;
            console.log(a);
        })();
    }
    expect_stdout: "0"
    node_version: ">=6"
}

merge_funarg_destructured_array: {
    options = {
        merge_vars: true,
    }
    input: {
        (function([ ...a ]) {
            var b = a.length;
            console.log(b);
        })([]);
    }
    expect: {
        (function([ ...a ]) {
            var a = a.length;
            console.log(a);
        })([]);
    }
    expect_stdout: "0"
    node_version: ">=6"
}

merge_funarg_destructured_object: {
    options = {
        merge_vars: true,
    }
    input: {
        (function({ ...a }) {
            var b = a[0];
            console.log(b);
        })([ "PASS" ]);
    }
    expect: {
        (function({ ...a }) {
            var a = a[0];
            console.log(a);
        })([ "PASS" ]);
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

keep_arguments: {
    options = {
        arguments: true,
        keep_fargs: false,
    }
    input: {
        (function(...[ {} ]) {
            console.log(arguments[0]);
        })("PASS");
    }
    expect: {
        (function(...[ {} ]) {
            console.log(arguments[0]);
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_rest_array: {
    options = {
        rests: true,
    }
    input: {
        var [ ...[ a ] ] = [ "PASS" ];
        console.log(a);
    }
    expect: {
        var [ a ] = [ "PASS" ];
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_rest_arrow: {
    options = {
        arrows: true,
        keep_fargs: false,
        reduce_vars: true,
        rests: true,
    }
    input: {
        console.log(((...[ a ]) => a)("PASS"));
    }
    expect: {
        console.log((a => a)("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

drop_rest_lambda: {
    options = {
        keep_fargs: false,
        reduce_vars: true,
        rests: true,
        toplevel: true,
    }
    input: {
        function f(...[ a ]) {
            return a;
        }
        console.log(f("PASS"), f(42));
    }
    expect: {
        function f(a) {
            return a;
        }
        console.log(f("PASS"), f(42));
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

keep_rest_array: {
    options = {
        rests: true,
    }
    input: {
        var [ ...[ ...a ] ] = "PASS";
        console.log(a.join(""));
    }
    expect: {
        var [ ...a ] = "PASS";
        console.log(a.join(""));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

keep_rest_arrow: {
    options = {
        arrows: true,
        keep_fargs: false,
        reduce_vars: true,
        rests: true,
    }
    input: {
        console.log(((...[ ...a ]) => a.join(""))("PASS"));
    }
    expect: {
        console.log(((...a) => a.join(""))("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

keep_rest_lambda_1: {
    options = {
        keep_fargs: false,
        reduce_vars: true,
        rests: true,
        toplevel: true,
    }
    input: {
        function f(...[ ...a ]) {
            return a.join("");
        }
        console.log(f("PASS"), f([ 42 ]));
    }
    expect: {
        function f(...a) {
            return a.join("");
        }
        console.log(f("PASS"), f([ 42 ]));
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

keep_rest_lambda_2: {
    options = {
        unused: true,
    }
    input: {
        function f(...[ ...a ]) {
            return a.join("");
        }
        console.log(f("PASS"), f([ 42 ]));
    }
    expect: {
        function f(...[ ...a ]) {
            return a.join("");
        }
        console.log(f("PASS"), f([ 42 ]));
    }
    expect_stdout: "PASS 42"
    node_version: ">=6"
}

drop_new_function: {
    options = {
        side_effects: true,
    }
    input: {
        new function(...{
            [console.log("PASS")]: a,
        }) {}();
    }
    expect: {
        void ([ ... {
            [console.log("PASS")]: [][0],
        }] = []);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4525_1: {
    options = {
        arguments: true,
    }
    input: {
        console.log(function(a, ...[]) {
            a = "FAIL";
            return arguments[0];
        }("PASS"));
    }
    expect: {
        console.log(function(a, ...[]) {
            a = "FAIL";
            return arguments[0];
        }("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4525_2: {
    options = {
        unused: true,
    }
    input: {
        console.log(function(a, ...[]) {
            a = "FAIL";
            return arguments[0];
        }("PASS"));
    }
    expect: {
        console.log(function(a, ...[]) {
            a = "FAIL";
            return arguments[0];
        }("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4538: {
    options = {
        rests: true,
        unused: true,
    }
    input: {
        console.log(typeof function f(...a) {
            return a.p, f;
        }()());
    }
    expect: {
        console.log(typeof function f(...a) {
            return a.p, f;
        }()());
    }
    expect_stdout: "function"
    node_version: ">=6"
}

issue_4544_1: {
    options = {
        keep_fnames: true,
        side_effects: true,
    }
    input: {
        try {
            (function f(...[ {} ]) {})();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            [ ...[ {} ] ] = [];
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4544_2: {
    options = {
        keep_fnames: true,
        side_effects: true,
    }
    input: {
        try {
            (function f(a, ...[ {} ]) {})([]);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            [ , ...[ {} ] ] = [ [] ];
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
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

issue_4562: {
    options = {
        evaluate: true,
        reduce_vars: true,
        rests: true,
        unsafe: true,
    }
    input: {
        console.log((([ ...[ a ] ]) => a)("foo"));
    }
    expect: {
        console.log((([ a ]) => a)("foo"));
    }
    expect_stdout: "f"
    node_version: ">=6"
}

issue_4575: {
    options = {
        collapse_vars: true,
        ie: true,
        reduce_vars: true,
        rests: true,
        unused: true,
    }
    input: {
        (function(a) {
            var b = a;
            var c = function a(...d) {
                console.log(d.length);
            }();
        })();
    }
    expect: {
        (function(a) {
            (function(d) {
                console.log(d.length);
            })([]);
        })();
    }
    expect_stdout: "0"
    node_version: ">=6"
}

issue_4621: {
    options = {
        side_effects: true,
    }
    input: {
        (function f(a, ...{
            [console.log(a)]: b,
        }) {})("PASS");
    }
    expect: {
        (function f(a, ...{
            [console.log(a)]: b,
        }) {})("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4644_1: {
    options = {
        evaluate: true,
    }
    input: {
        var a = "FAIL";
        (function f(b, ...{
            [a = "PASS"]: c,
        }) {
            return b;
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function f(b, ...{
            [a = "PASS"]: c,
        }) {
            return b;
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_4644_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(function(...a) {
            return a[1];
        }("FAIL", "PASS"), function(...b) {
            return b.length;
        }(), function(c, ...d) {
            return d[0];
        }("FAIL"));
    }
    expect: {
        console.log("PASS", 0, function(c, ...d) {
            return d[0];
        }("FAIL"));
    }
    expect_stdout: "PASS 0 undefined"
    node_version: ">=6"
}

issue_4666: {
    options = {
        evaluate: true,
        reduce_vars: true,
        rests: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var a = 0, b = 0;
        var o = ((...c) => a++ + c)(b);
        for (var k in o)
            b++;
        console.log(a, b);
    }
    expect: {
        var a = 0, b = 0;
        var o = (c => +a + c)([ b ]);
        for (var k in o)
            b++;
        console.log(1, b);
    }
    expect_stdout: "1 2"
    node_version: ">=6"
}

issue_5089_1: {
    options = {
        unused: true,
    }
    input: {
        var {
            p: [] = 42,
            ...o
        } = {
            p: [],
        };
        console.log(o.p);
    }
    expect: {
        var {
            p: {},
            ...o
        } = {
            p: 0,
        };
        console.log(o.p);
    }
    expect_stdout: "undefined"
    node_version: ">=8.3.0"
}

issue_5089_2: {
    options = {
        pure_getters: "strict",
        unused: true,
    }
    input: {
        var {
            p: {} = null,
            ...o
        } = {
            p: {},
        };
        console.log(o.p);
    }
    expect: {
        var {
            p: {},
            ...o
        } = {
            p: 0,
        };
        console.log(o.p);
    }
    expect_stdout: "undefined"
    node_version: ">=8.3.0"
}

issue_5100_1: {
    options = {
        passes: 2,
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        var a;
        [ {
            p: {},
            ...a
        } ] = [ {
            p: {
                q: a,
            } = 42,
            r: "PASS",
        } ];
        console.log(a.r);
    }
    expect: {
        var a;
        ({
            p: {},
            ...a
        } = [ {
            p: {
                q: a,
            } = 42,
            r: "PASS",
        } ][0]);
        console.log(a.r);
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

issue_5100_2: {
    options = {
        passes: 2,
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        var a;
        [ {
            p: {},
            ...a
        } ] = [ {
            p: (console.log("PASS"), {
                q: a,
            } = 42),
        } ];
    }
    expect: {
        var a;
        ({
            p: {},
            ...a
        } = [ {
            p: (console.log("PASS"), {
                q: a,
            } = 42),
        } ][0]);
    }
    expect_stdout: "PASS"
    node_version: ">=10.22.0"
}

issue_5108: {
    options = {
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        rests: true,
        unsafe: true,
        unused: true,
    }
    input: {
        console.log(function([ ...[ a ] ]) {
            return a;
        }([ "PASS", "FAIL" ]));
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5128_1: {
    options = {
        inline: true,
    }
    input: {
        console.log(function() {
            return function f(...[ a ]) {
                return a;
            }("PASS");
        }());
    }
    expect: {
        console.log(function f(...[ a ]) {
            return a;
        }("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5128_2: {
    options = {
        inline: true,
        keep_fnames: true,
        unused: true,
    }
    input: {
        console.log(function() {
            return function f(...[ a ]) {
                return a;
            }("PASS");
        }());
    }
    expect: {
        console.log(function f(...[ a ]) {
            return a;
        }("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5165_1: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        reduce_vars: true,
        rests: true,
        side_effects: true,
        switches: true,
        unsafe: true,
    }
    input: {
        console.log(function([ ...a ]) {
            switch (a) {
              case a:
                return "PASS";
            }
        }([]));
    }
    expect: {
        console.log(function([ ...a ]) {
            return "PASS";
        }([]));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5165_2: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        reduce_vars: true,
        rests: true,
        side_effects: true,
        switches: true,
        unsafe: true,
    }
    input: {
        console.log(function(...a) {
            switch (a) {
              case a:
                return "PASS";
            }
        }());
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5246_1: {
    options = {
        keep_fargs: false,
        reduce_vars: true,
        rests: true,
        unused: true,
    }
    input: {
        console.log(typeof function([ , ...a ]) {
            return this && a;
        }([ , function(){} ])[0]);
    }
    expect: {
        console.log(typeof function() {
            return this && [ function(){} ];
        }()[0]);
    }
    expect_stdout: "function"
    node_version: ">=6"
}

issue_5246_2: {
    options = {
        keep_fargs: false,
        reduce_vars: true,
        rests: true,
        toplevel: true,
        unused: true,
    }
    input: {
        A = [ , "PASS", "FAIL" ];
        var  [ , ...a ] = [ ... A ];
        console.log(a[0]);
    }
    expect: {
        A = [ , "PASS", "FAIL" ];
        var  [ , ...a ] = [ ... A ];
        console.log(a[0]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5246_3: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function f(...[ [ a ] ]) {
            console.log(a);
        })([ "PASS" ]);
    }
    expect: {
        (function(...[ a ]) {
            console.log(a);
        })([ "PASS" ][0]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5360: {
    options = {
        keep_fargs: false,
        pure_getters: "strict",
        unused: true,
    }
    input: {
        var a;
        console.log(function({ p: {}, ...b }) {
            return b.q;
        }({
            p: ~a && ([ a ] = []),
            q: "PASS",
        }));
    }
    expect: {
        var a;
        console.log(function({ p: {}, ...b }) {
            return b.q;
        }({
            p: ~a && ([ a ] = []),
            q: "PASS",
        }));
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}

issue_5370: {
    options = {
        dead_code: true,
        ie: true,
        unused: true,
    }
    input: {
        console.log(function arguments(...a) {
            return arguments;
            try {} catch (e) {
                var arguments;
            }
        }());
    }
    expect: {
        console.log(function arguments(...a) {
            return arguments;
            var arguments;
        }());
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_5391: {
    options = {
        evaluate: true,
        keep_fargs: false,
        objects: true,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a, b = function f({
            p: {},
            ...c
        }) {
            while (c.q);
        }({
            p: {
                r: a++,
                r: 0,
            }
        });
        console.log(a);
    }
    expect: {
        (function({
            p: {},
            ...c
        }) {
            while (c.q);
        })({
            p: 0,
        });
        console.log(NaN);
    }
    expect_stdout: "NaN"
    node_version: ">=8.3.0"
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
                        (function f(...b) {
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
                        (function f(...b) {
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
                        (function f(...[ b ]) {
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
                        (function f(...[ b ]) {
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

issue_5552_1: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var log = console.log;
        var a = f, b = log();
        function f(...[ c = a = "PASS" ]) {}
        f((a = "FAIL", b));
        log(a);
    }
    expect: {
        var log = console.log;
        var a = f, b = log();
        function f(...[ c = a = "PASS" ]) {}
        f((a = "FAIL", b));
        log(a);
    }
    expect_stdout: [
        "",
        "PASS",
    ]
    node_version: ">=6"
}

issue_5552_2: {
    options = {
        collapse_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var log = console.log;
        var a = f;
        function f(...{ [a = "PASS"]: b }) {}
        f((a = "FAIL", 42));
        log(a);
    }
    expect: {
        var log = console.log;
        var a = f;
        function f(...{ [a = "PASS"]: b }) {}
        f((a = "FAIL", 42));
        log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5552_3: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = [ "FAIL", "PASS" ];
        console.log(function(b, ...[ c = a.pop() ]) {
            return b;
        }(a.pop()));
    }
    expect: {
        var a = [ "FAIL", "PASS" ];
        console.log(function(b, ...[ c = a.pop() ]) {
            return b;
        }(a.pop()));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5552_4: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        var a = [ "FAIL", "PASS" ];
        console.log(function(b, ...{ [a.pop()]: c }) {
            return b;
        }(a.pop()));
    }
    expect: {
        var a = [ "FAIL", "PASS" ];
        console.log(function(b, ...{ [a.pop()]: c }) {
            return b;
        }(a.pop()));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5705: {
    options = {
        reduce_vars: true,
        rests: true,
        unused: true,
    }
    input: {
        (function(...a) {
            var b = { ...a };
        })(console.log("PASS"));
    }
    expect: {
        (function() {})(console.log("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=8.3.0"
}
