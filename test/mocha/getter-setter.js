var UglifyJS = require("../node");
var assert = require("assert");

describe("Getters and setters", function() {
    it("Should not accept operator symbols as getter/setter name", function() {
        var illegalOperators = [
            "++",
            "--",
            "+",
            "-",
            "!",
            "~",
            "&",
            "|",
            "^",
            "*",
            "/",
            "%",
            ">>",
            "<<",
            ">>>",
            "<",
            ">",
            "<=",
            ">=",
            "==",
            "===",
            "!=",
            "!==",
            "?",
            "=",
            "+=",
            "-=",
            "/=",
            "*=",
            "%=",
            ">>=",
            "<<=",
            ">>>=",
            "|=",
            "^=",
            "&=",
            "&&",
            "||"
        ];
        var generator = function() {
            var results = [];

            for (var i in illegalOperators) {
                results.push({
                    code: "var obj = { get " + illegalOperators[i] + "() { return test; }};",
                    operator: illegalOperators[i],
                    method: "get"
                });
                results.push({
                    code: "var obj = { set " + illegalOperators[i] + "(value) { test = value}};",
                    operator: illegalOperators[i],
                    method: "set"
                });
            }

            return results;
        };

        var testCase = function(data) {
            return function() {
                UglifyJS.parse(data.code);
            };
        };

        var fail = function(data) {
            return function (e) {
                return e instanceof UglifyJS.JS_Parse_Error &&
                    /^Unexpected token: /.test(e.message);
            };
        };

        var errorMessage = function(data) {
            return "Expected but didn't get a syntax error while parsing following line:\n" + data.code;
        };

        var tests = generator();
        for (var i = 0; i < tests.length; i++) {
            var test = tests[i];
            assert.throws(testCase(test), fail(test), errorMessage(test));
        }
    });

});
