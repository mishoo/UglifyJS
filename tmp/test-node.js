#! /usr/bin/env node

(function(){

    var fs = require("fs");
    var vm = require("vm");
    var sys = require("util");

    function load_global(file) {
        try {
            var code = fs.readFileSync(file, "utf8");
            return vm.runInThisContext(code, file);
        } catch(ex) {
            sys.debug("ERROR in file: " + file + " / " + ex);
            process.exit(1);
        }
    };

    load_global("../lib/utils.js");
    load_global("../lib/ast.js");
    load_global("../lib/parse.js");
    load_global("../lib/output.js");

    ///

    var filename = process.argv[2];
    //console.time("parse");
    var ast = parse(fs.readFileSync(filename, "utf8"));
    //console.timeEnd("parse");

    //console.time("generate");
    var stream = OutputStream({ beautify: true });
    ast.print(stream);
    //console.timeEnd("generate");
    sys.puts(stream.get());

    // console.time("walk");
    // var w = new TreeWalker(function(node){
    //     console.log(node.TYPE + " [ start: " + node.start.line + ":" + node.start.col + ", end: " + node.end.line + ":" + node.end.col + "] " + node.name);
    // });
    // ast.walk(w);
    // console.timeEnd("walk");

    //console.log(JSON.stringify(ast));

})();
