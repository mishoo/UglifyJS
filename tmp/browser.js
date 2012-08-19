var func = function TEST () {
    
};

console.time("parse");
var ast = parse(func.toString());
console.timeEnd("parse");



ast.walk({
    _visit: function(node, descend) {
        console.log(node);
        console.log(node.TYPE, ":", node.start.pos);
        if (descend) descend.call(node);
    }
});
