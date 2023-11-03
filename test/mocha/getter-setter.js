var assert = require("assert");
var UglifyJS = require("../node");

describe("Getters and setters", function() {
    it("Should not accept operator symbols as getter/setter name", function() {
        [
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
        ].reduce(function(tests, illegalOperator) {
            tests.push({
                code: "var obj = { get " + illegalOperator + "() { return test; }};",
                operator: illegalOperator,
            });
            tests.push({
                code: "var obj = { set " + illegalOperator + "(value) { test = value; }};",
                operator: illegalOperator,
            });
            return tests;
        }, []).forEach(function(test) {
            assert.throws(function() {
                UglifyJS.parse(test.code);
            }, test.operator == "=" ? function(e) {
                return e instanceof UglifyJS.JS_Parse_Error
                    && /^Unexpected token: punc «{», expected: punc «.*?»$/.test(e.message);
            } : function(e) {
                return e instanceof UglifyJS.JS_Parse_Error
                    && e.message === "Unexpected token: operator «" + test.operator + "»";
            }, "Expected but didn't get a syntax error while parsing following line:\n" + test.code);
        });
    });
});
