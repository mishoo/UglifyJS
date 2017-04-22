function f(x) {
    delete 42;
    delete (0, x);
    delete null;
    delete x;
}

function g(x) {
    "use strict";
    delete 42;
    delete (0, x);
    delete null;
    delete x;
}
