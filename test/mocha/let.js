var Uglify = require('../../');
var assert = require("assert");

describe("let", function() {
    it("Should not produce `let` as a variable name in mangle", function(done) {
        this.timeout(10000);

        // Produce a lot of variables in a function and run it through mangle.
        var s = '"use strict"; function foo() {';
        for (var i = 0; i < 21000; ++i) {
            s += "var v" + i + "=0;";
        }
        s += '}';
        var result = Uglify.minify(s, {compress: false});

        // Verify that select keywords and reserved keywords not produced
        assert.strictEqual(result.code.indexOf("var let="), -1);
        assert.strictEqual(result.code.indexOf("var do="), -1);
        assert.strictEqual(result.code.indexOf("var var="), -1);

        // Verify that the variable names that appeared immediately before
        // and after the erroneously generated `let` variable name still exist
        // to show the test generated enough symbols.
        assert(result.code.indexOf("var ket=") >= 0);
        assert(result.code.indexOf("var met=") >= 0);

        done();
    });
});

