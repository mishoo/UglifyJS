do_screw: {
    options = {
        ie8: false,
    }
    beautify = {
        ie8: false,
        ascii_only: true,
    }
    input: {
        f("\v");
    }
    expect_exact: 'f("\\v");'
}

dont_screw: {
    options = {
        ie8: true,
    }
    beautify = {
        ie8: true,
        ascii_only: true,
    }
    input: {
        f("\v");
    }
    expect_exact: 'f("\\x0B");'
}

do_screw_constants: {
    options = {
        ie8: false,
    }
    input: {
        f(undefined, Infinity);
    }
    expect_exact: "f(void 0,1/0);"
}

dont_screw_constants: {
    options = {
        ie8: true,
    }
    input: {
        f(undefined, Infinity);
    }
    expect_exact: "f(undefined,Infinity);"
}

do_screw_try_catch: {
    options = {
        ie8: false,
    }
    mangle = {
        ie8: false,
    }
    beautify = {
        ie8: false,
    }
    input: {
        good = function(e){
            return function(error){
                try{
                    e()
                } catch(e) {
                    error(e)
                }
            }
        };
    }
    expect: {
        good = function(n){
            return function(t){
                try{
                    n()
                } catch(n) {
                    t(n)
                }
            }
        };
    }
}

dont_screw_try_catch: {
    options = {
        ie8: true,
    }
    mangle = {
        ie8: true,
    }
    beautify = {
        ie8: true,
    }
    input: {
        bad = function(e){
            return function(error){
                try{
                    e()
                } catch(e) {
                    error(e)
                }
            }
        };
    }
    expect: {
        bad = function(t){
            return function(n){
                try{
                    t()
                } catch(t) {
                    n(t)
                }
            }
        };
    }
}

do_screw_try_catch_undefined: {
    options = {
        ie8: false,
    }
    mangle = {
        ie8: false,
    }
    beautify = {
        ie8: false,
    }
    input: {
        function a(b){
            try {
                throw 'Stuff';
            } catch (undefined) {
                console.log('caught: ' + undefined);
            }
            console.log('undefined is ' + undefined);
            return b === undefined;
        };
    }
    expect: {
        function a(o){
            try{
                throw "Stuff"
            } catch (o) {
                console.log("caught: "+o)
            }
            console.log("undefined is " + void 0);
            return void 0===o
        }
    }
    expect_stdout: true
}

dont_screw_try_catch_undefined: {
    options = {
        ie8: true,
    }
    mangle = {
        ie8: true,
    }
    beautify = {
        ie8: true,
    }
    input: {
        function a(b){
            try {
                throw 'Stuff';
            } catch (undefined) {
                console.log('caught: ' + undefined);
            }
            console.log('undefined is ' + undefined);
            return b === undefined;
        };
    }
    expect: {
        function a(n){
            try{
                throw "Stuff"
            } catch (undefined) {
                console.log("caught: " + undefined)
            }
            console.log("undefined is " + undefined);
            return n === undefined
        }
    }
    expect_stdout: true
}

