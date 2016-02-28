var UglifyJS = require("..");
var assert = require("assert");

var alphabet = "abcdefghijklmnop".split("");
var perms = [];
var linesOfCode = [];
var startTime = new Date().getTime();

console.log("--- Strict mode mangling tests");

function permute(text) {
    perms.push(text);
    if(text.length < 4) { 
        for(var i = 0; i < alphabet.length; i++) {
            permute(text + alphabet[i]);
        }
    }
}
permute("");

var permuteTime = new Date().getTime() - startTime;

console.log("  - Generated perms in " + permuteTime + "ms")
console.log("  - Testing with " + perms.length + " identifiers");
console.log("  - Mangling (this will take some time)...");

function getCode(withStrictMode) {

    linesOfCode = "        function outer() {\n";
    if (!!withStrictMode) {
        linesOfCode += "        \"use strict\";\n";
    }
    for (var i in perms) {
        linesOfCode += "            var _" + perms[i] + " = 1;\n"
    }
    linesOfCode += "            function inner() {\n";       
    for (var i in perms) {
        linesOfCode += "                 _" + perms[i] + "++;\n";
    }
    linesOfCode += "            }\n";
    linesOfCode += "        }\n";

    return linesOfCode;

}

module.exports = function () {
    
    var startManglingTime = new Date().getTime();
    var mangled_code = mangle(getCode(false));
    
    console.log("  - Found 'var let' at char: " + mangled_code.indexOf('var let'));
    console.log("  - Mangled code with no strict mode in " + Math.floor((new Date().getTime() - startManglingTime)/ 1000) + "s");
    assert(mangled_code.indexOf('var let') >= 0, "No 'var let' produced in the mangled code outside strict mode.");  

    startManglingTime = new Date().getTime();
    var mangled_strict_code = mangle(getCode(true));   
    console.log("  - This should be -1: " + mangled_strict_code.indexOf('var let'));
    console.log("  - Mangled code with strict mode in " + Math.floor((new Date().getTime() - startManglingTime)/ 1000) + "s");
    assert(mangled_strict_code.indexOf('var let') === -1, "A 'var let' statement was produced inside strict mode.");
    
}

function mangle(js) {
    var stream = UglifyJS.OutputStream();
    var parsed = UglifyJS.parse(js);
    parsed.figure_out_scope();
    parsed.mangle_names();
    parsed.print(stream);
    return stream.toString();
}

// Run standalone
if (module.parent === null) {
    module.exports();
}

