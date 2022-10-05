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
            var o = { a: "PASS" }, a;
            for (a in o)
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

chained_assignments: {
    options = {
        join_vars: true,
    }
    input: {
        var a, b = a = {};
        b.p = "PASS";
        console.log(a.p);
    }
    expect: {
        var a, b = a = {
            p: "PASS",
        };
        console.log(a.p);
    }
    expect_stdout: "PASS"
}

folded_assignments_1: {
    options = {
        evaluate: true,
        join_vars: true,
    }
    input: {
        var a = {};
        a[a.PASS = 42] = "PASS";
        console.log(a[42], a.PASS);
    }
    expect: {
        var a = {
            PASS: 42,
            42: "PASS",
        };
        console.log(a[42], a.PASS);
    }
    expect_stdout: "PASS 42"
}

folded_assignments_2: {
    options = {
        evaluate: true,
        join_vars: true,
    }
    input: {
        "use strict";
        var a = {};
        a[42] = "FAIL";
        a[a.PASS = 42] = "PASS";
        console.log(a[42], a.PASS);
    }
    expect: {
        "use strict";
        var a = {
            42: "FAIL",
            PASS: 42,
        };
        a[42] = "PASS";
        console.log(a[42], a.PASS);
    }
    expect_stdout: "PASS 42"
}

inlined_assignments: {
    options = {
        join_vars: true,
        unused: true,
    }
    input: {
        var a;
        (a = {}).p = "PASS";
        console.log(a.p);
    }
    expect: {
        var a = {
            p: "PASS",
        };
        console.log(a.p);
    }
    expect_stdout: "PASS"
}

inline_for: {
    options = {
        inline: true,
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function() {
            for (; console.log("PASS"););
        };
        a();
    }
    expect: {
        for (; console.log("PASS"););
    }
    expect_stdout: "PASS"
}

inline_var: {
    options = {
        inline: true,
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        A = "PASS";
        var a = function() {
            var b = A;
            for (b in console.log(b));
        };
        a();
    }
    expect: {
        A = "PASS";
        var b = A;
        for (b in console.log(b));
    }
    expect_stdout: "PASS"
}

