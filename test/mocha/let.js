var Uglify = require('../../');
var assert = require("assert");

describe("let", function() {
    this.timeout(30000);
    it("Should not produce reserved keywords as variable name in mangle", function() {
        // Produce a lot of variables in a function and run it through mangle.
        var s = '"dddddeeeeelllllooooottttt"; function foo() {';
        for (var i = 0; i < 18000; i++) {
            s += "var v" + i + "=0;";
        }
        s += '}';
        var result = Uglify.minify(s, {
            compress: false
        }).code;

        // Verify that select keywords and reserved keywords not produced
        [
            "do",
            "let",
            "var",
        ].forEach(function(name) {
            assert.strictEqual(result.indexOf("var " + name + "="), -1);
        });

        // Verify that the variable names that appeared immediately before
        // and after the erroneously generated variable name still exist
        // to show the test generated enough symbols.
        [
            "to", "eo",
            "eet", "fet",
            "rar", "oar",
        ].forEach(function(name) {
            assert.notStrictEqual(result.indexOf("var " + name + "="), -1);
        });
    });
    it("Should quote mangled properties that are reserved keywords", function() {
        var s = '"rrrrrnnnnniiiiiaaaaa";';
        for (var i = 0; i < 18000; i++) {
            s += "v.b" + i + ";";
        }
        var result = Uglify.minify(s, {
            compress: false,
            ie8: true,
            mangle: {
                properties: true,
            }
        }).code;
        [
            "in",
            "var",
        ].forEach(function(name) {
            assert.notStrictEqual(result.indexOf(name), -1);
            assert.notStrictEqual(result.indexOf('v["' + name + '"]'), -1);
        });
    });
});
