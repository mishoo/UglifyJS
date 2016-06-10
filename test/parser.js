
var UglifyJS = require("..");
var ok = require('assert');

module.exports = function () {
    console.log("--- Parser tests");

    // Destructuring arguments

    // Function argument nodes are correct
    function get_args(args) {
        return args.map(function (arg) {
            return [arg.TYPE, arg.name];
        });
    }

    // Destructurings as arguments
    var destr_fun1 = UglifyJS.parse('(function ({a, b}) {})').body[0].body;
    var destr_fun2 = UglifyJS.parse('(function ([a, [b]]) {})').body[0].body;
    
    ok.equal(destr_fun1.argnames.length, 1);
    ok.equal(destr_fun2.argnames.length, 1);

    var destr_fun1 = UglifyJS.parse('({a, b}) => null').body[0].body;
    var destr_fun2 = UglifyJS.parse('([a, [b]]) => null').body[0].body;
    
    ok.equal(destr_fun1.argnames.length, 1);
    ok.equal(destr_fun2.argnames.length, 1);

    var destruct1 = destr_fun1.argnames[0];
    var destruct2 = destr_fun2.argnames[0];

    ok(destruct1 instanceof UglifyJS.AST_Destructuring);
    ok(destruct2 instanceof UglifyJS.AST_Destructuring);
    ok(destruct2.names[1] instanceof UglifyJS.AST_Destructuring);

    ok.equal(destruct1.start.value, '{');
    ok.equal(destruct1.end.value, '}');
    ok.equal(destruct2.start.value, '[');
    ok.equal(destruct2.end.value, ']');

    ok.equal(destruct1.is_array, false);
    ok.equal(destruct2.is_array, true);

    var aAndB = [
        ['SymbolFunarg', 'a'],
        ['SymbolFunarg', 'b']
    ];

    ok.deepEqual(
        [
            destruct1.names[0].TYPE,
            destruct1.names[0].name],
        aAndB[0]);

    ok.deepEqual(
        [
            destruct2.names[1].names[0].TYPE,
            destruct2.names[1].names[0].name
        ],
        aAndB[1]);

    ok.deepEqual(
        get_args(destr_fun1.args_as_names()),
        aAndB)
    ok.deepEqual(
        get_args(destr_fun2.args_as_names()),
        aAndB)

    // Making sure we don't accidentally accept things which
    // Aren't argument destructurings

    ok.throws(function () {
        UglifyJS.parse('(function ([]) {})');
    }, /Invalid destructuring function parameter/);

    ok.throws(function () {
        UglifyJS.parse('(function ( { a, [ b ] } ) { })')
    });

    ok.throws(function () {
        UglifyJS.parse('(function (1) { })');
    }, /Invalid function parameter/);

    ok.throws(function () {
        UglifyJS.parse('(function (this) { })');
    });

    ok.throws(function () {
        UglifyJS.parse('(function ([1]) { })');
    }, /Invalid function parameter/);

    ok.throws(function () {
        UglifyJS.parse('(function [a] { })');
    });

    // Destructuring variable declaration

    var decls = UglifyJS.parse('var {a,b} = foo, { c, d } = bar');

    ok.equal(decls.body[0].TYPE, 'Var');
    ok.equal(decls.body[0].definitions.length, 2);
    ok.equal(decls.body[0].definitions[0].name.TYPE, 'Destructuring');
    ok.equal(decls.body[0].definitions[0].value.TYPE, 'SymbolRef');

    var nested_def = UglifyJS.parse('var [{x}] = foo').body[0].definitions[0];

    ok.equal(nested_def.name.names[0].names[0].TYPE, 'SymbolVar');
    ok.equal(nested_def.name.names[0].names[0].name, 'x');

    var holey_def = UglifyJS.parse('const [,,third] = [1,2,3]').body[0].definitions[0];

    ok.equal(holey_def.name.names[0].TYPE, 'Hole');
    ok.equal(holey_def.name.names[2].TYPE, 'SymbolConst');

    var expanding_def = UglifyJS.parse('var [first, ...rest] = [1,2,3]').body[0].definitions[0];

    ok.equal(expanding_def.name.names[0].TYPE, 'SymbolVar');
    ok.equal(expanding_def.name.names[1].TYPE, 'Expansion');
    ok.equal(expanding_def.name.names[1].expression.TYPE, 'SymbolVar');

    // generators
    var generators_def = UglifyJS.parse('function* fn() {}').body[0];
    ok.equal(generators_def.is_generator, true);

    ok.throws(function () {
        UglifyJS.parse('function* (){ }');
    });

    var generators_yield_def = UglifyJS.parse('function* fn() {\nyield remote();\}').body[0].body[0];
    ok.strictEqual(generators_yield_def.body.is_star, false);
}

// Run standalone
if (module.parent === null) {
    module.exports();
}

