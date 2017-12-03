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
    expect_stdout: true
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
        while (0);
        for (; 1;);
        if (1);
    }
}

if_else_empty: {
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

label_if_break: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        side_effects: true,
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

if_return: {
    options = {
        booleans: true,
        conditionals: true,
        if_return: true,
        sequences: true,
    }
    input: {
        function f(w, x, y, z) {
            if (x) return;
            if (w) {
                if (y) return;
            } else if (z) return;
            if (x == y) return true;

            if (x) w();
            if (y) z();
            return true;
        }
    }
    expect: {
        function f(w, x, y, z) {
            if (!x) {
                if (w) {
                    if (y) return;
                } else if (z) return;
                return x == y || (x && w(), y && z(), !0);
            }
        }
    }
}
