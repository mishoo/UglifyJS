#! /usr/bin/env node
// -*- js -*-

"use strict";

var createHash = require("crypto").createHash;
var fetch = require("./fetch");
var fork = require("child_process").fork;
var zlib = require("zlib");
var args = process.argv.slice(2);
if (!args.length) {
    args.push("-mc");
}
args.push("--timings");
var urls = [
    "https://code.jquery.com/jquery-3.4.1.js",
    "https://code.angularjs.org/1.7.8/angular.js",
    "https://unpkg.com/mathjs@6.2.3/dist/math.js",
    "https://unpkg.com/react@15.3.2/dist/react.js",
    "https://cdnjs.cloudflare.com/ajax/libs/d3/5.12.0/d3.js",
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.js",
    "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.js",
    "https://cdnjs.cloudflare.com/ajax/libs/ember.js/2.12.2/ember.prod.js",
    "https://raw.githubusercontent.com/kangax/html-minifier/v4.0.0/dist/htmlminifier.js",
];
var results = {};
var remaining = 2 * urls.length;
function done() {
    if (!--remaining) {
        var failures = [];
        var sum = { input: 0, output: 0, gzip: 0 };
        urls.forEach(function(url) {
            var info = results[url];
            console.log();
            console.log(url);
            console.log(info.log);
            console.log("Original:", info.input, "bytes");
            console.log("Uglified:", info.output, "bytes");
            console.log("GZipped: ", info.gzip, "bytes");
            console.log("SHA1 sum:", info.sha1);
            if (info.code) {
                failures.push(url);
            }
            sum.input += info.input;
            sum.output += info.output;
            sum.gzip += info.gzip;
        });
        if (failures.length) {
            console.error("Benchmark failed:");
            failures.forEach(function(url) {
                console.error(url);
            });
            process.exit(1);
        } else {
            console.log();
            console.log("Subtotal");
            console.log();
            console.log("Original:", sum.input, "bytes");
            console.log("Uglified:", sum.output, "bytes");
            console.log("GZipped: ", sum.gzip, "bytes");
        }
    }
}
urls.forEach(function(url) {
    results[url] = {
        input: 0,
        output: 0,
        gzip: 0,
        log: ""
    };
    fetch(url, function(err, res) {
        if (err) throw err;
        var uglifyjs = fork("bin/uglifyjs", args, { silent: true });
        res.on("data", function(data) {
            results[url].input += data.length;
        }).pipe(uglifyjs.stdin);
        uglifyjs.stdout.on("data", function(data) {
            results[url].output += data.length;
        }).pipe(zlib.createGzip({
            level: zlib.Z_BEST_COMPRESSION
        })).on("data", function(data) {
            results[url].gzip += data.length;
        }).pipe(createHash("sha1")).on("data", function(data) {
            results[url].sha1 = data.toString("hex");
            done();
        });
        uglifyjs.stderr.setEncoding("utf8");
        uglifyjs.stderr.on("data", function(data) {
            results[url].log += data;
        });
        uglifyjs.on("exit", function(code) {
            results[url].code = code;
            done();
        });
    });
});
setInterval(function() {
    process.stderr.write("\0");
}, 5 * 60 * 1000).unref();
