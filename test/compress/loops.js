while_becomes_for: {
    options = {
        loops: true,
    }
    input: {
        while (foo()) bar();
    }
    expect: {
        for (;foo();) bar();
    }
}

drop_if_break_1: {
    options = {
        loops: true,
    }
    input: {
        for (;;)
            if (foo()) break;
    }
    expect: {
        for (;!foo(););
    }
}

drop_if_break_2: {
    options = {
        loops: true,
    }
    input: {
        for (;bar();)
            if (foo()) break;
    }
    expect: {
        for (;bar() && !foo(););
    }
}

drop_if_break_3: {
    options = {
        loops: true,
    }
    input: {
        for (;bar();) {
            if (foo()) break;
            stuff1();
            stuff2();
        }
    }
    expect: {
        for (; bar() && !foo();) {
            stuff1();
            stuff2();
        }
    }
}

drop_if_break_4: {
    options = {
        loops: true,
        sequences: true,
    }
    input: {
        for (;bar();) {
            x();
            y();
            if (foo()) break;
            z();
            k();
        }
    }
    expect: {
        for (;bar() && (x(), y(), !foo());) z(), k();
    }
}

drop_if_else_break_1: {
    options = {
        loops: true,
    }
    input: {
        for (;;) if (foo()) bar(); else break;
    }
    expect: {
        for (;foo();) bar();
    }
}

drop_if_else_break_2: {
    options = {
        loops: true,
    }
    input: {
        for (;bar();) {
            if (foo()) baz();
            else break;
        }
    }
    expect: {
        for (;bar() && foo();) baz();
    }
}

drop_if_else_break_3: {
    options = {
        loops: true,
    }
    input: {
        for (;bar();) {
            if (foo()) baz();
            else break;
            stuff1();
            stuff2();
        }
    }
    expect: {
        for (;bar() && foo();) {
            baz();
            stuff1();
            stuff2();
        }
    }
}

drop_if_else_break_4: {
    options = {
        loops: true,
        sequences: true,
    }
    input: {
        for (;bar();) {
            x();
            y();
            if (foo()) baz();
            else break;
            z();
            k();
        }
    }
    expect: {
        for (;bar() && (x(), y(), foo());) baz(), z(), k();
    }
}

parse_do_while_with_semicolon: {
    options = {
        loops: false,
    }
    input: {
        do {
            x();
        } while (false);y()
    }
    expect: {
        do x(); while (false);y();
    }
}

parse_do_while_without_semicolon: {
    options = {
        loops: false,
    }
    input: {
        do {
            x();
        } while (false)y()
    }
    expect: {
        do x(); while (false);y();
    }
}

evaluate: {
    options = {
        dead_code: true,
        evaluate: true,
        loops: true,
        passes: 2,
        side_effects: true,
    }
    input: {
        while (true) {
            a();
        }
        while (false) {
            b();
        }
        do {
            c();
        } while (true);
        do {
            d();
        } while (false);
    }
    expect: {
        for (;;)
            a();
        for (;;)
            c();
        d();
    }
}

issue_1532_1: {
    options = {
        evaluate: true,
        loops: true,
    }
    input: {
        function f(x, y) {
            do {
                if (x) break;
                console.log(y);
            } while (false);
        }
        f(null, "PASS");
        f(42, "FAIL");
    }
    expect: {
        function f(x, y) {
            for (; !x && (console.log(y), false););
        }
        f(null, "PASS");
        f(42, "FAIL");
    }
    expect_stdout: "PASS"
}

issue_1532_2: {
    options = {
        evaluate: true,
        loops: true,
    }
    input: {
        function f(x, y) {
            do {
                if (x) {
                    console.log(x);
                    break;
                }
                console.log(y);
            } while (false);
        }
        f(null, "PASS");
        f(42, "FAIL");
    }
    expect: {
        function f(x, y) {
            do {
                if (x) {
                    console.log(x);
                    break;
                }
            } while (console.log(y), false);
        }
        f(null, "PASS");
        f(42, "FAIL");
    }
    expect_stdout: [
        "PASS",
        "42",
    ]
}

issue_186: {
    beautify = {
        beautify: false,
        ie: false,
    }
    input: {
        var x = 3;
        if (foo())
            do
                do
                    alert(x);
                while (--x);
            while (x);
        else
            bar();
    }
    expect_exact: 'var x=3;if(foo())do{do{alert(x)}while(--x)}while(x);else bar();'
}

