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
        let [{d},e] = f;
        var [{g},h] = i;
    }
    expect_exact: 'const[{a},b]=c;let[{d},e]=f;var[{g},h]=i;';
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
            var x = [[1, 2, 3]];
            var y = {h: 1};
            var [b, ...c] = a;
            var [...[e, f]] = x;
            var [...{g: h}] = y;
            f(b, c, e, f, g);
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
            var x = [[1, 2, 3]];
            var y = {h: 1};
            var [b, ...c] = a;
            var [...[e, f]] = x;
            var [...{g: h}] = y;
            f(b, c, e, f, g);
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

reduce_vars: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
    }
    input: {
        {const [aa, [bb, cc]] = dd;}
        {let [aa, [bb, cc]] = dd;}
        var [aa, [bb, cc]] = dd;
        [aa, [bb, cc]] = dd;
        {const {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};}
        {let {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};}
        var {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};
        ({aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}});
        const [{a},b] = c;
        let [{d},e] = f;
        var [{g},h] = i;
        [{a},b] = c;
        for (const [x,y] in pairs);
        for (let [x,y] in pairs);
        for (var [x,y] in pairs);
        for ([x,y] in pairs);
    }
    expect: {
        {const [aa, [bb, cc]] = dd;}
        {let [aa, [bb, cc]] = dd;}
        var [aa, [bb, cc]] = dd;
        [aa, [bb, cc]] = dd;
        {const {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};}
        {let {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};}
        var {aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}};
        ({aa, bb: {cc, dd}} = {aa:1, bb: {cc:2, dd: 3}});
        const [{a},b] = c;
        let [{d},e] = f;
        var [{g},h] = i;
        [{a},b] = c;
        for (const [x,y] in pairs);
        for (let [x,y] in pairs);
        for (var [x,y] in pairs);
        for ([x,y] in pairs);
    }
}

unused: {
    options = {
        unused: true,
    }
    input: {
        let { foo: [, , ...a] } = { foo: [1, 2, 3, 4], bar: 5 };
        console.log(a);
    }
    expect: {
        let { foo: [, , ...a] } = { foo: [1, 2, 3, 4], bar: 5 };
        console.log(a);
    }
}

issue_1886: {
    options = {
        collapse_vars: true,
    }
    input: {
        let [a] = [1];
        console.log(a);
    }
    expect: {
        let [a] = [1];
        console.log(a);
    }
}

destructuring_decl_of_numeric_key: {
    options = {
        evaluate: true,
        unused: true,
    }
    input: {
        let { 3: x } = { [1 + 2]: 42 };
        console.log(x);
    }
    expect: {
        let { 3: x } = { [3]: 42 };
        console.log(x);
    }
    expect_stdout: "42"
    node_version: ">=6"
}

destructuring_decl_of_computed_key: {
    options = {
        evaluate: true,
        unused: true,
    }
    input: {
        let four = 4;
        let { [7 - four]: x } = { [1 + 2]: 42 };
        console.log(x);
    }
    expect: {
        let four = 4;
        let { [7 - four]: x } = { [3]: 42 };
        console.log(x);
    }
    expect_stdout: "42"
    node_version: ">=6"
}

destructuring_assign_of_numeric_key: {
    options = {
        evaluate: true,
        unused: true,
    }
    input: {
        let x;
        ({ 3: x } = { [1 + 2]: 42 });
        console.log(x);
    }
    expect: {
        let x;
        ({ 3: x } = { [3]: 42 });
        console.log(x);
    }
    expect_stdout: "42"
    node_version: ">=6"
}

destructuring_assign_of_computed_key: {
    options = {
        evaluate: true,
        unused: true,
    }
    input: {
        let x;
        let four = 4;
        ({ [(5 + 2) - four]: x } = { [1 + 2]: 42 });
        console.log(x);
    }
    expect: {
        let x;
        let four = 4;
        ({ [7 - four]: x } = { [3]: 42 });
        console.log(x);
    }
    expect_stdout: "42"
    node_version: ">=6"
}

