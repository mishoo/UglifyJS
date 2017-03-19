eval_collapse_vars: {
    options = {
        collapse_vars:true, sequences:false, properties:true, dead_code:true, conditionals:true,
        comparisons:true, evaluate:true, booleans:true, loops:true, unused:true, hoist_funs:true,
        keep_fargs:true, if_return:true, join_vars:true, cascade:true, side_effects:true
    };
    input: {
        function f1() {
            var e = 7;
            var s = "abcdef";
            var i = 2;
            var eval = console.log.bind(console);
            var x = s.charAt(i++);
            var y = s.charAt(i++);
            var z = s.charAt(i++);
            eval(x, y, z, e);
        }
        function p1() { var a = foo(), b = bar(), eval = baz(); return a + b + eval; }
        function p2() { var a = foo(), b = bar(), eval = baz; return a + b + eval(); }
        (function f2(eval) {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })(eval);
    }
    expect: {
        function f1() {
            var e = 7,
                s = "abcdef",
                i = 2,
                eval = console.log.bind(console),
                x = s.charAt(i++),
                y = s.charAt(i++),
                z = s.charAt(i++);
            eval(x, y, z, e);
        }
        function p1() { return foo() + bar() + baz(); }
        function p2() { var a = foo(), b = bar(), eval = baz; return a + b + eval(); }
        (function f2(eval) {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })(eval);
    }
    expect_stdout: true
}

eval_unused: {
    options = { unused: true, keep_fargs: false };
    input: {
        function f1(a, eval, c, d, e) {
            return a('c') + eval;
        }
        function f2(a, b, c, d, e) {
            return a + eval('c');
        }
        function f3(a, eval, c, d, e) {
            return a + eval('c');
        }
    }
    expect: {
        function f1(a, eval) {
            return a('c') + eval;
        }
        function f2(a, b, c, d, e) {
            return a + eval('c');
        }
        function f3(a, eval, c, d, e) {
            return a + eval('c');
        }
    }
}

eval_mangle: {
    mangle = {
    };
    input: {
        function f1(a, eval, c, d, e) {
            return a('c') + eval;
        }
        function f2(a, b, c, d, e) {
            return a + eval('c');
        }
        function f3(a, eval, c, d, e) {
            return a + eval('c');
        }
    }
    expect_exact: 'function f1(n,c,e,a,f){return n("c")+c}function f2(a,b,c,d,e){return a+eval("c")}function f3(a,eval,c,d,e){return a+eval("c")}'
}
