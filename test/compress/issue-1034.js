non_hoisted_function_after_return: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, side_effects: true
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
        'WARN: Dropping unreachable code [test/compress/issue-1034.js:11,16]',
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:14,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:17,12]",
        "WARN: Dropping unused function UnusedFunction [test/compress/issue-1034.js:18,21]"
    ]
}

non_hoisted_function_after_return_2a: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, side_effects: true,
        collapse_vars: false, passes: 2, warnings: "verbose"
    }
    input: {
        function foo(x) {
            if (x) {
                return bar(1);
                var a = not_called(1);
            } else {
                return bar(2);
                var b = not_called(2);
            }
            var c = bar(3);
            function bar(x) { return 7 - x; }
            function nope() {}
            return b || c;
        }
    }
    expect: {
        function foo(x) {
            return bar(x ? 1 : 2);
            function bar(x) {
                return 7 - x;
            }
        }
    }
    expect_warnings: [
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:48,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:48,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:51,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:51,16]",
        "WARN: Dropping unused variable a [test/compress/issue-1034.js:48,20]",
        "WARN: Dropping unused function nope [test/compress/issue-1034.js:55,21]",
        "WARN: pass 0: last_count: Infinity, count: 37",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:53,12]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:53,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:56,12]",
        "WARN: Dropping unused variable b [test/compress/issue-1034.js:51,20]",
        "WARN: Dropping unused variable c [test/compress/issue-1034.js:53,16]",
        "WARN: pass 1: last_count: 37, count: 18",
    ]
}

non_hoisted_function_after_return_2b: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, side_effects: true,
        collapse_vars: false
    }
    input: {
        function foo(x) {
            if (x) {
                return bar(1);
            } else {
                return bar(2);
                var b;
            }
            var c = bar(3);
            function bar(x) {
                return 7 - x;
            }
            return b || c;
        }
    }
    expect: {
        function foo(x) {
            return bar(x ? 1 : 2);
            function bar(x) { return 7 - x; }
        }
    }
    expect_warnings: [
        // duplicate warnings no longer emitted
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:97,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:97,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:99,12]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:99,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:103,12]",
    ]
}

non_hoisted_function_after_return_strict: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, side_effects: true
    }
    input: {
        "use strict";
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
        console.log(foo(0), foo(1));
    }
    expect: {
        "use strict";
        function foo(x) {
            return x ? bar() : baz();
            function bar() { return 7 }
            function baz() { return 8 }
        }
        console.log(foo(0), foo(1));
    }
    expect_stdout: "8 7"
    expect_warnings: [
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:133,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:136,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:139,12]",
        "WARN: Dropping unused function UnusedFunction [test/compress/issue-1034.js:140,21]",
    ]
}

non_hoisted_function_after_return_2a_strict: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, side_effects: true,
        collapse_vars: false, passes: 2, warnings: "verbose"
    }
    input: {
        "use strict";
        function foo(x) {
            if (x) {
                return bar(1);
                var a = not_called(1);
            } else {
                return bar(2);
                var b = not_called(2);
            }
            var c = bar(3);
            function bar(x) { return 7 - x; }
            function nope() {}
            return b || c;
        }
        console.log(foo(0), foo(1));
    }
    expect: {
        "use strict";
        function foo(x) {
            return bar(x ? 1 : 2);
            function bar(x) {
                return 7 - x;
            }
        }
        console.log(foo(0), foo(1));
    }
    expect_stdout: "5 6"
    expect_warnings: [
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:175,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:175,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:178,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:178,16]",
        "WARN: Dropping unused variable a [test/compress/issue-1034.js:175,20]",
        "WARN: Dropping unused function nope [test/compress/issue-1034.js:182,21]",
        "WARN: pass 0: last_count: Infinity, count: 48",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:180,12]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:180,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:183,12]",
        "WARN: Dropping unused variable b [test/compress/issue-1034.js:178,20]",
        "WARN: Dropping unused variable c [test/compress/issue-1034.js:180,16]",
        "WARN: pass 1: last_count: 48, count: 29",
    ]
}

non_hoisted_function_after_return_2b_strict: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, side_effects: true,
        collapse_vars: false
    }
    input: {
        "use strict";
        function foo(x) {
            if (x) {
                return bar(1);
            } else {
                return bar(2);
                var b;
            }
            var c = bar(3);
            function bar(x) {
                return 7 - x;
            }
            return b || c;
        }
        console.log(foo(0), foo(1));
    }
    expect: {
        "use strict";
        function foo(x) {
            return bar(x ? 1 : 2);
            function bar(x) { return 7 - x; }
        }
        console.log(foo(0), foo(1));
    }
    expect_stdout: "5 6"
    expect_warnings: [
        // duplicate warnings no longer emitted
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:229,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:229,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:231,12]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:231,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:235,12]",
    ]
}