mangle_destructuring_decl: {
    options = {
        evaluate: true,
        unused: true,
    }
    mangle = {
    }
    input: {
        function test(opts) {
            let a = opts.a || { e: 7, n: 8 };
            let { t, e, n, s =  5 + 4, o, r } = a;
            console.log(t, e, n, s, o, r);
        }
        test({a: { t: 1, e: 2, n: 3, s: 4, o: 5, r: 6 }});
        test({});
    }
    expect: {
        function test(t) {
            let e = t.a || { e: 7, n: 8 };
            let {t: n,  e: o,  n: s,  s: l = 9,  o: a,  r: c} = e;
            console.log(n, o, s, l, a, c);
        }
        test({ a: { t: 1, e: 2, n: 3, s: 4, o: 5, r: 6 } });
        test({});
    }
    expect_stdout: [
        "1 2 3 4 5 6",
        "undefined 7 8 9 undefined undefined",
    ]
    node_version: ">=6"
}

mangle_destructuring_decl_collapse_vars: {
    options = {
        collapse_vars: true,
        evaluate: true,
        unused: true,
    }
    mangle = {
    }
    input: {
        function test(opts) {
            let a = opts.a || { e: 7, n: 8 };
            let { t, e, n, s =  5 + 4, o, r } = a;
            console.log(t, e, n, s, o, r);
        }
        test({a: { t: 1, e: 2, n: 3, s: 4, o: 5, r: 6 }});
        test({});
    }
    expect: {
        function test(t) {
            let e = t.a || { e: 7, n: 8 };
            let {t: n,  e: o,  n: s,  s: l = 9,  o: a,  r: c} = e;
            console.log(n, o, s, l, a, c);
        }
        test({ a: { t: 1, e: 2, n: 3, s: 4, o: 5, r: 6 } });
        test({});
    }
    expect_stdout: [
        "1 2 3 4 5 6",
        "undefined 7 8 9 undefined undefined",
    ]
    node_version: ">=6"
}

mangle_destructuring_assign_toplevel_true: {
    options = {
        toplevel: true,
        evaluate: true,
        unused: true,
    }
    mangle = {
        toplevel: true,
    }
    beautify = {
        ecma: 6
    }
    input: {
        function test(opts) {
            let s, o, r;
            let a = opts.a || { e: 7, n: 8 };
            ({ t, e, n, s =  5 + 4, o, r } = a);
            console.log(t, e, n, s, o, r);
        }
        let t, e, n;
        test({a: { t: 1, e: 2, n: 3, s: 4, o: 5, r: 6 }});
        test({});
    }
    expect: {
        function e(e) {
            let l, s, a;
            let c = e.a || { e: 7, n: 8 };
            ({t: n,  e: o,  n: t,  s: l = 9,  o: s,  r: a} = c);
            console.log(n, o, t, l, s, a);
        }
        let n, o, t;
        e({ a: { t: 1, e: 2, n: 3, s: 4, o: 5, r: 6 } });
        e({});
    }
    expect_stdout: [
        "1 2 3 4 5 6",
        "undefined 7 8 9 undefined undefined",
    ]
    node_version: ">=6"
}

mangle_destructuring_assign_toplevel_false: {
    options = {
        toplevel: false,
        evaluate: true,
        unused: true,
    }
    mangle = {
        toplevel: false,
    }
    beautify = {
        ecma: 6
    }
    input: {
        function test(opts) {
            let s, o, r;
            let a = opts.a || { e: 7, n: 8 };
            ({ t, e, n, s = 9, o, r } = a);
            console.log(t, e, n, s, o, r);
        }
        let t, e, n;
        test({a: { t: 1, e: 2, n: 3, s: 4, o: 5, r: 6 }});
        test({});
    }
    expect: {
        function test(o) {
            let s, l, a;
            let c = o.a || { e: 7, n: 8 };
            ({t,  e,  n,  s = 9,  o: l,  r: a} = c);
            console.log(t, e, n, s, l, a);
        }
        let t, e, n;
        test({ a: { t: 1, e: 2, n: 3, s: 4, o: 5, r: 6 } });
        test({});
    }
    expect_stdout: [
        "1 2 3 4 5 6",
        "undefined 7 8 9 undefined undefined",
    ]
    node_version: ">=6"
}

