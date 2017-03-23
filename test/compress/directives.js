class_directives_compression: {
    input: {
        class foo {
            foo() {
                "use strict";
            }
        }
    }
    expect_exact: "class foo{foo(){}}"
}
