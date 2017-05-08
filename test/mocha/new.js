var assert = require("assert");
var uglify = require("../node");

describe("New", function() {
    it("Should add trailing parentheses for new expressions with zero arguments in beautify mode", function() {
        var tests = [
            "new x(1);",
            "new x;",
            "new new x;",
            "new (function(foo){this.foo=foo;})(1);",
            "new (function(foo){this.foo=foo;})();",
            "new (function test(foo){this.foo=foo;})(1);",
            "new (function test(foo){this.foo=foo;})();",
            "new true;",
            "new (0);",
            "new (!0);",
            "new (bar = function(foo) {this.foo=foo;})(123);",
            "new (bar = function(foo) {this.foo=foo;})();"
        ];
        var expected = [
            "new x(1);",
            "new x();",
            "new new x()();",
            "new function(foo) {\n    this.foo = foo;\n}(1);",
            "new function(foo) {\n    this.foo = foo;\n}();",
            "new function test(foo) {\n    this.foo = foo;\n}(1);",
            "new function test(foo) {\n    this.foo = foo;\n}();",
            "new true();",
            "new 0();",
            "new (!0)();",
            "new (bar = function(foo) {\n    this.foo = foo;\n})(123);",
            "new (bar = function(foo) {\n    this.foo = foo;\n})();"
        ];
        for (var i = 0; i < tests.length; i++) {
            assert.strictEqual(
                uglify.minify(tests[i], {
                    output: {beautify: true},
                    compress: false,
                    mangle: false
                }).code,
                expected[i]
            );
        }
    });

    it("Should not add trailing parentheses for new expressions with zero arguments in non-beautify mode", function() {
        var tests = [
            "new x(1);",
            "new x;",
            "new new x;",
            "new (function(foo){this.foo=foo;})(1);",
            "new (function(foo){this.foo=foo;})();",
            "new (function test(foo){this.foo=foo;})(1);",
            "new (function test(foo){this.foo=foo;})();",
            "new true;",
            "new (0);",
            "new (!0);",
            "new (bar = function(foo) {this.foo=foo;})(123);",
            "new (bar = function(foo) {this.foo=foo;})();"
        ];
        var expected = [
            "new x(1);",
            "new x;",
            "new(new x);",
            "new function(foo){this.foo=foo}(1);",
            "new function(foo){this.foo=foo};",
            "new function test(foo){this.foo=foo}(1);",
            "new function test(foo){this.foo=foo};",
            "new true;",
            "new 0;",
            "new(!0);",
            "new(bar=function(foo){this.foo=foo})(123);",
            "new(bar=function(foo){this.foo=foo});"
        ];
        for (var i = 0; i < tests.length; i++) {
            assert.strictEqual(
                uglify.minify(tests[i], {
                    output: {beautify: false},
                    compress: false,
                    mangle: false
                }).code,
                expected[i]
            );
        }
    });

    it("Should check target in new.target", function() {
        assert.throws(function() {uglify.parse("new.blah")}, function(e) {
            return e instanceof uglify.JS_Parse_Error
                && e.message === "Unexpected token name «blah», expected name «target»";
        });
    });
});