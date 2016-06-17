var assert = require("assert");
var uglify = require("../../");

describe("Function", function() {
    it("Should not accept spread on non-last parameters", function() {
        var tests = [
            "var a = function(...a, b) { return a.join(b) }",
            "var b = function(a, b, ...c, d) { return c.join(a + b) + d }",
            "function foo(...a, b) { return a.join(b) }",
            "function bar(a, b, ...c, d) { return c.join(a + b) + d }",
            "var a = function*(...a, b) { return a.join(b) }",
            "var b = function*(a, b, ...c, d) { return c.join(a + b) + d }",
            "function* foo(...a, b) { return a.join(b) }",
            "function* bar(a, b, ...c, d) { return c.join(a + b) + d }"
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
