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
        collapse_vars: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
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

issue_2110_3: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
    }
    input: {
        function g() {
            return this;
        }
        console.log(typeof function() {
            function f() {}
            f.g = g;
            return f.g();
        }());
    }
    expect: {
        function g() {
            return this;
        }
        console.log(typeof function() {
            function f() {}
            f.g = g;
            return f.g();
        }());
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
        collapse_vars: true,
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
        collapse_vars: true,
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

set_immutable_5: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
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
        1..foo ? console.log("FAIL") : console.log("PASS");
    }
    expect_stdout: true
}

set_immutable_6: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
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
        1..foo ? console.log("FAIL") : console.log("PASS");
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
        collapse_vars: true,
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
        collapse_vars: true,
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
        collapse_vars: true,
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

issue_2678: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        var a = 1, c = "FAIL";
        (function f() {
            (a-- && f()).p;
            return {
                get p() {
                    c = "PASS";
                }
            };
        })();
        console.log(c);
    }
    expect: {
        var a = 1, c = "FAIL";
        (function f() {
            (a-- && f()).p;
            return {
                get p() {
                    c = "PASS";
                }
            };
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_2838: {
    options = {
        pure_getters: true,
        side_effects: true,
    }
    input: {
        function f(a, b) {
            (a || b).c = "PASS";
            (function() {
                return f(a, b);
            }).prototype.foo = "bar";
        }
        var o = {};
        f(null, o);
        console.log(o.c);
    }
    expect: {
        function f(a, b) {
            (a || b).c = "PASS";
        }
        var o = {};
        f(null, o);
        console.log(o.c);
    }
    expect_stdout: "PASS"
}

issue_2938_1: {
    options = {
        pure_getters: true,
        unused: true,
    }
    input: {
        function f(a) {
            a.b = "PASS";
        }
        var o = {};
        f(o);
        console.log(o.b);
    }
    expect: {
        function f(a) {
            a.b = "PASS";
        }
        var o = {};
        f(o);
        console.log(o.b);
    }
    expect_stdout: "PASS"
}

issue_2938_2: {
    options = {
        pure_getters: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var Parser = function Parser() {};
        var p = Parser.prototype;
        p.initialContext = function initialContext() {
            console.log("PASS");
        };
        p.braceIsBlock = function() {};
        (new Parser).initialContext();
    }
    expect: {
        var Parser = function() {};
        var p = Parser.prototype;
        p.initialContext = function() {
            console.log("PASS");
        };
        p.braceIsBlock = function() {};
        (new Parser).initialContext();
    }
    expect_stdout: "PASS"
}

issue_2938_3: {
    options = {
        pure_getters: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(a) {
            var unused = a.a;
            a.b = "PASS";
            a.c;
        }
        var o = {};
        o.d;
        f(o);
        console.log(o.b);
    }
    expect: {
        function f(a) {
            a.b = "PASS";
        }
        var o = {};
        f(o);
        console.log(o.b);
    }
    expect_stdout: "PASS"
}

issue_2938_4: {
    options = {
        pure_getters: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var Parser = function Parser() {};
        var p = Parser.prototype;
        var unused = p.x;
        p.initialContext = function initialContext() {
            p.y;
            console.log("PASS");
        };
        p.braceIsBlock = function() {};
        (new Parser).initialContext();
    }
    expect: {
        var Parser = function() {};
        var p = Parser.prototype;
        p.initialContext = function() {
            console.log("PASS");
        };
        p.braceIsBlock = function() {};
        (new Parser).initialContext();
    }
    expect_stdout: "PASS"
}

collapse_vars_1_true: {
    options = {
        collapse_vars: true,
        pure_getters: true,
        unused: true,
    }
    input: {
        function f(a, b) {
            for (;;) {
                var c = a.g();
                var d = b.p;
                if (c || d) break;
            }
        }
    }
    expect: {
        function f(a, b) {
            for (;;)
                if (a.g() || b.p) break;
        }
    }
}

collapse_vars_1_false: {
    options = {
        collapse_vars: true,
        pure_getters: false,
        unused: true,
    }
    input: {
        function f(a, b) {
            for (;;) {
                var c = a.g();
                var d = b.p;
                if (c || d) break;
            }
        }
    }
    expect: {
        function f(a, b) {
            for (;;) {
                var c = a.g();
                var d = b.p;
                if (c || d) break;
            }
        }
    }
}

collapse_vars_1_strict: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        unused: true,
    }
    input: {
        function f(a, b) {
            for (;;) {
                var c = a.g();
                var d = b.p;
                if (c || d) break;
            }
        }
    }
    expect: {
        function f(a, b) {
            for (;;) {
                var c = a.g();
                var d = b.p;
                if (c || d) break;
            }
        }
    }
}

collapse_vars_2_true: {
    options = {
        collapse_vars: true,
        pure_getters: true,
        reduce_vars: true,
    }
    input: {
        function f() {
            function g() {}
            g.a = function() {};
            g.b = g.a;
            return g;
        }
    }
    expect: {
        function f() {
            function g() {}
            g.b = g.a = function() {};
            return g;
        }
    }
}

collapse_vars_2_false: {
    options = {
        collapse_vars: true,
        pure_getters: false,
        reduce_vars: true,
    }
    input: {
        function f() {
            function g() {}
            g.a = function() {};
            g.b = g.a;
            return g;
        }
    }
    expect: {
        function f() {
            function g() {}
            g.a = function() {};
            g.b = g.a;
            return g;
        }
    }
}

collapse_vars_2_strict: {
    options = {
        collapse_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
    }
    input: {
        function f() {
            function g() {}
            g.a = function() {};
            g.b = g.a;
            return g;
        }
    }
    expect: {
        function f() {
            function g() {}
            g.b = g.a = function() {};
            return g;
        }
    }
}

collapse_rhs_true: {
    options = {
        collapse_vars: true,
        evaluate: true,
        pure_getters: true,
    }
    input: {
        console.log((42..length = "PASS", "PASS"));
        console.log(("foo".length = "PASS", "PASS"));
        console.log((false.length = "PASS", "PASS"));
        console.log((function() {}.length = "PASS", "PASS"));
        console.log(({
            get length() {
                return "FAIL";
            }
        }.length = "PASS", "PASS"));
    }
    expect: {
        console.log(42..length = "PASS");
        console.log("foo".length = "PASS");
        console.log(false.length = "PASS");
        console.log(function() {}.length = "PASS");
        console.log({
            get length() {
                return "FAIL";
            }
        }.length = "PASS");
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
        "PASS",
        "PASS",
    ]
}

collapse_rhs_false: {
    options = {
        collapse_vars: true,
        evaluate: true,
        pure_getters: false,
    }
    input: {
        console.log((42..length = "PASS", "PASS"));
        console.log(("foo".length = "PASS", "PASS"));
        console.log((false.length = "PASS", "PASS"));
        console.log((function() {}.length = "PASS", "PASS"));
        console.log(({
            get length() {
                return "FAIL";
            }
        }.length = "PASS", "PASS"));
    }
    expect: {
        console.log(42..length = "PASS");
        console.log("foo".length = "PASS");
        console.log(false.length = "PASS");
        console.log(function() {}.length = "PASS");
        console.log({
            get length() {
                return "FAIL";
            }
        }.length = "PASS");
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
        "PASS",
        "PASS",
    ]
}

collapse_rhs_strict: {
    options = {
        collapse_vars: true,
        evaluate: true,
        pure_getters: "strict",
    }
    input: {
        console.log((42..length = "PASS", "PASS"));
        console.log(("foo".length = "PASS", "PASS"));
        console.log((false.length = "PASS", "PASS"));
        console.log((function() {}.length = "PASS", "PASS"));
        console.log(({
            get length() {
                return "FAIL";
            }
        }.length = "PASS", "PASS"));
    }
    expect: {
        console.log(42..length = "PASS");
        console.log("foo".length = "PASS");
        console.log(false.length = "PASS");
        console.log(function() {}.length = "PASS");
        console.log({
            get length() {
                return "FAIL";
            }
        }.length = "PASS");
    }
    expect_stdout: [
        "PASS",
        "PASS",
        "PASS",
        "PASS",
        "PASS",
    ]
}

collapse_rhs_setter: {
    options = {
        collapse_vars: true,
        evaluate: true,
        pure_getters: "strict",
    }
    input: {
        try {
            console.log(({
                set length(v) {
                    throw "PASS";
                }
            }.length = "FAIL", "FAIL"));
        } catch (e) {
            console.log(e);
        }
    }
    expect: {
        try {
            console.log({
                set length(v) {
                    throw "PASS";
                }
            }.length = "FAIL");
        } catch (e) {
            console.log(e);
        }
    }
    expect_stdout: "PASS"
}

collapse_rhs_call: {
    options = {
        collapse_vars: true,
        passes: 2,
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {};
        function f() {
            console.log("PASS");
        }
        o.f = f;
        f();
    }
    expect: {
        ({}.f = function() {
            console.log("PASS");
        })();
    }
    expect_stdout: "PASS"
}

collapse_rhs_lhs: {
    options = {
        collapse_vars: true,
        pure_getters: true,
    }
    input: {
        function f(a, b) {
            a.b = b, b += 2;
            console.log(a.b, b);
        }
        f({}, 1);
    }
    expect: {
        function f(a, b) {
            a.b = b, b += 2;
            console.log(a.b, b);
        }
        f({}, 1);
    }
    expect_stdout: "1 3"
}

drop_arguments: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        (function() {
            arguments.slice = function() {
                console.log("PASS");
            };
            arguments[42];
            arguments.length;
            arguments.slice();
        })();
    }
    expect: {
        (function() {
            arguments.slice = function() {
                console.log("PASS");
            };
            arguments.slice();
        })();
    }
    expect_stdout: "PASS"
}

