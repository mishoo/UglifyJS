// (beautified)
var o = {};

[ o[1 + .1 + .1] ] = [];

console.log(o);
// output: { '1.2000000000000002': undefined }
// 
// minify: { '1.2': undefined }
// 
// options: {
//   "compress": {
//     "unsafe_math": true
//   },
//   "mangle": false,
//   "validate": true
// }