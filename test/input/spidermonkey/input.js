import "mod-name";
import Foo from "bar";
import * as Food from "food"
import { Bar, Baz } from "lel";
import Bar, { Foo } from "lel";
import { Bar as kex, Baz as food } from "lel";

const x = 0b01;
let y = 6;

export default x;
export const z = 4;
export function fun() {}
export * from "a.js";
export {A} from "a.js";
export {A, B} from "a.js";
export {C};

(a, [b], {c:foo = 3}, ...d) => null;
() => {}

async function f() { }
function*gen() { }

class Class extends Object {
    constructor(...args) {
    }
    foo() {}
}

x = class {
    static staticMethod() {}
    static get foo() {}
    static set bar() {}
    get x() {}
    set x(value) {}
    static() { /* "static" can be a method name! */ }
    get() { /* "get" can be a method name! */ }
    set() { /* "set" can be a method name! */ }
    *bar() {}
    static *baz() {}
    *['constructor']() {}
    static ['constructor']() {}
}

y = {
    get x() {},
    set x(value) {},
    bar() {},
    *bar() {},
    *['constructor']() {}
}
console.log(new.target);
console.log([10, ...[], 20, ...[30, 40], 50]["length"]);
var { w: w1, ...V } = { w: 7, x: 1, y: 2 };
for (const x of y) {}
async function f1() { await x + y; }
