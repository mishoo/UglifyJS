dead_code_1: {
    options = {
        dead_code: true
    };
    input: {
        function f() {
            a();
            b();
            x = 10;
            return;
            if (x) {
                y();
            }
        }
    }
    expect: {
        function f() {
            a();
            b();
            x = 10;
            return;
        }
    }
}

dead_code_2_should_warn: {
    options = {
        dead_code: true
    };
    input: {
        function f() {
            g();
            x = 10;
            throw new Error("foo");
            // completely discarding the `if` would introduce some
            // bugs.  UglifyJS v1 doesn't deal with this issue; in v2
            // we copy any declarations to the upper scope.
            if (x) {
                y();
                var x;
                function g(){};
                // but nested declarations should not be kept.
                (function(){
                    var q;
                    function y(){};
                })();
            }
        }
        f();
    }
    expect: {
        function f() {
            g();
            x = 10;
            throw new Error("foo");
            var x;
            function g(){};
        }
        f();
    }
    expect_stdout: true
    node_version: "<=4"
}

dead_code_2_should_warn_strict: {
    options = {
        dead_code: true
    };
    input: {
        "use strict";
        function f() {
            g();
            x = 10;
            throw new Error("foo");
            // completely discarding the `if` would introduce some
            // bugs.  UglifyJS v1 doesn't deal with this issue; in v2
            // we copy any declarations to the upper scope.
            if (x) {
                y();
                var x;
                function g(){};
                // but nested declarations should not be kept.
                (function(){
                    var q;
                    function y(){};
                })();
            }
        }
        f();
    }
    expect: {
        "use strict";
        function f() {
            g();
            x = 10;
            throw new Error("foo");
            var x;
        }
        f();
    }
    expect_stdout: true
    node_version: ">=4"
}

dead_code_constant_boolean_should_warn_more: {
    options = {
        dead_code    : true,
        loops        : true,
        booleans     : true,
        conditionals : true,
        evaluate     : true,
        side_effects : true,
    };
    input: {
        while (!((foo && bar) || (x + "0"))) {
            console.log("unreachable");
            var foo;
            function bar() {}
        }
        for (var x = 10, y; x && (y || x) && (!typeof x); ++x) {
            asdf();
            foo();
            var moo;
        }
        bar();
    }
    expect: {
        var foo;
        function bar() {}
        // nothing for the while
        // as for the for, it should keep:
        var moo;
        var x = 10, y;
        bar();
    }
    expect_stdout: true
    node_version: "<=4"
}

dead_code_constant_boolean_should_warn_more_strict: {
    options = {
        dead_code    : true,
        loops        : true,
        booleans     : true,
        conditionals : true,
        evaluate     : true,
        side_effects : true,
    };
    input: {
        "use strict";
        while (!((foo && bar) || (x + "0"))) {
            console.log("unreachable");
            var foo;
            function bar() {}
        }
        for (var x = 10, y; x && (y || x) && (!typeof x); ++x) {
            asdf();
            foo();
            var moo;
        }
        bar();
    }
    expect: {
        "use strict";
        var foo;
        // nothing for the while
        // as for the for, it should keep:
        var moo;
        var x = 10, y;
        bar();
    }
    expect_stdout: true
    node_version: ">=4"
}

try_catch_finally: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        passes: 2,
        side_effects: true,
    }
    input: {
        var a = 1;
        !function() {
            try {
                if (false) throw x;
            } catch (a) {
                var a = 2;
                console.log("FAIL");
            } finally {
                a = 3;
                console.log("PASS");
            }
        }();
        try {
            console.log(a);
        } finally {
        }
    }
    expect: {
        var a = 1;
        !function() {
            var a;
            a = 3;
            console.log("PASS");
        }();
        try {
            console.log(a);
        } finally {
        }
    }
    expect_stdout: [
        "PASS",
        "1",
    ]
}

accessor: {
    options = {
        side_effects: true,
    }
    input: {
        ({
            get a() {},
            set a(v){
                this.b = 2;
            },
            b: 1
        });
    }
    expect: {}
}

issue_2233_1: {
    options = {
        pure_getters: "strict",
        side_effects: true,
        unsafe: true,
    }
    input: {
        Array.isArray;
        Boolean;
        console.log;
        Date;
        decodeURI;
        decodeURIComponent;
        encodeURI;
        encodeURIComponent;
        Error.name;
        escape;
        eval;
        EvalError;
        Function.length;
        isFinite;
        isNaN;
        JSON;
        Math.random;
        Number.isNaN;
        parseFloat;
        parseInt;
        RegExp;
        Object.defineProperty;
        String.fromCharCode;
        RangeError;
        ReferenceError;
        SyntaxError;
        TypeError;
        unescape;
        URIError;
    }
    expect: {}
    expect_stdout: true
}

global_timeout_and_interval_symbols: {
    options = {
        pure_getters: "strict",
        side_effects: true,
        unsafe: true,
    }
    input: {
        // These global symbols do not exist in the test sandbox
        // and must be tested separately.
        clearInterval;
        clearTimeout;
        setInterval;
        setTimeout;
    }
    expect: {}
}

issue_2233_2: {
    options = {
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var RegExp;
        Array.isArray;
        RegExp;
        UndeclaredGlobal;
        function foo() {
            var Number;
            AnotherUndeclaredGlobal;
            Math.sin;
            Number.isNaN;
        }
    }
    expect: {
        var RegExp;
        UndeclaredGlobal;
        function foo() {
            var Number;
            AnotherUndeclaredGlobal;
            Number.isNaN;
        }
    }
}

issue_2233_3: {
    options = {
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var RegExp;
        Array.isArray;
        RegExp;
        UndeclaredGlobal;
        function foo() {
            var Number;
            AnotherUndeclaredGlobal;
            Math.sin;
            Number.isNaN;
        }
    }
    expect: {
        UndeclaredGlobal;
    }
}

global_fns: {
    options = {
        side_effects: true,
        unsafe: true,
    }
    input: {
        Boolean(1, 2);
        decodeURI(1, 2);
        decodeURIComponent(1, 2);
        Date(1, 2);
        encodeURI(1, 2);
        encodeURIComponent(1, 2);
        Error(1, 2);
        escape(1, 2);
        EvalError(1, 2);
        isFinite(1, 2);
        isNaN(1, 2);
        Number(1, 2);
        Object(1, 2);
        parseFloat(1, 2);
        parseInt(1, 2);
        RangeError(1, 2);
        ReferenceError(1, 2);
        String(1, 2);
        SyntaxError(1, 2);
        TypeError(1, 2);
        unescape(1, 2);
        URIError(1, 2);
        try {
            Function(1, 2);
        } catch (e) {
            console.log(e.name);
        }
        try {
            RegExp(1, 2);
        } catch (e) {
            console.log(e.name);
        }
        try {
            Array(NaN);
        } catch (e) {
            console.log(e.name);
        }
    }
    expect: {
        try {
            Function(1, 2);
        } catch (e) {
            console.log(e.name);
        }
        try {
            RegExp(1, 2);
        } catch (e) {
            console.log(e.name);
        }
        try {
            Array(NaN);
        } catch (e) {
            console.log(e.name);
        }
    }
    expect_stdout: [
        "SyntaxError",
        "SyntaxError",
        "RangeError",
    ]
}
