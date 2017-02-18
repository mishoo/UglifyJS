#! /usr/bin/env node
// -*- js -*-

"use strict";

var createHash = require("crypto").createHash;
var fork = require("child_process").fork;
var args = process.argv.slice(2);
if (!args.length) {
    args.push("-mc", "warnings=false");
}
args.push("--stats");
var urls = [
    "https://code.jquery.com/jquery-3.1.1.js",
    "https://code.angularjs.org/1.6.1/angular.js",
    "https://cdnjs.cloudflare.com/ajax/libs/mathjs/3.9.0/math.js",
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.js",
    "https://unpkg.com/react@15.3.2/dist/react.js",
    "http://builds.emberjs.com/tags/v2.11.0/ember.prod.js",
    "https://cdn.jsdelivr.net/lodash/4.17.4/lodash.js",
    "https://cdnjs.cloudflare.com/ajax/libs/d3/4.5.0/d3.js",
];
var results = {};
var remaining = 2 * urls.length;
function done() {
    if (!--remaining) {
        urls.forEach(function(url) {
            console.log();
            console.log(url);
            console.log(results[url].time);
            console.log("SHA1:", results[url].sha1);
        });
    }
}
urls.forEach(function(url) {
    results[url] = { time: "" };
    require(url.slice(0, url.indexOf(":"))).get(url, function(res) {
        var uglifyjs = fork("bin/uglifyjs", args, { silent: true });
        res.pipe(uglifyjs.stdin);
        uglifyjs.stdout.pipe(createHash("sha1")).on("data", function(data) {
            results[url].sha1 = data.toString("hex");
            done();
        });
        uglifyjs.stderr.setEncoding("utf8");
        uglifyjs.stderr.on("data", function(data) {
            results[url].time += data;
        }).on("end", done)
    });
});
