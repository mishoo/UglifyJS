// (beautified)
(function f(a) {
    do {
        console.log(f.length);
    } while (console.log(f += 0));
})();
// output: 1
// function(){}0
// 
// minify: 0
// function(){}0
// 
// options: {
//   "compress": {
//     "keep_fargs": false,
//     "unsafe": true
//   },
//   "mangle": false
// }