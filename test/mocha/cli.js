var assert = require("assert");
var exec = require("child_process").exec;
var fs = require("fs");

function read(path) {
    return fs.readFileSync(path, "utf8");
}

describe("bin/uglifyjs", function() {
    var uglifyjscmd = '"' + process.argv[0] + '" bin/uglifyjs';
    it("Should produce a functional build when using --self", function(done) {
        this.timeout(30000);
        var command = uglifyjscmd + ' --self -cm --wrap WrappedUglifyJS';
        exec(command, function(err, stdout) {
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
            assert.strictEqual(stdout, "// foo\n/*@preserve*/\n// bar\n\n");
            done();
        });
    });
    it("Should be able to filter comments correctly with `--comment <RegExp>`", function(done) {
        var command = uglifyjscmd + ' test/input/comments/filter.js --comments /r/';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "/*@preserve*/\n// bar\n\n");
            done();
        });
    });
    it("Should be able to filter comments correctly with just `--comment`", function(done) {
        var command = uglifyjscmd + ' test/input/comments/filter.js --comments';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "/*@preserve*/\n\n");
            done();
        });
    });
    it("Should give sensible error against invalid input source map", function(done) {
        var command = uglifyjscmd + " test/mocha.js --source-map content=blah,url=inline";
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
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvaW5wdXQvaXNzdWUtMTMyMy9zYW1wbGUuanMiXSwibmFtZXMiOlsiYmFyIiwiZm9vIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxJQUFNLFdBQ04sU0FBU0MsSUFBS0QsS0FDVixPQUFPQSxJQUdYLE9BQU9DLElBTEQifQ==",
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
            "--source-map", "content=" + mapFile,
            "--source-map", "includeSources=true",
            "--source-map", "url=inline",
        ].join(" ");

        var child = exec(command, function(err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, read("test/input/pr-3040/expect.js"));
            done();
        });
        setTimeout(function() {
            fs.writeFileSync(mapFile, read("test/input/pr-3040/input.js.map"));
            child.stdin.end(read("test/input/pr-3040/input.js"));
        }, 1000);
    });
    it("Should work with --keep-fnames (mangle only)", function(done) {
        var command = uglifyjscmd + ' test/input/issue-1431/sample.js --keep-fnames -m';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(r){return function(){function n(n){return n*n}return r(n)}}function g(n){return n(1)+n(2)}console.log(f(g)()==5);\n");
            done();
        });
    });
    it("Should work with --keep-fnames (mangle & compress)", function(done) {
        var command = uglifyjscmd + ' test/input/issue-1431/sample.js --keep-fnames -m -c unused=false';
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(r){return function(){function n(n){return n*n}return r(n)}}function g(n){return n(1)+n(2)}console.log(5==f(g)());\n");
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
            assert.strictEqual(stdout, read("test/input/issue-1482/default.js"));
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
        var command = uglifyjscmd + " test/input/issue-1323/sample.js --source-map content=inline,url=inline";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                "var bar=function(){function foo(bar){return bar}return foo}();",
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvaW5wdXQvaXNzdWUtMTMyMy9zYW1wbGUuanMiXSwibmFtZXMiOlsiYmFyIiwiZm9vIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxJQUFNLFdBQ04sU0FBU0MsSUFBS0QsS0FDVixPQUFPQSxJQUdYLE9BQU9DLElBTEQifQ==",
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
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                "var Foo=function Foo(){console.log(1+2)};new Foo;var bar=function(){function foo(bar){return bar}return foo}();",
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0ZGluIiwidGVzdC9pbnB1dC9pc3N1ZS0xMzIzL3NhbXBsZS5qcyJdLCJuYW1lcyI6WyJGb28iLCJjb25zb2xlIiwibG9nIiwiYmFyIiwiZm9vIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNQSxJQUFJLFNBQUFBLE1BQWdCQyxRQUFRQyxJQUFJLEVBQUUsSUFBTyxJQUFJRixJQ0FuRCxJQUFJRyxJQUFNLFdBQ04sU0FBU0MsSUFBS0QsS0FDVixPQUFPQSxJQUdYLE9BQU9DLElBTEQifQ==",
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
        var command = uglifyjscmd + ' test/input/invalid/simple.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            var lines = stderr.split(/\n/);
            assert.strictEqual(lines[0], "Parse error at test/input/invalid/simple.js:1,12");
            assert.strictEqual(lines[1], "function f(a{}");
            assert.strictEqual(lines[2], "            ^");
            assert.strictEqual(lines[3], "ERROR: Unexpected token punc «{», expected punc «,»");
            done();
        });
    });
    it("Should fail with correct marking of tabs", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/tab.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            var lines = stderr.split(/\n/);
            assert.strictEqual(lines[0], "Parse error at test/input/invalid/tab.js:1,12");
            assert.strictEqual(lines[1], "\t\tfoo(\txyz, 0abc);");
            assert.strictEqual(lines[2], "\t\t    \t     ^");
            assert.strictEqual(lines[3], "ERROR: Invalid syntax: 0abc");
            done();
        });
    });
    it("Should fail with correct marking at start of line", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/eof.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            var lines = stderr.split(/\n/);
            assert.strictEqual(lines[0], "Parse error at test/input/invalid/eof.js:2,0");
            assert.strictEqual(lines[1], "foo, bar(");
            assert.strictEqual(lines[2], "         ^");
            assert.strictEqual(lines[3], "ERROR: Unexpected token: eof (undefined)");
            done();
        });
    });
    it("Should fail with a missing loop body", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/loop-no-body.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            var lines = stderr.split(/\n/);
            assert.strictEqual(lines[0], "Parse error at test/input/invalid/loop-no-body.js:2,0");
            assert.strictEqual(lines[1], "for (var i = 0; i < 1; i++) ");
            assert.strictEqual(lines[2], "                            ^");
            assert.strictEqual(lines[3], "ERROR: Unexpected token: eof (undefined)");
            done();
        });
    });
    it("Should throw syntax error (5--)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/assign_1.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/assign_1.js:1,18",
                "console.log(1 || 5--);",
                "                  ^",
                "ERROR: Invalid use of -- operator"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (Math.random() /= 2)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/assign_2.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/assign_2.js:1,32",
                "console.log(2 || (Math.random() /= 2));",
                "                                ^",
                "ERROR: Invalid assignment"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (++this)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/assign_3.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/assign_3.js:1,17",
                "console.log(3 || ++this);",
                "                 ^",
                "ERROR: Invalid use of ++ operator"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (++null)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/assign_4.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/assign_4.js:1,0",
                "++null",
                "^",
                "ERROR: Invalid use of ++ operator"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (a.=)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/dot_1.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/dot_1.js:1,2",
                "a.=",
                "  ^",
                "ERROR: Unexpected token: operator (=)"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (%.a)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/dot_2.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/dot_2.js:1,0",
                "%.a;",
                "^",
                "ERROR: Unexpected token: operator (%)"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (a./();)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/dot_3.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/dot_3.js:1,2",
                "a./();",
                "  ^",
                "ERROR: Unexpected token: operator (/)"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error ({%: 1})", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/object.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/object.js:1,13",
                "console.log({%: 1});",
                "             ^",
                "ERROR: Unexpected token: operator (%)"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (delete x)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/delete.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/delete.js:13,11",
                "    delete x;",
                "           ^",
                "ERROR: Calling delete on expression not allowed in strict mode"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (function g(arguments))", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/function_1.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/function_1.js:4,11",
                "function g(arguments) {",
                "           ^",
                "ERROR: Unexpected arguments in strict mode"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (function eval())", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/function_2.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/function_2.js:4,9",
                "function eval() {",
                "         ^",
                "ERROR: Unexpected eval in strict mode"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (iife arguments())", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/function_3.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/function_3.js:4,10",
                "!function arguments() {",
                "          ^",
                "ERROR: Unexpected arguments in strict mode"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (catch(eval))", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/try.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/try.js:7,18",
                "    try {} catch (eval) {}",
                "                  ^",
                "ERROR: Unexpected eval in strict mode"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (var eval)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/var.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/var.js:7,8",
                "    var eval;",
                "        ^",
                "ERROR: Unexpected eval in strict mode"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (else)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/else.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/else.js:1,7",
                "if (0) else 1;",
                "       ^",
                "ERROR: Unexpected token: keyword (else)"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (return)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/return.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/return.js:1,0",
                "return 42;",
                "^",
                "ERROR: 'return' outside of function"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (for-in init)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/for-in_1.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/for-in_1.js:2,5",
                "for (1, 2, a in b) {",
                "     ^",
                "ERROR: Invalid left-hand side in for..in loop"
            ].join("\n"));
            done();
        });
    });
    it("Should throw syntax error (for-in var)", function(done) {
        var command = uglifyjscmd + ' test/input/invalid/for-in_2.js';
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr.split(/\n/).slice(0, 4).join("\n"), [
                "Parse error at test/input/invalid/for-in_2.js:2,5",
                "for (var a, b in c) {",
                "     ^",
                "ERROR: Only one variable declaration allowed in for..in loop"
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
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImZvbyIsIngiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiYUFBQSxJQUFJQSxJQUFNLFNBQU5BLElBQU1DLEdBQUEsTUFBSyxPQUFTQSxHQUN4QkMsUUFBUUMsSUFBSUgsSUFBSSJ9",
                ""
            ].join("\n"));
            done();
        });

        function read_map() {
            var map = JSON.parse(read("./test/input/issue-1236/simple.js.map"));
            delete map.sourcesContent;
            return JSON.stringify(map).replace(/"/g, '\\"');
        }
    });
    it("Should include function calls in source map", function(done) {
        var command = [
            uglifyjscmd,
            "test/input/issue-2310/input.js",
            "-c",
            "--source-map", "url=inline",
        ].join(" ");
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                'function foo(){return function(){console.log("PASS")}}foo()();',
                "//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvaW5wdXQvaXNzdWUtMjMxMC9pbnB1dC5qcyJdLCJuYW1lcyI6WyJmb28iLCJjb25zb2xlIiwibG9nIiwiZiJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsTUFDTCxPQUFPLFdBQ0hDLFFBQVFDLElBQUksU0FLUkYsS0FDUkcifQ==",
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
        var command = uglifyjscmd + " test/input/issue-505/input.js -m reserved=[callback]";
        exec(command, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, 'function test(callback){"aaaaaaaaaaaaaaaa";callback(err,data);callback(err,data)}\n');
            done();
        });
    });
    it("Should work with --mangle reserved=false", function(done) {
        var command = uglifyjscmd + " test/input/issue-505/input.js -m reserved=false";
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
    it("Should fail with --define a-b", function(done) {
        var command = uglifyjscmd + " test/input/issue-505/input.js --define a-b";
        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.strictEqual(stdout, "");
            assert.strictEqual(stderr, "Error parsing arguments for 'define': a-b\n");
            done();
        });
    });
    it("Should work with explicit --rename", function(done) {
        var command = uglifyjscmd + " test/input/rename/input.js --rename";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(a){return b(a);function b(c){return c}}\n");
            done();
        });
    });
    it("Should work with explicit --no-rename", function(done) {
        var command = uglifyjscmd + " test/input/rename/input.js -mc passes=2 --no-rename";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(n){return function(n){return n}(n)}\n");
            done();
        });
    });
    it("Should work with implicit --rename", function(done) {
        var command = uglifyjscmd + " test/input/rename/input.js -mc passes=2";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(n){return n}\n");
            done();
        });
    });
    it("Should work with implicit --no-rename", function(done) {
        var command = uglifyjscmd + " test/input/rename/input.js -c passes=2";
        exec(command, function(err, stdout, stderr) {
            if (err) throw err;
            assert.strictEqual(stdout, "function f(x){return function(x){return x}(x)}\n");
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
            assert.strictEqual(stdout, '(function(window,undefined){(function(exports){function enclose(){console.log("test enclose")}enclose()})(typeof exports=="undefined"?exports={}:exports)})(window);\n');
            done();
        });
    });
});
