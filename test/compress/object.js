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

computed_property_names: {
    input: {
        obj({ ["x" + "x"]: 6 });
    }
    expect_exact: 'obj({["x"+"x"]:6});'
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
            }
        }
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
