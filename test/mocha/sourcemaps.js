var assert = require("assert");
var readFileSync = require("fs").readFileSync;
var Uglify = require("../../");

function read(path) {
    return readFileSync(path, "utf8");
}

function source_map(code) {
    return JSON.parse(Uglify.minify(code, {
        compress: false,
        mangle: false,
        sourceMap: true,
    }).map);
}

describe("sourcemaps", function() {
    it("Should give correct version", function() {
        var map = source_map("var x = 1 + 1;");
        assert.strictEqual(map.version, 3);
        assert.deepEqual(map.names, [ "x" ]);
    });

    it("Should give correct names", function() {
        var map = source_map([
            "({",
            "    get enabled() {",
            "        return 3;",
            "    },",
            "    set enabled(x) {",
            "        ;",
            "    }",
            "});",
        ].join("\n"));
        assert.deepEqual(map.names, [ "enabled", "x" ]);
    });

    it("Should mark array/object literals", function() {
        var result = Uglify.minify([
            "var obj = {};",
            "obj.wat([]);",
        ].join("\n"), {
            sourceMap: true,
            toplevel: true,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, "({}).wat([]);");
        assert.strictEqual(result.map, '{"version":3,"sources":["0"],"names":["wat"],"mappings":"CAAU,IACNA,IAAI"}');
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
                assert.strictEqual(result.code, "var bar=function(bar){return bar};");
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
});
