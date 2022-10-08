concat_1: {
    options = {
        evaluate: true,
    }
    input: {
        var a = "foo" + "bar" + x() + "moo" + "foo" + y() + "x" + "y" + "z" + q();
        var b = "foo" + 1 + x() + 2 + "boo";
        var c = 1 + x() + 2 + "boo";

        // this CAN'T safely be shortened to 1 + x() + "5boo"
        var d = 1 + x() + 2 + 3 + "boo";

        var e = 1 + x() + 2 + "X" + 3 + "boo";

        // be careful with concatenation with "\0" with octal-looking strings.
        var f = "\0" + 360 + "\0" + 8 + "\0";
    }
    expect: {
        var a = "foobar" + x() + "moofoo" + y() + "xyz" + q();
        var b = "foo1" + x() + "2boo";
        var c = 1 + x() + 2 + "boo";
        var d = 1 + x() + 2 + 3 + "boo";
        var e = 1 + x() + 2 + "X3boo";
        var f = "\x00360\x008\0";
    }
}

concat_2: {
    options = {
        strings: true,
    }
    input: {
        console.log(
            1 + (2 + 3),
            1 + (2 + "3"),
            1 + ("2" + 3),
            1 + ("2" + "3"),
            "1" + (2 + 3),
            "1" + (2 + "3"),
            "1" + ("2" + 3),
            "1" + ("2" + "3")
        );
    }
    expect: {
        console.log(
            1 + (2 + 3),
            1 + (2 + "3"),
            1 + "2" + 3,
            1 + "2" + "3",
            "1" + (2 + 3),
            "1" + 2 + "3",
            "1" + "2" + 3,
            "1" + "2" + "3"
        );
    }
    expect_stdout: true
}

concat_3: {
    options = {
        strings: true,
    }
    input: {
        console.log(
            1 + 2 + (3 + 4 + 5),
            1 + 2 + (3 + 4 + "5"),
            1 + 2 + (3 + "4" + 5),
            1 + 2 + (3 + "4" + "5"),
            1 + 2 + ("3" + 4 + 5),
            1 + 2 + ("3" + 4 + "5"),
            1 + 2 + ("3" + "4" + 5),
            1 + 2 + ("3" + "4" + "5")
        );
    }
    expect: {
        console.log(
            1 + 2 + (3 + 4 + 5),
            1 + 2 + (3 + 4 + "5"),
            1 + 2 + (3 + "4") + 5,
            1 + 2 + (3 + "4") + "5",
            1 + 2 + "3" + 4 + 5,
            1 + 2 + "3" + 4 + "5",
            1 + 2 + "3" + "4" + 5,
            1 + 2 + "3" + "4" + "5"
        );
    }
    expect_stdout: true
}

concat_4: {
    options = {
        strings: true,
    }
    input: {
        console.log(
            1 + "2" + (3 + 4 + 5),
            1 + "2" + (3 + 4 + "5"),
            1 + "2" + (3 + "4" + 5),
            1 + "2" + (3 + "4" + "5"),
            1 + "2" + ("3" + 4 + 5),
            1 + "2" + ("3" + 4 + "5"),
            1 + "2" + ("3" + "4" + 5),
            1 + "2" + ("3" + "4" + "5")
        );
    }
    expect: {
        console.log(
            1 + "2" + (3 + 4 + 5),
            1 + "2" + (3 + 4) + "5",
            1 + "2" + 3 + "4" + 5,
            1 + "2" + 3 + "4" + "5",
            1 + "2" + "3" + 4 + 5,
            1 + "2" + "3" + 4 + "5",
            1 + "2" + "3" + "4" + 5,
            1 + "2" + "3" + "4" + "5"
        );
    }
    expect_stdout: true
}

