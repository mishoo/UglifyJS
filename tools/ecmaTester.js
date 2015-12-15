#! /usr/bin/env node

// Runs a test262(-like) script through the uglifyjs minifier with default options
// It is expected to minify and execute the script without problems
// as a failed test is indicated by throwing an exception.

// How to use (assuming the current working directory is a checkout of the test262 repo):
// [path to python2 executable] .\tools\packaging\test262.py --command "node <pathTo>\UglifyJS2\tools\ecmaTester.js" [add some words as filter (like 'language')]

// argv number 2 is assumed to be the input file
var file = process.argv[2];

var fs = require("fs");
var vm = require("vm");
var UglifyJS = require("./node.js");

console.log("Using ", process.versions);

var minified = "[Nothing]";
var source;
var issues = false;
var unminifiedError = "";
var sameError = false;

try {
    // Compress file
    minified = UglifyJS.minify(file).code;
    // Run the minified code to check if the script is still runable
    vm.runInNewContext(minified, {});

} catch(e) {
    // Make sure script runs fine without compiling as well
    source = fs.readFileSync(file, {encoding: 'utf8'});
    issues = true;

    // Investigate if an error occurs unminified as well
    try {
        vm.runInNewContext(source, {});
        issues = false;
        unminifiedError += "Ran unminified without problems";

    } catch (e2) {
        unminifiedError = "Error while running the unminified version:\n";
        unminifiedError += "Error: " + e2 + "\n";
        unminifiedError += "Stack: " + e2.stack;
        if (e2 + "" == e + "") {
            sameError = true;
        }
    }

    // Report
    console.log("A minified script failed to run " +
        (issues ?
            "both minified and minified. This is likely an invalid js file" +
            " or has code the interpreter engine doesn't understand." :
            "after being minified. Please report node version, test" +
            " and error to the maintainer of the minifier tool."
        )
    );
    console.log("Version: Node " + process.versions.node);
    console.log("File (may be a temp file): " + file);
    console.log("Error: ", e);
    console.log("Stack: ", e.stack);
    console.log("\n\n");
    console.log(unminifiedError);
    console.log();
    if (!sameError) {
        console.log("Minified output:");
        console.log(minified);
        console.log();
    }
    console.log("==========\n");

    // Exit 1 if its our fault, exit 2 if the interpreter fails as well
    process.exit(issues ? 2 : 1);
}