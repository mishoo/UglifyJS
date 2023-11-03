var child_process = require("child_process");

module.exports = function(tasks) {
    (function next() {
        if (!tasks.length) return;
        var args = tasks.shift();
        console.log();
        console.log("\u001B[36m$> " + args.join(" ") + "\u001B[39m");
        child_process.spawn(process.argv[0], args, {
            stdio: [ "ignore", 1, 2 ]
        }).on("exit", function(code) {
            if (code) process.exit(code);
            next();
        });
    })();
};
