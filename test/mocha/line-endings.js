var Uglify = require("../node");
var assert = require("assert");

describe("line-endings", function() {
    var options = {
        compress: false,
        mangle: false,
        output: {
            beautify: false,
            comments: /^!/,
        }
    };
    var expected_code = '/*!one\n2\n3*/\nfunction f(x){if(x)return 3}';

    it("Should parse LF line endings", function() {
        var js = '/*!one\n2\n3*///comment\nfunction f(x) {\n if (x)\n//comment\n  return 3;\n}\n';
        var result = Uglify.minify(js, options);
        assert.strictEqual(result.code, expected_code);
    });

    it("Should parse CR/LF line endings", function() {
        var js = '/*!one\r\n2\r\n3*///comment\r\nfunction f(x) {\r\n if (x)\r\n//comment\r\n  return 3;\r\n}\r\n';
        var result = Uglify.minify(js, options);
        assert.strictEqual(result.code, expected_code);
    });

    it("Should parse CR line endings", function() {
        var js = '/*!one\r2\r3*///comment\rfunction f(x) {\r if (x)\r//comment\r  return 3;\r}\r';
        var result = Uglify.minify(js, options);
        assert.strictEqual(result.code, expected_code);
    });

    it("Should not allow line terminators in regexp", function() {
        var inputs = [
            "/\n/",
            "/\r/",
            "/\u2028/",
            "/\u2029/",
            "/\\\n/",
            "/\\\r/",
            "/\\\u2028/",
            "/\\\u2029/",
            "/someRandomTextLike[]()*AndThen\n/"
        ]
        var test = function(input) {
            return function() {
                Uglify.parse(input);
            }
        }
        var fail = function(e) {
            return e instanceof Uglify.JS_Parse_Error &&
                e.message === "Unexpected line terminator";
        }
        for (var i = 0; i < inputs.length; i++) {
            assert.throws(test(inputs[i]), fail);
        }
    });
});

