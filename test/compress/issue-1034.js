non_hoisted_function_def_after_return: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, cascade: true, side_effects: true
    }
    input: {
        function foo(x) {
            if (x) {
                return bar();
                not_called1();
            } else {
                return baz();
                not_called2();
            }
            function bar() { return 7; }
            return not_reached;
            function UnusedFunction() {}
            function baz() { return 8; }
        }
    }
    expect: {
        function foo(x) {
            return x ? bar() : baz();
            function bar() { return 7 }
            function baz() { return 8 }
        }
    }
    expect_warnings: [
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:11,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:14,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:17,12]",
        "WARN: Dropping unused function UnusedFunction [test/compress/issue-1034.js:18,21]"
    ]
}

