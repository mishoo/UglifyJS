//#! /usr/bin/env nodejs
// -*- js -*-

"use strict";

var UglifyJS = require("../tools/node");
var sys = require("util");
var yargs = require("yargs");
var fs = require("fs");
var colors = require("colors");

var ARGS = yargs
	.usage("$0 input1.js \n")
	.describe("print_ast", "Prints a dot file describing the internal abstract syntax")
	.describe("json_formatting", "Prints the JSON nicelly formatted")
	.describe("skip_minified", "Whether to skip processing minified files")
	.describe("features", "Comma separated list of features: \n" + 
         "ASTREL - relations in AST, \n" + 
         "FNAMES - function names to internal calls,\n" +
		 "FSCOPE - add variable scope constraints.")
	.demand(1)
	.default('features', 'ASTREL,FNAMES,FSCOPE')
	.boolean("print_ast")
	.boolean("skip_minified")
	.boolean("json_formatting")
	.string("features")
	.wrap(80)
	.argv
;

normalize(ARGS);

if (ARGS.h || ARGS.help) {
	sys.puts(yargs.help());
	process.exit(0);
}

var files = ARGS._.slice();
if (files.length > 1) {
	sys.error("WARNING: expected only single input file. Processing file '" + files[0] + "' while the rest is ignored.");
}

if (ARGS.features === true) {
	sys.error("ERROR: empty set of features.");
	process.exit(1);
}

var features = ARGS.features.split(",");
for (var i = 0; i < features.length; i++) {
	if (features[i] != "FNAMES" && features[i] != "ASTREL" && features[i] != "FSCOPE") {
		sys.error("WARNING: ignoring not supported feature '" + features[i] + "'.");
	}
}

for (var i = 0; i < files.length; i++) {
	processFile(files[i], ARGS.print_ast, ARGS.features, ARGS.json_formatting, ARGS.skip_minified);
}

function stripInterpreter(code){
	if (code.slice(0,2) != "#!"){
		return code;
	}

	return code.slice(code.indexOf('\n') + 1);
}

function processFile(file, print_ast, features, json_formatting, skip_minified) {
	var code;
	try {
		code = fs.readFileSync(file, "utf-8");
	}
	catch (ex) {
		sys.error("ERROR:".red + " can't read file '" + file + "'");
		return;
	}

	//if it is a script, the UglifyJS parser will fail to parse it
	code = stripInterpreter(code);

	try {
		var output = UglifyJS.extractFeatures(code, file, print_ast, features, skip_minified);
	} catch (ex){
		if (ex instanceof UglifyJS.Parse_Error){
			sys.error("ERROR: ".red + "cannot parse file '" + file + "': " + ex.message);
		} else if (ex instanceof  UglifyJS.Minified_Error){
			//sys.error("WARN: ".yellow + "skipping minified file '" + file + "'");
		} else {
			sys.error("ERROR: ".red + "'" + file + "': " + ex);
		}

		return;
	}

	if (output == null) {
		return;
	}

	if (!json_formatting) {
		output = removeWhitespace(output);
	}

	//validate JSON	
    try {
        JSON.parse(output);
    } catch (e) {
		sys.error("ERROR: ".red + "output is not valid JSON " + "'" + file + "'");
        throw e;
    }

    if (removeWhitespace(output) != '{"query":[],"assign":[]}') {
    	console.log(output);
		//sys.error("OK: ".green + "'" + file + "'");
    } else {
		sys.error("WARN: ".yellow + " no features extracted '" + file + "'");
	}
	
}

/* ------------------------ */

function normalize(o) {
	for (var i in o) if (o.hasOwnProperty(i) && /-/.test(i)) {
		o[i.replace(/-/g, "_")] = o[i];
		delete o[i];
	}
}

function removeWhitespace(input){
    return input.replace(/\s/g,"");
}