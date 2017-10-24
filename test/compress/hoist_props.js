issue_2377_1: {
    options = {
        evaluate: true,
        inline: true,
        hoist_props: true,
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
        console.log(1, function(x) {
            return x * x * x;
        }(3));
    }
    expect_stdout: "1 27"
}

issue_2377_3: {
    options = {
        evaluate: true,
        inline: true,
        hoist_props: true,
        passes: 3,
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
        console.log(1, 27);
    }
    expect_stdout: "1 27"
}

direct_access_1: {
    options = {
        reduce_vars: true,
        hoist_props: true,
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
        reduce_vars: true,
        hoist_props: true,
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
        reduce_vars: true,
        hoist_props: true,
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
        reduce_vars: true,
        hoist_props: true,
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

name_collision: {
    options = {
        reduce_vars: true,
        hoist_props: true,
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
