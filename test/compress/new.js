new_statement: {
    input: {
        new x(1);
        new x(1)(2);
        new x(1)(2)(3);
        new new x(1);
        new new x(1)(2);
        new (new x(1))(2);
        (new new x(1))(2);
    }
    expect_exact: "new x(1);new x(1)(2);new x(1)(2)(3);new new x(1);new new x(1)(2);new new x(1)(2);(new new x(1))(2);"
}

new_statements_2: {
    input: {
        new x;
        new new x;
        new new new x;
        new true;
        new (0);
        new (!0);
        new (bar = function(foo) {this.foo=foo;})(123);
        new (bar = function(foo) {this.foo=foo;})();
    }
    expect_exact: "new x;new(new x);new(new(new x));new true;new 0;new(!0);new(bar=function(foo){this.foo=foo})(123);new(bar=function(foo){this.foo=foo});"
}

new_statements_3: {
    input: {
        new (function(foo){this.foo=foo;})(1);
        new (function(foo){this.foo=foo;})();
        new (function test(foo){this.foo=foo;})(1);
        new (function test(foo){this.foo=foo;})();
    }
    expect_exact: "new function(foo){this.foo=foo}(1);new function(foo){this.foo=foo};new function test(foo){this.foo=foo}(1);new function test(foo){this.foo=foo};"
}

new_with_rewritten_true_value: {
    options = { booleans: true }
    input: {
        new true;
    }
    expect_exact: "new(!0);"
}

new_with_many_parameters: {
    input: {
        new foo.bar("baz");
        new x(/123/, 456);
    }
    expect_exact: 'new foo.bar("baz");new x(/123/,456);'
}
