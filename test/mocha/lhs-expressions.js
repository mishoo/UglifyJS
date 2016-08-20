var assert = require("assert");
var uglify = require("../../");

describe("Left-hand side expressions", function () {
    it("Should parse destructuring with const/let/var correctly", function () {
        var decls = uglify.parse('var {a,b} = foo, { c, d } = bar');

        assert.equal(decls.body[0].TYPE, 'Var');
        assert.equal(decls.body[0].definitions.length, 2);
        assert.equal(decls.body[0].definitions[0].name.TYPE, 'Destructuring');
        assert.equal(decls.body[0].definitions[0].value.TYPE, 'SymbolRef');

        var nested_def = uglify.parse('var [{x}] = foo').body[0].definitions[0];

        assert.equal(nested_def.name.names[0].names[0].TYPE, 'SymbolVar');
        assert.equal(nested_def.name.names[0].names[0].name, 'x');

        var holey_def = uglify.parse('const [,,third] = [1,2,3]').body[0].definitions[0];

        assert.equal(holey_def.name.names[0].TYPE, 'Hole');
        assert.equal(holey_def.name.names[2].TYPE, 'SymbolConst');

        var expanding_def = uglify.parse('var [first, ...rest] = [1,2,3]').body[0].definitions[0];

        assert.equal(expanding_def.name.names[0].TYPE, 'SymbolVar');
        assert.equal(expanding_def.name.names[1].TYPE, 'Expansion');
        assert.equal(expanding_def.name.names[1].expression.TYPE, 'SymbolVar');
    });
});
