var fs = require("fs");

exports.FILES = [
    require.resolve("../lib/utils.js"),
    require.resolve("../lib/ast.js"),
    require.resolve("../lib/parse.js"),
    require.resolve("../lib/transform.js"),
    require.resolve("../lib/scope.js"),
    require.resolve("../lib/output.js"),
    require.resolve("../lib/compress.js"),
    require.resolve("../lib/sourcemap.js"),
    require.resolve("../lib/mozilla-ast.js"),
    require.resolve("../lib/propmangle.js"),
    require.resolve("../lib/minify.js"),
    require.resolve("./exports.js"),
];

new Function("MOZ_SourceMap", "exports", function() {
    var code = exports.FILES.map(function(file) {
        return fs.readFileSync(file, "utf8");
    });
    code.push("exports.describe_ast = " + describe_ast.toString());
    return code.join("\n\n");
}())(require("source-map"), exports);

function describe_ast() {
    var out = OutputStream({ beautify: true });
    function doitem(ctor) {
        out.print("AST_" + ctor.TYPE);
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
    doitem(AST_Node);
    return out + "\n";
}

function infer_options(options) {
    var result = exports.minify("", options);
    return result.error && result.error.defs;
}

exports.default_options = function() {
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
