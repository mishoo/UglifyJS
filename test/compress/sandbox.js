console_log: {
    input: {
        console.log("%% %s");
        console.log("%% %s", "%s");
    }
    expect: {
        console.log("%% %s");
        console.log("%% %s", "%s");
    }
    expect_stdout: [
        "%% %s",
        "% %s",
    ]
}
