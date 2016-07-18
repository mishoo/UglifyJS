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
