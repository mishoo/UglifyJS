var assert = require("assert");
var uglify = require("../../");

describe("Arrow functions", function() {
    it("Should not accept spread tokens on non-last parameters or without arguments parentheses", function() {
        var tests = [
            "var a = ...a => {return a.join()}",
            "var b = (a, ...b, c) => { return a + b.join() + c}",
            "var c = (...a, b) => a.join()"
        ];
        var test = function(code) {
            return function() {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "SyntaxError: Unexpected token: expand (...)";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error);
        }
    });
    it("Should not accept holes in object binding patterns, while still allowing a trailing elision", function() {
        var tests = [
            "f = ({, , ...x} = [1, 2]) => {};"
        ];
        var test = function(code) {
            return function() {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "SyntaxError: Unexpected token: punc (,)";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error);
        }
    });
    it("Should not accept newlines before arrow token", function() {
        var tests = [
            "f = foo\n=> 'foo';",
            "f = (foo, bar)\n=> 'foo';",
            "f = ()\n=> 'foo';",
            "foo((bar)\n=>'baz';);"
        ];
        var test = function(code) {
            return function() {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "SyntaxError: Unexpected newline before arrow (=>)";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error);
        }
    });
    it("Should not accept arrow functions in the middle or end of an expression", function() {
        var tests = [
            "typeof x => 0",
            "0 + x => 0"
        ];
        var test = function(code) {
            return function() {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "SyntaxError: Unexpected token: arrow (=>)";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error);
        }
    });
});
