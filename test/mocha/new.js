var assert = require("assert");
var uglify = require("../../");

describe("New", function() {
    it("Should attach callback parens after some tokens", function() {
        var tests = [
            "new x(1);",
            "new (function(foo){this.foo=foo;})(1);",
            "new true;",
            "new (0);",
            "new (!0);",
            "new (bar = function(foo) {this.foo=foo;})(123);"
        ];
        var expected = [
            "new x(1);",
            "new function(foo) {\n    this.foo = foo;\n}(1);",
            "new true;",
            "new 0;",
            "new (!0);",
            "new (bar = function(foo) {\n    this.foo = foo;\n})(123);"
        ];
        for (var i = 0; i < tests.length; i++) {
            assert.strictEqual(
                uglify.minify(tests[i], {
                    fromString: true,
                    output: {beautify: true},
                    compress: false,
                    mangle: false
                }).code,
                expected[i]
            );
        }
    });
});