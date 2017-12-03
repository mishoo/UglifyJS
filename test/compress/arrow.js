arrow_functions_without_body: {
    input: {
        var a1 = () => 42;
        var a2 = (p) => p;
        var a3 = p => p;
        var a4 = (...p) => p;
        var a5 = (b, c) => b + c;
        var a6 = (b, ...c) => b + c[0];
        var a7 = (...b) => b.join();
    }
    expect: {
        var a1 = () => 42;
        var a2 = (p) => p;
        var a3 = p => p;
        var a4 = (...p) => p;
        var a5 = (b, c) => b + c;
        var a6 = (b, ...c) => b + c[0];
        var a7 = (...b) => b.join();
    }
}

arrow_functions_with_body: {
    input: {
        var a1 = () => {
            var a = 42 * Math.random();
            return a;
        };
        var a2 = (p) => {
            var a = Math.random() * p;
            return a;
        };
        var a3 = p => {
            var a = Math.random() * p;
            return a;
        };
        var a4 = (...p) => {
            var a = Math.random() * p;
            return a;
        };
        var a5 = (b, c) => {
            var result = b * c + b / c;
            return result
        };
        var a6 = (b, ...c) => {
            var result = b;
            for (var i = 0; i < c.length; i++)
                result += c[i];
            return result
        };
        var a7 = (...b) => {
            b.join();
        }
    }
    expect: {
        var a1 = () => {
            var a = 42 * Math.random();
            return a;
        };
        var a2 = (p) => {
            var a = Math.random() * p;
            return a;
        };
        var a3 = p => {
            var a = Math.random() * p;
            return a;
        };
        var a4 = (...p) => {
            var a = Math.random() * p;
            return a;
        };
        var a5 = (b, c) => {
            var result = b * c + b / c;
            return result
        };
        var a6 = (b, ...c) => {
            var result = b;
            for (var i = 0; i < c.length; i++)
                result += c[i];
            return result
        };
        var a7 = (...b) => {
            b.join();
        };
    }
}

arrow_function_with_single_parameter_with_default: {
    input: {
        var foo = (a = 0) => doSomething(a);
    }
    expect_exact: "var foo=(a=0)=>doSomething(a);"
}

arrow_binding_pattern: {
    input: {
        var foo = ([]) => "foo";
        var bar = ({}) => "bar";
        var with_default = (foo = "default") => foo;
        var object_with_default = ({foo = "default", bar: baz = "default"}) => foo;
        var array_after_spread = (...[foo]) => foo;
        var array_after_spread = (...{foo}) => foo;
        var computed = ({ [compute()]: x }) => {};
        var array_hole = ([, , ...x] = [1, 2]) => {};
        var object_trailing_elision = ({foo,}) => {};
        var spread_empty_array = (...[]) => "foo";
        var spread_empty_object = (...{}) => "foo";
    }
    expect: {
        var foo = ([]) => "foo";
        var bar = ({}) => "bar";
        var with_default = (foo = "default") => foo;
        var object_with_default = ({foo = "default", bar: baz = "default"}) => foo;
        var array_after_spread = (...[foo]) => foo;
        var array_after_spread = (...{foo}) => foo;
        var computed = ({ [compute()]: x }) => {};
        var array_hole = ([, , ...x] = [1, 2]) => {};
        var object_trailing_elision = ({foo,}) => {};
        var spread_empty_array = (...[]) => "foo";
        var spread_empty_object = (...{}) => "foo";
    }
}

arrow_binding_pattern_strict: {
    input: {
        var foo = ([,]) => "foo";
    }
    expect_exact: 'var foo=([,])=>"foo";'
}

arrow_with_regexp: {
    input: {
        num => /\d{11,14}/.test( num )
    }
    expect: {
        num => /\d{11,14}/.test( num )
    }
}

arrow_unused: {
    options = {
        toplevel: false,
        side_effects: true,
        unused: true,
    }
    input: {
        top => dog;
        let fn = a => { console.log(a * a); };
        let u = (x, y) => x - y + g;
        (() => { console.log("0"); })();
        !function(x) {
            (() => { console.log("1"); })();
            let unused = x => { console.log(x); };
            let baz = e => e + e;
            console.log(baz(x));
        }(1);
        fn(3);
    }
    expect: {
        let fn = a => { console.log(a * a); };
        let u = (x, y) => x - y + g;
        (() => { console.log("0"); })();
        !function(x) {
            (() => { console.log("1"); })();
            let baz = e => e + e;
            console.log(baz(x));
        }(1);
        fn(3);
    }
    expect_stdout: [ "0", "1", "2", "9" ]
    node_version: ">=6"
}

