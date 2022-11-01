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

await_parentheses: {
    input: {
        async function f() {
            await (a => a);
        }
    }
    expect_exact: "async function f(){await(a=>a)}"
}

for_parentheses_init: {
    input: {
        for (a => (a in a); console.log(42););
    }
    expect_exact: "for((a=>a in a);console.log(42););"
    expect_stdout: "42"
    node_version: ">=4"
}

for_parentheses_condition: {
    input: {
        for (console.log(42); a => (a in a);)
            break;
    }
    expect_exact: "for(console.log(42);a=>a in a;)break;"
    expect_stdout: "42"
    node_version: ">=4"
}

for_parentheses_step: {
    input: {
        for (; console.log(42); a => (a in a));
    }
    expect_exact: "for(;console.log(42);a=>a in a);"
    expect_stdout: "42"
    node_version: ">=4"
}

for_assign_parentheses_init: {
    input: {
        for (f = a => (a in a); console.log(42););
    }
    expect_exact: "for((f=a=>a in a);console.log(42););"
    expect_stdout: "42"
    node_version: ">=4"
}

for_assign_parentheses_condition: {
    input: {
        for (console.log(42); f = a => (a in a);)
            break;
    }
    expect_exact: "for(console.log(42);f=a=>a in a;)break;"
    expect_stdout: "42"
    node_version: ">=4"
}

for_assign_parentheses_step: {
    input: {
        for (; console.log(42); f = a => (a in a));
    }
    expect_exact: "for(;console.log(42);f=a=>a in a);"
    expect_stdout: "42"
    node_version: ">=4"
}

for_declaration_parentheses_init: {
    input: {
        for (var f = a => (a in a); console.log(42););
    }
    expect_exact: "for(var f=(a=>a in a);console.log(42););"
    expect_stdout: "42"
    node_version: ">=4"
}

for_statement_parentheses_init: {
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
        reduce_vars: true,
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
        var p = "PASS";
        console.log({
            p: "FAIL",
            q: (() => this.p)(),
        }.q);
    }
    expect: {
        var p = "PASS";
        console.log({
            p: "FAIL",
            q: this.p,
        }.q);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

dont_inline_this: {
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
        unsafe: true,
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
        void console.log(42);
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

reduce_lambda_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var f = () => {
            console.log(a, b);
        };
        var a = "foo", b = 42;
        f();
        b = "bar";
        f();
    }
    expect: {
        var f = () => {
            console.log("foo", b);
        };
        var b = 42;
        f();
        b = "bar";
        f();
    }
    expect_stdout: [
        "foo 42",
        "foo bar",
    ]
    node_version: ">=4"
}

reduce_lambda_2: {
    options = {
        evaluate: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function(f, a, b) {
            f = () => {
                console.log(a, b);
            };
            a = "foo", b = 42;
            f();
            b = "bar";
            f();
        })();
    }
    expect: {
        (function(f, a, b) {
            f = () => {
                console.log("foo", b);
            };
            b = 42;
            f();
            b = "bar";
            f();
        })();
    }
    expect_stdout: [
        "foo 42",
        "foo bar",
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

inline_iife_within_arrow: {
    options = {
        arrows: true,
        inline: true,
    }
    input: {
        var f = () => console.log(function(a) {
            return Math.ceil(a);
        }(Math.random()));
        f();
    }
    expect: {
        var f = () => {
            return console.log((a = Math.random(), Math.ceil(a)));
            var a;
        };
        f();
    }
    expect_stdout: "1"
    node_version: ">=4"
}

instanceof_lambda_1: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log(42 instanceof (() => {}));
    }
    expect: {
        console.log(false);
    }
    expect_stdout: "false"
    node_version: ">=4"
}

instanceof_lambda_2: {
    options = {
        evaluate: true,
        side_effects: false,
    }
    input: {
        console.log(null instanceof (() => {}));
    }
    expect: {
        console.log((null, () => {}, false));
    }
    expect_stdout: "false"
    node_version: ">=4"
}

instanceof_lambda_3: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log({} instanceof (() => {}));
    }
    expect: {
        console.log({} instanceof (() => {}));
    }
    expect_stdout: TypeError("Function has non-object prototype 'undefined' in instanceof check")
    node_version: ">=4"
}

