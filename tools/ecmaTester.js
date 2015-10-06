#! /usr/bin/env node

// Runs a test262(-like) script through the uglifyjs minifier with default options
// It is expected to minify and execute the script without problems
// as a failed test is indicated by throwing an exception.

// argv number 2 is assumed to be the input file
var file = process.argv[2];

var fs = require("fs");
var vm = require("vm");
var UglifyJS = require("./node.js");

console.log("Using node " + process.versions.node);
console.log(process.versions);

var result = "[Nothing]";
try {
    // Compress file
    result = UglifyJS.minify(file).code;
    // Run result to make sure the script is still runable
    vm.runInNewContext(result, {});

} catch(e) {
    // Report
    console.log("A minified script failed to run");
    console.log("file: " + file);
    console.log("minified output:");
    console.log(result);
    console.log();
    console.log("==========");
    console.log(e);
    console.log(e.stack);
    console.log();
    console.log("Now running script without minification...");
    console.log();

    // Make sure script runs fine without compiling as well
    input = fs.readFileSync(file, {encoding: 'utf8'});
    try {
        vm.runInNewContext(input, {});
        console.log("Ran without problems unminified");
    } catch (e2) {
        console.log("Failed to run script unminified as well");
        console.log(e2.stack);

        process.exit(2); // Nope...
    }

    process.exit(1); // We found a great mystery to solve
}