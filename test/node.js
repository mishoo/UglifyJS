var fs = require("fs");
var UglifyJS = require("../tools/node");

new Function("MOZ_SourceMap", "exports", UglifyJS.FILES.map(function(file) {
    if (/exports\.js$/.test(file)) file = require.resolve("./exports");
    return fs.readFileSync(file, "utf8");
}).join("\n\n"))(require("source-map"), exports);
exports.default_options = UglifyJS.default_options;
