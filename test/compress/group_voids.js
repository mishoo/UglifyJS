group_voids: {
    options = {
    }
    mangle = {
        group_voids: true,
        toplevel: false,
    }
    input: {
        var a = 0;
        x = void 0;
        if (void 0 === b)
            c = void 0;
        function f1() {
            var a = 1;
            console.log(void 0);
        }
        function f2(undefined) {
            var a = 2;
            console.log(void 0);
        }
        function f3() {
            var undefined = 3;
            console.log(void 0);
        }
        function f4() {
            console.log(void 0);
            for (var a = 4;;);
            var b = 4;
            function f5() {
                var c = 5;
                var d = 5;
                console.log(void 0);
            }
        }
        function f6() {
            try {
                var a = 6;
                console.log(void 0);
            } catch (e) {
                console.log(void 0);
            }
        }
    }
    expect: {
        var a = 0;
        x = void 0;
        if (void 0 === b)
            c = void 0;
        function f1() {
            var o = 1, a;
            console.log(a);
        }
        function f2(o) {
            var n = 2, a;
            console.log(a);
        }
        function f3() {
            var o = 3, a;
            console.log(a);
        }
        function f4() {
            console.log(a);
            for(var o = 4;;);
            var n = 4, a;
            function v() {
                var o = 5;
                var n = 5;
                console.log(a);
            }
        }
        function f6() {
            try {
                var o = 6;
                console.log(a);
            } catch (o) {
                console.log(a);
            }
            var a;
        }
    }
}

group_voids_toplevel: {
    options = {
    }
    mangle = {
        group_voids: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        x = void 0;
        if (void 0 === b)
            c = void 0;
        function f1() {
            var a = 1;
            console.log(void 0);
        }
        function f2(undefined) {
            var a = 2;
            console.log(void 0);
        }
        function f3() {
            var undefined = 3;
            console.log(void 0);
        }
        function f4() {
            console.log(void 0);
            for (var a = 4;;);
            var b = 4;
            function f5() {
                var c = 5;
                var d = 5;
                console.log(void 0);
            }
        }
        function f6() {
            try {
                var a = 6;
                console.log(void 0);
            } catch (e) {
                console.log(void 0);
            }
        }
    }
    expect: {
        var o = 0, a;
        x = a;
        if (a === b)
            c = a;
        function n() {
            var o = 1;
            console.log(a);
        }
        function v(o) {
            var n = 2;
            console.log(a);
        }
        function i() {
            var o = 3;
            console.log(a);
        }
        function l() {
            console.log(a);
            for(var o = 4;;);
            var n = 4;
            function v() {
                var o = 5;
                var n = 5;
                console.log(a);
            }
        }
        function r() {
            try {
                var o = 6;
                console.log(a);
            } catch (o) {
                console.log(a);
            }
        }
    }
}

group_voids_catch: {
    options = {
    }
    mangle = {
        group_voids: true,
    }
    input: {
        f();
        function f() {
            var a = 1;
            console.log(void 0);
            try {
                throw "FAIL";
            } catch (undefined) {
                console.log(void 0);
            }
        }
    }
    expect: {
        f();
        function f() {
            var o = 1, a;
            console.log(a);
            try {
                throw "FAIL";
            } catch (o) {
                console.log(a);
            }
        }
    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
}