issue_186_ie8: {
    beautify = {
        beautify: false,
        ie: true,
    }
    input: {
        var x = 3;
        if (foo())
            do
                do
                    alert(x);
                while (--x);
            while (x);
        else
            bar();
    }
    expect_exact: 'var x=3;if(foo()){do{do{alert(x)}while(--x)}while(x)}else bar();'
}

issue_186_beautify: {
    beautify = {
        beautify: true,
        ie: false,
    }
    input: {
        var x = 3;
        if (foo())
            do
                do
                    alert(x);
                while (--x);
            while (x);
        else
            bar();
    }
    expect_exact: [
        'var x = 3;',
        '',
        'if (foo()) do {',
        '    do {',
        '        alert(x);',
        '    } while (--x);',
        '} while (x); else bar();',
    ]
}

issue_186_beautify_ie8: {
    beautify = {
        beautify: true,
        ie: true,
    }
    input: {
        var x = 3;
        if (foo())
            do
                do
                    alert(x);
                while (--x);
            while (x);
        else
            bar();
    }
    expect_exact: [
        'var x = 3;',
        '',
        'if (foo()) {',
        '    do {',
        '        do {',
        '            alert(x);',
        '        } while (--x);',
        '    } while (x);',
        '} else bar();',
    ]
}

issue_186_braces: {
    beautify = {
        beautify: false,
        braces: true,
        ie: false,
    }
    input: {
        var x = 3;
        if (foo())
            do
                do
                    alert(x);
                while (--x);
            while (x);
        else
            bar();
    }
    expect_exact: 'var x=3;if(foo()){do{do{alert(x)}while(--x)}while(x)}else{bar()}'
}

issue_186_braces_ie8: {
    beautify = {
        beautify: false,
        braces: true,
        ie: true,
    }
    input: {
        var x = 3;
        if (foo())
            do
                do
                    alert(x);
                while (--x);
            while (x);
        else
            bar();
    }
    expect_exact: 'var x=3;if(foo()){do{do{alert(x)}while(--x)}while(x)}else{bar()}'
}

issue_186_beautify_braces: {
    beautify = {
        beautify: true,
        braces: true,
        ie: false,
    }
    input: {
        var x = 3;
        if (foo())
            do
                do
                    alert(x);
                while (--x);
            while (x);
        else
            bar();
    }
    expect_exact: [
        'var x = 3;',
        '',
        'if (foo()) {',
        '    do {',
        '        do {',
        '            alert(x);',
        '        } while (--x);',
        '    } while (x);',
        '} else {',
        '    bar();',
        '}',
    ]
}

issue_186_beautify_braces_ie8: {
    beautify = {
        beautify: true,
        braces: true,
        ie: true,
    }
    input: {
        var x = 3;
        if (foo())
            do
                do
                    alert(x);
                while (--x);
            while (x);
        else
            bar();
    }
    expect_exact: [
        'var x = 3;',
        '',
        'if (foo()) {',
        '    do {',
        '        do {',
        '            alert(x);',
        '        } while (--x);',
        '    } while (x);',
        '} else {',
        '    bar();',
        '}',
    ]
}

issue_1648: {
    options = {
        join_vars: true,
        loops: true,
        passes: 2,
        sequences: true,
        unused: true,
    }
    input: {
        function f() {
            x();
            var b = 1;
            while (1);
        }
    }
    expect_exact: "function f(){for(x();1;);}"
}

do_switch: {
    options = {
        evaluate: true,
        loops: true,
    }
    input: {
        do {
            switch (a) {
              case b:
                continue;
            }
        } while (false);
    }
    expect: {
        do {
            switch (a) {
              case b:
                continue;
            }
        } while (false);
    }
}

in_parentheses_1: {
    input: {
        for (("foo" in {});0;);
    }
    expect_exact: 'for(("foo"in{});0;);'
}

in_parentheses_2: {
    input: {
        for ((function(){ "foo" in {}; });0;);
    }
    expect_exact: 'for(function(){"foo"in{}};0;);'
}

init_side_effects: {
    options = {
        loops: true,
        side_effects: true,
    }
    input: {
        for (function() {}(), i = 0; i < 5; i++) console.log(i);
        for (function() {}(); i < 10; i++) console.log(i);
    }
    expect: {
        for (i = 0; i < 5; i++) console.log(i);
        for (; i < 10; i++) console.log(i);
    }
    expect_stdout: true
}

