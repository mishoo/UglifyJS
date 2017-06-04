non_ascii_function_identifier_name: {
    input: {
        function fooλ(δλ) {}
        function λ(δλ) {}
        (function λ(δλ) {})()
    }
    expect_exact: "function fooλ(δλ){}function λ(δλ){}(function λ(δλ){})();"
}

iifes_returning_constants_keep_fargs_true: {
    options = {
        keep_fargs    : true,
        side_effects  : true,
        evaluate      : true,
        unused        : true,
        dead_code     : true,
        conditionals  : true,
        comparisons   : true,
        booleans      : true,
        if_return     : true,
        join_vars     : true,
        reduce_vars   : true,
        cascade       : true,
        inline        : true,
    }
    input: {
        (function(){ return -1.23; }());
        console.log( function foo(){ return "okay"; }() );
        console.log( function foo(x, y, z){ return 123; }() );
        console.log( function(x, y, z){ return z; }() );
        console.log( function(x, y, z){ if (x) return y; return z; }(1, 2, 3) );
        console.log( function(x, y){ return x * y; }(2, 3) );
        console.log( function(x, y){ return x * y; }(2, 3, a(), b()) );
    }
    expect: {
        console.log("okay");
        console.log(123);
        console.log(void 0);
        console.log(2);
        console.log(6);
        console.log((a(), b(), 6));
    }
    expect_stdout: true
}

iifes_returning_constants_keep_fargs_false: {
    options = {
        keep_fargs    : false,
        side_effects  : true,
        evaluate      : true,
        unused        : true,
        dead_code     : true,
        conditionals  : true,
        comparisons   : true,
        booleans      : true,
        if_return     : true,
        join_vars     : true,
        reduce_vars   : true,
        cascade       : true,
        inline        : true,
    }
    input: {
        (function(){ return -1.23; }());
        console.log( function foo(){ return "okay"; }() );
        console.log( function foo(x, y, z){ return 123; }() );
        console.log( function(x, y, z){ return z; }() );
        console.log( function(x, y, z){ if (x) return y; return z; }(1, 2, 3) );
        console.log( function(x, y){ return x * y; }(2, 3) );
        console.log( function(x, y){ return x * y; }(2, 3, a(), b()) );
    }
    expect: {
        console.log("okay");
        console.log(123);
        console.log(void 0);
        console.log(2);
        console.log(6);
        console.log((a(), b(), 6));
    }
    expect_stdout: true
}

issue_485_crashing_1530: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        inline: true,
    }
    input: {
        (function(a) {
            if (true) return;
            var b = 42;
        })(this);
    }
    expect: {
        this, void 0;
    }
}

issue_1841_1: {
    options = {
        keep_fargs: false,
        pure_getters: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        var b = 10;
        !function(arg) {
            for (var key in "hi")
                var n = arg.baz, n = [ b = 42 ];
        }(--b);
        console.log(b);
    }
    expect: {
        var b = 10;
        !function() {
            for (var key in "hi")
                b = 42;
        }(--b);
        console.log(b);
    }
    expect_exact: "42"
}

issue_1841_2: {
    options = {
        keep_fargs: false,
        pure_getters: false,
        reduce_vars: true,
        unused: true,
    }
    input: {
        var b = 10;
        !function(arg) {
            for (var key in "hi")
                var n = arg.baz, n = [ b = 42 ];
        }(--b);
        console.log(b);
    }
    expect: {
        var b = 10;
        !function(arg) {
            for (var key in "hi")
                arg.baz, b = 42;
        }(--b);
        console.log(b);
    }
    expect_exact: "42"
}

function_returning_constant_literal: {
    options = {
        reduce_vars: true,
        unsafe: true,
        toplevel: true,
        evaluate: true,
        cascade: true,
        unused: true,
        inline: true,
    }
    input: {
        function greeter() {
            return { message: 'Hello there' };
        }
        var greeting = greeter();
        console.log(greeting.message);
    }
    expect: {
        console.log("Hello there");
    }
    expect_stdout: "Hello there"
}

hoist_funs: {
    options = {
        hoist_funs: true,
    }
    input: {
        console.log(1, typeof f, typeof g);
        if (console.log(2, typeof f, typeof g))
            console.log(3, typeof f, typeof g);
        else {
            console.log(4, typeof f, typeof g);
            function f() {}
            console.log(5, typeof f, typeof g);
        }
        function g() {}
        console.log(6, typeof f, typeof g);
    }
    expect: {
        function f() {}
        function g() {}
        console.log(1, typeof f, typeof g);
        if (console.log(2, typeof f, typeof g))
            console.log(3, typeof f, typeof g);
        else {
            console.log(4, typeof f, typeof g);
            console.log(5, typeof f, typeof g);
        }
        console.log(6, typeof f, typeof g);
    }
    expect_stdout: [
        "1 'function' 'function'",
        "2 'function' 'function'",
        "4 'function' 'function'",
        "5 'function' 'function'",
        "6 'function' 'function'",
    ]
    node_version: "<=4"
}

hoist_funs_strict: {
    options = {
        hoist_funs: true,
    }
    input: {
        "use strict";
        console.log(1, typeof f, typeof g);
        if (console.log(2, typeof f, typeof g))
            console.log(3, typeof f, typeof g);
        else {
            console.log(4, typeof f, typeof g);
            function f() {}
            console.log(5, typeof f, typeof g);
        }
        function g() {}
        console.log(6, typeof f, typeof g);
    }
    expect: {
        "use strict";
        function g() {}
        console.log(1, typeof f, typeof g);
        if (console.log(2, typeof f, typeof g))
            console.log(3, typeof f, typeof g);
        else {
            console.log(4, typeof f, typeof g);
            function f() {}
            console.log(5, typeof f, typeof g);
        }
        console.log(6, typeof f, typeof g);
    }
    expect_stdout: [
        "1 'undefined' 'function'",
        "2 'undefined' 'function'",
        "4 'function' 'function'",
        "5 'function' 'function'",
        "6 'undefined' 'function'",
    ]
    node_version: ">=4"
}

issue_203: {
    options = {
        keep_fargs: false,
        side_effects: true,
        unsafe_Func: true,
        unused: true,
    }
    input: {
        var m = {};
        var fn = Function("require", "module", "exports", "module.exports = 42;");
        fn(null, m, m.exports);
        console.log(m.exports);
    }
    expect: {
        var m = {};
        var fn = Function("a", "b", "b.exports=42");
        fn(null, m, m.exports);
        console.log(m.exports);
    }
    expect_stdout: "42"
}

no_webkit: {
    beautify = {
        webkit: false,
    }
    input: {
        console.log(function() {
            1 + 1;
        }.a = 1);
    }
    expect_exact: "console.log(function(){1+1}.a=1);"
    expect_stdout: "1"
}

webkit: {
    beautify = {
        webkit: true,
    }
    input: {
        console.log(function() {
            1 + 1;
        }.a = 1);
    }
    expect_exact: "console.log((function(){1+1}).a=1);"
    expect_stdout: "1"
}
