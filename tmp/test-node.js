#! /usr/bin/env node

var sys = require("util");
var fs = require("fs");

var UglifyJS = require("../tools/node");

var filename = process.argv[2];
var code = fs.readFileSync(filename, "utf8");

var ast = UglifyJS.parse(code);

var tt = new UglifyJS.TreeTransformer(
    function before(node, descend) {
        if (node instanceof UglifyJS.AST_Var) {
            //return new UglifyJS.AST_EmptyStatement(node);
            return UglifyJS.MAP.skip;
        }
    },
    function after(node) {
        console.log("After ", node.TYPE);
    }
);

var x = ast.transform(tt);
sys.print(x.print_to_string({ beautify: true }));

// ast.figure_out_scope();
// ast = ast.squeeze(UglifyJS.Compressor());

// ast.compute_char_frequency();
// UglifyJS.base54.sort();

// ast.figure_out_scope();
// ast.scope_warnings();
// ast.mangle_names();

// sys.error(UglifyJS.base54.get());
// sys.print(ast.print_to_string({ beautify: true }));
