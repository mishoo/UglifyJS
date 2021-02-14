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
        export function e() {}
        export function* f(a) {}
        export async function g(b, c) {}
        export async function* h({}, ...[]) {}
    }
    expect_exact: "export function e(){}export function*f(a){}export async function g(b,c){}export async function*h({},...[]){}"
}

defaults: {
    input: {
        export default 42;
        export default (x, y) => x * x;
        export default function*(a, b) {};
        export default async function f({ c }, ...[ d ]) {};
    }
    expect_exact: "export default 42;export default(x,y)=>x*x;export default function*(a,b){};export default async function f({c:c},...[d]){};"
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
        export default function*(a, b) {};
        export default async function f({ c }, ...[ d ]) {};
        export var e;
        export function g(x, [ y ], ...z) {}
    }
    expect: {
        export default 42;
        export default (x, y) => x * x;
        export default function*(a, b) {};
        export default async function({}) {};
        export var e;
        export function g(x, []) {}
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
        export default async function t(o, ...{ [c]: e}) {
            (await o)(t, e);
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
        export default async function t(o, ...{ [c]: e}) {
            (await o)(t, e);
        }
    }
}
