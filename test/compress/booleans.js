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

de_morgan_1a: {
    options = {
        booleans: true,
    }
    input: {
        function f(a) {
            return a || a;
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
}

de_morgan_1b: {
    options = {
        booleans: true,
    }
    input: {
        function f(a) {
            return a && a;
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
}

de_morgan_1c: {
    options = {
        booleans: true,
    }
    input: {
        console.log(delete (NaN && NaN));
    }
    expect: {
        console.log(delete (0, NaN));
    }
    expect_stdout: "true"
}

de_morgan_2a: {
    options = {
        booleans: true,
        conditionals: true,
    }
    input: {
        function f(a, b) {
            return a || (a || b);
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect: {
        function f(a, b) {
            return a || b;
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect_stdout: [
        "undefined {}",
        "42 42",
    ]
}

de_morgan_2b: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        function f(a, b) {
            return a || (a && b);
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
}

de_morgan_2c: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        function f(a, b) {
            return a && (a || b);
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
}

de_morgan_2d: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        function f(a, b) {
            return a && (a && b);
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect: {
        function f(a, b) {
            return a && b;
        }
        console.log(f(null), f(null, {}));
        console.log(f(42), f(42, {}));
    }
    expect_stdout: [
        "null null",
        "undefined {}",
    ]
}

de_morgan_3a: {
    options = {
        booleans: true,
        conditionals: true,
    }
    input: {
        function f(a, b, c) {
            return a || ((a || b) || c);
        }
        console.log(f(null, false), f(null, false, {}), f(null, true), f(null, true, {}));
        console.log(f(42, false), f(42, false, {}), f(42, true), f(42, true, {}));
    }
    expect: {
        function f(a, b, c) {
            return a || b || c;
        }
        console.log(f(null, !1), f(null, !1, {}), f(null, !0), f(null, !0, {}));
        console.log(f(42, !1), f(42, !1, {}), f(42, !0), f(42, !0, {}));
    }
    expect_stdout: [
        "undefined {} true true",
        "42 42 42 42",
    ]
}

de_morgan_3b: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        function f(a, b, c) {
            return a || ((a || b) && c);
        }
        console.log(f(null, false), f(null, false, {}), f(null, true), f(null, true, {}));
        console.log(f(42, false), f(42, false, {}), f(42, true), f(42, true, {}));
    }
    expect: {
        function f(a, b, c) {
            return a || b && c;
        }
        console.log(f(null, !1), f(null, !1, {}), f(null, !0), f(null, !0, {}));
        console.log(f(42, !1), f(42, !1, {}), f(42, !0), f(42, !0, {}));
    }
    expect_stdout: [
        "false false undefined {}",
        "42 42 42 42",
    ]
}

de_morgan_3c: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        function f(a, b, c) {
            return a || ((a && b) || c);
        }
        console.log(f(null, false), f(null, false, {}), f(null, true), f(null, true, {}));
        console.log(f(42, false), f(42, false, {}), f(42, true), f(42, true, {}));
    }
    expect: {
        function f(a, b, c) {
            return a || c;
        }
        console.log(f(null, !1), f(null, !1, {}), f(null, !0), f(null, !0, {}));
        console.log(f(42, !1), f(42, !1, {}), f(42, !0), f(42, !0, {}));
    }
    expect_stdout: [
        "undefined {} undefined {}",
        "42 42 42 42",
    ]
}

de_morgan_3d: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        function f(a, b, c) {
            return a || ((a && b) && c);
        }
        console.log(f(null, false), f(null, false, {}), f(null, true), f(null, true, {}));
        console.log(f(42, false), f(42, false, {}), f(42, true), f(42, true, {}));
    }
    expect: {
        function f(a, b, c) {
            return a;
        }
        console.log(f(null, !1), f(null, !1, {}), f(null, !0), f(null, !0, {}));
        console.log(f(42, !1), f(42, !1, {}), f(42, !0), f(42, !0, {}));
    }
    expect_stdout: [
        "null null null null",
        "42 42 42 42",
    ]
}

de_morgan_3e: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        function f(a, b, c) {
            return a && ((a || b) || c);
        }
        console.log(f(null, false), f(null, false, {}), f(null, true), f(null, true, {}));
        console.log(f(42, false), f(42, false, {}), f(42, true), f(42, true, {}));
    }
    expect: {
        function f(a, b, c) {
            return a;
        }
        console.log(f(null, !1), f(null, !1, {}), f(null, !0), f(null, !0, {}));
        console.log(f(42, !1), f(42, !1, {}), f(42, !0), f(42, !0, {}));
    }
    expect_stdout: [
        "null null null null",
        "42 42 42 42",
    ]
}

de_morgan_3f: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        function f(a, b, c) {
            return a && ((a || b) && c);
        }
        console.log(f(null, false), f(null, false, {}), f(null, true), f(null, true, {}));
        console.log(f(42, false), f(42, false, {}), f(42, true), f(42, true, {}));
    }
    expect: {
        function f(a, b, c) {
            return a && c;
        }
        console.log(f(null, !1), f(null, !1, {}), f(null, !0), f(null, !0, {}));
        console.log(f(42, !1), f(42, !1, {}), f(42, !0), f(42, !0, {}));
    }
    expect_stdout: [
        "null null null null",
        "undefined {} undefined {}",
    ]
}

de_morgan_3g: {
    options = {
        booleans: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        function f(a, b, c) {
            return a && ((a && b) || c);
        }
        console.log(f(null, false), f(null, false, {}), f(null, true), f(null, true, {}));
        console.log(f(42, false), f(42, false, {}), f(42, true), f(42, true, {}));
    }
    expect: {
        function f(a, b, c) {
            return a && (b || c);
        }
        console.log(f(null, !1), f(null, !1, {}), f(null, !0), f(null, !0, {}));
        console.log(f(42, !1), f(42, !1, {}), f(42, !0), f(42, !0, {}));
    }
    expect_stdout: [
        "null null null null",
        "undefined {} true true",
    ]
}

de_morgan_3h: {
    options = {
        booleans: true,
        conditionals: true,
    }
    input: {
        function f(a, b, c) {
            return a && ((a && b) && c);
        }
        console.log(f(null, false), f(null, false, {}), f(null, true), f(null, true, {}));
        console.log(f(42, false), f(42, false, {}), f(42, true), f(42, true, {}));
    }
    expect: {
        function f(a, b, c) {
            return a && b && c;
        }
        console.log(f(null, !1), f(null, !1, {}), f(null, !0), f(null, !0, {}));
        console.log(f(42, !1), f(42, !1, {}), f(42, !0), f(42, !0, {}));
    }
    expect_stdout: [
        "null null null null",
        "false false undefined {}",
    ]
}

conditional_chain: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
    }
    input: {
        function f(a, b) {
            return a ? a : b ? b : 42;
        }
        console.log(f("PASS", "FAIL"));
    }
    expect: {
        function f(a, b) {
            return a || b || 42;
        }
        console.log(f("PASS", "FAIL"));
    }
    expect_stdout: "PASS"
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
