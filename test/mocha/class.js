var assert = require("assert");
var uglify = require("../node");

describe("Class", function() {
    it("Should not accept spread on non-last parameters in methods", function() {
        var tests = [
            "class foo { bar(...a, b) { return a.join(b) } }",
            "class foo { bar(a, b, ...c, d) { return c.join(a + b) + d } }",
            "class foo { *bar(...a, b) { return a.join(b) } }",
            "class foo { *bar(a, b, ...c, d) { return c.join(a + b) + d } }"
        ];
        var test = function(code) {
            return function() {
                uglify.parse(code);
            }
        }
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                /^Unexpected token: /.test(e.message);
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error);
        }
    });

    it("Should return the correct token for class methods", function() {
        var tests = [
            {
                code: "class foo{static test(){}}",
                token_value_start: "static",
                token_value_end: "}"
            },
            {
                code: "class bar{*procedural(){}}",
                token_value_start: "*",
                token_value_end: "}"
            },
            {
                code: "class foobar{aMethod(){}}",
                token_value_start: "aMethod",
                token_value_end: "}"
            },
            {
                code: "class foobaz{get something(){}}",
                token_value_start: "get",
                token_value_end: "}"
            }
        ];

        for (var i = 0; i < tests.length; i++) {
            var ast = uglify.parse(tests[i].code);
            assert.strictEqual(ast.body[0].properties[0].start.value, tests[i].token_value_start);
            assert.strictEqual(ast.body[0].properties[0].end.value, tests[i].token_value_end);
        }
    });
});
