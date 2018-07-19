must_replace: {
    options = {
        global_defs: {
            D: "foo bar",
        },
    }
    input: {
        console.log(D);
    }
    expect: {
        console.log("foo bar");
    }
}

keyword: {
    options = {
        global_defs: {
            undefined: 0,
            NaN: 1,
            Infinity: 2,
        },
    }
    input: {
        console.log(undefined, NaN, Infinity);
    }
    expect: {
        console.log(0, 1, 2);
    }
}

object: {
    options = {
        evaluate: true,
        global_defs: {
            CONFIG: {
                DEBUG: [ 0 ],
                VALUE: 42,
            },
        },
        side_effects: true,
        unsafe: true,
    }
    input: {
        function f(CONFIG) {
            // CONFIG not global - do not replace
            return CONFIG.VALUE;
        }
        function g() {
            var CONFIG = { VALUE: 1 };
            // CONFIG not global - do not replace
            return CONFIG.VALUE;
        }
        function h() {
            return CONFIG.VALUE;
        }
        if (CONFIG.DEBUG[0])
            console.debug("foo");
    }
    expect: {
        function f(CONFIG) {
            return CONFIG.VALUE;
        }
        function g() {
            var CONFIG = { VALUE: 1 };
            return CONFIG.VALUE;
        }
        function h() {
            return 42;
        }
        if (0)
            console.debug("foo");
    }
}

expanded: {
    options = {
        global_defs: {
            "CONFIG.DEBUG": [ 0 ],
            "CONFIG.VALUE": 42,
        },
    }
    input: {
        function f(CONFIG) {
            // CONFIG not global - do not replace
            return CONFIG.VALUE;
        }
        function g() {
            var CONFIG = { VALUE: 1 };
            // CONFIG not global - do not replace
            return CONFIG.VALUE;
        }
        function h() {
            return CONFIG.VALUE;
        }
        if (CONFIG.DEBUG[0])
            console.debug("foo");
    }
    expect: {
        function f(CONFIG) {
            return CONFIG.VALUE;
        }
        function g() {
            var CONFIG = { VALUE: 1 };
            return CONFIG.VALUE;
        }
        function h() {
            return 42;
        }
        if ([0][0])
            console.debug("foo");
    }
}

mixed: {
    options = {
        evaluate: true,
        global_defs: {
            "CONFIG.VALUE": 42,
            "FOO.BAR": "moo",
        },
        properties: true,
    }
    input: {
        var FOO = { BAR: 0 };
        console.log(FOO.BAR);
        console.log(++CONFIG.DEBUG);
        console.log(++CONFIG.VALUE);
        console.log(++CONFIG["VAL" + "UE"]);
        console.log(++DEBUG[CONFIG.VALUE]);
        CONFIG.VALUE.FOO = "bar";
        console.log(CONFIG);
    }
    expect: {
        var FOO = { BAR: 0 };
        console.log("moo");
        console.log(++CONFIG.DEBUG);
        console.log(++CONFIG.VALUE);
        console.log(++CONFIG.VALUE);
        console.log(++DEBUG[42]);
        CONFIG.VALUE.FOO = "bar";
        console.log(CONFIG);
    }
    expect_warnings: [
        "WARN: global_defs CONFIG.VALUE redefined [test/compress/global_defs.js:4,22]",
        "WARN: global_defs CONFIG.VALUE redefined [test/compress/global_defs.js:7,8]",
    ]
}

issue_1801: {
    options = {
        booleans: true,
        global_defs: {
            "CONFIG.FOO.BAR": true,
        },
    }
    input: {
        console.log(CONFIG.FOO.BAR);
    }
    expect: {
        console.log(!0);
    }
}

issue_1986: {
    options = {
        global_defs: {
            "@alert": "console.log",
        },
    }
    input: {
        alert(42);
    }
    expect: {
        console.log(42);
    }
}

issue_2167: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        global_defs: {
            "@isDevMode": "function(){}",
        },
        passes: 2,
        side_effects: true,
    }
    input: {
        if (isDevMode()) {
            greetOverlord();
        }
        doWork();
    }
    expect: {
        doWork();
    }
}

issue_3217: {
    options = {
        collapse_vars: true,
        global_defs: {
            "@o": "{fn:function(){var a=42;console.log(a)}}",
        },
        inline: true,
        properties: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        o.fn();
    }
    expect: {
        console.log(42);
    }
}
