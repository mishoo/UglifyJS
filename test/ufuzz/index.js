// derived from https://github.com/qfox/uglyfuzzer by Peter van der Zee
"use strict";

// check both CLI and file modes of nodejs (!). See #1695 for details. and the various settings of uglify.
// bin/uglifyjs s.js -c && bin/uglifyjs s.js -c passes=3 && bin/uglifyjs s.js -c passes=3 -m
// cat s.js | node && node s.js && bin/uglifyjs s.js -c | node && bin/uglifyjs s.js -c passes=3 | node && bin/uglifyjs s.js -c passes=3 -m | node

require("../../tools/tty");

var UglifyJS = require("../..");
var randomBytes = require("crypto").randomBytes;
var sandbox = require("../sandbox");
var reduce_test = require("../reduce");

var MAX_GENERATED_TOPLEVELS_PER_RUN = 1;
var MAX_GENERATION_RECURSION_DEPTH = 12;
var INTERVAL_COUNT = 100;

var STMT_ARG_TO_ID = Object.create(null);
var STMTS_TO_USE = [];
function STMT_(name) {
    return STMT_ARG_TO_ID[name] = STMTS_TO_USE.push(STMTS_TO_USE.length) - 1;
}

var STMT_BLOCK = STMT_("block");
var STMT_IF_ELSE = STMT_("ifelse");
var STMT_DO_WHILE = STMT_("dowhile");
var STMT_WHILE = STMT_("while");
var STMT_FOR_LOOP = STMT_("forloop");
var STMT_FOR_IN = STMT_("forin");
var STMT_SEMI = STMT_("semi");
var STMT_EXPR = STMT_("expr");
var STMT_SWITCH = STMT_("switch");
var STMT_VAR = STMT_("var");
var STMT_RETURN_ETC = STMT_("stop");
var STMT_FUNC_EXPR = STMT_("funcexpr");
var STMT_TRY = STMT_("try");
var STMT_C = STMT_("c");

var STMT_FIRST_LEVEL_OVERRIDE = -1;
var STMT_SECOND_LEVEL_OVERRIDE = -1;
var STMT_COUNT_FROM_GLOBAL = true; // count statement depth from nearest function scope or just global scope?

var num_iterations = +process.argv[2] || 1/0;
var verbose = false; // log every generated test
var verbose_interval = false; // log every 100 generated tests
var use_strict = false;
var catch_redef = require.main === module;
var generate_directive = require.main === module;
for (var i = 2; i < process.argv.length; ++i) {
    switch (process.argv[i]) {
      case "-v":
        verbose = true;
        break;
      case "-V":
        verbose_interval = true;
        break;
      case "-t":
        MAX_GENERATED_TOPLEVELS_PER_RUN = +process.argv[++i];
        if (!MAX_GENERATED_TOPLEVELS_PER_RUN) throw new Error("Must generate at least one toplevel per run");
        break;
      case "-r":
        MAX_GENERATION_RECURSION_DEPTH = +process.argv[++i];
        if (!MAX_GENERATION_RECURSION_DEPTH) throw new Error("Recursion depth must be at least 1");
        break;
      case "-s1":
        var name = process.argv[++i];
        STMT_FIRST_LEVEL_OVERRIDE = STMT_ARG_TO_ID[name];
        if (!(STMT_FIRST_LEVEL_OVERRIDE >= 0)) throw new Error("Unknown statement name; use -? to get a list");
        break;
      case "-s2":
        var name = process.argv[++i];
        STMT_SECOND_LEVEL_OVERRIDE = STMT_ARG_TO_ID[name];
        if (!(STMT_SECOND_LEVEL_OVERRIDE >= 0)) throw new Error("Unknown statement name; use -? to get a list");
        break;
      case "--no-catch-redef":
        catch_redef = false;
        break;
      case "--no-directive":
        generate_directive = false;
        break;
      case "--use-strict":
        use_strict = true;
        break;
      case "--stmt-depth-from-func":
        STMT_COUNT_FROM_GLOBAL = false;
        break;
      case "--only-stmt":
        STMTS_TO_USE = process.argv[++i].split(",").map(function(name) {
          return STMT_ARG_TO_ID[name];
        });
        break;
      case "--without-stmt":
        // meh. it runs once it's fine.
        process.argv[++i].split(",").forEach(function(name) {
            var omit = STMT_ARG_TO_ID[name];
            STMTS_TO_USE = STMTS_TO_USE.filter(function(id) {
              return id !== omit;
            });
        });
        break;
      case "--help":
      case "-h":
      case "-?":
        println("** UglifyJS fuzzer help **");
        println("Valid options (optional):");
        println("<number>: generate this many cases (if used must be first arg)");
        println("-v: print every generated test case");
        println("-V: print every 100th generated test case");
        println("-t <int>: generate this many toplevels per run (more take longer)");
        println("-r <int>: maximum recursion depth for generator (higher takes longer)");
        println("-s1 <statement name>: force the first level statement to be this one (see list below)");
        println("-s2 <statement name>: force the second level statement to be this one (see list below)");
        println("--no-catch-redef: do not redefine catch variables");
        println("--no-directive: do not generate directives");
        println('--use-strict: generate "use strict"');
        println("--stmt-depth-from-func: reset statement depth counter at each function, counts from global otherwise");
        println("--only-stmt <statement names>: a comma delimited white list of statements that may be generated");
        println("--without-stmt <statement names>: a comma delimited black list of statements never to generate");
        println("List of accepted statement names: " + Object.keys(STMT_ARG_TO_ID));
        println("** UglifyJS fuzzer exiting **");
        return 0;
      default:
        // first arg may be a number.
        if (i > 2 || !parseInt(process.argv[i], 10)) throw new Error("Unknown argument[" + process.argv[i] + "]; see -h for help");
    }
}

var SUPPORT = function(matrix) {
    for (var name in matrix) {
        matrix[name] = typeof sandbox.run_code(matrix[name]) == "string";
    }
    return matrix;
}({
    arrow: "a => 0;",
    async: "async function f(){}",
    catch_omit_var: "try {} catch {}",
    computed_key: "({[0]: 0});",
    const_block: "var a; { const a = 0; }",
    default_value: "[ a = 0 ] = [];",
    destructuring: "[] = [];",
    let: "let a;",
    rest: "var [...a] = [];",
    rest_object: "var {...a} = {};",
    spread: "[...[]];",
    spread_object: "({...0});",
    trailing_comma: "function f(a,) {}",
});

var VALUES = [
    '"a"',
    '"b"',
    '"c"',
    '""',
    "true",
    "false",
    " /[a2][^e]+$/ ",
    "(-1)",
    "(-2)",
    "(-3)",
    "(-4)",
    "(-5)",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "22",
    "-0", // 0/-0 !== 0
    "23..toString()",
    "24 .toString()",
    "25. ",
    "0x26.toString()",
    "NaN",
    "undefined",
    "Infinity",
    "null",
    "[]",
    "[,0][1]", // an array with elisions... but this is always false
    "([,0].length === 2)", // an array with elisions... this is always true
    "({})", // wrapped the object causes too many syntax errors in statements
    '"foo"',
    '"bar"',
    '"undefined"',
    '"object"',
    '"number"',
    '"function"',
    "this",
];

var BINARY_OPS = [
    " + ", // spaces needed to disambiguate with ++ cases (could otherwise cause syntax errors)
    " - ",
    "/",
    "*",
    "&",
    "|",
    "^",
    "<",
    "<=",
    ">",
    ">=",
    "==",
    "===",
    "!=",
    "!==",
    "<<",
    ">>",
    ">>>",
    "%",
    "&&",
    "||",
    "^",
    ",",
];
BINARY_OPS = BINARY_OPS.concat(BINARY_OPS);
BINARY_OPS = BINARY_OPS.concat(BINARY_OPS);
BINARY_OPS = BINARY_OPS.concat(BINARY_OPS);
BINARY_OPS = BINARY_OPS.concat(BINARY_OPS);
BINARY_OPS = BINARY_OPS.concat(BINARY_OPS);
BINARY_OPS.push(" in ");

