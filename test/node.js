var fs = require("fs");

new Function("MOZ_SourceMap", "exports", function() {
    var code = require("../tools/node").FILES.map(function(file) {
        if (/exports\.js$/.test(file)) file = require.resolve("./exports");
        return fs.readFileSync(file, "utf8");
    });
    code.push(";var domprops = " + JSON.stringify(require("../tools/domprops.json")));
    return code.join("\n\n");
}())(require("source-map"), exports);