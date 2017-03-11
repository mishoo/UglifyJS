reorder_functions_after_optimize: {
    options = {
        collapse_vars:true, sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        reorder_funs:true, keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
    }
    input: {
        function longFun(x, y) {
            return [x, y].map(function (x) {
                return x*x;
            });
        }
        function medFun(x) {
            return 15*x;
        }
        function shortFun() {
            return 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10;
        }
    }
    expect: {
        function shortFun() {
            return 55;
        }
        function medFun(x) {
            return 15*x;
        }
        function longFun(x, y) {
            return [x, y].map(function (x) {
                return x*x;
            });
        }
    }
}