typeof_eq_undefined: {
    options = {
        comparisons: true,
        typeofs: true,
    }
    input: {
        var a = typeof b != "undefined";
        b = typeof a != "undefined";
        var c = typeof d.e !== "undefined";
        var f = "undefined" === typeof g;
        g = "undefined" === typeof f;
        var h = "undefined" == typeof i.j;
    }
    expect: {
        var a = "undefined" != typeof b;
        b = void 0 !== a;
        var c = void 0 !== d.e;
        var f = "undefined" == typeof g;
        g = void 0 === f;
        var h = void 0 === i.j;
    }
}

typeof_eq_undefined_ie8: {
    options = {
        comparisons: true,
        ie: true,
        typeofs: true,
    }
    input: {
        var a = typeof b != "undefined";
        b = typeof a != "undefined";
        var c = typeof d.e !== "undefined";
        var f = "undefined" === typeof g;
        g = "undefined" === typeof f;
        var h = "undefined" == typeof i.j;
    }
    expect: {
        var a = "undefined" != typeof b;
        b = void 0 !== a;
        var c = "undefined" != typeof d.e;
        var f = "undefined" == typeof g;
        g = void 0 === f;
        var h = "undefined" == typeof i.j;
    }
}

undefined_redefined: {
    options = {
        comparisons: true,
        typeofs: true,
    }
    input: {
        function f(undefined) {
            var n = 1;
            return typeof n == "undefined";
        }
    }
    expect_exact: "function f(undefined){var n=1;return void 0===n}"
}

undefined_redefined_mangle: {
    options = {
        comparisons: true,
        typeofs: true,
    }
    mangle = {}
    input: {
        function f(undefined) {
            var n = 1;
            return typeof n == "undefined";
        }
    }
    expect_exact: "function f(n){var r=1;return void 0===r}"
}
