insert_semicolon: {
    beautify = {
        beautify: true,
        comments: "all",
    }
    input: {
        var a
        /* foo */ var b
    }
    expect_exact: [
        "var a",
        "/* foo */;",
        "",
        "var b;",
    ]
}

unary_postfix: {
    beautify = {
        beautify: true,
        comments: "all",
    }
    input: {
        a
        /* foo */++b
    }
    expect_exact: [
        "a",
        "/* foo */;",
        "",
        "++b;",
    ]
}
