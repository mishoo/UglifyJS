// Testing UglifyJS <-> SpiderMonkey AST conversion
"use strict";

var acorn = require("acorn");
var ufuzz = require("./ufuzz");
var UglifyJS = require("..");

function beautify(ast) {
    var beautified = UglifyJS.minify(ast, {
        compress: false,
        mangle: false,
        output: {
            beautify: true,
            braces: true,
        },
    });
    if (beautified.error) return beautified;
    return UglifyJS.minify(beautified.code, {
        compress: false,
        mangle: false,
        output: {
            ast: true,
        },
    });
}

function validate(ast) {
    try {
        ast.walk(new UglifyJS.TreeWalker(function(node) {
            node.validate();
        }));
    } catch (e) {
        return { error: e };
    }
    return UglifyJS.minify(ast, {
        compress: false,
        mangle: false,
        output: {
            ast: true,
        },
        validate: true,
    });
}

function patch_import(code) {
    return code.replace(/\bimport\s*\{\s*\}\s*from\s*(['"])/g, "import$1")
        .replace(/\b(import\b.*?)\s*,\s*\{\s*\}\s*(from\s*['"])/g, "$1 $2");
}

function equals(input, transformed) {
    if (input.code === transformed.code) return true;
    return patch_import(input.code) === patch_import(transformed.code);
}

function test(input, to_moz, description, skip_on_error, beautified) {
    try {
        var ast = UglifyJS.AST_Node.from_mozilla_ast(to_moz(input));
    } catch (e) {
        if (skip_on_error) return true;
        console.log("//=============================================================");
        console.log("//", description, "failed... round", round);
        console.log(e);
        console.log("// original code");
        if (beautified === true) console.log("// (beautified)");
        console.log(input.code);
        return false;
    }
    var transformed = validate(ast);
    if (transformed.error || !equals(input, transformed)) {
        if (!beautified) {
            beautified = beautify(input.ast);
            if (!beautified.error) {
                beautified.raw = beautified.code;
                if (!test(beautified, to_moz, description, skip_on_error, true)) return false;
            }
        }
        console.log("//=============================================================");
        console.log("// !!!!!! Failed... round", round);
        console.log("// original code");
        if (beautified.error) {
            console.log("// !!! beautify failed !!!");
            console.log(beautified.error.stack);
        } else if (beautified === true) {
            console.log("// (beautified)");
        }
        console.log(input.raw);
        console.log();
        console.log();
        console.log("//-------------------------------------------------------------");
        console.log("//", description);
        if (transformed.error) {
            console.log(transformed.error.stack);
        } else {
            beautified = beautify(transformed.ast);
            if (beautified.error) {
                console.log("// !!! beautify failed !!!");
                console.log(beautified.error.stack);
                console.log(transformed.code);
            } else {
                console.log("// (beautified)");
                console.log(beautified.code);
            }
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
        var ok = true;
        var input = UglifyJS.minify(options ? UglifyJS.minify(code, JSON.parse(options)).code : code, {
            compress: false,
            mangle: false,
            output: {
                ast: true,
            },
        });
        input.raw = options ? input.code : code;
        if (input.error) {
            ok = false;
            console.log("//=============================================================");
            console.log("// minify() failed... round", round);
            console.log(input.error);
            console.log("// original code");
            console.log(code);
        }
        if (ok) ok = test(input, function(input) {
            return input.ast.to_mozilla_ast();
        }, "AST_Node.to_mozilla_ast()");
        if (ok) ok = test(input, function(input) {
            return acorn.parse(input.raw, {
                ecmaVersion: "latest",
                locations: true,
                sourceType: "module",
            });
        }, "acorn.parse()", !ufuzz.verbose);
        if (!ok) process.exit(1);
    });
}
console.log();
