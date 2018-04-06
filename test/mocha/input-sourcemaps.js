var assert = require("assert");
var Uglify = require("../../");
var SourceMapConsumer = require("source-map").SourceMapConsumer;

function getMap() {
    return {
        "version": 3,
        "sources": ["index.js"],
        "names": [],
        "mappings": ";;AAAA,IAAI,MAAM,SAAN,GAAM;AAAA,SAAK,SAAS,CAAd;AAAA,CAAV;AACA,QAAQ,GAAR,CAAY,IAAI,KAAJ,CAAZ",
        "file": "bundle.js",
        "sourcesContent": ["let foo = x => \"foo \" + x;\nconsole.log(foo(\"bar\"));"]
    };
}

function prepareMap(sourceMap) {
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
    var result = Uglify.minify(code, {
        sourceMap: {
            content: sourceMap,
            includeSources: true,
        }
    });
    if (result.error) throw result.error;
    return new SourceMapConsumer(result.map);
}

describe("input sourcemaps", function() {
    it("Should copy over original sourcesContent", function() {
        var orig = getMap();
        var map = prepareMap(orig);
        assert.equal(map.sourceContentFor("index.js"), orig.sourcesContent[0]);
    });

    it("Should copy sourcesContent if sources are relative", function() {
        var relativeMap = getMap();
        relativeMap.sources = ['./index.js'];
        var map = prepareMap(relativeMap);
        assert.notEqual(map.sourcesContent, null);
        assert.equal(map.sourcesContent.length, 1);
        assert.equal(map.sourceContentFor("index.js"), relativeMap.sourcesContent[0]);
    });

    it("Should not have invalid mappings from inputSourceMap (issue #882)", function() {
        var map = prepareMap(getMap());
        // The original source has only 2 lines, check that mappings don't have more lines
        var msg = "Mapping should not have higher line number than the original file had";
        map.eachMapping(function(mapping) {
            assert.ok(mapping.originalLine <= 2, msg);
        });
        map.allGeneratedPositionsFor({
            source: "index.js",
            line: 1,
            column: 1
        }).forEach(function(pos) {
            assert.ok(pos.line <= 2, msg);
        });
    });
});
