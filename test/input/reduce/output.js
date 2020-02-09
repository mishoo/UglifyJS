var b = 0;

function f0() {
    var expr2 = (0 - 1 - .1 - .1).toString();
    for (var key2 in expr2) {
        --b;
    }
}

var a_1 = f0();

console.log(b);
// output: -19
// minify: -4
// options: {"compress":{"unsafe_math":true},"mangle":false}