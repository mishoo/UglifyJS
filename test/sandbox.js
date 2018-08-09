var semver = require("semver");
var vm = require("vm");

function safe_log(arg, level) {
    if (arg) switch (typeof arg) {
      case "function":
        return arg.toString();
      case "object":
        if (/Error$/.test(arg.name)) return arg.toString();
        arg.constructor.toString();
        if (level--) for (var key in arg) {
            var desc = Object.getOwnPropertyDescriptor(arg, key);
            if (!desc || !desc.get) arg[key] = safe_log(arg[key], level);
        }
    }
    return arg;
}

function log(msg) {
    if (arguments.length == 1 && typeof msg == "string") return console.log("%s", msg);
    return console.log.apply(console, [].map.call(arguments, function(arg) {
        return safe_log(arg, 3);
    }));
}

var func_toString = new vm.Script([
    "[ Array, Boolean, Error, Function, Number, Object, RegExp, String ].forEach(function(f) {",
    "    f.toString = Function.prototype.toString;",
    "});",
    "Function.prototype.toString = function() {",
    "    var id = 100000;",
    "    return function() {",
    "        var n = this.name;",
    "        if (!/^F[0-9]{6}N$/.test(n)) {",
    '            n = "F" + ++id + "N";',
].concat(Object.getOwnPropertyDescriptor(Function.prototype, "name").configurable ? [
    '            Object.defineProperty(this, "name", {',
    "                get: function() {",
    "                    return n;",
    "                }",
    "            });",
] : [], [
    "        }",
    '        return "function(){}";',
    "    };",
    "}();",
]).join("\n"));

function createContext() {
    var ctx = vm.createContext(Object.defineProperty({}, "console", { value: { log: log } }));
    func_toString.runInContext(ctx);
    return ctx;
}

var context;
exports.run_code = function(code, reuse) {
    var stdout = "";
    var original_write = process.stdout.write;
    process.stdout.write = function(chunk) {
        stdout += chunk;
    };
    try {
        if (!reuse || !context) context = createContext();
        vm.runInContext([
            "!function() {",
            code,
            "}();",
        ].join("\n"), context, { timeout: 5000 });
        return stdout;
    } catch (ex) {
        return ex;
    } finally {
        process.stdout.write = original_write;
        if (!reuse || code.indexOf(".prototype") >= 0) {
            context = null;
        } else for (var key in context) {
            delete context[key];
        }
    }
};

function strip_func_ids(text) {
    return ("" + text).replace(/F[0-9]{6}N/g, "<F<>N>");
}

exports.same_stdout = semver.satisfies(process.version, "0.12") ? function(expected, actual) {
    if (typeof expected != typeof actual) return false;
    if (typeof expected != "string") {
        if (expected.name != actual.name) return false;
        expected = expected.message.slice(expected.message.lastIndexOf("\n") + 1);
        actual = actual.message.slice(actual.message.lastIndexOf("\n") + 1);
    }
    return strip_func_ids(expected) == strip_func_ids(actual);
} : function(expected, actual) {
    return typeof expected == typeof actual && strip_func_ids(expected) == strip_func_ids(actual);
};
