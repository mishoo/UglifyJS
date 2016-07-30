var Uglify = require('../../');
var assert = require("assert");

describe("minify() with input file globs", function() {
    it("minify() with one input file glob string.", function() {
        var result = Uglify.minify("test/input/issue-1242/foo.*", {
            compress: { collapse_vars: true }
        });
        assert.strictEqual(result.code, 'function foo(o){print("Foo:",2*o)}var print=console.log.bind(console);');
    });
    it("minify() with an array of one input file glob.", function() {
        var result = Uglify.minify([
            "test/input/issue-1242/b*.es5",
        ], {
            compress: { collapse_vars: true }
        });
        assert.strictEqual(result.code, 'function bar(n){return 3*n}function baz(n){return n/2}');
    });
    it("minify() with an array of multiple input file globs.", function() {
        var result = Uglify.minify([
            "test/input/issue-1242/???.es5",
            "test/input/issue-1242/*.js",
        ], {
            compress: { collapse_vars: true }
        });
        assert.strictEqual(result.code, 'function bar(n){return 3*n}function baz(n){return n/2}function foo(n){print("Foo:",2*n)}var print=console.log.bind(console);print("qux",bar(3),baz(12)),foo(11);');
    });
});
