replace_index: {
    options = {
        arguments: true,
        evaluate: true,
        properties: true,
    }
    input: {
        var arguments = [];
        console.log(arguments[0]);
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        var arguments = [];
        console.log(arguments[0]);
        (function() {
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "undefined",
        "42 42 undefined",
        "42 42 undefined",
        "a a undefined",
        "42 42 undefined",
    ]
}

replace_index_strict: {
    options = {
        arguments: true,
        evaluate: true,
        properties: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        "use strict";
        (function() {
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "42 42 undefined",
        "42 42 undefined",
    ]
}

replace_index_keep_fargs: {
    options = {
        arguments: true,
        evaluate: true,
        keep_fargs: false,
        properties: true,
    }
    input: {
        var arguments = [];
        console.log(arguments[0]);
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        var arguments = [];
        console.log(arguments[0]);
        (function(argument_0, argument_1) {
            console.log(argument_1, argument_1, arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "undefined",
        "42 42 undefined",
        "42 42 undefined",
        "a a undefined",
        "42 42 undefined",
    ]
}

replace_index_keep_fargs_strict: {
    options = {
        arguments: true,
        evaluate: true,
        keep_fargs: false,
        properties: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        "use strict";
        (function(argument_0, argument_1) {
            console.log(argument_1, argument_1, arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "42 42 undefined",
        "42 42 undefined",
    ]
}

modified: {
    options = {
        arguments: true,
    }
    input: {
        (function(a, b) {
            var c = arguments[0];
            var d = arguments[1];
            var a = "foo";
            b++;
            arguments[0] = "moo";
            arguments[1] *= 2;
            console.log(a, b, c, d, arguments[0], arguments[1]);
        })("bar", 42);
    }
    expect: {
        (function(a, b) {
            var c = a;
            var d = b;
            var a = "foo";
            b++;
            a = "moo";
            b *= 2;
            console.log(a, b, c, d, a, b);
        })("bar", 42);
    }
    expect_stdout: "moo 86 bar 42 moo 86"
}

modified_strict: {
    options = {
        arguments: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        (function(a, b) {
            var c = arguments[0];
            var d = arguments[1];
            var a = "foo";
            b++;
            arguments[0] = "moo";
            arguments[1] *= 2;
            console.log(a, b, c, d, arguments[0], arguments[1]);
        })("bar", 42);
    }
    expect: {
        "use strict";
        (function(a, b) {
            var c = arguments[0];
            var d = arguments[1];
            var a = "foo";
            b++;
            arguments[0] = "moo";
            arguments[1] *= 2;
            console.log(a, b, c, d, arguments[0], arguments[1]);
        })("bar", 42);
    }
    expect_stdout: "foo 43 bar 42 moo 84"
}

duplicate_argname: {
    options = {
        arguments: true,
    }
    input: {
        (function(a, b, a) {
            console.log(a, b, arguments[0], arguments[1], arguments[2]);
        })("foo", 42, "bar");
    }
    expect: {
        (function(a, b, a) {
            console.log(a, b, arguments[0], b, a);
        })("foo", 42, "bar");
    }
    expect_stdout: "bar 42 foo 42 bar"
}
