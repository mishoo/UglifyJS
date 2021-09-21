var assert = require("assert");
var run_code = require("../sandbox").run_code;
var semver = require("semver");
var UglifyJS = require("../node");

describe("Template literals", function() {
    it("Should reject invalid literal", function() {
        [
            "`foo\\`",
            "`foo${bar`",
            "`foo${bar}",
        ].forEach(function(input) {
            assert.throws(function() {
                UglifyJS.parse(input);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error
                    && e.message === "Unterminated template literal";
            }, input);
        });
    });
    it("Should reject invalid expression", function() {
        [
            "`foo${bar;}`",
            "`foo${42bar}`",
        ].forEach(function(input) {
            assert.throws(function() {
                UglifyJS.parse(input);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, input);
        });
    });
    it("Should process line-break characters correctly", function() {
        [
            // native line breaks
            [ "`foo\nbar`", "`foo\nbar`" ],
            [ "`foo\rbar`", "`foo\nbar`" ],
            [ "`foo\r\nbar`", "`foo\nbar`" ],
            [ "`foo\r\n\rbar`", "`foo\n\nbar`" ],
            // escaped line breaks
            [ "`foo\\nbar`", "`foo\\nbar`" ],
            [ "`foo\\rbar`", "`foo\\rbar`" ],
            [ "`foo\r\\nbar`", "`foo\n\\nbar`" ],
            [ "`foo\\r\nbar`", "`foo\\r\nbar`" ],
            [ "`foo\\r\\nbar`", "`foo\\r\\nbar`" ],
            // continuation
            [ "`foo\\\nbar`", "`foo\\\nbar`" ],
            [ "`foo\\\rbar`", "`foo\\\nbar`" ],
            [ "`foo\\\r\nbar`", "`foo\\\nbar`" ],
            [ "`foo\\\r\n\rbar`", "`foo\\\n\nbar`" ],
            [ "`foo\\\\nbar`", "`foo\\\\nbar`" ],
            [ "`foo\\\\rbar`", "`foo\\\\rbar`" ],
            [ "`foo\\\\r\nbar`", "`foo\\\\r\nbar`" ],
        ].forEach(function(test) {
            var input = "console.log(" + test[0] + ");";
            var result = UglifyJS.minify(input, {
                compress: false,
                mangle: false,
            });
            if (result.error) throw result.error;
            var expected = "console.log(" + test[1] + ");";
            assert.strictEqual(result.code, expected, test[0]);
            if (semver.satisfies(process.version, "<4")) return;
            assert.strictEqual(run_code(result.code), run_code(input), test[0]);
        });
    });
});
