inlineconst_number: {
    options = { inlineconst: true };
    input: {
        function f(c) {
            var a = 5, b = 10;
            return a + b + c;
        }
    }
    expect: {
        function f(c) {
            var a = 5, b = 10;
            return 5 + 10 + c;
        }
    }
}

inlineconst_bool_and_null: {
    options = { inlineconst: true };
    input: {
        function f(c) {
            var a = true, b = false, n = null;
            return (n || b || a) ^ c;
        }
    }
    expect: {
        function f(c) {
            var a = true, b = false, n = null;
            return (null || false || true) ^ c;
        }
    }
}

inlineconst_string: {
    options = { inlineconst: true, inlinestr: 2 };
    input: {
        function f() {
            var s1 = "1", s2 = "12";
            return s1 + s2;
        }
    }
    expect: {
        function f() {
            var s1 = "1", s2 = "12";
            return "1" + s2;
        }
    }
}

inlineconst_in_nested_function: {
    options = { inlineconst: true };
    input: {
        function f() {
            var x = 1;
            return function t() {
                return x + 1;
            };
        }
    }
    expect: {
        function f() {
            var x = 1;
            return function t() {
                return 1 + 1;
            };
        }
    }
}
