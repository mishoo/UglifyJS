non_hoisted_function_after_return: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: false,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        side_effects: true,
        unused: true,
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
            return (x ? bar : baz)();
            function bar() { return 7 }
            function baz() { return 8 }
        }
    }
    expect_warnings: [
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:4,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:7,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:10,12]",
        "WARN: Dropping unused function UnusedFunction [test/compress/issue-1034.js:11,21]",
    ]
}

non_hoisted_function_after_return_2a: {
    options = {
        booleans: true,
        collapse_vars: false,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: false,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        passes: 2,
        side_effects: true,
        unused: true,
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
        "WARN: Dropping initialization in unreachable code [test/compress/issue-1034.js:4,16]",
        "WARN: Dropping initialization in unreachable code [test/compress/issue-1034.js:7,16]",
        "WARN: Dropping unused variable a [test/compress/issue-1034.js:4,20]",
        "WARN: Dropping unused function nope [test/compress/issue-1034.js:11,21]",
        "INFO: pass 0: last_count: Infinity, count: 35",
        "WARN: Dropping initialization in unreachable code [test/compress/issue-1034.js:9,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:12,12]",
        "INFO: Dropping unused variable b [test/compress/issue-1034.js:7,20]",
        "INFO: Dropping unused variable c [test/compress/issue-1034.js:9,16]",
        "INFO: pass 1: last_count: 35, count: 18",
    ]
}

non_hoisted_function_after_return_2b: {
    options = {
        booleans: true,
        collapse_vars: false,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: false,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        side_effects: true,
        unused: true,
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
        "WARN: Dropping initialization in unreachable code [test/compress/issue-1034.js:8,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:12,12]",
    ]
}

non_hoisted_function_after_return_strict: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: false,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        side_effects: true,
        unused: true,
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
            return (x ? bar : baz)();
            function bar() { return 7 }
            function baz() { return 8 }
        }
        console.log(foo(0), foo(1));
    }
    expect_stdout: "8 7"
    expect_warnings: [
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:5,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:8,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:11,12]",
        "WARN: Dropping unused function UnusedFunction [test/compress/issue-1034.js:12,21]",
    ]
}

non_hoisted_function_after_return_2a_strict: {
    options = {
        booleans: true,
        collapse_vars: false,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: false,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        passes: 2,
        side_effects: true,
        unused: true,
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
        "WARN: Dropping initialization in unreachable code [test/compress/issue-1034.js:5,16]",
        "WARN: Dropping initialization in unreachable code [test/compress/issue-1034.js:8,16]",
        "WARN: Dropping unused variable a [test/compress/issue-1034.js:5,20]",
        "WARN: Dropping unused function nope [test/compress/issue-1034.js:12,21]",
        "INFO: pass 0: last_count: Infinity, count: 46",
        "WARN: Dropping initialization in unreachable code [test/compress/issue-1034.js:10,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:13,12]",
        "INFO: Dropping unused variable b [test/compress/issue-1034.js:8,20]",
        "INFO: Dropping unused variable c [test/compress/issue-1034.js:10,16]",
        "INFO: pass 1: last_count: 46, count: 29",
    ]
}

non_hoisted_function_after_return_2b_strict: {
    options = {
        booleans: true,
        collapse_vars: false,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: false,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        side_effects: true,
        unused: true,
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
        "WARN: Dropping initialization in unreachable code [test/compress/issue-1034.js:9,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:13,12]",
    ]
}
