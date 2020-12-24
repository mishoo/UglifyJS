// (beautified)
({
    set p(v) {
        console.log(1 + .1 + .1);
    }
}).p = 0;
// output: 1.2000000000000002
// 
// minify: 1.2
// 
// options: {
//   "compress": {
//     "unsafe_math": true
//   },
//   "mangle": false
// }