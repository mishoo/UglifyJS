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
                e.message === "Yield cannot be used as label inside generators";
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
                e.message === "Unexpected token: punc (;)";
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
                e.message === "Unexpected token: operator (*)";
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
});