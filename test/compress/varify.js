reduce_merge_const: {
    options = {
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        const a = console;
        console.log(typeof a);
        var b = typeof a;
        console.log(b);
    }
    expect: {
        var a = console;
        console.log(typeof a);
        a = typeof a;
        console.log(a);
    }
    expect_stdout: [
        "object",
        "object",
    ]
}

reduce_merge_let: {
    options = {
        merge_vars: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        "use strict";
        let a = console;
        console.log(typeof a);
        var b = typeof a;
        console.log(b);
    }
    expect: {
        "use strict";
        var a = console;
        console.log(typeof a);
        a = typeof a;
        console.log(a);
    }
    expect_stdout: [
        "object",
        "object",
    ]
    node_version: ">=4"
}

reduce_block_const: {
    options = {
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        {
            const a = typeof console;
            console.log(a);
        }
    }
    expect: {
        var a = typeof console;
        console.log(a);
    }
    expect_stdout: "object"
}

reduce_block_let: {
    options = {
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        "use strict";
        {
            let a = typeof console;
            console.log(a);
        }
    }
    expect: {
        "use strict";
        var a = typeof console;
        console.log(a);
    }
    expect_stdout: "object"
    node_version: ">=4"
}

hoist_props_const: {
    options = {
        hoist_props: true,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        {
            const o = {
                p: "PASS",
            };
            console.log(o.p);
        }
    }
    expect: {
        var o, o_p = "PASS";
        console.log(o_p);
    }
    expect_stdout: "PASS"
}

hoist_props_let: {
    options = {
        hoist_props: true,
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        "use strict";
        {
            let o = {
                p: "PASS",
            };
            console.log(o.p);
        }
    }
    expect: {
        "use strict";
        var o, o_p = "PASS";
        console.log(o_p);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

scope_adjustment_const: {
    options = {
        conditionals: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        for (var k in [ 42 ])
            console.log(function f() {
                if (k) {
                    const a = 0;
                }
            }());
    }
    expect: {
        for (var k in [ 42 ])
            console.log(void (k && 0));
    }
    expect_stdout: "undefined"
}

scope_adjustment_let: {
    options = {
        conditionals: true,
        inline: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        "use strict";
        for (var k in [ 42 ])
            console.log(function f() {
                if (k) {
                    let a = 0;
                }
            }());
    }
    expect: {
        "use strict";
        for (var k in [ 42 ])
            console.log(void (k && 0));
    }
    expect_stdout: "undefined"
    node_version: ">=4"
}

escaped_const: {
    options = {
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        const log = console.log;
        log("PASS");
    }
    expect: {
        var log = console.log;
        log("PASS");
    }
    expect_stdout: "PASS"
}

escaped_let: {
    options = {
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        "use strict";
        let log = console.log;
        log("PASS");
    }
    expect: {
        "use strict";
        var log = console.log;
        log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4191_const: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        const a = function() {};
        console.log(typeof a, a());
    }
    expect: {
        function a() {};
        console.log(typeof a, a());
    }
    expect_stdout: "function undefined"
}

issue_4191_let: {
    options = {
        functions: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        "use strict";
        let a = function() {};
        console.log(typeof a, a());
    }
    expect: {
        "use strict";
        function a() {};
        console.log(typeof a, a());
    }
    expect_stdout: "function undefined"
    node_version: ">=4"
}

forin_const_1: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        const o = {
            foo: 42,
            bar: "PASS",
        };
        for (const k in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            foo: 42,
            bar: "PASS",
        };
        for (const k in o)
            console.log(k, o[k]);
    }
    expect_stdout: true
    node_version: ">=4"
}

forin_const_2: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        const o = {
            p: 42,
            q: "PASS",
        };
        for (const [ k ] in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            p: 42,
            q: "PASS",
        }, k;
        for ([ k ] in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "p 42",
        "q PASS",
    ]
    node_version: ">=6"
}

