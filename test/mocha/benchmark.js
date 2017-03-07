var assert = require("assert");
var exec = require("child_process").exec;

describe("test/benchmark.js", function() {
    this.timeout(120000);
    var command = '"' + process.argv[0] + '" test/benchmark.js ';
    [
        "-b",
        "-b bracketize",
        "-m",
        "-mc passes=3",
        "-mc passes=3,toplevel",
        "-mc passes=3,unsafe",
        "-mc keep_fargs=false,passes=3",
        "-mc keep_fargs=false,passes=3,pure_getters,unsafe,unsafe_comps,unsafe_math,unsafe_proto",
    ].forEach(function(args) {
        it("Should pass with options " + args, function(done) {
            exec(command + args, function(err) {
                if (err) throw err;
                done();
            });
        });
    });
});
