#! /usr/bin/env node

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var U = require("./node");

var failures = 0;
var failed_files = Object.create(null);
var dir = path.resolve(path.dirname(module.filename), "feature_extraction");
fs.readdirSync(dir).filter(function(name) {
    return /\.js$/i.test(name);
}).forEach(function(file) {
    log("--- {file}", { file: file });
    var tests = parse_test(path.resolve(dir, file));
    for (var i in tests) if (!test_case(tests[i])) {
        failures++;
        failed_files[file] = 1;
    }
});
if (failures) {
    console.error();
    console.error("!!! Failed " + failures + " test case(s).");
    console.error("!!! " + Object.keys(failed_files).join(", "));
    process.exit(1);
}

/* -----[ utils ]----- */

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
              case "Template":
                if (body.expressions.length > 0)
                    throw new Error("Should be empty template string");
                return body.strings.join("\n");
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
                ].indexOf(label.name) >= 0, tmpl("Unsupported label {name} [{line},{col}]", {
                    name: label.name,
                    line: label.start.line,
                    col: label.start.col
                }));
                var stat = node.body;
                if (label.name == "expect") {
                    test[label.name] = read_string(stat);
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

function removeWhitespace(input){
    return input.replace(/\s/g,"");
}

function test_case(test) {
    log("    Running test [{name}]", { name: test.name });
    var features = "FNAMES,ASTREL";
    if (test.options.features) {
        features = test.options.features;
    };

    var expect = test.expect;

    var input_code = make_code(test.input, { beautify: true });
    var output = U.extractFeatures(input_code, test.name, false, features);

    if (removeWhitespace(expect) != removeWhitespace(output)) {
        log("!!! failed\n---INPUT---\n{input}\n---OUTPUT---\n{output}\n---EXPECTED---\n{expected}\n\n", {
            input: input_code,
            output: output,
            expected: expect
        });
        return false;;
    }
    return true;
}

function tmpl() {
    return U.string_template.apply(null, arguments);
}
