precedence_1: {
    input: {
        console.log(-4 ** 3 ** 2);
    }
    expect_exact: "console.log((-4)**3**2);"
    expect_stdout: "-262144"
    node_version: ">=8"
}

precedence_2: {
    input: {
        console.log(-4 ** (3 ** 2));
    }
    expect_exact: "console.log((-4)**3**2);"
    expect_stdout: "-262144"
    node_version: ">=8"
}

precedence_3: {
    input: {
        console.log(-(4 ** 3) ** 2);
    }
    expect_exact: "console.log((-(4**3))**2);"
    expect_stdout: "4096"
    node_version: ">=8"
}

precedence_4: {
    input: {
        console.log((-4 ** 3) ** 2);
    }
    expect_exact: "console.log(((-4)**3)**2);"
    expect_stdout: "4096"
    node_version: ">=8"
}

await: {
    input: {
        (async a => a * await a ** ++a % a)(2).then(console.log);
    }
    expect_exact: "(async a=>a*(await a)**++a%a)(2).then(console.log);"
    expect_stdout: "1"
    node_version: ">=8"
}

evaluate: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(1 + 2 ** 3 - 4);
    }
    expect: {
        console.log(5);
    }
    expect_stdout: "5"
    node_version: ">=8"
}
