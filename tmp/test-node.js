#! /usr/bin/env node

var sys = require("util");
var fs = require("fs");

var UglifyJS = require("../tools/node");

var filename = process.argv[2];
var code = fs.readFileSync(filename, "utf8");

var ast = UglifyJS.parse(code);
ast.figure_out_scope();
ast.compute_char_frequency();
console.log(UglifyJS.base54.get().join(","));
