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
