var fs = require("fs");

new Function("domprops", "exports", require("../tools/node").FILES.map(function(file) {
    if (/exports\.js$/.test(file)) file = require.resolve("./exports");
    return fs.readFileSync(file, "utf8");
}).join("\n\n"))(require("../tools/domprops.json"), exports);
