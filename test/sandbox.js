var vm = require("vm");

var FUNC_TOSTRING = [
    "Function.prototype.toString = Function.prototype.valueOf = function() {",
    "    var ids = [];",
    "    return function() {",
    "        var i = ids.indexOf(this);",
    "        if (i < 0) {",
    "            i = ids.length;",
    "            ids.push(this);",
    "        }",
    '        return "[Function: __func_" + i + "__]";',
    "    }",
    "}();",
].join("\n");
exports.run_code = function(code) {
    var stdout = "";
    var original_write = process.stdout.write;
    process.stdout.write = function(chunk) {
        stdout += chunk;
    };
    try {
        vm.runInNewContext([
            "!function() {",
            FUNC_TOSTRING,
            code,
            "}();",
        ].join("\n"), {
            console: {
                log: function() {
                    return console.log.apply(console, [].map.call(arguments, function(arg) {
                        return typeof arg == "function" || arg && /Error$/.test(arg.name) ? arg.toString() : arg;
                    }));
                }
            }
        }, { timeout: 5000 });
        return stdout;
    } catch (ex) {
        return ex;
    } finally {
        process.stdout.write = original_write;
    }
};
exports.same_stdout = ~process.version.lastIndexOf("v0.12.", 0) ? function(expected, actual) {
    if (typeof expected != typeof actual) return false;
    if (typeof expected != "string") {
        if (expected.name != actual.name) return false;
        expected = expected.message.slice(expected.message.lastIndexOf("\n") + 1);
        actual = actual.message.slice(actual.message.lastIndexOf("\n") + 1);
    }
    return expected == actual;
} : function(expected, actual) {
    return typeof expected == typeof actual && expected.toString() == actual.toString();
};
