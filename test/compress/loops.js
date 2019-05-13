while_becomes_for: {
    options = {
        loops: true,
    }
    input: {
        while (foo()) bar();
    }
    expect: {
        for (; foo(); ) bar();
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
        for (; !foo(););
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
        for (; bar() && !foo(););
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
        for (; bar() && (x(), y(), !foo());) z(), k();
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
        for (; foo(); ) bar();
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
        for (; bar() && foo();) baz();
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
        for (; bar() && foo();) {
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
        for (; bar() && (x(), y(), foo());) baz(), z(), k();
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
        for(;;)
            a();
        for(;;)
            c();
        d();
    }
}

issue_1532: {
    options = {
        evaluate: true,
        loops: true,
    }
    input: {
        function f(x, y) {
            do {
                if (x) break;
                foo();
            } while (false);
        }
    }
    expect: {
        function f(x, y) {
            do {
                if (x) break;
                foo();
            } while (false);
        }
    }
}

issue_186: {
    beautify = {
        beautify: false,
        ie8: false,
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
        ie8: true,
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
        ie8: false,
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
        ie8: true,
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
        ie8: false,
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
        ie8: true,
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
        ie8: false,
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
        ie8: true,
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

in_parenthesis_1: {
    input: {
        for (("foo" in {});0;);
    }
    expect_exact: 'for(("foo"in{});0;);'
}

in_parenthesis_2: {
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
        var c;
        var a = 0, b = 5;
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
        for (; ; ) break;
        for (a(); ; ) break;
        for (; b(); ) break;
        for (c(); d(); ) break;
        for (; ; e()) break;
        for (f(); ; g()) break;
        for (; h(); i()) break;
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
        L1: for (var x = 0; x < 3; x++)
            for (var y = 0; y < 2; y++)
                break L1;
        console.log(x, y);
    }
    expect_stdout: "0 0"
}

issue_2740_4: {
    options = {
        dead_code: true,
        loops: true,
        passes: 2,
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
            for (; a(); );
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
