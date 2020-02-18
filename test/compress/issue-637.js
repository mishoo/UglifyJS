wrongly_optimized: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
    }
    input: {
        function func() {
            foo();
        }
        if (func() || true) {
            bar();
        }
    }
    expect: {
        function func() {
            foo();
        }
        func(), 1, bar();
    }
}
