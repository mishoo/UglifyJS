var uglify = require('../../');
var assert = require("assert");

describe("For statement", function() {
    it("For variable should list enclosing scope in its references (issue #17022)", function() {
        var ast = uglify.parse("function f() { var a = 0; for (; a < 10; a++) {} }");
        ast.figure_out_scope();

        var checkedAST_VarDef = false;
        var checkWalker = new uglify.TreeWalker(function(node, descend) {
            if (node instanceof uglify.AST_VarDef) {
                checkedAST_VarDef = true;
                // one reference should be in the AST_Defun scope - search for it
                var foundDefun = false;
                node.name.thedef.references.forEach(function (r) {
                    if (r.scope instanceof uglify.AST_Defun) foundDefun = true;
                });

                assert(foundDefun, "Symbol not referenced in the AST_Defun scope");
            }
        });
        ast.walk(checkWalker);
        assert(checkedAST_VarDef, "AST_VarDef not found");
    });
});