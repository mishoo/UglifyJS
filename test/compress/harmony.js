arrow_function_parens: {
    input: {
        something && (() => {});
    }
    expect_exact: "something&&(()=>{});"
}
arrow_function_parens_2: {
    input: {
        (() => null)();
    }
    expect_exact: "(()=>null)();"
}

typeof_arrow_functions: {
    options = {
        evaluate: true
    }
    input: {
        var foo = typeof (x => null);
        console.log(foo);
    }
    expect_exact: "var foo=\"function\";console.log(foo);"
    expect_stdout: "function"
    node_version: ">=4"
}

classes: {
    input: {
        class SomeClass {
            constructor() {
            };
            foo() {};
        };
        class NoSemi {
            constructor(...args) {
            }
            foo() {}
        };
        class ChildClass extends SomeClass {};
        var asExpression = class AsExpression {};
        var nameless = class {};
    }
    expect_exact: "class SomeClass{constructor(){}foo(){}}class NoSemi{constructor(...args){}foo(){}}class ChildClass extends SomeClass{}var asExpression=class AsExpression{};var nameless=class{};"
}

class_statics: {
    input: {
        x = class {
            static staticMethod() {}
            static get foo() {}
            static set bar() {}
            static() { /* "static" can be a method name! */ }
            get() { /* "get" can be a method name! */ }
            set() { /* "set" can be a method name! */ }
        }
    }
    expect_exact: "x=class{static staticMethod(){}static get foo(){}static set bar(){}static(){}get(){}set(){}};"
}

class_name_can_be_mangled: {
    mangle = { };
    input: {
        function x() {
            class Foo {
            }
            var class1 = Foo;
            var class2 = class Bar {};
        }
    }
    expect: {
        function x() {
            class a { }
            var s = a;
            var c = class a {};
        }
    }
}

class_name_can_be_preserved: {
    mangle = {
        keep_classnames: true
    }
    input: {
        function x() {
            (class Baz { });
            class Foo {};
        }
    }
    expect: {
        function x() {
            (class Baz { });
            class Foo {};
        }
    }
}

classes_can_have_generators: {
    input: {
        class Foo {
            *bar() {}
            static *baz() {}
        }
    }
    expect: {
        class Foo {
            *bar() {}
            static *baz() {}
        }
    }
}

classes_can_have_computed_generators: {
    input: {
        class C4 {
            *['constructor']() {}
        }
    }
    expect: {
        class C4 {
            *['constructor']() {}
        }
    }
}

classes_can_have_computed_static: {
    input: {
        class C4 {
            static ['constructor']() {}
        }
    }
    expect: {
        class C4 {
            static ['constructor']() {}
        }
    }
}

class_methods_and_getters_with_keep_quoted_props_enabled: {
    beautify = {
        quote_style: 3,
        keep_quoted_props: true,
    }
    input: {
        class clss {
            a() {}
            "b"() {}
            get c() { return "c"}
            get "d"() { return "d"}
            set e(a) { doSomething(a); }
            set 'f'(a) { doSomething(b); }
            static g() {}
            static "h"() {}
        }
    }
    expect_exact: 'class clss{a(){}"b"(){}get c(){return"c"}get"d"(){return"d"}set e(a){doSomething(a)}set\'f\'(a){doSomething(b)}static g(){}static"h"(){}}'
}

classes_with_expression_as_expand: {
    input: {
        class D extends (calls++, C) {}
    }
    expect_exact: "class D extends(calls++,C){}"
}

new_target: {
    input: {
        new.target;
        new.target.name;
    }
    expect_exact: "new.target;new.target.name;"
}

number_literals: {
    input: {
        0b1001;
        0B1001;
        0o11;
        0O11;
    }

    expect: {
        9;
        9;
        9;
        9;
    }
}

import_statement: {
    input: {
        import "mod-name";
        import Foo from "bar";
        import { Bar, Baz } from 'lel';
        import Bar, { Foo } from 'lel';
        import { Bar as kex, Baz as food } from 'lel';
    }
    expect_exact: 'import"mod-name";import Foo from"bar";import{Bar,Baz}from"lel";import Bar,{Foo}from"lel";import{Bar as kex,Baz as food}from"lel";'
}

import_all_statement: {
    input: {
        import * from 'lel';
        import * as Lel from 'lel';
    }
    expect_exact: 'import*from"lel";import*as Lel from"lel";'
}

export_statement: {
    options = {
        evaluate: true,
    }
    input: {
        export default 1 + 2;
        export var foo = 4;
        export let foo = 6;
        export const foo = 6;
        export function foo() {};
        export class foo { };
    }
    expect_exact: "export default 3;export var foo=4;export let foo=6;export const foo=6;export function foo(){};export class foo{};"
}

