constant_switch_1: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        switch (1+1) {
          case 1: foo(); break;
          case 1+1: bar(); break;
          case 1+1+1: baz(); break;
        }
    }
    expect: {
        bar();
    }
}

constant_switch_2: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        switch (1) {
          case 1: foo();
          case 1+1: bar(); break;
          case 1+1+1: baz();
        }
    }
    expect: {
        foo();
        bar();
    }
}

constant_switch_3: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        switch (10) {
          case 1: foo();
          case 1+1: bar(); break;
          case 1+1+1: baz();
          default:
            def();
        }
    }
    expect: {
        def();
    }
}

constant_switch_4: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        switch (2) {
          case 1:
            x();
            if (foo) break;
            y();
            break;
          case 1+1:
            bar();
          default:
            def();
        }
    }
    expect: {
        bar();
        def();
    }
}

constant_switch_5: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        switch (1) {
          case 1:
            x();
            if (foo) break;
            y();
            break;
          case 1+1:
            bar();
          default:
            def();
        }
    }
    expect: {
        // the break inside the if ruins our job
        // we can still get rid of irrelevant cases.
        switch (1) {
          default:
            x();
            if (foo) break;
            y();
        }
        // XXX: we could optimize this better by inventing an outer
        // labeled block, but that's kinda tricky.
    }
}

constant_switch_6: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        OUT: {
            foo();
            switch (1) {
              case 1:
                x();
                if (foo) break OUT;
                y();
              case 1+1:
                bar();
                break;
              default:
                def();
            }
        }
    }
    expect: {
        OUT: {
            foo();
            x();
            if (foo) break OUT;
            y();
            bar();
        }
    }
}

constant_switch_7: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        OUT: {
            foo();
            switch (1) {
              case 1:
                x();
                if (foo) break OUT;
                for (var x = 0; x < 10; x++) {
                    if (x > 5) break; // this break refers to the for, not to the switch; thus it
                                      // shouldn't ruin our optimization
                    console.log(x);
                }
                y();
              case 1+1:
                bar();
                break;
              default:
                def();
            }
        }
    }
    expect: {
        OUT: {
            foo();
            x();
            if (foo) break OUT;
            for (var x = 0; x < 10; x++) {
                if (x > 5) break;
                console.log(x);
            }
            y();
            bar();
        }
    }
}

constant_switch_8: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        OUT: switch (1) {
          case 1:
            x();
            for (;;) break OUT;
            y();
            break;
          case 1+1:
            bar();
          default:
            def();
        }
    }
    expect: {
        OUT: {
            x();
            for (;;) break OUT;
            y();
        }
    }
}

constant_switch_9: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        OUT: switch (1) {
          case 1:
            x();
            for (;;) if (foo) break OUT;
            y();
          case 1+1:
            bar();
          default:
            def();
        }
    }
    expect: {
        OUT: {
            x();
            for (;;) if (foo) break OUT;
            y();
            bar();
            def();
        }
    }
}

drop_default_1: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          case "bar": baz();
          default:
        }
    }
    expect: {
        switch (foo) {
          case "bar": baz();
        }
    }
}

drop_default_2: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          case "bar": baz(); break;
          default:
            break;
        }
    }
    expect: {
        switch (foo) {
          case "bar": baz();
        }
    }
}

drop_default_3: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        function f() {
            console.log("PASS");
            return 42;
        }
        switch (42) {
          case f():
            break;
          case void console.log("FAIL"):
          default:
        }
    }
    expect: {
        function f() {
            console.log("PASS");
            return 42;
        }
        switch (42) {
          case f():
          case void console.log("FAIL"):
        }
    }
    expect_stdout: "PASS"
}

keep_default: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          case "bar": baz();
          default:
            something();
            break;
        }
    }
    expect: {
        switch (foo) {
          case "bar": baz();
          default:
            something();
        }
    }
}

