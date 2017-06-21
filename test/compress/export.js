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
