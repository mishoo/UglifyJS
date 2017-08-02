var assert = require("assert");
var uglify = require("../node");

describe("Left-hand side expressions", function () {
    it("Should parse destructuring with const/let/var correctly", function () {
        var decls = uglify.parse('var {a,b} = foo, { c, d } = bar');

        assert.equal(decls.body[0].TYPE, 'Var');
        assert.equal(decls.body[0].definitions.length, 2);

        // Item 1
        assert.equal(decls.body[0].definitions[0].name.TYPE, 'Destructuring');
        assert.equal(decls.body[0].definitions[0].value.TYPE, 'SymbolRef');

        // Item 2
        assert.equal(decls.body[0].definitions[1].name.TYPE, 'Destructuring');
        assert.equal(decls.body[0].definitions[1].value.TYPE, 'SymbolRef');

        var nested_def = uglify.parse('var [{x}] = foo').body[0].definitions[0];

        assert.equal(nested_def.name.names[0].names[0].TYPE, 'ObjectKeyVal');
        assert.equal(nested_def.name.names[0].names[0].value.TYPE, 'SymbolVar');
        assert.equal(nested_def.name.names[0].names[0].key, 'x');
        assert.equal(nested_def.name.names[0].names[0].value.name, 'x');

        var holey_def = uglify.parse('const [,,third] = [1,2,3]').body[0].definitions[0];

        assert.equal(holey_def.name.names[0].TYPE, 'Hole');
        assert.equal(holey_def.name.names[1].TYPE, 'Hole');
        assert.equal(holey_def.name.names[2].TYPE, 'SymbolConst');

        var expanding_def = uglify.parse('var [first, ...rest] = [1,2,3]').body[0].definitions[0];

        assert.equal(expanding_def.name.names[0].TYPE, 'SymbolVar');
        assert.equal(expanding_def.name.names[1].TYPE, 'Expansion');
        assert.equal(expanding_def.name.names[1].expression.TYPE, 'SymbolVar');
    });

    it("Parser should use AST_Array for array literals", function() {
        var ast = uglify.parse('["foo", "bar"]');
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);
        assert(ast.body[0].body instanceof uglify.AST_Array);

        ast = uglify.parse('a = ["foo"]');
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_SymbolRef);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_Array);
    });

    it("Parser should use AST_Object for object literals", function() {
        var ast = uglify.parse('({foo: "bar"})');
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);
        assert(ast.body[0].body instanceof uglify.AST_Object);

        // This example should be fine though
        ast = uglify.parse('a = {foo: "bar"}');
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_SymbolRef);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_Object);
    });

    it("Parser should use AST_Destructuring for array assignment patterns", function() {
        var ast = uglify.parse('[foo, bar] = [1, 2]');
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.is_array, true);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_Array);
    });

    it("Parser should use AST_Destructuring for object assignment patterns", function() {
        var ast = uglify.parse('({a: b, b: c} = {b: "c", c: "d"})');
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.is_array, false);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_Object);
    });

    it("Parser should be able to handle nested destructuring", function() {
        var ast = uglify.parse('[{a,b},[d, e, f, {g, h}]] = [{a: 1, b: 2}, [3, 4, 5, {g: 6, h: 7}]]');
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.is_array, true);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_Array);

        assert(ast.body[0].body.left.names[0] instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.names[0].is_array, false);

        assert(ast.body[0].body.left.names[1] instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.names[1].is_array, true);

        assert(ast.body[0].body.left.names[1].names[3] instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.names[1].names[3].is_array, false);
    });

    it("Should handle spread operator in destructuring", function() {
        var ast = uglify.parse("[a, b, ...c] = [1, 2, 3, 4, 5]");
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.is_array, true);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_Array);

        assert(ast.body[0].body.left.names[0] instanceof uglify.AST_SymbolRef);
        assert(ast.body[0].body.left.names[1] instanceof uglify.AST_SymbolRef);

        assert(ast.body[0].body.left.names[2] instanceof uglify.AST_Expansion);
    });

    it("Should handle default assignments in destructuring", function() {
        var ast = uglify.parse("({x: v, z = z + 5} = obj);");
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.is_array, false);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_SymbolRef);

        assert(ast.body[0].body.left.names[0].value instanceof uglify.AST_SymbolRef);
        assert.strictEqual(ast.body[0].body.left.names[0].start.value, "x");

        assert(ast.body[0].body.left.names[1].value instanceof uglify.AST_DefaultAssign);
        assert.strictEqual(ast.body[0].body.left.names[1].start.value, "z");
        assert(ast.body[0].body.left.names[1].value.left instanceof uglify.AST_SymbolRef);
        assert.strictEqual(ast.body[0].body.left.names[1].value.operator, "=");
        assert(ast.body[0].body.left.names[1].value.right instanceof uglify.AST_Binary);


        ast = uglify.parse("({x = 123} = obj);");
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);
        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.is_array, false);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_SymbolRef);

        assert(ast.body[0].body.left.names[0].value instanceof uglify.AST_DefaultAssign);
        assert.strictEqual(ast.body[0].body.left.names[0].value.operator, "=");
        assert(ast.body[0].body.left.names[0].value.left instanceof uglify.AST_SymbolRef);


        ast = uglify.parse("[x, y = 5] = foo");
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.is_array, true);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_SymbolRef);

        assert(ast.body[0].body.left.names[0] instanceof uglify.AST_SymbolRef);
        assert.strictEqual(ast.body[0].body.left.names[0].start.value, "x");

        assert(ast.body[0].body.left.names[1] instanceof uglify.AST_DefaultAssign);
        assert(ast.body[0].body.left.names[1].left instanceof uglify.AST_SymbolRef);
        assert.strictEqual(ast.body[0].body.left.names[1].start.value, "y");
    });

    it("Should handle default assignments containing assignments in a destructuring", function() {
        var ast = uglify.parse("[x, y = z = 2] = a;");
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.is_array, true);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_SymbolRef);

        assert(ast.body[0].body.left.names[0] instanceof uglify.AST_SymbolRef);

        assert(ast.body[0].body.left.names[1] instanceof uglify.AST_DefaultAssign);
        assert(ast.body[0].body.left.names[1].left instanceof uglify.AST_SymbolRef);
        assert.equal(ast.body[0].body.left.names[1].operator, "=");
        assert(ast.body[0].body.left.names[1].right instanceof uglify.AST_Assign);

        assert(ast.body[0].body.left.names[1].right.left instanceof uglify.AST_SymbolRef);
        assert.equal(ast.body[0].body.left.names[1].right.operator, "=");
        assert(ast.body[0].body.left.names[1].right.right instanceof uglify.AST_Number);

        ast = uglify.parse("({a: a = 123} = obj)");
        assert(ast.body[0] instanceof uglify.AST_SimpleStatement);

        assert(ast.body[0].body instanceof uglify.AST_Assign);
        assert(ast.body[0].body.left instanceof uglify.AST_Destructuring);
        assert.strictEqual(ast.body[0].body.left.is_array, false);
        assert.equal(ast.body[0].body.operator, "=");
        assert(ast.body[0].body.right instanceof uglify.AST_SymbolRef);

        assert(ast.body[0].body.left.names[0] instanceof uglify.AST_ObjectProperty);
        assert.strictEqual(ast.body[0].body.left.names[0].key, "a");
        assert(ast.body[0].body.left.names[0].value instanceof uglify.AST_DefaultAssign);
        assert(ast.body[0].body.left.names[0].value.left instanceof uglify.AST_SymbolRef);
        assert.strictEqual(ast.body[0].body.left.names[0].value.operator, "=");
        assert(ast.body[0].body.left.names[0].value.right instanceof uglify.AST_Number);
    });

    it("Should allow multiple spread in array literals", function() {
        var ast = uglify.parse("var a = [1, 2, 3], b = [4, 5, 6], joined; joined = [...a, ...b]");
        assert(ast.body[0] instanceof uglify.AST_Var);
        assert(ast.body[1] instanceof uglify.AST_SimpleStatement);

        // Check statement containing array with spreads
        assert(ast.body[1].body instanceof uglify.AST_Assign);
        assert(ast.body[1].body.left instanceof uglify.AST_SymbolRef);
        assert.equal(ast.body[1].body.operator, "=");
        assert(ast.body[1].body.right instanceof uglify.AST_Array);

        // Check array content
        assert.strictEqual(ast.body[1].body.right.elements.length, 2);
        assert(ast.body[1].body.right.elements[0] instanceof uglify.AST_Expansion);
        assert(ast.body[1].body.right.elements[0].expression instanceof uglify.AST_SymbolRef);
        assert(ast.body[1].body.right.elements[0].expression.name, "a");
        assert(ast.body[1].body.right.elements[1] instanceof uglify.AST_Expansion);
        assert(ast.body[1].body.right.elements[1].expression instanceof uglify.AST_SymbolRef);
        assert(ast.body[1].body.right.elements[1].expression.name, "b");
    });

    it("Should not allow spread on invalid locations", function() {
        var expect = function(input, expected) {
            var execute = function(input) {
                return function() {
                    uglify.parse(input);
                }
            }
            var check = function(e) {
                return e instanceof uglify.JS_Parse_Error &&
                    e.message === expected;
            }

            assert.throws(execute(input), check);
        }

        // Spreads are not allowed in destructuring array if it's not the last element
        expect("[...a, ...b] = [1, 2, 3, 4]", "Spread must the be last element in destructuring array");

        // Multiple spreads are not allowed in destructuring array
        expect("[...a, ...b] = [1, 2, 3, 4]", "Spread must the be last element in destructuring array");

        // Array spread must be last in destructuring declaration
        expect("let [ ...x, a ] = o;", "Rest element must be last element");

        // Only one spread per destructuring array declaration
        expect("let [ a, ...x, ...y ] = o;", "Rest element must be last element");

        // Spread in block should not be allowed
        expect("{...a} = foo", "Unexpected token: expand (...)");

        // Object spread must be last in destructuring declaration
        expect("let { ...x, a } = o;", "Rest element must be last element");

        // Only one spread per destructuring declaration
        expect("let { a, ...x, ...y } = o;", "Rest element must be last element");
    });
});
