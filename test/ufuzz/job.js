var actions = require("./actions");
var child_process = require("child_process");

var args = [
    "--max-old-space-size=2048",
    "test/ufuzz",
];
var iterations;
switch (process.argv.length) {
  case 3:
    iterations = +process.argv[2];
    args.push(iterations);
    break;
  case 5:
    actions.init(process.argv[2], process.argv[3], +process.argv[4]);
    break;
  default:
    throw new Error("invalid parameters");
}
var tasks = [ run(), run() ];
if (iterations) return;
var alive = setInterval(function() {
    actions.should_stop(function() {
        clearInterval(alive);
        tasks.forEach(function(kill) {
            kill();
        });
    });
}, 8 * 60 * 1000);

function run() {
    var child, stdout, stderr, log;
    spawn();
    return function() {
        clearInterval(log);
        child.removeListener("exit", respawn);
        child.kill();
    };

    function spawn() {
        child = child_process.spawn("node", args, {
            stdio: [ "ignore", "pipe", "pipe" ]
        }).on("exit", respawn);
        stdout = "";
        child.stdout.on("data", function(data) {
            stdout += data;
        });
        stderr = "";
        child.stderr.on("data", trap).pipe(process.stdout);
        log = setInterval(function() {
            stdout = stdout.replace(/[^\r\n]+\r(?=[^\r\n]+\r)/g, "");
            var end = stdout.lastIndexOf("\r");
            if (end < 0) return;
            console.log(stdout.slice(0, end));
            stdout = stdout.slice(end + 1);
        }, 5 * 60 * 1000);
    }

    function respawn() {
        console.log(stdout.replace(/[^\r\n]*\r/g, ""));
        clearInterval(log);
        if (!iterations) {
            spawn();
        } else if (process.exitCode) {
            tasks.forEach(function(kill) {
                kill();
            });
        }
    }

    function trap(data) {
        stderr += data;
        if (~stderr.indexOf("!!!!!! Failed... round ")) {
            process.exitCode = 1;
            child.stderr.removeListener("data", trap);
        }
    }
}
