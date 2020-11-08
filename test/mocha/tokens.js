var assert = require("assert");
var UglifyJS = require("../..");

describe("tokens", function() {
    it("Should give correct positions for accessors", function() {
        // location               0         1         2         3         4
        //                        01234567890123456789012345678901234567890123456789
        var ast = UglifyJS.parse("var obj = { get [prop]() { return undefined; } }");
        // test all AST_ObjectProperty tokens are set as expected
        var found = false;
        ast.walk(new UglifyJS.TreeWalker(function(node) {
            if (node instanceof UglifyJS.AST_ObjectProperty) {
                found = true;
                assert.equal(node.start.pos, 12);
                assert.equal(node.end.endpos, 46);
                assert(node.key instanceof UglifyJS.AST_SymbolRef);
                assert.equal(node.key.start.pos, 17);
                assert.equal(node.key.end.endpos, 21);
                assert(node.value instanceof UglifyJS.AST_Accessor);
                assert.equal(node.value.start.pos, 22);
                assert.equal(node.value.end.endpos, 46);
            }
        }));
        assert(found, "AST_ObjectProperty not found");
    });
});
