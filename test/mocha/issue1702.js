var uglify = require('../../');
var assert = require("assert");

describe("For statement", function() {
    it("For variable should list enclosing scope in its references (issue #17022)", function() {
        var ast = uglify.parse("function f() { for (var a = 0; a < 10; a++) {} }");
        ast.figure_out_scope();

        var checkWalker = new uglify.TreeWalker(function(node, descend) {
            if (node instanceof uglify.AST_VarDef) {
                console.log("AST_VarDef");
                // one reference should be in the AST_Defun scope - search for it

                var walkNode = function (r) {
                    console.log(r.CTOR.name);
                    var walker = new uglify.TreeWalker(function(node, descend){
                        // do not walk into any other scope, it should be listed if needed
                        console.log("  " + node.CTOR.name);
                        if (node instanceof uglify.AST_Scope && node != r.scope) return true;
                        if (node instanceof uglify.AST_For) {
                            console.log("Great - we found the for statement referencing the variable")
                        }
                        return false;
                    });
                    r.scope.walk(walker);
                    r.walk(walker);
                };

                node.name.thedef.orig.forEach(walkNode);
                node.name.thedef.references.forEach(walkNode);
            }
        });
        ast.walk(checkWalker);
    });
});