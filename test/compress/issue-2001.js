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
    expect_exact: "export default function f(){};"
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
    expect_exact: "export default function f(){};1;"
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
    expect_exact: "export default function f(){};"
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
    expect_exact: "export default class C{};"
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
    expect_exact: "export default class C{};1;"
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
    expect_exact: "export default class C{};"
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
    expect_exact: "export function foo(o,n){return o-n};"
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
    expect_exact: "export default function foo(o,t){return o-t};"
}

export_mangle_3: {
    options = {
        collapse_vars: true,
        unused: true,
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
    expect_exact: "export class C{go(r,e){return r-e+r}};"
}

export_mangle_4: {
    options = {
        collapse_vars: true,
        unused: true,
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
    expect_exact: "export default class C{go(e,r){return e-r+e}};"
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
    expect_exact: "export default{prop:function(r,t){return r-t}};"
}

export_mangle_6: {
    mangle = {
        toplevel: true,
    }
    input: {
        var baz = 2;
        export let foo = 1, bar = baz;
    }
    expect_exact: "var o=2;export let foo=1,bar=o;"
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
        export default function h(){};
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
        export default class C {};
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
