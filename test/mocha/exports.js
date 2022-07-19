var acorn = require("acorn");
var assert = require("assert");
var UglifyJS = require("../node");

describe("export", function() {
    it("Should reject invalid `export ...` statement syntax", function() {
        [
            "export *;",
            "export A;",
            "export 42;",
            "export var;",
            "export * as A;",
            "export A as B;",
            "export const A;",
            "export function(){};",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject invalid `export { ... }` statement syntax", function() {
        [
            "export { * };",
            "export { * as A };",
            "export { 42 as A };",
            "export { 'A' as B };",
            "export { A as B-C };",
            "export { default as A };",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject invalid `export default ...` statement syntax", function() {
        [
            "export default *;",
            "export default var;",
            "export default A as B;",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject invalid `export ... from ...` statement syntax", function() {
        [
            "export from 'path';",
            "export A from 'path';",
            "export * from `path`;",
            "export 'A' from 'path';",
            "export A as B from 'path';",
            "export 'A' as B from 'path';",
            "export default from 'path';",
            "export { A }, B from 'path';",
            "export * as A, B from 'path';",
            "export * as A, {} from 'path';",
            "export { * as A } from 'path';",
            "export { 42 as A } from 'path';",
            "export { A-B as C } from 'path';",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject `export` statement not under top-level scope", function() {
        [
            "{ export {}; }",
            "if (0) export var A;",
            "function f() { export default 42; }",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should compare `export` statements correctly", function() {
        var stats = {
            Declaration: [
                "export let A;",
                "export const A = 42;",
                "export var { A, B: [] } = C;",
                "export function A() { return B(A); }",
                "export async function* A({}, ...[]) { return B(A); }",
            ],
            Default: [
                "export default 42;",
                "export default A => A(B);",
                "export default class A extends B {}",
                "export default (class A extends B {});",
                "export default class A { static C = 42; }",
                "export default class A extends B { static C = 42; }",
            ],
            Foreign: [
                "export * from 'path';",
                "export {} from 'path';",
                "export * as A from 'path';",
                "export { default } from 'path';",
                "export { A, B as C } from 'path';",
                "export { A, default as C } from 'path';",
            ],
            References: [
                "export {};",
                "export { A };",
                "export { A as B };",
                "export { A, B as C };",
                "export { A as default };",
            ],
        };
        for (var k in stats) stats[k].forEach(function(c, i) {
            var s = UglifyJS.parse(c);
            assert.ok(s instanceof UglifyJS.AST_Toplevel, c);
            assert.strictEqual(s.body.length, 1, c);
            assert.strictEqual(s.body[0].TYPE, "Export" + k, c);
            for (var l in stats) stats[l].forEach(function(d, j) {
                var t = UglifyJS.parse(d);
                assert.ok(t instanceof UglifyJS.AST_Toplevel, d);
                assert.strictEqual(t.body.length, 1, d);
                assert.strictEqual(t.body[0].TYPE, "Export" + l, d);
                assert.strictEqual(s.equals(t), k === l && i === j, c + "\n" + d);
            });
        });
    });
    it("Should interoperate with ESTree correctly", function() {
        [
            "export var A = 42;",
            "export default (class A {});",
            "var A; export { A as '42' };",
            "export { '42' } from 'path';",
            "export * as '42' from 'path';",
        ].forEach(function(code) {
            var ast = UglifyJS.parse(code);
            try {
                var spidermonkey = ast.to_mozilla_ast();
            } catch (ex) {
                assert.fail("[to_mozilla_ast] " + ex.stack);
            }
            try {
                var ast2 = UglifyJS.AST_Node.from_mozilla_ast(spidermonkey);
            } catch (ex) {
                assert.fail("[from_mozilla_ast] " + ex.stack);
            }
            assert.strictEqual(ast2.print_to_string(), ast.print_to_string(), [
                "spidermonkey:",
                ast.print_to_string(),
                ast2.print_to_string(),
            ].join("\n"));
            try {
                var acorn_est = acorn.parse(code, {
                    ecmaVersion: "latest",
                    locations: true,
                    sourceType: "module",
                });
            } catch (ex) {
                assert.fail("[acorn.parse] " + ex.stack);
            }
            try {
                var ast3 = UglifyJS.AST_Node.from_mozilla_ast(acorn_est);
            } catch (ex) {
                assert.fail("[from_acorn] " + ex.stack);
            }
            assert.strictEqual(ast3.print_to_string(), ast.print_to_string(), [
                "acorn:",
                ast.print_to_string(),
                ast3.print_to_string(),
            ].join("\n"));
        });
    });
});
