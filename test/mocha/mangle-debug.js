var Uglify = require('../../');
var assert = require("assert");

describe("mangle_properties 'debug' option ", function() {
    it("Should test the 'debug' option of mangle_properties works as expected", function() {
        var js = 'var o = {}; o.foo = "bar";';
        
        var ast = Uglify.parse(js);
        ast.figure_out_scope();
        ast = Uglify.mangle_properties(ast, {
            debug: true
        });
        
        var stream = Uglify.OutputStream();
        ast.print(stream);
        var result = stream.toString();
        
        // Should match: var o={};o._$foo$NNN="bar";
        // where NNN is a number.
        assert(/var o=\{\};o\._\$foo\$\d+_="bar";/.test(result));
    });
});
