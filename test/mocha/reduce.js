var assert = require("assert");
var exec = require("child_process").exec;
var fs = require("fs");
var reduce_test = require("../reduce");
var semver = require("semver");

function read(path) {
    return fs.readFileSync(path, "utf8");
}

describe("test/reduce.js", function() {
    this.timeout(60000);
    it("Should reduce test case", function() {
        var result = reduce_test(read("test/input/reduce/unsafe_math.js"), {
            compress: {
                unsafe_math: true,
            },
            mangle: false,
        }, {
            verbose: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, read("test/input/reduce/unsafe_math.reduced.js"));
    });
    it("Should eliminate unreferenced labels", function() {
        var result = reduce_test(read("test/input/reduce/label.js"), {
            compress: {
                unsafe_math: true,
            },
            mangle: false,
        }, {
            verbose: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, read("test/input/reduce/label.reduced.js"));
    });
    it("Should retain setter arguments", function() {
        var result = reduce_test(read("test/input/reduce/setter.js"), {
            compress: {
                keep_fargs: false,
                unsafe: true,
            },
            mangle: false,
        }, {
            verbose: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, read("test/input/reduce/setter.reduced.js"));
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
            "// Can't reproduce test failure",
            "// minify options: {",
            '//   "toplevel": true',
            "// }",
        ].join("\n"));
    });
    it("Should handle test cases with --compress toplevel", function() {
        var result = reduce_test([
            "var NaN = 42;",
            "console.log(NaN);",
        ].join("\n"), {
            compress: {
                toplevel: true,
            },
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "// Can't reproduce test failure",
            "// minify options: {",
            '//   "compress": {',
            '//     "toplevel": true',
            "//   }",
            "// }",
        ].join("\n"));
    });
    it("Should handle test cases with --mangle toplevel", function() {
        var result = reduce_test([
            "var undefined = 42;",
            "console.log(undefined);",
        ].join("\n"), {
            mangle: {
                toplevel: true,
            },
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "// Can't reproduce test failure",
            "// minify options: {",
            '//   "mangle": {',
            '//     "toplevel": true',
            "//   }",
            "// }",
        ].join("\n"));
    });
    it("Should handle test result of NaN", function() {
        var result = reduce_test("throw 0 / 0;");
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "// Can't reproduce test failure",
            "// minify options: {}",
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
            "// (beautified)",
            "console.log(function f(a) {",
            "    return f.length;",
            "}());",
            "// output: 1",
            "// ",
            "// minify: 0",
            "// ",
            "// options: {",
            '//   "compress": {',
            '//     "keep_fargs": false',
            "//   },",
            '//   "mangle": false',
            "// }",
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
    it("Should format multi-line output correctly", function() {
        var code = [
            "var a = 0;",
            "",
            "for (var b in [ 1, 2, 3 ]) {",
            "    a = +a + 1 - .2;",
            "    console.log(a);",
            "}",
        ].join("\n");
        var result = reduce_test(code, {
            compress: {
                unsafe_math: true,
            },
            mangle: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "// (beautified)",
            code,
            "// output: 0.8",
            "// 1.6",
            "// 2.4",
            "// ",
            "// minify: 0.8",
            "// 1.6",
            "// 2.4000000000000004",
            "// ",
            "// options: {",
            '//   "compress": {',
            '//     "unsafe_math": true',
            "//   },",
            '//   "mangle": false',
            "// }",
        ].join("\n"));
    });
    it("Should reduce infinite loops with reasonable performance", function() {
        if (semver.satisfies(process.version, "<=0.10")) return;
        this.timeout(120000);
        var result = reduce_test("while (/9/.test(1 - .8));", {
            compress: {
                unsafe_math: true,
            },
            mangle: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code.replace(/ timed out after [0-9]+ms/, " timed out."), [
            "// (beautified)",
            "while (/9/.test(1 - .8)) {}",
            "// output: Error: Script execution timed out.",
            "// minify: ",
            "// options: {",
            '//   "compress": {',
            '//     "unsafe_math": true',
            "//   },",
            '//   "mangle": false',
            "// }",
        ].join("\n"));
    });
    it("Should ignore difference in Error.message", function() {
        var result = reduce_test("null[function() {\n}];");
        if (result.error) throw result.error;
        assert.strictEqual(result.code, (semver.satisfies(process.version, "<=0.10") ? [
            "// Can't reproduce test failure",
            "// minify options: {}",
        ] : [
            "// No differences except in error message",
            "// minify options: {}",
        ]).join("\n"));
    });
    it("Should report trailing whitespace difference in stringified format", function() {
        var code = [
            "for (var a in (1 - .8).toString()) {",
            "    console.log();",
            "}",
        ].join("\n");
        var result = reduce_test(code, {
            compress: {
                unsafe_math: true,
            },
            mangle: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "// (beautified)",
            code,
            "// (stringified)",
            '// output: "\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n"',
            '// minify: "\\n\\n\\n"',
            "// options: {",
            '//   "compress": {',
            '//     "unsafe_math": true',
            '//   },',
            '//   "mangle": false',
            "// }",
        ].join("\n"));
    });
    it("Should reduce test case which differs only in Error.message", function() {
        var code = [
            "var a=0;",
            "try{",
            "null[function(){}]",
            "}catch(e){",
            "for(var i in e.toString())",
            "a++,console.log()",
            "}",
            "console.log(a);",
        ].join("");
        var result = reduce_test(code, {
            compress: false,
            mangle: false,
            output: {
                beautify: true,
            },
        });
        if (result.error) throw result.error;
        assert.deepEqual(result.warnings, []);
        assert.strictEqual(result.code.replace(/function \(/g, "function("), (semver.satisfies(process.version, "<=0.10") ? [
            "// Can't reproduce test failure",
            "// minify options: {",
            '//   "compress": false,',
            '//   "mangle": false,',
            '//   "output": {',
            '//     "beautify": true',
            "//   }",
            "// }",
        ] : [
            [
                "try{",
                "null[function(){}]",
                "}catch(e){",
                "console.log(e)",
                "}",
            ].join(""),
            "// output: TypeError: Cannot read property 'function(){}' of null",
            "// ",
            "// minify: TypeError: Cannot read property 'function() {}' of null",
            "// ",
            "// options: {",
            '//   "compress": false,',
            '//   "mangle": false,',
            '//   "output": {',
            '//     "beautify": true',
            "//   }",
            "// }",
        ]).join("\n"));
    });
    it("Should handle corner cases when intermediate case differs only in Error.message", function() {
        if (semver.satisfies(process.version, "<=0.10")) return;
        var result = reduce_test(read("test/input/reduce/diff_error.js"), {
            compress: {
                keep_fargs: false,
                unsafe: true,
            },
            mangle: false,
        }, {
            verbose: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, read("test/input/reduce/diff_error.reduced.js"));
    });
    it("Should handle destructured catch expressions", function() {
        if (semver.satisfies(process.version, "<6")) return;
        var result = reduce_test(read("test/input/reduce/destructured_catch.js"), {
            mangle: false,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, read("test/input/reduce/destructured_catch.reduced.js"));
    });
});
