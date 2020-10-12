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

reduce_merge_vars: {
    options = {
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        const a = console;
        console.log(typeof a);
        var b = typeof a;
        console.log(b);
    }
    expect: {
        var b = console;
        console.log(typeof b);
        b = typeof b;
        console.log(b);
    }
    expect_stdout: [
        "object",
        "object",
    ]
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

reduce_block_1_toplevel: {
    options = {
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        {
            const a = typeof console;
            console.log(a);
        }
    }
    expect: {
        var a = typeof console;
        console.log(a);
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

hoist_props_1: {
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

hoist_props_2: {
    options = {
        hoist_props: true,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
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
        var o_p = "PASS";
        console.log(o_p);
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
        console.log(function a() {
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

const_to_var_scope_adjustment: {
    options = {
        conditionals: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var k in [ 42 ])
            console.log(function f() {
                if (k) {
                    const a = 0;
                }
            }());
    }
    expect: {
        for (var k in [ 42 ])
            console.log(void (k && 0));
    }
    expect_stdout: "undefined"
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

issue_4191_1: {
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

issue_4191_2: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        const a = function() {};
        console.log(typeof a, a());
    }
    expect: {
        function a() {};
        console.log(typeof a, a());
    }
    expect_stdout: "function undefined"
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
