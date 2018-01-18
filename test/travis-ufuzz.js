"use strict";

var child_process = require("child_process");
var https = require("https");
var url = require("url");

var period = 45 * 60 * 1000;
var wait = 2 * 60 * 1000;
var ping = 5 * 60 * 1000;
if (process.argv[2] == "run") {
    var endTime = Date.now() + period;
    for (var i = 0; i < 2; i++) spawn(endTime);
} else if (process.argv.length > 2) {
    var token = process.argv[2];
    var branch = process.argv[3] || "v" + require("../package.json").version;
    var repository = encodeURIComponent(process.argv[4] || "mishoo/UglifyJS2");
    var concurrency = process.argv[5] || 1;
    (function request() {
        setTimeout(request, (period + wait) / concurrency);
        var options = url.parse("https://api.travis-ci.org/repo/" + repository + "/requests");
        options.method = "POST";
        options.headers = {
            "Content-Type": "application/json",
            "Travis-API-Version": 3,
            "Authorization": "token " + token
        };
        https.request(options, function(res) {
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
                    script: "node test/travis-ufuzz run"
                }
            }
        }));
    })();
} else {
    console.log("Usage: test/travis-ufuzz.js <token> [branch] [repository] [concurrency]");
}

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
    child.stderr.on("data", function() {
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
