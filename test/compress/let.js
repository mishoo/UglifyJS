retain_block_1: {
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

retain_block_2: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        {
            var a;
            let a;
        }
    }
    expect: {
        "use strict";
        {
            var a;
            let a;
        }
    }
    expect_stdout: true
    node_version: ">=4"
}

retain_block_2_mangle: {
    rename = true
    mangle = {
        toplevel: true,
    }
    input: {
        "use strict";
        {
            var a;
            let a;
        }
    }
    expect: {
        "use strict";
        {
            var t;
            let t;
        }
    }
}

retain_block_3: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        {
            let a;
            var a;
        }
    }
    expect: {
        "use strict";
        {
            let a;
            var a;
        }
    }
    expect_stdout: true
    node_version: ">=4"
}

retain_block_3_mangle: {
    rename = true
    mangle = {
        toplevel: true,
    }
    input: {
        "use strict";
        {
            let a;
            var a;
        }
    }
    expect: {
        "use strict";
        {
            let t;
            var t;
        }
    }
}

retain_assignment: {
    options = {
        dead_code: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        function f() {
            return a = 0;
            let a;
        }
        try {
            f();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        function f() {
            return a = 0;
            let a;
        }
        try {
            f();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

retain_catch: {
    options = {
        dead_code: true,
    }
    input: {
        "use strict";
        try {} catch (a) {
            let a = "aa";
        }
    }
    expect: {
        "use strict";
        try {} catch (a) {
            let a = "aa";
        }
    }
    expect_stdout: true
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

retain_tail_1: {
    options = {
        conditionals: true,
    }
    input: {
        "use strict";
        function f(a) {
            var b = "foo";
            if (a) {
                let b = "bar";
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
        "use strict";
        function f(a) {
            var b = "foo";
            if (a) {
                let b = "bar";
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
    expect_stdout: [
        "moo",
        "foo",
        "baz",
        "bar",
    ]
    node_version: ">=4"
}

retain_tail_2: {
    options = {
        conditionals: true,
    }
    input: {
        "use strict";
        function f(a) {
            var b = "foo";
            if (a) {
                while (console.log("bar"));
                console.log(b);
            } else {
                let b = "baz";
                while (console.log("moo"));
                console.log(b);
            }
        }
        f();
        f(42);
    }
    expect: {
        "use strict";
        function f(a) {
            var b = "foo";
            if (a) {
                while (console.log("bar"));
                console.log(b);
            } else {
                let b = "baz";
                while (console.log("moo"));
                console.log(b);
            }
        }
        f();
        f(42);
    }
    expect_stdout: [
        "moo",
        "baz",
        "bar",
        "foo",
    ]
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
        var b = 1;
        console.log(typeof b);
    }
    expect_stdout: [
        "object",
        "number",
    ]
    node_version: ">=4"
}

merge_vars_4: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        var a = 1;
        console.log(typeof a);
        {
            var b = console;
            console.log(typeof b);
            let a = 0;
        }
    }
    expect: {
        "use strict";
        var a = 1;
        console.log(typeof a);
        {
            var b = console;
            console.log(typeof b);
            let a = 0;
        }
    }
    expect_stdout: [
        "number",
        "object",
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

reduce_vars_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        let a = "PASS";
        console.log(a);
        a = "FAIL";
    }
    expect: {
        "use strict";
        console.log("PASS");
        "FAIL";
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

reduce_vars_2: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        (function() {
            function f() {
                console.log(typeof a);
            }
            for (let a in [ 42 ])
                f();
        })();
    }
    expect: {
        "use strict";
        (function() {
            function f() {
                console.log(typeof a);
            }
            for (let a in [ 42 ])
                f();
        })();
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

reduce_vars_3: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        (function(a) {
            let i = 1;
            function f() {
                i = 0;
            }
            for (let i = 0, x = 0; i < a.length; i++, x++) {
                if (x != i) {
                    console.log("FAIL");
                    break;
                }
                f();
                console.log(a[i]);
            }
            console.log(i);
        })([ 4, 2 ]);
    }
    expect: {
        "use strict";
        (function(a) {
            let i = 1;
            function f() {
                i = 0;
            }
            for (let i = 0, x = 0; i < a.length; i++, x++) {
                if (x != i) {
                    console.log("FAIL");
                    break;
                }
                f();
                console.log(a[i]);
            }
            console.log(i);
        })([ 4, 2 ]);
    }
    expect_stdout: [
        "4",
        "2",
        "0",
    ]
    node_version: ">=4"
}

reduce_lambda: {
    options = {
        evaluate: true,
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        let f = function() {
            console.log(a, b);
        };
        let a = "foo", b = 42;
        f();
        b = "bar";
        f();
    }
    expect: {
        "use strict";
        function f() {
            console.log("foo", b);
        }
        let b = 42;
        f();
        b = "bar";
        f();
    }
    expect_stdout: [
        "foo 42",
        "foo bar",
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

do_break: {
    options = {
        loops: true,
    }
    input: {
        "use strict";
        try {
            do {
                if (a)
                    break;
                let a;
            } while (!console);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            do {
                if (a)
                    break;
                let a;
            } while (!console);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
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

if_return_1: {
    options = {
        if_return: true,
    }
    input: {
        "use strict";
        function f(a) {
            function g() {
                return b = "PASS";
            }
            if (a)
                return g();
            let b;
            return g();
        };
        console.log(f());
    }
    expect: {
        "use strict";
        function f(a) {
            function g() {
                return b = "PASS";
            }
            if (a)
                return g();
            let b;
            return g();
        };
        console.log(f());
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

if_return_2: {
    options = {
        if_return: true,
    }
    input: {
        "use strict";
        function f(a) {
            function g() {
                return b = "FAIL";
            }
            if (a)
                return g();
            let b;
            return g();
        };
        try {
            console.log(f(42));
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        function f(a) {
            function g() {
                return b = "FAIL";
            }
            if (a)
                return g();
            let b;
            return g();
        };
        try {
            console.log(f(42));
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

if_return_3: {
    options = {
        if_return: true,
    }
    input: {
        "use strict";
        var a = "PASS";
        function f(b) {
            if (console) {
                let b = a;
                return b;
            } else
                while (console.log("FAIL 1"));
            return b;
        }
        console.log(f("FAIL 2"));
    }
    expect: {
        "use strict";
        var a = "PASS";
        function f(b) {
            if (console) {
                let b = a;
                return b;
            } else
                while (console.log("FAIL 1"));
            return b;
        }
        console.log(f("FAIL 2"));
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
            if (console) {
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
            if (console) {
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

default_init: {
    options = {
        evaluate: true,
        reduce_vars: true,
        sequences: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        let a;
        a = "PASS";
        console.log(a);
    }
    expect: {
        "use strict";
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

join_let_var_1: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        var a = "foo";
        let b = "bar";
        for (var c of [ a, b ])
            console.log(c);
    }
    expect: {
        "use strict";
        let a = "foo", b = "bar";
        for (var c of [ a, b ])
            console.log(c);
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

join_let_var_2: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        let a = "foo";
        var b = "bar";
        for (let c of [ a, b ])
            console.log(c);
    }
    expect: {
        "use strict";
        let a = "foo", b = "bar";
        for (let c of [ a, b ])
            console.log(c);
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

keep_let_var_1: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        var a = "foo";
        let b = "bar";
        for (var c of [ a, b ])
            console.log(c);
        function f() {
            return a;
        }
        console.log(f(f));
    }
    expect: {
        "use strict";
        var a = "foo", c;
        let b = "bar";
        for (c of [ a, b ])
            console.log(c);
        function f() {
            return a;
        }
        console.log(f(f));
    }
    expect_stdout: [
        "foo",
        "bar",
        "foo",
    ]
    node_version: ">=4"
}

keep_let_var_2: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        let a = "foo";
        var b = "bar";
        for (let c of [ a, b ])
            console.log(c);
        function f() {
            return b;
        }
        console.log(f(f));
    }
    expect: {
        "use strict";
        let a = "foo";
        var b = "bar";
        for (let c of [ a, b ])
            console.log(c);
        function f() {
            return b;
        }
        console.log(f(f));
    }
    expect_stdout: [
        "foo",
        "bar",
        "bar",
    ]
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
            function f() {
                o.p = 42;
            }
            f(f);
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
        ie: true,
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
        ie: true,
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

issue_4248: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a = "FAIL";
        try {
            (function() {
                "use strict";
                a = "PASS";
                b[a];
                let b;
            })();
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        var a = "FAIL";
        try {
            (function() {
                "use strict";
                a = "PASS";
                b[a];
                let b;
            })();
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4274_1: {
    options = {
        loops: true,
    }
    input: {
        "use strict";
        for (;;) {
            if (console.log("PASS")) {
                let a;
            } else {
                break;
                var a;
            }
        }
    }
    expect: {
        "use strict";
        for (; console.log("PASS");) {
            {
                let a;
            }
            var a;
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4274_2: {
    options = {
        loops: true,
    }
    input: {
        "use strict";
        for (;;) {
            if (!console.log("PASS")) {
                break;
                var a;
            } else {
                let a;
            }
        }
    }
    expect: {
        "use strict";
        for (; console.log("PASS");) {
            {
                let a;
            }
            var a;
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4276_1: {
    options = {
        unused: true,
    }
    input: {
        "use strict";
        try {
            let a = b, b;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            let a = b, b;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4276_2: {
    options = {
        unused: true,
    }
    input: {
        "use strict";
        try {
            let a = f(), b;
            console.log("FAIL");
            function f() {
                return b;
            }
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            let a = f(), b;
            console.log("FAIL");
            function f() {
                return b;
            }
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4290_1: {
    options = {
        unused: true,
    }
    input: {
        "use strict";
        let a;
        var a;
    }
    expect: {
        "use strict";
        let a;
        var a;
    }
    expect_stdout: true
    node_version: ">=4"
}

issue_4290_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        try {
            console.log(function(a) {
                a = c;
                let c;
                return a;
            }());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            console.log(function(a) {
                a = c;
                let c;
                return a;
            }());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4305_1: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            let arguments = function() {
                while (console.log("PASS"));
            };
            arguments();
        })();
    }
    expect: {
        (function() {
            let arguments = function() {
                while (console.log("PASS"));
            };
            arguments();
        })();
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_4305_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        (function(a) {
            let a = function() {
                while (console.log("aaaaa"));
            };
            a();
        })();
    }
    expect: {
        "use strict";
        (function(a) {
            let a = function() {
                while (console.log("aaaaa"));
            };
            a();
        })();
    }
    expect_stdout: true
    node_version: ">=4"
}

issue_4438: {
    options = {
        if_return: true,
    }
    input: {
        "use strict";
        function f() {
            if (console) {
                {
                    let a = console.log;
                    return void a("PASS");
                }
            }
        }
        f();
    }
    expect: {
        "use strict";
        function f() {
            if (console) {
                let a = console.log;
                a("PASS");
            }
        }
        f();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4531_1: {
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        "use strict";
        var a;
        console.log(function a() {
            let a;
            var b;
        }());
    }
    expect: {
        "use strict";
        var o;
        console.log(function o() {
            let o;
            var t;
        }());
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_4531_2: {
    options = {
        evaluate: true,
        ie: true,
        toplevel: true,
    }
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        var a = console;
        console.log(typeof a, function a() {
            let { [console]: a } = 0 && a;
            var b = console;
            while (!b);
        }());
    }
    expect: {
        var o = console;
        console.log(typeof o, function o() {
            let { [console]: o } = 0;
            var e = console;
            while (!e);
        }());
    }
    expect_stdout: "object undefined"
    node_version: ">=6"
}

issue_4689: {
    options = {
        sequences: true,
    }
    input: {
        "use strict";
        var a = "PASS";
        console.log(a);
        for (let a in 42);
    }
    expect: {
        "use strict";
        var a = "PASS";
        console.log(a);
        for (let a in 42);
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
        "use strict";
        function A() {}
        A.prototype.f = function() {
            if (!this)
                return;
            let a = "PA";
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
        "use strict";
        function A() {}
        A.prototype.f = function() {
            if (this) {
                let a = "PA";
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
    node_version: ">=4"
}

issue_4848: {
    options = {
        if_return: true,
    }
    input: {
        "use strict";
        function f(a) {
            a(function() {
                console.log(b);
            });
            if (!console)
                return;
            let b = "PASS";
        }
        var g;
        f(function(h) {
            g = h;
        });
        g();
    }
    expect: {
        "use strict";
        function f(a) {
            a(function() {
                console.log(b);
            });
            if (!console)
                return;
            let b = "PASS";
        }
        var g;
        f(function(h) {
            g = h;
        });
        g();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4985: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        let a = { p: 42 };
        console.log(function() {
            a;
        }());
    }
    expect: {
        "use strict";
        let a = { p: 42 };
        console.log(function() {
            a;
        }());
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

issue_5240: {
    options = {
        inline: true,
    }
    input: {
        "use strict";
        function f() {
            if (console) {
                let g = function() {
                    e;
                }, e;
                (function() {
                    if (console) {
                        console.log(e);
                        var e = "FAIL";
                    }
                })(console.log(e));
            }
        }
        f();
    }
    expect: {
        "use strict";
        function f() {
            if (console) {
                let g = function() {
                    e;
                }, e;
                (function() {
                    if (console) {
                        console.log(e);
                        var e = "FAIL";
                    }
                })(console.log(e));
            }
        }
        f();
    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
    node_version: ">=4"
}

issue_5254: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        "use strict";
        do {
            (function() {
                let a = console.log;
                a && a("foo");
            })();
        } while (console.log("bar"));
    }
    expect: {
        "use strict";
        do {
            let a = console.log;
            a && a("foo");
        } while (console.log("bar"));
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
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
        for (let a in o)
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
        for (let a in o)
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
        "use strict";
        (function(a, c) {
            var b = a, c = b;
            {
                let a = c;
                console.log(c());
            }
        })(function() {
            return "PASS";
        });
    }
    expect: {
        "use strict";
        (function(a, c) {
            var b = a, c;
            {
                let a = c = b;
                console.log(c());
            }
        })(function() {
            return "PASS";
        });
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5338: {
    options = {
        unused: true,
    }
    input: {
        "use strict";
        let a = a;
    }
    expect: {
        "use strict";
        a;
        let a;
    }
    expect_stdout: ReferenceError("a is not defined")
    node_version: ">=4"
}

issue_5476: {
    mangle = {
        keep_fargs: true,
    }
    input: {
        "use strict";
        console.log(function(n) {
            let a;
        }());
    }
    expect: {
        "use strict";
        console.log(function(n) {
            let o;
        }());
    }
    expect_stdout: "undefined"
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
                    let a;
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
                    let a;
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

issue_5741: {
    options = {
        inline: true,
        join_vars: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        (function(a) {
            let b = function() {
                var c = a;
                console.log(c);
            }();
            function g() {
                a++;
                b;
            }
        })("PASS");
    }
    expect: {
        "use strict";
        (function(a) {
            let b = (c = a, void console.log(c));
            var c;
            function g() {
                a++;
                b;
            }
        })("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5745_1: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        {
            let f = function() {
                return f && "PASS";
            };
            var a = f();
        }
        a;
        console.log(a);
    }
    expect: {
        "use strict";
        {
            let f = function() {
                return f && "PASS";
            };
            var a = f();
        }
        a;
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5745_2: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        {
            let f = function() {
                return f && "PASS";
            };
            var a = f();
            a;
            console.log(a);
        }
    }
    expect: {
        "use strict";
        {
            let f = function() {
                return f && "PASS";
            }, a = f();
            a;
            console.log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5756_1: {
    options = {
        join_vars: true,
        loops: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        do {
            function f() {
                return b;
            }
            var a = "PASS".toString();
            let b;
            console.log(a);
        } while (!console);
    }
    expect: {
        "use strict";
        do {
            function f() {
                return b;
            }
            let a = "PASS".toString(), b;
            console.log(a);
        } while (!console);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5756_2: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {
            let a = console.log("PASS");
            {
                var b;
                for (var c in b) {
                    b;
                    var c = function() {
                        a;
                    };
                }
            }
        }
        f();
    }
    expect: {
        "use strict";
        (function() {
            let a = console.log("PASS"), b;
            for (c in b) {
                b;
                var c = function() {
                    a;
                };
            }
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5756_3: {
    options = {
        module: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        "use strict";
        console.log(f()());
        function f() {
            const a = "PASS";
            return function() {
                return a;
            };
        }
    }
    expect: {
        "use strict";
        console.log(function() {
            let a = "PASS";
            return function() {
                return a;
            };
        }()());
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5759: {
    options = {
        collapse_vars: true,
        inline: true,
        join_vars: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {
            for (var a in [ true ]) {
                let b;
                (function() {
                    var c = void 0;
                    b;
                    console.log(c);
                    var d = null;
                    console.log(c);
                })();
            }
        }
        f();
    }
    expect: {
        "use strict";
        function f() {
            for (var a in [ true ]) {
                let b;
                var c = c = void 0;
                b;
                console.log(c);
                console.log(c);
            }
        }
        f();
    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
    node_version: ">=4"
}
