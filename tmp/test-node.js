#! /usr/bin/env node

var sys = require("util");
var fs = require("fs");

var UglifyJS = require("../tools/node.js");

var filename = process.argv[2];
var code = fs.readFileSync(filename, "utf8");

var ast = time_it("parse", function() {
    return UglifyJS.parse(code);
});
var stream = UglifyJS.OutputStream({ beautify: true });
time_it("scope", function(){
    ast.figure_out_scope();
});
time_it("mangle", function(){
    ast.mangle_names();
});
time_it("compress", function(){
    var compressor = new UglifyJS.Compressor({
    });
    ast = ast.squeeze(compressor);
});
time_it("generate", function(){
    ast.print(stream);
});
sys.puts(stream.get());

ast.scope_warnings();

function time_it(name, cont) {
    var t1 = new Date().getTime();
    try { return cont(); }
    finally { sys.debug("// " + name + ": " + ((new Date().getTime() - t1) / 1000).toFixed(3) + " sec."); }
};
