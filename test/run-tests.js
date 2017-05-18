#! /usr/bin/env node

var U = require("./node");
var path = require("path");
var fs = require("fs");
var assert = require("assert");
var sandbox = require("./sandbox");
var semver = require("semver");

var tests_dir = path.dirname(module.filename);
var failures = 0;
var failed_files = {};

run_compress_tests();
if (failures) {
    console.error("\n!!! Failed " + failures + " test cases.");
    console.error("!!! " + Object.keys(failed_files).join(", "));
    process.exit(1);
}

var mocha_tests = require("./mocha.js");
mocha_tests();

var run_sourcemaps_tests = require('./sourcemaps');
run_sourcemaps_tests();

/* -----[ utils ]----- */

function tmpl() {
    return U.string_template.apply(this, arguments);
}

function log() {
    var txt = tmpl.apply(this, arguments);
    console.log("%s", txt);
}

function log_directory(dir) {
    log("*** Entering [{dir}]", { dir: dir });
}

function log_start_file(file) {
    log("--- {file}", { file: file });
}

function log_test(name) {
    log("    Running test [{name}]", { name: name });
}

function find_test_files(dir) {
    var files = fs.readdirSync(dir).filter(function(name){
        return /\.js$/i.test(name);
    });
    if (process.argv.length > 2) {
        var x = process.argv.slice(2);
        files = files.filter(function(f){
            return x.indexOf(f) >= 0;
        });
    }
    return files;
}

function test_directory(dir) {
    return path.resolve(tests_dir, dir);
}

function as_toplevel(input, mangle_options) {
    if (!(input instanceof U.AST_BlockStatement))
        throw new Error("Unsupported input syntax");
    for (var i = 0; i < input.body.length; i++) {
        var stat = input.body[i];
        if (stat instanceof U.AST_SimpleStatement && stat.body instanceof U.AST_String)
            input.body[i] = new U.AST_Directive(stat.body);
        else break;
    }
    var toplevel = new U.AST_Toplevel(input);
    toplevel.figure_out_scope(mangle_options);
    return toplevel;
}

