await_precedence: {
    input: {
        async function f1() { await x + y; }
        async function f2() { await (x + y); }
    }
    expect_exact: "async function f1(){await x+y}async function f2(){await(x+y)}"
}

await_precedence_prop: {
    input: {
        async function f1(){ return (await foo()).bar; }
        async function f2(){ return (await foo().bar); }
    }
    expect_exact: "async function f1(){return(await foo()).bar}async function f2(){return await foo().bar}"
}

await_precedence_call: {
    input: {
        async function f3(){ return (await foo())(); }
        async function f4(){ return await (foo()()); }
    }
    expect_exact: "async function f3(){return(await foo())()}async function f4(){return await foo()()}"
}

async_function_declaration: {
    options = {
        side_effects: true,
        unused: true,
    }
    input: {
        async function f0() {}
        async function f1() { await x + y; }
        async function f2() { await (x + y); }
        async function f3() { await x + await y; }
        async function f4() { await (x + await y); }
        async function f5() { await x; await y; }
        async function f6() { await x, await y; }
    }
    expect: {
        async function f0() {}
        async function f1() { await x, y; }
        async function f2() { await (x + y); }
        async function f3() { await x, await y; }
        async function f4() { await (x + await y); }
        async function f5() { await x; await y; }
        async function f6() { await x, await y; }
    }
}

async_function_expression: {
    options = {
        evaluate: true,
        side_effects: true,
        unused: true,
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
        var named = async function() {
            await bar(1);
        };
        var anon = async function() {
            await 1, bar(2);
        };
    }
}

async_class: {
    options = {
        evaluate: true,
    }
    input: {
        class Foo {
            async m1() {
                return await foo(1 + 2);
            }
            static async m2() {
                return await foo(3 + 4);
            }
        }
    }
    expect: {
        class Foo {
            async m1() {
                return await foo(3);
            }
            static async m2() {
                return await foo(7);
            }
        }
    }
}

async_object_literal: {
    options = {
        evaluate: true,
    }
    input: {
        var obj = {
            async a() {
                await foo(1 + 0);
            },
            anon: async function(){
                await foo(2 + 0);
            }
        };
    }
    expect: {
        var obj = {
            async a() {
                await foo(1);
            },
            anon: async function() {
                await foo(2);
            }
        };
    }
}

async_export: {
    input: {
        export async function run() {};
        export default async function def() {};
    }
    expect: {
        export async function run() {};
        export default async function def() {};
    }
}

async_inline: {
    options = {
        collapse_vars: true,
        conditionals: true,
        evaluate: true,
        inline: true,
        negate_iife: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        (async function(){ return await 3; })();
        (async function(x){ await console.log(x); })(4);

        function echo(x) { return x; }
        echo( async function(){ return await 1; }() );
        echo( async function(x){ await console.log(x); }(2) );

        function top() { console.log("top"); }
        top();

        async function async_top() { console.log("async_top"); }
        async_top();
    }
    expect: {
        !async function(){await 3}();
        !async function(x){await console.log(4)}();

        function echo(x){return x}
        echo(async function(){return await 1}());
        echo(async function(x){await console.log(2)}());

        console.log("top");

        !async function(){console.log("async_top")}();
    }
    expect_stdout: [
        "4",
        "2",
        "top",
        "async_top",
    ]
    node_version: ">=8"
}

async_identifiers: {
    input: {
        var async = function(x){ console.log("async", x); };
        var await = function(x){ console.log("await", x); };
        async(1);
        await(2);
    }
    expect: {
        var async = function(x){ console.log("async", x); };
        var await = function(x){ console.log("await", x); };
        async(1);
        await(2);
    }
    expect_stdout: [
        "async 1",
        "await 2",
    ]
}

async_shorthand_property: {
    mangle = {
        toplevel: true,
    }
    input: {
        function print(o) { console.log(o.async + " " + o.await); }
        var async = "Async", await = "Await";

        print({ async });
        print({ await });
        print({ async, await });
        print({ await, async });

        print({ async: async });
        print({ await: await });
        print({ async: async, await: await });
        print({ await: await, async: async });
    }
    expect: {
        function a(a) { console.log(a.async + " " + a.await); }
        var n = "Async", c = "Await";

        a({ async: n });
        a({ await: c });
        a({ async: n, await: c });
        a({ await: c, async: n });

        a({ async: n });
        a({ await: c });
        a({ async: n, await: c });
        a({ await: c, async: n });
    }
    expect_stdout: [
        "Async undefined",
        "undefined Await",
        "Async Await",
        "Async Await",
        "Async undefined",
        "undefined Await",
        "Async Await",
        "Async Await",
    ]
    node_version: ">=4"
}

async_arrow: {
    input: {
        let a1 = async x => await foo(x);
        let a2 = async () => await bar();
        let a3 = async (x) => await baz(x);
        let a4 = async (x, y) => { await far(x, y); }
        let a5 = async ({x = [1], y: z = 2}) => { await wow(x, z); }
    }
    expect: {
        let a1 = async x => await foo(x);
        let a2 = async () => await bar();
        let a3 = async (x) => await baz(x);
        let a4 = async (x, y) => { await far(x, y); }
        let a5 = async ({x = [1], y: z = 2}) => { await wow(x, z); }
    }
}

async_arrow_wait: {
    input: {
        var a = async (x, y) => await x(y);
    }
    expect_exact: "var a=async(x,y)=>await x(y);"
}

async_arrow_iife: {
    input: {
        (async () => {
            await fetch({});
        })();
    }
    expect_exact: "(async()=>{await fetch({})})();"
}

async_arrow_iife_negate_iife: {
    options = {
        negate_iife: true,
    }
    input: {
        (async () => {
            await fetch();
        })();
        (() => {
            plain();
        })();
    }
    expect_exact: "(async()=>{await fetch()})();(()=>{plain()})();"
}

issue_2344_1: {
    beautify = {
        safari10: false,
    }
    input: {
        async () => {
            +await x;
            await y;
            return await z;
        };
    }
    expect_exact: "async()=>{+await x;await y;return await z};"
}

issue_2344_2: {
    beautify = {
        safari10: true,
    }
    input: {
        async () => {
            +await x;
            await y;
            return await z;
        };
    }
    expect_exact: "async()=>{+(await x);await y;return await z};"
}
