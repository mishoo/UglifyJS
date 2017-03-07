same_variable_in_multiple_for_loop: {
    options = {
        hoist_funs: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        keep_fargs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        collapse_vars: true
    };
    mangle = {};
    input: {
        for (let i = 0; i < 3; i++) {
            let a = 100;
            console.log(i, a);
            for (let i = 0; i < 2; i++) {
                console.log(i, a);
                let c = 2;
                console.log(c);
            }
        }
    }
    expect: {
        for (let o = 0; o < 3; o++) {
            let l = 100;
            console.log(o, l);
            for (let o = 0; o < 2; o++) {
                console.log(o, l);
                let c = 2;
                console.log(c);
            }
        }
    }
}

same_variable_in_multiple_forOf: {
    options = {
        hoist_funs: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        keep_fargs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        collapse_vars: true
    };
    mangle = {};
    input: {
        var test = [ "a", "b", "c" ];
        for (let tmp of test) {
            console.log(tmp);
            let dd;
            dd = [ "e", "f", "g" ];
            for (let tmp of dd) {
                console.log(tmp);
            }
        }
    }
    expect: {
        var test = [ "a", "b", "c" ];
        for (let o of test) {
            console.log(o);
            let e;
            e = [ "e", "f", "g" ];
            for (let o of e) 
                console.log(o);
        }
    }
}

same_variable_in_multiple_forIn: {
    options = {
        hoist_funs: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: false,
        keep_fargs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        collapse_vars: true
    };
    mangle = {};
    input: {
        var test = [ "a", "b", "c" ];
        for (let tmp in test) {
            console.log(tmp);
            let dd;
            dd = [ "e", "f", "g" ];
            for (let tmp in test) {
                console.log(tmp);
            }
        }
    }
    expect: {
        var test = [ "a", "b", "c" ];
        for (let o in test) {
            console.log(o);
            let e;
            e = [ "e", "f", "g" ];
            for (let o in test)
                console.log(o);
        }
    }
}

different_variable_in_multiple_for_loop: {
    options = {
        hoist_funs: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        keep_fargs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        collapse_vars: true
    };
    mangle = {};
    input: {
        for (let i = 0; i < 3; i++) {
            let a = 100;
            console.log(i, a);
            for (let j = 0; j < 2; j++) {
                console.log(j, a);
                let c = 2;
                console.log(c);
            }
        }
    }
    expect: {
        for (let o = 0; o < 3; o++) {
            let l = 100;
            console.log(o, l);
            for (let o = 0; o < 2; o++) {
                console.log(o, l);
                let c = 2;
                console.log(c);
            }
        }
    }
}

different_variable_in_multiple_forOf: {
    options = {
        hoist_funs: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        keep_fargs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        collapse_vars: true
    };
    mangle = {};
    input: {
        var test = [ "a", "b", "c" ];
        for (let tmp of test) {
            console.log(tmp);
            let dd;
            dd = [ "e", "f", "g" ];
            for (let t of dd) {
                console.log(t);
            }
        }
    }
    expect: {
        var test = [ "a", "b", "c" ];
        for (let o of test) {
            console.log(o);
            let e;
            e = [ "e", "f", "g" ];
            for (let o of e)
                console.log(o);
        }
    }
}

different_variable_in_multiple_forIn: {
    options = {
        hoist_funs: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: false,
        keep_fargs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        collapse_vars: true
    };
    mangle = {};
    input: {
        var test = [ "a", "b", "c" ];
        for (let tmp in test) {
            console.log(tmp);
            let dd;
            dd = [ "e", "f", "g" ];
            for (let t in test) {
                console.log(t);
            }
        }
    }
    expect: {
        var test = [ "a", "b", "c" ];
        for (let o in test) {
            console.log(o);
            let e;
            e = [ "e", "f", "g" ];
            for (let o in test)
                console.log(o);
        }
    }
}

more_variable_in_multiple_for: {
    options = {
        hoist_funs: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: false,
        keep_fargs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        collapse_vars: true
    };
    mangle = {};
    input: {
        for (let a = 9, i = 0; i < 20; i += a) {
            let b = a++ + i;
            console.log(a, b, i);
            for (let k = b, m = b*b, i = 0; i < 10; i++) {
                console.log(a, b, m, k, i);
            }
        }
    }
    expect: {
        for (let o = 9, l = 0; l < 20; l += o) {
            let c = o++ + l;
            console.log(o, c, l);
            for (let l = c, e = c * c, f = 0; f < 10; f++)
                console.log(o, c, e, l, f);
        }
    }
}

