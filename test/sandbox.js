var readFileSync = require("fs").readFileSync;
var semver = require("semver");
var spawnSync = require("child_process").spawnSync;
var vm = require("vm");

setup_log();
var setup_code = "(" + setup + ")(" + [
    "this",
    find_builtins(),
    setup_log,
    "function(process) {" + readFileSync(require.resolve("../tools/tty", "utf8")) + "}",
].join(",\n") + ");\n";
exports.has_toplevel = function(options) {
    return options.toplevel
        || options.mangle && options.mangle.toplevel
        || options.compress && options.compress.toplevel;
};
exports.is_error = is_error;
exports.run_code = semver.satisfies(process.version, "0.8") ? function(code, toplevel, timeout) {
    var stdout = run_code_vm(code, toplevel, timeout);
    if (typeof stdout != "string" || !/arguments/.test(code)) return stdout;
    do {
        var prev = stdout;
        stdout = run_code_vm(code, toplevel, timeout);
    } while (prev !== stdout);
    return stdout;
} : semver.satisfies(process.version, "<0.12") ? run_code_vm : function(code, toplevel, timeout) {
    var stdout = ([
        /\b(async[ \t]+function|Promise|setImmediate|setInterval|setTimeout)\b/,
        /\basync([ \t]+|[ \t]*#)[^\s()[\]{}#:;,.&|!~=*%/+-]+(\s*\(|[ \t]*=>)/,
        /\basync[ \t]*\*[ \t]*[^\s()[\]{}#:;,.&|!~=*%/+-]+\s*\(/,
        /\basync([ \t]*\*)?[ \t]*\[[\s\S]*?\]\s*\(/,
        /\basync[ \t]*\([\s\S]*?\)[ \t]*=>/,
    ].some(function(pattern) {
        return pattern.test(code);
    }) ? run_code_exec : run_code_vm)(code, toplevel, timeout);
    var len = typeof stdout == "string" && stdout.length;
    return len > 1000 ? stdout.slice(0, 1000) + "…《" + len + "》" : stdout;
};
exports.same_stdout = semver.satisfies(process.version, "0.12") ? function(expected, actual) {
    if (typeof expected != typeof actual) return false;
    if (is_error(expected)) {
        if (expected.name !== actual.name) return false;
        if (typeof actual.message != "string") return false;
        expected = expected.message.slice(expected.message.lastIndexOf("\n") + 1);
        actual = actual.message.slice(actual.message.lastIndexOf("\n") + 1);
    }
    return strip_func_ids(expected) == strip_func_ids(actual);
} : function(expected, actual) {
    return typeof expected == typeof actual && strip_func_ids(expected) == strip_func_ids(actual);
};
exports.patch_module_statements = function(code, module) {
    if (module || module === undefined && /\bawait\b/.test(code)) {
        code = [
            "(async()=>{",
            code,
            '})().catch(e=>process.on("exit",()=>{throw e}));',
        ];
        if (module) code.unshift('"use strict";');
        code = code.join("\n");
    }
    var count = 0, has_default = "", imports = [], strict_mode = "";
    code = code.replace(/^\s*("|')use strict\1\s*;?/, function(match) {
        strict_mode = match;
        return "";
    }).replace(/\bexport(?:\s*\{[^{}]*}\s*?(?:$|\n|;)|\s+default\b(?:\s*(\(|\{|class\s*\{|class\s+(?=extends\b)|(?:async\s+)?function\s*(?:\*\s*)?\())?|\b)/g, function(match, header) {
        if (/^export\s+default/.test(match)) has_default = "function _uglify_export_default_() {}";
        if (!header) return "";
        if (header.length == 1) return "0, " + header;
        var name = "_uglify_export_default_";
        if (/^class\b/.test(header)) do {
            name = "_uglify_export_default_" + ++count;
        } while (code.indexOf(name) >= 0);
        return header.slice(0, -1) + " " + name + header.slice(-1);
    }).replace(/\bimport\.meta\b/g, function() {
        return '({ url: "https://example.com/path/index.html" })';
    }).replace(/\bimport\b(?:\s*([^\s('"][^('"]*)\bfrom\b)?\s*(['"]).*?\2(?:$|\n|;)/g, function(match, symbols) {
        if (symbols) {
            if (!/^[{*]/.test(symbols)) symbols = "default:" + symbols;
            symbols = symbols.replace(/[{}]/g, "").trim().replace(/\s*,\s*/g, ",");
            symbols = symbols.replace(/\*/, '"*"').replace(/\bas\s+(?!$|,|as\s)/g, ":");
            imports.push([
                "const {",
                symbols,
                "} = new Proxy(Object.create(null), { get(_, value) { return { value }; } });",
            ].join(""));
        }
        return "";
    });
    imports.push("");
    return strict_mode + has_default + imports.join("\n") + code;
};

function is_error(result) {
    return result && typeof result.name == "string" && typeof result.message == "string";
}

function strip_color_codes(value) {
    return value.replace(/\u001b\[\d+m/g, "");
}

function strip_func_ids(text) {
    return ("" + text).replace(/F[0-9]{6}N/g, "<F<>N>");
}

function setup_log() {
    var inspect = require("util").inspect;
    if (inspect.defaultOptions) {
        var log_options = {
            breakLength: Infinity,
            colors: false,
            compact: true,
            customInspect: false,
            depth: Infinity,
            maxArrayLength: Infinity,
            maxStringLength: Infinity,
            showHidden: false,
        };
        for (var name in log_options) {
            if (name in inspect.defaultOptions) inspect.defaultOptions[name] = log_options[name];
        }
    }
    return inspect;
}

function find_builtins() {
    setup_code = "console.log(Object.keys(this));";
    var builtins = run_code_vm("");
    if (semver.satisfies(process.version, ">=0.12")) builtins += ".concat(" + run_code_exec("") + ")";
    return builtins;
}

function setup(global, builtins, setup_log, setup_tty) {
    [ Array, Boolean, Error, Function, Number, Object, RegExp, String ].forEach(function(f) {
        f.toString = Function.prototype.toString;
    });
    Function.prototype.toString = function() {
        var configurable = Object.getOwnPropertyDescriptor(Function.prototype, "name").configurable;
        var id = 100000;
        return function() {
            var n = this.name;
            if (!/^F[0-9]{6}N$/.test(n)) {
                n = "F" + ++id + "N";
                if (configurable) Object.defineProperty(this, "name", {
                    get: function() {
                        return n;
                    }
                });
            }
            return "function(){}";
        };
    }();
    var process = global.process;
    if (process) {
        setup_tty(process);
        var inspect = setup_log();
        process.on("uncaughtException", function(ex) {
            var value = ex;
            if (value instanceof Error) {
                value = {};
                for (var name in ex) {
                    value[name] = ex[name];
                    delete ex[name];
                }
            }
            var marker = "\n\n-----===== UNCAUGHT EXCEPTION =====-----\n\n";
            process.stderr.write(marker + inspect(value) + marker);
            throw ex;
        }).on("unhandledRejection", function() {});
    }
    var log = console.log;
    var safe_console = {
        log: function(msg) {
            if (arguments.length == 1 && typeof msg == "string") return log("%s", msg);
            return log.apply(null, [].map.call(arguments, function(arg) {
                return safe_log(arg, {
                    level: 5,
                    original: [],
                    replaced: [],
                });
            }));
        },
    };
    var props = {
        // for Node.js v8
        console: {
            get: function() {
                return safe_console;
            },
        },
        global: { get: self },
        self: { get: self },
        window: { get: self },
    };
    [
        // for Node.js v0.12
        "Buffer",
        "clearImmediate",
        "clearInterval",
        "clearTimeout",
        // for Node.js v0.12
        "DTRACE_NET_STREAM_END",
        // for Node.js v8
        "process",
        "setImmediate",
        "setInterval",
        "setTimeout",
    ].forEach(function(name) {
        var value = global[name];
        props[name] = {
            get: function() {
                return value;
            },
        };
    });
    builtins.forEach(function(name) {
        try {
            delete global[name];
        } catch (e) {}
    });
    Object.defineProperties(global, props);
    // for Node.js v8+
    global.__proto__ = Object.defineProperty(Object.create(global.__proto__), "toString", {
        value: function() {
            return "[object global]";
        },
    });

    function self() {
        return this;
    }

    function safe_log(arg, cache) {
        if (arg) switch (typeof arg) {
          case "function":
            return arg.toString();
          case "object":
            if (arg === global) return "[object global]";
            if (/Error$/.test(arg.name)) return arg.toString();
            if (typeof arg.then == "function") return "[object Promise]";
            if (arg.constructor) arg.constructor.toString();
            var index = cache.original.indexOf(arg);
            if (index >= 0) return cache.replaced[index];
            if (--cache.level < 0) return "[object Object]";
            var value = {};
            cache.original.push(arg);
            cache.replaced.push(value);
            for (var key in arg) {
                var desc = Object.getOwnPropertyDescriptor(arg, key);
                if (desc && (desc.get || desc.set)) {
                    Object.defineProperty(value, key, desc);
                } else {
                    value[key] = safe_log(arg[key], cache);
                }
            }
            return value;
        }
        return arg;
    }
}

function run_code_vm(code, toplevel, timeout) {
    timeout = timeout || 5000;
    var stdout = "";
    var original_write = process.stdout.write;
    process.stdout.write = function(chunk) {
        stdout += chunk;
    };
    try {
        var ctx = vm.createContext({ console: console });
        // for Node.js v6
        vm.runInContext(setup_code, ctx);
        vm.runInContext(toplevel ? "(function(){\n" + code + "\n})();" : code, ctx, { timeout: timeout });
        // for Node.js v4
        return strip_color_codes(stdout.replace(/\b(Array \[|Object {)/g, function(match) {
            return match.slice(-1);
        }));
    } catch (ex) {
        return ex;
    } finally {
        process.stdout.write = original_write;
    }
}

function run_code_exec(code, toplevel, timeout) {
    if (toplevel) {
        code = setup_code + "(function(){\n" + code + "\n})();";
    } else {
        code = code.replace(/^((["'])[^"']*\2(;|$))?/, function(directive) {
            return directive + setup_code;
        });
    }
    var result = spawnSync(process.argv[0], [ '--max-old-space-size=2048' ], {
        encoding: "utf8",
        input: code,
        maxBuffer: 1073741824,
        stdio: "pipe",
        timeout: timeout || 5000,
    });
    if (result.status === 0) return result.stdout;
    var msg = ("" + result.stderr).replace(/\r\n/g, "\n");
    if (result.error && result.error.code == "ETIMEDOUT" || /FATAL ERROR:/.test(msg)) {
        return new Error("Script execution timed out.");
    }
    if (result.error) return result.error;
    var match = /\n([^:\s]*Error)(?:: ([\s\S]+?))?\n(    at [\s\S]+)\n$/.exec(msg);
    var marker = "\n\n-----===== UNCAUGHT EXCEPTION =====-----\n\n";
    var start = msg.indexOf(marker) + marker.length;
    var end = msg.indexOf(marker, start);
    var details;
    if (end >= 0) {
        details = msg.slice(start, end).replace(/<([1-9][0-9]*) empty items?>/g, function(match, count) {
            return new Array(+count).join();
        });
        try {
            details = vm.runInNewContext("(" + details + ")");
        } catch (e) {}
    } else if (!match) {
        return new Error("Script execution aborted.");
    }
    if (!match) return details;
    var ex = new global[match[1]](match[2]);
    ex.stack = ex.stack.slice(0, ex.stack.indexOf("    at ")) + match[3];
    if (typeof details == "object") {
        for (var name in details) ex[name] = details[name];
    } else if (end >= 0) {
        ex.details = details;
    }
    return ex;
}
