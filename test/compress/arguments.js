replace_index: {
    options = {
        arguments: true,
        evaluate: true,
        properties: true,
    }
    input: {
        console.log(arguments && arguments[0]);
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
        console.log(arguments && arguments[0]);
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

replace_index_keep_fargs: {
    options = {
        arguments: true,
        evaluate: true,
        keep_fargs: false,
        properties: true,
    }
    input: {
        console.log(arguments && arguments[0]);
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
        console.log(arguments && arguments[0]);
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

modified: {
    options = {
        arguments: true,
    }
    input: {
        (function(a, b) {
            var c = arguments[0];
            var d = arguments[1];
            a = "foo";
            b++;
            console.log(a, b, c, d, arguments[0], arguments[1]);
        })("bar", 42);
    }
    expect: {
        (function(a, b) {
            var c = a;
            var d = b;
            a = "foo";
            b++;
            console.log(a, b, c, d, a, b);
        })("bar", 42);
    }
    expect_stdout: "foo 43 bar 42 foo 43"
}
