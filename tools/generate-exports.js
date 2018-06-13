"use strict";

var UglifyJS = require("../tools/node");
var fs = require("fs");

console.log = function (d) {
    process.stdout.write(d + '\n');
};
  
UglifyJS.FILES.forEach(function(filepath){
    var code = fs.readFileSync(filepath, "utf8");
    var filename = filepath.replace(/^.*?([-a-z]+)\.js$/g, "$1");

    var AST = UglifyJS.parse(code, {filename: filepath});

    var exportNames = [];
    var walker = new UglifyJS.TreeWalker(function(node){
        if (node instanceof UglifyJS.ast.AST_Defun) {
            exportNames.push(node.name.name);
        }
        if (node instanceof UglifyJS.ast.AST_Var) {
            var def = node.definitions[0];
            var name = def.name.name;
            var value = def.value;
            // Skip <var> = foo.<var>
            if (value instanceof UglifyJS.ast.AST_Dot && value.property == name)
                return true;
            // Skip <var> = require(...)
            if (value instanceof UglifyJS.ast.AST_Call && value.expression instanceof UglifyJS.ast.AST_SymbolRef && value.expression.name == "require")
                return true;
            exportNames.push(name);
        }
        return !(node instanceof UglifyJS.ast.AST_Toplevel);
    });
    AST.walk(walker);
    // Don't export identifiers starting with underscore
    exportNames = exportNames.filter(name => name[0] != "_");
    if (exportNames.length == 0)
        return;
    // Use (utils.)merge instead of Object.assign for (very) old node
    var exports = "merge(exports, {\n" + exportNames.map(
        name => UglifyJS.string_template('    {name} : {name},', { name: name })
    ).concat(exportNames.filter(name => name.indexOf("AST_") == 0).map(
        name => UglifyJS.string_template('    {expName} : {name},', { expName: name.substr(4), name: name })
    )).join("\n") + "\n});";
    var imports = exportNames.map(function(name){
        return UglifyJS.string_template(UglifyJS.string_template('var {name} = {fn}.{name};', { name: name, fn: filename}));
    });
    
    console.log("\n// Exports for " + filename);
    console.log(exports);
    console.log("\n\n// Usage:")
    console.log(UglifyJS.string_template('var {fn} = require("../lib/{fn}");', { fn: filename}));
    console.log(imports.join("\n"));

    var result = code.replace(/\n+(exports\.\w+ = \w+;\n+)+$/, "");
    result = result.replace(/\n+Object\.assign\(exports, \{[\s\S]*?\}\);\n*$/, "");
    result = result.replace(/\n+merge\(exports, \{[\s\S]*?\}\);\n*$/, "");
    result += "\n\n" + exports + "\n";
    fs.writeFileSync(filepath, result, "utf8");
});
