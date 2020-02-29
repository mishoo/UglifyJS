console.log(function f(a) {
    ({
        set p(v) {
            f++;
        }
    });
    return f.length;
}());
// output: 1
// 
// minify: 0
// 
// options: {
//   "compress": {
//     "keep_fargs": false,
//     "unsafe": true
//   },
//   "mangle": false
// }