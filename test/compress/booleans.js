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

issue_2737_2: {
    options = {
        booleans: true,
        inline: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(bar) {
            for (;bar();) break;
        })(function qux() {
            return console.log("PASS"), qux;
        });
    }
    expect: {
        (function(bar) {
            for (;bar();) break;
        })(function() {
            return console.log("PASS"), 1;
        });
    }
    expect_stdout: "PASS"
}

issue_3658: {
    options = {
        booleans: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        console.log(function f() {
            console || f();
            return "PASS";
        }());
    }
    expect: {
        console.log(function f() {
            console || f();
            return "PASS";
        }());
    }
    expect_stdout: "PASS"
}

issue_3690: {
    options = {
        booleans: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            return function() {
                return a = [ this ];
            }() ? "PASS" : "FAIL";
        }());
    }
    expect: {
        console.log(function(a) {
            return function() {
                return 1;
            }() ? "PASS" : "FAIL";
        }());
    }
    expect_stdout: "PASS"
}

issue_4374: {
    options = {
        booleans: true,
        conditionals: true,
        if_return: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            console.log(f());
            function f(a) {
                if (null) return 0;
                if (a) return 1;
                return 0;
            }
        })();
    }
    expect: {
        (function() {
            console.log(function(a) {
                return !null && a ? 1 : 0;
            }());
        })();
    }
    expect_stdout: "0"
}
