// (beautified)
try {
    1 in 0;
} catch ({
    message: message
}) {
    console.log(message);
}
// output: Cannot use 'in' operator to search for '1' in 0
// 
// minify: Cannot use 'in' operator to search for '0' in 0
// 
// options: {
//   "mangle": false
// }