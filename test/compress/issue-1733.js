function_iife_catch: {
    mangle = {
        screw_ie8: true,
    }
    input: {
        function f(n) {
            !function() {
                try {
                    throw 0;
                } catch (n) {
                    var a = 1;
                    console.log(n, a);
                }
            }();
        }
        f();
    }
    expect_exact: "function f(o){!function(){try{throw 0}catch(c){var o=1;console.log(c,o)}}()}f();"
    expect_stdout: "0 1"
}

function_iife_catch_ie8: {
    mangle = {
        screw_ie8: false,
    }
    input: {
        function f(n) {
            !function() {
                try {
                    throw 0;
                } catch (n) {
                    var a = 1;
                    console.log(n, a);
                }
            }();
        }
        f();
    }
    expect_exact: "function f(o){!function(){try{throw 0}catch(o){var c=1;console.log(o,c)}}()}f();"
    expect_stdout: "0 1"
}
