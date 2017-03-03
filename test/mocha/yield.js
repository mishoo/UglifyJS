var UglifyJS = require("../../");
var assert = require("assert");

describe("Yield", function() {
    it("Should not delete statements after yield", function() {
        var js = 'function *foo(bar) { yield 1; yield 2; return 3; }';
        var result = UglifyJS.minify(js, {fromString: true});
        assert.strictEqual(result.code, 'function*foo(e){return yield 1,yield 2,3}');
    });

    it("Should not allow yield as labelIdentifier within generators", function() {
        var js = "function* g() {yield: 1}"
        var test = function() {
            UglifyJS.parse(js);
        }
        var expect = function(e) {
            return e instanceof UglifyJS.JS_Parse_Error &&
                e.message === "SyntaxError: Yield cannot be used as label inside generators";
        }
        assert.throws(test, expect);
    });

    it("Should not allow yield* followed by a semicolon in generators", function() {
        var js = "function* test() {yield*\n;}";
        var test = function() {
            UglifyJS.parse(js);
        }
        var expect = function(e) {
            return e instanceof UglifyJS.JS_Parse_Error &&
                e.message === "SyntaxError: Unexpected token: punc (;)";
        }
        assert.throws(test, expect);
    });

    it("Should not allow yield with next token star on next line", function() {
        var js = "function* test() {yield\n*123;}";
        var test = function() {
            UglifyJS.parse(js);
        }
        var expect = function(e) {
            return e instanceof UglifyJS.JS_Parse_Error &&
                e.message === "SyntaxError: Unexpected token: operator (*)";
        }
        assert.throws(test, expect);
    });

    it("Should be able to compress its expression", function() {
        assert.strictEqual(
            UglifyJS.minify("function *f() { yield 3-4; }", {fromString: true, compress: true}).code,
            "function*f(){yield-1}"
        );
    });

    it("Should keep undefined after yield without compression if found in ast", function() {
        assert.strictEqual(
            UglifyJS.minify("function *f() { yield undefined; yield; yield* undefined; yield void 0}", {fromString: true, compress: false}).code,
            "function*f(){yield undefined;yield;yield*undefined;yield void 0}"
        );
    });

    it("Should be able to drop undefined after yield if necessary with compression", function() {
        assert.strictEqual(
            UglifyJS.minify("function *f() { yield undefined; yield; yield* undefined; yield void 0}", {fromString: true, compress: true}).code,
            "function*f(){yield,yield,yield*void 0,yield}"
        );
    });

    it("Should not allow yield to be used as symbol, identifier or property outside generators in strict mode", function() {
        var tests = [
            // Fail as as_symbol
            '"use strict"; import yield from "bar";',
            '"use strict"; yield = 123;',
            '"use strict"; yield: "123";',
            '"use strict"; for(;;){break yield;}',
            '"use strict"; for(;;){continue yield;}',
            '"use strict"; function yield(){}',
            '"use strict"; function foo(...yield){}',
            '"use strict"; try { new Error("")} catch (yield) {}',
            '"use strict"; var yield = "foo";',
            '"use strict"; class yield {}',

            // Fail as maybe_assign
            '"use strict"; var foo = yield;',
            '"use strict"; var foo = bar = yield',

            // Fail as as_property_name
            '"use strict"; var foo = {yield};',
            '"use strict"; var bar = {yield: "foo"};'
        ];

        var fail = function(e) {
            return e instanceof UglifyJS.JS_Parse_Error &&
                /SyntaxError: Unexpected yield identifier (?:as parameter )?inside strict mode/.test(e.message);
        }

        var test = function(input) {
            return function() {
                UglifyJS.parse(input);
            }
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), fail, tests[i]);
        }
    });
});