var ASSIGNMENTS = [
    "=",
    "=",
    "=",
    "=",
    "=",
    "=",
    "=",
    "=",
    "=",
    "=",

    "=",
    "=",
    "=",
    "=",
    "=",
    "=",
    "=",
    "=",
    "=",
    "=",

    "+=",
    "+=",
    "+=",
    "+=",
    "+=",
    "+=",
    "+=",
    "+=",
    "+=",
    "+=",

    "-=",
    "*=",
    "/=",
    "&=",
    "|=",
    "^=",
    "<<=",
    ">>=",
    ">>>=",
    "%=",
];

var UNARY_SAFE = [
    "+",
    "-",
    "~",
    "!",
    "void ",
    "delete ",
];
var UNARY_POSTFIX = [
    "++",
    "--",
];
var UNARY_PREFIX = UNARY_POSTFIX.concat(UNARY_SAFE);

var NO_COMMA = true;
var COMMA_OK = false;
var MAYBE = true;
var MANDATORY = false;
var CAN_THROW = true;
var CANNOT_THROW = false;
var CAN_BREAK = true;
var CANNOT_BREAK = false;
var CAN_CONTINUE = true;
var CANNOT_CONTINUE = false;
var CAN_RETURN = false;
var CANNOT_RETURN = true;
var NO_DEFUN = false;
var DEFUN_OK = true;
var DONT_STORE = true;
var NO_CONST = true;
var NO_DUPLICATE = true;

var VAR_NAMES = [
    "a",
    "a",
    "a",
    "a",
    "b",
    "b",
    "b",
    "b",
    "c", // prevent redeclaring this, avoid assigning to this
    "foo",
    "foo",
    "bar",
    "bar",
    "undefined",
    "NaN",
    "Infinity",
    "arguments",
    "Math",
    "parseInt",
    "async",
    "await",
];
var INITIAL_NAMES_LEN = VAR_NAMES.length;

var TYPEOF_OUTCOMES = [
    "function",
    "undefined",
    "string",
    "number",
    "object",
    "boolean",
    "special",
    "unknown",
    "symbol",
    "crap",
];

var avoid_vars = [];
var block_vars = [];
var unique_vars = [];
var async = false;
var loops = 0;
var funcs = 0;
var called = Object.create(null);
var labels = 10000;

function rng(max) {
    var r = randomBytes(2).readUInt16LE(0) / 65536;
    return Math.floor(max * r);
}

function strictMode() {
    return use_strict && rng(4) == 0 ? '"use strict";' : "";
}

function createTopLevelCode() {
    VAR_NAMES.length = INITIAL_NAMES_LEN; // prune any previous names still in the list
    block_vars.length = 0;
    unique_vars.length = 0;
    async = false;
    loops = 0;
    funcs = 0;
    called = Object.create(null);
    return [
        strictMode(),
        "var _calls_ = 10, a = 100, b = 10, c = 0;",
        rng(2)
        ? createStatements(3, MAX_GENERATION_RECURSION_DEPTH, CANNOT_THROW, CANNOT_BREAK, CANNOT_CONTINUE, CANNOT_RETURN, 0)
        : createFunctions(rng(MAX_GENERATED_TOPLEVELS_PER_RUN) + 1, MAX_GENERATION_RECURSION_DEPTH, DEFUN_OK, CANNOT_THROW, 0),
        // preceding `null` makes for a cleaner output (empty string still shows up etc)
        "console.log(null, a, b, c, Infinity, NaN, undefined);"
    ].join("\n");
}

function createFunctions(n, recurmax, allowDefun, canThrow, stmtDepth) {
    if (--recurmax < 0) { return ";"; }
    var s = "";
    while (n-- > 0) {
        s += createFunction(recurmax, allowDefun, canThrow, stmtDepth) + "\n";
    }
    return s;
}

function addTrailingComma(list) {
    return SUPPORT.trailing_comma && list && rng(20) == 0 ? list + "," : list;
}

function createParams(was_async, noDuplicate) {
    var save_async = async;
    if (was_async) async = true;
    var len = unique_vars.length;
    var params = [];
    for (var n = rng(4); --n >= 0;) {
        var name = createVarName(MANDATORY);
        if (noDuplicate) unique_vars.push(name);
        params.push(name);
    }
    unique_vars.length = len;
    async = save_async;
    return addTrailingComma(params.join(", "));
}

function createArgs(recurmax, stmtDepth, canThrow) {
    recurmax--;
    var args = [];
    for (var n = rng(4); --n >= 0;) switch (SUPPORT.spread ? rng(50) : 3) {
      case 0:
      case 1:
        var name = getVarName();
        if (canThrow && rng(8) === 0) {
            args.push("..." + name);
        } else {
            args.push('...("" + ' + name + ")");
        }
        break;
      case 2:
        args.push("..." + createArrayLiteral(recurmax, stmtDepth, canThrow));
        break;
      default:
        args.push(rng(2) ? createValue() : createExpression(recurmax, NO_COMMA, stmtDepth, canThrow));
        break;
    }
    return addTrailingComma(args.join(", "));
}

