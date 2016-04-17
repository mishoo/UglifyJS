var Uglify = require('../../');
var assert = require("assert");

describe("Huge number of comments.", function() {
    it("Should parse and compress code with thousands of consecutive comments", function() {
        var js = 'function lots_of_comments(x) { return 7 -';
        var i;
        for (i = 1; i <= 5000; ++i) { js += "// " + i + "\n"; }
        for (; i <= 10000; ++i) { js += "/* " + i + " */ /**/"; }
        js += "x; }";
        var result = Uglify.minify(js, {
            fromString: true,
            mangle: false,
            compress: {}
        });
        assert.strictEqual(result.code, "function lots_of_comments(x){return 7-x}");
    });
});

