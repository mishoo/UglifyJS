#! /usr/bin/env node

global.UGLIFY_DEBUG = true;

var U = require("../tools/node");
var path = require("path");
var fs = require("fs");
var assert = require("assert");

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

var run_ast_conversion_tests = require("./mozilla-ast");

run_ast_conversion_tests({
    iterations: 1000
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

function as_toplevel(input) {
    if (input instanceof U.AST_BlockStatement) input = input.body;
    else if (input instanceof U.AST_Statement) input = [ input ];
    else throw new Error("Unsupported input syntax");
    var toplevel = new U.AST_Toplevel({ body: input });
    toplevel.figure_out_scope();
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
                expect = make_code(as_toplevel(test.expect), output_options);
            } else {
                expect = test.expect_exact;
            }
            var input = as_toplevel(test.input);
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
                assert.ok(
                    ["input", "expect", "expect_exact", "expect_warnings"].indexOf(node.label.name) >= 0,
                    tmpl("Unsupported label {name} [{line},{col}]", {
                        name: node.label.name,
                        line: node.label.start.line,
                        col: node.label.start.col
                    })
                );
                var stat = node.body;
                if (stat instanceof U.AST_BlockStatement) {
                    if (stat.body.length == 1) stat = stat.body[0];
                    else if (stat.body.length == 0) stat = new U.AST_EmptyStatement();
                }
                if (node.label.name === "expect_exact") {
                    if (!(stat.TYPE === "SimpleStatement" && stat.body.TYPE === "String")) {
                        throw new Error(
                            "The value of the expect_exact clause should be a string, " +
                            "like `expect_exact: \"some.exact.javascript;\"`");
                    }
                    test[node.label.name] = stat.body.start.value
                } else {
                    test[node.label.name] = stat;
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
