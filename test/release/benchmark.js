setInterval(function() {
    process.stderr.write("\0");
}, 8 * 60 * 1000).unref();
require("./run")([
    "-b",
    "-b braces",
    "-m",
    "-mc passes=3",
    "-mc passes=3,toplevel",
    "-mc passes=3,unsafe",
    "-mc keep_fargs=false,passes=3",
    "-mc keep_fargs=false,passes=3,pure_getters,unsafe,unsafe_comps,unsafe_math,unsafe_proto",
].map(function(options) {
    var args = options.split(/ /);
    args.unshift("test/benchmark.js");
    return args;
}));
