var Uglify = require('../../');
var assert = require("assert");

describe("Input file as map", function() {
    it("Should accept object", function() {
        var jsMap = {
            '/scripts/foo.js': 'var foo = {"x": 1, y: 2, \'z\': 3};'
        };
        var result = Uglify.minify(jsMap, {fromString: true, outSourceMap: true});

        var map = JSON.parse(result.map);
        assert.strictEqual(result.code, 'var foo={x:1,y:2,z:3};');
        assert.deepEqual(map.sources, ['/scripts/foo.js']);
        assert.strictEqual(map.file, undefined);

        result = Uglify.minify(jsMap, {fromString: true, outFileName: 'out.js'});
        assert.strictEqual(result.map, null);

        result = Uglify.minify(jsMap, {fromString: true, outFileName: 'out.js', outSourceMap: true});
        map = JSON.parse(result.map);
        assert.strictEqual(map.file, 'out.js');
    });

    it("Should accept array of objects and strings", function() {
        var jsSeq = [
            {'/scripts/foo.js': 'var foo = {"x": 1, y: 2, \'z\': 3};'},
            'var bar = 15;'
        ];
        var result = Uglify.minify(jsSeq, {fromString: true, outSourceMap: true});

        var map = JSON.parse(result.map);
        assert.strictEqual(result.code, 'var foo={x:1,y:2,z:3},bar=15;');
        assert.strictEqual(map.sources[0], '/scripts/foo.js');
    });

    it("Should correctly include source", function() {
        var jsSeq = [
            {'/scripts/foo.js': 'var foo = {"x": 1, y: 2, \'z\': 3};'},
            'var bar = 15;'
        ];
        var result = Uglify.minify(jsSeq, {fromString: true, outSourceMap: true, sourceMapIncludeSources: true});

        var map = JSON.parse(result.map);
        assert.strictEqual(result.code, 'var foo={x:1,y:2,z:3},bar=15;');
        assert.deepEqual(map.sourcesContent, ['var foo = {"x": 1, y: 2, \'z\': 3};', 'var bar = 15;']);
    });

});
