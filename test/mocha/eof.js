var assert = require("assert");
var uglify = require("../node");

describe("EOF", function() {
    it("Should test code for at least throwing syntax error when incomplete", function() {
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error;
        }
        var parse = function(test) {
            return function() {
                uglify.parse(test);
            }
        }
        // Chops off 1 char at a time until limit or start of string is reached
        // The passed code must still be valid when unchopped
        var test_eol = function(input, chopLimit) {
            if (chopLimit === undefined) {
                chopLimit = input.length - 1;
            }

            assert.doesNotThrow(parse(input), "Expected valid code for \n" + input);

            for (var i = input.length - 1; chopLimit > 0; chopLimit--, i--) {
                var code = input.substr(0, i);
                assert.throws(parse(code), error, code);
            }
        }

        test_eol("var \\u1234", 7); // Incomplete identifier
        test_eol("'Incomplete string'");
        test_eol("/Unterminated regex/");
        test_eol("` Unterminated template string`");
        test_eol("/* Unfinishing multiline comment */");
    });
});
