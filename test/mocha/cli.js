var assert = require("assert");
var exec = require("child_process").exec;
var fs = require("fs");
var run_code = require("../sandbox").run_code;
var semver = require("semver");
var to_ascii = require("../node").to_ascii;

function read(path) {
    return fs.readFileSync(path, "utf8");
}

describe("bin/uglifyjs", function() {
    var uglifyjscmd = '"' + process.argv[0] + '" bin/uglifyjs';
    it("Should produce a functional build when using --self", function(done) {
        this.timeout(30000);
        var command = [
            uglifyjscmd,
            "--self",
            semver.satisfies(process.version, "<=0.12") ? "-mc hoist_funs" : "-mc",
            "--wrap WrappedUglifyJS",
        ].join(" ");
        exec(command, { maxBuffer: 1048576 }, function(err, stdout) {
            if (err) throw err;
            eval(stdout);
            assert.strictEqual(typeof WrappedUglifyJS, "object");
            var result = WrappedUglifyJS.minify("foo([true,,2+3]);");
            assert.strictEqual(result.error, undefined);
            assert.strictEqual(result.code, "foo([!0,,5]);");
            done();
        });
    });
    it("Should be able to filter comments correctly with `--comments all`", function(done) {
        var command = uglifyjscmd + ' test/input/comments/filter.js --comments all';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "// foo\n/*@preserve*/\n// bar\n");
            done();
        });
    });
    it("Should be able to filter comments correctly with `--comment <RegExp>`", function(done) {
        var command = uglifyjscmd + ' test/input/comments/filter.js --comments /r/';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "/*@preserve*/\n// bar\n");
            done();
        });
    });
    it("Should be able to filter comments correctly with just `--comment`", function(done) {
        var command = uglifyjscmd + ' test/input/comments/filter.js --comments';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "/*@preserve*/\n");
            done();
        });
    });
    it("Should work with --expression", function(done) {
        exec([
            uglifyjscmd,
            "--expression",
            "--compress",
            "--mangle",
        ].join(" "), function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "function(n){for(;n(););return 42}(A)\n");
            done();
        }).stdin.end([
            "function(x) {",
            "    while (x()) {}",
            "    return 42;",
            "}(A)",
        ].join("\n"));
    });
    it("Should work with --source-map names=true", function(done) {
        exec([
            uglifyjscmd,
            "--beautify",
            "--source-map", [
                "names=true",
                "url=inline",
            ].join(),
        ].join(" "), function(err, stdout) {
            if (err) throw err;
            var expected = [
                "var obj = {",
                "    p: a,",
                "    q: b",
                "};",
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,",
            ].join("\n");
            assert.strictEqual(stdout.slice(0, expected.length), expected);
            var map = JSON.parse(to_ascii(stdout.slice(expected.length).trim()));
            assert.deepEqual(map.names, [ "obj", "p", "a", "q", "b" ]);
            done();
        }).stdin.end([
            "var obj = {",
            "    p: a,",
            "    q: b",
            "};",
        ].join("\n"));
    });
    it("Should work with --source-map names=false", function(done) {
        exec([
            uglifyjscmd,
            "--beautify",
            "--source-map", [
                "names=false",
                "url=inline",
            ].join(),
        ].join(" "), function(err, stdout) {
            if (err) throw err;
            var expected = [
                "var obj = {",
                "    p: a,",
                "    q: b",
                "};",
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,",
            ].join("\n");
            assert.strictEqual(stdout.slice(0, expected.length), expected);
            var map = JSON.parse(to_ascii(stdout.slice(expected.length).trim()));
            assert.deepEqual(map.names, []);
            done();
        }).stdin.end([
            "var obj = {",
            "    p: a,",
            "    q: b",
            "};",
        ].join("\n"));
    });
    it("Should give sensible error against invalid input source map", function(done) {
        var command = uglifyjscmd + " test/mocha.js --source-map content=blah,url=inline --verbose";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.deepEqual(stderr.split(/\n/).slice(0, 2), [
                "INFO: Using input source map: blah",
                "ERROR: invalid input source map: blah",
            ]);
            done();
        });
    });
    it("Should append source map to output when using --source-map url=inline", function(done) {
        var command = uglifyjscmd + " test/input/issue-1323/sample.js --source-map url=inline";
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                "var bar=function(){function foo(bar){return bar}return foo}();",
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvaW5wdXQvaXNzdWUtMTMyMy9zYW1wbGUuanMiXSwibmFtZXMiOlsiYmFyIiwiZm9vIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxJQUFNLFdBQ04sU0FBU0MsSUFBS0QsS0FDVixPQUFPQSxHQUNYLENBRUEsT0FBT0MsR0FDVixFQUFFIn0=",
                "",
            ].join("\n"));
            done();
        });
    });
    it("Should not append source map to output when not using --source-map url=inline", function(done) {
        var command = uglifyjscmd + ' test/input/issue-1323/sample.js';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "var bar=function(){function foo(bar){return bar}return foo}();\n");
            done();
        });
    });
    it("Should not consider source map file content as source map file name (issue #2082)", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-2082/sample.js",
            "--source-map", "content=test/input/issue-2082/sample.js.map",
            "--source-map", "url=inline",
            "--verbose",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            var stderrLines = stderr.split("\n");
            assert.strictEqual(stderrLines[0], "INFO: Using input source map: test/input/issue-2082/sample.js.map");
            assert.notStrictEqual(stderrLines[1], 'INFO: Using input source map: {"version": 3,"sources": ["index.js"],"mappings": ";"}');
            done();
        });
    });
    it("Should not load source map before finish reading from STDIN", function(done) {
        var mapFile = "tmp/input.js.map";
        try {
            fs.mkdirSync("./tmp");
        } catch (e) {
            if (e.code != "EEXIST") throw e;
        }
        try {
            fs.unlinkSync(mapFile);
        } catch (e) {
            if (e.code != "ENOENT") throw e;
        }
        var command = [
            uglifyjscmd,
            "--beautify",
            "--source-map", [
                "content=" + mapFile,
                "includeSources",
                "url=inline",
            ].join(),
        ].join(" ");

        var child = exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, read("test/input/issue-3040/expect.js"));
            done();
        });
        setTimeout(function() {
            fs.writeFileSync(mapFile, read("test/input/issue-3040/input.js.map"));
            child.stdin.end(read("test/input/issue-3040/input.js"));
        }, 1000);
    });
    it("Should work with --keep-fargs (mangle only)", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-1431/sample.js",
            "--keep-fargs",
            "--mangle",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(x){return function(){function n(a){return a*a}return x(n)}}function g(op){return op(1)+op(2)}console.log(f(g)()==5);\n");
            done();
        });
    });
    it("Should work with --keep-fargs (mangle & compress)", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-1431/sample.js",
            "--keep-fargs",
            "--mangle",
            "--no-module",
            "--compress",
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(x){return function(){return x(function(a){return a*a})}}function g(op){return op(1)+op(2)}console.log(5==f(g)());\n");
            done();
        });
    });
    it("Should work with keep_fargs under mangler options", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-1431/sample.js",
            "--mangle", "keep_fargs=true",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(x){return function(){function n(a){return a*a}return x(n)}}function g(op){return op(1)+op(2)}console.log(f(g)()==5);\n");
            done();
        });
    });
    it("Should work with --keep-fnames (mangle only)", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-1431/sample.js",
            "--keep-fnames",
            "--mangle",
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(r){return function(){function n(n){return n*n}return r(n)}}function g(n){return n(1)+n(2)}console.log(f(g)()==5);\n");
            done();
        });
    });
    it("Should work with --keep-fnames (mangle & compress)", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-1431/sample.js",
            "--keep-fnames",
            "--mangle",
            "--no-module",
            "--compress",
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(n){return function(){return n(function n(r){return r*r})}}function g(n){return n(1)+n(2)}console.log(5==f(g)());\n");
            done();
        });
    });
    it("Should work with keep_fnames under mangler options", function(done) {
        var command = uglifyjscmd + ' test/input/issue-1431/sample.js -m keep_fnames=true';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(r){return function(){function n(n){return n*n}return r(n)}}function g(n){return n(1)+n(2)}console.log(f(g)()==5);\n");
            done();
        });
    });
    it("Should work with --define (simple)", function(done) {
        var command = uglifyjscmd + ' test/input/global_defs/simple.js --define D=5 -c';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "console.log(5);\n");
            done();
        });
    });
    it("Should work with --define (nested)", function(done) {
        var command = uglifyjscmd + ' test/input/global_defs/nested.js --define C.D=5,C.V=3 -c';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "console.log(3,5);\n");
            done();
        });
    });
    it("Should work with --define (AST_Node)", function(done) {
        var command = uglifyjscmd + ' test/input/global_defs/simple.js --define console.log=stdout.println -c';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "stdout.println(D);\n");
            done();
        });
    });
    it("Should work with `--beautify`", function(done) {
        var command = uglifyjscmd + ' test/input/issue-1482/input.js -b';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, read("test/input/issue-1482/beautify.js"));
            done();
        });
    });
    it("Should work with `--beautify braces`", function(done) {
        var command = uglifyjscmd + ' test/input/issue-1482/input.js -b braces';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, read("test/input/issue-1482/braces.js"));
            done();
        });
    });
    it("Should work with `--output-opts`", function(done) {
        var command = uglifyjscmd + ' test/input/issue-1482/input.js -O ascii_only';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, read("test/input/issue-1482/default.js"));
            done();
        });
    });
    it("Should fail when both --beautify & --output-opts are specified", function(done) {
        var command = uglifyjscmd + " test/input/issue-520/input.js -bO ascii_only";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stderr, "ERROR: --beautify cannot be used with --output-opts\n");
            done();
        });
    });
    it("Should process inline source map", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-520/input.js",
            "-mc", "toplevel",
            "--source-map", "content=inline",
            "--source-map", "includeSources=true",
            "--source-map", "url=inline",
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, read("test/input/issue-520/output.js"));
            done();
        });
    });
    it("Should warn for missing inline source map", function(done) {
        var command = uglifyjscmd + " test/input/issue-1323/sample.js --source-map content=inline,url=inline --warn";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                "var bar=function(){function foo(bar){return bar}return foo}();",
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvaW5wdXQvaXNzdWUtMTMyMy9zYW1wbGUuanMiXSwibmFtZXMiOlsiYmFyIiwiZm9vIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxJQUFNLFdBQ04sU0FBU0MsSUFBS0QsS0FDVixPQUFPQSxHQUNYLENBRUEsT0FBT0MsR0FDVixFQUFFIn0=",
                "",
            ].join("\n"));
            var stderrLines = stderr.split("\n");
            assert.strictEqual(stderrLines[0], "WARN: inline source map not found: test/input/issue-1323/sample.js");
            done();
        });
    });
    it("Should handle multiple input and inline source map", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-520/input.js",
            "test/input/issue-1323/sample.js",
            "--source-map", "content=inline,url=inline",
            "--warn",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                "var Foo=function Foo(){console.log(1+2)};new Foo;var bar=function(){function foo(bar){return bar}return foo}();",
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0ZGluIiwidGVzdC9pbnB1dC9pc3N1ZS0xMzIzL3NhbXBsZS5qcyJdLCJuYW1lcyI6WyJGb28iLCJjb25zb2xlIiwibG9nIiwiYmFyIiwiZm9vIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNQSxJQUFJLFNBQUVBLE1BQWNDLFFBQVFDLElBQUksRUFBRSxDQUFDLENBQUUsRUFBSSxJQUFJRixJQ0FuRCxJQUFJRyxJQUFNLFdBQ04sU0FBU0MsSUFBS0QsS0FDVixPQUFPQSxHQUNYLENBRUEsT0FBT0MsR0FDVixFQUFFIn0=",
                "",
            ].join("\n"));
            var stderrLines = stderr.split("\n");
            assert.strictEqual(stderrLines[0], "WARN: inline source map not found: test/input/issue-1323/sample.js");
            done();
        });
    });
    it("Should fail with acorn and inline source map", function(done) {
        var command = uglifyjscmd + " test/input/issue-520/input.js --source-map content=inline,url=inline -p acorn";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stderr, "ERROR: inline source map only works with built-in parser\n");
            done();
        });
    });
    it("Should fail with SpiderMonkey and inline source map", function(done) {
        var command = uglifyjscmd + " test/input/issue-520/input.js --source-map content=inline,url=inline -p spidermonkey";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stderr, "ERROR: inline source map only works with built-in parser\n");
            done();
        });
    });
    it("Should fail with invalid syntax", function(done) {
        var command = uglifyjscmd + " test/input/invalid/simple.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/simple.js:1,12",
                "function f(a{}",
                "            ^",
                "ERROR: Unexpected token: punc «{», expected: punc «,»",
            ].join("\n"));
            done();
        });
    });
    it("Should fail with correct marking of tabs", function(done) {
        var command = uglifyjscmd + " test/input/invalid/tab.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/tab.js:1,12",
                "\t\tfoo(\txyz, 0abc);",
                "\t\t    \t     ^",
                "ERROR: Invalid syntax: 0abc",
            ].join("\n"));
            done();
        });
    });
    it("Should fail with correct marking at start of line", function(done) {
        var command = uglifyjscmd + " test/input/invalid/eof.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/eof.js:2,0",
                "foo, bar(",
                "         ^",
                "ERROR: Unexpected token: eof",
            ].join("\n"));
            done();
        });
    });
    it("Should fail with a missing loop body", function(done) {
        var command = uglifyjscmd + " test/input/invalid/loop-no-body.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/loop-no-body.js:2,0",
                "for (var i = 0; i < 1; i++) ",
                "                            ^",
                "ERROR: Unexpected token: eof",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (5--)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/assign_1.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/assign_1.js:1,18",
                "console.log(1 || 5--);",
                "                  ^",
                "ERROR: Invalid use of -- operator",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (Math.random() /= 2)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/assign_2.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/assign_2.js:1,32",
                "console.log(2 || (Math.random() /= 2));",
                "                                ^",
                "ERROR: Invalid assignment",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (++this)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/assign_3.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/assign_3.js:1,17",
                "console.log(3 || ++this);",
                "                 ^",
                "ERROR: Invalid use of ++ operator",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (null = 4)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/assign_4.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/assign_4.js:1,23",
                "console.log(4 || (null = 4));",
                "                       ^",
                "ERROR: Invalid assignment",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error ([]?.length ^= 5)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/assign_5.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/assign_5.js:1,29",
                "console.log(5 || ([]?.length ^= 5));",
                "                             ^",
                "ERROR: Invalid assignment",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (a.=)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/dot_1.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/dot_1.js:1,2",
                "a.=",
                "  ^",
                "ERROR: Unexpected token: operator «=», expected: name",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (%.a)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/dot_2.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/dot_2.js:1,0",
                "%.a;",
                "^",
                "ERROR: Unexpected token: operator «%»",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (a./();)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/dot_3.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/dot_3.js:1,2",
                "a./();",
                "  ^",
                "ERROR: Unexpected token: operator «/», expected: name",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error ({%: 1})", function(done) {
        var command = uglifyjscmd + " test/input/invalid/object.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/object.js:1,13",
                "console.log({%: 1});",
                "             ^",
                "ERROR: Unexpected token: operator «%»",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (delete x)", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/invalid/delete.js",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/delete.js:13,11",
                "    delete x;",
                "           ^",
                "ERROR: Calling delete on expression not allowed in strict mode",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (function g(arguments))", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/invalid/function_1.js",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/function_1.js:4,11",
                "function g(arguments) {",
                "           ^",
                "ERROR: Unexpected arguments in strict mode",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (function eval())", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/invalid/function_2.js",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/function_2.js:4,9",
                "function eval() {",
                "         ^",
                "ERROR: Unexpected eval in strict mode",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (iife arguments())", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/invalid/function_3.js",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/function_3.js:4,10",
                "!function arguments() {",
                "          ^",
                "ERROR: Unexpected arguments in strict mode",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (catch (eval))", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/invalid/try.js",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/try.js:7,18",
                "    try {} catch (eval) {}",
                "                  ^",
                "ERROR: Unexpected eval in strict mode",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (var eval)", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/invalid/var.js",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/var.js:7,8",
                "    var eval;",
                "        ^",
                "ERROR: Unexpected eval in strict mode",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (var { eval })", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/invalid/destructured_var.js",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/destructured_var.js:7,10",
                "    var { eval } = 42;",
                "          ^",
                "ERROR: Unexpected eval in strict mode",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (else)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/else.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/else.js:1,7",
                "if (0) else 1;",
                "       ^",
                "ERROR: Unexpected token: keyword «else»",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (return)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/return.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/return.js:1,0",
                "return 42;",
                "^",
                "ERROR: 'return' outside of function",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (for-in init)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/for-in_1.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/for-in_1.js:2,5",
                "for (1, 2, a in b) {",
                "     ^",
                "ERROR: Invalid left-hand side in for..in/of loop",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (for-in var)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/for-in_2.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/for-in_2.js:2,5",
                "for (var a, b in c) {",
                "     ^",
                "ERROR: Only one variable declaration allowed in for..in/of loop",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (for-of init)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/for-of_1.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/for-of_1.js:2,5",
                "for (b = 2 of a)",
                "     ^",
                "ERROR: Invalid left-hand side in for..in/of loop",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (for-of var)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/for-of_2.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/for-of_2.js:2,13",
                "for (var b = 2 of a)",
                "             ^",
                "ERROR: No initializers allowed in for..of loop",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (for-await)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/for-await.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/for-await.js:1,11",
                "for await (; console.log(42););",
                "           ^",
                "ERROR: Unexpected token: punc «;»",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (switch defaults)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/switch.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/switch.js:3,2",
                "  default:",
                "  ^",
                "ERROR: More than one default clause in switch statement",
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (console?.log``)", function(done) {
        var command = uglifyjscmd + " test/input/invalid/optional-template.js";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/optional-template.js:1,12",
                "console?.log``;",
                "            ^",
                "ERROR: Invalid template on optional chain",
            ].join("\n"));
            done();
        });
    });
    it("Should handle literal string as source map input", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-1236/simple.js",
            "--source-map",
            'content="' + read_map() + '",url=inline'
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                '"use strict";var foo=function foo(x){return"foo "+x};console.log(foo("bar"));',
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImZvbyIsIngiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiYUFBQSxJQUFJQSxJQUFNLFNBQU5BLElBQU1DLEdBQUEsTUFBSyxPQUFTQSxDQUFkLEVBQ1ZDLFFBQVFDLElBQUlILElBQUksS0FBSixDQUFaIn0=",
                ""
            ].join("\n"));
            done();
        });

        function read_map() {
            var map = JSON.parse(read("test/input/issue-1236/simple.js.map"));
            delete map.sourcesContent;
            return JSON.stringify(map).replace(/"/g, '\\"');
        }
    });
    it("Should include function calls in source map", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-2310/input.js",
            "--compress",
            "--no-module",
            "--source-map", "url=inline",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                'function foo(){return function(){console.log("PASS")}}foo()();',
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvaW5wdXQvaXNzdWUtMjMxMC9pbnB1dC5qcyJdLCJuYW1lcyI6WyJmb28iLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxNQUNMLE9BQU8sV0FDSEMsUUFBUUMsSUFBSSxNQUFNLENBQ3RCLENBQ0osQ0FHWUYsSUFBSSxFQUNWIn0=",
                ""
            ].join("\n"));
            done();
        });
    });
    it("Should dump AST as JSON", function(done) {
        var command = uglifyjscmd + " test/input/global_defs/simple.js -mco ast";
        exec(command, function(err, stdout) {
            if (err) throw err;
            var ast = JSON.parse(stdout);
            assert.strictEqual(ast._class, "AST_Toplevel");
            assert.ok(Array.isArray(ast.body));
            done();
        });
    });
    it("Should print supported options on invalid option syntax", function(done) {
        var command = uglifyjscmd + " test/input/comments/filter.js -b ascii-only";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.ok(/^Supported options:\n[\s\S]*?\nERROR: `ascii-only` is not a supported option/.test(stderr), stderr);
            done();
        });
    });
    it("Should work with --mangle reserved=[]", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-505/input.js",
            "--mangle", "reserved=[callback]",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, 'function test(callback){"aaaaaaaaaaaaaaaa";callback(err,data);callback(err,data)}\n');
            done();
        });
    });
    it("Should work with --mangle reserved=false", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-505/input.js",
            "--mangle", "reserved=false",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, 'function test(a){"aaaaaaaaaaaaaaaa";a(err,data);a(err,data)}\n');
            done();
        });
    });
    it("Should fail with --mangle-props reserved=[in]", function(done) {
        var command = uglifyjscmd + " test/input/issue-505/input.js --mangle-props reserved=[in]";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.ok(/^Supported options:\n[\s\S]*?\nERROR: `reserved=\[in]` is not a supported option/.test(stderr), stderr);
            done();
        });
    });
    it("Should work with mangle.properties.regex from --config-file", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-3315/input.js",
            "--config-file", "test/input/issue-3315/config.json",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, 'function f(){"aaaaaaaaaa";var a={prop:1,t:2};return a.prop+a.t}\n');
            done();
        });
    });
    it("Should fail with --define a-b", function(done) {
        var command = uglifyjscmd + " test/input/issue-505/input.js --define a-b";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr, "ERROR: cannot parse arguments for 'define': a-b\n");
            done();
        });
    });
    it("Should work with explicit --rename", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/rename/input.js",
            "--no-module",
            "--rename",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(a){return b(a);function b(c){return c+c}}\n");
            done();
        });
    });
    it("Should work with explicit --no-rename", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/rename/input.js",
            "--compress", "passes=2",
            "--mangle",
            "--no-module",
            "--no-rename",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(n){return function(n){return n+n}(n)}\n");
            done();
        });
    });
    it("Should work with implicit --rename", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/rename/input.js",
            "--compress", "passes=2",
            "--mangle",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(n){return n+n}\n");
            done();
        });
    });
    it("Should work with implicit --no-rename", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/rename/input.js",
            "--compress", "passes=2",
            "--no-module",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(x){return function(x){return x+x}(x)}\n");
            done();
        });
    });
    it("Should work with --enclose", function(done) {
        var command = uglifyjscmd + " test/input/enclose/input.js --enclose";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, '(function(){function enclose(){console.log("test enclose")}enclose()})();\n');
            done();
        });
    });
    it("Should work with --enclose arg", function(done) {
        var command = uglifyjscmd + " test/input/enclose/input.js --enclose undefined";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, '(function(undefined){function enclose(){console.log("test enclose")}enclose()})();\n');
            done();
        });
    });
    it("Should work with --enclose arg:value", function(done) {
        var command = uglifyjscmd + " test/input/enclose/input.js --enclose window,undefined:window";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, '(function(window,undefined){function enclose(){console.log("test enclose")}enclose()})(window);\n');
            done();
        });
    });
    it("Should work with --enclose & --wrap", function(done) {
        var command = uglifyjscmd + " test/input/enclose/input.js --enclose window,undefined:window --wrap exports";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, '(function(exports){(function(window,undefined){function enclose(){console.log("test enclose")}enclose()})(window)})(typeof exports=="undefined"?exports={}:exports);\n');
            done();
        });
    });
    it("Should work with --module", function(done) {
        var command = uglifyjscmd + " test/input/module/input.js --module -mc";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, read("test/input/module/expect.js"));
            done();
        });
    });
    it("Should compress swarm of unused variables with reasonable performance", function(done) {
        var code = [
            "console.log(function() {",
        ];
        for (var i = 0; i < 10000; i++) {
            code.push("var obj" + i + " = {p: " + i + "};");
        }
        code.push("var map = {");
        for (var i = 0; i < 10000; i++) {
            code.push("obj" + i + ": obj" + i + ",");
        }
        code = code.concat([
            "};",
            "return obj25.p + obj121.p + obj1024.p;",
            "}());",
        ]).join("\n");
        exec(uglifyjscmd + " -mc", function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "console.log(function(){var p={p:25},n={p:121},o={p:1024};return p.p+n.p+o.p}());\n");
            assert.strictEqual(run_code(stdout), run_code(code));
            done();
        }).stdin.end(code);
    });
});
