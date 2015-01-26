//#! /usr/bin/env nodejs
// -*- js -*-

"use strict";

var UglifyJS = require("../tools/node");
var sys = require("util");
var yargs = require("yargs");
var fs = require("fs");
var colors = require("colors");
var http = require('http');

var ARGS = yargs
	.usage("$0 input1.js \n")
	.describe("rename", "Renames variables names with names learnt from large amount of non-obfuscated JavaScript code")
	.describe("nice2predict_server", "server URL used in renaming")
	.describe("print_ast", "Prints a dot file describing the internal abstract syntax tree")
	.describe("nice_formatting", "Prints the results nicely formatted")
	.describe("skip_minified", "Whether to skip processing minified files")
	.describe("extract_features", "extract features into JSON")
	.describe("features", "Comma separated list of features: \n" + 
         "ASTREL - relations in AST, \n" + 
         "FNAMES - function names to internal calls,\n" +
		 "FSCOPE - add variable scope constraints.")
	//.demand(1)
	.default('features', 'ASTREL,FNAMES,FSCOPE')
	.default('nice2predict_server', 'www.nice2predict.org:5745')
	.default('rename', true)
	.boolean("rename")
	.boolean('extract_features')
	.boolean("print_ast")
	.boolean("skip_minified")
	.boolean("nice_formatting")
	.string("features")
	.string("nice2predict_server")
	.wrap(80)
	.check(function(argv, options){
		if (argv._.length == 0){
			throw "ERROR: ".red + "Nothing to analyze. No input file provided.";
		}
	})
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

//http request does not handle http:// and https:// prefixes
ARGS.nice2predict_server = ARGS.nice2predict_server.replace(/^(http:\/\/|https:\/\/)/, '');
var HOST = ARGS.nice2predict_server.split(":")[0];
var PORT = parseInt(ARGS.nice2predict_server.split(":")[1]);

//make only one mode active
if (ARGS.extract_feeatures){
	ARGS.rename = false;
}

var features = ARGS.features.split(",");
for (var i = 0; i < features.length; i++) {
	if (features[i] != "FNAMES" && features[i] != "ASTREL" && features[i] != "FSCOPE") {
		sys.error("WARNING: ignoring not supported feature '" + features[i] + "'.");
	}
}

for (var i = 0; i < files.length; i++) {
	processFile(files[i]);
}

function stripInterpreter(code){
	if (code.slice(0,2) != "#!"){
		return code;
	}

	return code.slice(code.indexOf('\n') + 1);
}

function processFile(file) {
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
		var output = UglifyJS.extractFeatures(code, file, ARGS.print_ast, ARGS.features, ARGS.skip_minified);
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

	if (!ARGS.nice_formatting) {
		output = removeWhitespace(output);
	}

	//validate JSON	
    try {
        JSON.parse(output);
    } catch (e) {
		sys.error("ERROR: ".red + "output is not valid JSON " + "'" + file + "'");
        throw e;
    }

	if (removeWhitespace(output) == '{"query":[],"assign":[]}') {
		sys.error("WARN: ".yellow + " no features extracted '" + file + "'");
	} else {
		//sys.error("OK: ".green + "'" + file + "'");
	}

	if (ARGS.extract_features) {
		if (removeWhitespace(output) != '{"query":[],"assign":[]}') {
			console.log(output);
		}
	} else if (ARGS.rename){
		callServer(
			HOST,
			PORT,
			"infer",
			JSON.parse(output),
			function(data) {
				var result = JSON.parse(data).result;
				var inferred_names = {};
				for (var i = 0; i < result.length; i++) {
					if (result[i].hasOwnProperty("inf")) {
						inferred_names[result[i].v] = result[i].inf.green;
					}
				}
				console.log(UglifyJS.replaceMangled(code, file, inferred_names));
			},
			function(err) {
				console.log("ERROR: ".red + "connecting to server '" + HOST + ":" + PORT + "' " + err);
			});
	}
}

var json_rpc_id = 0;

function callServer(server, port, methodName, params, success_cb, error_cb) {
	var req = {
		jsonrpc : '2.0',
		method : methodName,
		id : (++json_rpc_id)
	};
	req.params = params;
	var post_data = JSON.stringify(req);

	var options = {
		host: server,
		port: port,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': post_data.length
		}
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		var data = "";
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			success_cb(data);
		});
	});

	req.on('error', function(err) {
			error_cb(err);
		});

	req.write(post_data);
	req.end();
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