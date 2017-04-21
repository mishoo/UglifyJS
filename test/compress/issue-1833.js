iife_for: {
    options = {
        negate_iife: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {
                L: for (;;) break L;
            }
            g();
        }
        f();
    }
    expect: {
        !function() {
            !function() {
                L: for (;;) break L;
            }();
        }();
    }
}

iife_for_in: {
    options = {
        negate_iife: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {
                L: for (var a in x) break L;
            }
            g();
        }
        f();
    }
    expect: {
        !function() {
            !function() {
                L: for (var a in x) break L;
            }();
        }();
    }
}

iife_do: {
    options = {
        negate_iife: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {
                L: do {
                    break L;
                } while (1);
            }
            g();
        }
        f();
    }
    expect: {
        !function() {
            !function() {
                L: do {
                    break L;
                } while (1);
            }();
        }();
    }
}

iife_while: {
    options = {
        negate_iife: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {
                L: while (1) break L;
            }
            g();
        }
        f();
    }
    expect: {
        !function() {
            !function() {
                L: while (1) break L;
            }();
        }();
    }
}

label_do: {
    options = {
        evaluate: true,
        loops: true,
    }
    input: {
        L: do {
            continue L;
        } while (0);
    }
    expect: {
        L: do {
            continue L;
        } while (0);
    }
}

label_while: {
    options = {
        evaluate: true,
        dead_code: true,
        loops: true,
    }
    input: {
        function f() {
            L: while (0) continue L;
        }
    }
    expect_exact: "function f(){L:;}"
}
