
destructuring_arrays: {
    input: {
        var [aa, bb] = cc;
    }
    expect: {
        var[aa,bb]=cc;
    }
}

destructuring_objects: {
    input: {
        var {aa, bb} = {aa:1, bb:2};
    }
    expect: {
        var{aa,bb}={aa:1,bb:2};
    }
}

nested_destructuring_objects: {
    input: {
        var [{a},b] = c;
    }
    expect_exact: 'var[{a},b]=c;';
}
