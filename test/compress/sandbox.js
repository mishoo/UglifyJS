console_log: {
    input: {
        console.log("%% %s");
        console.log("%% %s", "%s");
    }
    expect: {
        console.log("%% %s");
        console.log("%% %s", "%s");
    }
    expect_stdout: [
        "%% %s",
        "% %s",
    ]
}

console_log_console: {
    input: {
        var log = console.log;
        log(console);
        log(typeof console.log);
    }
    expect: {
        var log = console.log;
        log(console);
        log(typeof console.log);
    }
    expect_stdout: [
        "{ log: 'function(){}' }",
        "function",
    ]
}

typeof_arguments: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var arguments;
        console.log((typeof arguments).length);
    }
    expect: {
        var arguments;
        console.log((typeof arguments).length);
    }
    expect_stdout: "6"
}

typeof_arguments_assigned: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var arguments = void 0;
        console.log((typeof arguments).length);
    }
    expect: {
        console.log("undefined".length);
    }
    expect_stdout: "9"
}

toplevel_Infinity_NaN_undefined: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var Infinity = "foo";
        var NaN = 42;
        var undefined = null;
        console.log(Infinity, NaN, undefined);
    }
    expect: {
        console.log("foo", 42, null);
    }
    expect_stdout: "foo 42 null"
}

log_global: {
    input: {
        console.log(function() {
            return this;
        }());
    }
    expect: {
        console.log(function() {
            return this;
        }());
    }
    expect_stdout: "[object global]"
}

log_nested: {
    options = {
        unused: true,
    }
    input: {
        var o = { p: 42 };
        for (var i = 0; i < 10; i++)
            o = {
                p: o,
                q: function foo() {},
            };
        console.log(o);
    }
    expect: {
        var o = { p: 42 };
        for (var i = 0; i < 10; i++)
            o = {
                p: o,
                q: function() {},
            };
        console.log(o);
    }
    expect_stdout: true
}

timers: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var count = 0, interval = 1000, duration = 3210;
        var timer = setInterval(function() {
            if (!count++) setTimeout(function() {
                clearInterval(timer);
                console.log(count <= 4 ? "PASS" : "FAIL");
            }, duration);
        }, interval);
    }
    expect: {
        var count = 0;
        var timer = setInterval(function() {
            if (!count++) setTimeout(function() {
                clearInterval(timer);
                console.log(count <= 4 ? "PASS" : "FAIL");
            }, 3210);
        }, 1000);
    }
    expect_stdout: "PASS"
    node_version: ">=0.12"
}

issue_4054: {
    input: {
        console.log({
            set p(v) {
                throw "FAIL";
            },
        });
    }
    expect: {
        console.log({
            set p(v) {
                throw "FAIL";
            },
        });
    }
    expect_stdout: "{ p: [Setter] }"
}

issue_4811_1: {
    input: {
        for (var PASS in this);
        console.log(PASS, this, {} < this);
    }
    expect: {
        for (var PASS in this);
        console.log(PASS, this, {} < this);
    }
    expect_stdout: "PASS [object global] true"
}

issue_4811_2: {
    options = {
        side_effects: true,
    }
    input: {
        (async function() {});
        for (var PASS in this);
        console.log(PASS, this, {} < this);
    }
    expect: {
        for (var PASS in this);
        console.log(PASS, this, {} < this);
    }
    expect_stdout: "PASS [object global] true"
    node_version: ">=8"
}

issue_5197: {
    rename = true
    input: {
        function f(async) {
            async(")=>{}");
        }
        console.log("" + this.__proto__);
    }
    expect: {
        function f(a) {
            a(")=>{}");
        }
        console.log("" + this.__proto__);
    }
    expect_stdout: "[object global]"
}
