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

"use strict";
!this.Cola && (this.Cola = {});

Cola.SymbolDef = function (scope, index, orig) {
    this.name = orig.name;
    this.orig = [ orig ];
    this.scope = scope;
    this.references = [];
    this.global = false;
    this.mangled_name = null;
    this.undeclared = false;
    this.constant = false;
    this.index = index;
};

Cola.SymbolDef.prototype = {
    unmangleable: function(options) {
        return (this.global && !(options && options.toplevel))
            || this.undeclared
            || (!(options && options.eval) && (this.scope.uses_eval || this.scope.uses_with));
    },
    mangle: function(options) {
        if (!this.mangled_name && !this.unmangleable(options)) {
            var s = this.scope;
            if (!options.screw_ie8 && this.orig[0] instanceof Cola.AST_SymbolLambda)
                s = s.parent_scope;
            this.mangled_name = s.next_mangled(options, this);
        }
    }
};

Cola.AST_Toplevel.DEFMETHOD("figure_out_scope", function(options){
    options = Cola.defaults(options, {
        screw_ie8: false
    });

    // pass 1: setup scope chaining and handle definitions
    var self = this;
    var scope = self.parent_scope = null;
    var defun = null;
    var nesting = 0;
    var tw = new Cola.TreeWalker(function(node, descend){
        if (options.screw_ie8 && node instanceof Cola.AST_Catch) {
            var save_scope = scope;
            scope = new Cola.AST_Scope(node);
            scope.init_scope_vars(nesting);
            scope.parent_scope = save_scope;
            descend();
            scope = save_scope;
            return true;
        }
        if (node instanceof Cola.AST_Scope) {
            node.init_scope_vars(nesting);
            var save_scope = node.parent_scope = scope;
            var save_defun = defun;
            defun = scope = node;
            ++nesting; descend(); --nesting;
            scope = save_scope;
            defun = save_defun;
            return true;        // don't descend again in Cola.TreeWalker
        }
        if (node instanceof Cola.AST_Directive) {
            node.scope = scope;
            Cola.push_uniq(scope.directives, node.value);
            return true;
        }
        if (node instanceof Cola.AST_With) {
            for (var s = scope; s; s = s.parent_scope)
                s.uses_with = true;
            return;
        }
        if (node instanceof Cola.AST_Symbol) {
            node.scope = scope;
        }
        if (node instanceof Cola.AST_SymbolLambda) {
            defun.def_function(node);
        }
        else if (node instanceof Cola.AST_SymbolDefun) {
            // Careful here, the scope where this should be defined is
            // the parent scope.  The reason is that we enter a new
            // scope when we encounter the Cola.AST_Defun node (which is
            // instanceof Cola.AST_Scope) but we get to the symbol a bit
            // later.
            (node.scope = defun.parent_scope).def_function(node);
        }
        else if (node instanceof Cola.AST_SymbolVar
                 || node instanceof Cola.AST_SymbolConst) {
            var def = defun.def_variable(node);
            def.constant = node instanceof Cola.AST_SymbolConst;
            def.init = tw.parent().value;
        }
        else if (node instanceof Cola.AST_SymbolCatch) {
            (options.screw_ie8 ? scope : defun)
                .def_variable(node);
        }
    });
    self.walk(tw);

    // pass 2: find back references and eval
    var func = null;
    var globals = self.globals = new Cola.Dictionary();
    var tw = new Cola.TreeWalker(function(node, descend){
        if (node instanceof Cola.AST_Lambda) {
            var prev_func = func;
            func = node;
            descend();
            func = prev_func;
            return true;
        }

        if (node instanceof Cola.AST_SymbolRef) {
            var name = node.name;
            var sym = node.scope.find_variable(name);
            if (!sym || func && name == "arguments") {
                var g;
                if (globals.has(name)) {
                    g = globals.get(name);
                } else {
                    g = new Cola.SymbolDef(self, globals.size(), node);
                    g.undeclared = true;
                    g.global = true;
                    globals.set(name, g);
                }
                node.thedef = g;
                if (name == "eval" && tw.parent() instanceof Cola.AST_Call) {
                    for (var s = node.scope; s && !s.uses_eval; s = s.parent_scope)
                        s.uses_eval = true;
                }
                if (func && name == "arguments") {
                    func.uses_arguments = true;
                }
            } else {
                node.thedef = sym;
            }
            node.reference();
            return true;
        }
    });
    self.walk(tw);
});

