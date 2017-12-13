collapse: {
    options = {
        collapse_vars: true,
        sequences: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function f1() {
            var a;
            a = typeof b === 'function' ? b() : b;
            return a !== undefined && c();
        }
        function f2(b) {
            var a;
            b = c();
            a = typeof b === 'function' ? b() : b;
            return 'stirng' == typeof a && d();
        }
        function f3(c) {
            var a;
            a = b(a / 2);
            if (a < 0) {
                a++;
                ++c;
                return c / 2;
            }
        }
        function f4(c) {
            var a;
            a = b(a / 2);
            if (a < 0) {
                a++;
                c++;
                return c / 2;
            }
        }
    }
    expect: {
        function f1() {
            return void 0 !== ('function' === typeof b ? b() : b) && c();
        }
        function f2(b) {
            return 'stirng' == typeof ('function' === typeof (b = c()) ? b() : b) && d();
        }
        function f3(c) {
            var a;
            if ((a = b(a / 2)) < 0) return a++, ++c / 2;
        }
        function f4(c) {
            var a;
            if ((a = b(a / 2)) < 0) return a++, ++c / 2;
        }
    }
}