lvalues_def: {
    options = {
        collapse_vars: true,
        pure_getters: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var a = 0, b = 1;
        var a = b++, b = +function() {}();
        a && a[a++];
        console.log(a, b);
    }
    expect: {
        var a = 0, b = 1;
        a = b++, b = +void 0;
        a && a++;
        console.log(a, b);
    }
    expect_stdout: true
}

side_effects_assign: {
    options = {
        evaluate: true,
        pure_getters: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var a = typeof void (a && a.in == 1, 0);
        console.log(a);
    }
    expect: {
        var a = "undefined";
        console.log(a);
    }
    expect_stdout: "undefined"
}

issue_2062: {
    options = {
        booleans: true,
        collapse_vars: true,
        conditionals: true,
        pure_getters: true,
        side_effects: true,
    }
    input: {
        var a = 1;
        if ([ a || a++ + a--, a++ + a--, a && a.var ]);
        console.log(a);
    }
    expect: {
        var a = 1;
        a || (a++, a--), a++, a--;
        console.log(a);
    }
    expect_stdout: "1"
}

issue_2878: {
    options = {
        collapse_vars: true,
        pure_getters: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        var c = 0;
        (function(a, b) {
            function f2() {
                if (a) c++;
            }
            b = f2();
            a = 1;
            b && b.b;
            f2();
        })();
        console.log(c);
    }
    expect: {
        var c = 0;
        (function(a, b) {
            function f2() {
                if (a) c++;
            }
            b = f2(),
            a = 1,
            f2();
        })(),
        console.log(c);
    }
    expect_stdout: "1"
}

