var acorn = require("acorn");
var assert = require("assert");
var UglifyJS = require("../node");

describe("import", function() {
    it("Should reject invalid `import` statement syntax", function() {
        [
            "import *;",
            "import A;",
            "import {};",
            "import `path`;",
            "{ import 'path'; }",
            "import from 'path';",
            "if (0) import 'path';",
            "import * from 'path';",
            "import 'A' from 'path';",
            "import A-B from 'path';",
            "import A as B from 'path';",
            "import { A }, B from 'path';",
            "import * as 'A' from 'path';",
            "import * as A-B from 'path';",
            "import * as A, B from 'path';",
            "import * as A, {} from 'path';",
            "import { * as A } from 'path';",
            "import { * as 'A' } from 'path';",
            "import { * as A-B } from 'path';",
            "function f() { import 'path'; }",
            "import { 42 as A } from 'path';",
            "import { A-B as C } from 'path';",
            "import { 'A' as 'B' } from 'path';",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should compare `import` statements correctly", function() {
        [
            "import 'foo';",
            "import 'path';",
            "import A from 'path';",
            "import { A } from 'path';",
            "import * as A from 'path';",
            "import A, { B } from 'path';",
            "import A, * as B from 'path';",
            "import { A as B } from 'path';",
            "import A, { B, C as D } from 'path';",
        ].forEach(function(c, i, stats) {
            var s = UglifyJS.parse(c);
            assert.ok(s instanceof UglifyJS.AST_Toplevel, c);
            assert.strictEqual(s.body.length, 1, c);
            assert.ok(s.body[0] instanceof UglifyJS.AST_Import, c);
            stats.forEach(function(d, j) {
                var t = UglifyJS.parse(d);
                assert.ok(t instanceof UglifyJS.AST_Toplevel, d);
                assert.strictEqual(t.body.length, 1, d);
                assert.ok(t.body[0] instanceof UglifyJS.AST_Import, d);
                assert.strictEqual(s.equals(t), i === j, c + "\n" + d);
            });
        });
    });
    it("Should interoperate with ESTree correctly", function() {
        [
            "import A from 'path';",
            "import * as A from 'path';",
            "import A, * as B from 'path';",
            "import { '42' as A, B } from 'path';",
            "import A, { '42' as B } from 'path';",
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
