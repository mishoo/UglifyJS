// Testing UglifyJS <-> SpiderMonkey AST conversion
"use strict";

var acorn = require("acorn");
var ufuzz = require("./ufuzz");
var UglifyJS = require("..");

function beautify(ast) {
    var beautified = UglifyJS.minify(ast, {
        compress: false,
        mangle: false,
        module: ufuzz.module,
        output: {
            ast: true,
            beautify: true,
            braces: true,
        },
    });
    if (!beautified.error) {
        var verify = UglifyJS.minify(beautified.code, {
            compress: false,
            mangle: false,
            module: ufuzz.module,
        });
        if (verify.error) return verify;
    }
    return beautified;
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
        module: ufuzz.module,
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
        console.error("//=============================================================");
        console.error("//", description, "failed... round", round);
        console.error(e);
        console.error("// original code");
        if (beautified === true) console.error("// (beautified)");
        console.error(input.code);
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
        console.error("//=============================================================");
        console.error("// !!!!!! Failed... round", round);
        console.error("// original code");
        if (beautified.error) {
            console.error("// !!! beautify failed !!!");
            console.error(beautified.error.stack);
        } else if (beautified === true) {
            console.error("// (beautified)");
        }
        console.error(input.raw);
        console.error();
        console.error();
        console.error("//-------------------------------------------------------------");
        console.error("//", description);
        if (transformed.error) {
            console.error(transformed.error.stack);
        } else {
            beautified = beautify(transformed.ast);
            if (beautified.error) {
                console.error("// !!! beautify failed !!!");
                console.error(beautified.error.stack);
                console.error(transformed.code);
            } else {
                console.error("// (beautified)");
                console.error(beautified.code);
            }
        }
        console.error("!!!!!! Failed... round", round);
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
        var minified;
        if (options) {
            var o = JSON.parse(options);
            o.module = ufuzz.module;
            minified = UglifyJS.minify(code, o);
            if (minified.error) {
                console.log("//=============================================================");
                console.log("// minify() failed... round", round);
                console.log("// original code");
                console.log(code);
                console.log();
                console.log();
                console.log("//-------------------------------------------------------------");
                console.log("minify(options):");
                console.log(JSON.stringify(o, null, 2));
                return;
            }
            minified = minified.code;
        }
        var input = UglifyJS.minify(minified || code, {
            compress: false,
            mangle: false,
            module: ufuzz.module,
            output: {
                ast: true,
            },
        });
        input.raw = options ? input.code : code;
        if (input.error) {
            ok = false;
            console.error("//=============================================================");
            console.error("// parse() failed... round", round);
            console.error("// original code");
            console.error(code);
            console.error();
            console.error();
            if (options) {
                console.error("//-------------------------------------------------------------");
                console.error("// minified code");
                console.error(minified);
                console.error();
                console.error();
                console.error("//-------------------------------------------------------------");
                console.error("minify(options):");
                console.error(JSON.stringify(o, null, 2));
                console.error();
                console.error();
            }
            console.error("//-------------------------------------------------------------");
            console.error("// parse() error");
            console.error(input.error);
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
        if (!ok && isFinite(num_iterations)) {
            console.log();
            process.exit(1);
        }
    });
}
console.log();
