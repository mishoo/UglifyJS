"use strict";

var child_process = require("child_process");
var https = require("https");
var url = require("url");

var period = 45 * 60 * 1000;
var wait = 2 * 60 * 1000;
if (process.argv.length > 2) {
    var token = process.argv[2];
    var branch = process.argv[3] || "v" + require("../../package.json").version;
    var repository = encodeURIComponent(process.argv[4] || "mishoo/UglifyJS2");
    var concurrency = process.argv[5] || 1;
    var platform = process.argv[6] || "latest";
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
                message: "ufuzz testing",
                branch: branch,
                config: {
                    cache: false,
                    env: "NODE=" + platform,
                    script: "node test/ufuzz/job " + period
                }
            }
        }));
    })();
} else {
    console.log("Usage: test/ufuzz/travis.js <token> [branch] [repository] [concurrency] [platform]");
}
