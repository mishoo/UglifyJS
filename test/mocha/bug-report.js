var assert = require("assert");
var exec = require("child_process").exec;

describe("UGLIFY_BUG_REPORT", function() {
    var env = Object.create(process.env);
    env.UGLIFY_BUG_REPORT = 1;
    it("Should generate bug report via API", function(done) {
        exec('"' + process.argv[0] + '"', { env: env }, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                "// UGLIFY_BUG_REPORT",
                "// <<undefined>>",
                "",
                "//-------------------------------------------------------------",
                "// INPUT CODE",
                "...---...",
                "",
            ].join("\n"));
            done();
        }).stdin.end('console.log(require("./").minify("...---...").code);');
    });
    it("Should generate bug report via CLI", function(done) {
        exec('"' + process.argv[0] + '" bin/uglifyjs -mc', { env: env }, function(err, stdout) {
            if (err) throw err;
            assert.strictEqual(stdout, [
                "// UGLIFY_BUG_REPORT",
                "// {",
                '//   "mangle": {},',
                '//   "compress": {}',
                "// }",
                "",
                "//-------------------------------------------------------------",
                "// STDIN",
                "...---...",
                "",
            ].join("\n"));
            done();
        }).stdin.end("...---...");
    });
});
