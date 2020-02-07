var U = require("./node");
var List = U.List;
var sandbox = require("./sandbox");

// Reduce a ufuzz-style `console.log` based test case by iteratively replacing
// AST nodes with various permutations. Each AST_Statement in the tree is also
// speculatively dropped to determine whether it is needed.  If the altered
// tree and the last known good tree produce the same non-nil error-free output
// after being run, then the permutation survives to the next generation and
// is the basis for subsequent iterations.  The test case is reduced as a
// consequence of complex expressions being replaced with simpler ones.
// This function assumes that the testcase will not result in a parse or
// runtime Error.  Note that a reduced test case will have different runtime
// output - it is not functionally equivalent to the original. The only criteria
// is that once the generated reduced test case is run without minification, it
// will produce different output from the code minified with `minify_options`.
// Returns a `minify` result object with an additonal boolean property `reduced`.

module.exports = function reduce_test(testcase, minify_options, reduce_options) {
    minify_options = minify_options || { compress: {}, mangle: false };
    reduce_options = reduce_options || {};
    var max_iterations = reduce_options.max_iterations || 1000;
    var max_timeout = reduce_options.max_timeout || 15000;
    var verbose = reduce_options.verbose;
    var minify_options_json = JSON.stringify(minify_options);
    var timeout = 1000; // start with a low timeout
    var differs;

    if (testcase instanceof U.AST_Node) testcase = testcase.print_to_string();

    // the initial timeout to assess the viability of the test case must be large
    if (differs = producesDifferentResultWhenMinified(testcase, minify_options, max_timeout)) {
        if (differs.error) return differs;
        // Replace expressions with constants that will be parsed into
        // AST_Nodes as required.  Each AST_Node has its own permutation count,
        // so these replacements can't be shared.
        // Although simpler replacements are generally faster and better,
        // feel free to experiment with a different replacement set.
        var REPLACEMENTS = [
            // "null", "''", "false", "'foo'", "undefined", "9",
            "1", "0",
        ];

        // There's a relationship between each node's _permute counter and
        // REPLACEMENTS.length which is why fractional _permutes were needed.
        // One could scale all _permute operations by a factor of `steps`
        // to only deal with integer operations, but this works well enough.
        var steps = 4;        // must be a power of 2
        var step = 1 / steps; // 0.25 is exactly representable in floating point

        var tt = new U.TreeTransformer(function(node, descend, in_list) {
            if (CHANGED) return;

            // quick ignores
            if (node instanceof U.AST_Toplevel) return;
            if (node instanceof U.AST_Accessor) return;
            if (node instanceof U.AST_Directive) return;
            // if (node instanceof U.AST_Var) return;
            // if (node instanceof U.AST_VarDef) return;

            var parent = tt.parent();

            // ignore call expressions
            if (parent instanceof U.AST_Call && parent.expression === node) return;

            // ensure that the _permute prop is a number.
            // can not use `node.start._permute |= 0;` as it will erase fractional part.
            if (typeof node.start._permute === "undefined") node.start._permute = 0;

            // if node reached permutation limit - skip over it.
            // no structural AST changes before this point.
            if (node.start._permute >= REPLACEMENTS.length) return;

            if (parent instanceof U.AST_Assign
                    && parent.left === node
                || parent instanceof U.AST_Unary
                    && parent.expression === node
                    && ["++", "--", "delete"].indexOf(parent.operator) >= 0) {
                // ignore lvalues
                return;
            }
            if (parent instanceof U.AST_If && parent.alternative === node) {
                // retain the if statement and drop its else block
                node.start._permute++;
                CHANGED = true;
                return null;
            }

            // node specific permutations with no parent logic

            if (node instanceof U.AST_Array) {
                var expr = node.elements[0];
                if (expr) {
                    node.start._permute++;
                    CHANGED = true;
                    return expr;
                }
            }
            else if (node instanceof U.AST_Binary) {
                CHANGED = true;
                return [
                    node.left,
                    node.right,
                ][ ((node.start._permute += step) * steps | 0) % 2 ];
            }
            else if (node instanceof U.AST_Catch || node instanceof U.AST_Finally) {
                // drop catch or finally block
                node.start._permute++;
                CHANGED = true;
                return null;
            }
            else if (node instanceof U.AST_Conditional) {
                CHANGED = true;
                return [
                    node.condition,
                    node.consequent,
                    node.alternative,
                ][ ((node.start._permute += step) * steps | 0) % 3 ];
            }
            else if (node instanceof U.AST_BlockStatement) {
                if (in_list) {
                    node.start._permute++;
                    CHANGED = true;
                    return List.splice(node.body);
                }
            }
            else if (node instanceof U.AST_Call) {
                if (/^console/.test(node.print_to_string())) return node;
                var expr = [
                    node.expression,
                    node.args[0],
                ][ node.start._permute++ % 2 ];
                if (expr) {
                    CHANGED = true;
                    return expr;
                }
            }
            else if (node instanceof U.AST_DWLoop) {
                var expr = [
                    node.condition,
                    node.body,
                    null,  // intentional
                ][ (node.start._permute * steps | 0) % 3 ];
                node.start._permute += step;
                if (!expr) {
                    if (node.body[0] instanceof U.AST_Break) {
                        if (node instanceof U.AST_Do) {
                            CHANGED = true;
                            return List.skip;
                        }
                        expr = node.condition; // AST_While - fall through
                    }
                }
                if (expr) {
                    CHANGED = true;
                    return expr instanceof U.AST_Statement ? expr : new U.AST_SimpleStatement({
                        body: expr,
                        start: {},
                    });
                }
            }
            else if (node instanceof U.AST_PropAccess) {
                var expr = [
                    node.expression,
                    node.property instanceof U.AST_Node && node.property,
                ][ node.start._permute++ % 2 ];
                if (expr) {
                    CHANGED = true;
                    return expr;
                }
            }
            else if (node instanceof U.AST_For) {
                var expr = [
                    node.init,
                    node.condition,
                    node.step,
                    node.body,
                ][ (node.start._permute * steps | 0) % 4 ];
                node.start._permute += step;
                if (expr) {
                    CHANGED = true;
                    return expr instanceof U.AST_Statement ? expr : new U.AST_SimpleStatement({
                        body: expr,
                        start: {},
                    });
                }
            }
            else if (node instanceof U.AST_ForIn) {
                var expr = [
                    node.init,
                    node.object,
                    node.body,
                ][ (node.start._permute * steps | 0) % 3 ];
                node.start._permute += step;
                if (expr) {
                    CHANGED = true;
                    return expr instanceof U.AST_Statement ? expr : new U.AST_SimpleStatement({
                        body: expr,
                        start: {},
                    });
                }
            }
            else if (node instanceof U.AST_If) {
                var body = [
                    node.body,
                    node.alternative,
                ][ (node.start._permute++) % 2 ];
                if (body) {
                    // replace if statement with its then block or the else block
                    CHANGED = true;
                    return body;
                }
            }
            else if (node instanceof U.AST_Object) {
                // first property's value
                var expr = node.properties[0] instanceof U.AST_ObjectKeyVal && node.properties[0].value;
                if (expr) {
                    node.start._permute++;
                    CHANGED = true;
                    return expr;
                }
            }
            else if (node instanceof U.AST_Switch) {
                var expr = [
                    node.expression,                         // switch expression
                    node.body[0] && node.body[0].expression, // first case expression or undefined
                    node.body[0] && node.body[0].body[0],    // first case body statement or undefined
                ][ (node.start._permute * steps | 0) % 3 ];
                node.start._permute += step;
                if (expr) {
                    CHANGED = true;
                    return expr instanceof U.AST_Statement ? expr : new U.AST_SimpleStatement({
                        body: expr,
                        start: {},
                    });
                }
            }
            else if (node instanceof U.AST_Try) {
                var body = [
                    node.body,
                    node.bcatch && node.bcatch.body,
                    node.bfinally && node.bfinally.body,
                    null,  // intentional
                ][ (node.start._permute * steps | 0) % 4 ];
                node.start._permute += step;
                if (body) {
                    // replace try statement with try block, catch block, or finally block
                    CHANGED = true;
                    return new U.AST_BlockStatement({
                        body: body,
                        start: {},
                    });
                } else {
                    // replace try with a break or return if first in try statement
                    if (node.body[0] instanceof U.AST_Break
                        || node.body[0] instanceof U.AST_Return) {
                        CHANGED = true;
                        return node.body[0];
                    }
                }
            }
            else if (node instanceof U.AST_Unary) {
                node.start._permute++;
                CHANGED = true;
                return node.expression;
            }

            if (in_list) {
                // special case to drop object properties and switch branches
                if (parent instanceof U.AST_Object
                    || parent instanceof U.AST_Switch && parent.expression != node) {
                    node.start._permute++;
                    CHANGED = true;
                    return List.skip;
                }

                // replace or skip statement
                if (node instanceof U.AST_Statement) {
                    if (node instanceof U.AST_LabeledStatement
                        && node.body instanceof U.AST_Statement) {
                        // replace labelled statement with its non-labelled body
                        node.start._permute = REPLACEMENTS.length;
                        CHANGED = true;
                        return node.body;
                    }
                    node.start._permute++;
                    CHANGED = true;
                    return List.skip;
                }
            }

            // replace or remove this node depending on whether it's in a list
            var newNode = new U.parse(REPLACEMENTS[node.start._permute % REPLACEMENTS.length | 0], {
                expression: true,
            });
            newNode.start._permute = ++node.start._permute;
            CHANGED = true;
            return in_list ? List.skip : newNode;
        });

        for (var pass = 1; pass <= 3; ++pass) {
            var testcase_ast = U.parse(testcase);
            testcase_ast.walk(new U.TreeWalker(function(node) {
                // unshare start props to retain visit data between iterations
                node.start = JSON.parse(JSON.stringify(node.start));
                node.start._permute = 0;
            }));
            for (var c = 0; c < max_iterations; ++c) {
                if (verbose) {
                    if (pass == 1 && c % 25 == 0) {
                        console.error("// reduce test pass "
                            + pass + ", iteration " + c + ": " + testcase.length + " bytes");
                    }
                }
                var CHANGED = false;
                var code_ast = testcase_ast.clone(true).transform(tt);
                if (!CHANGED) break;
                try {
                    var code = code_ast.print_to_string();
                } catch (ex) {
                    // AST is not well formed.
                    // no harm done - just log the error, ignore latest change and continue iterating.
                    console.error("*** Error generating code from AST.");
                    console.error(ex.stack);
                    console.error("*** Discarding permutation and continuing.");
                }
                if (code) {
                    var diff = producesDifferentResultWhenMinified(code, minify_options, timeout);
                    if (diff) {
                        if (diff.timed_out) {
                            // can't trust the validity of `code_ast` and `code` when timed out.
                            // no harm done - just ignore latest change and continue iterating.
                            if (timeout < max_timeout) timeout += 250;
                        } else {
                            // latest permutation is valid, so use it as the basis of new changes
                            testcase_ast = code_ast;
                            testcase = code;
                            differs = diff;
                        }
                    }
                }
            }
            if (c == 0) break;
            if (verbose) {
                console.error("// reduce test pass " + pass + ": " + testcase.length + " bytes");
            }
        }
        testcase += "\n// output: " + differs.unminified_result
            + "\n// minify: " + differs.minified_result
            + "\n// options: " + minify_options_json;
    } else {
        // same stdout result produced when minified
        testcase = "// Can't reproduce test failure with minify options provided:"
            + "\n// " + minify_options_json;
    }
    var result = U.minify(testcase.replace(/\u001b\[\d+m/g, ""), {
        compress: false,
        mangle: false,
        output: {
            beautify: true,
            braces: true,
            comments: true,
        }
    });
    return result;
};

function producesDifferentResultWhenMinified(code, minify_options, timeout) {
    var minified = U.minify(code, minify_options);
    if (minified.error) return minified;
    var toplevel = minify_options.toplevel;
    var unminified_result = sandbox.run_code(code, toplevel, timeout);
    if (/timed out/i.test(unminified_result)) return false;
    if (/^\s*$|Error/.test(unminified_result)) return false;

    var minified_result = sandbox.run_code(minified.code, toplevel, timeout);
    if (/timed out/i.test(minified_result)) return { timed_out: true };
    if (/^\s*$/.test(minified_result)) return false;

    return !sandbox.same_stdout(unminified_result, minified_result) ? {
        unminified_result: unminified_result,
        minified_result: minified_result,
    } : false;
}

Error.stackTraceLimit = Infinity;
