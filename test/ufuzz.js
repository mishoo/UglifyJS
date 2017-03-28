// ufuzz.js
// derived from https://github.com/qfox/uglyfuzzer by Peter van der Zee
"use strict";

// workaround for tty output truncation upon process.exit()
[process.stdout, process.stderr].forEach(function(stream){
    if (stream._handle && stream._handle.setBlocking)
        stream._handle.setBlocking(true);
});

var vm = require("vm");
var minify = require("..").minify;

var MAX_GENERATED_FUNCTIONS_PER_RUN = 1;
var MAX_GENERATION_RECURSION_DEPTH = 15;
var INTERVAL_COUNT = 100;

var VALUES = [
  'true',
  'false',
  '22',
  '0',
  '-0', // 0/-0 !== 0
  '23..toString()',
  '24 .toString()',
  '25. ',
  '0x26.toString()',
  '(-1)',
  'NaN',
  'undefined',
  'Infinity',
  'null',
  '[]',
  '[,0][1]', // an array with elisions... but this is always false
  '([,0].length === 2)', // an array with elisions... this is always true
  '({})', // wrapped the object causes too many syntax errors in statements
  '"foo"',
  '"bar"' ];

var BINARY_OPS_NO_COMMA = [
  ' + ', // spaces needed to disambiguate with ++ cases (could otherwise cause syntax errors)
  ' - ',
  '/',
  '*',
  '&',
  '|',
  '^',
  '<<',
  '>>',
  '>>>',
  '%',
  '&&',
  '||',
  '^' ];

var BINARY_OPS = [','].concat(BINARY_OPS_NO_COMMA);

var ASSIGNMENTS = [
  '=',
  '=',
  '=',
  '=',
  '=',
  '=',

  '==',
  '!=',
  '===',
  '!==',
  '+=',
  '-=',
  '*=',
  '/=',
  '&=',
  '|=',
  '^=',
  '<<=',
  '>>=',
  '>>>=',
  '%=' ];

var UNARY_OPS = [
  '--',
  '++',
  '~',
  '!',
  'void ',
  'delete ', // should be safe, even `delete foo` and `delete f()` shouldn't crash
  ' - ',
  ' + ' ];

var NO_COMMA = true;
var MAYBE = true;
var NESTED = true;
var CAN_THROW = true;
var CANNOT_THROW = false;
var CAN_BREAK = true;
var CAN_CONTINUE = true;

var VAR_NAMES = [
  'foo',
  'bar',
  'a',
  'b',
  'undefined', // fun!
  'eval', // mmmm, ok, also fun!
  'NaN', // mmmm, ok, also fun!
  'Infinity', // the fun never ends!
  'arguments', // this one is just creepy
  'Math', // since Math is assumed to be a non-constructor/function it may trip certain cases
  'let' ]; // maybe omit this, it's more a parser problem than minifier

var TYPEOF_OUTCOMES = [
  'undefined',
  'string',
  'number',
  'object',
  'boolean',
  'special',
  'unknown',
  'symbol',
  'crap' ];

var FUNC_TOSTRING = [
    "Function.prototype.toString = function() {",
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
    ""
].join("\n");

