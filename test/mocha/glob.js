var Uglify = require('../../');
var assert = require("assert");
var path = require("path");

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
        assert.strictEqual(result.code, 'var print=console.log.bind(console),a=function(n){return 3*n}(3),b=function(n){return n/2}(12);print("qux",a,b),function(n){print("Foo:",2*n)}(11);');
    });
    it("should throw with non-matching glob string", function() {
        var glob = "test/input/issue-1242/blah.*";
        assert.strictEqual(Uglify.simple_glob(glob).length, 1);
        assert.strictEqual(Uglify.simple_glob(glob)[0], glob);
        assert.throws(function() {
            Uglify.minify(glob);
        }, "should throw file not found");
    });
    it('"?" in glob string should not match "/"', function() {
        var glob = "test/input?issue-1242/foo.*";
        assert.strictEqual(Uglify.simple_glob(glob).length, 1);
        assert.strictEqual(Uglify.simple_glob(glob)[0], glob);
        assert.throws(function() {
            Uglify.minify(glob);
        }, "should throw file not found");
    });
    it("should handle special characters in glob string", function() {
        var result = Uglify.minify("test/input/issue-1632/^{*}[???](*)+$.??");
        assert.strictEqual(result.code, "console.log(x);");
    });
    it("should handle array of glob strings - matching and otherwise", function() {
        var dir = "test/input/issue-1242";
        var matches = Uglify.simple_glob([
            path.join(dir, "b*.es5"),
            path.join(dir, "z*.es5"),
            path.join(dir, "*.js"),
        ]);
        assert.strictEqual(matches.length, 4);
        assert.strictEqual(matches[0], path.join(dir, "bar.es5"));
        assert.strictEqual(matches[1], path.join(dir, "baz.es5"));
        assert.strictEqual(matches[2], path.join(dir, "z*.es5"));
        assert.strictEqual(matches[3], path.join(dir, "qux.js"));
    });
});
