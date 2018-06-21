var assert = require("assert");
var UglifyJS = require("../..");

describe("ie8", function() {
    it("Should be able to minify() with undefined as catch parameter in a try...catch statement", function() {
        assert.strictEqual(
            UglifyJS.minify([
                "function a(b){",
                "    try {",
                "        throw 'Stuff';",
                "    } catch (undefined) {",
                "        console.log('caught: ' + undefined);",
                "    }",
                "    console.log('undefined is ' + undefined);",
                "    return b === undefined;",
                "};",
            ].join("\n")).code,
            'function a(o){try{throw"Stuff"}catch(o){console.log("caught: "+o)}return console.log("undefined is "+void 0),void 0===o}'
        );
    });
});
