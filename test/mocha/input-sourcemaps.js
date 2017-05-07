var Uglify = require('../../');
var assert = require("assert");
var SourceMapConsumer = require("source-map").SourceMapConsumer;

describe("input sourcemaps", function() {
    var transpilemap, map;

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
        var transpiled = '"use strict";\n\n' +
            'var foo = function foo(x) {\n  return "foo " + x;\n};\n' +
            'console.log(foo("bar"));\n\n' +
            '//# sourceMappingURL=bundle.js.map';

        transpilemap = sourceMap || getMap();

        var result = Uglify.minify(transpiled, {
            sourceMap: {
                content: transpilemap
            }
        });

        map = new SourceMapConsumer(result.map);
    }

    beforeEach(function () {
      prepareMap();
    });

    it("Should copy over original sourcesContent", function() {
        assert.equal(map.sourceContentFor("index.js"), transpilemap.sourcesContent[0]);
    });

    it("Should copy sourcesContent if sources are relative", function () {
        var relativeMap = getMap();
        relativeMap.sources = ['./index.js'];

        prepareMap(relativeMap);
        assert.notEqual(map.sourcesContent, null);
        assert.equal(map.sourcesContent.length, 1);
        assert.equal(map.sourceContentFor("index.js"), transpilemap.sourcesContent[0]);
    });

    it("Final sourcemap should not have invalid mappings from inputSourceMap (issue #882)", function() {
        // The original source has only 2 lines, check that mappings don't have more lines

        var msg = "Mapping should not have higher line number than the original file had";
        map.eachMapping(function(mapping) {
            assert.ok(mapping.originalLine <= 2, msg)
        });

        map.allGeneratedPositionsFor({source: "index.js", line: 1, column: 1}).forEach(function(pos) {
            assert.ok(pos.line <= 2, msg);
        })
    });
});
