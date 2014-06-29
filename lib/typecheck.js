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
    
    Defs:
        - var definition
        - function definition 
        - function argument definition

        * AST_VarDef
        * AST_Defun
        * AST_Function
        * AST_SymbolFunarg

    Levels of follow:
        1 level: Simple types: String, Number, Boolean, Function.
        2 level: Arrays and Object ( Array<val_type>, Array<key_type, val_type> ).
        Deep   : interfaces, classes (prototypes), singletones.

    Operations to check:
        * AST_Return
        * AST_Call
        * AST_UnaryPrefix
        * AST_UnaryPostfix
        * AST_Binary
        * AST_Conditional
        * AST_Assign

    Warnings:
        * type mismatch
        * redefinition of variable
*/


// TypedObject

Cola.TypedObject = function (name, vartype, isfunc) {
    this.name = name;
    this.vartype = vartype;
    this.isfunc = isfunc;
};


// TypeStorage

Cola.TypeStorage = function (parentStorage) {
    this.parentStorage = parentStorage;
    this.objs = [];
};

Cola.TypeStorage.prototype.contains = function (name, isfunc) {
    return this.objs.some(function(el){
        return el.name == name && el.isfunc == isfunc;
    });
};

Cola.TypeStorage.prototype.remove = function (name, isfunc) {
    var pre = this.objs.length;
    this.objs = this.objs.filter(function(el){
        return !(el.name == name && el.isfunc == isfunc);
    });

    return pre != this.objs.length;
};

Cola.TypeStorage.prototype.uniqueAdd = function (name, vartype, isfunc) {
    if(!this.contains(name, isfunc)){
        this.objs.push(new Cola.TypedObject(name, vartype, isfunc));
        return true;
    }

    return false;
};

Cola.TypeStorage.prototype.owerwriteAdd = function (name, vartype, isfunc) {
    var removed = this.remove(name, isfunc);
    this.objs.push(new Cola.TypedObject(name, vartype, isfunc));
    return removed;
};

Cola.TypeStorage.prototype.get = function (name) {
    var obj = false;
    this.objs.some(function(el){
        return el.name == name && (obj = el);
    });

    if(!obj && this.parentStorage) obj = this.parentStorage.get(name);
};


// TypeChecker
 
Cola.TypeChecker = function (parentStorage, om) {
    this.outputMode = om == undefined ? Cola.TypeChecker.WARNING : om;
    this.storage = new Cola.TypeStorage(parentStorage, this.outputMode);
};

Cola.TypeChecker.prototype.reg = function (def) {
    if(def.forEach) def.forEach(function(d){
        if(d instanceof Cola.AST_VarDef && !this.storage.uniqueAdd(d.name.name, d.type, false)){
            this.printVarRedef(d.name.start);
            this.storage.owerwriteAdd(d.name.name, d.type, false);
        } else 
        if(d instanceof Cola.AST_SymbolFunarg) this.storage.owerwriteAdd(d.name, d.type, false);
    }, this); else 
    if(def instanceof Cola.AST_Defun){
        if(!this.storage.uniqueAdd(def.name.name, "Function", false)){
            this.printFuncRedef(def.start);
            this.storage.owerwriteAdd(def.name.name, "Function", false);
        } 
        this.storage.owerwriteAdd(def.name.name, def.type, true);
    }
};

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
            if (node instanceof Cola.AST_Function || node instanceof Cola.AST_Defun) node.type_checker.reg(node.argnames);

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
