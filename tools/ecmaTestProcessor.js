var fs = require("fs");

var async = require("async");
var yargs = require("yargs");

var OK = 0;
var FAIL = 1;

var MESSAGE = /^(=== )?[^\s]* (passed|failed|was expected to fail) in (non-)?strict mode( as expected|, but didn't)?( ===)?$/;
var SELF_ERROR = /A minified script failed to run after being minified\. Please report node version, test and error to the maintainer of the minifier tool\./;
var BOTH_ERROR = /A minified script failed to run both minified and unminified\. This is likely an invalid js file/;
var SELF_ERROR_FILTER = function(input) {
    return SELF_ERROR.test(input)
};
var BOTH_ERROR_FILTER = function(input) {
    return BOTH_ERROR.test(input)
};

var roundToPercentage = function(input) {
    return Math.round(input * 10000) / 100;
};

var isNodeOnlyError = function(summary, output) {
    // Errors caused when failing both running minified and unminified are very likely node caused
    if (output.filter(BOTH_ERROR_FILTER).length > 0) {
        return true;
    }
    return false;
};

var isUglifyOnlyError = function(summary, output) {
    // Errors caused when being minified, unminified ran fine
    if (output.filter(SELF_ERROR_FILTER).length > 0) {
        return true;
    }

    return false;
};

var ARGS = yargs.usage(
        "$0 logs.txt -o output.md\n\n" +
        "Processes test262 logs and convert it to more human readable markup files.\n"
    )
    .describe("h", "Get help")
    .describe("o", "Output file")

    .describe("debug",       "Prints out very large json debug file")
    .describe("debugFormat", "Prints out structure of json debug file")
    .describe("es5",         "Notifies that tests are run on test262 es5 mode")

    .alias("h", "help")
    .alias("o", "output")

    .boolean("es5")

    .wrap(80)

    .argv;

if (ARGS.h || ARGS.help) {
    console.log(yargs.help());
    process.exit(0);
}

if (ARGS.debugFormat) {
    console.log("Root:")
    console.log("    logs: <Object LogObject> See LogObject");
    console.log("    unitTestUrl: <String> Base url to test suite, used as link template for tests");
    console.log("");
    console.log("LogObject:");
    console.log("    errors: <Int> Total errors in this LogObjects and childs");
    console.log("    errors_local: <Int> Total errors in this LogObject alone");
    console.log("    node_error: <Int> Total errors caused by Node in this LogObject and childs");
    console.log("    node_error_local: <Int> Total errors caused by Node in this LogObject alone");
    console.log("    self_error: <Int> Total errors caused by Uglify in this LogObject and childs");
    console.log("    self_error_local: <Int> Total errors caused by Uglify in this LogObject alone");
    console.log("    testsCount: <Int> Total number of tests");
    console.log("    testsCount_local: <Int> Total number of local tests");
    console.log("    dir: <Object LogObject> Contains LogObject childs");
    console.log("    tests: <Array TestArrayList> See TestObject");
    console.log("");
    console.log("TestArrayList:");
    console.log("    {for every array element}: <Array TestArray>");
    console.log("");
    console.log("TestArray:");
    console.log("    0: <Int> OK or FAIL to indicate that the test has succeed");
    console.log("    1: <String> Summary message");
    console.log("    2: <Object Error | undefined> Error Object containing details if any necessary");
    console.log("    3: <Int> Line of test in log");
    console.log("");
    console.log("Error:");
    console.log("    logs: <Array String> stdout of the test failure");
    console.log("    node_error: <Bool> True if likelyhood that node screwed up is very high, Indicated use only.");
    console.log("    self_error: <Bool> True if likelyhood that Uglify screwed up is very high. Indicated use only.");
    process.exit(0);
}

if (ARGS._.length === 0) {
    console.log("Please provide logs\nYou can add --help to the command to get help");
    process.exit(0);
}

var data;

// Read files
async.mapLimit(ARGS._, 1, function(file, callback) {
    var content = fs.readFileSync(file, {
      encoding: 'utf8'
    }).split(/\s*(?:\r(?:\n)?|\n)/);

    var output = [];
    var errors = 0;

    var tmp;
    for (var i = 0; i < content.length; i++) {
        // Make sure the message is done in the expected format
        if (!MESSAGE.test(content[i])) {
            if (/^\s*$/.test(content[i])) {
                continue;
            }

            console.log("Unexpected message at line " + i + ":");
            console.log(content[i]);
        }

        // Push test formatted to the output
        if (content[i].indexOf("=") === -1) {
            output.push([OK, content[i], undefined, i]);
        } else if (/^===/.test(content[i])) {
            tmp = i;
            // Find first line without errors
            do {
                errors++;
                i++;
                while (!/^.*===$/.test(content[i])) {
                    i++;
                }
            } while (!MESSAGE.test(content[i + 1]));

            var error = {
                logs: content.slice(tmp + 1, i),
            };
            var summary = content[tmp].substr(4, content[tmp].length - 8)
            error.node_error = isNodeOnlyError(summary, error.logs);
            error.self_error = isUglifyOnlyError(summary, error.logs);

            output.push([
                FAIL,
                summary,
                error,
                i
            ]);
        } else {
            console.log("Unknown message at line " + i + ":");
            console.log(content[i]);
            console.log("Error message started at line " + tmp);
        }
    }

    // Stats in console
    console.log(content.length + " lines of logs");
    console.log(output.length + " tests found");
    console.log(errors + " errors found");

    if (errors > 0) {
        console.log("Failure rate: " + roundToPercentage(errors / output.length) + "%");
    } else {
        console.log("Failure rate: 0%");
    }

    callback(undefined, output);
}, function(err, results) {
    // Check if everything succeed without errors
    if (err) {
        console.log(err);
        process.exit()
    }

    var getNewLogsObject = function() {
        return {
            errors: 0,
            errors_local: 0,
            node_error: 0,
            node_error_local: 0,
            self_error: 0,
            self_error_local: 0,
            testsCount: 0,
            testsCount_local: 0,
            dir: {},
            tests: {}
        }
    }

    // Merge log results
    data = {
        logs: getNewLogsObject()
    };

    if (ARGS.es5) {
        data.unitTestUrl = "https://github.com/tc39/test262/blob/es5-tests/test/suite/";
    } else {
        data.unitTestUrl = "https://github.com/tc39/test262/blob/master/test/";
    }

    for (var i = 0; i < results.length; i++) {
        for (var j = 0; j < results[i].length; j++) {
            var status = results[i][j][0];
            var test = results[i][j][1];
            var error = results[i][j][2];
            var line = results[i][j][3];
            var node_error = status === FAIL && error.node_error ? 1 : 0;
            var self_error = status === FAIL && error.self_error ? 1 : 0;

            if (typeof test !== "string") {
                console.log("Error!");
                console.log(test);
            }
            var path = test.split(" ")[0].split(/\/|\\/);

            var pos = data.logs;
            for (var k = 0; k < path.length - 1; k++) {
                var dir = path[k] + "/";

                pos.errors += status;
                pos.node_error += node_error;
                pos.self_error += self_error;
                pos.testsCount++;

                if (!(dir in pos.dir)) {
                    pos.dir[dir] = getNewLogsObject();
                }
                pos = pos.dir[dir];
            }


            pos.errors += status;
            pos.errors_local += status;
            pos.node_error += node_error;
            pos.node_error_local += node_error;
            pos.self_error += self_error;
            pos.self_error_local += self_error;
            pos.testsCount++;
            pos.testsCount_local++;

            if (path[path.length - 1] + ".js" in pos.tests) {
                pos.tests[path[path.length - 1] + ".js"].push(results[i][j]);
            } else {
                pos.tests[path[path.length - 1] + ".js"] = [results[i][j]];
            }
        }
    }
});

// Produce debug output
if (ARGS.debug) {
    fs.writeFile(ARGS.debug, JSON.stringify(data));
}

// Intro
var mdFile = "# Test262 results\n\n";
mdFile += "All tests are passed as js code to UglifyJS, and run through the minify method. " +
    "The minified code will then be run by node. If the minified code errors, " +
    "the original code will be run through node and the results will be compared. " +
    "Ultimately, the test runner decides if a test fail. Some tests may be expected to fail.\n\n";
mdFile += "Tests only working without UglifyJS are marked in bold.\n\n";
mdFile += "Most tests are tested in strict and non-strict mode. " +
    "While failures may be listed twice, the test will only be shown once.\n\n";
mdFile += "Note: there is a bug that prevents links from being visible, " +
    "see https://github.com/vmg/redcarpet/issues/443\n\n";
 
 // Show tests, failures, percentage and used tools
mdFile += "## Global stats\n\n";
mdFile += "- Found " + data.logs.testsCount + " executed tests\n";
mdFile += "- " + data.logs.errors + " tests failed (" + roundToPercentage(data.logs.errors / data.logs.testsCount) + "%)\n";
mdFile += "- " + data.logs.node_error + " tests failed becuase of Node (" + roundToPercentage(data.logs.node_error / data.logs.testsCount) + "%)\n"
mdFile += "- " + data.logs.self_error + " tests failed because of UglifyJS (" + roundToPercentage(data.logs.self_error / data.logs.testsCount) + "%)\n";
mdFile += "\n";

function getSummary(obj) {
    var subDirectoryCount = Object.keys(obj.dir).length;

    // Templates:
    // 1 failures whereof 1 caused by UglifyJS (1 failure over 10 local tests with 1 caused by UglifyJS, with 10 subdirectories)
    // 0 failures (no local tests, 10 subdirectories)
    return obj.errors + " failures over " + obj.testsCount + " tests" + (
        obj.self_error > 0 ? " whereof " + obj.self_error + " caused by UglifyJS" : ""
    ) + " (" + (
        obj.testsCount_local > 0 ? (
            obj.errors_local > 0 ? obj.errors_local + " failures over " + obj.testsCount_local + " local tests" + (
                obj.self_error_local > 0 ? " with " + obj.self_error_local + " caused by UglifyJS" : ""
            ) : "No local failures"
        ) : "No local tests"
    ) + ", with " + (subDirectoryCount > 0 ? subDirectoryCount : "no") + " subdirectories)"
}

function printResult(obj, level) {
    var prefix = "";

    for (var c = 0; c < level; c++) {
        prefix += "    ";
    }

    // Print current directory
    var dirs = "";
    for (var i in obj.dir) {
        dirs += prefix + "- [" + (obj.dir[i].errors === 0 ? "x" : " ") +"] `" + i + "` "
            + getSummary(obj.dir[i]) + "\n";

        if (obj.dir[i].errors > 0) {
            dirs += printResult(obj.dir[i], level + 1);
        }
    }

    var fails = "";
    for (var j in obj.tests) {
        var node_error_count = 0;
        var self_error_count = 0;
        var fail_count = 0;
        var total_count = 0;

        for (var k = 0; k < obj.tests[j].length; k++) {
            total_count++;

            if (obj.tests[j][k][0] !== FAIL) {
                continue;
            }
            fail_count++;
            if (obj.tests[j][k][2].node_error) {
                node_error_count++;
            }
            if (obj.tests[j][k][2].self_error) {
                self_error_count++;
            }
        }

        if (fail_count > 0) {
            var counter = " - failed: " + fail_count + "/" + total_count;
            var error_style = self_error_count > 0 ? "**" : (node_error_count > 0 ? "~~" : "");

            // Add formatted link
            var test = obj.tests[j][0][1]
                .replace(/\\/g, "\\\\")
                .replace(/-/g, "\\-");
            var links = " [\\[test\\]](" + data.unitTestUrl +
                obj.tests[j][0][1]
                .split(" ")[0]
                .replace(/\\/g, "/") + ".js)";

            var cause = "";
            if (self_error_count > 0 && node_error_count === 0) {
                cause = " (Caused by UglifyJS)";
            } else if (self_error_count === 0 && node_error_count > 0) {
                cause = " (Caused by Node)";
            } else if (self_error_count > 0 && node_error_count > 0) {
                cause = " (Some caused by Node and some by UglifyJS)";
            }

            // Add error summary
            fails += prefix + "- *" + error_style + test + error_style + "*" +
                links + cause + counter + "\n";
        }
    }

    return fails + dirs;
}

mdFile += "## Error tree\n\n";
mdFile += getSummary(data.logs) + "\n\n";
mdFile += printResult(data.logs, 0);

if (ARGS.o) {
    fs.writeFile(ARGS.o,mdFile);
} else {
    console.log(mdFile);
}