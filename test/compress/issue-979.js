issue979_reported: {
    options = {
        sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function f1() {
            if (a == 1 || b == 2) {
                foo();
            }
        }
        function f2() {
            if (!(a == 1 || b == 2)) {
            }
            else {
                foo();
            }
        }
    }
    expect: {
        function f1() {
            1!=a&&2!=b||foo();
        }
        function f2() {
            1!=a&&2!=b||foo();
        }
    }
}

issue979_test_negated_is_best: {
    options = {
        sequences:true, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, side_effects:true
    }
    input: {
        function f3() {
            if (a == 1 | b == 2) {
                foo();
            }
        }
        function f4() {
            if (!(a == 1 | b == 2)) {
            }
            else {
                foo();
            }
        }
        function f5() {
            if (a == 1 && b == 2) {
                foo();
            }
        }
        function f6() {
            if (!(a == 1 && b == 2)) {
            }
            else {
                foo();
            }
        }
        function f7() {
            if (a == 1 || b == 2) {
                foo();
            }
            else {
                return bar();
            }
        }
    }
    expect: {
        function f3() {
            1==a|2==b&&foo();
        }
        function f4() {
            1==a|2==b&&foo();
        }
        function f5() {
            1==a&&2==b&&foo();
        }
        function f6() {
            1!=a||2!=b||foo();
        }
        function f7() {
            if(1!=a&&2!=b)return bar();foo()
        }
    }
}

