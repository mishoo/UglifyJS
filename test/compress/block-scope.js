
let_statement: {
    input: {
        let x = 6;
    }
    expect_exact: "let x=6;"
}

do_not_hoist_let: {
    options = {
        hoist_vars: true,
    };
    input: {
        function x() {
            if (FOO) {
                let let1;
                let let2;
                var var1;
                var var2;
            }
        }
    }
    expect: {
        function x() {
            var var1, var2;
            if (FOO) {
                let let1;
                let let2;
            }
        }
    }
}

