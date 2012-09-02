#! /usr/bin/env node

var sys = require("util");
var fs = require("fs");

var UglifyJS = require("../tools/node");

var files = process.argv.slice(2);
var map = UglifyJS.SourceMap();
var output = UglifyJS.OutputStream({
    beautify   : false,
    source_map : map
});

function do_file(file) {
    var code = fs.readFileSync(file, "utf8");

    // parse
    var ast = UglifyJS.parse(code);

    // mangle
    ast.figure_out_scope();
    ast.mangle_names();

    // compress
    var compressor = UglifyJS.Compressor();
    ast.squeeze(compressor);

    // generate source into the output stream
    // first reset the current file name in the source map.
    UglifyJS.time_it("generate", function(){
        map.set_source(file);
        ast.print(output);
    });
};

files.forEach(do_file);

fs.writeFileSync("/tmp/source-map.json", map, "utf8");

sys.print(output);
