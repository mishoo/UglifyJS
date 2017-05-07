var UglifyJS = require("../node");
var assert = require("assert");

describe("String literals", function() {
    it("Should throw syntax error if a string literal contains a newline", function() {
        var inputs = [
            "'\n'",
            "'\r'",
            '"\r\n"',
            "'\u2028'",
            '"\u2029"'
        ];

        var test = function(input) {
            return function() {
                var ast = UglifyJS.parse(input);
            };
        };

        var error = function(e) {
            return e instanceof UglifyJS.JS_Parse_Error &&
                e.message === "Unterminated string constant";
        };

        for (var input in inputs) {
            assert.throws(test(inputs[input]), error);
        }
    });

    it("Should not throw syntax error if a string has a line continuation", function() {
        var output = UglifyJS.parse('var a = "a\\\nb";').print_to_string();
        assert.equal(output, 'var a="ab";');
    });

    it("Should throw error in strict mode if string contains escaped octalIntegerLiteral", function() {
        var inputs = [
            '"use strict";\n"\\76";',
            '"use strict";\nvar foo = "\\76";',
            '"use strict";\n"\\1";',
            '"use strict";\n"\\07";',
            '"use strict";\n"\\011"'
        ];

        var test = function(input) {
            return function() {
                var output = UglifyJS.parse(input);
            }
        };

        var error = function(e) {
            return e instanceof UglifyJS.JS_Parse_Error &&
                e.message === "Legacy octal escape sequences are not allowed in strict mode";
        }

        for (var input in inputs) {
            assert.throws(test(inputs[input]), error);
        }
    });

    it("Should not throw error outside strict mode if string contains escaped octalIntegerLiteral", function() {
        var tests = [
            ['"\\76";', ';">";'],
            ['"\\0"', '"\\0";'],
            ['"\\08"', '"\\08";'],
            ['"\\008"', '"\\08";'],
            ['"\\0008"', '"\\08";'],
            ['"use strict" === "use strict";\n"\\76";', '"use strict"==="use strict";">";'],
            ['"use\\\n strict";\n"\\07";', ';"use strict";"\07";']
        ];

        for (var test in tests) {
            var output = UglifyJS.parse(tests[test][0]).print_to_string();
            assert.equal(output, tests[test][1]);
        }
    });

    it("Should not throw error when digit is 8 or 9", function() {
        assert.equal(UglifyJS.parse('"use strict";"\\08"').print_to_string(), '"use strict";"\\08";');
        assert.equal(UglifyJS.parse('"use strict";"\\09"').print_to_string(), '"use strict";"\\09";');
    });
});
