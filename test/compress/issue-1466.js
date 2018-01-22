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
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
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
                let e = 2;
                console.log(e);
            }
        }
    }
    expect_stdout: true
    node_version: ">=6"
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
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
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
    expect_stdout: true
    node_version: ">=6"
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
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
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
        for (let e in test) {
            console.log(e);
            let t;
            t = [ "e", "f", "g" ];
            for (let e in test)
                console.log(e);
        }
    }
    expect_stdout: true
    node_version: ">=6"
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
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
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
                let e = 2;
                console.log(e);
            }
        }
    }
    expect_stdout: true
    node_version: ">=6"
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
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
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
    expect_stdout: true
    node_version: ">=6"
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
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
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
        for (let e in test) {
            console.log(e);
            let t;
            t = [ "e", "f", "g" ];
            for (let e in test)
                console.log(e);
        }
    }
    expect_stdout: true
    node_version: ">=6"
}

same_variable_in_multiple_forOf_sequences_let: {
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
        sequences: true,
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
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
            let e;
            console.log(o), e = [ "e", "f", "g" ];
            for (let o of e)
                console.log(o);
        }
    }
    expect_stdout: true
    node_version: ">=6"
}

same_variable_in_multiple_forOf_sequences_const: {
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
        sequences: true,
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
    input: {
        var test = [ "a", "b", "c" ];
        for (const tmp of test) {
            console.log(tmp);
            let dd;
            dd = [ "e", "f", "g" ];
            for (const tmp of dd) {
                console.log(tmp);
            }
        }
    }
    expect: {
        var test = [ "a", "b", "c" ];
        for (const o of test) {
            let t;
            console.log(o), t = [ "e", "f", "g" ];
            for (const o of t)
                console.log(o);
        }
    }
    expect_stdout: true
    node_version: ">=6"
}

same_variable_in_multiple_forIn_sequences_let: {
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
        sequences: true,
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
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
        for (let e in test) {
            let t;
            console.log(e), t = [ "e", "f", "g" ];
            for (let e in test)
                console.log(e);
        }
    }
    expect_stdout: true
    node_version: ">=6"
}

same_variable_in_multiple_forIn_sequences_const: {
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
        sequences: true,
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
    input: {
        var test = [ "a", "b", "c" ];
        for (const tmp in test) {
            console.log(tmp);
            let dd;
            dd = [ "e", "f", "g" ];
            for (const tmp in test) {
                console.log(tmp);
            }
        }
    }
    expect: {
        var test = [ "a", "b", "c" ];
        for (const o in test) {
            let t;
            console.log(o), t = [ "e", "f", "g" ];
            for (const o in test)
                console.log(o);
        }
    }
    expect_stdout: true
    node_version: ">=6"
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
        side_effects: true,
        collapse_vars: true,
    }
    mangle = {}
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
            let e = o++ + l;
            console.log(o, e, l);
            for (let l = e, t = e * e, c = 0; c < 10; c++)
                console.log(o, e, t, l, c);
        }
    }
    expect_stdout: true
    node_version: ">=6"
}
