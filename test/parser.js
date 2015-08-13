
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

    ok.throws(function () {
        // Note: this *is* a valid destructuring, but before we implement
        // destructuring (right now it's only destructuring *arguments*),
        // this won't do.
        UglifyJS.parse('[{a}]');
    });
}

// Run standalone
if (module.parent === null) {
    module.exports();
}

