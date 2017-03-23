
expand_arguments: {
    input: {
        func(a, ...rest);
        func(...all);
    }
    expect_exact: "func(a,...rest);func(...all);"
}

expand_expression_arguments: {
    input: {
        f(...a.b);
        f(...a.b());
        f(...(a));
        f(...(a.b));
        f(...a[i]);
    }
    expect_exact: "f(...a.b);f(...a.b());f(...a);f(...a.b);f(...a[i]);"
}

expand_parameters: {
    input: {
        (function (a, ...b){});
        (function (...args){});
    }
    expect_exact: "(function(a,...b){});(function(...args){});"
}

