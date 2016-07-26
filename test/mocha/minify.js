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

    describe('Unary operators', function () {
        it('Should preserve a space before increment/decrement', function () {
            var js = 'var a = 1 + ++1;var b = 2 - ++1;';
            var result = Uglify.minify(js, { fromString: true });
            assert.strictEqual(result.code, 'var a=1+ ++1,b=2- ++1;');
        });
    });

});