function createAssignmentPairs(recurmax, stmtDepth, canThrow, nameLenBefore, was_async) {
    var avoid = [];
    var len = unique_vars.length;
    var pairs = createPairs(recurmax, !nameLenBefore);
    pairs.has_rest = nameLenBefore && convertToRest(pairs.names);
    unique_vars.length = len;
    return pairs;

    function convertToRest(names) {
        var last = names.length - 1;
        if (last >= 0 && SUPPORT.rest && rng(20) == 0) {
            var name = names[last];
            if (name && name.indexOf("=") < 0) {
                if (/^[[{]/.test(name)) name = "[ " + name + " ]";
                names[last] = "..." + name;
                return true;
            }
        }
    }

    function fill(nameFn, valueFn) {
        var save_async = async;
        if (was_async != null) {
            async = false;
            if (save_async || was_async) addAvoidVar("await");
        }
        avoid.forEach(addAvoidVar);
        var save_vars = nameLenBefore && VAR_NAMES.splice(nameLenBefore);
        if (nameFn) nameFn();
        if (was_async != null) {
            async = was_async;
            if (save_async || was_async) removeAvoidVar("await");
        }
        if (valueFn) valueFn();
        if (save_vars) [].push.apply(VAR_NAMES, save_vars);
        avoid.forEach(removeAvoidVar);
        async = save_async;
    }

    function createAssignmentValue(recurmax) {
        return nameLenBefore && rng(2) ? createValue() : createExpression(recurmax, NO_COMMA, stmtDepth, canThrow);
    }

    function createDefaultValue(recurmax, noDefault) {
        return !noDefault && SUPPORT.default_value && rng(20) == 0 ? " = " +  createAssignmentValue(recurmax) : "";
    }

    function createKey(recurmax, keys) {
        var key;
        do {
            key = createObjectKey(recurmax, stmtDepth, canThrow);
        } while (keys.indexOf(key) >= 0);
        return key;
    }

    function createName() {
        unique_vars.push("a", "b", "c", "undefined", "NaN", "Infinity");
        var save_async = async;
        if (was_async) async = true;
        var name = createVarName(MANDATORY);
        async = save_async;
        unique_vars.length -= 6;
        avoid.push(name);
        unique_vars.push(name);
        return name;
    }

    function createPairs(recurmax, noDefault) {
        var names = [], values = [];
        var m = rng(4), n = rng(4);
        if (!nameLenBefore) m = Math.max(m, n, 1);
        for (var i = Math.max(m, n); --i >= 0;) {
            if (i < m && i < n) {
                createDestructured(recurmax, noDefault, names, values);
            } else if (i < m) {
                var name = createName();
                fill(function() {
                    names.unshift(name + createDefaultValue(recurmax, noDefault));
                });
            } else {
                fill(null, function() {
                    values.unshift(createAssignmentValue(recurmax));
                });
            }
        }
        return {
            names: names,
            values: values,
        };
    }

    function createDestructured(recurmax, noDefault, names, values) {
        switch (rng(20)) {
          case 0:
            if (--recurmax < 0) {
                names.unshift("[]");
                values.unshift('""');
            } else {
                var pairs = createPairs(recurmax);
                var default_value;
                fill(function() {
                    default_value = createDefaultValue(recurmax, noDefault);
                }, function() {
                    while (!rng(10)) {
                        var index = rng(pairs.names.length + 1);
                        pairs.names.splice(index, 0, "");
                        if (index < pairs.values.length) {
                            pairs.values.splice(index, 0, rng(2) ? createAssignmentValue(recurmax) : "");
                        } else switch (rng(5)) {
                          case 0:
                            pairs.values[index] = createAssignmentValue(recurmax);
                          case 1:
                            pairs.values.length = index + 1;
                        }
                    }
                    convertToRest(pairs.names);
                    names.unshift("[ " + pairs.names.join(", ") + " ]" + default_value);
                    values.unshift("[ " + pairs.values.join(", ") + " ]");
                });
            }
            break;
          case 1:
            if (--recurmax < 0) {
                names.unshift("{}");
                values.unshift('""');
            } else {
                var pairs = createPairs(recurmax);
                var keys = [];
                pairs.names.forEach(function(name, index) {
                    if (/^[[{]/.test(name)) {
                        var key;
                        do {
                            key = KEYS[rng(KEYS.length)];
                        } while (keys.indexOf(key) >= 0);
                        keys[index] = key;
                    }
                });
                fill(function() {
                    var last = pairs.names.length - 1, has_rest = false;
                    var s = pairs.names.map(function(name, index) {
                        if (index in keys) return keys[index] + ": " + name;
                        if (index == last && SUPPORT.rest_object && rng(20) == 0 && name.indexOf("=") < 0) {
                            has_rest = true;
                            return "..." + name;
                        }
                        return rng(10) == 0 ? name : createKey(recurmax, keys) + ": " + name;
                    }).join(", ");
                    if (!has_rest) s = addTrailingComma(s);
                    names.unshift("{ " + s + " }" + createDefaultValue(recurmax, noDefault));
                }, function() {
                    values.unshift("{ " + addTrailingComma(pairs.values.map(function(value, index) {
                        var key = index in keys ? keys[index] : createKey(recurmax, keys);
                        return key + ": " + value;
                    }).join(", ")) + " }");
                });
            }
            break;
          default:
            var name = createName();
            fill(function() {
                names.unshift(name + createDefaultValue(recurmax, noDefault));
            }, function() {
                values.unshift(createAssignmentValue(recurmax));
            });
            break;
        }
    }
}

function filterDirective(s) {
    if (!generate_directive && !s[1] && /\("/.test(s[2])) s[2] = ";" + s[2];
    return s;
}

function createBlockVariables(recurmax, stmtDepth, canThrow, fn) {
    var block_len = block_vars.length;
    var nameLenBefore = VAR_NAMES.length;
    var consts = [];
    var lets = [];
    unique_vars.push("a", "b", "c", "undefined", "NaN", "Infinity");
    while (!rng(block_vars.length > block_len ? 10 : 100)) {
        var name = createVarName(MANDATORY);
        if (SUPPORT.let && rng(2)) {
            lets.push(name);
        } else {
            consts.push(name);
        }
        block_vars.push(name);
    }
    unique_vars.length -= 6;
    fn(function() {
        consts.forEach(addAvoidVar);
        lets.forEach(addAvoidVar);
        if (rng(2)) {
            return createDefinitions("const", consts) + "\n" + createDefinitions("let", lets) + "\n";
        } else {
            return createDefinitions("let", lets) + "\n" + createDefinitions("const", consts) + "\n";
        }
    });
    VAR_NAMES.length = nameLenBefore;
    block_vars.length = block_len;

    function createDefinitions(type, names) {
        if (!names.length) return "";
        var s = type + " ";
        switch (SUPPORT.destructuring ? rng(10) : 2) {
          case 0:
            while (!rng(10)) names.splice(rng(names.length + 1), 0, "");
            s += "[ " + names.join(", ") + " ] = [ " + names.map(function() {
                return rng(10) ? createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) : "";
            }).join(", ") + " ];";
            break;
          case 1:
            var keys = [];
            s += "{ " + names.map(function(name, i) {
                var key = createObjectKey(recurmax, stmtDepth, canThrow);
                if (!/\[/.test(key)) keys[i] = key;
                return key + ": " + name;
            }).join(", ") + "} = { " + names.map(function(name, i) {
                var key = i in keys ? keys[i] : createObjectKey(recurmax, stmtDepth, canThrow);
                return key + ": " + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow);
            }).join(", ") + "};";
            break;
          default:
            s += names.map(function(name) {
                if (type == "let" && !rng(10)) {
                    removeAvoidVar(name);
                    return name;
                }
                var value = createExpression(recurmax, NO_COMMA, stmtDepth, canThrow);
                removeAvoidVar(name);
                return name + " = " + value;
            }).join(", ") + ";";
            names.length = 0;
            break;
        }
        names.forEach(removeAvoidVar);
        return s;
    }
}

function mayCreateBlockVariables(recurmax, stmtDepth, canThrow, fn) {
    if (SUPPORT.const_block) {
        createBlockVariables(recurmax, stmtDepth, canThrow, fn);
    } else {
        fn(function() {
            return "";
        });
    }
}

function makeFunction(name) {
    return (async ? "async function " : "function ") + name;
}

function createFunction(recurmax, allowDefun, canThrow, stmtDepth) {
    if (--recurmax < 0) { return ";"; }
    if (!STMT_COUNT_FROM_GLOBAL) stmtDepth = 0;
    var s = [];
    var name, args;
    var nameLenBefore = VAR_NAMES.length;
    var save_async = async;
    async = SUPPORT.async && rng(50) == 0;
    createBlockVariables(recurmax, stmtDepth, canThrow, function(defns) {
        if (allowDefun || rng(5) > 0) {
            name = "f" + funcs++;
        } else {
            unique_vars.push("a", "b", "c");
            name = createVarName(MANDATORY, !allowDefun);
            unique_vars.length -= 3;
        }
        var params;
        if (SUPPORT.destructuring && (!allowDefun || !(name in called)) && rng(2)) {
            called[name] = false;
            var pairs = createAssignmentPairs(recurmax, stmtDepth, canThrow, nameLenBefore, save_async);
            params = pairs.names.join(", ");
            if (!pairs.has_rest) params = addTrailingComma(params);
            args = addTrailingComma(pairs.values.join(", "));
        } else {
            params = createParams(save_async);
        }
        s.push(makeFunction(name) + "(" + params + "){", strictMode());
        s.push(defns());
        if (rng(5) === 0) {
            // functions with functions. lower the recursion to prevent a mess.
            s.push(createFunctions(rng(5) + 1, Math.ceil(recurmax * 0.7), DEFUN_OK, canThrow, stmtDepth));
        } else {
            // functions with statements
            s.push(_createStatements(3, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth));
        }
        s.push("}", "");
        s = filterDirective(s).join("\n");
    });
    async = save_async;
    VAR_NAMES.length = nameLenBefore;

    if (!allowDefun) {
        // avoid "function statements" (decl inside statements)
        s = "var " + createVarName(MANDATORY) + " = " + s;
        s += "(" + (args || createArgs(recurmax, stmtDepth, canThrow)) + ")";
    } else if (!(name in called) || args || rng(3)) {
        s += "var " + createVarName(MANDATORY) + " = " + name;
        s += "(" + (args || createArgs(recurmax, stmtDepth, canThrow)) + ")";
    }

    return s + ";";
}

function _createStatements(n, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) {
    if (--recurmax < 0) { return ";"; }
    var s = "";
    while (--n > 0) {
        s += createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + "\n";
    }
    return s;
}

function createStatements(n, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) {
    var s = "";
    mayCreateBlockVariables(recurmax, stmtDepth, canThrow, function(defns) {
        s += defns() + "\n";
        s += _createStatements(n, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth);
    });
    return s;
}

function enableLoopControl(flag, defaultValue) {
    return Array.isArray(flag) && flag.indexOf("") < 0 ? flag.concat("") : flag || defaultValue;
}

function createLabel(canBreak, canContinue) {
    var label;
    if (rng(10) < 3) {
        label = ++labels;
        if (Array.isArray(canBreak)) {
            canBreak = canBreak.slice();
        } else {
            canBreak = canBreak ? [ "" ] : [];
        }
        canBreak.push(label);
        if (Array.isArray(canContinue)) {
            canContinue = canContinue.slice();
        } else {
            canContinue = canContinue ? [ "" ] : [];
        }
        canContinue.push(label);
    }
    return {
        break: canBreak,
        continue: canContinue,
        target: label ? "L" + label + ": " : ""
    };
}

function getLabel(label) {
    if (!Array.isArray(label)) return "";
    label = label[rng(label.length)];
    return label && " L" + label;
}

function createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, target) {
    ++stmtDepth;
    var loop = ++loops;
    if (--recurmax < 0) {
        return createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ";";
    }

    // allow to forcefully generate certain structures at first or second recursion level
    if (target === undefined) {
        if (stmtDepth === 1 && STMT_FIRST_LEVEL_OVERRIDE >= 0) target = STMT_FIRST_LEVEL_OVERRIDE;
        else if (stmtDepth === 2 && STMT_SECOND_LEVEL_OVERRIDE >= 0) target = STMT_SECOND_LEVEL_OVERRIDE;
        else target = STMTS_TO_USE[rng(STMTS_TO_USE.length)];
    }

    switch (target) {
      case STMT_BLOCK:
        var label = createLabel(canBreak);
        return label.target + "{" + createStatements(rng(5) + 1, recurmax, canThrow, label.break, canContinue, cannotReturn, stmtDepth) + "}";
      case STMT_IF_ELSE:
        return "if (" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ")" + createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + (rng(2) ? " else " + createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) : "");
      case STMT_DO_WHILE:
        var label = createLabel(canBreak, canContinue);
        canBreak = label.break || enableLoopControl(canBreak, CAN_BREAK);
        canContinue = label.continue || enableLoopControl(canContinue, CAN_CONTINUE);
        return "{var brake" + loop + " = 5; " + label.target + "do {" + createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + "} while (" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + " && --brake" + loop + " > 0);}";
      case STMT_WHILE:
        var label = createLabel(canBreak, canContinue);
        canBreak = label.break || enableLoopControl(canBreak, CAN_BREAK);
        canContinue = label.continue || enableLoopControl(canContinue, CAN_CONTINUE);
        return "{var brake" + loop + " = 5; " + label.target + "while (" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + " && --brake" + loop + " > 0)" + createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + "}";
      case STMT_FOR_LOOP:
        var label = createLabel(canBreak, canContinue);
        canBreak = label.break || enableLoopControl(canBreak, CAN_BREAK);
        canContinue = label.continue || enableLoopControl(canContinue, CAN_CONTINUE);
        return label.target + "for (var brake" + loop + " = 5; " + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + " && brake" + loop + " > 0; --brake" + loop + ")" + createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth);
      case STMT_FOR_IN:
        var label = createLabel(canBreak, canContinue);
        canBreak = label.break || enableLoopControl(canBreak, CAN_BREAK);
        canContinue = label.continue || enableLoopControl(canContinue, CAN_CONTINUE);
        var key = rng(10) ? "key" + loop : getVarName(NO_CONST);
        return [
            "{var expr" + loop + " = " + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + "; ",
            label.target + " for (",
            !/^key/.test(key) ? rng(10) ? "" : "var " : !SUPPORT.let || rng(10) ? "var " : rng(2) ? "let " : "const ",
            !SUPPORT.destructuring || rng(10) ? key : rng(5) ? "[ " + key + " ]" : "{ length: " + key + " }",
            " in expr" + loop + ") {",
            rng(5) > 1 ? "c = 1 + c; var " + createVarName(MANDATORY) + " = expr" + loop + "[" + key + "]; " : "",
            createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth),
            "}}",
        ].join("");
      case STMT_SEMI:
        return use_strict && rng(20) === 0 ? '"use strict";' : ";";
      case STMT_EXPR:
        return createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ";";
      case STMT_SWITCH:
        // note: case args are actual expressions
        // note: default does not _need_ to be last
        return "switch (" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ") { " + createSwitchParts(recurmax, 4, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + "}";
      case STMT_VAR:
        if (SUPPORT.destructuring && rng(20) == 0) {
            var pairs = createAssignmentPairs(recurmax, stmtDepth, canThrow);
            return "var " + pairs.names.map(function(name, index) {
                return index in pairs.values ? name + " = " + pairs.values[index] : name;
            }).join(", ") + ";";
        } else switch (rng(3)) {
          case 0:
            unique_vars.push("c");
            var name = createVarName(MANDATORY);
            unique_vars.pop();
            return "var " + name + ";";
          case 1:
            // initializer can only have one expression
            unique_vars.push("c");
            var name = createVarName(MANDATORY);
            unique_vars.pop();
            return "var " + name + " = " + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ";";
          default:
            // initializer can only have one expression
            unique_vars.push("c");
            var n1 = createVarName(MANDATORY);
            var n2 = createVarName(MANDATORY);
            unique_vars.pop();
            return "var " + n1 + " = " + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ", " + n2 + " = " + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ";";
        }
      case STMT_RETURN_ETC:
        switch (rng(8)) {
          case 0:
          case 1:
          case 2:
          case 3:
            if (canBreak && rng(5) === 0) return "break" + getLabel(canBreak) + ";";
            if (canContinue && rng(5) === 0) return "continue" + getLabel(canContinue) + ";";
            if (cannotReturn) return createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ";";
            if (rng(3) == 0) return "/*3*/return;";
            return "return " + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ";";
          case 4:
            // this is actually more like a parser test, but perhaps it hits some dead code elimination traps
            // must wrap in curlies to prevent orphaned `else` statement
            // note: you can't `throw` without an expression so don't put a `throw` option in this case
            if (cannotReturn) return createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ";";
            return "{ /*2*/ return\n" + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + "}";
          default:
            // must wrap in curlies to prevent orphaned `else` statement
            if (canThrow && rng(5) === 0) return "{ throw " + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + "}";
            if (cannotReturn) return createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ";";
            return "{ return " + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + "}";
        }
      case STMT_FUNC_EXPR:
        // "In non-strict mode code, functions can only be declared at top level, inside a block, or ..."
        // (dont both with func decls in `if`; it's only a parser thing because you cant call them without a block)
        return "{" + createFunction(recurmax, NO_DEFUN, canThrow, stmtDepth) + "}";
      case STMT_TRY:
        // catch var could cause some problems
        // note: the "blocks" are syntactically mandatory for try/catch/finally
        var n = rng(3); // 0=only catch, 1=only finally, 2=catch+finally
        var s = "try {" + createStatement(recurmax, n === 1 ? CANNOT_THROW : CAN_THROW, canBreak, canContinue, cannotReturn, stmtDepth) + " }";
        if (n !== 1) {
            // the catch var should only be accessible in the catch clause...
            // we have to do go through some trouble here to prevent leaking it
            mayCreateBlockVariables(recurmax, stmtDepth, canThrow, function(defns) {
                var block_len = block_vars.length;
                var nameLenBefore = VAR_NAMES.length;
                var unique_len = unique_vars.length;
                if (SUPPORT.catch_omit_var && !rng(20)) {
                    s += " catch { ";
                } else if (canThrow && SUPPORT.destructuring && !rng(20)) {
                    unique_vars.push("a", "b", "c", "undefined", "NaN", "Infinity");
                    var name = createVarName(MANDATORY);
                    block_vars.push(name);
                    var message = createVarName(MANDATORY);
                    block_vars.push(message);
                    unique_vars.length -= 6;
                    if (SUPPORT.computed_key && rng(10) == 0) {
                        s += " catch ({  message: " + message + ", ";
                        addAvoidVar(name);
                        s += "[" + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + "]: " + name;
                        removeAvoidVar(name);
                        s += " }) { ";
                    } else {
                        s += " catch ({ name: " + name + ", message: " + message + " }) { ";
                    }
                } else {
                    var name = createVarName(MANDATORY);
                    if (!catch_redef) unique_vars.push(name);
                    s += " catch (" + name + ") { ";
                }
                var catches = VAR_NAMES.length - nameLenBefore;
                s += defns() + "\n";
                s += _createStatements(3, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth);
                s += " }";
                // remove catch variables
                block_vars.length = block_len;
                if (catches > 0) VAR_NAMES.splice(nameLenBefore, catches);
                unique_vars.length = unique_len;
            });
        }
        if (n !== 0) s += " finally { " + createStatements(3, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + " }";
        return s;
      case STMT_C:
        return "c = c + 1;";
      default:
        throw "no";
    }
}

function createSwitchParts(recurmax, n, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) {
    var hadDefault = false;
    var s = [""];
    canBreak = enableLoopControl(canBreak, CAN_BREAK);
    while (n-- > 0) {
        //hadDefault = n > 0; // disables weird `default` clause positioning (use when handling destabilizes)
        if (hadDefault || rng(5) > 0) {
            s.push(
                "case " + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ":",
                _createStatements(rng(3) + 1, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth),
                rng(10) > 0 ? " break;" : "/* fall-through */",
                ""
            );
        } else {
            hadDefault = true;
            s.push(
                "default:",
                _createStatements(rng(3) + 1, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth),
                ""
            );
        }
    }
    return s.join("\n");
}

function createExpression(recurmax, noComma, stmtDepth, canThrow) {
    if (--recurmax < 0) {
        return "(c = 1 + c, " + createNestedBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ")"; // note: should return a simple non-recursing expression value!
    }
    // since `a` and `b` are our canaries we want them more frequently than other expressions (1/3rd chance of a canary)
    switch (rng(6)) {
      case 0:
        return "(a++ + (" + _createExpression(recurmax, noComma, stmtDepth, canThrow) + "))";
      case 1:
        return "((--b) + (" + _createExpression(recurmax, noComma, stmtDepth, canThrow) + "))";
      case 2:
        return "((c = c + 1) + (" + _createExpression(recurmax, noComma, stmtDepth, canThrow) + "))"; // c only gets incremented
      default:
        var expr = "(" + _createExpression(recurmax, noComma, stmtDepth, canThrow) + ")";
        return async && rng(50) == 0 ? "(await" + expr + ")" : expr;
    }
}

function _createExpression(recurmax, noComma, stmtDepth, canThrow) {
    var p = 0;
    switch (rng(_createExpression.N)) {
      case p++:
      case p++:
        return createUnaryPrefix() + (rng(2) ? "a" : "b");
      case p++:
      case p++:
        return (rng(2) ? "a" : "b") + createUnaryPostfix();
      case p++:
      case p++:
        // parens needed because assignments aren't valid unless they're the left-most op(s) in an expression
        return "b " + createAssignment() + " a";
      case p++:
      case p++:
        return rng(2) + " === 1 ? a : b";
      case p++:
      case p++:
        return createValue();
      case p++:
      case p++:
        return getVarName();
      case p++:
        switch (SUPPORT.destructuring ? rng(20) : 2) {
          case 0:
            return [
                "[ ",
                new Array(rng(3)).join(","),
                getVarName(NO_CONST),
                new Array(rng(3)).join(","),
                " ] = ",
                createArrayLiteral(recurmax, stmtDepth, canThrow),
            ].join("");
          case 1:
            return [
                "{ ",
                rng(2) ? "" : createObjectKey(recurmax, stmtDepth, canThrow) + ": ",
                getVarName(NO_CONST),
                " } = ",
                createExpression(recurmax, COMMA_OK, stmtDepth, canThrow),
                " || {}",
            ].join("");
          default:
            return getVarName(NO_CONST) + createAssignment() + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow);
        }
      case p++:
        return createExpression(recurmax, COMMA_OK, stmtDepth, canThrow);
      case p++:
        return createExpression(recurmax, noComma, stmtDepth, canThrow) + " ? " + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + " : " + createExpression(recurmax, noComma, stmtDepth, canThrow);
      case p++:
      case p++:
        var nameLenBefore = VAR_NAMES.length;
        var save_async = async;
        async = SUPPORT.async && rng(50) == 0;
        unique_vars.push("c");
        var name = createVarName(MAYBE); // note: this name is only accessible from _within_ the function. and immutable at that.
        unique_vars.pop();
        var s = [];
        switch (rng(5)) {
          case 0:
            if (SUPPORT.arrow && !name && rng(2)) {
                var args, suffix;
                (rng(2) ? createBlockVariables : function() {
                    arguments[3]();
                })(recurmax, stmtDepth, canThrow, function(defns) {
                    var params;
                    if (SUPPORT.destructuring && rng(2)) {
                        var pairs = createAssignmentPairs(recurmax, stmtDepth, canThrow, nameLenBefore, save_async);
                        params = pairs.names.join(", ");
                        if (!pairs.has_rest) params = addTrailingComma(params);
                        args = addTrailingComma(pairs.values.join(", "));
                    } else {
                        params = createParams(save_async, NO_DUPLICATE);
                    }
                    params = (async ? "async (" : "(") + params + ") => ";
                    if (defns) {
                        s.push(
                            "(" + params + "{",
                            strictMode(),
                            defns(),
                            _createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth)
                        );
                        suffix = "})";
                    } else {
                        s.push("(" + params);
                        switch (rng(10)) {
                          case 0:
                            s.push('(typeof arguments != "undefined" && arguments && arguments[' + rng(3) + "])");
                            break;
                          case 1:
                            s.push("(this && this." + getDotKey() + ")");
                            break;
                          default:
                            s.push(createExpression(recurmax, NO_COMMA, stmtDepth, canThrow));
                            break;
                        }
                        suffix = ")";
                    }
                });
                async = save_async;
                VAR_NAMES.length = nameLenBefore;
                if (!args && rng(2)) args = createArgs(recurmax, stmtDepth, canThrow);
                if (args) suffix += "(" + args + ")";
                s.push(suffix);
            } else {
                s.push(
                    "(" + makeFunction(name) + "(){",
                    strictMode(),
                    createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth),
                    rng(2) ? "})" : "})()"
                );
            }
            break;
          case 1:
            s.push(
                "+" + makeFunction(name) + "(){",
                strictMode(),
                createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth),
                "}()"
            );
            break;
          case 2:
            s.push(
                "!" + makeFunction(name) + "(){",
                strictMode(),
                createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth),
                "}()"
            );
            break;
          case 3:
            s.push(
                "void " + makeFunction(name) + "(){",
                strictMode(),
                createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth),
                "}()"
            );
            break;
          default:
            async = false;
            createBlockVariables(recurmax, stmtDepth, canThrow, function(defns) {
                var instantiate = rng(4) ? "new " : "";
                s.push(
                    instantiate + "function " + name + "(" + createParams(save_async) + "){",
                    strictMode(),
                    defns()
                );
                if (instantiate) for (var i = rng(4); --i >= 0;) {
                    if (rng(2)) s.push("this." + getDotKey(true) + createAssignment() + _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ";");
                    else  s.push("this[" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + "]" + createAssignment() + _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ";");
                }
                s.push(_createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth));
            });
            async = save_async;
            VAR_NAMES.length = nameLenBefore;
            s.push(rng(2) ? "}" : "}(" + createArgs(recurmax, stmtDepth, canThrow) + ")");
            break;
        }
        async = save_async;
        VAR_NAMES.length = nameLenBefore;
        return filterDirective(s).join("\n");
      case p++:
      case p++:
        return createTypeofExpr(recurmax, stmtDepth, canThrow);
      case p++:
      case p++:
        // more like a parser test but perhaps comment nodes mess up the analysis?
        // note: parens not needed for post-fix (since that's the default when ambiguous)
        // for prefix ops we need parens to prevent accidental syntax errors.
        switch (rng(6)) {
          case 0:
            return "a/* ignore */++";
          case 1:
            return "b/* ignore */--";
          case 2:
            return "++/* ignore */a";
          case 3:
            return "--/* ignore */b";
          case 4:
            // only groups that wrap a single variable return a "Reference", so this is still valid.
            // may just be a parser edge case that is invisible to uglify...
            return "--(b)";
          case 5:
            // classic 0.3-0.1 case; 1-0.1-0.1-0.1 is not 0.7 :)
            return "b + 1 - 0.1 - 0.1 - 0.1";
          default:
            return "--/* ignore */b";
        }
      case p++:
      case p++:
        return createNestedBinaryExpr(recurmax, noComma, stmtDepth, canThrow);
      case p++:
      case p++:
        return createUnarySafePrefix() + "(" + createNestedBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ")";
      case p++:
        return " (" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + " || a || 3).toString() ";
      case p++:
        return " /[abc4]/.test((" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + " || b || 5).toString()) ";
      case p++:
        return " /[abc4]/g.exec((" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + " || b || 5).toString()) ";
      case p++:
        return " (" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + " || " + rng(10) + ").toString()[" +
            createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + "] ";
      case p++:
        return createArrayLiteral(recurmax, stmtDepth, canThrow);
      case p++:
        return createObjectLiteral(recurmax, stmtDepth, canThrow);
      case p++:
        return createArrayLiteral(recurmax, stmtDepth, canThrow) + "[" +
            createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + "]";
      case p++:
        return createObjectLiteral(recurmax, stmtDepth, canThrow) + "[" +
            createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + "]";
      case p++:
        return createArrayLiteral(recurmax, stmtDepth, canThrow) + "." + getDotKey();
      case p++:
        return createObjectLiteral(recurmax, stmtDepth, canThrow) + "." + getDotKey();
      case p++:
        return createValue() + " in " + createArrayLiteral(recurmax, stmtDepth, canThrow);
      case p++:
        return createValue() + " in " + createObjectLiteral(recurmax, stmtDepth, canThrow);
      case p++:
        var name = getVarName();
        var s = name + "[" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + "]";
        return canThrow && rng(8) == 0 ? s : name + " && " + s;
      case p++:
        var name = getVarName();
        var s = name + "." + getDotKey();
        return canThrow && rng(8) == 0 ? s : name + " && " + s;
      case p++:
      case p++:
        var name = getVarName();
        var s = name + "." + getDotKey();
        s = "typeof " + s + ' == "function" && --_calls_ >= 0 && ' + s + "(" + createArgs(recurmax, stmtDepth, canThrow) + ")";
        return canThrow && rng(8) == 0 ? s : name + " && " + s;
      case p++:
      case p++:
      case p++:
      case p++:
        var name;
        do {
            name = rng(3) == 0 ? getVarName() : "f" + rng(funcs + 2);
        } while (name in called && !called[name]);
        called[name] = true;
        return "typeof " + name + ' == "function" && --_calls_ >= 0 && ' + name + "(" + createArgs(recurmax, stmtDepth, canThrow) + ")";
    }
    _createExpression.N = p;
    return _createExpression(recurmax, noComma, stmtDepth, canThrow);
}

