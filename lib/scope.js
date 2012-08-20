AST_Scope.DEFMETHOD("figure_out_scope", function(){
    // This does what ast_add_scope did in UglifyJS v1.
    //
    // Part of it could be done at parse time, but it would complicate
    // the parser (and it's already kinda complex).  It's also worth
    // having it separated because we might need to call it multiple
    // times on the same tree.

    // pass 1: setup scope chaining and handle definitions
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
        if (node instanceof AST_SymbolLambda) {
            scope.def_function(node);
        }
        else if (node instanceof AST_SymbolDefun) {
            // Careful here, the scope where this should be defined is
            // the parent scope.  The reason is that we enter a new
            // scope when we encounter the AST_Defun node (which is
            // instanceof AST_Scope) but we get to the symbol a bit
            // later.
            scope.parent_scope.def_function(node);
        }
        else if (node instanceof AST_SymbolVar) {
            scope.def_variable(node);
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

    // pass 2: find back references and eval/with
    var tw = new TreeWalker(function(node){
        if (node instanceof AST_LabelRef) {
            var sym = node.scope.find_label(node);
            if (!sym) throw new Error("Undefined label " + node.name);
            node.reference(sym);
        }
        else if (node instanceof AST_SymbolRef) {
            var sym = node.scope.find_variable(node);
            node.reference(sym);
            if (!sym) {
                if (node.name == "eval") {
                    for (var s = scope; s; s = s.parent_scope)
                        s.uses_eval = true;
                }
            }
        }
    });
    this.walk(tw);
});

AST_Scope.DEFMETHOD("scope_warnings", function(options){
    options = defaults(options, {
        undeclared       : false,
        assign_to_global : true
    });
    var tw = new TreeWalker(function(node){
        if (options.undeclared
            && node instanceof AST_SymbolRef
            && node.undeclared)
        {
            // XXX: this also warns about JS standard names,
            // i.e. Object, Array, parseInt etc.  Should add a list of
            // exceptions.
            AST_Node.warn("Undeclared symbol: {name} [{line},{col}]", {
                name: node.name,
                line: node.start.line,
                col: node.start.col
            });
        }
        if (options.assign_to_global
            && node instanceof AST_Assign
            && node.left instanceof AST_SymbolRef
            && (node.left.undeclared
                || (node.left.symbol.global
                    && node.left.scope !== node.left.symbol.scope)))
        {
            AST_Node.warn("{msg}: {name} [{line},{col}]", {
                msg: node.left.undeclared ? "Accidental global?" : "Assignment to global",
                name: node.left.name,
                line: node.start.line,
                col: node.start.col
            });
        }
    });
    this.walk(tw);
});

AST_SymbolRef.DEFMETHOD("reference", function(symbol) {
    if (symbol) {
        this.symbol = symbol;
        var origin = symbol.scope;
        symbol.references.push(this);
        for (var s = this.scope; s; s = s.parent_scope) {
            push_uniq(s.enclosed, symbol);
            if (s === origin) break;
        }
    } else {
        this.undeclared = true;
        for (var s = this.scope; s; s = s.parent_scope) {
            push_uniq(s.enclosed, this);
        }
    }
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
    symbol.global = !this.parent_scope;
    this.variables[symbol.name] = symbol;
    delete this.functions[symbol.name];
    symbol.scope = this;
});

AST_Scope.DEFMETHOD("def_label", function(symbol){
    this.labels[symbol.name] = symbol;
    symbol.scope = this;
});

AST_Scope.DEFMETHOD("next_mangled", function(for_label){
    var ext = this.enclosed, n = ext.length;
    out: for (;;) {
        var m = base54(for_label
                       ? (++this.lname)
                       : (++this.cname));

        if (!is_identifier(m)) continue; // skip over "do"

        // labels are easy, since they can't be referenced from nested
        // scopes.  XXX: not sure that will be the case when the `let`
        // keyword is to be supported.
        if (for_label) return m;

        // if it's for functions or variables, we must ensure that the
        // mangled name does not shadow a name from some parent scope
        // that is referenced in this or in inner scopes.
        for (var i = n; --i >= 0;) {
            var sym = ext[i];
            var name = sym.mangled_name || sym.name;
            if (m == name) continue out;
        }

        return m;
    }
});

AST_SymbolDeclaration.DEFMETHOD("mangle", function(){
    if (!this.global)
        this.mangled_name = this.scope.next_mangled(false);
});

AST_Label.DEFMETHOD("mangle", function(){
    this.mangled_name = this.scope.next_mangled(true);
});

AST_Scope.DEFMETHOD("mangle_names", function(){
    var tw = new TreeWalker(function(node){
        // We only need to mangle declarations.  Special logic wired
        // into the code generator will display the mangled name if
        // it's present (and for AST_SymbolRef-s it'll use the mangled
        // name of the AST_SymbolDeclaration that it points to).
        if (node instanceof AST_SymbolDeclaration) {
            node.mangle();
        }
    });
    this.walk(tw);
});
