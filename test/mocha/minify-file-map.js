var assert = require("assert");
var UglifyJS = require("../..");

describe("Input file as map", function() {
    it("Should accept object", function() {
        var jsMap = {
            '/scripts/foo.js': 'var foo = {"x": 1, y: 2, \'z\': 3};'
        };
        var result = UglifyJS.minify(jsMap, {
            sourceMap: true,
        });
        if (result.error) throw result.error;
        var map = JSON.parse(result.map);
        assert.strictEqual(result.code, 'var foo={x:1,y:2,z:3};');
        assert.deepEqual(map.sources, ['/scripts/foo.js']);
        assert.strictEqual(map.file, undefined);

        result = UglifyJS.minify(jsMap);
        assert.strictEqual(result.map, undefined);

        result = UglifyJS.minify(jsMap, {sourceMap: {filename: 'out.js'}});
        map = JSON.parse(result.map);
        assert.strictEqual(map.file, 'out.js');
    });

    it("Should accept array of strings", function() {
        var jsSeq = [
            'var foo = {"x": 1, y: 2, \'z\': 3};',
            'var bar = 15;'
        ];
        var result = UglifyJS.minify(jsSeq, {
            sourceMap: true,
        });
        if (result.error) throw result.error;
        var map = JSON.parse(result.map);
        assert.strictEqual(result.code, 'var foo={x:1,y:2,z:3},bar=15;');
        assert.deepEqual(map.sources, ['0', '1']);
    });

    it("Should correctly include source", function() {
        var jsMap = {
            '/scripts/foo.js': 'var foo = {"x": 1, y: 2, \'z\': 3};'
        };
        var result = UglifyJS.minify(jsMap, {
            sourceMap: {
                includeSources: true,
            },
        });
        if (result.error) throw result.error;
        var map = JSON.parse(result.map);
        assert.strictEqual(result.code, 'var foo={x:1,y:2,z:3};');
        assert.deepEqual(map.sourcesContent, ['var foo = {"x": 1, y: 2, \'z\': 3};']);
    });
});
