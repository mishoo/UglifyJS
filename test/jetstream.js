#! /usr/bin/env node
// -*- js -*-

"use strict";

var site = "http://browserbench.org/JetStream";
if (typeof phantom == "undefined") {
    // workaround for tty output truncation upon process.exit()
    [process.stdout, process.stderr].forEach(function(stream){
        if (stream._handle && stream._handle.setBlocking)
            stream._handle.setBlocking(true);
    });
    var args = process.argv.slice(2);
    var debug = args.indexOf("--debug");
    if (debug >= 0) {
        args.splice(debug, 1);
        debug = true;
    } else {
        debug = false;
    }
    if (!args.length) {
        args.push("-mcb", "beautify=false,webkit");
    }
    args.push("--timings");
    var child_process = require("child_process");
    var http = require("http");
    var server = http.createServer(function(request, response) {
        request.resume();
        var url = site + request.url;
        http.get(url, function(res) {
            response.writeHead(res.statusCode, {
                "Content-Type": res.headers["content-type"]
            });
            if (/\.js$/.test(url)) {
                var stderr = "";
                var uglifyjs = child_process.fork("bin/uglifyjs", args, {
                    silent: true
                }).on("exit", function(code) {
                    console.log("uglifyjs", url.slice(site.length + 1), args.join(" "));
                    console.log(stderr);
                    if (code) throw new Error("uglifyjs failed with code " + code);
                });
                uglifyjs.stderr.on("data", function(data) {
                    stderr += data;
                }).setEncoding("utf8");
                uglifyjs.stdout.pipe(response);
                res.pipe(uglifyjs.stdin);
            } else {
                res.pipe(response);
            }
        });
    }).listen();
    server.on("listening", function() {
        var port = server.address().port;
        if (debug) {
            console.log("http://localhost:" + port + "/");
        } else {
            child_process.exec("npm install phantomjs-prebuilt@2.1.14 --no-save", function(error) {
                if (error) throw error;
                var program = require("phantomjs-prebuilt").exec(process.argv[1], port);
                program.stdout.pipe(process.stdout);
                program.stderr.pipe(process.stderr);
                program.on("exit", function(code) {
                    server.close();
                    if (code) throw new Error("JetStream failed!");
                    console.log("JetStream completed successfully.");
                });
            });
        }
    });
    server.timeout = 0;
} else {
    var page = require("webpage").create();
    page.onError = function(msg, trace) {
        var body = [ msg ];
        if (trace) trace.forEach(function(t) {
            body.push("  " + (t.function || "Anonymous function") + " (" + t.file + ":" + t.line + ")");
        });
        console.error(body.join("\n"));
        phantom.exit(1);
    };
    var url = "http://localhost:" + require("system").args[1] + "/";
    page.onConsoleMessage = function(msg) {
        if (/Error:/i.test(msg)) {
            console.error(msg);
            phantom.exit(1);
        }
        console.log(msg);
        if (~msg.indexOf("Raw results:")) {
            phantom.exit();
        }
    };
    page.open(url, function(status) {
        if (status != "success") phantom.exit(1);
        page.evaluate(function() {
            JetStream.switchToQuick();
            JetStream.start();
        });
    });
}
