do_screw: {
    options = {
        ie: false,
    }
    beautify = {
        ie: false,
        ascii_only: true,
    }
    input: {
        f("\v");
    }
    expect_exact: 'f("\\v");'
}

dont_screw: {
    options = {
        ie: true,
    }
    beautify = {
        ie: true,
        ascii_only: true,
    }
    input: {
        f("\v");
    }
    expect_exact: 'f("\\x0B");'
}

do_screw_constants: {
    options = {
        ie: false,
    }
    input: {
        f(undefined, Infinity);
    }
    expect_exact: "f(void 0,1/0);"
}

dont_screw_constants: {
    options = {
        ie: true,
    }
    input: {
        f(undefined, Infinity);
    }
    expect_exact: "f(undefined,Infinity);"
}

do_screw_try_catch: {
    options = {
        ie: false,
    }
    mangle = {
        ie: false,
    }
    beautify = {
        ie: false,
    }
    input: {
        good = function(e){
            return function(error){
                try {
                    e()
                } catch (e) {
                    error(e)
                }
            }
        };
    }
    expect: {
        good = function(n){
            return function(t){
                try {
                    n()
                } catch (n) {
                    t(n)
                }
            }
        };
    }
}

dont_screw_try_catch: {
    options = {
        ie: true,
    }
    mangle = {
        ie: true,
    }
    beautify = {
        ie: true,
    }
    input: {
        bad = function(e){
            return function(error){
                try {
                    e()
                } catch (e) {
                    error(e)
                }
            }
        };
    }
    expect: {
        bad = function(t){
            return function(n){
                try {
                    t()
                } catch (t) {
                    n(t)
                }
            }
        };
    }
}

do_screw_try_catch_undefined: {
    options = {
        ie: false,
    }
    mangle = {
        ie: false,
    }
    beautify = {
        ie: false,
    }
    input: {
        function a(b) {
            try {
                throw "Stuff";
            } catch (undefined) {
                console.log("caught: " + undefined);
            }
            console.log("undefined is " + undefined);
            return b === undefined;
        }
        console.log(a(42), a(void 0));
    }
    expect: {
        function a(o) {
            try {
                throw "Stuff";
            } catch (o) {
                console.log("caught: " + o);
            }
            console.log("undefined is " + void 0);
            return void 0 === o;
        }
        console.log(a(42), a(void 0));
    }
    expect_stdout: [
        "caught: Stuff",
        "undefined is undefined",
        "caught: Stuff",
        "undefined is undefined",
        "false true",
    ]
}

dont_screw_try_catch_undefined: {
    options = {
        ie: true,
    }
    mangle = {
        ie: true,
    }
    beautify = {
        ie: true,
    }
    input: {
        function a(b) {
            try {
                throw "Stuff";
            } catch (undefined) {
                console.log("caught: " + undefined);
            }
            // IE8: undefined is Stuff
            console.log("undefined is " + undefined);
            return b === undefined;
        }
        console.log(a(42), a(void 0));
    }
    expect: {
        function a(n) {
            try {
                throw "Stuff";
            } catch (undefined) {
                console.log("caught: " + undefined);
            }
            console.log("undefined is " + undefined);
            return n === undefined;
        }
        console.log(a(42), a(void 0));
    }
    expect_stdout: [
        "caught: Stuff",
        "undefined is undefined",
        "caught: Stuff",
        "undefined is undefined",
        "false true",
    ]
}

