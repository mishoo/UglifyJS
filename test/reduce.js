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
            if (node instanceof U.AST_Accessor) return;
            if (node instanceof U.AST_Directive) return;
            if (node instanceof U.AST_Label) return;
            if (node instanceof U.AST_LabelRef) return;
            if (!in_list && node instanceof U.AST_SymbolDeclaration) return;
            if (node instanceof U.AST_Toplevel) return;

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
            if ((parent instanceof U.AST_For || parent instanceof U.AST_ForIn)
                && parent.init === node && node instanceof U.AST_Var) {
                // preserve for (var ...)
                return node;
            }

            // node specific permutations with no parent logic

            if (node instanceof U.AST_Array) {
                var expr = node.elements[0];
                if (expr && !(expr instanceof U.AST_Hole)) {
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
                if (expr && (expr !== node.body || !has_loopcontrol(expr, node, parent))) {
                    CHANGED = true;
                    return to_statement(expr);
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
                if (expr && (expr !== node.body || !has_loopcontrol(expr, node, parent))) {
                    CHANGED = true;
                    return to_statement(expr);
                }
            }
            else if (node instanceof U.AST_ForIn) {
                var expr = [
                    node.init,
                    node.object,
                    node.body,
                ][ (node.start._permute * steps | 0) % 3 ];
                node.start._permute += step;
                if (expr && (expr !== node.body || !has_loopcontrol(expr, node, parent))) {
                    CHANGED = true;
                    return to_statement(expr);
                }
            }
            else if (node instanceof U.AST_If) {
                var expr = [
                    node.condition,
                    node.body,
                    node.alternative,
                ][ (node.start._permute * steps | 0) % 3 ];
                node.start._permute += step;
                if (expr) {
                    // replace if statement with its condition, then block or else block
                    CHANGED = true;
                    return to_statement(expr);
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
                    node.body[0] && node.body[0],            // first case body or undefined
                ][ (node.start._permute * steps | 0) % 4 ];
                node.start._permute += step;
                if (expr && (!(expr instanceof U.AST_Statement) || !has_loopcontrol(expr, node, parent))) {
                    CHANGED = true;
                    return expr instanceof U.AST_SwitchBranch ? new U.AST_BlockStatement({
                        body: expr.body.slice(),
                        start: {},
                    }) : to_statement(expr);
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
                        && node.body instanceof U.AST_Statement
                        && !has_loopcontrol(node.body, node.body, node)) {
                        // replace labelled statement with its non-labelled body
                        node.start._permute = REPLACEMENTS.length;
                        CHANGED = true;
                        return node.body;
                    }
                    node.start._permute++;
                    CHANGED = true;
                    return List.skip;
                }

                // remove this node unless its the sole element of a (transient) sequence
                if (!(parent instanceof U.AST_Sequence) || parent.expressions.length > 1) {
                    node.start._permute++;
                    CHANGED = true;
                    return List.skip;
                }
            }

            // replace this node
            var newNode = new U.parse(REPLACEMENTS[node.start._permute % REPLACEMENTS.length | 0], {
                expression: true,
            });
            if (is_statement(node)) {
                newNode = new U.AST_SimpleStatement({
                    body: newNode,
                    start: {},
                });
            }
            newNode.start._permute = ++node.start._permute;
            CHANGED = true;
            return newNode;
        }, function(node, in_list) {
            if (node instanceof U.AST_Sequence) {
                // expand single-element sequence
                if (node.expressions.length == 1) return node.expressions[0];
            }
            else if (node instanceof U.AST_Try) {
                // expand orphaned try block
                if (!node.bcatch && !node.bfinally) return new U.AST_BlockStatement({
                    body: node.body,
                    start: {},
                });
            }
            else if (node instanceof U.AST_Var) {
                // remove empty var statement
                if (node.definitions.length == 0) return in_list ? List.skip : new U.AST_EmptyStatement({
                    start: {},
                });
            }
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
                    console.error(ex);
                    console.error("*** Discarding permutation and continuing.");
                    continue;
                }
                var diff = producesDifferentResultWhenMinified(code, minify_options, timeout);
                if (diff) {
                    if (diff.timed_out) {
                        // can't trust the validity of `code_ast` and `code` when timed out.
                        // no harm done - just ignore latest change and continue iterating.
                        if (timeout < max_timeout) timeout += 250;
                    } else if (diff.error) {
                        // something went wrong during minify() - could be malformed AST or genuine bug.
                        // no harm done - just log code & error, ignore latest change and continue iterating.
                        console.error("*** Error during minification.");
                        console.error(code);
                        console.error(diff.error);
                        console.error("*** Discarding permutation and continuing.");
                    } else if (is_error(diff.unminified_result)
                        && is_error(diff.minified_result)
                        && diff.unminified_result.name == diff.minified_result.name) {
                        // ignore difference in error messages caused by minification
                    } else {
                        // latest permutation is valid, so use it as the basis of new changes
                        testcase_ast = code_ast;
                        testcase = code;
                        differs = diff;
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

function has_loopcontrol(body, loop, label) {
    var found = false;
    var tw = new U.TreeWalker(function(node) {
        if (found) return true;
        if (node instanceof U.AST_LoopControl && this.loopcontrol_target(node) === loop) {
            return found = true;
        }
    });
    if (label instanceof U.AST_LabeledStatement) tw.push(label);
    tw.push(loop);
    body.walk(tw);
    return found;
}

function is_error(result) {
    return typeof result == "object" && typeof result.name == "string" && typeof result.message == "string";
}

function is_statement(node) {
    return node instanceof U.AST_Statement && !(node instanceof U.AST_Function);
}

function to_statement(node) {
    return is_statement(node) ? node : new U.AST_SimpleStatement({
        body: node,
        start: {},
    });
}

function producesDifferentResultWhenMinified(code, minify_options, timeout) {
    var minified = U.minify(code, minify_options);
    if (minified.error) return minified;

    var toplevel = minify_options.toplevel;
    var unminified_result = sandbox.run_code(code, toplevel, timeout);
    if (/timed out/i.test(unminified_result)) return false;

    var minified_result = sandbox.run_code(minified.code, toplevel, timeout);
    if (/timed out/i.test(minified_result)) return { timed_out: true };

    return !sandbox.same_stdout(unminified_result, minified_result) ? {
        unminified_result: unminified_result,
        minified_result: minified_result,
    } : false;
}

Error.stackTraceLimit = Infinity;