Cola.AST_Scope.DEFMETHOD("init_scope_vars", function(nesting){
    this.directives = [];     // contains the directives defined in this scope, i.e. "use strict"
    this.variables = new Cola.Dictionary(); // map name to Cola.AST_SymbolVar (variables defined in this scope; includes functions)
    this.functions = new Cola.Dictionary(); // map name to Cola.AST_SymbolDefun (functions defined in this scope)
    this.uses_with = false;   // will be set to true if this or some nested scope uses the `with` statement
    this.uses_eval = false;   // will be set to true if this or nested scope uses the global `eval`
    this.parent_scope = null; // the parent scope
    this.enclosed = [];       // a list of variables from this or outer scope(s) that are referenced from this or inner scopes
    this.cname = -1;          // the current index for mangling functions/variables
    this.nesting = nesting;   // the nesting level of this scope (0 means toplevel)
});

Cola.AST_Scope.DEFMETHOD("strict", function(){
    return this.has_directive("use strict");
});

Cola.AST_Lambda.DEFMETHOD("init_scope_vars", function(){
    Cola.AST_Scope.prototype.init_scope_vars.apply(this, arguments);
    this.uses_arguments = false;
});

Cola.AST_SymbolRef.DEFMETHOD("reference", function() {
    var def = this.definition();
    def.references.push(this);
    var s = this.scope;
    while (s) {
        Cola.push_uniq(s.enclosed, def);
        if (s === def.scope) break;
        s = s.parent_scope;
    }
    this.frame = this.scope.nesting - def.scope.nesting;
});

Cola.AST_Scope.DEFMETHOD("find_variable", function(name){
    if (name instanceof Cola.AST_Symbol) name = name.name;
    return this.variables.get(name)
        || (this.parent_scope && this.parent_scope.find_variable(name));
});

Cola.AST_Scope.DEFMETHOD("has_directive", function(value){
    return this.parent_scope && this.parent_scope.has_directive(value)
        || (this.directives.indexOf(value) >= 0 ? this : null);
});

Cola.AST_Scope.DEFMETHOD("def_function", function(symbol){
    this.functions.set(symbol.name, this.def_variable(symbol));
});

Cola.AST_Scope.DEFMETHOD("def_variable", function(symbol){
    var def;
    if (!this.variables.has(symbol.name)) {
        def = new Cola.SymbolDef(this, this.variables.size(), symbol);
        this.variables.set(symbol.name, def);
        def.global = !this.parent_scope;
    } else {
        def = this.variables.get(symbol.name);
        def.orig.push(symbol);
    }
    return symbol.thedef = def;
});

Cola.AST_Scope.DEFMETHOD("next_mangled", function(options){
    var ext = this.enclosed;
    out: while (true) {
        var m = Cola.base54(++this.cname);
        if (!Cola.is_identifier(m, true)) continue; // skip over "do"

        // https://github.com/mishoo/UglifyJS2/issues/242 -- do not
        // shadow a name excepted from mangling.
        if (options.except.indexOf(m) >= 0) continue;

        // we must ensure that the mangled name does not shadow a name
        // from some parent scope that is referenced in this or in
        // inner scopes.
        for (var i = ext.length; --i >= 0;) {
            var sym = ext[i];
            var name = sym.mangled_name || (sym.unmangleable(options) && sym.name);
            if (m == name) continue out;
        }
        return m;
    }
});

Cola.AST_Function.DEFMETHOD("next_mangled", function(options, def){
    // #179, #326
    // in Safari strict mode, something like (function x(x){...}) is a syntax error;
    // a function expression's argument cannot shadow the function expression's name

    var tricky_def = def.orig[0] instanceof Cola.AST_SymbolFunarg && this.name && this.name.definition();
    while (true) {
        var name = Cola.AST_Lambda.prototype.next_mangled.call(this, options, def);
        if (!(tricky_def && tricky_def.mangled_name == name))
            return name;
    }
});

Cola.AST_Scope.DEFMETHOD("references", function(sym){
    if (sym instanceof Cola.AST_Symbol) sym = sym.definition();
    return this.enclosed.indexOf(sym) < 0 ? null : sym;
});

Cola.AST_Symbol.DEFMETHOD("unmangleable", function(options){
    return this.definition().unmangleable(options);
});

// property accessors are not mangleable
Cola.AST_SymbolAccessor.DEFMETHOD("unmangleable", function(){
    return true;
});

// labels are always mangleable
Cola.AST_Label.DEFMETHOD("unmangleable", function(){
    return false;
});

Cola.AST_Symbol.DEFMETHOD("unreferenced", function(){
    return this.definition().references.length == 0
        && !(this.scope.uses_eval || this.scope.uses_with);
});

Cola.AST_Symbol.DEFMETHOD("undeclared", function(){
    return this.definition().undeclared;
});

