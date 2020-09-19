var child_process = require("child_process");

var ping = 5 * 60 * 1000;
var period = +process.argv[2];
var endTime = period < 0 ? period : Date.now() + period;
for (var i = 0; i < 2; i++) spawn(endTime);

function spawn(endTime) {
    var args = [
        "--max-old-space-size=2048",
        "test/ufuzz"
    ];
    if (endTime < 0) args.push(-endTime);
    var child = child_process.spawn("node", args, {
        stdio: [ "ignore", "pipe", "pipe" ]
    }).on("exit", respawn);
    var stdout = "";
    child.stdout.on("data", function(data) {
        stdout += data;
    });
    var stderr = "";
    child.stderr.on("data", trap).pipe(process.stdout);
    var keepAlive = setInterval(function() {
        var end = stdout.lastIndexOf("\r");
        console.log(stdout.slice(stdout.lastIndexOf("\r", end - 1) + 1, end));
        stdout = stdout.slice(end + 1);
    }, ping);
    if (endTime < 0) return;
    var timer = setTimeout(function() {
        clearInterval(keepAlive);
        child.removeListener("exit", respawn);
        child.kill();
    }, endTime - Date.now());

    function respawn() {
        console.log(stdout.replace(/[^\r\n]*\r/g, ""));
        clearInterval(keepAlive);
        if (endTime < 0) return;
        clearTimeout(timer);
        spawn(endTime);
    }

    function trap(data) {
        stderr += data;
        if (~stderr.indexOf("\nminify(options):\n")) {
            process.exitCode = 1;
            child.stderr.removeListener("data", trap);
        }
    }
}
