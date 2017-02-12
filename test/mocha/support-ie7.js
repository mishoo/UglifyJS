var assert = require("assert");
var uglify = require("../../");

describe("support_ie7", function (){
    //solves issue https://github.com/mishoo/UglifyJS2/issues/1039
    it ("When support_ie7 is true, should treat the catch parameter as a global parameter", function() {
        var ast = uglify.parse(                "function a(b){\
                    try {\
                        throw 'Stuff';\
                    } catch (e) {\
                        console.log('caught: ' + undefined);\
                    }\
                    console.log('undefined is ' + undefined);\
                    return b === undefined;\
                };");
        ast.figure_out_scope({support_ie7: true});
        assert.equal(ast.variables.has("e"), true);
    });
});
