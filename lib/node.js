#! /usr/bin/env node

(function(){

    var fs = require("fs");
    var vm = require("vm");
    var sys = require("util");

    function load_global(file) {
        var code = fs.readFileSync(file, "utf8");
        return vm.runInThisContext(code, file);
    };

    load_global("./utils.js");
    load_global("./ast.js");
    load_global("./parse.js");
    load_global("./output.js");

    ///

    var filename = process.argv[2];
    console.time("parse");
    var ast = parse(fs.readFileSync(filename, "utf8"));
    console.timeEnd("parse");

    var stream = OutputStream({ beautify: true });
    ast.print(stream);
    console.log(stream.get());

    // console.time("walk");
    // var w = new TreeWalker(function(node){
    //     console.log(node.TYPE + " [ start: " + node.start.line + ":" + node.start.col + ", end: " + node.end.line + ":" + node.end.col + "] " + node.name);
    // });
    // ast.walk(w);
    // console.timeEnd("walk");

    //console.log(JSON.stringify(ast));

})();
