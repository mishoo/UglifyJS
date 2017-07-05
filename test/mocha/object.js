var Uglify = require("../node");
var assert = require("assert");

describe("Object", function() {
    it("Should allow objects to have a methodDefinition as property", function() {
        var code = "var a = {test() {return true;}}";
        assert.equal(Uglify.minify(code, {
            compress: {
                arrows: false
            }
        }).code, "var a={test(){return!0}};");
    });

    it("Should not allow objects to use static keywords like in classes", function() {
        var code = "{static test() {}}";
        var parse = function() {
            Uglify.parse(code);
        }
        var expect = function(e) {
            return e instanceof Uglify.JS_Parse_Error;
        }
        assert.throws(parse, expect);
    });

    it("Should not allow objects to have static computed properties like in classes", function() {
        var code = "var foo = {static [123](){}}";
        var parse = function() {
            console.log(Uglify.parse(code).body[0].body[0]);
        }
        var expect = function(e) {
            return e instanceof Uglify.JS_Parse_Error;
        }
        assert.throws(parse, expect);
    });
    it("Should not accept operator tokens as property/getter/setter name", function() {
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
                results.push({
                    code: "var obj = { " + illegalOperators[i] + ': "123"};',
                    operator: illegalOperators[i],
                    method: "key"
                });
                results.push({
                    code: "var obj = { " + illegalOperators[i] + "(){ return test; }};",
                    operator: illegalOperators[i],
                    method: "method"
                });
            }

            return results;
        };

        var testCase = function(data) {
            return function() {
                Uglify.parse(data.code);
            };
        };

        var fail = function(data) {
            return function (e) {
                return e instanceof Uglify.JS_Parse_Error && (
                    e.message === "Unexpected token: operator (" + data.operator + ")" ||
                    (e.message === "Unterminated regular expression" && data.operator[0] === "/") ||
                    (e.message === "Unexpected token: punc (()" && data.operator === "*")
                );
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
    it("Should be able to use shorthand properties", function() {
        var ast = Uglify.parse("var foo = 123\nvar obj = {foo: foo}");
        assert.strictEqual(ast.print_to_string({ecma: 6}), "var foo=123;var obj={foo};");
    })
});
