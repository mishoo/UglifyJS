var assert = require("assert");
var exec = require("child_process").exec;

describe("bin/uglifyjs", function () {
    var uglifyjscmd = '"' + process.argv[0] + '" bin/uglifyjs';
    it("should produce a functional build when using --self", function (done) {
        this.timeout(15000);

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

           assert.strictEqual(stdout, "var bar=function(){function foo(bar){return bar}return foo}();\n" +
               "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvaW5wdXQvaXNzdWUtMTMyMy9zYW1wbGUuanMiXSwibmFtZXMiOlsiYmFyIiwiZm9vIl0sIm1hcHBpbmdzIjoiQUFBQSxHQUFJQSxLQUFNLFdBQ04sUUFBU0MsS0FBS0QsS0FDVixNQUFPQSxLQUdYLE1BQU9DIn0=\n");
           done();
       });
    });
    it("should not append source map to output when not using --source-map-inline", function (done) {
        var command = uglifyjscmd + ' test/input/issue-1323/sample.js';

        exec(command, function (err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, "var bar=function(){function foo(bar){return bar}return foo}();\n");
            done();
        });
    });
    it("Should work with --keep-fnames (mangle only)", function (done) {
       var command = uglifyjscmd + ' test/input/issue-1431/sample.js --keep-fnames -m';

       exec(command, function (err, stdout) {
           if (err) throw err;

           assert.strictEqual(stdout, "function f(r){return function(){function n(n){return n*n}return r(n)}}function g(n){return n(1)+n(2)}console.log(f(g)()==5);\n");
           done();
       });
    });
    it("Should work with --keep-fnames (mangle & compress)", function (done) {
       var command = uglifyjscmd + ' test/input/issue-1431/sample.js --keep-fnames -m -c';

       exec(command, function (err, stdout) {
           if (err) throw err;

           assert.strictEqual(stdout, "function f(r){return function(){function n(n){return n*n}return r(n)}}function g(n){return n(1)+n(2)}console.log(5==f(g)());\n");
           done();
       });
    });
    it("Should work with keep_fnames under mangler options", function (done) {
       var command = uglifyjscmd + ' test/input/issue-1431/sample.js -m keep_fnames=true';

       exec(command, function (err, stdout) {
           if (err) throw err;

           assert.strictEqual(stdout, "function f(r){return function(){function n(n){return n*n}return r(n)}}function g(n){return n(1)+n(2)}console.log(f(g)()==5);\n");
           done();
       });
    });
});
