numeric: {
    beautify = {
        beautify: true,
        indent_start: 1,
        indent_level: 3,
    }
    input: {
        switch (42) {
          case null:
            console.log("FAIL");
        }
        console.log("PASS");
    }
    expect_exact: [
        " switch (42) {",
        "  case null:",
        '    console.log("FAIL");',
        " }",
        "",
        ' console.log("PASS");',
    ]
    expect_stdout: "PASS"
}

spaces: {
    beautify = {
        beautify: true,
        indent_start: " ",
        indent_level: "   ",
    }
    input: {
        switch (42) {
          case null:
            console.log("FAIL");
        }
        console.log("PASS");
    }
    expect_exact: [
        " switch (42) {",
        "  case null:",
        '    console.log("FAIL");',
        " }",
        "",
        ' console.log("PASS");',
    ]
    expect_stdout: "PASS"
}

tabs: {
    beautify = {
        beautify: true,
        indent_start: "\t",
        indent_level: "\t",
    }
    input: {
        switch (42) {
          case null:
            console.log("FAIL");
        }
        console.log("PASS");
    }
    expect_exact: [
        "\tswitch (42) {",
        "\tcase null:",
        '\t\tconsole.log("FAIL");',
        "\t}",
        "",
        '\tconsole.log("PASS");',
    ]
    expect_stdout: "PASS"
}

mixed: {
    beautify = {
        beautify: true,
        indent_start: "\n",
        indent_level: "       \t",
    }
    input: {
        switch (42) {
          case null:
            console.log("FAIL");
        }
        console.log("PASS");
    }
    expect_exact: [
        "",
        "switch (42) {",
        "",
        "    case null:",
        "",
        '       \tconsole.log("FAIL");',
        "",
        "}",
        "",
        "",
        'console.log("PASS");',
    ]
    expect_stdout: "PASS"
}
