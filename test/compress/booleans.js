iife_boolean_context: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        console.log(function() {
            return Object(1) || false;
        }() ? "PASS" : "FAIL");
        console.log(function() {
            return [].length || true;
        }() ? "PASS" : "FAIL");
    }
    expect: {
        console.log(function() {
            return Object(1);
        }() ? "PASS" : "FAIL");
        console.log(function() {
            return [].length, 1;
        }() ? "PASS" : "FAIL");
    }
    expect_stdout: [
        "PASS",
        "PASS",
    ]
    expect_warnings: [
        "WARN: Dropping side-effect-free || [test/compress/booleans.js:2,19]",
        "WARN: Boolean || always true [test/compress/booleans.js:5,19]",
    ]
}

issue_3465_1: {
    options = {
        booleans: true,
    }
    input: {
        console.log(function(a) {
            return typeof a;
        }() ? "PASS" : "FAIL");
    }
    expect: {
        console.log(function(a) {
            return 1;
        }() ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

issue_3465_2: {
    options = {
        booleans: true,
    }
    input: {
        console.log(function f(a) {
            if (!a) console.log(f(42));
            return typeof a;
        }() ? "PASS" : "FAIL");
    }
    expect: {
        console.log(function f(a) {
            if (!a) console.log(f(42));
            return typeof a;
        }() ? "PASS" : "FAIL");
    }
    expect_stdout: [
        "number",
        "PASS",
    ]
}

issue_3465_3: {
    options = {
        booleans: true,
        passes: 2,
        unused: true,
    }
    input: {
        console.log(function f(a) {
            return typeof a;
        }() ? "PASS" : "FAIL");
    }
    expect: {
        console.log(function(a) {
            return 1;
        }() ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}
