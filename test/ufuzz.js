// ufuzz.js
// derived from https://github.com/qfox/uglyfuzzer by Peter van der Zee
"use strict";

// check both cli and file modes of nodejs (!). See #1695 for details. and the various settings of uglify.
// bin/uglifyjs s.js -c && bin/uglifyjs s.js -c passes=3 && bin/uglifyjs s.js -c passes=3 -m
// cat s.js | node && node s.js && bin/uglifyjs s.js -c | node && bin/uglifyjs s.js -c passes=3 | node && bin/uglifyjs s.js -c passes=3 -m | node

// workaround for tty output truncation upon process.exit()
[process.stdout, process.stderr].forEach(function(stream){
    if (stream._handle && stream._handle.setBlocking)
        stream._handle.setBlocking(true);
});

var UglifyJS = require("..");
var randomBytes = require("crypto").randomBytes;
var sandbox = require("./sandbox");

var MAX_GENERATED_TOPLEVELS_PER_RUN = 1;
var MAX_GENERATION_RECURSION_DEPTH = 12;
var INTERVAL_COUNT = 100;

var STMT_BLOCK = 0;
var STMT_IF_ELSE = 1;
var STMT_DO_WHILE = 2;
var STMT_WHILE = 3;
var STMT_FOR_LOOP = 4;
var STMT_SEMI = 5;
var STMT_EXPR = 6;
var STMT_SWITCH = 7;
var STMT_VAR = 8;
var STMT_RETURN_ETC = 9;
var STMT_FUNC_EXPR = 10;
var STMT_TRY = 11;
var STMT_C = 12;
var STMTS_TO_USE = [
    STMT_BLOCK,
    STMT_IF_ELSE,
    STMT_DO_WHILE,
    STMT_WHILE,
    STMT_FOR_LOOP,
    STMT_SEMI,
    STMT_EXPR,
    STMT_SWITCH,
    STMT_VAR,
    STMT_RETURN_ETC,
    STMT_FUNC_EXPR,
    STMT_TRY,
    STMT_C,
];
var STMT_ARG_TO_ID = {
    block: STMT_BLOCK,
    ifelse: STMT_IF_ELSE,
    dowhile: STMT_DO_WHILE,
    while: STMT_WHILE,
    forloop: STMT_FOR_LOOP,
    semi: STMT_SEMI,
    expr: STMT_EXPR,
    switch: STMT_SWITCH,
    var: STMT_VAR,
    stop: STMT_RETURN_ETC,
    funcexpr: STMT_FUNC_EXPR,
    try: STMT_TRY,
    c: STMT_C,
};

var STMT_FIRST_LEVEL_OVERRIDE = -1;
var STMT_SECOND_LEVEL_OVERRIDE = -1;
var STMT_COUNT_FROM_GLOBAL = true; // count statement depth from nearest function scope or just global scope?