Cola.AST_LabelRef.DEFMETHOD("undeclared", function(){
    return false;
});

Cola.AST_Label.DEFMETHOD("undeclared", function(){
    return false;
});

Cola.AST_Symbol.DEFMETHOD("definition", function(){
    return this.thedef;
});

Cola.AST_Symbol.DEFMETHOD("global", function(){
    return this.definition().global;
});

Cola.AST_Toplevel.DEFMETHOD("_default_mangler_options", function(options){
    return Cola.defaults(options, {
        except   : [],
        eval     : false,
        sort     : false,
        toplevel : false,
        screw_ie8 : false
        //,is_js : false
    });
});

Cola.AST_Toplevel.DEFMETHOD("mangle_names", function(options){
    options = this._default_mangler_options(options);
    // We only need to mangle declaration nodes.  Special logic wired
    // into the code generator will display the mangled name if it's
    // present (and for Cola.AST_SymbolRef-s it'll use the mangled name of
    // the Cola.AST_SymbolDeclaration that it points to).
    var lname = -1;
    var to_mangle = [];
    var tw = new Cola.TreeWalker(function(node, descend){
        if (node instanceof Cola.AST_LabeledStatement) {
            // lname is incremented when we get to the Cola.AST_Label
            var save_nesting = lname;
            descend();
            lname = save_nesting;
            return true;        // don't descend again in Cola.TreeWalker
        }
        if (node instanceof Cola.AST_Scope) {
            var p = tw.parent(), a = [];
            node.variables.each(function(symbol){
                if (options.except.indexOf(symbol.name) < 0) {
                    a.push(symbol);
                }
            });
            if (options.sort) a.sort(function(a, b){
                return b.references.length - a.references.length;
            });
            to_mangle.push.apply(to_mangle, a);
            return;
        }
        if (node instanceof Cola.AST_Label) {
            var name;
            do name = Cola.base54(++lname); while (!Cola.is_identifier(name, true));
            node.mangled_name = name;
            return true;
        }
        if (options.screw_ie8 && node instanceof Cola.AST_SymbolCatch) {
            to_mangle.push(node.definition());
            return;
        }
    });
    this.walk(tw);
    to_mangle.forEach(function(def){ def.mangle(options) });
});

Cola.AST_Toplevel.DEFMETHOD("compute_char_frequency", function(options){
    options = this._default_mangler_options(options);
    var tw = new Cola.TreeWalker(function(node){
        if (node instanceof Cola.AST_Constant)
            Cola.base54.consider(node.print_to_string());
        else if (node instanceof Cola.AST_Return)
            Cola.base54.consider("return");
        else if (node instanceof Cola.AST_Throw)
            Cola.base54.consider("throw");
        else if (node instanceof Cola.AST_Continue)
            Cola.base54.consider("continue");
        else if (node instanceof Cola.AST_Break)
            Cola.base54.consider("break");
        else if (node instanceof Cola.AST_Debugger)
            Cola.base54.consider("debugger");
        else if (node instanceof Cola.AST_Directive)
            Cola.base54.consider(node.value);
        else if (node instanceof Cola.AST_While)
            Cola.base54.consider("while");
        else if (node instanceof Cola.AST_Do)
            Cola.base54.consider("do while");
        else if (node instanceof Cola.AST_If) {
            Cola.base54.consider("if");
            if (node.alternative) Cola.base54.consider("else");
        }
        else if (node instanceof Cola.AST_Var)
            Cola.base54.consider("var");
        else if (node instanceof Cola.AST_Const)
            Cola.base54.consider("const");
        else if (node instanceof Cola.AST_Lambda)
            Cola.base54.consider("function");
        else if (node instanceof Cola.AST_For)
            Cola.base54.consider("for");
        else if (node instanceof Cola.AST_ForIn)
            Cola.base54.consider("for in");
        else if (node instanceof Cola.AST_Switch)
            Cola.base54.consider("switch");
        else if (node instanceof Cola.AST_Case)
            Cola.base54.consider("case");
        else if (node instanceof Cola.AST_Default)
            Cola.base54.consider("default");
        else if (node instanceof Cola.AST_With)
            Cola.base54.consider("with");
        else if (node instanceof Cola.AST_ObjectSetter)
            Cola.base54.consider("set" + node.key);
        else if (node instanceof Cola.AST_ObjectGetter)
            Cola.base54.consider("get" + node.key);
        else if (node instanceof Cola.AST_ObjectKeyVal)
            Cola.base54.consider(node.key);
        else if (node instanceof Cola.AST_New)
            Cola.base54.consider("new");
        else if (node instanceof Cola.AST_This)
            Cola.base54.consider("this");
        else if (node instanceof Cola.AST_Try)
            Cola.base54.consider("try");
        else if (node instanceof Cola.AST_Catch)
            Cola.base54.consider("catch");
        else if (node instanceof Cola.AST_Finally)
            Cola.base54.consider("finally");
        else if (node instanceof Cola.AST_Symbol && node.unmangleable(options))
            Cola.base54.consider(node.name);
        else if (node instanceof Cola.AST_Unary || node instanceof Cola.AST_Binary)
            Cola.base54.consider(node.operator);
        else if (node instanceof Cola.AST_Dot)
            Cola.base54.consider(node.property);
    });
    this.walk(tw);
    Cola.base54.sort();
});

