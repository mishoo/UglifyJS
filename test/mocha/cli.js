var assert = require("assert");
var exec = require("child_process").exec;
var readFileSync = require("fs").readFileSync;

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
       var command = uglifyjscmd + ' test/input/issue-1431/sample.js --keep-fnames -m -c unused=false';

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
    it("Should work with --define (simple)", function (done) {
       var command = uglifyjscmd + ' test/input/global_defs/simple.js --define D=5 -c';

       exec(command, function (err, stdout) {
           if (err) throw err;

           assert.strictEqual(stdout, "console.log(5);\n");
           done();
       });
    });
    it("Should work with --define (nested)", function (done) {
       var command = uglifyjscmd + ' test/input/global_defs/nested.js --define C.D=5,C.V=3 -c';

       exec(command, function (err, stdout) {
           if (err) throw err;

           assert.strictEqual(stdout, "console.log(3,5);\n");
           done();
       });
    });
    it("Should work with --define (AST_Node)", function (done) {
       var command = uglifyjscmd + ' test/input/global_defs/simple.js --define console.log=stdout.println -c';

       exec(command, function (err, stdout) {
           if (err) throw err;

           assert.strictEqual(stdout, "stdout.println(D);\n");
           done();
       });
    });
    it("Should work with `--beautify`", function (done) {
       var command = uglifyjscmd + ' test/input/issue-1482/input.js -b';

       exec(command, function (err, stdout) {
           if (err) throw err;

           assert.strictEqual(stdout, readFileSync("test/input/issue-1482/default.js", "utf8"));
           done();
       });
    });
    it("Should work with `--beautify bracketize`", function (done) {
       var command = uglifyjscmd + ' test/input/issue-1482/input.js -b bracketize';

       exec(command, function (err, stdout) {
           if (err) throw err;

           assert.strictEqual(stdout, readFileSync("test/input/issue-1482/bracketize.js", "utf8"));
           done();
       });
    });
    it("Should process inline source map", function(done) {
        var command = uglifyjscmd + ' test/input/issue-520/input.js -cm toplevel --in-source-map inline --source-map-inline';

        exec(command, function (err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, readFileSync("test/input/issue-520/output.js", "utf8"));
            done();
        });
    });
    it("Should warn for missing inline source map", function(done) {
        var command = uglifyjscmd + ' test/input/issue-1323/sample.js --in-source-map inline';

        exec(command, function (err, stdout, stderr) {
            if (err) throw err;

            assert.strictEqual(stdout, "var bar=function(){function foo(bar){return bar}return foo}();\n");
            assert.strictEqual(stderr, "WARN: inline source map not found\n");
            done();
        });
    });
    it("Should fail with multiple input and inline source map", function(done) {
        var command = uglifyjscmd + ' test/input/issue-520/input.js test/input/issue-520/output.js --in-source-map inline --source-map-inline';

        exec(command, function (err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stderr, "ERROR: Inline source map only works with singular input\n");
            done();
        });
    });
    it("Should fail with acorn and inline source map", function(done) {
        var command = uglifyjscmd + ' test/input/issue-520/input.js --in-source-map inline --source-map-inline --acorn';

        exec(command, function (err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stderr, "ERROR: Inline source map only works with built-in parser\n");
            done();
        });
    });
    it("Should fail with SpiderMonkey and inline source map", function(done) {
        var command = uglifyjscmd + ' test/input/issue-520/input.js --in-source-map inline --source-map-inline --spidermonkey';

        exec(command, function (err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stderr, "ERROR: Inline source map only works with built-in parser\n");
            done();
        });
    });
    it("Should fail with invalid syntax", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/simple.js';

        exec(command, function (err, stdout, stderr) {
            assert.ok(err);
            var lines = stderr.split(/\n/);
            assert.strictEqual(lines[0], "Parse error at test/input/invalid/simple.js:1,12");
            assert.strictEqual(lines[1], "function f(a{}");
            assert.strictEqual(lines[2], "            ^");
            assert.strictEqual(lines[3], "SyntaxError: Unexpected token punc «{», expected punc «,»");
            done();
        });
    });
    it("Should fail with correct marking of tabs", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/tab.js';

        exec(command, function (err, stdout, stderr) {
            assert.ok(err);
            var lines = stderr.split(/\n/);
            assert.strictEqual(lines[0], "Parse error at test/input/invalid/tab.js:1,12");
            assert.strictEqual(lines[1], "\t\tfoo(\txyz, 0abc);");
            assert.strictEqual(lines[2], "\t\t    \t     ^");
            assert.strictEqual(lines[3], "SyntaxError: Invalid syntax: 0abc");
            done();
        });
    });
    it("Should fail with correct marking at start of line", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/eof.js';

        exec(command, function (err, stdout, stderr) {
            assert.ok(err);
            var lines = stderr.split(/\n/);
            assert.strictEqual(lines[0], "Parse error at test/input/invalid/eof.js:2,0");
            assert.strictEqual(lines[1], "foo, bar(");
            assert.strictEqual(lines[2], "         ^");
            assert.strictEqual(lines[3], "SyntaxError: Unexpected token: eof (undefined)");
            done();
        });
    });
});
