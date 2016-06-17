var assert = require("assert");
var uglify = require("../../");

describe("Class", function() {
    it("Should not accept spread on non-last parameters in methods", function() {
        var tests = [
            "class foo { bar(...a, b) { return a.join(b) } }",
            "class foo { bar(a, b, ...c, d) { return c.join(a + b) + d } }",
            "class foo { *bar(...a, b) { return a.join(b) } }",
            "class foo { *bar(a, b, ...c, d) { return c.join(a + b) + d } }"
        ];
        var test = function(code) {
            return function() {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "SyntaxError: Unexpected token: expand (...)";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error);
        }
    });
});
