strict: {
    options = {
        pure_getters: "strict",
        reduce_funcs: false,
        reduce_vars: false,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a, b = null, c = {};
        a.prop;
        b.prop;
        c.prop;
        d.prop;
        null.prop;
        (void 0).prop;
        undefined.prop;
    }
    expect: {
        var a, b = null, c = {};
        a.prop;
        b.prop;
        c.prop;
        d.prop;
        null.prop;
        (void 0).prop;
        (void 0).prop;
    }
}

strict_reduce_vars: {
    options = {
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a, b = null, c = {};
        a.prop;
        b.prop;
        c.prop;
        d.prop;
        null.prop;
        (void 0).prop;
        undefined.prop;
    }
    expect: {
        var a, b = null, c = {};
        a.prop;
        b.prop;
        d.prop;
        null.prop;
        (void 0).prop;
        (void 0).prop;
    }
}

unsafe: {
    options = {
        pure_getters: true,
        reduce_funcs: false,
        reduce_vars: false,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a, b = null, c = {};
        a.prop;
        b.prop;
        c.prop;
        d.prop;
        null.prop;
        (void 0).prop;
        undefined.prop;
    }
    expect: {
        var a, b = null, c = {};
        d;
        null.prop;
        (void 0).prop;
        (void 0).prop;
    }
}

unsafe_reduce_vars: {
    options = {
        pure_getters: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a, b = null, c = {};
        a.prop;
        b.prop;
        c.prop;
        d.prop;
        null.prop;
        (void 0).prop;
        undefined.prop;
    }
    expect: {
        var a, b = null, c = {};
        d;
        null.prop;
        (void 0).prop;
        (void 0).prop;
    }
}

chained: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        a.b.c;
    }
    expect: {
        a.b.c;
    }
}

impure_getter_1: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        ({
            get a() {
                console.log(1);
            },
            b: 1
        }).a;
        ({
            get a() {
                console.log(1);
            },
            b: 1
        }).b;
    }
    expect: {
        ({
            get a() {
                console.log(1);
            },
            b: 1
        }).a;
        ({
            get a() {
                console.log(1);
            },
            b: 1
        }).b;
    }
    expect_stdout: "1"
}

impure_getter_2: {
    options = {
        pure_getters: true,
        side_effects: true,
    }
    input: {
        // will produce incorrect output because getter is not pure
        ({
            get a() {
                console.log(1);
            },
            b: 1
        }).a;
        ({
            get a() {
                console.log(1);
            },
            b: 1
        }).b;
    }
    expect: {}
}

issue_2110_1: {
    options = {
        cascade: true,
        pure_getters: "strict",
        sequences: true,
        side_effects: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            function f() {}
            function g() {
                return this;
            }
            f.g = g;
            return f.g();
        }
        console.log(typeof f());
    }
    expect: {
        function f() {
            function f() {}
            return f.g = function() {
                return this;
            }, f.g();
        }
        console.log(typeof f());
    }
    expect_stdout: "function"
}

issue_2110_2: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            function f() {}
            function g() {
                return this;
            }
            f.g = g;
            return f.g();
        }
        console.log(typeof f());
    }
    expect: {
        function f() {
            function f() {}
            f.g = function() {
                return this;
            };
            return f.g();
        }
        console.log(typeof f());
    }
    expect_stdout: "function"
}

set_immutable_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1;
        a.foo += "";
        if (a.foo) console.log("FAIL");
        else console.log("PASS");
    }
    expect: {
        1..foo += "";
        if (1..foo) console.log("FAIL");
        else console.log("PASS");
    }
    expect_stdout: "PASS"
}

set_immutable_2: {
    options = {
        cascade: true,
        conditionals: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        a.foo += "";
        if (a.foo) console.log("FAIL");
        else console.log("PASS");
    }
    expect: {
        var a = 1;
        a.foo += "", a.foo ? console.log("FAIL") : console.log("PASS");
    }
    expect_stdout: "PASS"
}

set_immutable_3: {
    options = {
        collapse_vars: true,
        evaluate: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var a = 1;
        a.foo += "";
        if (a.foo) console.log("FAIL");
        else console.log("PASS");
    }
    expect: {
        "use strict";
        1..foo += "";
        if (1..foo) console.log("FAIL");
        else console.log("PASS");
    }
    expect_stdout: true
}

