typeof_evaluation: {
    options = {
        evaluate: true,
        typeofs: true,
    };
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
        booleans     : true,
        evaluate     : true,
        conditionals : true,
        side_effects : true,
    };
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
        function g() {
            h = 42;
            console.log("NOPE");
        }
        function h() {
            console.log("YUP");
        }
        g = 42;
        console.log("YES");
        "function" == typeof g && g();
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
