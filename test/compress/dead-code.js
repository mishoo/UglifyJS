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
            var g;
        }
        f();
    }
    expect_stdout: true
    node_version: ">=6"
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
        var bar;
        // nothing for the while
        // as for the for, it should keep:
        var x = 10, y;
        var moo;
        bar();
    }
    expect_stdout: true
    node_version: ">=6"
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
        var x = 10, y;
        var moo;
        bar();
    }
    expect_stdout: true
    node_version: ">=4"
}

dead_code_block_decls_die: {
    options = {
        dead_code    : true,
        conditionals : true,
        booleans     : true,
        evaluate     : true
    };
    input: {
        if (0) {
            let foo = 6;
            const bar = 12;
            class Baz {};
            var qux;
        }
        console.log(foo, bar, Baz);
    }
    expect: {
        var qux;
        console.log(foo, bar, Baz);
    }
}

dead_code_const_declaration: {
    options = {
        dead_code    : true,
        loops        : true,
        booleans     : true,
        conditionals : true,
        evaluate     : true,
        reduce_vars  : true,
    };
    input: {
        var unused;
        const CONST_FOO = false;
        if (CONST_FOO) {
            console.log("unreachable");
            var moo;
            function bar() {}
        }
    }
    expect: {
        var unused;
        const CONST_FOO = !1;
        var moo;
        var bar;
    }
    expect_stdout: true
}

dead_code_const_annotation: {
    options = {
        dead_code    : true,
        loops        : true,
        booleans     : true,
        conditionals : true,
        evaluate     : true,
        reduce_vars  : true,
        toplevel     : true,
    };
    input: {
        var unused;
        /** @const */ var CONST_FOO_ANN = false;
        if (CONST_FOO_ANN) {
            console.log("unreachable");
            var moo;
            function bar() {}
        }
    }
    expect: {
        var unused;
        var CONST_FOO_ANN = !1;
        var moo;
        var bar;
    }
    expect_stdout: true
}

dead_code_const_annotation_regex: {
    options = {
        dead_code    : true,
        loops        : true,
        booleans     : true,
        conditionals : true,
        evaluate     : true
    };
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
        CONST_FOO_ANN && console.log('reachable');
    }
    expect_stdout: true
}

dead_code_const_annotation_complex_scope: {
    options = {
        dead_code    : true,
        loops        : true,
        booleans     : true,
        conditionals : true,
        evaluate     : true,
        reduce_vars  : true,
        toplevel     : true,
    };
    input: {
        var unused_var;
        /** @const */ var test = 'test';
        // @const
        var CONST_FOO_ANN = false;
        var unused_var_2;
        if (CONST_FOO_ANN) {
            console.log("unreachable");
            var moo;
            function bar() {}
        }
        if (test === 'test') {
            var beef = 'good';
            /** @const */ var meat = 'beef';
            var pork = 'bad';
            if (meat === 'pork') {
                console.log('also unreachable');
            } else if (pork === 'good') {
                console.log('reached, not const');
            }
        }
    }
    expect: {
        var unused_var;
        var test = 'test';
        var CONST_FOO_ANN = !1;
        var unused_var_2;
        var moo;
        var bar;
        var beef = 'good';
        var meat = 'beef';
        var pork = 'bad';
    }
    expect_stdout: true
}

try_catch_finally: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
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
        Error.name;
        Function.length;
        Math.random;
        Number.isNaN;
        RegExp;
        Object.defineProperty;
        String.fromCharCode;
    }
    expect: {}
    expect_stdout: true
}

issue_2233_2: {
    options = {
        pure_getters: "strict",
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
