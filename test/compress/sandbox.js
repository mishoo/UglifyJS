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
