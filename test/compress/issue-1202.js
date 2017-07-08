mangle_keep_fnames_false: {
    options = {
        keep_fnames : true,
        keep_fargs  : true,
    }
    mangle = {
        keep_fnames : false,
    }
    input: {
        "use strict";
        function total() {
            return function n(a, b, c) {
                return a + b + c;
            };
        }
    }
    expect: {
        "use strict";
        function total() {
            return function c(t, r, u) {
                return t + r + u;
            };
        }
    }
}

mangle_keep_fnames_true: {
    options = {
        keep_fnames : true,
        keep_fargs  : true,
    }
    mangle = {
        keep_fnames : true,
    }
    input: {
        "use strict";
        function total() {
            return function n(a, b, c) {
                return a + b + c;
            };
        }
    }
    expect: {
        "use strict";
        function total() {
            return function n(t, r, u) {
                return t + r + u;
            };
        }
    }
}
