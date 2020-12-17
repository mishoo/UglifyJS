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
