/***********************************************************************

  AST-Tree translator, ColaScript -> JavaScript.

  Distributed under the BSD license:

    Copyright 2014 (c) TrigenSoftware <danon0404@gmail.com>

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

/*
    MD:
   
    Levels of follow:
        1 level: Simple types: String, Number, Boolean, Function.
        2 level: Arrays and Object ( Array<val_type>, Array<key_type, val_type> ).
        Deep   : interfaces, classes (prototypes), singletones.
        
*/

// TypeAliases

Cola.TypeAliases = {
    "int": "Number",
    "float": "Number",
    "real": "Number",
    "double": "Number",
    "bool": "Boolean",
    "void": "undefined"
};

// RefsStorage

Cola.RefsStorage = function (parentStorage) {
    this.parentStorage = parentStorage;
    this.singletype = false;
    this.objs = [];
};

Cola.RefsStorage.Element = function (name, vartype, callable, args) {
    this.name = name;
    this.vartype = vartype;
    this.callable = callable;
    this.props = new Cola.RefsStorage();
    this.args = callable ? new Cola.RefsStorage() : false;

    if(callable && args){
        args.posed.forEach(function(v, k){
            this.args.uniqueAdd(k, v, false, false);
        }, this);

        for(var n in args.named) 
            this.args.uniqueAdd(n, args.named[n], false, false);
    }
};

Cola.RefsStorage.prototype.setSingleType = function (type) {
    if(this.parentStorage) return false;

    this.singletype = true;
    this.objs = [type];
};

Cola.RefsStorage.prototype.contains = function (name, callable) {
    return this.objs.some(function(el){
        return el.name == name && (el.callable = callable);
    });
};

Cola.RefsStorage.prototype.remove = function (name) {
    var pre = this.objs.length;
    this.objs = this.objs.filter(function(el){
        return !(el.name == name);
    });

    return pre != this.objs.length;
};

Cola.RefsStorage.prototype.uniqueAdd = function (name, vartype, callable, args) {
    if(!this.contains(name)){
        if(callable) this.objs.push(new Cola.RefsStorage.Element(name, "Function", false, false));
        this.objs.push(new Cola.RefsStorage.Element(name, vartype, callable, args));
        return true;
    }

    return false;
};

Cola.RefsStorage.prototype.owerwriteAdd = function (name, vartype, callable, args) {
    var removed = this.remove(name);
    if(callable) this.objs.push(new Cola.RefsStorage.Element(name, "Function", false, false));
    this.objs.push(new Cola.RefsStorage.Element(name, vartype, callable, args));
    return removed;
};

Cola.RefsStorage.prototype.get = function (name, callable) {
    if(this.singletype) return this.objs[0];
    
    var obj = false;
    this.objs.some(function(el){
        return el.name == name && el.callable == callable && (obj = el);
    });

    if(!obj && this.parentStorage) obj = this.parentStorage.get(name);

    return obj;
};


// TypeChecker
 
Cola.TypeChecker = function (parentStorage, om) {
    this.outputMode = om == undefined ? Cola.TypeChecker.WARNING : om;
    this.storage = new Cola.RefsStorage(parentStorage, this.outputMode);
};

/*
    Defs:
    //    first step ( simple )
    - vars definition                                   * AST_VarDef         - done
    - function definition                               * AST_Defun          - done
    - function argument definition                      * AST_SymbolFunarg   - done
    //    second step
    //- object's property assignment                      * AST_Assign
    //- prototypes ( classes methods )                    * AST_Assign         - after classes
    //- vars definition in constructor ( vars of class )  * AST_Assign         - after classes

*/
Cola.TypeChecker.prototype.reg = function (def, storage) {
    if(!storage) storage = this.storage;

    if(def.forEach) def.forEach(function(d){
        if(Cola.TypeAliases[d.type]) d.type = Cola.TypeAliases[d.type];

        if(d instanceof Cola.AST_VarDef && d.type == "Function" && !storage.uniqueAdd(d.name.name, d.type, true)){
            this.printFuncRedef(d.name.start);
            storage.owerwriteAdd(d.name.name, d.type, true);
        } else
        if(d instanceof Cola.AST_VarDef && !storage.uniqueAdd(d.name.name, d.type, false)){
            this.printVarRedef(d.name.start);
            storage.owerwriteAdd(d.name.name, d.type, false);
        }

    }, this); else 

    if(def instanceof Cola.AST_Defun){
        if(Cola.TypeAliases[def.type]) def.type = Cola.TypeAliases[def.type];
        var argsTypes = { posed: [], named: {} };

        def.argnames.forEach(function(val, i){
            if(val.argtype == "positional"){
                argsTypes.posed.push(val.type);
            } else if(val.argtype == "named"){
                argsTypes.named[val.name.name] = val.type;
            } else if(val.argtype == "splated"){
                argsTypes.posed.push(null);
            }
        });

        if(!storage.uniqueAdd(def.name.name, def.type, true, argsTypes)){
            this.printFuncRedef(def.start);
            storage.owerwriteAdd(def.name.name, def.type, true, argsTypes);
        }
    }
};

