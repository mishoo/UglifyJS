// NOTE trailing comma doesn't contribute to length of an array
// That also means the array changes length if previous element is a hole too and got cut off
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
        var c1 = [ boo(), bar(), "foo", 1, 2, 3, "bar", bar() ].join("");
        var c2 = [ 1, 2, "foo", "bar", baz() ].join("");
        var d = [ "foo", 1 + 2 + "bar", "baz" ].join("-");
        var e = [].join(foo + bar);
        var f = [].join("");
        var g = [].join("foo");
    }
    expect: {
        var a = "foobarbaz";
        var a1 = "foo,bar,baz";
        var b = "foo123bar";
        var c = boo() + "foo123bar" + bar();
        var c1 = "" + boo() + bar() + "foo123bar" + bar();
        var c2 = "12foobar" + baz();
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

spread_with_variable_as_last_element: {
    input: {
        var values = [4, 5, 6];
        var a = [1, 2, 3, ...values];
    }
    expect: {
        var values = [4, 5, 6];
        var a = [1, 2, 3, ...values];
    }
}

spread_with_variable_in_middle: {
    input: {
        var values = [4, 5, 6];
        var a = [1, 2, 3, ...values, 7,,,];
    }
    expect: {
        var values = [4, 5, 6];
        var a = [1, 2, 3, ...values, 7,,,];
    }
}

spread_with_variable_at_front: {
    input: {
        var values = [1, 2, 3];
        var a = [...values, 4, 5, 6];
    }
    expect: {
        var values = [1, 2, 3];
        var a = [...values, 4, 5, 6];
    }
}

spread_with_variable_at_front_after_elisions: {
    input: {
        var values = [1, 2, 3];
        var a = [,,,...values, 4, 5, 6];
    }
    expect: {
        var values = [1, 2, 3];
        var a = [,,,...values, 4, 5, 6];
    }
}

spread_with_array_at_end: {
    input: {
        var a = [1, 2, ...[4, 5, 6]];
    }
    expect: {
        var a = [1, 2, ...[4, 5, 6]];
    }
}

spread_with_logical_expression_at_end: {
    options = { evaluate: true }
    input: {
        var a = [1, 2, 3, ...[2+2]]
    }
    expect: {
        var a = [1, 2, 3, ...[4]]
    }
}

spread_with_logical_expression_at_middle: {
    options = { evaluate: true }
    input: {
        var a = [1, 1, ...[1+1, 1+2, 2+3], 8]
    }
    expect: {
        var a = [1, 1, ...[2, 3, 5], 8]
    }
}