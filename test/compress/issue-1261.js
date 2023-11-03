pure_function_calls: {
    options = {
        annotations: true,
        booleans: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        negate_iife: true,
        side_effects: true,
        unused: true,
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
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:3,8]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:3,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:16,37]",
        "WARN: Dropping unused variable iife2 [test/compress/issue-1261.js:16,16]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:14,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:24,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:25,31]",
    ]
}

pure_function_calls_toplevel: {
    options = {
        annotations: true,
        booleans: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        negate_iife: true,
        side_effects: true,
        toplevel: true,
        unused: true,
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

        // pure top-level calls will be dropped regardless of the leading comments position
        var MyClass = /*#__PURE__*//*@class*/(function(){
            function MyClass() {}
            MyClass.prototype.method = function() {};
            return MyClass;
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
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:3,8]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:3,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:16,37]",
        "WARN: Dropping unused variable iife2 [test/compress/issue-1261.js:16,16]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:14,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:31,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:32,31]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:8,33]",
        "WARN: Dropping unused variable iife1 [test/compress/issue-1261.js:8,12]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:24,45]",
        "WARN: Dropping unused variable MyClass [test/compress/issue-1261.js:24,12]",
    ]
}

should_warn: {
    options = {
        annotations: true,
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
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:1,61]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:1,23]",
        "WARN: Dropping side-effect-free statement [test/compress/issue-1261.js:1,23]",
        "WARN: Boolean || always true [test/compress/issue-1261.js:2,23]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:2,23]",
        "WARN: Condition always true [test/compress/issue-1261.js:2,23]",
        "WARN: Condition left of || always true [test/compress/issue-1261.js:3,8]",
        "WARN: Condition always true [test/compress/issue-1261.js:3,8]",
        "WARN: Boolean && always false [test/compress/issue-1261.js:4,23]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:4,23]",
        "WARN: Condition always false [test/compress/issue-1261.js:4,23]",
        "WARN: Condition left of && always false [test/compress/issue-1261.js:5,8]",
        "WARN: Condition always false [test/compress/issue-1261.js:5,8]",
        "WARN: + in boolean context always true [test/compress/issue-1261.js:6,23]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:6,23]",
        "WARN: Condition always true [test/compress/issue-1261.js:6,23]",
        "WARN: + in boolean context always true [test/compress/issue-1261.js:7,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:7,31]",
        "WARN: Condition always true [test/compress/issue-1261.js:7,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:8,23]",
        "WARN: Condition always true [test/compress/issue-1261.js:9,8]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:9,24]",
        "WARN: Dropping __PURE__ call [test/compress/issue-1261.js:10,31]",
        "WARN: Condition always false [test/compress/issue-1261.js:10,8]",
    ]
}
