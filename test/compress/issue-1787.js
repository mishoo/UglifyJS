unary_prefix: {
    options = {
        evaluate: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var x = -(2 / 3);
            return x;
        }());
    }
    expect_exact: "console.log(-2/3);"
    expect_stdout: true
}
