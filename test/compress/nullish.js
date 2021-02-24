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

issue_4679: {
    options = {
        comparisons: true,
        ie8: true,
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
