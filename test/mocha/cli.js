var assert = require("assert");
var exec = require("child_process").exec;

describe("bin/uglifyjs", function () {
    var uglifyjscmd = '"' + process.argv[0] + '" bin/uglifyjs';
    it("should produce a functional build when using --self", function (done) {
        this.timeout(5000);

        var command = uglifyjscmd + ' --self -cm --wrap WrappedUglifyJS';

        exec(command, function (err, stdout) {
            if (err) throw err;

            eval(stdout);

            assert.strictEqual(typeof WrappedUglifyJS, 'object');
            assert.strictEqual(true, WrappedUglifyJS.parse('foo;') instanceof WrappedUglifyJS.AST_Node);

            done();
        });
    });
    it("Should be able to filter comments correctly with `--comment all`", function (done) {
        var command = uglifyjscmd + ' test/input/comments/filter.js --comments all';

        exec(command, function (err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, "// foo\n/*@preserve*/\n// bar\n\n");
            done();
        });
    });
    it("Should be able to filter comments correctly with `--comment <RegExp>`", function (done) {
        var command = uglifyjscmd + ' test/input/comments/filter.js --comments /r/';

        exec(command, function (err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, "/*@preserve*/\n// bar\n\n");
            done();
        });
    });
    it("Should be able to filter comments correctly with just `--comment`", function (done) {
        var command = uglifyjscmd + ' test/input/comments/filter.js --comments';

        exec(command, function (err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, "/*@preserve*/\n\n");
            done();
        });
    });
    it("Should append source map to output when using --source-map-inline", function (done) {
       var command = uglifyjscmd + ' test/input/issue-1323/sample.js --source-map-inline';

       exec(command, function (err, stdout) {
           if (err) throw err;

           assert.doesNotThrow(function (){
               var validate_source_map = /\/\/# sourceMappingURL=data:.*base64,(.*)\s*$/;
               var base64 = stdout.match(validate_source_map)[1];

               var buf = new Buffer(base64, 'base64');
               var map = JSON.parse(buf.toString());
               done();
           });
       });
    });
    it("should not append source map to output when not using --source-map-inline", function (done) {
        var command = uglifyjscmd + ' test/input/issue-1323/sample.js';

        exec(command, function (err, stdout) {
            var validate_source_map = /\/\/# sourceMappingURL=data:.*base64,(.*)\s*$/;
            assert.strictEqual(false, validate_source_map.test(stdout));
            done();
        });
    });
});