reduce_vars: {
    options = {
        evaluate: true,
        ie8: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    mangle = {
        ie8: true,
    }
    input: {
        function f() {
            var a;
            try {
                x();
            } catch (a) {
                y();
            }
            alert(a);
        }
    }
    expect: {
        function f() {
            var t;
            try {
                x();
            } catch (t) {
                y();
            }
            alert(t);
        }
    }
}

issue_1586_1: {
    options = {
        ie8: true,
    }
    mangle = {
        ie8: true,
    }
    input: {
        function f() {
            try {
                x();
            } catch (err) {
                console.log(err.message);
            }
        }
    }
    expect_exact: "function f(){try{x()}catch(c){console.log(c.message)}}"
}

issue_1586_2: {
    options = {
        ie8: false,
    }
    mangle = {
        ie8: false,
    }
    input: {
        function f() {
            try {
                x();
            } catch (err) {
                console.log(err.message);
            }
        }
    }
    expect_exact: "function f(){try{x()}catch(c){console.log(c.message)}}"
}

issue_2120_1: {
    mangle = {
        ie8: false,
    }
    input: {
        "aaaaaaaa";
        var a = 1, b = "FAIL";
        try {
            throw 1;
        } catch (c) {
            try {
                throw 0;
            } catch (a) {
                if (c) b = "PASS";
            }
        }
        console.log(b);
    }
    expect: {
        "aaaaaaaa";
        var a = 1, b = "FAIL";
        try {
            throw 1;
        } catch (t) {
            try {
                throw 0;
            } catch (a) {
                if (t) b = "PASS";
            }
        }
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_2120_2: {
    mangle = {
        ie8: true,
    }
    input: {
        "aaaaaaaa";
        var a = 1, b = "FAIL";
        try {
            throw 1;
        } catch (c) {
            try {
                throw 0;
            } catch (a) {
                if (c) b = "PASS";
            }
        }
        console.log(b);
    }
    expect: {
        "aaaaaaaa";
        var a = 1, b = "FAIL";
        try {
            throw 1;
        } catch (c) {
            try {
                throw 0;
            } catch (a) {
                if (c) b = "PASS";
            }
        }
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_2254_1: {
    mangle = {
        ie8: false,
    }
    input: {
        "eeeeee";
        try {
            console.log(f("PASS"));
        } catch (e) {}
        function f(s) {
            try {
                throw "FAIL";
            } catch (e) {
                return s;
            }
        }
    }
    expect: {
        "eeeeee";
        try {
            console.log(f("PASS"));
        } catch (e) {}
        function f(t) {
            try {
                throw "FAIL";
            } catch (e) {
                return t;
            }
        }
    }
    expect_stdout: "PASS"
}

issue_2254_2: {
    mangle = {
        ie8: true,
    }
    input: {
        "eeeeee";
        try {
            console.log(f("PASS"));
        } catch (e) {}
        function f(s) {
            try {
                throw "FAIL";
            } catch (e) {
                return s;
            }
        }
    }
    expect: {
        "eeeeee";
        try {
            console.log(f("PASS"));
        } catch (e) {}
        function f(t) {
            try {
                throw "FAIL";
            } catch (e) {
                return t;
            }
        }
    }
    expect_stdout: "PASS"
}

issue_24_1: {
    mangle = {
        ie8: false,
    }
    input: {
        (function(a) {
            console.log(typeof function f(){} === typeof a ? "FAIL" : "PASS");
        })();
    }
    expect: {
        (function(o) {
            console.log(typeof function o(){} === typeof o ? "FAIL" : "PASS");
        })();
    }
    expect_stdout: "PASS"
}

issue_24_2: {
    mangle = {
        ie8: true,
    }
    input: {
        (function(a) {
            console.log(typeof function f(){} === typeof a ? "FAIL" : "PASS");
        })();
    }
    expect: {
        (function(o) {
            console.log(typeof function n(){} === typeof o ? "FAIL" : "PASS");
        })();
    }
    expect_stdout: "PASS"
}

issue_2976_1: {
    mangle = {
        ie8: false,
    }
    input: {
        console.log(function f() {
            var a;
            return a === f ? "FAIL" : "PASS";
        }());
    }
    expect: {
        console.log(function n() {
            var o;
            return o === n ? "FAIL" : "PASS";
        }());
    }
    expect_stdout: "PASS"
}

issue_2976_2: {
    mangle = {
        ie8: true,
    }
    input: {
        console.log(function f() {
            var a;
            return a === f ? "FAIL" : "PASS";
        }());
    }
    expect: {
        console.log(function f() {
            var n;
            return n === f ? "FAIL" : "PASS";
        }());
    }
    expect_stdout: "PASS"
}

issue_2976_3: {
    mangle = {
        ie8: true,
        toplevel: true,
    }
    input: {
        console.log(function f() {
            var a;
            return a === f ? "FAIL" : "PASS";
        }());
    }
    expect: {
        console.log(function o() {
            var n;
            return n === o ? "FAIL" : "PASS";
        }());
    }
    expect_stdout: "PASS"
}

issue_3035: {
    mangle = {
        ie8: false,
    }
    input: {
        var c = "FAIL";
        (function(a) {
            try {
                throw 1;
            } catch (b) {
                try {
                    throw 0;
                } catch (a) {
                    b && (c = "PASS");
                }
            }
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function(o) {
            try {
                throw 1;
            } catch (t) {
                try {
                    throw 0;
                } catch (o) {
                    t && (c = "PASS");
                }
            }
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3035_ie8: {
    mangle = {
        ie8: true,
    }
    input: {
        var c = "FAIL";
        (function(a) {
            try {
                throw 1;
            } catch (b) {
                try {
                    throw 0;
                } catch (a) {
                    b && (c = "PASS");
                }
            }
        })();
        console.log(c);
    }
    expect: {
        var c = "FAIL";
        (function(t) {
            try {
                throw 1;
            } catch (o) {
                try {
                    throw 0;
                } catch (t) {
                    o && (c = "PASS");
                }
            }
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3197_1: {
    options = {
        ie8: false,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    mangle = {
        ie8: false,
    }
    input: {
        var window = {};
        !function() {
            function Foo() {
                console.log(this instanceof Foo);
            }
            window.Foo = Foo;
        }();
        new window.Foo();
    }
    expect: {
        var window = {};
        window.Foo = function o() {
            console.log(this instanceof o);
        };
        new window.Foo();
    }
    expect_stdout: "true"
}

issue_3197_1_ie8: {
    options = {
        ie8: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    mangle = {
        ie8: true,
    }
    input: {
        var window = {};
        !function() {
            function Foo() {
                console.log(this instanceof Foo);
            }
            window.Foo = Foo;
        }();
        new window.Foo();
    }
    expect: {
        var window = {};
        window.Foo = function Foo() {
            console.log(this instanceof Foo);
        };
        new window.Foo();
    }
    expect_stdout: "true"
}

issue_3197_2: {
    mangle = {
        ie8: false,
    }
    input: {
        (function(a) {
            var f = function f() {
                console.log(this instanceof f);
            };
            new f(a);
        })();
    }
    expect: {
        (function(n) {
            var o = function n() {
                console.log(this instanceof n);
            };
            new o(n);
        })();
    }
    expect_stdout: "true"
}

issue_3197_2_ie8: {
    mangle = {
        ie8: true,
    }
    input: {
        (function(a) {
            var f = function f() {
                console.log(this instanceof f);
            };
            new f(a);
        })();
    }
    expect: {
        (function(n) {
            var o = function o() {
                console.log(this instanceof o);
            };
            new o(n);
        })();
    }
    expect_stdout: "true"
}

issue_3206_1: {
    options = {
        evaluate: true,
        ie8: false,
        reduce_vars: true,
        typeofs: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var foo = function bar() {};
            var baz = function moo() {};
            return "function" == typeof bar;
        }());
    }
    expect: {
        console.log(function() {
            return "function" == typeof bar;
        }());
    }
    expect_stdout: "false"
}

issue_3206_2: {
    options = {
        evaluate: true,
        ie8: true,
        reduce_vars: true,
        typeofs: true,
        unused: true,
    }
    input: {
        console.log(function() {
            var foo = function bar() {};
            var baz = function moo() {};
            return "function" == typeof bar;
        }());
    }
    expect: {
        console.log(function() {
            (function bar() {});
            return "function" == typeof bar;
        }());
    }
    expect_stdout: "false"
}

issue_3215_1: {
    mangle = {
        ie8: false,
    }
    input: {
        console.log(function foo() {
            var bar = function bar(name) {
                return "PASS";
            };
            try {
                "moo";
            } catch (e) {
                bar = function bar(name) {
                    return "FAIL";
                };
            }
            return bar;
        }()());
    }
    expect: {
        console.log(function n() {
            var o = function n(o) {
                return "PASS";
            };
            try {
                "moo";
            } catch (n) {
                o = function n(o) {
                    return "FAIL";
                };
            }
            return o;
        }()());
    }
    expect_stdout: "PASS"
}

issue_3215_2: {
    mangle = {
        ie8: true,
    }
    input: {
        console.log(function foo() {
            var bar = function bar(name) {
                return "PASS";
            };
            try {
                "moo";
            } catch (e) {
                bar = function bar(name) {
                    return "FAIL";
                };
            }
            return bar;
        }()());
    }
    expect: {
        console.log(function foo() {
            var o = function o(n) {
                return "PASS";
            };
            try {
                "moo";
            } catch (n) {
                o = function o(n) {
                    return "FAIL";
                };
            }
            return o;
        }()());
    }
    expect_stdout: "PASS"
}

issue_3215_3: {
    mangle = {
        ie8: false,
    }
    input: {
        console.log(function foo() {
            var bar = function bar(name) {
                return "FAIL";
            };
            try {
                moo;
            } catch (e) {
                bar = function bar(name) {
                    return "PASS";
                };
            }
            return bar;
        }()());
    }
    expect: {
        console.log(function n() {
            var o = function n(o) {
                return "FAIL";
            };
            try {
                moo;
            } catch (n) {
                o = function n(o) {
                    return "PASS";
                };
            }
            return o;
        }()());
    }
    expect_stdout: "PASS"
}

issue_3215_4: {
    mangle = {
        ie8: true,
    }
    input: {
        console.log(function foo() {
            var bar = function bar(name) {
                return "FAIL";
            };
            try {
                moo;
            } catch (e) {
                bar = function bar(name) {
                    return "PASS";
                };
            }
            return bar;
        }()());
    }
    expect: {
        console.log(function foo() {
            var o = function o(n) {
                return "FAIL";
            };
            try {
                moo;
            } catch (n) {
                o = function o(n) {
                    return "PASS";
                };
            }
            return o;
        }()());
    }
    expect_stdout: "PASS"
}
