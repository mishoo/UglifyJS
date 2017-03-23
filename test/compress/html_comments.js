html_comment_in_expression: {
    input: {
        function f(a, b, x, y) { return a < !--b && x-- > y; }
    }
    expect_exact: "function f(a,b,x,y){return a< !--b&&x-- >y}";
}

html_comment_in_less_than: {
    input: {
        function f(a, b) { return a < !--b; }
    }
    expect_exact: "function f(a,b){return a< !--b}";
}

html_comment_in_left_shift: {
    input: {
        function f(a, b) { return a << !--b; }
    }
    expect_exact: "function f(a,b){return a<< !--b}";
}

html_comment_in_right_shift: {
    input: {
        function f(a, b) { return a-- >> b; }
    }
    expect_exact: "function f(a,b){return a-- >>b}";
}

html_comment_in_zero_fill_right_shift: {
    input: {
        function f(a, b) { return a-- >>> b; }
    }
    expect_exact: "function f(a,b){return a-- >>>b}";
}

html_comment_in_greater_than: {
    input: {
        function f(a, b) { return a-- > b; }
    }
    expect_exact: "function f(a,b){return a-- >b}";
}

html_comment_in_greater_than_or_equal: {
    input: {
        function f(a, b) { return a-- >= b; }
    }
    expect_exact: "function f(a,b){return a-- >=b}";
}

html_comment_in_string_literal: {
    input: {
        function f() { return "<!--HTML-->comment in<!--string literal-->"; }
    }
    expect_exact: 'function f(){return"\\x3c!--HTML--\\x3ecomment in\\x3c!--string literal--\\x3e"}';
}

html_comment_after_multiline_comment: {
    input: {
        var foo; /*
*/-->   var bar;
        var foobar;
    }
    expect_exact: "var foo;var foobar;"
}
