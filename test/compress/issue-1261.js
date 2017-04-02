pure_function_calls: {
    options = {
        evaluate     : true,
        conditionals : true,
        comparisons  : true,
        side_effects : true,
        booleans     : true,
        unused       : true,
        if_return    : true,
        join_vars    : true,
        cascade      : true,
        negate_iife  : true,
    }
    input: {
        // pure top-level IIFE will be dropped
        // @__PURE__ - comment
        (function() {
            console.log("iife0");
        })();

        // pure top-level IIFE assigned to unreferenced var will not be dropped
        var iife1 = /*@__PURE__*/(function() {
            console.log("iife1");
            function iife1() {}
            return iife1;
        })();

        (function(){
            // pure IIFE in function scope assigned to unreferenced var will be dropped
            var iife2 = /*#__PURE__*/(function() {
                console.log("iife2");
                function iife2() {}
                return iife2;
            })();
        })();

        // comment #__PURE__ comment
        bar(), baz(), quux();
        a.b(), /* @__PURE__ */ c.d.e(), f.g();
    }
    expect: {
        var iife1 = function() {
            console.log("iife1");
            function iife1() {}
            return iife1;
        }();

        baz(), quux();
        a.b(), f.g();
    }
    expect_warnings: [
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:17,8]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:17,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:30,37]",
        "WARN: Dropping unused variable iife2 [test/compress/issue-1261.js:30,16]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:28,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:38,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:39,31]",
    ]
}

pure_function_calls_toplevel: {
    options = {
        evaluate     : true,
        conditionals : true,
        comparisons  : true,
        side_effects : true,
        booleans     : true,
        unused       : true,
        if_return    : true,
        join_vars    : true,
        cascade      : true,
        negate_iife  : true,
        toplevel     : true,
    }
    input: {
        // pure top-level IIFE will be dropped
        // @__PURE__ - comment
        (function() {
            console.log("iife0");
        })();

        // pure top-level IIFE assigned to unreferenced var will be dropped
        var iife1 = /*@__PURE__*/(function() {
            console.log("iife1");
            function iife1() {}
            return iife1;
        })();

        (function(){
            // pure IIFE in function scope assigned to unreferenced var will be dropped
            var iife2 = /*#__PURE__*/(function() {
                console.log("iife2");
                function iife2() {}
                return iife2;
            })();
        })();

        // comment #__PURE__ comment
        bar(), baz(), quux();
        a.b(), /* @__PURE__ */ c.d.e(), f.g();
    }
    expect: {
        baz(), quux();
        a.b(), f.g();
    }
    expect_warnings: [
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:79,8]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:79,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:92,37]",
        "WARN: Dropping unused variable iife2 [test/compress/issue-1261.js:92,16]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:90,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:100,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:101,31]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:84,33]",
        "WARN: Dropping unused variable iife1 [test/compress/issue-1261.js:84,12]",
    ]
}

should_warn: {
    options = {
        booleans: true,
        conditionals: true,
        evaluate: true,
        side_effects: true,
    }
    input: {
        /* @__PURE__ */(function(){x})(), void/* @__PURE__ */(function(){y})();
        /* @__PURE__ */(function(){x})() || true ? foo() : bar();
        true || /* @__PURE__ */(function(){y})() ? foo() : bar();
        /* @__PURE__ */(function(){x})() && false ? foo() : bar();
        false && /* @__PURE__ */(function(){y})() ? foo() : bar();
        /* @__PURE__ */(function(){x})() + "foo" ? bar() : baz();
        "foo" + /* @__PURE__ */(function(){y})() ? bar() : baz();
        /* @__PURE__ */(function(){x})() ? foo() : foo();
        [/* @__PURE__ */(function(){x})()] ? foo() : bar();
        !{ foo: /* @__PURE__ */(function(){x})() } ? bar() : baz();
    }
    expect: {
        foo();
        foo();
        bar();
        bar();
        bar();
        bar();
        foo();
        foo();
        baz();
    }
    expect_warnings: [
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:128,61]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:128,23]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:128,23]",
        "WARN: Boolean || always true [test/compress/issue-1261.js:129,23]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:129,23]",
        "WARN: Condition always true [test/compress/issue-1261.js:129,23]",
        "WARN: Condition left of || always true [test/compress/issue-1261.js:130,8]",
        "WARN: Condition always true [test/compress/issue-1261.js:130,8]",
        "WARN: Boolean && always false [test/compress/issue-1261.js:131,23]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:131,23]",
        "WARN: Condition always false [test/compress/issue-1261.js:131,23]",
        "WARN: Condition left of && always false [test/compress/issue-1261.js:132,8]",
        "WARN: Condition always false [test/compress/issue-1261.js:132,8]",
        "WARN: + in boolean context always true [test/compress/issue-1261.js:133,23]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:133,23]",
        "WARN: Condition always true [test/compress/issue-1261.js:133,23]",
        "WARN: + in boolean context always true [test/compress/issue-1261.js:134,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:134,31]",
        "WARN: Condition always true [test/compress/issue-1261.js:134,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:135,23]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:136,24]",
        "WARN: Condition always true [test/compress/issue-1261.js:136,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:137,31]",
        "WARN: Condition always false [test/compress/issue-1261.js:137,8]",
    ]
}
