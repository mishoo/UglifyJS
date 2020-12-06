var assert = require("assert");
var UglifyJS = require("../node");

describe("async", function() {
    it("Should reject `await` as symbol name within async functions only", function() {
        [
            "function await() {}",
            "function(await) {}",
            "function() { await; }",
            "function() { await:{} }",
            "function() { var await; }",
            "function() { function await() {} }",
            "function() { try {} catch (await) {} }",
        ].forEach(function(code) {
            UglifyJS.parse("(" + code + ")();");
            assert.throws(function() {
                UglifyJS.parse("(async " + code + ")();");
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
});
