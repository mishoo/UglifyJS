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

function SymbolDef(scope, orig) {
    this.name = orig.name;
    this.orig = [ orig ];
    this.scope = scope;
    this.references = [];
    this.global = false;
    this.mangled_name = null;
    this.undeclared = false;
};

SymbolDef.prototype = {
    unmangleable: function() {
        return this.global || this.undeclared || this.scope.uses_eval || this.scope.uses_with;
    },
    mangle: function() {
        if (!this.mangled_name && !this.unmangleable())
            this.mangled_name = this.scope.next_mangled();
    }
};

AST_Toplevel.DEFMETHOD("figure_out_scope", function(){
    // This does what ast_add_scope did in UglifyJS v1.
    //
    // Part of it could be done at parse time, but it would complicate
    // the parser (and it's already kinda complex).  It's also worth
    // having it separated because we might need to call it multiple
    // times on the same tree.

    // pass 1: setup scope chaining and handle definitions
    var self = this;
    var scope = self.parent_scope = null;
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
        if (node instanceof AST_Directive) {
            node.scope = scope;
            push_uniq(scope.directives, node.value);
            return true;
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
        if (node instanceof AST_Symbol) {
            node.scope = scope;
        }
        if (node instanceof AST_Label) {
            node.thedef = node;
            node.init_scope_vars();
            var p = tw.parent(); // AST_LabeledStatement
            var block = p.body;
            if (block instanceof AST_StatementWithBody)
                block = block.body;
            node.label_target = block;
        }
        if (node instanceof AST_LoopControl) {
            if (!node.label) {
                var a = tw.stack, i = a.length - 1;
                while (--i >= 0) {
                    var p = a[i];
                    if (p instanceof AST_For
                        || p instanceof AST_ForIn
                        || p instanceof AST_DWLoop
                        || p instanceof AST_Switch) {
                        node.loopcontrol_target = p.body;
                        break;
                    }
                }
            }
        }
        else if (node instanceof AST_SymbolLambda) {
            scope.def_function(node);
            node.init.push(tw.parent());
        }
        else if (node instanceof AST_SymbolDefun) {
            // Careful here, the scope where this should be defined is
            // the parent scope.  The reason is that we enter a new
            // scope when we encounter the AST_Defun node (which is
            // instanceof AST_Scope) but we get to the symbol a bit
            // later.
            (node.scope = scope.parent_scope).def_function(node);
            node.init.push(tw.parent());
        }
        else if (node instanceof AST_SymbolVar) {
            scope.def_variable(node);
            var def = tw.parent();
            if (def.value) node.init.push(def);
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
        if (node instanceof AST_LabelRef) {
            var sym = labels[node.name];
            if (!sym) throw new Error(string_template("Undefined label {name} [{line},{col}]", {
                name: node.name,
                line: node.start.line,
                col: node.start.col
            }));
            node.thedef = sym;
        }
    });
    self.walk(tw);

    // pass 2: find back references and eval
    var func = null;
    var globals = self.globals = {};
    var tw = new TreeWalker(function(node, descend){
        if (node instanceof AST_Lambda) {
            var prev_func = func;
            func = node;
            descend();
            func = prev_func;
            return true;
        }
        if (node instanceof AST_LabelRef) {
            node.reference();
            return true;
        }
        if (node instanceof AST_SymbolRef) {
            var name = node.name;
            var sym = node.scope.find_variable(name);
            if (!sym) {
                var g;
                if (HOP(globals, name)) {
                    g = globals[name];
                } else {
                    g = new SymbolDef(self, node);
                    g.undeclared = true;
                    globals[name] = g;
                }
                node.thedef = g;
                if (name == "eval") {
                    for (var s = node.scope; s && !s.uses_eval; s = s.parent_scope)
                        s.uses_eval = true;
                }
                if (name == "arguments") {
                    func.uses_arguments = true;
                }
            } else {
                node.thedef = sym;
            }
            node.reference();
        }
    });
    self.walk(tw);
});