dead_code_condition: {
    options = {
        dead_code: true,
        evaluate: true,
        loops: true,
        sequences: true,
    }
    input: {
        for (var a = 0, b = 5; (a += 1, 3) - 3 && b > 0; b--) {
            var c = function() {
                b--;
            }(a++);
        }
        console.log(a);
    }
    expect: {
        var a = 0, b = 5;
        var c;
        a += 1, 0,
        console.log(a);
    }
    expect_stdout: "1"
}

issue_2740_1: {
    options = {
        dead_code: true,
        loops: true,
    }
    input: {
        for (;;) break;
        for (a();;) break;
        for (;b();) break;
        for (c(); d();) break;
        for (;;e()) break;
        for (f();; g()) break;
        for (;h(); i()) break;
        for (j(); k(); l()) break;
    }
    expect: {
        a();
        b();
        c();
        d();
        f();
        h();
        j();
        k();
    }
}

issue_2740_2: {
    options = {
        dead_code: true,
        loops: true,
        passes: 2,
        unused: true,
    }
    input: {
        L1: while (x()) {
            break L1;
        }
    }
    expect: {
        x();
    }
}

issue_2740_3: {
    options = {
        dead_code: true,
        loops: true,
        unused: true,
    }
    input: {
        L1: for (var x = 0; x < 3; x++) {
            L2: for (var y = 0; y < 2; y++) {
                break L1;
            }
        }
        console.log(x, y);
    }
    expect: {
        L1: for (var x = 0; x < 3; x++) {
            var y = 0;
            if (y < 2)
                break L1;
        }
        console.log(x, y);
    }
    expect_stdout: "0 0"
}

issue_2740_4: {
    options = {
        dead_code: true,
        loops: true,
        passes: 2,
        unused: true,
    }
    input: {
        L1: for (var x = 0; x < 3; x++) {
            L2: for (var y = 0; y < 2; y++) {
                break L2;
            }
        }
        console.log(x, y);
    }
    expect: {
        for (var x = 0; x < 3; x++) {
            var y = 0;
            y < 2;
        }
        console.log(x, y);
    }
    expect_stdout: "3 0"
}

issue_2740_5: {
    options = {
        dead_code: true,
        loops: true,
        passes: 2,
        unused: true,
    }
    input: {
        L1: for (var x = 0; x < 3; x++) {
            break L1;
            L2: for (var y = 0; y < 2; y++) {
                break L2;
            }
        }
        console.log(x, y);
    }
    expect: {
        var x = 0;
        x < 3;
        var y;
        console.log(x,y);
    }
    expect_stdout: "0 undefined"
}

issue_2904: {
    options = {
        join_vars: true,
        loops: true,
    }
    input: {
        var a = 1;
        do {
            console.log(a);
        } while (--a);
    }
    expect: {
        for (var a = 1; console.log(a), --a;);
    }
    expect_stdout: "1"
}

issue_3371: {
    options = {
        functions: true,
        join_vars: true,
        loops: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            var a = function() {
                console.log("PASS");
            };
            while (a());
        })();
    }
    expect: {
        (function() {
            function a() {
                console.log("PASS");
            }
            for (;a(););
        })();
    }
    expect_stdout: "PASS"
}

step: {
    options = {
        loops: true,
        side_effects: true,
    }
    input: {
        for (var i = 0; i < 42; "foo", i++, "bar");
        console.log(i);
    }
    expect: {
        for (var i = 0; i < 42; i++);
        console.log(i);
    }
    expect_stdout: "42"
}

empty_for_in: {
    options = {
        loops: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var a in [ 1, 2, 3 ]) {
            var b = a + 1;
        }
    }
    expect: {}
    expect_warnings: [
        "WARN: Dropping unused variable b [test/compress/loops.js:2,16]",
        "INFO: Dropping unused loop variable a [test/compress/loops.js:1,17]",
    ]
}

empty_for_in_used: {
    options = {
        loops: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var a in [ 1, 2, 3 ]) {
            var b = a + 1;
        }
        console.log(a);
    }
    expect: {
        for (var a in [ 1, 2, 3 ]);
        console.log(a);
    }
    expect_stdout: "2"
    expect_warnings: [
        "WARN: Dropping unused variable b [test/compress/loops.js:2,16]",
    ]
}

