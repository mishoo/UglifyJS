retain_block: {
    options = {}
    input: {
        "use strict";
        {
            let a = "FAIL";
        }
        var a = "PASS";
        console.log(a);
    }
    expect: {
        "use strict";
        {
            let a = "FAIL";
        }
        var a = "PASS";
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

if_dead_branch: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
    }
    input: {
        "use strict";
        console.log(function() {
            if (0) {
                let a = 0;
            }
            return typeof a;
        }());
    }
    expect: {
        "use strict";
        console.log(function() {
            0;
            {
                let a;
            }
            return typeof a;
        }());
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

merge_vars_1: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        let a = console;
        console.log(typeof a);
        var b = typeof a;
        console.log(b);
    }
    expect: {
        "use strict";
        let a = console;
        console.log(typeof a);
        var b = typeof a;
        console.log(b);
    }
    expect_stdout: [
        "object",
        "object",
    ]
    node_version: ">=4"
}

merge_vars_2: {
    options = {
        inline: true,
        merge_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        var a = 0;
        (function() {
            var b = function f() {
                let c = a && f;
                c.var += 0;
            }();
            console.log(b);
        })(1 && --a);
    }
    expect: {
        "use strict";
        var a = 0;
        1 && --a,
        b = function f() {
            let c = a && f;
            c.var += 0;
        }(),
        void console.log(b);
        var b;
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

merge_vars_3: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        {
            let a = 0;
            var b = console;
            console.log(typeof b);
        }
        var a = 1;
        console.log(typeof a);
    }
    expect: {
        "use strict";
        {
            let a = 0;
            var b = console;
            console.log(typeof b);
        }
        var a = 1;
        console.log(typeof a);
    }
    expect_stdout: [
        "object",
        "number",
    ]
    node_version: ">=4"
}

use_before_init_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        a = "foo";
        let a = "bar";
    }
    expect: {
        "use strict";
        a = "foo";
        let a = "bar";
    }
    expect_stdout: true
    node_version: ">=4"
}

