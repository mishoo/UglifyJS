side_effects_catch: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {
                try {
                    throw 0;
                } catch (e) {
                    console.log("PASS");
                }
            }
            g();
        }
        f();
    }
    expect: {
        function f() {
            (function() {
                try {
                    throw 0;
                } catch (e) {
                    console.log("PASS");
                }
            })();
        }
        f();
    }
    expect_stdout: "PASS"
}

side_effects_else: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x) {
            function g() {
                if (x);
                else console.log("PASS");
            }
            g();
        }
        f(0);
    }
    expect: {
        function f(x) {
            (function() {
                if (x);
                else console.log("PASS");
            })();
        }
        f(0);
    }
    expect_stdout: "PASS"
}

side_effects_finally: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {
                try {
                    x();
                } catch (e) {
                } finally {
                    console.log("PASS");
                }
            }
            g();
        }
        f();
    }
    expect: {
        function f() {
            (function() {
                try {
                    x();
                } catch (e) {
                } finally {
                    console.log("PASS");
                }
            })();
        }
        f();
    }
    expect_stdout: "PASS"
}

side_effects_label: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x) {
            function g() {
                L: {
                    console.log("PASS");
                    break L;
                }
            }
            g();
        }
        f(0);
    }
    expect: {
        function f(x) {
            (function() {
                L: {
                    console.log("PASS");
                    break L;
                }
            })();
        }
        f(0);
    }
    expect_stdout: "PASS"
}

side_effects_switch: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f() {
            function g() {
                switch (0) {
                  default:
                  case console.log("PASS"):
                }
            }
            g();
        }
        f();
    }
    expect: {
        function f() {
            (function() {
                switch (0) {
                  default:
                  case console.log("PASS"):
                }
            })();
        }
        f();
    }
    expect_stdout: "PASS"
}