concat_5: {
    options = {
        strings: true,
    }
    input: {
        console.log(
            "1" + 2 + (3 + 4 + 5),
            "1" + 2 + (3 + 4 + "5"),
            "1" + 2 + (3 + "4" + 5),
            "1" + 2 + (3 + "4" + "5"),
            "1" + 2 + ("3" + 4 + 5),
            "1" + 2 + ("3" + 4 + "5"),
            "1" + 2 + ("3" + "4" + 5),
            "1" + 2 + ("3" + "4" + "5")
        );
    }
    expect: {
        console.log(
            "1" + 2 + (3 + 4 + 5),
            "1" + 2 + (3 + 4) + "5",
            "1" + 2 + 3 + "4" + 5,
            "1" + 2 + 3 + "4" + "5",
            "1" + 2 + "3" + 4 + 5,
            "1" + 2 + "3" + 4 + "5",
            "1" + 2 + "3" + "4" + 5,
            "1" + 2 + "3" + "4" + "5"
        );
    }
    expect_stdout: true
}

concat_6: {
    options = {
        strings: true,
    }
    input: {
        console.log(
            "1" + "2" + (3 + 4 + 5),
            "1" + "2" + (3 + 4 + "5"),
            "1" + "2" + (3 + "4" + 5),
            "1" + "2" + (3 + "4" + "5"),
            "1" + "2" + ("3" + 4 + 5),
            "1" + "2" + ("3" + 4 + "5"),
            "1" + "2" + ("3" + "4" + 5),
            "1" + "2" + ("3" + "4" + "5")
        );
    }
    expect: {
        console.log(
            "1" + "2" + (3 + 4 + 5),
            "1" + "2" + (3 + 4) + "5",
            "1" + "2" + 3 + "4" + 5,
            "1" + "2" + 3 + "4" + "5",
            "1" + "2" + "3" + 4 + 5,
            "1" + "2" + "3" + 4 + "5",
            "1" + "2" + "3" + "4" + 5,
            "1" + "2" + "3" + "4" + "5"
        );
    }
    expect_stdout: true
}

concat_7: {
    options = {
        strings: true,
    }
    input: {
        console.log(
            "" + 1,
            "" + "1",
            "" + 1 + 2,
            "" + 1 + "2",
            "" + "1" + 2,
            "" + "1" + "2",
            "" + (x += "foo")
        );
    }
    expect: {
        console.log(
            "" + 1,
            "1",
            "" + 1 + 2,
            1 + "2",
            "1" + 2,
            "1" + "2",
            x += "foo"
        );
    }
    expect_stdout: true
}

concat_8: {
    options = {
        strings: true,
    }
    input: {
        console.log(
            1 + "",
            "1" + "",
            1 + 2 + "",
            1 + "2" + "",
            "1" + 2 + "",
            "1" + "2" + "",
            (x += "foo") + ""
        );
    }
    expect: {
        console.log(
            1 + "",
            "1",
            1 + 2 + "",
            1 + "2",
            "1" + 2,
            "1" + "2",
            x += "foo"
        );
    }
    expect_stdout: true
}

concat_9: {
    options = {
        booleans: true,
        evaluate: true,
        reduce_vars: true,
        strings: true,
        toplevel: true,
    }
    input: {
        var a = "foo";
        console.log(
            12 + (34 + a),
            null + (34 + a),
            12 + (null + a),
            false + (34 + a),
            12 + (false + a),
            "bar" + (34 + a),
            12 + ("bar" + a)
        );
    }
    expect: {
        var a = "foo";
        console.log(
            "1234" + a,
            "null34" + a,
            "12null" + a,
            !1 + (34 + a),
            12 + (!1 + a),
            "bar34" + a,
            "12bar" + a
        );
    }
    expect_stdout: true
}

concat_sequence: {
    options = {
        collapse_vars: true,
        strings: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        console.log(12 + (a = null, "34" + a));
    }
    expect: {
        console.log(12 + "34" + null);
    }
    expect_stdout: "1234null"
}

issue_3689: {
    options = {
        strings: true,
    }
    input: {
        console.log(function(a) {
            return a + ("" + (a[0] = 0));
        }([]));
    }
    expect: {
        console.log(function(a) {
            return a + ("" + (a[0] = 0));
        }([]));
    }
    expect_stdout: "00"
}

issue_5145: {
    options = {
        strings: true,
    }
    input: {
        var a = [];
        console.log("" + a + ((a[0] = 4) + "2"));
    }
    expect: {
        var a = [];
        console.log("" + a + (a[0] = 4) + "2");
    }
    expect_stdout: "42"
}
