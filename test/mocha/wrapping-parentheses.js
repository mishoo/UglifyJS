var assert = require("assert");
var uglify = require("../../");

describe("Keep wrapping parentheses", function() {
	it("Should keep wrapping parentheses if keep-fparens option is turned on", function() {
		var originalCode = "define(\"module\",(function() {module.exports = 42;}));";
		var expectedCode = "define(\"module\",(function(){module.exports=42}));";
		var result = uglify.minify(originalCode, {
			output: {
				keep_fparens: true
			},
			fromString: true
		});
		assert.strictEqual(result.code, expectedCode);
	});

	it("Should strip wrapping parentheses if keep-fparens option is turned off or not set", function() {
		var originalCode = "define(\"module\",(function() {module.exports = 42;}));";
		var expectedCode = "define(\"module\",function(){module.exports=42});";
		var result = uglify.minify(originalCode, {
			fromString: true
		});
		assert.strictEqual(result.code, expectedCode);
	});
});
