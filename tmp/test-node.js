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
    load_global("../lib/scope.js");
    load_global("../lib/output.js");

    AST_Node.warn_function = function(txt) {
        sys.debug(txt);
    };

    ///

    var filename = process.argv[2];
    var code = fs.readFileSync(filename, "utf8");

    var ast = time_it("parse", function() {
        return parse(code);
    });
    var stream = OutputStream({ beautify: true });
    time_it("scope", function(){
        ast.figure_out_scope();
    });
    time_it("mangle", function(){
        ast.mangle_names();
    });
    time_it("generate", function(){
        ast.print(stream);
    });
    sys.puts(stream.get());

    // var w = new TreeWalker(function(node, descend){
    //     if (node.start) {
    //         console.log(node.TYPE + " [" + node.start.line + ":" + node.start.col + "]");
    //     } else {
    //         console.log(node.TYPE + " [NO START]");
    //     }
    //     if (node instanceof AST_Scope) {
    //         if (node.uses_eval) console.log("!!! uses eval");
    //         if (node.uses_with) console.log("!!! uses with");
    //     }
    //     if (node instanceof AST_SymbolDeclaration) {
    //         console.log("--- declaration " + node.name + (node.global ? " [global]" : ""));
    //     }
    //     else if (node instanceof AST_SymbolRef) {
    //         console.log("--- reference " + node.name + " to " + (node.symbol ? node.symbol.name : "global"));
    //         if (node.symbol) {
    //             console.log("    declaration at: " + node.symbol.start.line + ":" + node.symbol.start.col);
    //         }
    //     }
    // });
    // ast._walk(w);

    ast.scope_warnings();

    function time_it(name, cont) {
        var t1 = new Date().getTime();
        try { return cont(); }
        finally { sys.debug("// " + name + ": " + ((new Date().getTime() - t1) / 1000).toFixed(3) + " sec."); }
    };

})();
