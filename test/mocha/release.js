var assert = require("assert");
var semver = require("semver");
var spawn = require("child_process").spawn;

if (!process.env.UGLIFYJS_TEST_ALL) return;

function run(command, args, done) {
    spawn(command, args, {
        stdio: [ "ignore", 1, 2 ]
    }).on("exit", function(code) {
        assert.strictEqual(code, 0);
        done();
    });
}

describe("test/benchmark.js", function() {
    this.timeout(10 * 60 * 1000);
    [
        "-b",
        "-b bracketize",
        "-m",
        "-mc passes=3",
        "-mc passes=3,toplevel",
        "-mc passes=3,unsafe",
        "-mc keep_fargs=false,passes=3",
        "-mc keep_fargs=false,passes=3,pure_getters,unsafe,unsafe_comps,unsafe_math,unsafe_proto",
    ].forEach(function(options) {
        it("Should pass with options " + options, function(done) {
            var args = options.split(/ /);
            args.unshift("test/benchmark.js");
            run(process.argv[0], args, done);
        });
    });
});

if (semver.satisfies(process.version, "0.12")) return;
describe("test/jetstream.js", function() {
    this.timeout(20 * 60 * 1000);
    [
        "-mc",
        "-mc keep_fargs=false,passes=3,pure_getters,unsafe,unsafe_comps,unsafe_math,unsafe_proto",
    ].forEach(function(options) {
        it("Should pass with options " + options, function(done) {
            var args = options.split(/ /);
            args.unshift("test/jetstream.js");
            args.push("-b", "beautify=false,webkit");
            run(process.argv[0], args, done);
        });
    });
});