set_immutable_4: {
    options = {
        cascade: true,
        conditionals: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        "use strict";
        var a = 1;
        a.foo += "";
        if (a.foo) console.log("FAIL");
        else console.log("PASS");
    }
    expect: {
        "use strict";
        var a = 1;
        a.foo += "", a.foo ? console.log("FAIL") : console.log("PASS");
    }
    expect_stdout: true
}

set_mutable_1: {
    options = {
        collapse_vars: true,
        evaluate: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        !function a() {
            a.foo += "";
            if (a.foo) console.log("PASS");
            else console.log("FAIL");
        }();
    }
    expect: {
        !function a() {
            if (a.foo += "") console.log("PASS");
            else console.log("FAIL");
        }();
    }
    expect_stdout: "PASS"
}

set_mutable_2: {
    options = {
        cascade: true,
        conditionals: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        !function a() {
            a.foo += "";
            if (a.foo) console.log("PASS");
            else console.log("FAIL");
        }();
    }
    expect: {
        !function a() {
            (a.foo += "") ? console.log("PASS") : console.log("FAIL");
        }();
    }
    expect_stdout: "PASS"
}

issue_2313_1: {
    options = {
        cascade: true,
        conditionals: true,
        pure_getters: "strict",
        sequences: true,
        side_effects: true,
    }
    input: {
        function x() {
            console.log(1);
            return {
                y: function() {
                    console.log(2);
                    return {
                        z: 0
                    };
                }
            };
        }
        x().y().z++;
        if (x().y().z) {
            console.log(3);
        }
    }
    expect: {
        function x() {
            return console.log(1), {
                y: function() {
                    return console.log(2), {
                        z: 0
                    };
                }
            };
        }
        x().y().z++,
        x().y().z && console.log(3);
    }
    expect_stdout: [
        "1",
        "2",
        "1",
        "2",
    ]
}

issue_2313_2: {
    options = {
        cascade: true,
        conditionals: true,
        pure_getters: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        function x() {
            console.log(1);
            return {
                y: function() {
                    console.log(2);
                    return {
                        z: 0
                    };
                }
            };
        }
        x().y().z++;
        if (x().y().z) {
            console.log(3);
        }
    }
    expect: {
        function x() {
            return console.log(1), {
                y: function() {
                    return console.log(2), {
                        z: 0
                    };
                }
            };
        }
        x().y().z++,
        x().y().z && console.log(3);
    }
    expect_stdout: [
        "1",
        "2",
        "1",
        "2",
    ]
}

issue_2313_3: {
    options = {
        collapse_vars: true,
        conditionals: true,
        pure_getters: "strict",
    }
    input: {
        function x() {
            console.log(1);
            return {
                y: function() {
                    console.log(2);
                    return {
                        z: 0
                    };
                }
            };
        }
        x().y().z++;
        if (x().y().z) {
            console.log(3);
        }
    }
    expect: {
        function x() {
            console.log(1);
            return {
                y: function() {
                    console.log(2);
                    return {
                        z: 0
                    };
                }
            };
        }
        x().y().z++;
        x().y().z && console.log(3);
    }
    expect_stdout: [
        "1",
        "2",
        "1",
        "2",
    ]
}

issue_2313_4: {
    options = {
        collapse_vars: true,
        conditionals: true,
        pure_getters: true,
    }
    input: {
        function x() {
            console.log(1);
            return {
                y: function() {
                    console.log(2);
                    return {
                        z: 0
                    };
                }
            };
        }
        x().y().z++;
        if (x().y().z) {
            console.log(3);
        }
    }
    expect: {
        function x() {
            console.log(1);
            return {
                y: function() {
                    console.log(2);
                    return {
                        z: 0
                    };
                }
            };
        }
        x().y().z++;
        x().y().z && console.log(3);
    }
    expect_stdout: [
        "1",
        "2",
        "1",
        "2",
    ]
}

issue_2313_5: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        x().y++;
        x().y;
    }
    expect: {
        x().y++;
        x().y;
    }
}

issue_2313_6: {
    options = {
        pure_getters: true,
        side_effects: true,
    }
    input: {
        x().y++;
        x().y;
    }
    expect: {
        x().y++;
        x();
    }
}
