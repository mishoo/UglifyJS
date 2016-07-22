var assert = require("assert");
var uglify = require("../../");

describe("Unicode", function() {
    it("Should not accept invalid code ranges in unicode escape", function() {
        var tests = [
            "\\u{110000}", // A bit over the unicode range
            "\\u{100000061} = 'foo'", // 32-bit overflow resulting in "a"
            "\\u{fffffffffff}", // A bit too much over the unicode range
        ];

        var exec = function(test) {
            return function() {
                uglify.parse(test);
            }
        }

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error
                && e.message === "SyntaxError: Unicode reference out of bounce";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(exec(tests[i]), fail);
        }
    });

    it("Should not accept invalid unicode sequences", function() {
        var tests = [
            "var foo = '\\u-111'",
            "var bar = '\\u{-1}'",
            "var baz = '\\ugggg'"
        ];

        var exec = function(test) {
            return function() {
                uglify.parse(test);
            }
        }

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error
                && e.message === "SyntaxError: Invalid hex-character pattern in string";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(exec(tests[i]), fail);
        }
    });

    it("Should throw error if escaped first identifier char is not part of ID_start", function() {
        var tests = [
            'var \\u{0} = "foo";',
            'var \\u{10ffff} = "bar";',
            'var \\u000a = "what\'s up";',
             // Valid ID_Start, but using up 2 escaped characters and not fitting in IdentifierStart
            'var \\ud800\\udc00 = "Hello";',
            'var \\udbff\\udfff = "Unicode";', // Same as previous test
            'var \\ud800\udc01 = "Weird unicode";', // Same as above, but mixed escaped with unicode chars
        ];

        var exec = function(test) {
            return function() {
                uglify.parse(test);
            }
        }

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error
                && e.message === "SyntaxError: First identifier char is an invalid identifier char";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(exec(tests[i]), fail);
        }
    });

    it("Should throw error if escaped non-first identifier char is not part of ID_start", function() {
        var tests = [
            'var a\\u{0} = "foo";',
            'var a\\u{10ffff} = "bar";',
            'var z\\u000a = "what\'s up";'
        ];

        var exec = function(test) {
            return function() {
                uglify.parse(test);
            }
        }

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error
                && e.message === "SyntaxError: Invalid escaped identifier char";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(exec(tests[i]), fail);
        }
    });

    it("Should throw error if identifier is a keyword with a escape sequences", function() {
        var tests = [
            'var \\u0069\\u006e = "foo"',        // in
            'var \\u0076\\u0061\\u0072 = "bar"', // var
            'var \\u{66}\\u{6f}\\u{72} = "baz"', // for
            'var \\u0069\\u{66} = "foobar"',     // if
            'var \\u{73}uper'                    // super
        ];

        var exec = function(test) {
            return function() {
                uglify.parse(test);
            }
        }

        var fail = function(e) {
            return e instanceof uglify.JS_Parse_Error
                && e.message === "SyntaxError: Escaped characters are not allowed in keywords";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(exec(tests[i]), fail);
        }
    });

    it("Should read strings containing surigates correctly", function() {
        var tests = [
            ['var a = "\ud800\udc00";', 'var a="\\u{10000}";'],
            ['var b = "\udbff\udfff";', 'var b="\\u{10ffff}";']
        ];

        for (var i = 0; i < tests.length; i++) {
            assert.strictEqual(uglify.minify(tests[i][0], {
                fromString: true, output: { ascii_only: true, ecma: 6}
            }).code, tests[i][1]);
        }
    });
});
