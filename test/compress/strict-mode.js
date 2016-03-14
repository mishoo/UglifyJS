keep_non_reserved_in_non_strict_mode: {
    input: {
        function outer() {
            var implements = 1;
            var interface = 1;
            var let = 1;
            var package = 1;
            var private = 1;
            var protected = 1;
            var public = 1;
            var static = 1;

            function inner() {
                implements++;
                interface++;
                let++;
                package++;
                private++;
                protected++;
                public++;
                static++;
            }
        }
    }
    expect: {
        function outer() {
            var implements = 1;
            var interface = 1;
            var let = 1;
            var package = 1;
            var private = 1;
            var protected = 1;
            var public = 1;
            var static = 1;

            function inner() {
                implements++;
                interface++;
                let++;
                package++;
                private++;
                protected++;
                public++;
                static++;
            }
        }
    }
}

mangle_non_reserved_in_non_strict_mode: {
    mangle = {}
    input: {
        function outer() {
            var implements = 1;
            var interface = 1;
            var let = 1;
            var package = 1;
            var private = 1;
            var protected = 1;
            var public = 1;
            var static = 1;

            function inner() {
                implements++;
                interface++;
                let++;
                package++;
                private++;
                protected++;
                public++;
                static++;
            }
        }
    }
    expect: {
        function outer() {
            var r=1;
            var a=1;
            var v=1;
            var n=1;
            var o=1;
            var t=1;
            var u=1;
            var c=1;
            function f() {
                r++;
                a++;
                v++;
                n++;
                o++;
                t++;
                u++;
                c++
            }
        }
    }
}

