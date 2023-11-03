var assert = require("assert");
var fs = require("fs");
var UglifyJS = require("../node");

function read(path) {
    return fs.readFileSync(path, "utf8");
}

function source_map(code) {
    var result = UglifyJS.minify(code, {
        compress: false,
        mangle: false,
        sourceMap: true,
    });
    if (result.error) throw result.error;
    return JSON.parse(result.map);
}

function get_map() {
    return {
        "version": 3,
        "sources": [ "index.js" ],
        "names": [],
        "mappings": ";;AAAA,IAAI,MAAM,SAAN,GAAM;AAAA,SAAK,SAAS,CAAd;AAAA,CAAV;AACA,QAAQ,GAAR,CAAY,IAAI,KAAJ,CAAZ",
        "file": "bundle.js",
        "sourcesContent": [ "let foo = x => \"foo \" + x;\nconsole.log(foo(\"bar\"));" ],
    };
}

function prepare_map(sourceMap) {
    var code = [
        '"use strict";',
        "",
        "var foo = function foo(x) {",
        '  return "foo " + x;',
        "};",
        'console.log(foo("bar"));',
        "",
        "//# sourceMappingURL=bundle.js.map",
    ].join("\n");
    var result = UglifyJS.minify(code, {
        sourceMap: {
            content: sourceMap,
            includeSources: true,
        },
    });
    if (result.error) throw result.error;
    return JSON.parse(result.map);
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
    it("Should work with sourceMap.names=true", function() {
        var result = UglifyJS.minify([
            "var obj = {",
            "    p: a,",
            "    q: b",
            "};",
        ].join("\n"), {
            compress: false,
            mangle: false,
            sourceMap: {
                names: true,
            },
        });
        if (result.error) throw result.error;
        var map = JSON.parse(result.map);
        assert.deepEqual(map.names, [ "obj", "p", "a", "q", "b" ]);
    });
    it("Should work with sourceMap.names=false", function() {
        var result = UglifyJS.minify([
            "var obj = {",
            "    p: a,",
            "    q: b",
            "};",
        ].join("\n"), {
            compress: false,
            mangle: false,
            sourceMap: {
                names: false,
            },
        });
        if (result.error) throw result.error;
        var map = JSON.parse(result.map);
        assert.deepEqual(map.names, []);
    });
    it("Should mark class properties", function() {
        var result = UglifyJS.minify([
            "class A {",
            "    static P = 42",
            "    set #q(v) {}",
            "}",
        ].join("\n"), {
            sourceMap: true,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, "class A{static P=42;set#q(s){}}");
        assert.strictEqual(result.map, '{"version":3,"sources":["0"],"names":["A","P","#q","v"],"mappings":"MAAMA,EACFC,SAAW,GACXC,MAAOC,IACX"}');
    });
    it("Should mark array/object literals", function() {
        var result = UglifyJS.minify([
            "var obj = {};",
            "obj.wat([]);",
        ].join("\n"), {
            sourceMap: true,
            toplevel: true,
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, "({}).wat([]);");
        assert.strictEqual(result.map, '{"version":3,"sources":["0"],"names":["wat"],"mappings":"CAAU,IACNA,IAAI,EAAE"}');
    });
    it("Should give correct sourceRoot", function() {
        var code = "console.log(42);";
        var result = UglifyJS.minify(code, {
            sourceMap: {
                root: "//foo.bar/",
            },
        });
        if (result.error) throw result.error;
        assert.strictEqual(result.code, code);
        assert.strictEqual(result.map, '{"version":3,"sourceRoot":"//foo.bar/","sources":["0"],"names":["console","log"],"mappings":"AAAAA,QAAQC,IAAI,EAAE"}');
    });
    it("Should produce same source map with DOS or UNIX line endings", function() {
        var code = [
            'console.log("\\',
            'hello",',
            '"world");',
        ];
        var dos = UglifyJS.minify(code.join("\r\n"), {
            sourceMap: true,
        });
        if (dos.error) throw dos.error;
        var unix = UglifyJS.minify(code.join("\n"), {
            sourceMap: true,
        });
        if (unix.error) throw unix.error;
        assert.strictEqual(dos.map, unix.map);
    });

    describe("inSourceMap", function() {
        it("Should read the given string filename correctly when sourceMapIncludeSources is enabled", function() {
            var result = UglifyJS.minify(read("test/input/issue-1236/simple.js"), {
                sourceMap: {
                    content: read("test/input/issue-1236/simple.js.map"),
                    filename: "simple.min.js",
                    includeSources: true,
                },
            });
            if (result.error) throw result.error;
            var map = JSON.parse(result.map);
            assert.equal(map.file, "simple.min.js");
            assert.equal(map.sourcesContent.length, 1);
            assert.equal(map.sourcesContent[0], 'let foo = x => "foo " + x;\nconsole.log(foo("bar"));');
        });
        it("Should process inline source map", function() {
            var result = UglifyJS.minify(read("test/input/issue-520/input.js"), {
                compress: { toplevel: true },
                sourceMap: {
                    content: "inline",
                    includeSources: true,
                    url: "inline",
                },
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code + "\n", read("test/input/issue-520/output.js"));
        });
        it("Should warn for missing inline source map", function() {
            var result = UglifyJS.minify(read("test/input/issue-1323/sample.js"), {
                mangle: false,
                sourceMap: {
                    content: "inline",
                },
                warnings: true,
            });
            assert.strictEqual(result.code, "var bar=function(bar){return bar};");
            assert.deepEqual(result.warnings, [ "WARN: inline source map not found: 0" ]);
        });
        it("Should handle multiple input and inline source map", function() {
            var result = UglifyJS.minify([
                read("test/input/issue-520/input.js"),
                read("test/input/issue-1323/sample.js"),
            ], {
                sourceMap: {
                    content: "inline",
                    url: "inline",
                },
                warnings: true,
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, [
                "var Foo=function(){console.log(3)},bar=(new Foo,function(o){return o});",
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0ZGluIiwiMSJdLCJuYW1lcyI6WyJGb28iLCJjb25zb2xlIiwibG9nIiwiYmFyIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNQSxJQUFJLFdBQWdCQyxRQUFRQyxJQUFJLENBQUcsQ0FBRSxFQ0F2Q0MsS0RBMkMsSUFBSUgsSUNDL0MsU0FBY0csR0FDVixPQUFPQSxDQUNYIn0=",
            ].join("\n"));
            assert.deepEqual(result.warnings, [ "WARN: inline source map not found: 1" ]);
        });
        it("Should drop source contents for includeSources=false", function() {
            var result = UglifyJS.minify(read("test/input/issue-520/input.js"), {
                compress: false,
                mangle: false,
                sourceMap: {
                    content: "inline",
                    includeSources: true,
                },
            });
            if (result.error) throw result.error;
            var map = JSON.parse(result.map);
            assert.strictEqual(map.sourcesContent.length, 1);
            result = UglifyJS.minify(result.code, {
                compress: false,
                mangle: false,
                sourceMap: {
                    content: result.map,
                },
            });
            if (result.error) throw result.error;
            map = JSON.parse(result.map);
            assert.ok(!("sourcesContent" in map));
        });
        it("Should parse the correct sourceMappingURL", function() {
            var result = UglifyJS.minify(read("test/input/issue-3294/input.js"), {
                compress: { toplevel: true },
                sourceMap: {
                    content: "inline",
                    includeSources: true,
                    url: "inline",
                },
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code + "\n", read("test/input/issue-3294/output.js"));
        });
        it("Should work in presence of unrecognized annotations", function() {
            var result = UglifyJS.minify(read("test/input/issue-3441/input.js"), {
                compress: false,
                mangle: false,
                sourceMap: {
                    content: "inline",
                },
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, '(function(){console.log("hello")}).call(this);');
            assert.strictEqual(result.map, '{"version":3,"sources":["main.coffee"],"names":["console","log"],"mappings":"CAAA,WAAAA,QAAQC,IAAI,OAAZ"}');
        });
        it("Should not overwrite existing sourcesContent", function() {
            var result = UglifyJS.minify({
                "in.js": [
                    '"use strict";',
                    "",
                    "var _window$foo = window.foo,",
                    "    a = _window$foo[0],",
                    "    b = _window$foo[1];",
                ].join("\n"),
            }, {
                compress: false,
                mangle: false,
                sourceMap: {
                    content: {
                        version: 3,
                        sources: [ "in.js" ],
                        names: [
                            "window",
                            "foo",
                            "a",
                            "b",
                        ],
                        mappings: ";;kBAAaA,MAAM,CAACC,G;IAAfC,C;IAAGC,C",
                        file: "in.js",
                        sourcesContent: [ "let [a, b] = window.foo;\n" ],
                    },
                    includeSources: true,
                },
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, '"use strict";var _window$foo=window.foo,a=_window$foo[0],b=_window$foo[1];');
            assert.strictEqual(result.map, '{"version":3,"sources":["in.js"],"sourcesContent":["let [a, b] = window.foo;\\n"],"names":["window","foo","a","b"],"mappings":"6BAAaA,OAAOC,IAAfC,E,eAAGC,E"}');
        });
    });

    describe("sourceMapInline", function() {
        it("Should append source map to output js when sourceMapInline is enabled", function() {
            var result = UglifyJS.minify('var a = function(foo) { return foo; };', {
                sourceMap: {
                    url: "inline",
                },
            });
            if (result.error) throw result.error;
            var code = result.code;
            assert.strictEqual(code, "var a=function(n){return n};\n" +
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsiYSIsImZvbyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsRUFBSSxTQUFTQyxHQUFPLE9BQU9BLENBQUsifQ==");
        });
        it("Should not append source map to output js when sourceMapInline is not enabled", function() {
            var result = UglifyJS.minify("var a = function(foo) { return foo; };");
            if (result.error) throw result.error;
            var code = result.code;
            assert.strictEqual(code, "var a=function(n){return n};");
        });
        it("Should work with max_line_len", function() {
            var result = UglifyJS.minify(read("test/input/issue-505/input.js"), {
                compress: {
                    directives: false,
                },
                output: {
                    max_line_len: 20,
                },
                sourceMap: {
                    url: "inline",
                },
            });
            if (result.error) throw result.error;
            assert.strictEqual(result.code, read("test/input/issue-505/output.js"));
        });
        it("Should work with unicode characters", function() {
            var code = [
                "var tëst = '→unicøde←';",
                "alert(tëst);",
            ].join("\n");
            var result = UglifyJS.minify(code, {
                sourceMap: {
                    includeSources: true,
                    url: "inline",
                },
            });
            if (result.error) throw result.error;
            var map = JSON.parse(result.map);
            assert.strictEqual(map.sourcesContent.length, 1);
            assert.strictEqual(map.sourcesContent[0], code);
            var encoded = result.code.slice(result.code.lastIndexOf(",") + 1);
            map = JSON.parse(UglifyJS.to_ascii(encoded));
            assert.strictEqual(map.sourcesContent.length, 1);
            assert.strictEqual(map.sourcesContent[0], code);
            result = UglifyJS.minify(result.code, {
                sourceMap: {
                    content: "inline",
                    includeSources: true,
                },
            });
            if (result.error) throw result.error;
            map = JSON.parse(result.map);
            assert.strictEqual(map.names.length, 2);
            assert.strictEqual(map.names[0], "tëst");
            assert.strictEqual(map.names[1], "alert");
        });
    });

    describe("input sourcemaps", function() {
        it("Should not modify input source map", function() {
            var orig = get_map();
            var original = JSON.stringify(orig);
            prepare_map(orig);
            assert.strictEqual(JSON.stringify(orig), original);
        });
        it("Should copy over original sourcesContent", function() {
            var orig = get_map();
            var map = prepare_map(orig);
            assert.strictEqual(map.sources.length, 1);
            assert.strictEqual(map.sources[0], "index.js");
            assert.strictEqual(map.sourcesContent.length, 1);
            assert.equal(map.sourcesContent[0], orig.sourcesContent[0]);
        });
        it("Should copy sourcesContent if sources are relative", function() {
            var relativeMap = get_map();
            relativeMap.sources = ['./index.js'];
            var map = prepare_map(relativeMap);
            assert.strictEqual(map.sources.length, 1);
            assert.strictEqual(map.sources[0], "./index.js");
            assert.strictEqual(map.sourcesContent.length, 1);
            assert.equal(map.sourcesContent[0], relativeMap.sourcesContent[0]);
        });
        it("Should not have invalid mappings from inputSourceMap", function() {
            var map = prepare_map(get_map());
            // The original source has only 2 lines, check that mappings don't have more lines
            var msg = "Mapping should not have higher line number than the original file had";
            var lines = map.mappings.split(/;/);
            assert.ok(lines.length <= 2, msg);
            var indices = [ 0, 0, 1, 0, 0];
            lines.forEach(function(segments) {
                indices[0] = 0;
                segments.split(/,/).forEach(function(segment) {
                    UglifyJS.vlq_decode(indices, segment);
                    assert.ok(indices[2] <= 2, msg);
                });
            });
        });
    });
});
