unicode_parse_variables: {
    options = {}
    input: {
        var a = {};
        a.你好 = 456;

        var ↂωↂ = 123;
        var l০ = 3; // 2nd char is a unicode digit
    }
    expect: {
        var a = {};
        a.你好 = 456;

        var ↂωↂ = 123;
        var l০ = 3;
    }
}

issue_2242_1: {
    beautify = {
        ascii_only: false,
    }
    input: {
        console.log("\ud83d", "\ude00", "\ud83d\ude00", "\ud83d@\ude00");
    }
    expect_exact: 'console.log("\\ud83d","\\ude00","\ud83d\ude00","\\ud83d@\\ude00");'
}

issue_2242_2: {
    beautify = {
        ascii_only: true,
    }
    input: {
        console.log("\ud83d", "\ude00", "\ud83d\ude00", "\ud83d@\ude00");
    }
    expect_exact: 'console.log("\\ud83d","\\ude00","\\ud83d\\ude00","\\ud83d@\\ude00");'
}

issue_2242_3: {
    options = {
        evaluate: false,
    }
    input: {
        console.log("\ud83d" + "\ude00", "\ud83d" + "@" + "\ude00");
    }
    expect_exact: 'console.log("\\ud83d"+"\\ude00","\\ud83d"+"@"+"\\ude00");'
}

issue_2242_4: {
    options = {
        evaluate: true,
    }
    input: {
        console.log("\ud83d" + "\ude00", "\ud83d" + "@" + "\ude00");
    }
    expect_exact: 'console.log("\ud83d\ude00","\\ud83d@\\ude00");'
}

issue_2569: {
    input: {
        new RegExp("[\udc42-\udcaa\udd74-\udd96\ude45-\ude4f\udea3-\udecc]");
    }
    expect_exact: 'new RegExp("[\\udc42-\\udcaa\\udd74-\\udd96\\ude45-\\ude4f\\udea3-\\udecc]");'
}
