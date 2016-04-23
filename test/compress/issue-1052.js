hoist_funs_when_handling_if_return_rerversal: {
    options = { if_return: true, hoist_funs: false };
    input: {
        "use strict";

        ( function() {
            if ( !window ) {
                return;
            }

            function f() {}
            function g() {}
        } )();
    }
    expect: {
        "use strict";

        ( function() {
            function f() {}
            function g() {}

            // NOTE: other compression steps will reduce this
            // down to just `window`.
            if ( window );
        } )();
    }
}
