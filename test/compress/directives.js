simple_statement_is_not_a_directive: {
    input: {
        "use strict"
            .split(" ")
            .forEach(function(s) {
                console.log(s);
            });
        console.log(!this); // is strict mode?
        (function() {
            "directive"
            ""
            "use strict"
            "hello world"
                .split(" ")
                .forEach(function(s) {
                    console.log(s);
                });
            console.log(!this); // is strict mode?
        })();
    }
    expect: {
        "use strict".split(" ").forEach(function(s) {
            console.log(s);
        });
        console.log(!this);
        (function() {
            "directive";
            "";
            "use strict";
            "hello world".split(" ").forEach(function(s) {
                console.log(s);
            });
            console.log(!this);
        })();
    }
    expect_stdout: [
        "use",
        "strict",
        "false",
        "hello",
        "world",
        "true",
    ]
}

drop_lone_use_strict: {
    options = {
        directives: true,
        side_effects: true,
    }
    input: {
        function f1() {
            "use strict";
        }
        function f2() {
            "use strict";
            function f3() {
                "use strict";
            }
        }
        (function f4() {
            "use strict";
        })();
    }
    expect: {
        function f1() {
        }
        function f2() {
            "use strict";
            function f3() {
            }
        }
    }
}

issue_3166: {
    options = {
        directives: true,
    }
    input: {
        "foo";
        "use strict";
        function f() {
            "use strict";
            "bar";
            "use asm";
        }
    }
    expect: {
        "use strict";
        function f() {
            "use asm";
        }
    }
}
