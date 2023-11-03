refs: {
    input: {
        export {};
        export { a, b as B, c as case, d as default };
    }
    expect_exact: "export{};export{a,b as B,c as case,d as default};"
}

var_defs: {
    input: {
        export const a = 1;
        export let b = 2, c = 3;
        export var { d, e: [] } = f;
    }
    expect_exact: "export const a=1;export let b=2,c=3;export var{d,e:[]}=f;"
}

defuns: {
    input: {
        export class A {}
        export function e() {}
        export function* f(a) {}
        export async function g(b, c) {}
        export async function* h({}, ...[]) {}
    }
    expect_exact: "export class A{}export function e(){}export function*f(a){}export async function g(b,c){}export async function*h({},...[]){}"
}

defaults: {
    input: {
        export default 42;
        export default async;
        export default (x, y) => x * x;
        export default class {};
        export default function*(a, b) {};
        export default async function f({ c }, ...[ d ]) {};
    }
    expect_exact: "export default 42;export default async;export default(x,y)=>x*x;export default class{}export default function*(a,b){}export default async function f({c},...[d]){}"
}

defaults_parentheses_1: {
    input: {
        export default function() {
            console.log("FAIL");
        }(console.log("PASS"));
    }
    expect_exact: 'export default function(){console.log("FAIL")}console.log("PASS");'
}

defaults_parentheses_2: {
    input: {
        export default (async function() {
            console.log("PASS");
        })();
    }
    expect_exact: 'export default(async function(){console.log("PASS")})();'
}

defaults_parentheses_3: {
    input: {
        export default (42, "PASS");
    }
    expect_exact: 'export default(42,"PASS");'
}

defaults_parentheses_4: {
    input: {
        export default (function f() {});
    }
    expect_exact: "export default(function f(){});"
}

defaults_parentheses_5: {
    input: {
        export default (function(a) {
            console.log(a[0]);
        }`PASS`);
    }
    expect_exact: "export default(function(a){console.log(a[0])})`PASS`;"
}

defaults_parentheses_6: {
    options = {
        conditionals: true,
    }
    input: {
        export default !function() {
            while (!console);
        }() ? "PASS" : "FAIL";
    }
    expect_exact: 'export default(function(){while(!console);})()?"FAIL":"PASS";'
}

defaults_regexp: {
    input: {
        export default /foo/;
    }
    expect_exact: "export default/foo/;"
}

foreign: {
    input: {
        export * from "foo";
        export {} from "bar";
        export * as a from "baz";
        export { default } from "moo";
        export { b, c as case, default as delete, d } from "moz";
    }
    expect_exact: 'export*from"foo";export{}from"bar";export*as a from"baz";export{default}from"moo";export{b,c as case,default as delete,d}from"moz";'
}

non_identifiers: {
    beautify = {
        quote_style: 3,
    }
    input: {
        export * as "42" from 'foo';
        export { '42', "delete" as 'foo' } from "bar";
    }
    expect_exact: "export*as\"42\"from'foo';export{'42',delete as foo}from\"bar\";"
}

same_quotes: {
    beautify = {
        beautify: true,
        quote_style: 3,
    }
    input: {
        export * from 'foo';
        export {} from "bar";
    }
    expect_exact: [
        "export * from 'foo';",
        "",
        'export {} from "bar";',
    ]
}

drop_unused: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        export default 42;
        export default (x, y) => x * x;
        export default class A extends B { get p() { h() } }
        export default function*(a, b) {}
        export default async function f({ c }, ...[ d ]) {}
        export var e;
        export function g(x, [ y ], ...z) {}
        function h() {}
    }
    expect: {
        export default 42;
        export default (x, y) => x * x;
        export default class extends B { get p() { h() } }
        export default function*(a, b) {}
        export default async function({}) {}
        export var e;
        export function g(x, []) {}
        function h() {}
    }
}

mangle: {
    rename = false
    mangle = {
        toplevel: true,
    }
    input: {
        const a = 42;
        export let b, { foo: c } = a;
        export function f(d, { [b]: e }) {
            d(e, f);
        }
        export default a;
        export default async function g(x, ...{ [c]: y }) {
            (await x)(g, y);
        }
    }
    expect: {
        const t = 42;
        export let b, { foo: c } = t;
        export function f(t, { [b]: o }) {
            t(o, f);
        }
        export default t;
        export default async function e(t, ...{ [c]: o}) {
            (await t)(e, o);
        }
    }
}

mangle_rename: {
    rename = true
    mangle = {
        toplevel: true,
    }
    input: {
        const a = 42;
        export let b, { foo: c } = a;
        export function f(d, { [b]: e }) {
            d(e, f);
        }
        export default a;
        export default async function g(x, ...{ [c]: y }) {
            (await x)(g, y);
        }
    }
    expect: {
        const t = 42;
        export let b, { foo: c } = t;
        export function f(t, { [b]: o }) {
            t(o, f);
        }
        export default t;
        export default async function e(t, ...{ [c]: o}) {
            (await t)(e, o);
        }
    }
}

