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
                outSourceMap: "simple.js.min.map",
                inSourceMap: "./test/input/issue-1236/simple.js.map",
                sourceMapIncludeSources: true
            });

            var map = JSON.parse(result.map);

            assert.equal(map.sourcesContent.length, 1);
            assert.equal(map.sourcesContent[0],
                'let foo = x => "foo " + x;\nconsole.log(foo("bar"));');
        });
    });
});
