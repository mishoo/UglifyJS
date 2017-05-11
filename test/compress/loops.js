while_becomes_for: {
    options = { loops: true };
    input: {
        while (foo()) bar();
    }
    expect: {
        for (; foo(); ) bar();
    }
}

drop_if_break_1: {
    options = { loops: true };
    input: {
        for (;;)
            if (foo()) break;
    }
    expect: {
        for (; !foo(););
    }
}

drop_if_break_2: {
    options = { loops: true };
    input: {
        for (;bar();)
            if (foo()) break;
    }
    expect: {
        for (; bar() && !foo(););
    }
}

drop_if_break_3: {
    options = { loops: true };
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
    options = { loops: true, sequences: true };
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
    options = { loops: true };
    input: {
        for (;;) if (foo()) bar(); else break;
    }
    expect: {
        for (; foo(); ) bar();
    }
}

drop_if_else_break_2: {
    options = { loops: true };
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
    options = { loops: true };
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
    options = { loops: true, sequences: true };
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
    options = { loops: false };
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
    options = { loops: false };
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
        loops: true,
        dead_code: true,
        evaluate: true,
    };
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

issue_186_bracketize: {
    beautify = {
        beautify: false,
        bracketize: true,
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

issue_186_bracketize_ie8: {
    beautify = {
        beautify: false,
        bracketize: true,
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

issue_186_beautify_bracketize: {
    beautify = {
        beautify: true,
        bracketize: true,
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

issue_186_beautify_bracketize_ie8: {
    beautify = {
        beautify: true,
        bracketize: true,
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
