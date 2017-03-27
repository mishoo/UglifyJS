mangle_catch: {
    options = {
        screw_ie8: true,
        toplevel: false,
    }
    mangle = {
        screw_ie8: true,
        toplevel: false,
    }
    input: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (args) {
            a = "PASS";
        }
        console.log(a);
    }
    expect_exact: 'var a="FAIL";try{throw 1}catch(o){a="PASS"}console.log(a);'
    expect_stdout: "PASS"
}

mangle_catch_ie8: {
    options = {
        screw_ie8: false,
        toplevel: false,
    }
    mangle = {
        screw_ie8: false,
        toplevel: false,
    }
    input: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (args) {
            a = "PASS";
        }
        console.log(a);
    }
    expect_exact: 'var a="FAIL";try{throw 1}catch(args){a="PASS"}console.log(a);'
    expect_stdout: "PASS"
}

mangle_catch_var: {
    options = {
        screw_ie8: true,
        toplevel: false,
    }
    mangle = {
        screw_ie8: true,
        toplevel: false,
    }
    input: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (args) {
            var a = "PASS";
        }
        console.log(a);
    }
    expect_exact: 'var a="FAIL";try{throw 1}catch(o){var a="PASS"}console.log(a);'
    expect_stdout: "PASS"
}

mangle_catch_var_ie8: {
    options = {
        screw_ie8: false,
        toplevel: false,
    }
    mangle = {
        screw_ie8: false,
        toplevel: false,
    }
    input: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (args) {
            var a = "PASS";
        }
        console.log(a);
    }
    expect_exact: 'var a="FAIL";try{throw 1}catch(args){var a="PASS"}console.log(a);'
    expect_stdout: "PASS"
}

mangle_catch_toplevel: {
    options = {
        screw_ie8: true,
        toplevel: true,
    }
    mangle = {
        screw_ie8: true,
        toplevel: true,
    }
    input: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (args) {
            a = "PASS";
        }
        console.log(a);
    }
    expect_exact: 'var o="FAIL";try{throw 1}catch(c){o="PASS"}console.log(o);'
    expect_stdout: "PASS"
}

mangle_catch_ie8_toplevel: {
    options = {
        screw_ie8: false,
        toplevel: true,
    }
    mangle = {
        screw_ie8: false,
        toplevel: true,
    }
    input: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (args) {
            a = "PASS";
        }
        console.log(a);
    }
    expect_exact: 'var o="FAIL";try{throw 1}catch(c){o="PASS"}console.log(o);'
    expect_stdout: "PASS"
}

mangle_catch_var_toplevel: {
    options = {
        screw_ie8: true,
        toplevel: true,
    }
    mangle = {
        screw_ie8: true,
        toplevel: true,
    }
    input: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (args) {
            var a = "PASS";
        }
        console.log(a);
    }
    expect_exact: 'var o="FAIL";try{throw 1}catch(r){var o="PASS"}console.log(o);'
    expect_stdout: "PASS"
}

mangle_catch_var_ie8_toplevel: {
    options = {
        screw_ie8: false,
        toplevel: true,
    }
    mangle = {
        screw_ie8: false,
        toplevel: true,
    }
    input: {
        var a = "FAIL";
        try {
            throw 1;
        } catch (args) {
            var a = "PASS";
        }
        console.log(a);
    }
    expect_exact: 'var o="FAIL";try{throw 1}catch(r){var o="PASS"}console.log(o);'
    expect_stdout: "PASS"
}
