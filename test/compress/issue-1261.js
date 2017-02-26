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
