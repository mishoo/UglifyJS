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
            return x ? bar() : baz();
            function bar() { return 7 }
            function baz() { return 8 }
        }
    }
    expect_warnings: [
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:20,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:23,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:26,12]",
        "WARN: Dropping unused function UnusedFunction [test/compress/issue-1034.js:27,21]"
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
        warnings: "verbose",
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
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:68,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:68,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:71,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:71,16]",
        "WARN: Dropping unused variable a [test/compress/issue-1034.js:68,20]",
        "WARN: Dropping unused function nope [test/compress/issue-1034.js:75,21]",
        "WARN: pass 0: last_count: Infinity, count: 37",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:73,12]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:73,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:76,12]",
        "WARN: Dropping unused variable b [test/compress/issue-1034.js:71,20]",
        "WARN: Dropping unused variable c [test/compress/issue-1034.js:73,16]",
        "WARN: pass 1: last_count: 37, count: 18",
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
        // duplicate warnings no longer emitted
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:126,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:126,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:128,12]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:128,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:132,12]",
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
            return x ? bar() : baz();
            function bar() { return 7 }
            function baz() { return 8 }
        }
        console.log(foo(0), foo(1));
    }
    expect_stdout: "8 7"
    expect_warnings: [
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:171,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:174,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:177,12]",
        "WARN: Dropping unused function UnusedFunction [test/compress/issue-1034.js:178,21]",
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
        warnings: "verbose",
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
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:224,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:224,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:227,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:227,16]",
        "WARN: Dropping unused variable a [test/compress/issue-1034.js:224,20]",
        "WARN: Dropping unused function nope [test/compress/issue-1034.js:231,21]",
        "WARN: pass 0: last_count: Infinity, count: 48",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:229,12]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:229,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:232,12]",
        "WARN: Dropping unused variable b [test/compress/issue-1034.js:227,20]",
        "WARN: Dropping unused variable c [test/compress/issue-1034.js:229,16]",
        "WARN: pass 1: last_count: 48, count: 29",
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
        // duplicate warnings no longer emitted
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:287,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:287,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:289,12]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:289,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:293,12]",
    ]
}
