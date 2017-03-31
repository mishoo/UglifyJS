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

var vm = require("vm");
var minify = require("..").minify;

var MAX_GENERATED_TOPLEVELS_PER_RUN = 3;
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
var enable_beautifier = false; // run beautifier as well?
for (var i = 2; i < process.argv.length; ++i) {
    switch (process.argv[i]) {
        case '-v':
            verbose = true;
            break;
        case '-V':
            verbose_interval = true;
            break;
        case '-b':
            enable_beautifier = true;
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
        case '-?':
            console.log('** UglifyJS fuzzer help **');
            console.log('Valid options (optional):');
            console.log('<number>: generate this many cases (if used must be first arg)');
            console.log('-v: print every generated test case');
            console.log('-V: print every 100th generated test case');
            console.log('-b: also run beautifier');
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
            if (i > 2 || !parseInt(process.argv[i], 10)) throw new Error('Unknown argument[' + process.argv[i] + ']; see -? for help');
    }
}

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
    'foo',
    'bar',
    'a',
    'b',
    'c', // prevent redeclaring this, avoid assigning to this
    'undefined', // fun!
    'eval', // mmmm, ok, also fun!
    'NaN', // mmmm, ok, also fun!
    'Infinity', // the fun never ends!
    'arguments', // this one is just creepy
    'Math', // since Math is assumed to be a non-constructor/function it may trip certain cases
    'parseInt',
    'parseFloat',
    'isNaN',
    'isFinite',
    'decodeURI',
    'decodeURIComponent',
    'encodeURI',
    'encodeURIComponent',
    'Object',
    'let' ]; // maybe omit this, it's more a parser problem than minifier
var INITIAL_NAMES_LEN = VAR_NAMES.length;

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
    ""
].join("\n");
var loops = 0;
var funcs = 0;

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
                        return typeof arg == "function" ? arg.toString() : arg;
                    }));
                }
            }
        }, { timeout: 30000 });
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

function createTopLevelCodes(n) {
    var s = '';
    while (n-- > 0) {
        s += createTopLevelCode() + '\n\n//$$$$$$$$$$$$$$\n\n';
    }
    return s;
}

function createTopLevelCode() {
    var r = rng(3);
    if (r > 0) return createFunctions(rng(MAX_GENERATED_TOPLEVELS_PER_RUN) + 1, MAX_GENERATION_RECURSION_DEPTH, IN_GLOBAL, ANY_TYPE, CANNOT_THROW, 0);
    return createStatements(3, MAX_GENERATION_RECURSION_DEPTH, CANNOT_THROW, CANNOT_BREAK, CANNOT_CONTINUE, CANNOT_RETURN, 0, IN_GLOBAL);
}

function createFunctions(n, recurmax, inGlobal, noDecl, canThrow, stmtDepth) {
    if (--recurmax < 0) { return ';'; }
    var s = '';
    while (n-- > 0) {
        s += createFunction(recurmax, inGlobal, noDecl, canThrow, stmtDepth) + '\n';
    }
    return s;
}

function createFunction(recurmax, inGlobal, noDecl, canThrow, stmtDepth) {
    if (--recurmax < 0) { return ';'; }
    if (!STMT_COUNT_FROM_GLOBAL) stmtDepth = 0;
    var func = funcs++;
    var namesLenBefore = VAR_NAMES.length;
    var name = (inGlobal || rng(5) > 0) ? 'f' + func : createVarName(MANDATORY, inGlobal, noDecl);
    if (name === 'a' || name === 'b' || name === 'c') name = 'f' + func; // quick hack to prevent assignment to func names of being called
    var s = '';
    if (rng(5) === 1) {
        // functions with functions. lower the recursion to prevent a mess.
        s = 'function ' + name + '(' + createVarName(MANDATORY, inGlobal) + '){' + createFunctions(rng(5) + 1, Math.ceil(recurmax * 0.7), NOT_GLOBAL, ANY_TYPE, canThrow, stmtDepth) + '}\n';
    } else {
        // functions with statements
        s = 'function ' + name + '(' + createVarName(MANDATORY, inGlobal) + '){' + createStatements(3, recurmax, canThrow, CANNOT_THROW, CANNOT_CONTINUE, CAN_RETURN, stmtDepth, inGlobal, NOT_GLOBAL) + '}\n';
    }

    VAR_NAMES.length = namesLenBefore;

    if (noDecl) s = '!' + s + '(' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ')';
    // avoid "function statements" (decl inside statements)
    else if (inGlobal || rng(10) > 0) s += name + '();'


    return s;
}

function createStatements(n, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) {
    if (--recurmax < 0) { return ';'; }
    var s = '';
    while (--n > 0) {
        s += createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) + '\n';
    }
    return s;
}

function createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) {
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
            return '{' + createStatements(rng(5) + 1, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) + '}';
        case STMT_IF_ELSE:
            return 'if (' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ')' + createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) + (rng(2) === 1 ? ' else ' + createStatement(recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) : '');
        case STMT_DO_WHILE:
            return '{var brake' + loop + ' = 5; do {' + createStatement(recurmax, canThrow, CAN_BREAK, CAN_CONTINUE, cannotReturn, stmtDepth, inGlobal) + '} while ((' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ') && --brake' + loop + ' > 0);}';
        case STMT_WHILE:
            return '{var brake' + loop + ' = 5; while ((' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ') && --brake' + loop + ' > 0)' + createStatement(recurmax, canThrow, CAN_BREAK, CAN_CONTINUE, cannotReturn, stmtDepth, inGlobal) + '}';
        case STMT_FOR_LOOP:
            return 'for (var brake' + loop + ' = 5; (' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ') && brake' + loop + ' > 0; --brake' + loop + ')' + createStatement(recurmax, canThrow, CAN_BREAK, CAN_CONTINUE, cannotReturn, stmtDepth, inGlobal);
        case STMT_SEMI:
            return ';';
        case STMT_EXPR:
            return createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ';';
        case STMT_SWITCH:
            // note: case args are actual expressions
            // note: default does not _need_ to be last
            return 'switch (' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ') { ' + createSwitchParts(recurmax, 4, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) + '}';
        case STMT_VAR:
            switch (rng(3)) {
                case 0:
                    var name = createVarName(MANDATORY, inGlobal);
                    if (name === 'c') name = 'a';
                    return 'var ' + name + ';';
                case 1:
                    // initializer can only have one expression
                    var name = createVarName(MANDATORY, inGlobal);
                    if (name === 'c') name = 'b';
                    return 'var ' + name + ' = ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
                default:
                    // initializer can only have one expression
                    var n1 = createVarName(MANDATORY, inGlobal);
                    if (n1 === 'c') n1 = 'b';
                    var n2 = createVarName(MANDATORY, inGlobal);
                    if (n2 === 'c') n2 = 'b';
                    return 'var ' + n1 + ' = ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ', ' + n2 + ' = ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
            }
        case STMT_RETURN_ETC:
            switch (rng(3)) {
                case 1:
                    if (canBreak && rng(5) === 0) return 'break;';
                    if (canContinue && rng(5) === 0) return 'continue;';
                    if (cannotReturn) return createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
                    return '/*3*/return;';
                case 2:
                    // must wrap in curlies to prevent orphaned `else` statement
                    if (canThrow && rng(5) === 0) return '{ throw ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + '}';
                    if (cannotReturn) return createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
                    return '{ /*1*/ return ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + '}';
                default:
                    // this is actually more like a parser test, but perhaps it hits some dead code elimination traps
                    // must wrap in curlies to prevent orphaned `else` statement
                    // note: you can't `throw` without an expression so don't put a `throw` option in this case
                    if (cannotReturn) return createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ';';
                    return '{ /*2*/ return\n' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + '}';
            }
        case STMT_FUNC_EXPR:
            // "In non-strict mode code, functions can only be declared at top level, inside a block, or ..."
            // (dont both with func decls in `if`; it's only a parser thing because you cant call them without a block)
            return '{' + createFunction(recurmax, NOT_GLOBAL, NO_DECL, canThrow, stmtDepth) + '}';
        case STMT_TRY:
            // catch var could cause some problems
            // note: the "blocks" are syntactically mandatory for try/catch/finally
            var n = rng(3); // 0=only catch, 1=only finally, 2=catch+finally
            var s = 'try {' + createStatement(recurmax, n === 1 ? CANNOT_THROW : CAN_THROW, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) + ' }';
            if (n !== 1) {
                // the catch var should only be accessible in the catch clause...
                // we have to do go through some trouble here to prevent leaking it
                var nameLenBefore = VAR_NAMES.length;
                var catchName = createVarName(MANDATORY);
                var freshCatchName = VAR_NAMES.length !== nameLenBefore;
                s += ' catch (' + catchName + ') { ' + createStatements(3, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) + ' }';
                if (freshCatchName) VAR_NAMES.splice(nameLenBefore, 1); // remove catch name
            }
            if (n !== 0) s += ' finally { ' + createStatements(3, recurmax, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) + ' }';
            return s;
        case STMT_C:
            return 'c = c + 1;';
        default:
            throw 'no';
    }
}

