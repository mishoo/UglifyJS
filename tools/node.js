var fs = require("fs");

var UglifyJS = exports;
var FILES = UglifyJS.FILES = [
    "../lib/utils.js",
    "../lib/ast.js",
    "../lib/parse.js",
    "../lib/transform.js",
    "../lib/scope.js",
    "../lib/output.js",
    "../lib/compress.js",
    "../lib/sourcemap.js",
    "../lib/mozilla-ast.js",
    "../lib/propmangle.js",
    "../lib/minify.js",
    "./exports.js",
].map(function(file){
    return require.resolve(file);
});

new Function("MOZ_SourceMap", "exports", function() {
    var code = FILES.map(function(file) {
        return fs.readFileSync(file, "utf8");
    });
    code.push("exports.describe_ast = " + describe_ast.toString());
    return code.join("\n\n");
}())(
    require("source-map"),
    UglifyJS
);

function describe_ast() {
    var out = OutputStream({ beautify: true });
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
    doitem(AST_Node);
    return out + "\n";
}
