statements: {
    options = {
        hoist_funs: false,
        hoist_vars: true,
    }
    input: {
        function f() {
            var a = 1;
            var b = 2;
            var c = 3;
            function g() {}
            return g(a, b, c);
        }
    }
    expect: {
        function f() {
            var a = 1, b = 2, c = 3;
            function g() {}
            return g(a, b, c);
        }
    }
}

statements_funs: {
    options = {
        hoist_funs: true,
        hoist_vars: true,
    }
    input: {
        function f() {
            var a = 1;
            var b = 2;
            var c = 3;
            function g() {}
            return g(a, b, c);
        }
    }
    expect: {
        function f() {
            function g() {}
            var a = 1, b = 2, c = 3;
            return g(a, b, c);
        }
    }
}

sequences: {
    options = {
        hoist_funs: false,
        hoist_vars: true,
    }
    input: {
        function f() {
            var a = 1, b = 2;
            function g() {}
            var c = 3;
            return g(a, b, c);
        }
    }
    expect: {
        function f() {
            var c, a = 1, b = 2;
            function g() {}
            c = 3;
            return g(a, b, c);
        }
    }
}

sequences_funs: {
    options = {
        hoist_funs: true,
        hoist_vars: true,
    }
    input: {
        function f() {
            var a = 1, b = 2;
            function g() {}
            var c = 3;
            return g(a, b, c);
        }
    }
    expect: {
        function f() {
            function g() {}
            var a = 1, b = 2, c = 3;
            return g(a, b, c);
        }
    }
}
