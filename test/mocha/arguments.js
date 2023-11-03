var assert = require("assert");
var UglifyJS = require("../..");

describe("arguments", function() {
    it("Should known that arguments in functions are local scoped", function() {
        var ast = UglifyJS.parse("var arguments; var f = function() {arguments.length}");
        ast.figure_out_scope();
        // Test scope of `var arguments`
        assert.strictEqual(ast.find_variable("arguments").global, true);
        // Select arguments symbol in function
        var symbol = ast.body[1].definitions[0].value.find_variable("arguments");
        assert.strictEqual(symbol.global, false);
        assert.strictEqual(symbol.scope, ast. // From ast
            body[1]. // Select 2nd statement (equals to `var f ...`)
            definitions[0]. // First definition of selected statement
            value // Select function as scope
        );
    });

    it("Should recognize when a function uses arguments", function() {
        var ast = UglifyJS.parse("function a(){function b(){function c(){}; return arguments[0];}}");
        ast.figure_out_scope();
        assert.strictEqual(ast.body[0].uses_arguments, false);
        assert.strictEqual(ast.body[0].body[0].uses_arguments, true);
        assert.strictEqual(ast.body[0].body[0].body[0].uses_arguments, false);
    });
});
