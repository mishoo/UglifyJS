var UglifyJS = require('../../');
var assert = require("assert");

describe("Accessor tokens", function() {
    it("Should fill the token information for accessors (issue #1492)", function() {
        var ast = UglifyJS.parse("var obj = { get latest() { return undefined; } }");

        /* a possible way to test, but walking through the whole tree seems more robust against possible AST changes
        var accessor = ast.body["0"].definitions["0"].value.properties["0"].value;
        assert(accessor instanceof UglifyJS.AST_Accessor);
        assert(accessor.start !== undefined);
        assert(accessor.end !== undefined);
        */

        // test there are no nodes without tokens
        var checkWalker = new UglifyJS.TreeWalker(function(node, descend) {
            if (node instanceof UglifyJS.AST_Accessor) {
                assert.equal(node.start.pos, 12);
                assert.equal(node.end.endpos, 46);
            }
        });
        ast.walk(checkWalker);
    });
});