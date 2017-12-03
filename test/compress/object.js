getter_setter: {
    input: {
        var get = "bar";
        var a = {
            get,
            set: "foo",
            get bar() {
                return this.get;
            },
            get 5() {
                return "five";
            },
            get 0xf55() {
                return "f five five";
            },
            get "five"() {
                return 5;
            },
            set one(value) {
                this._one = value;
            },
            set 9(value) {
                this._nine = value;
            },
            set 0b1010(value) {
                this._ten = value;
            },
            set "eleven"(value) {
                this._eleven = value;
            }
        };
        var b = {
            get() { return "gift"; },
            set: function(code) { return "Storing code " + code; }
        };
        var c = {
            ["get"]: "foo",
            ["set"]: "bar"
        };
        var d = {
            get: "foo",
            set: "bar"
        };
    }
    expect: {
        var get = "bar";
        var a = {
            get,
            set: "foo",
            get bar() {
                return this.get;
            },
            get 5() {
                return "five";
            },
            get 0xf55() {
                return "f five five";
            },
            get "five"() {
                return 5;
            },
            set one(value) {
                this._one = value;
            },
            set 9(value) {
                this._nine = value;
            },
            set 0b1010(value) {
                this._ten = value;
            },
            set "eleven"(value) {
                this._eleven = value;
            }
        };
        var b = {
            get() { return "gift"; },
            set: function(code) { return "Storing code " + code; }
        };
        var c = {
            ["get"]: "foo",
            ["set"]: "bar"
        };
        var d = {
            get: "foo",
            set: "bar"
        };
    }
}

getter_setter_mangler: {
    mangle = {}
    beautify = {
        ecma: 6
    }
    input: {
        function f(get,set) {
            return {
                get,
                set,
                get g(){},
                set s(n){},
                c,
                a:1,
                m(){}
            };
        }
    }
    expect_exact: "function f(t,e){return{get:t,set:e,get g(){},set s(t){},c,a:1,m(){}}}"
}

use_shorthand_opportunity: {
    beautify = {
        ecma: 6
    }
    input: {
        var foo = 123;
        var obj = {foo: foo};
    }
    expect_exact: "var foo=123;var obj={foo};"
}

computed_property_names: {
    input: {
        obj({ ["x" + "x"]: 6 });
    }
    expect_exact: 'obj({["x"+"x"]:6});'
}

convert_computed_props_to_regular_ones: {
    options = {
        booleans: true,
        computed_props: true,
        evaluate: true,
    }
    input: {
        var o = {
            ["hi"]: 0,
            ["A" + 1]: 1,
            [/B/]: 2,
            [100 + 23]: 3,
            [1 + .5]: 4,
            [Math.PI]: 5,
            [undefined]: 6,
            [true]: 7,
            [false]: 8,
            [null]: 9,
            [Infinity]: 10,
            [NaN]: 11,
        };
        for (var k in o) {
            console.log(k, o[k]);
        }
    }
    expect: {
        var o = {
            hi: 0,
            A1: 1,
            [/B/]: 2,
            123: 3,
            1.5: 4,
            [Math.PI]: 5,

            // leave these problematic cases as is
            [void 0]: 6,
            [!0]: 7,
            [!1]: 8,
            [null]: 9,
            [1 / 0]: 10,
            [NaN]: 11
        };
        for (var k in o) console.log(k, o[k]);
    }
    expect_stdout: [
        "123 3",
        "hi 0",
        "A1 1",
        "/B/ 2",
        "1.5 4",
        "3.141592653589793 5",
        "undefined 6",
        "true 7",
        "false 8",
        "null 9",
        "Infinity 10",
        "NaN 11",
    ]
    node_version: ">=6"
}

computed_property_names_evaluated_1: {
    options = {
        evaluate: true
    }
    input: {
        obj({
            [1 + 1]: 2,
            ["x" + "x"]: 6
        });
    }
    expect_exact: 'obj({[2]:2,["xx"]:6});'
}

