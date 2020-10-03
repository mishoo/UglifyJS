var assert = require("assert");
var UglifyJS = require("../node");

describe("With", function() {
    it("Should throw syntaxError when using with statement in strict mode", function() {
        var code = '"use strict";\nthrow NotEarlyError;\nwith ({}) { }';
        var test = function() {
            UglifyJS.parse(code);
        }
        var error = function(e) {
            return e instanceof UglifyJS.JS_Parse_Error
                && e.message === "Strict mode may not include a with statement";
        }
        assert.throws(test, error);
    });
    it("Should set uses_with for scopes involving With statements", function() {
        var ast = UglifyJS.parse("with(e) {f(1, 2)}");
        ast.figure_out_scope();
        assert.equal(ast.uses_with, true);
        assert.equal(ast.body[0].expression.scope.resolve().uses_with, true);
        assert.equal(ast.body[0].body.body[0].body.expression.scope.resolve().uses_with, true);
    });
});
