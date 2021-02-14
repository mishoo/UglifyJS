var assert = require("assert");
var UglifyJS = require("../node");

describe("export", function() {
    it("Should reject invalid `export ...` statement syntax", function() {
        [
            "export *;",
            "export A;",
            "export 42;",
            "export var;",
            "export * as A;",
            "export A as B;",
            "export const A;",
            "export function(){};",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject invalid `export { ... }` statement syntax", function() {
        [
            "export { * };",
            "export { * as A };",
            "export { 42 as A };",
            "export { A as B-C };",
            "export { default as A };",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject invalid `export default ...` statement syntax", function() {
        [
            "export default *;",
            "export default var;",
            "export default A as B;",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
    it("Should reject invalid `export ... from ...` statement syntax", function() {
        [
            "export from 'path';",
            "export * from `path`;",
            "export A as B from 'path';",
            "export default from 'path';",
            "export { A }, B from 'path';",
            "export * as A, B from 'path';",
            "export * as A, {} from 'path';",
            "export { * as A } from 'path';",
            "export { 42 as A } from 'path';",
            "export { A-B as C } from 'path';",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
});
