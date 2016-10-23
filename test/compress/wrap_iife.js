wrap_iife: {
    options = {
        negate_iife: false,
    }
    beautify = {
        wrap_iife: true,
    }
    input: {
        (function() {
            return function() {
                console.log('test')
            };
        })()();
    }
    expect_exact: '(function(){return function(){console.log("test")}})()();'
}

wrap_iife_in_expression: {
    options = {
        negate_iife: false,
    }
    beautify = {
        wrap_iife: true,
    }
    input: {
        foo = (function () {
            return bar();
        })();
    }
    expect_exact: 'foo=(function(){return bar()})();'
}

wrap_iife_in_return_call: {
    options = {
        negate_iife: false,
    }
    beautify = {
        wrap_iife: true,
    }
    input: {
        (function() {
            return (function() {
                console.log('test')
            })();
        })()();
    }
    expect_exact: '(function(){return(function(){console.log("test")})()})()();'
}
