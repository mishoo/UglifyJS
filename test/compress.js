var assert = require("assert");
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");
var sandbox = require("./sandbox");
var semver = require("semver");
var U = require("./node");

var file = process.argv[2];
var dir = path.resolve(path.dirname(module.filename), "compress");
if (file) {
    var minify_options = require("./ufuzz/options.json").map(JSON.stringify);
    log("--- {file}", { file: file });
    var tests = parse_test(path.resolve(dir, file));
    process.exit(Object.keys(tests).filter(function(name) {
        return !test_case(tests[name]);
    }).length);
} else {
    var files = fs.readdirSync(dir).filter(function(name) {
        return /\.js$/i.test(name);
    });
    var failures = 0;
    var failed_files = Object.create(null);
    (function next() {
        var file = files.shift();
        if (file) {
            child_process.spawn(process.argv[0], [ process.argv[1], file ], {
                stdio: [ "ignore", 1, 2 ]
            }).on("exit", function(code) {
                if (code) {
                    failures += code;
                    failed_files[file] = code;
                }
                next();
            });
        } else if (failures) {
            console.error();
            console.error("!!! Failed " + failures + " test case(s).");
            console.error("!!! " + Object.keys(failed_files).join(", "));
            process.exit(1);
        }
    })();
}

function evaluate(code) {
    if (code instanceof U.AST_Node) code = make_code(code, { beautify: true });
    return new Function("return(" + code + ")")();
}

function log() {
    console.log("%s", tmpl.apply(null, arguments));
}

function make_code(ast, options) {
    var stream = U.OutputStream(options);
    ast.print(stream);
    return stream.get();
}

function parse_test(file) {
    var script = fs.readFileSync(file, "utf8");
    // TODO try/catch can be removed after fixing https://github.com/mishoo/UglifyJS2/issues/348
    try {
        var ast = U.parse(script, {
            filename: file
        });
    } catch (e) {
        console.error("Caught error while parsing tests in " + file);
        console.error(e);
        process.exit(1);
    }
    var tests = Object.create(null);
    var tw = new U.TreeWalker(function(node, descend) {
        if (node instanceof U.AST_LabeledStatement
            && tw.parent() instanceof U.AST_Toplevel) {
            var name = node.label.name;
            if (name in tests) {
                throw new Error('Duplicated test name "' + name + '" in ' + file);
            }
            tests[name] = get_one_test(name, node.body);
            return true;
        }
        if (!(node instanceof U.AST_Toplevel)) croak(node);
    });
    ast.walk(tw);
    return tests;

    function croak(node) {
        throw new Error(tmpl("Can't understand test file {file} [{line},{col}]\n{code}", {
            file: file,
            line: node.start.line,
            col: node.start.col,
            code: make_code(node, { beautify: false })
        }));
    }

    function read_string(stat) {
        if (stat.TYPE == "SimpleStatement") {
            var body = stat.body;
            switch(body.TYPE) {
              case "String":
                return body.value;
              case "Array":
                return body.elements.map(function(element) {
                    if (element.TYPE !== "String")
                        throw new Error("Should be array of strings");
                    return element.value;
                }).join("\n");
            }
        }
        throw new Error("Should be string or array of strings");
    }

    function get_one_test(name, block) {
        var test = { name: name, options: {} };
        var tw = new U.TreeWalker(function(node, descend) {
            if (node instanceof U.AST_Assign) {
                if (!(node.left instanceof U.AST_SymbolRef)) {
                    croak(node);
                }
                var name = node.left.name;
                test[name] = evaluate(node.right);
                return true;
            }
            if (node instanceof U.AST_LabeledStatement) {
                var label = node.label;
                assert.ok([
                    "input",
                    "expect",
                    "expect_exact",
                    "expect_warnings",
                    "expect_stdout",
                    "node_version",
                ].indexOf(label.name) >= 0, tmpl("Unsupported label {name} [{line},{col}]", {
                    name: label.name,
                    line: label.start.line,
                    col: label.start.col
                }));
                var stat = node.body;
                if (label.name == "expect_exact" || label.name == "node_version") {
                    test[label.name] = read_string(stat);
                } else if (label.name == "expect_stdout") {
                    var body = stat.body;
                    if (body instanceof U.AST_Boolean) {
                        test[label.name] = body.value;
                    } else if (body instanceof U.AST_Call) {
                        var ctor = global[body.expression.name];
                        assert.ok(ctor === Error || ctor.prototype instanceof Error, tmpl("Unsupported expect_stdout format [{line},{col}]", {
                            line: label.start.line,
                            col: label.start.col
                        }));
                        test[label.name] = ctor.apply(null, body.args.map(function(node) {
                            assert.ok(node instanceof U.AST_Constant, tmpl("Unsupported expect_stdout format [{line},{col}]", {
                                line: label.start.line,
                                col: label.start.col
                            }));
                            return node.value;
                        }));
                    } else {
                        test[label.name] = read_string(stat) + "\n";
                    }
                } else {
                    test[label.name] = stat;
                }
                return true;
            }
        });
        block.walk(tw);
        return test;
    }
}

