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