empty_for_in_side_effects: {
    options = {
        loops: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var a in {
            foo: console.log("PASS")
        }) {
            var b = a + "bar";
        }
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    expect_warnings: [
        "WARN: Dropping unused variable b [test/compress/loops.js:4,16]",
        "INFO: Dropping unused loop variable a [test/compress/loops.js:1,17]",
        "WARN: Side effects in object of for-in loop [test/compress/loops.js:2,17]",
    ]
}

empty_for_in_prop_init: {
    options = {
        loops: true,
        pure_getters: "strict",
        unused: true,
    }
    input: {
        console.log(function f() {
            var a = "bar";
            for ((a, f)[a] in console.log("foo"));
            return a;
        }());
    }
    expect: {
        console.log(function() {
            var a = "bar";
            console.log("foo");
            return a;
        }());
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    expect_warnings: [
        "INFO: Dropping unused loop variable f [test/compress/loops.js:3,21]",
        "WARN: Side effects in object of for-in loop [test/compress/loops.js:3,30]",
    ]
}

for_of: {
    input: {
        var a = [ "PASS", 42 ];
        a.p = "FAIL";
        for (a of (null, a))
            console.log(a);
    }
    expect_exact: 'var a=["PASS",42];a.p="FAIL";for(a of(null,a))console.log(a);'
    expect_stdout: true
    node_version: ">=0.12"
}

for_async_of: {
    input: {
        var async = [ "PASS", 42 ];
        async.p = "FAIL";
        for (async of (null, async))
            console.log(async);
    }
    expect_exact: 'var async=["PASS",42];async.p="FAIL";for(async of(null,async))console.log(async);'
    expect_stdout: true
    node_version: ">=0.12 <16"
}

for_of_regexp: {
    input: {
        for (var a of /foo/);
    }
    expect_exact: "for(var a of/foo/);"
}

for_await_of_regexp: {
    input: {
        for await (var a of /foo/);
    }
    expect_exact: "for await(var a of/foo/);"
}

issue_3631_1: {
    options = {
        dead_code: true,
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var c = 0;
        L: do {
            for (;;) continue L;
            var b = 1;
        } while (b && c++);
        console.log(c);
    }
    expect: {
        var c = 0;
        do {
            var b;
        } while (b && c++);
        console.log(c);
    }
    expect_stdout: "0"
}

issue_3631_2: {
    options = {
        dead_code: true,
        evaluate: true,
        loops: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        L: for (var a = 1; a--; console.log(b)) {
            for (;;) continue L;
            var b = "FAIL";
        }
    }
    expect: {
        for (var a = 1; a--; console.log(b))
            var b;
    }
    expect_stdout: "undefined"
}

loop_if_break: {
    options = {
        dead_code: true,
        loops: true,
    }
    input: {
        function f(a, b) {
            try {
                while (a) {
                    if (b) {
                        break;
                        var c = 42;
                        console.log(c);
                    } else {
                        var d = false;
                        throw d;
                    }
                }
            } catch (e) {
                console.log("E:", e);
            }
            console.log(a, b, c, d);
        }
        f(0, 0);
        f(0, 1);
        f(1, 0);
        f(1, 1);
    }
    expect: {
        function f(a, b) {
            try {
                for (;a && !b;) {
                    var d = false;
                    throw d;
                    var c;
                }
            } catch (e) {
                console.log("E:", e);
            }
            console.log(a, b, c, d);
        }
        f(0, 0);
        f(0, 1);
        f(1, 0);
        f(1, 1);
    }
    expect_stdout: [
        "0 0 undefined undefined",
        "0 1 undefined undefined",
        "E: false",
        "1 0 undefined false",
        "1 1 undefined undefined",
    ]
}

loop_return: {
    options = {
        dead_code: true,
        loops: true,
    }
    input: {
        function f(a) {
            while (a) return 42;
            return "foo";
        }
        console.log(f(0), f(1));
    }
    expect: {
        function f(a) {
            if (a) return 42;
            return "foo";
        }
        console.log(f(0), f(1));
    }
    expect_stdout: "foo 42"
}

issue_3634_1: {
    options = {
        loops: true,
    }
    input: {
        var b = 0;
        L: while (++b < 2)
            while (1)
                if (b) break L;
        console.log(b);
    }
    expect: {
        var b = 0;
        L: for (;++b < 2;)
            for (;1;)
                if (b) break L;
        console.log(b);
    }
    expect_stdout: "1"
}

issue_3634_2: {
    options = {
        loops: true,
    }
    input: {
        var b = 0;
        L: while (++b < 2)
            while (1)
                if (!b)
                    continue L;
                else
                    break L;
        console.log(b);
    }
    expect: {
        var b = 0;
        L: for (;++b < 2;)
            for (;1;)
                if (!b)
                    continue L;
                else
                    break L;
        console.log(b);
    }
    expect_stdout: "1"
}

issue_4075: {
    options = {
        loops: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        (function() {
            for (a in { PASS: 0 });
        })()
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (function() {
            for (a in { PASS: 0 });
        })()
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_4082: {
    options = {
        keep_fargs: false,
        loops: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        (function(a) {
            for (a in "foo")
                var b;
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function(a) {
            for (a in "foo");
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_4084: {
    options = {
        keep_fargs: false,
        loops: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function() {
            function f(a) {
                var b = a++;
                for (a in "foo");
            }
            f();
            return typeof a;
        }());
    }
    expect: {
        console.log(function() {
            (function() {
                0;
            })();
            return typeof a;
        }());
    }
    expect_stdout: "undefined"
}

issue_4091_1: {
    options = {
        loops: true,
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            throw "FAIL";
        } catch (e) {
            for (var e in 42);
        }
        console.log(e && e);
    }
    expect: {
        try {
            throw "FAIL";
        } catch (e) {
            var e;
        }
        console.log(e && e);
    }
    expect_stdout: "undefined"
}

issue_4091_2: {
    options = {
        loops: true,
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            throw "FAIL";
        } catch (e) {
            for (e in 42);
            var e;
        }
        console.log(e && e);
    }
    expect: {
        try {
            throw "FAIL";
        } catch (e) {
            var e;
        }
        console.log(e && e);
    }
    expect_stdout: "undefined"
}

issue_4182_1: {
    options = {
        loops: true,
    }
    input: {
        (function() {
            do {
                try {
                    return;
                } finally {
                    continue;
                }
                console.log("FAIL");
            } while (0);
            console.log("PASS");
        })();
    }
    expect: {
        (function() {
            do {
                try {
                    return;
                } finally {
                    continue;
                }
                console.log("FAIL");
            } while (0);
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

issue_4182_2: {
    options = {
        loops: true,
    }
    input: {
        (function() {
            L: do {
                do {
                    try {
                        return;
                    } finally {
                        continue L;
                    }
                    console.log("FAIL");
                } while (0);
                console.log("FAIL");
            } while (0);
            console.log("PASS");
        })();
    }
    expect: {
        (function() {
            L: do {
                do {
                    try {
                        return;
                    } finally {
                        continue L;
                    }
                } while (console.log("FAIL"), 0);
                console.log("FAIL");
            } while (0);
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

do_continue: {
    options = {
        loops: true,
    }
    input: {
        try {
            do {
                continue;
            } while ([ A ]);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            do {
                continue;
            } while ([ A ]);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_4240: {
    options = {
        loops: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            function f() {
                var o = { PASS: 42 };
                for (a in o);
            }
            (function() {
                if (f());
            })();
            console.log(a);
        })();
    }
    expect: {
        (function(a) {
            (function() {
                if (function() {
                    for (a in { PASS: 42 });
                }());
            })();
            console.log(a);
        })();
    }
    expect_stdout: "PASS"
}

issue_4355: {
    options = {
        dead_code: true,
        evaluate: true,
        loops: true,
        passes: 2,
        side_effects: true,
        unused: true,
    }
    input: {
        while (function() {
            var a;
            for (a in console.log("PASS"))
                var b = 0;
        }())
            var c;
    }
    expect: {
        (function() {
            console.log("PASS");
        })();
        var c;
    }
    expect_stdout: "PASS"
}

issue_4564: {
    options = {
        loops: true,
        unused: true,
    }
    input: {
        try {
            throw null;
        } catch (a) {
            var a;
            (function() {
                for (a in "foo");
            })();
            console.log(a);
        }
    }
    expect: {
        try {
            throw null;
        } catch (a) {
            var a;
            (function() {
                for (a in "foo");
            })();
            console.log(a);
        }
    }
    expect_stdout: "2"
}
