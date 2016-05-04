var Uglify = require('../../');
var assert = require("assert");

describe("minify", function() {
    it("Should test basic sanity of minify with default options", function() {
        var js = 'function foo(bar) { if (bar) return 3; else return 7; var u = not_called(); }';
        var result = Uglify.minify(js, {fromString: true});
        assert.strictEqual(result.code, 'function foo(n){return n?3:7}');
    });
});

