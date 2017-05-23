var UglifyJS = require("..");
var ok = require("assert");

module.exports = function () {
    console.log("--- Sourcemaps tests");

    var basic = source_map([
        'var x = 1 + 1;'
    ].join('\n'));

    ok.equal(basic.version, 3);
    ok.deepEqual(basic.names, ['x']);

    var issue836 = source_map([
        "({",
        "    get enabled() {",
        "        return 3;",
        "    },",
        "    set enabled(x) {",
        "        ;",
        "    }",
        "});",
    ].join("\n"));

    ok.deepEqual(issue836.names, ['enabled', 'x']);
}

function source_map(js) {
    return JSON.parse(UglifyJS.minify(js, {
        compress: false,
        mangle: false,
        sourceMap: true
    }).map);
}

// Run standalone
if (module.parent === null) {
    module.exports();
}

