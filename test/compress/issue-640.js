cond_5: {
    options = {
        conditionals: true,
        expression: true,
    }
    input: {
        if (some_condition()) {
            if (some_other_condition()) {
                do_something();
            } else {
                alternate();
            }
        } else {
            alternate();
        }

        if (some_condition()) {
            if (some_other_condition()) {
                do_something();
            }
        }
    }
    expect: {
        some_condition() && some_other_condition() ? do_something() : alternate();
        if (some_condition() && some_other_condition()) do_something();
    }
}

dead_code_const_annotation_regex: {
    options = {
        booleans     : true,
        conditionals : true,
        dead_code    : true,
        evaluate     : true,
        expression   : true,
        loops        : true,
    }
    input: {
        var unused;
        // @constraint this shouldn't be a constant
        var CONST_FOO_ANN = false;
        if (CONST_FOO_ANN) {
            console.log("reachable");
        }
    }
    expect: {
        var unused;
        var CONST_FOO_ANN = !1;
        if (CONST_FOO_ANN) console.log('reachable');
    }
    expect_stdout: true
}

drop_console_2: {
    options = {
        drop_console: true,
        expression: true,
    }
    input: {
        console.log('foo');
        console.log.apply(console, arguments);
    }
    expect: {
        // with regular compression these will be stripped out as well
        void 0;
        void 0;
    }
}

drop_value: {
    options = {
        expression: true,
        side_effects: true,
    }
    input: {
        (1, [2, foo()], 3, {a:1, b:bar()});
    }
    expect: {
        foo(), {a:1, b:bar()};
    }
}

wrongly_optimized: {
    options = {
        conditionals: true,
        booleans: true,
        evaluate: true,
        expression: true,
    }
    input: {
        function func() {
            foo();
        }
        if (func() || true) {
            bar();
        }
    }
    expect: {
        function func() {
            foo();
        }
        // TODO: optimize to `func(), bar()`
        if (func(), !0) bar();
    }
}

negate_iife_1: {
    options = {
        expression: true,
        negate_iife: true,
    }
    input: {
        (function(){ stuff() })();
    }
    expect: {
        (function(){ stuff() })();
    }
}

negate_iife_3: {
    options = {
        conditionals: true,
        expression: true,
        negate_iife: true,
    }
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
    }
    expect: {
        (function(){ return t })() ? console.log(true) : console.log(false);
    }
}

negate_iife_3_off: {
    options = {
        conditionals: true,
        expression: true,
        negate_iife: false,
    }
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
    }
    expect: {
        (function(){ return t })() ? console.log(true) : console.log(false);
    }
}

negate_iife_4: {
    options = {
        conditionals: true,
        expression: true,
        negate_iife: true,
        sequences: true,
    }
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
        (function(){
            console.log("something");
        })();
    }
    expect: {
        !function(){ return t }() ? console.log(false) : console.log(true), function(){
            console.log("something");
        }();
    }
}

negate_iife_5: {
    options = {
        conditionals: true,
        expression: true,
        negate_iife: true,
        sequences: true,
    }
    input: {
        if ((function(){ return t })()) {
            foo(true);
        } else {
            bar(false);
        }
        (function(){
            console.log("something");
        })();
    }
    expect: {
        !function(){ return t }() ? bar(false) : foo(true), function(){
            console.log("something");
        }();
    }
}

negate_iife_5_off: {
    options = {
        conditionals: true,
        expression: true,
        negate_iife: false,
        sequences: true,
    };
    input: {
        if ((function(){ return t })()) {
            foo(true);
        } else {
            bar(false);
        }
        (function(){
            console.log("something");
        })();
    }
    expect: {
        !function(){ return t }() ? bar(false) : foo(true), function(){
            console.log("something");
        }();
    }
}

issue_1254_negate_iife_true: {
    options = {
        expression: true,
        negate_iife: true,
    }
    input: {
        (function() {
            return function() {
                console.log('test')
            };
        })()();
    }
    expect_exact: '(function(){return function(){console.log("test")}})()();'
    expect_stdout: true
}

issue_1254_negate_iife_nested: {
    options = {
        expression: true,
        negate_iife: true,
    }
    input: {
        (function() {
            return function() {
                console.log('test')
            };
        })()()()()();
    }
    expect_exact: '(function(){return function(){console.log("test")}})()()()()();'
    expect_stdout: true
}

conditional: {
    options = {
        expression: true,
        pure_funcs: [ "pure" ],
        side_effects: true,
    }
    input: {
        pure(1 | a() ? 2 & b() : 7 ^ c());
        pure(1 | a() ? 2 & b() : 5);
        pure(1 | a() ? 4 : 7 ^ c());
        pure(1 | a() ? 4 : 5);
        pure(3 ? 2 & b() : 7 ^ c());
        pure(3 ? 2 & b() : 5);
        pure(3 ? 4 : 7 ^ c());
        pure(3 ? 4 : 5);
    }
    expect: {
        1 | a() ? b() : c();
        1 | a() && b();
        1 | a() || c();
        a();
        3 ? b() : c();
        3 && b();
        3 || c();
        pure(3 ? 4 : 5);
    }
}

limit_1: {
    options = {
        expression: true,
        sequences: 3,
    }
    input: {
        a;
        b;
        c;
        d;
        e;
        f;
        g;
        h;
        i;
        j;
        k;
    }
    expect: {
        // Turned into a single return statement
        // so it can no longer be split into lines
        a,b,c,d,e,f,g,h,i,j,k;
    }
}

iife: {
    options = {
        expression: true,
        sequences: true,
    }
    input: {
        x = 42;
        (function a() {})();
        !function b() {}();
        ~function c() {}();
        +function d() {}();
        -function e() {}();
        void function f() {}();
        typeof function g() {}();
    }
    expect: {
        x = 42, function a() {}(), function b() {}(), function c() {}(),
        function d() {}(), function e() {}(), function f() {}(), typeof function g() {}();
    }
}
