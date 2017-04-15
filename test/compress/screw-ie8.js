do_screw: {
    options = {
        ie8: false,
    }
    beautify = {
        ie8: false,
        ascii_only: true,
    }
    input: {
        f("\v");
    }
    expect_exact: 'f("\\v");'
}

dont_screw: {
    options = {
        ie8: true,
    }
    beautify = {
        ie8: true,
        ascii_only: true,
    }
    input: {
        f("\v");
    }
    expect_exact: 'f("\\x0B");'
}

do_screw_constants: {
    options = {
        ie8: false,
    }
    input: {
        f(undefined, Infinity);
    }
    expect_exact: "f(void 0,1/0);"
}

dont_screw_constants: {
    options = {
        ie8: true,
    }
    input: {
        f(undefined, Infinity);
    }
    expect_exact: "f(undefined,Infinity);"
}

do_screw_try_catch: {
    options = {
        ie8: false,
    }
    mangle = {
        ie8: false,
    }
    beautify = {
        ie8: false,
    }
    input: {
        good = function(e){
            return function(error){
                try{
                    e()
                } catch(e) {
                    error(e)
                }
            }
        };
    }
    expect: {
        good = function(n){
            return function(t){
                try{
                    n()
                } catch(n) {
                    t(n)
                }
            }
        };
    }
}

dont_screw_try_catch: {
    options = {
        ie8: true,
    }
    mangle = {
        ie8: true,
    }
    beautify = {
        ie8: true,
    }
    input: {
        bad = function(e){
            return function(error){
                try{
                    e()
                } catch(e) {
                    error(e)
                }
            }
        };
    }
    expect: {
        bad = function(n){
            return function(t){
                try{
                    n()
                } catch(n) {
                    t(n)
                }
            }
        };
    }
}

do_screw_try_catch_undefined: {
    options = {
        ie8: false,
    }
    mangle = {
        ie8: false,
    }
    beautify = {
        ie8: false,
    }
    input: {
        function a(b){
            try {
                throw 'Stuff';
            } catch (undefined) {
                console.log('caught: ' + undefined);
            }
            console.log('undefined is ' + undefined);
            return b === undefined;
        };
    }
    expect: {
        function a(o){
            try{
                throw "Stuff"
            } catch (o) {
                console.log("caught: "+o)
            }
            console.log("undefined is " + void 0);
            return void 0===o
        }
    }
    expect_stdout: true
}

dont_screw_try_catch_undefined: {
    options = {
        ie8: true,
    }
    mangle = {
        ie8: true,
    }
    beautify = {
        ie8: true,
    }
    input: {
        function a(b){
            try {
                throw 'Stuff';
            } catch (undefined) {
                console.log('caught: ' + undefined);
            }
            console.log('undefined is ' + undefined);
            return b === undefined;
        };
    }
    expect: {
        function a(n){
            try{
                throw "Stuff"
            } catch (undefined) {
                console.log("caught: " + undefined)
            }
            console.log("undefined is " + undefined);
            return n === undefined
        }
    }
    expect_stdout: true
}

reduce_vars: {
    options = {
        evaluate: true,
        reduce_vars: true,
        ie8: true,
        unused: true,
    }
    mangle = {
        ie8: true,
    }
    input: {
        function f() {
            var a;
            try {
                x();
            } catch (a) {
                y();
            }
            alert(a);
        }
    }
    expect: {
        function f() {
            var t;
            try {
                x();
            } catch (t) {
                y();
            }
            alert(t);
        }
    }
}

issue_1586_1: {
    options = {
        ie8: true,
    }
    mangle = {
        ie8: true,
    }
    input: {
        function f() {
            try {
                x();
            } catch (err) {
                console.log(err.message);
            }
        }
    }
    expect_exact: "function f(){try{x()}catch(c){console.log(c.message)}}"
}

issue_1586_2: {
    options = {
        ie8: false,
    }
    mangle = {
        ie8: false,
    }
    input: {
        function f() {
            try {
                x();
            } catch (err) {
                console.log(err.message);
            }
        }
    }
    expect_exact: "function f(){try{x()}catch(c){console.log(c.message)}}"
}
