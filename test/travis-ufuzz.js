"use strict";

var period = 20 * 60 * 1000;
if (process.argv.length > 2) {
    var token = process.argv[2];
    var branch = process.argv[3] || "v" + require("../package.json").version;
    (function init() {
        setTimeout(init, period);
        var options = require("url").parse("https://api.travis-ci.org/repo/mishoo%2FUglifyJS2/requests");
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
    var child = require("child_process").spawn("node", [ "test/ufuzz" ], {
        stdio: [ "ignore", "ignore", 1 ]
    });
    var keepAlive = setInterval(console.log, 5 * 60 * 1000);
    setTimeout(function() {
        clearInterval(keepAlive);
        child.kill();
    }, period);
}