issue_1663: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        var a = 100, b = 10;
        function f() {
            switch (1) {
              case 1:
                b = a++;
                return ++b;
              default:
                var b;
            }
        }
        f();
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        function f() {
            var b;
            b = a++;
            return ++b;
        }
        f();
        console.log(a, b);
    }
    expect_stdout: true
}

drop_case_1: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          case "bar": baz(); break;
          case "moo":
            break;
        }
    }
    expect: {
        switch (foo) {
          case "bar": baz();
        }
    }
}

drop_case_2: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          case "bar":
            bar();
            break;
          default:
          case "moo":
            moo();
            break;
        }
    }
    expect: {
        switch (foo) {
          case "bar":
            bar();
            break;
          default:
            moo();
        }
    }
}

drop_case_3: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        var c = "PASS";
        switch ({}.p) {
          default:
          case void 0:
            break;
          case c = "FAIL":
        }
        console.log(c);
    }
    expect: {
        var c = "PASS";
        switch ({}.p) {
          default:
          case void 0:
          case c = "FAIL":
        }
        console.log(c);
    }
    expect_stdout: "PASS"
}

drop_case_4: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (0) {
          case [ a, typeof b ]:
          default:
            var a;
        }
        console.log("PASS");
    }
    expect: {
        switch (0) {
          case [ a, typeof b ]:
            var a;
        }
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

drop_case_5: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        switch (42) {
          case void console.log("PASS 1"):
            console.log("FAIL 1");
          case 42:
          case console.log("FAIL 2"):
            console.log("PASS 2");
        }
    }
    expect: {
        switch (42) {
          default:
            void console.log("PASS 1");
            console.log("PASS 2");
        }
    }
    expect_stdout: [
        "PASS 1",
        "PASS 2",
    ]
}

drop_case_6: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        switch (console.log("PASS 1"), 2) {
          case 0:
            console.log("FAIL 1");
          case (console.log("PASS 2"), 1):
            console.log("FAIL 2");
        }
    }
    expect: {
        switch (console.log("PASS 1"), 2) {
          case (console.log("PASS 2"), 1):
        }
    }
    expect_stdout: [
        "PASS 1",
        "PASS 2",
    ]
}

drop_case_7: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        switch (2) {
          case 0:
            console.log("FAIL 1");
          case (console.log("PASS 1"), 1):
            console.log("FAIL 2");
          case 2:
            console.log("PASS 2");
        }
    }
    expect: {
        switch (2) {
          default:
            console.log("PASS 1"), 1;
            console.log("PASS 2");
        }
    }
    expect_stdout: [
        "PASS 1",
        "PASS 2",
    ]
}

drop_case_8: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        function log(msg) {
            console.log(msg);
            return msg;
        }
        switch (log("foo")) {
          case "bar":
            log("moo");
            break;
          case log("baz"):
            log("moo");
            break;
          default:
            log("moo");
        }
    }
    expect: {
        function log(msg) {
            console.log(msg);
            return msg;
        }
        switch (log("foo")) {
          case "bar":
          case log("baz"):
          default:
            log("moo");
        }
    }
    expect_stdout: [
        "foo",
        "baz",
        "moo",
    ]
}

drop_case_9: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        function log(msg) {
            console.log(msg);
            return msg;
        }
        switch (log("foo")) {
          case log("bar"):
            log("moo");
            break;
          case "baz":
            log("moo");
            break;
          default:
            log("moo");
        }
    }
    expect: {
        function log(msg) {
            console.log(msg);
            return msg;
        }
        switch (log("foo")) {
          default:
            log("bar");
            log("moo");
        }
    }
    expect_stdout: [
        "foo",
        "bar",
        "moo",
    ]
}

keep_case_1: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          case "bar": baz(); break;
          case moo:
            break;
        }
    }
    expect: {
        switch (foo) {
          case "bar": baz(); break;
          case moo:
        }
    }
}

