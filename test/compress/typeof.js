typeof_evaluation: {
    options = {
        evaluate: true,
        typeofs: true,
    }
    input: {
        a = typeof 1;
        b = typeof 'test';
        c = typeof [];
        d = typeof {};
        e = typeof /./;
        f = typeof false;
        g = typeof function(){};
        h = typeof undefined;
    }
    expect: {
        a='number';
        b='string';
        c=typeof[];
        d=typeof{};
        e=typeof/./;
        f='boolean';
        g='function';
        h='undefined';
    }
}

typeof_in_boolean_context: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        function f1(x) { return typeof x ? "yes" : "no"; }
        function f2() { return typeof g()? "Yes" : "No"; }
        typeof 0 ? foo() : bar();
        !typeof console.log(1);
        var a = !typeof console.log(2);
        if (typeof (1 + foo()));
    }
    expect: {
        function f1(x) { return "yes"; }
        function f2() { return g(), "Yes"; }
        foo();
        console.log(1);
        var a = !(console.log(2), 1);
        foo();
    }
}

issue_1668: {
    options = {
        booleans: true,
    }
    input: {
        if (typeof bar);
    }
    expect: {
        if (1);
    }
}

typeof_defun_1: {
    options = {
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        function f() {
            console.log("YES");
        }
        function g() {
            h = 42;
            console.log("NOPE");
        }
        function h() {
            console.log("YUP");
        }
        g = 42;
        "function" == typeof f && f();
        "function" == typeof g && g();
        "function" == typeof h && h();
    }
    expect: {
        function h() {
            console.log("YUP");
        }
        console.log("YES");
        h();
    }
    expect_stdout: [
        "YES",
        "YUP",
    ]
}

typeof_defun_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        typeofs: true,
    }
    input: {
        var f = function() {
            console.log(x);
        };
        var x = 0;
        x++ < 2 && typeof f == "function" && f();
        x++ < 2 && typeof f == "function" && f();
        x++ < 2 && typeof f == "function" && f();
    }
    expect: {
        var f = function() {
            console.log(x);
        };
        var x = 0;
        x++ < 2 && f();
        x++ < 2 && f();
        x++ < 2 && f();
    }
    expect_stdout: [
        "1",
        "2",
    ]
}

duplicate_defun_arg_name: {
    options = {
        evaluate: true,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        function long_name(long_name) {
            return typeof long_name;
        }
        console.log(typeof long_name, long_name());
    }
    expect: {
        function long_name(long_name) {
            return typeof long_name;
        }
        console.log(typeof long_name, long_name());
    }
    expect_stdout: "function undefined"
}

duplicate_lambda_arg_name: {
    options = {
        evaluate: true,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        console.log(function long_name(long_name) {
            return typeof long_name;
        }());
    }
    expect: {
        console.log("undefined");
    }
    expect_stdout: "undefined"
}

issue_2728_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        (function arguments() {
            console.log(typeof arguments);
        })();
    }
    expect: {
        (function arguments() {
            console.log(typeof arguments);
        })();
    }
    expect_stdout: "object"
}

issue_2728_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        function arguments() {
            return typeof arguments;
        }
        console.log(typeof arguments, arguments());
    }
    expect: {
        function arguments() {
            return typeof arguments;
        }
        console.log(typeof arguments, arguments());
    }
    expect_stdout: "function object"
}

issue_2728_3: {
    options = {
        evaluate: true,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        (function() {
            function arguments() {
            }
            console.log(typeof arguments);
        })();
    }
    expect: {
        (function() {
            function arguments() {
            }
            console.log("function");
        })();
    }
    expect_stdout: "function"
}

issue_2728_4: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        typeofs: true,
    }
    input: {
        function arguments() {
        }
        console.log(typeof arguments);
    }
    expect: {
        function arguments() {
        }
        console.log("function");
    }
    expect_stdout: "function"
}

issue_2728_5: {
    options = {
        evaluate: true,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        (function arguments(arguments) {
            console.log(typeof arguments);
        })();
    }
    expect: {
        (function arguments(arguments) {
            console.log(typeof arguments);
        })();
    }
    expect_stdout: "undefined"
}

issue_2728_6: {
    options = {
        evaluate: true,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        function arguments(arguments) {
            return typeof arguments;
        }
        console.log(typeof arguments, arguments());
    }
    expect: {
        function arguments(arguments) {
            return typeof arguments;
        }
        console.log(typeof arguments, arguments());
    }
    expect_stdout: "function undefined"
}

typeof_defined_1: {
    options = {
        side_effects: true,
        typeofs: true,
    }
    input: {
        "undefined" == typeof A && A;
        "undefined" != typeof A && A;
        "undefined" == typeof A || A;
        "undefined" != typeof A || A;
    }
    expect: {
        "undefined" == typeof A && A;
        "undefined" == typeof A && A;
    }
}

typeof_defined_2: {
    options = {
        side_effects: true,
        typeofs: true,
    }
    input: {
        "function" == typeof A && A;
        "function" != typeof A && A;
        "function" == typeof A || A;
        "function" != typeof A || A;
    }
    expect: {
        "function" != typeof A && A;
        "function" != typeof A && A;
    }
}

