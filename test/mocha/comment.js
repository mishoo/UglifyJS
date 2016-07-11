var assert = require("assert");
var uglify = require("../../");

describe("Comment", function() {
    it("Should recognize eol of single line comments", function() {
        var tests = [
            "//Some comment 1\n>",
            "//Some comment 2\r>",
            "//Some comment 3\r\n>",
            "//Some comment 4\u2028>",
            "//Some comment 5\u2029>"
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

    it("Should update the position of a multiline comment correctly", function() {
        var tests = [
            "/*Some comment 1\n\n\n*/\n>\n\n\n\n\n\n",
            "/*Some comment 2\r\n\r\n\r\n*/\r\n>\n\n\n\n\n\n",
            "/*Some comment 3\r\r\r*/\r>\n\n\n\n\n\n",
            "/*Some comment 4\u2028\u2028\u2028*/\u2028>\n\n\n\n\n\n",
            "/*Some comment 5\u2029\u2029\u2029*/\u2029>\n\n\n\n\n\n",
            "/*Some comment 6\udbff\udfff\udbff\udfff\n\n\n*/\n>\n\n\n\n\n"
        ];

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "SyntaxError: Unexpected token: operator (>)" &&
                e.line === 5 &&
                e.col === 0;
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(function() {
                uglify.parse(tests[i], {fromString: true});
            }, fail, tests[i]);
        }
    });
});
