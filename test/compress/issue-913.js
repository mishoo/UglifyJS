keep_var_for_in: {
    options = {
        hoist_vars: true,
        unused: true
    };
    input: {
        (function(obj){
            var foo = 5;
            for (var i in obj)
                return foo;
        })();
    }
    expect: {
        (function(obj){
            var i, foo = 5;
            for (i in obj)
                return foo;
        })();
    }
}