var num_iterations = +process.argv[2] || 1/0;
var verbose = false; // log every generated test
var verbose_interval = false; // log every 100 generated tests
var verbose_error = false;
for (var i = 2; i < process.argv.length; ++i) {
    switch (process.argv[i]) {
      case '-v':
        verbose = true;
        break;
      case '-V':
        verbose_interval = true;
        break;
      case '-E':
        verbose_error = true;
        break;
      case '-t':
        MAX_GENERATED_TOPLEVELS_PER_RUN = +process.argv[++i];
        if (!MAX_GENERATED_TOPLEVELS_PER_RUN) throw new Error('Must generate at least one toplevel per run');
        break;
      case '-r':
        MAX_GENERATION_RECURSION_DEPTH = +process.argv[++i];
        if (!MAX_GENERATION_RECURSION_DEPTH) throw new Error('Recursion depth must be at least 1');
        break;
      case '-s1':
        var name = process.argv[++i];
        STMT_FIRST_LEVEL_OVERRIDE = STMT_ARG_TO_ID[name];
        if (!(STMT_FIRST_LEVEL_OVERRIDE >= 0)) throw new Error('Unknown statement name; use -? to get a list');
        break;
      case '-s2':
        var name = process.argv[++i];
        STMT_SECOND_LEVEL_OVERRIDE = STMT_ARG_TO_ID[name];
        if (!(STMT_SECOND_LEVEL_OVERRIDE >= 0)) throw new Error('Unknown statement name; use -? to get a list');
        break;
      case '--stmt-depth-from-func':
        STMT_COUNT_FROM_GLOBAL = false;
        break;
      case '--only-stmt':
        STMTS_TO_USE = process.argv[++i].split(',').map(function(name){ return STMT_ARG_TO_ID[name]; });
        break;
      case '--without-stmt':
        // meh. it runs once it's fine.
        process.argv[++i].split(',').forEach(function(name){
            var omit = STMT_ARG_TO_ID[name];
            STMTS_TO_USE = STMTS_TO_USE.filter(function(id){ return id !== omit; })
        });
        break;
      case '--help':
      case '-h':
      case '-?':
        console.log('** UglifyJS fuzzer help **');
        console.log('Valid options (optional):');
        console.log('<number>: generate this many cases (if used must be first arg)');
        console.log('-v: print every generated test case');
        console.log('-V: print every 100th generated test case');
        console.log('-E: print generated test case with runtime error');
        console.log('-t <int>: generate this many toplevels per run (more take longer)');
        console.log('-r <int>: maximum recursion depth for generator (higher takes longer)');
        console.log('-s1 <statement name>: force the first level statement to be this one (see list below)');
        console.log('-s2 <statement name>: force the second level statement to be this one (see list below)');
        console.log('--stmt-depth-from-func: reset statement depth counter at each function, counts from global otherwise');
        console.log('--only-stmt <statement names>: a comma delimited white list of statements that may be generated');
        console.log('--without-stmt <statement names>: a comma delimited black list of statements never to generate');
        console.log('List of accepted statement names: ' + Object.keys(STMT_ARG_TO_ID));
        console.log('** UglifyJS fuzzer exiting **');
        return 0;
      default:
        // first arg may be a number.
        if (i > 2 || !parseInt(process.argv[i], 10)) throw new Error('Unknown argument[' + process.argv[i] + ']; see -h for help');
    }
}

var VALUES = [
    '""',
    'true',
    'false',
    ' /[a2][^e]+$/ ',
    '(-1)',
    '(-2)',
    '(-3)',
    '(-4)',
    '(-5)',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '22',
    '-0', // 0/-0 !== 0
    '23..toString()',
    '24 .toString()',
    '25. ',
    '0x26.toString()',
    'NaN',
    'undefined',
    'Infinity',
    'null',
    '[]',
    '[,0][1]', // an array with elisions... but this is always false
    '([,0].length === 2)', // an array with elisions... this is always true
    '({})', // wrapped the object causes too many syntax errors in statements
    '"foo"',
    '"bar"',
    '"undefined"',
    '"object"',
    '"number"',
    '"function"',
];

