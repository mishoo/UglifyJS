var assert = require("assert");
var uglify = require("../../");

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
});