issue_3427: {
    options = {
        assignments: true,
        evaluate: true,
        inline: true,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        (function(b) {
            b.p = 42;
        })(a || (a = {}));
    }
    expect: {}
    expect_stdout: true
}

issue_3490_1: {
    options = {
        conditionals: true,
        dead_code: true,
        inline: true,
        pure_getters: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        var b = 42, c = "FAIL";
        if ({
            3: function() {
                var a;
                return (a && a.p) < this;
            }(),
        }) c = "PASS";
        if (b) while ("" == typeof d);
        console.log(c, b);
    }
    expect: {
        var b = 42, c = "FAIL";
        var a;
        if (c = "PASS", b) while ("" == typeof d);
        console.log(c, b);
    }
    expect_stdout: "PASS 42"
}

issue_4135: {
    options = {
        evaluate: true,
        inline: true,
        merge_vars: true,
        pure_getters: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0, b = 0;
        --b;
        a++;
        if (!a)
            var c = function() {
                var d = 0;
                function f() {
                    d && d.p;
                }
                f();
                this;
            }(a++);
        console.log(a, b, c);
    }
    expect: {
        var a = 0;
        0;
        a++;
        if (!a)
            var c = void a++;
        console.log(a, -1, c);
    }
    expect_stdout: "1 -1 undefined"
}

