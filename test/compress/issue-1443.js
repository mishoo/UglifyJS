// tests assume that variable `undefined` not redefined and has `void 0` as value

unsafe_undefined: {
    options = {
        if_return: true,
        unsafe: true
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
                if (a)
                    return b;
                if (c)
                    return d;
                else
                    return n;
            };
        }
    }
}

keep_fnames: {
    options = {
        if_return: true,
        unsafe: true
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
                if (a)
                    return b;
                if (c)
                    return d;
                else
                    return r;
            };
        }
    }
}
