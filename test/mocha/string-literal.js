var UglifyJS = require('../../');
var assert = require("assert");

describe("String literals", function() {
    it("Should throw syntax error if a string literal contains a newline", function() {
        var inputs = [
            "'\n'",
            "'\r'",
            '"\r\n"',
            "'\u2028'",
            '"\u2029"'
        ];

        var test = function(input) {
            return function() {
                var ast = UglifyJS.parse(input);
            };
        };

        var error = function(e) {
            return e instanceof UglifyJS.JS_Parse_Error &&
                e.message === "Unterminated string constant";
        };

        for (var input in inputs) {
            assert.throws(test(inputs[input]), error);
        }
    });

    it("Should not throw syntax error if a string has a line continuation", function() {
        var output = UglifyJS.parse('var a = "a\\\nb";').print_to_string();
        assert.equal(output, 'var a="ab";');
    });
});