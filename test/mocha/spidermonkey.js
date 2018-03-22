var assert = require("assert");
var fs = require("fs");
var exec = require("child_process").exec;
var acorn = require("acorn");
var escodegen = require("escodegen");
var uglify = require("../node");

describe("spidermonkey export/import sanity test", function() {
    it("should produce a functional build when using --self with spidermonkey", function(done) {
        this.timeout(60000);

        var uglifyjs = '"' + process.argv[0] + '" bin/uglifyjs';
        var command = uglifyjs + " --self -cm --wrap SpiderUglify -o spidermonkey | " +
            uglifyjs + " -p spidermonkey -cm";

        exec(command, { maxBuffer: 1048576 }, function(err, stdout) {
            if (err) throw err;

            eval(stdout);
            assert.strictEqual(typeof SpiderUglify, "object");
            var result = SpiderUglify.minify("foo([true,,2+3]);");
            assert.strictEqual(result.error, undefined);
            assert.strictEqual(result.code, "foo([!0,,5]);");

            done();
        });
    });

    it("Should judge between directives and strings correctly on import", function() {
        var tests = [
            {
                input: '"use strict";;"use sloppy"',
                directives: 1,
                strings: 1
            },
            {
                input: ';"use strict"',
                directives: 0,
                strings: 1
            },
            {
                input: '"use strict"; "use something else";',
                directives: 2,
                strings: 0
            },
            {
                input: 'function foo() {"use strict";;"use sloppy" }',
                directives: 1,
                strings: 1
            },
            {
                input: 'function foo() {;"use strict" }',
                directives: 0,
                strings: 1
            },
            {
                input: 'function foo() {"use strict"; "use something else"; }',
                directives: 2,
                strings: 0
            },
            {
                input: 'var foo = function() {"use strict";;"use sloppy" }',
                directives: 1,
                strings: 1
            },
            {
                input: 'var foo = function() {;"use strict" }',
                directives: 0,
                strings: 1
            },
            {
                input: 'var foo = function() {"use strict"; "use something else"; }',
                directives: 2,
                strings: 0
            },
            {
                input: '{"use strict";;"use sloppy" }',
                directives: 0,
                strings: 2
            },
            {
                input: '{;"use strict" }',
                directives: 0,
                strings: 1
            },
            {
                input: '{"use strict"; "use something else"; }',
                directives: 0,
                strings: 2
            }
        ];

        var counter_directives;
        var counter_strings;

        var checkWalker = new uglify.TreeWalker(function(node, descend) {
            if (node instanceof uglify.AST_String) {
                counter_strings++;
            } else if (node instanceof uglify.AST_Directive) {
                counter_directives++;
            }
        });

        for (var i = 0; i < tests.length; i++) {
            counter_directives = 0;
            counter_strings = 0;

            var ast = uglify.parse(tests[i].input);
            var moz_ast = ast.to_mozilla_ast();
            var from_moz_ast = uglify.AST_Node.from_mozilla_ast(moz_ast);

            from_moz_ast.walk(checkWalker);

            assert.strictEqual(counter_directives, tests[i].directives, "Directives count mismatch for test " + tests[i].input);
            assert.strictEqual(counter_strings, tests[i].strings, "String count mismatch for test " + tests[i].input);
        }
    });

    it("should output and parse ES6 code correctly", function() {
        var code = fs.readFileSync("test/input/spidermonkey/input.js", "utf-8");
        var uglify_ast = uglify.parse(code);
        var moz_ast = uglify_ast.to_mozilla_ast();
        var from_moz_ast = uglify.AST_Node.from_mozilla_ast(moz_ast);
        assert.strictEqual(
            from_moz_ast.print_to_string(),
            uglify_ast.print_to_string()
        );
    });

    it("should be capable of importing from acorn", function() {
        var code = fs.readFileSync("test/input/spidermonkey/input.js", "utf-8");
        var uglify_ast = uglify.parse(code);
        var moz_ast = acorn.parse(code, {sourceType: 'module', ecmaVersion: 9});
        var from_moz_ast = uglify.AST_Node.from_mozilla_ast(moz_ast);
        assert.strictEqual(
            from_moz_ast.print_to_string(),
            uglify_ast.print_to_string()
        );
    });

    it("should produce an AST compatible with escodegen", function() {
        var code = fs.readFileSync("test/input/spidermonkey/input.js", "utf-8");
        var uglify_ast = uglify.parse(code);
        var moz_ast = uglify_ast.to_mozilla_ast();
        assert.strictEqual(
            escodegen.generate(moz_ast, {
                format: {
                    indent: {
                        style: "",
                    },
                    newline: "",
                    space:  "",
                    quotes: "double"
                }
            })
                .replace(/;}/g, "}")
                .replace(/var {/g, "var{")
                .replace(/var \[/g, "var[")
                .replace(/const {/g, "const{")
                .replace(/const \[/g, "const[")
                .replace(/get \"/g, "get\"")
                .replace(/set \"/g, "set\"")
                .replace(/\[object Object\].\[object Object\]/g, "new.target")  // escodegen issue
                .replace(/\(await x\)/, "await x")
            ,
            uglify_ast.print_to_string({
                keep_quoted_props: true
            })
        );
    });
});
