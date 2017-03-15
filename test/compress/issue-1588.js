screw_ie8: {
    options = {
        screw_ie8: true,
    }
    mangle = {
        screw_ie8: true,
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
        screw_ie8: false,
    }
    mangle = {
        screw_ie8: false,
    }
    input: {
        try { throw "foo"; } catch (x) { console.log(x); }
    }
    expect_exact: 'try{throw"foo"}catch(x){console.log(x)}'
    expect_stdout: "foo"
}