forin_const_3: {
    options = {
        module: true,
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        "use strict";
        const o = {
            p: 42,
            q: "PASS",
        };
        for (const k in o)
            (function f() {
                console.log(k, o[k]);
            })();
    }
    expect: {
        "use strict";
        let o = {
            p: 42,
            q: "PASS",
        };
        for (let k in o)
            (function f() {
                console.log(k, o[k]);
            })();
    }
    expect_stdout: [
        "p 42",
        "q PASS",
    ]
    node_version: ">=4"
}

forin_let_1: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        "use strict";
        let o = {
            foo: 42,
            bar: "PASS",
        };
        for (let k in o)
            console.log(k, o[k]);
    }
    expect: {
        "use strict";
        var o = {
            foo: 42,
            bar: "PASS",
        }, k;
        for (k in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "foo 42",
        "bar PASS",
    ]
    node_version: ">=4"
}

forin_let_2: {
    options = {
        join_vars: true,
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        let o = {
            p: 42,
            q: "PASS",
        };
        for (let [ k ] in o)
            console.log(k, o[k]);
    }
    expect: {
        var o = {
            p: 42,
            q: "PASS",
        }, k;
        for ([ k ] in o)
            console.log(k, o[k]);
    }
    expect_stdout: [
        "p 42",
        "q PASS",
    ]
    node_version: ">=6"
}

loop_scope_1: {
    options = {
        toplevel: true,
        varify: true,
    }
    input: {
        "use strict";
        var o = { foo: 1, bar: 2 };
        for (let i in o) {
            console.log(i);
        }
        for (const j in o)
            setTimeout(() => console.log(j), 0);
        for (let k in o)
            setTimeout(function() {
                console.log(k);
            }, 0);
    }
    expect: {
        "use strict";
        var o = { foo: 1, bar: 2 };
        for (var i in o)
            console.log(i);
        for (const j in o)
            setTimeout(() => console.log(j), 0);
        for (let k in o)
            setTimeout(function() {
                console.log(k);
            }, 0);
    }
    expect_stdout: [
        "foo",
        "bar",
        "foo",
        "bar",
        "foo",
        "bar",
    ]
    node_version: ">=4"
}

loop_scope_2: {
    options = {
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        "use strict";
        var a = [ "foo", "bar" ];
        for (var i = 0; i < a.length; i++) {
            const x = a[i];
            console.log(x);
            let y = a[i];
            setTimeout(() => console.log(y), 0);
            const z = a[i];
            setTimeout(function() {
                console.log(z);
            }, 0);
        }
    }
    expect: {
        "use strict";
        var a = [ "foo", "bar" ];
        for (var i = 0; i < a.length; i++) {
            var x = a[i];
            console.log(x);
            let y = a[i];
            setTimeout(() => console.log(y), 0);
            const z = a[i];
            setTimeout(function() {
                console.log(z);
            }, 0);
        }
    }
    expect_stdout: [
        "foo",
        "bar",
        "foo",
        "foo",
        "bar",
        "bar",
    ]
    node_version: ">=4"
}

issue_4290_1_const: {
    options = {
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        const a = 0;
        var a;
    }
    expect: {
        const a = 0;
        var a;
    }
    expect_stdout: true
}

issue_4290_1_let: {
    options = {
        reduce_vars: true,
        toplevel: true,
        varify: true,
    }
    input: {
        "use strict";
        let a = 0;
        var a;
    }
    expect: {
        "use strict";
        let a = 0;
        var a;
    }
    expect_stdout: true
    node_version: ">=4"
}

