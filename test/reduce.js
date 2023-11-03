var crypto = require("crypto");
var U = require("..");
var List = U.List;
var os = require("os");
var sandbox = require("./sandbox");

// Reduce a test case by iteratively replacing AST nodes with various
// permutations. Each AST_Statement in the tree is also speculatively dropped
// to determine whether it is needed.  If the altered tree and the last known
// good tree produce the same output after being run, then the permutation
// survives to the next generation and is the basis for subsequent iterations.
// The test case is reduced as a consequence of complex expressions being
// replaced with simpler ones.  Note that a reduced test case will have
// different runtime output - it is not functionally equivalent to the
// original. The only criteria is that once the generated reduced test case is
// run without minification, it will produce different output from the code
// minified with `minify_options`.  Returns a `minify` result object.

Error.stackTraceLimit = Infinity;
module.exports = function reduce_test(testcase, minify_options, reduce_options) {
    minify_options = minify_options || {};
    reduce_options = reduce_options || {};
    var parse_options = {
        module: minify_options.module || minify_options.module === undefined,
    }
    var print_options = {};
    [
        "ie",
        "v8",
        "webkit",
    ].forEach(function(name) {
        var value = minify_options[name] || minify_options.output && minify_options.output[name];
        if (value) print_options[name] = value;
    });
    if (testcase instanceof U.AST_Node) testcase = testcase.print_to_string(print_options);
    var max_iterations = reduce_options.max_iterations || 1000;
    var max_timeout = reduce_options.max_timeout || 10000;
    var warnings = [];
    var log = reduce_options.log || function(msg) {
        warnings.push(msg);
    };
    var verbose = reduce_options.verbose;
    var minify_options_json = JSON.stringify(minify_options, null, 2);
    var result_cache = Object.create(null);
    var test_for_diff = compare_run_code;
    // the initial timeout to assess the viability of the test case must be large
    var differs = test_for_diff(testcase, minify_options, result_cache, max_timeout);

    if (verbose) {
        log("// Node.js " + process.version + " on " + os.platform() + " " + os.arch());
    }
    if (differs && differs.error && [ "DefaultsError", "SyntaxError" ].indexOf(differs.error.name) < 0) {
        test_for_diff = test_minify;
        differs = test_for_diff(testcase, minify_options, result_cache, max_timeout);
    }
    // same stdout result produced when minified
    if (!differs) return {
        code: [
            "// Can't reproduce test failure",
            "// minify options: " + to_comment(minify_options_json)
        ].join("\n"),
        warnings: warnings,
    };
    if (differs.timed_out) return {
        code: [
            "// Can't reproduce test failure within " + max_timeout + "ms",
            "// minify options: " + to_comment(minify_options_json)
        ].join("\n"),
        warnings: warnings,
    };
    if (differs.error) {
        differs.warnings = warnings;
        return differs;
    }
    if (sandbox.is_error(differs.unminified_result)
        && sandbox.is_error(differs.minified_result)
        && differs.unminified_result.name == differs.minified_result.name) return {
        code: [
            "// No differences except in error message",
            "// minify options: " + to_comment(minify_options_json)
        ].join("\n"),
        warnings: warnings,
    };
    max_timeout = Math.min(100 * differs.elapsed, max_timeout);
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
        if (!in_list && node instanceof U.AST_EmptyStatement) return;
        if (node instanceof U.AST_Label) return;
        if (node instanceof U.AST_LabelRef) return;
        if (node instanceof U.AST_Toplevel) return;
        var parent = tt.parent();
        if (node instanceof U.AST_SymbolFunarg && parent instanceof U.AST_Accessor) return;
        if (!in_list && parent.rest !== node && node instanceof U.AST_SymbolDeclaration) return;

        // ensure that the _permute prop is a number.
        // can not use `node.start._permute |= 0;` as it will erase fractional part.
        if (typeof node.start._permute === "undefined") node.start._permute = 0;

        // if node reached permutation limit - skip over it.
        // no structural AST changes before this point.
        if (node.start._permute >= REPLACEMENTS.length) return;

        // ignore lvalues
        if (parent instanceof U.AST_Assign && parent.left === node) return;
        if (parent instanceof U.AST_DefaultValue && parent.name === node) return;
        if (parent instanceof U.AST_DestructuredKeyVal && parent.value === node) return;
        if (parent instanceof U.AST_Unary && parent.expression === node) switch (parent.operator) {
          case "++":
          case "--":
          case "delete":
            return;
        }
        if (parent instanceof U.AST_VarDef && parent.name === node) return;
        // preserve class methods
        if (parent instanceof U.AST_ClassMethod && parent.value === node) return;
        // preserve exports
        if (parent instanceof U.AST_ExportDeclaration) return;
        if (parent instanceof U.AST_ExportDefault) return;
        if (parent instanceof U.AST_ExportForeign) return;
        if (parent instanceof U.AST_ExportReferences) return;
        // preserve sole definition of an export statement
        if (node instanceof U.AST_VarDef
            && parent.definitions.length == 1
            && tt.parent(1) instanceof U.AST_ExportDeclaration) {
            return;
        }
        // preserve for (var xxx; ...)
        if (parent instanceof U.AST_For && parent.init === node && node instanceof U.AST_Definitions) return node;
        // preserve for (xxx in/of ...)
        if (parent instanceof U.AST_ForEnumeration && parent.init === node) return node;
        // preserve super(...)
        if (node.TYPE == "Call" && node.expression instanceof U.AST_Super) return;
        if (node instanceof U.AST_Super && parent.TYPE == "Call" && parent.expression === node) return node;

        // node specific permutations with no parent logic

        if (node instanceof U.AST_Array) {
            var expr = node.elements[0];
            if (expr && !(expr instanceof U.AST_Hole)) {
                node.start._permute++;
                CHANGED = true;
                return expr instanceof U.AST_Spread ? expr.expression : expr;
            }
        }
        else if (node instanceof U.AST_Await) {
            node.start._permute++;
            CHANGED = true;
            return node.expression;
        }
        else if (node instanceof U.AST_Binary) {
            var permute = ((node.start._permute += step) * steps | 0) % 4;
            var expr = [
                node.left,
                node.right,
            ][ permute & 1 ];
            if (expr instanceof U.AST_Destructured) expr = expr.transform(new U.TreeTransformer(function(node, descend) {
                if (node instanceof U.AST_DefaultValue) return new U.AST_Assign({
                    operator: "=",
                    left: node.name.transform(this),
                    right: node.value,
                    start: {},
                });
                if (node instanceof U.AST_DestructuredKeyVal) return new U.AST_ObjectKeyVal(node);
                if (node instanceof U.AST_Destructured) {
                    node = new (node instanceof U.AST_DestructuredArray ? U.AST_Array : U.AST_Object)(node);
                    descend(node, this);
                }
                return node;
            }));
            CHANGED = true;
            return permute < 2 ? expr : wrap_with_console_log(expr);
        }
        else if (node instanceof U.AST_BlockStatement) {
            if (in_list && node.body.filter(function(node) {
                return node instanceof U.AST_Const || node instanceof U.AST_Let;
            }).length == 0) {
                node.start._permute++;
                CHANGED = true;
                return List.splice(node.body);
            }
        }
        else if (node instanceof U.AST_Call) {
            var expr = [
                !(node.expression instanceof U.AST_Super) && node.expression,
                node.args[0],
                null,  // intentional
            ][ ((node.start._permute += step) * steps | 0) % 3 ];
            if (expr) {
                CHANGED = true;
                return expr instanceof U.AST_Spread ? expr.expression : expr;
            }
            if (node.expression instanceof U.AST_Arrow && node.expression.value) {
                var seq = node.args.slice();
                seq.push(node.expression.value);
                CHANGED = true;
                return to_sequence(seq);
            }
            if (node.expression instanceof U.AST_Function) {
                // hoist and return expressions from the IIFE function expression
                var scope = tt.find_parent(U.AST_Scope), seq = [];
                node.expression.body.forEach(function(node) {
                    var expr = node instanceof U.AST_Exit ? node.value : node.body;
                    if (expr instanceof U.AST_Node && !U.is_statement(expr) && can_hoist(expr, scope)) {
                        // collect expressions from each statement's body
                        seq.push(expr);
                    }
                });
                CHANGED = true;
                return to_sequence(seq);
            }
        }
        else if (node instanceof U.AST_Catch) {
            // drop catch block
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
        else if (node instanceof U.AST_DefaultValue) {
            node.start._permute++;
            CHANGED = true;
            return node.name;
        }
        else if (node instanceof U.AST_Defun) {
            switch (((node.start._permute += step) * steps | 0) % 2) {
              case 0:
                CHANGED = true;
                return List.skip;
              default:
                if (can_hoist(node, tt.find_parent(U.AST_Scope))) {
                    // hoist function declaration body
                    var body = node.body;
                    node.body = [];
                    // retain function with empty body to be dropped later
                    body.push(node);
                    CHANGED = true;
                    return List.splice(body);
                }
            }
        }
        else if (node instanceof U.AST_DestructuredArray) {
            var expr = node.elements[0];
            if (expr && !(expr instanceof U.AST_Hole)) {
                node.start._permute++;
                CHANGED = true;
                return expr;
            }
        }
        else if (node instanceof U.AST_DestructuredObject) {
            // first property's value
            var expr = node.properties[0];
            if (expr) {
                node.start._permute++;
                CHANGED = true;
                return expr.value;
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
        else if (node instanceof U.AST_ExportDeclaration) {
            node.start._permute++;
            CHANGED = true;
            return node.body;
        }
        else if (node instanceof U.AST_ExportDefault) {
            node.start._permute++;
            CHANGED = true;
            return to_statement(node.body);
        }
        else if (node instanceof U.AST_Finally) {
            // drop finally block
            node.start._permute++;
            CHANGED = true;
            return null;
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
                return to_statement_init(expr);
            }
        }
        else if (node instanceof U.AST_ForEnumeration) {
            var expr;
            switch ((node.start._permute * steps | 0) % 4) {
              case 0:
                expr = node.object;
                break;
              case 1:
                expr = wrap_with_console_log(node.object);
                break;
              case 2:
                if (has_loopcontrol(node.body, node, parent)) break;
                expr = node.body;
                break;
              case 3:
                if (!(node.init instanceof U.AST_Var)) break;
                if (node.init.definitions[0].name instanceof U.AST_Destructured) break;
                expr = node.init;
                break;
            }
            node.start._permute += step;
            if (expr) {
                CHANGED = true;
                return to_statement_init(expr);
            }
        }
        else if (node instanceof U.AST_If) {
            var expr = [
                node.condition,
                node.body,
                node.alternative,
                node,
            ][ (node.start._permute * steps | 0) % 4 ];
            node.start._permute += step;
            if (expr === node) {
                if (node.alternative) {
                    expr = node.clone();
                    expr.alternative = null;
                    CHANGED = true;
                    return expr;
                }
            } else if (expr) {
                // replace if statement with its condition, then block or else block
                CHANGED = true;
                return to_statement(expr);
            }
        }
        else if (node instanceof U.AST_LabeledStatement) {
            if (node.body instanceof U.AST_Statement
                && !has_loopcontrol(node.body, node.body, node)) {
                // replace labelled statement with its non-labelled body
                node.start._permute = REPLACEMENTS.length;
                CHANGED = true;
                return node.body;
            }
        }
        else if (node instanceof U.AST_Object) {
            // first property's value
            var expr = node.properties[0];
            if (expr instanceof U.AST_ObjectKeyVal) {
                expr = expr.value;
            } else if (expr instanceof U.AST_Spread) {
                expr = expr.expression;
            } else if (expr && expr.key instanceof U.AST_Node) {
                expr = expr.key;
            } else {
                expr = null;
            }
            if (expr) {
                node.start._permute++;
                CHANGED = true;
                return expr;
            }
        }
        else if (node instanceof U.AST_PropAccess) {
            var expr = [
                !(node.expression instanceof U.AST_Super) && node.expression,
                node.property instanceof U.AST_Node && !(parent instanceof U.AST_Destructured) && node.property,
            ][ node.start._permute++ % 2 ];
            if (expr) {
                CHANGED = true;
                return expr;
            }
        }
        else if (node instanceof U.AST_SimpleStatement) {
            if (node.body instanceof U.AST_Call && node.body.expression instanceof U.AST_Function) {
                // hoist simple statement IIFE function expression body
                node.start._permute++;
                if (can_hoist(node.body.expression, tt.find_parent(U.AST_Scope))) {
                    CHANGED = true;
                    return List.splice(node.body.expression.body);
                }
            }
        }
        else if (node instanceof U.AST_Switch) {
            var expr = [
                node.expression,                         // switch expression
                node.body[0] && node.body[0].expression, // first case expression or undefined
                node.body[0],                            // first case body or undefined
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
        else if (node instanceof U.AST_Var) {
            if (node.definitions.length == 1 && node.definitions[0].value) {
                // first declaration value
                node.start._permute++;
                CHANGED = true;
                return to_statement(node.definitions[0].value);
            }
        }
        else if (node instanceof U.AST_VarDef) {
            if (node.value && !(node.name instanceof U.AST_Destructured || parent instanceof U.AST_Const)) {
                node.start._permute++;
                CHANGED = true;
                return new U.AST_VarDef({
                    name: node.name,
                    start: {},
                });
            }
        }

        if (in_list) {
            // drop switch branches
            if (parent instanceof U.AST_Switch && parent.expression != node) {
                node.start._permute++;
                CHANGED = true;
                return List.skip;
            }

            // replace or skip statement
            if (node instanceof U.AST_Statement) {
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
        } else if (parent.rest === node) {
            node.start._permute++;
            CHANGED = true;
            return null;
        }

        // replace this node
        var newNode = U.is_statement(node) ? new U.AST_EmptyStatement({
            start: {},
        }) : U.parse(REPLACEMENTS[node.start._permute % REPLACEMENTS.length | 0], {
            expression: true,
        });
        newNode.start._permute = ++node.start._permute;
        CHANGED = true;
        return newNode;
    }, function(node, in_list) {
        if (node instanceof U.AST_Definitions) {
            // remove empty var statement
            if (node.definitions.length == 0) return in_list ? List.skip : new U.AST_EmptyStatement({
                start: {},
            });
        } else if (node instanceof U.AST_ObjectMethod) {
            if (!/Function$/.test(node.value.TYPE)) return new U.AST_ObjectKeyVal({
                key: node.key,
                value: node.value,
                start: {},
            });
        } else if (node instanceof U.AST_Sequence) {
            // expand single-element sequence
            if (node.expressions.length == 1) return node.expressions[0];
        } else if (node instanceof U.AST_Try) {
            // expand orphaned try block
            if (!node.bcatch && !node.bfinally) return new U.AST_BlockStatement({
                body: node.body,
                start: {},
            });
        }
    });

    var before_iterations, diff_error_message, passes = 3, testcase_ast;
    for (var pass = 1; pass <= passes; pass++) {
        if (before_iterations !== testcase) {
            testcase_ast = U.parse(testcase, parse_options);
            if (diff_error_message === testcase) {
                // only difference detected is in error message, so expose that and try again
                testcase_ast.transform(new U.TreeTransformer(function(node, descend) {
                    if (node.TYPE == "Call" && node.expression.print_to_string() == "console.log") {
                        return to_sequence(node.args);
                    }
                    if (node instanceof U.AST_Catch && node.argname instanceof U.AST_SymbolCatch) {
                        descend(node, this);
                        node.body.unshift(new U.AST_SimpleStatement({
                            body: wrap_with_console_log(new U.AST_SymbolRef(node.argname)),
                            start: {},
                        }));
                        return node;
                    }
                }));
                var code = testcase_ast.print_to_string(print_options);
                var diff = test_for_diff(code, minify_options, result_cache, max_timeout);
                if (diff && !diff.timed_out && !diff.error) {
                    testcase = code;
                    differs = diff;
                } else {
                    testcase_ast = U.parse(testcase, parse_options);
                }
            }
            diff_error_message = null;
            testcase_ast.walk(new U.TreeWalker(function(node) {
                // unshare start props to retain visit data between iterations
                node.start = JSON.parse(JSON.stringify(node.start));
                node.start._permute = 0;
            }));
            before_iterations = testcase;
        }
        for (var c = 0; c < max_iterations; c++) {
            if (verbose && c % (pass == 1 ? 25 : 100) == 0) {
                log("// reduce test pass " + pass + ", iteration " + c + ": " + testcase.length + " bytes");
            }
            var CHANGED = false;
            var code_ast = testcase_ast.clone(true).transform(tt);
            if (!CHANGED) break;
            try {
                var code = code_ast.print_to_string(print_options);
            } catch (ex) {
                // AST is not well formed.
                // no harm done - just log the error, ignore latest change and continue iterating.
                log("*** Error generating code from AST.");
                log(ex.stack);
                log("*** Discarding permutation and continuing.");
                continue;
            }
            var diff = test_for_diff(code, minify_options, result_cache, max_timeout);
            if (diff) {
                if (diff.timed_out) {
                    // can't trust the validity of `code_ast` and `code` when timed out.
                    // no harm done - just ignore latest change and continue iterating.
                } else if (diff.error) {
                    // something went wrong during minify() - could be malformed AST or genuine bug.
                    // no harm done - just log code & error, ignore latest change and continue iterating.
                    log("*** Error during minification.");
                    log(code);
                    log(diff.error.stack);
                    log("*** Discarding permutation and continuing.");
                } else if (sandbox.is_error(diff.unminified_result)
                    && sandbox.is_error(diff.minified_result)
                    && diff.unminified_result.name == diff.minified_result.name) {
                    // ignore difference in error messages caused by minification
                    diff_error_message = testcase;
                } else {
                    // latest permutation is valid, so use it as the basis of new changes
                    testcase_ast = code_ast;
                    testcase = code;
                    differs = diff;
                }
            }
        }
        if (before_iterations !== testcase) continue;
        if (c < max_iterations) break;
        passes++;
    }
    var beautified = U.minify(testcase, {
        compress: false,
        mangle: false,
        module: minify_options.module,
        output: function() {
            var options = JSON.parse(JSON.stringify(print_options));
            options.beautify = true;
            options.braces = true;
            options.comments = true;
            return options;
        }(),
    });
    testcase = {
        code: testcase,
    };
    if (!beautified.error) {
        diff = test_for_diff(beautified.code, minify_options, result_cache, max_timeout);
        if (diff && !diff.timed_out && !diff.error) {
            testcase = beautified;
            testcase.code = "// (beautified)\n" + testcase.code;
            differs = diff;
        }
    }
    var lines = [ "" ];
    if (isNaN(max_timeout)) {
        lines.push("// minify error: " + to_comment(differs.minified_result.stack));
    } else {
        var unminified_result = differs.unminified_result;
        var minified_result = differs.minified_result;
        if (trim_trailing_whitespace(unminified_result) == trim_trailing_whitespace(minified_result)) {
            lines.push(
                "// (stringified)",
                "// output: " + JSON.stringify(unminified_result),
                "// minify: " + JSON.stringify(minified_result)
            );
        } else {
            lines.push(
                "// output: " + to_comment(unminified_result),
                "// minify: " + to_comment(minified_result)
            );
        }
    }
    lines.push("// options: " + to_comment(minify_options_json));
    testcase.code += lines.join("\n");
    testcase.warnings = warnings;
    return testcase;
};

function to_comment(value) {
    return ("" + value).replace(/\n/g, "\n// ");
}

function trim_trailing_whitespace(value) {
    return ("" + value).replace(/\s+$/, "");
}

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

function can_hoist(body, scope) {
    var found = false;
    var tw = new U.TreeWalker(function(node) {
        if (found) return true;
        if (node instanceof U.AST_Exit) return found = true;
        if (node instanceof U.AST_NewTarget) return found = true;
        if (node instanceof U.AST_Scope) {
            if (node === body) return;
            if (node instanceof U.AST_Arrow || node instanceof U.AST_AsyncArrow) node.argnames.forEach(function(sym) {
                sym.walk(tw);
            });
            // don't descend into nested functions
            return true;
        }
        if (node instanceof U.AST_Super) return found = true;
        if (node instanceof U.AST_SymbolDeclaration || node instanceof U.AST_SymbolRef) switch (node.name) {
          case "await":
            if (/^Async/.test(scope.TYPE)) return found = true;
            return;
          case "yield":
            if (/Generator/.test(scope.TYPE)) return found = true;
            return;
        }
    });
    body.walk(tw);
    return !found;
}

function is_timed_out(result) {
    return sandbox.is_error(result) && /timed out/.test(result.message);
}

function merge_sequence(array, node) {
    if (node instanceof U.AST_Sequence) {
        array.push.apply(array, node.expressions);
    } else {
        array.push(node);
    }
    return array;
}

function to_sequence(expressions) {
    if (expressions.length == 0) return new U.AST_Number({value: 0, start: {}});
    if (expressions.length == 1) return expressions[0];
    return new U.AST_Sequence({
        expressions: expressions.reduce(merge_sequence, []),
        start: {},
    });
}

function to_statement(node) {
    return U.is_statement(node) ? node : new U.AST_SimpleStatement({
        body: node,
        start: {},
    });
}

function to_statement_init(node) {
    return node instanceof U.AST_Const || node instanceof U.AST_Let ? new U.AST_BlockStatement({
        body: [ node ],
        start: {},
    }) : to_statement(node);
}

function wrap_with_console_log(node) {
    // wrap with console.log()
    return new U.AST_Call({
        expression: new U.AST_Dot({
            expression: new U.AST_SymbolRef({
                name: "console",
                start: {},
            }),
            property: "log",
            start: {},
        }),
        args: [ node ],
        start: {},
    });
}

function run_code(code, toplevel, result_cache, timeout) {
    var key = crypto.createHash("sha1").update(code).digest("base64");
    var value = result_cache[key];
    if (!value) {
        var start = Date.now();
        result_cache[key] = value = {
            result: sandbox.run_code(code, toplevel, timeout),
            elapsed: Date.now() - start,
        };
    }
    return value;
}

function compare_run_code(code, minify_options, result_cache, max_timeout) {
    var minified = U.minify(code, minify_options);
    if (minified.error) return minified;

    var toplevel = sandbox.has_toplevel(minify_options);
    var unminified = run(code, max_timeout);
    var timeout = Math.min(100 * unminified.elapsed, max_timeout);
    var minified_result = run(minified.code, timeout).result;

    if (sandbox.same_stdout(unminified.result, minified_result)) {
        return is_timed_out(unminified.result) && is_timed_out(minified_result) && {
            timed_out: true,
        };
    }
    return {
        unminified_result: unminified.result,
        minified_result: minified_result,
        elapsed: unminified.elapsed,
    };

    function run(code, timeout) {
        return run_code(sandbox.patch_module_statements(code, minify_options.module), toplevel, result_cache, timeout);
    }
}

function test_minify(code, minify_options) {
    var minified = U.minify(code, minify_options);
    return minified.error && {
        minified_result: minified.error,
    };
}
