var Uglify = require('../../');
var assert = require("assert");

describe("comment before constant", function() {
    var js = 'function f() { /*c1*/ var /*c2*/ foo = /*c3*/ false; return foo; }';

    it("Should test comment before constant is retained and output after mangle.", function() {
        var result = Uglify.minify(js, {
            compress: { collapse_vars: false, reduce_vars: false },
            output: { comments: true },
        });
        assert.strictEqual(result.code, 'function f(){/*c1*/var/*c2*/n=/*c3*/!1;return n}');
    });

    it("Should test code works when comments disabled.", function() {
        var result = Uglify.minify(js, {
            compress: { collapse_vars: false, reduce_vars: false },
            output: { comments: false },
        });
        assert.strictEqual(result.code, 'function f(){var n=!1;return n}');
    });
});
