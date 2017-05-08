var UglifyJS = require("../node");
var assert = require("assert");

describe("arguments", function() {
    it("Should known that arguments in functions are local scoped", function() {
        var ast = UglifyJS.parse("var arguments; var f = function() {arguments.length}");
        ast.figure_out_scope();

        // Test scope of `var arguments`
        assert.strictEqual(ast.find_variable("arguments").global, true);

        // Select arguments symbol in function
        var symbol = ast.body[1].definitions[0].value.find_variable("arguments");

        assert.strictEqual(symbol.global, false);
        assert.strictEqual(symbol.scope, ast. // From ast
            body[1]. // Select 2nd statement (equals to `var f ...`)
            definitions[0]. // First definition of selected statement
            value // Select function as scope
        );
    });

    it("Should recognize when a function uses arguments", function() {
        var ast = UglifyJS.parse("function a(){function b(){function c(){}; return arguments[0];}}");
        ast.figure_out_scope();
        assert.strictEqual(ast.body[0].uses_arguments, false);
        assert.strictEqual(ast.body[0].body[0].uses_arguments, true);
        assert.strictEqual(ast.body[0].body[0].body[0].uses_arguments, false);
    });

    it("Should parse a function containing default assignment correctly", function() {
        var ast = UglifyJS.parse("function foo(a = 123) {}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // First argument
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_DefaultAssign);
        assert(ast.body[0].argnames[0].left instanceof UglifyJS.AST_SymbolFunarg);
        assert.strictEqual(ast.body[0].argnames[0].operator, "=");
        assert(ast.body[0].argnames[0].right instanceof UglifyJS.AST_Number);

        ast = UglifyJS.parse("function foo(a = a) {}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // First argument
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_DefaultAssign);
        assert(ast.body[0].argnames[0].left instanceof UglifyJS.AST_SymbolFunarg);
        assert.strictEqual(ast.body[0].argnames[0].operator, "=");
        assert(ast.body[0].argnames[0].right instanceof UglifyJS.AST_SymbolRef);
    });

    it("Should parse a function containing default assignments in destructuring correctly", function() {
        var ast = UglifyJS.parse("function foo([a = 123]) {}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // First argument
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, true);
        assert.strictEqual(ast.body[0].argnames[0].names.length, 1);
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_DefaultAssign);
        assert(ast.body[0].argnames[0].names[0].left instanceof UglifyJS.AST_SymbolFunarg);
        assert.strictEqual(ast.body[0].argnames[0].names[0].operator, "=");
        assert(ast.body[0].argnames[0].names[0].right instanceof UglifyJS.AST_Number);


        ast = UglifyJS.parse("function foo({a = 123}) {}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // First argument
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, false);
        assert.strictEqual(ast.body[0].argnames[0].names.length, 1);
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_ObjectKeyVal);
        assert.strictEqual(ast.body[0].argnames[0].names[0].key, "a");

        // Property a of first argument
        assert(ast.body[0].argnames[0].names[0].value instanceof UglifyJS.AST_DefaultAssign);
        assert(ast.body[0].argnames[0].names[0].value.left instanceof UglifyJS.AST_SymbolFunarg);
        assert.strictEqual(ast.body[0].argnames[0].names[0].value.operator, "=");
        assert(ast.body[0].argnames[0].names[0].value.right instanceof UglifyJS.AST_Number);


        ast = UglifyJS.parse("function foo({a: a = 123}) {}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // First argument
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, false);
        assert.strictEqual(ast.body[0].argnames[0].names.length, 1);

        // Content destructuring of first argument
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_ObjectKeyVal);
        assert.strictEqual(ast.body[0].argnames[0].names[0].key, "a");
        assert(ast.body[0].argnames[0].names[0].value instanceof UglifyJS.AST_DefaultAssign);

        // Property a of first argument
        assert(ast.body[0].argnames[0].names[0].value instanceof UglifyJS.AST_DefaultAssign);
        assert(ast.body[0].argnames[0].names[0].value.left instanceof UglifyJS.AST_SymbolFunarg);
        assert.strictEqual(ast.body[0].argnames[0].names[0].value.operator, "=");
        assert(ast.body[0].argnames[0].names[0].value.right instanceof UglifyJS.AST_Number);
    });

    it("Should parse a function containing default assignments in complex destructuring correctly", function() {
        var ast = UglifyJS.parse("function foo([a, [b = 123]]){}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // Check first argument
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, true);
        assert.strictEqual(ast.body[0].argnames[0].names.length, 2);

        // Check whole destructuring structure of first argument
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[0].names[1] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].names[1].is_array, true);

        // Check content of second destructuring element (which is the nested destructuring pattern)
        assert(ast.body[0].argnames[0].names[1].names[0] instanceof UglifyJS.AST_DefaultAssign);
        assert(ast.body[0].argnames[0].names[1].names[0].left instanceof UglifyJS.AST_SymbolFunarg);
        assert.strictEqual(ast.body[0].argnames[0].names[1].names[0].operator, "=");
        assert(ast.body[0].argnames[0].names[1].names[0].right instanceof UglifyJS.AST_Number);


        ast = UglifyJS.parse("function foo([a, {b: c = 123}]){}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // Check first argument
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, true);
        assert.strictEqual(ast.body[0].argnames[0].names.length, 2);

        // Check whole destructuring structure of first argument
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[0].names[1] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].names[1].is_array, false);

        // Check content of second destructuring element (which is the nested destructuring pattern)
        assert(ast.body[0].argnames[0].names[1].names[0] instanceof UglifyJS.AST_ObjectKeyVal);
        assert.strictEqual(ast.body[0].argnames[0].names[1].names[0].key, "b");
        assert(ast.body[0].argnames[0].names[1].names[0].value instanceof UglifyJS.AST_DefaultAssign);

        // Property b of second argument
        assert(ast.body[0].argnames[0].names[1].names[0].value instanceof UglifyJS.AST_DefaultAssign);
        assert(ast.body[0].argnames[0].names[1].names[0].value.left instanceof UglifyJS.AST_SymbolFunarg);
        assert.strictEqual(ast.body[0].argnames[0].names[1].names[0].value.operator, "=");
        assert(ast.body[0].argnames[0].names[1].names[0].value.right instanceof UglifyJS.AST_Number);


        ast = UglifyJS.parse("function foo({a, b: {b = 123}}){}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // Check first argument
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, false);
        assert.strictEqual(ast.body[0].argnames[0].names.length, 2);

        // Check whole destructuring structure of first argument
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_ObjectKeyVal);
        assert.strictEqual(ast.body[0].argnames[0].names[0].key, "a");
        assert(ast.body[0].argnames[0].names[0].value instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[0].names[1] instanceof UglifyJS.AST_ObjectKeyVal);
        assert.strictEqual(ast.body[0].argnames[0].names[1].key, "b");
        assert(ast.body[0].argnames[0].names[1].value instanceof UglifyJS.AST_Destructuring);

        // Check content of nested destructuring in first parameter
        var content = ast.body[0].argnames[0].names[1].value
        assert.strictEqual(content.is_array, false);
        assert.strictEqual(content.names.length, 1);
        assert(content.names[0] instanceof UglifyJS.AST_ObjectKeyVal);
        assert.strictEqual(content.names[0].key, "b");
        assert(content.names[0].value instanceof UglifyJS.AST_DefaultAssign);
        assert(content.names[0].value.left instanceof UglifyJS.AST_SymbolFunarg);
        assert.strictEqual(content.names[0].value.operator, "=");
        assert(content.names[0].value.right instanceof UglifyJS.AST_Number);


        ast = UglifyJS.parse("function foo({a: {b = 123}}){}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // Check first argument
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, false);
        assert.strictEqual(ast.body[0].argnames[0].names.length, 1);

        // Check whole destructuring structure of first argument
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_ObjectKeyVal);
        assert.strictEqual(ast.body[0].argnames[0].names[0].key, "a");
        assert(ast.body[0].argnames[0].names[0].value instanceof UglifyJS.AST_Destructuring);

        // Check content of nested destructuring
        content = ast.body[0].argnames[0].names[0].value
        assert.strictEqual(content.is_array, false);
        assert.strictEqual(content.names.length, 1);
        assert(content.names[0] instanceof UglifyJS.AST_ObjectKeyVal);
        assert.strictEqual(content.names[0].key, "b");
        assert(content.names[0].value instanceof UglifyJS.AST_DefaultAssign);
        assert(content.names[0].value.left instanceof UglifyJS.AST_SymbolFunarg);
        assert.strictEqual(content.names[0].value.operator, "=");
        assert(content.names[0].value.right instanceof UglifyJS.AST_Number);
    });

    it("Should parse spread correctly", function() {
        var ast = UglifyJS.parse("function foo(a, b, ...c){}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 3);

        // Check parameters
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[1] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[2] instanceof UglifyJS.AST_Expansion);
        assert(ast.body[0].argnames[2].expression instanceof UglifyJS.AST_SymbolFunarg);


        ast = UglifyJS.parse("function foo([a, b, ...c]){}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // Check first parameter
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, true);

        // Check content first parameter
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[0].names[1] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[0].names[2] instanceof UglifyJS.AST_Expansion);
        assert(ast.body[0].argnames[0].names[2].expression instanceof UglifyJS.AST_SymbolFunarg);


        ast = UglifyJS.parse("function foo([a, b, [c, ...d]]){}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // Check first parameter
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, true);

        // Check content outer destructuring array
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[0].names[1] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[0].names[2] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].names[2].is_array, true);

        // Check content nested destructuring array
        assert.strictEqual(ast.body[0].argnames[0].names[2].names.length, 2);
        assert(ast.body[0].argnames[0].names[2].names[0] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[0].names[2].names[1] instanceof UglifyJS.AST_Expansion);
        assert(ast.body[0].argnames[0].names[2].names[1].expression instanceof UglifyJS.AST_SymbolFunarg);


        ast = UglifyJS.parse("function foo({a: [b, ...c]}){}");
        assert(ast.body[0] instanceof UglifyJS.AST_Defun);
        assert.strictEqual(ast.body[0].argnames.length, 1);

        // Check first parameter
        assert(ast.body[0].argnames[0] instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].is_array, false);

        // Check outer destructuring object
        assert.strictEqual(ast.body[0].argnames[0].names.length, 1);
        assert(ast.body[0].argnames[0].names[0] instanceof UglifyJS.AST_ObjectKeyVal);
        assert.strictEqual(ast.body[0].argnames[0].names[0].key, "a");
        assert(ast.body[0].argnames[0].names[0].value instanceof UglifyJS.AST_Destructuring);
        assert.strictEqual(ast.body[0].argnames[0].names[0].value.is_array, true);

        // Check content nested destructuring array
        assert.strictEqual(ast.body[0].argnames[0].names[0].value.names.length, 2);
        assert(ast.body[0].argnames[0].names[0].value.names[0] instanceof UglifyJS.AST_SymbolFunarg);
        assert(ast.body[0].argnames[0].names[0].value.names[1] instanceof UglifyJS.AST_Expansion);
        assert(ast.body[0].argnames[0].names[0].value.names[1].expression instanceof UglifyJS.AST_SymbolFunarg);
    });
});