// Try to reminify original input with standard options
// to see if it matches expect_stdout.
function reminify(orig_options, input_code, input_formatted, stdout) {
    for (var i = 0; i < minify_options.length; i++) {
        var options = JSON.parse(minify_options[i]);
        if (options.compress) [
            "keep_fargs",
            "keep_fnames",
        ].forEach(function(name) {
            if (name in orig_options) {
                options.compress[name] = orig_options[name];
            }
        });
        var options_formatted = JSON.stringify(options, null, 4);
        var result = U.minify(input_code, options);
        if (result.error) {
            log([
                "!!! failed input reminify",
                "---INPUT---",
                "{input}",
                "---OPTIONS---",
                "{options}",
                "--ERROR---",
                "{error}",
                "",
                "",
            ].join("\n"), {
                input: input_formatted,
                options: options_formatted,
                error: result.error,
            });
            return false;
        } else {
            var expected = stdout[options.toplevel ? 1 : 0];
            var actual = run_code(result.code, options.toplevel);
            if (typeof expected != "string" && typeof actual != "string" && expected.name == actual.name) {
                actual = expected;
            }
            if (!sandbox.same_stdout(expected, actual)) {
                log([
                    "!!! failed running reminified input",
                    "---INPUT---",
                    "{input}",
                    "---OPTIONS---",
                    "{options}",
                    "---OUTPUT---",
                    "{output}",
                    "---EXPECTED {expected_type}---",
                    "{expected}",
                    "---ACTUAL {actual_type}---",
                    "{actual}",
                    "",
                    "",
                ].join("\n"), {
                    input: input_formatted,
                    options: options_formatted,
                    output: result.code,
                    expected_type: typeof expected == "string" ? "STDOUT" : "ERROR",
                    expected: expected,
                    actual_type: typeof actual == "string" ? "STDOUT" : "ERROR",
                    actual: actual,
                });
                return false;
            }
        }
    }
    return true;
}

