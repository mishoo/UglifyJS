join_vars_assign: {
    options = {
        join_vars: true,
        unused: true,
    }
    input: {
        var y, x;
        x = Object("PAS");
        y = Object("S");
        console.log(x + y);
    }
    expect: {
        var x = Object("PAS"), y = Object("S");
        console.log(x + y);
    }
    expect_stdout: "PASS"
}

join_object_assignments_1: {
    options = {
        evaluate: true,
        join_vars: true,
    }
    input: {
        console.log(function() {
            var x = {
                a: 1,
                c: (console.log("c"), "C"),
            };
            x.b = 2;
            x[3] = function() {
                console.log(x);
            },
            x["a"] = /foo/,
            x.bar = x;
            return x;
        }());
    }
    expect: {
        console.log(function() {
            var x = {
                a: 1,
                c: (console.log("c"), "C"),
                b: 2,
                3: function() {
                    console.log(x);
                },
                a: /foo/,
            };
            x.bar = x;
            return x;
        }());
    }
    expect_stdout: true
}

join_object_assignments_2: {
    options = {
        evaluate: true,
        hoist_props: true,
        join_vars: true,
        passes: 3,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            foo: 1,
        };
        o.bar = 2;
        o.baz = 3;
        console.log(o.foo, o.bar + o.bar, o.foo * o.bar * o.baz);
    }
    expect: {
        console.log(1, 4, 6);
    }
    expect_stdout: "1 4 6"
}

join_object_assignments_3: {
    options = {
        evaluate: true,
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                a: "PASS",
            }, a = o.a;
            o.a = "FAIL";
            return a;
        }());
    }
    expect: {
        console.log(function() {
            var o = {
                a: "PASS",
            }, a = o.a;
            o.a = "FAIL";
            return a;
        }());
    }
    expect_stdout: "PASS"
}

join_object_assignments_4: {
    options = {
        join_vars: true,
        sequences: true,
    }
    input: {
        var o;
        console.log(o);
        o = {};
        o.a = "foo";
        console.log(o.b);
        o.b = "bar";
        console.log(o.a);
    }
    expect: {
        var o;
        console.log(o),
        o = {
            a: "foo",
        },
        console.log(o.b),
        o.b = "bar",
        console.log(o.a);
    }
    expect_stdout: [
        "undefined",
        "undefined",
        "foo",
    ]
}

join_object_assignments_return_1: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                p: 3
            };
            return o.q = "foo";
        }());
    }
    expect: {
        console.log(function() {
            var o = {
                p: 3,
                q: "foo"
            };
            return o.q;
        }());
    }
    expect_stdout: "foo"
}

join_object_assignments_return_2: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                p: 3
            };
            return o.q = /foo/,
            o.r = "bar";
        }());
    }
    expect: {
        console.log(function() {
            var o = {
                p: 3,
                q: /foo/,
                r: "bar"
            };
            return o.r;
        }());
    }
    expect_stdout: "bar"
}

join_object_assignments_return_3: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                p: 3
            };
            return o.q = "foo",
            o.p += "",
            console.log(o.q),
            o.p;
        }());
    }
    expect: {
        console.log(function() {
            var o = {
                p: 3,
                q: "foo"
            };
            return o.p += "",
            console.log(o.q),
            o.p;
        }());
    }
    expect_stdout: [
        "foo",
        "3",
    ]
}

join_object_assignments_for: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                p: 3
            };
            for (o.q = "foo"; console.log(o.q););
            return o.p;
        }());
    }
    expect: {
        console.log(function() {
            for (var o = {
                p: 3,
                q: "foo"
            }; console.log(o.q););
            return o.p;
        }());
    }
    expect_stdout: [
        "foo",
        "3",
    ]
}

join_object_assignments_if: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {};
            if (o.a = "PASS") return o.a;
        }())
    }
    expect: {
        console.log(function() {
            var o = { a: "PASS" };
            if (o.a) return o.a;
        }());
    }
    expect_stdout: "PASS"
}

join_object_assignments_forin: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {};
            for (var a in o.a = "PASS", o)
                return o[a];
        }())
    }
    expect: {
        console.log(function() {
            var o = { a: "PASS" };
            for (var a in o)
                return o[a];
        }());
    }
    expect_stdout: "PASS"
}

join_object_assignments_negative: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[0] = 0;
        o[-0] = 1;
        o[-1] = 2;
        console.log(o[0], o[-0], o[-1]);
    }
    expect: {
        var o = {
            0: 0,
            0: 1,
            "-1": 2
        };
        console.log(o[0], o[-0], o[-1]);
    }
    expect_stdout: "1 1 2"
}

join_object_assignments_NaN_1: {
    options = {
        join_vars: true,
    }
    input: {
        var o = {};
        o[NaN] = 1;
        o[0/0] = 2;
        console.log(o[NaN], o[NaN]);
    }
    expect: {
        var o = {};
        o[NaN] = 1;
        o[0/0] = 2;
        console.log(o[NaN], o[NaN]);
    }
    expect_stdout: "2 2"
}

join_object_assignments_NaN_2: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[NaN] = 1;
        o[0/0] = 2;
        console.log(o[NaN], o[NaN]);
    }
    expect: {
        var o = {
            NaN: 1,
            NaN: 2
        };
        console.log(o.NaN, o.NaN);
    }
    expect_stdout: "2 2"
}

join_object_assignments_null_0: {
    options = {
        join_vars: true,
    }
    input: {
        var o = {};
        o[null] = 1;
        console.log(o[null]);
    }
    expect: {
        var o = {};
        o[null] = 1;
        console.log(o[null]);
    }
    expect_stdout: "1"
}

