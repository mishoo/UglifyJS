var assert = require("assert");
var UglifyJS = require("../node");

describe("async", function() {
    it("Should reject `await` as symbol name within async functions only", function() {
        [
            "function await() {}",
            "function(await) {}",
            "function() { await; }",
            "function() { await: {} }",
            "function() { var await; }",
            "function() { function await() {} }",
            "function() { try {} catch (await) {} }",
        ].forEach(function(code) {
            var ast = UglifyJS.parse("(" + code + ")();");
            assert.strictEqual(ast.TYPE, "Toplevel");
            assert.strictEqual(ast.body.length, 1);
            assert.strictEqual(ast.body[0].TYPE, "SimpleStatement");
            assert.strictEqual(ast.body[0].body.TYPE, "Call");
            assert.strictEqual(ast.body[0].body.expression.TYPE, "Function");
            assert.throws(function() {
                UglifyJS.parse("(async " + code + ")();");
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject `await` expression outside of async functions", function() {
        [
            "await 42;",
            "function f() { await 42; }",
            "async function f() { function g() { await 42; } }",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject `await` expression directly on computed key of function argument", function() {
        [
            "function f({ [await 42]: a }) {}",
            "async function f({ [await 42]: a }) {}",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should accept `await` expression nested within computed key of function argument", function() {
        [
            "function f({ [async function() { await 42; }()]: a }) {}",
            "async function f({ [async function() { await 42; }()]: a }) {}",
        ].forEach(function(code) {
            var ast = UglifyJS.parse(code);
            assert.strictEqual(ast.TYPE, "Toplevel");
            assert.strictEqual(ast.body.length, 1);
            assert.strictEqual(ast.body[0].argnames.length, 1);
            assert.strictEqual(ast.body[0].argnames[0].TYPE, "DestructuredObject");
        });
    });
});
