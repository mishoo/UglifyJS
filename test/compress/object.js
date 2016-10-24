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
    expect_exact: "function f(n,t){return{get:n,set:t,get g(){},set s(n){},c,a:1,m(){}}}"
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
    input: (function() {
        var prop = 1;
        const value = {prop};
        return value;
    })();
    expect: (function() {
        var n = 1;
        const r = {prop:n};
        return r;
    })();
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
    expect_exact: {
        'var foo={[[1]](){return"success"}};doSomething(foo[[1]]());'
    }
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

concise_generators: {
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