keep_case_2: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        switch ("foo") {
          case console.log("bar"):
          case console.log("baz"), "moo":
        }
    }
    expect: {
        switch ("foo") {
          case console.log("bar"):
          case console.log("baz"), "moo":
        }
    }
    expect_stdout: [
        "bar",
        "baz",
    ]
}

keep_case_3: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        var a;
        switch (void console.log("PASS")) {
          case a:
          case console.log("FAIL"), 42:
        }
    }
    expect: {
        var a;
        switch (void console.log("PASS")) {
          case a:
          case console.log("FAIL"), 42:
        }
    }
    expect_stdout: "PASS"
}

keep_case_4: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        var a;
        switch (void console.log("PASS")) {
          case a:
          case void console.log("FAIL"):
        }
    }
    expect: {
        var a;
        switch (void console.log("PASS")) {
          case a:
          case void console.log("FAIL"):
        }
    }
    expect_stdout: "PASS"
}

issue_376: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        switch (true) {
          case boolCondition:
            console.log(1);
            break;
          case false:
            console.log(2);
            break;
        }
    }
    expect: {
        switch (true) {
          case boolCondition:
            console.log(1);
        }
    }
}

issue_441_1: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          case bar:
            qux();
            break;
          case baz:
            qux();
            break;
          default:
            qux();
            break;
        }
    }
    expect: {
        switch (foo) {
          case bar:
          case baz:
          default:
            qux();
        }
    }
}

issue_441_2: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          case bar:
            // TODO: Fold into the case below
            qux();
            break;
          case fall:
          case baz:
            qux();
            break;
          default:
            qux();
            break;
        }
    }
    expect: {
        switch (foo) {
          case bar:
            qux();
            break;
          case fall:
          case baz:
          default:
            qux();
        }
    }
}

issue_1674: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
        switches: true,
    }
    input: {
        switch (0) {
          default:
            console.log("FAIL");
            break;
          case 0:
            console.log("PASS");
            break;
        }
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_1679: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        var a = 100, b = 10;
        function f() {
            switch (--b) {
              default:
              case !function x() {}:
                break;
              case b--:
                switch (0) {
                  default:
                  case a--:
                }
                break;
              case (a++):
                break;
            }
        }
        f();
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        function f() {
            switch (--b) {
              default:
              case !function x() {}:
                break;
              case b--:
                switch (0) {
                  default:
                  case a--:
                }
                break;
              case (a++):
            }
        }
        f();
        console.log(a, b);
    }
    expect_stdout: "99 8"
}

issue_1680_1: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        function f(x) {
            console.log(x);
            return x + 1;
        }
        switch (2) {
          case f(0):
          case f(1):
            f(2);
          case 2:
          case f(3):
          case f(4):
            f(5);
        }
    }
    expect: {
        function f(x) {
            console.log(x);
            return x + 1;
        }
        switch (2) {
          case f(0):
          case f(1):
            f(2);
          default:
            f(5);
        }
    }
    expect_stdout: [
        "0",
        "1",
        "2",
        "5",
    ]
}

issue_1680_2: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        var a = 100, b = 10;
        switch (b) {
          case a--:
            break;
          case b:
            var c;
            break;
          case a:
            break;
          case a--:
            break;
        }
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        switch (b) {
          case a--:
            break;
          case b:
            var c;
            break;
          case a:
          case a--:
        }
        console.log(a, b);
    }
    expect_stdout: true
}

issue_1690_1: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (console.log("PASS")) {}
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_1690_2: {
    options = {
        dead_code: false,
        switches: true,
    }
    input: {
        switch (console.log("PASS")) {}
    }
    expect: {
        switch (console.log("PASS")) {}
    }
    expect_stdout: "PASS"
}

if_switch_typeof: {
    options = {
        conditionals: true,
        dead_code: true,
        side_effects: true,
        switches: true,
    }
    input: {
        if (a) switch(typeof b) {}
    }
    expect: {
        a;
    }
}