function createArrayLiteral(recurmax, stmtDepth, canThrow) {
    recurmax--;
    var arr = [];
    for (var i = rng(6); --i >= 0;) switch (SUPPORT.spread ? rng(50) : 3 + rng(47)) {
      case 0:
      case 1:
        var name = getVarName();
        if (canThrow && rng(8) === 0) {
            arr.push("..." + name);
        } else {
            arr.push('...("" + ' + name + ")");
        }
        break;
      case 2:
        arr.push("..." + createArrayLiteral(recurmax, stmtDepth, canThrow));
        break;
      case 3:
      case 4:
        // in rare cases produce an array hole element
        arr.push("");
        break;
      default:
        arr.push(createExpression(recurmax, COMMA_OK, stmtDepth, canThrow));
        break;
    }
    return "[" + arr.join(", ") + "]";
}

var SAFE_KEYS = [
    "length",
    "foo",
    "a",
    "b",
    "c",
    "undefined",
    "null",
    "NaN",
    "Infinity",
    "in",
    "var",
];
var KEYS = [
    "''",
    '"\t"',
    '"-2"',
    "0",
    "1.5",
    "3",
].concat(SAFE_KEYS);

function getDotKey(assign) {
    var key;
    do {
        key = SAFE_KEYS[rng(SAFE_KEYS.length)];
    } while (assign && key == "length");
    return key;
}

