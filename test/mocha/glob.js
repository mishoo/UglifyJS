var Uglify = require('../../');
var assert = require("assert");

describe("minify() with input file globs", function() {
    it("minify() with one input file glob string.", function() {
        var result = Uglify.minify("test/input/issue-1242/foo.*");
        assert.strictEqual(result.code, 'function foo(o){print("Foo:",2*o)}var print=console.log.bind(console);');
    });
    it("minify() with an array of one input file glob.", function() {
        var result = Uglify.minify([
            "test/input/issue-1242/b*.es5",
        ]);
        assert.strictEqual(result.code, 'function bar(n){return 3*n}function baz(n){return n/2}');
    });
    it("minify() with an array of multiple input file globs.", function() {
        var result = Uglify.minify([
            "test/input/issue-1242/???.es5",
            "test/input/issue-1242/*.js",
        ], {
            compress: { toplevel: true }
        });
        assert.strictEqual(result.code, 'var print=console.log.bind(console);print("qux",function(n){return 3*n}(3),function(n){return n/2}(12)),function(n){print("Foo:",2*n)}(11);');
    });
});