AST_Scope.DEFMETHOD("init_scope_vars", function(){
    this.directives = [];     // contains the directives defined in this scope, i.e. "use strict"
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

AST_SymbolRef.DEFMETHOD("reference", function() {
    var def = this.definition();
    def.references.push(this);
    var orig_scope = def.scope, s = this.scope;
    while (s) {
        push_uniq(s.enclosed, def);
        s = s.parent_scope;
    }
});

AST_SymbolDeclaration.DEFMETHOD("init_scope_vars", function(){
    this.init = [];
});

AST_Label.DEFMETHOD("init_scope_vars", function(){
    this.references = [];
});

AST_LabelRef.DEFMETHOD("reference", function(){
    this.thedef.references.push(this);
});

AST_Scope.DEFMETHOD("find_variable", function(name){
    if (name instanceof AST_Symbol) name = name.name;
    return HOP(this.variables, name)
        ? this.variables[name]
        : (this.parent_scope && this.parent_scope.find_variable(name));
});

AST_Scope.DEFMETHOD("has_directive", function(value){
    return this.parent_scope && this.parent_scope.has_directive(value)
        || (this.directives.indexOf(value) >= 0 ? this : null);
});

AST_Scope.DEFMETHOD("def_function", function(symbol){
    this.functions[symbol.name] = this.def_variable(symbol);
});

AST_Scope.DEFMETHOD("def_variable", function(symbol){
    var def;
    if (!HOP(this.variables, symbol.name)) {
        def = new SymbolDef(this, symbol);
        this.variables[symbol.name] = def;
        def.global = !this.parent_scope;
    } else {
        def = this.variables[symbol.name];
        def.orig.push(symbol);
    }
    return symbol.thedef = def;
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
            var name = sym.mangled_name || (sym.unmangleable() && sym.name);
            if (m == name) continue out;
        }
        return m;
    }
});

AST_Symbol.DEFMETHOD("unmangleable", function(){
    return this.definition().unmangleable();
});

// labels are always mangleable
AST_Label.DEFMETHOD("unmangleable", function(){
    return false;
});

AST_Symbol.DEFMETHOD("unreferenced", function(){
    return this.definition().references.length == 0
        && !(this.scope.uses_eval || this.scope.uses_with);
});

AST_Symbol.DEFMETHOD("undeclared", function(){
    return this.definition().undeclared;
});

AST_Symbol.DEFMETHOD("definition", function(){
    return this.thedef;
});

AST_Symbol.DEFMETHOD("global", function(){
    return this.definition().global;
});

AST_LoopControl.DEFMETHOD("target", function(){
    if (this.label) return this.label.definition().label_target;
    return this.loopcontrol_target;
});

AST_Toplevel.DEFMETHOD("mangle_names", function(sort){
    // We only need to mangle declaration nodes.  Special logic wired
    // into the code generator will display the mangled name if it's
    // present (and for AST_SymbolRef-s it'll use the mangled name of
    // the AST_SymbolDeclaration that it points to).
    var lname = -1;
    var to_mangle = [];
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
                    to_mangle.push(symbol);
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

    if (sort) to_mangle = mergeSort(to_mangle, function(a, b){
        return b.references.length - a.references.length;
    });

    to_mangle.forEach(function(def){ def.mangle() });
});

