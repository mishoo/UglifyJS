arrow_functions: {
    input: {
        (a) => b;  // 1 args
        (a, b) => c;  // n args
        () => b;  // 0 args
        (a) => (b) => c;  // func returns func returns func
        (a) => ((b) => c);  // So these parens are dropped
        () => (b,c) => d;  // func returns func returns func
        a=>{return b;}
        a => 'lel';  // Dropping the parens
    }
    expect_exact: "a=>b;(a,b)=>c;()=>b;a=>b=>c;a=>b=>c;()=>(b,c)=>d;a=>{return b};a=>\"lel\";"
}

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

regression_arrow_functions_and_hoist: {
    options = {
        hoist_vars: true,
        hoist_funs: true
    }
    input: {
        (a) => b;
    }
    expect_exact: "a=>b;"
}

regression_assign_arrow_functions: {
    input: {
        oninstall = e => false;
        oninstall = () => false;
    }
    expect: {
        oninstall=e=>false;
        oninstall=()=>false;
    }
}

computed_property_names: {
    input: {
        obj({ ["x" + "x"]: 6 });
    }
    expect_exact: 'obj({["x"+"x"]:6});'
}

typeof_arrow_functions: {
    options = {
        evaluate: true
    }
    input: {
        typeof (x) => null;
    }
    expect_exact: "\"function\";"
}

template_strings: {
    input: {
        ``;
        `xx\`x`;
        `${ foo + 2 }`;
        ` foo ${ bar + `baz ${ qux }` }`;
    }
    expect_exact: "``;`xx\\`x`;`${foo+2}`;` foo ${bar+`baz ${qux}`}`;";
}

template_string_prefixes: {
    input: {
        String.raw`foo`;
        foo `bar`;
    }
    expect_exact: "String.raw`foo`;foo`bar`;";
}

destructuring_arguments: {
    input: {
        (function ( a ) { });
        (function ( [ a ] ) { });
        (function ( [ a, b ] ) { });
        (function ( [ [ a ] ] ) { });
        (function ( [ [ a, b ] ] ) { });
        (function ( [ a, [ b ] ] ) { });
        (function ( [ [ b ], a ] ) { });

        (function ( { a } ) { });
        (function ( { a, b } ) { });

        (function ( [ { a } ] ) { });
        (function ( [ { a, b } ] ) { });
        (function ( [ a, { b } ] ) { });
        (function ( [ { b }, a ] ) { });

        ( [ a ] ) => { };
        ( [ a, b ] ) => { };

        ( { a } ) => { };
        ( { a, b, c, d, e } ) => { };

        ( [ a ] ) => b;
        ( [ a, b ] ) => c;

        ( { a } ) => b;
        ( { a, b } ) => c;
    }
    expect: {
        (function(a){});
        (function([a]){});
        (function([a,b]){});
        (function([[a]]){});
        (function([[a,b]]){});
        (function([a,[b]]){});
        (function([[b],a]){});

        (function({a}){});
        (function({a,b}){});

        (function([{a}]){});
        (function([{a,b}]){});
        (function([a,{b}]){});
        (function([{b},a]){});

        ([a])=>{};
        ([a,b])=>{};

        ({a})=>{};
        ({a,b,c,d,e})=>{};

        ([a])=>b;
        ([a,b])=>c;

        ({a})=>b;
        ({a,b})=>c;
    }
}

default_arguments: {
    input: {
        function x(a = 6) { }
        function x(a = (6 + 5)) { }
        function x({ foo } = {}, [ bar ] = [ 1 ]) { }
    }
    expect_exact: "function x(a=6){}function x(a=6+5){}function x({foo}={},[bar]=[1]){}"
}

default_values_in_destructurings: {
    input: {
        function x({a=(4), b}) {}
        function x([b, c=(12)]) {}
        var { x = (6), y } = x;
        var [ x, y = (6) ] = x;
    }
    expect_exact: "function x({a=4,b}){}function x([b,c=12]){}var{x=6,y}=x;var[x,y=6]=x;"
}

concise_methods: {
    input: {
        x = {
            foo(a, b) {
                return x;
            }
        }
        y = {
            foo([{a}]) {
                return a;
            },
            bar(){}
        }
    }
    expect_exact: "x={foo(a,b){return x}};y={foo([{a}]){return a},bar(){}};"
}

concise_methods_and_mangle_props: {
    mangle_props = {
        regex: /_/
    };
    input: {
        function x() {
            obj = {
                _foo() { return 1; }
            }
        }
    }
    expect: {
        function x() {
            obj = {
                a() { return 1; }
            }
        }
    }
}

concise_methods_and_keyword_names: {
    input: {
        x = {
            catch() {},
            throw() {}
        }
    }
    expect: {
        x={catch(){},throw(){}};
    }
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
            var b = a
            var c = class a {}
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
    }
    expect_exact: "import\"mod-name\";import Foo from\"bar\";"
}

import_statement_mangling: {
    mangle = { };
    input: {
        import Foo from "foo";
        Foo();
    }
    expect: {
        import a from "foo";
        a();
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
