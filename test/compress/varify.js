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
        var b = console;
        console.log(typeof b);
        b = typeof b;
        console.log(b);
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
        var b = console;
        console.log(typeof b);
        b = typeof b;
        console.log(b);
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
        var o_p = "PASS";
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
        var o_p = "PASS";
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
