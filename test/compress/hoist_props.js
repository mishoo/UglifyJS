issue_2377_1: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var obj = {
            foo: 1,
            bar: 2,
            square: function(x) {
                return x * x;
            },
            cube: function(x) {
                return x * x * x;
            },
        };
        console.log(obj.foo, obj.cube(3));
    }
    expect: {
        var obj_foo = 1, obj_cube = function(x) {
            return x * x * x;
        };
        console.log(obj_foo, obj_cube(3));
    }
    expect_stdout: "1 27"
}

issue_2377_2: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var obj = {
            foo: 1,
            bar: 2,
            square: function(x) {
                return x * x;
            },
            cube: function(x) {
                return x * x * x;
            },
        };
        console.log(obj.foo, obj.cube(3));
    }
    expect: {
        console.log(1, (x = 3, x * x * x));
        var x;
    }
    expect_stdout: "1 27"
}

issue_2377_3: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        passes: 4,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var obj = {
            foo: 1,
            bar: 2,
            square: function(x) {
                return x * x;
            },
            cube: function(x) {
                return x * x * x;
            },
        };
        console.log(obj.foo, obj.cube(3));
    }
    expect: {
        console.log(1, 27);
    }
    expect_stdout: "1 27"
}

direct_access_1: {
    options = {
        hoist_props: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        var obj = {
            a: 1,
            b: 2,
        };
        for (var k in obj) a++;
        console.log(a, obj.a);
    }
    expect: {
        var a = 0;
        var obj = {
            a: 1,
            b: 2,
        };
        for (var k in obj) a++;
        console.log(a, obj.a);
    }
    expect_stdout: "2 1"
}

direct_access_2: {
    options = {
        hoist_props: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = { a: 1 };
        var f = function(k) {
            if (o[k]) return "PASS";
        };
        console.log(f("a"));
    }
    expect: {
        var o = { a: 1 };
        console.log(function(k) {
            if (o[k]) return "PASS";
        }("a"));
    }
    expect_stdout: "PASS"
}

direct_access_3: {
    options = {
        hoist_props: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = { a: 1 };
        o.b;
        console.log(o.a);
    }
    expect: {
        var o = { a: 1 };
        o.b;
        console.log(o.a);
    }
    expect_stdout: "1"
}

single_use: {
    options = {
        hoist_props: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var obj = {
            bar: function() {
                return 42;
            },
        };
        console.log(obj.bar());
    }
    expect: {
        console.log({
            bar: function() {
                return 42;
            },
        }.bar());
    }
}

name_collision_1: {
    options = {
        hoist_props: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var obj_foo = 1;
        var obj_bar = 2;
        function f() {
            var obj = {
                foo: 3,
                bar: 4,
                "b-r": 5,
                "b+r": 6,
                "b!r": 7,
            };
            console.log(obj_foo, obj.foo, obj.bar, obj["b-r"], obj["b+r"], obj["b!r"]);
        }
        f();
    }
    expect: {
        var obj_foo = 1;
        var obj_bar = 2;
        function f() {
            var obj_foo$0 = 3,
                obj_bar = 4,
                obj_b_r = 5,
                obj_b_r$0 = 6,
                obj_b_r$1 = 7;
            console.log(obj_foo, obj_foo$0, obj_bar, obj_b_r, obj_b_r$0, obj_b_r$1);
        }
        f();
    }
    expect_stdout: "1 3 4 5 6 7"
}

name_collision_2: {
    options = {
        hoist_props: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var o = {
            p: 1,
            "+": function(x) {
                return x;
            },
            "-": function(x) {
                return x + 1;
            }
        }, o__$0 = 2, o__$1 = 3;
        console.log(o.p === o.p, o["+"](4), o["-"](5), o__$0, o__$1);
    }
    expect: {
        var o_p = 1,
            o__ = function(x) {
                return x;
            },
            o__$2 = function(x) {
                return x + 1;
            },
            o__$0 = 2,
            o__$1 = 3;
        console.log(o_p === o_p, o__(4), o__$2(5), o__$0, o__$1);
    }
    expect_stdout: "true 4 6 2 3"
}

