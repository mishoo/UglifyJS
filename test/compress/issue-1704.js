mangle_catch: {
    options = {
        ie: false,
        toplevel: false,
    }
    mangle = {
        ie: false,
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
        ie: true,
        toplevel: false,
    }
    mangle = {
        ie: true,
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
        ie: false,
        toplevel: false,
    }
    mangle = {
        ie: false,
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
        ie: true,
        toplevel: false,
    }
    mangle = {
        ie: true,
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
        ie: false,
        toplevel: true,
    }
    mangle = {
        ie: false,
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
    expect_exact: 'var c="FAIL";try{throw 1}catch(o){c="PASS"}console.log(c);'
    expect_stdout: "PASS"
}

mangle_catch_ie8_toplevel: {
    options = {
        ie: true,
        toplevel: true,
    }
    mangle = {
        ie: true,
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
        ie: false,
        toplevel: true,
    }
    mangle = {
        ie: false,
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
    expect_exact: 'var r="FAIL";try{throw 1}catch(o){var r="PASS"}console.log(r);'
    expect_stdout: "PASS"
}

mangle_catch_var_ie8_toplevel: {
    options = {
        ie: true,
        toplevel: true,
    }
    mangle = {
        ie: true,
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

mangle_catch_redef_1: {
    options = {
        ie: false,
        toplevel: false,
    }
    mangle = {
        ie: false,
        toplevel: false,
    }
    input: {
        var a = "PASS";
        try {
            throw "FAIL1";
        } catch (a) {
            var a = "FAIL2";
        }
        console.log(a);
    }
    expect_exact: 'var a="PASS";try{throw"FAIL1"}catch(a){var a="FAIL2"}console.log(a);'
    expect_stdout: "PASS"
}

mangle_catch_redef_1_ie8: {
    options = {
        ie: true,
        toplevel: false,
    }
    mangle = {
        ie: true,
        toplevel: false,
    }
    input: {
        var a = "PASS";
        try {
            throw "FAIL1";
        } catch (a) {
            var a = "FAIL2";
        }
        console.log(a);
    }
    expect_exact: 'var a="PASS";try{throw"FAIL1"}catch(a){var a="FAIL2"}console.log(a);'
    expect_stdout: "PASS"
}

mangle_catch_redef_1_toplevel: {
    options = {
        ie: false,
        toplevel: true,
    }
    mangle = {
        ie: false,
        toplevel: true,
    }
    input: {
        var a = "PASS";
        try {
            throw "FAIL1";
        } catch (a) {
            var a = "FAIL2";
        }
        console.log(a);
    }
    expect_exact: 'var o="PASS";try{throw"FAIL1"}catch(o){var o="FAIL2"}console.log(o);'
    expect_stdout: "PASS"
}

mangle_catch_redef_1_ie8_toplevel: {
    options = {
        ie: true,
        toplevel: true,
    }
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        var a = "PASS";
        try {
            throw "FAIL1";
        } catch (a) {
            var a = "FAIL2";
        }
        console.log(a);
    }
    expect_exact: 'var o="PASS";try{throw"FAIL1"}catch(o){var o="FAIL2"}console.log(o);'
    expect_stdout: "PASS"
}

mangle_catch_redef_2: {
    options = {
        ie: false,
        toplevel: false,
    }
    mangle = {
        ie: false,
        toplevel: false,
    }
    input: {
        try {
            throw "FAIL1";
        } catch (a) {
            var a = "FAIL2";
        }
        console.log(a);
    }
    expect_exact: 'try{throw"FAIL1"}catch(a){var a="FAIL2"}console.log(a);'
    expect_stdout: "undefined"
}

mangle_catch_redef_2_ie8: {
    options = {
        ie: true,
        toplevel: false,
    }
    mangle = {
        ie: true,
        toplevel: false,
    }
    input: {
        try {
            throw "FAIL1";
        } catch (a) {
            var a = "FAIL2";
        }
        console.log(a);
    }
    expect_exact: 'try{throw"FAIL1"}catch(a){var a="FAIL2"}console.log(a);'
    expect_stdout: "undefined"
}

mangle_catch_redef_2_toplevel: {
    options = {
        ie: false,
        toplevel: true,
    }
    mangle = {
        ie: false,
        toplevel: true,
    }
    input: {
        try {
            throw "FAIL1";
        } catch (a) {
            var a = "FAIL2";
        }
        console.log(a);
    }
    expect_exact: 'try{throw"FAIL1"}catch(o){var o="FAIL2"}console.log(o);'
    expect_stdout: "undefined"
}

mangle_catch_redef_2_ie8_toplevel: {
    options = {
        ie: true,
        toplevel: true,
    }
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        try {
            throw "FAIL1";
        } catch (a) {
            var a = "FAIL2";
        }
        console.log(a);
    }
    expect_exact: 'try{throw"FAIL1"}catch(o){var o="FAIL2"}console.log(o);'
    expect_stdout: "undefined"
}

mangle_catch_redef_3: {
    mangle = {
        ie: false,
        toplevel: false,
    }
    input: {
        var o = "PASS";
        try {
            throw 0;
        } catch (o) {
            // prints "FAIL" if inlined on Node.js v4-
            (function() {
                function f() {
                    o = "FAIL";
                }
                f(), f();
            })();
        }
        console.log(o);
    }
    expect_exact: 'var o="PASS";try{throw 0}catch(o){(function(){function c(){o="FAIL"}c(),c()})()}console.log(o);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_catch_redef_3_toplevel: {
    mangle = {
        ie: false,
        toplevel: true,
    }
    input: {
        var o = "PASS";
        try {
            throw 0;
        } catch (o) {
            // prints "FAIL" if inlined on Node.js v4-
            (function() {
                function f() {
                    o = "FAIL";
                }
                f(), f();
            })();
        }
        console.log(o);
    }
    expect_exact: 'var c="PASS";try{throw 0}catch(c){(function(){function o(){c="FAIL"}o(),o()})()}console.log(c);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_catch_redef_3_ie8: {
    mangle = {
        ie: true,
        toplevel: false,
    }
    input: {
        var o = "PASS";
        try {
            throw 0;
        } catch (o) {
            // prints "FAIL" if inlined on Node.js v4-
            (function() {
                function f() {
                    o = "FAIL";
                }
                f(), f();
            })();
        }
        console.log(o);
    }
    expect_exact: 'var o="PASS";try{throw 0}catch(o){(function(){function c(){o="FAIL"}c(),c()})()}console.log(o);'
    expect_stdout: "PASS"
    node_version: ">=6"
}

mangle_catch_redef_3_ie8_toplevel: {
    mangle = {
        ie: true,
        toplevel: true,
    }
    input: {
        var o = "PASS";
        try {
            throw 0;
        } catch (o) {
            // prints "FAIL" if inlined on Node.js v4-
            (function() {
                function f() {
                    o = "FAIL";
                }
                f(), f();
            })();
        }
        console.log(o);
    }
    expect_exact: 'var c="PASS";try{throw 0}catch(c){(function(){function o(){c="FAIL"}o(),o()})()}console.log(c);'
    expect_stdout: "PASS"
    node_version: ">=6"
}
