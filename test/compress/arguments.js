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
