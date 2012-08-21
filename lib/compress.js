// The layout of the compressor follows the code generator (see
// output.js).  Basically each node will have a "squeeze" method
// that will apply all known compression rules for that node, and
// return a new node (or the original node if there was no
// compression).  We can't quite use the TreeWalker for this
// because it's too simplistic.

// The Compressor object is for storing the options and for
// maintaining various internal state that might be useful for
// squeezing nodes.

function Compressor(options) {
    options = defaults(options, {
        sequences     : true,
        dead_code     : true,
        keep_comps    : true,
        drop_debugger : true,
        unsafe        : true
    });
    var stack = [];
    return {
        option    : function(key) { return options[key] },
        push_node : function(node) { stack.push(node) },
        pop_node  : function() { return stack.pop() },
        stack     : function() { return stack },
        parent    : function(n) {
            return stack[stack.length - 2 - (n || 0)];
        }
    };
};

(function(){

    AST_Node.DEFMETHOD("squeeze", function(){
        return this;
    });

    AST_Token.DEFMETHOD("squeeze", function(){
        return this;
    });

    function SQUEEZE(nodetype, squeeze) {
        nodetype.DEFMETHOD("squeeze", function(compressor){
            compressor.push_node(this);
            var new_node = squeeze(this, compressor);
            compressor.pop_node();
            return new_node || this;
        });
    };

    function do_list(array, compressor) {
        return MAP(array, function(node){
            if (node instanceof Array) {
                sys.debug(node.map(function(node){
                    return node.TYPE;
                }).join("\n"));
            }
            return node.squeeze(compressor);
        });
    };

    SQUEEZE(AST_Debugger, function(self, compressor){
        if (compressor.option("drop_debugger"))
            return new AST_EmptyStatement(self);
    });

    SQUEEZE(AST_LabeledStatement, function(self, compressor){
        self = self.clone();
        self.statement = self.statement.squeeze(compressor);
        return self.label.references.length == 0 ? self.statement : self;
    });

    SQUEEZE(AST_Statement, function(self, compressor){
        self = self.clone();
        self.body = self.body.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_BlockStatement, function(self, compressor){
        self = self.clone();
        self.body = do_list(self.body, compressor);
        return self;
    });

    SQUEEZE(AST_EmptyStatement, function(self, compressor){
        if (compressor.parent() instanceof AST_BlockStatement)
            return MAP.skip;
    });

    SQUEEZE(AST_DWLoop, function(self, compressor){
        self = self.clone();
        self.condition = self.condition.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_For, function(self, compressor){
        self = self.clone();
        if (self.init) self.init = self.init.squeeze(compressor);
        if (self.condition) self.condition = self.condition.squeeze(compressor);
        if (self.step) self.step = self.step.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_ForIn, function(self, compressor){
        self = self.clone();
        self.init = self.init.squeeze(compressor);
        self.object = self.object.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_With, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
    });

    SQUEEZE(AST_Exit, function(self, compressor){
        self = self.clone();
        if (self.value) self.value = self.value.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_LoopControl, function(self, compressor){
        self = self.clone();
        if (self.label) self.label = self.label.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_If, function(self, compressor){
        self = self.clone();
        self.condition = self.condition.squeeze(compressor);
        self.consequent = self.consequent.squeeze(compressor);
        if (self.alternative)
            self.alternative = self.alternative.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Switch, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Case, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        self.body = do_list(self.body, compressor);
        return self;
    });

    SQUEEZE(AST_Try, function(self, compressor){
        self = self.clone();
        self.btry = self.btry.squeeze(compressor);
        if (self.bcatch) self.bcatch = self.bcatch.squeeze(compressor);
        if (self.bfinally) self.bfinally = self.bfinally.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Definitions, function(self, compressor){
        self = self.clone();
        self.definitions = do_list(self.definitions, compressor);
        return self;
    });

    SQUEEZE(AST_VarDef, function(self, compressor){
        self = self.clone();
        if (self.value) self.value = self.value.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Lambda, function(self, compressor){
        self = self.clone();
        if (self.name) self.name = self.name.squeeze(compressor);
        self.argnames = do_list(self.argnames, compressor);
        self.body = self.body.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Call, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        self.args = do_list(self.args, compressor);
        return self;
    });

    SQUEEZE(AST_Seq, function(self, compressor){
        self = self.clone();
        self.first = self.first.squeeze(compressor);
        self.second = self.second.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Dot, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Sub, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        self.property = self.property.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Unary, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Binary, function(self, compressor){
        self = self.clone();
        self.left = self.left.squeeze(compressor);
        self.right = self.right.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Conditional, function(self, compressor){
        self = self.clone();
        self.condition = self.condition.squeeze(compressor);
        self.consequent = self.consequent.squeeze(compressor);
        self.alternative = self.alternative.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Array, function(self, compressor){
        self = self.clone();
        self.elements = do_list(self.elements, compressor);
        return self;
    });

    SQUEEZE(AST_Object, function(self, compressor){
        self = self.clone();
        self.properties = do_list(self.properties, compressor);
        return self;
    });

    SQUEEZE(AST_ObjectProperty, function(self, compressor){
        self = self.clone();
        self.value = self.value.squeeze(compressor);
        return self;
    });

})();
