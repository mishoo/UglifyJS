/***********************************************************************

  A JavaScript tokenizer / parser / beautifier / compressor.
  https://github.com/mishoo/UglifyJS2

  Edited for parsing ColaScript.

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2012 (c) Mihai Bazon <mihai.bazon@gmail.com>
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

Cola.DEFNODE = function (type, props, methods, base) {
    if (arguments.length < 4) base = Cola.AST_Node;
    if (!props) props = [];
    else props = props.split(/\s+/);
    var self_props = props;
    if (base && base.PROPS)
        props = props.concat(base.PROPS);
    var code = "return function AST_" + type + "(props){ if (props) { ";
    for (var i = props.length; --i >= 0;) {
        if (props[i] == "start" || props[i] == "end") code += "this." + props[i] + " = props." + props[i] + " || new Cola.AST_Token();";
        else code += "this." + props[i] + " = props." + props[i] + ";";
    }
    var proto = base && new base;
    if (proto && proto.initialize || (methods && methods.initialize))
        code += "this.initialize();";
    code += type == "Token" ? "}}" : "} else { this.end = new Cola.AST_Token(); this.start = new Cola.AST_Token(); } }";
    var ctor = new Function(code)();
    if (proto) {
        ctor.prototype = proto;
        ctor.BASE = base;
    }
    if (base) base.SUBCLASSES.push(ctor);
    ctor.prototype.CTOR = ctor;
    ctor.PROPS = props || null;
    ctor.SELF_PROPS = self_props;
    ctor.SUBCLASSES = [];
    if (type) {
        ctor.prototype.TYPE = ctor.TYPE = type;
    }
    if (methods) for (i in methods) if (methods.hasOwnProperty(i)) {
        if (/^\$/.test(i)) {
            ctor[i.substr(1)] = methods[i];
        } else {
            ctor.prototype[i] = methods[i];
        }
    }
    ctor.DEFMETHOD = function(name, method) {
        this.prototype[name] = method;
    };
    return ctor;
};

Cola.AST_Token = Cola.DEFNODE("Token", "type value line col pos endpos nlb comments_before file", {
    clone: function() {
        return new this.CTOR(this);
    }
}, null);

Cola.AST_Node = Cola.DEFNODE("Node", "start end", {
    clone: function() {
        return new this.CTOR(this);
    },
    $documentation: "Base class of all AST nodes",
    $propdoc: {
        start: "[AST_Token] The first token of this node",
        end: "[AST_Token] The last token of this node"
    },
    _walk: function(visitor) {
        return visitor._visit(this);
    },
    walk: function(visitor) {
        return this._walk(visitor); // not sure the indirection will be any help
    }
}, null);

Cola.AST_Command = Cola.DEFNODE("Command", "name args", {
    $iscola: true,
    $documentation: "Compiler-command statement",
    $propdoc: {
        name: "[string] Name of command",
        args: "[AST_Node*] List of arguments"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.args.forEach(function(arg){
                arg._walk(visitor);
            });
        });
    }
}, Cola.AST_Node);

Cola.AST_Noop = Cola.DEFNODE("Noop", null, null, Cola.AST_Node);

Cola.AST_Node.warn_function = null;
Cola.AST_Node.warn = function(txt, props) {
    if (Cola.AST_Node.warn_function)
        Cola.AST_Node.warn_function(Cola.string_template(txt, props));
};

/* -----[ statements ]----- */

Cola.AST_Statement = Cola.DEFNODE("Statement", null, {
    $documentation: "Base class of all statements",
});

Cola.AST_Debugger = Cola.DEFNODE("Debugger", null, {
    $documentation: "Represents a debugger statement",
}, Cola.AST_Statement);

Cola.AST_Directive = Cola.DEFNODE("Directive", "value scope", {
    $documentation: "Represents a directive, like \"use strict\";",
    $propdoc: {
        value: "[string] The value of this directive as a plain string (it's not an AST_String!)",
        scope: "[AST_Scope/S] The scope that this directive affects"
    },
}, Cola.AST_Statement);

Cola.AST_SimpleStatement = Cola.DEFNODE("SimpleStatement", "body", {
    $documentation: "A statement consisting of an expression, i.e. a = 1 + 2",
    $propdoc: {
        body: "[AST_Node] an expression node (should not be instanceof Cola.AST_Statement)"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.body._walk(visitor);
        });
    }
}, Cola.AST_Statement);

Cola.walk_body = function (node, visitor) {
    if (node.body instanceof Cola.AST_Statement) {
        node.body._walk(visitor);
    }
    else node.body.forEach(function(stat){
        stat._walk(visitor);
    });
};