function run_code(code) {
    var stdout = "";
    var original_write = process.stdout.write;
    process.stdout.write = function(chunk) {
        stdout += chunk;
    };
    try {
        new vm.Script(FUNC_TOSTRING + code).runInNewContext({
            console: {
                log: function() {
                    return console.log.apply(console, [].map.call(arguments, function(arg) {
                        return typeof arg == "function" ? "[Function]" : arg;
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
}

function rng(max) {
  return Math.floor(max * Math.random());
}

function createFunctionDecls(n, recurmax, nested) {
  if (--recurmax < 0) { return ';'; }
  var s = '';
  while (n-- > 0) {
    s += createFunctionDecl(recurmax, nested) + '\n';
  }
  return s;
}

var funcs = 0;
function createFunctionDecl(recurmax, nested) {
  if (--recurmax < 0) { return ';'; }
  var func = funcs++;
  var name = rng(5) > 0 ? 'f' + func : createVarName();
  if (name === 'a' || name === 'b') name = 'f' + func; // quick hack to prevent assignment to func names of being called
  if (!nested && name === 'undefined' || name === 'NaN' || name === 'Infinity') name = 'f' + func; // cant redefine these in global space
  var s = '';
  if (rng(5) === 1) {
    // functions with functions. lower the recursion to prevent a mess.
    s = 'function ' + name + '(){' + createFunctionDecls(rng(5) + 1, Math.ceil(recurmax / 2), NESTED) + '}\n';
  } else {
    // functions with statements
    s = 'function ' + name + '(){' + createStatements(3, recurmax) + '}\n';
  }

  if (nested) s = '!' + nested; // avoid "function statements" (decl inside statements)
  else s += name + '();'

  return s;
}

function createStatements(n, recurmax, canThrow, canBreak, canContinue) {
  if (--recurmax < 0) { return ';'; }
  var s = '';
  while (--n > 0) {
    s += createStatement(recurmax, canThrow, canBreak, canContinue);
  }
  return s;
}

var loops = 0;
function createStatement(recurmax, canThrow, canBreak, canContinue) {
  var loop = ++loops;
  if (--recurmax < 0) { return ';'; }
  switch (rng(16)) {
    case 0:
      return '{' + createStatements(rng(5) + 1, recurmax, canThrow, canBreak, canContinue) + '}';
    case 1:
      return 'if (' + createExpression(recurmax) + ')' + createStatement(recurmax, canThrow, canBreak, canContinue) + (rng(2) === 1 ? ' else ' + createStatement(recurmax, canThrow, canBreak, canContinue) : '');
    case 2:
      return '{var brake' + loop + ' = 5; do {' + createStatement(recurmax, canThrow, CAN_BREAK, CAN_CONTINUE) + '} while ((' + createExpression(recurmax) + ') && --brake' + loop + ' > 0);}';
    case 3:
      return '{var brake' + loop + ' = 5; while ((' + createExpression(recurmax) + ') && --brake' + loop + ' > 0)' + createStatement(recurmax, canThrow, CAN_BREAK, CAN_CONTINUE) + '}';
    case 4:
      return 'for (var brake' + loop + ' = 5; (' + createExpression(recurmax) + ') && brake' + loop + ' > 0; --brake' + loop + ')' + createStatement(recurmax, canThrow, CAN_BREAK, CAN_CONTINUE);
    case 5:
      return ';';
    case 6:
      return createExpression(recurmax) + ';';
    case 7:
      // note: case args are actual expressions
      // note: default does not _need_ to be last
      return 'switch (' + createExpression(recurmax) + ') { ' + createSwitchParts(recurmax, 4) + '}';
    case 8:
      return 'var ' + createVarName() + ';';
    case 9:
      // initializer can only have one expression
      return 'var ' + createVarName() + ' = ' + createExpression(recurmax, NO_COMMA) + ';';
    case 10:
      // initializer can only have one expression
      return 'var ' + createVarName() + ' = ' + createExpression(recurmax, NO_COMMA) + ', ' + createVarName() + ' = ' + createExpression(recurmax, NO_COMMA) + ';';
    case 11:
      if (canBreak && rng(5) === 0) return 'break;';
      if (canContinue && rng(5) === 0) return 'continue;';
      return 'return;';
    case 12:
      // must wrap in curlies to prevent orphaned `else` statement
      if (canThrow && rng(5) === 0) return '{ throw ' + createExpression(recurmax) + '}';
      return '{ return ' + createExpression(recurmax) + '}';
    case 13:
      // this is actually more like a parser test, but perhaps it hits some dead code elimination traps
      // must wrap in curlies to prevent orphaned `else` statement
      if (canThrow && rng(5) === 0) return '{ throw\n' + createExpression(recurmax) + '}';
      return '{ return\n' + createExpression(recurmax) + '}';
    case 14:
      // "In non-strict mode code, functions can only be declared at top level, inside a block, or ..."
      // (dont both with func decls in `if`; it's only a parser thing because you cant call them without a block)
      return '{' + createFunctionDecl(recurmax, NESTED) + '}';
    case 15:
      return ';';
      // catch var could cause some problems
      // note: the "blocks" are syntactically mandatory for try/catch/finally
      var s = 'try {' + createStatement(recurmax, CAN_THROW, canBreak, canContinue) + ' }';
      var n = rng(3); // 0=only catch, 1=only finally, 2=catch+finally
      if (n !== 1) s += ' catch (' + createVarName() + ') { ' + createStatements(3, recurmax, canBreak, canContinue) + ' }';
      if (n !== 0) s += ' finally { ' + createStatements(3, recurmax, canBreak, canContinue) + ' }';
      return s;
  }
}

function createSwitchParts(recurmax, n) {
  var hadDefault = false;
  var s = '';
  while (n-- > 0) {
    hadDefault = n > 0;
    if (hadDefault || rng(4) > 0) {
      s += '' +
        'case ' + createExpression(recurmax) + ':\n' +
            createStatements(rng(3) + 1, recurmax, CANNOT_THROW, CAN_BREAK) +
            '\n' +
            (rng(10) > 0 ? ' break;' : '/* fall-through */') +
        '\n';
    } else {
      hadDefault = true;
      s += '' +
        'default:\n' +
            createStatements(rng(3) + 1, recurmax, CANNOT_THROW, CAN_BREAK) +
        '\n';
    }
  }
  return s;
}

function createExpression(recurmax, noComma) {
  if (--recurmax < 0) {
    return createValue(); // note: should return a simple non-recursing expression value!
  }
  switch (rng(12)) {
    case 0:
      return '(' + createUnaryOp() + (rng(2) === 1 ? 'a' : 'b') + ')';
    case 1:
      return '(a' + (rng(2) == 1 ? '++' : '--') + ')';
    case 2:
      return '(b ' + createAssignment() + ' a)';
    case 3:
      return '(' + rng(2) + ' === 1 ? a : b)';
    case 4:
      return createExpression(recurmax, noComma) + createBinaryOp(noComma) + createExpression(recurmax, noComma);
    case 5:
      return createValue();
    case 6:
      return '(' + createExpression(recurmax) + ')';
    case 7:
      return createExpression(recurmax, noComma) + '?(' + createExpression(recurmax) + '):(' + createExpression(recurmax) + ')';
    case 8:
      switch(rng(4)) {
        case 0:
          return '(function ' + createVarName(MAYBE) + '(){' + createStatements(rng(5) + 1, recurmax) + '})()';
        case 1:
          return '+function ' + createVarName(MAYBE) + '(){' + createStatements(rng(5) + 1, recurmax) + '}';
        case 2:
          return '!function ' + createVarName(MAYBE) + '(){' + createStatements(rng(5) + 1, recurmax) + '}';
        case 3:
          return 'void function ' + createVarName(MAYBE) + '(){' + createStatements(rng(5) + 1, recurmax) + '}';
        default:
          return 'void function ' + createVarName(MAYBE) + '(){' + createStatements(rng(5) + 1, recurmax) + '}';
      }
    case 9:
      return createTypeofExpr(recurmax);
    case 10:
      // you could statically infer that this is just `Math`, regardless of the other expression
      // I don't think Uglify does this at this time...
      return ''+
        'new function(){ \n' +
        (rng(2) === 1 ? createExpression(recurmax) + '\n' : '') +
        'return Math;\n' +
      '}';
    case 11:
      // more like a parser test but perhaps comment nodes mess up the analysis?
      switch (rng(5)) {
        case 0:
          return '(a/* ignore */++)';
        case 1:
          return '(b/* ignore */--)';
        case 2:
          return '(++/* ignore */a)';
        case 3:
          return '(--/* ignore */b)';
        case 4:
          // only groups that wrap a single variable return a "Reference", so this is still valid.
          // may just be a parser edge case that is invisible to uglify...
          return '(--(b))';
        default:
          return '(--/* ignore */b)';
      }
  }
}

function createTypeofExpr(recurmax) {
  if (--recurmax < 0) {
    return 'typeof undefined === "undefined"';
  }

  switch (rng(5)) {
    case 0:
      return '(typeof ' + createVarName() + ' === "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
    case 1:
      return '(typeof ' + createVarName() + ' !== "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
    case 2:
      return '(typeof ' + createVarName() + ' == "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
    case 3:
      return '(typeof ' + createVarName() + ' != "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
    case 4:
      return '(typeof ' + createVarName() + ')';
  }
}

function createValue() {
  return VALUES[rng(VALUES.length)];
}

function createBinaryOp(noComma) {
  if (noComma) return BINARY_OPS_NO_COMMA[rng(BINARY_OPS_NO_COMMA.length)];
  return BINARY_OPS[rng(BINARY_OPS.length)];
}

function createAssignment() {
  return ASSIGNMENTS[rng(ASSIGNMENTS.length)];
}

function createUnaryOp() {
  return UNARY_OPS[rng(UNARY_OPS.length)];
}

function createVarName(maybe) {
  if (!maybe || rng(2) === 1) {
    return VAR_NAMES[rng(VAR_NAMES.length)] + (rng(5) > 0 ? ++loops : '');
  }
  return '';
}

function log(ok) {
    console.log("//=============================================================");
    if (!ok) console.log("// !!!!!! Failed...");
    console.log("// original code");
    console.log("//");
    console.log(original_code);
    console.log();
    console.log();
    console.log("//-------------------------------------------------------------");
    console.log("// original code (beautify'd)");
    console.log("//");
    console.log(beautify_code);
    console.log();
    console.log();
    console.log("//-------------------------------------------------------------");
    console.log("// uglified code");
    console.log("//");
    console.log(uglify_code);
    console.log();
    console.log();
    console.log("original result:");
    console.log(original_result);
    console.log("beautified result:");
    console.log(beautify_result);
    console.log("uglified result:");
    console.log(uglify_result);
    if (!ok) console.log("!!!!!! Failed...");
}

var num_iterations = +process.argv[2] || 1/0;
var verbose = process.argv[3] === 'v' || process.argv[2] === 'v';
var verbose_interval = process.argv[3] === 'V' || process.argv[2] === 'V';
for (var round = 0; round < num_iterations; round++) {
    var parse_error = false;
    process.stdout.write(round + " of " + num_iterations + "\r");
    var original_code = [
        "var a = 100, b = 10;",
        createFunctionDecls(rng(MAX_GENERATED_FUNCTIONS_PER_RUN) + 1, MAX_GENERATION_RECURSION_DEPTH),
        "console.log(a, b);"
    ].join("\n");
    var original_result = run_code(original_code);

    try {
        var beautify_code = minify(original_code, {
            fromString: true,
            mangle: false,
            compress: false,
            output: {
                beautify: true,
                bracketize: true,
            },
        }).code;
    } catch(e) {
        parse_error = 1;
    }
    var beautify_result = run_code(beautify_code);

    try {
      var uglify_code = minify(beautify_code, {
          fromString: true,
          mangle: true,
          compress: {
              passes: 3,
          },
          output: {
              //beautify: true,
              //bracketize: true,
          },
      }).code;
    } catch(e) {
        parse_error = 2;
    }
    var uglify_result = run_code(uglify_code);

    var ok = !parse_error && original_result == beautify_result && original_result == uglify_result;
    if (verbose || (verbose_interval && !(round % INTERVAL_COUNT)) || !ok) log(ok);
    if (parse_error === 1) console.log('Parse error while beautifying');
    if (parse_error === 2) console.log('Parse error while uglifying');
    if (!ok) break;
}
