var child_process = require("child_process");

var ping = 5 * 60 * 1000;
var period = +process.argv[2];
var endTime = Date.now() + period;
for (var i = 0; i < 2; i++) spawn(endTime);

function spawn(endTime) {
    var child = child_process.spawn("node", [
        "--max-old-space-size=2048",
        "test/ufuzz"
    ], {
        stdio: [ "ignore", "pipe", "pipe" ]
    }).on("exit", respawn);
    var line = "";
    child.stdout.on("data", function(data) {
        line += data;
    });
    child.stderr.once("data", function() {
        process.exitCode = 1;
    }).pipe(process.stdout);
    var keepAlive = setInterval(function() {
        var end = line.lastIndexOf("\r");
        console.log(line.slice(line.lastIndexOf("\r", end - 1) + 1, end));
        line = line.slice(end + 1);
    }, ping);
    var timer = setTimeout(function() {
        clearInterval(keepAlive);
        child.removeListener("exit", respawn);
        child.kill();
    }, endTime - Date.now());

    function respawn() {
        console.log(line);
        clearInterval(keepAlive);
        clearTimeout(timer);
        spawn(endTime);
    }
}