Cola.AST_Block = Cola.DEFNODE("Block", "body", {
    $documentation: "A body of statements (usually bracketed)",
    $propdoc: {
        body: "[AST_Statement*] an array of statements"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            Cola.walk_body(this, visitor);
        });
    }
}, Cola.AST_Statement);

Cola.AST_BlockStatement = Cola.DEFNODE("BlockStatement", null, {
    $documentation: "A block statement",
}, Cola.AST_Block);

Cola.AST_EmptyStatement = Cola.DEFNODE("EmptyStatement", null, {
    $documentation: "The empty statement (empty block or simply a semicolon)",
    _walk: function(visitor) {
        return visitor._visit(this);
    }
}, Cola.AST_Statement);

Cola.AST_StatementWithBody = Cola.DEFNODE("StatementWithBody", "body", {
    $documentation: "Base class for all statements that contain one nested body: `For`, `ForIn`, `Do`, `While`, `With`",
    $propdoc: {
        body: "[AST_Statement] the body; this should always be present, even if it's an AST_EmptyStatement"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.body._walk(visitor);
        });
    }
}, Cola.AST_Statement);

Cola.AST_LabeledStatement = Cola.DEFNODE("LabeledStatement", "label", {
    $documentation: "Statement with a label",
    $propdoc: {
        label: "[AST_Label] a label definition"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.label._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, Cola.AST_StatementWithBody);

Cola.AST_IterationStatement = Cola.DEFNODE("IterationStatement", null, {
    $documentation: "Internal class.  All loops inherit from it."
}, Cola.AST_StatementWithBody);

Cola.AST_DWLoop = Cola.DEFNODE("DWLoop", "condition", {
    $documentation: "Base class for do/while statements",
    $propdoc: {
        condition: "[AST_Node] the loop condition.  Should not be instanceof Cola.AST_Statement"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.condition._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, Cola.AST_IterationStatement);

Cola.AST_Do = Cola.DEFNODE("Do", null, {
    $documentation: "A `do` statement",
}, Cola.AST_DWLoop);

Cola.AST_While = Cola.DEFNODE("While", null, {
    $documentation: "A `while` statement",
}, Cola.AST_DWLoop);

Cola.AST_For = Cola.DEFNODE("For", "init condition step", {
    $documentation: "A `for` statement",
    $propdoc: {
        init: "[AST_Node?] the `for` initialization code, or null if empty",
        condition: "[AST_Node?] the `for` termination clause, or null if empty",
        step: "[AST_Node?] the `for` update clause, or null if empty"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            if (this.init) this.init._walk(visitor);
            if (this.condition) this.condition._walk(visitor);
            if (this.step) this.step._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, Cola.AST_IterationStatement);

Cola.AST_ForIn = Cola.DEFNODE("ForIn", "init name object", {
    $documentation: "A `for ... in` statement",
    $propdoc: {
        init: "[AST_Node] the `for/in` initialization code",
        name: "[AST_SymbolRef?] the loop variable, only if `init` is AST_Var",
        object: "[AST_Node] the object that we're looping through"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.init._walk(visitor);
            this.object._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, Cola.AST_IterationStatement);

Cola.AST_ForOf = Cola.DEFNODE("ForOf", "init name object", {
    $iscola: true,
    $documentation: "A `for ... of` statement",
    $propdoc: {
        init: "[AST_Node] the `for/in` initialization code",
        name: "[AST_SymbolRef?] the loop variable, only if `init` is AST_Var",
        object: "[AST_Node] the object that we're looping through"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.init._walk(visitor);
            this.object._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, Cola.AST_IterationStatement);

Cola.AST_With = Cola.DEFNODE("With", "expression", {
    $documentation: "A `with` statement",
    $propdoc: {
        expression: "[AST_Node] the `with` expression"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, Cola.AST_StatementWithBody);

/* -----[ scope and functions ]----- */

Cola.AST_Scope = Cola.DEFNODE("Scope", "directives variables functions uses_with uses_eval parent_scope enclosed cname", {
    $documentation: "Base class for all statements introducing a lexical scope",
    $propdoc: {
        directives: "[string*/S] an array of directives declared in this scope",
        variables: "[Object/S] a map of name -> SymbolDef for all variables/functions defined in this scope",
        functions: "[Object/S] like `variables`, but only lists function declarations",
        uses_with: "[boolean/S] tells whether this scope uses the `with` statement",
        uses_eval: "[boolean/S] tells whether this scope contains a direct call to the global `eval`",
        parent_scope: "[AST_Scope?/S] link to the parent scope",
        enclosed: "[SymbolDef*/S] a list of all symbol definitions that are accessed from this scope or any subscopes",
        cname: "[integer/S] current index for mangling variables (used internally by the mangler)",
    },
}, Cola.AST_Block);

Cola.AST_Toplevel = Cola.DEFNODE("Toplevel", "globals language requiredModules", {
    $documentation: "The toplevel scope",
    $propdoc: {
        globals: "[Object/S] a map of name -> SymbolDef for all undeclared names",
        language: "[String] JavaScript or ColaScript",
        requiredModules: "[Object] modules required in this code"
    },
    wrap_enclose: function(arg_parameter_pairs) {
        var self = this;
        var args = [];
        var parameters = [];

        arg_parameter_pairs.forEach(function(pair) {
            var split = pair.split(":");

            args.push(split[0]);
            parameters.push(split[1]);
        });

        var wrapped_tl = "(function(" + parameters.join(",") + "){ '$ORIG'; })(" + args.join(",") + ")";
        wrapped_tl = Cola.parse(wrapped_tl, { is_js : true });
        wrapped_tl = wrapped_tl.transform(new Cola.TreeTransformer(function before(node){
            if (node instanceof Cola.AST_Directive && node.value == "$ORIG") {
                return Cola.MAP.splice(self.body);
            }
        }));
        return wrapped_tl;
    },
    wrap_commonjs: function(name, export_all) {
        var self = this;
        var to_export = [];
        if (export_all) {
            self.figure_out_scope();
            self.walk(new Cola.TreeWalker(function(node){
                if (node instanceof Cola.AST_SymbolDeclaration && node.definition().global) {
                    if (!Cola.find_if(function(n){ return n.name == node.name }, to_export))
                        to_export.push(node);
                }
            }));
        }
        var wrapped_tl = "(function(exports, global){ global['" + name + "'] = exports; '$ORIG'; '$EXPORTS'; }({}, (function(){return this}())))";
        wrapped_tl = Cola.parse(wrapped_tl, { is_js : true });
        wrapped_tl = wrapped_tl.transform(new Cola.TreeTransformer(function before(node){
            if (node instanceof Cola.AST_SimpleStatement) {
                node = node.body;
                if (node instanceof Cola.AST_String) switch (node.getValue()) {
                  case "$ORIG":
                    return Cola.MAP.splice(self.body);
                  case "$EXPORTS":
                    var body = [];
                    to_export.forEach(function(sym){
                        body.push(new Cola.AST_SimpleStatement({
                            body: new Cola.AST_Assign({
                                left: new Cola.AST_Sub({
                                    expression: new Cola.AST_SymbolRef({ name: "exports" }),
                                    property: new Cola.AST_String({ value: sym.name }),
                                }),
                                operator: "=",
                                right: new Cola.AST_SymbolRef(sym),
                            }),
                        }));
                    });
                    return Cola.MAP.splice(body);
                }
            }
        }));
        return wrapped_tl;
    }
}, Cola.AST_Scope);

Cola.AST_Class = Cola.DEFNODE("Class", "name extends mods", {
    $iscola: true,
    $documentation: "Base class for classes",
    $propdoc: {
        name: "[AST_SymbolClass] the name of this class",
        extends: "[AST_Node] class for extend"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.name._walk(visitor);
            this.extends._walk(visitor);
            Cola.walk_body(this, visitor);
        });
    }
}, Cola.AST_Scope);

Cola.AST_Singleton = Cola.DEFNODE("Singleton", "name mods", {
    $iscola: true,
    $documentation: "Base class for singletons",
    $propdoc: {
        name: "[AST_SymbolSingleton] the name of this singleton"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.name._walk(visitor);
            Cola.walk_body(this, visitor);
        });
    }
}, Cola.AST_Scope);

Cola.AST_Lambda = Cola.DEFNODE("Lambda", "name argnames uses_arguments", {
    $documentation: "Base class for functions",
    $propdoc: {
        name: "[AST_SymbolDeclaration?] the name of this function",
        argnames: "[AST_SymbolFunarg*] array of function arguments",
        uses_arguments: "[boolean/S] tells whether this function accesses the arguments array"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            if (this.name) this.name._walk(visitor);
            this.argnames.forEach(function(arg){
                arg._walk(visitor);
            });
            Cola.walk_body(this, visitor);
        });
    }
}, Cola.AST_Scope);

Cola.AST_Accessor = Cola.DEFNODE("Accessor", null, {
    $documentation: "A setter/getter function.  The `name` property is always null."
}, Cola.AST_Lambda);

Cola.AST_Function = Cola.DEFNODE("Function", "type", {
    $documentation: "A function expression"
}, Cola.AST_Lambda);

Cola.AST_Defun = Cola.DEFNODE("Defun", "type mods", {
    $documentation: "A function definition"
}, Cola.AST_Lambda);

Cola.AST_Getter = Cola.DEFNODE("Getter", "type mods", {
    $iscola: true,
    $documentation: "A function definition"
}, Cola.AST_Lambda);

Cola.AST_Setter = Cola.DEFNODE("Setter", "type mods", {
    $iscola: true,
    $documentation: "A function definition"
}, Cola.AST_Lambda);

Cola.AST_Namedarg = Cola.DEFNODE("Namedarg", "start end name value", {
    $iscola: true,
    $documentation: "Named argument",
    $propdoc: {
        value: "Value of named argument"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.value._walk(visitor);
        });
    }
}, Cola.AST_SymbolRef);

Cola.AST_ArgDef = Cola.DEFNODE("ArgDef", "start end name type argtype defval required", {
    $iscola: true,
    $documentation: "A function argument expression",
    $propdoc: {
        type: "Data type",
        argtype: "positional/named/splated"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.name._walk(visitor);
        });
    }
}, Cola.AST_SymbolFunarg);

/* -----[ JUMPS ]----- */

Cola.AST_Jump = Cola.DEFNODE("Jump", null, {
    $documentation: "Base class for “jumps” (for now that's `return`, `throw`, `break` and `continue`)"
}, Cola.AST_Statement);

Cola.AST_Exit = Cola.DEFNODE("Exit", "value", {
    $documentation: "Base class for “exits” (`return` and `throw`)",
    $propdoc: {
        value: "[AST_Node?] the value returned or thrown by this statement; could be null for AST_Return"
    },
    _walk: function(visitor) {
        return visitor._visit(this, this.value && function(){
            this.value._walk(visitor);
        });
    }
}, Cola.AST_Jump);

Cola.AST_Return = Cola.DEFNODE("Return", null, {
    $documentation: "A `return` statement"
}, Cola.AST_Exit);

Cola.AST_Throw = Cola.DEFNODE("Throw", null, {
    $documentation: "A `throw` statement"
}, Cola.AST_Exit);

Cola.AST_Resolve = Cola.DEFNODE("Resolve", null, {
    $iscola: true,
    $documentation: "A `resolve` statement"
}, Cola.AST_Exit);

Cola.AST_Reject = Cola.DEFNODE("Reject", null, {
    $iscola: true,
    $documentation: "A `reject` statement"
}, Cola.AST_Exit);

Cola.AST_LoopControl = Cola.DEFNODE("LoopControl", "label", {
    $documentation: "Base class for loop control statements (`break` and `continue`)",
    $propdoc: {
        label: "[AST_LabelRef?] the label, or null if none",
    },
    _walk: function(visitor) {
        return visitor._visit(this, this.label && function(){
            this.label._walk(visitor);
        });
    }
}, Cola.AST_Jump);

Cola.AST_Break = Cola.DEFNODE("Break", null, {
    $documentation: "A `break` statement"
}, Cola.AST_LoopControl);

Cola.AST_Continue = Cola.DEFNODE("Continue", null, {
    $documentation: "A `continue` statement"
}, Cola.AST_LoopControl);

/* -----[ IF ]----- */

Cola.AST_If = Cola.DEFNODE("If", "condition alternative inline", {
    $documentation: "A `if` statement",
    $propdoc: {
        condition: "[AST_Node] the `if` condition",
        alternative: "[AST_Statement?] the `else` part, or null if not present"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.condition._walk(visitor);
            this.body._walk(visitor);
            if (this.alternative) this.alternative._walk(visitor);
        });
    }
}, Cola.AST_StatementWithBody);

