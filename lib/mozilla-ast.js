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
        TryStatement : function(M) {
            return new Cola.AST_Try({
                start    : my_start_token(M),
                end      : my_end_token(M),
                body     : from_moz(M.block).body,
                bcatch   : from_moz(M.handlers[0]),
                bfinally : M.finalizer ? new Cola.AST_Finally(from_moz(M.finalizer)) : null
            });
        },
        CatchClause : function(M) {
            return new Cola.AST_Catch({
                start   : my_start_token(M),
                end     : my_end_token(M),
                argname : from_moz(M.param),
                body    : from_moz(M.body).body
            });
        },
        ObjectExpression : function(M) {
            return new Cola.AST_Object({
                start      : my_start_token(M),
                end        : my_end_token(M),
                properties : M.properties.map(function(prop){
                    var key = prop.key;
                    var name = key.type == "Identifier" ? key.name : key.value;
                    var args = {
                        start    : my_start_token(key),
                        end      : my_end_token(prop.value),
                        key      : name,
                        value    : from_moz(prop.value)
                    };
                    switch (prop.kind) {
                      case "init":
                        return new Cola.AST_ObjectKeyVal(args);
                      case "set":
                        args.value.name = from_moz(key);
                        return new Cola.AST_ObjectSetter(args);
                      case "get":
                        args.value.name = from_moz(key);
                        return new Cola.AST_ObjectGetter(args);
                    }
                })
            });
        },
        SequenceExpression : function(M) {
            return Cola.AST_Seq.from_array(M.expressions.map(from_moz));
        },
        MemberExpression : function(M) {
            return new (M.computed ? Cola.AST_Sub : Cola.AST_Dot)({
                start      : my_start_token(M),
                end        : my_end_token(M),
                property   : M.computed ? from_moz(M.property) : M.property.name,
                expression : from_moz(M.object)
            });
        },
        SwitchCase : function(M) {
            return new (M.test ? Cola.AST_Case : Cola.AST_Default)({
                start      : my_start_token(M),
                end        : my_end_token(M),
                expression : from_moz(M.test),
                body       : M.consequent.map(from_moz)
            });
        },
        Literal : function(M) {
            var val = M.value, args = {
                start  : my_start_token(M),
                end    : my_end_token(M)
            };
            if (val === null) return new Cola.AST_Null(args);
            switch (typeof val) {
              case "string":
                args.value = val;
                return new Cola.AST_String(args);
              case "number":
                args.value = val;
                return new Cola.AST_Number(args);
              case "boolean":
                return new (val ? Cola.AST_True : Cola.AST_False)(args);
              default:
                args.value = val;
                return new Cola.AST_RegExp(args);
            }
        },
        UnaryExpression: From_Moz_Unary,
        UpdateExpression: From_Moz_Unary,
        Identifier: function(M) {
            var p = FROM_MOZ_STACK[FROM_MOZ_STACK.length - 2];
            return new (M.name == "this" ? Cola.AST_This
                        : p.type == "LabeledStatement" ? Cola.AST_Label
                        : p.type == "VariableDeclarator" && p.id === M ? (p.kind == "const" ? Cola.AST_SymbolConst : Cola.AST_SymbolVar)
                        : p.type == "FunctionExpression" ? (p.id === M ? Cola.AST_SymbolLambda : Cola.AST_SymbolFunarg)
                        : p.type == "FunctionDeclaration" ? (p.id === M ? Cola.AST_SymbolDefun : Cola.AST_SymbolFunarg)
                        : p.type == "CatchClause" ? Cola.AST_SymbolCatch
                        : p.type == "BreakStatement" || p.type == "ContinueStatement" ? Cola.AST_LabelRef
                        : Cola.AST_SymbolRef)({
                            start : my_start_token(M),
                            end   : my_end_token(M),
                            name  : M.name
                        });
        }
    };

    function From_Moz_Unary(M) {
        var prefix = "prefix" in M ? M.prefix
            : M.type == "UnaryExpression" ? true : false;
        return new (prefix ? Cola.AST_UnaryPrefix : Cola.AST_UnaryPostfix)({
            start      : my_start_token(M),
            end        : my_end_token(M),
            operator   : M.operator,
            expression : from_moz(M.argument)
        });
    };

    var ME_TO_MOZ = {};

    map("Node", Cola.AST_Node);
    map("Program", Cola.AST_Toplevel, "body@body");
    map("Function", Cola.AST_Function, "id>name, params@argnames, body%body");
    map("EmptyStatement", Cola.AST_EmptyStatement);
    map("BlockStatement", Cola.AST_BlockStatement, "body@body");
    map("ExpressionStatement", Cola.AST_SimpleStatement, "expression>body");
    map("IfStatement", Cola.AST_If, "test>condition, consequent>body, alternate>alternative");
    map("LabeledStatement", Cola.AST_LabeledStatement, "label>label, body>body");
    map("BreakStatement", Cola.AST_Break, "label>label");
    map("ContinueStatement", Cola.AST_Continue, "label>label");
    map("WithStatement", Cola.AST_With, "object>expression, body>body");
    map("SwitchStatement", Cola.AST_Switch, "discriminant>expression, cases@body");
    map("ReturnStatement", Cola.AST_Return, "argument>value");
    map("ThrowStatement", Cola.AST_Throw, "argument>value");
    map("WhileStatement", Cola.AST_While, "test>condition, body>body");
    map("DoWhileStatement", Cola.AST_Do, "test>condition, body>body");
    map("ForStatement", Cola.AST_For, "init>init, test>condition, update>step, body>body");
    map("ForInStatement", Cola.AST_ForIn, "left>init, right>object, body>body");
    map("DebuggerStatement", Cola.AST_Debugger);
    map("FunctionDeclaration", Cola.AST_Defun, "id>name, params@argnames, body%body");
    map("VariableDeclaration", Cola.AST_Var, "declarations@definitions");
    map("VariableDeclarator", Cola.AST_VarDef, "id>name, init>value");

    map("ThisExpression", Cola.AST_This);
    map("ArrayExpression", Cola.AST_Array, "elements@elements");
    map("FunctionExpression", Cola.AST_Function, "id>name, params@argnames, body%body");
    map("BinaryExpression", Cola.AST_Binary, "operator=operator, left>left, right>right");
    map("AssignmentExpression", Cola.AST_Assign, "operator=operator, left>left, right>right");
    map("LogicalExpression", Cola.AST_Binary, "operator=operator, left>left, right>right");
    map("ConditionalExpression", Cola.AST_Conditional, "test>condition, consequent>consequent, alternate>alternative");
    map("NewExpression", Cola.AST_New, "callee>expression, arguments@args");
    map("CallExpression", Cola.AST_Call, "callee>expression, arguments@args");

    /* -----[ tools ]----- */

    function my_start_token(moznode) {
        return new Cola.AST_Token({
            file   : moznode.loc && moznode.loc.source,
            line   : moznode.loc && moznode.loc.start.line,
            col    : moznode.loc && moznode.loc.start.column,
            pos    : moznode.start,
            endpos : moznode.start
        });
    };

    function my_end_token(moznode) {
        return new Cola.AST_Token({
            file   : moznode.loc && moznode.loc.source,
            line   : moznode.loc && moznode.loc.end.line,
            col    : moznode.loc && moznode.loc.end.column,
            pos    : moznode.end,
            endpos : moznode.end
        });
    };

    function map(moztype, mytype, propmap) {
        var moz_to_me = "function From_Moz_" + moztype + "(M){\n";
        moz_to_me += "return new mytype({\n" +
            "start: my_start_token(M),\n" +
            "end: my_end_token(M)";

        if (propmap) propmap.split(/\s*,\s*/).forEach(function(prop){
            var m = /([a-z0-9$_]+)(=|@|>|%)([a-z0-9$_]+)/i.exec(prop);
            if (!m) throw new Error("Can't understand property map: " + prop);
            var moz = "M." + m[1], how = m[2], my = m[3];
            moz_to_me += ",\n" + my + ": ";
            if (how == "@") {
                moz_to_me += moz + ".map(from_moz)";
            } else if (how == ">") {
                moz_to_me += "from_moz(" + moz + ")";
            } else if (how == "=") {
                moz_to_me += moz;
            } else if (how == "%") {
                moz_to_me += "from_moz(" + moz + ").body";
            } else throw new Error("Can't understand operator in propmap: " + prop);
        });
        moz_to_me += "\n})}";

        // moz_to_me = parse(moz_to_me).print_to_string({ beautify: true });
        // console.log(moz_to_me);

        moz_to_me = new Function("mytype", "my_start_token", "my_end_token", "from_moz", "return(" + moz_to_me + ")")(
            mytype, my_start_token, my_end_token, from_moz
        );
        return MOZ_TO_ME[moztype] = moz_to_me;
    };

    var FROM_MOZ_STACK = null;

    function from_moz(node) {
        FROM_MOZ_STACK.push(node);
        var ret = node != null ? MOZ_TO_ME[node.type](node) : null;
        FROM_MOZ_STACK.pop();
        return ret;
    };

    Cola.AST_Node.from_mozilla_ast = function(node){
        var save_stack = FROM_MOZ_STACK;
        FROM_MOZ_STACK = [];
        var ast = from_moz(node);
        FROM_MOZ_STACK = save_stack;
        return ast;
    };

})();
