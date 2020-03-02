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
            braces: true
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
        return false;
    }
    return true;
}

var num_iterations = ufuzz.num_iterations;
var minify_options = require("./ufuzz/options.json").map(JSON.stringify);
minify_options.unshift(null);
for (var round = 1; round <= num_iterations; round++) {
    process.stdout.write(round + " of " + num_iterations + "\r");
    var code = ufuzz.createTopLevelCode();
    minify_options.forEach(function(options) {
        var input = options ? UglifyJS.minify(code, JSON.parse(options)).code : code;
        var uglified = UglifyJS.minify(input, {
            compress: false,
            mangle: false,
            output: {
                ast: true
            }
        });
        var ok = test(uglified.code, uglified.ast.to_mozilla_ast(), "AST_Node.to_mozilla_ast()");
        try {
            ok = test(uglified.code, acorn.parse(input), "acorn.parse()") && ok;
        } catch (e) {
            console.log("//=============================================================");
            console.log("// acorn parser failed... round", round);
            console.log(e);
            console.log("// original code");
            console.log(input);
        }
        if (!ok) process.exit(1);
    });
}
console.log();
