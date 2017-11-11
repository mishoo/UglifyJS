issue_1191: {
    options = {
        evaluate      : true,
        booleans      : true,
        comparisons   : true,
        dead_code     : true,
        conditionals  : true,
        side_effects  : true,
        unused        : true,
        hoist_funs    : true,
        if_return     : true,
        join_vars     : true,
        sequences     : false,
        collapse_vars : false,
        reduce_funcs  : true,
        reduce_vars   : true,
    }
    input: {
        function foo(rot) {
            const rotTol = 5;
            if (rot < -rotTol || rot > rotTol)
                bar();
            baz();
        }
    }
    expect: {
        function foo(rot) {
            (rot < -5 || rot > 5) && bar();
            baz();
        }
    }
}

issue_1194: {
    options = {
        evaluate      : true,
        booleans      : true,
        comparisons   : true,
        dead_code     : true,
        conditionals  : true,
        side_effects  : true,
        unused        : true,
        hoist_funs    : true,
        if_return     : true,
        join_vars     : true,
        sequences     : false,
        collapse_vars : false,
        reduce_funcs  : true,
        reduce_vars   : true,
    }
    input: {
        function f1() {const a = "X"; return a + a;}
        function f2() {const aa = "X"; return aa + aa;}
        function f3() {const aaa = "X"; return aaa + aaa;}
    }
    expect: {
        function f1(){return"XX"}
        function f2(){return"XX"}
        function f3(){return"XX"}
    }
}

issue_1396: {
    options = {
        evaluate      : true,
        booleans      : true,
        comparisons   : true,
        dead_code     : true,
        conditionals  : true,
        side_effects  : true,
        unused        : true,
        hoist_funs    : true,
        if_return     : true,
        join_vars     : true,
        sequences     : false,
        collapse_vars : false,
        reduce_funcs  : true,
        reduce_vars   : true,
    }
    input: {
        function foo(a) {
            const VALUE = 1;
            console.log(2 | VALUE);
            console.log(VALUE + 1);
            console.log(VALUE);
            console.log(a & VALUE);
        }
        function bar() {
            const s = "01234567890123456789";
            console.log(s + s + s + s + s);

            const CONSTANT = "abc";
            console.log(CONSTANT + CONSTANT + CONSTANT + CONSTANT + CONSTANT);
        }
    }
    expect: {
        function foo(a) {
            console.log(3);
            console.log(2);
            console.log(1);
            console.log(1 & a);
        }
        function bar() {
            const s = "01234567890123456789";
            console.log(s + s + s + s + s);

            console.log("abcabcabcabcabc");
        }
    }
}

unused_regexp_literal: {
    options = {
        evaluate      : true,
        booleans      : true,
        comparisons   : true,
        dead_code     : true,
        conditionals  : true,
        side_effects  : true,
        unused        : true,
        hoist_funs    : true,
        if_return     : true,
        join_vars     : true,
        sequences     : false,
        collapse_vars : false,
    }
    input: {
        function f(){ var a = /b/; }
    }
    expect: {
        function f(){}
    }
}

regexp_literal_not_const: {
    options = {
        evaluate      : true,
        booleans      : true,
        comparisons   : true,
        dead_code     : true,
        conditionals  : true,
        side_effects  : true,
        unused        : true,
        hoist_funs    : true,
        if_return     : true,
        join_vars     : true,
        sequences     : false,
        collapse_vars : false,
        reduce_funcs  : true,
        reduce_vars   : true,
    }
    input: {
        (function(){
            var result;
            const s = 'acdabcdeabbb';
            const REGEXP_LITERAL = /ab*/g;
            while (result = REGEXP_LITERAL.exec(s)) {
                console.log(result[0]);
            }
        })();
    }
    expect: {
        (function() {
            var result;
            const REGEXP_LITERAL = /ab*/g;
            while (result = REGEXP_LITERAL.exec("acdabcdeabbb")) console.log(result[0]);
        })();
    }
    expect_stdout: true
}
