var fs = require("fs");

// discard annoying NodeJS warning ("path.existsSync is now called `fs.existsSync`.")
var original_stderr_write = process.stderr.write;
process.stderr.write = function() { return true; };

var vm = require("vm");
var sys = require("util");
var path = require("path");

var UglifyJS = vm.createContext({
    sys           : sys,
    console       : console,

    MOZ_SourceMap : require("source-map")
});

// return stderr to normal
process.stderr.write = original_stderr_write;

function load_global(file) {
    file = path.resolve(path.dirname(module.filename), file);
    try {
        var code = fs.readFileSync(file, "utf8");
        return vm.runInContext(code, UglifyJS, file);
    } catch(ex) {
        // XXX: in case of a syntax error, the message is kinda
        // useless. (no location information).
        sys.debug("ERROR in file: " + file + " / " + ex);
        process.exit(1);
    }
};

var FILES = exports.FILES = [
    "../lib/utils.js",
    "../lib/ast.js",
    "../lib/parse.js",
    "../lib/transform.js",
    "../lib/scope.js",
    "../lib/output.js",
    "../lib/compress.js",
    "../lib/sourcemap.js",
    "../lib/mozilla-ast.js"
].map(function(file){
    return path.join(path.dirname(fs.realpathSync(__filename)), file);
});

FILES.forEach(load_global);

UglifyJS.AST_Node.warn_function = function(txt) {
    sys.error("WARN: " + txt);
};

// XXX: perhaps we shouldn't export everything but heck, I'm lazy.
for (var i in UglifyJS) {
    if (UglifyJS.hasOwnProperty(i)) {
        exports[i] = UglifyJS[i];
    }
}

exports.minify = function(files, options) {
    options = UglifyJS.defaults(options, {
        outSourceMap : null,
        sourceRoot   : null,
        inSourceMap  : null,
        fromString   : false,
        warnings     : false,
    });
    if (typeof files == "string")
        files = [ files ];

    // 1. parse
    var toplevel = null;
    files.forEach(function(file){
        var code = options.fromString
            ? file
            : fs.readFileSync(file, "utf8");
        toplevel = UglifyJS.parse(code, {
            filename: options.fromString ? "?" : file,
            toplevel: toplevel
        });
    });

    // 2. compress
    toplevel.figure_out_scope();
    var sq = UglifyJS.Compressor({
        warnings: options.warnings,
    });
    toplevel = toplevel.transform(sq);

    // 3. mangle
    toplevel.figure_out_scope();
    toplevel.compute_char_frequency();
    toplevel.mangle_names();

    // 4. output
    var map = null;
    var inMap = null;
    if (options.inSourceMap) {
        inMap = fs.readFileSync(options.inSourceMap, "utf8");
    }
    if (options.outSourceMap) map = UglifyJS.SourceMap({
        file: options.outSourceMap,
        orig: inMap,
        root: options.sourceRoot
    });
    var stream = UglifyJS.OutputStream({ source_map: map });
    toplevel.print(stream);
    return {
        code : stream + "",
        map  : map + ""
    };
};

// exports.describe_ast = function() {
//     function doitem(ctor) {
//         var sub = {};
//         ctor.SUBCLASSES.forEach(function(ctor){
//             sub[ctor.TYPE] = doitem(ctor);
//         });
//         var ret = {};
//         if (ctor.SELF_PROPS.length > 0) ret.props = ctor.SELF_PROPS;
//         if (ctor.SUBCLASSES.length > 0) ret.sub = sub;
//         return ret;
//     }
//     return doitem(UglifyJS.AST_Node).sub;
// }

exports.describe_ast = function() {
    var out = UglifyJS.OutputStream({ beautify: true });
    function doitem(ctor) {
        out.print("AST_" + ctor.TYPE);
        var props = ctor.SELF_PROPS.filter(function(prop){
            return !/^\$/.test(prop);
        });
        if (props.length > 0) {
            out.space();
            out.with_parens(function(){
                props.forEach(function(prop, i){
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
            out.with_block(function(){
                ctor.SUBCLASSES.forEach(function(ctor, i){
                    out.indent();
                    doitem(ctor);
                    out.newline();
                });
            });
        }
    };
    doitem(UglifyJS.AST_Node);
    return out + "";
};
