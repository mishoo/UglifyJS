var assert = require("assert");
var exec = require("child_process").exec;
var fs = require("fs");
var reduce_test = require("../reduce");

function read(path) {
    return fs.readFileSync(path, "utf8");
}

describe("test/reduce.js", function() {
    it("Should reduce test case", function() {
        this.timeout(60000);
        var result = reduce_test(read("test/input/reduce/input.js"), {
            compress: {
                unsafe_math: true,
            },
            mangle: false,
        }, {
            verbose: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, read("test/input/reduce/output.js"));
    });
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
    it("Should report on test case with invalid syntax", function() {
        var result = reduce_test("var 0 = 1;");
        var err = result.error;
        assert.ok(err instanceof Error);
        assert.strictEqual(err.stack.split(/\n/)[0], "SyntaxError: Name expected");
    });
});
