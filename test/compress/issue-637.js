wrongly_optimized: {
    options = {
        conditionals: true,
        booleans: true,
        evaluate: true
    };
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
        // TODO: optimize to `func(), bar()`
        (func(), 0) || bar();
    }
}
