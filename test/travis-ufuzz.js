"use strict";

var period = 45 * 60 * 1000;
var wait = 2 * 60 * 1000;
var ping = 5 * 60 * 1000;
if (process.argv.length > 2) {
    var token = process.argv[2];
    var branch = process.argv[3] || "v" + require("../package.json").version;
    var project = encodeURIComponent(process.argv[4] || "mishoo/UglifyJS2");
    (function init() {
        setTimeout(init, period + wait);
        var options = require("url").parse("https://api.travis-ci.org/repo/" + project + "/requests");
        options.method = "POST";
        options.headers = {
            "Content-Type": "application/json",
            "Travis-API-Version": 3,
            "Authorization": "token " + token
        };
        require("https").request(options, function(res) {
            console.log("HTTP", res.statusCode);
            console.log(JSON.stringify(res.headers, null, 2));
            console.log();
            res.setEncoding("utf8");
            res.on("data", console.log);
        }).on("error", console.error).end(JSON.stringify({
            request: {
                message: "ufuzz testing (when idle)",
                branch: branch,
                config: {
                    merge_mode: "replace",
                    language: "node_js",
                    node_js: "9",
                    sudo: false,
                    script: "node test/travis-ufuzz"
                }
            }
        }));
    })();
} else {
    var child = require("child_process").spawn("node", [
        "--max-old-space-size=2048",
        "test/ufuzz"
    ], {
        stdio: [ "ignore", "pipe", "pipe" ]
    });
    var line = "";
    child.stdout.on("data", function(data) {
        line += data;
    });
    child.stderr.on("data", function() {
        process.exitCode = (process.exitCode || 0) + 1;
    }).pipe(process.stdout);
    var keepAlive = setInterval(function() {
        var end = line.lastIndexOf("\r");
        console.log(line.slice(line.lastIndexOf("\r", end - 1) + 1, end));
        line = line.slice(end + 1);
    }, ping);
    setTimeout(function() {
        clearInterval(keepAlive);
        child.kill();
    }, period);
}
