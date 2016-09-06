var assert = require("assert");
var uglify = require("../../");

describe("Function", function() {
    it ("Should parse binding patterns correctly", function() {
        // Function argument nodes are correct
        function get_args(args) {
            return args.map(function (arg) {
                return [arg.TYPE, arg.name];
            });
        }

        // Destructurings as arguments
        var destr_fun1 = uglify.parse('(function ({a, b}) {})').body[0].body;
        var destr_fun2 = uglify.parse('(function ([a, [b]]) {})').body[0].body;
        var destr_fun3 = uglify.parse('({a, b}) => null').body[0].body;
        var destr_fun4 = uglify.parse('([a, [b]]) => null').body[0].body;

        assert.equal(destr_fun1.argnames.length, 1);
        assert.equal(destr_fun2.argnames.length, 1);
        assert.equal(destr_fun3.argnames.length, 1);
        assert.equal(destr_fun4.argnames.length, 1);

        var destruct1 = destr_fun1.argnames[0];
        var destruct2 = destr_fun2.argnames[0];
        var destruct3 = destr_fun3.argnames[0];
        var destruct4 = destr_fun4.argnames[0];

        assert(destruct1 instanceof uglify.AST_Destructuring);
        assert(destruct2 instanceof uglify.AST_Destructuring);
        assert(destruct3 instanceof uglify.AST_Destructuring);
        assert(destruct4 instanceof uglify.AST_Destructuring);
        assert(destruct2.names[1] instanceof uglify.AST_Destructuring);
        assert(destruct4.names[1] instanceof uglify.AST_Destructuring);

        assert.equal(destruct1.start.value, '{');
        assert.equal(destruct1.end.value, '}');
        assert.equal(destruct2.start.value, '[');
        assert.equal(destruct2.end.value, ']');
        assert.equal(destruct3.start.value, '{');
        assert.equal(destruct3.end.value, '}');
        assert.equal(destruct4.start.value, '[');
        assert.equal(destruct4.end.value, ']');

        assert.equal(destruct1.is_array, false);
        assert.equal(destruct2.is_array, true);
        assert.equal(destruct3.is_array, false);
        assert.equal(destruct4.is_array, true);

        var aAndB = [
            ['SymbolFunarg', 'a'],
            ['SymbolFunarg', 'b']
        ];

        assert.deepEqual(
            [
                destruct1.names[0].TYPE,
                destruct1.names[0].name
            ],
            aAndB[0]);
        assert.deepEqual(
            [
                destruct1.names[1].TYPE,
                destruct1.names[1].name
            ],
            aAndB[1]);
        assert.deepEqual(
            [
                destruct2.names[0].TYPE,
                destruct2.names[0].name
            ],
            aAndB[0]);
        assert.deepEqual(
            [
                destruct2.names[1].names[0].TYPE,
                destruct2.names[1].names[0].name
            ],
            aAndB[1]);
        assert.strictEqual(typeof destruct3.names[0].key, "string");
        assert.strictEqual(destruct3.names[0].key, "a");
        assert.strictEqual(typeof destruct3.names[1].key, "string");
        assert.strictEqual(destruct3.names[1].key, "b");
        assert.deepEqual(
            [
                destruct4.names[0].TYPE,
                destruct4.names[0].name
            ],
            aAndB[0]);
        assert.deepEqual(
            [
                destruct4.names[1].names[0].TYPE,
                destruct4.names[1].names[0].name
            ],
            aAndB[1]);

        assert.deepEqual(
            get_args(destr_fun1.args_as_names()),
            aAndB);
        assert.deepEqual(
            get_args(destr_fun2.args_as_names()),
            aAndB);
        assert.deepEqual(
            get_args(destr_fun3.args_as_names()),
            aAndB);
        assert.deepEqual(
            get_args(destr_fun4.args_as_names()),
            aAndB);

        // Making sure we don't accidentally accept things which
        // Aren't argument destructurings

        assert.throws(function () {
            uglify.parse('(function ( { a, [ b ] } ) { })')
        });

        assert.throws(function () {
            uglify.parse('(function (1) { })');
        }, /Invalid function parameter/);

        assert.throws(function () {
            uglify.parse('(function (this) { })');
        });

        assert.throws(function () {
            uglify.parse('(function ([1]) { })');
        }, /Invalid function parameter/);

        assert.throws(function () {
            uglify.parse('(function [a] { })');
        });

        // generators
        var generators_def = uglify.parse('function* fn() {}').body[0];
        assert.equal(generators_def.is_generator, true);

        assert.throws(function () {
            uglify.parse('function* (){ }');
        });

        var generators_yield_def = uglify.parse('function* fn() {\nyield remote();\}').body[0].body[0];
        assert.strictEqual(generators_yield_def.body.is_star, false);
    });
    it("Should not accept spread on non-last parameters", function() {
        var tests = [
            "var a = function(...a, b) { return a.join(b) }",
            "var b = function(a, b, ...c, d) { return c.join(a + b) + d }",
            "function foo(...a, b) { return a.join(b) }",
            "function bar(a, b, ...c, d) { return c.join(a + b) + d }",
            "var a = function*(...a, b) { return a.join(b) }",
            "var b = function*(a, b, ...c, d) { return c.join(a + b) + d }",
            "function* foo(...a, b) { return a.join(b) }",
            "function* bar(a, b, ...c, d) { return c.join(a + b) + d }"
        ];
        var test = function(code) {
            return function() {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message.substr(0, 31) === "SyntaxError: Unexpected token: ";
        }

        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error);
        }
    });
    it("Should not accept empty parameters after elision", function() {
        var tests = [
            "(function(,){})()",
            "(function(a,){})()",
        ];
        var test = function(code) {
            return function() {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function(e) {
            return e instanceof uglify.JS_Parse_Error &&
                e.message === "SyntaxError: Invalid function parameter";
        }
        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error);
        }
    });
    it("Should not accept an initializer when parameter is a rest parameter", function() {
        var tests = [
            "(function(...a = b){})()",
            "(function(a, ...b = [c, d]))"
        ];
        var test = function(code) {
            return function () {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function (e) {
            return e instanceof uglify.JS_Parse_Error;
        }
        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error, tests[i]);
        }
    });
    it("Shoult not accept duplicated identifiers inside parameters in strict mode or when using default assigment or spread", function() {
        // From: ES2016 9.2.12 FunctionDeclarationInstantiation (func, argumentsList)
        // NOTE Early errors ensure that duplicate parameter names can only occur
        // in non-strict functions that do not have parameter default values or
        // rest parameters.
        var tests = [
            "(function(a = 1, a){})()",
            "(function(a, [a = 3]){})()",
            "(function(a, b, c, d, [{e: [...a]}]){})()",
            "'use strict'; (function(a, a){})",
            "(function({a, a = b}))",
            "(function(a, [...a]){})",
            "(function(a, ...a){})",
            "(function(a, [a, ...b]){})",
            "(function(a, {b: a, c: [...d]}){})",
            "(function(a, a, {b: [...c]}){})"
        ];
        var test = function(code) {
            return function () {
                uglify.parse(code, {fromString: true});
            }
        }
        var error = function (e) {
            return e instanceof uglify.JS_Parse_Error &&
                /^SyntaxError: Parameter [a-zA-Z]+ was used already$/.test(e.message);
        }
        for (var i = 0; i < tests.length; i++) {
            assert.throws(test(tests[i]), error, tests[i]);
        }
    });
});
