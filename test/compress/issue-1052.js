multiple_functions: {
    options = { if_return: true, hoist_funs: false };
    input: {
        ( function() {
            if ( !window ) {
                return;
            }

            function f() {}
            function g() {}
        } )();
    }
    expect: {
        ( function() {
            function f() {}
            function g() {}

            // NOTE: other compression steps will reduce this
            // down to just `window`.
            if ( window );
        } )();
    }
}

single_function: {
    options = { if_return: true, hoist_funs: false };
    input: {
        ( function() {
            if ( !window ) {
                return;
            }

            function f() {}
        } )();
    }
    expect: {
        ( function() {
            function f() {}

            if ( window );
        } )();
    }
}

deeply_nested: {
    options = { if_return: true, hoist_funs: false };
    input: {
        ( function() {
            if ( !window ) {
                return;
            }

            function f() {}
            function g() {}

            if ( !document ) {
                return;
            }

            function h() {}
        } )();
    }
    expect: {
        ( function() {
            function f() {}
            function g() {}

            function h() {}

            // NOTE: other compression steps will reduce this
            // down to just `window`.
            if ( window )
                if (document);
        } )();
    }
}

not_hoisted_when_already_nested: {
    options = { if_return: true, hoist_funs: false };
    input: {
        ( function() {
            if ( !window ) {
                return;
            }

            if ( foo ) function f() {}

        } )();
    }
    expect: {
        ( function() {
            if ( window )
                if ( foo ) function f() {}
        } )();
    }
}
