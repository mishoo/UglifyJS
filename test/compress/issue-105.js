typeof_eq_undefined: {
    options = {
        comparisons: true
    };
    input: { a = typeof b.c != "undefined" }
    expect: { a = typeof b.c != "undefined" }
}

typeof_eq_undefined_unsafe: {
    options = {
        comparisons: true,
        unsafe: true
    };
    input: { a = typeof b.c != "undefined" }
    expect: { a = b.c !== void 0 }
}
