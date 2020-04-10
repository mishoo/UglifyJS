mangle: {
    mangle = {
        toplevel: true,
    }
    input: {
        var e = eval, x = 42;
        (function() {
            console.log(e("typeof x"));
        })();
    }
    expect: {
        var e = eval, x = 42;
        (function() {
            console.log(e("typeof x"));
        })();
    }
    expect_stdout: true
}

compress: {
    options = {
        collapse_vars: true,
        inline: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var a = 42;
            return eval("typeof a");
        }(), function(e) {
            var a = null;
            return e("typeof a");
        }(eval), function(eval) {
            var a = false;
            return eval("typeof a");
        }(eval), function(f) {
            var a = "STRING";
            var eval = f;
            return eval("typeof a");
        }(eval), function(g) {
            var a = eval;
            function eval() {
                return g;
            }
            return eval()("typeof a");
        }(eval));
    }
    expect: {
        console.log(function() {
            var a = 42;
            return eval("typeof a");
        }(), (0, eval)("typeof a"), function(eval) {
            var a = false;
            return eval("typeof a");
        }(eval), function(f) {
            var a = "STRING";
            var eval = f;
            return eval("typeof a");
        }(eval), function(g) {
            var a = eval;
            function eval() {
                return g;
            }
            return eval()("typeof a");
        }(eval));
    }
    expect_stdout: "number undefined boolean string undefined"
}

call_arg_1: {
    mangle = {
        toplevel: true,
    }
    input: {
        var z = "foo";
        (function() {
            var z = false;
            (function(e) {
                var z = 42;
                e("console.log(typeof z)");
            })(eval);
        })();
    }
    expect: {
        var z = "foo";
        (function() {
            var o = false;
            (function(o) {
                var a = 42;
                o("console.log(typeof z)");
            })(eval);
        })();
    }
    expect_stdout: true
}

call_arg_2: {
    mangle = {
        toplevel: true,
    }
    input: {
        function eval() {
            console.log("PASS");
        }
        var z = "foo";
        (function() {
            var z = false;
            (function(e) {
                var z = 42;
                e("console.log(typeof z)");
            })(eval);
        })();
    }
    expect: {
        function n() {
            console.log("PASS");
        }
        var o = "foo";
        (function() {
            var o = false;
            (function(o) {
                var n = 42;
                o("console.log(typeof z)");
            })(n);
        })();
    }
    expect_stdout: "PASS"
}