function run_code(code, toplevel) {
    var result = sandbox.run_code(code, toplevel);
    return typeof result == "string" ? result.replace(/\u001b\[\d+m/g, "") : result;
}

function test_case(test) {
    log("    Running test [{name}]", { name: test.name });
    var output_options = test.beautify || {};
    var expect;
    if (test.expect) {
        expect = make_code(to_toplevel(test.expect, test.mangle), output_options);
    } else {
        expect = test.expect_exact;
    }
    var input = to_toplevel(test.input, test.mangle);
    var input_code = make_code(input);
    var input_formatted = make_code(test.input, {
        beautify: true,
        comments: "all",
        keep_quoted_props: true,
        quote_style: 3,
    });
    try {
        U.parse(input_code);
    } catch (ex) {
        log([
            "!!! Cannot parse input",
            "---INPUT---",
            "{input}",
            "--PARSE ERROR--",
            "{error}",
            "",
            "",
        ].join("\n"), {
            input: input_formatted,
            error: ex,
        });
        return false;
    }
    var warnings_emitted = [];
    if (test.expect_warnings) {
        var expected_warnings = make_code(test.expect_warnings, {
            beautify: false,
            quote_style: 2, // force double quote to match JSON
        });
        U.AST_Node.log_function(function(text) {
            warnings_emitted.push(text);
        }, /"INFO: /.test(expected_warnings));
    }
    if (test.mangle && test.mangle.properties && test.mangle.properties.keep_quoted) {
        var quoted_props = test.mangle.properties.reserved;
        if (!Array.isArray(quoted_props)) quoted_props = [];
        test.mangle.properties.reserved = quoted_props;
        U.reserve_quoted_keys(input, quoted_props);
    }
    if (test.rename) {
        input.figure_out_scope(test.mangle);
        input.expand_names(test.mangle);
    }
    var cmp = new U.Compressor(test.options, true);
    var output = cmp.compress(input);
    output.figure_out_scope(test.mangle);
    if (test.mangle) {
        output.compute_char_frequency(test.mangle);
        output.mangle_names(test.mangle);
        if (test.mangle.properties) {
            output = U.mangle_properties(output, test.mangle.properties);
        }
    }
    output = make_code(output, output_options);
    if (expect != output) {
        log([
            "!!! failed",
            "---INPUT---",
            "{input}",
            "---OUTPUT---",
            "{output}",
            "---EXPECTED---",
            "{expected}",
            "",
            "",
        ].join("\n"), {
            input: input_formatted,
            output: output,
            expected: expect
        });
        return false;
    }
    // expect == output
    try {
        U.parse(output);
    } catch (ex) {
        log([
            "!!! Test matched expected result but cannot parse output",
            "---INPUT---",
            "{input}",
            "---OUTPUT---",
            "{output}",
            "--REPARSE ERROR--",
            "{error}",
            "",
            "",
        ].join("\n"), {
            input: input_formatted,
            output: output,
            error: ex,
        });
        return false;
    }
    if (test.expect_warnings) {
        warnings_emitted = warnings_emitted.map(function(input) {
            return input.split(process.cwd() + path.sep).join("").split(path.sep).join("/");
        });
        var actual_warnings = JSON.stringify(warnings_emitted);
        if (expected_warnings != actual_warnings) {
            log([
                "!!! failed",
                "---INPUT---",
                "{input}",
                "---EXPECTED WARNINGS---",
                "{expected_warnings}",
                "---ACTUAL WARNINGS---",
                "{actual_warnings}",
                "",
                "",
            ].join("\n"), {
                input: input_formatted,
                expected_warnings: expected_warnings,
                actual_warnings: actual_warnings,
            });
            return false;
        }
    }
    if (test.expect_stdout && (!test.node_version || semver.satisfies(process.version, test.node_version))) {
        var stdout = [ run_code(input_code), run_code(input_code, true) ];
        var toplevel = test.options.toplevel;
        var actual = stdout[toplevel ? 1 : 0];
        if (test.expect_stdout === true) {
            test.expect_stdout = actual;
        }
        if (!sandbox.same_stdout(test.expect_stdout, actual)) {
            log([
                "!!! Invalid input or expected stdout",
                "---INPUT---",
                "{input}",
                "---EXPECTED {expected_type}---",
                "{expected}",
                "---ACTUAL {actual_type}---",
                "{actual}",
                "",
                "",
            ].join("\n"), {
                input: input_formatted,
                expected_type: typeof test.expect_stdout == "string" ? "STDOUT" : "ERROR",
                expected: test.expect_stdout,
                actual_type: typeof actual == "string" ? "STDOUT" : "ERROR",
                actual: actual,
            });
            return false;
        }
        actual = run_code(output, toplevel);
        if (!sandbox.same_stdout(test.expect_stdout, actual)) {
            log([
                "!!! failed",
                "---INPUT---",
                "{input}",
                "---EXPECTED {expected_type}---",
                "{expected}",
                "---ACTUAL {actual_type}---",
                "{actual}",
                "",
                "",
            ].join("\n"), {
                input: input_formatted,
                expected_type: typeof test.expect_stdout == "string" ? "STDOUT" : "ERROR",
                expected: test.expect_stdout,
                actual_type: typeof actual == "string" ? "STDOUT" : "ERROR",
                actual: actual,
            });
            return false;
        }
        if (!reminify(test.options, input_code, input_formatted, stdout)) {
            return false;
        }
    }
    return true;
}

function tmpl() {
    return U.string_template.apply(null, arguments);
}

function to_toplevel(input, mangle_options) {
    if (!(input instanceof U.AST_BlockStatement)) throw new Error("Unsupported input syntax");
    var directive = true;
    var offset = input.start.line;
    var tokens = [];
    var toplevel = new U.AST_Toplevel(input.transform(new U.TreeTransformer(function(node) {
        if (U.push_uniq(tokens, node.start)) node.start.line -= offset;
        if (!directive || node === input) return;
        if (node instanceof U.AST_SimpleStatement && node.body instanceof U.AST_String) {
            return new U.AST_Directive(node.body);
        } else {
            directive = false;
        }
    })));
    toplevel.figure_out_scope(mangle_options);
    return toplevel;
}
