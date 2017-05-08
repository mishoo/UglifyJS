var assert = require("assert");
var uglify = require("../node");

describe("Destructuring", function() {
    it("Should generate similar trees for destructuring in left hand side expressions, definitions, functions and arrow functions", function() {
        var patterns = [
            "[]",
            "{}",

            "[a, b, c]",
            "{a: b, c: d}",
            "{a}",
            "{a, b}",

            "{a: {}}",
            "{a: []}",
            "[{}]",
            "[[]]",
            "{a: {b}}",

            // Can't do `a = 123` with lhs expression, so only test in destructuring
            "[foo = bar]",
            "{a = 123}",
            "[{foo: abc = 123}]",
            "{foo: [abc = 123]}",

            "[...foo]",
            "[...{}]",
            "[...[]]"

            // Can't do `...` because that is an invalid lhs expression, spread in array destructuring should be fine though
        ];

        var types = [
            {
                name: "lhs",
                symbolType: uglify.AST_SymbolRef,
                tree: function (ast) {
                    return ast.body[0].body.left;
                },
                generate: function (code) {
                    return "(" + code + " = a)";
                }
            },
            {
                name: "var",
                symbolType: uglify.AST_SymbolVar,
                tree: function (ast) {
                    return ast.body[0].definitions[0].name;
                },
                generate: function (code) {
                    return "var " + code + " = a";
                }
            },
            {
                name: "function",
                symbolType: uglify.AST_SymbolFunarg,
                tree: function (ast) {
                    return ast.body[0].argnames[0];
                },
                generate: function (code) {
                    return "function a(" + code + ") {}";
                }
            },
            {
                name: "arrow",
                symbolType: uglify.AST_SymbolFunarg,
                tree: function (ast) {
                    return ast.body[0].definitions[0].value.argnames[0];
                },
                generate: function (code) {
                    return "var a = (" + code + ") => {}";
                }
            }
        ];

        var walker = function(type, ref, code, result) {
            var w = new uglify.TreeWalker(function(node) {
                if (w.parent() instanceof uglify.AST_DefaultAssign &&
                    w.parent().right === node
                ) {
                    return true; // Don't check the content of the default assignment

                } else if (node instanceof uglify.AST_Symbol) {
                    assert(node instanceof type.symbolType,
                        node.TYPE + " while " + type.symbolType.TYPE + " expected at pos " +
                        node.start.pos + " in `" + code + "`  (" + ref + ")"
                    );

                    result.push([
                        new uglify.AST_Symbol({
                            start: node.start,
                            name: node.name,
                            end: node.end
                        }),
                        w.parent()
                    ]);

                    return;
                }

                result.push([node, w.parent()]);
            });

            return w;
        };

        var getNodeType = function(node) {
            return node[0].TYPE + (node[1] ? " " + node[1].TYPE : "");
        }

        for (var i = 0; i < patterns.length; i++) {
            var results = [];

            for (var j = 0; j < types.length; j++) {
                var code = types[j].generate(patterns[i])
                var ast = types[j].tree(
                    uglify.parse(code)
                );
                results.push([]);
                ast.walk(walker(
                    types[j],
                    "`" + patterns[i] + "` on " + types[j].name,
                    code,
                    results[j]
                ));

                if (j > 0) {
                    assert.deepEqual(
                        results[0].map(getNodeType),
                        results[j].map(getNodeType),
                        "AST disagree on " + patterns[i] + " with " + types[j].name
                    );
                }
            }
        }
    });
});