function createObjectKey(recurmax, stmtDepth, canThrow) {
    if (SUPPORT.computed_key && rng(10) == 0) {
        return "[" + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + "]";
    }
    return KEYS[rng(KEYS.length)];
}

function createObjectFunction(recurmax, stmtDepth, canThrow) {
    var nameLenBefore = VAR_NAMES.length;
    var save_async = async;
    var s;
    var name = createObjectKey(recurmax, stmtDepth, canThrow);
    createBlockVariables(recurmax, stmtDepth, canThrow, function(defns) {
        switch (rng(SUPPORT.computed_key ? 3 : 2)) {
          case 0:
            async = false;
            s = [
                "get " + name + "(){",
                strictMode(),
                defns(),
                _createStatements(2, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth),
                createStatement(recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth, STMT_RETURN_ETC),
                "},",
            ];
            break;
          case 1:
            var prop;
            do {
                prop = getDotKey();
            } while (name == prop);
            async = false;
            s = [
                "set " + name + "(" + createVarName(MANDATORY) + "){",
                strictMode(),
                defns(),
                _createStatements(2, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth),
                "this." + prop + createAssignment() + _createBinaryExpr(recurmax, COMMA_OK, stmtDepth, canThrow) + ";",
                "},",
            ];
            break;
          default:
            async = SUPPORT.async && rng(50) == 0;
            s = [
                (async ? "async " : "") + name + "(" + createParams(save_async, NO_DUPLICATE) + "){",
                strictMode(),
                defns(),
                _createStatements(3, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth),
                "},",
            ]
            break;
        }
    });
    async = save_async;
    VAR_NAMES.length = nameLenBefore;
    return filterDirective(s).join("\n");
}

