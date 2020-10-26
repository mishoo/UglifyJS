mangle_catch_1: {
    mangle = {}
    input: {
        try {
            throw "eeeee";
        } catch (c) {
            const e = typeof d;
        }
        console.log(typeof a, typeof b);
    }
    expect: {
        try {
            throw "eeeee";
        } catch (e) {
            const o = typeof d;
        }
        console.log(typeof a, typeof b);
    }
    expect_stdout: "undefined undefined"
}

mangle_catch_2: {
    mangle = {}
    input: {
        console.log(function f() {
            try {} catch (e) {
                const f = 0;
            }
        }());
    }
    expect: {
        console.log(function o() {
            try {} catch (c) {
                const o = 0;
            }
        }());
    }
    expect_stdout: "undefined"
}

retain_block: {
    options = {}
    input: {
        {
            const a = "FAIL";
        }
        var a = "PASS";
        console.log(a);
    }
    expect: {
        {
            const a = "FAIL";
        }
        var a = "PASS";
        console.log(a);
    }
    expect_stdout: true
}

if_dead_branch: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
    }
    input: {
        console.log(function() {
            if (0) {
                const a = 0;
            }
            return typeof a;
        }());
    }
    expect: {
        console.log(function() {
            0;
            {
                const a = void 0;
            }
            return typeof a;
        }());
    }
    expect_stdout: "undefined"
}

merge_vars_1: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        const a = console;
        console.log(typeof a);
        var b = typeof a;
        console.log(b);
    }
    expect: {
        const a = console;
        console.log(typeof a);
        var b = typeof a;
        console.log(b);
    }
    expect_stdout: [
        "object",
        "object",
    ]
}

merge_vars_2: {
    options = {
        inline: true,
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        (function() {
            var b = function f() {
                const c = a && f;
                c.var += 0;
            }();
            console.log(b);
        })(1 && --a);
    }
    expect: {
        var a = 0;
        1 && --a,
        b = function f() {
            const c = a && f;
            c.var += 0;
        }(),
        void console.log(b);
        var b;
    }
    expect_stdout: "undefined"
}

merge_vars_3: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        {
            const a = 0;
            var b = console;
            console.log(typeof b);
        }
        var a = 1;
        console.log(typeof a);
    }
    expect: {
        {
            const a = 0;
            var b = console;
            console.log(typeof b);
        }
        var a = 1;
        console.log(typeof a);
    }
    expect_stdout: true
}

use_before_init_1: {
    options = {
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        a = "foo";
        const a = "bar";
    }
    expect: {
        a = "foo";
        const a = "bar";
    }
    expect_stdout: true
}

use_before_init_2: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            a = "foo";
        } catch (e) {
            console.log("PASS");
        }
        const a = "bar";
    }
    expect: {
        try {
            a = "foo";
        } catch (e) {
            console.log("PASS");
        }
        const a = "bar";
    }
    expect_stdout: true
}

use_before_init_3: {
    options = {
        side_effects: true,
    }
    input: {
        try {
            a;
        } catch (e) {
            console.log("PASS");
        }
        const a = 42;
    }
    expect: {
        try {
            a;
        } catch (e) {
            console.log("PASS");
        }
        const a = 42;
    }
    expect_stdout: true
}

use_before_init_4: {
    options = {
        reduce_vars: true,
    }
    input: {
        try {
            console.log(a);
        } catch (e) {
            console.log("PASS");
        }
        const a = "FAIL";
    }
    expect: {
        try {
            console.log(a);
        } catch (e) {
            console.log("PASS");
        }
        const a = "FAIL";
    }
    expect_stdout: true
}

collapse_block: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        unsafe: true,
    }
    input: {
        {
            const a = typeof console;
            console.log(a);
        }
    }
    expect: {
        {
            const a = typeof console;
            console.log(a);
        }
    }
    expect_stdout: "object"
}

reduce_block_1: {
    options = {
        reduce_vars: true,
    }
    input: {
        {
            const a = typeof console;
            console.log(a);
        }
    }
    expect: {
        {
            const a = typeof console;
            console.log(a);
        }
    }
    expect_stdout: "object"
}

reduce_block_2: {
    options = {
        reduce_vars: true,
    }
    input: {
        {
            const a = typeof console;
            console.log(a);
        }
        console.log(typeof a);
    }
    expect: {
        {
            const a = typeof console;
            console.log(a);
        }
        console.log(typeof a);
    }
    expect_stdout: true
}

reduce_block_2_toplevel: {
    options = {
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        {
            const a = typeof console;
            console.log(a);
        }
        console.log(typeof a);
    }
    expect: {
        {
            const a = typeof console;
            console.log(a);
        }
        console.log(typeof a);
    }
    expect_stdout: true
}

hoist_props: {
    options = {
        hoist_props: true,
        reduce_vars: true,
    }
    input: {
        {
            const o = {
                p: "PASS",
            };
            console.log(o.p);
        }
    }
    expect: {
        {
            const o = {
                p: "PASS",
            };
            console.log(o.p);
        }
    }
    expect_stdout: "PASS"
}

