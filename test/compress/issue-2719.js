warn: {
    options = {
        evaluate: true,
        inline: true,
        passes: 2,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            return g();
        }
        function g() {
            return g["call" + "er"].arguments;
        }
        // 3
        console.log(f(1, 2, 3).length);
    }
    expect: {
        // TypeError: Cannot read property 'arguments' of null
        console.log(function g() {
            return g.caller.arguments;
        }().length);
    }
    expect_warnings: [
        "WARN: Function.prototype.arguments not supported [test/compress/issue-2719.js:5,19]",
        "WARN: Function.prototype.caller not supported [test/compress/issue-2719.js:5,19]",
    ]
}
