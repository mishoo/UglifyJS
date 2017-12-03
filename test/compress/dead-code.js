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
        var moo;
        var x = 10, y;
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
        var moo;
        var x = 10, y;
        bar();
    }
    expect_stdout: true
    node_version: ">=4"
}

dead_code_block_decls_die: {
    options = {
        booleans: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
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
        booleans: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        loops: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
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
        booleans: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        loops: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
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
        booleans: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        loops: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
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

issue_2383_1: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        if (0) {
            var {x, y} = foo();
        }
    }
    expect: {
        var x, y;
    }
}

issue_2383_2: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        if (0) {
            var {
                x = 0,
                y: [ w, , { z, p: q = 7 } ] = [ 1, 2, { z: 3 } ]
            } = {};
        }
        console.log(x, q, w, z);
    }
    expect: {
        var x, w, z, q;
        console.log(x, q, w, z);
    }
    expect_stdout: "undefined undefined undefined undefined"
    node_version: ">=6"
}

issue_2383_3: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        var b = 7, y = 8;
        if (0) {
            var a = 1, [ x, y, z ] = [ 2, 3, 4 ], b = 5;
        }
        console.log(a, x, y, z, b);
    }
    expect: {
        var b = 7, y = 8;
        var a, x, y, z, b;
        console.log(a, x, y, z, b);
    }
    expect_stdout: "undefined undefined 8 undefined 7"
    node_version: ">=6"
}
