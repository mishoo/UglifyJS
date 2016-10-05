var Uglify = require('../../');
var assert = require("assert");

describe("mangle_properties 'debug' option ", function() {
    it("Should test the 'debug' option of mangle_properties works with no cache passed", function() {
        var js = 'var o = {}; o.foo = "bar";';
		
		var ast = Uglify.parse(js);
		ast.figure_out_scope();
		ast = Uglify.mangle_properties(ast, {
			debug: true
		});
		
		let stream = Uglify.OutputStream();
		ast.print(stream);
		var result = stream.toString();
		
		// Should match: var o={};o._$foo$NNN$="bar";
		// where NNN is a number.
        assert(/var o=\{\};o\._\$foo\$\d+\$_="bar";/.test(result));
    });
	
    it("Should test the 'debug' option of mangle_properties works with a cache passed", function() {
        var js = 'var o = {}; o.foo = "bar";';
		
		var ast = Uglify.parse(js);
		ast.figure_out_scope();
		ast = Uglify.mangle_properties(ast, {
			cache: {
				cname: -1,
				props: new Uglify.Dictionary()
			},
			debug: true
		});
		
		let stream = Uglify.OutputStream();
		ast.print(stream);
		var result = stream.toString();
		
		assert.strictEqual(result, 'var o={};o._$foo$_="bar";');
    });
});
