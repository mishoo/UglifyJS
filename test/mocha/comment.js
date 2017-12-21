var assert = require("assert");
var uglify = require("../node");

describe("Comment", function() {
    it("Should recognize eol of single line comments", function() {
        var tests = [
            "//Some comment 1\n>",
            "//Some comment 2\r>",
            "//Some comment 3\r\n>",
            "//Some comment 4\u2028>",
            "//Some comment 5\u2029>"
        ];

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "Unexpected token: operator (>)" &&
                e.line === 2 &&
                e.col === 0;
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(function() {
                uglify.parse(tests[i]);
            }, fail, tests[i]);
        }
    });

    it("Should update the position of a multiline comment correctly", function() {
        var tests = [
            "/*Some comment 1\n\n\n*/\n>\n\n\n\n\n\n",
            "/*Some comment 2\r\n\r\n\r\n*/\r\n>\n\n\n\n\n\n",
            "/*Some comment 3\r\r\r*/\r>\n\n\n\n\n\n",
            "/*Some comment 4\u2028\u2028\u2028*/\u2028>\n\n\n\n\n\n",
            "/*Some comment 5\u2029\u2029\u2029*/\u2029>\n\n\n\n\n\n"
        ];

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "Unexpected token: operator (>)" &&
                e.line === 5 &&
                e.col === 0;
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(function() {
                uglify.parse(tests[i]);
            }, fail, tests[i]);
        }
    });

    it("Should handle comment within return correctly", function() {
        var result = uglify.minify([
            "function unequal(x, y) {",
            "    return (",
            "        // Either one",
            "        x < y",
            "        ||",
            "        y < x",
            "    );",
            "}",
        ].join("\n"), {
            compress: false,
            mangle: false,
            output: {
                beautify: true,
                comments: "all",
            },
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "function unequal(x, y) {",
            "    // Either one",
            "    return x < y || y < x;",
            "}",
        ].join("\n"));
    });

    it("Should handle comment folded into return correctly", function() {
        var result = uglify.minify([
            "function f() {",
            "    /* boo */ x();",
            "    return y();",
            "}",
        ].join("\n"), {
            mangle: false,
            output: {
                beautify: true,
                comments: "all",
            },
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            "function f() {",
            "    /* boo */",
            "    return x(), y();",
            "}",
        ].join("\n"));
    });

    it("Should not drop comments after first OutputStream", function() {
        var code = "/* boo */\nx();";
        var ast = uglify.parse(code);
        var out1 = uglify.OutputStream({
            beautify: true,
            comments: "all",
        });
        ast.print(out1);
        var out2 = uglify.OutputStream({
            beautify: true,
            comments: "all",
        });
        ast.print(out2);
        assert.strictEqual(out1.get(), code);
        assert.strictEqual(out2.get(), out1.get());
    });
});
