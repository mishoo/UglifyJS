var assert = require("assert");
var UglifyJS = require("../node");

describe("import", function() {
    it("Should reject invalid `import` statement syntax", function() {
        [
            "import *;",
            "import A;",
            "import {};",
            "import `path`;",
            "import from 'path';",
            "import * from 'path';",
            "import A as B from 'path';",
            "import { A }, B from 'path';",
            "import * as A, B from 'path';",
            "import * as A, {} from 'path';",
            "import { * as A } from 'path';",
            "import { 42 as A } from 'path';",
            "import { A-B as C } from 'path';",
        ].forEach(function(code) {
            assert.throws(function() {
                UglifyJS.parse(code);
            }, function(e) {
                return e instanceof UglifyJS.JS_Parse_Error;
            }, code);
        });
    });
});