var BINARY_OPS_NO_COMMA = [
    ' + ', // spaces needed to disambiguate with ++ cases (could otherwise cause syntax errors)
    ' - ',
    '/',
    '*',
    '&',
    '|',
    '^',
    '<',
    '<=',
    '>',
    '>=',
    '==',
    '===',
    '!=',
    '!==',
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

var UNARY_SAFE = [
    '+',
    '-',
    '~',
    '!',
    'void ',
    'delete ',
];
var UNARY_POSTFIX = [
    '++',
    '--',
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
var NOT_GLOBAL = true;
var IN_GLOBAL = true;
var ANY_TYPE = false;
var NO_DECL = true;
var DONT_STORE = true;

var VAR_NAMES = [
    'a',
    'a',
    'a',
    'a',
    'b',
    'b',
    'b',
    'b',
    'c', // prevent redeclaring this, avoid assigning to this
    'foo',
    'foo',
    'bar',
    'bar',
    'undefined',
    'NaN',
    'Infinity',
    'arguments',
    'Math',
    'parseInt',
];
var INITIAL_NAMES_LEN = VAR_NAMES.length;

var TYPEOF_OUTCOMES = [
    'function',
    'undefined',
    'string',
    'number',
    'object',
    'boolean',
    'special',
    'unknown',
    'symbol',
    'crap' ];

var loops = 0;
var funcs = 0;

function rng(max) {
    var r = randomBytes(2).readUInt16LE(0) / 65536;
    return Math.floor(max * r);
}

function createTopLevelCode() {
    if (rng(2) === 0) return createStatements(3, MAX_GENERATION_RECURSION_DEPTH, CANNOT_THROW, CANNOT_BREAK, CANNOT_CONTINUE, CANNOT_RETURN, 0);
    return createFunctions(rng(MAX_GENERATED_TOPLEVELS_PER_RUN) + 1, MAX_GENERATION_RECURSION_DEPTH, IN_GLOBAL, ANY_TYPE, CANNOT_THROW, 0);
}

function createFunctions(n, recurmax, inGlobal, noDecl, canThrow, stmtDepth) {
    if (--recurmax < 0) { return ';'; }
    var s = '';
    while (n-- > 0) {
        s += createFunction(recurmax, inGlobal, noDecl, canThrow, stmtDepth) + '\n';
    }
    return s;
}

function createParams() {
    var params = [];
    for (var n = rng(4); --n >= 0;) {
        params.push(createVarName(MANDATORY));
    }
    return params.join(', ');
}

function createArgs() {
    var args = [];
    for (var n = rng(4); --n >= 0;) {
        args.push(createValue());
    }
    return args.join(', ');
}

function createFunction(recurmax, inGlobal, noDecl, canThrow, stmtDepth) {
    if (--recurmax < 0) { return ';'; }
    if (!STMT_COUNT_FROM_GLOBAL) stmtDepth = 0;
    var func = funcs++;
    var namesLenBefore = VAR_NAMES.length;
    var name = (inGlobal || rng(5) > 0) ? 'f' + func : createVarName(MANDATORY, noDecl);
    if (name === 'a' || name === 'b' || name === 'c') name = 'f' + func; // quick hack to prevent assignment to func names of being called
    var s = '';
    if (rng(5) === 0) {
        // functions with functions. lower the recursion to prevent a mess.
        s = 'function ' + name + '(' + createParams() + '){' + createFunctions(rng(5) + 1, Math.ceil(recurmax * 0.7), NOT_GLOBAL, ANY_TYPE, canThrow, stmtDepth) + '}\n';
    } else {
        // functions with statements
        s = 'function ' + name + '(' + createParams() + '){' + createStatements(3, recurmax, canThrow, CANNOT_THROW, CANNOT_CONTINUE, CAN_RETURN, stmtDepth) + '}\n';
    }

    VAR_NAMES.length = namesLenBefore;

    if (noDecl) s = 'var ' + createVarName(MANDATORY) + ' = ' + s + '(' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ');';
    // avoid "function statements" (decl inside statements)
    else if (inGlobal || rng(10) > 0) s += 'var ' + createVarName(MANDATORY) + ' = ' + name + '(' + createArgs() + ');';


    return s;
}

function createStatements(n, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) {
    if (--recurmax < 0) { return ';'; }
    var s = '';
    while (--n > 0) {
        s += createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + '\n';
    }
    return s;
}

function createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) {
    ++stmtDepth;
    var loop = ++loops;
    if (--recurmax < 0) {
        return createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ';';
    }

    // allow to forcefully generate certain structures at first or second recursion level
    var target = 0;
    if (stmtDepth === 1 && STMT_FIRST_LEVEL_OVERRIDE >= 0) target = STMT_FIRST_LEVEL_OVERRIDE;
    else if (stmtDepth === 2 && STMT_SECOND_LEVEL_OVERRIDE >= 0) target = STMT_SECOND_LEVEL_OVERRIDE;
    else target = STMTS_TO_USE[rng(STMTS_TO_USE.length)];

    switch (target) {
      case STMT_BLOCK:
        return '{' + createStatements(rng(5) + 1, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + '}';
      case STMT_IF_ELSE:
        return 'if (' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ')' + createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + (rng(2) === 1 ? ' else ' + createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) : '');
      case STMT_DO_WHILE:
        return '{var brake' + loop + ' = 5; do {' + createStatement(recurmax, canThrow, CAN_BREAK, CAN_CONTINUE, cannotReturn, stmtDepth) + '} while ((' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ') && --brake' + loop + ' > 0);}';
      case STMT_WHILE:
        return '{var brake' + loop + ' = 5; while ((' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ') && --brake' + loop + ' > 0)' + createStatement(recurmax, canThrow, CAN_BREAK, CAN_CONTINUE, cannotReturn, stmtDepth) + '}';
      case STMT_FOR_LOOP:
        return 'for (var brake' + loop + ' = 5; (' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ') && brake' + loop + ' > 0; --brake' + loop + ')' + createStatement(recurmax, canThrow, CAN_BREAK, CAN_CONTINUE, cannotReturn, stmtDepth);
      case STMT_SEMI:
        return ';';
      case STMT_EXPR:
        return createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ';';
      case STMT_SWITCH:
        // note: case args are actual expressions
        // note: default does not _need_ to be last
        return 'switch (' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ') { ' + createSwitchParts(recurmax, 4, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + '}';
      case STMT_VAR:
        switch (rng(3)) {
          case 0:
            var name = createVarName(MANDATORY);
            if (name === 'c') name = 'a';
            return 'var ' + name + ';';
          case 1:
            // initializer can only have one expression
            var name = createVarName(MANDATORY);
            if (name === 'c') name = 'b';
            return 'var ' + name + ' = ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
          default:
            // initializer can only have one expression
            var n1 = createVarName(MANDATORY);
            if (n1 === 'c') n1 = 'b';
            var n2 = createVarName(MANDATORY);
            if (n2 === 'c') n2 = 'b';
            return 'var ' + n1 + ' = ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ', ' + n2 + ' = ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
        }
      case STMT_RETURN_ETC:
        switch (rng(8)) {
          case 0:
          case 1:
          case 2:
          case 3:
            if (canBreak && rng(5) === 0) return 'break;';
            if (canContinue && rng(5) === 0) return 'continue;';
            if (cannotReturn) return createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
            if (rng(3) == 0) return '/*3*/return;';
            return 'return ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
          case 4:
            // this is actually more like a parser test, but perhaps it hits some dead code elimination traps
            // must wrap in curlies to prevent orphaned `else` statement
            // note: you can't `throw` without an expression so don't put a `throw` option in this case
            if (cannotReturn) return createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
            return '{ /*2*/ return\n' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + '}';
          default:
            // must wrap in curlies to prevent orphaned `else` statement
            if (canThrow && rng(5) === 0) return '{ throw ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + '}';
            if (cannotReturn) return createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
            return '{ return ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + '}';
        }
      case STMT_FUNC_EXPR:
        // "In non-strict mode code, functions can only be declared at top level, inside a block, or ..."
        // (dont both with func decls in `if`; it's only a parser thing because you cant call them without a block)
        return '{' + createFunction(recurmax, NOT_GLOBAL, NO_DECL, canThrow, stmtDepth) + '}';
      case STMT_TRY:
        // catch var could cause some problems
        // note: the "blocks" are syntactically mandatory for try/catch/finally
        var n = rng(3); // 0=only catch, 1=only finally, 2=catch+finally
        var s = 'try {' + createStatement(recurmax, n === 1 ? CANNOT_THROW : CAN_THROW, canBreak, canContinue, cannotReturn, stmtDepth) + ' }';
        if (n !== 1) {
            // the catch var should only be accessible in the catch clause...
            // we have to do go through some trouble here to prevent leaking it
            var nameLenBefore = VAR_NAMES.length;
            var catchName = createVarName(MANDATORY);
            var freshCatchName = VAR_NAMES.length !== nameLenBefore;
            s += ' catch (' + catchName + ') { ' + createStatements(3, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + ' }';
            if (freshCatchName) VAR_NAMES.splice(nameLenBefore, 1); // remove catch name
        }
        if (n !== 0) s += ' finally { ' + createStatements(3, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) + ' }';
        return s;
      case STMT_C:
        return 'c = c + 1;';
      default:
        throw 'no';
    }
}

function createSwitchParts(recurmax, n, canThrow, canBreak, canContinue, cannotReturn, stmtDepth) {
    var hadDefault = false;
    var s = '';
    while (n-- > 0) {
        //hadDefault = n > 0; // disables weird `default` clause positioning (use when handling destabilizes)
        if (hadDefault || rng(5) > 0) {
            s += '' +
                'case ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ':\n' +
                createStatements(rng(3) + 1, recurmax, canThrow, CAN_BREAK, canContinue, cannotReturn, stmtDepth) +
                '\n' +
                (rng(10) > 0 ? ' break;' : '/* fall-through */') +
                '\n';
        } else {
            hadDefault = true;
            s += '' +
                'default:\n' +
                createStatements(rng(3) + 1, recurmax, canThrow, CAN_BREAK, canContinue, cannotReturn, stmtDepth) +
                '\n';
        }
    }
    return s;
}

function createExpression(recurmax, noComma, stmtDepth, canThrow) {
    if (--recurmax < 0) {
        return '(c = 1 + c, ' + createNestedBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ')'; // note: should return a simple non-recursing expression value!
    }
    // since `a` and `b` are our canaries we want them more frequently than other expressions (1/3rd chance of a canary)
    switch (rng(6)) {
      case 0:
        return '(a++ + (' + _createExpression(recurmax, noComma, stmtDepth, canThrow) + '))';
      case 1:
        return '((--b) + (' + _createExpression(recurmax, noComma, stmtDepth, canThrow) + '))';
      case 2:
        return '((c = c + 1) + (' + _createExpression(recurmax, noComma, stmtDepth, canThrow) + '))'; // c only gets incremented
      default:
        return '(' + _createExpression(recurmax, noComma, stmtDepth, canThrow) + ')';
    }
}
function _createExpression(recurmax, noComma, stmtDepth, canThrow) {
    var p = 0;
    switch (rng(_createExpression.N)) {
      case p++:
      case p++:
        return createUnaryPrefix() + (rng(2) === 1 ? 'a' : 'b');
      case p++:
      case p++:
        return (rng(2) === 1 ? 'a' : 'b') + createUnaryPostfix();
      case p++:
      case p++:
        // parens needed because assignments aren't valid unless they're the left-most op(s) in an expression
        return 'b ' + createAssignment() + ' a';
      case p++:
      case p++:
        return rng(2) + ' === 1 ? a : b';
      case p++:
      case p++:
        return createValue();
      case p++:
        return createExpression(recurmax, COMMA_OK, stmtDepth, canThrow);
      case p++:
        return createExpression(recurmax, noComma, stmtDepth, canThrow) + '?' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ':' + createExpression(recurmax, noComma, stmtDepth, canThrow);
      case p++:
        var nameLenBefore = VAR_NAMES.length;
        var name = createVarName(MAYBE); // note: this name is only accessible from _within_ the function. and immutable at that.
        if (name === 'c') name = 'a';
        var s = '';
        switch(rng(4)) {
          case 0:
            s = '(function ' + name + '(){' + createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth) + '})()';
            break;
          case 1:
            s = '+function ' + name + '(){' + createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth) + '}()';
            break;
          case 2:
            s = '!function ' + name + '(){' + createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth) + '}()';
            break;
          default:
            s = 'void function ' + name + '(){' + createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth) + '}()';
            break;
        }
        VAR_NAMES.length = nameLenBefore;
        return s;
      case p++:
      case p++:
        return createTypeofExpr(recurmax, stmtDepth, canThrow);
      case p++:
        return [
            'new function() {',
            rng(2) ? '' : createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ';',
            'return ' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ';',
            '}'
        ].join('\n');
      case p++:
      case p++:
        // more like a parser test but perhaps comment nodes mess up the analysis?
        // note: parens not needed for post-fix (since that's the default when ambiguous)
        // for prefix ops we need parens to prevent accidental syntax errors.
        switch (rng(6)) {
          case 0:
            return 'a/* ignore */++';
          case 1:
            return 'b/* ignore */--';
          case 2:
            return '++/* ignore */a';
          case 3:
            return '--/* ignore */b';
          case 4:
            // only groups that wrap a single variable return a "Reference", so this is still valid.
            // may just be a parser edge case that is invisible to uglify...
            return '--(b)';
          case 5:
            // classic 0.3-0.1 case; 1-0.1-0.1-0.1 is not 0.7 :)
            return 'b + 1-0.1-0.1-0.1';
          default:
            return '--/* ignore */b';
        }
      case p++:
      case p++:
        return createNestedBinaryExpr(recurmax, noComma, stmtDepth, canThrow);
      case p++:
      case p++:
        return createUnarySafePrefix() + '(' + createNestedBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ')';
      case p++:
        return " ((" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ") || a || 3).toString() ";
      case p++:
        return " /[abc4]/.test(((" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ") || b || 5).toString()) ";
      case p++:
        return " ((" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) +
            ") || " + rng(10) + ").toString()[" +
            createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + "] ";
      case p++:
        return createArrayLiteral(recurmax, COMMA_OK, stmtDepth, canThrow);
      case p++:
        return createObjectLiteral(recurmax, COMMA_OK, stmtDepth, canThrow);
      case p++:
        return createArrayLiteral(recurmax, COMMA_OK, stmtDepth, canThrow) + '[' +
            createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ']';
      case p++:
        return createObjectLiteral(recurmax, COMMA_OK, stmtDepth, canThrow) + '[' +
            createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ']';
      case p++:
        return createArrayLiteral(recurmax, COMMA_OK, stmtDepth, canThrow) + '.' + getDotKey();
      case p++:
        return createObjectLiteral(recurmax, COMMA_OK, stmtDepth, canThrow) + '.' + getDotKey();
      case p++:
        var name = getVarName();
        return name + ' && ' + name + '[' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ']';
      case p++:
        var name = getVarName();
        return name + ' && ' + name + '.' + getDotKey();
    }
    _createExpression.N = p;
    return _createExpression(recurmax, noComma, stmtDepth, canThrow);
}

