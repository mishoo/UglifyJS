var save_stderr = process.stderr;
var fs = require("fs");

// discard annoying NodeJS warning ("path.existsSync is now called `fs.existsSync`.")
var devnull = fs.createWriteStream("/dev/null");
process.__defineGetter__("stderr", function(){
    return devnull;
});

var vm = require("vm");
var sys = require("util");
var path = require("path");

var UglifyJS = vm.createContext({
    sys           : sys,
    console       : console,

    MOZ_SourceMap : require("source-map")
});

process.__defineGetter__("stderr", function(){
    return save_stderr;
});

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

load_global("../lib/utils.js");
load_global("../lib/ast.js");
load_global("../lib/parse.js");
load_global("../lib/transform.js");
load_global("../lib/scope.js");
load_global("../lib/output.js");
load_global("../lib/compress.js");
load_global("../lib/sourcemap.js");
load_global("../lib/mozilla-ast.js");

UglifyJS.AST_Node.warn_function = function(txt) {
    sys.error("WARN: " + txt);
};

// XXX: perhaps we shouldn't export everything but heck, I'm lazy.
for (var i in UglifyJS) {
    if (UglifyJS.hasOwnProperty(i)) {
        exports[i] = UglifyJS[i];
    }
}
