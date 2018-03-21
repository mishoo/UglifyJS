import "mod-name";
import Foo from "bar";
import * as Food from "food"
import { Bar, Baz } from "lel";
import Bar1, { Foo2 } from "lel";
import { Bar2 as kex, Baz as food } from "lel";

const x = 0b01;
let y = 6;

export default x;
export const z = 4;
export function fun() {}
export * from "a.js";
export {A} from "a.js";
export {A1, B1} from "a.js";
export {C};

(a, [b], {c:foo = 3}, ...d) => null;
() => {};

async function f() { }
function*gen() {
    yield 1;
    yield* 2;
}

class Class extends Object {
    constructor(...args) {
    }
    foo() {}
}

x = class {
    static staticMethod() {}
    static get foo() {}
    static set bar(value) {}
    get x() {}
    set x(value) {}
    static() {
        // "static" can be a method name!
    }
    get() {
        // "get" can be a method name!
    }
    async set() {
        // "set" can be a method name!
    }
    *bar() {}
    static *baz() {}
    *['constructor']() {}
    static ['constructor']() {}
    [a]() {}
    "%"(){}
}

y = {
    get x() {},
    set x(value) {},
    bar() {},
    *bar() {},
    *['constructor']() {}
}
function f () {
    console.log(new.target);
}
console.log([10, ...[], 20, ...[30, 40], 50]["length"]);
var { w: w1, ...V } = { w: 7, x: 1, y: 2 };
for (const x of y) {}
async function f1() { await x + y; }

``;
`x`;
`x${1}`;
String.raw`\n`;

// arrow.js

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

// async.js

async (x) => await x

// destructuring.js

var [aa, bb] = cc;
var [aa, [bb, cc]] = dd;
var [,[,,,,,],,,zz,] = xx; // Trailing comma
var [,,zzz,,] = xxx; // Trailing comma after hole

var {aa, bb} = {aa:1, bb:2};
var {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};

for (const [x,y] in pairs);
for (const [a] = 0;;);
for (const {c} of cees);

// object.js

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
    },
    *"%"() {
        return 2;
    },
    *["%"]() {
        return 2;
    },
    [a]() {}
};

