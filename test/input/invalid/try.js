function f() {
    try {} catch (eval) {}
}

function g() {
    "use strict";
    try {} catch (eval) {}
}