computed_property_names_evaluated_2: {
    options = {
        evaluate: true
    }
    input: {
        var foo = something();

        var obj = {
            [foo]() {
                return "blah";
            }
        }
    }
    expect_exact: 'var foo=something();var obj={[foo](){return"blah"}};'
}

shorthand_properties: {
    mangle = true;
    input: {
        (function() {
            var prop = 1;
            const value = {prop};
            return value;
        })();
    }
    expect: {
        (function() {
            var n = 1;
            const r = {prop:n};
            return r;
        })();
    }
}

concise_methods: {
    beautify = {
        ecma: 6
    }
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

concise_methods_with_computed_property: {
    options = {
        evaluate: true
    }
    input: {
        var foo = {
            [Symbol.iterator]() {
                return { /* stuff */ }
            },
            [1 + 2]() {
                return 3;
            },
            ["1" + "4"]() {
                return 14;
            }
        }
    }
    expect: {
        var foo = {
            [Symbol.iterator]() {
                return { /* stuff */ }
            },
            [3]() {
                return 3;
            },
            ["14"]() {
                return 14;
            }
        }
    }
}

concise_methods_with_computed_property2: {
    options = {
        evaluate: true
    }
    input: {
        var foo = {
            [[1]](){
                return "success";
            }
        };
        doSomething(foo[[1]]());
    }
    expect_exact: 'var foo={[[1]](){return"success"}};doSomething(foo[[1]]());'
}

concise_methods_with_various_property_names: {
    input: {
        var get = "bar";
        var a = {
            bar() {
                return this.get;
            },
            5() {
                return "five";
            },
            0xf55() {
                return "f five five";
            },
            "five"() {
                return 5;
            },
            0b1010(value) {
                this._ten = value;
            }
        };
    }
    expect: {
        var get = "bar";
        var a = {
            bar() {
                return this.get;
            },
            5() {
                return "five";
            },
            0xf55() {
                return "f five five";
            },
            "five"() {
                return 5;
            },
            0b1010(value) {
                this._ten = value;
            }
        };
    }
}

concise_methods_and_mangle_props: {
    mangle = {
        properties: {
            regex: /_/,
        },
    }
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
                o() { return 1; }
            }
        }
    }
}

