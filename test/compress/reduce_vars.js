reduce_vars: {
    options = {
        conditionals  : true,
        evaluate      : true,
        global_defs   : {
            C : 0
        },
        reduce_vars   : true,
        unused        : true
    }
    input: {
        var A = 1;
        (function f0() {
            var a = 2;
            console.log(a - 5);
            console.log(A - 5);
        })();
        (function f1() {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })();
        (function f2(eval) {
            var a = 2;
            console.log(a - 5);
            eval("console.log(a);");
        })(eval);
        (function f3() {
            var b = typeof C !== "undefined";
            var c = 4;
            if (b) {
                return 'yes';
            } else {
                return 'no';
            }
        })();
        console.log(A + 1);
    }
    expect: {
        var A = 1;
        (function() {
            console.log(-3);
            console.log(-4);
        })();
        (function f1() {
            var a = 2;
            console.log(-3);
            eval("console.log(a);");
        })();
        (function f2(eval) {
            var a = 2;
            console.log(-3);
            eval("console.log(a);");
        })(eval);
        (function() {
            return "yes";
        })();
        console.log(2);
    }
}

modified: {
    options = {
        conditionals  : true,
        evaluate      : true,
        reduce_vars   : true,
        unused        : true
    }
    input: {
        function f0() {
            var a = 1, b = 2;
            b++;
            console.log(a + 1);
            console.log(b + 1);
        }

        function f1() {
            var a = 1, b = 2;
            --b;
            console.log(a + 1);
            console.log(b + 1);
        }

        function f2() {
            var a = 1, b = 2, c = 3;
            b = c;
            console.log(a + b);
            console.log(b + c);
            console.log(a + c);
            console.log(a + b + c);
        }

        function f3() {
            var a = 1, b = 2, c = 3;
            b *= c;
            console.log(a + b);
            console.log(b + c);
            console.log(a + c);
            console.log(a + b + c);
        }

        function f4() {
            var a = 1, b = 2, c = 3;
            if (a) {
                b = c;
            } else {
                c = b;
            }
            console.log(a + b);
            console.log(b + c);
            // TODO: as "modified" is determined in "figure_out_scope",
            // even "passes" wouldn't improve this any further
            console.log(a + c);
            console.log(a + b + c);
        }

        function f5(a) {
            B = a;
            console.log(A ? 'yes' : 'no');
            console.log(B ? 'yes' : 'no');
        }
    }
    expect: {
        function f0() {
            var b = 2;
            b++;
            console.log(2);
            console.log(b + 1);
        }

        function f1() {
            var b = 2;
            --b;
            console.log(2);
            console.log(b + 1);
        }

        function f2() {
            var a = 1, b = 2, c = 3;
            b = c;
            console.log(a + b);
            console.log(b + c);
            console.log(4);
            console.log(a + b + c);
        }

        function f3() {
            var a = 1, b = 2, c = 3;
            b *= c;
            console.log(a + b);
            console.log(b + c);
            console.log(4);
            console.log(a + b + c);
        }

        function f4() {
            var a = 1, b = 2, c = 3;
            b = c;
            console.log(a + b);
            console.log(b + c);
            console.log(a + c);
            console.log(a + b + c);
        }

        function f5(a) {
            B = a;
            console.log(A ? 'yes' : 'no');
            console.log(B ? 'yes' : 'no');
        }
   }
}