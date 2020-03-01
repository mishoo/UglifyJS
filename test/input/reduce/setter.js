console.log(function f(a) {
    ({
        set p(v) {
            f++;
        }
    });
    return f.length;
}());
