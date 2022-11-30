constructor_1: {
    input: {
        "use strict";
        console.log(new class {
            constructor(a) {
                this.a = a;
            }
        }("PASS").a);
    }
    expect_exact: '"use strict";console.log(new class{constructor(a){this.a=a}}("PASS").a);'
    expect_stdout: "PASS"
    node_version: ">=4"
}

constructor_2: {
    input: {
        "use strict";
        console.log(new class {
            "constructor"(a) {
                this.a = a;
            }
        }("PASS").a);
    }
    expect_exact: '"use strict";console.log(new class{constructor(a){this.a=a}}("PASS").a);'
    expect_stdout: "PASS"
    node_version: ">=4"
}

constructor_3: {
    input: {
        "use strict";
        console.log(new class {
            ["constructor"](a) {
                this.a = a;
            }
        }("FAIL").a || "PASS");
    }
    expect_exact: '"use strict";console.log(new class{["constructor"](a){this.a=a}}("FAIL").a||"PASS");'
    expect_stdout: "PASS"
    node_version: ">=4"
}

constructor_4: {
    input: {
        "use strict";
        class A {
            static constructor(a) {
                console.log(a);
            }
        }
        A.constructor("PASS");
    }
    expect_exact: '"use strict";class A{static constructor(a){console.log(a)}}A.constructor("PASS");'
    expect_stdout: "PASS"
    node_version: ">=4"
}

fields: {
    input: {
        var o = new class A {
            "#p";
            static #p = "PASS";
            async
            get
            q() {
                return A.#p;
            }
            ;
            [6 * 7] = console ? "foo" : "bar"
        };
        for (var k in o)
            console.log(k, o[k]);
        console.log(o.q);
    }
    expect_exact: 'var o=new class A{"#p";static#p="PASS";async;get q(){return A.#p}[6*7]=console?"foo":"bar"};for(var k in o)console.log(k,o[k]);console.log(o.q);'
    expect_stdout: [
        "42 foo",
        "#p undefined",
        "async undefined",
        "PASS",
    ]
    node_version: ">=12"
}

modifier_as_field_name: {
    input: {
        for (var k in new class { async; static = 42 })
            console.log(k);
    }
    expect_exact: "for(var k in new class{async;static=42})console.log(k);"
    expect_stdout: [
        "async",
        "static",
    ]
    node_version: ">=12"
}

methods: {
    input: {
        "use strict";
        class A {
            static f() {
                return "foo";
            }
            *g() {
                yield A.f();
                yield "bar";
            }
        }
        for (var a of new A().g())
            console.log(a);
    }
    expect_exact: '"use strict";class A{static f(){return"foo"}*g(){yield A.f();yield"bar"}}for(var a of(new A).g())console.log(a);'
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

private_methods: {
    input: {
        new class A {
            static *#f() {
                yield A.#p * 3;
            }
            async #g() {
                for (var a of A.#f())
                    return a * await 2;
            }
            static get #p() {
                return 7;
            }
            get q() {
                return this.#g();
            }
        }().q.then(console.log);
    }
    expect_exact: "(new class A{static*#f(){yield 3*A.#p}async#g(){for(var a of A.#f())return a*await 2}static get#p(){return 7}get q(){return this.#g()}}).q.then(console.log);"
    expect_stdout: "42"
    node_version: ">=14.6"
}

await: {
    input: {
        var await = "PASS";
        (async function() {
            return await new class extends (await function() {}) { [await 42] = await };
        })().then(function(o) {
            console.log(o[42]);
        });
    }
    expect_exact: 'var await="PASS";(async function(){return await new class extends(await function(){}){[await 42]=await}})().then(function(o){console.log(o[42])});'
    expect_stdout: "PASS"
    node_version: ">=12"
}

yield: {
    input: {
        var a = function*() {
            yield new class { [yield "foo"] = "bar" };
        }();
        console.log(a.next().value);
        console.log(a.next(42).value[42]);
    }
    expect_exact: 'var a=function*(){yield new class{[yield"foo"]="bar"}}();console.log(a.next().value);console.log(a.next(42).value[42]);'
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=12"
}

conditional_parentheses: {
    options = {
        conditionals: true,
    }
    input: {
        "use strict";
        if (class {})
            console.log("PASS");
    }
    expect_exact: '"use strict";(class{})&&console.log("PASS");'
    expect_stdout: "PASS"
    node_version: ">=4"
}

class_super: {
    input: {
        "use strict";
        class A {
            static get p() {
                return "Foo";
            }
            static get q() {
                return super.p || 42;
            }
            constructor() {
                console.log("a.p", super.p, this.p);
                console.log("a.q", super.q, this.q);
            }
            get p() {
                return "foo";
            }
            get q() {
                return super.p || null;
            }
        }
        class B extends A {
            static get p() {
                return "Bar";
            }
            static get q() {
                return super.p;
            }
            constructor() {
                super();
                console.log("b.p", super.p, this.p);
                console.log("b.q", super.q, this.q);
            }
            get p() {
                return "bar";
            }
            get q() {
                return super.p;
            }
        }
        console.log("A", A.p, A.q);
        console.log("B", B.p, B.q);
        new B();
    }
    expect_exact: '"use strict";class A{static get p(){return"Foo"}static get q(){return super.p||42}constructor(){console.log("a.p",super.p,this.p);console.log("a.q",super.q,this.q)}get p(){return"foo"}get q(){return super.p||null}}class B extends A{static get p(){return"Bar"}static get q(){return super.p}constructor(){super();console.log("b.p",super.p,this.p);console.log("b.q",super.q,this.q)}get p(){return"bar"}get q(){return super.p}}console.log("A",A.p,A.q);console.log("B",B.p,B.q);new B;'
    expect_stdout: [
        "A Foo 42",
        "B Bar Foo",
        "a.p undefined bar",
        "a.q undefined foo",
        "b.p foo bar",
        "b.q null foo",
    ]
    node_version: ">=4"
}

static_newline_1: {
    input: {
        class A {
            static
            P
        }
        console.log("P" in A, "static" in A);
        console.log("P" in new A(), "static" in new A());
    }
    expect_exact: 'class A{static P}console.log("P"in A,"static"in A);console.log("P"in new A,"static"in new A);'
    expect_stdout: [
        "true false",
        "false false",
    ]
    node_version: ">=12"
}

