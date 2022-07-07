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
            "import A as B from 'path';",
            "import { A }, B from 'path';",
            "import * as A, B from 'path';",
            "import * as A, {} from 'path';",
            "import { * as A } from 'path';",
            "function f() { import 'path'; }",
            "import { 42 as A } from 'path';",
            "import { A-B as C } from 'path';",
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
});