typeof_defined_3: {
    options = {
        side_effects: true,
        typeofs: true,
    }
    input: {
        "undefined" == typeof A && "undefined" == typeof B && (A, B);
        "undefined" == typeof A && "undefined" != typeof B && (A, B);
        "undefined" != typeof A && "undefined" == typeof B && (A, B);
        "undefined" != typeof A && "undefined" != typeof B && (A, B);
        "undefined" == typeof A && "undefined" == typeof B || (A, B);
        "undefined" == typeof A && "undefined" != typeof B || (A, B);
        "undefined" != typeof A && "undefined" == typeof B || (A, B);
        "undefined" != typeof A && "undefined" != typeof B || (A, B);
        "undefined" == typeof A || "undefined" == typeof B && (A, B);
        "undefined" == typeof A || "undefined" != typeof B && (A, B);
        "undefined" != typeof A || "undefined" == typeof B && (A, B);
        "undefined" != typeof A || "undefined" != typeof B && (A, B);
        "undefined" == typeof A || "undefined" == typeof B || (A, B);
        "undefined" == typeof A || "undefined" != typeof B || (A, B);
        "undefined" != typeof A || "undefined" == typeof B || (A, B);
        "undefined" != typeof A || "undefined" != typeof B || (A, B);
    }
    expect: {
        "undefined" == typeof A && "undefined" == typeof B && (A, B);
        "undefined" == typeof A && "undefined" != typeof B && A;
        "undefined" != typeof A && "undefined" == typeof B && B;
        // dropped
        "undefined" == typeof A && "undefined" == typeof B || (A, B);
        "undefined" == typeof A && "undefined" != typeof B || (A, B);
        "undefined" != typeof A && "undefined" == typeof B || (A, B);
        "undefined" != typeof A && "undefined" != typeof B || (A, B);
        "undefined" != typeof A && "undefined" == typeof B && B;
        // dropped
        "undefined" == typeof A && "undefined" == typeof B && (A, B);
        "undefined" == typeof A && "undefined" != typeof B && A;
        // dropped
        "undefined" != typeof A && "undefined" == typeof B && B;
        "undefined" == typeof A && "undefined" != typeof B && A;
        "undefined" == typeof A && "undefined" == typeof B && (A, B);
    }
}

typeof_defined_4: {
    options = {
        side_effects: true,
        typeofs: true,
    }
    input: {
        "object" == typeof A && "object" == typeof B && (A, B);
        "object" == typeof A && "object" != typeof B && (A, B);
        "object" != typeof A && "object" == typeof B && (A, B);
        "object" != typeof A && "object" != typeof B && (A, B);
        "object" == typeof A && "object" == typeof B || (A, B);
        "object" == typeof A && "object" != typeof B || (A, B);
        "object" != typeof A && "object" == typeof B || (A, B);
        "object" != typeof A && "object" != typeof B || (A, B);
        "object" == typeof A || "object" == typeof B && (A, B);
        "object" == typeof A || "object" != typeof B && (A, B);
        "object" != typeof A || "object" == typeof B && (A, B);
        "object" != typeof A || "object" != typeof B && (A, B);
        "object" == typeof A || "object" == typeof B || (A, B);
        "object" == typeof A || "object" != typeof B || (A, B);
        "object" != typeof A || "object" == typeof B || (A, B);
        "object" != typeof A || "object" != typeof B || (A, B);
    }
    expect: {
        // dropped
        "object" == typeof A && "object" != typeof B && B;
        "object" != typeof A && "object" == typeof B && A;
        "object" != typeof A && "object" != typeof B && (A, B);
        "object" == typeof A && "object" == typeof B || (A, B);
        "object" == typeof A && "object" != typeof B || (A, B);
        "object" != typeof A && "object" == typeof B || (A, B);
        "object" != typeof A && "object" != typeof B || (A, B);
        "object" != typeof A && "object" == typeof B && A;
        "object" != typeof A && "object" != typeof B && (A, B);
        // dropped
        "object" == typeof A && "object" != typeof B && B;
        "object" != typeof A && "object" != typeof B && (A, B);
        "object" != typeof A && "object" == typeof B && A;
        "object" == typeof A && "object" != typeof B && B;
        // dropped
    }
}

emberjs_global: {
    options = {
        comparisons: true,
        conditionals: true,
        if_return: true,
        passes: 2,
        side_effects: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        var a;
        if (typeof A === "object") {
            a = A;
        } else if (typeof B === "object") {
            a = B;
        } else {
            throw new Error("PASS");
        }
    }
    expect: {
        if ("object" != typeof A && "object" != typeof B)
            throw new Error("PASS");
    }
    expect_stdout: Error("PASS")
}

reassign: {
    options = {
        comparisons: true,
        conditionals: true,
        passes: 2,
        typeofs: true,
    }
    input: {
        A = console;
        if ("undefined" == typeof A)
            console.log("FAIL 1");
        else {
            A = void 0;
            while (console.log(void 0 === A ? "PASS" : "FAIL 2"));
        }
    }
    expect: {
        A = console;
        if ("undefined" == typeof A)
            console.log("FAIL 1");
        else {
            A = void 0;
            while (console.log(void 0 === A ? "PASS" : "FAIL 2"));
        }
    }
    expect_stdout: "PASS"
}

