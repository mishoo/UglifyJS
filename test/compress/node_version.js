eval_let: {
    input: {
        eval("let a;");
        console.log();
    }
    expect: {
        eval("let a;");
        console.log();
    }
    expect_stdout: ""
    node_version: ">=6"
}
