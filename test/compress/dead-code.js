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
    reminify: false // FIXME - block scoped function
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
    reminify: false // FIXME - block scoped function
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
    reminify: false // FIXME - block scoped function
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
    reminify: false // FIXME - block scoped function
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

collapse_vars_assignment: {
    options = {
        collapse_vars: true,
        dead_code: true,
        passes: 2,
        unused: true,
    }
    input: {
        function f0(c) {
            var a = 3 / c;
            return a = a;
        }
    }
    expect: {
        function f0(c) {
            return 3 / c;
        }
    }
}

collapse_vars_lvalues_drop_assign: {
    options = {
        collapse_vars: true,
        dead_code: true,
        unused: true,
    }
    input: {
        function f0(x) { var i = ++x; return x += i; }
        function f1(x) { var a = (x -= 3); return x += a; }
        function f2(x) { var z = x, a = ++z; return z += a; }
    }
    expect: {
        function f0(x) { var i = ++x; return x + i; }
        function f1(x) { var a = (x -= 3); return x + a; }
        function f2(x) { var z = x, a = ++z; return z + a; }
    }
}

collapse_vars_misc1: {
    options = {
        collapse_vars: true,
        dead_code: true,
        unused: true,
    }
    input: {
        function f10(x) { var a = 5, b = 3; return a += b; }
        function f11(x) { var a = 5, b = 3; return a += --b; }
    }
    expect: {
        function f10(x) { return 5 + 3; }
        function f11(x) { var b = 3; return 5 + --b; }
    }
}

