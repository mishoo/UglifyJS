negate_booleans_1: {
    options = {
        comparisons: true,
    }
    input: {
        var a = !a || !b || !c || !d || !e || !f;
    }
    expect: {
        var a = !(a && b && c && d && e && f);
    }
}

negate_booleans_2: {
    options = {
        comparisons: true,
    }
    input: {
        var match = !x &&       // should not touch this one
            (!z || c) &&
            (!k || d) &&
            the_stuff();
    }
    expect: {
        var match = !x &&
            (!z || c) &&
            (!k || d) &&
            the_stuff();
    }
}