loop_block_1: {
    options = {
        loops: true,
    }
    input: {
        do {
            const o = console;
            console.log(typeof o.log);
        } while (!console);
    }
    expect: {
        do {
            const o = console;
            console.log(typeof o.log);
        } while (!console);
    }
    expect_stdout: "function"
}

loop_block_2: {
    options = {
        loops: true,
    }
    input: {
        do {
            const o = {};
            (function() {
                console.log(typeof this, o.p++);
            })();
        } while (!console);
    }
    expect: {
        do {
            const o = {};
            (function() {
                console.log(typeof this, o.p++);
            })();
        } while (!console);
    }
    expect_stdout: "object NaN"
}

do_continue: {
    options = {
        loops: true,
    }
    input: {
        try {
            do {
                {
                    const a = 0;
                    continue;
                }
            } while ([ A ]);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            do {
                const a = 0;
                continue;
            } while ([ A ]);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

catch_ie8_1: {
    options = {
        ie8: true,
        unused: true,
    }
    input: {
        try {} catch (a) {}
        console.log(function a() {
            const a = 0;
        }());
    }
    expect: {
        try {} catch (a) {}
        console.log(function() {
        }());
    }
    expect_stdout: "undefined"
}

catch_ie8_2: {
    options = {
        dead_code: true,
        ie8: true,
        passes: 2,
        toplevel: true,
        unused: true,
    }
    input: {
        try {} catch (a) {
            const b = 0;
        }
        try {} catch (b) {}
        console.log(function() {
            return this;
        }().b);
    }
    expect: {
        console.log(function() {
            return this;
        }().b);
    }
    expect_stdout: "undefined"
}

dead_block_after_return: {
    options = {
        dead_code: true,
    }
    input: {
        (function(a) {
            console.log(a);
            return;
            {
                const a = 0;
            }
        })();
    }
    expect: {
        (function(a) {
            console.log(a);
            return;
            {
                const a = void 0;
            }
        })();
    }
    expect_stdout: true
}

do_if_continue_1: {
    options = {
        if_return: true,
    }
    input: {
        do {
            if (console) {
                console.log("PASS");
                {
                    const a = 0;
                    var b;
                    continue;
                }
            }
        } while (b);
    }
    expect: {
        do {
            if (!console);
            else {
                console.log("PASS");
                {
                    const a = 0;
                    var b;
                }
            }
        } while (b);
    }
    expect_stdout: "PASS"
}

do_if_continue_2: {
    options = {
        if_return: true,
    }
    input: {
        do {
            if (console) {
                console.log("PASS");
                {
                    const a = 0;
                    A = 0;
                    continue;
                }
            }
        } while (A);
    }
    expect: {
        do {
            if (!console);
            else {
                console.log("PASS");
                {
                    const a = 0;
                    A = 0;
                }
            }
        } while (A);
    }
    expect_stdout: "PASS"
}

drop_unused: {
    options = {
        evaluate: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(a) {
            const b = a, c = b;
            0 && c.p++;
        }
        console.log(f());
    }
    expect: {
        function f(a) {
            const b = a;
            b;
        }
        console.log(f());
    }
    expect_stdout: "undefined"
}

legacy_scope: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        {
            const a = 42;
        }
        var a;
    }
    expect: {
        {
            const a = 42;
        }
        var a;
    }
    expect_stdout: true
}

issue_4191: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        {
            const a = function() {};
        }
        console.log(typeof a);
    }
    expect: {
        {
            const a = function() {};
        }
        console.log(typeof a);
    }
    expect_stdout: true
}

issue_4193: {
    options = {
        dead_code: true,
    }
    input: {
        try {} catch (e) {
            var a;
        } finally {
            const a = 0;
        }
        console.log(a);
    }
    expect: {
        var a;
        {
            const a = 0;
        }
        console.log(a);
    }
    expect_stdout: true
}

issue_4195: {
    mangle = {
        ie8: true,
    }
    input: {
        console.log(function f(a) {
            (function a() {
                {
                    const b = f, a = 0;
                    b;
                }
            })();
            a && f;
        }());
    }
    expect: {
        console.log(function f(o) {
            (function o() {
                {
                    const n = f, o = 0;
                    n;
                }
            })();
            o && f;
        }());
    }
    expect_stdout: "undefined"
}