function createObjectLiteral(recurmax, stmtDepth, canThrow) {
    recurmax--;
    var obj = ["({"];
    var offset = SUPPORT.spread_object ? 0 : SUPPORT.computed_key ? 2 : 4;
    for (var i = rng(6); --i >= 0;) switch (offset + rng(50 - offset)) {
      case 0:
        obj.push("..." + getVarName() + ",");
        break;
      case 1:
        obj.push("..." + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ",");
        break;
      case 2:
      case 3:
        obj.push(getVarName() + ",");
        break;
      case 4:
        obj.push(createObjectFunction(recurmax, stmtDepth, canThrow));
        break;
      default:
        obj.push(createObjectKey(recurmax, stmtDepth, canThrow) + ": " + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ",");
        break;
    }
    obj.push("})");
    return obj.join("\n");
}

function createNestedBinaryExpr(recurmax, noComma, stmtDepth, canThrow) {
    recurmax = 3; // note that this generates 2^recurmax expression parts... make sure to cap it
    return _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow);
}
function _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow) {
    return "(" + _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow)
        + createBinaryOp(noComma, canThrow) + _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ")";
}
function _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow) {
    // intentionally generate more hardcore ops
    if (--recurmax < 0) return createValue();
    var assignee, expr;
    switch (rng(30)) {
      case 0:
        return "(c = c + 1, " + _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ")";
      case 1:
        return "(" + createUnarySafePrefix() + "(" + _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + "))";
      case 2:
        assignee = getVarName(NO_CONST);
        return "(" + assignee + createAssignment() + _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ")";
      case 3:
        assignee = getVarName();
        switch (SUPPORT.destructuring ? rng(20) : 2) {
          case 0:
            expr = [
                "([ ",
                assignee,
                "[", createExpression(recurmax, COMMA_OK, stmtDepth, canThrow), "]",
                " ] = [ ",
                _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow),
                " ])",
            ].join("");
            break;
          case 1:
            var key1 = createObjectKey(recurmax, stmtDepth, canThrow);
            var key2 = /^\[/.test(key1) ? createObjectKey(recurmax, stmtDepth, canThrow) : key1;
            expr = [
                "({ ",
                key1, ": ", assignee,
                "[", createExpression(recurmax, COMMA_OK, stmtDepth, canThrow), "]",
                " } = { ",
                key2, ": ", _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow),
                " })",
            ].join("");
            break;
          default:
            expr = [
                "(",
                assignee,
                "[", createExpression(recurmax, COMMA_OK, stmtDepth, canThrow), "]",
                createAssignment(),
                _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow),
                ")",
            ].join("");
            break;
        }
        return canThrow && rng(10) == 0 ? expr : "(" + assignee + " && " + expr + ")";
      case 4:
        assignee = getVarName();
        switch (SUPPORT.destructuring ? rng(20) : 2) {
          case 0:
            expr = [
                "([ ",
                assignee,
                ".", getDotKey(true),
                " ] = [ ",
                _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow),
                " ])",
            ].join("");
            break;
          case 1:
            var key1 = createObjectKey(recurmax, stmtDepth, canThrow);
            var key2 = /^\[/.test(key1) ? createObjectKey(recurmax, stmtDepth, canThrow) : key1;
            expr = [
                "({ ",
                key1, ": ", assignee,
                ".", getDotKey(true),
                " } = { ",
                key2, ": ", _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow),
                " })",
            ].join("");
            break;
          default:
            expr = [
                "(",
                assignee,
                ".", getDotKey(true),
                createAssignment(),
                _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow),
                ")",
            ].join("");
            break;
        }
        return canThrow && rng(10) == 0 ? expr : "(" + assignee + " && " + expr + ")";
      default:
        return _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow);
    }
}

