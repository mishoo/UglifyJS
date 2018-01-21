issue_2377_1: {
    options = {
        evaluate: true,
        inline: true,
        hoist_props: true,
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
        inline: true,
        hoist_props: true,
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
        inline: true,
        hoist_props: true,
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
            0: function(x) {
                return x;
            },
            1: function(x) {
                return x + 1;
            }
        }, o__$0 = 2, o__$1 = 3;
        console.log(o.p === o.p, o[0](4), o[1](5), o__$0, o__$1);
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
            0: function(x) {
                return x;
            },
            1: function(x) {
                return x + 1;
            }
        }, o__$0 = 2, o__$1 = 3;
        console.log(o.p === o.p, o[0](4), o[1](5));
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

hoist_class: {
    options = {
        comparisons: true,
        evaluate: true,
        hoist_props: true,
        inline: true,
        keep_classnames: true,
        keep_fnames: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function run(c, v) {
            return new c(v).value;
        }
        var o = {
            p: class Foo {
                constructor(value) {
                    this.value = value * 10;
                }
            },
            x: 1,
            y: 2,
        };
        console.log(o.p.name, o.p === o.p, run(o.p, o.x), run(o.p, o.y));
    }
    expect: {
        function run(c, v) {
            return new c(v).value;
        }
        var o_p = class Foo {
            constructor(value) {
                this.value = 10 * value;
            }
        };
        console.log(o_p.name, true, run(o_p, 1), run(o_p, 2));
    }
    node_version: ">=6"
    expect_stdout: "Foo true 10 20"
}

hoist_class_with_new: {
    options = {
        comparisons: true,
        evaluate: true,
        hoist_props: true,
        inline: true,
        keep_classnames: true,
        keep_fnames: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            p: class Foo {
                constructor(value) {
                    this.value = value * 10;
                }
            },
            x: 1,
            y: 2,
        };
        console.log(o.p.name, o.p === o.p, new o.p(o.x).value, new o.p(o.y).value);
    }
    expect: {
        var o_p = class Foo {
            constructor(value) {
                this.value = 10 * value;
            }
        };
        console.log(o_p.name, true, new o_p(1).value, new o_p(2).value);
    }
    node_version: ">=6"
    expect_stdout: "Foo true 10 20"
}

hoist_function_with_call: {
    options = {
        comparisons: true,
        evaluate: true,
        hoist_props: true,
        inline: true,
        keep_fnames: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            p: function Foo(value) {
                return 10 * value;
            },
            x: 1,
            y: 2
        };
        console.log(o.p.name, o.p === o.p, o.p(o.x), o.p(o.y));
    }
    expect: {
        var o = {
            p: function Foo(value) {
                return 10 * value;
            },
            x: 1,
            y: 2
        };
        console.log(o.p.name, o.p == o.p, o.p(o.x), o.p(o.y));
    }
    expect_stdout: "Foo true 10 20"
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

issue_2462: {
    options = {
        hoist_props: true,
        reduce_funcs: true,
        reduce_vars: true,
    }
    input: {
        export const Foo = {
            a: 1,
            b: () => 2
        };
    }
    expect: {
        export const Foo = {
            a: 1,
            b: () => 2
        };
    }
}

issue_2473_1: {
    options = {
        hoist_props: false,
        reduce_vars: true,
        top_retain: [ "x", "y" ],
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
        top_retain: [ "x", "y" ],
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

issue_2508_6: {
    options = {
        collapse_vars: true,
        hoist_props: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            f: x => {
                console.log(x);
            }
        };
        o.f(o.f);
    }
    expect: {
        var o_f = x => {
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

toplevel_const: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        toplevel: false,
    }
    input: {
        const a = {
            b: 1,
            c: 2
        };
        console.log(a.b + a.c);
    }
    expect: {
        const a = {
            b: 1,
            c: 2
        };
        console.log(a.b + a.c);
    }
    expect_stdout: "3"
}

toplevel_let: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        toplevel: false,
    }
    input: {
        let a = {
            b: 1,
            c: 2
        };
        console.log(a.b + a.c);
    }
    expect: {
        let a = {
            b: 1,
            c: 2
        };
        console.log(a.b + a.c);
    }
    expect_stdout: "3"
    node_version: ">=6"
}

toplevel_var: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        toplevel: false,
    }
    input: {
        var a = {
            b: 1,
            c: 2
        };
        console.log(a.b + a.c);
    }
    expect: {
        var a = {
            b: 1,
            c: 2
        };
        console.log(a.b + a.c);
    }
    expect_stdout: "3"
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
