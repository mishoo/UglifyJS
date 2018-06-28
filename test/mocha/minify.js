var assert = require("assert");
var readFileSync = require("fs").readFileSync;
var run_code = require("../sandbox").run_code;
var UglifyJS = require("../../");

function read(path) {
    return readFileSync(path, "utf8");
}

describe("minify", function() {
    it("Should test basic sanity of minify with default options", function() {
        var js = 'function foo(bar) { if (bar) return 3; else return 7; var u = not_called(); }';
        var result = UglifyJS.minify(js);
        assert.strictEqual(result.code, 'function foo(n){return n?3:7}');
    });

    it("Should skip inherited keys from `files`", function() {
        var files = Object.create({ skip: this });
        files[0] = "alert(1 + 1)";
        var result = UglifyJS.minify(files);
        assert.strictEqual(result.code, "alert(2);");
    });

    it("Should work with mangle.cache", function() {
        var cache = {};
        var original = "";
        var compressed = "";
        [
            "bar.es5",
            "baz.es5",
            "foo.es5",
            "qux.js",
        ].forEach(function(file) {
            var code = read("test/input/issue-1242/" + file);
            var result = UglifyJS.minify(code, {
                mangle: {
                    cache: cache,
                    toplevel: true
                }
            });
            if (result.error) throw result.error;
            original += code;
            compressed += result.code;
        });
        assert.strictEqual(JSON.stringify(cache).slice(0, 10), '{"props":{');
        assert.strictEqual(compressed, [
            "function n(n){return 3*n}",
            "function r(n){return n/2}",
            "var c=console.log.bind(console);",
            'function o(o){c("Foo:",2*o)}',
            "var a=n(3),b=r(12);",
            'c("qux",a,b),o(11);',
        ].join(""));
        assert.strictEqual(run_code(compressed), run_code(original));
    });

    it("Should work with nameCache", function() {
        var cache = {};
        var original = "";
        var compressed = "";
        [
            "bar.es5",
            "baz.es5",
            "foo.es5",
            "qux.js",
        ].forEach(function(file) {
            var code = read("test/input/issue-1242/" + file);
            var result = UglifyJS.minify(code, {
                mangle: {
                    toplevel: true
                },
                nameCache: cache
            });
            if (result.error) throw result.error;
            original += code;
            compressed += result.code;
        });
        assert.strictEqual(JSON.stringify(cache).slice(0, 18), '{"vars":{"props":{');
        assert.strictEqual(compressed, [
            "function n(n){return 3*n}",
            "function r(n){return n/2}",
            "var c=console.log.bind(console);",
            'function o(o){c("Foo:",2*o)}',
            "var a=n(3),b=r(12);",
            'c("qux",a,b),o(11);',
        ].join(""));
        assert.strictEqual(run_code(compressed), run_code(original));
    });

    it("Should avoid mangled names in cache", function() {
        var cache = {};
        var original = "";
        var compressed = "";
        [
            '"xxxyy";var i={s:1};',
            '"xxyyy";var j={t:2,u:3},k=4;',
            'console.log(i.s,j.t,j.u,k);',
        ].forEach(function(code) {
            var result = UglifyJS.minify(code, {
                compress: false,
                mangle: {
                    properties: true,
                    toplevel: true
                },
                nameCache: cache
            });
            if (result.error) throw result.error;
            original += code;
            compressed += result.code;
        });
        assert.strictEqual(compressed, [
            '"xxxyy";var x={x:1};',
            '"xxyyy";var y={y:2,a:3},a=4;',
            'console.log(x.x,y.y,y.a,a);',
        ].join(""));
        assert.strictEqual(run_code(compressed), run_code(original));
    });

    it("Should not parse invalid use of reserved words", function() {
        assert.strictEqual(UglifyJS.minify("function enum(){}").error, undefined);
        assert.strictEqual(UglifyJS.minify("function static(){}").error, undefined);
        assert.strictEqual(UglifyJS.minify("function this(){}").error.message, "Unexpected token: name (this)");
    });

    describe("keep_quoted_props", function() {
        it("Should preserve quotes in object literals", function() {
            var js = 'var foo = {"x": 1, y: 2, \'z\': 3};';
            var result = UglifyJS.minify(js, {
                output: {
                    keep_quoted_props: true
                }});
            assert.strictEqual(result.code, 'var foo={"x":1,y:2,"z":3};');
        });

        it("Should preserve quote styles when quote_style is 3", function() {
            var js = 'var foo = {"x": 1, y: 2, \'z\': 3};';
            var result = UglifyJS.minify(js, {
                output: {
                    keep_quoted_props: true,
                    quote_style: 3
                }});
            assert.strictEqual(result.code, 'var foo={"x":1,y:2,\'z\':3};');
        });

        it("Should not preserve quotes in object literals when disabled", function() {
            var js = 'var foo = {"x": 1, y: 2, \'z\': 3};';
            var result = UglifyJS.minify(js, {
                output: {
                    keep_quoted_props: false,
                    quote_style: 3
                }});
            assert.strictEqual(result.code, 'var foo={x:1,y:2,z:3};');
        });
    });

    describe("mangleProperties", function() {
        it("Shouldn't mangle quoted properties", function() {
            var js = 'a["foo"] = "bar"; a.color = "red"; x = {"bar": 10};';
            var result = UglifyJS.minify(js, {
                compress: {
                    properties: false
                },
                mangle: {
                    properties: {
                        keep_quoted: true
                    }
                },
                output: {
                    keep_quoted_props: true,
                    quote_style: 3
                }
            });
            assert.strictEqual(result.code,
                    'a["foo"]="bar",a.a="red",x={"bar":10};');
        });
        it("Should not mangle quoted property within dead code", function() {
            var result = UglifyJS.minify('({ "keep": 1 }); g.keep = g.change;', {
                mangle: {
                    properties: {
                        keep_quoted: true
                    }
                }
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, "g.keep=g.g;");
        });
    });

    describe("#__PURE__", function() {
        it("Should drop #__PURE__ hint after use", function() {
            var result = UglifyJS.minify('//@__PURE__ comment1 #__PURE__ comment2\n foo(), bar();', {
                output: {
                    comments: "all",
                    beautify: false,
                }
            });
            var code = result.code;
            assert.strictEqual(code, "//  comment1   comment2\nbar();");
        });
        it("Should drop #__PURE__ hint if function is retained", function() {
            var result = UglifyJS.minify("var a = /*#__PURE__*/(function(){ foo(); })();", {
                output: {
                    comments: "all",
                    beautify: false,
                }
            });
            var code = result.code;
            assert.strictEqual(code, "var a=/* */function(){foo()}();");
        })
    });

    describe("JS_Parse_Error", function() {
        it("Should return syntax error", function() {
            var result = UglifyJS.minify("function f(a{}");
            var err = result.error;
            assert.ok(err instanceof Error);
            assert.strictEqual(err.stack.split(/\n/)[0], "SyntaxError: Unexpected token punc «{», expected punc «,»");
            assert.strictEqual(err.filename, "0");
            assert.strictEqual(err.line, 1);
            assert.strictEqual(err.col, 12);
        });
        it("Should reject duplicated label name", function() {
            var result = UglifyJS.minify("L:{L:{}}");
            var err = result.error;
            assert.ok(err instanceof Error);
            assert.strictEqual(err.stack.split(/\n/)[0], "SyntaxError: Label L defined twice");
            assert.strictEqual(err.filename, "0");
            assert.strictEqual(err.line, 1);
            assert.strictEqual(err.col, 4);
        });
    });

    describe("global_defs", function() {
        it("Should throw for non-trivial expressions", function() {
            var result = UglifyJS.minify("alert(42);", {
                compress: {
                    global_defs: {
                        "@alert": "debugger"
                    }
                }
            });
            var err = result.error;
            assert.ok(err instanceof Error);
            assert.strictEqual(err.stack.split(/\n/)[0], "SyntaxError: Unexpected token: keyword (debugger)");
        });
        it("Should skip inherited properties", function() {
            var foo = Object.create({ skip: this });
            foo.bar = 42;
            var result = UglifyJS.minify("alert(FOO);", {
                compress: {
                    global_defs: {
                        FOO: foo
                    }
                }
            });
            assert.strictEqual(result.code, "alert({bar:42});");
        });
    });

    describe("collapse_vars", function() {
        it("Should not produce invalid AST", function() {
            var code = [
                "function f(a) {",
                "    a = x();",
                "    return a;",
                "}",
                "f();",
            ].join("\n");
            var ast = UglifyJS.minify(code, {
                compress: false,
                mangle: false,
                output: {
                    ast: true
                },
            }).ast;
            assert.strictEqual(ast.TYPE, "Toplevel");
            assert.strictEqual(ast.body.length, 2);
            assert.strictEqual(ast.body[0].TYPE, "Defun");
            assert.strictEqual(ast.body[0].body.length, 2);
            assert.strictEqual(ast.body[0].body[0].TYPE, "SimpleStatement");
            var stat = ast.body[0].body[0];
            UglifyJS.minify(ast, {
                compress: {
                    sequences: false
                },
                mangle: false
            });
            assert.ok(stat.body);
            assert.strictEqual(stat.print_to_string(), "a=x()");
        });
    });

    describe("rename", function() {
        it("Should be repeatable", function() {
            var code = "!function(x){return x(x)}(y);";
            for (var i = 0; i < 2; i++) {
                assert.strictEqual(UglifyJS.minify(code, {
                    compress: {
                        toplevel: true,
                    },
                    rename: true,
                }).code, "var a;(a=y)(a);");
            }
        });
    });

    describe("enclose", function() {
        var code = read("test/input/enclose/input.js");
        it("Should work with true", function() {
            var result = UglifyJS.minify(code, {
                compress: false,
                enclose: true,
                mangle: false,
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, '(function(){function enclose(){console.log("test enclose")}enclose()})();');
        });
        it("Should work with arg", function() {
            var result = UglifyJS.minify(code, {
                compress: false,
                enclose: 'undefined',
                mangle: false,
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, '(function(undefined){function enclose(){console.log("test enclose")}enclose()})();');
        });
        it("Should work with arg:value", function() {
            var result = UglifyJS.minify(code, {
                compress: false,
                enclose: 'window,undefined:window',
                mangle: false,
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, '(function(window,undefined){function enclose(){console.log("test enclose")}enclose()})(window);');
        });
        it("Should work alongside wrap", function() {
            var result = UglifyJS.minify(code, {
                compress: false,
                enclose: 'window,undefined:window',
                mangle: false,
                wrap: 'exports',
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, '(function(window,undefined){(function(exports){function enclose(){console.log("test enclose")}enclose()})(typeof exports=="undefined"?exports={}:exports)})(window);');
        });
    });
});
