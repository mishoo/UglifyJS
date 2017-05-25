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
