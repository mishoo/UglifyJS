asm_mixed: {
    options = {
        sequences     : true,
        properties    : true,
        dead_code     : true,
        drop_debugger : true,
        conditionals  : true,
        comparisons   : true,
        evaluate      : true,
        booleans      : true,
        loops         : true,
        unused        : true,
        hoist_funs    : true,
        keep_fargs    : true,
        keep_fnames   : false,
        hoist_vars    : true,
        if_return     : true,
        join_vars     : true,
        side_effects  : true,
        negate_iife   : true
    };
    input: {
        // adapted from http://asmjs.org/spec/latest/
        function asm_GeometricMean(stdlib, foreign, buffer) {
          "use asm";
          var exp = stdlib.Math.exp;
          var log = stdlib.Math.log;
          var values = new stdlib.Float64Array(buffer);
          function logSum(start, end) {
            start = start|0;
            end = end|0;
            var sum = 0.0, p = 0, q = 0;
            // asm.js forces byte addressing of the heap by requiring shifting by 3
            for (p = start << 3, q = end << 3; (p|0) < (q|0); p = (p + 8)|0) {
              sum = sum + +log(values[p>>3]);
            }
            return +sum;
          }
          function geometricMean(start, end) {
            start = start|0;
            end = end|0;
            return +exp(+logSum(start, end) / +((end - start)|0));
          }
          return { geometricMean: geometricMean };
        }
        function no_asm_GeometricMean(stdlib, foreign, buffer) {
          var exp = stdlib.Math.exp;
          var log = stdlib.Math.log;
          var values = new stdlib.Float64Array(buffer);
          function logSum(start, end) {
            start = start|0;
            end = end|0;
            var sum = 0.0, p = 0, q = 0;
            // asm.js forces byte addressing of the heap by requiring shifting by 3
            for (p = start << 3, q = end << 3; (p|0) < (q|0); p = (p + 8)|0) {
              sum = sum + +log(values[p>>3]);
            }
            return +sum;
          }
          function geometricMean(start, end) {
            start = start|0;
            end = end|0;
            return +exp(+logSum(start, end) / +((end - start)|0));
          }
          return { geometricMean: geometricMean };
        }
    }
    expect: {
        function asm_GeometricMean(stdlib, foreign, buffer) {
            "use asm";
            var exp = stdlib.Math.exp;
            var log = stdlib.Math.log;
            var values = new stdlib.Float64Array(buffer);
            function logSum(start, end) {
                start = start | 0;
                end = end | 0;
                var sum = 0.0, p = 0, q = 0;
                for (p = start << 3, q = end << 3; (p | 0) < (q | 0); p = p + 8 | 0) {
                    sum = sum + +log(values[p >> 3]);
                }
                return +sum;
            }
            function geometricMean(start, end) {
                start = start | 0;
                end = end | 0;
                return +exp(+logSum(start, end) / +(end - start | 0));
            }
            return { geometricMean: geometricMean };
        }
        function no_asm_GeometricMean(stdlib, foreign, buffer) {
            function logSum(start, end) {
                start |= 0, end |= 0;
                var sum = 0, p = 0, q = 0;
                for (p = start << 3, q = end << 3; (0 | p) < (0 | q); p = p + 8 | 0) sum += +log(values[p >> 3]);
                return +sum;
            }
            function geometricMean(start, end) {
                return start |= 0, end |= 0, +exp(+logSum(start, end) / +(end - start | 0));
            }
            var exp = stdlib.Math.exp, log = stdlib.Math.log, values = new stdlib.Float64Array(buffer);
            return { geometricMean: geometricMean };
        }
    }
}

asm_toplevel: {
    options = {}
    input: {
        "use asm";
        0.0;
        function f() {
            0.0;
            (function(){
                0.0;
            });
        }
        0.0;
    }
    expect_exact: '"use asm";0.0;function f(){0.0;(function(){0.0})}0.0;'
}

asm_function_expression: {
    options = {}
    input: {
        0.0;
        var a = function() {
            "use asm";
            0.0;
        }
        function f() {
            0.0;
            return function(){
                "use asm";
                0.0;
            }
            0.0;
        }
        0.0;
    }
    expect_exact: '0;var a=function(){"use asm";0.0};function f(){0;return function(){"use asm";0.0};0}0;'
}

asm_nested_functions: {
    options = {}
    input: {
        0.0;
        function a() {
            "use asm";
            0.0;
        }
        0.0;
        function b() {
            0.0;
            function c(){
                "use asm";
                0.0;
            }
            0.0;
            function d(){
                0.0;
            }
            0.0;
        }
        0.0;
    }
    expect_exact: '0;function a(){"use asm";0.0}0;function b(){0;function c(){"use asm";0.0}0;function d(){0}0}0;'
}
