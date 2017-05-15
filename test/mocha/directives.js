var assert = require("assert");
var uglify = require("../node");

describe("Directives", function() {
    it ("Should allow tokenizer to store directives state", function() {
        var tokenizer = uglify.tokenizer("", "foo.js");

        // Stack level 0
        assert.strictEqual(tokenizer.has_directive("use strict"), false);
        assert.strictEqual(tokenizer.has_directive("use asm"), false);
        assert.strictEqual(tokenizer.has_directive("use thing"), false);

        // Stack level 2
        tokenizer.push_directives_stack();
        tokenizer.push_directives_stack();
        tokenizer.add_directive("use strict");
        assert.strictEqual(tokenizer.has_directive("use strict"), true);
        assert.strictEqual(tokenizer.has_directive("use asm"), false);
        assert.strictEqual(tokenizer.has_directive("use thing"), false);

        // Stack level 3
        tokenizer.push_directives_stack();
        tokenizer.add_directive("use strict");
        tokenizer.add_directive("use asm");
        assert.strictEqual(tokenizer.has_directive("use strict"), true);
        assert.strictEqual(tokenizer.has_directive("use asm"), true);
        assert.strictEqual(tokenizer.has_directive("use thing"), false);

        // Stack level 2
        tokenizer.pop_directives_stack();
        assert.strictEqual(tokenizer.has_directive("use strict"), true);
        assert.strictEqual(tokenizer.has_directive("use asm"), false);
        assert.strictEqual(tokenizer.has_directive("use thing"), false);

        // Stack level 3
        tokenizer.push_directives_stack();
        tokenizer.add_directive("use thing");
        tokenizer.add_directive("use\\\nasm");
        assert.strictEqual(tokenizer.has_directive("use strict"), true);
        assert.strictEqual(tokenizer.has_directive("use asm"), false); // Directives are strict!
        assert.strictEqual(tokenizer.has_directive("use thing"), true);

        // Stack level 2
        tokenizer.pop_directives_stack();
        assert.strictEqual(tokenizer.has_directive("use strict"), true);
        assert.strictEqual(tokenizer.has_directive("use asm"), false);
        assert.strictEqual(tokenizer.has_directive("use thing"), false);

        // Stack level 1
        tokenizer.pop_directives_stack();
        assert.strictEqual(tokenizer.has_directive("use strict"), false);
        assert.strictEqual(tokenizer.has_directive("use asm"), false);
        assert.strictEqual(tokenizer.has_directive("use thing"), false);

        // Stack level 0
        tokenizer.pop_directives_stack();
        assert.strictEqual(tokenizer.has_directive("use strict"), false);
        assert.strictEqual(tokenizer.has_directive("use asm"), false);
        assert.strictEqual(tokenizer.has_directive("use thing"), false);
    });

    it("Should know which strings are directive and which ones are not", function() {
        var test_directive = function(tokenizer, test) {
            test.directives.map(function(directive) {
                assert.strictEqual(tokenizer.has_directive(directive), true, "Didn't found directive `" + directive + "` at the end of `" + test.input + '`');
            });
            test.non_directives.map(function(fake_directive) {
                assert.strictEqual(tokenizer.has_directive(fake_directive), false, "Unexpectedly found directive `" + fake_directive + "` at the end of `" + test.input + '`');
            });
        }

        var tests = [
            {
                input: '"use strict"\n',
                directives: ["use strict"],
                non_directives: ["use asm"]
            },
            {
                input: '"use\\\nstrict";',
                directives: [],
                non_directives: ["use strict", "use\nstrict", "use \nstrict", "use asm"]
            },
            {
                input: '"use strict"\n"use asm"\n"use bar"\n',
                directives: ["use strict", "use asm", "use bar"],
                non_directives: ["use foo", "use\\x20strict"]
            },
            {
                input: '"use \\\nstrict";"use strict";',
                directives: [],
                non_directives: ["use strict", "use\nstrict", "use \nstrict", "use asm"]
            },
            {
                input: '"\\76";',
                directives: [],
                non_directives: [">", "\\76"]
            },
            {
                input: '"use strict"', // no ; or newline
                directives: [],
                non_directives: ["use strict", "use\nstrict", "use \nstrict", "use asm"]
            },
            {
                input: ';"use strict"',
                directives: [],
                non_directives: ["use strict", "use\nstrict", "use \nstrict", "use asm"]
            },
            // Duplicate above code but put it in a function
            {
                input: 'function foo() {"use strict"\n',
                directives: ["use strict"],
                non_directives: ["use asm"]
            },
            {
                input: 'function foo() {"use\\\nstrict";',
                directives: [],
                non_directives: ["use strict", "use\nstrict", "use \nstrict", "use asm"]
            },
            {
                input: 'function foo() {"use strict"\n"use asm"\n"use bar"\n',
                directives: ["use strict", "use asm", "use bar"],
                non_directives: ["use foo", "use\\x20strict"]
            },
            {
                input: 'function foo() {"use \\\nstrict";"use strict";',
                directives: [],
                non_directives: ["use strict", "use\nstrict", "use \nstrict", "use asm"]
            },
            {
                input: 'var foo = function() {"\\76";',
                directives: [],
                non_directives: [">", "\\76"]
            },
            {
                input: 'var foo = function() {"use strict"', // no ; or newline
                directives: [],
                non_directives: ["use strict", "use\nstrict", "use \nstrict", "use asm"]
            },
            {
                input: 'var foo = function() {;"use strict"',
                directives: [],
                non_directives: ["use strict", "use\nstrict", "use \nstrict", "use asm"]
            },
            // Special cases
            {
                input: '"1";"2";"3";"4";;"5"',
                directives: ["1", "2", "3", "4"],
                non_directives: ["5", "6", "use strict", "use asm"]
            },
            {
                input: 'if(1){"use strict";',
                directives: [],
                non_directives: ["use strict", "use\nstrict", "use \nstrict", "use asm"]
            },
            {
                input: '"use strict";try{"use asm";',
                directives: ["use strict"],
                non_directives: ["use\nstrict", "use \nstrict", "use asm"]
            },
            {
                input: 'class foo {',
                directives: ["use strict"],
                non_directives: ["use\nstrict", "use asm"]
            },
            {
                input: 'class foo {}',
                directives: [],
                non_directives: ["use strict", "use asm", "use\nstrict"]
            }
        ];

        for (var i = 0; i < tests.length; i++) {
            // Fail parser deliberately to get state at failure
            var tokenizer = uglify.tokenizer(tests[i].input + "]", "foo.js");

            try {
                var parser = uglify.parse(tokenizer);
                throw new Error("Expected parser to fail");
            } catch (e) {
                assert.strictEqual(e instanceof uglify.JS_Parse_Error, true);
                assert.strictEqual(e.message, "Unexpected token: punc (])");
            }

            test_directive(tokenizer, tests[i]);
        }
    });

    it("Should test EXPECT_DIRECTIVE RegExp", function() {
        [
            ["", true],
            ["'test';", true],
            ["'test';;", true],
            ["'tests';\n", true],
            ["'tests'", false],
            ["'tests';   \n\t", true],
            ["'tests';\n\n", true],
            ["\n\n\"use strict\";\n\n", true]
        ].forEach(function(test) {
            var out = uglify.OutputStream();
            out.print(test[0]);
            out.print_string("", null, true);
            assert.strictEqual(out.get() === test[0] + ';""', test[1], test[0]);
        });
    });

    it("Should only print 2 semicolons spread over 2 lines in beautify mode", function() {
        assert.strictEqual(
            uglify.minify(
                '"use strict";\'use strict\';"use strict";"use strict";;\'use strict\';console.log(\'use strict\');',
                {output: {beautify: true, quote_style: 3}, compress: false}
            ).code,
            '"use strict";\n\n\'use strict\';\n\n"use strict";\n\n"use strict";\n\n;\'use strict\';\n\nconsole.log(\'use strict\');'
        );
    });

    it("Should not add double semicolons in non-scoped block statements to avoid strings becoming directives", function() {
        var tests = [
            [
                '{"use\x20strict"}',
                '{"use strict"}'
            ],
            [
                'function foo(){"use\x20strict";}', // Valid place for directives
                'function foo(){"use strict"}'
            ],
            [
                'try{"use\x20strict"}catch(e){}finally{"use\x20strict"}',
                'try{"use strict"}catch(e){}finally{"use strict"}'
            ],
            [
                'if(1){"use\x20strict"} else {"use strict"}',
                'if(1){"use strict"}else{"use strict"}'
            ]
        ];

        for (var i = 0; i < tests.length; i++) {
            assert.strictEqual(
                uglify.minify(tests[i][0], {compress: false, mangle: false}).code,
                tests[i][1],
                tests[i][0]
            );
        }
    });

    it("Should add double semicolon when relying on automatic semicolon insertion", function() {
        var code = uglify.minify('"use strict";"use\\x20strict";',
            {output: {semicolons: false}, compress: false}
        ).code;
        assert.strictEqual(code, '"use strict";;"use strict"\n');
    });

    it("Should check quote style of directives", function() {
        var tests = [
            // 0. Prefer double quotes, unless string contains more double quotes than single quotes
            [
                '"testing something";',
                0,
                '"testing something";'
            ],
            [
                "'use strict';",
                0,
                '"use strict";'
            ],
            [
                '"\\\'use strict\\\'";', // Not a directive as it contains quotes
                0,
                ';"\'use strict\'";',
            ],
            [
                "'\"use strict\"';",
                0,
                "'\"use strict\"';",
            ],
            // 1. Always use single quote
            [
                '"testing something";',
                1,
                "'testing something';"
            ],
            [
                "'use strict';",
                1,
                "'use strict';"
            ],
            [
                '"\'use strict\'";',
                1,
                // Intentionally causes directive breakage at cost of less logic, usage should be rare anyway
                "'\\'use strict\\'';",
            ],
            [
                "'\\'use strict\\'';", // Not a valid directive
                1,
                "'\\'use strict\\'';" // But no ; necessary as directive stays invalid
            ],
            [
                "'\"use strict\"';",
                1,
                "'\"use strict\"';",
            ],
            // 2. Always use double quote
            [
                '"testing something";',
                2,
                '"testing something";'
            ],
            [
                "'use strict';",
                2,
                '"use strict";'
            ],
            [
                '"\'use strict\'";',
                2,
                "\"'use strict'\";",
            ],
            [
                "'\"use strict\"';",
                2,
                // Intentionally causes directive breakage at cost of less logic, usage should be rare anyway
                '"\\\"use strict\\\"";',
            ],
            [
                '"\\"use strict\\"";', // Not a valid directive
                2,
                '"\\"use strict\\"";' // But no ; necessary as directive stays invalid
            ],
            // 3. Always use original
            [
                '"testing something";',
                3,
                '"testing something";'
            ],
            [
                "'use strict';",
                3,
                "'use strict';",
            ],
            [
                '"\'use strict\'";',
                3,
                '"\'use strict\'";',
            ],
            [
                "'\"use strict\"';",
                3,
                "'\"use strict\"';",
            ],
        ];
        for (var i = 0; i < tests.length; i++) {
            assert.strictEqual(
                uglify.minify(tests[i][0], {output:{quote_style: tests[i][1]}, compress: false}).code,
                tests[i][2],
                tests[i][0] + " using mode " + tests[i][1]
            );
        }
    });
    it("Should be able to compress without side effects", function() {
        // NOTE: the "use asm" directive disables any optimisation after being defined
        var tests = [
            [
                '"use strict";"use strict";"use strict";"use foo";"use strict";;"use sloppy";doSomething("foo");',
                '"use strict";"use foo";doSomething("foo");',
                'function f(){ "use strict" }',
                'function f(){ "use asm" }',
                'function f(){ "use nondirective" }',
                'function f(){ ;"use strict" }',
                'function f(){ "use \n"; }',
            ],
            [
                 // Nothing gets optimised in the compressor because "use asm" is the first statement
                '"use asm";"use\\x20strict";1+1;',
                '"use asm";;"use strict";1+1;', // Yet, the parser noticed that "use strict" wasn't a directive
                'function f(){"use strict"}',
                'function f(){"use asm"}',
                'function f(){"use nondirective"}',
                'function f(){}',
                'function f(){}',
            ]
        ];

        for (var i = 0; i < tests.length; i++) {
            assert.strictEqual(
                uglify.minify(tests[i][0]).code,
                tests[i][1],
                tests[i][0]
            );
        }
    });
    it("Should be detect implicit usages of strict mode from tree walker", function() {
        var tests = [
            {
                input: 'class foo {bar(){_check_}}',
                directives: ["use strict"],
                non_directives: ["use bar"]
            },
            {
                input: 'class foo {bar(){}}_check_',
                directives: [],
                non_directives: ["use strict", "use bar"]
            }
        ];

        var i = 0;
        var checked;
        var checkWalker = new uglify.TreeWalker(function(node, descend) {
            if (node instanceof uglify.AST_Symbol && node.name === "_check_") {
                checked = true;
                for (var j = 0; j < tests[i].directives.length; j++) {
                    assert.ok(checkWalker.has_directive(tests[i].directives[j]),
                        "Did not found directive '" + tests[i].directives[j] +  "' in test " + tests[i].input)
                }
                for (var k = 0; k < tests[i].non_directives.length; k++) {
                    assert.equal(checkWalker.has_directive(tests[i].non_directives[k]), undefined,
                        "Found directive '" + tests[i].non_directives[k] +  "' in test " + tests[i].input)
                }
            }
        });

        for (; i < tests.length; i++) {
            // Do tests - iterate the ast in each test - check only when _check_ occurs - fail when no _check_ has been found
            checked = false;
            var ast = uglify.parse(tests[i].input);
            ast.walk(checkWalker);
            if (!checked) {
                throw "No _check_ symbol found in " + tests[i].input;
            }
        }
    });
});
