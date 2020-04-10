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
        var o = eval, e = 42;
        (function() {
            console.log(o("typeof x"));
        })();
    }
    expect_stdout: "undefined"
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
        }(), eval("typeof a"), function(eval) {
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
