var assert = require("assert");
var uglify = require("../../");

describe("With", function() {
    it("Should throw syntaxError when using with statement in strict mode", function() {
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
    it("Should set uses_with for scopes involving With statements", function() {
        var ast = uglify.parse("with(e) {f(1, 2)}");
        ast.figure_out_scope();
        assert.equal(ast.uses_with, true);
        assert.equal(ast.body[0].expression.scope.uses_with, true);
        assert.equal(ast.body[0].body.body[0].body.expression.scope.uses_with, true);
    });
});
