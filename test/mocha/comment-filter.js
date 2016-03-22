var UglifyJS = require('../../');
var assert = require("assert");

describe("comment filters", function() {
    it("Should be able to filter comments by passing regex", function() {
        var ast = UglifyJS.parse("/*!test1*/\n/*test2*/\n//!test3\n//test4\n<!--test5\n<!--!test6\n-->test7\n-->!test8");
        assert.strictEqual(ast.print_to_string({comments: /^!/}), "/*!test1*/\n//!test3\n//!test6\n//!test8\n");
    });

    it("Should be able to filter comments by passing a function", function() {
        var ast = UglifyJS.parse("/*TEST 123*/\n//An other comment\n//8 chars.");
        var f = function(node, comment) {
            return comment.value.length === 8;
        };

        assert.strictEqual(ast.print_to_string({comments: f}), "/*TEST 123*/\n//8 chars.\n");
    });

    it("Should be able to get the comment and comment type when using a function", function() {
        var ast = UglifyJS.parse("/*!test1*/\n/*test2*/\n//!test3\n//test4\n<!--test5\n<!--!test6\n-->test7\n-->!test8");
        var f = function(node, comment) {
            return comment.type == "comment1" || comment.type == "comment3";
        };

        assert.strictEqual(ast.print_to_string({comments: f}), "//!test3\n//test4\n//test5\n//!test6\n");
    });

    it("Should be able to filter comments by passing a boolean", function() {
        var ast = UglifyJS.parse("/*!test1*/\n/*test2*/\n//!test3\n//test4\n<!--test5\n<!--!test6\n-->test7\n-->!test8");

        assert.strictEqual(ast.print_to_string({comments: true}), "/*!test1*/\n/*test2*/\n//!test3\n//test4\n//test5\n//!test6\n//test7\n//!test8\n");
        assert.strictEqual(ast.print_to_string({comments: false}), "");
    });

    it("Should never be able to filter comment5 (shebangs)", function() {
        var ast = UglifyJS.parse("#!Random comment\n//test1\n/*test2*/");
        var f = function(node, comment) {
            assert.strictEqual(comment.type === "comment5", false);

            return true;
        };

        assert.strictEqual(ast.print_to_string({comments: f}), "#!Random comment\n//test1\n/*test2*/\n");
    });
});
