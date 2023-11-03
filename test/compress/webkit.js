lambda_call_dot_assign: {
    beautify = {
        webkit: false,
    }
    input: {
        console.log(function() {
            return {};
        }().a = 1);
    }
    expect_exact: "console.log(function(){return{}}().a=1);"
    expect_stdout: "1"
}

lambda_call_dot_assign_webkit: {
    beautify = {
        webkit: true,
    }
    input: {
        console.log(function() {
            return {};
        }().a = 1);
    }
    expect_exact: "console.log((function(){return{}}()).a=1);"
    expect_stdout: "1"
}

lambda_dot_assign: {
    beautify = {
        webkit: false,
    }
    input: {
        console.log(function() {
            1 + 1;
        }.a = 1);
    }
    expect_exact: "console.log(function(){1+1}.a=1);"
    expect_stdout: "1"
}

lambda_dot_assign_webkit: {
    beautify = {
        webkit: true,
    }
    input: {
        console.log(function() {
            1 + 1;
        }.a = 1);
    }
    expect_exact: "console.log((function(){1+1}).a=1);"
    expect_stdout: "1"
}

lambda_name_mangle: {
    mangle = {}
    input: {
        console.log(typeof function foo(bar) {});
    }
    expect_exact: "console.log(typeof function o(n){});"
    expect_stdout: "function"
}

lambda_name_mangle_ie8: {
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        console.log(typeof function foo(bar) {});
    }
    expect_exact: "console.log(typeof function n(o){});"
    expect_stdout: "function"
}

function_name_mangle: {
    options = {
        keep_fnames: true,
        reduce_vars: true,
        unused: true,
    }
    mangle = {}
    input: {
        (function() {
            function foo(bar) {}
            console.log(typeof foo);
        })();
    }
    expect_exact: "(function(){console.log(typeof function o(n){})})();"
    expect_stdout: "function"
}

function_name_mangle_ie8: {
    options = {
        keep_fnames: true,
        reduce_vars: true,
        unused: true,
    }
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        (function() {
            function foo(bar) {}
            console.log(typeof foo);
        })();
    }
    expect_exact: "(function(){console.log(typeof function n(o){})})();"
    expect_stdout: "function"
}

issue_1753: {
    mangle = {
        toplevel: false,
        webkit: true,
    }
    input: {
        "use strict";
        let l = null;
        for (let i = 0; i < 1; i++)
            console.log(i);
    }
    expect: {
        "use strict";
        let l = null;
        for (let i = 0; i < 1; i++)
            console.log(i);
    }
    expect_stdout: "0"
    node_version: ">=4"
}

issue_1753_toplevel: {
    mangle = {
        toplevel: true,
        webkit: true,
    }
    input: {
        "use strict";
        let l = null;
        for (let i = 0; i < 1; i++)
            console.log(i);
    }
    expect: {
        "use strict";
        let l = null;
        for (let e = 0; e < 1; e++)
            console.log(e);
    }
    expect_stdout: "0"
    node_version: ">=4"
}

issue_5032_await: {
    options = {
        merge_vars: true,
        webkit: false,
    }
    input: {
        function log(value) {
            console.log(value);
            return value;
        }
        async function f(a) {
            var b = log(a), c = b;
            log(b);
            log(c);
        }
        f("PASS");
    }
    expect: {
        function log(value) {
            console.log(value);
            return value;
        }
        async function f(a) {
            var a = log(a), c = a;
            log(a);
            log(c);
        }
        f("PASS");
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
    ]
    node_version: ">=8"
}

issue_5032_await_webkit: {
    options = {
        merge_vars: true,
        webkit: true,
    }
    input: {
        function log(value) {
            console.log(value);
            return value;
        }
        async function f(a) {
            var b = log(a), c = b;
            log(b);
            log(c);
        }
        f("PASS");
    }
    expect: {
        function log(value) {
            console.log(value);
            return value;
        }
        async function f(a) {
            var b = log(a), c = b;
            log(b);
            log(c);
        }
        f("PASS");
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
    ]
    node_version: ">=8"
}

issue_5032_yield: {
    options = {
        merge_vars: true,
        webkit: false,
    }
    input: {
        function log(value) {
            console.log(value);
            return value;
        }
        function *f(a) {
            var b = log(a), c = b;
            log(b);
            log(c);
        }
        f("PASS").next();
    }
    expect: {
        function log(value) {
            console.log(value);
            return value;
        }
        function *f(a) {
            var a = log(a), c = a;
            log(a);
            log(c);
        }
        f("PASS").next();
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
    ]
    node_version: ">=4"
}

issue_5032_yield_webkit: {
    options = {
        merge_vars: true,
        webkit: true,
    }
    input: {
        function log(value) {
            console.log(value);
            return value;
        }
        function *f(a) {
            var b = log(a), c = b;
            log(b);
            log(c);
        }
        f("PASS").next();
    }
    expect: {
        function log(value) {
            console.log(value);
            return value;
        }
        function *f(a) {
            var b = log(a), c = b;
            log(b);
            log(c);
        }
        f("PASS").next();
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
    ]
    node_version: ">=4"
}

issue_5480: {
    mangle = {
        webkit: true,
    }
    input: {
        "use strict";
        L: for (let a in console.log("PASS"));
    }
    expect: {
        "use strict";
        o: for (let o in console.log("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}
