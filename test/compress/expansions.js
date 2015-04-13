
expand_arguments: {
    input: {
        func(a, ...rest);
        func(...all);
    }
    expect_exact: "func(a,...rest);func(...all);"
}

expand_parameters: {
    input: {
        (function (a, ...b){});
        (function (...args){});
    }
    expect_exact: "(function(a,...b){});(function(...args){});"
}

