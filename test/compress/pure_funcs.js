array: {
    options = {
        pure_funcs: [ "Math.floor" ],
        side_effects: true,
    }
    input: {
        var a;
        function f(b) {
            Math.floor(a / b);
            Math.floor(c / b);
        }
    }
    expect: {
        var a;
        function f(b) {
            c;
        }
    }
}

func: {
    options = {
        pure_funcs: function(node) {
            return !~node.args[0].print_to_string().indexOf("a");
        },
        side_effects: true,
    }
    input: {
        function f(a, b) {
            Math.floor(a / b);
            Math.floor(c / b);
        }
    }
    expect: {
        function f(a, b) {
            Math.floor(c / b);
        }
    }
}

side_effects: {
    options = {
        pure_funcs: [ "console.log" ],
        side_effects: true,
    }
    input: {
        function f(a, b) {
            console.log(a());
            console.log(b);
        }
    }
    expect: {
        function f(a, b) {
            a();
        }
    }
}

unused: {
    options = {
        pure_funcs: [ "pure" ],
        side_effects: true,
        unused: true,
    }
    input: {
        function foo() {
            var u = pure(1);
            var x = pure(2);
            var y = pure(x);
            var z = pure(pure(side_effects()));
            return pure(3);
        }
    }
    expect: {
        function foo() {
            side_effects();
            return pure(3);
        }
    }
}

babel: {
    options = {
        pure_funcs: [ "_classCallCheck" ],
        side_effects: true,
        unused: true,
    }
    input: {
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function");
        }
        var Foo = function Foo() {
            _classCallCheck(this, Foo);
        };
    }
    expect: {
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function");
        }
        var Foo = function() {
        };
    }
}

conditional: {
    options = {
        pure_funcs: [ "pure" ],
        side_effects: true,
    }
    input: {
        pure(1 | a() ? 2 & b() : 7 ^ c());
        pure(1 | a() ? 2 & b() : 5);
        pure(1 | a() ? 4 : 7 ^ c());
        pure(1 | a() ? 4 : 5);
        pure(3 ? 2 & b() : 7 ^ c());
        pure(3 ? 2 & b() : 5);
        pure(3 ? 4 : 7 ^ c());
        pure(3 ? 4 : 5);
    }
    expect: {
        1 | a() ? b() : c();
        1 | a() && b();
        1 | a() || c();
        a();
        3 ? b() : c();
        3 && b();
        3 || c();
    }
}

relational: {
    options = {
        pure_funcs: [ "foo" ],
        side_effects :true,
    }
    input: {
        foo() in foo();
        foo() instanceof bar();
        foo() < "bar";
        bar() > foo();
        bar() != bar();
        bar() !== "bar";
        "bar" == foo();
        "bar" === bar();
        "bar" >= "bar";
    }
    expect: {
        bar();
        bar();
        bar(), bar();
        bar();
        bar();
    }
}

arithmetic: {
    options = {
        pure_funcs: [ "foo" ],
        side_effects :true,
    }
    input: {
        foo() + foo();
        foo() - bar();
        foo() * "bar";
        bar() / foo();
        bar() & bar();
        bar() | "bar";
        "bar" >> foo();
        "bar" << bar();
        "bar" >>> "bar";
    }
    expect: {
        bar();
        bar();
        bar(), bar();
        bar();
        bar();
    }
}

boolean_and: {
    options = {
        pure_funcs: [ "foo" ],
        side_effects :true,
    }
    input: {
        foo() && foo();
        foo() && bar();
        foo() && "bar";
        bar() && foo();
        bar() && bar();
        bar() && "bar";
        "bar" && foo();
        "bar" && bar();
        "bar" && "bar";
    }
    expect: {
        foo() && bar();
        bar();
        bar() && bar();
        bar();
        "bar" && bar();
    }
}

boolean_or: {
    options = {
        pure_funcs: [ "foo" ],
        side_effects :true,
    }
    input: {
        foo() || foo();
        foo() || bar();
        foo() || "bar";
        bar() || foo();
        bar() || bar();
        bar() || "bar";
        "bar" || foo();
        "bar" || bar();
        "bar" || "bar";
    }
    expect: {
        foo() || bar();
        bar();
        bar() || bar();
        bar();
        "bar" || bar();
    }
}

