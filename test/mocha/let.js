var assert = require("assert");
var UglifyJS = require("../node");

describe("let", function() {
    this.timeout(30000);
    it("Should not produce reserved keywords as variable name in mangle", function() {
        // Produce a lot of variables in a function and run it through mangle.
        var s = '"dddddeeeeelllllooooottttt"; function foo() {';
        for (var i = 0; i < 18000; i++) {
            s += "var v" + i + "=[];";
        }
        s += '}';
        var result = UglifyJS.minify(s, {
            compress: false,
        });
        if (result.error) throw result.error;
        // Verify that select keywords and reserved keywords not produced
        [
            "do",
            "let",
            "var",
        ].forEach(function(name) {
            assert.strictEqual(result.code.indexOf("var " + name + "="), -1);
        });
        // Verify that the variable names that appeared immediately before
        // and after the erroneously generated variable name still exist
        // to show the test generated enough symbols.
        [
            "to", "eo",
            "eet", "fet",
            "rar", "oar",
        ].forEach(function(name) {
            assert.notStrictEqual(result.code.indexOf("var " + name + "="), -1);
        });
    });
    it("Should quote mangled properties that are reserved keywords", function() {
        var s = '"rrrrrnnnnniiiiiaaaaa";';
        for (var i = 0; i < 18000; i++) {
            s += "v.b" + i + "=v;";
        }
        var result = UglifyJS.minify(s, {
            compress: false,
            ie: true,
            mangle: {
                properties: {
                    domprops: true,
                },
            },
        });
        if (result.error) throw result.error;
        [
            "in",
            "var",
        ].forEach(function(name) {
            assert.notStrictEqual(result.code.indexOf('v["' + name + '"]'), -1);
        });
    });
    it("Should parse `let` as name correctly", function() {
        [
            "for(var let;let;let)let;",
            "function let(let){let}",
        ].forEach(function(code) {
            var ast = UglifyJS.parse(code);
            assert.strictEqual(ast.print_to_string(), code);
            assert.throws(function() {
                UglifyJS.parse('"use strict";' + code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error && e.message == "Unexpected let in strict mode";
            }, code);
        });
    });
    it("Should throw on ambiguous use of `let`", function() {
        [
            "export let",
            [
                "let",
                "console.log(42)",
            ].join("\n"),
            [
                "let",
                "[ console.log(42) ]",
            ].join("\n"),
            [
                "let",
                "{",
                "    console.log(42)",
                "}",
            ].join("\n"),
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
});