export_default_object_expression: {
    options = {
        evaluate: true,
    }
    input: {
        export default {
            foo: 1 + 2,
            bar() { return 4; },
            get baz() { return this.foo; },
        };
    }
    expect_exact: "export default{foo:3,bar(){return 4},get baz(){return this.foo}};"
}

export_default_array: {
    options = {
        evaluate: true,
    }
    input: {
        export default [ 1 + 2, foo ];
    }
    expect_exact: "export default[3,foo];"
}

export_default_anon_function: {
    options = {
        evaluate: true,
    }
    input: {
        export default function(){
            console.log(1 + 2);
        }
    }
    expect_exact: "export default function(){console.log(3)};"
}

export_default_anon_class: {
    options = {
        evaluate: true,
    }
    input: {
        export default class {
            foo() { console.log(1 + 2); }
        }
    }
    expect_exact: "export default class{foo(){console.log(3)}};"
}

export_module_statement: {
    input: {
        export * from "a.js";
        export {A} from "a.js";
        export {A, B} from "a.js";
        export {C};
    }
    expect_exact: 'export*from"a.js";export{A}from"a.js";export{A,B}from"a.js";export{C};'
}

import_statement_mangling: {
    mangle = { toplevel: true };
    input: {
        import Foo from "foo";
        import Bar, {Food} from "lel";
        import {What as Whatever} from "lel";
        Foo();
        Bar();
        Food();
        Whatever();
    }
    expect: {
        import o from "foo";
        import m, {Food as r} from "lel";
        import {What as f} from "lel";
        o();
        m();
        r();
        f();
    }
}

export_statement_mangling: {
    mangle = { };
    input: {
        export var foo = 6;
        export function bar() { }
        export class Baz { }
        bar(foo, Baz)
    }
    expect: {
        export var foo = 6;
        export function bar() { }
        export class Baz { }
        bar(foo, Baz)
    }
}

// https://github.com/mishoo/UglifyJS2/issues/1021
regression_for_of_const: {
    input: {
        for (const x of y) {}
        for (const x in y) {}
    }
    expect: {
        for (const x of y);for (const x in y);
    }
}

// Fabio: My patches accidentally caused a crash whenever
// there's an extraneous set of parens around an object.
regression_cannot_destructure: {
    input: {
        var x = ({ x : 3 });
        x(({ x: 3 }));
    }
    expect_exact: "var x={x:3};x({x:3});";
}

regression_cannot_use_of: {
    input: {
        function of() {
        }
        var of = "is a valid variable name";
        of = { of: "is ok" };
        x.of;
        of: foo()
    }
    expect: {
        function of(){}
        var of="is a valid variable name";
        of={of:"is ok"};
        x.of;
        foo();  /* Label statement missing? No prob. */
    }
}

fat_arrow_as_param: {
    input: {
        foo(x => x);
        foo(x => x, y => y);

        foo(x => (x, x));
        foo(x => (x, x), y => (y, y));
    }
    expect_exact: "foo(x=>x);foo(x=>x,y=>y);foo(x=>(x,x));foo(x=>(x,x),y=>(y,y));"
}

default_assign: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        function f(a, b = 3) {
            console.log(a);
        }

        g = ([[] = 123]) => {};
        h = ([[x, y, z] = [4, 5, 6]] = []) => {};

        function i([[x, y, z] = [4, 5, 6]] = []) {
            console.log(b);
        };
    }
    expect: {
        function f(a) {
            console.log(a);
        }

        g = ([[] = 123]) => {};
        h = ([[x, y, z] = [4, 5, 6]] = []) => {};

        function i([[x, y, z] = [4, 5, 6]] = []) {
            console.log(b);
        };
    }
}

expansion: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        function f(a, ...b) {
            console.log(a);
        }
    }
    expect: {
        function f(a) {
            console.log(a);
        }
    }
}

issue_1613: {
  mangle = { toplevel: true };
  input: {
    const name = 1;
    const foo = {
      name
    };
  }
  expect_exact: "const n=1;const c={name:n};"
}

format_methods: {
    beautify = {
        beautify: true,
    }
    input: {
        class A extends B {constructor(a){x()} static s(b,c){y()} run(d,e,f){z()}}
    }
    expect_exact: [
        "class A extends B {",
        "    constructor(a) {",
        "        x();",
        "    }",
        "    static s(b, c) {",
        "        y();",
        "    }",
        "    run(d, e, f) {",
        "        z();",
        "    }",
        "}",
    ]
}

issue_1898: {
    options = {
    }
    mangle = {
    }
    input: {
        class Foo {
            bar() {
                for (const x of [ 6, 5 ]) {
                    for (let y of [ 4, 3 ]) {
                        for (var z of [ 2, 1 ]) {
                            console.log(x, y, z);
                        }
                    }
                }
            }
        }
        new Foo().bar();
    }
    expect: {
        class Foo {
            bar() {
                for (const f of [ 6, 5 ])
                    for (let r of [ 4, 3 ])
                        for (var o of [ 2, 1 ])
                            console.log(f, r, o);
            }
        }
        new Foo().bar();
    }
}

