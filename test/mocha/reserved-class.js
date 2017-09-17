var Uglify = require('../../');
var assert = require("assert");

describe("mangle: reserved_class", function () {
    var input_js = `
(function() {
    class Foo extends HTMLElement {}
    Foo.reg;
    class Hello extends HTMLElement {} 
    Hello.reg;
})();   
`;
    var output_js = '!function(){class e extends HTMLElement{}e.reg;class Hello extends HTMLElement{}Hello.reg}();'

    it("Should test mangle with reserved_class.", function () {
        var result = Uglify.minify(input_js, {
            mangle: { 
                reserved: ['Hello'],
                properties: false,
                keep_classnames: false,
            },
        });
        assert.strictEqual(result.code, output_js);
    });


});
