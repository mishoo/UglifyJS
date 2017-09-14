function foo() {
    return function() {
        console.log("PASS");
    };
}

(function() {
    var f = foo();
    f();
})();
