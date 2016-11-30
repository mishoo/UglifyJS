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
        var b = [ "foo", 1, 2, 3, "bar" ].join("");
        var c = [ boo(), "foo", 1, 2, 3, "bar", bar() ].join("");
        var c1 = [ boo() + bar() + "boo", "foo", 1, 2, 3, "bar", bar() + "foo" ].join("");
        var c2 = [ 1, 2, null, , undefined, "foo", "bar", baz() ].join();
        var d = [ "foo", 1 + 2 + "bar", "baz" ].join("-");
        var e = [].join(foo + bar);
        var f = [].join("");
        var g = [].join("foo");
    }
    expect: {
        var a = "foobarbaz";
        var a1 = "foo,bar,baz";
        var b = "foo123bar";
        var c = [ boo(), "foo123bar", bar() ].join("");
        var c1 = boo() + bar() + "boofoo123bar" + (bar() + "foo");
        var c2 = ["1,2,,,,foo,bar", baz()].join();
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
        var a = [ "foobar", boo(), "bazxy" ].join("");
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
        unsafe   : true,
        evaluate : true
    };
    input: {
        var a = [ null ].join();
        var b = [ , ].join();
        var c = [ foo ].join();
        var d = [ foo, null, undefined, boo ].join("-");
        var e = [ foo, boo ].join("");
        var f = [ null, "foo", null, foo + "boo" ].join("");
        var g = [ null, "foo", null, foo + "boo" ].join("-");
        var h = [ "foo" + bar, null, baz + "boo" ].join("");
    }
    expect: {
        var a = "";
        var b = "";
        var c = [ foo ].join();
        var d = [ foo, "-", boo].join("-");
        var e = [ foo, boo ].join("");
        var f = "foo" + (foo + "boo");
        var g = "-foo--" + (foo + "boo");
        var h = "foo" + bar + (baz + "boo");
    }
}
