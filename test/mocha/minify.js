var Uglify = require('../../');
var assert = require("assert");
var readFileSync = require("fs").readFileSync;
var run_code = require("../sandbox").run_code;

function read(path) {
    return readFileSync(path, "utf8");
}

describe("minify", function() {
    it("Should test basic sanity of minify with default options", function() {
        var js = 'function foo(bar) { if (bar) return 3; else return 7; var u = not_called(); }';
        var result = Uglify.minify(js);
        assert.strictEqual(result.code, 'function foo(n){return n?3:7}');
    });

    it("Should skip inherited keys from `files`", function() {
        var files = Object.create({ skip: this });
        files[0] = "alert(1 + 1)";
        var result = Uglify.minify(files);
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
            var result = Uglify.minify(code, {
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
            "var o=console.log.bind(console);",
            'function c(n){o("Foo:",2*n)}',
            "var a=n(3),b=r(12);",
            'o("qux",a,b),c(11);',
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
            var result = Uglify.minify(code, {
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
            "var o=console.log.bind(console);",
            'function c(n){o("Foo:",2*n)}',
            "var a=n(3),b=r(12);",
            'o("qux",a,b),c(11);',
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
            var result = Uglify.minify(code, {
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
        assert.strictEqual(Uglify.minify("function enum(){}").error, undefined);
        assert.strictEqual(Uglify.minify("function static(){}").error, undefined);
        assert.strictEqual(Uglify.minify("function super(){}").error.message, "Unexpected token: name (super)");
        assert.strictEqual(Uglify.minify("function this(){}").error.message, "Unexpected token: name (this)");
    });

    describe("keep_quoted_props", function() {
        it("Should preserve quotes in object literals", function() {
            var js = 'var foo = {"x": 1, y: 2, \'z\': 3};';
            var result = Uglify.minify(js, {
                output: {
                    keep_quoted_props: true
                }});
            assert.strictEqual(result.code, 'var foo={"x":1,y:2,"z":3};');
        });

        it("Should preserve quote styles when quote_style is 3", function() {
            var js = 'var foo = {"x": 1, y: 2, \'z\': 3};';
            var result = Uglify.minify(js, {
                output: {
                    keep_quoted_props: true,
                    quote_style: 3
                }});
            assert.strictEqual(result.code, 'var foo={"x":1,y:2,\'z\':3};');
        });

        it("Should not preserve quotes in object literals when disabled", function() {
            var js = 'var foo = {"x": 1, y: 2, \'z\': 3};';
            var result = Uglify.minify(js, {
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
            var result = Uglify.minify(js, {
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
            var result = Uglify.minify('({ "keep": 1 }); g.keep = g.change;', {
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

    describe("inSourceMap", function() {
        it("Should read the given string filename correctly when sourceMapIncludeSources is enabled (#1236)", function() {
            var result = Uglify.minify(read("./test/input/issue-1236/simple.js"), {
                sourceMap: {
                    content: read("./test/input/issue-1236/simple.js.map"),
                    filename: "simple.min.js",
                    includeSources: true
                }
            });

            var map = JSON.parse(result.map);

            assert.equal(map.file, 'simple.min.js');
            assert.equal(map.sourcesContent.length, 1);
            assert.equal(map.sourcesContent[0],
                'let foo = x => "foo " + x;\nconsole.log(foo("bar"));');
        });
        it("Should process inline source map", function() {
            var code = Uglify.minify(read("./test/input/issue-520/input.js"), {
                compress: { toplevel: true },
                sourceMap: {
                    content: "inline",
                    url: "inline"
                }
            }).code + "\n";
            assert.strictEqual(code, readFileSync("test/input/issue-520/output.js", "utf8"));
        });
        it("Should warn for missing inline source map", function() {
            var warn_function = Uglify.AST_Node.warn_function;
            var warnings = [];
            Uglify.AST_Node.warn_function = function(txt) {
                warnings.push(txt);
            };
            try {
                var result = Uglify.minify(read("./test/input/issue-1323/sample.js"), {
                    mangle: false,
                    sourceMap: {
                        content: "inline"
                    }
                });
                assert.strictEqual(result.code, "var bar=function(){return function(bar){return bar}}();");
                assert.strictEqual(warnings.length, 1);
                assert.strictEqual(warnings[0], "inline source map not found");
            } finally {
                Uglify.AST_Node.warn_function = warn_function;
            }
        });
        it("Should fail with multiple input and inline source map", function() {
            var result = Uglify.minify([
                read("./test/input/issue-520/input.js"),
                read("./test/input/issue-520/output.js")
            ], {
                sourceMap: {
                    content: "inline",
                    url: "inline"
                }
            });
            var err = result.error;
            assert.ok(err instanceof Error);
            assert.strictEqual(err.stack.split(/\n/)[0], "Error: inline source map only works with singular input");
        });
    });

    describe("sourceMapInline", function() {
        it("should append source map to output js when sourceMapInline is enabled", function() {
            var result = Uglify.minify('var a = function(foo) { return foo; };', {
                sourceMap: {
                    url: "inline"
                }
            });
            var code = result.code;
            assert.strictEqual(code, "var a=function(n){return n};\n" +
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsiYSIsImZvbyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsRUFBSSxTQUFTQyxHQUFPLE9BQU9BIn0=");
        });
        it("should not append source map to output js when sourceMapInline is not enabled", function() {
            var result = Uglify.minify('var a = function(foo) { return foo; };');
            var code = result.code;
            assert.strictEqual(code, "var a=function(n){return n};");
        });
        it("should work with max_line_len", function() {
            var result = Uglify.minify(read("./test/input/issue-505/input.js"), {
                output: {
                    max_line_len: 20
                },
                sourceMap: {
                    url: "inline"
                }
            });
            assert.strictEqual(result.error, undefined);
            assert.strictEqual(result.code, read("./test/input/issue-505/output.js"));
        });
    });

    describe("#__PURE__", function() {
        it("should drop #__PURE__ hint after use", function() {
            var result = Uglify.minify('//@__PURE__ comment1 #__PURE__ comment2\n foo(), bar();', {
                output: {
                    comments: "all",
                    beautify: false,
                }
            });
            var code = result.code;
            assert.strictEqual(code, "//  comment1   comment2\nbar();");
        });
        it("should drop #__PURE__ hint if function is retained", function() {
            var result = Uglify.minify("var a = /*#__PURE__*/(function(){ foo(); })();", {
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
        it("should return syntax error", function() {
            var result = Uglify.minify("function f(a{}");
            var err = result.error;
            assert.ok(err instanceof Error);
            assert.strictEqual(err.stack.split(/\n/)[0], "SyntaxError: Unexpected token punc «{», expected punc «,»");
            assert.strictEqual(err.filename, "0");
            assert.strictEqual(err.line, 1);
            assert.strictEqual(err.col, 12);
        });
    });

    describe("global_defs", function() {
        it("should throw for non-trivial expressions", function() {
            var result = Uglify.minify("alert(42);", {
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
        it("should skip inherited properties", function() {
            var foo = Object.create({ skip: this });
            foo.bar = 42;
            var result = Uglify.minify("alert(FOO);", {
                compress: {
                    global_defs: {
                        FOO: foo
                    }
                }
            });
            assert.strictEqual(result.code, "alert({bar:42});");
        });
    });

    describe("duplicated block-scoped declarations", function() {
        [
            "let a=1;let a=2;",
            "let a=1;var a=2;",
            "var a=1;let a=2;",
            "let[a]=[1];var a=2;",
            "let a=1;var[a]=[2];",
            "let[a]=[1];var[a]=[2];",
            "const a=1;const a=2;",
            "const a=1;var a=2;",
            "var a=1;const a=2;",
            "const[a]=[1];var a=2;",
            "const a=1;var[a]=[2];",
            "const[a]=[1];var[a]=[2];",
        ].forEach(function(code) {
            it(code, function() {
                var result = Uglify.minify(code, {
                    compress: false,
                    mangle: false
                });
                assert.strictEqual(result.error, undefined);
                assert.strictEqual(result.code, code);
                result = Uglify.minify(code);
                var err = result.error;
                assert.ok(err instanceof Error);
                assert.strictEqual(err.stack.split(/\n/)[0], "SyntaxError: a redeclared");
            });
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
            var ast = Uglify.minify(code, {
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
            Uglify.minify(ast, {
                compress: {
                    sequences: false
                },
                mangle: false
            });
            assert.ok(stat.body);
            assert.strictEqual(stat.print_to_string(), "a=x()");
        });
    });

    // rename is disabled on harmony due to expand_names bug in for-of loops
    if (0) describe("rename", function() {
        it("Should be repeatable", function() {
            var code = "!function(x){return x(x)}(y);";
            for (var i = 0; i < 2; i++) {
                assert.strictEqual(Uglify.minify(code, {
                    compress: {
                        toplevel: true,
                    },
                    rename: true,
                }).code, "var a;(a=y)(a);");
            }
        });
    });
});
