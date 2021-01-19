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

timers: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var count = 0, interval = 1000, duration = 3210;
        var timer = setInterval(function() {
            console.log(++count);
        }, interval);
        setTimeout(function() {
            clearInterval(timer);
        }, duration);
    }
    expect: {
        var count = 0;
        var timer = setInterval(function() {
            console.log(++count);
        }, 1000);
        setTimeout(function() {
            clearInterval(timer);
        }, 3210);
    }
    expect_stdout: [
        "1",
        "2",
        "3",
    ]
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
