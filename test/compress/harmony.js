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
        var foo = typeof (x) => null;
    }
    expect_exact: "var foo=\"function\";"
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
            var class1 = Foo
            var class2 = class Bar {}
        }
    }
    expect: {
        function x() {
            class a { }
            var n = a
            var r = class a {}
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
    expect_exact: "import\"mod-name\";import Foo from\"bar\";import{Bar,Baz}from\"lel\";import Bar,{Foo}from\"lel\";import{Bar as kex,Baz as food}from\"lel\";"
}

export_statement: {
    input: {
        export default 1;
        export var foo = 4;
        export let foo = 6;
        export const foo = 6;
        export function foo() {};
        export class foo { };
    }
    expect_exact: "export default 1;export var foo=4;export let foo=6;export const foo=6;export function foo(){};export class foo{};"
}

import_statement_mangling: {
    mangle = { };
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
        import l from "foo";
        import e, {Food as o} from "lel";
        import {What as f} from "lel";
        l();
        e();
        o();
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
