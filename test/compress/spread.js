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
        properties: true,
        inline: true,
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
        properties: true,
        side_effects: true,
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
        properties: true,
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
        keep_fargs: "strict",
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

drop_object: {
    options = {
        side_effects: true,
    }
    input: {
        ({ ...console.log("PASS") });
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

keep_getter: {
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

keep_accessor: {
    options = {
        properties: true,
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
