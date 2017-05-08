var assert = require("assert");
var uglify = require("../node");

describe("Expression", function() {
    it("Should not allow the first exponentiation operator to be prefixed with an unary operator", function() {
        var tests = [
            "+5 ** 3",
            "-5 ** 3",
            "~5 ** 3",
            "!5 ** 3",
            "void 5 ** 3",
            "typeof 5 ** 3",
            "delete 5 ** 3",
            "var a = -(5) ** 3;"
        ];

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                /^Unexpected token: operator \((?:[!+~-]|void|typeof|delete)\)/.test(e.message);
        }

        var exec = function(test) {
            return function() {
                uglify.parse(test);
            }
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(exec(tests[i]), fail, tests[i]);
        }
    });
});
