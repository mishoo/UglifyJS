call: {
    input: {
        console.log?.(undefined?.(console.log("FAIL")));
    }
    expect_exact: 'console.log?.((void 0)?.(console.log("FAIL")));'
    expect_stdout: "undefined"
    node_version: ">=14"
}

dot: {
    input: {
        console?.log((void 0)?.p);
    }
    expect_exact: "console?.log((void 0)?.p);"
    expect_stdout: "undefined"
    node_version: ">=14"
}

dot_in: {
    input: {
        var o = { in: 42 };
        console.log(o.in, o?.in);
    }
    expect_exact: "var o={in:42};console.log(o.in,o?.in);"
    expect_stdout: "42 42"
    node_version: ">=14"
}

sub: {
    input: {
        console?.["log"](null?.[console.log("FAIL")]);
    }
    expect_exact: 'console?.["log"](null?.[console.log("FAIL")]);'
    expect_stdout: "undefined"
    node_version: ">=14"
}

ternary_decimal: {
    input: {
        null ? .42 : console.log("PASS");
    }
    expect_exact: 'null?.42:console.log("PASS");'
    expect_stdout: "PASS"
}

assign_parentheses_call: {
    input: {
        var o = {};
        ((() => o)?.()).p = "PASS";
        console.log(o.p);
    }
    expect_exact: 'var o={};((()=>o)?.()).p="PASS";console.log(o.p);'
    expect_stdout: "PASS"
    node_version: ">=14"
}

assign_parentheses_dot: {
    input: {
        (console?.log).name.p = console.log("PASS");
    }
    expect_exact: '(console?.log.name).p=console.log("PASS");'
    expect_stdout: "PASS"
    node_version: ">=14"
}

assign_no_parentheses: {
    input: {
        console[console.log?.("PASS")] = 42;
    }
    expect_exact: 'console[console.log?.("PASS")]=42;'
    expect_stdout: "PASS"
    node_version: ">=14"
}

unary_parentheses: {
    input: {
        var o = { p: 41 };
        (function() {
            return o;
        }?.()).p++;
        console.log(o.p);
    }
    expect_exact: "var o={p:41};(function(){return o}?.()).p++;console.log(o.p);"
    expect_stdout: "42"
    node_version: ">=14"
}

collapse_vars_1: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        A = 42;
        a?.[42];
        console.log(typeof A);
    }
    expect: {
        var a;
        A = 42;
        a?.[42];
        console.log(typeof A);
    }
    expect_stdout: "number"
    node_version: ">=14"
}

collapse_vars_2: {
    options = {
        collapse_vars: true,
    }
    input: {
        var a;
        A = 42;
        a?.(42);
        console.log(typeof A);
    }
    expect: {
        var a;
        A = 42;
        a?.(42);
        console.log(typeof A);
    }
    expect_stdout: "number"
    node_version: ">=14"
}

properties: {
    options = {
        evaluate: true,
        properties: true,
    }
    input: {
        var a;
        console.log(a?.["FAIL"]);
    }
    expect: {
        var a;
        console.log(a?.FAIL);
    }
    expect_stdout: "undefined"
    node_version: ">=14"
}

reduce_vars_1: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        null?.[a = 0];
        console.log(a ? "PASS" : "FAIL");
    }
    expect: {
        var a = 1;
        null?.[a = 0];
        console.log(a ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

reduce_vars_2: {
    options = {
        evaluate: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        var a = 1;
        null?.(a = 0);
        console.log(a ? "PASS" : "FAIL");
    }
    expect: {
        var a = 1;
        null?.(a = 0);
        console.log(a ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

side_effects: {
    options = {
        side_effects: true,
    }
    input: {
        var a;
        a?.[a = "FAIL"];
        console.log(a);
    }
    expect: {
        var a;
        a?.[a = "FAIL"];
        console.log(a);
    }
    expect_stdout: "undefined"
    node_version: ">=14"
}

trim_1: {
    options = {
        evaluate: true,
        optional_chains: true,
        reduce_vars: true,
        unsafe: true,
    }
    input: {
        (function(a, b) {
            console?.log?.(a?.p, b?.[console.log("FAIL")]);
        })?.({ p: "PASS" });
    }
    expect: {
        (function(a, b) {
            console?.log?.(a.p, void 0);
        })({ p: "PASS" });
    }
    expect_stdout: "PASS undefined"
    node_version: ">=14"
}

trim_2: {
    options = {
        evaluate: true,
        optional_chains: true,
        side_effects: true,
    }
    input: {
        (void console.log("PASS"))?.[console.log("FAIL")];
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

issue_4906: {
    options = {
        toplevel: true,
        unused: true,
    }
    input: {
        do {
            var a = a?.[42];
        } while (console.log("PASS"));
    }
    expect: {
        do {} while (console.log("PASS"));
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

issue_4928: {
    options = {
        ie8: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = a?.[function f() {
            f(a);
        }];
        console.log(typeof f);
    }
    expect: {
        var a = a?.[function f() {
            f(a);
        }];
        console.log(typeof f);
    }
    expect_stdout: "undefined"
    node_version: ">=14"
}

issue_4947_1: {
    options = {
        conditionals: true,
    }
    input: {
        console.log(console.foo ? 42..p : console.bar?.p);
    }
    expect: {
        console.log(console.foo ? 42..p : console.bar?.p);
    }
    expect_stdout: "undefined"
    node_version: ">=14"
}

issue_4947_2: {
    options = {
        conditionals: true,
    }
    input: {
        var log = console.log, fail;
        log("PASS") ? log(42) : fail?.(42);
    }
    expect: {
        var log = console.log, fail;
        log("PASS") ? log(42) : fail?.(42);
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}

issue_5039: {
    options = {
        ie8: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = a?.[function f() {
            f;
            a;
        }];
        console.log("PASS");
    }
    expect: {
        (function f() {});
        console.log("PASS");
    }
    expect_stdout: "PASS"
    node_version: ">=14"
}
