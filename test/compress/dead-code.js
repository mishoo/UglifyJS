dead_code_1: {
    options = {
        dead_code: true
    };
    input: {
        function f() {
            a();
            b();
            x = 10;
            return;
            if (x) {
                y();
            }
        }
    }
    expect: {
        function f() {
            a();
            b();
            x = 10;
            return;
        }
    }
}

dead_code_2_should_warn: {
    options = {
        dead_code: true
    };
    input: {
        function f() {
            g();
            x = 10;
            throw "foo";
            // completely discarding the `if` would introduce some
            // bugs.  UglifyJS v1 doesn't deal with this issue.
            if (x) {
                y();
                var x;
                function g(){};
            }
        }
    }
    expect: {
        function f() {
            g();
            x = 10;
            throw "foo";
            var x;
            function g(){};
        }
    }
}
