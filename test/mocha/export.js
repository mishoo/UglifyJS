var assert = require("assert");
var uglify = require("../../");

describe("Export", function() {
    it ("Should parse export directives", function() {

        var inputs = [
            ['export * from "a.js"', ['*'], "a.js"],
            ['export {A} from "a.js"', ['A'], "a.js"],
            ['export {A as X} from "a.js"', ['X'], "a.js"],
            ['export {A as Foo, B} from "a.js"', ['Foo', 'B'], "a.js"],
            ['export {A, B} from "a.js"', ['A', 'B'], "a.js"],
        ];

        var test = function(code) {
            return uglify.parse(code, {fromString: true});
        };

        var extractNames = function(symbols) {
            var ret = [];
            for (var i = 0; i < symbols.length; i++) {
                ret.push(symbols[i].name.name)
            }
            return ret;
        };

        for (var i = 0; i < inputs.length; i++) {
            var ast = test(inputs[i][0]);
            var names = inputs[i][1];
            var filename = inputs[i][2];
            assert(ast instanceof uglify.AST_Toplevel);
            assert.equal(ast.body.length, 1);
            var st = ast.body[0];
            assert(st instanceof uglify.AST_Export);
            var actualNames = extractNames(st.exported_names);
            assert.deepEqual(actualNames, names);
            assert.equal(st.module_name.value, filename)
        }
    })
});