drop_forin_let: {
    options = {
        loops: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        "use strict";
        for (let a in console.log("PASS"));
    }
    expect: {
        "use strict";
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

default_init: {
    options = {
        join_vars: true,
        reduce_vars: true,
        unused: true,
        varify: true,
    }
    input: {
        A = "PASS";
        (function() {
            "use strict";
            let a;
            a = A;
            console.log(a);
        })();
    }
    expect: {
        A = "PASS";
        (function() {
            "use strict";
            var a = A;
            console.log(a);
        })();
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

issue_4933_1: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        console.log(f());
        function f() {
            var a;
            for (console in a = [ f ]) {
                const b = a;
            }
        }
    }
    expect: {
        console.log(function f() {
            var a;
            for (console in a = [ f ]) {
                const b = a;
            }
        }());
    }
    expect_stdout: "undefined"
}

issue_4933_2: {
    options = {
        passes: 2,
        reduce_vars: true,
        toplevel: true,
        unused: true,
        varify: true,
    }
    input: {
        console.log(f());
        function f() {
            var a;
            for (console in a = [ f ]) {
                const b = a;
            }
        }
    }
    expect: {
        console.log(function f() {
            for (console in [ f ]);
        }());
    }
    expect_stdout: "undefined"
}

issue_4954: {
    options = {
        functions: true,
        reduce_vars: true,
        unused: true,
        varify: true,
    }
    input: {
        "use strict";
        (function() {
            {
                let a = console;
                console.log(typeof a);
            }
            {
                let a = function() {};
                a && console.log(typeof a);
            }
        })();
    }
    expect: {
        "use strict";
        (function() {
            var a = console;
            console.log(typeof a);
            {
                let a = function() {};
                a && console.log(typeof a);
            }
        })();
    }
    expect_stdout: [
        "object",
        "function",
    ]
    node_version: ">=4"
}

issue_5516: {
    options = {
        reduce_funcs: true,
        reduce_vars: true,
        unused: true,
        varify: true,
    }
    input: {
        "use strict";
        console.log(typeof function() {
            {
                let a;
            }
            {
                const a = function() {};
                return a;
            }
        }());
    }
    expect: {
        "use strict";
        console.log(typeof function() {
            {
                const a = function() {};
                return a;
            }
        }());
    }
    expect_stdout: "function"
    node_version: ">=4"
}

issue_5697_1: {
    options = {
        if_return: true,
        inline: true,
        reduce_vars: true,
        unused: true,
        varify: true,
    }
    input: {
        console.log(function() {
            f();
            return typeof a;
            function f() {
                (function() {
                    for (var k in { foo: 42 }) {
                        const a = k;
                        console.log(a);
                    }
                })();
            }
        }());
    }
    expect: {
        console.log(function() {
            (function() {
                for (var k in { foo: 42 }) {
                    var a = k;
                    console.log(a);
                }
            })();
            return typeof a;
        }());
    }
    expect_stdout: [
        "foo",
        "undefined",
    ]
}

issue_5697_2: {
    options = {
        if_return: true,
        inline: true,
        reduce_vars: true,
        unused: true,
        varify: true,
    }
    input: {
        "use strict";
        console.log(function() {
            f();
            return typeof a;
            function f() {
                (function() {
                    for (var k in { foo: 42 }) {
                        let a = k;
                        console.log(a);
                    }
                })();
            }
        }());
    }
    expect: {
        "use strict";
        console.log(function() {
            (function() {
                for (var k in { foo: 42 }) {
                    var a = k;
                    console.log(a);
                }
            })();
            return typeof a;
        }());
    }
    expect_stdout: [
        "foo",
        "undefined",
    ]
    node_version: ">=4"
}

issue_5697_3: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
        varify: true,
    }
    input: {
        console.log(function() {
            f();
            return typeof a;
            function f() {
                (function() {
                    for (var k in { foo: 42 }) {
                        const a = k;
                        console.log(a);
                    }
                })();
            }
        }());
    }
    expect: {
        console.log(function() {
            (function() {
                for (var k in { foo: 42 }) {
                    var a = k;
                    console.log(a);
                }
            })();
            return typeof a;
        }());
    }
    expect_stdout: [
        "foo",
        "undefined",
    ]
}

issue_5697_4: {
    options = {
        inline: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
        varify: true,
    }
    input: {
        "use strict";
        console.log(function() {
            f();
            return typeof a;
            function f() {
                (function() {
                    for (var k in { foo: 42 }) {
                        let a = k;
                        console.log(a);
                    }
                })();
            }
        }());
    }
    expect: {
        "use strict";
        console.log(function() {
            (function() {
                for (var k in { foo: 42 }) {
                    var a = k;
                    console.log(a);
                }
            })();
            return typeof a;
        }());
    }
    expect_stdout: [
        "foo",
        "undefined",
    ]
    node_version: ">=4"
}