function run_compress_tests() {
    var dir = test_directory("compress");
    log_directory("compress");
    var files = find_test_files(dir);
    function test_file(file) {
        log_start_file(file);
        function test_case(test) {
            log_test(test.name);
            U.base54.reset();
            var output_options = test.beautify || {};
            var expect;
            if (test.expect) {
                expect = make_code(as_toplevel(test.expect, test.mangle), output_options);
            } else {
                expect = test.expect_exact;
            }
            var input = as_toplevel(test.input, test.mangle);
            var input_code = make_code(input, output_options);
            var input_formatted = make_code(test.input, {
                beautify: true,
                quote_style: 3,
                keep_quoted_props: true
            });
            if (test.mangle_props) {
                input = U.mangle_properties(input, test.mangle_props);
            }
            var options = U.defaults(test.options, {
                warnings: false
            });
            var warnings_emitted = [];
            var original_warn_function = U.AST_Node.warn_function;
            if (test.expect_warnings) {
                U.AST_Node.warn_function = function(text) {
                    warnings_emitted.push("WARN: " + text);
                };
                if (!options.warnings) options.warnings = true;
            }
            var cmp = new U.Compressor(options, true);
            var output = cmp.compress(input);
            output.figure_out_scope(test.mangle);
            if (test.mangle) {
                output.compute_char_frequency(test.mangle);
                output.mangle_names(test.mangle);
            }
            output = make_code(output, output_options);
            if (expect != output) {
                log("!!! failed\n---INPUT---\n{input}\n---OUTPUT---\n{output}\n---EXPECTED---\n{expected}\n\n", {
                    input: input_formatted,
                    output: output,
                    expected: expect
                });
                failures++;
                failed_files[file] = 1;
            }
            else {
                // expect == output
                try {
                    var reparsed_ast = U.parse(output);
                } catch (ex) {
                    log("!!! Test matched expected result but cannot parse output\n---INPUT---\n{input}\n---OUTPUT---\n{output}\n--REPARSE ERROR--\n{error}\n\n", {
                        input: input_formatted,
                        output: output,
                        error: ex.toString(),
                    });
                    failures++;
                    failed_files[file] = 1;
                }
                if (test.expect_warnings) {
                    U.AST_Node.warn_function = original_warn_function;
                    var expected_warnings = make_code(test.expect_warnings, {
                        beautify: false,
                        quote_style: 2, // force double quote to match JSON
                    });
                    warnings_emitted = warnings_emitted.map(function(input) {
                      return input.split(process.cwd() + path.sep).join("").split(path.sep).join("/");
                    });
                    var actual_warnings = JSON.stringify(warnings_emitted);
                    if (expected_warnings != actual_warnings) {
                        log("!!! failed\n---INPUT---\n{input}\n---EXPECTED WARNINGS---\n{expected_warnings}\n---ACTUAL WARNINGS---\n{actual_warnings}\n\n", {
                            input: input_formatted,
                            expected_warnings: expected_warnings,
                            actual_warnings: actual_warnings,
                        });
                        failures++;
                        failed_files[file] = 1;
                    }
                }
                if (test.expect_stdout
                    && (!test.node_version || semver.satisfies(process.version, test.node_version))) {
                    var stdout = sandbox.run_code(input_code);
                    if (test.expect_stdout === true) {
                        test.expect_stdout = stdout;
                    }
                    if (!sandbox.same_stdout(test.expect_stdout, stdout)) {
                        log("!!! Invalid input or expected stdout\n---INPUT---\n{input}\n---EXPECTED {expected_type}---\n{expected}\n---ACTUAL {actual_type}---\n{actual}\n\n", {
                            input: input_formatted,
                            expected_type: typeof test.expect_stdout == "string" ? "STDOUT" : "ERROR",
                            expected: test.expect_stdout,
                            actual_type: typeof stdout == "string" ? "STDOUT" : "ERROR",
                            actual: stdout,
                        });
                        failures++;
                        failed_files[file] = 1;
                    } else {
                        stdout = sandbox.run_code(output);
                        if (!sandbox.same_stdout(test.expect_stdout, stdout)) {
                            log("!!! failed\n---INPUT---\n{input}\n---EXPECTED {expected_type}---\n{expected}\n---ACTUAL {actual_type}---\n{actual}\n\n", {
                                input: input_formatted,
                                expected_type: typeof test.expect_stdout == "string" ? "STDOUT" : "ERROR",
                                expected: test.expect_stdout,
                                actual_type: typeof stdout == "string" ? "STDOUT" : "ERROR",
                                actual: stdout,
                            });
                            failures++;
                            failed_files[file] = 1;
                        }
                    }
                }
            }
        }
        var tests = parse_test(path.resolve(dir, file));
        for (var i in tests) if (tests.hasOwnProperty(i)) {
            test_case(tests[i]);
        }
    }
    files.forEach(function(file){
        test_file(file);
    });
}

function parse_test(file) {
    var script = fs.readFileSync(file, "utf8");
    // TODO try/catch can be removed after fixing https://github.com/mishoo/UglifyJS2/issues/348
    try {
        var ast = U.parse(script, {
            filename: file
        });
    } catch (e) {
        console.log("Caught error while parsing tests in " + file + "\n");
        console.log(e);
        throw e;
    }
    var tests = {};
    var tw = new U.TreeWalker(function(node, descend){
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
        var tw = new U.TreeWalker(function(node, descend){
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
                assert.ok(
                    [
                        "input",
                        "expect",
                        "expect_exact",
                        "expect_warnings",
                        "expect_stdout",
                        "node_version",
                    ].indexOf(label.name) >= 0,
                    tmpl("Unsupported label {name} [{line},{col}]", {
                        name: label.name,
                        line: label.start.line,
                        col: label.start.col
                    })
                );
                var stat = node.body;
                if (label.name == "expect_exact" || label.name == "node_version") {
                    test[label.name] = read_string(stat);
                } else if (label.name == "expect_stdout") {
                    if (stat.TYPE == "SimpleStatement" && stat.body instanceof U.AST_Boolean) {
                        test[label.name] = stat.body.value;
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
    };
}

function make_code(ast, options) {
    options.inline_script = true;
    var stream = U.OutputStream(options);
    ast.print(stream);
    return stream.get();
}

function evaluate(code) {
    if (code instanceof U.AST_Node)
        code = make_code(code, { beautify: true });
    return new Function("return(" + code + ")")();
}