concise_generators: {
    beautify = {
        ecma: 6
    }
    input: {
        x = {
            *foo(a, b) {
                return x;
            }
        }
        y = {
            *foo([{a}]) {
                yield a;
            },
            bar(){}
        }
    }
    expect_exact: "x={*foo(a,b){return x}};y={*foo([{a}]){yield a},bar(){}};"
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

getter_setter_with_computed_value: {
    input: {
        class C {
            get ['a']() {
                return 'A';
            }
            set ['a'](value) {
                do_something(a);
            }
        }
        var x = {
            get [a.b]() {
                return 42;
            }
        };
        class MyArray extends Array {
            get [Symbol.species]() {
                return Array;
            }
        }
    }
    expect_exact: 'class C{get["a"](){return"A"}set["a"](value){do_something(a)}}var x={get[a.b](){return 42}};class MyArray extends Array{get[Symbol.species](){return Array}}'
}

property_with_operator_value: {
    input: {
        var foo = {
            "*": 1,
            get "*"() {
                return 2;
            },
            *"*"() {
                return 3;
            },
            "%": 1,
            get "%"() {
                return 2;
            },
            *"%"() {
                return 3;
            }
        }
        class bar {
            get "*"() {
                return 1
            }
            *"*"() {
                return 2;
            }
            get "%"() {
                return 1
            }
            *"%"() {
                return 2;
            }
        }
    }
    expect_exact: 'var foo={"*":1,get"*"(){return 2},*"*"(){return 3},"%":1,get"%"(){return 2},*"%"(){return 3}};class bar{get"*"(){return 1}*"*"(){return 2}get"%"(){return 1}*"%"(){return 2}}'
}

property_with_unprintable: {
    input: {
        var foo = {
            "\x00\x01": "foo",
            get "\x00\x01"() {
                return "bar";
            },
            set "\x00\x01"(foo) {
                save(foo);
            },
            *"\x00\x01"() {
                return "foobar";
            }
        }
        class bar {
            get "\x00\x01"() {
                return "bar"
            }
            set "\x00\x01"(foo) {
                save(foo);
            }
            *"\x00\x01"() {
                return "foobar";
            }
        }
    }
    expect_exact: 'var foo={"\\0\x01":"foo",get"\\0\x01"(){return"bar"},set"\\0\x01"(foo){save(foo)},*"\\0\x01"(){return"foobar"}};class bar{get"\\0\x01"(){return"bar"}set"\\0\x01"(foo){save(foo)}*"\\0\x01"(){return"foobar"}}'
}

property_with_unprintable_ascii_only: {
    beautify = {
        ascii_only: true,
    }
    input: {
        var foo = {
            "\x00\x01": "foo",
            get "\x00\x01"() {
                return "bar";
            },
            set "\x00\x01"(foo) {
                save(foo);
            },
            *"\x00\x01"() {
                return "foobar";
            }
        }
        class bar {
            get "\x00\x01"() {
                return "bar"
            }
            set "\x00\x01"(foo) {
                save(foo);
            }
            *"\x00\x01"() {
                return "foobar";
            }
        }
    }
    expect_exact: 'var foo={"\\0\\x01":"foo",get"\\0\\x01"(){return"bar"},set"\\0\\x01"(foo){save(foo)},*"\\0\\x01"(){return"foobar"}};class bar{get"\\0\\x01"(){return"bar"}set"\\0\\x01"(foo){save(foo)}*"\\0\\x01"(){return"foobar"}}'
}

property_with_unprintable_ascii_only_static: {
    beautify = {
        ascii_only: true
    }
    input: {
        class foo {
            static get "\x02\x03"() {
                return "bar";
            }
            static set "\x04\x05"(foo) {
                save(foo);
            }
        }
    }
    expect_exact: 'class foo{static get"\\x02\\x03"(){return"bar"}static set"\\x04\\x05"(foo){save(foo)}}'
}

methods_and_getters_with_keep_quoted_props_enabled: {
    beautify = {
        quote_style: 3,
        keep_quoted_props: true,
    }
    input: {
        var obj = {
            a() {},
            "b"() {},
            get c() { return "c"},
            get "d"() { return "d"},
            set e(a) { doSomething(a); },
            set f(a) { doSomething(b); }
        }
    }
    expect_exact: 'var obj={a(){},"b"(){},get c(){return"c"},get"d"(){return"d"},set e(a){doSomething(a)},set f(a){doSomething(b)}};'
}

allow_assignments_to_property_values: {
    input: {
        var foo = {123: foo = 123} = {foo: "456"};
    }
    expect: {
        var foo = {123: foo = 123} = {foo: "456"};
    }
}

variable_as_computed_property: {
    input: {
        function getLine(header) {
            return {
                [header]: {}
            };
        }
    }
    expect_exact: "function getLine(header){return{[header]:{}}}"
}

prop_func_to_concise_method: {
    options = {
        ecma: 6,
        unsafe_methods: true,
    }
    input: {
        ({
            emit: function NamedFunctionExpression() {
                console.log("PASS");
            },
            run: function() {
                this.emit();
            }
        }).run();
    }
    expect: {
        ({
            emit: function NamedFunctionExpression() {
                console.log("PASS");
            },
            run() {
                this.emit();
            }
        }).run();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

prop_arrow_to_concise_method: {
    options = {
        ecma: 6,
        unsafe_methods: true,
    }
    input: {
        ({
            run: () => {
                console.log("PASS");
            }
        }).run();
    }
    expect: {
        ({
            run() {
                console.log("PASS");
            }
        }).run();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

concise_method_to_prop_arrow: {
    options = {
        arrows: true,
        ecma: 6,
    }
    input: {
        console.log(({ a: () => 1 }).a());
        console.log(({ a: () => { return 2; } }).a());
        console.log(({ a() { return 3; } }).a());
        console.log(({ a() { return this.b; }, b: 4 }).a());
    }
    expect: {
        console.log({ a: () => 1 }.a());
        console.log({ a: () => 2 }.a());
        console.log({ a: () => 3 }.a());
        console.log({ a() { return this.b; }, b: 4 }.a());
    }
    expect_stdout: [
        "1",
        "2",
        "3",
        "4",
    ]
    node_version: ">=4"
}

prop_func_to_async_concise_method: {
    options = {
        ecma: 8,
        unsafe_methods: true,
    }
    input: {
        ({
            run: async function() {
                console.log("PASS");
            }
        }).run();
    }
    expect: {
        ({
            async run() {
                console.log("PASS");
            }
        }).run();
    }
    expect_stdout: "PASS"
    node_version: ">=8"
}

prop_func_to_concise_method_various: {
    options = {
        ecma: 6,
        unsafe_methods: true,
    }
    input: {
        ({
            null: function(x, y){ x(y); },
            123: function(x, y){ x(y); },
            "A B": function(x, y){ x(y); },
            p1: function(x, y){ x(y); },
            p2: function*(x, y){ yield x(y); },
            p3: async function(x, y){ await x(y); },
            [c1]: function(x, y){ x(y); },
            [c2]: function*(x, y){ yield x(y); },
            [c3]: async function(x, y){ await x(y); },
        });
    }
    expect: {
        ({
            null(x, y) { x(y); },
            123(x, y) { x(y); },
            "A B"(x, y) { x(y); },
            p1(x, y) { x(y); },
            *p2(x, y) { yield x(y); },
            async p3(x, y) { await x(y); },
            [c1](x, y) { x(y); },
            *[c2](x, y) { yield x(y); },
            async [c3](x, y) { await x(y); },
        });
    }
}

prop_arrows_to_concise_method_various: {
    options = {
        ecma: 6,
        unsafe_methods: true,
    }
    input: {
        ({
            null: (x, y) => { x(y); },
            123: (x, y) => { x(y); },
            "A B": (x, y) => { x(y); },
            p1: (x, y) => { x(y); },
            p3: async (x, y) => { await x(y); },
            [c1]: (x, y) => { x(y); },
            [c3]: async (x, y) => { await x(y); },
        });
    }
    expect: {
        ({
            null(x, y) { x(y); },
            123(x, y) { x(y); },
            "A B"(x, y) { x(y); },
            p1(x, y) { x(y); },
            async p3(x, y) { await x(y); },
            [c1](x, y) { x(y); },
            async [c3](x, y) { await x(y); },
        });
    }
}

prop_arrow_with_this: {
    options = {
        ecma: 6,
        unsafe_methods: true,
    }
    input: {
        function run(arg) {
            console.log(arg === this ? "global" : arg === foo ? "foo" : arg);
        }
        var foo = {
            func_no_this: function() { run(); },
            func_with_this: function() { run(this); },
            arrow_no_this: () => { run(); },
            arrow_with_this: () => { run(this); },
        };
        for (var key in foo) foo[key]();
    }
    expect: {
        function run(arg) {
            console.log(arg === this ? "global" : arg === foo ? "foo" : arg);
        }
        var foo = {
            func_no_this() { run(); },
            func_with_this() { run(this); },
            arrow_no_this() { run(); },
            arrow_with_this: () => { run(this); },
        };
        for (var key in foo) foo[key]();
    }
    expect_stdout: [
        "undefined",
        "foo",
        "undefined",
        "global",
    ]
    node_version: ">=4"
}

prop_arrow_with_nested_this: {
    options = {
        ecma: 6,
        unsafe_methods: true,
    }
    input: {
        function run(arg) {
            console.log(arg === this ? "global" : arg === foo ? "foo" : arg);
        }
        var foo = {
            func_func_this: function() { (function() { run(this); })(); },
            func_arrow_this: function() { (() => { run(this); })(); },
            arrow_func_this: () => { (function() { run(this); })(); },
            arrow_arrow_this: () => { (() => { run(this); })(); },
        };
        for (var key in foo) foo[key]();
    }
    expect: {
        function run(arg) {
            console.log(arg === this ? "global" : arg === foo ? "foo" : arg);
        }
        var foo = {
            func_func_this() { (function() { run(this); })(); },
            func_arrow_this() { (() => { run(this); })(); },
            arrow_func_this() { (function() { run(this); })(); },
            arrow_arrow_this: () => { (() => { run(this); })(); },
        };
        for (var key in foo) foo[key]();
    }
    expect_stdout: [
        "global",
        "foo",
        "global",
        "global",
    ]
    node_version: ">=4"
}

issue_2554_1: {
    options = {
        computed_props: true,
        evaluate: true,
    }
    input: {
        var obj = {
            ["x" + ""]: 1,
            ["method" + ""]() {
                this.s = "PASS";
            },
            get ["g" + ""]() {
                return this.x;
            },
            set ["s" + ""](value) {
                this.x = value;
            }
        };
        obj.method();
        console.log(obj.g);
    }
    expect: {
        var obj = {
            x: 1,
            method() {
                this.s = "PASS";
            },
            get g() {
                return this.x;
            },
            set s(value) {
                this.x = value;
            }
        };
        obj.method();
        console.log(obj.g);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_2554_2: {
    options = {
        computed_props: true,
        evaluate: true,
    }
    input: {
        var instance = new class {
            constructor() {
                this.x = 2;
            }
            ["method" + ""]() {
                this.s = "PASS";
            }
            get ["g" + ""]() {
                return this.x;
            }
            set ["s" + ""](value) {
                this.x = value;
            }
        }();
        instance.method();
        console.log(instance.g);
    }
    expect: {
        var instance = new class {
            constructor() {
                this.x = 2;
            }
            method() {
                this.s = "PASS";
            }
            get g() {
                return this.x;
            }
            set s(value) {
                this.x = value;
            }
        }();
        instance.method();
        console.log(instance.g);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_2554_3: {
    options = {
        computed_props: true,
        evaluate: true,
    }
    input: {
        var foo = {
            [1 + 0]: 1,
            [2 + 0]() {
                this[4] = "PASS";
            },
            get [3 + 0]() {
                return this[1];
            },
            set [4 + 0](value) {
                this[1] = value;
            }
        };
        foo[2]();
        console.log(foo[3]);
    }
    expect: {
        var foo = {
            1: 1,
            2() {
                this[4] = "PASS";
            },
            get 3() {
                return this[1];
            },
            set 4(value) {
                this[1] = value;
            }
        };
        foo[2]();
        console.log(foo[3]);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_2554_4: {
    options = {
        computed_props: true,
        evaluate: true,
    }
    input: {
        var bar = new class {
            constructor() {
                this[1] = 2;
            }
            [2 + 0]() {
                this[4] = "PASS";
            }
            get [3 + 0]() {
                return this[1];
            }
            set [4 + 0](value) {
                this[1] = value;
            }
        }();
        bar[2]();
        console.log(bar[3]);
    }
    expect: {
        var bar = new class {
            constructor() {
                this[1] = 2;
            }
            2() {
                this[4] = "PASS";
            }
            get 3() {
                return this[1];
            }
            set 4(value) {
                this[1] = value;
            }
        }();
        bar[2]();
        console.log(bar[3]);
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_2554_5: {
    options = {
        computed_props: true,
        evaluate: true,
    }
    input: {
        new class {
            ["constructor"]() {
                console.log("FAIL");
            }
            "constructor"() {
                console.log("PASS");
            }
        }();
    }
    expect: {
        new class {
            ["constructor"]() {
                console.log("FAIL");
            }
            constructor() {
                console.log("PASS");
            }
        }();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}