/* -----[ SWITCH ]----- */

Cola.AST_Switch = Cola.DEFNODE("Switch", "expression", {
    $documentation: "A `switch` statement",
    $propdoc: {
        expression: "[AST_Node] the `switch` “discriminant”"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            Cola.walk_body(this, visitor);
        });
    }
}, Cola.AST_Block);

Cola.AST_SwitchBranch = Cola.DEFNODE("SwitchBranch", null, {
    $documentation: "Base class for `switch` branches",
}, Cola.AST_Block);

Cola.AST_Default = Cola.DEFNODE("Default", null, {
    $documentation: "A `default` switch branch",
}, Cola.AST_SwitchBranch);

Cola.AST_Case = Cola.DEFNODE("Case", "expression", {
    $documentation: "A `case` switch branch",
    $propdoc: {
        expression: "[AST_Node] the `case` expression"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            Cola.walk_body(this, visitor);
        });
    }
}, Cola.AST_SwitchBranch);

Cola.AST_When = Cola.DEFNODE("When", null, {
    $iscola: true,
    $documentation: "A `when` switch branch"
}, Cola.AST_Case);

/* -----[ EXCEPTIONS ]----- */

Cola.AST_Try = Cola.DEFNODE("Try", "bcatch bfinally", {
    $documentation: "A `try` statement",
    $propdoc: {
        bcatch: "[AST_Catch?] the catch block, or null if not present",
        bfinally: "[AST_Finally?] the finally block, or null if not present"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            Cola.walk_body(this, visitor);
            if (this.bcatch) this.bcatch._walk(visitor);
            if (this.bfinally) this.bfinally._walk(visitor);
        });
    }
}, Cola.AST_Block);

