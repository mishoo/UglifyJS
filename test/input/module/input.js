console.log(function() {
    function sum(...params) {
        return this || arguments[0] + arguments[1];
    }
    return sum(sum(1, 3), 5);
}());
console.log(function() {
    "use strict";
    function sum(...params) {
        return this || arguments[0] + arguments[1];
    }
    return sum(sum(2, 4), 6);
}());