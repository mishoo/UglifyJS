mangle_catch: {
    rename = true
    options = {
        ie8: false,
        toplevel: false,
    }
    mangle = {
        ie8: false,
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
    rename = true
    options = {
        ie8: true,
        toplevel: false,
    }
    mangle = {
        ie8: true,
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
    rename = true
    options = {
        ie8: false,
        toplevel: false,
    }
    mangle = {
        ie8: false,
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
    rename = true
    options = {
        ie8: true,
        toplevel: false,
    }
    mangle = {
        ie8: true,
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
    rename = true
    options = {
        ie8: false,
        toplevel: true,
    }
    mangle = {
        ie8: false,
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
    rename = true
    options = {
        ie8: true,
        toplevel: true,
    }
    mangle = {
        ie8: true,
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
    rename = true
    options = {
        ie8: false,
        toplevel: true,
    }
    mangle = {
        ie8: false,
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
    rename = true
    options = {
        ie8: true,
        toplevel: true,
    }
    mangle = {
        ie8: true,
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
    rename = true
    options = {
        ie8: false,
        toplevel: false,
    }
    mangle = {
        ie8: false,
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
    rename = true
    options = {
        ie8: true,
        toplevel: false,
    }
    mangle = {
        ie8: true,
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
    rename = true
    options = {
        ie8: false,
        toplevel: true,
    }
    mangle = {
        ie8: false,
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
    rename = true
    options = {
        ie8: true,
        toplevel: true,
    }
    mangle = {
        ie8: true,
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
    rename = true
    options = {
        ie8: false,
        toplevel: false,
    }
    mangle = {
        ie8: false,
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
    rename = true
    options = {
        ie8: true,
        toplevel: false,
    }
    mangle = {
        ie8: true,
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
    rename = true
    options = {
        ie8: false,
        toplevel: true,
    }
    mangle = {
        ie8: false,
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
    rename = true
    options = {
        ie8: true,
        toplevel: true,
    }
    mangle = {
        ie8: true,
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

issue_2120_1: {
    rename = true
    mangle = {
        ie8: false,
    }
    input: {
        "aaaaaaaa";
        var a = 1, b = "FAIL";
        try {
            throw 1;
        } catch (c) {
            try {
                throw 0;
            } catch (a) {
                if (c) b = "PASS";
            }
        }
        console.log(b);
    }
    expect: {
        "aaaaaaaa";
        var a = 1, b = "FAIL";
        try {
            throw 1;
        } catch (t) {
            try {
                throw 0;
            } catch (a) {
                if (t) b = "PASS";
            }
        }
        console.log(b);
    }
    expect_stdout: "PASS"
}

issue_2120_2: {
    rename = true
    mangle = {
        ie8: true,
    }
    input: {
        "aaaaaaaa";
        var a = 1, b = "FAIL";
        try {
            throw 1;
        } catch (c) {
            try {
                throw 0;
            } catch (a) {
                if (c) b = "PASS";
            }
        }
        console.log(b);
    }
    expect: {
        "aaaaaaaa";
        var a = 1, b = "FAIL";
        try {
            throw 1;
        } catch (c) {
            try {
                throw 0;
            } catch (a) {
                if (c) b = "PASS";
            }
        }
        console.log(b);
    }
    expect_stdout: "PASS"
}
function_iife_catch: {
    rename = true
    mangle = {
        ie8: false,
    }
    input: {
        function f(n) {
            !function() {
                try {
                    throw 0;
                } catch (n) {
                    var a = 1;
                    console.log(n, a);
                }
            }();
        }
        f();
    }
    expect_exact: "function f(o){!function(){try{throw 0}catch(o){var c=1;console.log(o,c)}}()}f();"
    expect_stdout: "0 1"
}

function_iife_catch_ie8: {
    rename = true
    mangle = {
        ie8: true,
    }
    input: {
        function f(n) {
            !function() {
                try {
                    throw 0;
                } catch (n) {
                    var a = 1;
                    console.log(n, a);
                }
            }();
        }
        f();
    }
    expect_exact: "function f(c){!function(){try{throw 0}catch(c){var o=1;console.log(c,o)}}()}f();"
    expect_stdout: "0 1"
}

function_catch_catch: {
    rename = true
    mangle = {
        ie8: false,
    }
    input: {
        var o = 0;
        function f() {
            try {
                throw 1;
            } catch (c) {
                try {
                    throw 2;
                } catch (o) {
                    var o = 3;
                    console.log(o);
                }
            }
            console.log(o);
        }
        f();
    }
    expect_exact: "var o=0;function f(){try{throw 1}catch(o){try{throw 2}catch(c){var c=3;console.log(c)}}console.log(c)}f();"
    expect_stdout: [
        "3",
        "undefined",
    ]
}

function_catch_catch_ie8: {
    rename = true
    mangle = {
        ie8: true,
    }
    input: {
        var o = 0;
        function f() {
            try {
                throw 1;
            } catch (c) {
                try {
                    throw 2;
                } catch (o) {
                    var o = 3;
                    console.log(o);
                }
            }
            console.log(o);
        }
        f();
    }
    expect_exact: "var o=0;function f(){try{throw 1}catch(c){try{throw 2}catch(o){var o=3;console.log(o)}}console.log(o)}f();"
    expect_stdout: [
        "3",
        "undefined",
    ]
}

function_do_catch_ie8: {
    rename = true
    options = {
        ie8: true,
        side_effects: true,
        unused: true,
    }
    mangle = {
        ie8: true,
        toplevel: true,
    }
    input: {
        var a = 1, b = 1, c = 0;
        function d(e) {
            var f, g, h, i;
            do {
                try {
                    try {
                        var j = function q(){}();
                    } catch (r) {
                        --a && w("ddddddddeeeeeeegggggggggiiiiilllllllnnnnntuuuuuuuuyyyyyyy");
                        var k, l, m, n, o;
                        --m;
                        --n;
                        --o;
                    }
                    try {
                        i[1];
                    } catch (s) {
                        var p;
                        switch (function t() {
                            c++;
                        }()) {
                          case j + --p:
                        }
                    }
                } catch (u) {}
            } while (--i);
            b--;
        }
        d();
        console.log(b, c);
    }
    expect: {
        var t = 1, u = 1, y = 0;
        function c(c) {
            var d;
            do {
                try {
                    try {
                        var e = void 0;
                    } catch (i) {
                        --t && w("ddddddddeeeeeeegggggggggiiiiilllllllnnnnntuuuuuuuuyyyyyyy");
                        0;
                        0;
                        0;
                    }
                    try {
                        d[1];
                    } catch (l) {
                        var g;
                        switch(function x() {
                            y++;
                        }()) {
                          case e + --g:
                        }
                    }
                } catch (n) {}
            } while (--d);
            u--;
        }
        c();
        console.log(u, y);
    }
    expect_stdout: "0 1"
}