function createSwitchParts(recurmax, n, canThrow, canBreak, canContinue, cannotReturn, stmtDepth, inGlobal) {
    var hadDefault = false;
    var s = '';
    while (n-- > 0) {
        //hadDefault = n > 0; // disables weird `default` clause positioning (use when handling destabilizes)
        if (hadDefault || rng(5) > 0) {
            s += '' +
                'case ' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ':\n' +
                createStatements(rng(3) + 1, recurmax, canThrow, CAN_BREAK, canContinue, cannotReturn, stmtDepth, inGlobal) +
                '\n' +
                (rng(10) > 0 ? ' break;' : '/* fall-through */') +
                '\n';
        } else {
            hadDefault = true;
            s += '' +
                'default:\n' +
                createStatements(rng(3) + 1, recurmax, canThrow, CAN_BREAK, canContinue, cannotReturn, stmtDepth, inGlobal) +
                '\n';
        }
    }
    return s;
}

function createExpression(recurmax, noComma, stmtDepth, canThrow) {
    if (--recurmax < 0) {
        return '(c = 1 + c, ' + createNestedBinaryExpr(recurmax, noComma) + ')'; // note: should return a simple non-recursing expression value!
    }
    // since `a` and `b` are our canaries we want them more frequently than other expressions (1/3rd chance of a canary)
    var r = rng(6);
    if (r < 1) return 'a++ + ' + _createExpression(recurmax, noComma, stmtDepth, canThrow);
    if (r < 2) return '(--b) + ' + _createExpression(recurmax, noComma, stmtDepth, canThrow);
    if (r < 3) return '(c = c + 1) + ' + _createExpression(recurmax, noComma, stmtDepth, canThrow); // c only gets incremented

    return _createExpression(recurmax, noComma, stmtDepth, canThrow);
}
function _createExpression(recurmax, noComma, stmtDepth, canThrow) {
    switch (rng(13)) {
        case 0:
            return createUnaryOp() + (rng(2) === 1 ? 'a' : 'b');
        case 1:
            return 'a' + (rng(2) == 1 ? '++' : '--');
        case 2:
            // parens needed because assignments aren't valid unless they're the left-most op(s) in an expression
            return '(b ' + createAssignment() + ' a)';
        case 3:
            return rng(2) + ' === 1 ? a : b';
        case 4:
            return createNestedBinaryExpr(recurmax, noComma) + createBinaryOp(noComma) + createExpression(recurmax, noComma, stmtDepth, canThrow);
        case 5:
            return createValue();
        case 6:
            return '(' + createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + ')';
        case 7:
            return createExpression(recurmax, noComma, stmtDepth, canThrow) + '?' + createExpression(recurmax, NO_COMMA, stmtDepth, canThrow) + ':' + createExpression(recurmax, noComma, stmtDepth, canThrow);
        case 8:
            var nameLenBefore = VAR_NAMES.length;
            var name = createVarName(MAYBE, NOT_GLOBAL); // note: this name is only accessible from _within_ the function. and immutable at that.
            if (name === 'c') name = 'a';
            var s = '';
            switch(rng(4)) {
                case 0:
                    s = '(function ' + name + '(){' + createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth, NOT_GLOBAL) + '})()';
                    break;
                case 1:
                    s = '+function ' + name + '(){' + createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth, NOT_GLOBAL) + '}()';
                    break;
                case 2:
                    s = '!function ' + name + '(){' + createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth, NOT_GLOBAL) + '}()';
                    break;
                default:
                    s = 'void function ' + name + '(){' + createStatements(rng(5) + 1, recurmax, canThrow, CANNOT_BREAK, CANNOT_CONTINUE, CAN_RETURN, stmtDepth, NOT_GLOBAL) + '}()';
                    break;
            }
            VAR_NAMES.length = nameLenBefore;
            return s;
        case 9:
            return createTypeofExpr();
        case 10:
            // you could statically infer that this is just `Math`, regardless of the other expression
            // I don't think Uglify does this at this time...
            return ''+
                'new function(){ \n' +
                (rng(2) === 1 ? createExpression(recurmax, COMMA_OK, stmtDepth, canThrow) + '\n' : '') +
                'return Math;\n' +
                '}';
        case 11:
            // more like a parser test but perhaps comment nodes mess up the analysis?
            // note: parens not needed for post-fix (since that's the default when ambiguous)
            // for prefix ops we need parens to prevent accidental syntax errors.
            switch (rng(6)) {
                case 0:
                    return 'a/* ignore */++';
                case 1:
                    return 'b/* ignore */--';
                case 2:
                    return '(++/* ignore */a)';
                case 3:
                    return '(--/* ignore */b)';
                case 4:
                    // only groups that wrap a single variable return a "Reference", so this is still valid.
                    // may just be a parser edge case that is invisible to uglify...
                    return '(--(b))';
                case 5:
                    // classic 0.3-0.1 case; 1-0.1-0.1-0.1 is not 0.7 :)
                    return 'b + 1-0.1-0.1-0.1';
                default:
                    return '(--/* ignore */b)';
            }
        case 12:
            return createNestedBinaryExpr(recurmax, noComma);
    }
}