function createArrayLiteral(recurmax, noComma, stmtDepth, canThrow) {
    recurmax--;
    var arr = "[";
    for (var i = rng(6); --i >= 0;) {
        // in rare cases produce an array hole element
        var element = rng(20) ? createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) : "";
        arr += element + ", ";
    }
    return arr + "]";
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

function getDotKey() {
    return SAFE_KEYS[rng(SAFE_KEYS.length)];
}

function createObjectLiteral(recurmax, noComma, stmtDepth, canThrow) {
    recurmax--;
    var obj = "({";
    for (var i = rng(6); --i >= 0;) {
        var key = KEYS[rng(KEYS.length)];
        obj += key + ":(" + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + "), ";
    }
    return obj + "})";
}

function createNestedBinaryExpr(recurmax, noComma, stmtDepth, canThrow) {
    recurmax = 3; // note that this generates 2^recurmax expression parts... make sure to cap it
    return _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow);
}
function _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow) {
    return '(' + _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow)
        + createBinaryOp(noComma) + _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ')';
}
function _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow) {
    // intentionally generate more hardcore ops
    if (--recurmax < 0) return createValue();
    switch (rng(30)) {
      case 0:
        return '(c = c + 1, ' + _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ')';
      case 1:
        return '(' + createUnarySafePrefix() + '(' + _createSimpleBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + '))';
      case 2:
        var assignee = getVarName();
        return '(' + assignee + createAssignment() + _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ')';
      case 3:
        var assignee = getVarName();
        var expr = '(' + assignee + '[' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow)
            + ']' + createAssignment() + _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ')';
        return canThrow && rng(10) == 0 ? expr : '(' + assignee + ' && ' + expr + ')';
      case 4:
        var assignee = getVarName();
        var expr = '(' + assignee + '.' + getDotKey() + createAssignment()
            + _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow) + ')';
        return canThrow && rng(10) == 0 ? expr : '(' + assignee + ' && ' + expr + ')';
      default:
        return _createBinaryExpr(recurmax, noComma, stmtDepth, canThrow);
    }
}

