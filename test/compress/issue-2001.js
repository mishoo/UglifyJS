export_func_1: {
    options = {
        hoist_funs: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export function f(){};
    }
    expect_exact: "export function f(){};"
}

export_func_2: {
    options = {
        hoist_funs: true,
        side_effects: false,
        toplevel: true,
        unused: true,
    }
    input: {
        export function f(){}(1);
    }
    expect_exact: "export function f(){};1;"
}

export_func_3: {
    options = {
        hoist_funs: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export function f(){}(1);
    }
    expect_exact: "export function f(){};"
}

export_default_func_1: {
    options = {
        hoist_funs: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export default function f(){};
    }
    expect_exact: "export default function(){};"
}

export_default_func_2: {
    options = {
        hoist_funs: true,
        side_effects: false,
        toplevel: true,
        unused: true,
    }
    input: {
        export default function f(){}(1);
    }
    expect_exact: "export default function(){};1;"
}

export_default_func_3: {
    options = {
        hoist_funs: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export default function f(){}(1);
    }
    expect_exact: "export default function(){};"
}

export_class_1: {
    options = {
        hoist_funs: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export class C {};
    }
    expect_exact: "export class C{};"
}

export_class_2: {
    options = {
        hoist_funs: true,
        side_effects: false,
        toplevel: true,
        unused: true,
    }
    input: {
        export class C {}(1);
    }
    expect_exact: "export class C{};1;"
}

export_class_3: {
    options = {
        hoist_funs: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export class C {}(1);
    }
    expect_exact: "export class C{};"
}

export_default_class_1: {
    options = {
        hoist_funs: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export default class C {};
    }
    expect_exact: "export default class{};"
}

export_default_class_2: {
    options = {
        hoist_funs: true,
        side_effects: false,
        toplevel: true,
        unused: true,
    }
    input: {
        export default class C {}(1);
    }
    expect_exact: "export default class{};1;"
}

export_default_class_3: {
    options = {
        hoist_funs: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export default class C {}(1);
    }
    expect_exact: "export default class{};"
}

export_mangle_1: {
    mangle = {
        toplevel: true,
    }
    input: {
        export function foo(one, two) {
            return one - two;
        };
    }
    expect_exact: "export function foo(n,o){return n-o};"
}

export_mangle_2: {
    mangle = {
        toplevel: true,
    }
    input: {
        export default function foo(one, two) {
            return one - two;
        };
    }
    expect_exact: "export default function n(n,r){return n-r};"
}

export_mangle_3: {
    options = {
        collapse_vars: true,
    }
    mangle = {
        toplevel: true,
    }
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
    mangle = {
        toplevel: true,
    }
    input: {
        export default class C {
            go(one, two) {
                var z = one;
                return one - two + z;
            }
        };
    }
    expect_exact: "export default class n{go(n,r){return n-r+n}};"
}

export_mangle_5: {
    mangle = {
        toplevel: true,
    }
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
    mangle = {
        toplevel: true,
    }
    input: {
        var baz = 2;
        export let foo = 1, bar = baz;
    }
    expect_exact: "var a=2;export let foo=1,bar=a;"
}

export_toplevel_1: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        function f(){}
        export function g(){};
        export default function h(){};
    }
    expect: {
        export function g(){};
        export default function(){};
    }
}

export_toplevel_2: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        class A {}
        export class B {};
        export default class C {};
    }
    expect: {
        export class B {};
        export default class {};
    }
}

export_default_func_ref: {
    options = {
        hoist_funs: true,
        toplevel: true,
        unused: true,
    }
    input: {
        export default function f(){};
        f();
    }
    expect_exact: "export default function f(){};f();"
}
