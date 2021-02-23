refs: {
    input: {
        export {};
        export { a, b as B, c as case, d as default };
    }
    expect_exact: "export{};export{a as a,b as B,c as case,d as default};"
}

var_defs: {
    input: {
        export const a = 1;
        export let b = 2, c = 3;
        export var { d, e: [] } = f;
    }
    expect_exact: "export const a=1;export let b=2,c=3;export var{d:d,e:[]}=f;"
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
    expect_exact: "export default 42;export default async;export default(x,y)=>x*x;export default class{}export default function*(a,b){}export default async function f({c:c},...[d]){}"
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

hoist_exports: {
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
        let f, { foo: o } = 42;
        function c(t, { [f]: a }) {
            t(a, c);
        }
        export default 42;
        export default async function e(t, ...{ [o]: a }) {
            (await t)(e, a);
        };
        export { f as bbb, o as ccc, c as fff };
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