issue_1698: {
    options = {
        side_effects: true,
        switches: true,
    }
    input: {
        var a = 1;
        !function() {
            switch (a++) {}
        }();
        console.log(a);
    }
    expect: {
        var a = 1;
        !function() {
            switch (a++) {}
        }();
        console.log(a);
    }
    expect_stdout: "2"
}

issue_1705_1: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        var a = 0;
        switch (a) {
          default:
            console.log("FAIL");
          case 0:
            break;
        }
    }
    expect: {
        var a = 0;
        switch (a) {
          default:
            console.log("FAIL");
          case 0:
        }
    }
    expect_stdout: true
}

issue_1705_2: {
    options = {
        dead_code: true,
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        switches: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        switch (a) {
          default:
            console.log("FAIL");
          case 0:
            break;
        }
    }
    expect: {
    }
    expect_stdout: true
}

issue_1705_3: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (a) {
          case 0:
            break;
          default:
            break;
        }
    }
    expect: {
        a;
    }
    expect_stdout: true
}

beautify: {
    beautify = {
        beautify: true,
    }
    input: {
        switch (a) {
          case 0:
          case 1:
            break;
          case 2:
          default:
        }
        switch (b) {
          case 3:
            foo();
            bar();
          default:
            break;
        }
    }
    expect_exact: [
        "switch (a) {",
        "  case 0:",
        "  case 1:",
        "    break;",
        "",
        "  case 2:",
        "  default:",
        "}",
        "",
        "switch (b) {",
        "  case 3:",
        "    foo();",
        "    bar();",
        "",
        "  default:",
        "    break;",
        "}",
    ]
}

issue_1758: {
    options = {
        conditionals: true,
        dead_code: true,
        switches: true,
    }
    input: {
        var a = 1, b = 2;
        switch (a--) {
          default:
            b++;
        }
        console.log(a, b);
    }
    expect: {
        var a = 1, b = 2;
        a--;
        b++;
        console.log(a, b);
    }
    expect_stdout: "0 3"
}

issue_2535: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        switch(w(), 42) {
          case 13: x();
          case 42: y();
          default: z();
        }
    }
    expect: {
        w(), 42;
        y();
        z();
    }
}

issue_1750: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        var a = 0, b = 1;
        switch (true) {
          case a, true:
          default:
            b = 2;
          case true:
        }
        console.log(a, b);
    }
    expect: {
        var a = 0, b = 1;
        true;
        b = 2;
        console.log(a, b);
    }
    expect_stdout: "0 2"
}

drop_switch_1: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          default:
            break;
          case "bar":
            break;
        }
    }
    expect: {
        foo;
    }
}

drop_switch_2: {
    options = {
        conditionals: true,
        dead_code: true,
        switches: true,
    }
    input: {
        switch (foo) {
          default:
          case "bar":
            baz();
        }
    }
    expect: {
        foo;
        baz();
    }
}

drop_switch_3: {
    options = {
        dead_code: true,
        switches: true,
    }
    input: {
        console.log(function() {
            switch (0) {
              default:
                return "PASS";
              case 1:
            }
        }());
    }
    expect: {
        console.log(function() {
            switch (0) {
              default:
                return "PASS";
              case 1:
            }
        }());
    }
    expect_stdout: "PASS"
}

drop_switch_4: {
    options = {
        conditionals: true,
        dead_code: true,
        switches: true,
    }
    input: {
        var a = "FAIL";
        switch (0) {
          default:
          case a:
            var b = a = "PASS";
            break;
        }
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        0;
        var b = a = "PASS";
        console.log(a);
    }
    expect_stdout: "PASS"
}

drop_switch_5: {
    options = {
        conditionals: true,
        dead_code: true,
        switches: true,
    }
    input: {
        switch (A) {
          case B:
            x();
          default:
        }
        switch (C) {
          default:
            y();
          case D:
        }
    }
    expect: {
        A === B && x();
        C !== D && y();
    }
}

