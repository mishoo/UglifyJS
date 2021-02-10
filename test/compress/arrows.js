no_funarg: {
    input: {
        (() => console.log(42))();
    }
    expect_exact: "(()=>console.log(42))();"
    expect_stdout: "42"
    node_version: ">=4"
}

single_funarg: {
    input: {
        (a => console.log(a))(42);
    }
    expect_exact: "(a=>console.log(a))(42);"
    expect_stdout: "42"
    node_version: ">=4"
}

multiple_funargs: {
    input: {
        ((a, b) => console.log(a, b))("foo", "bar");
    }
    expect_exact: '((a,b)=>console.log(a,b))("foo","bar");'
    expect_stdout: "foo bar"
    node_version: ">=4"
}

destructured_funarg: {
    input: {
        (([ a, b, c ]) => console.log(a, b, c))("foo");
    }
    expect_exact: '(([a,b,c])=>console.log(a,b,c))("foo");'
    expect_stdout: "f o o"
    node_version: ">=6"
}

await_parenthesis: {
    input: {
        async function f() {
            await (a => a);
        }
    }
    expect_exact: "async function f(){await(a=>a)}"
}

for_parenthesis_init: {
    input: {
        for (a => (a in a); console.log(42););
    }
    expect_exact: "for((a=>a in a);console.log(42););"
    expect_stdout: "42"
    node_version: ">=4"
}

for_parenthesis_condition: {
    input: {
        for (console.log(42); a => (a in a);)
            break;
    }
    expect_exact: "for(console.log(42);a=>a in a;)break;"
    expect_stdout: "42"
    node_version: ">=4"
}

for_parenthesis_step: {
    input: {
        for (; console.log(42); a => (a in a));
    }
    expect_exact: "for(;console.log(42);a=>a in a);"
    expect_stdout: "42"
    node_version: ">=4"
}

for_assign_parenthesis_init: {
    input: {
        for (f = a => (a in a); console.log(42););
    }
    expect_exact: "for((f=a=>a in a);console.log(42););"
    expect_stdout: "42"
    node_version: ">=4"
}

for_assign_parenthesis_condition: {
    input: {
        for (console.log(42); f = a => (a in a);)
            break;
    }
    expect_exact: "for(console.log(42);f=a=>a in a;)break;"
    expect_stdout: "42"
    node_version: ">=4"
}

for_assign_parenthesis_step: {
    input: {
        for (; console.log(42); f = a => (a in a));
    }
    expect_exact: "for(;console.log(42);f=a=>a in a);"
    expect_stdout: "42"
    node_version: ">=4"
}

for_declaration_parenthesis_init: {
    input: {
        for (var f = a => (a in a); console.log(42););
    }
    expect_exact: "for(var f=(a=>a in a);console.log(42););"
    expect_stdout: "42"
    node_version: ">=4"
}

for_statement_parenthesis_init: {
    input: {
        for (a => {
            a in a;
        }; console.log(42););
    }
    expect_exact: "for(a=>{a in a};console.log(42););"
    expect_stdout: "42"
    node_version: ">=4"
}

