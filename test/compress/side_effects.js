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
