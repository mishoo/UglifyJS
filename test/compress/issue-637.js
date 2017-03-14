wrongly_optimized: {
    options = {
        conditionals: true,
        booleans: true,
        evaluate: true,
        sequences: true,
        passes: 2,
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
        func(), bar();
    }
}
