var Uglify = require('../../');
var assert = require("assert");

describe("minify", function() {
    it("Should test basic sanity of minify with default options", function() {
        var js = 'function foo(bar) { if (bar) return 3; else return 7; var u = not_called(); }';
        var result = Uglify.minify(js, {fromString: true});
        assert.strictEqual(result.code, 'function foo(n){return n?3:7}');
    });

    describe("keep_quoted_props", function() {
        it("Should preserve quotes in object literals", function() {
            var js = 'var foo = {"x": 1, y: 2, \'z\': 3};';
            var result = Uglify.minify(js, {
                fromString: true, output: {
                    keep_quoted_props: true
                }});
            assert.strictEqual(result.code, 'var foo={"x":1,y:2,"z":3};');
        });

        it("Should preserve quote styles when quote_style is 3", function() {
            var js = 'var foo = {"x": 1, y: 2, \'z\': 3};';
            var result = Uglify.minify(js, {
                fromString: true, output: {
                    keep_quoted_props: true,
                    quote_style: 3
                }});
            assert.strictEqual(result.code, 'var foo={"x":1,y:2,\'z\':3};');
        });

        it("Should not preserve quotes in object literals when disabled", function() {
            var js = 'var foo = {"x": 1, y: 2, \'z\': 3};';
            var result = Uglify.minify(js, {
                fromString: true, output: {
                    keep_quoted_props: false,
                    quote_style: 3
                }});
            assert.strictEqual(result.code, 'var foo={x:1,y:2,z:3};');
        });
    });

    describe("mangleProperties", function() {
        it("Shouldn't mangle quoted properties", function() {
            var js = 'a["foo"] = "bar"; a.color = "red"; x = {"bar": 10};';
            var result = Uglify.minify(js, {
                fromString: true,
                compress: {
                    properties: false
                },
                mangleProperties: {
                    ignore_quoted: true
                },
                output: {
                    keep_quoted_props: true,
                    quote_style: 3
                }
            });
            assert.strictEqual(result.code,
                    'a["foo"]="bar",a.a="red",x={"bar":10};');
        });
    });

    describe("inSourceMap", function() {
        it("Should read the given string filename correctly when sourceMapIncludeSources is enabled (#1236)", function() {
            var result = Uglify.minify('./test/input/issue-1236/simple.js', {
                outSourceMap: "simple.min.js.map",
                inSourceMap: "./test/input/issue-1236/simple.js.map",
                sourceMapIncludeSources: true
            });

            var map = JSON.parse(result.map);

            assert.equal(map.file, 'simple.min.js');
            assert.equal(map.sourcesContent.length, 1);
            assert.equal(map.sourcesContent[0],
                'let foo = x => "foo " + x;\nconsole.log(foo("bar"));');
        });
    });

    describe("sourceMapInline", function() {
        it("should append source map to output js when sourceMapInline is enabled", function() {
            var result = Uglify.minify('var a = function(foo) { return foo; };', {
                fromString: true,
                sourceMapInline: true
            });
            var code = result.code;
            assert.strictEqual(code, "var a=function(n){return n};\n" +
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIj8iXSwibmFtZXMiOlsiYSIsImZvbyJdLCJtYXBwaW5ncyI6IkFBQUEsR0FBSUEsR0FBSSxTQUFTQyxHQUFPLE1BQU9BIn0=");
        });
        it("should not append source map to output js when sourceMapInline is not enabled", function() {
            var result = Uglify.minify('var a = function(foo) { return foo; };', {
                fromString: true
            });
            var code = result.code;
            assert.strictEqual(code, "var a=function(n){return n};");
        });
    });
});
