inner_reference: {
    options = {
        passes: 2,
        side_effects: true,
    }
    input: {
        !function f(a) {
            return a && f(a - 1) + a;
        }(42);
        !function g(a) {
            return a;
        }(42);
    }
    expect: {
        !function f(a) {
            return a && f(a - 1) + a;
        }(42);
    }
}
