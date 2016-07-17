
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

destructuring_vardef_in_loops: {
    input: {
        for (var [x,y] in pairs);
        for (var [a] = 0;;);
        for (var {c} of cees);
    }
    expect_exact: "for(var[x,y]in pairs);for(var[a]=0;;);for(var{c}of cees);"
}
destructuring_expressions: {
    input: {
        ({a, b});
        [{a}];
        f({x});
    }
    expect_exact: "({a,b});[{a}];f({x});"
}

