generators: {
    input: {
        function* fn() {};
    }
    expect_exact: "function*fn(){}"
}

generators_yield: {
    input: {
      function* fn() {
        yield remote();
      }
    }
    expect_exact: "function*fn(){yield remote()}"
}

generators_yield_assign: {
    input: {
      function* fn() {
          var x = {};
          x.prop = yield 5;
      }
    }
    expect_exact: "function*fn(){var x={};x.prop=yield 5}"
}

generator_yield_undefined: {
    input: {
        function* fn() {
            yield;
        }
    }
    expect_exact: "function*fn(){yield}"
}

yield_optimize_expression: {
    options = {
    }
    input: {
        function* f1() { yield; }
        function* f2() { yield undefined; }
        function* f3() { yield null; }
        function* f4() { yield* undefined; }
    }
    expect: {
        function* f1() { yield }
        function* f2() { yield; }
        function* f3() { yield null; }
        function* f4() { yield* void 0; }
    }
}

yield_statements: {
    input: {
        function* fn() {
            var a = (yield 1) + (yield 2);
            var b = (yield 3) === (yield 4);
            var c = (yield 5) << (yield 6);
            var d = yield 7;
            var e = (yield 8) ? yield 9 : yield 10;
            var f = -(yield 11);
        }
    }
    expect_exact: "function*fn(){var a=(yield 1)+(yield 2);var b=(yield 3)===(yield 4);var c=(yield 5)<<(yield 6);var d=yield 7;var e=(yield 8)?yield 9:yield 10;var f=-(yield 11)}"
}

yield_as_identifier_in_function_in_generator: {
    input: {
        var g = function*() {
            function h() {
                yield = 1;
            }
        };
    }
    expect: {
        var g = function*() {
            function h() {
                yield = 1;
            }
        };
    }
}

yield_before_punctuators: {
    input: {
        iter = (function*() {
            assignmentResult = [ x = yield ] = value;
        })();
        function* g1() { (yield) }
        function* g2() { [yield] }
        function* g3() { return {yield} } // Added return to avoid {} drop
        function* g4() { yield, yield; }
        function* g5() { (yield) ? yield : yield; }
    }
    expect: {
        iter = (function*() {
            assignmentResult = [ x = yield ] = value;
        })();
        function* g1() { (yield) }
        function* g2() { [yield] }
        function* g3() { return {yield} }
        function* g4() { yield, yield; }
        function* g5() { (yield) ? yield : yield; }
    }
}

yield_as_identifier_outside_strict_mode: {
    input: {
        import yield from "bar";
        yield = 123;
        while (true) {
            yield:
            for(;;) break yield;

            foo();
        }
        while (true)
            yield: for(;;) continue yield;
        function yield(){}
        function foo(...yield){}
        try { new Error("") } catch (yield) {}
        var yield = "foo";
    }
    expect: {
        import yield from "bar";
        yield = 123;
        while (true) {
            yield:
            for(;;) break yield;

            foo();
        }
        while (true)
            yield: for(;;) continue yield;
        function yield(){}
        function foo(...yield){}
        try { new Error("") } catch (yield) {}
        var yield = "foo";
    }
}

empty_generator_as_parameter_with_side_effects: {
    options = {
        side_effects: true
    }
    input: {
        var GeneratorPrototype = Object.getPrototypeOf(
          Object.getPrototypeOf(function*() {}())
        );
        evaluate(GeneratorPrototype);
    }
    expect_exact: "var GeneratorPrototype=Object.getPrototypeOf(Object.getPrototypeOf(function*(){}()));evaluate(GeneratorPrototype);"
}

empty_generator_as_parameter_without_side_effects: {
    options = {
        side_effects: false
    }
    input: {
        var GeneratorPrototype = Object.getPrototypeOf(
          Object.getPrototypeOf(function*() {}())
        );
        evaluate(GeneratorPrototype);
    }
    expect_exact: "var GeneratorPrototype=Object.getPrototypeOf(Object.getPrototypeOf(function*(){}()));evaluate(GeneratorPrototype);"
}