reported: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        properties: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f1() {
            if (a == 1 || b == 2)
                foo();
        }
        function f2() {
            if (!(a == 1 || b == 2));
            else
                foo();
        }
    }
    expect: {
        function f1() {
            1 != a && 2 != b || foo();
        }
        function f2() {
            1 != a && 2 != b || foo();
        }
    }
}

test_negated_is_best: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        properties: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f3() {
            if (a == 1 | b == 2)
                foo();
        }
        function f4() {
            if (!(a == 1 | b == 2));
            else
                foo();
        }
        function f5() {
            if (a == 1 && b == 2)
                foo();
        }
        function f6() {
            if (!(a == 1 && b == 2));
            else
                foo();
        }
        function f7() {
            if (a == 1 || b == 2)
                foo();
            else
                return bar();
        }
    }
    expect: {
        function f3() {
            1 == a | 2 == b && foo();
        }
        function f4() {
            1 == a | 2 == b && foo();
        }
        function f5() {
            1 == a && 2 == b && foo();
        }
        function f6() {
            1 == a && 2 == b && foo();
        }
        function f7() {
            if (1 != a && 2 != b)
                return bar();
            foo();
        }
    }
}

