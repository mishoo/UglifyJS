booleans_evaluate: {
    options = {
        booleans: true,
        evaluate: true,
    }
    input: {
        console.log(typeof void 0 != "undefined");
        console.log(1 == 1, 1 === 1)
        console.log(1 != 1, 1 !== 1)
    }
    expect: {
        console.log(!1);
        console.log(!0, !0);
        console.log(!1, !1);
    }
}

booleans_global_defs: {
    options = {
        booleans: true,
        evaluate: true,
        global_defs: {
            A: true,
        },
    }
    input: {
        console.log(A == 1);
    }
    expect: {
        console.log(!0);
    }
}

condition_evaluate: {
    options = {
        booleans: true,
        dead_code: false,
        evaluate: true,
        loops: false,
    }
    input: {
        while (1 === 2);
        for (; 1 == true;);
        if (void 0 == null);
    }
    expect: {
        while (!1);
        for (; !0;);
        if (!0);
    }
}

if_else_empty_1: {
    options = {
        conditionals: true,
    }
    input: {
        if ({} ? a : b); else {}
    }
    expect: {
        !{} ? b : a;
    }
}

if_else_empty_2: {
    options = {
        conditionals: true,
        passes: 2,
    }
    input: {
        if ({} ? a : b); else {}
    }
    expect: {
        !{} ? b : a;
    }
}

label_if_break_1: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
    }
    input: {
        L: if (true) {
            a;
            break L;
        }
    }
    expect: {
        a;
    }
}

label_if_break_2: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        passes: 2
    }
    input: {
        L: if (true) {
            a;
            break L;
        }
    }
    expect: {
        a;
    }
}

while_if_break: {
    options = {
        conditionals: true,
        loops: true,
        passes: 2,
        sequences: true,
    }
    input: {
        while (a) {
            if (b) if(c) d;
            if (e) break;
        }
    }
    expect: {
        for(; a && (b && c && d, !e););
    }
}
