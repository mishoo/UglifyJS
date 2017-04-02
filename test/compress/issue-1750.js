case_1: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        var a = 0, b = 1;
        switch (true) {
          case a, true:
          default:
            b = 2;
          case true:
        }
        console.log(a, b);
    }
    expect: {
        var a = 0, b = 1;
        switch (true) {
          case a, true:
            b = 2;
        }
        console.log(a, b);
    }
    expect_stdout: "0 2"
}