issue_1753: {
    mangle = { safari10: true };
    input: {
        class SomeClass {
            constructor(props) {
                let pickedSets = [];
                for (let i = 0; i < 6; i++) {
                    pickedSets.push({
                        mainDrawNumbers: [],
                        extraDrawNumbers: []
                    });
                }
            }
        }
    }
    expect: {
        class SomeClass {
            constructor(r) {
                let s = [];
                for (let a = 0; a < 6; a++)
                    s.push({
                        mainDrawNumbers: [],
                        extraDrawNumbers: []
                    });
            }
        }
    }
}

issue_1753_disable: {
    mangle = { safari10: false }
    input: {
        class SomeClass {
            constructor(props) {
                let pickedSets = [];
                for (let i = 0; i < 6; i++) {
                    pickedSets.push({
                        mainDrawNumbers: [],
                        extraDrawNumbers: []
                    });
                }
            }
        }
    }
    expect: {
        class SomeClass {
            constructor(r) {
                let s = [];
                for (let r = 0; r < 6; r++)
                    s.push({
                        mainDrawNumbers: [],
                        extraDrawNumbers: []
                    });
            }
        }
    }
}

class_extends: {
    options = {
        evaluate: true,
    }
    input: {
        function f() {
            class foo extends bar {}
            class pro extends some.prop {}
            class arr extends stuff[1 - 1] {}
            class bin extends (a || b) {}
            class seq extends (a, b) {}
            class ter extends (a ? b : c) {}
            class uni extends (!0) {}
        }
    }
    expect_exact: "function f(){class foo extends bar{}class pro extends some.prop{}class arr extends stuff[0]{}class bin extends(a||b){}class seq extends(a,b){}class ter extends(a?b:c){}class uni extends(!0){}}"
}

class_extends_class: {
    options = {
    }
    input: {
        class anon extends class {} {}
        class named extends class base {} {}
    }
    expect_exact: "class anon extends class{}{}class named extends class base{}{}"
}

class_extends_function: {
    options = {
    }
    input: {
        class anon extends function(){} {}
        class named extends function base(){} {}
    }
    expect_exact: "class anon extends function(){}{}class named extends function base(){}{}"
}

class_extends_regex: {
    options = {
    }
    input: {
        function f() {
            class rx1 extends (/rx/) {}
            // class rx2 extends /rx/ {}  // FIXME - parse error
        }
    }
    expect_exact: "function f(){class rx1 extends(/rx/){}}"
}

issue_2028: {
    options = {
        side_effects: true,
    }
    input: {
        var a = {};
        (function(x) {
            x.X = function() {
                return X;
            };
            class X {
                static hello() {
                    console.log("hello");
                }
            }
        }(a));
        a.X().hello();
    }
    expect: {
        var a = {};
        (function(x) {
            x.X = function() {
                return X;
            };
            class X {
                static hello() {
                    console.log("hello");
                }
            }
        }(a));
        a.X().hello();
    }
    expect_stdout: "hello"
    node_version: ">=6"
}

class_expression_statement: {
    options = {
        toplevel: false,
        side_effects: false,
        unused: false,
    }
    input: {
        (class {});
        (class NamedClassExpr {});
        let expr = (class AnotherClassExpr {});
        class C {}
    }
    expect_exact: "(class{});(class NamedClassExpr{});let expr=class AnotherClassExpr{};class C{}"
}

class_expression_statement_unused: {
    options = {
        toplevel: false,
        side_effects: true,
        unused: true,
    }
    input: {
        (class {});
        (class NamedClassExpr {});
        let expr = (class AnotherClassExpr {});
        class C {}
    }
    expect_exact: "let expr=class{};class C{}"
}

class_expression_statement_unused_toplevel: {
    options = {
        toplevel: true,
        side_effects: true,
        unused: true,
    }
    input: {
        (class {});
        (class NamedClassExpr {});
        let expr = (class AnotherClassExpr {});
        class C {}
    }
    expect_exact: ""
}

export_default_function_decl: {
    options = {
        toplevel: true,
        passes: 3,
        unused: true,
    }
    input: {
        // do not drop "unused" exports
        export default function Foo() {};
        export function Far() {};
    }
    expect_exact: "export default function Foo(){};export function Far(){};"
}

export_default_class_decl: {
    options = {
        toplevel: true,
        passes: 3,
        unused: true,
    }
    input: {
        // do not drop "unused" exports
        export default class Car {};
        export class Cab {};
    }
    expect_exact: "export default class Car{};export class Cab{};"
}
