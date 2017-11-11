chained_evaluation_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var a = 1;
            (function() {
                var b = a, c;
                c = f(b);
                c.bar = b;
            })();
        })();
    }
    expect: {
        (function() {
            (function() {
                f(1).bar = 1;
            })();
        })();
    }
}

chained_evaluation_2: {
    options = {
        collapse_vars: true,
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var a = "long piece of string";
            (function() {
                var b = a, c;
                c = f(b);
                c.bar = b;
            })();
        })();
    }
    expect: {
        (function() {
            (function() {
                var b = "long piece of string";
                f(b).bar = b;
            })();
        })();
    }
}
