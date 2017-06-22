issue_2038_1: {
    options = {
        toplevel: true,
        unused: true,
    }
    mangle = {
        toplevel: true,
    }
    input: {
        export var V = 1;
        export let L = 2;
        export const C = 3;
    }
    expect: {
        export var V = 1;
        export let L = 2;
        export const C = 3;
    }
}

issue_2038_2: {
    options = {
        toplevel: true,
        unused: true,
    }
    mangle = {
        toplevel: true,
    }
    input: {
        let LET = 1;
        const CONST = 2;
        var VAR = 3;
        export { LET, CONST, VAR };
    }
    expect: {
        let a = 1;
        const c = 2;
        var n = 3;
        export { a as LET, c as CONST, n as VAR };
    }
}

issue_2126: {
    mangle = {
        toplevel: true,
    }
    input: {
        import { foo as bar, cat as dog } from "stuff";
        console.log(bar, dog);
        export { bar as qux };
        export { dog };
    }
    expect: {
        import { foo as o, cat as f } from "stuff";
        console.log(o, f);
        export { o as qux };
        export { f as dog };
    }
}

beautify: {
    beautify = {
        beautify: true,
    }
    input: {
        export { A as B, C as D };
    }
    expect_exact: "export { A as B, C as D };"
}

issue_2131: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        function no() {
            console.log(42);
        }
        function go() {
            console.log(42);
        }
        var X = 1, Y = 2;
        export function main() {
            go(X);
        };
    }
    expect: {
        function go() {
            console.log(42);
        }
        var X = 1;
        export function main() {
            go(X);
        };
    }
}

issue_2129: {
    mangle = {
        toplevel: true,
    }
    input: {
        export const { keys } = Object;
    }
    expect: {
        export const { keys } = Object;
    }
}

async_func: {
    options = {
        keep_fargs: false,
        unused: true,
    }
    input: {
        export async function Foo(x){};
    }
    expect: {
        export async function Foo(){};
    }
}

issue_2134_1: {
    options = {
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export function Foo(x){};
        Foo.prototype = {};
    }
    expect: {
        export function Foo(){};
        Foo.prototype = {};
    }
}

issue_2134_2: {
    options = {
        keep_fargs: false,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export async function Foo(x){};
        Foo.prototype = {};
    }
    expect: {
        export async function Foo(){};
        Foo.prototype = {};
    }
}

redirection: {
    mangle = {
        toplevel: true,
    }
    input: {
        let foo = 1, bar = 2;
        export { foo as delete };
        export { bar as default };
        export { foo as var } from "module.js";
    }
    expect: {
        let o = 1, d = 2;
        export { o as delete };
        export { d as default };
        export { foo as var } from "module.js";
    }
}

keyword_invalid_1: {
    input: {
        export { default };
    }
    expect: {
        export { default };
    }
}

keyword_invalid_2: {
    input: {
        export { default as Alias };
    }
    expect: {
        export { default as Alias };
    }
}

keyword_invalid_3: {
    input: {
        export { default as default };
    }
    expect: {
        export { default as default };
    }
}

keyword_valid_1: {
    input: {
        export { default } from "module.js";
    }
    expect: {
        export { default } from "module.js";
    }
}

keyword_valid_2: {
    input: {
        export { default as Alias } from "module.js";
    }
    expect: {
        export { default as Alias } from "module.js";
    }
}

keyword_valid_3: {
    input: {
        export { default as default } from "module.js";
    }
    expect: {
        export { default as default } from "module.js";
    }
}
