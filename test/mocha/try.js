var assert = require("assert");
var uglify = require("../../");

describe("Try", function() {
    it("Should not allow catch with an empty parameter", function() {
        var tests = [
            "try {} catch() {}"
        ];

        var test = function(code) {
            return function () {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function (e) {
            return e instanceof uglify.JS_Parse_Error;
        }
        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error, tests[i]);
        }
    });
});