function createTypeofExpr(recurmax, stmtDepth, canThrow) {
    switch (rng(8)) {
      case 0:
        return "(typeof " + createVarName(MANDATORY, DONT_STORE) + ' === "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
      case 1:
        return "(typeof " + createVarName(MANDATORY, DONT_STORE) + ' !== "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
      case 2:
        return "(typeof " + createVarName(MANDATORY, DONT_STORE) + ' == "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
      case 3:
        return "(typeof " + createVarName(MANDATORY, DONT_STORE) + ' != "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
      case 4:
        return "(typeof " + createVarName(MANDATORY, DONT_STORE) + ")";
      default:
        return "(typeof " + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ")";
    }
}

function createValue() {
    return VALUES[rng(VALUES.length)];
}

function createBinaryOp(noComma, canThrow) {
    var op;
    do {
        op = BINARY_OPS[rng(BINARY_OPS.length)];
    } while (noComma && op == "," || !canThrow && op == " in ");
    return op;
}

function createAssignment() {
    return ASSIGNMENTS[rng(ASSIGNMENTS.length)];
}

function createUnarySafePrefix() {
    return UNARY_SAFE[rng(UNARY_SAFE.length)];
}

function createUnaryPrefix() {
    return UNARY_PREFIX[rng(UNARY_PREFIX.length)];
}

function createUnaryPostfix() {
    return UNARY_POSTFIX[rng(UNARY_POSTFIX.length)];
}

function addAvoidVar(name) {
    avoid_vars.push(name);
}

function removeAvoidVar(name) {
    var index = avoid_vars.lastIndexOf(name);
    if (index >= 0) avoid_vars.splice(index, 1);
}

function getVarName(noConst) {
    // try to get a generated name reachable from current scope. default to just `a`
    var name, tries = 10;
    do {
        if (--tries < 0) return "a";
        name = VAR_NAMES[INITIAL_NAMES_LEN + rng(VAR_NAMES.length - INITIAL_NAMES_LEN)];
    } while (!name || avoid_vars.indexOf(name) >= 0 || noConst && block_vars.indexOf(name) >= 0 || async && name == "await");
    return name;
}

function createVarName(maybe, dontStore) {
    if (!maybe || rng(2)) {
        var suffix = rng(3);
        var name;
        do {
            name = VAR_NAMES[rng(VAR_NAMES.length)];
            if (suffix) name += "_" + suffix;
        } while (unique_vars.indexOf(name) >= 0 || block_vars.indexOf(name) >= 0 || async && name == "await");
        if (!dontStore) VAR_NAMES.push(name);
        return name;
    }
    return "";
}

if (require.main !== module) {
    exports.createTopLevelCode = createTopLevelCode;
    exports.num_iterations = num_iterations;
    return;
}

function writeln(stream, msg) {
    if (typeof msg != "undefined") {
        stream.write(typeof msg == "string" ? msg : msg.stack || "" + msg);
    }
    stream.write("\n");
}

function println(msg) {
    writeln(process.stdout, msg);
}

function errorln(msg) {
    writeln(process.stderr, msg);
}

function try_beautify(code, toplevel, result, printfn, options) {
    var beautified = UglifyJS.minify(code, JSON.parse(beautify_options));
    if (beautified.error) {
        printfn("// !!! beautify failed !!!");
        printfn(beautified.error);
        beautified = null;
    } else if (!sandbox.same_stdout(sandbox.run_code(beautified.code, toplevel), result)) {
        beautified = null;
    } else if (options) {
        var uglified = UglifyJS.minify(beautified.code, JSON.parse(options));
        var expected, actual;
        if (typeof uglify_code != "string" || uglified.error) {
            expected = uglify_code;
            actual = uglified.error;
        } else {
            expected = uglify_result;
            actual = sandbox.run_code(uglified.code, toplevel);
        }
        if (!sandbox.same_stdout(expected, actual)) {
            beautified = null;
        }
    }
    if (beautified) {
        printfn("// (beautified)");
        printfn(beautified.code);
    } else {
        printfn("//");
        printfn(code);
    }
}

var default_options = UglifyJS.default_options();

function log_suspects(minify_options, component) {
    var options = component in minify_options ? minify_options[component] : true;
    if (!options) return;
    if (typeof options != "object") options = {};
    var defs = default_options[component];
    var toplevel = sandbox.has_toplevel(minify_options);
    var suspects = Object.keys(defs).filter(function(name) {
        var flip = name == "keep_fargs";
        if (flip !== (name in options ? options : defs)[name]) {
            var m = JSON.parse(JSON.stringify(minify_options));
            var o = JSON.parse(JSON.stringify(options));
            o[name] = flip;
            m[component] = o;
            m.validate = true;
            var result = UglifyJS.minify(original_code, m);
            if (typeof uglify_code != "string") {
                return !sandbox.same_stdout(uglify_code, result.error);
            } else if (result.error) {
                errorln("Error testing options." + component + "." + name);
                errorln(result.error);
            } else {
                var r = sandbox.run_code(result.code, toplevel);
                return !sandbox.same_stdout(uglify_result, r);
            }
        }
    });
    if (suspects.length > 0) {
        errorln("Suspicious " + component + " options:");
        suspects.forEach(function(name) {
            errorln("  " + name);
        });
        errorln();
    }
}

function log_suspects_global(options, toplevel) {
    var suspects = Object.keys(default_options).filter(function(component) {
      return typeof default_options[component] != "object";
    }).filter(function(component) {
        var m = JSON.parse(options);
        m[component] = false;
        m.validate = true;
        var result = UglifyJS.minify(original_code, m);
        if (typeof uglify_code != "string") {
            return !sandbox.same_stdout(uglify_code, result.error);
        } else if (result.error) {
            errorln("Error testing options." + component);
            errorln(result.error);
        } else {
            var r = sandbox.run_code(result.code, toplevel);
            return !sandbox.same_stdout(uglify_result, r);
        }
    });
    if (suspects.length > 0) {
        errorln("Suspicious options:");
        suspects.forEach(function(name) {
            errorln("  " + name);
        });
        errorln();
    }
}

function log(options) {
    var toplevel = sandbox.has_toplevel(JSON.parse(options));
    if (!ok) errorln("\n\n\n\n\n\n!!!!!!!!!!\n\n\n");
    errorln("//=============================================================");
    if (!ok) errorln("// !!!!!! Failed... round " + round);
    errorln("// original code");
    try_beautify(original_code, toplevel, original_result, errorln, options);
    errorln();
    errorln();
    errorln("//-------------------------------------------------------------");
    if (typeof uglify_code == "string") {
        errorln("// uglified code");
        try_beautify(uglify_code, toplevel, uglify_result, errorln);
        errorln();
        errorln();
        errorln("original result:");
        errorln(original_result);
        errorln("uglified result:");
        errorln(uglify_result);
    } else {
        errorln("// !!! uglify failed !!!");
        errorln(uglify_code);
        if (errored) {
            errorln();
            errorln();
            errorln("original stacktrace:");
            errorln(original_result);
        }
    }
    errorln("//-------------------------------------------------------------");
    if (!ok) {
        var reduce_options = JSON.parse(options);
        reduce_options.validate = true;
        var reduced = reduce_test(original_code, reduce_options, {
            verbose: false,
        }).code;
        if (reduced) {
            errorln();
            errorln("// reduced test case (output will differ)");
            errorln();
            errorln(reduced);
            errorln();
            errorln("//-------------------------------------------------------------");
        }
    }
    errorln("minify(options):");
    errorln(JSON.stringify(JSON.parse(options), null, 2));
    errorln();
    if (!ok) {
        Object.keys(default_options).filter(function(component) {
          var defs = default_options[component];
          return defs && typeof defs == "object";
        }).forEach(log_suspects.bind(null, JSON.parse(options)));
        log_suspects_global(options, toplevel);
        errorln("!!!!!! Failed... round " + round);
    }
}

