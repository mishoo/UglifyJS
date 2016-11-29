var UglifyJS = require('../../');
var assert = require("assert");

describe("comment filters", function() {
    it("Should be able to filter comments by passing regexp", function() {
        var ast = UglifyJS.parse("/*!test1*/\n/*test2*/\n//!test3\n//test4\n<!--test5\n<!--!test6\n-->test7\n-->!test8");
        assert.strictEqual(ast.print_to_string({comments: /^!/}), "/*!test1*/\n//!test3\n//!test6\n//!test8\n");
    });

    it("Should be able to filter comments with the 'all' option", function() {
        var ast = UglifyJS.parse("/*!test1*/\n/*test2*/\n//!test3\n//test4\n<!--test5\n<!--!test6\n-->test7\n-->!test8");
        assert.strictEqual(ast.print_to_string({comments: "all"}), "/*!test1*/\n/*test2*/\n//!test3\n//test4\n//test5\n//!test6\n//test7\n//!test8\n");
    });

    it("Should be able to filter commments with the 'some' option", function() {
        var ast = UglifyJS.parse("// foo\n/*@preserve*/\n// bar\n/*@license*/\n//@license with the wrong comment type\n/*@cc_on something*/");
        assert.strictEqual(ast.print_to_string({comments: "some"}), "/*@preserve*/\n/*@license*/\n/*@cc_on something*/\n");
    });

    it("Should be able to filter comments by passing a function", function() {
        var ast = UglifyJS.parse("/*TEST 123*/\n//An other comment\n//8 chars.");
        var f = function(node, comment) {
            return comment.value.length === 8;
        };

        assert.strictEqual(ast.print_to_string({comments: f}), "/*TEST 123*/\n//8 chars.\n");
    });

    it("Should be able to filter comments by passing regex in string format", function() {
        var ast = UglifyJS.parse("/*!test1*/\n/*test2*/\n//!test3\n//test4\n<!--test5\n<!--!test6\n-->test7\n-->!test8");
        assert.strictEqual(ast.print_to_string({comments: "/^!/"}), "/*!test1*/\n//!test3\n//!test6\n//!test8\n");
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

    it("Should never be able to filter comment5 when using 'some' as filter", function() {
        var ast = UglifyJS.parse("#!foo\n//foo\n/*@preserve*/\n/* please hide me */");
        assert.strictEqual(ast.print_to_string({comments: "some"}), "#!foo\n/*@preserve*/\n");
    });

    it("Should have no problem on multiple calls", function() {
        const options = {
            comments: /ok/
        };

        assert.strictEqual(UglifyJS.parse("/* ok */ function a(){}").print_to_string(options), "/* ok */function a(){}");
        assert.strictEqual(UglifyJS.parse("/* ok */ function a(){}").print_to_string(options), "/* ok */function a(){}");
        assert.strictEqual(UglifyJS.parse("/* ok */ function a(){}").print_to_string(options), "/* ok */function a(){}");
    });
});
