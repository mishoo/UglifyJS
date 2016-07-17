var Uglify = require("../../");
var assert = require("assert");

describe("Object", function() {
    it ("Should allow objects to have a methodDefinition as property", function() {
        var code = "var a = {test() {return true;}}";
        assert.equal(Uglify.minify(code, {fromString: true}).code, "var a={test(){return!0}};");
    });

    it ("Should not allow objects to use static keywords like in classes", function() {
        var code = "{static test() {}}";
        var parse = function() {
            Uglify.parse(code);
        }
        var expect = function(e) {
            return e instanceof Uglify.JS_Parse_Error;
        }
        assert.throws(parse, expect);
    });
});