Cola.AST_Catch = Cola.DEFNODE("Catch", "argname", {
    $documentation: "A `catch` node; only makes sense as part of a `try` statement",
    $propdoc: {
        argname: "[AST_SymbolCatch] symbol for the exception"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.argname._walk(visitor);
            Cola.walk_body(this, visitor);
        });
    }
}, Cola.AST_Block);

Cola.AST_Finally = Cola.DEFNODE("Finally", null, {
    $documentation: "A `finally` node; only makes sense as part of a `try` statement"
}, Cola.AST_Block);

/* -----[ VAR/CONST ]----- */

Cola.AST_Definitions = Cola.DEFNODE("Definitions", "definitions", {
    $documentation: "Base class for `var` or `const` nodes (variable declarations/initializations)",
    $propdoc: {
        definitions: "[AST_VarDef*] array of variable definitions"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.definitions.forEach(function(def){
                def._walk(visitor);
            });
        });
    }
}, Cola.AST_Statement);

Cola.AST_Var = Cola.DEFNODE("Var", "type mods", {
    $documentation: "A `var` statement"
}, Cola.AST_Definitions);

Cola.AST_Const = Cola.DEFNODE("Const", null, {
    $documentation: "A `const` statement"
}, Cola.AST_Definitions);

Cola.AST_VarDef = Cola.DEFNODE("VarDef", "name value type", {
    $documentation: "A variable declaration; only appears in a AST_Definitions node",
    $propdoc: {
        name: "[AST_SymbolVar|AST_SymbolConst] name of the variable",
        value: "[AST_Node?] initializer, or null of there's no initializer"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.name._walk(visitor);
            if (this.value) this.value._walk(visitor);
        });
    }
});

