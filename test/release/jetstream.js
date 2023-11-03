require("./run")([
    "-mc",
    "-mc keep_fargs=false,passes=3,pure_getters,unsafe,unsafe_comps,unsafe_math,unsafe_proto",
].map(function(options) {
    var args = options.split(/ /);
    args.unshift("test/jetstream.js");
    args.push("-O", "webkit");
    args.push("--no-module");
    return args;
}));
