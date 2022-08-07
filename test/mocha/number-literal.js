var assert = require("assert");
var UglifyJS = require("../node");

describe("Number literals", function() {
    it("Should allow legacy octal literals in non-strict mode", function() {
        [
            "'use strict'\n.slice()\n00",
            '"use strict"\n.slice()\nvar foo = 00',
        ].forEach(function(input) {
            UglifyJS.parse(input);
        });
    });
    it("Should not allow legacy octal literals in strict mode", function() {
        var inputs = [
            '"use strict";00;',
            '"use strict"; var foo = 00;',
        ];
        var test = function(input) {
            return function() {
                UglifyJS.parse(input);
            }
        };
        var error = function(e) {
            return e instanceof UglifyJS.JS_Parse_Error
                && e.message === "Legacy octal literals are not allowed in strict mode";
        };
        for (var i = 0; i < inputs.length; i++) {
            assert.throws(test(inputs[i]), error, inputs[i]);
        }
    });
    it("Should parse binary, hexadecimal, octal and underscore correctly", function() {
        [
            "42",
            "4_2",
            "052",
            "0o52",
            "0O52",
            "0o5_2",
            "0x2a",
            "0X2A",
            "0x2_a",
            "0b101010",
            "0B101010",
            "0b101_010",
            "0.0000000042e+10",
            "0.0000000042E+10",
            "0.0_000000042e+10",
            "0.0000000042e+1_0",
            "0.000_000_004_2e+1_0",
            "0.000_000_004_2e+1_0-0B101_010+0x2_A-0o5_2+4_2",
        ].forEach(function(code) {
            var result = UglifyJS.minify(code, {
                expression: true,
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, "42");
        });
    });
    it("Should reject invalid use of underscore", function() {
        [
            "_42",
            "_+42",
            "+_42",
        ].forEach(function(code) {
            var node = UglifyJS.parse(code, {
                expression: true,
            });
            assert.ok(!node.is_constant(), code);
            assert.ok(!(node instanceof UglifyJS.AST_Statement), code);
        });
        [
            "42_",
            "4__2",
            "0_52",
            "05_2",
            "0_o52",
            "0o_52",
            "0.0000000042_e10",
            "0.0000000042e_10",
            "0.0000000042e_+10",
            "0.0000000042e+_10",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject invalid syntax under expression=true", function() {
        assert.throws(function() {
            UglifyJS.parse("42.g", {
                expression: true,
            });
        }, function(e) {
            return e instanceof UglifyJS.JS_Parse_Error;
        });
    });
});