arrow_unused_toplevel: {
    options = {
        toplevel: true,
        side_effects: true,
        unused: true,
    }
    input: {
        top => dog;
        let fn = a => { console.log(a * a); };
        let u = (x, y) => x - y + g;
        (() => { console.log("0"); })();
        !function(x) {
            (() => { console.log("1"); })();
            let unused = x => { console.log(x); };
            let baz = e => e + e;
            console.log(baz(x));
        }(1);
        fn(3);
    }
    expect: {
        let fn = a => { console.log(a * a); };
        (() => { console.log("0"); })();
        !function(x) {
            (() => { console.log("1"); })();
            let baz = e => e + e;
            console.log(baz(x));
        }(1);
        fn(3);
    }
    expect_stdout: [ "0", "1", "2", "9" ]
    node_version: ">=6"
}

no_leading_parentheses: {
    input: {
        (x,y) => x(y);
        async (x,y) => await x(y);
    }
    expect_exact: "(x,y)=>x(y);async(x,y)=>await x(y);"
}

async_identifiers: {
    options = {
        unsafe_arrows: true,
        ecma: 6,
    }
    input: {
        var async = function(x){ console.log("async", x); };
        var await = function(x){ console.log("await", x); };
        async(1);
        await(2);
    }
    expect: {
        var async = x => { console.log("async", x); };
        var await = x => { console.log("await", x); };
        async(1);
        await(2);
    }
    expect_stdout: [
        "async 1",
        "await 2",
    ]
    node_version: ">=4"
}

async_function_expression: {
    options = {
        unsafe_arrows: true,
        ecma: 6,
        evaluate: true,
        side_effects: true,
    }
    input: {
        var named = async function foo() {
            await bar(1 + 0) + (2 + 0);
        }
        var anon = async function() {
            await (1 + 0) + bar(2 + 0);
        }
    }
    expect: {
        var named = async function foo() {
            await bar(1);
        };
        var anon = async () => {
            await 1, bar(2);
        };
    }
}

issue_27: {
    options = {
        unsafe_arrows: true,
        collapse_vars: true,
        ecma: 6,
        unused: true,
    }
    input: {
        (function(jQuery) {
            var $;
            $ = jQuery;
            $("body").addClass("foo");
        })(jQuery);
    }
    expect: {
        (jQuery => {
            jQuery("body").addClass("foo");
        })(jQuery);
    }
}

