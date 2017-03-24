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

function run_code(code) {
    var stdout = "";
    var original_write = process.stdout.write;
    process.stdout.write = function(chunk) {
        stdout += chunk;
    };
    try {
        new vm.Script(code).runInNewContext({ console: console }, { timeout: 5000 });
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

function createFunctionDecls(n, recurmax) {
  if (--recurmax < 0) { return ';'; }
  var s = '';
  while (--n > 0) {
    s += createFunctionDecl(recurmax) + '\n';
  }
  return s;
}

var funcs = 0;
function createFunctionDecl(recurmax) {
  if (--recurmax < 0) { return ';'; }
  var func = funcs++;
  return 'function f' + func + '(){' + createStatements(3, recurmax) + '}\nf' + func + '();';
}

function createStatements(n, recurmax) {
  if (--recurmax < 0) { return ';'; }
  var s = '';
  while (--n > 0) {
    s += createStatement(recurmax);
  }
  return s;
}

var loops = 0;
function createStatement(recurmax) {
  var loop = ++loops;
  if (--recurmax < 0) { return ';'; }
  switch (rng(7)) {
    case 0:
      return '{' + createStatement(recurmax) + '}';
    case 1:
      return 'if (' + createExpression(recurmax) + ')' + createStatement(recurmax);
    case 2:
      return '{var brake' + loop + ' = 5; do {' + createStatement(recurmax) + '} while ((' + createExpression(recurmax) + ') && --brake' + loop + ' > 0);}';
    case 3:
      return '{var brake' + loop + ' = 5; while ((' + createExpression(recurmax) + ') && --brake' + loop + ' > 0)' + createStatement(recurmax) + '}';
    case 4:
      return 'for (var brake' + loop + ' = 5; (' + createExpression(recurmax) + ') && brake' + loop + ' > 0; --brake' + loop + ')' + createStatement(recurmax);
    case 5:
      return ';';
    case 6:
      return createExpression() + ';';
  }
}

function createExpression(recurmax) {
  if (--recurmax < 0) { return '0'; }
  switch (rng(8)) {
    case 0:
      return '(' + createUnaryOp() + 'a)';
    case 1:
      return '(a' + (Math.random() > 0.5 ? '++' : '--') + ')';
    case 2:
      return '(b ' + createAssignment() + ' a)';
    case 3:
      return '(' + Math.random() + ' > 0.5 ? a : b)';
    case 4:
      return createExpression(recurmax) + createBinaryOp() + createExpression(recurmax);
    case 5:
      return createValue();
    case 6:
      return '(' + createExpression(recurmax) + ')';
    case 7:
      return createExpression(recurmax) + '?(' + createExpression(recurmax) + '):(' + createExpression(recurmax) + ')';
  }
}

function createValue() {
  var values = [
    'true',
    'false',
    '22',
    '0',
    '(-1)',
    'NaN',
    'undefined',
    'null',
    '"foo"',
    '"bar"' ];
  return values[rng(values.length)];
}

function createBinaryOp() {
  switch (rng(6)) {
    case 0:
      return '+';
    case 1:
      return '-';
    case 2:
      return ',';
    case 3:
      return '&&';
    case 4:
      return '||';
    case 5:
      return '^';
  }
}

function createAssignment() {
  switch (rng(4)) {
    case 0:
      return '=';
    case 1:
      return '-=';
    case 2:
      return '^=';
    case 3:
      return '+=';
  }
}

function createUnaryOp() {
  switch (rng(4)) {
    case 0:
      return '--';
    case 1:
      return '++';
    case 2:
      return '~';
    case 3:
      return '!';
  }
}

function log() {
    console.log("//=============================================================");
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
}

var num_iterations = +process.argv[2] || 1/0;
var verbose = !!process.argv[3];
for (var round = 0; round < num_iterations; round++) {
    process.stdout.write(round + " of " + num_iterations + "\r");
    var original_code = [
        "var a = 100, b = 10;",
        createFunctionDecls(rng(3) + 1, 10),
        "console.log(a, b);"
    ].join("\n");
    var beautify_code = minify(original_code, {
        fromString: true,
        mangle: false,
        compress: false,
        output: {
            beautify: true,
            bracketize: true,
        },
    }).code;

    var uglify_code = minify(beautify_code, {
        fromString: true,
        mangle: false,
        compress: {
            passes: 3,
        },
        output: {
            beautify: true,
            bracketize: true,
        },
    }).code;

    var original_result = run_code(original_code);
    var beautify_result = run_code(beautify_code);
    var uglify_result = run_code(uglify_code);
    var ok = original_result == beautify_result && original_result == uglify_result;
    if (verbose || !ok) log();
    if (!ok) process.exit(1);
}