typescript_enum: {
    rename = true
    options = {
        assignments: true,
        collapse_vars: true,
        evaluate: true,
        hoist_props: true,
        inline: true,
        join_vars: true,
        passes: 4,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var Enum;
        (function (Enum) {
            Enum[Enum.PASS = 42] = "PASS";
        })(Enum || (Enum = {}));
        console.log(Enum[42], Enum.PASS);
    }
    expect: {
        console.log("PASS", 42);
    }
    expect_stdout: "PASS 42"
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

issue_3795: {
    options = {
        booleans: true,
        collapse_vars: true,
        dead_code: true,
        evaluate: true,
        join_vars: true,
        keep_fargs: false,
        loops: true,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL";
        function f(b, c) {
            for (var i = 5; c && i; --i) return -1;
            a = "PASS";
        }
        var d = f(a = 42, d);
        console.log(a, d);
    }
    expect: {
        var a = "FAIL", d = function() {
            if (void 0) return -1;
            a = "PASS";
        }(a = 42);
        console.log(a, d);
    }
    expect_stdout: "PASS undefined"
}

if_body: {
    options = {
        join_vars: true,
    }
    input: {
        var a;
        if (x)
            var b;
        else
            var c;
    }
    expect: {
        var a, b, c;
        if (x);
        else;
    }
}

if_switch: {
    options = {
        join_vars: true,
    }
    input: {
        var a;
        if (x) switch (y) {
          case 1:
            var b;
          default:
            var c;
        }
    }
    expect: {
        var a, b, c;
        if (x) switch (y) {
          case 1:
          default:
        }
    }
}

loop_body_1: {
    options = {
        join_vars: true,
    }
    input: {
        var a;
        for (;x;)
            var b;
    }
    expect: {
        for (var a, b; x;);
    }
}

loop_body_2: {
    options = {
        join_vars: true,
    }
    input: {
        for (var a; x;)
            var b;
    }
    expect: {
        for (var a, b; x;);
    }
}

loop_body_3: {
    options = {
        join_vars: true,
    }
    input: {
        var a;
        for (var b; x;)
            var c;
    }
    expect: {
        for (var a, b, c; x;);
    }
}

conditional_assignments_1: {
    options = {
        conditionals: true,
        join_vars: true,
        sequences: true,
    }
    input: {
        function f(b, c, d) {
            var a = b;
            if (c) a = d;
            return a;
        }
        function g(b, c, d) {
            var a = b;
            if (c); else a = d;
            return a;
        }
        console.log(f("FAIL", 1, "PASS"), g("PASS", 1, "FAIL"));
    }
    expect: {
        function f(b, c, d) {
            var a = c ? d : b;
            return a;
        }
        function g(b, c, d) {
            var a = c ? b : d;
            return a;
        }
        console.log(f("FAIL", 1, "PASS"), g("PASS", 1, "FAIL"));
    }
    expect_stdout: "PASS PASS"
}

conditional_assignments_2: {
    options = {
        conditionals: true,
        join_vars: true,
        sequences: true,
    }
    input: {
        function f1(c, d) {
            var a = b;
            if (c) a = d;
            return a;
        }
        function f2(b, d) {
            var a = b;
            if (c) a = d;
            return a;
        }
        function f3(b, c) {
            var a = b;
            if (c) a = d;
            return a;
        }
    }
    expect: {
        function f1(c, d) {
            var a = b;
            return c && (a = d), a;
        }
        function f2(b, d) {
            var a = b;
            return c && (a = d), a;
        }
        function f3(b, c) {
            var a = b;
            return c && (a = d), a;
        }
    }
}

conditional_assignments_3: {
    options = {
        conditionals: true,
        sequences: true,
    }
    input: {
        console.log(function(b) {
            var a = "PASS";
            if (b) a = a;
            return a;
        }(0, 1));
    }
    expect: {
        console.log(function(b) {
            var a = "PASS";
            return b && (a = a), a;
        }(0, 1));
    }
    expect_stdout: "PASS"
}

issue_3856_1: {
    options = {
        booleans: true,
        conditionals: true,
        if_return: true,
        join_vars: true,
        sequences: true,
    }
    input: {
        console.log(function() {
            (function() {
                var a;
                if (!a) {
                    a = 0;
                    for (var b; !console;);
                    return 0;
                }
                if (a) return 1;
            })();
        }());
    }
    expect: {
        console.log(function() {
            (function() {
                var a, b;
                if (a) a;
                else {
                    a = 0;
                    for (; !console;);
                }
            })();
        }());
    }
    expect_stdout: "undefined"
}

issue_3856_2: {
    options = {
        booleans: true,
        conditionals: true,
        if_return: true,
        join_vars: true,
        passes: 2,
        sequences: true,
        side_effects: true,
    }
    input: {
        console.log(function() {
            (function() {
                var a;
                if (!a) {
                    a = 0;
                    for (var b; !console;);
                    return 0;
                }
                if (a) return 1;
            })();
        }());
    }
    expect: {
        console.log(function() {
            (function() {
                var a, b;
                if (!a)
                    for (a = 0; !console;);
            })();
        }());
    }
    expect_stdout: "undefined"
}

issue_3916_1: {
    options = {
        join_vars: true,
    }
    input: {
        var o = {};
        o.p = "PASS";
        o.__proto__ = 42;
        o.q = "FAIL";
        o.__proto__ = {
            p: "FAIL",
            q: "PASS",
        };
        o.__proto__ = "foo";
        console.log(typeof o.__proto__, o.p, delete o.q, o.q);
    }
    expect: {
        var o = {
            p: "PASS",
            __proto__: 42,
        };
        o.q = "FAIL";
        o.__proto__ = {
            p: "FAIL",
            q: "PASS",
        };
        o.__proto__ = "foo";
        console.log(typeof o.__proto__, o.p, delete o.q, o.q);
    }
    expect_stdout: "object PASS true PASS"
}

issue_3916_2: {
    options = {
        join_vars: true,
    }
    input: {
        var log = console.log, o = {};
        o.p = "FAIL 1";
        o.__proto__ = {
            get p() {
                return "FAIL 2";
            },
            set p(u) {
                log("FAIL 3");
            },
            set q(v) {
                log("PASS 1");
            },
            get q() {
                return "PASS 3";
            },
        };
        o.p = "PASS 2";
        o.q = "FAIL 4";
        log(o.p);
        log(o.q);
    }
    expect: {
        var log = console.log, o = {
            p: "FAIL 1",
            __proto__: {
                get p() {
                    return "FAIL 2";
                },
                set p(u) {
                    log("FAIL 3");
                },
                set q(v) {
                    log("PASS 1");
                },
                get q() {
                    return "PASS 3";
                },
            },
        };
        o.p = "PASS 2";
        o.q = "FAIL 4";
        log(o.p);
        log(o.q);
    }
    expect_stdout: [
        "PASS 1",
        "PASS 2",
        "PASS 3",
    ]
}

assign_var: {
    options = {
        join_vars: true,
    }
    input: {
        b = "foo";
        var a = [ , "bar" ];
        console.log(b);
        for (var b in a)
            console.log(b, a[b]);
    }
    expect: {
        var b = "foo", a = [ , "bar" ], b;
        console.log(b);
        for (b in a)
            console.log(b, a[b]);
    }
    expect_stdout: [
        "foo",
        "1 bar",
    ]
}

assign_for_var: {
    options = {
        join_vars: true,
    }
    input: {
        i = "foo",
        a = new Array(i, "bar");
        for (var i = 2; --i >= 0;) {
            console.log(a[i]);
            for (var a in i);
        }
    }
    expect: {
        for (var i = "foo", a = new Array(i, "bar"), i = 2; --i >= 0;) {
            console.log(a[i]);
            for (var a in i);
        }
    }
    expect_stdout: [
        "bar",
        "foo",
    ]
}

assign_sequence_var: {
    options = {
        join_vars: true,
    }
    input: {
        var a = 0, b = 1;
        console.log(a),
        a++,
        b = 2;
        var c = 3;
        console.log(a, b, c);
    }
    expect: {
        var a = 0, b = 1, c = (console.log(a), a++, b = 2, 3);
        console.log(a, b, c);
    }
    expect_stdout: [
        "0",
        "1 2 3",
    ]
}

issue_5175: {
    options = {
        join_vars: true,
    }
    input: {
        function log(f) {
            console.log(f(), A.p);
        }
        log(function() {
            return (A = {}).p = "PASS";
        });
    }
    expect: {
        function log(f) {
            console.log(f(), A.p);
        }
        log(function() {
            return (A = {}).p = "PASS";
        });
    }
    expect_stdout: "PASS PASS"
}