reduce_vars: {
    options = {
        evaluate: true,
        ie: true,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    mangle = {
        ie: true,
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

typeof_getAttribute: {
    options = {
        comparisons: true,
        ie: false,
        typeofs: true,
    }
    input: {
        document = {
            createElement: function() {
                return {
                    getAttribute: function() {},
                };
            },
            write: console.log,
        };
        document.write(function(element) {
            if (element)
                return "undefined" === typeof element.getAttribute;
        }(document.createElement("foo")) ? "FAIL" : "PASS");
    }
    expect: {
        document = {
            createElement: function() {
                return {
                    getAttribute: function() {},
                };
            },
            write: console.log,
        };
        document.write(function(element) {
            if (element)
                // IE6~10: Access is denied.
                return void 0 === element.getAttribute;
        }(document.createElement("foo")) ? "FAIL" : "PASS");
    }
    expect_stdout: "PASS"
}

typeof_getAttribute_ie6: {
    options = {
        comparisons: true,
        ie: true,
        typeofs: true,
    }
    input: {
        document = {
            createElement: function() {
                return {
                    getAttribute: function() {},
                };
            },
            write: console.log,
        };
        document.write(function(element) {
            if (element)
                return "undefined" === typeof element.getAttribute;
        }(document.createElement("foo")) ? "FAIL" : "PASS");
    }
    expect: {
        document = {
            createElement: function() {
                return {
                    getAttribute: function() {},
                };
            },
            write: console.log,
        };
        document.write(function(element) {
            if (element)
                return "undefined" == typeof element.getAttribute;
        }(document.createElement("foo")) ? "FAIL" : "PASS");
    }
    expect_stdout: "PASS"
}

issue_1586_1: {
    options = {
        ie: true,
    }
    mangle = {
        ie: true,
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
        ie: false,
    }
    mangle = {
        ie: false,
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
        ie: false,
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
        ie: true,
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
        ie: false,
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
        ie: true,
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
        ie: false,
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
        ie: true,
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
        ie: false,
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
        ie: true,
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
        ie: true,
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
        ie: false,
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
        ie: true,
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
        ie: false,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    mangle = {
        ie: false,
    }
    input: {
        !function() {
            function Foo() {
                console.log(this instanceof Foo);
            }
            window.Foo = Foo;
        }();
        new window.Foo();
    }
    expect: {
        window.Foo = function o() {
            console.log(this instanceof o);
        };
        new window.Foo();
    }
    expect_stdout: "true"
}

issue_3197_1_ie8: {
    options = {
        ie: true,
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    mangle = {
        ie: true,
    }
    input: {
        !function() {
            function Foo() {
                console.log(this instanceof Foo);
            }
            window.Foo = Foo;
        }();
        new window.Foo();
    }
    expect: {
        window.Foo = function Foo() {
            console.log(this instanceof Foo);
        };
        new window.Foo();
    }
    expect_stdout: "true"
}

issue_3197_2: {
    mangle = {
        ie: false,
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
        ie: true,
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
        ie: false,
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
        ie: true,
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
        ie: false,
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
        ie: true,
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
        ie: false,
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
        ie: true,
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

issue_3355_1: {
    mangle = {
        ie: false,
    }
    input: {
        (function f() {
            var f;
        })();
        (function g() {
        })();
        console.log(typeof f === typeof g);
    }
    expect: {
        (function o() {
            var o;
        })();
        (function o() {
        })();
        console.log(typeof f === typeof g);
    }
    expect_stdout: "true"
}

issue_3355_2: {
    mangle = {
        ie: true,
    }
    input: {
        (function f() {
            var f;
        })();
        (function g() {
        })();
        console.log(typeof f === typeof g);
    }
    expect: {
        (function f() {
            var f;
        })();
        (function g() {
        })();
        console.log(typeof f === typeof g);
    }
    expect_stdout: "true"
}

issue_3355_3: {
    mangle = {
        ie: false,
    }
    input: {
        !function(a) {
            "aaaaaaaaaa";
            a();
            var b = function c() {
                var c = 42;
                console.log("FAIL");
            };
        }(function() {
            console.log("PASS");
        });
    }
    expect: {
        !function(a) {
            "aaaaaaaaaa";
            a();
            var o = function a() {
                var a = 42;
                console.log("FAIL");
            };
        }(function() {
            console.log("PASS");
        });
    }
    expect_stdout: "PASS"
}

issue_3355_4: {
    mangle = {
        ie: true,
    }
    input: {
        !function(a) {
            "aaaaaaaaaa";
            a();
            var b = function c() {
                var c = 42;
                console.log("FAIL");
            };
        }(function() {
            console.log("PASS");
        });
    }
    expect: {
        !function(a) {
            "aaaaaaaaaa";
            a();
            var o = function n() {
                var n = 42;
                console.log("FAIL");
            };
        }(function() {
            console.log("PASS");
        });
    }
    expect_stdout: "PASS"
}

issue_3468: {
    options = {
        collapse_vars: true,
        ie: false,
    }
    input: {
        var a = 42;
        console.log(function a() {
            a++;
            return typeof a;
        }());
    }
    expect: {
        var a = 42;
        console.log(function a() {
            a++;
            return typeof a;
        }());
    }
    expect_stdout: "function"
}

issue_3468_ie8: {
    options = {
        collapse_vars: true,
        ie: true,
    }
    input: {
        var a = 42;
        console.log(function a() {
            a++;
            return typeof a;
        }());
    }
    expect: {
        var a = 42;
        console.log(function a() {
            a++;
            return typeof a;
        }());
    }
    expect_stdout: "function"
}

issue_3471: {
    options = {
        ie: false,
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var c = 1;
        function f() {
            var a = function g() {
                --c && f();
                g.p = 0;
            };
            for (var p in a)
                a[p];
        }
        f();
    }
    expect: {
        var c = 1;
        (function f() {
            function a() {
                --c && f();
                a.p = 0;
            }
            for (var p in a)
                a[p];
        })();
    }
    expect_stdout: true
}

issue_3471_ie8: {
    options = {
        ie: true,
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var c = 1;
        function f() {
            var a = function g() {
                --c && f();
                g.p = 0;
            };
            for (var p in a)
                a[p];
        }
        f();
    }
    expect: {
        var c = 1;
        (function f() {
            var a = function g() {
                --c && f();
                g.p = 0;
            };
            for (var p in a)
                a[p];
        })();
    }
    expect_stdout: true
}

issue_3473: {
    rename = true
    mangle = {
        ie: false,
        toplevel: false,
    }
    input: {
        var d = 42, a = 100, b = 10, c = 0;
        (function b() {
            try {
                c++;
            } catch (b) {}
        })();
        console.log(a, b, c);
    }
    expect: {
        var d = 42, a = 100, b = 10, c = 0;
        (function a() {
            try {
                c++;
            } catch (a) {}
        })();
        console.log(a, b, c);
    }
    expect_stdout: "100 10 1"
}

issue_3473_ie8: {
    rename = true
    mangle = {
        ie: true,
        toplevel: false,
    }
    input: {
        var d = 42, a = 100, b = 10, c = 0;
        (function b() {
            try {
                c++;
            } catch (b) {}
        })();
        console.log(a, b, c);
    }
    expect: {
        var d = 42, a = 100, b = 10, c = 0;
        (function b() {
            try {
                c++;
            } catch (b) {}
        })();
        console.log(a, b, c);
    }
    expect_stdout: "100 10 1"
}

issue_3473_toplevel: {
    rename = true
    mangle = {
        ie: false,
        toplevel: true,
    }
    input: {
        var d = 42, a = 100, b = 10, c = 0;
        (function b() {
            try {
                c++;
            } catch (b) {}
        })();
        console.log(a, b, c);
    }
    expect: {
        var c = 42, o = 100, n = 10, t = 0;
        (function c() {
            try {
                t++;
            } catch (c) {}
        })();
        console.log(o, n, t);
    }
    expect_stdout: "100 10 1"
}

issue_3473_ie8_toplevel: {
    rename = true
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        var d = 42, a = 100, b = 10, c = 0;
        (function b() {
            try {
                c++;
            } catch (b) {}
        })();
        console.log(a, b, c);
    }
    expect: {
        var c = 42, o = 100, n = 10, t = 0;
        (function n() {
            try {
                t++;
            } catch (n) {}
        })();
        console.log(o, n, t);
    }
    expect_stdout: "100 10 1"
}

issue_3475: {
    rename = true
    mangle = {
        ie: false,
        toplevel: false,
    }
    input: {
        "ooooo ddddd";
        var a = "FAIL";
        try {
            throw 42;
        } catch (b) {
            (function f() {
                a = "PASS";
            })();
        }
        console.log(a);
    }
    expect: {
        "ooooo ddddd";
        var a = "FAIL";
        try {
            throw 42;
        } catch (o) {
            (function o() {
                a = "PASS";
            })();
        }
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3475_ie8: {
    rename = true
    mangle = {
        ie: true,
        toplevel: false,
    }
    input: {
        "ooooo ddddd";
        var a = "FAIL";
        try {
            throw 42;
        } catch (b) {
            (function f() {
                a = "PASS";
            })();
        }
        console.log(a);
    }
    expect: {
        "ooooo ddddd";
        var a = "FAIL";
        try {
            throw 42;
        } catch (b) {
            (function f() {
                a = "PASS";
            })();
        }
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3475_toplevel: {
    rename = true
    mangle = {
        ie: false,
        toplevel: true,
    }
    input: {
        "ooooo ddddd";
        var a = "FAIL";
        try {
            throw 42;
        } catch (b) {
            (function f() {
                a = "PASS";
            })();
        }
        console.log(a);
    }
    expect: {
        "ooooo ddddd";
        var d = "FAIL";
        try {
            throw 42;
        } catch (o) {
            (function o() {
                d = "PASS";
            })();
        }
        console.log(d);
    }
    expect_stdout: "PASS"
}

issue_3475_ie8_toplevel: {
    rename = true
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        "ooooo ddddd";
        var a = "FAIL";
        try {
            throw 42;
        } catch (b) {
            (function f() {
                a = "PASS";
            })();
        }
        console.log(a);
    }
    expect: {
        "ooooo ddddd";
        var o = "FAIL";
        try {
            throw 42;
        } catch (d) {
            (function c() {
                o = "PASS";
            })();
        }
        console.log(o);
    }
    expect_stdout: "PASS"
}

issue_3478_1: {
    rename = true
    mangle = {
        ie: false,
        toplevel: false,
    }
    input: {
        "aaaaaaaaaa";
        (function f() {
            (function f() {
                var a;
                console.log(typeof f);
            })();
        })();
    }
    expect: {
        "aaaaaaaaaa";
        (function a() {
            (function a() {
                var o;
                console.log(typeof a);
            })();
        })();
    }
    expect_stdout: "function"
}

issue_3478_1_ie8: {
    rename = true
    mangle = {
        ie: true,
        toplevel: false,
    }
    input: {
        "aaaaaaaaaa";
        (function f() {
            (function f() {
                var a;
                console.log(typeof f);
            })();
        })();
    }
    expect: {
        "aaaaaaaaaa";
        (function f() {
            (function f() {
                var a;
                console.log(typeof f);
            })();
        })();
    }
    expect_stdout: "function"
}

issue_3478_1_toplevel: {
    rename = true
    mangle = {
        ie: false,
        toplevel: true,
    }
    input: {
        "aaaaaaaaaa";
        (function f() {
            (function f() {
                var a;
                console.log(typeof f);
            })();
        })();
    }
    expect: {
        "aaaaaaaaaa";
        (function a() {
            (function a() {
                var o;
                console.log(typeof a);
            })();
        })();
    }
    expect_stdout: "function"
}

issue_3478_1_ie8_toplevel: {
    rename = true
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        "aaaaaaaaaa";
        (function f() {
            (function f() {
                var a;
                console.log(typeof f);
            })();
        })();
    }
    expect: {
        "aaaaaaaaaa";
        (function o() {
            (function o() {
                var a;
                console.log(typeof o);
            })();
        })();
    }
    expect_stdout: "function"
}

issue_3478_2: {
    rename = true
    mangle = {
        ie: false,
        toplevel: false,
    }
    input: {
        "bbbbbbb";
        var c = "FAIL";
        (function f() {
            (function f() {
                var b = function g() {
                    f && (c = "PASS");
                }();
            })();
        })();
        console.log(c);
    }
    expect: {
        "bbbbbbb";
        var c = "FAIL";
        (function b() {
            (function n() {
                var b = function b() {
                    n && (c = "PASS");
                }();
            })();
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3478_2_ie8: {
    rename = true
    mangle = {
        ie: true,
        toplevel: false,
    }
    input: {
        "bbbbbbb";
        var c = "FAIL";
        (function f() {
            (function f() {
                var b = function g() {
                    f && (c = "PASS");
                }();
            })();
        })();
        console.log(c);
    }
    expect: {
        "bbbbbbb";
        var c = "FAIL";
        (function f() {
            (function f() {
                var b = function n() {
                    f && (c = "PASS");
                }();
            })();
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3478_2_toplevel: {
    rename = true
    mangle = {
        ie: false,
        toplevel: true,
    }
    input: {
        "bbbbbbb";
        var c = "FAIL";
        (function f() {
            (function f() {
                var b = function g() {
                    f && (c = "PASS");
                }();
            })();
        })();
        console.log(c);
    }
    expect: {
        "bbbbbbb";
        var o = "FAIL";
        (function b() {
            (function n() {
                var b = function b() {
                    n && (o = "PASS");
                }();
            })();
        })();
        console.log(o);
    }
    expect_stdout: "PASS"
}

issue_3478_2_ie8_toplevel: {
    rename = true
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        "bbbbbbb";
        var c = "FAIL";
        (function f() {
            (function f() {
                var b = function g() {
                    f && (c = "PASS");
                }();
            })();
        })();
        console.log(c);
    }
    expect: {
        "bbbbbbb";
        var o = "FAIL";
        (function c() {
            (function c() {
                var b = function n() {
                    c && (o = "PASS");
                }();
            })();
        })();
        console.log(o);
    }
    expect_stdout: "PASS"
}

issue_3482_1: {
    options = {
        evaluate: true,
        ie: false,
    }
    input: {
        try {
            throw 42;
        } catch (NaN) {
            var a = +"a";
        }
        console.log(a, NaN, 0 / 0);
    }
    expect: {
        try {
            throw 42;
        } catch (NaN) {
            var a = 0 / 0;
        }
        console.log(a, NaN, NaN);
    }
    expect_stdout: "NaN NaN NaN"
}

issue_3482_1_ie8: {
    options = {
        evaluate: true,
        ie: true,
    }
    input: {
        try {
            throw 42;
        } catch (NaN) {
            var a = +"a";
        }
        // IE8: NaN 42 NaN
        console.log(a, NaN, 0 / 0);
    }
    expect: {
        try {
            throw 42;
        } catch (NaN) {
            var a = 0 / 0;
        }
        console.log(a, NaN, 0 / 0);
    }
    expect_stdout: "NaN NaN NaN"
}

issue_3482_2: {
    options = {
        evaluate: true,
        ie: false,
    }
    input: {
        (function() {
            try {
                throw 42;
            } catch (NaN) {
                a = +"a";
            }
        })();
        console.log(a, NaN, 0 / 0);
    }
    expect: {
        (function() {
            try {
                throw 42;
            } catch (NaN) {
                a = 0 / 0;
            }
        })();
        console.log(a, NaN, NaN);
    }
    expect_stdout: "NaN NaN NaN"
}

issue_3482_2_ie8: {
    options = {
        evaluate: true,
        ie: true,
    }
    input: {
        (function() {
            try {
                throw 42;
            } catch (NaN) {
                a = +"a";
            }
        })();
        console.log(a, NaN, 0 / 0);
    }
    expect: {
        (function() {
            try {
                throw 42;
            } catch (NaN) {
                a = 0 / 0;
            }
        })();
        console.log(a, NaN, 0 / 0);
    }
    expect_stdout: "NaN NaN NaN"
}

issue_3484_1: {
    options = {
        ie: false,
        side_effects: true,
        toplevel: false,
    }
    input: {
        (function f() {})();
        console.log(typeof f);
    }
    expect: {
        console.log(typeof f);
    }
    expect_stdout: "undefined"
}

issue_3484_1_ie8: {
    options = {
        ie: true,
        side_effects: true,
        toplevel: false,
    }
    input: {
        (function f() {})();
        // IE8: function
        console.log(typeof f);
    }
    expect: {
        (function f() {})();
        console.log(typeof f);
    }
    expect_stdout: "undefined"
}

issue_3484_1_toplevel: {
    options = {
        ie: false,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (function f() {})();
        console.log(typeof f);
    }
    expect: {
        console.log(typeof f);
    }
    expect_stdout: "undefined"
}

issue_3484_1_ie8_toplevel: {
    options = {
        ie: true,
        side_effects: true,
        toplevel: true,
    }
    input: {
        (function f() {})();
        // IE8: function
        console.log(typeof f);
    }
    expect: {
        (function f() {})();
        console.log(typeof f);
    }
    expect_stdout: "undefined"
}

issue_3484_2: {
    options = {
        evaluate: true,
        ie: false,
        reduce_vars: true,
        toplevel: false,
    }
    input: {
        (function Infinity() {
            var Infinity;
        })();
        console.log(typeof (1 / 0), typeof Infinity);
    }
    expect: {
        (function Infinity() {
            var Infinity;
        })();
        console.log("number", "number");
    }
    expect_stdout: "number number"
}

issue_3484_2_ie8: {
    options = {
        evaluate: true,
        ie: true,
        reduce_vars: true,
        toplevel: false,
    }
    input: {
        (function Infinity() {
            var Infinity;
        })();
        // IE8: number function
        console.log(typeof (1 / 0), typeof Infinity);
    }
    expect: {
        (function Infinity() {
            var Infinity;
        })();
        console.log("number", typeof Infinity);
    }
    expect_stdout: "number number"
}

issue_3484_2_toplevel: {
    options = {
        evaluate: true,
        ie: false,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        (function Infinity() {
            var Infinity;
        })();
        console.log(typeof (1 / 0), typeof Infinity);
    }
    expect: {
        (function Infinity() {
            var Infinity;
        })();
        console.log("number", "number");
    }
    expect_stdout: "number number"
}

issue_3484_2_ie8_toplevel: {
    options = {
        evaluate: true,
        ie: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        (function Infinity() {
            var Infinity;
        })();
        // IE8: number function
        console.log(typeof (1 / 0), typeof Infinity);
    }
    expect: {
        (function Infinity() {
            var Infinity;
        })();
        console.log("number", typeof Infinity);
    }
    expect_stdout: "number number"
}

issue_3486: {
    options = {
        conditionals: true,
        ie: false,
        reduce_vars: true,
    }
    input: {
        (function a() {
            (function a(a) {
                console.log(a ? "FAIL" : "PASS");
            })();
        })();
    }
    expect: {
        (function a() {
            (function a(a) {
                console.log(a ? "FAIL" : "PASS");
            })();
        })();
    }
    expect_stdout: "PASS"
}

issue_3486_ie8: {
    options = {
        conditionals: true,
        ie: true,
        reduce_vars: true,
    }
    input: {
        (function a() {
            (function a(a) {
                console.log(a ? "FAIL" : "PASS");
            })();
        })();
    }
    expect: {
        (function a() {
            (function a(a) {
                console.log(a ? "FAIL" : "PASS");
            })();
        })();
    }
    expect_stdout: "PASS"
}

issue_3493: {
    options = {
        dead_code: true,
        ie: false,
    }
    input: {
        var c = "PASS";
        (function() {
            try {
                (function a() {
                    throw {};
                })();
            } catch (a) {
                a >>= 0;
                a && (c = "FAIL");
            }
        })();
        console.log(c);
    }
    expect: {
        var c = "PASS";
        (function() {
            try {
                (function a() {
                    throw {};
                })();
            } catch (a) {
                a >>= 0;
                a && (c = "FAIL");
            }
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3493_ie8: {
    options = {
        dead_code: true,
        ie: true,
    }
    input: {
        var c = "PASS";
        (function() {
            try {
                (function a() {
                    throw {};
                })();
            } catch (a) {
                a >>= 0;
                a && (c = "FAIL");
            }
        })();
        console.log(c);
    }
    expect: {
        var c = "PASS";
        (function() {
            try {
                (function a() {
                    throw {};
                })();
            } catch (a) {
                a >>= 0;
                a && (c = "FAIL");
            }
        })();
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3523: {
    mangle = {
        ie: false,
        toplevel: false,
    }
    input: {
        var a = 0, b, c = "FAIL";
        (function() {
            var f, g, h, i, j, k, l, m, n, o, p, q, r, s;
        })();
        try {
            throw 0;
        } catch (t) {
            (function() {
                (function t() {
                    c = "PASS";
                })();
            })();
            (function e() {
                try {} catch (t) {}
            })();
        }
        console.log(c);
    }
    expect: {
        var a = 0, b, c = "FAIL";
        (function() {
            var c, n, t, o, a, r, f, i, u, h, l, v, y, A;
        })();
        try {
            throw 0;
        } catch (n) {
            (function() {
                (function n() {
                    c = "PASS";
                })();
            })();
            (function c() {
                try {} catch (c) {}
            })();
        }
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3523_ie8: {
    mangle = {
        ie: true,
        toplevel: false,
    }
    input: {
        var a = 0, b, c = "FAIL";
        (function() {
            var f, g, h, i, j, k, l, m, n, o, p, q, r, s;
        })();
        try {
            throw 0;
        } catch (t) {
            (function() {
                (function t() {
                    c = "PASS";
                })();
            })();
            (function e() {
                try {} catch (t) {}
            })();
        }
        console.log(c);
    }
    expect: {
        var a = 0, b, c = "FAIL";
        (function() {
            var c, t, n, o, a, r, f, i, u, h, e, l, v, y;
        })();
        try {
            throw 0;
        } catch (t) {
            (function() {
                (function t() {
                    c = "PASS";
                })();
            })();
            (function e() {
                try {} catch (t) {}
            })();
        }
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3523_toplevel: {
    mangle = {
        ie: false,
        toplevel: true,
    }
    input: {
        var a = 0, b, c = "FAIL";
        (function() {
            var f, g, h, i, j, k, l, m, n, o, p, q, r, s;
        })();
        try {
            throw 0;
        } catch (t) {
            (function() {
                (function t() {
                    c = "PASS";
                })();
            })();
            (function e() {
                try {} catch (t) {}
            })();
        }
        console.log(c);
    }
    expect: {
        var c = 0, n, t = "FAIL";
        (function() {
            var c, n, t, o, r, a, f, i, u, h, l, v, y, A;
        })();
        try {
            throw 0;
        } catch (c) {
            (function() {
                (function c() {
                    t = "PASS";
                })();
            })();
            (function c() {
                try {} catch (c) {}
            })();
        }
        console.log(t);
    }
    expect_stdout: "PASS"
}

issue_3523_ie8_toplevel: {
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        var a = 0, b, c = "FAIL";
        (function() {
            var f, g, h, i, j, k, l, m, n, o, p, q, r, s;
        })();
        try {
            throw 0;
        } catch (t) {
            (function() {
                (function t() {
                    c = "PASS";
                })();
            })();
            (function e() {
                try {} catch (t) {}
            })();
        }
        console.log(c);
    }
    expect: {
        var c = 0, n, t = "FAIL";
        (function() {
            var c, n, t, o, r, a, f, i, u, h, l, v, y, A;
        })();
        try {
            throw 0;
        } catch (o) {
            (function() {
                (function o() {
                    t = "PASS";
                })();
            })();
            (function r() {
                try {} catch (o) {}
            })();
        }
        console.log(t);
    }
    expect_stdout: "PASS"
}

issue_3523_rename: {
    rename = true
    mangle = {
        ie: false,
        toplevel: false,
    }
    input: {
        var a = 0, b, c = "FAIL";
        (function() {
            var d, e, f, g, h, i, j, k, l, m, o, p, q, r;
        })();
        try {
            throw 0;
        } catch (e) {
            (function() {
                (function e() {
                    c = "PASS";
                })();
            })();
            (function d() {
                try {
                } catch (e) {
                }
            })();
        }
        console.log(c);
    }
    expect: {
        var a = 0, b, c = "FAIL";
        (function() {
            var c, n, t, o, a, r, f, i, u, h, l, v, y, A;
        })();
        try {
            throw 0;
        } catch (n) {
            (function() {
                (function n() {
                    c = "PASS";
                })();
            })();
            (function c() {
                try {} catch (c) {}
            })();
        }
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3523_rename_ie8: {
    rename = true
    mangle = {
        ie: true,
        toplevel: false,
    }
    input: {
        var a = 0, b, c = "FAIL";
        (function() {
            var d, e, f, g, h, i, j, k, l, m, o, p, q, r;
        })();
        try {
            throw 0;
        } catch (e) {
            (function() {
                (function e() {
                    c = "PASS";
                })();
            })();
            (function d() {
                try {
                } catch (e) {
                }
            })();
        }
        console.log(c);
    }
    expect: {
        var a = 0, b, c = "FAIL";
        (function() {
            var c, n, t, o, a, r, e, f, i, u, h, l, v, y;
        })();
        try {
            throw 0;
        } catch (e) {
            (function() {
                (function e() {
                    c = "PASS";
                })();
            })();
            (function d() {
                try {} catch (e) {}
            })();
        }
        console.log(c);
    }
    expect_stdout: "PASS"
}

issue_3523_rename_toplevel: {
    rename = true
    mangle = {
        ie: false,
        toplevel: true,
    }
    input: {
        var a = 0, b, c = "FAIL";
        (function() {
            var d, e, f, g, h, i, j, k, l, m, o, p, q, r;
        })();
        try {
            throw 0;
        } catch (e) {
            (function() {
                (function e() {
                    c = "PASS";
                })();
            })();
            (function d() {
                try {
                } catch (e) {
                }
            })();
        }
        console.log(c);
    }
    expect: {
        var c = 0, n, t = "FAIL";
        (function() {
            var c, n, t, o, r, a, f, i, u, h, l, v, y, A;
        })();
        try {
            throw 0;
        } catch (c) {
            (function() {
                (function c() {
                    t = "PASS";
                })();
            })();
            (function c() {
                try {} catch (c) {}
            })();
        }
        console.log(t);
    }
    expect_stdout: "PASS"
}

issue_3523_rename_ie8_toplevel: {
    rename = true
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        var a = 0, b, c = "FAIL";
        (function() {
            var d, e, f, g, h, i, j, k, l, m, o, p, q, r;
        })();
        try {
            throw 0;
        } catch (e) {
            (function() {
                (function e() {
                    c = "PASS";
                })();
            })();
            (function d() {
                try {
                } catch (e) {
                }
            })();
        }
        console.log(c);
    }
    expect: {
        var c = 0, n, t = "FAIL";
        (function() {
            var c, n, t, o, r, a, f, i, u, h, l, v, y, A;
        })();
        try {
            throw 0;
        } catch (o) {
            (function() {
                (function o() {
                    t = "PASS";
                })();
            })();
            (function r() {
                try {} catch (o) {}
            })();
        }
        console.log(t);
    }
    expect_stdout: "PASS"
}

issue_3542: {
    options = {
        ie: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 0;
        var b = a++;
        var c = b && function a() {} || b;
        console.log(a);
    }
    expect: {
        var a = 0;
        a++;
        (function a() {});
        console.log(a);
    }
    expect_stdout: "1"
}

issue_3703: {
    options = {
        ie: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = "PASS";
        function f() {
            var b;
            function g() {
                a = "FAIL";
            }
            var c = g;
            function h() {
                f;
            }
            a ? b |= c : b.p;
        }
        f();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function() {
            var b;
            var c = function() {
                a = "FAIL";
            };
            a ? b |= c : b.p;
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_3750: {
    options = {
        evaluate: true,
        ie: true,
    }
    input: {
        (function(a) {
            return function a() {
                return a && console.log("PASS");
            }();
        })();
    }
    expect: {
        (function(a) {
            return function a() {
                return a && console.log("PASS");
            }();
        })();
    }
    expect_stdout: "PASS"
}

issue_3823: {
    options = {
        ie: true,
        toplevel: true,
        unused: true,
    }
    input: {
        for (var i = 0; i < 1; i++) {
            var a = a ? function f() {
                f;
            } : 0;
            console.log("PASS", typeof f);
        }
    }
    expect: {
        for (var i = 0; i < 1; i++) {
            (function f() {
                f;
            });
            console.log("PASS", typeof f);
        }
    }
    expect_stdout: "PASS undefined"
}

issue_3825: {
    options = {
        ie: true,
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        console.log({}[void (0..length ? 1 : 2)]);
    }
    expect: {
        console.log({}[void 0]);
    }
    expect_stdout: "undefined"
}

issue_3889: {
    options = {
        evaluate: true,
        ie: true,
        reduce_vars: true,
    }
    input: {
        function f(a) {
            a = 0;
            (function a() {
                var a;
                console.log(a);
            })();
        }
        f();
    }
    expect: {
        function f(a) {
            a = 0;
            (function a() {
                var a;
                console.log(a);
            })();
        }
        f();
    }
    expect_stdout: "undefined"
}

issue_3918: {
    options = {
        conditionals: true,
        ie: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    mangle = {
        ie: true,
    }
    input: {
        if (console.log("PASS")) {
            var a = function f() {
                f.p;
                try {
                    console.log("FAIL");
                } catch (e) {}
            }, b = a;
        }
    }
    expect: {
        var a;
        console.log("PASS") && (a = function f() {
            f.p;
            try {
                console.log("FAIL");
            } catch (o) {}
        }, a);
    }
    expect_stdout: "PASS"
}

issue_3999: {
    rename = true
    mangle = {
        ie: true,
    }
    input: {
        (function() {
            (function f() {
                for (var i = 0; i < 2; i++)
                    try {
                        f[0];
                    } catch (f) {
                        var f = 0;
                        console.log(i);
                    }
            })();
        })(typeof f);
    }
    expect: {
        (function() {
            (function f() {
                for (var o = 0; o < 2; o++)
                    try {
                        f[0];
                    } catch (f) {
                        var f = 0;
                        console.log(o);
                    }
            })();
        })(typeof f);
    }
    expect_stdout: [
        "0",
        "1",
    ]
}

issue_4001_1: {
    options = {
        collapse_vars: true,
        ie: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: false,
        toplevel: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            function f() {
                return a;
                var b;
            }
            var c = f();
            (function g() {
                c[42];
                f;
            })();
            (function a() {});
        }(42));
    }
    expect: {
        function f() {
            return a;
        }
        var a;
        console.log((a = 42, f()[42], void f, void function a() {}));
    }
    expect_stdout: "undefined"
}

issue_4001_2: {
    options = {
        collapse_vars: true,
        ie: true,
        inline: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        console.log(function(a) {
            function f() {
                return a;
                var b;
            }
            var c = f();
            (function g() {
                c[42];
                f;
            })();
            (function a() {});
        }(42));
    }
    expect: {
        function f() {
            return a;
        }
        var a;
        console.log((a = 42, void f()[42]));
    }
    expect_stdout: "undefined"
}

issue_4015: {
    rename = true
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        var n, a = 0, b;
        function f() {
            try {
                throw 0;
            } catch (b) {
                (function g() {
                    (function b() {
                        a++;
                    })();
                })();
            }
        }
        f();
        console.log(a);
    }
    expect: {
        var n, o = 0, c;
        function t() {
            try {
                throw 0;
            } catch (c) {
                (function n() {
                    (function c() {
                        o++;
                    })();
                })();
            }
        }
        t();
        console.log(o);
    }
    expect_stdout: "1"
}

issue_4019: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        var a = function() {
            try {
                console.log("FAIL");
            } catch (b) {}
        }, a = (console.log(a.length), ++a);
    }
    expect: {
        var o = function() {
            try {
                console.log("FAIL");
            } catch (o) {}
        };
        console.log(o.length),
        ++o;
    }
    expect_stdout: "0"
}

issue_4028: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    mangle = {
        ie: true,
    }
    input: {
        function a() {
            try {
                A;
            } catch (e) {}
        }
        var b = a += a;
        console.log(typeof b);
    }
    expect: {
        function a() {
            try {
                A;
            } catch (a) {}
        }
        var b = a += a;
        console.log(typeof b);
    }
    expect_stdout: "string"
}

issue_2737: {
    options = {
        ie: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        (function(a) {
            a();
        })(function f() {
            console.log(typeof f);
        });
    }
    expect: {
        (function(a) {
            a();
        })(function f() {
            console.log(typeof f);
        });
    }
    expect_stdout: "function"
}

single_use_catch_redefined: {
    options = {
        ie: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1;
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
        }
        console.log(g());
    }
    expect: {
        var a = 1;
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
        }
        console.log(g());
    }
    expect_stdout: true
}

single_use_inline_catch_redefined: {
    options = {
        ie: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 1;
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
        }
        console.log(g());
    }
    expect: {
        var a = 1;
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
        }
        console.log(g());
    }
    expect_stdout: true
}

direct_inline_catch_redefined: {
    options = {
        ie: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        function f() {
            return a;
        }
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
            console.log(a, f(), g());
        }
        console.log(a, f(), g());
    }
    expect: {
        var a = 1;
        function f() {
            return a;
        }
        try {
            throw 2;
        } catch (a) {
            function g() {
                return a;
            }
            console.log(a, f(), g());
        }
        console.log(a, a, g());
    }
    expect_stdout: true
}

issue_4186: {
    options = {
        dead_code: true,
        evaluate: true,
        ie: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        function f() {
            (function NaN() {
                var a = 1;
                while (a--)
                    try {} finally {
                        console.log(0/0);
                        var b;
                    }
            })(f);
        }
        f();
        NaN;
    }
    expect: {
        (function() {
            (function NaN() {
                var n = 1;
                while (n--)
                    console.log(0/0);
            })();
        })();
        NaN;
    }
    expect_stdout: "NaN"
}

issue_4235: {
    options = {
        ie: true,
        unused: true,
    }
    input: {
        try {} catch (e) {}
        console.log(function e() {
            var e = 0;
        }());
    }
    expect: {
        try {} catch (e) {}
        console.log(function e() {}());
    }
    expect_stdout: "undefined"
}

issue_4250: {
    options = {
        ie: true,
        loops: true,
        unused: true,
    }
    input: {
        console.log(function f() {
            (function() {
                for (f in "f");
            })();
            return f;
            var f;
        }());
    }
    expect: {
        console.log(function f() {
            (function() {
                for (f in "f");
            })();
            return f;
            var f;
        }());
    }
    expect_stdout: "0"
}

issue_4568: {
    options = {
        ie: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        console.log(typeof f, function(a) {
            return a.length;
        }([ function f() {} ]));
    }
    expect: {
        console.log(typeof f, function(a) {
            return a.length;
        }([ function f() {} ]));
    }
    expect_stdout: "undefined 1"
}

issue_4729: {
    options = {
        ie: true,
        pure_getters: true,
        toplevel: true,
        unused: true,
    }
    input: {
        try {
            f;
        } catch (e) {
            var a = a && a[function f() {}];
            console.log("PASS");
        }
    }
    expect: {
        try {
            f;
        } catch (e) {
            (function f() {});
            console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_4928_1: {
    options = {
        ie: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = function f() {
            f(a);
        };
        console.log(typeof f);
    }
    expect: {
        var a = function f() {
            f(a);
        };
        console.log(typeof f);
    }
    expect_stdout: "undefined"
}

issue_4928_2: {
    options = {
        ie: true,
        toplevel: true,
        unused: true,
    }
    input: {
        switch (42) {
          case console:
            var a = function f() {
                f(a);
            };
          case 42:
            var a = console.log("PASS");
        }
    }
    expect: {
        switch (42) {
          case console:
            var a = function f() {
                f(a);
            };
          case 42:
            a = console.log("PASS");
        }
    }
    expect_stdout: "PASS"
}

issue_4958: {
    options = {
        collapse_vars: true,
        ie: true,
    }
    input: {
        console.log(function arguments(a) {
            a = 21;
            return arguments[0] + 21;
        }("FAIL"));
    }
    expect: {
        console.log(function arguments(a) {
            a = 21;
            return arguments[0] + 21;
        }("FAIL"));
    }
    expect_stdout: "42"
}

issue_5081_call: {
    options = {
        ie: false,
        merge_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            return a(b = "A") + (b += "SS");
        }
        console.log(f(function() {
            return "P";
        }));
    }
    expect: {
        function f(a) {
            // IE5-10: TypeError: Function expected
            return a(a = "A") + (a += "SS");
        }
        console.log(f(function() {
            return "P";
        }));
    }
    expect_stdout: "PASS"
}

issue_5081_call_ie: {
    options = {
        ie: true,
        merge_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            return a(b = "A") + (b += "SS");
        }
        console.log(f(function() {
            return "P";
        }));
    }
    expect: {
        function f(a) {
            var b;
            return a(b = "A") + (b += "SS");
        }
        console.log(f(function() {
            return "P";
        }));
    }
    expect_stdout: "PASS"
}

issue_5081_property_access: {
    options = {
        ie: false,
        merge_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            return a[b = "A"] + (b += "SS");
        }
        console.log(f({ A: "P" }));
    }
    expect: {
        function f(a) {
            return a[a = "A"] + (a += "SS");
        }
        // IE9-11: undefinedASS
        console.log(f({ A: "P" }));
    }
    expect_stdout: "PASS"
}

issue_5081_property_access_ie: {
    options = {
        ie: true,
        merge_vars: true,
        unused: true,
    }
    input: {
        function f(a) {
            var b;
            return a[b = "A"] + (b += "SS");
        }
        console.log(f({ A: "P" }));
    }
    expect: {
        function f(a) {
            var b;
            return a[b = "A"] + (b += "SS");
        }
        console.log(f({ A: "P" }));
    }
    expect_stdout: "PASS"
}

issue_5269_1: {
    options = {
        ie: false,
        inline: true,
        toplevel: true,
    }
    input: {
        "use strict";
        do {
            (function() {
                try {
                    throw "PASS";
                } catch (e) {
                    console.log(e);
                }
            })();
        } while (!console);
    }
    expect: {
        "use strict";
        do {
            try {
                throw "PASS";
            } catch (e) {
                console.log(e);
            }
        } while (!console);
    }
    expect_stdout: "PASS"
}

issue_5269_1_ie: {
    options = {
        ie: true,
        inline: true,
        toplevel: true,
    }
    input: {
        "use strict";
        do {
            (function() {
                try {
                    throw "PASS";
                } catch (e) {
                    console.log(e);
                }
            })();
        } while (!console);
    }
    expect: {
        "use strict";
        do {
            try {
                throw "PASS";
            } catch (e) {
                console.log(e);
            }
        } while (!console);
    }
    expect_stdout: "PASS"
}

issue_5269_2: {
    options = {
        ie: false,
        inline: true,
        toplevel: true,
    }
    input: {
        for (var i = 0; i < 2; i++)
            (function() {
                console.log(e);
                try {
                    console;
                } catch (e) {
                    var e = "FAIL 1";
                }
                e = "FAIL 2";
                console;
            })();
    }
    expect: {
        for (var i = 0; i < 2; i++) {
            e = void 0;
            console.log(e);
            try {
                console;
            } catch (e) {
                var e = "FAIL 1";
            }
            e = "FAIL 2";
            console;
        }
    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
}

issue_5269_2_ie: {
    options = {
        ie: true,
        inline: true,
        toplevel: true,
    }
    input: {
        for (var i = 0; i < 2; i++)
            (function() {
                console.log(e);
                try {
                    console;
                } catch (e) {
                    var e = "FAIL 1";
                }
                e = "FAIL 2";
                console;
            })();
    }
    expect: {
        for (var i = 0; i < 2; i++) {
            e = void 0;
            console.log(e);
            try {
                console;
            } catch (e) {
                var e = "FAIL 1";
            }
            e = "FAIL 2";
            console;
        }
    }
    expect_stdout: [
        "undefined",
        "undefined",
    ]
}

issue_5269_3: {
    options = {
        ie: false,
        inline: true,
        toplevel: true,
    }
    input: {
        e = "foo";
        for (var i = 0; i < 2; i++)
            (function() {
                console.log(e);
                try {
                    console;
                } catch (e) {
                    e = "FAIL";
                }
                e = "bar";
                console;
            })();
    }
    expect: {
        e = "foo";
        for (var i = 0; i < 2; i++) {
            console.log(e);
            try {
                console;
            } catch (e) {
                e = "FAIL";
            }
            e = "bar";
            console;
        }
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

issue_5269_3_ie: {
    options = {
        ie: true,
        inline: true,
        toplevel: true,
    }
    input: {
        e = "foo";
        for (var i = 0; i < 2; i++)
            (function() {
                console.log(e);
                try {
                    console;
                } catch (e) {
                    e = "FAIL";
                }
                e = "bar";
                console;
            })();
    }
    expect: {
        e = "foo";
        for (var i = 0; i < 2; i++) {
            console.log(e);
            try {
                console;
            } catch (e) {
                e = "FAIL";
            }
            e = "bar";
            console;
        }
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
}

issue_5350: {
    options = {
        ie: false,
        properties: true,
        side_effects: true,
    }
    input: {
        console.log(typeof f, [ 42, function f() {} ][0]);
    }
    expect: {
        console.log(typeof f, 42);
    }
    expect_stdout: "undefined 42"
}

issue_5350_ie: {
    options = {
        ie: true,
        properties: true,
        side_effects: true,
    }
    input: {
        console.log(typeof f, [ 42, function f() {} ][0]);
    }
    expect: {
        console.log(typeof f, (function f() {}, 42));
    }
    expect_stdout: "undefined 42"
}
