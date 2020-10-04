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
            AnotherUndeclaredGlobal;
            (void 0).isNaN;
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

unsafe_builtin_1: {
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

unsafe_builtin_2: {
    options = {
        side_effects: true,
        unsafe: true,
    }
    input: {
        var o = {};
        constructor.call(o, 42);
        __defineGetter__.call(o, "foo", function() {
            return o.p;
        });
        __defineSetter__.call(o, void 0, function(a) {
            o.p = a;
        });
        console.log(typeof o, o.undefined = "PASS", o.foo);
    }
    expect: {
        var o = {};
        constructor.call(o, 42);
        __defineGetter__.call(o, "foo", function() {
            return o.p;
        });
        __defineSetter__.call(o, void 0, function(a) {
            o.p = a;
        });
        console.log(typeof o, o.undefined = "PASS", o.foo);
    }
    expect_stdout: "object PASS PASS"
}

unsafe_builtin_3: {
    options = {
        conditionals: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
    }
    input: {
        var o = {};
        if (42 < Math.random())
            o.p = "FAIL";
        else
            o.p = "PASS";
        for (var k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {};
        o.p = 42 < Math.random() ? "FAIL" : "PASS";
        for (var k in o)
            console.log(k, o[k]);
    }
    expect_stdout: "p PASS"
}

unsafe_string_replace: {
    options = {
        side_effects: true,
        unsafe: true,
    }
    input: {
        "foo".replace("f", function() {
            console.log("PASS");
        });
    }
    expect: {
        "foo".replace("f", function() {
            console.log("PASS");
        });
    }
    expect_stdout: "PASS"
}

drop_value: {
    options = {
        side_effects: true,
    }
    input: {
        (1, [2, foo()], 3, {a:1, b:bar()});
    }
    expect: {
        foo(), bar();
    }
}

operator_in: {
    options = {
        side_effects: true,
    }
    input: {
        try {
            "foo" in true;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            0 in true;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_3983_1: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        function f() {
            g && g();
        }
        f();
        function g() {
            0 ? a : 0;
        }
        var b = a;
        console.log(a);
    }
    expect: {
        var a = "PASS";
        g();
        function g() {}
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3983_2: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        function f() {
            g && g();
        }
        f();
        function g() {
            0 ? a : 0;
        }
        var b = a;
        console.log(a);
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4008: {
    options = {
        collapse_vars: true,
        evaluate: true,
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = "PASS";
        function f(b, b) {
            console.log(b);
        }
        f && f(a && a[a]);
        console.log(a);
    }
    expect: {
        var a = "PASS";
        function f(b, b) {
            console.log(b);
        }
        f(a[a]);
        console.log(a);
    }
    expect_stdout: [
        "undefined",
        "PASS",
    ]
}

trim_new: {
    options = {
        side_effects: true,
    }
    input: {
        new function(a) {
            console.log(a);
        }("PASS");
    }
    expect: {
        (function(a) {
            console.log(a);
        })("PASS");
    }
    expect_stdout: "PASS"
}
