eval_let_6: {
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

eval_let_4: {
    input: {
        eval("let a;");
        console.log();
    }
    expect: {
        eval("let a;");
        console.log();
    }
    expect_stdout: SyntaxError("Block-scoped declarations (let, const, function, class) not yet supported outside strict mode")
    node_version: "4"
}

eval_let_0: {
    input: {
        eval("let a;");
        console.log();
    }
    expect: {
        eval("let a;");
        console.log();
    }
    expect_stdout: SyntaxError("Unexpected identifier")
    node_version: "<=0.12"
}
