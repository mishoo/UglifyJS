non_ascii_function_identifier_name: {
    input: {
        function fooλ(δλ) {}
        function λ(δλ) {}
        (function λ(δλ) {})()
    }
    expect_exact: "function fooλ(δλ){}function λ(δλ){}(function λ(δλ){})();"
}

unsafe_eval: {
    options = {
        unsafe: true,
    }
    input: {
        var a = Function("x", "return x");

        function e() {
            var a;
            return Function("return a");
        }

        function f() {
            return Function("return a");
        }

        function g(a) {
            return Function("b", "return [ a, b ]");
        }

        function h(b) {
            return Function("b", "c", "return [ a, b, c ]");
        }
    }
    expect: {
        var a = function(x) {
            return x;
        };

        function e() {
            var a;
            return Function("return a");
        }

        function f() {
            return function() {
                return a;
            };
        }

        function g(a) {
            return Function("b", "return [ a, b ]");
        }

        function h(b) {
            return function(b, c) {
                return [ a, b, c ];
            };
        }
    }
}
