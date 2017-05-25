export_func_1: {
    options = {
        unused: true,
    }
    input: {
        export function f(){};
    }
    expect_exact: "export function f(){};"
}

export_func_2: {
    options = {
        side_effects: false,
        unused: true,
    }
    input: {
        export function f(){}(1);
    }
    expect_exact: "export function f(){};1;"
}

export_func_3: {
    options = {
        side_effects: true,
        unused: true,
    }
    input: {
        export function f(){}(1);
    }
    expect_exact: "export function f(){};"
}

export_default_func_1: {
    options = {
        unused: true,
    }
    input: {
        export default function f(){};
    }
    expect_exact: "export default function(){};"
}

export_default_func_2: {
    options = {
        side_effects: false,
        unused: true,
    }
    input: {
        export default function f(){}(1);
    }
    expect_exact: "export default function(){};1;"
}

export_default_func_3: {
    options = {
        side_effects: true,
        unused: true,
    }
    input: {
        export default function f(){}(1);
    }
    expect_exact: "export default function(){};"
}

export_mangle_1: {
    mangle = {}
    input: {
        export function foo(one, two) {
            return one - two;
        };
    }
    expect_exact: "export function foo(n,o){return n-o};"
}

export_mangle_2: {
    mangle = {}
    input: {
        export default function foo(one, two) {
            return one - two;
        };
    }
    expect_exact: "export default function n(r,t){return r-t};"
}

export_mangle_3: {
    options = {
        collapse_vars: true,
    }
    mangle = {}
    input: {
        export class C {
            go(one, two) {
                var z = one;
                return one - two + z;
            }
        };
    }
    expect_exact: "export class C{go(n,r){return n-r+n}};"
}

export_mangle_4: {
    options = {
        collapse_vars: true,
    }
    mangle = {}
    input: {
        export default class C {
            go(one, two) {
                var z = one;
                return one - two + z;
            }
        };
    }
    expect_exact: "export default class C{go(n,r){return n-r+n}};"
}

export_mangle_5: {
    mangle = {}
    input: {
        export default {
            prop: function(one, two) {
                return one - two;
            }
        };
    }
    expect_exact: "export default{prop:function(n,r){return n-r}};"
}

export_mangle_6: {
    mangle = {}
    input: {
        export let foo = 1;
    }
    expect_exact: "export let foo=1;"
}
