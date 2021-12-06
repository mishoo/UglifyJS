issue_2629_1: {
    options = {
        annotations: true,
        side_effects: true,
    }
    beautify = {
        comments: "all",
    }
    input: {
        /*@__PURE__*/ a();
        /*@__PURE__*/ (b());
        (/*@__PURE__*/ c)();
        (/*@__PURE__*/ d());
    }
    expect_exact: "c();"
}

issue_2629_2: {
    options = {
        annotations: true,
        side_effects: true,
    }
    beautify = {
        comments: "all",
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
    expect_exact: [
        "e(1)(2)(3);",
        "f(1)(2)(3);",
        "g(1)(2)(3);",
    ]
}

issue_2629_3: {
    options = {
        annotations: true,
        side_effects: true,
    }
    beautify = {
        comments: "all",
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
    expect_exact: [
        "h.x(1).y(2).z(3);",
        "i.x(1).y(2).z(3);",
        "j.x(1).y(2).z(3);",
        "k.x(1).y(2).z(3);",
        "l.x(1).y(2).z(3);",
        "m.x(1).y(2).z(3);",
    ]
}

issue_2629_4: {
    options = {
        annotations: true,
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
        annotations: true,
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

issue_2638: {
    options = {
        annotations: true,
        side_effects: true,
    }
    beautify = {
        comments: "all",
    }
    input: {
        /*@__PURE__*/(g() || h())(x(), y());
        (/*@__PURE__*/ (a() || b()))(c(), d());
    }
    expect_exact: [
        "x(),y();",
        "(a()||b())(c(),d());",
    ]
}

issue_2705_1: {
    options = {
        annotations: true,
        side_effects: true,
    }
    beautify = {
        comments: "all",
    }
    input: {
        /*@__PURE__*/ new a();
        /*@__PURE__*/ (new b());
        new (/*@__PURE__*/ c)();
        (/*@__PURE__*/ new d());
    }
    expect_exact: [
        "new c;",
    ]
}

issue_2705_2: {
    options = {
        annotations: true,
        side_effects: true,
    }
    beautify = {
        comments: "all",
    }
    input: {
        /*@__PURE__*/ new a(1)(2)(3);
        /*@__PURE__*/ new (b(1))(2)(3);
        /*@__PURE__*/ new (c(1)(2))(3);
        /*@__PURE__*/ new (d(1)(2)(3));
        new (/*@__PURE__*/ e)(1)(2)(3);
        (/*@__PURE__*/ new f(1))(2)(3);
        (/*@__PURE__*/ new g(1)(2))(3);
        (/*@__PURE__*/ new h(1)(2)(3));
    }
    expect_exact: [
        "new e(1)(2)(3);",
        "new f(1)(2)(3);",
        "new g(1)(2)(3);",
    ]
}

issue_2705_3: {
    options = {
        annotations: true,
        side_effects: true,
    }
    beautify = {
        comments: "all",
    }
    input: {
        /*@__PURE__*/ new a.x(1).y(2).z(3);
        /*@__PURE__*/ new (b.x)(1).y(2).z(3);
        /*@__PURE__*/ new (c.x(1)).y(2).z(3);
        /*@__PURE__*/ new (d.x(1).y)(2).z(3);
        /*@__PURE__*/ new (e.x(1).y(2)).z(3);
        /*@__PURE__*/ new (f.x(1).y(2).z)(3);
        /*@__PURE__*/ new (g.x(1).y(2).z(3));
        new (/*@__PURE__*/ h).x(1).y(2).z(3);
        /* */ new (/*@__PURE__*/ i.x)(1).y(2).z(3);
        (/*@__PURE__*/ new j.x(1)).y(2).z(3);
        (/*@__PURE__*/ new k.x(1).y)(2).z(3);
        (/*@__PURE__*/ new l.x(1).y(2)).z(3);
        (/*@__PURE__*/ new m.x(1).y(2).z)(3);
        (/*@__PURE__*/ new n.x(1).y(2).z(3));
    }
    expect_exact: [
        "new h.x(1).y(2).z(3);",
        "/* */new i.x(1).y(2).z(3);",
        "new j.x(1).y(2).z(3);",
        "new k.x(1).y(2).z(3);",
        "new l.x(1).y(2).z(3);",
        "new m.x(1).y(2).z(3);",
    ]
}

issue_2705_4: {
    options = {
        annotations: true,
        side_effects: true,
    }
    input: {
        (/*@__PURE__*/ new x(), y());
        (w(), /*@__PURE__*/ new x(), y());
    }
    expect: {
        y();
        w(), y();
    }
}

issue_2705_5: {
    options = {
        annotations: true,
        side_effects: true,
    }
    input: {
        [ /*@__PURE__*/ new x() ];
        [ /*@__PURE__*/ new x(), y() ];
        [ w(), /*@__PURE__*/ new x(), y() ];
    }
    expect: {
        y();
        w(), y();
    }
}

issue_2705_6: {
    options = {
        annotations: true,
        side_effects: true,
    }
    beautify = {
        comments: "all",
    }
    input: {
        /*@__PURE__*/new (g() || h())(x(), y());
        /* */ new (/*@__PURE__*/ (a() || b()))(c(), d());
    }
    expect_exact: [
        "x(),y();",
        "/* */new(a()||b())(c(),d());",
    ]
}

issue_3858: {
    options = {
        annotations: true,
        collapse_vars: true,
        inline: true,
        keep_fargs: false,
        unsafe: true,
        unused: true,
    }
    input: {
        var f = function(a) {
            return /*@__PURE__*/ function(b) {
                console.log(b);
            }(a);
        };
        f("PASS");
    }
    expect: {
        var f = function(a) {
            return function() {
                console.log(a);
            }();
        };
        f("PASS");
    }
    expect_stdout: "PASS"
}

inline_pure_call_1: {
    options = {
        annotations: true,
        collapse_vars: true,
        inline: true,
        keep_fargs: false,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var f = function(a) {
            return /*@__PURE__*/ function(b) {
                console.log(b);
            }(a);
        };
        f("PASS");
    }
    expect: {}
}

inline_pure_call_2: {
    options = {
        annotations: true,
        collapse_vars: true,
        inline: true,
        keep_fargs: false,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var f = function(a) {
            return /*@__PURE__*/ function(b) {
                console.log(b);
            }(a);
        };
        var a = f("PASS");
    }
    expect: {}
}

inline_pure_call_3: {
    options = {
        annotations: true,
        collapse_vars: true,
        evaluate: true,
        inline: true,
        keep_fargs: false,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var f = function(a) {
            return /*@__PURE__*/ function(b) {
                console.log(b);
            }(a);
        };
        var a = f("PASS");
        console.log(a);
    }
    expect: {
        var a = function() {
            console.log("PASS");
        }();
        console.log(a);
    }
    expect_stdout: [
        "PASS",
        "undefined",
    ]
}

inline_pure_call_4: {
    options = {
        annotations: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = /*@__PURE__*/ function() {
            return console.log("PASS"), 42;
        }();
        console.log(a);
    }
    expect: {
        var a = function() {
            return console.log("PASS"), 42;
        }();
        console.log(a);
    }
    expect_stdout: [
        "PASS",
        "42",
    ]
}

compress_and_output_annotations_enabled: {
    options = {
        annotations: true,
        side_effects: true,
    }
    beautify = {
        annotations: true,
        beautify: true,
        comments: false,
    }
    input: {
        var top = /*@__PURE__*/ foo();
        /*@__PURE__*/ a(1)(2)(3);
        /*@__PURE__*/ (b(1))(2)(3);
        /*@__PURE__*/ (c(1)(2))(3);
        /*@__PURE__*/ (d(1)(2)(3));
        (/*@__PURE__*/ e)(1)(2)(3);
        (/*@__PURE__*/ f(1))(2)(3);
        (/*@__PURE__*/ g(1)(2))(3);
        (/*@__PURE__*/ h(1)(2)(3));
        /*@__PURE__*/ l(1).p(2);
        (/*@__PURE__*/ m(1)).p(2);
        (/*@__PURE__*/ n(1).p)(2);
        (/*@__PURE__*/ o(1).p(2));
    }
    expect_exact: [
        "var top = /*@__PURE__*/foo();",
        "",
        "e(1)(2)(3);",
        "",
        "f(1)(2)(3);",
        "",
        "g(1)(2)(3);",
        "",
        "m(1).p(2);",
        "",
        "n(1).p(2);",
    ]
}

compress_annotations_disabled_output_annotations_enabled: {
    options = {
        annotations: false,
        evaluate: true,
        sequences: true,
        side_effects: true,
    }
    beautify = {
        annotations: true,
        comments: true,
    }
    input: {
        /*@__PURE__*/ a(1+2);
        /*#__PURE__*/ (b(2+3));
        (/*@__PURE__*/ c)(side_effect);
        (/*#__PURE__*/ d(effect()));
    }
    expect_exact: [
        "/*@__PURE__*/a(3),",
        "/*@__PURE__*/b(5),",
        "c(side_effect),",
        "/*@__PURE__*/d(effect());",
    ]
}

compress_and_output_annotations_disabled: {
    options = {
        annotations: false,
        evaluate: true,
        sequences: true,
        side_effects: true,
    }
    beautify = {
        annotations: false,
        comments: true,
    }
    input: {
        /*@__PURE__*/ a(1+2);
        /*@__PURE__*/ (b(2+3));
        (/*@__PURE__*/ c)(side_effect);
        (/*@__PURE__*/ d(effect()));
    }
    expect_exact: [
        "a(3),",
        "b(5),",
        "c(side_effect),",
        "d(effect());",
    ]
}