return_assignment: {
    options = {
        dead_code: true,
        unused: true,
    }
    input: {
        function f1(a, b, c) {
            return a = x(), b = y(), b = a && (c >>= 5);
        }
        function f2() {
            return e = x();
        }
        function f3(e) {
            return e = x();
        }
        function f4() {
            var e;
            return e = x();
        }
        function f5(a) {
            try {
                return a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f6(a) {
            try {
                return a = x();
            } finally {
                console.log(a);
            }
        }
        function y() {
            console.log("y");
        }
        function test(inc) {
            var counter = 0;
            x = function() {
                counter += inc;
                if (inc < 0) throw counter;
                return counter;
            };
            [ f1, f2, f3, f4, f5, f6 ].forEach(function(f, i) {
                e = null;
                try {
                    i += 1;
                    console.log("result " + f(10 * i, 100 * i, 1000 * i));
                } catch (x) {
                    console.log("caught " + x);
                }
                if (null !== e) console.log("e: " + e);
            });
        }
        var x, e;
        test(1);
        test(-1);
    }
    expect: {
        function f1(a, b, c) {
            return a = x(), y(), a && (c >> 5);
        }
        function f2() {
            return e = x();
        }
        function f3(e) {
            return x();
        }
        function f4() {
            return x();
        }
        function f5(a) {
            try {
                return x();
            } catch (b) {
                console.log(a);
            }
        }
        function f6(a) {
            try {
                return a = x();
            } finally {
                console.log(a);
            }
        }
        function y() {
            console.log("y");
        }
        function test(inc) {
            var counter = 0;
            x = function() {
                counter += inc;
                if (inc < 0) throw counter;
                return counter;
            };
            [ f1, f2, f3, f4, f5, f6 ].forEach(function(f, i) {
                e = null;
                try {
                    i += 1;
                    console.log("result " + f(10 * i, 100 * i, 1000 * i));
                } catch (x) {
                    console.log("caught " + x);
                }
                if (null !== e) console.log("e: " + e);
            });
        }
        var x, e;
        test(1);
        test(-1);
    }
    expect_stdout: [
        "y",
        "result 31",
        "result 2",
        "e: 2",
        "result 3",
        "result 4",
        "result 5",
        "6",
        "result 6",
        "caught -1",
        "caught -2",
        "caught -3",
        "caught -4",
        "50",
        "result undefined",
        "60",
        "caught -6",
    ]
}

throw_assignment: {
    options = {
        dead_code: true,
        unused: true,
    }
    input: {
        function f1() {
            throw a = x();
        }
        function f2(a) {
            throw a = x();
        }
        function f3() {
            var a;
            throw a = x();
        }
        function f4() {
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f5(a) {
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f6() {
            var a;
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f7() {
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function f8(a) {
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function f9() {
            var a;
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function test(inc) {
            var counter = 0;
            x = function() {
                counter += inc;
                if (inc < 0) throw counter;
                return counter;
            };
            [ f1, f2, f3, f4, f5, f6, f7, f8, f9 ].forEach(function(f, i) {
                a = null;
                try {
                    f(10 * (1 + i));
                } catch (x) {
                    console.log("caught " + x);
                }
                if (null !== a) console.log("a: " + a);
            });
        }
        var x, a;
        test(1);
        test(-1);
    }
    expect: {
        function f1() {
            throw a = x();
        }
        function f2(a) {
            throw x();
        }
        function f3() {
            throw x();
        }
        function f4() {
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f5(a) {
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f6() {
            var a;
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f7() {
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function f8(a) {
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function f9() {
            var a;
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function test(inc) {
            var counter = 0;
            x = function() {
                counter += inc;
                if (inc < 0) throw counter;
                return counter;
            };
            [ f1, f2, f3, f4, f5, f6, f7, f8, f9 ].forEach(function(f, i) {
                a = null;
                try {
                    f(10 * (1 + i));
                } catch (x) {
                    console.log("caught " + x);
                }
                if (null !== a) console.log("a: " + a);
            });
        }
        var x, a;
        test(1);
        test(-1);
    }
    expect_stdout: [
        "caught 1",
        "a: 1",
        "caught 2",
        "caught 3",
        "4",
        "a: 4",
        "5",
        "6",
        "7",
        "caught 7",
        "a: 7",
        "8",
        "caught 8",
        "9",
        "caught 9",
        "caught -1",
        "caught -2",
        "caught -3",
        "null",
        "50",
        "undefined",
        "null",
        "caught -7",
        "80",
        "caught -8",
        "undefined",
        "caught -9",
    ]
}

issue_2597: {
    options = {
        dead_code: true,
    }
    input: {
        function f(b) {
            try {
                try {
                    throw "foo";
                } catch (e) {
                    return b = true;
                }
            } finally {
                b && (a = "PASS");
            }
        }
        var a = "FAIL";
        f();
        console.log(a);
    }
    expect: {
        function f(b) {
            try {
                try {
                    throw "foo";
                } catch (e) {
                    return b = true;
                }
            } finally {
                b && (a = "PASS");
            }
        }
        var a = "FAIL";
        f();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2666: {
    options = {
        dead_code: true,
    }
    input: {
        function f(a) {
            return a = {
                p: function() {
                    return a;
                }
            };
        }
        console.log(typeof f().p());
    }
    expect: {
        function f(a) {
            return a = {
                p: function() {
                    return a;
                }
            };
        }
        console.log(typeof f().p());
    }
    expect_stdout: "object"
}

issue_2692: {
    options = {
        dead_code: true,
        reduce_vars: false,
    }
    input: {
        function f(a) {
            return a = g;
            function g() {
                return a;
            }
        }
        console.log(typeof f()());
    }
    expect: {
        function f(a) {
            return a = g;
            function g() {
                return a;
            }
        }
        console.log(typeof f()());
    }
    expect_stdout: "function"
}

issue_2701: {
    options = {
        dead_code: true,
        inline: false,
    }
    input: {
        function f(a) {
            return a = function() {
                return function() {
                    return a;
                };
            }();
        }
        console.log(typeof f()());
    }
    expect: {
        function f(a) {
            return a = function() {
                return function() {
                    return a;
                };
            }();
        }
        console.log(typeof f()());
    }
    expect_stdout: "function"
}

issue_2749: {
    options = {
        dead_code: true,
        inline: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 2, c = "PASS";
        while (a--)
            (function() {
                return b ? c = "FAIL" : b = 1;
                try {
                } catch (b) {
                    var b;
                }
            })();
        console.log(c);
    }
    expect: {
        var a = 2, c = "PASS";
        while (a--)
            b = void 0, b ? c = "FAIL" : b = 1;
        var b;
        console.log(c);
    }
    expect_stdout: "PASS"
}

unsafe_builtin: {
    options = {
        side_effects: true,
        unsafe: true,
    }
    input: {
        (!w).constructor(x);
        Math.abs(y);
        [ 1, 2, z ].valueOf();
    }
    expect: {
        w, x;
        y;
        z;
    }
}

issue_2860_1: {
    options = {
        dead_code: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        console.log(function(a) {
            return a ^= 1;
        }());
    }
    expect: {
        console.log(function(a) {
            return 1 ^ a;
        }());
    }
    expect_stdout: "1"
}

issue_2860_2: {
    options = {
        dead_code: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
    }
    input: {
        console.log(function(a) {
            return a ^= 1;
        }());
    }
    expect: {
        console.log(1);
    }
    expect_stdout: "1"
}