/* -----[ OTHER ]----- */

Cola.AST_Call = Cola.DEFNODE("Call", "expression args", {
    $documentation: "A function call expression",
    $propdoc: {
        expression: "[AST_Node] expression to invoke as function",
        args: "[AST_Node*] array of arguments"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            this.args.forEach(function(arg){
                arg._walk(visitor);
            });
        });
    }
});

Cola.AST_New = Cola.DEFNODE("New", null, {
    $documentation: "An object instantiation.  Derives from a function call since it has exactly the same properties"
}, Cola.AST_Call);

Cola.AST_Seq = Cola.DEFNODE("Seq", "car cdr", {
    $documentation: "A sequence expression (two comma-separated expressions)",
    $propdoc: {
        car: "[AST_Node] first element in sequence",
        cdr: "[AST_Node] second element in sequence"
    },
    $cons: function(x, y) {
        var seq = new Cola.AST_Seq(x);
        seq.car = x;
        seq.cdr = y;
        return seq;
    },
    $from_array: function(array) {
        if (array.length == 0) return null;
        if (array.length == 1) return array[0].clone();
        var list = null;
        for (var i = array.length; --i >= 0;) {
            list = Cola.AST_Seq.cons(array[i], list);
        }
        var p = list;
        while (p) {
            if (p.cdr && !p.cdr.cdr) {
                p.cdr = p.cdr.car;
                break;
            }
            p = p.cdr;
        }
        return list;
    },
    to_array: function() {
        var p = this, a = [];
        while (p) {
            a.push(p.car);
            if (p.cdr && !(p.cdr instanceof Cola.AST_Seq)) {
                a.push(p.cdr);
                break;
            }
            p = p.cdr;
        }
        return a;
    },
    add: function(node) {
        var p = this;
        while (p) {
            if (!(p.cdr instanceof Cola.AST_Seq)) {
                var cell = Cola.AST_Seq.cons(p.cdr, node);
                return p.cdr = cell;
            }
            p = p.cdr;
        }
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.car._walk(visitor);
            if (this.cdr) this.cdr._walk(visitor);
        });
    }
});