AST_Toplevel.DEFMETHOD("compute_char_frequency", function(){
    var tw = new TreeWalker(function(node){
        if (node instanceof AST_Constant)
            base54.consider(node.print_to_string());
        else if (node instanceof AST_Return)
            base54.consider("return");
        else if (node instanceof AST_Throw)
            base54.consider("throw");
        else if (node instanceof AST_Continue)
            base54.consider("continue");
        else if (node instanceof AST_Break)
            base54.consider("break");
        else if (node instanceof AST_Debugger)
            base54.consider("debugger");
        else if (node instanceof AST_Directive)
            base54.consider(node.value);
        else if (node instanceof AST_While)
            base54.consider("while");
        else if (node instanceof AST_Do)
            base54.consider("do while");
        else if (node instanceof AST_If) {
            base54.consider("if");
            if (node.alternative) base54.consider("else");
        }
        else if (node instanceof AST_Var)
            base54.consider("var");
        else if (node instanceof AST_Const)
            base54.consider("const");
        else if (node instanceof AST_Lambda)
            base54.consider("function");
        else if (node instanceof AST_For)
            base54.consider("for");
        else if (node instanceof AST_ForIn)
            base54.consider("for in");
        else if (node instanceof AST_Switch)
            base54.consider("switch");
        else if (node instanceof AST_Case)
            base54.consider("case");
        else if (node instanceof AST_Default)
            base54.consider("default");
        else if (node instanceof AST_With)
            base54.consider("with");
        else if (node instanceof AST_ObjectSetter)
            base54.consider("set" + node.key);
        else if (node instanceof AST_ObjectGetter)
            base54.consider("get" + node.key);
        else if (node instanceof AST_ObjectKeyVal)
            base54.consider(node.key);
        else if (node instanceof AST_New)
            base54.consider("new");
        else if (node instanceof AST_This)
            base54.consider("this");
        else if (node instanceof AST_Try)
            base54.consider("try");
        else if (node instanceof AST_Catch)
            base54.consider("catch");
        else if (node instanceof AST_Finally)
            base54.consider("finally");
        else if (node instanceof AST_Symbol && node.unmangleable())
            base54.consider(node.name);
        else if (node instanceof AST_Unary || node instanceof AST_Binary)
            base54.consider(node.operator);
        else if (node instanceof AST_Dot)
            base54.consider(node.property);
    });
    this.walk(tw);
});

var base54 = (function() {
    var string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_0123456789";
    var chars, frequency;
    function reset() {
        frequency = {};
        chars = string.split("");
        chars.map(function(ch){ frequency[ch] = 0 });
    }
    base54.consider = function(str){
        for (var i = str.length; --i >= 0;) {
            var ch = str.charAt(i);
            if (string.indexOf(ch) >= 0)
                ++frequency[ch];
        }
    };
    base54.sort = function() {
        chars = mergeSort(chars, function(a, b){
            if (is_digit(a) && !is_digit(b)) return 1;
            if (is_digit(b) && !is_digit(a)) return -1;
            return frequency[b] - frequency[a];
        });
    };
    base54.reset = reset;
    reset();
    base54.get = function(){ return chars };
    base54.freq = function(){ return frequency };
    function base54(num) {
        var ret = "", base = 54;
        do {
            ret += chars[num % base];
            num = Math.floor(num / base);
            base = 64;
        } while (num > 0);
        return ret;
    };
    return base54;
})();

AST_Toplevel.DEFMETHOD("scope_warnings", function(options){
    options = defaults(options, {
        undeclared       : false, // this makes a lot of noise
        unreferenced     : true,
        assign_to_global : true,
        func_arguments   : true,
        nested_defuns    : true,
        eval             : true
    });
    var tw = new TreeWalker(function(node){
        if (options.undeclared
            && node instanceof AST_SymbolRef
            && node.undeclared())
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
                && (sym.undeclared()
                    || (sym.global() && sym.scope !== sym.definition().scope))) {
                AST_Node.warn("{msg}: {name} [{line},{col}]", {
                    msg: sym.undeclared() ? "Accidental global?" : "Assignment to global",
                    name: sym.name,
                    line: sym.start.line,
                    col: sym.start.col
                });
            }
        }
        if (options.eval
            && node instanceof AST_SymbolRef
            && node.undeclared()
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
        if (options.nested_defuns
            && node instanceof AST_Defun
            && !(tw.parent() instanceof AST_Scope)) {
            AST_Node.warn("Function {name} declared in nested statement [{line},{col}]", {
                name: node.name.name,
                line: node.start.line,
                col: node.start.col
            });
        }
    });
    this.walk(tw);
});