mangle_destructuring_decl_array: {
    options = {
        evaluate: true,
        unused: true,
        toplevel: true,
    }
    mangle = {
        toplevel: true,
    }
    beautify = {
        ecma: 6
    }
    input: {
        var [, t, e, n, s, o = 2, r = [ 1 + 2 ]] = [ 9, 8, 7, 6 ];
        console.log(t, e, n, s, o, r);
    }
    expect: {
        var [, o,  l,  a,  c,  e = 2,  g = [ 3 ]] = [ 9, 8, 7, 6 ];
        console.log(o, l, a, c, e, g);
    }
    expect_stdout: "8 7 6 undefined 2 [ 3 ]"
    node_version: ">=6"
}

anon_func_with_destructuring_args: {
    options = {
        evaluate: true,
        unused: true,
        toplevel: true,
    }
    mangle = {
        toplevel: true,
    }
    beautify = {
        ecma: 5,
    }
    input: {
        (function({foo = 1 + 0, bar = 2}, [car = 3, far = 4]) {
            console.log(foo, bar, car, far);
        })({bar: 5 - 0}, [, 6]);
    }
    expect: {
        (function({foo: o = 1, bar: n = 2}, [a = 3, b = 4]) {
            console.log(o, n, a, b);
        })({bar: 5}, [, 6]);
    }
    expect_stdout: "1 5 3 6"
    node_version: ">=6"
}

arrow_func_with_destructuring_args: {
    options = {
        evaluate: true,
        unused: true,
        toplevel: true,
    }
    mangle = {
        toplevel: true,
    }
    beautify = {
        ecma: 5,
    }
    input: {
        (({foo = 1 + 0, bar = 2}, [car = 3, far = 4]) => {
            console.log(foo, bar, car, far);
        })({bar: 5 - 0}, [, 6]);
    }
    expect: {
        (({foo: o = 1, bar: a = 2}, [b = 3, l = 4]) => {
            console.log(o, a, b, l);
        })({bar: 5}, [, 6]);
    }
    expect_stdout: "1 5 3 6"
    node_version: ">=6"
}

issue_2044_ecma_5: {
    beautify = {
        beautify: false,
        ecma: 5,
    }
    input: {
        ({x : a = 1, y = 2 + b, z = 3 - c} = obj);
    }
    expect_exact: "({x:a=1,y:y=2+b,z:z=3-c}=obj);"
}

issue_2044_ecma_6: {
    beautify = {
        beautify: false,
        ecma: 6,
    }
    input: {
        ({x : a = 1, y = 2 + b, z = 3 - c} = obj);
    }
    expect_exact: "({x:a=1,y=2+b,z=3-c}=obj);"
}

issue_2044_ecma_5_beautify: {
    beautify = {
        beautify: true,
        ecma: 5,
    }
    input: {
        ({x : a = 1, y = 2 + b, z = 3 - c} = obj);
    }
    expect_exact: "({x: a = 1, y: y = 2 + b, z: z = 3 - c} = obj);"
}

issue_2044_ecma_6_beautify: {
    beautify = {
        beautify: true,
        ecma: 6,
    }
    input: {
        ({x : a = 1, y = 2 + b, z = 3 - c} = obj);
    }
    expect_exact: "({x: a = 1, y = 2 + b, z = 3 - c} = obj);"
}

issue_2140: {
    options = {
        unused: true,
    }
    input: {
        !function() {
            var t = {};
            console.log(([t.a] = [42])[0]);
        }();
    }
    expect: {
        !function() {
            var t = {};
            console.log(([t.a] = [42])[0]);
        }();
    }
    expect_stdout: "42"
    node_version: ">=6"
}
