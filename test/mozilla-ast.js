// Testing UglifyJS <-> SpiderMonkey AST conversion
"use strict";

var acorn = require("acorn");
var ufuzz = require("./ufuzz");
var UglifyJS = require("..");

function try_beautify(code) {
    var beautified = UglifyJS.minify(code, {
        compress: false,
        mangle: false,
        output: {
            beautify: true,
            bracketize: true
        }
    });
    if (beautified.error) {
        console.log("// !!! beautify failed !!!");
        console.log(beautified.error.stack);
        console.log(code);
    } else {
        console.log("// (beautified)");
        console.log(beautified.code);
    }
}

function test(original, estree, description) {
    var transformed = UglifyJS.minify(UglifyJS.AST_Node.from_mozilla_ast(estree), {
        compress: false,
        mangle: false
    });
    if (transformed.error || original !== transformed.code) {
        console.log("//=============================================================");
        console.log("// !!!!!! Failed... round", round);
        console.log("// original code");
        try_beautify(original);
        console.log();
        console.log();
        console.log("//-------------------------------------------------------------");
        console.log("//", description);
        if (transformed.error) {
            console.log(transformed.error.stack);
        } else {
            try_beautify(transformed.code);
        }
        console.log("!!!!!! Failed... round", round);
        process.exit(1);
    }
}

var num_iterations = ufuzz.num_iterations;
for (var round = 1; round <= num_iterations; round++) {
    process.stdout.write(round + " of " + num_iterations + "\r");
    var code = ufuzz.createTopLevelCode();
    var uglified = UglifyJS.minify(code, {
        compress: false,
        mangle: false,
        output: {
            ast: true
        }
    });
    test(uglified.code, uglified.ast.to_mozilla_ast(), "AST_Node.to_mozilla_ast()");
    try {
        test(uglified.code, acorn.parse(code), "acorn.parse()");
    } catch (e) {
        console.log("//=============================================================");
        console.log("// acorn parser failed... round", round);
        console.log(e);
        console.log("// original code");
        console.log(code);
    }
}
console.log();
