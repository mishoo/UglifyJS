var assert = require("assert");
var exec = require("child_process").exec;
var reduce_test = require("../reduce");

describe("test/reduce.js", function() {
    it("Should handle test cases with --toplevel", function() {
        var result = reduce_test([
            "var Infinity = 42;",
            "console.log(Infinity);",
        ].join("\n"), {
            toplevel: true,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "// Can't reproduce test failure with minify options provided:",
            '// {"toplevel":true}',
            "",
        ].join("\n"));
    });
    it("Should handle test result of NaN", function() {
        var result = reduce_test("throw 0 / 0;");
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "// Can't reproduce test failure with minify options provided:",
            '// {"compress":{},"mangle":false}',
            "",
        ].join("\n"));
    });
    it("Should print correct output for irreducible test case", function() {
        var result = reduce_test([
            "console.log(function f(a) {",
            "    return f.length;",
            "}());",
        ].join("\n"), {
            compress: {
                keep_fargs: false,
            },
            mangle: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "console.log(function f(a) {",
            "    return f.length;",
            "}());",
            "// output: 1",
            "// minify: 0",
            '// options: {"compress":{"keep_fargs":false},"mangle":false}',
        ].join("\n"));
    });
    it("Should fail when invalid option is supplied", function() {
        var result = reduce_test("", {
            compress: {
                unsafe_regex: true,
            },
        });
        var err = result.error;
        assert.ok(err instanceof Error);
        assert.strictEqual(err.stack.split(/\n/)[0], "DefaultsError: `unsafe_regex` is not a supported option");
    });
});
