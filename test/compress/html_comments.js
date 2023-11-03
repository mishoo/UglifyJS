html_comment_in_expression: {
    input: {
        (function(a, b) {
            console.log(a < !--b && a-- > b, a, b);
        })(1, 2);
    }
    expect_exact: "(function(a,b){console.log(a<! --b&&a-- >b,a,b)})(1,2);"
    expect_stdout: "false 1 1"
}

html_comment_in_less_than: {
    input: {
        (function(a, b, c) {
            console.log(
                a < !--b,
                a < !--b + c,
                a + b < !--c,
                a, b, c
            );
        })(1, 2, 3);
    }
    expect_exact: "(function(a,b,c){console.log(a<! --b,a<! --b+c,a+b<! --c,a,b,c)})(1,2,3);"
    expect_stdout: "false true false 1 0 2"
}

html_comment_in_left_shift: {
    input: {
        (function(a, b, c) {
            console.log(
                a << !--b,
                a << !--b + c,
                a + b << !--c,
                a, b, c
            );
        })(1, 2, 3);
    }
    expect_exact: "(function(a,b,c){console.log(a<<! --b,a<<! --b+c,a+b<<! --c,a,b,c)})(1,2,3);"
    expect_stdout: "1 16 1 1 0 2"
}

html_comment_in_greater_than: {
    input: {
        (function(a, b, c) {
            console.log(
                a-- > b,
                a-- > b + c,
                a + b-- > c,
                a, b, c
            );
        })(1, 2, 3);
    }
    expect_exact: "(function(a,b,c){console.log(a-- >b,a-- >b+c,a+b-- >c,a,b,c)})(1,2,3);"
    expect_stdout: "false false false -1 1 3"
}

html_comment_in_greater_than_or_equal: {
    input: {
        (function(a, b, c) {
            console.log(
                a-- >= b,
                a-- >= b + c,
                a + b-- >= c,
                a, b, c
            );
        })(1, 2, 3);
    }
    expect_exact: "(function(a,b,c){console.log(a-- >=b,a-- >=b+c,a+b-- >=c,a,b,c)})(1,2,3);"
    expect_stdout: "false false false -1 1 3"
}

html_comment_in_right_shift: {
    input: {
        (function(a, b, c) {
            console.log(
                a-- >> b,
                a-- >> b + c,
                a + b-- >> c,
                a, b, c
            );
        })(1, 2, 3);
    }
    expect_exact: "(function(a,b,c){console.log(a-- >>b,a-- >>b+c,a+b-- >>c,a,b,c)})(1,2,3);"
    expect_stdout: "0 0 0 -1 1 3"
}

html_comment_in_zero_fill_right_shift: {
    input: {
        (function(a, b, c) {
            console.log(
                a-- >>> b,
                a-- >>> b + c,
                a + b-- >>> c,
                a, b, c
            );
        })(1, 2, 3);
    }
    expect_exact: "(function(a,b,c){console.log(a-- >>>b,a-- >>>b+c,a+b-- >>>c,a,b,c)})(1,2,3);"
    expect_stdout: "0 0 0 -1 1 3"
}

html_comment_in_string_literal: {
    input: {
        console.log("<!--HTML-->comment in<!--string literal-->".length);
    }
    expect_exact: 'console.log("\\x3c!--HTML--\\x3ecomment in\\x3c!--string literal--\\x3e".length);'
    expect_stdout: "42"
}