assign: {
    options = {
        pure_funcs: [ "foo" ],
        side_effects :true,
    }
    input: {
        var a;
        function f(b) {
            a = foo();
            b *= 4 + foo();
            c >>= 0 | foo();
        }
    }
    expect: {
        var a;
        function f(b) {
            a = foo();
            b *= 4 + foo();
            c >>= 0 | foo();
        }
    }
}

unary: {
    options = {
        pure_funcs: [ "foo" ],
        side_effects :true,
    }
    input: {
        typeof foo();
        typeof bar();
        typeof "bar";
        void foo();
        void bar();
        void "bar";
        delete a[foo()];
        delete a[bar()];
        delete a["bar"];
        a[foo()]++;
        a[bar()]++;
        a["bar"]++;
        --a[foo()];
        --a[bar()];
        --a["bar"];
        ~foo();
        ~bar();
        ~"bar";
    }
    expect: {
        bar();
        bar();
        delete a[foo()];
        delete a[bar()];
        delete a["bar"];
        a[foo()]++;
        a[bar()]++;
        a["bar"]++;
        --a[foo()];
        --a[bar()];
        --a["bar"];
        bar();
    }
}

issue_2629_1: {
    options = {
        side_effects: true,
    }
    input: {
        /*@__PURE__*/ a();
        /*@__PURE__*/ (b());
        (/*@__PURE__*/ c)();
        (/*@__PURE__*/ d());
    }
    expect: {
        (/*@__PURE__*/ c)();
    }
}

issue_2629_2: {
    options = {
        side_effects: true,
    }
    input: {
        /*@__PURE__*/ a(1)(2)(3);
        /*@__PURE__*/ (b(1))(2)(3);
        /*@__PURE__*/ (c(1)(2))(3);
        /*@__PURE__*/ (d(1)(2)(3));
        (/*@__PURE__*/ e)(1)(2)(3);
        (/*@__PURE__*/ f(1))(2)(3);
        (/*@__PURE__*/ g(1)(2))(3);
        (/*@__PURE__*/ h(1)(2)(3));
    }
    expect: {
        (/*@__PURE__*/ e)(1)(2)(3);
        (/*@__PURE__*/ f(1))(2)(3);
        (/*@__PURE__*/ g(1)(2))(3);
    }
}

issue_2629_3: {
    options = {
        side_effects: true,
    }
    input: {
        /*@__PURE__*/ a.x(1).y(2).z(3);
        /*@__PURE__*/ (b.x)(1).y(2).z(3);
        /*@__PURE__*/ (c.x(1)).y(2).z(3);
        /*@__PURE__*/ (d.x(1).y)(2).z(3);
        /*@__PURE__*/ (e.x(1).y(2)).z(3);
        /*@__PURE__*/ (f.x(1).y(2).z)(3);
        /*@__PURE__*/ (g.x(1).y(2).z(3));
        (/*@__PURE__*/ h).x(1).y(2).z(3);
        (/*@__PURE__*/ i.x)(1).y(2).z(3);
        (/*@__PURE__*/ j.x(1)).y(2).z(3);
        (/*@__PURE__*/ k.x(1).y)(2).z(3);
        (/*@__PURE__*/ l.x(1).y(2)).z(3);
        (/*@__PURE__*/ m.x(1).y(2).z)(3);
        (/*@__PURE__*/ n.x(1).y(2).z(3));
    }
    expect: {
        (/*@__PURE__*/ h).x(1).y(2).z(3);
        (/*@__PURE__*/ i.x)(1).y(2).z(3);
        (/*@__PURE__*/ j.x(1)).y(2).z(3);
        (/*@__PURE__*/ k.x(1).y)(2).z(3);
        (/*@__PURE__*/ l.x(1).y(2)).z(3);
        (/*@__PURE__*/ m.x(1).y(2).z)(3);
    }
}

issue_2629_4: {
    options = {
        side_effects: true,
    }
    input: {
        (/*@__PURE__*/ x(), y());
        (w(), /*@__PURE__*/ x(), y());
    }
    expect: {
        y();
        w(), y();
    }
}

issue_2629_5: {
    options = {
        side_effects: true,
    }
    input: {
        [ /*@__PURE__*/ x() ];
        [ /*@__PURE__*/ x(), y() ];
        [ w(), /*@__PURE__*/ x(), y() ];
    }
    expect: {
        y();
        w(), y();
    }
}