name_collision_3: {
    options = {
        hoist_props: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var o = {
            p: 1,
            "+": function(x) {
                return x;
            },
            "-": function(x) {
                return x + 1;
            }
        }, o__$0 = 2, o__$1 = 3;
        console.log(o.p === o.p, o["+"](4), o["-"](5));
    }
    expect: {
        var o_p = 1,
            o__ = function(x) {
                return x;
            },
            o__$2 = function(x) {
                return x + 1;
            },
            o__$0 = 2,
            o__$1 = 3;
        console.log(o_p === o_p, o__(4), o__$2(5));
    }
    expect_stdout: "true 4 6"
}

contains_this_1: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            u: function() {
                return this === this;
            },
            p: 1
        };
        console.log(o.p, o.p);
    }
    expect: {
        console.log(1, 1);
    }
    expect_stdout: "1 1"
}

contains_this_2: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            u: function() {
                return this === this;
            },
            p: 1
        };
        console.log(o.p, o.p, o.u);
    }
    expect: {
        console.log(1, 1, function() {
            return this === this;
        });
    }
    expect_stdout: true
}

contains_this_3: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            u: function() {
                return this === this;
            },
            p: 1
        };
        console.log(o.p, o.p, o.u());
    }
    expect: {
        var o = {
            u: function() {
                return this === this;
            },
            p: 1
        };
        console.log(o.p, o.p, o.u());
    }
    expect_stdout: "1 1 true"
}

new_this: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
            f: function(a) {
                this.b = a;
            }
        };
        console.log(new o.f(o.a).b, o.b);
    }
    expect: {
        console.log(new function(a) {
            this.b = a;
        }(1).b, 2);
    }
    expect_stdout: "1 2"
}

issue_2473_1: {
    options = {
        hoist_props: false,
        reduce_vars: true,
        top_retain: [
            "x",
            "y"
        ],
        toplevel: true,
        unused: true,
    }
    input: {
        var x = {};
        var y = [];
        var z = {};
    }
    expect: {
        var x = {};
        var y = [];
    }
}

issue_2473_2: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        top_retain: [
            "x",
            "y"
        ],
        toplevel: true,
        unused: true,
    }
    input: {
        var x = {};
        var y = [];
        var z = {};
    }
    expect: {
        var x = {};
        var y = [];
    }
}

issue_2473_3: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        top_retain: "o",
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(o.a, o.b);
    }
    expect: {
        var o = {
            a: 1,
            b: 2,
        };
        console.log(o.a, o.b);
    }
    expect_stdout: "1 2"
}

issue_2473_4: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        top_retain: "o",
        toplevel: true,
        unused: true,
    }
    input: {
        (function() {
            var o = {
                a: 1,
                b: 2,
            };
            console.log(o.a, o.b);
        })();
    }
    expect: {
        (function() {
            var o_a = 1, o_b = 2;
            console.log(o_a, o_b);
        })();
    }
    expect_stdout: "1 2"
}

issue_2508_1: {
    options = {
        collapse_vars: true,
        hoist_props: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: [ 1 ],
            f: function(x) {
                console.log(x);
            }
        };
        o.f(o.a);
    }
    expect: {
        (function(x) {
            console.log(x);
        })([ 1 ]);
    }
    expect_stdout: true
}

issue_2508_2: {
    options = {
        collapse_vars: true,
        hoist_props: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: { b: 2 },
            f: function(x) {
                console.log(x);
            }
        };
        o.f(o.a);
    }
    expect: {
        (function(x) {
            console.log(x);
        })({ b: 2 });
    }
    expect_stdout: true
}

issue_2508_3: {
    options = {
        collapse_vars: true,
        hoist_props: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: [ o ],
            f: function(x) {
                console.log(x);
            }
        };
        o.f(o.a);
    }
    expect: {
        var o = {
            a: [ o ],
            f: function(x) {
                console.log(x);
            }
        };
        o.f(o.a);
    }
    expect_stdout: true
}

issue_2508_4: {
    options = {
        collapse_vars: true,
        hoist_props: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            a: { b: o },
            f: function(x) {
                console.log(x);
            }
        };
        o.f(o.a);
    }
    expect: {
        var o = {
            a: { b: o },
            f: function(x) {
                console.log(x);
            }
        };
        o.f(o.a);
    }
    expect_stdout: true
}