static_newline_2: {
    input: {
        class A {
            static
            static
            P
        }
        console.log("P" in A, "static" in A);
        console.log("P" in new A(), "static" in new A());
    }
    expect_exact: 'class A{static static;P}console.log("P"in A,"static"in A);console.log("P"in new A,"static"in new A);'
    expect_stdout: [
        "false true",
        "true false",
    ]
    node_version: ">=12"
}

static_newline_3: {
    input: {
        class A {
            static
            static
            static
            P
        }
        console.log("P" in A, "static" in A);
        console.log("P" in new A(), "static" in new A());
    }
    expect_exact: 'class A{static static;static P}console.log("P"in A,"static"in A);console.log("P"in new A,"static"in new A);'
    expect_stdout: [
        "true true",
        "false false",
    ]
    node_version: ">=12"
}

static_newline_4: {
    input: {
        class A {
            static
            static
            static
            static
            P
        }
        console.log("P" in A, "static" in A);
        console.log("P" in new A(), "static" in new A());
    }
    expect_exact: 'class A{static static;static static;P}console.log("P"in A,"static"in A);console.log("P"in new A,"static"in new A);'
    expect_stdout: [
        "false true",
        "true false",
    ]
    node_version: ">=12"
}

static_newline_init: {
    input: {
        class A {
            static
            {
                console.log("PASS");
            }
        }
    }
    expect_exact: 'class A{static{console.log("PASS")}}'
    expect_stdout: "PASS"
    node_version: ">=16"
}

static_init: {
    input: {
        var a = "foo";
        var b = null;
        class A {
            static {
                var a = "bar";
                b = true;
                var c = 42;
                console.log(a, b, c);
            }
        }
        console.log(a, b, typeof c);
    }
    expect_exact: 'var a="foo";var b=null;class A{static{var a="bar";b=true;var c=42;console.log(a,b,c)}}console.log(a,b,typeof c);'
    expect_stdout: [
        "bar true 42",
        "foo true undefined",
    ]
    node_version: ">=16"
}

static_field_init: {
    options = {
        side_effects: true,
    }
    input: {
        (class {
            static [console.log("foo")] = console.log("bar");
            static {
                console.log("baz");
            }
            static [console.log("moo")] = console.log("moz");
        });
    }
    expect: {
        (class {
            static [(console.log("foo"), console.log("moo"))] = (
                console.log("bar"),
                (() => {
                    console.log("baz");
                })(),
                console.log("moz")
            );
        });
    }
    expect_stdout: [
        "foo",
        "moo",
        "bar",
        "baz",
        "moz",
    ]
    node_version: ">=16"
}

static_field_init_strict: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        (class {
            static [console.log("foo")] = console.log("bar");
            static {
                console.log("baz");
            }
            static [console.log("moo")] = console.log("moz");
        });
    }
    expect: {
        "use strict";
        console.log("foo"),
        console.log("moo"),
        (() => (
            console.log("bar"),
            (() => {
                console.log("baz");
            })(),
            console.log("moz")
        ))();
    }
    expect_stdout: [
        "foo",
        "moo",
        "bar",
        "baz",
        "moz",
    ]
    node_version: ">=16"
}