function createTypeofExpr(recurmax, stmtDepth, canThrow) {
    switch (rng(8)) {
      case 0:
        return '(typeof ' + createVarName(MANDATORY, DONT_STORE) + ' === "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
      case 1:
        return '(typeof ' + createVarName(MANDATORY, DONT_STORE) + ' !== "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
      case 2:
        return '(typeof ' + createVarName(MANDATORY, DONT_STORE) + ' == "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
      case 3:
        return '(typeof ' + createVarName(MANDATORY, DONT_STORE) + ' != "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '")';
      case 4:
        return '(typeof ' + createVarName(MANDATORY, DONT_STORE) + ')';
      default:
        return '(typeof ' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ')';
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

function createUnarySafePrefix() {
    return UNARY_SAFE[rng(UNARY_SAFE.length)];
}

function createUnaryPrefix() {
    return UNARY_PREFIX[rng(UNARY_PREFIX.length)];
}

function createUnaryPostfix() {
    return UNARY_POSTFIX[rng(UNARY_POSTFIX.length)];
}

function getVarName() {
    // try to get a generated name reachable from current scope. default to just `a`
    return VAR_NAMES[INITIAL_NAMES_LEN + rng(VAR_NAMES.length - INITIAL_NAMES_LEN)] || 'a';
}

function createVarName(maybe, dontStore) {
    if (!maybe || rng(2)) {
        var name = VAR_NAMES[rng(VAR_NAMES.length)];
        var suffix = rng(3);
        if (suffix) {
            name += '_' + suffix;
            if (!dontStore) VAR_NAMES.push(name);
        }
        return name;
    }
    return '';
}

function try_beautify(code, result) {
    try {
        var beautified = UglifyJS.minify(code, {
            fromString: true,
            compress: false,
            mangle: false,
            output: {
                beautify: true,
                bracketize: true,
            },
        }).code;
        if (sandbox.same_stdout(sandbox.run_code(beautified), result)) {
            console.log("// (beautified)");
            console.log(beautified);
            return;
        }
    } catch (e) {
        console.log("// !!! beautify failed !!!");
        console.log(e.stack);
    }
    console.log("//");
    console.log(code);
}

function infer_options(ctor) {
    try {
        ctor({ 0: 0 });
    } catch (e) {
        return e.defs;
    }
}

var default_options = {
    compress: infer_options(UglifyJS.Compressor),
    mangle: {
        "cache": null,
        "eval": false,
        "keep_fnames": false,
        "screw_ie8": true,
        "toplevel": false,
    },
    output: infer_options(UglifyJS.OutputStream),
};

function log_suspects(minify_options, component) {
    var options = component in minify_options ? minify_options[component] : true;
    if (!options) return;
    options = UglifyJS.defaults(options, default_options[component]);
    var suspects = Object.keys(default_options[component]).filter(function(name) {
        if (options[name]) {
            var m = JSON.parse(JSON.stringify(minify_options));
            var o = JSON.parse(JSON.stringify(options));
            o[name] = false;
            m[component] = o;
            try {
                var r = sandbox.run_code(UglifyJS.minify(original_code, m).code);
                return sandbox.same_stdout(original_result, r);
            } catch (e) {
                console.log("Error testing options." + component + "." + name);
                console.log(e);
            }
        }
    });
    if (suspects.length > 0) {
        console.log("Suspicious", component, "options:");
        suspects.forEach(function(name) {
            console.log("  " + name);
        });
        console.log();
    }
}

function log(options) {
    if (!ok) console.log('\n\n\n\n\n\n!!!!!!!!!!\n\n\n');
    console.log("//=============================================================");
    if (!ok) console.log("// !!!!!! Failed... round", round);
    console.log("// original code");
    try_beautify(original_code, original_result);
    console.log();
    console.log();
    console.log("//-------------------------------------------------------------");
    if (typeof uglify_code == "string") {
        console.log("// uglified code");
        try_beautify(uglify_code, uglify_result);
        console.log();
        console.log();
        console.log("original result:");
        console.log(original_result);
        console.log("uglified result:");
        console.log(uglify_result);
    } else {
        console.log("// !!! uglify failed !!!");
        console.log(uglify_code.stack);
    }
    console.log("minify(options):");
    options = JSON.parse(options);
    console.log(options);
    console.log();
    if (!ok) {
        Object.keys(default_options).forEach(log_suspects.bind(null, options));
        console.log("!!!!!! Failed... round", round);
    }
}

var minify_options = require("./ufuzz.json").map(function(options) {
    options.fromString = true;
    return JSON.stringify(options);
});
var original_code, original_result;
var uglify_code, uglify_result, ok;
for (var round = 1; round <= num_iterations; round++) {
    process.stdout.write(round + " of " + num_iterations + "\r");

    VAR_NAMES.length = INITIAL_NAMES_LEN; // prune any previous names still in the list
    loops = 0;
    funcs = 0;

    original_code = [
        "var a = 100, b = 10, c = 0;",
        createTopLevelCode(),
        "console.log(null, a, b, c);" // preceding `null` makes for a cleaner output (empty string still shows up etc)
    ].join("\n");

    minify_options.forEach(function(options) {
        try {
            uglify_code = UglifyJS.minify(original_code, JSON.parse(options)).code;
        } catch (e) {
            uglify_code = e;
        }

        ok = typeof uglify_code == "string";
        if (ok) {
            original_result = sandbox.run_code(original_code);
            uglify_result = sandbox.run_code(uglify_code);
            ok = sandbox.same_stdout(original_result, uglify_result);
        }
        if (verbose || (verbose_interval && !(round % INTERVAL_COUNT)) || !ok) log(options);
        else if (verbose_error && typeof original_result != "string") {
            console.log("//=============================================================");
            console.log("// original code");
            try_beautify(original_code, original_result);
            console.log();
            console.log();
            console.log("original result:");
            console.log(original_result);
            console.log();
        }
        if (!ok && isFinite(num_iterations)) {
            console.log();
            process.exit(1);
        }
    });
}
console.log();
