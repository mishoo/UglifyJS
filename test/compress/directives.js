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
        unused: true,
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
        }
        (function() {})();
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

valid_after_invalid_1: {
    input: {
        console.log(typeof function() {
            "use\x20strict";
            "use strict";
            return this;
        }());
    }
    expect: {
        console.log(typeof function() {
            "use\x20strict";
            "use strict";
            return this;
        }());
    }
    expect_stdout: "undefined"
}

valid_after_invalid_2: {
    options = {
        directives: true,
    }
    input: {
        console.log(typeof function() {
            "use\x20strict";
            "use strict";
            return this;
        }());
    }
    expect: {
        console.log(typeof function() {
            "use strict";
            return this;
        }());
    }
    expect_stdout: "undefined"
}

issue_5368_1: {
    expression = true
    options = {
        directives: true,
        expression: true,
    }
    input: {
        "foo"
    }
    expect_exact: '"foo"'
    expect_stdout: "foo"
}

issue_5368_2: {
    expression = true
    options = {
        directives: true,
        expression: true,
    }
    input: {
        (function() {
            "foo";
        })()
    }
    expect_exact: "function(){}()"
    expect_stdout: "undefined"
}

issue_5368_3: {
    options = {
        directives: true,
        expression: true,
    }
    input: {
        "foo";
        (function() {
            "bar";
        })();
    }
    expect: {
        (function() {})();
    }
}