issue_2508_5: {
    options = {
        collapse_vars: true,
        hoist_props: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            f: function(x) {
                console.log(x);
            }
        };
        o.f(o.f);
    }
    expect: {
        var o_f = function(x) {
            console.log(x);
        };
        o_f(o_f);
    }
    expect_stdout: true
}

issue_2519: {
    options = {
        collapse_vars: true,
        evaluate: true,
        hoist_props: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function testFunc() {
            var dimensions = {
                minX: 5,
                maxX: 6,
            };
            var scale = 1;
            var d = {
                x: (dimensions.maxX + dimensions.minX) / 2,
            };
            return d.x * scale;
        }
        console.log(testFunc());
    }
    expect: {
        function testFunc() {
            return 1 * ((6 + 5) / 2);
        }
        console.log(testFunc());
    }
    expect_stdout: "5.5"
}

undefined_key: {
    options = {
        evaluate: true,
        hoist_props: true,
        join_vars: true,
        passes: 4,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a, o = {};
        o[a] = 1;
        o.b = 2;
        console.log(o[a] + o.b);
    }
    expect: {
        console.log(3);
    }
    expect_stdout: "3"
}

issue_3021: {
    options = {
        hoist_props: true,
        reduce_vars: true,
    }
    input: {
        var a = 1, b = 2;
        (function() {
            b = a;
            if (a++ + b--)
                return 1;
            return;
            var b = {};
        })();
        console.log(a, b);
    }
    expect: {
        var a = 1, b = 2;
        (function() {
            b = a;
            if (a++ + b--)
                return 1;
            return;
            var b = {};
        })();
        console.log(a, b);
    }
    expect_stdout: "2 2"
}

issue_3046: {
    options = {
        hoist_props: true,
        reduce_vars: true,
    }
    input: {
        console.log(function(a) {
            do {
                var b = {
                    c: a++
                };
            } while (b.c && a);
            return a;
        }(0));
    }
    expect: {
        console.log(function(a) {
            do {
                var b_c = a++;
            } while (b_c && a);
            return a;
        }(0));
    }
    expect_stdout: "1"
}

issue_3071_1: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        join_vars: true,
        passes: 3,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        (function() {
            var obj = {};
            obj.one = 1;
            obj.two = 2;
            console.log(obj.one);
        })();
    }
    expect: {
        console.log(1);
    }
    expect_stdout: "1"
}

issue_3071_2: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        join_vars: true,
        passes: 3,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (function() {
            obj = {};
            obj.one = 1;
            obj.two = 2;
            console.log(obj.one);
            var obj;
        })();
    }
    expect: {
        console.log(1);
    }
    expect_stdout: "1"
}

issue_3071_2_toplevel: {
    options = {
        evaluate: true,
        hoist_props: true,
        inline: true,
        join_vars: true,
        passes: 3,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        (function() {
            obj = {};
            obj.one = 1;
            obj.two = 2;
            console.log(obj.one);
            var obj;
        })();
    }
    expect: {
        console.log(1);
    }
    expect_stdout: "1"
}

issue_3071_3: {
    options = {
        hoist_props: true,
        reduce_vars: true,
    }
    input: {
        var c = 0;
        (function(a, b) {
            (function f(o) {
                var n = 2;
                while (--b + (o = {
                    p: c++,
                }) && --n > 0);
            })();
        })();
        console.log(c);
    }
    expect: {
        var c = 0;
        (function(a, b) {
            (function f(o) {
                var n = 2;
                while (--b + (o = {
                    p: c++,
                }) && --n > 0);
            })();
        })();
        console.log(c);
    }
    expect_stdout: "2"
}

issue_3411: {
    options = {
        hoist_props: true,
        reduce_vars: true,
    }
    input: {
        var c = 1;
        !function f() {
            var o = {
                p: --c && f()
            };
            +o || console.log("PASS");
        }();
    }
    expect: {
        var c = 1;
        !function f() {
            var o_p = --c && f();
            +{} || console.log("PASS");
        }();
    }
    expect_stdout: "PASS"
}

issue_3440: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            function f() {
                console.log(o.p);
            }
            var o = {
                p: "PASS",
            };
            return f;
        })()();
    }
    expect: {
        (function() {
            var o_p = "PASS";
            return function() {
                console.log(o_p);
            };
        })()();
    }
    expect_stdout: "PASS"
}
