operator: {
    input: {
        a. //comment
        typeof
    }
    expect_exact: "a.typeof;"
}

name: {
    input: {
        a. //comment
        b
    }
    expect_exact: "a.b;"
}

keyword: {
    input: {
        a. //comment
        default
    }
    expect_exact: "a.default;"
}

atom: {
    input: {
        a. //comment
        true
    }
    expect_exact: "a.true;"
}
