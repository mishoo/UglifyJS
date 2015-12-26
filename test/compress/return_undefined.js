return_undefined: {
    options = {
        sequences     : false,
        if_return     : true,
        evaluate      : true,
        dead_code     : true,
        conditionals  : true,
        comparisons   : true,
        booleans      : true,
        unused        : true,
        side_effects  : true,
        properties    : true,
        drop_debugger : true,
        loops         : true,
        hoist_funs    : true,
        keep_fargs    : true,
        keep_fnames   : false,
        hoist_vars    : true,
        join_vars     : true,
        cascade       : true,
        negate_iife   : true
    };
    input: {
        function f0() {
        }
        function f1() {
            return undefined;
        }
        function f2() {
            return void 0;
        }
        function f3() {
            return void 123;
        }
        function f4() {
            return;
        }
        function f5(a, b) {
            console.log(a, b);
            baz(a);
            return;
        }
        function f6(a, b) {
            console.log(a, b);
            if (a) {
                foo(b);
                baz(a);
                return a + b;
            }
            return undefined;
        }
        function f7(a, b) {
            console.log(a, b);
            if (a) {
                foo(b);
                baz(a);
                return void 0;
            }
            return a + b;
        }
        function f8(a, b) {
            foo(a);
            bar(b);
            return void 0;
        }
        function f9(a, b) {
            foo(a);
            bar(b);
            return undefined;
        }
        function f10() {
            return false;
        }
        function f11() {
            return null;
        }
        function f12() {
            return 0;
        }
    }
    expect: {
        function f0() {}
        function f1() {}
        function f2() {}
        function f3() {}
        function f4() {}
        function f5(a, b) {
            console.log(a, b);
            baz(a);
        }
        function f6(a, b) {
            console.log(a, b);
            if (a) {
                foo(b);
                baz(a);
                return a + b;
            }
        }
        function f7(a, b) {
            console.log(a, b);
            if (!a)
                return a + b;
            foo(b);
            baz(a);
        }
        function f8(a, b) {
            foo(a);
            bar(b);
        }
        function f9(a, b) {
            foo(a);
            bar(b);
        }
        function f10() {
            return !1;
        }
        function f11() {
            return null;
        }
        function f12() {
            return 0;
        }
    }
}
