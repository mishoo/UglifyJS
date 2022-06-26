parentheses: {
    input: {
        (console.log("foo") || console.log("bar") ?? console.log("baz")) && console.log("moo");
    }
    expect_exact:'((console.log("foo")||console.log("bar"))??console.log("baz"))&&console.log("moo");'
    expect_stdout: [
        "foo",
        "bar",
        "baz",
    ]
    node_version: ">=14"
}

evaluate: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        void console.log("foo" ?? "bar") ?? console.log("baz");
    }
    expect: {
        console.log("foo"),
        console.log("baz");
    }
    expect_stdout: [
        "foo",
        "baz",
    ]
    node_version: ">=14"
}

conditional_assignment_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        console.log(function(a, b) {
            b ?? (a = "FAIL");
            return a;
        }("PASS", !console));
    }
    expect: {
        console.log(function(a, b) {
            b ?? (a = "FAIL");
            return a;
        }("PASS", !console));
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

conditional_assignment_2: {
    options = {
        conditionals: true,
    }
    input: {
        var a, b = false;
        a = "PASS",
        b ?? (a = "FAIL"),
        console.log(a);
    }
    expect: {
        var a, b = false;
        a = "PASS",
        b ?? (a = "FAIL"),
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

conditional_assignment_3: {
    options = {
        conditionals: true,
        join_vars: true,
    }
    input: {
        var a, b = false;
        a = "PASS",
        b ?? (a = "FAIL"),
        console.log(a);
    }
    expect: {
        var a, b = false, a = "PASS";
        b ?? (a = "FAIL"),
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

conditional_assignment_4: {
    options = {
        side_effects: true,
    }
    input: {
        console.log(function(a) {
            !console ?? (a = "FAIL");
            return a;
        }("PASS"));
    }
    expect: {
        console.log(function(a) {
            !console ?? (a = "FAIL");
            return a;
        }("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

de_morgan_1: {
    options = {
        booleans: true,
    }
    input: {
        function f(a) {
            return a ?? a;
        }
        console.log(f(null), f(42));
    }
    expect: {
        function f(a) {
            return a;
        }
        console.log(f(null), f(42));
    }
    expect_stdout: "null 42"
    node_version: ">=14"
}

de_morgan_2a: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
    }
    input: {
        function f(a, b) {
            return a || (a ?? b);
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect: {
        function f(a, b) {
            return a || (a ?? b);
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect_stdout: [
        "undefined {}",
        "42 42",
    ]
    node_version: ">=14"
}

de_morgan_2b: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        function f(a, b) {
            return a && (a ?? b);
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect: {
        function f(a, b) {
            return a;
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect_stdout: [
        "null null",
        "42 42",
    ]
    node_version: ">=14"
}

de_morgan_2c: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        function f(a, b) {
            return a ?? (a || b);
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect: {
        function f(a, b) {
            return a ?? b;
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect_stdout: [
        "undefined {}",
        "42 42",
    ]
    node_version: ">=14"
}

de_morgan_2d: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        function f(a, b) {
            return a ?? (a && b);
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect: {
        function f(a, b) {
            return a;
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect_stdout: [
        "null null",
        "42 42",
    ]
    node_version: ">=14"
}

de_morgan_2e: {
    options = {
        booleans: true,
        conditionals: true,
    }
    input: {
        function f(a, b) {
            return a ?? (a ?? b);
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect: {
        function f(a, b) {
            return a ?? b;
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect_stdout: [
        "undefined {}",
        "42 42",
    ]
    node_version: ">=14"
}

inline_binary_nullish: {
    options = {
        inline: true,
    }
    input: {
        (function() {
            while (console.log("foo"));
        })() ?? (function() {
            while (console.log("bar"));
        })();
    }
    expect: {
        if (null == function() {
            while (console.log("foo"));
        }())
            while (console.log("bar"));
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=14"
}

issue_4679: {
    options = {
        comparisons: true,
        ie: true,
    }
    input: {
        var a;
        if (void 0 === (undefined ?? a))
            console.log("PASS");
    }
    expect: {
        var a;
        if (void 0 === (undefined ?? a))
            console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

issue_5266: {
    options = {
        inline: true,
        side_effects: true,
    }
    input: {
        [
            42,
            null,
            false,
            void 0,
            "FAIL",
        ].forEach(function (a) {
            a ?? function() {
                while (console.log(a));
            }();
        });
    }
    expect: {
        [
            42,
            null,
            false,
            void 0,
            "FAIL",
        ].forEach(function (a) {
            if (null == a) {
                while (console.log(a));
                return;
            } else
                return;
        });
    }
    expect_stdout: [
        "null",
        "undefined",
    ]
    node_version: ">=14"
}
