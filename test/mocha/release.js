var assert = require("assert");
var spawn = require("child_process").spawn;

if (!process.env.UGLIFYJS_TEST_ALL) return;

function run(command, args, done) {
    var id = setInterval(function() {
        process.stdout.write("\0");
    }, 5 * 60 * 1000);
    spawn(command, args, {
        stdio: "ignore"
    }).on("exit", function(code) {
        clearInterval(id);
        assert.strictEqual(code, 0);
        done();
    });
}

describe("test/benchmark.js", function() {
    this.timeout(5 * 60 * 1000);
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
