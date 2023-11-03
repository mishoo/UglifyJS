string_plus_optimization: {
    options = {
        booleans: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function foo(anything) {
            function throwing_function() {
                throw "nope";
            }
            try {
                console.log('0' + throwing_function() ? "yes" : "no");
            } catch (ex) {
                console.log(ex);
            }
            console.log('0' + anything ? "yes" : "no");
            console.log(anything + '0' ? "Yes" : "No");
            console.log('' + anything);
            console.log(anything + '');
        }
        foo();
    }
    expect: {
        function foo(anything) {
            function throwing_function() {
                throw "nope";
            }
            try {
                console.log((throwing_function(), "yes"));
            } catch (ex) {
                console.log(ex);
            }
            console.log("yes");
            console.log("Yes");
            console.log('' + anything);
            console.log(anything + '');
        }
        foo();
    }
    expect_stdout: true
}
