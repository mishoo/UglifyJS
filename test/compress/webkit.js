lambda_call_dot_assign: {
    beautify = {
        webkit: false,
    }
    input: {
        console.log(function() {
            return {};
        }().a = 1);
    }
    expect_exact: "console.log(function(){return{}}().a=1);"
    expect_stdout: "1"
}

lambda_call_dot_assign_webkit: {
    beautify = {
        webkit: true,
    }
    input: {
        console.log(function() {
            return {};
        }().a = 1);
    }
    expect_exact: "console.log((function(){return{}}()).a=1);"
    expect_stdout: "1"
}

lambda_dot_assign: {
    beautify = {
        webkit: false,
    }
    input: {
        console.log(function() {
            1 + 1;
        }.a = 1);
    }
    expect_exact: "console.log(function(){1+1}.a=1);"
    expect_stdout: "1"
}

lambda_dot_assign_webkit: {
    beautify = {
        webkit: true,
    }
    input: {
        console.log(function() {
            1 + 1;
        }.a = 1);
    }
    expect_exact: "console.log((function(){1+1}).a=1);"
    expect_stdout: "1"
}

lambda_name_mangle: {
    mangle = {}
    input: {
        console.log(typeof function foo(bar) {});
    }
    expect_exact: "console.log(typeof function o(n){});"
    expect_stdout: "function"
}
