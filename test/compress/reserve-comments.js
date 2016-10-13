reserve_single_line: {
    mangle_props = true

    input: {
        // noise
        // uglify-reserve keepme andme
        // noise
        function foo() {
            window.notme = 0;
            window.keepme = 1;
            window["andme"] = 1;
            return { andme: 1, "keepme": 1, butnotme: 0 };
        }
        // noise
        // uglify-reserve keepme
        //uglify-reserve andme
        // noise
        function bar() {
            window.notme = 0;
            window.keepme = 1;
            window["andme"] = 1;
            return { andme: 1, "keepme": 1, butnotme: 0 };
        }
    }
    expect: {
        function foo() {
            window.a = 0;
            window.keepme = 1;
            window["andme"] = 1;
            return { andme: 1, "keepme": 1, b: 0 };
        }
        function bar() {
            window.a = 0;
            window.keepme = 1;
            window["andme"] = 1;
            return { andme: 1, "keepme": 1, b: 0 };
        }
    }
}

reserve_multi_line: {
    mangle_props = true

    input: {
        /* uglify-reserve keepme andme*/
        function foo() {
            window.notme = 0;
            window.keepme = 1;
            window["andme"] = 1;
            return { andme: 1, "keepme": 1, butnotme: 0 };
        }
        /* noise
               uglify-reserve keepme
      uglify-reserve andme
         noise */
        function bar() {
            window.notme = 0;
            window.keepme = 1;
            window["andme"] = 1;
            return { andme: 1, "keepme": 1, butnotme: 0 };
        }
    }
    expect: {
        function foo() {
            window.a = 0;
            window.keepme = 1;
            window["andme"] = 1;
            return { andme: 1, "keepme": 1, b: 0 };
        }
        function bar() {
            window.a = 0;
            window.keepme = 1;
            window["andme"] = 1;
            return { andme: 1, "keepme": 1, b: 0 };
        }
    }
}

reserve_propagation: {
    mangle_props = true

    input: {
        // uglify-reserve thisguy
        function foo() {
            // uglify-reserve thatguy
            function bar() {
                return {
                    notme: 0,
                    thisguy: 1,
                    thatguy: 1
                };
            }
            return {
                whome: 0,
                thisguy: 1,
                thatguy: 0
            };
        }
        var o = {
            whome: 0,
            thisguy: 0,
            thatguy: 0
        };
    }
    expect: {
        function foo() {
            function bar() {
                return {
                    a: 0,
                    thisguy: 1,
                    thatguy: 1
                };
            }
            return {
                b: 0,
                thisguy: 1,
                c: 0
            };
        }
        var o = {
            b: 0,
            d: 0,
            c: 0
        };
    }
}
