this_binding_conditionals: {
    options = {
        conditionals: true,
        evaluate    : true
    };
    input: {
        (1 && a)();
        (0 || a)();
        (0 || 1 && a)();
        (1 ? a : 0)();

        (1 && a.b)();
        (0 || a.b)();
        (0 || 1 && a.b)();
        (1 ? a.b : 0)();

        (1 && a[b])();
        (0 || a[b])();
        (0 || 1 && a[b])();
        (1 ? a[b] : 0)();

        (1 && eval)();
        (0 || eval)();
        (0 || 1 && eval)();
        (1 ? eval : 0)();
    }
    expect: {
        a();
        a();
        a();
        a();

        (0, a.b)();
        (0, a.b)();
        (0, a.b)();
        (0, a.b)();

        (0, a[b])();
        (0, a[b])();
        (0, a[b])();
        (0, a[b])();

        (0, eval)();
        (0, eval)();
        (0, eval)();
        (0, eval)();
    }
}

this_binding_collapse_vars: {
    options = {
        collapse_vars: true,
    };
    input: {
        var c = a; c();
        var d = a.b; d();
        var e = eval; e();
    }
    expect: {
        a();
        (0, a.b)();
        (0, eval)();
    }
}

this_binding_side_effects: {
    options = {
        side_effects : true
    };
    input: {
        (function (foo) {
            (0, foo)();
            (0, foo.bar)();
            (0, eval)('console.log(foo);');
        }());
        (function (foo) {
            var eval = console;
            (0, foo)();
            (0, foo.bar)();
            (0, eval)('console.log(foo);');
        }());
    }
    expect: {
        (function (foo) {
            foo();
            (0, foo.bar)();
            (0, eval)('console.log(foo);');
        }());
        (function (foo) {
            var eval = console;
            foo();
            (0, foo.bar)();
            (0, eval)('console.log(foo);');
        }());
    }
}