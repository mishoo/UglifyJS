console.log(function(undefined) {
    return undefined[function() {
        {}
    }] || 1 + .1 + .1;
}(42));