Cola.AST_PropAccess = Cola.DEFNODE("PropAccess", "expression property", {
    $documentation: "Base class for property access expressions, i.e. `a.foo` or `a[\"foo\"]`",
    $propdoc: {
        expression: "[AST_Node] the “container” expression",
        property: "[AST_Node|string] the property to access.  For AST_Dot this is always a plain string, while for AST_Sub it's an arbitrary AST_Node"
    }
});

Cola.AST_Dot = Cola.DEFNODE("Dot", null, {
    $documentation: "A dotted property access expression",
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
        });
    }
}, Cola.AST_PropAccess);

Cola.AST_Proto = Cola.DEFNODE("Proto", null, {
    $iscola: true,
    $documentation: "Accessor to prototype",
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
        });
    }
}, Cola.AST_PropAccess);

Cola.AST_CondAccess = Cola.DEFNODE("CondAccess", null, {
    $iscola: true,
    $documentation: "Conditional accessor",
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
        });
    }
}, Cola.AST_PropAccess);

Cola.AST_Cascade = Cola.DEFNODE("Cascade", "expression subexpressions", {
    $iscola: true,
    $documentation: "Base class for properties access expressions, i.e. `a..foo..bar`",
    $propdoc: {
        expression: "[AST_Node] the “container” expression",
        subexpressions: "[AST_Node*] actions with properties"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            this.subexpressions.forEach(function(subexpr){
                subexpr._walk(visitor);
            });
        });
    }
}, Cola.AST_PropAccess);

Cola.AST_Sub = Cola.DEFNODE("Sub", null, {
    $documentation: "Index-style property access, i.e. `a[\"foo\"]`",
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            this.property._walk(visitor);
        });
    }
}, Cola.AST_PropAccess);

Cola.AST_Unary = Cola.DEFNODE("Unary", "operator expression", {
    $documentation: "Base class for unary expressions",
    $propdoc: {
        operator: "[string] the operator",
        expression: "[AST_Node] expression that this unary operator applies to"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
        });
    }
});

Cola.AST_UnaryPrefix = Cola.DEFNODE("UnaryPrefix", null, {
    $documentation: "Unary prefix expression, i.e. `typeof i` or `++i`"
}, Cola.AST_Unary);

Cola.AST_UnaryPostfix = Cola.DEFNODE("UnaryPostfix", null, {
    $documentation: "Unary postfix expression, i.e. `i++`"
}, Cola.AST_Unary);

Cola.AST_Binary = Cola.DEFNODE("Binary", "left operator right", {
    $documentation: "Binary expression, i.e. `a + b`",
    $propdoc: {
        left: "[AST_Node] left-hand side expression",
        operator: "[string] the operator",
        right: "[AST_Node] right-hand side expression"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.left._walk(visitor);
            this.right._walk(visitor);
        });
    }
});

Cola.AST_Conditional = Cola.DEFNODE("Conditional", "condition consequent alternative", {
    $documentation: "Conditional expression using the ternary operator, i.e. `a ? b : c`",
    $propdoc: {
        condition: "[AST_Node]",
        consequent: "[AST_Node]",
        alternative: "[AST_Node]"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.condition._walk(visitor);
            this.consequent._walk(visitor);
            this.alternative._walk(visitor);
        });
    }
});

Cola.AST_Assign = Cola.DEFNODE("Assign", null, {
    $documentation: "An assignment expression — `a = b + 5`",
}, Cola.AST_Binary);

/* -----[ LITERALS ]----- */

Cola.AST_Array = Cola.DEFNODE("Array", "elements template vardef", {
    $documentation: "An array literal",
    $propdoc: {
        elements: "[AST_Node*] array of elements"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.elements.forEach(function(el){
                el._walk(visitor);
            });
        });
    }
});

Cola.AST_ArrayTemplate = Cola.DEFNODE("ArrayTemplate", null, {
    $iscola: true,
    $documentation: "Array assignment template.",
}, Cola.AST_Array);

Cola.AST_ArrayRange = Cola.DEFNODE("ArrayRange", "from to triple", {
    $iscola: true,
    $documentation: "An array range.",
    $propdoc: {
        from: "[AST_Node] range from",
        to: "[AST_Node] range to"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.from._walk(visitor);
            this.to._walk(visitor);
        });
    }
});

Cola.AST_Object = Cola.DEFNODE("Object", "properties template vardef", {
    $documentation: "An object literal",
    $propdoc: {
        properties: "[AST_ObjectProperty*] array of properties"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.properties.forEach(function(prop){
                prop._walk(visitor);
            });
        });
    }
});

