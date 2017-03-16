#! /usr/bin/env node

global.UGLIFY_DEBUG = true;

var U = require("../tools/node");
var path = require("path");
var fs = require("fs");
var assert = require("assert");
var vm = require("vm");

var tests_dir = path.dirname(module.filename);

run_compress_tests(function(failures, failed_files) {
    if (failures) {
        console.error("\n!!! Failed " + failures + " test cases.");
        console.error("!!! " + Object.keys(failed_files).join(", "));
        process.exit(1);
    }

    var mocha_tests = require("./mocha.js");
    mocha_tests();

    var run_sourcemaps_tests = require('./sourcemaps');
    run_sourcemaps_tests();

    var run_ast_conversion_tests = require("./mozilla-ast");

    run_ast_conversion_tests({
        iterations: 1000
    });
});

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
    if (input instanceof U.AST_BlockStatement) input = input.body;
    else if (input instanceof U.AST_Statement) input = [ input ];
    else throw new Error("Unsupported input syntax");
    var toplevel = new U.AST_Toplevel({ body: input });
    toplevel.figure_out_scope(mangle_options);
    return toplevel;
}

function run_compress_tests(done) {
    var failures = 0;
    var failed_files = {};
    var dir = test_directory("compress");
    log_directory("compress");
    var files = find_test_files(dir);
    !function test_file() {
        var file = files.shift();
        if (!file) return done(failures, failed_files);
        log_start_file(file);
        var tests = parse_test(path.resolve(dir, file));
        !function test_case() {
            var test = tests.shift();
            if (!test) return test_file();
            log_test(test.name);
            U.base54.reset();
            var options = U.defaults(test.options, {
                warnings: false
            });
            var warnings_emitted = [];
            var original_warn_function = U.AST_Node.warn_function;
            if (test.expect_warnings) {
                U.AST_Node.warn_function = function(text) {
                    warnings_emitted.push("WARN: " + text);
                };
                options.warnings = true;
            }
            var cmp = new U.Compressor(options, true);
            var output_options = test.beautify || {};
            var expect;
            if (test.expect) {
                expect = make_code(as_toplevel(test.expect, test.mangle), output_options);
            } else {
                expect = test.expect_exact;
            }
            var input = as_toplevel(test.input, test.mangle);
            var input_code = make_code(test.input, {
                beautify: true,
                quote_style: 3,
                keep_quoted_props: true
            });
            if (test.mangle_props) {
                input = U.mangle_properties(input, test.mangle_props);
            }
            var output = cmp.compress(input);
            output.figure_out_scope(test.mangle);
            if (test.mangle) {
                output.compute_char_frequency(test.mangle);
                output.mangle_names(test.mangle);
            }
            output = make_code(output, output_options);
            if (expect != output) {
                log("!!! failed\n---INPUT---\n{input}\n---OUTPUT---\n{output}\n---EXPECTED---\n{expected}\n\n", {
                    input: input_code,
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
                        input: input_code,
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
                            input: input_code,
                            expected_warnings: expected_warnings,
                            actual_warnings: actual_warnings,
                        });
                        failures++;
                        failed_files[file] = 1;
                    }
                }
                if (test.expect_stdout) {
                    try {
                        var stdout = run_code(input_code);
                        if (test.expect_stdout != stdout) {
                            log("!!! Invalid input or expected stdout\n---INPUT---\n{input}\n---EXPECTED STDOUT---\n{expected}\n---ACTUAL STDOUT---\n{actual}\n\n", {
                                input: input_code,
                                expected: test.expect_stdout,
                                actual: stdout,
                            });
                            failures++;
                            failed_files[file] = 1;
                        } else {
                            try {
                                stdout = run_code(output);
                                if (test.expect_stdout != stdout) {
                                    log("!!! failed\n---INPUT---\n{input}\n---EXPECTED STDOUT---\n{expected}\n---ACTUAL STDOUT---\n{actual}\n\n", {
                                        input: input_code,
                                        expected: test.expect_stdout,
                                        actual: stdout,
                                    });
                                    failures++;
                                    failed_files[file] = 1;
                                }
                            } catch (ex) {
                                log("!!! Execution of output failed\n---INPUT---\n{input}\n---OUTPUT---\n{output}\n--ERROR--\n{error}\n\n", {
                                    input: input_code,
                                    output: output,
                                    error: ex.toString(),
                                });
                                failures++;
                                failed_files[file] = 1;
                            }
                        }
                    } catch (ex) {
                        log("!!! Execution of input failed\n---INPUT---\n{input}\n--ERROR--\n{error}\n\n", {
                            input: input_code,
                            error: ex.toString(),
                        });
                        failures++;
                        failed_files[file] = 1;
                    }
                }
            }
            test_case();
        }();
    }();
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
    var tests = Object.create(null);
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
    return Object.keys(tests).map(function(name) {
        return tests[name];
    });

    function croak(node) {
        throw new Error(tmpl("Can't understand test file {file} [{line},{col}]\n{code}", {
            file: file,
            line: node.start.line,
            col: node.start.col,
            code: make_code(node, { beautify: false })
        }));
    }

    function read_string(stat) {
        if (stat.TYPE === "SimpleStatement") {
            var body = stat.body;
            out: switch(body.TYPE) {
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
                    ["input", "expect", "expect_exact", "expect_warnings", "expect_stdout"].indexOf(label.name) >= 0,
                    tmpl("Unsupported label {name} [{line},{col}]", {
                        name: label.name,
                        line: label.start.line,
                        col: label.start.col
                    })
                );
                var stat = node.body;
                if (stat instanceof U.AST_BlockStatement) {
                    if (stat.body.length == 1) stat = stat.body[0];
                    else if (stat.body.length == 0) stat = new U.AST_EmptyStatement();
                }
                if (label.name == "expect_exact") {
                    test[label.name] = read_string(stat);
                } else if (label.name == "expect_stdout") {
                    test[label.name] = read_string(stat) + "\n";
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

function run_code(code) {
    var stdout = "";
    var tmp = process.stdout.write;
    process.stdout.write = function(chunk) {
        stdout += chunk;
    };
    try {
        new vm.Script(code).runInNewContext({ console: console }, { timeout: 5000 });
        return stdout;
    } finally {
        process.stdout.write = tmp;
    }
}
