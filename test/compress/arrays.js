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

constant_join_1: {
    options = {
        evaluate: true,
        side_effects: true,
        strings: true,
        unsafe: true,
    }
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
        var e = (foo, bar, "");
        var f = "";
        var g = "";
    }
}

constant_join_2: {
    options = {
        evaluate: true,
        strings: true,
        unsafe: true,
    }
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
        evaluate: true,
        strings: true,
        unsafe: true,
    }
    input: {
        var foo, bar, baz;
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
        var foo, bar, baz;
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
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        unsafe: true,
        unused: true,
    }
    input: {
        function f0() {
            var a = [1, 2, 3];
            var b = 0;
            for (var i = 0; i < a.length; i++)
                b += a[i];
            return b;
        }
        function f1() {
            var a = [1, 2, 3];
            var b = 0;
            for (var i = 0, len = a.length; i < len; i++)
                b += a[i];
            return b;
        }
        function f2() {
            var a = [1, 2, 3];
            for (var i = 0; i < a.length; i++)
                a[i]++;
            return a[2];
        }
        console.log(f0(), f1(), f2());
    }
    expect: {
        function f0() {
            var a = [1, 2, 3];
            var b = 0;
            for (var i = 0; i < 3; i++)
                b += a[i];
            return b;
        }
        function f1() {
            var a = [1, 2, 3];
            var b = 0;
            for (var i = 0; i < 3; i++)
                b += a[i];
            return b;
        }
        function f2() {
            var a = [1, 2, 3];
            for (var i = 0; i < a.length; i++)
                a[i]++;
            return a[2];
        }
        console.log(f0(), f1(), f2());
    }
    expect_stdout: "6 6 4"
}

index: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var a = [ 1, 2 ];
        console.log(a[0], a[1]);
    }
    expect: {
        console.log(1, 2);
    }
    expect_stdout: "1 2"
}

length: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var a = [ 1, 2 ];
        console.log(a.length);
    }
    expect: {
        console.log(2);
    }
    expect_stdout: "2"
}

index_length: {
    options = {
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var a = [ 1, 2 ];
        console.log(a[0], a.length);
    }
    expect: {
        console.log(1, 2);
    }
    expect_stdout: "1 2"
}

constructor_bad: {
    options = {
        unsafe: true
    }
    input: {
        try {
            Array(NaN);
            console.log("FAIL1");
        } catch (ex) {
            try {
                new Array(NaN);
                console.log("FAIL2");
            } catch (ex) {
                console.log("PASS");
            }
        }
        try {
            Array(3.14);
            console.log("FAIL1");
        } catch (ex) {
            try {
                new Array(3.14);
                console.log("FAIL2");
            } catch (ex) {
                console.log("PASS");
            }
        }
    }
    expect: {
        try {
            Array(NaN);
            console.log("FAIL1");
        } catch (ex) {
            try {
                Array(NaN);
                console.log("FAIL2");
            } catch (ex) {
                console.log("PASS");
            }
        }
        try {
            Array(3.14);
            console.log("FAIL1");
        } catch (ex) {
            try {
                Array(3.14);
                console.log("FAIL2");
            } catch (ex) {
                console.log("PASS");
            }
        }
    }
    expect_stdout: [
        "PASS",
        "PASS",
    ]
    expect_warnings: [
        "WARN: Invalid array length: 3.14 [test/compress/arrays.js:13,12]",
        "WARN: Invalid array length: 3.14 [test/compress/arrays.js:17,16]",
    ]
}

constructor_good: {
    options = {
        unsafe: true
    }
    input: {
        console.log(Array());
        console.log(Array(0));
        console.log(Array(1));
        console.log(Array(6));
        console.log(Array(7));
        console.log(Array(1, 2));
        console.log(Array(false));
        console.log(Array("foo"));
        console.log(Array(Array));
        console.log(new Array());
        console.log(new Array(0));
        console.log(new Array(1));
        console.log(new Array(6));
        console.log(new Array(7));
        console.log(new Array(1, 2));
        console.log(new Array(false));
        console.log(new Array("foo"));
        console.log(new Array(Array));
    }
    expect: {
        console.log([]);
        console.log([]);
        console.log([,]);
        console.log([,,,,,,]);
        console.log(Array(7));
        console.log([ 1, 2 ]);
        console.log([ false ]);
        console.log([ "foo" ]);
        console.log(Array(Array));
        console.log([]);
        console.log([]);
        console.log([,]);
        console.log([,,,,,,]);
        console.log(Array(7));
        console.log([ 1, 2 ]);
        console.log([ false ]);
        console.log([ "foo" ]);
        console.log(Array(Array));
    }
    expect_stdout: true
    expect_warnings: []
}

unsafe_evaluate_modified_binary: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        (function(a) {
            (console && a).push(1);
            if (a.length)
                console.log("PASS");
        })([]);
    }
    expect: {
        (function(a) {
            (console && a).push(1);
            if (a.length)
                console.log("PASS");
        })([]);
    }
    expect_stdout: "PASS"
}

unsafe_evaluate_modified_conditional: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        (function(a) {
            (console ? a : []).push(1);
            if (a.length)
                console.log("PASS");
        })([]);
    }
    expect: {
        (function(a) {
            (console ? a : []).push(1);
            if (a.length)
                console.log("PASS");
        })([]);
    }
    expect_stdout: "PASS"
}

unsafe_evaluate_modified_sequence: {
    options = {
        evaluate: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        (function(a) {
            (0, a).push(1);
            if (a.length)
                console.log("PASS");
        })([]);
    }
    expect: {
        (function(a) {
            (0, a).push(1);
            if (a.length)
                console.log("PASS");
        })([]);
    }
    expect_stdout: "PASS"
}
