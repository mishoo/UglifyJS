await_await: {
    input: {
        (async function() {
            console.log("PASS");
            await await 42;
        })();
    }
    expect: {
        (async function() {
            console.log("PASS");
            await await 42;
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

defun_name: {
    input: {
        async function await() {
            console.log("PASS");
        }
        await();
    }
    expect: {
        async function await() {
            console.log("PASS");
        }
        await();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

nested_await: {
    input: {
        (async function() {
            console.log(function(await) {
                return await;
            }("PASS"));
        })();
    }
    expect: {
        (async function() {
            console.log(function(await) {
                return await;
            }("PASS"));
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

reduce_single_use_defun: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        async function f(a) {
            console.log(a);
        }
        f("PASS");
    }
    expect: {
        (async function(a) {
            console.log(a);
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

dont_inline: {
    options = {
        inline: true,
    }
    input: {
        (async function() {
            A;
        })().catch(function() {});
        console.log("PASS");
    }
    expect: {
        (async function() {
            A;
        })().catch(function() {});
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

evaluate: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = async function() {}();
        console.log(typeof a);
    }
    expect: {
        var a = async function() {}();
        console.log(typeof a);
    }
    expect_stdout: "object"
    node_version: ">=8"
}

negate: {
    options = {
        side_effects: true,
    }
    input: {
        console && async function() {} && console.log("PASS");
    }
    expect: {
        console && async function() {} && console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

negate_iife: {
    options = {
        negate_iife: true,
    }
    input: {
        (async function() {
            console.log("PASS");
        })();
    }
    expect: {
        !async function() {
            console.log("PASS");
        }();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

collapse_vars_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (async function() {
            a = "PASS";
            await 42;
            return "PASS";
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (async function() {
            a = "PASS";
            await 42;
            return "PASS";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

collapse_vars_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (async function() {
            await (a = "PASS");
            return "PASS";
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (async function() {
            await (a = "PASS");
            return "PASS";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

collapse_vars_3: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        (async function() {
            await (a = "PASS", 42);
            return "PASS";
        })();
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (async function() {
            await (a = "PASS", 42);
            return "PASS";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4335_1: {
    options = {
        inline: true,
    }
    input: {
        var await = "PASS";
        (async function() {
            console.log(function() {
                return await;
            }());
        })();
    }
    expect: {
        var await = "PASS";
        (async function() {
            console.log(function() {
                return await;
            }());
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4335_2: {
    options = {
        inline: true,
    }
    input: {
        (async function() {
            console.log(function() {
                function await() {}
                return "PASS";
            }());
        })();
    }
    expect: {
        (async function() {
            console.log(function() {
                function await() {}
                return "PASS";
            }());
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4337: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            a();
        })(async function() {
            console.log("PASS");
        });
    }
    expect: {
        (function(a) {
            (async function() {
                console.log("PASS");
            })();
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4340: {
    options = {
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        (async function a(a) {
            console.log(a || "PASS");
        })();
    }
    expect: {
        (async function a(a) {
            console.log(a || "PASS");
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

call_expression: {
    input: {
        console.log(typeof async function(log) {
            (await log)("FAIL");
        }(console.log).then);
    }
    expect_exact: 'console.log(typeof async function(log){(await log)("FAIL")}(console.log).then);'
    expect_stdout: "function"
    node_version: ">=8"
}

property_access_expression: {
    input: {
        console.log(typeof async function(con) {
            (await con).log("FAIL");
        }(console).then);
    }
    expect_exact: 'console.log(typeof async function(con){(await con).log("FAIL")}(console).then);'
    expect_stdout: "function"
    node_version: ">=8"
}

issue_4347_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "foo";
        f();
        a = "bar";
        f();
        async function f() {
            console.log(a);
        }
    }
    expect: {
        var a = "foo";
        f();
        a = "bar";
        f();
        async function f() {
            console.log(a);
        }
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=8"
}

issue_4347_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (async function() {
            throw 42;
            a = "FAIL";
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (async function() {
            throw 42;
            a = "FAIL";
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}
