/***********************************************************************

  A JavaScript tokenizer / parser / beautifier / compressor.
  https://github.com/mishoo/UglifyJS2

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2012 (c) Mihai Bazon <mihai.bazon@gmail.com>

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

        * Redistributions of source code must retain the above
          copyright notice, this list of conditions and the following
          disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials
          provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
    EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
    OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
    THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    SUCH DAMAGE.

 ***********************************************************************/

AST_Toplevel.DEFMETHOD("figure_out_scope", function(){
    // This does what ast_add_scope did in UglifyJS v1.
    //
    // Part of it could be done at parse time, but it would complicate
    // the parser (and it's already kinda complex).  It's also worth
    // having it separated because we might need to call it multiple
    // times on the same tree.

    // pass 1: setup scope chaining and handle definitions
    var scope = this.parent_scope;
    var labels = {};
    var tw = new TreeWalker(function(node, descend){
        if (node instanceof AST_Scope) {
            node.init_scope_vars();
            var save_scope = node.parent_scope = scope;
            scope = node;
            descend();
            scope = save_scope;
            return true;        // don't descend again in TreeWalker
        }
        if (node instanceof AST_With) {
            for (var s = scope; s; s = s.parent_scope)
                s.uses_with = true;
            return;
        }
        if (node instanceof AST_LabeledStatement) {
            var l = node.label;
            if (labels[l.name])
                throw new Error(string_template("Label {name} defined twice", l));
            labels[l.name] = l;
            descend();
            delete labels[l.name];
            return true;        // no descend again
        }
        if (node instanceof AST_SymbolDeclaration) {
            node.init_scope_vars();
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
            var sym = labels[node.name];
            if (!sym) throw new Error("Undefined label " + node.name);
            node.reference(sym);
        }
    });
    this.walk(tw);

    // pass 2: find back references and eval
    var func = null;
    var tw = new TreeWalker(function(node, descend){
        if (node instanceof AST_Lambda) {
            var prev_func = func;
            func = node;
            descend();
            func = prev_func;
            return true;
        }
        if (node instanceof AST_SymbolRef) {
            var sym = node.scope.find_variable(node);
            node.reference(sym);
            if (!sym) {
                if (node.name == "eval") {
                    for (var s = node.scope;
                         s && !s.uses_eval;
                         s = s.parent_scope) s.uses_eval = true;
                }
                if (node.name == "arguments") {
                    func.uses_arguments = true;
                }
            }
        }
    });
    this.walk(tw);
});

AST_Scope.DEFMETHOD("init_scope_vars", function(){
    this.variables = {};      // map name to AST_SymbolVar (variables defined in this scope; includes functions)
    this.functions = {};      // map name to AST_SymbolDefun (functions defined in this scope)
    this.uses_with = false;   // will be set to true if this or some nested scope uses the `with` statement
    this.uses_eval = false;   // will be set to true if this or nested scope uses the global `eval`
    this.parent_scope = null; // the parent scope
    this.enclosed = [];       // a list of variables from this or outer scope(s) that are referenced from this or inner scopes
    this.cname = -1;          // the current index for mangling functions/variables
});

AST_Lambda.DEFMETHOD("init_scope_vars", function(){
    AST_Scope.prototype.init_scope_vars.call(this);
    this.uses_arguments = false;
});

AST_SymbolDeclaration.DEFMETHOD("init_scope_vars", function(){
    this.references = [];
});

AST_Toplevel.DEFMETHOD("scope_warnings", function(options){
    options = defaults(options, {
        undeclared       : false, // this makes a lot of noise
        unreferenced     : true,
        assign_to_global : true,
        func_arguments   : true,
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
        if (options.assign_to_global)
        {
            var sym = null;
            if (node instanceof AST_Assign && node.left instanceof AST_SymbolRef)
                sym = node.left;
            else if (node instanceof AST_ForIn && node.init instanceof AST_SymbolRef)
                sym = node.init;
            if (sym
                && (sym.undeclared
                    || (sym.symbol.global
                        && sym.scope !== sym.symbol.scope))) {
                AST_Node.warn("{msg}: {name} [{line},{col}]", {
                    msg: sym.undeclared ? "Accidental global?" : "Assignment to global",
                    name: sym.name,
                    line: sym.start.line,
                    col: sym.start.col
                });
            }
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
        if (options.func_arguments
            && node instanceof AST_Lambda
            && node.uses_arguments) {
            AST_Node.warn("arguments used in function {name} [{line},{col}]", {
                name: node.name ? node.name.name : "anonymous",
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

AST_Scope.DEFMETHOD("next_mangled", function(){
    var ext = this.enclosed, n = ext.length;
    out: while (true) {
        var m = base54(++this.cname);
        if (!is_identifier(m)) continue; // skip over "do"
        // we must ensure that the mangled name does not shadow a name
        // from some parent scope that is referenced in this or in
        // inner scopes.
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
        this.mangled_name = this.scope.next_mangled();
    }
});

AST_Label.DEFMETHOD("mangle", function(){
    throw new Error("Don't call this");
});

AST_SymbolDeclaration.DEFMETHOD("unreferenced", function(){
    return this.definition().references.length == 0;
});

AST_SymbolDeclaration.DEFMETHOD("definition", function(){
    return this.uniq || this;
});

AST_Toplevel.DEFMETHOD("mangle_names", function(){
    // We only need to mangle declaration nodes.  Special logic wired
    // into the code generator will display the mangled name if it's
    // present (and for AST_SymbolRef-s it'll use the mangled name of
    // the AST_SymbolDeclaration that it points to).
    var lname = -1;
    var tw = new TreeWalker(function(node, descend){
        if (node instanceof AST_LabeledStatement) {
            // lname is incremented when we get to the AST_Label
            var save_nesting = lname;
            descend();
            lname = save_nesting;
            return true;        // don't descend again in TreeWalker
        }
        if (node instanceof AST_Scope) {
            var p = tw.parent();
            var is_setget = p instanceof AST_ObjectSetter || p instanceof AST_ObjectGetter;
            var a = node.variables;
            for (var i in a) if (HOP(a, i)) {
                var symbol = a[i];
                if (!(is_setget && symbol instanceof AST_SymbolLambda))
                    symbol.mangle();
            }
            return;
        }
        if (node instanceof AST_Label) {
            var name;
            do name = base54(++lname); while (!is_identifier(name));
            node.mangled_name = name;
            return;
        }
    });
    this.walk(tw);
});
