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
        arrows: true,
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
        arrows: true,
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
        arrows: true,
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