Cola.AST_ObjectTemplate = Cola.DEFNODE("ObjectTemplate", null, {
    $iscola: true,
    $documentation: "Object assignment template.",
}, Cola.AST_Object);

Cola.AST_ObjectProperty = Cola.DEFNODE("ObjectProperty", "key value type", {
    $documentation: "Base class for literal object properties",
    $propdoc: {
        key: "[string] the property name converted to a string for ObjectKeyVal.  For setters and getters this is an arbitrary AST_Node.",
        value: "[AST_Node] property value.  For setters and getters this is an AST_Function."
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.value._walk(visitor);
        });
    }
});

Cola.AST_ObjectKeyVal = Cola.DEFNODE("ObjectKeyVal", null, {
    $documentation: "A key: value object property",
}, Cola.AST_ObjectProperty);

Cola.AST_ObjectSetter = Cola.DEFNODE("ObjectSetter", null, {
    $documentation: "An object setter property",
}, Cola.AST_ObjectProperty);

Cola.AST_ObjectGetter = Cola.DEFNODE("ObjectGetter", null, {
    $documentation: "An object getter property",
}, Cola.AST_ObjectProperty);

Cola.AST_Symbol = Cola.DEFNODE("Symbol", "scope name thedef", {
    $propdoc: {
        name: "[string] name of this symbol",
        scope: "[AST_Scope/S] the current scope (not necessarily the definition scope)",
        thedef: "[SymbolDef/S] the definition of this symbol"
    },
    $documentation: "Base class for all symbols",
});

Cola.AST_SymbolAccessor = Cola.DEFNODE("SymbolAccessor", null, {
    $documentation: "The name of a property accessor (setter/getter function)"
}, Cola.AST_Symbol);

Cola.AST_SymbolDeclaration = Cola.DEFNODE("SymbolDeclaration", "init", {
    $documentation: "A declaration symbol (symbol in var/const, function name or argument, symbol in catch)",
    $propdoc: {
        init: "[AST_Node*/S] array of initializers for this declaration."
    }
}, Cola.AST_Symbol);

Cola.AST_SymbolVar = Cola.DEFNODE("SymbolVar", null, {
    $documentation: "Symbol defining a variable",
}, Cola.AST_SymbolDeclaration);

Cola.AST_SymbolConst = Cola.DEFNODE("SymbolConst", null, {
    $documentation: "A constant declaration"
}, Cola.AST_SymbolDeclaration);

Cola.AST_SymbolClass = Cola.DEFNODE("SymbolClass", null, {
    $iscola: true,
    $documentation: "Symbol defining a class",
}, Cola.AST_SymbolDeclaration);

Cola.AST_SymbolSingleton = Cola.DEFNODE("SymbolSingleton", null, {
    $iscola: true,
    $documentation: "Symbol defining a singleton",
}, Cola.AST_SymbolDeclaration);

Cola.AST_SymbolFunarg = Cola.DEFNODE("SymbolFunarg", "type", {
    $documentation: "Symbol naming a function argument",
}, Cola.AST_SymbolVar);

Cola.AST_SymbolDefun = Cola.DEFNODE("SymbolDefun", null, {
    $documentation: "Symbol defining a function",
}, Cola.AST_SymbolDeclaration);

Cola.AST_SymbolLambda = Cola.DEFNODE("SymbolLambda", null, {
    $documentation: "Symbol naming a function expression",
}, Cola.AST_SymbolDeclaration);

Cola.AST_SymbolCatch = Cola.DEFNODE("SymbolCatch", null, {
    $documentation: "Symbol naming the exception in catch",
}, Cola.AST_SymbolDeclaration);

Cola.AST_Label = Cola.DEFNODE("Label", "references", {
    $documentation: "Symbol naming a label (declaration)",
    $propdoc: {
        references: "[AST_LoopControl*] a list of nodes referring to this label"
    },
    initialize: function() {
        this.references = [];
        this.thedef = this;
    }
}, Cola.AST_Symbol);

Cola.AST_SymbolRef = Cola.DEFNODE("SymbolRef", null, {
    $documentation: "Reference to some symbol (not definition/declaration)",
}, Cola.AST_Symbol);

Cola.AST_LabelRef = Cola.DEFNODE("LabelRef", null, {
    $documentation: "Reference to a label symbol",
}, Cola.AST_Symbol);

Cola.AST_This = Cola.DEFNODE("This", null, {
    $documentation: "The `this` symbol",
}, Cola.AST_Symbol);

Cola.AST_Constant = Cola.DEFNODE("Constant", null, {
    $documentation: "Base class for all constants",
    getValue: function() {
        return this.value;
    }
});

