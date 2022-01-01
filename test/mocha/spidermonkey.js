var assert = require("assert");
var exec = require("child_process").exec;
var semver = require("semver");
var UglifyJS = require("../..");

describe("spidermonkey export/import sanity test", function() {
    it("Should produce a functional build when using --self with spidermonkey", function(done) {
        this.timeout(120000);
        var uglifyjs = '"' + process.argv[0] + '" bin/uglifyjs';
        var options = semver.satisfies(process.version, "<=0.12") ? "-mc hoist_funs" : "-mc";
        var command = [
            [
                uglifyjs,
                "--self",
                options,
                "--wrap SpiderUglify",
                "-o spidermonkey",
            ].join(" "),
            [
                uglifyjs,
                "-p spidermonkey",
                options,
            ].join(" "),
        ].join(" | ");
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

    it("Should not add unnecessary escape slashes to RegExp", function() {
        var input = "/[\\\\/]/;";
        var ast = UglifyJS.parse(input).to_mozilla_ast();
        assert.strictEqual(UglifyJS.AST_Node.from_mozilla_ast(ast).print_to_string(), input);
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

        var checkWalker = new UglifyJS.TreeWalker(function(node, descend) {
            if (node instanceof UglifyJS.AST_String) {
                counter_strings++;
            } else if (node instanceof UglifyJS.AST_Directive) {
                counter_directives++;
            }
        });

        for (var i = 0; i < tests.length; i++) {
            counter_directives = 0;
            counter_strings = 0;

            var ast = UglifyJS.parse(tests[i].input);
            var moz_ast = ast.to_mozilla_ast();
            var from_moz_ast = UglifyJS.AST_Node.from_mozilla_ast(moz_ast);

            from_moz_ast.walk(checkWalker);

            assert.strictEqual(counter_directives, tests[i].directives, "Directives count mismatch for test " + tests[i].input);
            assert.strictEqual(counter_strings, tests[i].strings, "String count mismatch for test " + tests[i].input);
        }
    });
});
