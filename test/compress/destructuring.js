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
    beautify = {
        ecma: 6
    }
    input: {
        var {cc,} = foo;
    }
    expect_exact: "var{cc}=foo;"
}

nested_destructuring_objects: {
    beautify = {
        ecma: 6
    }
    input: {
        const [{a},b] = c;
        let [{a},b] = c;
        var [{a},b] = c;
    }
    expect_exact: 'const[{a},b]=c;let[{a},b]=c;var[{a},b]=c;';
}

destructuring_constdef_in_loops: {
    beautify = {
        ecma: 6
    }
    input: {
        for (const [x,y] in pairs);
        for (const [a] = 0;;);
        for (const {c} of cees);
    }
    expect_exact: "for(const[x,y]in pairs);for(const[a]=0;;);for(const{c}of cees);"
}

destructuring_letdef_in_loops: {
    beautify = {
        ecma: 6
    }
    input: {
        for (let [x,y] in pairs);
        for (let [a] = 0;;);
        for (let {c} of cees);
    }
    expect_exact: "for(let[x,y]in pairs);for(let[a]=0;;);for(let{c}of cees);"
}

destructuring_vardef_in_loops: {
    beautify = {
        ecma: 6
    }
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

destructuring_remove_unused_1: {
    options = {
        unused: true
    }
    input: {
        function a() {
            var unused = "foo";
            var a = [1];
            var [b] = a;
            f(b);
        }
        function b() {
            var unused = "foo";
            var a = {b: 1};
            var {b} = a;
            f(b);
        }
        function c() {
            var unused = "foo";
            var a = [[1]];
            var [[b]] = a;
            f(b);
        }
        function d() {
            var unused = "foo";
            var a = {b: {b:1}};
            var {b:{b}} = a;
            f(b);
        }
        function e() {
            var unused = "foo";
            var a = [1, 2, 3, 4, 5];
            var [b, ...c] = a;
            f(b, c);
        }
    }
    expect: {
        function a() {
            var a = [1];
            var [b] = a;
            f(b);
        }
        function b() {
            var a = {b: 1};
            var {b} = a;
            f(b);
        }
        function c() {
            var a = [[1]];
            var [[b]] = a;
            f(b);
        }
        function d() {
            var a = {b: {b:1}};
            var {b:{b}} = a;
            f(b);
        }
        function e() {
            var a = [1, 2, 3, 4, 5];
            var [b, ...c] = a;
            f(b, c);
        }
    }
}

destructuring_remove_unused_2: {
    options = {
        unused: true
    }
    input: {
        function a() {
            var unused = "foo";
            var a = [,,1];
            var [b] = a;
            f(b);
        }
        function b() {
            var unused = "foo";
            var a = [{a: [1]}];
            var [{b: a}] = a;
            f(b);
        }
    }
    expect: {
        function a() {
            var a = [,,1];
            var [b] = a;
            f(b);
        }
        function b() {
            var a = [{a: [1]}];
            var [{b: a}] = a;
            f(b);
        }
    }
}

object_destructuring_may_need_parentheses: {
    beautify = {
        ecma: 6
    }
    input: {
        ({a, b} = {a: 1, b: 2});
    }
    expect_exact: "({a,b}={a:1,b:2});"
}

destructuring_with_undefined_as_default_assignment: {
    options = {
        evaluate: true
    }
    input: {
        [foo = undefined] = bar;
        [foo = void 0] = bar;
    }
    expect: {
        [foo] = bar;
        [foo] = bar;
    }
}

destructuring_dont_evaluate_with_undefined_as_default_assignment: {
    options = {
        evaluate: false
    }
    input: {
        [foo = undefined] = bar;
    }
    expect: {
        [foo = void 0] = bar;
    }
}
