#! /usr/bin/env node
// -*- js -*-

"use strict";

var site = "http://browserbench.org/JetStream/";
if (typeof phantom == "undefined") {
    // workaround for tty output truncation upon process.exit()
    [process.stdout, process.stderr].forEach(function(stream){
        if (stream._handle && stream._handle.setBlocking)
            stream._handle.setBlocking(true);
    });
    var args = process.argv.slice(2);
    if (!args.length) {
        args.push("-mc", "warnings=false");
    }
    args.push("--stats");
    var child_process = require("child_process");
    try {
        require("phantomjs-prebuilt");
    } catch(e) {
        child_process.execSync("npm install phantomjs-prebuilt@2.1.14");
    }
    var http = require("http");
    var server = http.createServer(function(request, response) {
        request.resume();
        var url = decodeURIComponent(request.url.slice(1));
        var stderr = "";
        var uglifyjs = child_process.fork("bin/uglifyjs", args, {
            silent: true
        }).on("exit", function(code) {
            console.log("uglifyjs", url.indexOf(site) == 0 ? url.slice(site.length) : url, args.join(" "));
            console.log(stderr);
            if (code) throw new Error("uglifyjs failed with code " + code);
        });
        uglifyjs.stderr.on("data", function(data) {
            stderr += data;
        }).setEncoding("utf8");
        uglifyjs.stdout.pipe(response);
        http.get(url, function(res) {
            res.pipe(uglifyjs.stdin);
        });
    }).listen().on("listening", function() {
        var phantomjs = require("phantomjs-prebuilt");
        var program = phantomjs.exec(process.argv[1], server.address().port);
        program.stdout.pipe(process.stdout);
        program.stderr.pipe(process.stderr);
        program.on("exit", function(code) {
            server.close();
            if (code) throw new Error("JetStream failed!");
            console.log("JetStream completed successfully.");
        });
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
    page.onResourceRequested = function(requestData, networkRequest) {
        if (/\.js$/.test(requestData.url))
            networkRequest.changeUrl(url + encodeURIComponent(requestData.url));
    }
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
    page.open(site, function(status) {
        if (status != "success") phantomjs.exit(1);
        page.evaluate(function() {
            JetStream.switchToQuick();
            JetStream.start();
        });
    });
}
