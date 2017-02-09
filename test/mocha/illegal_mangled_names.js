/**
 * Created by anatd on 2/9/2017.
 */
var assert = require("assert");
var uglify = require("../../");

describe("verify that the mangled names are legal", function () {
    it("Should not mangle properties to names in the illegal_mangled_names param", function () {
        var js = 'a["foo"] = "bar"; a.color = "red"; x = {"bar": 10};';
        var result = uglify.minify(js, {
            fromString: true,
            compress: {
                properties: false
            },
            mangleProperties: {
                ignore_quoted: true,
                illegal_mangled_names: ["a"]
            },
            output: {
                keep_quoted_props: true,
                quote_style: 3
            }
        });
        assert.strictEqual(result.code,
            'a["foo"]="bar",a.b="red",x={"bar":10};');
    });
    it("Should not mangle names to names in the illegal_mangled_names param", function () {
        var js = 'var a; a["foo"] = "bar"; a.color = "red"; x = {"bar": 10};';
        var result = uglify.minify(js, {
            fromString: true,
            compress: {
                properties: false
            },
            mangleProperties: {
                ignore_quoted: true
            },
            mangle: {toplevel: true, illegal_mangled_names: ["r", "a"]},
            output: {
                keep_quoted_props: true,
                quote_style: 3
            }
        });
        assert.strictEqual(result.code,
            'var b;b["foo"]="bar",b.a="red",x={"bar":10};');
    });
    it("Should not fail without illegal_mangled_names param", function () {
        var js = 'var b; b["foo"] = "bar"; b.color = "red"; x = {"bar": 10};';
        var result = uglify.minify(js, {
            fromString: true,
            compress: {
                properties: false
            },
            mangleProperties: {
                ignore_quoted: true
            },
            mangle: {toplevel: true},
            output: {
                keep_quoted_props: true,
                quote_style: 3
            }
        });
        assert.strictEqual(result.code,
            'var a;a["foo"]="bar",a.a="red",x={"bar":10};');
    });
});
