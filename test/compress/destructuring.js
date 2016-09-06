destructuring_arrays: {
    input: {
        {const [aa, bb] = cc;}
        {const [aa, [bb, cc]] = dd;}
        {let [aa, bb] = cc;}
        {let [aa, [bb, cc]] = dd;}
        var [aa, bb] = cc;
        var [aa, [bb, cc]] = dd;
        var [,[,,,,,],,,zz,] = xx; // Trailing comma
        var [,,zzz,,] = xxx; // Trailing comma after hole
    }
    expect: {
        {const [aa, bb] = cc;}
        {const [aa, [bb, cc]] = dd;}
        {let [aa, bb] = cc;}
        {let [aa, [bb, cc]] = dd;}
        var [aa, bb] = cc;
        var [aa, [bb, cc]] = dd;
        var [,[,,,,,],,,zz] = xx;
        var [,,zzz,,] = xxx;
    }
}

destructuring_arrays_holes: {
    input: {
        var [,,,,] = a;
        var [,,b,] = c;
        var [d,,]  = e;
    }
    expect_exact: "var[,,,,]=a;var[,,b]=c;var[d,,]=e;"
}

destructuring_objects: {
    input: {
        {const {aa, bb} = {aa:1, bb:2};}
        {const {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};}
        {let {aa, bb} = {aa:1, bb:2};}
        {let {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};}
        var {aa, bb} = {aa:1, bb:2};
        var {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};
    }
    expect: {
        {const {aa, bb} = {aa:1, bb:2};}
        {const {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};}
        {let {aa, bb} = {aa:1, bb:2};}
        {let {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};}
        var {aa, bb} = {aa:1, bb:2};
        var {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};
    }
}

destructuring_objects_trailing_elision: {
    input: {
        var {cc,} = foo;
    }
    expect_exact: "var{cc}=foo;"
}

nested_destructuring_objects: {
    input: {
        const [{a},b] = c;
        let [{a},b] = c;
        var [{a},b] = c;
    }
    expect_exact: 'const[{a},b]=c;let[{a},b]=c;var[{a},b]=c;';
}

destructuring_constdef_in_loops: {
    input: {
        for (const [x,y] in pairs);
        for (const [a] = 0;;);
        for (const {c} of cees);
    }
    expect_exact: "for(const[x,y]in pairs);for(const[a]=0;;);for(const{c}of cees);"
}

destructuring_letdef_in_loops: {
    input: {
        for (let [x,y] in pairs);
        for (let [a] = 0;;);
        for (let {c} of cees);
    }
    expect_exact: "for(let[x,y]in pairs);for(let[a]=0;;);for(let{c}of cees);"
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
    beautify = {
        ecma: 6
    }
    input: {
        ({a, b});
        [{a}];
        f({x});
    }
    expect_exact: "({a,b});[{a}];f({x});"
}

