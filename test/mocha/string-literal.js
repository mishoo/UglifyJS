var assert = require("assert");
var run_code = require("../sandbox").run_code;
var UglifyJS = require("../node");

describe("String literals", function() {
    it("Should throw syntax error if a string literal contains a newline", function() {
        [
            "'\n'",
            "'\r'",
            '"\r\n"',
            "'\u2028'",
            '"\u2029"',
        ].forEach(function(input) {
            assert.throws(function() {
                UglifyJS.parse(input);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error
                    && e.message === "Unterminated string constant";
            });
        });
    });
    it("Should handle line continuation correctly", function() {
        [
            '"\\\r"',
            '"\\\n"',
            '"\\\r\n"',
        ].forEach(function(str) {
            var code = "console.log(" + str + ");";
            var result = UglifyJS.minify(code);
            if (result.error) throw result.error;
            assert.strictEqual(run_code(result.code), run_code(code));
        });
    });
    it("Should not throw syntax error if a string has a line continuation", function() {
        var ast = UglifyJS.parse('var a = "a\\\nb";');
        assert.equal(ast.print_to_string(), 'var a="ab";');
    });
    it("Should throw error in strict mode if string contains escaped octalIntegerLiteral", function() {
        [
            '"use strict";\n"\\76";',
            '"use strict";\nvar foo = "\\76";',
            '"use strict";\n"\\1";',
            '"use strict";\n"\\07";',
            '"use strict";\n"\\011"',
        ].forEach(function(input) {
            assert.throws(function() {
                UglifyJS.parse(input);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error
                    && e.message === "Legacy octal escape sequences are not allowed in strict mode";
            });
        });
    });
    it("Should not throw error outside strict mode if string contains escaped octalIntegerLiteral", function() {
        [
            [ ';"\\76";', ';">";' ],
            [ ';"\\0";', ';"\\0";' ],
            [ ';"\\08"', ';"\\x008";' ],
            [ ';"\\008"', ';"\\x008";' ],
            [ ';"\\0008"', ';"\\x008";' ],
            [ ';"use\\\n strict";\n"\\07";', ';"use strict";"\07";' ],
            [ '"use strict" === "use strict";\n"\\76";', '"use strict"==="use strict";">";' ],
        ].forEach(function(test) {
            var ast = UglifyJS.parse(test[0]);
            assert.equal(ast.print_to_string(), test[1]);
        });
    });
    it("Should not throw error when digit is 8 or 9", function() {
        assert.equal(UglifyJS.parse('"use strict";;"\\08"').print_to_string(), '"use strict";;"\\x008";');
        assert.equal(UglifyJS.parse('"use strict";;"\\09"').print_to_string(), '"use strict";;"\\x009";');
    });
    it("Should not unescape unpaired surrogates", function() {
        var code = [];
        for (var i = 0; i <= 0xF; i++) {
            code.push("\\u000" + i.toString(16));
        }
        for (;i <= 0xFF; i++) {
            code.push("\\u00" + i.toString(16));
        }
        for (;i <= 0xFFF; i++) {
            code.push("\\u0" + i.toString(16));
        }
        for (; i <= 0xFFFF; i++) {
            code.push("\\u" + i.toString(16));
        }
        code = ';"' + code.join() + '"';
        var normal = UglifyJS.minify(code, {
            compress: false,
            mangle: false,
            output: {
                ascii_only: false
            }
        });
        if (normal.error) throw normal.error;
        assert.ok(code.length > normal.code.length);
        assert.strictEqual(eval(code), eval(normal.code));
        var ascii = UglifyJS.minify(code, {
            compress: false,
            mangle: false,
            output: {
                ascii_only: false
            }
        });
        if (ascii.error) throw ascii.error;
        assert.ok(code.length > ascii.code.length);
        assert.strictEqual(eval(code), eval(ascii.code));
    });
    it("Should reject invalid Unicode escape sequence", function() {
        [
            'var foo = "\\u-111"',
            'var bar = "\\u{-1}"',
            'var baz = "\\ugggg"',
        ].forEach(function(test) {
            assert.throws(function() {
                UglifyJS.parse(test);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error
                    && /^Invalid escape sequence: \\u/.test(e.message);
            }, test);
        });
    });
    it("Should reject invalid code points in Unicode escape sequence", function() {
        [
            // A bit over the valid range
            '"\\u{110000}"',
            // 32-bit overflow resulting in "a"
            '"\\u{100000061}"',
        ].forEach(function(test) {
            assert.throws(function() {
                UglifyJS.parse(test);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error
                    && /^Invalid escape sequence: \\u{1/.test(e.message);
            }, test);
        });
    });
});
