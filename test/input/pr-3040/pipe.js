var fs = require("fs");

// Timeout to offset uglify loading in the test suite
setTimeout(function() {
    fs.writeFileSync("test/input/pr-3040/input.js.map", '{"version":3,"sources":["input2.js"],"names":[],"mappings":";;eAAc,QAAQ,KAAR,C;IAAP,G,YAAA,G;;gBACS,QAAQ,OAAR,C;IAAT,K,aAAA,K;;AAEP,IAAI,CAAJ,+BAAS,IAAI,CAAJ,CAAM,MAAM,CAAZ,CAAT","file":"input.js","sourcesContent":["const {foo} = require(\\"bar\\");\\nconst {hello} = require(\\"world\\");\\n\\nfoo.x(...foo.y(hello.z));\\n"]}');

    var fileContents = fs.readFileSync("test/input/pr-3040/input.js");
    process.stdout.write(fileContents, "utf8");
}, 100);
