var assert = require("assert");
var uglify = require("../../");

describe("With", function() {
    it ("Should throw syntaxError when using with statement in strict mode", function() {
        var code = '"use strict";\nthrow NotEarlyError;\nwith ({}) { }';
        var test = function() {
            uglify.parse(code);
        }
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "SyntaxError: Strict mode may not include a with statement";
        }
        assert.throws(test, error);
    });
});