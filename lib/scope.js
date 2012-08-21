AST_Toplevel.DEFMETHOD("figure_out_scope", function(){
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
            // from AST_Scope.  Keeping it this way because of IE,
            // which doesn't obey the standard. (it introduces the
            // identifier in the enclosing scope)
            scope.def_variable(node);
        }
        else if (node instanceof AST_SymbolRef) {
            node.scope = scope;
        }
        if (node instanceof AST_LabelRef) {
            var sym = scope.find_label(node);
            if (!sym) throw new Error("Undefined label " + node.name);
            node.reference(sym);
        }
    });
    this.walk(tw);

    // pass 2: find back references and eval/with
    var tw = new TreeWalker(function(node){
        if (node instanceof AST_SymbolRef) {
            var sym = node.scope.find_variable(node);
            node.reference(sym);
            if (!sym) {
                if (node.name == "eval") {
                    for (var s = node.scope; s; s = s.parent_scope)
                        s.uses_eval = true;
                }
            }
        }
    });
    this.walk(tw);
});

AST_Toplevel.DEFMETHOD("scope_warnings", function(options){
    options = defaults(options, {
        undeclared       : false, // this makes a lot of noise
        unreferenced     : true,
        assign_to_global : true,
        eval             : true
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
        if (options.eval
            && node instanceof AST_SymbolRef
            && node.undeclared
            && node.name == "eval") {
            AST_Node.warn("Eval is used [{line},{col}]", node.start);
        }
        if (options.unreferenced
            && node instanceof AST_SymbolDeclaration
            && node.unreferenced()) {
            AST_Node.warn("{type} {name} is declared but not referenced [{line},{col}]", {
                type: node instanceof AST_Label ? "Label" : "Symbol",
                name: node.name,
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
    this.functions[symbol.name] = symbol;
    this.def_variable(symbol);
});

AST_Scope.DEFMETHOD("def_variable", function(symbol){
    symbol.global = !this.parent_scope;
    var existing = this.variables[symbol.name];
    if (!existing) {
        this.variables[symbol.name] = symbol;
    } else {
        symbol.uniq = existing;
    }
    symbol.scope = this;
});

AST_Scope.DEFMETHOD("def_label", function(symbol){
    this.labels[symbol.name] = symbol;
    symbol.scope = this;
});

AST_Scope.DEFMETHOD("next_mangled", function(for_label){
    var ext = this.enclosed, n = ext.length;
    out: while (true) {
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
    if (this.uniq) {
        this.uniq.mangle();
    }
    else if (!(this.global
               || this.scope.uses_eval
               || this.scope.uses_with
               || this.mangled_name)) {
        this.mangled_name = this.scope.next_mangled(this instanceof AST_Label);
    }
});

AST_SymbolDeclaration.DEFMETHOD("unreferenced", function(){
    return this.definition().references.length == 0;
});

AST_SymbolDeclaration.DEFMETHOD("definition", function(){
    return this.uniq || this;
});

AST_Toplevel.DEFMETHOD("mangle_names", function(){
    var tw = new TreeWalker(function(node){
        // We only need to mangle declarations.  Special logic wired
        // into the code generator will display the mangled name if
        // it's present (and for AST_SymbolRef-s it'll use the mangled
        // name of the AST_SymbolDeclaration that it points to).
        if (node instanceof AST_Scope) {
            var a = node.variables;
            for (var i in a) if (HOP(a, i)) {
                a[i].mangle();
            }
            var a = node.labels;
            for (var i in a) if (HOP(a, i)) {
                a[i].mangle();
            }
        }
    });
    this.walk(tw);
});
