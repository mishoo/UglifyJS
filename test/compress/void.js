void_1: {
    options = {
        void: true,
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
            var a = 1, undefined;
            console.log(undefined)
        }

        function f2(undefined) {
            var a = 2, undefined$0;
            console.log(undefined$0)
        }

        function f3() {
            var undefined = 3, undefined$0;
            console.log(undefined$0)
        }

        function f4() {
            console.log(undefined);
            for (var a = 4, undefined;;);
            var b = 4;

            function f5() {
                var c = 5, undefined;
                var d = 5;
                console.log(undefined)
            }
        }

        function f6() {
            try {
                var a = 6, undefined;
                console.log(undefined)
            } catch (e) {
                console.log(undefined)
            }
        }
    }
}

void_2: {
    options = {
        void: true,
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
            var a = 1, undefined;
            console.log(undefined);
            try {
                throw "FAIL"
            } catch (undefined) {
                console.log(void 0);
            }
        }

    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
}
