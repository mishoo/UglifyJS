case_1: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        var a = 0, b = 1;
        switch (true) {
          case a || true:
          default:
            b = 2;
          case true:
        }
        console.log(a, b);
    }
    expect: {
        var a = 0, b = 1;
        switch (true) {
          case a || true:
            b = 2;
        }
        console.log(a, b);
    }
    expect_stdout: "0 2"
}

case_2: {
    options = {
        dead_code: true,
        evaluate: true,
        switches: true,
    }
    input: {
        var a = 0, b = 1;
        switch (0) {
          default:
            b = 2;
          case a:
            a = 3;
          case 0:
        }
        console.log(a, b);
    }
    expect: {
        var a = 0, b = 1;
        switch (0) {
          case a:
            a = 3;
        }
        console.log(a, b);
    }
    expect_stdout: "3 1"
}