issue_4197: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = 0;
        try {
            const b = function() {
                a = 1;
                b[1];
            }();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = 0;
        try {
            const b = function() {
                a = 1;
                b[1];
            }();
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "1"
}

issue_4198: {
    options = {
        reduce_vars: true,
    }
    input: {
        console.log(function() {
            try {
                throw "PASS";
            } catch (e) {
                {
                    const e = "FAIL";
                }
                return function() {
                    return e;
                }();
            }
        }());
    }
    expect: {
        console.log(function() {
            try {
                throw "PASS";
            } catch (e) {
                {
                    const e = "FAIL";
                }
                return function() {
                    return e;
                }();
            }
        }());
    }
    expect_stdout: "PASS"
}

issue_4202: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        {
            const o = {};
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
        {
            const o = {};
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
}

issue_4205: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = function(b) {
            var c = function() {
                switch (0) {
                  case a:
                    return 0;
                  case b:
                  case console.log("PASS"):
                }
            }();
            {
                const b = c;
            }
        }();
    }
    expect: {
        var a = function(b) {
            var c = function() {
                switch (0) {
                  case a:
                    return 0;
                  case b:
                  case console.log("PASS"):
                }
            }();
            {
                const b = c;
            }
        }();
    }
    expect_stdout: true
}

issue_4207: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        {
            const a = function() {};
            console.log(a.length);
        }
    }
    expect: {
        {
            const a = function() {};
            console.log(a.length);
        }
    }
    expect_stdout: "0"
}

issue_4218: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        {
            const a = function() {};
            var b = 0 * a;
        }
        console.log(typeof a, b);
    }
    expect: {
        {
            const a = function() {};
            var b = 0 * a;
        }
        console.log(typeof a, b);
    }
    expect_stdout: true
}

issue_4210: {
    options = {
        reduce_vars: true,
    }
    input: {
        (function() {
            try {
                throw 42;
            } catch (e) {
                const a = typeof e;
                console.log(a);
            } finally {
                return a = "foo";
            }
        })();
        console.log(typeof a);
    }
    expect: {
        (function() {
            try {
                throw 42;
            } catch (e) {
                const a = typeof e;
                console.log(a);
            } finally {
                return a = "foo";
            }
        })();
        console.log(typeof a);
    }
    expect_stdout: true
}

issue_4212_1: {
    options = {
        dead_code: true,
    }
    input: {
        console.log({
            get b() {
                const a = 0;
                return a /= 0;
            }
        }.b);
    }
    expect: {
        console.log({
            get b() {
                const a = 0;
                return a /= 0;
            }
        }.b);
    }
    expect_stdout: true
}

issue_4212_2: {
    options = {
        reduce_vars: true,
    }
    input: {
        console.log({
            get b() {
                const a = 0;
                return a /= 0;
            }
        }.b);
    }
    expect: {
        console.log({
            get b() {
                const a = 0;
                return a /= 0;
            }
        }.b);
    }
    expect_stdout: true
}

issue_4216: {
    options = {
        collapse_vars: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
    }
    input: {
        if (a = 0) {
            const a = 0;
        }
        console.log(typeof a);
    }
    expect: {
        a = 0;
        {
            const a = void 0;
        }
        console.log(typeof a);
    }
    expect_stdout: true
}

skip_braces: {
    beautify = {
        beautify: true,
        braces: true,
    }
    input: {
        if (console)
            const a = 42;
        else
            const b = null;
        console.log(typeof a, typeof b);
    }
    expect_exact: [
        "if (console) const a = 42; else const b = null;",
        "",
        "console.log(typeof a, typeof b);",
    ]
    expect_stdout: true
}

issue_4220: {
    options = {
        collapse_vars: true,
        conditionals: true,
        sequences: true,
        toplevel: true,
    }
    input: {
        if (console) {
            var o = console;
            for (var k in o);
        } else {
            const a = 0;
        }
        console.log(typeof a);
    }
    expect: {
        if (console) {
            var o;
            for (var k in console);
        } else {
            const a = 0;
        }
        console.log(typeof a);
    }
    expect_stdout: true
}

issue_4222: {
    options = {
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        {
            const a = function() {
                return function() {};
            };
            var b = a();
        }
        b();
        console.log(typeof a);
    }
    expect: {
        {
            const a = function() {
                return function() {};
            };
            var b = a();
        }
        b();
        console.log(typeof a);
    }
    expect_stdout: true
}

issue_4225: {
    options = {
        side_effects: true,
    }
    input: {
        const a = void typeof b;
        const b = 42;
        console.log(a, b);
    }
    expect: {
        const a = void b;
        const b = 42;
        console.log(a, b);
    }
    expect_stdout: true
}

issue_4229: {
    options = {
        ie8: true,
        side_effects: true,
    }
    input: {
        (function f() {
            f;
            const f = 42;
        })();
    }
    expect: {
        (function f() {
            f;
            const f = 42;
        })();
    }
    expect_stdout: true
}

issue_4231: {
    options = {
        ie8: true,
        side_effects: true,
    }
    input: {
        typeof a == 0;
        console.log(typeof function a() {
            const a = 0;
        });
    }
    expect: {
        console.log(typeof function a() {
            const a = 0;
        });
    }
    expect_stdout: "function"
}

issue_4245: {
    options = {
        booleans: true,
    }
    input: {
        const a = f();
        function f() {
            typeof a;
        }
    }
    expect: {
        const a = f();
        function f() {
            a,
            1;
        }
    }
    expect_stdout: true
}