instanceof_lambda_4: {
    options = {
        side_effects: true,
    }
    input: {
        ({ p: "foo" }) instanceof (() => {});
    }
    expect: {
        [] instanceof (() => {});
    }
    expect_stdout: TypeError("Function has non-object prototype 'undefined' in instanceof check")
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

issue_4666: {
    input: {
        console.log((a => /[0-9]/.test(a))(42));
    }
    expect_exact: "console.log((a=>/[0-9]/.test(a))(42));"
    expect_stdout: "true"
    node_version: ">=4"
}

issue_4685_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        new function(f) {
            if (f() !== this)
                console.log("PASS");
        }(() => this);
    }
    expect: {
        new function(f) {
            if (f() !== this)
                console.log("PASS");
        }(() => this);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4685_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        new function(f) {
            if (f() !== this)
                console.log("PASS");
        }(() => {
            if (console)
                return this;
        });
    }
    expect: {
        new function(f) {
            if (f() !== this)
                console.log("PASS");
        }(() => {
            if (console)
                return this;
        });
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4687_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        new function() {
            console.log(function(f) {
                return f() === this;
            }(() => this) || "PASS");
        }
    }
    expect: {
        new function() {
            console.log(function(f) {
                return f() === this;
            }(() => this) || "PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4687_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        new function() {
            console.log(function(f) {
                return f() === this;
            }(() => {
                if (console)
                    return this;
            }) || "PASS");
        }
    }
    expect: {
        new function() {
            console.log(function(f) {
                return f() === this;
            }(() => {
                if (console)
                    return this;
            }) || "PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4772: {
    input: {
        var f = a => (a)
        /**/ console.log(f("PASS"));
    }
    expect_exact: 'var f=a=>a;console.log(f("PASS"));'
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5251: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        (() => {
            while (console.log(arguments))
                var arguments = "FAIL";
        })();
    }
    expect: {
        (() => {
            while (console.log(arguments))
                var arguments = "FAIL";
        })();
    }
    expect_stdout: true
    node_version: ">=4"
}

issue_5342_1: {
    options = {
        dead_code: true,
        inline: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var a in 0) {
            (() => {
                while (1);
            })(new function(NaN) {
                a.p;
            }());
        }
        console.log(function() {
            return b;
            try {
                b;
            } catch (e) {
                var b;
            }
        }());
    }
    expect: {
        for (var a in 0) {
            (function(NaN) {
                a.p;
            })();
            while (1);
        }
        console.log(b);
        var b;
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_5342_2: {
    rename = true
    options = {
        dead_code: true,
        inline: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var a in 0) {
            (() => {
                while (1);
            })(new function(NaN) {
                a.p;
            }());
        }
        console.log(function() {
            return b;
            try {
                b;
            } catch (e) {
                var b;
            }
        }());
    }
    expect: {
        for (var a in 0) {
            a.p;
            while (1);
        }
        console.log(c);
        var c;
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_5356: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log((a => a++)(console));
    }
    expect: {
        console.log((a => +a)(console));
    }
    expect_stdout: "NaN"
    node_version: ">=4"
}

issue_5414_1: {
    options = {
        arrows: true,
        if_return: true,
        inline: true,
        toplevel: true,
    }
    input: {
        (() => {
            (() => {
                if (!console)
                    var arguments = 42;
                while (console.log(arguments));
            })();
        })();
    }
    expect: {
        (() => {
            if (!console)
                var arguments = 42;
            while (console.log(arguments));
        })();
    }
    expect_stdout: true
    node_version: ">=4"
}

issue_5414_2: {
    options = {
        arrows: true,
        inline: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (() => {
            (() => {
                if (!console)
                    var arguments = 42;
                while (console.log(arguments));
            })();
        })();
    }
    expect: {
        (() => {
            if (!console)
                var arguments = 42;
            while (console.log(arguments));
        })();
    }
    expect_stdout: true
    node_version: ">=4"
}

issue_5416_1: {
    options = {
        dead_code: true,
        evaluate: true,
        inline: true,
        loops: true,
        unused: true,
    }
    input: {
        var f = () => {
            while ((() => {
                console;
                var a = function g(arguments) {
                    console.log(arguments);
                }();
            })());
        };
        f();
    }
    expect: {
        var f = () => {
            {
                console;
                arguments = void 0,
                console.log(arguments);
                var arguments;
                return;
            }
        };
        f();
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_5416_2: {
    options = {
        dead_code: true,
        evaluate: true,
        inline: true,
        loops: true,
        unused: true,
    }
    input: {
        var f = () => {
            while ((() => {
                console;
                var a = function g(arguments) {
                    while (console.log(arguments));
                }();
            })());
        };
        f();
    }
    expect: {
        var f = () => {
            {
                console;
                var arguments = void 0;
                for (; console.log(arguments););
                return;
            }
        };
        f();
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_5416_3: {
    options = {
        inline: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var f = () => {
            (() => {
                var a = function g(arguments) {
                    console.log(arguments);
                }();
            })();
        };
        f();
    }
    expect: {
        var f = () => {
            arguments = void 0,
            console.log(arguments);
            var arguments;
        };
        f();
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_5416_4: {
    options = {
        arrows: true,
        inline: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var f = () => {
            (() => {
                var a = function g(arguments) {
                    while (console.log(arguments));
                }();
            })();
        };
        f();
    }
    expect: {
        var f = () => {
            var arguments = void 0;
            while (console.log(arguments));
            return;
        };
        f();
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_5495: {
    input: {
        console.log((() => {
            "use strict";
            return function() {
                return this;
            }();
        })());
    }
    expect_exact: 'console.log((()=>{"use strict";return function(){return this}()})());'
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_5653: {
    options = {
        arrows: true,
        hoist_props: true,
        passes: 2,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        console.log((a => {
            a = { p: console };
            return a++;
        })());
    }
    expect: {
        console.log((a => {
            return console, +{};
        })());
    }
    expect_stdout: "NaN"
    node_version: ">=4"
}