join_object_assignments_null_1: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[null] = 1;
        console.log(o[null]);
    }
    expect: {
        var o = {
            null: 1
        };
        console.log(o.null);
    }
    expect_stdout: "1"
}

join_object_assignments_void_0: {
    options = {
        evaluate: true,
        join_vars: true,
    }
    input: {
        var o = {};
        o[void 0] = 1;
        console.log(o[void 0]);
    }
    expect: {
        var o = {
            undefined: 1
        };
        console.log(o[void 0]);
    }
    expect_stdout: "1"
}

join_object_assignments_undefined_1: {
    options = {
        join_vars: true,
    }
    input: {
        var o = {};
        o[undefined] = 1;
        console.log(o[undefined]);
    }
    expect: {
        var o = {};
        o[void 0] = 1;
        console.log(o[void 0]);
    }
    expect_stdout: "1"
}

join_object_assignments_undefined_2: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[undefined] = 1;
        console.log(o[undefined]);
    }
    expect: {
        var o = {
            undefined : 1
        };
        console.log(o[void 0]);
    }
    expect_stdout: "1"
}

join_object_assignments_Infinity: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[Infinity] = 1;
        o[1/0] = 2;
        o[-Infinity] = 3;
        o[-1/0] = 4;
        console.log(o[Infinity], o[1/0], o[-Infinity], o[-1/0]);
    }
    expect: {
        var o = {
            Infinity: 1,
            Infinity: 2,
            "-Infinity": 3,
            "-Infinity": 4
        };
        console.log(o[1/0], o[1/0], o[-1/0], o[-1/0]);
    }
    expect_stdout: "2 2 4 4"
}

join_object_assignments_regex: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[/rx/] = 1;
        console.log(o[/rx/]);
    }
    expect: {
        var o = {
            "/rx/": 1
        };
        console.log(o[/rx/]);
    }
    expect_stdout: "1"
}

issue_2816: {
    options = {
        join_vars: true,
    }
    input: {
        "use strict";
        var o = {
            a: 1
        };
        o.b = 2;
        o.a = 3;
        o.c = 4;
        console.log(o.a, o.b, o.c);
    }
    expect: {
        "use strict";
        var o = {
            a: 1,
            b: 2
        };
        o.a = 3;
        o.c = 4;
        console.log(o.a, o.b, o.c);
    }
    expect_stdout: "3 2 4"
}

issue_2893_1: {
    options = {
        join_vars: true,
    }
    input: {
        var o = {
            get a() {
                return "PASS";
            },
        };
        o.a = "FAIL";
        console.log(o.a);
    }
    expect: {
        var o = {
            get a() {
                return "PASS";
            },
        };
        o.a = "FAIL";
        console.log(o.a);
    }
    expect_stdout: "PASS"
}

issue_2893_2: {
    options = {
        join_vars: true,
    }
    input: {
        var o = {
            set a(v) {
                this.b = v;
            },
            b: "FAIL",
        };
        o.a = "PASS";
        console.log(o.b);
    }
    expect: {
        var o = {
            set a(v) {
                this.b = v;
            },
            b: "FAIL",
        };
        o.a = "PASS";
        console.log(o.b);
    }
    expect_stdout: "PASS"
}

join_expr: {
    options = {
        evaluate: true,
        join_vars: true,
    }
    input: {
        var c = "FAIL";
        (function() {
            var a = 0;
            switch ((a = {}) && (a.b = 0)) {
              case 0:
                c = "PASS";
            }
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function() {
            var a = 0, a = { b: 0 };
            switch (a.b) {
              case 0:
                c = "PASS";
            }
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3786: {
    options = {
        join_vars: true,
    }
    input: {
        try {
            var a = b;
            b = 0;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            var a = b;
            b = 0;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_3788: {
    options = {
        inline: true,
        join_vars: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        function f() {
            function g() {
                function h() {
                    a = 42;
                    a = "PASS";
                    return "PASS";
                }
                var b = h();
                console.log(b);
            }
            g();
        }
        f();
        console.log(a);
    }
    expect: {
        var b, a = "FAIL";
        a = 42,
        a = "PASS",
        b = "PASS",
        console.log(b),
        console.log(a);
    }
    expect_stdout: [
        "PASS",
        "PASS",
    ]
}

issue_3789_1: {
    options = {
        join_vars: true,
    }
    input: {
        try {
            c;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
        try {} catch (c) {
            var a;
            c = 0;
        }
    }
    expect: {
        try {
            c;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
        try {} catch (c) {
            var a;
            c = 0;
        }
    }
    expect_stdout: "PASS"
}

issue_3789_2: {
    options = {
        join_vars: true,
    }
    input: {
        try {
            c;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
        try {} catch (c) {
            try {} catch (c) {
                var a;
                c = 0;
            }
        }
    }
    expect: {
        try {
            c;
            console.log("FAIL");
        } catch (e) {
            console.log("PASS");
        }
        try {} catch (c) {
            try {} catch (c) {
                var a;
                c = 0;
            }
        }
    }
    expect_stdout: "PASS"
}

issue_3791_1: {
    options = {
        collapse_vars: true,
        join_vars: true,
        toplevel: true,
    }
    input: {
        var a = "PASS";
        switch (a) {
          case console:
        }
        var a = a;
        console.log(a);
    }
    expect: {
        var a;
        switch (a = "PASS") {
          case console:
        }
        var a = a;
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3791_2: {
    options = {
        collapse_vars: true,
        join_vars: true,
    }
    input: {
        function f(a) {
            var b;
            return b = a || g;
            function g() {
                return b;
            }
        }
        console.log(typeof f()());
    }
    expect: {
        function f(a) {
            var b;
            return b = a || g;
            function g() {
                return b;
            }
        }
        console.log(typeof f()());
    }
    expect_stdout: "function"
}