issue_2105_1: {
    options = {
        unsafe_arrows: true,
        collapse_vars: true,
        ecma: 6,
        inline: true,
        passes: 3,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unsafe_methods: true,
        unused: true,
    }
    input: {
        !function(factory) {
            factory();
        }( function() {
            return function(fn) {
                fn()().prop();
            }( function() {
                function bar() {
                    var quux = function() {
                        console.log("PASS");
                    }, foo = function() {
                        console.log;
                        quux();
                    };
                    return { prop: foo };
                }
                return bar;
            } );
        });
    }
    expect: {
        ({
            prop() {
                console.log;
                console.log("PASS");
            }
        }).prop();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_2105_2: {
    options = {
        collapse_vars: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        ((factory) => {
            factory();
        })( () => {
            return ((fn) => {
                fn()().prop();
            })( () => {
                let bar = () => {
                    var quux = () => {
                        console.log("PASS");
                    }, foo = () => {
                        console.log;
                        quux();
                    };
                    return { prop: foo };
                };
                return bar;
            } );
        });
    }
    expect: {
        ({
            prop: () => {
                console.log;
                console.log("PASS");
            }
        }).prop();
    }
    expect_stdout: "PASS"
    node_version: ">=6"
}

issue_2136_2: {
    options = {
        arrows: true,
        collapse_vars: true,
        ecma: 6,
        inline: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f(x) {
            console.log(x);
        }
        !function(a, ...b) {
            f(b[0]);
        }(1, 2, 3);
    }
    expect: {
        function f(x) {
            console.log(x);
        }
        f([2,3][0]);
    }
    expect_stdout: "2"
    node_version: ">=6"
}

issue_2136_3: {
    options = {
        arrows: true,
        collapse_vars: true,
        ecma: 6,
        evaluate: true,
        inline: true,
        passes: 3,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        function f(x) {
            console.log(x);
        }
        !function(a, ...b) {
            f(b[0]);
        }(1, 2, 3);
    }
    expect: {
        console.log(2);
    }
    expect_stdout: "2"
    node_version: ">=6"
}

call_args: {
    options = {
        arrows: true,
        ecma: 6,
        evaluate: true,
        inline: true,
        reduce_funcs: true,
        reduce_vars: true,
    }
    input: {
        const a = 1;
        console.log(a);
        +function(a) {
            return a;
        }(a);
    }
    expect: {
        const a = 1;
        console.log(1);
        +(1, 1);
    }
    expect_stdout: true
}

call_args_drop_param: {
    options = {
        arrows: true,
        ecma: 6,
        evaluate: true,
        inline: true,
        keep_fargs: false,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
    }
    input: {
        const a = 1;
        console.log(a);
        +function(a) {
            return a;
        }(a, b);
    }
    expect: {
        const a = 1;
        console.log(1);
        +(b, 1);
    }
    expect_stdout: true
}

issue_485_crashing_1530: {
    options = {
        arrows: true,
        conditionals: true,
        dead_code: true,
        ecma: 6,
        evaluate: true,
        inline: true,
        side_effects: true,
    }
    input: {
        (function(a) {
            if (true) return;
            var b = 42;
        })(this);
    }
    expect: {}
}

issue_2084: {
    options = {
        unsafe_arrows: true,
        collapse_vars: true,
        conditionals: true,
        ecma: 6,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        var c = 0;
        !function() {
            !function(c) {
                c = 1 + c;
                var c = 0;
                function f14(a_1) {
                    if (c = 1 + c, 0 !== 23..toString())
                        c = 1 + c, a_1 && (a_1[0] = 0);
                }
                f14();
            }(-1);
        }();
        console.log(c);
    }
    expect: {
        var c = 0;
        ((c) => {
            c = 1 + c,
            c = 1 + (c = 0),
            0 !== 23..toString() && (c = 1 + c);
        })(-1),
        console.log(c);
    }
    expect_stdout: "0"
    node_version: ">=4"
}

export_default_object_expression: {
    options = {
        arrows: true,
        evaluate: true,
    }
    input: {
        export default {
            foo: 1 + 2,
            bar() { return 4; },
            get baz() { return this.foo; },
        };
    }
    expect_exact: "export default{foo:3,bar:()=>4,get baz(){return this.foo}};"
}

concise_methods_with_computed_property2: {
    options = {
        arrows: true,
        evaluate: true,
    }
    input: {
        var foo = {
            [[1]](v) {
                return v;
            }
        };
        console.log(foo[[1]]("PASS"));
    }
    expect_exact: 'var foo={[[1]]:v=>v};console.log(foo[[1]]("PASS"));'
    expect_stdout: "PASS"
    node_version: ">=4"
}

async_object_literal: {
    options = {
        arrows: true,
        unsafe_arrows: true,
        ecma: 6,
        evaluate: true,
    }
    input: {
        var obj = {
            async a() {
                return await foo(1 + 0);
            },
            anon: async function() {
                return await foo(2 + 0);
            }
        };
    }
    expect: {
        var obj = {
            a: async () => await foo(1),
            anon: async () => await foo(2)
        };
    }
}

issue_2271: {
    options = {
        arrows: true,
        ecma: 6,
        evaluate: true,
        unsafe_arrows: false,
    }
    input: {
        var Foo = function() {};
        Foo.prototype.set = function(value) {
            this.value = value;
            return this;
        }
        Foo.prototype.print = function() {
            console.log(this.value);
        }
        new Foo().set("PASS").print();
    }
    expect: {
        var Foo = function() {};
        Foo.prototype.set = function(value) {
            this.value = value;
            return this;
        }
        Foo.prototype.print = function() {
            console.log(this.value);
        }
        new Foo().set("PASS").print();
    }
    expect_stdout: "PASS"
}

concise_method_with_super: {
    options = {
        arrows: true,
    }
    input: {
        var o = {
            f: "FAIL",
            g() {
                return super.f;
            }
        }
        Object.setPrototypeOf(o, { f: "PASS" });
        console.log(o.g());
    }
    expect: {
        var o = {
            f: "FAIL",
            g() {
                return super.f;
            }
        }
        Object.setPrototypeOf(o, { f: "PASS" });
        console.log(o.g());
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}