Cola.AST_String = Cola.DEFNODE("String", "value", {
    $documentation: "A string literal",
    $propdoc: {
        value: "[string] the contents of this string"
    }
}, Cola.AST_Constant);

Cola.AST_StringTemplate = Cola.DEFNODE("StringTemplate", "body", {
    $iscola: true,
    $documentation: "A string template",
    $propdoc: {
        body: "[AST_Statement*] the contents of this string template"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            Cola.walk_body(this, visitor);
        });
    }
}, Cola.AST_Statement);

Cola.AST_Number = Cola.DEFNODE("Number", "value", {
    $documentation: "A number literal",
    $propdoc: {
        value: "[number] the numeric value"
    }
}, Cola.AST_Constant);

Cola.AST_RegExp = Cola.DEFNODE("RegExp", "value", {
    $documentation: "A regexp literal",
    $propdoc: {
        value: "[RegExp] the actual regexp"
    }
}, Cola.AST_Constant);

Cola.AST_Atom = Cola.DEFNODE("Atom", null, {
    $documentation: "Base class for atoms",
}, Cola.AST_Constant);

Cola.AST_Null = Cola.DEFNODE("Null", null, {
    $documentation: "The `null` atom",
    value: null
}, Cola.AST_Atom);

Cola.AST_NaN = Cola.DEFNODE("NaN", null, {
    $documentation: "The impossible value",
    value: 0/0
}, Cola.AST_Atom);

Cola.AST_Undefined = Cola.DEFNODE("Undefined", null, {
    $documentation: "The `undefined` value",
    value: (function(){}())
}, Cola.AST_Atom);

Cola.AST_Hole = Cola.DEFNODE("Hole", null, {
    $documentation: "A hole in an array",
    value: (function(){}())
}, Cola.AST_Atom);

Cola.AST_Infinity = Cola.DEFNODE("Infinity", null, {
    $documentation: "The `Infinity` value",
    value: 1/0
}, Cola.AST_Atom);

Cola.AST_Boolean = Cola.DEFNODE("Boolean", null, {
    $documentation: "Base class for booleans",
}, Cola.AST_Atom);

Cola.AST_False = Cola.DEFNODE("False", null, {
    $documentation: "The `false` atom",
    value: false
}, Cola.AST_Boolean);

Cola.AST_True = Cola.DEFNODE("True", null, {
    $documentation: "The `true` atom",
    value: true
}, Cola.AST_Boolean);

/* -----[ TreeWalker ]----- */

Cola.TreeWalker = function (callback) {
    this.visit = callback;
    this.stack = [];
};
Cola.TreeWalker.prototype = {
    _visit: function(node, descend) {
        this.stack.push(node);
        var ret = this.visit(node, descend ? function(){
            descend.call(node);
        } : Cola.noop);
        if (!ret && descend) {
            descend.call(node);
        }
        this.stack.pop();
        return ret;
    },
    parent: function(n) {
        return this.stack[this.stack.length - 2 - (n || 0)];
    },
    push: function (node) {
        this.stack.push(node);
    },
    pop: function() {
        return this.stack.pop();
    },
    self: function() {
        return this.stack[this.stack.length - 1];
    },
    find_parent: function(type) {
        var stack = this.stack;
        for (var i = stack.length; --i >= 0;) {
            var x = stack[i];
            if (x instanceof type) return x;
        }
    },
    has_directive: function(type) {
        return this.find_parent(Cola.AST_Scope).has_directive(type);
    },
    in_boolean_context: function() {
        var stack = this.stack;
        var i = stack.length, self = stack[--i];
        while (i > 0) {
            var p = stack[--i];
            if ((p instanceof Cola.AST_If           && p.condition === self) ||
                (p instanceof Cola.AST_Conditional  && p.condition === self) ||
                (p instanceof Cola.AST_DWLoop       && p.condition === self) ||
                (p instanceof Cola.AST_For          && p.condition === self) ||
                (p instanceof Cola.AST_UnaryPrefix  && p.operator == "!" && p.expression === self))
            {
                return true;
            }
            if (!(p instanceof Cola.AST_Binary && (p.operator == "&&" || p.operator == "||")))
                return false;
            self = p;
        }
    },
    loopcontrol_target: function(label) {
        var stack = this.stack;
        if (label) for (var i = stack.length; --i >= 0;) {
            var x = stack[i];
            if (x instanceof Cola.AST_LabeledStatement && x.label.name == label.name) {
                return x.body;
            }
        } else for (var i = stack.length; --i >= 0;) {
            var x = stack[i];
            if (x instanceof Cola.AST_Switch || x instanceof Cola.AST_IterationStatement)
                return x;
        }
    }
};
