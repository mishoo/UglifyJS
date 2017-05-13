var UglifyJS = require("../node");
var assert = require("assert");

describe("Accessor tokens", function() {
    it("Should fill the token information for accessors (issue #1492)", function() {
        // location               0         1         2         3         4
        //                        01234567890123456789012345678901234567890123456789
        var ast = UglifyJS.parse("var obj = { get latest() { return undefined; } }");

        // test all AST_ObjectProperty tokens are set as expected
        var checkedAST_ObjectProperty = false;
        var checkWalker = new UglifyJS.TreeWalker(function(node, descend) {
            if (node instanceof UglifyJS.AST_ObjectProperty) {
                checkedAST_ObjectProperty = true;

                assert.equal(node.start.pos, 12);
                assert.equal(node.end.endpos, 46);

                assert(node.key instanceof UglifyJS.AST_SymbolAccessor);
                assert.equal(node.key.start.pos, 16);
                assert.equal(node.key.end.endpos, 22);

                assert(node.value instanceof UglifyJS.AST_Accessor);
                assert.equal(node.value.start.pos, 22);
                assert.equal(node.value.end.endpos, 46);

            }
        });
        ast.walk(checkWalker);
        assert(checkedAST_ObjectProperty, "AST_ObjectProperty not found");
    });
});