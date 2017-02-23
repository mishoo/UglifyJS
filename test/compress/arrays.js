holes_and_undefined: {
    input: {
        w = [1,,];
        x = [1, 2, undefined];
        y = [1, , 2, ];
        z = [1, undefined, 3];
    }
    expect: {
        w=[1,,];
        x=[1,2,void 0];
        y=[1,,2];
        z=[1,void 0,3];
    }
}

constant_join: {
    options = {
        unsafe   : true,
        evaluate : true
    };
    input: {
        var a = [ "foo", "bar", "baz" ].join("");
        var a1 = [ "foo", "bar", "baz" ].join();
        var a2 = [ "foo", "bar", "baz" ].join(null);
        var a3 = [ "foo", "bar", "baz" ].join(void 0);
        var a4 = [ "foo", , "baz" ].join();
        var a5 = [ "foo", null, "baz" ].join();
        var a6 = [ "foo", void 0, "baz" ].join();
        var b = [ "foo", 1, 2, 3, "bar" ].join("");
        var c = [ boo(), "foo", 1, 2, 3, "bar", bar() ].join("");
        var c1 = [ boo(), bar(), "foo", 1, 2, 3, "bar", bar() ].join("");
        var c2 = [ 1, 2, "foo", "bar", baz() ].join("");
        var c3 = [ boo() + bar() + "foo", 1, 2, 3, "bar", bar() + "foo" ].join("");
        var c4 = [ 1, 2, null, undefined, "foo", "bar", baz() ].join("");
        var c5 = [ boo() + bar() + "foo", 1, 2, 3, "bar", bar() + "foo" ].join();
        var c6 = [ 1, 2, null, undefined, "foo", "bar", baz() ].join();
        var d = [ "foo", 1 + 2 + "bar", "baz" ].join("-");
        var e = [].join(foo + bar);
        var f = [].join("");
        var g = [].join("foo");
    }
    expect: {
        var a = "foobarbaz";
        var a1 = "foo,bar,baz";
        var a2 = "foonullbarnullbaz";
        var a3 = "foo,bar,baz";
        var a4 = "foo,,baz";
        var a5 = "foo,,baz";
        var a6 = "foo,,baz";
        var b = "foo123bar";
        var c = boo() + "foo123bar" + bar();
        var c1 = "" + boo() + bar() + "foo123bar" + bar();
        var c2 = "12foobar" + baz();
        var c3 = boo() + bar() + "foo123bar" + bar() + "foo";
        var c4 = "12foobar" + baz();
        var c5 = [ boo() + bar() + "foo", 1, 2, 3, "bar", bar() + "foo" ].join();
        var c6 = [ "1,2,,,foo,bar", baz() ].join();
        var d = "foo-3bar-baz";
        var e = [].join(foo + bar);
        var f = "";
        var g = "";
    }
}

constant_join_2: {
    options = {
        unsafe   : true,
        evaluate : true
    };
    input: {
        var a = [ "foo", "bar", boo(), "baz", "x", "y" ].join("");
        var b = [ "foo", "bar", boo(), "baz", "x", "y" ].join("-");
        var c = [ "foo", "bar", boo(), "baz", "x", "y" ].join("really-long-separator");
        var d = [ "foo", "bar", boo(),
                  [ "foo", 1, 2, 3, "bar" ].join("+"),
                  "baz", "x", "y" ].join("-");
        var e = [ "foo", "bar", boo(),
                  [ "foo", 1, 2, 3, "bar" ].join("+"),
                  "baz", "x", "y" ].join("really-long-separator");
        var f = [ "str", "str" + variable, "foo", "bar", "moo" + foo ].join("");
    }
    expect: {
        var a = "foobar" + boo() + "bazxy";
        var b = [ "foo-bar", boo(), "baz-x-y" ].join("-");
        var c = [ "foo", "bar", boo(), "baz", "x", "y" ].join("really-long-separator");
        var d = [ "foo-bar", boo(), "foo+1+2+3+bar-baz-x-y" ].join("-");
        var e = [ "foo", "bar", boo(),
                  "foo+1+2+3+bar",
                  "baz", "x", "y" ].join("really-long-separator");
        var f = "strstr" + variable + "foobarmoo" + foo;
    }
}

constant_join_3: {
    options = {
        unsafe: true,
        evaluate: true,
    };
    input: {
        var a = [ null ].join();
        var b = [ , ].join();
        var c = [ , 1, , 3 ].join();
        var d = [ foo ].join();
        var e = [ foo, null, undefined, bar ].join("-");
        var f = [ foo, bar ].join("");
        var g = [ null, "foo", null, bar + "baz" ].join("");
        var h = [ null, "foo", null, bar + "baz" ].join("-");
        var i = [ "foo" + bar, null, baz + "moo" ].join("");
        var j = [ foo + "bar", baz ].join("");
        var k = [ foo, "bar" + baz ].join("");
        var l = [ foo, bar + "baz" ].join("");
    }
    expect: {
        var a = "";
        var b = "";
        var c = ",1,,3";
        var d = "" + foo;
        var e = [ foo, "-", bar ].join("-");
        var f = "" + foo + bar;
        var g = "foo" + bar + "baz";
        var h = [ "-foo-", bar + "baz" ].join("-");
        var i = "foo" + bar + baz + "moo";
        var j = foo + "bar" + baz;
        var k = foo + "bar" + baz;
        var l = foo + (bar + "baz");
    }
}

for_loop: {
    options = {
        unsafe      : true,
        unused      : true,
        evaluate    : true,
        reduce_vars : true
    };
    input: {
        function f0() {
            var a = [1, 2, 3];
            for (var i = 0; i < a.length; i++) {
                console.log(a[i]);
            }
        }

        function f1() {
            var a = [1, 2, 3];
            for (var i = 0, len = a.length; i < len; i++) {
                console.log(a[i]);
            }
        }

        function f2() {
            var a = [1, 2, 3];
            for (var i = 0; i < a.length; i++) {
                a[i]++;
            }
        }
    }
    expect: {
        function f0() {
            var a = [1, 2, 3];
            for (var i = 0; i < 3; i++)
                console.log(a[i]);
        }

        function f1() {
            var a = [1, 2, 3];
            for (var i = 0; i < 3; i++)
                console.log(a[i]);
        }

        function f2() {
            var a = [1, 2, 3];
            for (var i = 0; i < a.length; i++)
                a[i]++;
        }
    }
}