hoist_exports_1: {
    options = {
        hoist_exports: true,
    }
    input: {
        export { a };
        export var b;
        export function f() {}
    }
    expect: {
        var b;
        function f() {}
        export { a, b, f };
    }
}

hoist_exports_2: {
    options = {
        evaluate: true,
        hoist_exports: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    mangle = {
        toplevel: true,
    }
    input: {
        const a = 42;
        export let bbb, { foo: ccc } = a;
        export function fff(d, { [bbb]: e }) {
            d(e, fff);
        }
        export default a;
        export default async function g(x, ...{ [ccc]: y }) {
            (await x)(g, y);
        }
    }
    expect: {
        let e, a = 42["foo"];
        function f(t, { [e]: o }) {
            t(o, f);
        }
        export default 42;
        export default async function n(t, ...{ [a]: o }) {
            (await t)(n, o);
        };
        export { e as bbb, a as ccc, f as fff };
    }
}

hoist_vars: {
    options = {
        hoist_vars: true,
    }
    input: {
        var a;
        export var b = 42;
    }
    expect: {
        var a;
        export var b = 42;
    }
}

keep_return_values: {
    options = {
        booleans: true,
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        export default function() {
            return [];
        }
        export default function f() {
            return null;
        }
    }
    expect: {
        export default function() {
            return [];
        }
        export default function f() {
            return null;
        }
    }
}

in_use: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export function f() {}
        f.prototype.p = 42;
    }
    expect: {
        export function f() {}
        f.prototype.p = 42;
    }
}

in_use_default: {
    options = {
        pure_getters: "strict",
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export default function f() {}
        f.prototype.p = 42;
    }
    expect: {
        export default function f() {}
        f.prototype.p = 42;
    }
}

single_use: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export function f() {
            console.log("PASS");
        }
        f();
    }
    expect: {
        export function f() {
            console.log("PASS");
        }
        f();
    }
}

single_use_default: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export default function f() {
            console.log("PASS");
        }
        f();
    }
    expect: {
        export default function f() {
            console.log("PASS");
        }
        f();
    }
}

single_use_class: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export class A {}
        A.prototype.p = "PASS";
    }
    expect: {
        export class A {}
        A.prototype.p = "PASS";
    }
}

single_use_class_default: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export default class A {}
        A.prototype.p = "PASS";
    }
    expect: {
        export default class A {}
        A.prototype.p = "PASS";
    }
}

hoist_funs: {
    options = {
        hoist_funs: true,
    }
    input: {
        export function f() {}
        export default async function* g() {}
    }
    expect_exact: "export function f(){}export default async function*g(){}"
}

instanceof_default_class: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        export default class A {
            f(a) {
                return a instanceof A;
            }
        }
    }
    expect: {
        export default class A {
            f(a) {
                return a instanceof A;
            }
        }
    }
}

instanceof_default_function: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        export default function f() {
            if (!(this instanceof f))
                throw new Error("must instantiate");
        }
    }
    expect: {
        export default function f() {
            if (!(this instanceof f))
                throw new Error("must instantiate");
        }
    }
}

issue_4742_join_vars_1: {
    options = {
        join_vars: true,
    }
    input: {
        var a = 42;
        export var a;
    }
    expect: {
        var a = 42;
        export var a;
    }
}

issue_4742_join_vars_2: {
    options = {
        join_vars: true,
    }
    input: {
        export var a = "foo";
        var b;
        b = "bar";
    }
    expect: {
        export var a = "foo";
        var b, b = "bar";
    }
}

issue_4742_unused_1: {
    options = {
        unused: true,
    }
    input: {
        var a = 42;
        export var a;
    }
    expect: {
        var a = 42;
        export var a;
    }
}

issue_4742_unused_2: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export var a = "foo";
        var a = "bar";
    }
    expect: {
        export var a = "foo";
        a = "bar";
    }
}

issue_4761: {
    input: {
        export default "function" == 42;
    }
    expect_exact: 'export default"function"==42;'
}

issue_4766: {
    options = {
        unused: true,
    }
    input: {
        var a = "foo";
        export var a = "bar";
    }
    expect: {
        var a = "foo";
        export var a = "bar";
    }
}

issue_5444: {
    options = {
        unused: true,
    }
    input: {
        export var a = (console, console);
    }
    expect: {
        console;
        export var a = console;
    }
}

issue_5628: {
    options = {
        unused: true,
    }
    input: {
        var a;
        export default function f() {
            for (a in 42);
        }
        console.log(a);
    }
    expect: {
        var a;
        export default function f() {
            for (a in 42);
        }
        console.log(a);
    }
}