body_call: {
    input: {
        (() => {
            console.log("foo");
            console.log("bar");
        })();
    }
    expect_exact: '(()=>{console.log("foo");console.log("bar")})();'
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

body_conditional: {
    input: {
        console.log((a => {}) ? "PASS" : "FAIL");
    }
    expect_exact: 'console.log((a=>{})?"PASS":"FAIL");'
    expect_stdout: "PASS"
    node_version: ">=4"
}

destructured_object_value: {
    input: {
        console.log((a => ({} = a))(42));
    }
    expect_exact: "console.log((a=>({}=a))(42));"
    expect_stdout: "42"
    node_version: ">=6"
}

function_value: {
    input: {
        console.log((a => function() {
            return a;
        })(42)());
    }
    expect_exact: "console.log((a=>function(){return a})(42)());"
    expect_stdout: "42"
    node_version: ">=4"
}

in_value: {
    input: {
        console.log((a => a in {
            foo: 42,
        })("foo"));
    }
    expect_exact: 'console.log((a=>a in{foo:42})("foo"));'
    expect_stdout: "true"
    node_version: ">=4"
}

object_value: {
    input: {
        console.log((() => ({
            4: 2,
        }))()[4]);
    }
    expect_exact: "console.log((()=>({4:2}))()[4]);"
    expect_stdout: "2"
    node_version: ">=4"
}

object_first_in_value: {
    input: {
        console.log((a => ({
            p: a,
        }.p ? "FAIL" : "PASS"))());
    }
    expect_exact: 'console.log((a=>({p:a}).p?"FAIL":"PASS")());'
    expect_stdout: "PASS"
    node_version: ">=4"
}

sequence_value: {
    input: {
        console.log((a => (console.log("foo"), a))("bar"));
    }
    expect_exact: 'console.log((a=>(console.log("foo"),a))("bar"));'
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

side_effects_value: {
    options = {
        side_effects: true,
    }
    input: {
        console.log((a => function() {
            return a;
        })(42)());
    }
    expect: {
        console.log((a => function() {
            return a;
        })(42)());
    }
    expect_stdout: "42"
    node_version: ">=4"
}

arrow_property: {
    input: {
        console.log((a => 42).prototype);
    }
    expect_exact: "console.log((a=>42).prototype);"
    expect_stdout: "undefined"
    node_version: ">=4"
}

assign_arrow: {
    input: {
        var f = a => a;
        console.log(f(42));
    }
    expect_exact: "var f=a=>a;console.log(f(42));"
    expect_stdout: "42"
    node_version: ">=4"
}

binary_arrow: {
    input: {
        console.log(4 || (() => 2));
    }
    expect_exact: "console.log(4||(()=>2));"
    expect_stdout: "4"
    node_version: ">=4"
}

unary_arrow: {
    input: {
        console.log(+(() => 42));
    }
    expect_exact: "console.log(+(()=>42));"
    expect_stdout: "NaN"
    node_version: ">=4"
}

trailing_comma: {
    input: {
        ((a,) => console.log(a))(42);
    }
    expect_exact: "(a=>console.log(a))(42);"
    expect_stdout: "42"
    node_version: ">=4"
}

drop_arguments: {
    options = {
        arguments: true,
        keep_fargs: false,
    }
    input: {
        console.log(function() {
            return () => arguments[0];
        }("PASS")("FAIL"));
    }
    expect: {
        console.log(function(argument_0) {
            return () => argument_0;
        }("PASS")("FAIL"));
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

funarg_arguments: {
    options = {
        inline: true,
    }
    input: {
        console.log((arguments => arguments)(42));
    }
    expect: {
        console.log(42);
    }
    expect_stdout: "42"
    node_version: ">=4"
}

inline_arguments: {
    options = {
        inline: true,
    }
    input: {
        console.log(function() {
            return () => arguments[0];
        }("PASS")("FAIL"));
    }
    expect: {
        console.log(function() {
            return () => arguments[0];
        }("PASS")("FAIL"));
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

var_arguments: {
    options = {
        inline: true,
        properties: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log(function() {
            return () => {
                var arguments = [ "PASS" ];
                return arguments;
            };
        }("FAIL 1")("FAIL 2")[0]);
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

negate: {
    options = {
        conditionals: true,
    }
    input: {
        if (!console ? 0 : () => 1)
            console.log("PASS");
    }
    expect: {
        (console ? () => 1 : 0) && console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

inline_this: {
    options = {
        inline: true,
    }
    input: {
        var o = {
            p: function() {
                return function() {
                    return () => this.q;
                }();
            },
            q: "FAIL",
        };
        q = "PASS";
        console.log(o.p()());
    }
    expect: {
        var o = {
            p: function() {
                return function() {
                    return () => this.q;
                }();
            },
            q: "FAIL",
        };
        q = "PASS";
        console.log(o.p()());
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

trim_body: {
    options = {
        arrows: true,
        if_return: true,
        side_effects: true,
    }
    input: {
        var f = a => {
            return a;
        };
        var g = b => void b;
        console.log(f("PASS"), g("FAIL"));
    }
    expect: {
        var f = a => a;
        var g = b => {};
        console.log(f("PASS"), g("FAIL"));
    }
    expect_stdout: "PASS undefined"
    node_version: ">=4"
}

collapse_value: {
    options = {
        arrows: true,
        collapse_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        var a = 42;
        console.log((b => Math.floor(b))(a));
    }
    expect: {
        var a = 42;
        console.log((() => Math.floor(a))());
    }
    expect_stdout: "42"
    node_version: ">=4"
}

collapse_property_lambda: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
    }
    input: {
        console.log(function f() {
            f.g = () => 42;
            return f.g();
        }());
    }
    expect: {
        console.log(function f() {
            return (f.g = () => 42)();
        }());
    }
    expect_stdout: "42"
    node_version: ">=4"
}

drop_return: {
    options = {
        arrows: true,
        side_effects: true,
    }
    input: {
        (a => {
            while (!console);
            return console.log(a);
        })(42);
    }
    expect: {
        (a => {
            while (!console);
            console.log(a);
        })(42);
    }
    expect_stdout: "42"
    node_version: ">=4"
}

drop_value: {
    options = {
        arrows: true,
        side_effects: true,
    }
    input: {
        ((a, b) => a + b)(console.log(42));
    }
    expect: {
        ((a, b) => {})(console.log(42));
    }
    expect_stdout: "42"
    node_version: ">=4"
}

reduce_iife_1: {
    options = {
        evaluate: true,
        keep_fargs: false,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (a => console.log(a + a))(21);
    }
    expect: {
        (() => console.log(42))();
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
        var a = 21;
        (() => console.log(a + a))();
    }
    expect: {
        (() => console.log(42))();
    }
    expect_stdout: "42"
    node_version: ">=4"
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
        (() => {
            console.log(a);
            console.log(a);
        })();
        a = "bar";
    }
    expect: {
        (() => {
            console.log("foo");
            console.log("foo");
        })();
    }
    expect_stdout: [
        "foo",
        "foo",
    ]
    node_version: ">=4"
}

single_use_recursive: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            return (() => f)();
        }
        console.log(typeof f());
    }
    expect: {
        console.log(typeof function f() {
            return (() => f)();
        }());
    }
    expect_stdout: "function"
    node_version: ">=4"
}

issue_4388: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        (arguments => console.log(arguments && arguments))();
    }
    expect: {
        (arguments => console.log(arguments && arguments))();
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_4390: {
    options = {
        collapse_vars: true,
    }
    input: {
        function log() {
            console.log.apply(console, arguments);
        }
        var a = 42, b = "FAIL";
        b = "PASS";
        (c => log(b, c))(a);
        log(b);
    }
    expect: {
        function log() {
            console.log.apply(console, arguments);
        }
        var a = 42, b = "FAIL";
        b = "PASS";
        (c => log(b, c))(a);
        log(b);
    }
    expect_stdout: [
        "PASS 42",
        "PASS",
    ]
    node_version: ">=4"
}

issue_4401: {
    options = {
        merge_vars: true,
    }
    input: {
        (function() {
            var a = (b => b(a))(console.log || a);
            var c = console.log;
            c && c(typeof b);
        })();
    }
    expect: {
        (function() {
            var a = (b => b(a))(console.log || a);
            var c = console.log;
            c && c(typeof b);
        })();
    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
    node_version: ">=4"
}

issue_4448: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        var A;
        try {
            (arguments => {
                arguments[0];
            })(A);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        var A;
        try {
            (arguments => {
                arguments[0];
            })(A);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4476: {
    options = {
        arguments: true,
    }
    input: {
        (function(a, b) {
            (a => {
                console.log(arguments[0], a);
            })(b);
        })("foo", "bar");
    }
    expect: {
        (function(a, b) {
            (a => {
                console.log(arguments[0], a);
            })(b);
        })("foo", "bar");
    }
    expect_stdout: "foo bar"
    node_version: ">=4"
}
