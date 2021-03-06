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
    expect_exact: 'var o=new class A{"#p";static #p="PASS";async;get q(){return A.#p}[6*7]=console?"foo":"bar"};for(var k in o)console.log(k,o[k]);console.log(o.q);'
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
    expect_exact: "(new class A{static*#f(){yield 3*A.#p}async #g(){for(var a of A.#f())return a*await 2}static get #p(){return 7}get q(){return this.#g()}}).q.then(console.log);"
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
        if (console) {
            class B {}
        }
        console.log(typeof A, typeof B);
    }
    expect_stdout: "undefined undefined"
    node_version: ">=4"
}

drop_extends: {
    options = {
        inline: true,
        passes: 2,
        pure_getters: "strict",
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

keep_extends: {
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
            static p = a = "PASS";
        }
        console.log(a);
    }
    expect_stdout: "PASS"
    node_version: ">=12"
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
            (() => console.log(await))();
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=12"
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

issue_805_1: {
    options = {
        inline: true,
        passes: 2,
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
        passes: 2,
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
            class A {
                static p = a = this;
            }
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
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_4720: {
    options = {
        ie8: true,
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