issue_4440: {
    options = {
        pure_getters: "strict",
        side_effects: true,
        unused: true,
    }
    input: {
        try {
            (function() {
                arguments = null;
                console.log(arguments.p = "FAIL");
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            (function() {
                arguments = null;
                console.log(arguments.p = "FAIL");
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_4730_1: {
    options = {
        pure_getters: true,
        side_effects: true,
    }
    input: {
        var a;
        console.log("PASS") + (a && a[a.p]);
    }
    expect: {
        var a;
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4730_2: {
    options = {
        pure_getters: true,
        side_effects: true,
    }
    input: {
        var a;
        !console.log("PASS") || a && a[a.p];
    }
    expect: {
        var a;
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_4751: {
    options = {
        pure_getters: true,
        side_effects: true,
    }
    input: {
        var o = {
            get p() {
                console.log("PASS");
            },
        };
        o && o.p;
    }
    expect: {
        var o = {
            get p() {
                console.log("PASS");
            },
        };
    }
}

super_toString: {
    options = {
        pure_getters: true,
        unsafe: true,
    }
    input: {
        console.log({
            f() {
                return super.toString();
            },
        }.f());
    }
    expect: {
        console.log({
            f() {
                return super.toString();
            },
        }.f());
    }
    expect_stdout: "[object Object]"
    node_version: ">=4"
}

this_toString: {
    options = {
        pure_getters: true,
        unsafe: true,
    }
    input: {
        console.log({
            f() {
                return this.toString();
            },
        }.f());
    }
    expect: {
        console.log({
            f() {
                return "" + this;
            },
        }.f());
    }
    expect_stdout: "[object Object]"
    node_version: ">=4"
}

issue_4803: {
    options = {
        hoist_vars: true,
        join_vars: true,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            get f() {
                console.log("PASS");
            },
        } || 42;
        for (var k in o)
            o[k];
    }
    expect: {
        var k, o = {
            get f() {
                console.log("PASS");
            },
        } || 42;
        for (k in o)
            o[k];
    }
    expect_stdout: "PASS"
}

nested_property_assignments_1: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var f;
        ((f = function() {
            console.log("FAIL");
        }).p = f).q = console.log("PASS");
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

nested_property_assignments_2: {
    options = {
        pure_getters: "strict",
        unused: true,
    }
    input: {
        var o = {};
        (function() {
            var a;
            (o.p = a = {}).q = "PASS";
        })();
        console.log(o.p.q);
    }
    expect: {
        var o = {};
        (function() {
            (o.p = {}).q = "PASS";
        })();
        console.log(o.p.q);
    }
    expect_stdout: "PASS"
}

nested_property_assignments_3: {
    options = {
        collapse_vars: true,
        pure_getters: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var o = { p: {} };
        (function(a) {
            console && a;
            if (console) {
                a = a.p;
                a.q = a;
            }
        })(o);
        console.log(o.p.q === o.p ? "PASS" : "FAIL");
    }
    expect: {
        var o = { p: {} };
        (function(a) {
            console;
            if (console)
                (a = a.p).q = a;
        })(o);
        console.log(o.p.q === o.p ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

nested_property_assignments_4: {
    options = {
        pure_getters: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var n, o = { p: { q: { r: "PASS" } } };
        (n = o.p).r = n.q.r;
        console.log(o.p.r);
    }
    expect: {
        var n, o = { p: { q: { r: "PASS" } } };
        (n = o.p).r = n.q.r;
        console.log(o.p.r);
    }
    expect_stdout: "PASS"
}

issue_4939: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        ({
            __proto__: {
                get p() {
                    console.log("PASS");
                },
            },
        }).p;
    }
    expect: {
        ({
            __proto__: {
                get p() {
                    console.log("PASS");
                },
            },
        }).p;
    }
    expect_stdout: "PASS"
}
