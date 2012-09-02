#! /usr/bin/env node

var sys = require("util");
var fs = require("fs");

var UglifyJS = require("../tools/node");

var filename = process.argv[2];
var code = fs.readFileSync(filename, "utf8");

var ast = time_it("parse", function() {
    return UglifyJS.parse(code);
});

time_it("scope", function(){
    // calling figure_out_scope is a prerequisite for mangle_names,
    // scope_warnings and compress
    //
    // perhaps figure_out_scope should be called automatically by the
    // parser, but there might be instances where the functionality is
    // not needed.
    ast.figure_out_scope();
});

// ast.scope_warnings();

time_it("mangle", function(){
    ast.mangle_names();
});

time_it("compress", function(){
    var compressor = new UglifyJS.Compressor({
        // sequences     : true,
        // properties    : true,
        // dead_code     : true,
        // keep_comps    : true,
        // drop_debugger : true,
        // unsafe        : true,
        // warnings      : true
    });
    ast = ast.squeeze(compressor);
});

var stream = UglifyJS.OutputStream({ beautify: false });
time_it("generate", function(){
    ast.print(stream);
});
sys.puts(stream.get());

function time_it(name, cont) {
    var t1 = new Date().getTime();
    try { return cont(); }
    finally { sys.debug("// " + name + ": " + ((new Date().getTime() - t1) / 1000).toFixed(3) + " sec."); }
};
