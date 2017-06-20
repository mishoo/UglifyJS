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
        export { LET as a, CONST as c, VAR as n };
    }
}

issue_2124: {
    options = {
        unused: true,
    }
    input: {
        {
            export var V = 1;
        }
        {
            export let L = 2;
        }
        {
            export const C = 3;
        }
    }
    expect: {
        {
            export var V = 1;
        }
        {
            export let L = 2;
        }
        {
            export const C = 3;
        }
    }
}
