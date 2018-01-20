defaults_undefined: {
    options = {
        defaults: undefined,
    }
    input: {
        if (true) {
            console.log(1 + 2);
        }
    }
    expect: {
        if (true)
            console.log(1 + 2);
    }
    expect_stdout: "3"
}

defaults_false: {
    options = {
        defaults: false,
    }
    input: {
        if (true) {
            console.log(1 + 2);
        }
    }
    expect: {
        if (true)
            console.log(1 + 2);
    }
    expect_stdout: "3"
}

defaults_false_evaluate_true: {
    options = {
        defaults: false,
        evaluate: true,
    }
    input: {
        if (true) {
            console.log(1 + 2);
        }
    }
    expect: {
        if (true)
            console.log(3);
    }
    expect_stdout: "3"
}

defaults_true: {
    options = {
        defaults: true,
    }
    input: {
        if (true) {
            console.log(1 + 2);
        }
    }
    expect: {
        console.log(3);
    }
    expect_stdout: "3"
}

defaults_true_conditionals_false: {
    options = {
        defaults: true,
        conditionals: false,
    }
    input: {
        if (true) {
            console.log(1 + 2);
        }
    }
    expect: {
        if (1)
            console.log(3);
    }
    expect_stdout: "3"
}

defaults_true_evaluate_false: {
    options = {
        defaults: true,
        evaluate: false,
    }
    input: {
        if (true) {
            console.log(1 + 2);
        }
    }
    expect: {
        1 && console.log(1 + 2);
    }
    expect_stdout: "3"
}
