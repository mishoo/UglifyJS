#! /usr/bin/env node

var U = require("../tools/node");
var path = require("path");
var fs = require("fs");
var assert = require("assert");
var sys = require("util");
var Unit = require("deadunit")

var tests_dir = path.dirname(module.filename);
var failures = 0;
var failed_files = {};

run_compress_tests();
if (failures) {
    sys.error("\n!!! Failed " + failures + " test cases.");
    sys.error("!!! " + Object.keys(failed_files).join(", "));
    process.exit(1);
}

Unit.test("pretty tests", function() {
    this.test("proper errors", function() {
        this.count(10)

        try {
            var js = "var =  { invalid_js ]"
            U.minify(js, {
                fromString: true
            })
        } catch(e) {

            this.ok(e instanceof U.JS_Parse_Error)
            this.ok(e.line === 1, e.line)
            this.ok(e.col === 4, e.col)
            this.ok(e.pos === 4, e.pos)
            this.ok(e.message === "Name expected", e.message)
            this.ok(e.stack.indexOf("Name expected") !== -1, e.stack)
            this.ok(e.toString().indexOf("Name expected (line: 1, col: 4, pos: 4)") !== -1, e.toString())
            this.ok(e.stack.indexOf("JS_Parse_Error") !== -1, e.stack)

            // the following test fails because the original calling line of code isn't included in the stack trace
            // to be clear, its not ok that this fails - this needs to be fixed
            this.ok(e.stack.indexOf("run-tests.js") !== -1, e.stack)

            // I think the following fails because of the use of runInContext in tools/node.js
            // again, this is *not* ok
            this.ok(e instanceof Error)

        }
    })
}).writeConsole()

/* -----[ utils ]----- */

function tmpl() {
    return U.string_template.apply(this, arguments);
}

function log() {
    var txt = tmpl.apply(this, arguments);
    sys.puts(txt);
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
            var options = U.defaults(test.options, {
                warnings: false
            });
            var cmp = new U.Compressor(options, true);
            var expect = make_code(as_toplevel(test.expect), false);
            var input = as_toplevel(test.input);
            var input_code = make_code(test.input);
            var output = input.transform(cmp);
            output.figure_out_scope();
            output = make_code(output, false);
            if (expect != output) {
                log("!!! failed\n---INPUT---\n{input}\n---OUTPUT---\n{output}\n---EXPECTED---\n{expected}\n\n", {
                    input: input_code,
                    output: output,
                    expected: expect
                });
                failures++;
                failed_files[file] = 1;
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
    var ast = U.parse(script, {
        filename: file
    });
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
            code: make_code(node, false)
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
                    node.label.name == "input" || node.label.name == "expect",
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
                test[node.label.name] = stat;
                return true;
            }
        });
        block.walk(tw);
        return test;
    };
}

function make_code(ast, beautify) {
    if (arguments.length == 1) beautify = true;
    var stream = U.OutputStream({ beautify: beautify });
    ast.print(stream);
    return stream.get();
}

function evaluate(code) {
    if (code instanceof U.AST_Node)
        code = make_code(code);
    return new Function("return(" + code + ")")();
}