static_init_side_effects_1: {
    options = {
        merge_vars: true,
        side_effects: true,
    }
    input: {
        var a = "FAIL";
        (class {
            static {
                a = "PASS";
            }
        });
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (class {
            static {
                a = "PASS";
            }
        });
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=16"
}

static_init_side_effects_1_strict: {
    options = {
        merge_vars: true,
        side_effects: true,
    }
    input: {
        "use strict";
        var a = "FAIL";
        (class {
            static {
                a = "PASS";
            }
        });
        console.log(a);
    }
    expect: {
        "use strict";
        var a = "FAIL";
        (() => (() => {
            a = "PASS";
        })())();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=16"
}

static_init_side_effects_2: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        side_effects: true,
    }
    input: {
        var a = "FAIL";
        (class {
            static {
                a = "PASS";
            }
        });
        console.log(a);
    }
    expect: {
        var a = "FAIL";
        (class {
            static {
                a = "PASS";
            }
        });
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=16"
}

static_init_side_effects_2_strict: {
    options = {
        hoist_props: true,
        reduce_vars: true,
        side_effects: true,
    }
    input: {
        "use strict";
        var a = "FAIL";
        (class {
            static {
                a = "PASS";
            }
        });
        console.log(a);
    }
    expect: {
        "use strict";
        var a = "FAIL";
        (() => (() => {
            a = "PASS";
        })())();
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=16"
}

block_scoped: {
    options = {
        evaluate: true,
        dead_code: true,
        loops: true,
    }
    input: {
        "use strict";
        while (0) {
            class A {}
        }
        if (console) {
            class B {}
        }
        console.log(typeof A, typeof B);
    }
    expect: {
        "use strict";
        0;
        {
            class A {}
        }
        if (console) {
            class B {}
        }
        console.log(typeof A, typeof B);
    }
    expect_stdout: "undefined undefined"
    node_version: ">=4"
}

retain_declaration: {
    options = {
        dead_code: true,
    }
    input: {
        "use strict";
        var a = "FAIL";
        try {
            console.log(function() {
                return a;
                class a {}
            }());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        var a = "FAIL";
        try {
            console.log(function() {
                return a;
                class a {}
            }());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

drop_extends: {
    options = {
        inline: true,
        passes: 2,
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        "use strict";
        try {
            (function() {
                var f = () => {};
                class A extends f {
                    get p() {}
                }
                A.q = 42;
                return class B extends A {};
            })();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            (class extends (() => {}) {});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

keep_extends_1: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        try {
            class A extends 42 {}
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            (class extends 42 {});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

keep_extends_2: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        (class extends Function {});
        console.log("PASS");
    }
    expect: {
        "use strict";
        (class extends Function {});
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

keep_extends_3: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A extends Function {}
        console.log("PASS");
    }
    expect: {
        "use strict";
        (class extends Function {});
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

drop_name: {
    options = {
        unused: true,
    }
    input: {
        "use strict";
        try {
            console.log(class A extends 42 {})
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            console.log(class extends 42 {})
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

separate_name: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        class A {
            constructor(v) {
                this.p = v;
            }
        }
        var a = new A("PASS");
        console.log(a.p);
    }
    expect: {
        "use strict";
        class A {
            constructor(v) {
                this.p = v;
            }
        }
        var a = new A("PASS");
        console.log(a.p);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

static_getter: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        "use strict";
        (class {
            static get p() {
                console.log("PASS");
            };
        }).p;
    }
    expect: {
        "use strict";
        (class {
            static get p() {
                console.log("PASS");
            };
        }).p;
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

static_setter: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        "use strict";
        (class {
            static set p(v) {
                console.log(v);
            };
        }).p = "PASS";
    }
    expect: {
        "use strict";
        (class {
            static set p(v) {
                console.log(v);
            };
        }).p = "PASS";
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

static_side_effects: {
    options = {
        inline: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "FAIL 1";
        class A {
            static p = a = "PASS";
            q = a = "FAIL 2";
        }
        console.log(a);
    }
    expect: {
        var a = "FAIL 1";
        (class {
            static c = a = "PASS";
        });
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

static_side_effects_strict: {
    options = {
        inline: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var a = "FAIL 1";
        class A {
            static p = a = "PASS";
            q = a = "FAIL 2";
        }
        console.log(a);
    }
    expect: {
        "use strict";
        var a = "FAIL 1";
        a = "PASS";
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

single_use_1: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {}
        console.log(typeof new A());
    }
    expect: {
        "use strict";
        console.log(typeof new class {}());
    }
    expect_stdout: "object"
    node_version: ">=4"
}

single_use_2: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {
            f(a) {
                console.log(a);
            }
        }
        new A().f("PASS");
    }
    expect: {
        "use strict";
        new class {
            f(a) {
                console.log(a);
            }
        }().f("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

single_use_3: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {
            f() {
                return A;
            }
        }
        console.log(typeof new A().f());
    }
    expect: {
        "use strict";
        console.log(typeof new class A {
            f() {
                return A;
            }
        }().f());
    }
    expect_stdout: "function"
    node_version: ">=4"
}

single_use_4: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        console.log(new class A {
            f() {
                return typeof A;
            }
        }().f());
    }
    expect: {
        "use strict";
        console.log(new class A {
            f() {
                return typeof A;
            }
        }().f());
    }
    expect_stdout: "function"
    node_version: ">=4"
}

single_use_5: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        function f() {
            console.log("foo");
        }
        (function() {
            "use strict";
            class A extends f {
                f() {
                    console.log("bar");
                }
            }
            console.log("baz");
            new A().f();
        })();
    }
    expect: {
        function f() {
            console.log("foo");
        }
        (function() {
            "use strict";
            class A extends f {
                f() {
                    console.log("bar");
                }
            }
            console.log("baz");
            new A().f();
        })();
    }
    expect_stdout: [
        "baz",
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

single_use_6: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {
            [(console.log("foo"), "f")]() {
                console.log("bar");
            }
        }
        console.log("baz");
        new A().f();
    }
    expect: {
        "use strict";
        class A {
            [(console.log("foo"), "f")]() {
                console.log("bar");
            }
        }
        console.log("baz");
        new A().f();
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
    ]
    node_version: ">=4"
}

single_use_7: {
    options = {
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {
            static foo() {}
        }
        var a = "foo" in A;
        console.log(a);
    }
    expect: {
        "use strict";
        console.log("foo" in class {
            static foo() {}
        });
    }
    expect_stdout: "true"
    node_version: ">=4"
}

single_use_extends: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A extends class B {
            f() {
                return "PASS";
            }
        } {}
        console.log(new A().f());
    }
    expect: {
        "use strict";
        console.log(new class extends class {
            f() {
                return "PASS";
            }
        } {}().f());
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

single_use_extends_non_strict: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        class A extends class B {
            f() {
                return "PASS";
            }
        } {}
        console.log(new A().f());
    }
    expect: {
        console.log(new class extends class {
            f() {
                return "PASS";
            }
        } {}().f());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_non_strict: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        var a = 42..p++;
        new class extends (a || function() {
            console.log("PASS");
        }) {}
    }
    expect: {
        var a = 42..p++;
        new class extends (a || function() {
            console.log("PASS");
        }) {}
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

collapse_rhs: {
    options = {
        collapse_vars: true,
        unsafe: true,
    }
    input: {
        "use strict";
        var a = "FAIL";
        a = "PASS";
        class A {
            p = "PASS";
        }
        console.log(a);
    }
    expect: {
        "use strict";
        var a = "FAIL";
        class A {
            p = "PASS";
        }
        console.log(a = "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

collapse_rhs_static: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        var a = "FAIL";
        a = "PASS";
        class A {
            static p = "PASS";
        }
        console.log(a);
    }
    expect: {
        "use strict";
        var a = "FAIL";
        class A {
            static p = "PASS";
        }
        console.log(a = "PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

inline_non_strict: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        function f(a) {
            return a.p = "PASS";
        }
        class A {
            g() {
                return f(42);
            }
        }
        console.log(new A().g());
    }
    expect: {
        function f(a) {
            return a.p = "PASS";
        }
        console.log(new class {
            g() {
                return f(42);
            }
        }().g());
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

self_comparison: {
    options = {
        booleans: true,
        comparisons: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {}
        console.log(A == A, A != A);
        console.log(A === A, A !== A);
    }
    expect: {
        "use strict";
        console.log(!0, !1);
        console.log(!0, !1);
    }
    expect_stdout: [
        "true false",
        "true false",
    ]
    node_version: ">=4"
}

property_side_effects: {
    options = {
        inline: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        "use strict";
        (function f(a, b) {
            class A {
                [a.log("PASS")]() {
                    b.log("FAIL");
                }
            }
        })(console, console);
    }
    expect: {
        "use strict";
        (function(a) {
            a.log("PASS");
        })(console, console);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

property_side_effects_static: {
    options = {
        inline: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        "use strict";
        (function f(a, b) {
            class A {
                static [a.log("PASS")]() {
                    b.log("FAIL");
                }
            }
        })(console, console);
    }
    expect: {
        "use strict";
        (function(a) {
            a.log("PASS");
        })(console, console);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

unused_await: {
    options = {
        inline: true,
        unused: true,
    }
    input: {
        var await = "PASS";
        (async function() {
            class A {
                static p = console.log(await);
            }
        })();
    }
    expect: {
        var await = "PASS";
        (async function() {
            (class {
                static c = console.log(await);
            });
        })();
    }
    expect_stdout: true
    node_version: ">=12 <16"
}

unused_await_strict: {
    options = {
        inline: true,
        unused: true,
    }
    input: {
        "use strict";
        var await = "PASS";
        (async function() {
            class A {
                static p = console.log(await);
            }
        })();
    }
    expect: {
        "use strict";
        var await = "PASS";
        (async function() {
            (() => console.log(await))();
        })();
    }
    expect_stdout: true
    node_version: ">=12 <16"
}

computed_key_side_effects: {
    options = {
        evaluate: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var a = 0;
        class A {
            [(a++, 0)]() {}
        }
        console.log(a);
    }
    expect: {
        "use strict";
        console.log(1);
    }
    expect_stdout: "1"
    node_version: ">=4"
}

computed_key_generator: {
    options = {
        unused: true,
    }
    input: {
        "use strict";
        var a = function*() {
            class A {
                static [console.log(yield)]() {}
            }
        }();
        a.next("FAIL");
        a.next("PASS");
    }
    expect: {
        "use strict";
        var a = function*() {
            console.log(yield);
        }();
        a.next("FAIL");
        a.next("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

keep_fnames: {
    options = {
        keep_fnames: true,
        toplevel: true,
    }
    mangle = {
        keep_fnames: true,
        toplevel: true,
    }
    input: {
        "use strict";
        class Foo {}
        console.log(Foo.name, class Bar {}.name);
    }
    expect: {
        "use strict";
        class Foo {}
        console.log(Foo.name, class Bar {}.name);
    }
    expect_stdout: "Foo Bar"
    node_version: ">=4"
}

instanceof_lambda: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        "use strict";
        console.log(42 instanceof class {});
    }
    expect: {
        "use strict";
        console.log(false);
    }
    expect_stdout: "false"
    node_version: ">=4"
}

drop_instanceof: {
    options = {
        booleans: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {}
        console.log({} instanceof A, Math instanceof A);
    }
    expect: {
        "use strict";
        console.log(!1, (Math, !1));
    }
    expect_stdout: "false false"
    node_version: ">=4"
}

keep_instanceof_1: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {}
        var A;
        console.log({} instanceof A, Math instanceof A);
    }
    expect: {
        "use strict";
        class A {}
        var A;
        console.log({} instanceof A, Math instanceof A);
    }
    expect_stdout: SyntaxError("Identifier has already been declared")
    node_version: ">=4"
}

keep_instanceof_2: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var A = Object;
        class A {}
        console.log({} instanceof A, Math instanceof A);
    }
    expect: {
        "use strict";
        var A = Object;
        class A {}
        console.log({} instanceof A, Math instanceof A);
    }
    expect_stdout: SyntaxError("Identifier has already been declared")
    node_version: ">=4"
}

keep_instanceof_3: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {}
        A = Object;
        console.log({} instanceof A, Math instanceof A);
    }
    expect: {
        "use strict";
        class A {}
        A = Object;
        console.log({} instanceof A, Math instanceof A);
    }
    expect_stdout: "true true"
    node_version: ">=4"
}

keep_field_reference_1: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {}
        class A {
            p = f;
        }
        console.log(new A().p === new A().p ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        function f() {}
        class A {
            p = f;
        }
        console.log(new A().p === new A().p ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

keep_field_reference_2: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {}
        var A = class {
            p = f;
        };
        console.log(new A().p === new A().p ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        function f() {}
        var A = class {
            p = f;
        };
        console.log(new A().p === new A().p ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

keep_field_reference_3: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {}
        class B {
            p = A;
        }
        console.log(new B().p === new B().p ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        class A {}
        class B {
            p = A;
        }
        console.log(new B().p === new B().p ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

keep_field_reference_4: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var A = class {};
        var B = class {
            p = A;
        };
        console.log(new B().p === new B().p ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        var A = class {};
        var B = class {
            p = A;
        };
        console.log(new B().p === new B().p ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

keep_static_field_reference_1: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {}
        class A {
            static P = f;
        }
        console.log(A.P === A.P ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        class A {
            static P = function() {};
        }
        console.log(A.P === A.P ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

keep_static_field_reference_2: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        function f() {}
        var A = class {
            static P = f;
        };
        console.log(A.P === A.P ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        var A = class {
            static P = function() {};
        };
        console.log(A.P === A.P ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

keep_static_field_reference_3: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {}
        class B {
            static P = A;
        }
        console.log(B.P === B.P ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        class B {
            static P = class {};
        }
        console.log(B.P === B.P ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

keep_static_field_reference_4: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var A = class {};
        var B = class {
            static P = A;
        };
        console.log(B.P === B.P ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        var B = class {
            static P = class {};
        };
        console.log(B.P === B.P ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_805_1: {
    options = {
        inline: true,
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        "use strict";
        (function(a) {
            var unused = class {};
            unused.prototype[a()] = 42;
            (unused.prototype.bar = function() {
                console.log("bar");
            })();
            return unused;
        })(function() {
            console.log("foo");
            return "foo";
        });
    }
    expect: {
        "use strict";
        console.log("foo"),
        console.log("bar");
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

issue_805_2: {
    options = {
        inline: true,
        passes: 3,
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        "use strict";
        (function(a) {
            class unused {}
            unused.prototype[a()] = 42;
            (unused.prototype.bar = function() {
                console.log("bar");
            })();
            return unused;
        })(function() {
            console.log("foo");
            return "foo";
        });
    }
    expect: {
        "use strict";
        console.log("foo"),
        console.log("bar");
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

issue_4681: {
    options = {
        unused: true,
    }
    input: {
        console.log(function(a) {
            class A {
                static p = a = this;
            }
            return typeof a;
        }());
    }
    expect: {
        console.log(function(a) {
            (class {
                static p = a = this;
            });
            return typeof a;
        }());
    }
    expect_stdout: "function"
    node_version: ">=12"
}

issue_4683: {
    options = {
        dead_code: true,
        evaluate: true,
        loops: true,
    }
    input: {
        "use strict";
        for (class extends null {}; void console.log("PASS"); );
    }
    expect: {
        "use strict";
        (class extends null {});
        void console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4685_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        new class {
            f() {
                (function(g) {
                    if (g() !== this)
                        console.log("PASS");
                })(() => this);
            }
        }().f();
    }
    expect: {
        "use strict";
        new class {
            f() {
                (function(g) {
                    if (g() !== this)
                        console.log("PASS");
                })(() => this);
            }
        }().f();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4685_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        new class {
            f() {
                (function(g) {
                    if (g() !== this)
                        console.log("PASS");
                })(() => {
                    if (console)
                        return this;
                });
            }
        }().f();
    }
    expect: {
        "use strict";
        new class {
            f() {
                (function(g) {
                    if (g() !== this)
                        console.log("PASS");
                })(() => {
                    if (console)
                        return this;
                });
            }
        }().f();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4687_1: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        new class {
            f() {
                console.log(function(g) {
                    return g() === this;
                }(() => this) || "PASS");
            }
        }().f();
    }
    expect: {
        "use strict";
        new class {
            f() {
                console.log(function(g) {
                    return g() === this;
                }(() => this) || "PASS");
            }
        }().f();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4687_2: {
    options = {
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        new class {
            f() {
                console.log(function(g) {
                    return g() === this;
                }(() => {
                    if (console)
                        return this;
                }) || "PASS");
            }
        }().f();
    }
    expect: {
        "use strict";
        new class {
            f() {
                console.log(function(g) {
                    return g() === this;
                }(() => {
                    if (console)
                        return this;
                }) || "PASS");
            }
        }().f();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4705: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        class A {
            p = a = "FAIL";
            [console.log(a)];
        }
    }
    expect: {
        (class {
            [console.log("PASS")]() {}
        });
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_4705_strict: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        var a = "PASS";
        class A {
            p = a = "FAIL";
            [console.log(a)];
        }
    }
    expect: {
        "use strict";
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_4720: {
    options = {
        ie: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        class A {
            static p = function f() {};
        }
        console.log(typeof A.p, typeof f);
    }
    expect: {
        class A {
            static p = function f() {};
        }
        console.log(typeof A.p, typeof f);
    }
    expect_stdout: "function undefined"
    node_version: ">=12"
}

issue_4721: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        var a = "foo";
        try {
            (class extends 42 {
                [a = "bar"]() {}
            })
        } catch (e) {
            console.log(a);
        }
    }
    expect: {
        "use strict";
        var a = "foo";
        try {
            (class extends 42 {
                [a = "bar"]() {}
            });
        } catch (e) {
            console.log(a);
        }
    }
    expect_stdout: true
    node_version: ">=4"
}

issue_4722_1: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        try {
            (class extends function*() {} {});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            (class extends function*() {} {});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4722_2: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        try {
            (class extends async function() {} {});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            (class extends async function() {} {});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

issue_4722_3: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        try {
            (class extends async function*() {} {});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            (class extends async function*() {} {});
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=10"
}

issue_4725_1: {
    options = {
        inline: true,
    }
    input: {
        "use strict";
        console.log(typeof new class {
            f() {
                return function g() {
                    return g;
                }();
            }
        }().f());
    }
    expect: {
        "use strict";
        console.log(typeof new class {
            f() {
                return function g() {
                    return g;
                }();
            }
        }().f());
    }
    expect_stdout: "function"
    node_version: ">=4"
}

issue_4725_2: {
    options = {
        if_return: true,
        inline: true,
    }
    input: {
        "use strict";
        new class {
            f() {
                return function() {
                    while (console.log("PASS"));
                }();
            }
        }().f();
    }
    expect: {
        "use strict";
        new class {
            f() {
                while (console.log("PASS"));
            }
        }().f();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

new_target: {
    input: {
        console.log(typeof new class {
            constructor() {
                this.f = () => new.target;
            }
        }().f());
    }
    expect: {
        console.log(typeof new class {
            constructor() {
                this.f = () => new.target;
            }
        }().f());
    }
    expect_stdout: "function"
    node_version: ">=6"
}

issue_4756: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            class A extends 42 {
                static [console.log("foo")] = console.log("bar");
            }
        } catch (e) {
            console.log("baz");
        }
    }
    expect: {
        try {
            (class extends 42 {
                static [console.log("foo")] = console.log("bar");
            });
        } catch (e) {
            console.log("baz");
        }
    }
    expect_stdout: [
        "foo",
        "baz",
    ]
    node_version: ">=12"
}

issue_4756_strict: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        try {
            class A extends 42 {
                static [console.log("foo")] = console.log("bar");
            }
        } catch (e) {
            console.log("baz");
        }
    }
    expect: {
        "use strict";
        try {
            (class extends 42 {
                static [console.log("foo")] = console.log("bar");
            });
        } catch (e) {
            console.log("baz");
        }
    }
    expect_stdout: [
        "foo",
        "baz",
    ]
    node_version: ">=12"
}

issue_4821_1: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        class A {
            static p = void (a = this);
        }
        console.log(typeof a);
    }
    expect: {
        var a;
        (class {
            static p = void (a = this);
        });
        console.log(typeof a);
    }
    expect_stdout: "function"
    node_version: ">=12"
}

issue_4821_2: {
    options = {
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        class A {
            static p = void (a = this);
        }
        console.log(typeof a);
    }
    expect: {
        var a;
        (class {
            static p = void (a = this);
        });
        console.log(typeof a);
    }
    expect_stdout: "function"
    node_version: ">=12"
}

issue_4829_1: {
    options = {
        properties: true,
    }
    input: {
        "use strict";
        try {
            class A extends { f() {} }.f {}
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            class A extends [ () => {} ][0] {}
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4829_2: {
    options = {
        properties: true,
    }
    input: {
        "use strict";
        try {
            class A extends {
                f() {
                    return arguments;
                },
            }.f {}
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            class A extends {
                f() {
                    return arguments;
                },
            }.f {}
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

mangle_properties: {
    mangle = {
        properties: {
            domprops: true,
            keep_quoted: true,
        },
    }
    input: {
        class A {
            static #P = "PASS";
            static get Q() {
                return this.#P;
            }
            #p(n) {
                return (this["q"] = n) * this.r;
            }
            set q(v) {
                this.r = v + 1;
            }
            r = this.#p(6);
        }
        console.log(A.Q, new A().r);
    }
    expect: {
        class A {
            static #t = "PASS";
            static get s() {
                return this.#t;
            }
            #i(t) {
                return (this["q"] = t) * this.e;
            }
            set q(t) {
                this.e = t + 1;
            }
            e = this.#i(6);
        }
        console.log(A.s, new A().e);
    }
    expect_stdout: "PASS 42"
    expect_warnings: [
        "INFO: Preserving reserved property q",
        "INFO: Mapping property #P to #t",
        "INFO: Mapping property Q to s",
        "INFO: Mapping property #p to #i",
        "INFO: Mapping property r to e",
        "INFO: Preserving reserved property log",
    ]
    node_version: ">=14.6"
}

issue_4848: {
    options = {
        if_return: true,
    }
    input: {
        "use strict";
        function f(a) {
            a(function() {
                new A();
            });
            if (!console)
                return;
            class A {
                constructor() {
                    console.log("PASS");
                }
            }
        }
        var g;
        f(function(h) {
            g = h;
        });
        g();
    }
    expect: {
        "use strict";
        function f(a) {
            a(function() {
                new A();
            });
            if (!console)
                return;
            class A {
                constructor() {
                    console.log("PASS");
                }
            }
        }
        var g;
        f(function(h) {
            g = h;
        });
        g();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

drop_unused_self_reference: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {}
        (A.p = A).q = console.log("PASS");
    }
    expect: {
        "use strict";
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4951_1: {
    input: {
        class A {
            static#p = console.log("PASS");
        }
    }
    expect_exact: 'class A{static#p=console.log("PASS")}'
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_4951_2: {
    input: {
        new class {
            constructor() {
                this.#f().then(console.log);
            }
            async#f() {
                return await "PASS";
            }
        }();
    }
    expect_exact: 'new class{constructor(){this.#f().then(console.log)}async#f(){return await"PASS"}};'
    expect_stdout: "PASS"
    node_version: ">=14.6"
}

issue_4962_1: {
    options = {
        ie: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            function f() {
                while (console.log(typeof g));
            }
            class A {
                static p = f();
            }
        })(function g() {});
    }
    expect: {
        (function() {
            function f() {
                while (console.log(typeof g));
            }
            (class {
                static c = f();
            });
        })(function g() {});
    }
    expect_stdout: "undefined"
    node_version: ">=12"
}

issue_4962_1_strict: {
    options = {
        ie: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        (function() {
            function f() {
                while (console.log(typeof g));
            }
            class A {
                static p = f();
            }
        })(function g() {});
    }
    expect: {
        "use strict";
        (function g() {});
        while (console.log(typeof g));
    }
    expect_stdout: "undefined"
    node_version: ">=12"
}

issue_4962_1_strict_direct: {
    options = {
        ie: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            function f() {
                "use strict";
                while (console.log(typeof g));
            }
            class A {
                static p = f();
            }
        })(function g() {});
    }
    expect: {
        (function g() {}),
        void class {
            static c = function() {
                "use strict";
                while (console.log(typeof g));
            }();
        };
    }
    expect_stdout: "undefined"
    node_version: ">=12"
}

issue_4962_2: {
    options = {
        ie: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function f() {}(function g() {
            function h() {
                f;
            }
            class A {
                static p = h();
            }
        }, typeof g));
    }
    expect: {
        console.log(function f() {}(function g() {
            function h() {
                f;
            }
            (class {
                static c = h();
            });
        }));
    }
    expect_stdout: "undefined"
    node_version: ">=12"
}

issue_4962_2_strict: {
    options = {
        ie: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        console.log(function f() {}(function g() {
            function h() {
                f;
            }
            class A {
                static p = h();
            }
        }, typeof g));
    }
    expect: {
        "use strict";
        console.log(function f() {}(function g() {
            f;
        }));
    }
    expect_stdout: "undefined"
    node_version: ">=12"
}

issue_4962_2_strict_direct: {
    options = {
        ie: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function f() {}(function g() {
            function h() {
                "use strict";
                f;
            }
            class A {
                static p = h();
            }
        }, typeof g));
    }
    expect: {
        console.log(function f() {}(function g() {
            (class {
                static c = function() {
                    "use strict";
                    f;
                }();
            });
        }));
    }
    expect_stdout: "undefined"
    node_version: ">=12"
}

issue_4962_2_strict_direct_inline: {
    options = {
        directives: true,
        ie: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(function f() {}(function g() {
            function h() {
                "use strict";
                f;
            }
            class A {
                static p = h();
            }
        }, typeof g));
    }
    expect: {
        console.log(function f() {}(function g() {
            (class {
                static c = f;
            });
        }));
    }
    expect_stdout: "undefined"
    node_version: ">=12"
}

issue_4982_1: {
    options = {
        dead_code: true,
    }
    input: {
        "use strict";
        try {} catch (e) {
            class A extends 42 {}
        }
        console.log("PASS");
    }
    expect: {
        "use strict";
        {
            class A {}
        }
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4982_2: {
    options = {
        dead_code: true,
    }
    input: {
        var a = "PASS";
        try {} catch (e) {
            class A {
                static p = a = "FAIL";
            }
        }
        console.log(a);
    }
    expect: {
        var a = "PASS";
        {
            class A {}
        }
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_4992: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        class A {
            static P = this;
            get p() {}
        }
        console.log(typeof A.P);
    }
    expect: {
        console.log(typeof class {
            static P = this;
            get p() {}
        }.P);
    }
    expect_stdout: "function"
    node_version: ">=12"
}

issue_4996_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        console.log(new class A {
            p = a-- && new A();
        }().p.p);
    }
    expect: {
        var a = 1;
        console.log(new class A {
            p = a-- && new A();
        }().p.p);
    }
    expect_stdout: "0"
    node_version: ">=12"
}

issue_4996_2: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1;
        console.log(new class A {
            p = a-- && new A();
        }().p.p);
    }
    expect: {
        var a = 1;
        console.log(new class A {
            p = a-- && new A();
        }().p.p);
    }
    expect_stdout: "0"
    node_version: ">=12"
}

issue_5015_1: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        var a;
        try {
            (class a {
                [a]() {}
            });
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        var a;
        try {
            (class a {
                [a]() {}
            });
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5015_2: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        "use strict";
        try {
            new class A {
                [(A, 42)]() {}
            }();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            new class A {
                [(A, 42)]() {}
            }();
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5015_3: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        "use strict";
        (class A {
            static f() {
                return A;
            }
        });
        console.log("PASS");
    }
    expect: {
        "use strict";
        (class A {});
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5015_4: {
    options = {
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        (class A {
            static f() {
                return A;
            }
        });
        console.log("PASS");
    }
    expect: {
        "use strict";
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5053_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        try {
            console.log(new class A {
                constructor() {
                    A = 42;
                }
            }());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            console.log(new class A {
                constructor() {
                    A = 42;
                }
            }());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5053_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        "use strict";
        try {
            console.log(new class A {
                f() {
                    A = 42;
                }
            }().f());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        try {
            console.log(new class A {
                f() {
                    A = 42;
                }
            }().f());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5053_3: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        try {
            console.log(new class A {
                p = A = 42;
            }().p);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        try {
            console.log(new class A {
                p = A = 42;
            }().p);
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5053_4: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {
            constructor() {
                A = 42;
            }
        }
        try {
            console.log(new A());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect: {
        "use strict";
        class A {
            constructor() {
                A = 42;
            }
        }
        try {
            console.log(new A());
        } catch (e) {
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5082_1: {
    options = {
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            class A {
                p = console.log("PASS");
                q() {}
            }
            class B {
                static P = new A();
            }
        })();
    }
    expect: {
        (function() {
            class A {
                p = console.log("PASS");
                q() {}
            }
            (class {
                static c = new A();
            });
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5082_1_strict: {
    options = {
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        (function() {
            class A {
                p = console.log("PASS");
                q() {}
            }
            class B {
                static P = new A();
            }
        })();
    }
    expect: {
        "use strict";
        (function() {
            class A {
                p = console.log("PASS");
                q() {}
            }
            new A();
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5082_2: {
    options = {
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function() {
            class A {
                p = console.log("PASS");
                q() {}
            }
            class B {
                static P = new A();
            }
        })();
    }
    expect: {
        (function() {
            class A {
                p = console.log("PASS");
                q() {}
            }
            (class {
                static c = new A();
            });
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5082_2_static: {
    options = {
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        "use strict";
        (function() {
            class A {
                p = console.log("PASS");
                q() {}
            }
            class B {
                static P = new A();
            }
        })();
    }
    expect: {
        "use strict";
        void new class {
            p = console.log("PASS");
            q() {}
        }();
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5142: {
    options = {
        evaluate: true,
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 0, b;
        if (++a)
            new class {
                p = b = null;
                constructor(c) {
                    console.log(c ? "FAIL" : "PASS");
                }
            }(b, a);
    }
    expect: {
        var a = 0, b;
        if (++a)
            new class {
                p = b = null;
                constructor(c) {
                    console.log(c ? "FAIL" : "PASS");
                }
            }(b, 1);
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5294_1: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (class A {
            static p = console.log(typeof A);
        });
    }
    expect: {
        (class A {
            static c = console.log(typeof A);
        });
    }
    expect_stdout: "function"
    node_version: ">=12"
}

issue_5294_2: {
    options = {
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        class A {
            static p = console.log(typeof A);
        }
    }
    expect: {
        class A {
            static p = console.log(typeof A);
        }
    }
    expect_stdout: "function"
    node_version: ">=12"
}

issue_5294_3: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = this;
        (class A {
            static p = console.log(a === A ? "FAIL" : "PASS");
        });
    }
    expect: {
        var a = this;
        (class A {
            static p = console.log(a === A ? "FAIL" : "PASS");
        });
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5294_4: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        (class A {
            static p = function() {
                var a = this;
                console.log(a === A ? "FAIL" : "PASS");
            }();
        });
    }
    expect: {
        (class A {
            static p = function() {
                console.log(this === A ? "FAIL" : "PASS");
            }();
        });
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5322: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 41;
        class A {
            static p() {
                console.log(++a);
            }
            static q = this.p();
        }
    }
    expect: {
        var a = 41;
        (class {
            static p() {
                console.log(++a);
            }
            static q = this.p();
        });
    }
    expect_stdout: "42"
    node_version: ">=12"
}

issue_5352: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a) {
            var b;
            new class {
                [b = console.log(a)] = b;
            }(a.p);
        }
        f("PASS");
    }
    expect: {
        function f(a) {
            var b;
            new class {
                [b = console.log(a)] = b;
            }(a.p);
        }
        f("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5387: {
    options = {
        properties: true,
    }
    input: {
        "use strict";
        (function(a) {
            try {
                class A extends a {}
            } catch (e) {
                console.log("PASS");
            }
        })({
            f() {
                return this;
            }
        }.f);
    }
    expect: {
        "use strict";
        (function(a) {
            try {
                class A extends a {}
            } catch (e) {
                console.log("PASS");
            }
        })({
            f() {
                return this;
            }
        }.f);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5389_1: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        function log(m, n) {
            console.log(m, n);
        }
        var a = log;
        class A {
            [a = "FAIL"] = a = "PASS";
        }
        var b = new A();
        log(a, b.FAIL);
    }
    expect: {
        function log(m, n) {
            console.log(m, n);
        }
        var a = log;
        class A {
            [a = "FAIL"] = a = "PASS";
        }
        var b = new A();
        log(a, b.FAIL);
    }
    expect_stdout: "PASS PASS"
    node_version: ">=12"
}

issue_5389_2: {
    options = {
        collapse_vars: true,
        toplevel: true,
    }
    input: {
        function log(m, n) {
            console.log(m, n);
        }
        var a = log;
        var A = class {
            [a = "FAIL"] = a = "PASS";
        };
        var b = new A();
        log(a, b.FAIL);
    }
    expect: {
        function log(m, n) {
            console.log(m, n);
        }
        var a = log;
        var A;
        var b = new class {
            [a = "FAIL"] = a = "PASS";
        }();
        log(a, b.FAIL);
    }
    expect_stdout: "PASS PASS"
    node_version: ">=12"
}

issue_5436: {
    options = {
        merge_vars: true,
    }
    input: {
        function f(a) {
            class A {
                p = a;
            }
            var b = "FAIL";
            A == b && b();
            return new A();
        }
        console.log(f("PASS").p);
    }
    expect: {
        function f(a) {
            class A {
                p = a;
            }
            var b = "FAIL";
            A == b && b();
            return new A();
        }
        console.log(f("PASS").p);
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_5481: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        var a = "FAIL 1", log = console.log;
        try {
            a = "PASS";
            (class extends 42 {});
            log("FAIL 2", a);
        } catch (e) {
            log(a);
        }
    }
    expect: {
        "use strict";
        var a = "FAIL 1", log = console.log;
        try {
            a = "PASS";
            (class extends 42 {});
            log("FAIL 2", a);
        } catch (e) {
            log(a);
        }
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5489: {
    options = {
        side_effects: true,
    }
    input: {
        (class {
            [console.log("foo")];
            static {
                console.log("bar");
            }
            static [console.log("baz")]() {}
        });
    }
    expect: {
        (class {
            [(console.log("foo"), console.log("baz"))];
            static {
                console.log("bar");
            }
        });
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
    ]
    node_version: ">=16"
}

issue_5489_strict: {
    options = {
        side_effects: true,
    }
    input: {
        "use strict";
        (class {
            [console.log("foo")];
            static {
                console.log("bar");
            }
            static [console.log("baz")]() {}
        });
    }
    expect: {
        "use strict";
        console.log("foo"),
        console.log("baz"),
        (() => (() => {
            console.log("bar");
        })())();
    }
    expect_stdout: [
        "foo",
        "baz",
        "bar",
    ]
    node_version: ">=16"
}

issue_5502: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        var a = "FAIL";
        class A {
            static p = a;
            [a = "PASS"];
        }
        try {
            b++;
        } finally {
            var a, b = 42;
        }
        console.log(a, b);
    }
    expect: {
        "use strict";
        var a = "FAIL";
        class A {
            static p = a;
            [a = "PASS"];
        }
        try {
            b++;
        } finally {
            var a, b = 42;
        }
        console.log(a, b);
    }
    expect_stdout: "PASS 42"
    node_version: ">=12"
}

issue_5504: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        var a;
        console.log((a = 42, class {
            static p;
        }).p);
    }
    expect: {
        "use strict";
        var a;
        console.log((a = 42, class {
            static p;
        }).p);
    }
    expect_stdout: "undefined"
    node_version: ">=12"
}

issue_5512: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        a = "PASS";
        class A {
            static {
                console.log(a);
            }
            static p = "PASS";
        }
        var a;
    }
    expect: {
        "use strict";
        a = "PASS";
        class A {
            static {
                console.log(a);
            }
            static p = "PASS";
        }
        var a;
    }
    expect_stdout: "PASS"
    node_version: ">=16"
}

issue_5531_1: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        class A {
            p = function() {
                var a = function f() {
                    if (!a)
                        console.log("foo");
                    return 42;
                }(a++);
            }();
        }
        new A();
        new A();
    }
    expect: {
        class A {
            p = function() {
                var a = function f() {
                    if (!a)
                        console.log("foo");
                    return 42;
                }(a++);
            }();
        }
        new A();
        new A();
    }
    expect_stdout: [
        "foo",
        "foo",
    ]
    node_version: ">=12"
}

issue_5531_2: {
    options = {
        inline: true,
        toplevel: true,
    }
    input: {
        class A {
            static p = function() {
                var a = function f() {
                    if (!a)
                        console.log("foo");
                    return 42;
                }(a++);
            }();
        }
        new A();
        new A();
    }
    expect: {
        class A {
            static p = (a = function f() {
                if (!a)
                    console.log("foo");
                return 42;
            }(a++), void 0);
        }
        var a;
        new A();
        new A();
    }
    expect_stdout: "foo"
    node_version: ">=12"
}

issue_5531_3: {
    options = {
        inline: true,
    }
    input: {
        class A {
            static {
                (function() {
                    var a = function f() {
                        if (!a)
                            console.log("foo");
                        return 42;
                    }(a++);
                })();
            }
        }
        new A();
        new A();
    }
    expect: {
        class A {
            static {
                a = function f() {
                    if (!a)
                        console.log("foo");
                    return 42;
                }(a++),
                void 0;
                var a;
            }
        }
        new A();
        new A();
    }
    expect_stdout: "foo"
    node_version: ">=16"
}

issue_5662: {
    options = {
        inline: true,
        reduce_vars: true,
    }
    input: {
        console.log(new (function() {
            var g = function(a) {
                return a;
            };
            return class {
                h(b) {
                    return g(b);
                }
            };
        }())().h("PASS"));
    }
    expect: {
        console.log(new (function() {
            var g = function(a) {
                return a;
            };
            return class {
                h(b) {
                    return g(b);
                }
            };
        }())().h("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_5682_class_key: {
    mangle = {
        properties: true,
    }
    input: {
        "use strict";
        function f(a) {
            return "foo" in a;
        }
        class A {
            foo() {}
        }
        console.log(f(new A()) ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        function f(o) {
            return "o" in o;
        }
        class A {
            o() {}
        }
        console.log(f(new A()) ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5682_class_key_computed: {
    mangle = {
        properties: true,
    }
    input: {
        "use strict";
        function f(a) {
            return "foo" in a;
        }
        class A {
            ["foo"]() {}
        }
        console.log(f(new A()) ? "PASS" : "FAIL");
    }
    expect: {
        "use strict";
        function f(o) {
            return "o" in o;
        }
        class A {
            ["o"]() {}
        }
        console.log(f(new A()) ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_5724: {
    options = {
        arrows: true,
        inline: true,
        keep_fargs: true,
        toplevel: true,
        unused: true,
    }
    input: {
        "use strict";
        class A {
            static P = function(a) {
                console.log(a, a);
            }(a);
        }
    }
    expect: {
        "use strict";
        (function(a) {
            console.log(a, a);
        })(a);
    }
    expect_stdout: ReferenceError("a is not defined")
    node_version: ">=12"
}

issue_5735_1: {
    options = {
        inline: true,
    }
    input: {
        console.log(typeof function(a) {
            return class {
                static P = { ...a };
            };
        }([ 42..p ] = []));
    }
    expect: {
        console.log(typeof function(a) {
            return class {
                static P = { ...a };
            };
        }([ 42..p ] = []));
    }
    expect_stdout: "function"
    node_version: ">=12"
}

issue_5735_2: {
    options = {
        inline: true,
    }
    input: {
        console.log(typeof function(a) {
            return class {
                p = a;
            };
        }(console.log("PASS")));
    }
    expect: {
        console.log(typeof function(a) {
            return class {
                p = a;
            };
        }(console.log("PASS")));
    }
    expect_stdout: [
        "PASS",
        "function",
    ]
    node_version: ">=12"
}

issue_5747_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        (async function() {
            var a = await 42;
            class A {
                static P = a && console.log(typeof this);
            }
        })();
    }
    expect: {
        "use strict";
        (async function() {
            var a = await 42;
            class A {
                static P = a && console.log(typeof this);
            }
        })();
    }
    expect_stdout: "function"
    node_version: ">=12"
}

issue_5747_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        "use strict";
        (async function() {
            var a = await 42;
            class A {
                static {
                    a && console.log(typeof this);
                }
            }
        })();
    }
    expect: {
        "use strict";
        (async function() {
            var a = await 42;
            class A {
                static {
                    a && console.log(typeof this);
                }
            }
        })();
    }
    expect_stdout: "function"
    node_version: ">=16"
}