use_before_init_2: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        try {
            a = "foo";
        } catch (e) {
            console.log("PASS");
        }
        let a = "bar";
    }
    expect: {
        "use strict";
        try {
            a = "foo";
        } catch (e) {
            console.log("PASS");
        }
        let a = "bar";
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

use_before_init_3: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        try {
            a;
        } catch (e) {
            console.log("PASS");
        }
        let a = 42;
    }
    expect: {
        "use strict";
        try {
            a;
        } catch (e) {
            console.log("PASS");
        }
        let a = 42;
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

use_before_init_4: {
    options = {
        reduce_vars: true,
    }
    input: {
        "use strict";
        try {
            console.log(a);
        } catch (e) {
            console.log("PASS");
        }
        let a = "FAIL";
    }
    expect: {
        "use strict";
        try {
            console.log(a);
        } catch (e) {
            console.log("PASS");
        }
        let a = "FAIL";
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

collapse_block: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        unsafe: true,
    }
    input: {
        "use strict";
        {
            let a = typeof console;
            console.log(a);
        }
    }
    expect: {
        "use strict";
        {
            let a = typeof console;
            console.log(a);
        }
    }
    expect_stdout: "object"
    node_version: ">=4"
}

reduce_block_1: {
    options = {
        reduce_vars: true,
    }
    input: {
        "use strict";
        {
            let a = typeof console;
            console.log(a);
        }
    }
    expect: {
        "use strict";
        {
            let a = typeof console;
            console.log(a);
        }
    }
    expect_stdout: "object"
    node_version: ">=4"
}

reduce_block_2: {
    options = {
        reduce_vars: true,
    }
    input: {
        "use strict";
        {
            let a = typeof console;
            console.log(a);
        }
        console.log(typeof a);
    }
    expect: {
        "use strict";
        {
            let a = typeof console;
            console.log(a);
        }
        console.log(typeof a);
    }
    expect_stdout: [
        "object",
        "undefined",
    ]
    node_version: ">=4"
}

reduce_block_2_toplevel: {
    options = {
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        {
            let a = typeof console;
            console.log(a);
        }
        console.log(typeof a);
    }
    expect: {
        "use strict";
        {
            let a = typeof console;
            console.log(a);
        }
        console.log(typeof a);
    }
    expect_stdout: [
        "object",
        "undefined",
    ]
    node_version: ">=4"
}

hoist_props: {
    options = {
        hoist_props: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        {
            let o = {
                p: "PASS",
            };
            console.log(o.p);
        }
    }
    expect: {
        "use strict";
        {
            let o = {
                p: "PASS",
            };
            console.log(o.p);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

loop_block_1: {
    options = {
        loops: true,
    }
    input: {
        "use strict";
        do {
            let o = console;
            console.log(typeof o.log);
        } while (!console);
    }
    expect: {
        "use strict";
        do {
            let o = console;
            console.log(typeof o.log);
        } while (!console);
    }
    expect_stdout: "function"
    node_version: ">=4"
}

loop_block_2: {
    options = {
        loops: true,
    }
    input: {
        "use strict";
        do {
            let o = {};
            (function() {
                console.log(typeof this, o.p++);
            })();
        } while (!console);
    }
    expect: {
        "use strict";
        do {
            let o = {};
            (function() {
                console.log(typeof this, o.p++);
            })();
        } while (!console);
    }
    expect_stdout: "undefined NaN"
    node_version: ">=4"
}

do_continue: {
    options = {
        loops: true,
    }
    input: {
        "use strict";
        try {
            do {
                {
                    let a = 0;
                    continue;
                }
            } while ([ A ]);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            do {
                let a = 0;
                continue;
            } while ([ A ]);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

dead_block_after_return: {
    options = {
        dead_code: true,
    }
    input: {
        "use strict";
        (function(a) {
            console.log(a);
            return;
            {
                let a = "FAIL";
            }
        })("PASS");
    }
    expect: {
        "use strict";
        (function(a) {
            console.log(a);
            return;
            {
                let a;
            }
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

do_if_continue_1: {
    options = {
        if_return: true,
    }
    input: {
        "use strict";
        do {
            if (console) {
                console.log("PASS");
                {
                    let a = 0;
                    var b;
                    continue;
                }
            }
        } while (b);
    }
    expect: {
        "use strict";
        do {
            if (!console);
            else {
                console.log("PASS");
                {
                    let a = 0;
                    var b;
                }
            }
        } while (b);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

do_if_continue_2: {
    options = {
        if_return: true,
    }
    input: {
        "use strict";
        do {
            if (console) {
                console.log("FAIL");
                {
                    let a = 0;
                    A = 0;
                    continue;
                }
            }
        } while (A);
    }
    expect: {
        "use strict";
        do {
            if (!console);
            else {
                console.log("FAIL");
                {
                    let a = 0;
                    A = 0;
                }
            }
        } while (A);
    }
    expect_stdout: ReferenceError("A is not defined")
    node_version: ">=4"
}

drop_unused: {
    options = {
        evaluate: true,
        side_effects: true,
        unused: true,
    }
    input: {
        "use strict";
        function f(a) {
            let b = a, c = b;
            0 && c.p++;
        }
        console.log(f());
    }
    expect: {
        "use strict";
        function f(a) {
            let b = a;
            b;
        }
        console.log(f());
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_4191: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        {
            let a = function() {};
        }
        console.log(typeof a);
    }
    expect: {
        "use strict";
        {
            let a = function() {};
        }
        console.log(typeof a);
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_4197: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        var a = 0;
        try {
            let b = function() {
                a = 1;
                b[1];
            }();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        "use strict";
        var a = 0;
        try {
            let b = function() {
                a = 1;
                b[1];
            }();
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "1"
    node_version: ">=4"
}

issue_4202: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        "use strict";
        {
            let o = {};
            (function() {
                function f() {
                    o.p = 42;
                }
                f(f);
            })();
            console.log(o.p++);
        }
    }
    expect: {
        "use strict";
        {
            let o = {};
            (function() {
                function f() {
                    o.p = 42;
                }
                f(f);
            })();
            console.log(o.p++);
        }
    }
    expect_stdout: "42"
    node_version: ">=4"
}

issue_4207: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        {
            let a = function() {};
            console.log(a.length);
        }
    }
    expect: {
        "use strict";
        {
            let a = function() {};
            console.log(a.length);
        }
    }
    expect_stdout: "0"
    node_version: ">=4"
}

issue_4218: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var a;
        {
            let a = function() {};
            var b = 0 * a;
        }
        console.log(typeof a, b);
    }
    expect: {
        "use strict";
        var b = 0 * function() {};
        console.log(typeof void 0, b);
    }
    expect_stdout: "undefined NaN"
    node_version: ">=4"
}

issue_4210: {
    options = {
        reduce_vars: true,
        varify: true,
    }
    input: {
        "use strict";
        var a;
        (function() {
            try {
                throw 42;
            } catch (e) {
                let a = typeof e;
                console.log(a);
            } finally {
                return a = "foo";
            }
        })();
        console.log(typeof a);
    }
    expect: {
        "use strict";
        var a;
        (function() {
            try {
                throw 42;
            } catch (e) {
                let a = typeof e;
                console.log(a);
            } finally {
                return a = "foo";
            }
        })();
        console.log(typeof a);
    }
    expect_stdout: [
        "number",
        "string",
    ]
    node_version: ">=4"
}

issue_4212_1: {
    options = {
        dead_code: true,
    }
    input: {
        "use strict";
        console.log({
            get b() {
                let a = 0;
                return a /= 0;
            }
        }.b);
    }
    expect: {
        "use strict";
        console.log({
            get b() {
                let a = 0;
                return a / 0;
            }
        }.b);
    }
    expect_stdout: "NaN"
    node_version: ">=4"
}

issue_4212_2: {
    options = {
        reduce_vars: true,
    }
    input: {
        "use strict";
        console.log({
            get b() {
                let a = 0;
                return a /= 0;
            }
        }.b);
    }
    expect: {
        "use strict";
        console.log({
            get b() {
                let a = 0;
                return a /= 0;
            }
        }.b);
    }
    expect_stdout: "NaN"
    node_version: ">=4"
}

skip_braces: {
    beautify = {
        beautify: true,
        braces: true,
    }
    input: {
        "use strict";
        if (console)
            let a = console.log(typeof a);
    }
    expect_exact: [
        '"use strict";',
        "",
        "if (console) let a = console.log(typeof a);",
    ]
    expect_stdout: true
    node_version: ">=4"
}

issue_4225: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        let a = void typeof b;
        let b = 42;
        console.log(a, b);
    }
    expect: {
        "use strict";
        let a = void b;
        let b = 42;
        console.log(a, b);
    }
    expect_stdout: true
    node_version: ">=4"
}

issue_4229: {
    options = {
        ie8: true,
        side_effects: true,
    }
    input: {
        "use strict";
        try {
            (function f() {
                f;
                let f;
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            (function f() {
                f;
                let f;
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4231: {
    options = {
        ie8: true,
        side_effects: true,
    }
    input: {
        "use strict";
        typeof a == 0;
        console.log(typeof function a() {
            let a;
        });
    }
    expect: {
        "use strict";
        console.log(typeof function a() {
            let a;
        });
    }
    expect_stdout: "function"
    node_version: ">=4"
}

issue_4245: {
    options = {
        booleans: true,
    }
    input: {
        "use strict";
        let a = f();
        function f() {
            typeof a;
        }
    }
    expect: {
        "use strict";
        let a = f();
        function f() {
            a,
            1;
        }
    }
    expect_stdout: ReferenceError("a is not defined")
    node_version: ">=4"
}
