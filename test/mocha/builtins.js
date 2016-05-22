var UglifyJS = require("../../");
var assert = require("assert");

describe("builtins", function() {
    it ("Should not mangle builtins", function() {
        var test = "function foo(something){\n" +
            "    return [Object,Array,Function,Number,String,Boolean,Error,Math,Date,RegExp,Symbol,something];\n" +
            "};";

        var result = UglifyJS.minify(test, {fromString: true, parse: {bare_returns: true}}).code;

        assert.strictEqual(result.indexOf("something"), -1);

        assert.notEqual(result.indexOf("Object"), -1);
        assert.notEqual(result.indexOf("Array"), -1);
        assert.notEqual(result.indexOf("Function"), -1);
        assert.notEqual(result.indexOf("Number"), -1);
        assert.notEqual(result.indexOf("String"), -1);
        assert.notEqual(result.indexOf("Boolean"), -1);
        assert.notEqual(result.indexOf("Error"), -1);
        assert.notEqual(result.indexOf("Math"), -1);
        assert.notEqual(result.indexOf("Date"), -1);
        assert.notEqual(result.indexOf("RegExp"), -1);
        assert.notEqual(result.indexOf("Symbol"), -1);
    });
});
