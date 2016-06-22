var assert = require("assert");
var uglify = require("../../");

describe("Template string", function() {
    it("Should not accept invalid sequences", function() {
        var tests = [
            // Stress invalid expression
            "var foo = `Hello ${]}`",
            "var foo = `Test 123 ${>}`",
            "var foo = `Blah ${;}`",

            // Stress invalid template_substitution after expression
            "var foo = `Blablabla ${123 456}`",
            "var foo = `Blub ${123;}`",
            "var foo = `Bleh ${a b}`"
        ];

        var exec = function(test) {
            return function() {
                uglify.parse(test);
            }
        };

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error
                && /^SyntaxError: Unexpected token: /.test(e.message);
        };

        for (var i = 0; i < tests.length; i++) {
            assert.throws(exec(tests[i]), fail, tests[i]);
        }
    });
});
