var fs = require("fs");

var UglifyJS = exports;
var FILES = UglifyJS.FILES = [
    "../lib/utils.js",
    "../lib/ast.js",
    "../lib/parse.js",
    "../lib/scope.js",
    "../lib/output.js",
    "../lib/compress.js",
    "../lib/sourcemap.js",
    "../lib/mozilla-ast.js",
    "../lib/propmangle.js",
    "../lib/minify.js",
    "./exports.js",
].map(function(file) {
    return require.resolve(file);
});

var utils = require("../lib/utils");
var output = require("../lib/output");
var OutputStream = output.OutputStream;
var minify = require("../lib/minify").minify;
var AST = require("../lib/ast");
var compress = require("../lib/compress");
var parse =  require("../lib/parse");
var propmangle = require("../lib/propmangle");
require("../lib/mozilla-ast");


exports.utils = utils;
exports.OutputStream = OutputStream;
exports.minify = minify;
exports.AST = AST;
exports.parser = parse;
exports.parse = parse.parse;
exports.Compressor = compress.Compressor;
exports.Dictionary = utils.Dictionary;
exports.TreeWalker = AST.TreeWalker;
exports.TreeTransformer = AST.TreeTransformer;
exports.push_uniq = utils.push_uniq;
exports.string_template = utils.string_template;
exports.describe_ast = describe_ast;
exports.propmangle = propmangle;

// Backwards compatibility: Add all AST_
for (var name in AST) if (utils.HOP(AST, name)) {
    if (name.indexOf("AST_") == 0)
        exports[name] = AST[name];
}

function describe_ast() {
    var out = OutputStream({ beautify: true });
    function doitem(ctor) {
        out.print("AST." + ctor.TYPE);
        var props = ctor.SELF_PROPS.filter(function(prop) {
            return !/^\$/.test(prop);
        });
        if (props.length > 0) {
            out.space();
            out.with_parens(function() {
                props.forEach(function(prop, i) {
                    if (i) out.space();
                    out.print(prop);
                });
            });
        }
        if (ctor.documentation) {
            out.space();
            out.print_string(ctor.documentation);
        }
        if (ctor.SUBCLASSES.length > 0) {
            out.space();
            out.with_block(function() {
                ctor.SUBCLASSES.forEach(function(ctor, i) {
                    out.indent();
                    doitem(ctor);
                    out.newline();
                });
            });
        }
    };
    doitem(AST.Node);
    return out + "\n";
}

function infer_options(options) {
    var result = UglifyJS.minify("", options);
    return result.error && result.error.defs;
}

UglifyJS.default_options = function() {
    var defs = {};
    Object.keys(infer_options({ 0: 0 })).forEach(function(component) {
        var options = {};
        options[component] = { 0: 0 };
        if (options = infer_options(options)) {
            defs[component] = options;
        }
    });
    return defs;
};
