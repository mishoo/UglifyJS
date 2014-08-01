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

(function(){

    var MOZ_TO_ME = {
        ExpressionStatement: function(M) {
            var expr = M.expression;
            if (expr.type === "Literal" && typeof expr.value === "string") {
                return new AST_Directive({
                    start: my_start_token(M),
                    end: my_end_token(M),
                    value: expr.value
                });
            }
            return new AST_SimpleStatement({
                start: my_start_token(M),
                end: my_end_token(M),
                body: from_moz(expr)
            });
        },
        TryStatement: function(M) {
            return new AST_Try({
                start    : my_start_token(M),
                end      : my_end_token(M),
                body     : from_moz(M.block).body,
                bcatch   : from_moz(M.handlers ? M.handlers[0] : M.handler),
                bfinally : M.finalizer ? new AST_Finally(from_moz(M.finalizer)) : null
            });
        },
        Property: function(M) {
            var key = M.key;
            var name = key.type == "Identifier" ? key.name : key.value;
            var args = {
                start    : my_start_token(key),
                end      : my_end_token(M.value),
                key      : name,
                value    : from_moz(M.value)
            };
            switch (M.kind) {
              case "init":
                return new AST_ObjectKeyVal(args);
              case "set":
                args.value.name = from_moz(key);
                return new AST_ObjectSetter(args);
              case "get":
                args.value.name = from_moz(key);
                return new AST_ObjectGetter(args);
            }
        },
        ObjectExpression: function(M) {
            return new AST_Object({
                start      : my_start_token(M),
                end        : my_end_token(M),
                properties : M.properties.map(function(prop){
                    prop.type = "Property";
                    return from_moz(prop)
                })
            });
        },
        SequenceExpression: function(M) {
            return AST_Seq.from_array(M.expressions.map(from_moz));
        },
        MemberExpression: function(M) {
            return new (M.computed ? AST_Sub : AST_Dot)({
                start      : my_start_token(M),
                end        : my_end_token(M),
                property   : M.computed ? from_moz(M.property) : M.property.name,
                expression : from_moz(M.object)
            });
        },
        SwitchCase: function(M) {
            return new (M.test ? AST_Case : AST_Default)({
                start      : my_start_token(M),
                end        : my_end_token(M),
                expression : from_moz(M.test),
                body       : M.consequent.map(from_moz)
            });
        },
        VariableDeclaration: function(M) {
            return new (M.kind === "const" ? AST_Const : AST_Var)({
                start       : my_start_token(M),
                end         : my_end_token(M),
                definitions : M.declarations.map(from_moz)
            });
        },
        Literal: function(M) {
            var val = M.value, args = {
                start  : my_start_token(M),
                end    : my_end_token(M)
            };
            if (val === null) return new AST_Null(args);
            switch (typeof val) {
              case "string":
                args.value = val;
                return new AST_String(args);
              case "number":
                args.value = val;
                return new AST_Number(args);
              case "boolean":
                return new (val ? AST_True : AST_False)(args);
              default:
                args.value = val;
                return new AST_RegExp(args);
            }
        },
        UnaryExpression: From_Moz_Unary,
        UpdateExpression: From_Moz_Unary,
        Identifier: function(M) {
            var p = FROM_MOZ_STACK[FROM_MOZ_STACK.length - 2];
            return new (  p.type == "LabeledStatement" ? AST_Label
                        : p.type == "VariableDeclarator" && p.id === M ? (p.kind == "const" ? AST_SymbolConst : AST_SymbolVar)
                        : p.type == "FunctionExpression" ? (p.id === M ? AST_SymbolLambda : AST_SymbolFunarg)
                        : p.type == "FunctionDeclaration" ? (p.id === M ? AST_SymbolDefun : AST_SymbolFunarg)
                        : p.type == "CatchClause" ? AST_SymbolCatch
                        : p.type == "BreakStatement" || p.type == "ContinueStatement" ? AST_LabelRef
                        : AST_SymbolRef)({
                            start : my_start_token(M),
                            end   : my_end_token(M),
                            name  : M.name
                        });
        }
    };

    AST_Directive.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "ExpressionStatement",
            expression: set_moz_loc(this, {
                type: "Literal",
                value: this.value
            })
        });
    };

    AST_SimpleStatement.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "ExpressionStatement",
            expression: to_moz(this.body)
        });
    };

    AST_SwitchBranch.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "SwitchCase",
            test: to_moz(this.expression),
            consequent: this.body.map(to_moz)
        });
    };

    AST_Try.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "TryStatement",
            block: {
                type: "BlockStatement",
                body: this.body.map(to_moz)
            },
            handler: to_moz(this.bcatch),
            finalizer: this.bfinally ? this.bfinally.body.map(to_moz) : null
        });
    };

    AST_Definitions.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "VariableDeclaration",
            kind: this instanceof AST_Const ? "const" : "var",
            declarations: this.definitions.map(to_moz)
        });
    };

    AST_Seq.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "SequenceExpression",
            expressions: this.to_array().map(to_moz)
        });
    };

    AST_PropAccess.prototype.to_mozilla_ast = function() {
        var isComputed = this instanceof AST_Sub;
        return set_moz_loc(this, {
            type: "MemberExpression",
            object: to_moz(this.expression),
            computed: isComputed,
            property: isComputed ? to_moz(this.property) : {type: "Identifier", name: this.property}
        });
    };

    AST_Unary.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: this.operator == "++" || this.operator == "--" ? "UpdateExpression" : "UnaryExpression",
            operator: this.operator,
            prefix: this instanceof AST_UnaryPrefix,
            argument: to_moz(this.argument)
        });
    };

    AST_Object.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "ObjectExpression",
            properties: this.properties.map(to_moz)
        });
    };

    AST_ObjectProperty.prototype.to_mozilla_ast = function() {
        var key;
        if (is_identifier_string(this.key) && !RESERVED_WORDS(this.key)) {
            key = {type: "Identifier", name: this.key};
        } else {
            key = {type: "Literal", value: this.key};
        }
        var kind;
        if (this instanceof AST_ObjectKeyVal) {
            kind = "init";
        } else
        if (this instanceof AST_ObjectGetter) {
            kind = "get";
        } else
        if (this instanceof AST_ObjectSetter) {
            kind = "set";
        }
        return set_moz_loc(this, {
            type: "Property",
            kind: kind,
            key: key,
            value: to_moz(this.value)
        });
    };

    AST_Symbol.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "Identifier",
            name: this.name
        });
    };

    AST_Null.prototype.to_mozilla_ast =
    AST_Boolean.prototype.to_mozilla_ast =
    AST_Constant.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "Literal",
            value: this.value
        });
    };

    AST_Atom.prototype.to_mozilla_ast = function() {
        return set_moz_loc(this, {
            type: "Identifier",
            name: String(this.value)
        });
    };

    AST_Hole.prototype.to_mozilla_ast = function() {
        return null;
    };

    function From_Moz_Unary(M) {
        var prefix = "prefix" in M ? M.prefix
            : M.type == "UnaryExpression" ? true : false;
        return new (prefix ? AST_UnaryPrefix : AST_UnaryPostfix)({
            start      : my_start_token(M),
            end        : my_end_token(M),
            operator   : M.operator,
            expression : from_moz(M.argument)
        });
    };

    map("Program", AST_Toplevel, "body@body");
    map("EmptyStatement", AST_EmptyStatement);
    map("BlockStatement", AST_BlockStatement, "body@body");
    map("IfStatement", AST_If, "test>condition, consequent>body, alternate>alternative");
    map("LabeledStatement", AST_LabeledStatement, "label>label, body>body");
    map("BreakStatement", AST_Break, "label>label");
    map("ContinueStatement", AST_Continue, "label>label");
    map("WithStatement", AST_With, "object>expression, body>body");
    map("SwitchStatement", AST_Switch, "discriminant>expression, cases@body");
    map("ReturnStatement", AST_Return, "argument>value");
    map("ThrowStatement", AST_Throw, "argument>value");
    map("WhileStatement", AST_While, "test>condition, body>body");
    map("DoWhileStatement", AST_Do, "test>condition, body>body");
    map("ForStatement", AST_For, "init>init, test>condition, update>step, body>body");
    map("ForInStatement", AST_ForIn, "left>init, right>object, body>body");
    map("DebuggerStatement", AST_Debugger);
    map("FunctionDeclaration", AST_Defun, "id>name, params@argnames, body%body");
    map("VariableDeclarator", AST_VarDef, "id>name, init>value");
    map("CatchClause", AST_Catch, "param>argname, body%body");

    map("ThisExpression", AST_This);
    map("ArrayExpression", AST_Array, "elements@elements");
    map("FunctionExpression", AST_Function, "id>name, params@argnames, body%body");
    map("BinaryExpression", AST_Binary, "operator=operator, left>left, right>right");
    map("LogicalExpression", AST_Binary, "operator=operator, left>left, right>right");
    map("AssignmentExpression", AST_Assign, "operator=operator, left>left, right>right");
    map("ConditionalExpression", AST_Conditional, "test>condition, consequent>consequent, alternate>alternative");
    map("NewExpression", AST_New, "callee>expression, arguments@args");
    map("CallExpression", AST_Call, "callee>expression, arguments@args");

    AST_Accessor.prototype.to_mozilla_ast = AST_Function.prototype.to_mozilla_ast;

    AST_Binary.prototype.to_mozilla_ast = function () {
        return {
            type: this.operator == "&&" || this.operator == "||" ? "LogicalExpression" : "BinaryExpression",
            left: to_moz(this.left),
            operator: this.operator,
            right: to_moz(this.right)
        };
    };

    /* -----[ tools ]----- */

    function my_start_token(moznode) {
        var loc = moznode.loc;
        var range = moznode.range;
        return new AST_Token({
            file   : loc && loc.source,
            line   : loc && loc.start.line,
            col    : loc && loc.start.column,
            pos    : range ? range[0] : moznode.start,
            endpos : range ? range[0] : moznode.start
        });
    };

    function my_end_token(moznode) {
        var loc = moznode.loc;
        var range = moznode.range;
        return new AST_Token({
            file   : loc && loc.source,
            line   : loc && loc.end.line,
            col    : loc && loc.end.column,
            pos    : range ? range[1] : moznode.end,
            endpos : range ? range[1] : moznode.end
        });
    };

    function moz_sub_loc(token) {
        return token.line ? {
            line: token.line,
            column: token.col
        } : null;
    };

    function set_moz_loc(mynode, moznode) {
        var start = mynode.start;
        var end = mynode.end;
        if (start.pos != null && end.pos != null) {
            moznode.range = [start.pos, end.pos];
        }
        if (start.line) {
            moznode.loc = {
                start: moz_sub_loc(start),
                end: moz_sub_loc(end)
            };
            if (start.file) {
                moznode.loc.source = start.file;
            }
        }
        return moznode;
    };

    function map(moztype, mytype, propmap) {
        var moz_to_me = "function From_Moz_" + moztype + "(M){\n";
        moz_to_me += "return new mytype({\n" +
            "start: my_start_token(M),\n" +
            "end: my_end_token(M)";

        var me_to_moz = "function To_Moz_" + moztype + "(){\n";
        me_to_moz += "return set_moz_loc(this, {\n" +
            "type: moztype";

        if (propmap) propmap.split(/\s*,\s*/).forEach(function(prop){
            var m = /([a-z0-9$_]+)(=|@|>|%)([a-z0-9$_]+)/i.exec(prop);
            if (!m) throw new Error("Can't understand property map: " + prop);
            var moz = m[1], how = m[2], my = m[3];
            moz_to_me += ",\n" + my + ": ";
            me_to_moz += ",\n" + moz + ": ";
            switch (how) {
                case "@":
                    moz_to_me += "M." + moz + ".map(from_moz)";
                    me_to_moz += "this." +  my + ".map(to_moz)";
                    break;
                case ">":
                    moz_to_me += "from_moz(M." + moz + ")";
                    me_to_moz += "to_moz(this." + my + ")";
                    break;
                case "=":
                    moz_to_me += "M." + moz;
                    me_to_moz += "this." + my;
                    break;
                case "%":
                    moz_to_me += "from_moz(M." + moz + ").body";
                    me_to_moz += "{type: \"BlockStatement\", body: this." + my + ".map(to_moz)}";
                    break;
                default:
                    throw new Error("Can't understand operator in propmap: " + prop);
            }
        });

        moz_to_me += "\n})\n}";
        me_to_moz += "\n})\n}";

        moz_to_me = parse(moz_to_me).print_to_string({ beautify: true });
        me_to_moz = parse(me_to_moz).print_to_string({ beautify: true });
        //console.log(moz_to_me);

        moz_to_me = new Function("mytype", "my_start_token", "my_end_token", "from_moz", "return(" + moz_to_me + ")")(
            mytype, my_start_token, my_end_token, from_moz
        );
        me_to_moz = new Function("moztype", "set_moz_loc", "to_moz", "return(" + me_to_moz + ")")(
            moztype, set_moz_loc, to_moz
        );
        MOZ_TO_ME[moztype] = moz_to_me;
        mytype.prototype.to_mozilla_ast = me_to_moz;
    };

    var FROM_MOZ_STACK = null, TO_MOZ_STACK = null;

    function from_moz(node) {
        FROM_MOZ_STACK.push(node);
        var ret = node != null ? MOZ_TO_ME[node.type](node) : null;
        FROM_MOZ_STACK.pop();
        return ret;
    };

    AST_Node.from_mozilla_ast = function(node){
        var save_stack = FROM_MOZ_STACK;
        FROM_MOZ_STACK = [];
        var ast = from_moz(node);
        FROM_MOZ_STACK = save_stack;
        return ast;
    };

    function to_moz(node) {
        return node != null ? node.to_mozilla_ast() : null;
    };

})();
