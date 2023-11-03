var assert = require("assert");
var UglifyJS = require("../node");

describe("generator", function() {
    it("Should reject `yield` as symbol name within generator functions only", function() {
        [
            "function yield() {}",
            "function(yield) {}",
            "function() { yield: {} }",
            "function() { var yield; }",
            "function() { function yield() {} }",
            "function() { try {} catch (yield) {} }",
        ].forEach(function(code) {
            var ast = UglifyJS.parse("(" + code + ")();");
            assert.strictEqual(ast.TYPE, "Toplevel");
            assert.strictEqual(ast.body.length, 1);
            assert.strictEqual(ast.body[0].TYPE, "SimpleStatement");
            assert.strictEqual(ast.body[0].body.TYPE, "Call");
            assert.strictEqual(ast.body[0].body.expression.TYPE, "Function");
            assert.throws(function() {
                UglifyJS.parse("(" + code.replace(/^function/, "function*") + ")();");
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject `yield` expression outside of generator functions", function() {
        [
            "yield 42;",
            "function f() { yield 42; }",
            "function* f() { function g() { yield 42; } }",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject `yield` expression directly on computed key of function argument", function() {
        [
            "function f({ [yield 42]: a }) {}",
            "function* f({ [yield 42]: a }) {}",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should accept `yield` expression nested within computed key of function argument", function() {
        [
            "function f({ [function*() { yield 42; }()]: a }) {}",
            "function* f({ [function*() { yield 42; }()]: a }) {}",
        ].forEach(function(code) {
            var ast = UglifyJS.parse(code);
            assert.strictEqual(ast.TYPE, "Toplevel");
            assert.strictEqual(ast.body.length, 1);
            assert.strictEqual(ast.body[0].argnames.length, 1);
            assert.strictEqual(ast.body[0].argnames[0].TYPE, "DestructuredObject");
        });
    });
    it("Should reject `yield*` without an expression", function() {
        [
            "yield*",
            "yield*;",
            "yield*,",
            "(yield*)",
            "[ yield* ]",
            "42[yield*]",
            "yield* && 42",
        ].forEach(function(code) {
            code = "function* f() { " + code + " }";
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
});
