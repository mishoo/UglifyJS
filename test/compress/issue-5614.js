record_update: {
    options = {
        loops: true,
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var value = { a: 42, b: "PASS" };
        var unused = _Utils_update(value, { b: "FAIL" });
        function _Utils_update(oldRecord, updatedFields) {
            var newRecord = {};
            for (var key in oldRecord)
                newRecord[key] = oldRecord[key];
            for (var key in updatedFields)
                newRecord[key] = updatedFields[key];
            return newRecord;
        }
    }
    expect: {}
}

currying: {
    options = {
        inline: true,
        passes: 2,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function F(arity, fun, wrapper) {
            wrapper.a = arity;
            wrapper.f = fun;
            return wrapper;
        }
        function F2(fun) {
            return F(2, fun, function(a) {
                return function(b) {
                    return fun(a, b);
                };
            });
        }
        function _Utils_eq(x, y) {
            var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
            while (isEqual && (pair = stack.pop()))
                isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack);
            return isEqual;
        }
        var _Utils_equal = F2(_Utils_eq);
    }
    expect: {}
}

conditional_property_write: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var o = {};
            if (a)
                o.p = console.log("foo");
            else
                o.q = console.log("bar");
            o.r = console.log("baz");
        }
        f(42);
        f(null);
    }
    expect: {
        function f(a) {
            if (a)
                console.log("foo");
            else
                console.log("bar");
            console.log("baz");
        }
        f(42);
        f(null);
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
        "baz",
    ]
}

reassign_1: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS", b = "FAIL";
        (b = a).toString();
        console.log(b);
    }
    expect: {
        var b = "FAIL";
        (b = "PASS").toString();
        console.log(b);
    }
    expect_stdout: "PASS"
}

reassign_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = "PASS";
        if (false) {
            a = null + 0;
            a();
        }
        console.log(a);
    }
    expect: {
        var a = "PASS";
        if (false) {
            a = 0;
            a();
        }
        console.log(a);
    }
    expect_stdout: "PASS"
}

reassign_3: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0;
        (a = a || "PASS").toString();
        console.log(a);
    }
    expect: {
        var a = 0;
        (a = (0, "PASS")).toString();
        console.log(a);
    }
    expect_stdout: "PASS"
}

retain_instance_write: {
    options = {
        pure_getters: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            return a;
        }
        function g() {
            var o = {};
            var b = new f(o);
            if (console)
                b.p = "PASS";
            return o;
        }
        console.log(g().p);
    }
    expect: {
        function f(a) {
            return a;
        }
        function g() {
            var o = {};
            var b = new f(o);
            if (console)
                b.p = "PASS";
            return o;
        }
        console.log(g().p);
    }
    expect_stdout: "PASS"
}