function createNestedBinaryExpr(recurmax, noComma) {
    recurmax = 3; // note that this generates 2^recurmax expression parts... make sure to cap it
    return _createSimpleBinaryExpr(recurmax, noComma);
}
function _createSimpleBinaryExpr(recurmax, noComma) {
    // intentionally generate more hardcore ops
    if (--recurmax < 0) return createValue();
    var r = rng(30);
    if (r === 0) return '(c = c + 1, ' + _createSimpleBinaryExpr(recurmax, noComma) + ')'
    var s = _createSimpleBinaryExpr(recurmax, noComma) + createBinaryOp(noComma) + _createSimpleBinaryExpr(recurmax, noComma);
    if (r === 1) {
        // try to get a generated name reachable from current scope. default to just `a`
        var assignee = VAR_NAMES[INITIAL_NAMES_LEN + rng(VAR_NAMES.length - INITIAL_NAMES_LEN)] || 'a';
        return '( ' + assignee + createAssignment() + s + ')';
    }
    return s;
}

function createTypeofExpr() {
    switch (rng(5)) {
        case 0:
            return 'typeof ' + createVarName(MANDATORY, NOT_GLOBAL, DONT_STORE) + ' === "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '"';
        case 1:
            return 'typeof ' + createVarName(MANDATORY, NOT_GLOBAL, DONT_STORE) + ' !== "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '"';
        case 2:
            return 'typeof ' + createVarName(MANDATORY, NOT_GLOBAL, DONT_STORE) + ' == "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '"';
        case 3:
            return 'typeof ' + createVarName(MANDATORY, NOT_GLOBAL, DONT_STORE) + ' != "' + TYPEOF_OUTCOMES[rng(TYPEOF_OUTCOMES.length)] + '"';
        case 4:
            return 'typeof ' + createVarName(MANDATORY, NOT_GLOBAL, DONT_STORE);
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

function createVarName(maybe, inGlobal, dontStore) {
    if (!maybe || rng(2) === 1) {
        do {
            var r = rng(VAR_NAMES.length);
            var suffixed = rng(5) > 0;
            var name = VAR_NAMES[r] + (suffixed ? '_' + (++loops) : '');
        } while (inGlobal && (name === 'NaN' || name === 'undefined' || name === 'Infinity')); // prevent nodejs module strict mode problems
        if (!dontStore && suffixed) VAR_NAMES.push(name);
        return name;
    }
    return '';
}

function log(ok) {
    if (!ok) console.log('\n\n\n\n\n\n!!!!!!!!!!\n\n\n');
    console.log("//=============================================================");
    if (!ok) console.log("// !!!!!! Failed... round", round);
    console.log("// original code");
    console.log("//");
    console.log(original_code);
    console.log();
    console.log();
    if (enable_beautifier) {
        console.log("//-------------------------------------------------------------");
        console.log("// original code (beautify'd)");
        console.log("//");
        console.log(beautify_code);
        console.log();
        console.log();
    }
    console.log("//-------------------------------------------------------------");
    console.log("// uglified code");
    console.log("//");
    console.log(uglify_code);
    console.log();
    console.log();
    console.log("original result:");
    console.log(original_result);
    if (enable_beautifier) {
        console.log("beautified result:");
        console.log(beautify_result);
    }
    console.log("uglified result:");
    console.log(uglify_result);
    if (!ok) console.log("!!!!!! Failed... round", round);
}

for (var round = 0; round < num_iterations; round++) {
    var parse_error = false;
    process.stdout.write(round + " of " + num_iterations + "\r");

    VAR_NAMES.length = INITIAL_NAMES_LEN; // prune any previous names still in the list
    loops = 0;
    funcs = 0;

    var original_code = [
        "var a = 100, b = 10, c = 0;",
        createTopLevelCodes(rng(MAX_GENERATED_TOPLEVELS_PER_RUN) + 1) +
        "console.log(null, a, b, c);" // the array makes for a cleaner output (empty string still shows up etc)
    ].join("\n");
    var original_result = run_code(original_code);

    if (enable_beautifier) {
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
    } else {
        var beautify_result = original_result;
    }

    try {
      var uglify_code = minify(original_code, {
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
    //if (!ok && typeof original_result === 'string' && original_result.indexOf('[Function:') >= 0) ok = true;
    if (verbose || (verbose_interval && !(round % INTERVAL_COUNT)) || !ok) log(ok);
    if (parse_error === 1) console.log('Parse error while beautifying');
    if (parse_error === 2) console.log('Parse error while uglifying');
    if (!ok) break;
}
