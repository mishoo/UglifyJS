var assert = require("assert");
var uglify = require("../../");

describe("Comment", function() {
    it("Should recognize eol of single line comments", function() {
        var tests = [
            "//Some comment\n>",
            "//Some comment\r>",
            "//Some comment\r\n>",
            "//Some comment\u2028>",
            "//Some comment\u2029>"
        ];

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "SyntaxError: Unexpected token: operator (>)" &&
                e.line === 2 &&
                e.col === 0;
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(function() {
                uglify.parse(tests[i], {fromString: true})
            }, fail, tests[i]);
        }
    });
});