drop_switch_6: {
    options = {
        conditionals: true,
        dead_code: true,
        switches: true,
    }
    input: {
        switch (A) {
          case B:
          default:
            x();
        }
        switch (C) {
          default:
          case D:
            y();
        }
    }
    expect: {
        A;
        B;
        x();
        C !== D;
        y();
    }
}

drop_switch_7: {
    options = {
        conditionals: true,
        dead_code: true,
        switches: true,
    }
    input: {
        switch (A) {
          case B:
            w();
          default:
            x();
        }
        switch (C) {
          default:
            y();
          case D:
            z();
        }
    }
    expect: {
        A === B && w();
        x();
        C !== D && y();
        z();
    }
}

drop_switch_8: {
    options = {
        conditionals: true,
        dead_code: true,
        switches: true,
    }
    input: {
        switch (A) {
          case B:
            w();
            break;
          default:
            x();
        }
        switch (C) {
          default:
            y();
            break;
          case D:
            z();
        }
    }
    expect: {
        (A === B ? w : x)();
        (C !== D ? y : z)();
    }
}

issue_4059: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        switch (0) {
          default:
          case 1:
            break;
          case a:
            break;
            var a;
        }
        console.log("PASS");
    }
    expect: {
        switch (0) {
          default:
            break;
          case a:
            break;
            var a;
        }
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_5008_1: {
    options = {
        dead_code: true,
        evaluate: true,
        reduce_vars: true,
        switches: true,
        unsafe: true,
    }
    input: {
        console.log(function f() {
            switch (f) {
              case f:
                return "PASS";
              default:
                return "FAIL";
            }
        }());
    }
    expect: {
        console.log(function f() {
            switch (f) {
              default:
                return "PASS";
            }
        }());
    }
    expect_stdout: "PASS"
}

issue_5008_2: {
    options = {
        dead_code: true,
        evaluate: true,
        reduce_vars: true,
        switches: true,
        unsafe: true,
    }
    input: {
        console.log(function(a) {
            switch (a) {
              case a:
                return "PASS";
              default:
                return "FAIL";
            }
        }([]));
    }
    expect: {
        console.log(function(a) {
            switch (a) {
              default:
                return "PASS";
            }
        }([]));
    }
    expect_stdout: "PASS"
}

issue_5008_3: {
    options = {
        dead_code: true,
        evaluate: true,
        reduce_vars: true,
        switches: true,
        unsafe: true,
    }
    input: {
        console.log(function(a) {
            switch (a) {
              case a:
                return "PASS";
              default:
                return "FAIL";
            }
        }({}));
    }
    expect: {
        console.log(function(a) {
            switch (a) {
              default:
                return "PASS";
            }
        }({}));
    }
    expect_stdout: "PASS"
}

issue_5008_4: {
    options = {
        dead_code: true,
        evaluate: true,
        reduce_vars: true,
        switches: true,
    }
    input: {
        console.log(function(a) {
            switch (a) {
              case a:
                return "PASS";
              default:
                return "FAIL";
            }
        }(/foo/));
    }
    expect: {
        console.log(function(a) {
            switch (a) {
              default:
                return "PASS";
            }
        }(/foo/));
    }
    expect_stdout: "PASS"
}

issue_5010: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        var a;
        switch (42) {
          case console.log("PASS"):
          case a:
            console.log("FAIL");
          case 42:
        }
    }
    expect: {
        var a;
        switch (42) {
          case console.log("PASS"):
          case a:
            console.log("FAIL");
        }
    }
    expect_stdout: "PASS"
}

issue_5012: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        switch (void 0) {
          case console.log("PASS"):
            break;
          case void 0:
          case 42:
            console.log("FAIL");
        }
    }
    expect: {
        switch (void 0) {
          case console.log("PASS"):
            break;
          default:
            console.log("FAIL");
        }
    }
    expect_stdout: "PASS"
}
