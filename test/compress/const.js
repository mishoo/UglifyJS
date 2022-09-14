mangle_block: {
    mangle = {
        toplevel: false,
    }
    input: {
        var o = "PASS";
        {
            const a = "FAIL";
        }
        console.log(o);
    }
    expect: {
        var o = "PASS";
        {
            const a = "FAIL";
        }
        console.log(o);
    }
    expect_stdout: "PASS"
}

mangle_block_toplevel: {
    mangle = {
        toplevel: true,
    }
    input: {
        var o = "PASS";
        {
            const a = "FAIL";
        }
        console.log(o);
    }
    expect: {
        var o = "PASS";
        {
            const c = "FAIL";
        }
        console.log(o);
    }
    expect_stdout: "PASS"
}

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
        } catch (o) {
            const e = typeof d;
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

retain_catch: {
    options = {
        dead_code: true,
    }
    input: {
        try {} catch (a) {
            const a = "aa";
        }
    }
    expect: {
        try {} catch (a) {
            const a = "aa";
        }
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

retain_tail_1: {
    options = {
        conditionals: true,
    }
    input: {
        function f(a) {
            var b = "foo";
            if (a) {
                const b = "bar";
                while (console.log("baz"));
                console.log(b);
            } else {
                while (console.log("moo"));
                console.log(b);
            }
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            var b = "foo";
            if (a) {
                const b = "bar";
                while (console.log("baz"));
                console.log(b);
            } else {
                while (console.log("moo"));
                console.log(b);
            }
        }
        f();
        f(42);
    }
    expect_stdout: true
}

retain_tail_2: {
    options = {
        conditionals: true,
    }
    input: {
        function f(a) {
            var b = "foo";
            if (a) {
                while (console.log("bar"));
                console.log(b);
            } else {
                const b = "baz";
                while (console.log("moo"));
                console.log(b);
            }
        }
        f();
        f(42);
    }
    expect: {
        function f(a) {
            var b = "foo";
            if (a) {
                while (console.log("bar"));
                console.log(b);
            } else {
                const b = "baz";
                while (console.log("moo"));
                console.log(b);
            }
        }
        f();
        f(42);
    }
    expect_stdout: true
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

merge_vars_4: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        console.log(typeof a);
        {
            var b = console;
            console.log(typeof b);
            const a = 0;
        }
    }
    expect: {
        var a = 1;
        console.log(typeof a);
        {
            var b = console;
            console.log(typeof b);
            const a = 0;
        }
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
        ie: true,
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
        ie: true,
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

if_return_3: {
    options = {
        if_return: true,
    }
    input: {
        var a = "PASS";
        function f(b) {
            if (console) {
                const b = a;
                return b;
            } else
                while (console.log("FAIL 1"));
            return b;
        }
        console.log(f("FAIL 2"));
    }
    expect: {
        var a = "PASS";
        function f(b) {
            if (console) {
                const b = a;
                return b;
            } else
                while (console.log("FAIL 1"));
            return b;
        }
        console.log(f("FAIL 2"));
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
            if (console) {
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
            if (console) {
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

hoist_vars: {
    options = {
        hoist_vars: true,
    }
    input: {
        {
            const a = "FAIL";
            var b = 42;
        }
        var a = "PASS";
        console.log(a, b);
    }
    expect: {
        var b;
        {
            const a = "FAIL";
            b = 42;
        }
        var a = "PASS";
        console.log(a, b);
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
        ie: true,
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
            function f() {
                o.p = 42;
            }
            f(f);
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
        ie: true,
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
        ie: true,
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

issue_4248: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        try {
            (function() {
                a = "PASS";
                b[a];
                const b = 0;
            })();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = "FAIL";
        try {
            (function() {
                a = "PASS";
                b[a];
                const b = 0;
            })();
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "PASS"
}

issue_4261_1: {
    options = {
        inline: 3,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        {
            const a = 42;
            (function() {
                function f() {
                    console.log(a);
                }
                function g() {
                    while (f());
                }
                (function() {
                    while (g());
                })();
            })();
        }
    }
    expect: {
        {
            const a = 42;
            (function() {
                function g() {
                    while (void console.log(a));
                }
                (function() {
                    while (g());
                })();
            })();
        }
    }
    expect_stdout: "42"
}

issue_4261_2: {
    options = {
        if_return: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        {
            const a = 42;
            (function() {
                function f() {
                    console.log(a);
                }
                function g() {
                    while (f());
                }
                (function() {
                    while (g());
                })();
            })();
        }
    }
    expect: {
        {
            const a = 42;
            function g() {
                while (void console.log(a));
            }
            while (g());
        }
    }
    expect_stdout: "42"
}

issue_4274_1: {
    options = {
        loops: true,
    }
    input: {
        for (;;) {
            if (console.log("PASS")) {
                const a = 0;
            } else {
                break;
                var a;
            }
        }
    }
    expect: {
        for (; console.log("PASS");) {
            {
                const a = 0;
            }
            var a;
        }
    }
    expect_stdout: true
}

issue_4274_2: {
    options = {
        loops: true,
    }
    input: {
        for (;;) {
            if (!console.log("PASS")) {
                break;
                var a;
            } else {
                const a = 0;
            }
        }
    }
    expect: {
        for (; console.log("PASS");) {
            {
                const a = 0;
            }
            var a;
        }
    }
    expect_stdout: true
}

issue_4290_1: {
    options = {
        unused: true,
    }
    input: {
        const a = 0;
        var a;
    }
    expect: {
        const a = 0;
        var a;
    }
    expect_stdout: true
}

issue_4305_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            const arguments = function() {
                while (console.log("PASS"));
            };
            arguments();
        })();
    }
    expect: {
        (function() {
            const arguments = function() {
                while (console.log("PASS"));
            };
            arguments();
        })();
    }
    expect_stdout: true
}

issue_4305_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            const a = function() {
                while (console.log("aaaaa"));
            };
            a();
        })();
    }
    expect: {
        (function(a) {
            const a = function() {
                while (console.log("aaaaa"));
            };
            a();
        })();
    }
    expect_stdout: true
}

issue_4365_1: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        const arguments = 42;
    }
    expect: {
        const arguments = 42;
    }
    expect_stdout: true
}

issue_4365_2: {
    options = {
        toplevel: true,
        varify: true,
    }
    input: {
        const arguments = 42;
    }
    expect: {
        const arguments = 42;
    }
    expect_stdout: true
}

issue_4527: {
    mangle = {}
    input: {
        (function() {
            try {
                throw 1;
            } catch (a) {
                try {
                    const a = FAIL;
                } finally {
                    if (!b)
                        return console.log("aaaa");
                }
            }
            var b;
        })();
    }
    expect: {
        (function() {
            try {
                throw 1;
            } catch (a) {
                try {
                    const a = FAIL;
                } finally {
                    if (!t)
                        return console.log("aaaa");
                }
            }
            var t;
        })();
    }
    expect_stdout: "aaaa"
}

issue_4689: {
    options = {
        sequences: true,
    }
    input: {
        "use strict";
        var a = "PASS";
        console.log(a);
        for (const a in 42);
    }
    expect: {
        "use strict";
        var a = "PASS";
        console.log(a);
        for (const a in 42);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4691: {
    options = {
        conditionals: true,
        if_return: true,
        toplevel: true,
    }
    input: {
        function A() {}
        A.prototype.f = function() {
            if (!this)
                return;
            const a = "PA";
            function g(b) {
                h(a + b);
            }
            [ "SS" ].forEach(function(c) {
                g(c);
            });
        };
        function h(d) {
            console.log(d);
        }
        new A().f();
    }
    expect: {
        function A() {}
        A.prototype.f = function() {
            if (this) {
                const a = "PA";
                [ "SS" ].forEach(function(c) {
                    g(c);
                });
                function g(b) {
                    h(a + b);
                }
            }
        };
        function h(d) {
            console.log(d);
        }
        new A().f();
    }
    expect_stdout: "PASS"
}

issue_4848: {
    options = {
        if_return: true,
    }
    input: {
        function f(a) {
            a(function() {
                console.log(b);
            });
            if (!console)
                return;
            const b = "PASS";
        }
        var g;
        f(function(h) {
            g = h;
        });
        g();
    }
    expect: {
        function f(a) {
            a(function() {
                console.log(b);
            });
            if (!console)
                return;
            const b = "PASS";
        }
        var g;
        f(function(h) {
            g = h;
        });
        g();
    }
    expect_stdout: "PASS"
}

issue_4954_1: {
    rename = true
    input: {
        "use strict";
        (function() {
            {
                const a = "foo";
                console.log(a);
            }
            {
                const a = "bar";
                console.log(a);
            }
        })();
    }
    expect: {
        "use strict";
        (function() {
            {
                const a = "foo";
                console.log(a);
            }
            {
                const b = "bar";
                console.log(b);
            }
        })();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

issue_4954_2: {
    mangle = {}
    input: {
        "use strict";
        const a = null;
        (function(b) {
            for (const a in null);
            for (const a in b)
                console.log("PASS");
        })([ null ]);
    }
    expect: {
        "use strict";
        const a = null;
        (function(o) {
            for (const n in null);
            for (const n in o)
                console.log("PASS");
        })([ null ]);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4960: {
    mangle = {}
    input: {
        "use strict";
        var a;
        (function() {
            {
                const a = console.log("PASS");
            }
            try {} catch (e) {
                const a = console.log("FAIL");
            }
        })();
    }
    expect: {
        "use strict";
        var a;
        (function() {
            {
                const o = console.log("PASS");
            }
            try {} catch (o) {
                const c = console.log("FAIL");
            }
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4965_1: {
    mangle = {}
    input: {
        "use strict";
        try {
            c;
        } catch (a) {
            {
                const a = 1;
            }
            {
                const a = console.log(typeof c);
            }
        }
    }
    expect: {
        "use strict";
        try {
            c;
        } catch (t) {
            {
                const c = 1;
            }
            {
                const t = console.log(typeof c);
            }
        }
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_4965_2: {
    mangle = {}
    input: {
        "use strict";
        try {
            throw 1;
        } catch (e) {
            try {
                {
                    const e = 2;
                }
            } finally {
                const e = 3;
                console.log(typeof t);
            }
        }
    }
    expect: {
        "use strict";
        try {
            throw 1;
        } catch (o) {
            try {
                {
                    const t = 2;
                }
            } finally {
                const o = 3;
                console.log(typeof t);
            }
        }
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_5254: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        do {
            (function() {
                const a = console.log;
                a && a("foo");
            })();
        } while (console.log("bar"));
    }
    expect: {
        do {
            const a = console.log;
            a && a("foo");
        } while (console.log("bar"));
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

issue_5260: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        var a = "foo", o;
        while (console.log("bar"));
        o = {
            baz: function(b) {
                console.log(a, b);
            },
        };
        for (const a in o)
            o[a](a);
    }
    expect: {
        "use strict";
        var a = "foo", o;
        while (console.log("bar"));
        o = {
            baz: function(b) {
                console.log(a, b);
            },
        };
        for (const a in o)
            o[a](a);
    }
    expect_stdout: [
        "bar",
        "foo baz",
    ]
    node_version: ">=4"
}

issue_5319: {
    options = {
        collapse_vars: true,
        merge_vars: true,
    }
    input: {
        (function(a, c) {
            var b = a, c = b;
            {
                const a = c;
                console.log(c());
            }
        })(function() {
            return "PASS";
        });
    }
    expect: {
        (function(a, c) {
            var b = a, c;
            {
                const a = c = b;
                console.log(c());
            }
        })(function() {
            return "PASS";
        });
    }
    expect_stdout: true
}

issue_5338: {
    options = {
        unused: true,
    }
    input: {
        const a = a;
    }
    expect: {
        const a = a;
    }
    expect_stdout: true
}

issue_5476: {
    mangle = {
        keep_fargs: true,
    }
    input: {
        console.log(function(n) {
            const a = 42;
        }());
    }
    expect: {
        console.log(function(n) {
            const o = 42;
        }());
    }
    expect_stdout: "undefined"
}

issue_5516: {
    options = {
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof function() {
            try {} catch (a) {
                (function f() {
                    a;
                })();
            }
            {
                const a = function() {};
                return a;
            }
        }());
    }
    expect: {
        console.log(typeof function() {
            try {} catch (a) {
                void a;
            }
            {
                const a = function() {};
                return a;
            }
        }());
    }
    expect_stdout: "function"
}

issue_5580_1: {
    mangle = {}
    input: {
        "use strict";
        console.log(function(a, b, c) {
            try {
                FAIL;
            } catch (e) {
                return function() {
                    var d = e, i, j;
                    {
                        const e = j;
                    }
                    return a;
                }();
            } finally {
                const e = 42;
            }
        }("PASS"));
    }
    expect: {
        "use strict";
        console.log(function(r, n, t) {
            try {
                FAIL;
            } catch (o) {
                return function() {
                    var n = o, t, c;
                    {
                        const o = c;
                    }
                    return r;
                }();
            } finally {
                const c = 42;
            }
        }("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5580_2: {
    options = {
        inline: true,
        reduce_vars: true,
        varify: true,
    }
    input: {
        "use strict";
        (function() {
            try {
                throw "PASS";
            } catch (e) {
                return function() {
                    console.log(e);
                    {
                        const e = "FAIL 1";
                    }
                }();
            } finally {
                const e = "FAIL 2";
            }
        })();
    }
    expect: {
        "use strict";
        (function() {
            try {
                throw "PASS";
            } catch (e) {
                console.log(e);
                {
                    const e = "FAIL 1";
                }
                return;
            } finally {
                var e = "FAIL 2";
            }
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5591: {
    options = {
        dead_code: true,
        if_return: true,
    }
    input: {
        "use strict";
        function f(a) {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (console.log("baz"))
                    return;
                else {
                    const a = 42;
                    return;
                }
                break;
              case null:
                FAIL;
            }
        }
        f();
    }
    expect: {
        "use strict";
        function f(a) {
            switch (console.log("foo")) {
              case console.log("bar"):
                if (console.log("baz"))
                    return;
                else {
                    const a = 42;
                    return;
                }
              case null:
                FAIL;
            }
        }
        f();
    }
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
    node_version: ">=4"
}

issue_5656: {
    options = {
        collapse_vars: true,
        merge_vars: true,
    }
    input: {
        console.log(function(a) {
            var b = a;
            b++;
            {
                const a = b;
            }
        }());
    }
    expect: {
        console.log(function(a) {
            var b = a;
            {
                const a = ++b;
            }
        }());
    }
    expect_stdout: true
}

issue_5660: {
    options = {
        merge_vars: true,
        side_effects: true,
    }
    input: {
        function f() {
            try {
                a;
                var b;
                return b;
            } catch (e) {
                var a = "FAIL";
                const b = null;
                return a;
            }
        }
        console.log(f());
    }
    expect: {
        function f() {
            try {
                var b;
                return b;
            } catch (e) {
                var a = "FAIL";
                const b = null;
                return a;
            }
        }
        console.log(f());
    }
    expect_stdout: true
}
