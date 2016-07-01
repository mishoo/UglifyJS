var assert = require("assert");
var exec = require("child_process").exec;

describe("bin/uglifyjs", function () {
    it("should produce a functional build when using --self", function (done) {
        this.timeout(5000);

        var uglifyjs = '"' + process.argv[0] + '" bin/uglifyjs';
        var command = uglifyjs + ' --self -cm --wrap WrappedUglifyJS';

        exec(command, function (err, stdout) {
            if (err) throw err;

            eval(stdout);

            assert.strictEqual(typeof WrappedUglifyJS, 'object');
            assert.strictEqual(true, WrappedUglifyJS.parse('foo;') instanceof WrappedUglifyJS.AST_Node);

            done();
        });
    });
});
