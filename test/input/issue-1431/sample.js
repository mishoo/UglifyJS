function f(x) {
    return function() {
        function n(a) {
            return a * a;
        }
        return x(n);
    };
}

function g(op) {
    return op(1) + op(2);
}

console.log(f(g)() == 5);