function sort_globals(code) {
    var globals = sandbox.run_code("throw Object.keys(this).sort();" + code);
    return globals.length ? "var " + globals.map(function(name) {
        return name + "=" + name;
    }).join(",") + ";" + code : code;
}

function fuzzy_match(original, uglified) {
    uglified = uglified.split(" ");
    var i = uglified.length;
    original = original.split(" ", i);
    while (--i >= 0) {
        if (original[i] === uglified[i]) continue;
        var a = +original[i];
        var b = +uglified[i];
        if (Math.abs((b - a) / a) < 1e-10) continue;
        return false;
    }
    return true;
}

function patch_try_catch(orig, toplevel) {
    var stack = [ {
        code: orig,
        index: 0,
        offset: 0,
        tries: [],
    } ];
    var re = /(?:(?:^|[\s{}):;])try|}\s*catch\s*\(([^)[{]+)\)|}\s*finally)\s*(?={)/g;
    while (stack.length) {
        var code = stack[0].code;
        var offset = stack[0].offset;
        var tries = stack[0].tries;
        var match;
        re.lastIndex = stack.shift().index;
        while (match = re.exec(code)) {
            var index = match.index + match[0].length + 1;
            if (/(?:^|[\s{}):;])try\s*$/.test(match[0])) {
                tries.unshift({ try: index - offset });
                continue;
            }
            var insert;
            if (/}\s*finally\s*$/.test(match[0])) {
                tries.shift();
                insert = 'if (typeof UFUZZ_ERROR == "object") throw UFUZZ_ERROR;';
            } else {
                while (tries.length && tries[0].catch) tries.shift();
                tries[0].catch = index - offset;
                insert = [
                    "if (!" + match[1] + ".ufuzz_var) {",
                        match[1] + '.ufuzz_var = "' + match[1] + '";',
                        match[1] + ".ufuzz_try = " + tries[0].try + ";",
                        match[1] + ".ufuzz_catch = " + tries[0].catch + ";",
                        "UFUZZ_ERROR = " + match[1] + ";",
                    "}",
                    "throw " + match[1] + ";",
                ].join("\n");
            }
            var new_code = code.slice(0, index) + insert + code.slice(index);
            var result = sandbox.run_code(new_code, toplevel);
            if (typeof result != "object" || typeof result.name != "string" || typeof result.message != "string") {
                if (!stack.filled && match[1]) stack.push({
                    code: code,
                    index: index && index - 1,
                    offset: offset,
                    tries: JSON.parse(JSON.stringify(tries)),
                });
                offset += insert.length;
                code = new_code;
            } else if (result.name == "TypeError" && /'in'/.test(result.message)) {
                index = result.ufuzz_catch;
                return orig.slice(0, index) + result.ufuzz_var + ' = new Error("invalid `in`");' + orig.slice(index);
            } else if (result.name == "TypeError" && /not iterable/.test(result.message)) {
                index = result.ufuzz_catch;
                return orig.slice(0, index) + result.ufuzz_var + ' = new Error("spread not iterable");' + orig.slice(index);
            } else if (result.name == "RangeError" && result.message == "Maximum call stack size exceeded") {
                index = result.ufuzz_try;
                return orig.slice(0, index) + 'throw new Error("skipping infinite recursion");' + orig.slice(index);
            }
        }
        stack.filled = true;
    }
}

var beautify_options = {
    compress: false,
    mangle: false,
    output: {
        beautify: true,
        braces: true,
    },
};
var minify_options = require("./options.json");
if (typeof sandbox.run_code("A:if (0) B:; else B:;") != "string") {
    minify_options.forEach(function(o) {
        if (!("mangle" in o)) o.mangle = {};
        if (o.mangle) o.mangle.v8 = true;
    });
}
if (SUPPORT.destructuring && typeof sandbox.run_code("console.log([ 1 ], {} = 2);") != "string") {
    beautify_options.output.v8 = true;
    minify_options.forEach(function(o) {
        if (!("output" in o)) o.output = {};
        o.output.v8 = true;
    });
}
beautify_options = JSON.stringify(beautify_options);
minify_options = minify_options.map(JSON.stringify);
var original_code, original_result, errored;
var uglify_code, uglify_result, ok;
for (var round = 1; round <= num_iterations; round++) {
    process.stdout.write(round + " of " + num_iterations + "\r");

    original_code = createTopLevelCode();
    var orig_result = [ sandbox.run_code(original_code), sandbox.run_code(original_code, true) ];
    errored = typeof orig_result[0] != "string";
    if (errored) {
        println();
        println();
        println("//=============================================================");
        println("// original code");
        try_beautify(original_code, false, orig_result[0], println);
        println();
        println();
        println("original result:");
        println(orig_result[0]);
        println();
    }
    minify_options.forEach(function(options) {
        var o = JSON.parse(options);
        var toplevel = sandbox.has_toplevel(o);
        o.validate = true;
        uglify_code = UglifyJS.minify(original_code, o);
        original_result = orig_result[toplevel ? 1 : 0];
        if (!uglify_code.error) {
            uglify_code = uglify_code.code;
            uglify_result = sandbox.run_code(uglify_code, toplevel);
            ok = sandbox.same_stdout(original_result, uglify_result);
            // ignore declaration order of global variables
            if (!ok && !toplevel) {
                ok = sandbox.same_stdout(sandbox.run_code(sort_globals(original_code)), sandbox.run_code(sort_globals(uglify_code)));
            }
            // ignore numerical imprecision caused by `unsafe_math`
            if (!ok && o.compress && o.compress.unsafe_math && typeof original_result == "string" && typeof uglify_result == "string") {
                ok = fuzzy_match(original_result, uglify_result);
                if (!ok) {
                    var fuzzy_result = sandbox.run_code(original_code.replace(/( - 0\.1){3}/g, " - 0.3"), toplevel);
                    ok = sandbox.same_stdout(fuzzy_result, uglify_result);
                }
            }
            // ignore difference in error message caused by Temporal Dead Zone
            if (!ok && errored && uglify_result.name == "ReferenceError" && original_result.name == "ReferenceError") ok = true;
            // ignore spurious time-outs
            if (!ok && errored && /timed out/.test(original_result.message) && !/timed out/.test(uglify_result.message)) {
                if (!orig_result[toplevel ? 3 : 2]) orig_result[toplevel ? 3 : 2] = sandbox.run_code(original_code, toplevel, 10000);
                ok = sandbox.same_stdout(orig_result[toplevel ? 3 : 2], uglify_result);
            }
            // ignore difference in error message caused by `in`
            // ignore difference in error message caused by spread syntax
            // ignore difference in depth of termination caused by infinite recursion
            if (!ok) {
                var orig_skipped = patch_try_catch(original_code, toplevel);
                var uglify_skipped = patch_try_catch(uglify_code, toplevel);
                if (orig_skipped && uglify_skipped) {
                    ok = sandbox.same_stdout(sandbox.run_code(orig_skipped, toplevel), sandbox.run_code(uglify_skipped, toplevel));
                }
            }
        } else {
            uglify_code = uglify_code.error;
            ok = errored && uglify_code.name == original_result.name;
        }
        if (verbose || (verbose_interval && !(round % INTERVAL_COUNT)) || !ok) log(options);
        if (!ok && isFinite(num_iterations)) {
            println();
            process.exit(1);
        }
    });
}
println();
