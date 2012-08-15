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
    load_global("./output.js");
    load_global("./ast.js");
    load_global("./parse.js");

    ///

    var filename = process.argv[2];
    console.time("parse");
    var ast = parse(fs.readFileSync(filename, "utf8"));
    console.timeEnd("parse");

    console.time("walk");
    var w = new TreeWalker(function(node){
        console.log(node.TYPE + " [ start: " + node.start.line + ":" + node.start.col + ", end: " + node.end.line + ":" + node.end.col + "]");
    });
    ast.walk(w);
    console.timeEnd("walk");

})();