Cola.base54 = (function() {
    var string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_0123456789";
    var chars, frequency;
    function reset() {
        frequency = Object.create(null);
        chars = string.split("").map(function(ch){ return ch.charCodeAt(0) });
        chars.forEach(function(ch){ frequency[ch] = 0 });
    }
    base54.consider = function(str){
        for (var i = str.length; --i >= 0;) {
            var code = str.charCodeAt(i);
            if (code in frequency) ++frequency[code];
        }
    };
    base54.sort = function() {
        chars = Cola.mergeSort(chars, function(a, b){
            if (Cola.is_digit(a) && !Cola.is_digit(b)) return 1;
            if (Cola.is_digit(b) && !Cola.is_digit(a)) return -1;
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
            ret += String.fromCharCode(chars[num % base]);
            num = Math.floor(num / base);
            base = 64;
        } while (num > 0);
        return ret;
    };
    return base54;
})();

Cola.AST_Toplevel.DEFMETHOD("scope_warnings", function(options){
    options = Cola.defaults(options, {
        undeclared       : false, // this makes a lot of noise
        unreferenced     : true,
        assign_to_global : true,
        func_arguments   : true,
        nested_defuns    : true,
        eval             : true
    });
    var tw = new Cola.TreeWalker(function(node){
        if (options.undeclared
            && node instanceof Cola.AST_SymbolRef
            && node.undeclared())
        {
            // XXX: this also warns about JS standard names,
            // i.e. Object, Array, parseInt etc.  Should add a list of
            // exceptions.
            Cola.AST_Node.warn("Undeclared symbol: {name} [{file}:{line},{col}]", {
                name: node.name,
                file: node.start.file,
                line: node.start.line,
                col: node.start.col
            });
        }
        if (options.assign_to_global)
        {
            var sym = null;
            if (node instanceof Cola.AST_Assign && node.left instanceof Cola.AST_SymbolRef)
                sym = node.left;
            else if (node instanceof Cola.AST_ForIn && node.init instanceof Cola.AST_SymbolRef)
                sym = node.init;
            if (sym
                && (sym.undeclared()
                    || (sym.global() && sym.scope !== sym.definition().scope))) {
                Cola.AST_Node.warn("{msg}: {name} [{file}:{line},{col}]", {
                    msg: sym.undeclared() ? "Accidental global?" : "Assignment to global",
                    name: sym.name,
                    file: sym.start.file,
                    line: sym.start.line,
                    col: sym.start.col
                });
            }
        }
        if (options.eval
            && node instanceof Cola.AST_SymbolRef
            && node.undeclared()
            && node.name == "eval") {
            Cola.AST_Node.warn("Eval is used [{file}:{line},{col}]", node.start);
        }
        if (options.unreferenced
            && (node instanceof Cola.AST_SymbolDeclaration || node instanceof Cola.AST_Label)
            && node.unreferenced()) {
            Cola.AST_Node.warn("{type} {name} is declared but not referenced [{file}:{line},{col}]", {
                type: node instanceof Cola.AST_Label ? "Label" : "Symbol",
                name: node.name,
                file: node.start.file,
                line: node.start.line,
                col: node.start.col
            });
        }
        if (options.func_arguments
            && node instanceof Cola.AST_Lambda
            && node.uses_arguments) {
            Cola.AST_Node.warn("arguments used in function {name} [{file}:{line},{col}]", {
                name: node.name ? node.name.name : "anonymous",
                file: node.start.file,
                line: node.start.line,
                col: node.start.col
            });
        }
        if (options.nested_defuns
            && node instanceof Cola.AST_Defun
            && !(tw.parent() instanceof Cola.AST_Scope)) {
            Cola.AST_Node.warn("Function {name} declared in nested statement \"{type}\" [{file}:{line},{col}]", {
                name: node.name.name,
                type: tw.parent().TYPE,
                file: node.start.file,
                line: node.start.line,
                col: node.start.col
            });
        }
    });
    this.walk(tw);
});
