// (beautified)
try {
    1 in 0;
} catch (message) {
    console.log(message);
}
// output: TypeError: Cannot use 'in' operator to search for '1' in 0
// 
// minify: TypeError: Cannot use 'in' operator to search for '0' in 0
// 
// options: {
//   "mangle": false
// }