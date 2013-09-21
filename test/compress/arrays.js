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
        var a = [ "foo", "bar", "baz" ].join();
        var b = [ "foo", 1, 2, 3, "bar" ].join("");
        var c = [ boo(), "foo", 1, 2, 3, "bar", bar() ].join("");
        var d = [ "foo", 1 + 2 + "bar", "baz" ].join("-");
        var e = [ boo ].join(foo + bar);
        var f = [ boo ].join("");
        var g = [ "foo", "boo" + bar, "baz"].join("-");
    }
    expect: {
        var a = "foo,bar,baz";
        var b = "foo123bar";
        var c = boo() + "foo123bar" + bar();
        var d = "foo-3bar-baz";
        var e = [ boo ].join(foo + bar);
        var f = [ boo ].join();
        var g = "foo-" + ("boo" + bar) + "-baz"; // we could still shorten this one, but oh well.
    }
}
