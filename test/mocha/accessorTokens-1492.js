var UglifyJS = require('../../');
var assert = require("assert");

describe("Accessor tokens", function() {
    it("Should fill the token information for accessors (issue #1492)", function() {
        // location               0         1         2         3         4
        //                        01234567890123456789012345678901234567890123456789
        var ast = UglifyJS.parse("var obj = { get latest() { return undefined; } }");

        // test there are no nodes without tokens
        var checkWalker = new UglifyJS.TreeWalker(function(node, descend) {
            if (node instanceof UglifyJS.AST_Accessor) {
                assert.equal(node.start.pos, 22);
                assert.equal(node.end.endpos, 46);
            }
        });
        ast.walk(checkWalker);
    });
});