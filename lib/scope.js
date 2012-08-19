AST_Scope.DEFMETHOD("figure_out_scope", function(){
    // step 1: handle definitions
    var scope = null;
    var tw = new TreeWalker(function(node, descend){
        if (node instanceof AST_Scope) {
            var save_scope = node.parent_scope = scope;
            scope = node;
            descend.call(node);
            scope = save_scope;
            return true;        // don't descend again in TreeWalker
        }
        if (node instanceof AST_With) {
            for (var s = scope; s; s = s.parent_scope)
                s.uses_with = true;
            return;
        }
        if (node instanceof AST_SymbolDeclaration && !scope.parent_scope) {
            node.global = true;
        }
        if (node instanceof AST_SymbolVar) {
            scope.def_variable(node);
        }
        else if (node instanceof AST_SymbolLambda) {
            scope.def_function(node);
        }
        else if (node instanceof AST_SymbolDefun) {
            scope.parent_scope.def_function(node);
        }
        else if (node instanceof AST_Label) {
            scope.def_label(node);
        }
        else if (node instanceof AST_SymbolCatch) {
            // XXX: this is wrong according to ECMA-262 (12.4).  the
            // `catch` argument name should be visible only inside the
            // catch block.  For a quick fix AST_Catch should inherit
            // from AST_Scope.
            scope.def_variable(node);
        }
        else if (node instanceof AST_SymbolRef) {
            node.scope = scope;
        }
    });
    this.walk(tw);
    // step 2: find back references and eval/with
    var tw = new TreeWalker(function(node){
        if (node instanceof AST_LabelRef) {
            var sym = node.scope.find_label(node);
            if (!sym) throw new Error("Undefined label " + node.name);
            node.reference(sym);
        }
        else if (node instanceof AST_SymbolRef) {
            var sym = node.scope.find_variable(node);
            if (!sym) {
                if (node.name == "eval") {
                    for (var s = scope; s; s = s.parent_scope)
                        s.uses_eval = true;
                }
            } else {
                node.reference(sym);
            }
        }
    });
    this.walk(tw);
});
AST_Scope.DEFMETHOD("find_variable", function(name){
    if (name instanceof AST_Symbol) name = name.name;
    return this.variables[name] ||
        (this.name && this.name.name == name && this.name) ||
        (this.parent_scope && this.parent_scope.find_variable(name));
});
AST_Scope.DEFMETHOD("find_label", function(name){
    if (name instanceof AST_Symbol) name = name.name;
    return this.labels[name];
});
AST_Scope.DEFMETHOD("def_function", function(symbol){
    this.def_variable(symbol);
    this.functions[symbol.name] = symbol;
    symbol.scope = this;
});
AST_Scope.DEFMETHOD("def_variable", function(symbol){
    this.variables[symbol.name] = symbol;
    delete this.functions[symbol.name];
    symbol.scope = this;
});
AST_Scope.DEFMETHOD("def_label", function(symbol){
    this.labels[symbol.name] = symbol;
    symbol.scope = this;
});
