// tests assume that variable `undefined` not redefined and has `void 0` as value

unsafe_undefined: {
    options = {
        conditionals: true,
        if_return: true,
        unsafe_undefined: true,
    }
    mangle = {}
    input: {
        function f(undefined) {
            return function() {
                if (a)
                    return b;
                if (c)
                    return d;
            };
        }
    }
    expect: {
        function f(n) {
            return function() {
                return a ? b : c ? d : n;
            };
        }
    }
}

keep_fnames: {
    options = {
        conditionals: true,
        if_return: true,
        unsafe_undefined: true,
    }
    mangle = {
        keep_fnames: true
    }
    input: {
        function f(undefined) {
            return function() {
                function n(a) {
                    return a * a;
                }
                if (a)
                    return b;
                if (c)
                    return d;
            };
        }
    }
    expect: {
        function f(r) {
            return function() {
                function n(n) {
                    return n * n;
                }
                return a ? b : c ? d : r;
            };
        }
    }
}
