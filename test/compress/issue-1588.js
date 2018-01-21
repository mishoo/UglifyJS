screw_ie8: {
    options = {
        ie8: false,
    }
    mangle = {
        ie8: false,
    }
    input: {
        try { throw "foo"; } catch (x) { console.log(x); }
    }
    expect_exact: 'try{throw"foo"}catch(o){console.log(o)}'
    expect_stdout: [
        "foo"
    ]
}

support_ie8: {
    options = {
        ie8: true,
    }
    mangle = {
        ie8: true,
    }
    input: {
        try { throw "foo"; } catch (x) { console.log(x); }
    }
    expect_exact: 'try{throw"foo"}catch(x){console.log(x)}'
    expect_stdout: "foo"
}

safe_undefined: {
    options = {
        conditionals: true,
        if_return: true,
        unsafe: false,
    }
    mangle = {}
    input: {
        var a, c;
        console.log(function(undefined) {
            return function() {
                if (a)
                    return b;
                if (c)
                    return d;
            };
        }(1)());
    }
    expect: {
        var a, c;
        console.log(function(n) {
            return function() {
                return a ? b : c ? d : void 0;
            };
        }(1)());
    }
    expect_stdout: true
}

unsafe_undefined: {
    options = {
        conditionals: true,
        if_return: true,
        unsafe_undefined: true,
    }
    mangle = {}
    input: {
        var a, c;
        console.log(function(undefined) {
            return function() {
                if (a)
                    return b;
                if (c)
                    return d;
            };
        }()());
    }
    expect: {
        var a, c;
        console.log(function(n) {
            return function() {
                return a ? b : c ? d : n;
            };
        }()());
    }
    expect_stdout: true
}

runtime_error: {
    input: {
        const a = 1;
        console.log(a++);
    }
    expect: {
        const a = 1;
        console.log(a++);
    }
    expect_stdout: true
}
