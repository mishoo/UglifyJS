var assert = require("assert");
var exec = require("child_process").exec;

describe("spidermonkey export/import sanity test", function() {
    it("should produce a functional build when using --self with spidermonkey", function (done) {
        this.timeout(20000);

        var uglifyjs = '"' + process.argv[0] + '" bin/uglifyjs';
        var command = uglifyjs + " --self -cm --wrap SpiderUglify --dump-spidermonkey-ast | " +
            uglifyjs + " --spidermonkey -cm";

        exec(command, function (err, stdout) {
            if (err) throw err;

            eval(stdout);
            assert.strictEqual(typeof SpiderUglify, "object");

            var ast = SpiderUglify.parse("foo([true,,2+3]);");
            assert.strictEqual(true, ast instanceof SpiderUglify.AST_Node);

            ast.figure_out_scope();
            ast = SpiderUglify.Compressor({}).compress(ast);
            assert.strictEqual(true, ast instanceof SpiderUglify.AST_Node);

            var stream = SpiderUglify.OutputStream({});
            ast.print(stream);
            var code = stream.toString();
            assert.strictEqual(code, "foo([!0,,5]);");

            done();
        });
    });
});