/*
    Nodes to check: - done
    * AST_Binary
    * AST_UnaryPrefix
    * AST_UnaryPostfix
    * AST_Conditional

    * AST_Call                  - checking args
    * AST_Defun && AST_Function - checking returned type 
    * AST_VarDef                - checking def value
    * AST_ForIn                 - checking `in` left arg with right
    * AST_Switch                - checking arg with braches args
        
*/
Cola.TypeChecker.prototype.check = function (node) {

    if(node instanceof Cola.AST_Assign){
        var left = this.get(node.left),
            right = this.get(node.right);

        if(left != "dynamic" && left != right) this.printMism(node.start);    
    } else 

    if(node instanceof Cola.AST_Binary){
        var left = this.get(node.left),
            right = this.get(node.right);

        switch(node.operator){
            case "===": case "!==": case "in": case "instanceof": break;
            default:
                if(left != "dynamic" && right != "dynamic" && left != right)
                    this.printMism(node.start);
        }

    } else

    if(node instanceof Cola.AST_UnaryPrefix) 
        switch(node.operator){
            case "typeof": case "in": case "delete": case "new": break;
            case "+": case "-": case "++": case "--": case "~":
                if(this.get(node.expression) != "Number") this.printMism(node.start);
                break;
            case "!":
                if(this.get(node.expression) != "Boolean") this.printMism(node.start);
                break;
        }
    else

    if(node instanceof Cola.AST_UnaryPostfix) 
        switch(node.operator){
            case "+": case "-": case "++": case "--":
                if(this.get(node.expression) != "Number") this.printMism(node.start);
                break;
        }
    else 

    if(node instanceof Cola.AST_Conditional){
        var cond = this.get(this.condition),
            cons = this.get(this.consequent),
            altr = this.get(this.alternative);

        if(cond != "Boolean" && cond != "dynamic" || cons != altr) this.printMism(node.start);  
    } else 

    if(node instanceof Cola.AST_Call){
        var args = this.get(node, true).args;
        //node.argmap
    } else 

    if((node instanceof Cola.AST_Function || node instanceof Cola.AST_Defun) && node.type != "dynamic"){
        var types = this.getReturnedTypes(node);
        types.forEach(function(el){
           if(node.type != el[0]) this.printMism(el[1]);
        });
    } else

    if(node instanceof Cola.AST_VarDef && node.type != "dynamic" && node.type != this.get(node.value))
        this.printMism(node.start);
    else

    if(node instanceof Cola.AST_ForIn){
        var init = node.init instanceof Cola.AST_Var 
            ? node.init.type 
            : this.get(node.init),

            object = this.get(node.object, true);

            if(!object.storage.singletype || init != object.storage.get('every').vartype) this.printMism(node.start);
    } else

    if(node instanceof Cola.AST_Switch){
        var expr = this.get(node.expression);
        node.body.forEach(function(branch){
            if(branch.expression && this.get(branch.expression) != expr) this.printMism(branch.expression.start)
        });
    }
};

Cola.TypeChecker.prototype.getReturnedTypes = function (node) {
    var types = [];

    var tw = new Cola.TreeWalker(function(node, descend){
        if(node instanceof Cola.AST_Return) types.push([this.get(node), node.start]);
        if(!(node instanceof Cola.AST_Defun || node instanceof Cola.AST_Function)) descend();
    });

    node.walk(tw);
    return types;
};

/*
    Nodes to getting type:
    * AST_Binary
    * AST_UnaryPrefix
    * AST_UnaryPostfix
    * AST_Conditional

    * AST_Call
    * AST_Seq
    * AST_Dot
    * AST_Sub
    * AST_Cascade
    * AST_Proto

    * AST_Symbol

    * AST_Atom
    * AST_Constant
    * AST_Array
    * AST_Object
    * AST_StringTemplate
        
*/
Cola.TypeChecker.prototype.get = function (node) {

};

/*
    Warnings:
    - type mismatch
    - redefinition of variable
    - redefinition of function

*/
Cola.TypeChecker.prototype.printMessage = function (token, msg) {
    switch(this.outputMode){
        case Cola.TypeChecker.WARNING:
            console.warn("TypeWarning: " + msg)
            break;
        case Cola.TypeChecker.ERROR:
            throw new TypeError(msg);
    }
};

Cola.TypeChecker.prototype.printMism = function (token) {
    this.printMessage(token, "type mismatch (line: " + token.line + ", col: " + token.col + ", pos: " + token.pos + ")");
    
};

Cola.TypeChecker.prototype.printVarRedef = function (token) {
    this.printMessage(token, "redefinition of variable (line: " + token.line + ", col: " + token.col + ", pos: " + token.pos + ")");
};

Cola.TypeChecker.prototype.printFuncRedef = function (token) {
    this.printMessage(token, "redefinition of function (line: " + token.line + ", col: " + token.col + ", pos: " + token.pos + ")");
};

Cola.TypeChecker.WARNING = 0;
Cola.TypeChecker.ERROR   = 1;
Cola.TypeChecker.SILENT  = 2;


// Checker function

Cola.AST_Toplevel.DEFMETHOD("check_types", function(options){
    options = Cola.defaults(options, {
        output_mode: Cola.TypeChecker.WARNING
    });

    var currScope = null, csDump = null,
    tw = new Cola.TreeWalker(function(node, descend){

        if (node instanceof Cola.AST_Scope) {
            node.type_checker = new Cola.TypeChecker(node.parent_scope ? node.parent_scope.type_checker.storage : null, options.output_mode);

            if (node instanceof Cola.AST_Defun) currScope.type_checker.reg(node);
            //if (node instanceof Cola.AST_Function || node instanceof Cola.AST_Defun) node.type_checker.reg(node.argnames);

            csDump = currScope;
            currScope = node;
            descend();
            currScope = csDump;

            return true;
        }

        if (node instanceof Cola.AST_Var) 
            currScope.type_checker.reg(node.definitions);
        //else

        //if ()

        descend();
    });
    this.walk(tw);
});
