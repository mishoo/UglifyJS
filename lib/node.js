#! /usr/bin/env node

var fs = require("fs");

function load_global(file) {
    var code = fs.readFileSync(file, "utf8");
    return global.eval(code);
};

load_global("./utils.js");
load_global("./ast.js");
load_global("./parse.js");

/// 

var filename = process.argv[2];
console.time("parse");
var ast = parse(fs.readFileSync(filename, "utf8"));
console.timeEnd("parse");

