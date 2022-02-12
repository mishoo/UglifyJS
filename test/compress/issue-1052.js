multiple_functions: {
    options = {
        hoist_funs: false,
        if_return: true,
    }
    input: {
        (function() {
            if (!window)
                return;
            function f() {}
            function g() {}
        })();
    }
    expect: {
        (function() {
            // NOTE: other compression steps will reduce this
            // down to just `window`.
            if (!window);
            function f() {}
            function g() {}
        })();
    }
}

single_function: {
    options = {
        hoist_funs: false,
        if_return: true,
    }
    input: {
        (function() {
            if (!window)
                return;
            function f() {}
        })();
    }
    expect: {
        (function() {
            if (!window);
            function f() {}
        })();
    }
}

deeply_nested: {
    options = {
        hoist_funs: false,
        if_return: true,
    }
    input: {
        (function() {
            if (!window)
                return;
            function f() {}
            function g() {}
            if (!document)
                return;
            function h() {}
        })();
    }
    expect: {
        (function() {
            // NOTE: other compression steps will reduce this
            // down to just `window`.
            if (!window);
            else if (!document);
            function f() {}
            function g() {}
            function h() {}
        })();
    }
}

not_hoisted_when_already_nested: {
    options = {
        hoist_funs: false,
        if_return: true,
    }
    input: {
        (function() {
            if (!window)
                return;
            if (foo) function f() {}
        })();
    }
    expect: {
        (function() {
            if (!window);
            else if (foo)
                function f() {}
        })();
    }
}

defun_if_return: {
    options = {
        hoist_funs: false,
        if_return: true,
    }
    input: {
        function e() {
            function f() {}
            if (!window)
                return;
            else
                function g() {}
            function h() {}
        }
    }
    expect: {
        function e() {
            function f() {}
            if (!window);
            else
                function g() {}
            function h() {}
        }
    }
}

defun_hoist_funs: {
    options = {
        hoist_funs: true,
        if_return: true,
    }
    input: {
        function e() {
            function f() {}
            if (!window)
                return;
            else
                function g() {}
            function h() {}
        }
    }
    expect: {
        function e() {
            function f() {}
            function g() {}
            function h() {}
            if (!window);
        }
    }
}

defun_else_if_return: {
    options = {
        hoist_funs: false,
        if_return: true,
    }
    input: {
        function e() {
            function f() {}
            if (window)
                function g() {}
            else
                return;
            function h() {}
        }
    }
    expect: {
        function e() {
            function f() {}
            if (window)
                function g() {}
            function h() {}
        }
    }
}
