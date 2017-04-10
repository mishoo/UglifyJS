var assert = require("assert");
var exec = require("child_process").exec;

describe("portable", function() {
    var readFileBackup;
    var writeFileBackup;
    var simpleGlobBackup;
    var base64DecoderBackup;

    before(function(done) {
        this.timeout(15000);
        var uglifyjscmd = '"' + process.argv[0] + '" bin/uglifyjs';
        var command = uglifyjscmd + ' --self -cm --wrap minifier';

        assert.strictEqual(global.minifier, undefined);

        exec(command, function (err, stdout) {
            if (err) {
                this.skip();
                throw err;
            }

            eval(stdout);

            assert.strictEqual(typeof minifier, 'object');
            assert.strictEqual(minifier, global.minifier);
            assert.strictEqual(true, minifier.parse('foo;') instanceof minifier.AST_Node);

            readFileBackup = minifier.readFile;
            writeFileBackup = minifier.writeFile;
            simpleGlobBackup = minifier.simple_glob;
            base64DecoderBackup = minifier.base64Decoder;

            done();
        });
    });

    beforeEach(function() {
        assert(typeof minifier, "object");

        minifier.readFile = readFileBackup;
        minifier.writeFile = writeFileBackup;
        minifier.simple_glob = simpleGlobBackup;
        minifier.base64Decoder = base64DecoderBackup;
    });

    after(function() {
        global.minifier = undefined;
        assert.strictEqual(global.minifier, undefined);
    });

    it("Should minify from a string successfully", function() {
        assert.strictEqual(minifier.minify('console["log"]("Hello " + "world!");', {fromString: true}).code,
            'console.log("Hello world!");'
        );
    });

    it("Should be possible to overwrite readFile", function() {
        var files = {
            "foo.js": 'console.log("Hello world!");'
        };
        minifier.readFile = function(file) {
            if (typeof files[file] === "string") {
                return files[file];
            }

            assert(false, "Error reading file " + file);
        };
        minifier.writeFile = function(file, content) {
            assert(false, "Error writing to " + file);
        };

        var result = minifier.minify(["foo.js"], {compress: false});

        assert.strictEqual(result.code, 'console.log("Hello world!");');
    });

    it("Should be possible to minify a single file with the default simple_glob", function() {
        var files = {
            "foo.js": '   console.log(  "Hello world!"  || "Bye world!");'
        };
        var readCount = 0;
        minifier.readFile = function(file) {
            readCount++;

            if (typeof files[file] === "string") {
                return files[file];
            }

            assert(false, "Error reading file " + file);
        };
        minifier.writeFile = function(file, content) {
            assert(false, "Error writing to " + file);
        };

        var result = minifier.minify("foo.js");

        assert.strictEqual(result.code, 'console.log("Hello world!");');
        assert.strictEqual(readCount, 1); // foo.js
    });

    it("Should be possible to overwrite simple_glob", function() {
        var files = {
            "foo.js": 'console.log("Hello world!");'
        };
        var readCount = 0;
        minifier.readFile = function(file) {
            readCount++;

            if (typeof files[file] === "string") {
                return files[file];
            }

            assert(false, "Error reading file " + file);
        };
        minifier.writeFile = function(file, content) {
            assert(false, "Error writing to " + file);
        };
        minifier.simple_glob = function(files) {
            files = files.slice();

            for (var i = 0; i < files.length; i++) {
                files[i] = files[i].replace(/\*/g, "foo");
            }

            return files;
        };

        var result = minifier.minify(["*.js"], {compress: false});

        assert.strictEqual(result.code, 'console.log("Hello world!");');
        assert.strictEqual(readCount, 1); // foo.js
    });

    it("Should be possible to store to the name cache", function() {
        var files = {
            "foo.js": 'var foo = "bar";'
        };
        var writes = {
            "foo.json": {
                content: ['{\n  "props": {\n    "cname": -1,\n    "props": {}\n  }\n}'],
                maxWrites: 1
            }
        }
        var readCount = 0;
        var writeCount = 0;
        minifier.readFile = function(file) {
            readCount++;

            if (typeof files[file] === "string") {
                return files[file];
            }

            assert(false, "Error reading file " + file);
        };
        minifier.writeFile = function(file, content) {
            writeCount++;

            if (writes[file]) {
                if (writes[file].writes === undefined) {
                    writes[file].writes = 1;
                } else {
                    writes[file].writes++;
                }

                if (writes[file].maxWrites) {
                    assert(writes[file].writes <= writes[file].maxWrites, "Reached write limit for " + file);
                }

                assert.strictEqual(content, writes[file].content[writes[file].writes - 1]);
            } else {
                assert(false, "Error writing to " + file + " with " + content);
            }
        };
        var result = minifier.minify(["foo.js"], {nameCache: "foo.json"});

        assert.strictEqual(result.code, 'var foo="bar";');
        assert.strictEqual(readCount, 3); // Read foo.js, read foo.json, read foo.json before writing to foo.json
        assert.strictEqual(writeCount, 1); // foo.json
    });

    it("Should be possible to store to the name cache", function() {
        var files = {
            "foo.js": 'var foo = "bar";',
            "foo.json": '{\n  "props": {\n    "cname": -1,\n    "props": {}\n  }\n}'
        };
        var writes = {
            "foo.json": {
                content: ['{\n  "props": {\n    "cname": -1,\n    "props": {}\n  }\n}'],
                maxWrites: 1
            }
        }
        var writeCount = 0;
        var readCount = 0;
        minifier.readFile = function(file) {
            readCount++;

            if (typeof files[file] === "string") {
                return files[file];
            }

            assert(false, "Error reading file " + file);
        };
        minifier.writeFile = function(file, content) {
            writeCount++;

            if (writes[file]) {
                if (writes[file].writes === undefined) {
                    writes[file].writes = 1;
                } else {
                    writes[file].writes++;
                }

                if (writes[file].maxWrites) {
                    assert(writes[file].writes <= writes[file].maxWrites, "Reached write limit for " + file);
                }

                assert.strictEqual(content, writes[file].content[writes[file].writes - 1]);
            } else {
                assert(false, "Error writing to " + file + " with " + content);
            }
        };
        var result = minifier.minify(["foo.js"], {nameCache: "foo.json"});

        assert.strictEqual(result.code, 'var foo="bar";');
        assert.strictEqual(readCount, 3); // Read foo.js, read foo.json, read foo.json before writing to foo.json
        assert.strictEqual(writeCount, 1); // foo.json
    });

    it("Should throw an error if the default readFile and writeFile hooks are called", function() {
        var readFileError = "readFile not supported";
        var writeFileError = "writeFile not supported";
        var checkError = function(expected) {
            return function(e) {
                return e instanceof Error &&
                    e.message === expected;
            }
        };

        // First test with directly calling them
        assert.throws(function() {
            minifier.readFile();
        }, checkError(readFileError));
        assert.throws(function() {
            minifier.writeFile(writeFileError);
        });

        assert.throws(function() {
            minifier.minify("foo.bar");
        }, checkError(readFileError));

        // For the last test, make readFile nearly no-op
        minifier.readFile = function() { return ""; };

        assert.throws(function() {
            minifier.minify("foo.bar", {nameCache: "foo.json"});
        }, checkError(writeFileError));
    });

    it("Should throw an error if the default base64Decoder hook gets called", function() {
        var base64DecoderError = "No base64 decoder implemented";

        assert.throws(function() {
            minifier.base64Decoder("testtesttest");
        }, function(e) {
            return e instanceof Error &&
                e.message === base64DecoderError;
        });
    });

    it("Should throw an error if the default base64Encoder hook gets called", function() {
        var base64EncoderError = "No base64 encoder implemented";

        assert.throws(function() {
            minifier.base64Encoder("testtesttest");
        }, function(e) {
            return e instanceof Error &&
                e.message === base64EncoderError;
        });
    });
});