reassign_call: {
    options = {
        comparisons: true,
        conditionals: true,
        passes: 2,
        typeofs: true,
    }
    input: {
        A = console;
        function f() {
            A = void 0;
        }
        if ("undefined" == typeof A)
            console.log("FAIL 1");
        else {
            f();
            while (console.log(void 0 === A ? "PASS" : "FAIL 2"));
        }
    }
    expect: {
        A = console;
        function f() {
            A = void 0;
        }
        if ("undefined" == typeof A)
            console.log("FAIL 1");
        else {
            f();
            while (console.log(void 0 === A ? "PASS" : "FAIL 2"));
        }
    }
    expect_stdout: "PASS"
}

reassign_conditional: {
    options = {
        comparisons: true,
        conditionals: true,
        passes: 2,
        typeofs: true,
    }
    input: {
        A = console;
        if ("undefined" == typeof A)
            console.log("FAIL 1");
        else {
            A &&= void 0;
            while (console.log(void 0 === A ? "PASS" : "FAIL 2"));
        }
    }
    expect: {
        A = console;
        if ("undefined" == typeof A)
            console.log("FAIL 1");
        else {
            A &&= void 0;
            while (console.log(void 0 === A ? "PASS" : "FAIL 2"));
        }
    }
    expect_stdout: "PASS"
    node_version: ">=15"
}

reassign_do: {
    options = {
        comparisons: true,
        conditionals: true,
        if_return: true,
        passes: 2,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        A = console;
        (function() {
            if ("undefined" == typeof A)
                return;
            var a = A, i = 2;
            do {
                console.log(void 0 === A, void 0 === a);
                A = void 0;
            } while (--i);
        })();
    }
    expect: {
        A = console;
        (function() {
            if ("undefined" != typeof A) {
                var a = A, i = 2;
                do {
                    console.log(void 0 === A, (a, false));
                    A = void 0;
                } while (--i);
            }
        })();
    }
    expect_stdout: [
        "false false",
        "true false",
    ]
}

reassign_for: {
    options = {
        comparisons: true,
        conditionals: true,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        typeofs: true,
    }
    input: {
        if (A = console, "undefined" != typeof A)
            for (var a = A, i = 0; i < 2; i++)
                console.log(void 0 === A, void 0 === a),
                A = void 0;
    }
    expect: {
        if (A = console, "undefined" != typeof A)
            for (var a = A, i = 0; i < 2; i++)
                console.log(void 0 === A, (a, false)),
                A = void 0;
    }
    expect_stdout: [
        "false false",
        "true false",
    ]
}

reassign_for_in: {
    options = {
        comparisons: true,
        conditionals: true,
        passes: 2,
        reduce_vars: true,
        typeofs: true,
    }
    input: {
        (A = console) && "undefined" != typeof A && function(a) {
            for (var k in [ a = A, 42 ]) {
                console.log(void 0 === A, void 0 === a);
                A = void 0;
            }
        }();
    }
    expect: {
        (A = console) && "undefined" != typeof A && function(a) {
            for (var k in [ a = A, 42 ]) {
                console.log(void 0 === A, (a, false));
                A = void 0;
            }
        }();
    }
    expect_stdout: [
        "false false",
        "true false",
    ]
}

reassign_iife: {
    options = {
        comparisons: true,
        conditionals: true,
        passes: 2,
        typeofs: true,
    }
    input: {
        A = console;
        if ("undefined" == typeof A)
            console.log("FAIL 1");
        else (function() {
            A = void 0;
        })(console.log(void 0 === A ? "FAIL 2" : "PASS"));
    }
    expect: {
        A = console;
        "undefined" == typeof A ? console.log("FAIL 1") : function() {
            A = void 0;
        }(console.log((A, false) ? "FAIL 2" : "PASS"));
    }
    expect_stdout: "PASS"
}

reassign_property: {
    options = {
        comparisons: true,
        conditionals: true,
        passes: 2,
        typeofs: true,
    }
    input: {
        A = console;
        if ("undefined" == typeof A)
            console.log("FAIL 1");
        else {
            A.p = void 0;
            console.log(void 0 === A ? "FAIL 2" : "PASS");
        }
    }
    expect: {
        A = console;
        if ("undefined" == typeof A)
            console.log("FAIL 1");
        else {
            A.p = void 0;
            console.log((A, false) ? "FAIL 2" : "PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_3817: {
    options = {
        comparisons: true,
        conditionals: true,
        passes: 2,
        typeofs: true,
    }
    input: {
        if ("A" == typeof A || !console.log("PASS")) switch (false) {
          case "undefined" == typeof A:
            console.log("FAIL");
        }
    }
    expect: {
        if ("A" == typeof A || !console.log("PASS")) switch (false) {
          case "undefined" == typeof A:
            console.log("FAIL");
        }
    }
    expect_stdout: "PASS"
}
