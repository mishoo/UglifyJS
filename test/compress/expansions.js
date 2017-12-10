
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

avoid_spread_in_ternary: {
    options = {
        comparisons: true,
        conditionals: true,
        evaluate: true,
    }
    input: {
        function print(...x) {
            console.log(...x);
        }
        var a = [1, 2], b = [3, 4], m = Math;

        if (m)
            print(a);
        else
            print(b);

        if (m)
            print(...a);
        else
            print(b);

        if (m.no_such_property)
            print(a);
        else
            print(...b);
    }
    expect: {
        function print(...x) {
            console.log(...x);
        }
        var a = [ 1, 2 ], b = [ 3, 4 ], m = Math;
        print(m ? a : b);
        m ? print(...a) : print(b);
        m.no_such_property ? print(a) : print(...b);
    }
    expect_stdout: [
        "[ 1, 2 ]",
        "1 2",
        "3 4",
    ]
    node_version: ">=6"
}
