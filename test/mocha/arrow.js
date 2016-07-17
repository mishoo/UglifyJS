var assert = require("assert");
var uglify = require("../../");

describe("Arrow functions", function() {
    it("Should not accept spread tokens on non-last parameters or without arguments parentheses", function() {
        var tests = [
            "var a = ...a => {return a.join()}",
            "var b = (a, ...b, c) => { return a + b.join() + c}",
            "var c = (...a, b) => a.join()"
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
