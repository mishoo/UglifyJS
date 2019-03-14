var assert = require("assert");
var UglifyJS = require("../node");

describe("Directives", function() {
    it("Should allow tokenizer to store directives state", function() {
        var tokenizer = UglifyJS.tokenizer("", "foo.js");
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
        [
            [
                '"use strict"\n',
                [ "use strict"],
                [ "use asm"]
            ],
            [
                '"use\\\nstrict";',
                [],
                [ "use strict", "use\nstrict", "use \nstrict", "use asm" ]
            ],
            [
                '"use strict"\n"use asm"\n"use bar"\n',
                [ "use strict", "use asm", "use bar" ],
                [ "use foo", "use\\x20strict" ]
            ],
            [
                '"use \\\nstrict";"use strict";',
                [],
                [ "use strict", "use\nstrict", "use \nstrict", "use asm" ]
            ],
            [
                '"\\76";',
                [],
                [ ">", "\\76" ]
            ],
            [
                // no ; or newline
                '"use strict"',
                [],
                [ "use strict", "use\nstrict", "use \nstrict", "use asm" ]
            ],
            [
                ';"use strict"',
                [],
                [ "use strict", "use\nstrict", "use \nstrict", "use asm" ]
            ],
            // Duplicate above code but put it in a function
            [
                'function foo() {"use strict"\n',
                [ "use strict" ],
                [ "use asm" ]
            ],
            [
                'function foo() {"use\\\nstrict";',
                [],
                [ "use strict", "use\nstrict", "use \nstrict", "use asm" ]
            ],
            [
                'function foo() {"use strict"\n"use asm"\n"use bar"\n',
                [ "use strict", "use asm", "use bar" ],
                [ "use foo", "use\\x20strict" ]
            ],
            [
                'function foo() {"use \\\nstrict";"use strict";',
                [],
                [ "use strict", "use\nstrict", "use \nstrict", "use asm" ]
            ],
            [
                'var foo = function() {"\\76";',
                [],
                [ ">", "\\76" ]
            ],
            [
                'var foo = function() {"use strict"', // no ; or newline
                [],
                [ "use strict", "use\nstrict", "use \nstrict", "use asm" ]
            ],
            [
                'var foo = function() {;"use strict"',
                [],
                [ "use strict", "use\nstrict", "use \nstrict", "use asm" ]
            ],
            // Special cases
            [
                '"1";"2";"3";"4";;"5"',
                [ "1", "2", "3", "4" ],
                [ "5", "6", "use strict", "use asm" ]
            ],
            [
                'if(1){"use strict";',
                [],
                [ "use strict", "use\nstrict", "use \nstrict", "use asm" ]
            ],
            [
                '"use strict";try{"use asm";',
                [ "use strict" ],
                [ "use\nstrict", "use \nstrict", "use asm" ]
            ],
        ].forEach(function(test) {
            var tokenizer = UglifyJS.tokenizer(test[0] + "]", "foo.js");
            assert.throws(function() {
                UglifyJS.parse(tokenizer);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error
                    && /^Unexpected token: punc «]»/.test(e.message)
            }, test[0]);
            test[1].forEach(function(directive) {
                assert.strictEqual(tokenizer.has_directive(directive), true, directive + " in " + test[0]);
            });
            test[2].forEach(function(fake_directive) {
                assert.strictEqual(tokenizer.has_directive(fake_directive), false, fake_directive + " in " + test[0]);
            });
        });
    });
    it("Should test EXPECT_DIRECTIVE RegExp", function() {
        [
            [ "", true ],
            [ "'test';", true ],
            [ "'test';;", true ],
            [ "'tests';\n", true ],
            [ "'tests'", false ],
            [ "'tests';   \n\t", true ],
            [ "'tests';\n\n", true ],
            [ "\n\n\"use strict\";\n\n", true ],
        ].forEach(function(test) {
            var out = UglifyJS.OutputStream();
            out.print(test[0]);
            out.print_string("", null, true);
            assert.strictEqual(out.get() === test[0] + ';""', test[1], test[0]);
        });
    });
    it("Should only print 2 semicolons spread over 2 lines in beautify mode", function() {
        var result = UglifyJS.minify([
            '"use strict";',
            "'use strict';",
            '"use strict";',
            '"use strict";;',
            "'use strict';",
            "console.log('use strict');"
        ].join(""), {
            compress: false,
            output: {
                beautify: true,
                quote_style: 3
            }
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, [
            '"use strict";',
            "'use strict';",
            '"use strict";',
            '"use strict";',
            ";'use strict';",
            "console.log('use strict');"
        ].join("\n\n"));
    });
    it("Should not add double semicolons in non-scoped block statements to avoid strings becoming directives", function() {
        [
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
        ].forEach(function(test) {
            var result = UglifyJS.minify(test[0], {
                compress: false,
                mangle: false
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, test[1], test[0]);
        });
    });
    it("Should add double semicolon when relying on automatic semicolon insertion", function() {
        var result = UglifyJS.minify('"use strict";"use\\x20strict";', {
            compress: false,
            output: {
                semicolons: false
            }
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, '"use strict";;"use strict"\n');
    });
    it("Should check quote style of directives", function() {
        [
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
        ].forEach(function(test) {
            var result = UglifyJS.minify(test[0], {
                compress: false,
                output: {
                    quote_style: test[1]
                }
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, test[2], test[0] + " using mode " + test[1]);
        });
    });
    it("Should be able to compress without side effects", function() {
        [
            [
                '"use strict";"use strict";"use strict";"use foo";"use strict";;"use sloppy";doSomething("foo");',
                '"use strict";doSomething("foo");'
            ],
            [
                // Nothing gets optimised in the compressor because "use asm" is the first statement
                '"use asm";"use\\x20strict";1+1;',
                // Yet, the parser noticed that "use strict" wasn't a directive
                '"use asm";;"use strict";1+1;',
            ],
            [
                'function f(){ "use strict" }',
                'function f(){}'
            ],
            [
                'function f(){ "use asm" }',
                'function f(){"use asm"}'
            ],
            [
                'function f(){ "use nondirective" }',
                'function f(){}'
            ],
            [
                'function f(){ ;"use strict" }',
                'function f(){}'
            ],
            [
                'function f(){ "use \\n"; }',
                'function f(){}'
            ],
        ].forEach(function(test) {
            var result = UglifyJS.minify(test[0]);
            if (result.error) throw result.error;
            assert.strictEqual(result.code, test[1], test[0]);
        });
    });
});
