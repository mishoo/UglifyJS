with_in_global_scope: {
    options = {
        unused: true
    }
    input: {
        var o = 42;
        with(o) {
            var foo = 'something'
        }
        doSomething(o);
    }
    expect: {
        var o=42;
        with(o)
            var foo = "something";
        doSomething(o);
    }
}
with_in_function_scope: {
    options = {
        unused: true
    }
    input: {
        function foo() {
            var o = 42;
            with(o) {
                var foo = "something"
            }
            doSomething(o);
        }
    }
    expect: {
        function foo() {
            var o=42;
            with(o)
                var foo = "something";
            doSomething(o)
        }
    }
}
compress_with_with_in_other_scope: {
    options = {
        unused: true
    }
    input: {
        function foo() {
            var o = 42;
            with(o) {
                var foo = "something"
            }
            doSomething(o);
        }
        function bar() {
            var unused = 42;
            return something();
        }
    }
    expect: {
        function foo() {
            var o = 42;
            with(o)
                var foo = "something";
            doSomething(o)
        }
        function bar() {
            return something()
        }
    }
}
with_using_existing_variable_outside_scope: {
    options = {
        unused: true
    }
    input: {
        function f() {
            var o = {};
            var unused = {}; // Doesn't get removed because upper scope uses with
            function foo() {
                with(o) {
                    var foo = "something"
                }
                doSomething(o);
            }
            foo()
        }
    }
    expect: {
        function f() {
            var o = {};
            var unused = {};
            function foo() {
                with(o)
                    var foo = "something";
                doSomething(o)
            }
            foo()
        }
    }
}
check_drop_unused_in_peer_function: {
    options = {
        unused: true
    }
    input: {
        function outer() {
            var o = {};
            var unused = {};     // should be kept
            function foo() {     // should be kept
                function not_in_use() {
                    var nested_unused = "foo"; // should be dropped
                    return 24;
                }
                var unused = {}; // should be kept
                with (o) {
                    var foo = "something";
                }
                doSomething(o);
            }
            function bar() {
                var unused = {}; // should be dropped
                doSomethingElse();
            }
            foo();
            bar();
        }
    }
    expect: {
        function outer() {
            var o = {};
            var unused = {};     // should be kept
            function foo() {     // should be kept
                function not_in_use() {
                    return 24;
                }
                var unused = {}; // should be kept
                with (o)
                    var foo = "something";
                doSomething(o);
            }
            function bar() {
                doSomethingElse();
            }
            foo();
            bar();
        }
    }
}

Infinity_not_in_with_scope: {
    options = {
        unused: true
    }
    input: {
        var o = { Infinity: 'oInfinity' };
        var vInfinity = "Infinity";
        vInfinity = Infinity;
    }
    expect: {
        var o = { Infinity: 'oInfinity' }
        var vInfinity = "Infinity"
        vInfinity = 1/0
    }
}

Infinity_in_with_scope: {
    options = {
        unused: true
    }
    input: {
        var o = { Infinity: 'oInfinity' };
        var vInfinity = "Infinity";
        with (o) { vInfinity = Infinity; }
    }
    expect: {
        var o = { Infinity: 'oInfinity' }
        var vInfinity = "Infinity"
        with (o) vInfinity = Infinity
    }
}

assorted_Infinity_NaN_undefined_in_with_scope: {
    options = {
        unused:        true,
        evaluate:      true,
        dead_code:     true,
        conditionals:  true,
        comparisons:   true,
        booleans:      true,
        hoist_funs:    true,
        keep_fargs:    true,
        if_return:     true,
        join_vars:     true,
        side_effects:  true,
        sequences:     false,
        keep_infinity: false,
    }
    input: {
        var f = console.log;
        var o = {
            undefined : 3,
            NaN       : 4,
            Infinity  : 5,
        };
        if (o) {
            f(undefined, void 0);
            f(NaN, 0/0);
            f(Infinity, 1/0);
            f(-Infinity, -(1/0));
            f(2 + 7 + undefined, 2 + 7 + void 0);
        }
        with (o) {
            f(undefined, void 0);
            f(NaN, 0/0);
            f(Infinity, 1/0);
            f(-Infinity, -(1/0));
            f(2 + 7 + undefined, 2 + 7 + void 0);
        }
    }
    expect: {
        var f = console.log, o = {
            undefined : 3,
            NaN       : 4,
            Infinity  : 5
        };
        if (o) {
            f(void 0, void 0);
            f(NaN, NaN);
            f(1/0, 1/0);
            f(-1/0, -1/0);
            f(NaN, NaN);
        }
        with (o) {
            f(undefined, void 0);
            f(NaN, 0/0);
            f(Infinity, 1/0);
            f(-Infinity, -1/0);
            f(9 + undefined, 9 + void 0);
        }
    }
    expect_stdout: true
}

assorted_Infinity_NaN_undefined_in_with_scope_keep_infinity: {
    options = {
        unused:        true,
        evaluate:      true,
        dead_code:     true,
        conditionals:  true,
        comparisons:   true,
        booleans:      true,
        hoist_funs:    true,
        keep_fargs:    true,
        if_return:     true,
        join_vars:     true,
        side_effects:  true,
        sequences:     false,
        keep_infinity: true,
    }
    input: {
        var f = console.log;
        var o = {
            undefined : 3,
            NaN       : 4,
            Infinity  : 5,
        };
        if (o) {
            f(undefined, void 0);
            f(NaN, 0/0);
            f(Infinity, 1/0);
            f(-Infinity, -(1/0));
            f(2 + 7 + undefined, 2 + 7 + void 0);
        }
        with (o) {
            f(undefined, void 0);
            f(NaN, 0/0);
            f(Infinity, 1/0);
            f(-Infinity, -(1/0));
            f(2 + 7 + undefined, 2 + 7 + void 0);
        }
    }
    expect: {
        var f = console.log, o = {
            undefined : 3,
            NaN       : 4,
            Infinity  : 5
        };
        if (o) {
            f(void 0, void 0);
            f(NaN, NaN);
            f(Infinity, 1/0);
            f(-Infinity, -1/0);
            f(NaN, NaN);
        }
        with (o) {
            f(undefined, void 0);
            f(NaN, 0/0);
            f(Infinity, 1/0);
            f(-Infinity, -1/0);
            f(9 + undefined, 9 + void 0);
        }
    }
    expect_stdout: true
}
