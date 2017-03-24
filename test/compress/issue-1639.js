
issue_1639_1: {
    options = {
        booleans: true,
        cascade: true,
        conditionals: true,
        evaluate: true,
        join_vars: true,
        loops: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        var a = 100, b = 10;

        var L1 = 5;
        while (--L1 > 0) {
            if ((--b), false) {
                if (b) {
                    var ignore = 0;
                }
            }
        }

        console.log(a, b);
    }
    expect: {
        for (var a = 100, b = 10, L1 = 5; --L1 > 0;)
            if (--b, !1) var ignore = 0;
        console.log(a, b);
    }
    expect_stdout: true
}

issue_1639_2: {
    options = {
        booleans: true,
        cascade: true,
        conditionals: true,
        evaluate: true,
        join_vars: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        var a = 100, b = 10;

        function f19() {
            if (++a, false)
                if (a)
                    if (++a);
        }
        f19();

        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        function f19() {
            ++a, 1;
        }
        f19(),
        console.log(a, b);
    }
    expect_stdout: true
}

issue_1639_3: {
    options = {
        booleans: true,
        cascade: true,
        conditionals: true,
        evaluate: true,
        sequences: true,
        side_effects: true,
    }
    input: {
        var a = 100, b = 10;
        a++ && false && a ? 0 : 0;
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        a++,
        console.log(a, b);
    }
    expect_stdout: true
}
