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

Cola.Constructions = {};

Cola.Constructions.setPos = function(node, ext){
    if(!ext) return node;
    if(ext.start) node.start = ext.start;
    if(ext.end) node.end = ext.end;
    return node;
};

/*
    !(typeof {{node}} === "undefined" || {{node}} === null)

*/
Cola.Constructions.IsSet = function(node, ext){
    return this.setPos(new Cola.AST_UnaryPrefix({
        expression : new Cola.AST_Binary({
            right    : new Cola.AST_Binary({
                right    : new Cola.AST_Null,
                operator : "===",
                left     : node
            }),
            operator : "||",
            left     : new Cola.AST_Binary({
                right    : new Cola.AST_String({ value: "undefined" }),
                operator : "===",
                left     : new Cola.AST_UnaryPrefix({
                    expression : node,
                    operator   : "typeof"
                })
            })
        }),
        operator   : "!"
    }), ext);
};

/*
    (typeof {{node}} === "undefined" || {{node}} === null)

*/
Cola.Constructions.IsntSet = function(node, ext){
    return this.setPos(new Cola.AST_Binary({
        right    : new Cola.AST_Binary({
            right    : new Cola.AST_Null,
            operator : "===",
            left     : node
        }),
        operator : "||",
        left     : new Cola.AST_Binary({
            right    : new Cola.AST_String({ value: "undefined" }),
            operator : "===",
            left     : new Cola.AST_UnaryPrefix({
                expression : node,
                operator   : "typeof"
            })
        })
    }), ext);
};

/*
    {{length}} <= {{name}}.length ? [].slice.call({{name}}, {{pos}}, $_cola{{uid}}i = {{name}}.length - {{after}}) : ($_cola{{uid}}i = {{pos}}, [])

*/
Cola.Constructions.SplatedConditional = function(name, uid, pos, after, length){
    if(Cola.$_cola_is(name, String)) name = new Cola.AST_SymbolRef({ name : name });
    return new Cola.AST_Conditional({
        condition   : new Cola.AST_Binary({
            operator  : "<=",
            left      : new Cola.AST_Number({ value : length }), // length
            right     : new Cola.AST_Dot({
                expression : name, // name
                property   : "length"
            })
        }),
        consequent  : new Cola.AST_Call({
            expression  : new Cola.AST_Dot({ 
                property   : "call",
                expression : new Cola.AST_Dot({
                    property   : "slice",
                    expression : new Cola.AST_Array({ elements : [] })
                })
            }),
            args        : [
                name, // name
                new Cola.AST_Number({ value : pos }), // pos
                new Cola.AST_Assign({
                    operator : '=',
                    left     : new Cola.AST_SymbolRef({ name :  "$_cola" + uid + "i" }),
                    right    : new Cola.AST_Binary({
                        operator : '-',
                        left     : new Cola.AST_Dot({
                            property   : "length",
                            expression : name // name
                        }),
                        right    : new Cola.AST_Number({ value : after }) // after
                    })
                })
            ]
        }),
        alternative : new Cola.AST_Seq({
            car : new Cola.AST_Assign({
                operator : '=',
                left     : new Cola.AST_SymbolRef({ name :  "$_cola" + uid + "i" }),
                right    : new Cola.AST_Number({ value : pos }) // pos
            }),
            cdr : new Cola.AST_Array({ elements : [] })
        })
    });
};

/*
    {{name}} = {{length}} <= arguments.length ? [].slice.call(arguments, {{pos}}, $_cola_i = arguments.length - {{after}}) : ($_cola_i = {{pos}}, [])

*/
Cola.Constructions.SplatedVarDef = function(name, pos, after, length){
    if(Cola.$_cola_is(name, String)) name = { name : name };
    return new Cola.AST_VarDef({
        type  : "Array",
        name  : new Cola.AST_SymbolVar(name), // name
        value : Cola.Constructions.SplatedConditional('arguments', '_', pos, after, length)
    });
};

Cola.Constructions.PosedVarDef = function(name, type, pos, aftersplated){
    if(Cola.$_cola_is(name, String)) name = { name : name };
    return new Cola.AST_VarDef({
        type  : type,
        name  : new Cola.AST_SymbolVar(name),
        value : new Cola.AST_Sub({
            expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
            property   : aftersplated == -1
                ? new Cola.AST_Number({ value : pos })
                : new Cola.AST_Binary({
                    operator : '+',
                    left     : new Cola.AST_SymbolRef({ name : '$_cola_i' }),
                    right    : new Cola.AST_Number({ value : aftersplated })
                })
        })
    });
};

Cola.Constructions.PosedWithDefsVarDef = function(name, type, defval, pos, aftersplated){
    if(Cola.$_cola_is(name, String)) name = { name : name };
    return new Cola.AST_VarDef({
        type  : type,
        name  : new Cola.AST_SymbolVar(name),
        value : new Cola.AST_Conditional({
            condition   : new Cola.AST_Binary({
                operator : "!==",
                left     : new Cola.AST_Sub({
                    expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                    property   : aftersplated == -1
                        ? new Cola.AST_Number({ value : pos })
                        : new Cola.AST_Binary({
                            operator : '+',
                            left     : new Cola.AST_SymbolRef({ name : '$_cola_i' }),
                            right    : new Cola.AST_Number({ value : aftersplated })
                        })
                }),
                right    : new Cola.AST_SymbolRef({ name : 'undefined' })
            }),
            consequent  : new Cola.AST_Sub({
                expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                property   : aftersplated == -1
                    ? new Cola.AST_Number({ value : pos })
                    : new Cola.AST_Binary({
                        operator : '+',
                        left     : new Cola.AST_SymbolRef({ name : '$_cola_i' }),
                        right    : new Cola.AST_Number({ value : aftersplated })
                    })
            }),
            alternative : defval
        })
    });
};

Cola.Constructions.NamedVarDef = function(name, type, defval, key){
    if(Cola.$_cola_is(name, String)) name = { name : name };
    return new Cola.AST_VarDef({
        type  : type,
        name  : new Cola.AST_SymbolVar(name),
        value : new Cola.AST_Conditional({
            condition   : new Cola.AST_Binary({
                operator : "!==",
                left     : new Cola.AST_Dot({
                    expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                    property   : key
                }),
                right    : new Cola.AST_SymbolRef({ name : 'undefined' })
            }),
            consequent  : new Cola.AST_Dot({
                expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                property   : key
            }),
            alternative : defval
        })
    });
};


Cola.AST_Toplevel.prototype.toJavaScript = function(options){
    if(this.language == 'js') return this;
    this.language = 'js';

    options = Cola.defaults(options, {
        main_binding : true,
        main_event   : 'DOMContentLoaded',
        parser       : {},
        std          : true,
        path         : ""
    });

    var $_cola_ast = Cola.parse(Cola.$_cola, { is_js : true }), 
        $_cola_hash = {}, 

        _this,

        required = [], required_hash = {},

    tt = new Cola.TreeTransformer(function(node, descend, in_list){
        var newNode, props = {}, parent = this.parent();
        node = node.clone();

        /*
            main(){
                console.log("hello world");
            }

            to

            window.addEventListener('DOMContentLoaded',
            function main(){
                console.log("hello world");
            }, false);

        */
        if(options.main_binding && parent instanceof Cola.AST_Toplevel && node instanceof Cola.AST_Defun && node.name instanceof Cola.AST_SymbolDefun && node.name.name == "main"){
            node.name = new Cola.AST_SymbolLambda(node.name);
            node = new Cola.AST_Function(node);

            props = {
                args       : [new Cola.AST_String({ value : options.main_event }), node, new Cola.AST_False()],
                expression : new Cola.AST_Dot({
                    property   : 'addEventListener',
                    expression : new Cola.AST_SymbolRef({ name : 'window' })
                })
            };
            
            node = new Cola.AST_SimpleStatement({
                start : node.start,
                end   : node.left,
                body  : new Cola.AST_Call(props)
            });
        } else

        /*
            5 ** 2

            to

            Math.pow(5, 2)
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == '**'){
            props = {
                start      : node.start,
                end        : node.left,
                args       : [node.left, node.right],
                expression : new Cola.AST_Dot({
                    property   : 'pow',
                    expression : new Cola.AST_SymbolRef({ name : 'Math' })
                })
            };

            node = new Cola.AST_Call(props);
        } else 

        /*
            5 %% 2

            to

            $_cola_modulo(5, 2)
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == '%%'){
            $_cola_hash[Cola.$_cola_modulo.i] = true;
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.left, node.right],
                expression : new Cola.AST_SymbolRef({ name  : '$_cola_modulo' })
            };
    
            node = new Cola.AST_Call(props);
        } else 

        /*
            a ?= b;

            to

            if(typeof a === "undefined" || a === null) a = b;
            
        */
        if(node instanceof Cola.AST_SimpleStatement && node.body instanceof Cola.AST_Assign && node.body.operator == '?='){
            if(node.body.left instanceof Cola.AST_Sub && node.body.left.property instanceof Cola.AST_Noop){
                props = {
                    property   : "length",
                    expression : node.body.left.expression
                };
                props = {
                    operator : "-",
                    left     : new Cola.AST_Dot(props),
                    right    : new Cola.AST_Number({ value : 1 })
                };

                node.body.left.property = new Cola.AST_Binary(props);
            }

            node.body.operator = '=';
            node = new Cola.AST_If({
                start     : node.start,
                end       : node.end,
                body      : node.clone(),
                condition : Cola.Constructions.IsntSet(node.body.left)
            });
        } else 

        /*
            func(a ?= b);

            to

            func(typeof a === "undefined" || a === null ? a = b : a);
            
        */
        if(node instanceof Cola.AST_Assign && node.operator == '?='){
            if(node.left instanceof Cola.AST_Sub && node.left.property instanceof Cola.AST_Noop){
                props = {
                    property   : "length",
                    expression : node.left.expression
                };
                props = {
                    operator : "-",
                    left     : new Cola.AST_Dot(props),
                    right    : new Cola.AST_Number({ value : 1})
                };

                node.left.property = new Cola.AST_Binary(props);
            }

            node.operator = '=';
            node = new Cola.AST_Conditional({
                start       : node.start,
                end         : node.end,
                condition   : Cola.Constructions.IsntSet(node.left),
                consequent  : node.clone(),
                alternative : node.left
            });
        } else 

        /*
            a ? b

            to

            !(typeof a === "undefined" || a === null) ? a : b
            
        */
        if(node instanceof Cola.AST_Conditional && node.alternative instanceof Cola.AST_Noop){
            node.alternative = node.consequent;
            node.consequent = node.condition;
            node.condition = Cola.Constructions.IsSet(node.condition);
        } else 

        /*
            123 is NaN

            to

            isNaN(123)
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == 'is' && node.right instanceof Cola.AST_SymbolRef && node.right.name == "NaN"){
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.left],
                expression : new Cola.AST_SymbolRef({ name : 'isNaN' })
            };

            node = new Cola.AST_Call(props);
        } else 

        /*
            123 isnt NaN

            to

            !isNaN(123)
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == 'isnt' && node.right instanceof Cola.AST_SymbolRef && node.right.name == "NaN"){
            props = {
                args       : [node.left],
                expression : new Cola.AST_SymbolRef({ name : 'isNaN' })
            };
            props = {
                start      : node.start,
                end        : node.end,
                operator   : '!',
                expression : new Cola.AST_Call(props)
            };

            node = new Cola.AST_UnaryPrefix(props);
        } else 

        /*
            123 is Number

            to

            $_cola_is(123, Number)
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == 'is'){
            $_cola_hash[Cola.$_cola_is.i] = true;
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.left, node.right],
                expression : new Cola.AST_SymbolRef({ name : '$_cola_is' })
            };

            node = new Cola.AST_Call(props);
        } else 

        /*
            true isnt String

            to

            $_cola_isnt(true, String);
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == 'isnt'){
            $_cola_hash[Cola.$_cola_isnt.i] = true;
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.left, node.right],
                expression : new Cola.AST_SymbolRef({ name : '$_cola_isnt' })
            };

            node = new Cola.AST_Call(props);
        } else 

        /*
            isset a

            to

            $_cola_isset(a)
            
        */
        if(node instanceof Cola.AST_UnaryPrefix && node.operator == 'isset'){
            node = Cola.Constructions.IsSet(node.expression, node);
        } else 

        /*
            a = clone b

            to

            a = $_cola_clone(b)
            
        */
        if(node instanceof Cola.AST_UnaryPrefix && node.operator == 'clone'){
            $_cola_hash[Cola.$_cola_clone.i] = true;
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.expression],
                expression : new Cola.AST_SymbolRef({ name : '$_cola_clone' })
            };

            node = new Cola.AST_Call(props);
        } else

        /*
            arr[] = 123

            to

            arr.push(123)
            
        */
        if(node instanceof Cola.AST_Assign && node.operator == "=" && node.left instanceof Cola.AST_Sub && node.left.property instanceof Cola.AST_Noop){
            props = {
                property   : "push",
                expression : node.left.expression
            };
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.right],
                expression : new Cola.AST_Dot(props)
            };

            node = new Cola.AST_Call(props);
        } else

        /*
            arr[] /= 2

            to

            arr[arr.length - 1] /= 2
            
        */
        if(node instanceof Cola.AST_Assign && node.operator != "=" && node.left instanceof Cola.AST_Sub && node.left.property instanceof Cola.AST_Noop){
            props = {
                property   : "length",
                expression : node.left.expression
            };
            props = {
                operator : "-",
                left     : new Cola.AST_Dot(props),
                right    : new Cola.AST_Number({ value : 1})
            };

            node.left.property = new Cola.AST_Binary(props);
        } else

        /*
            func(arr[])

            to

            func($_cola_array_last(arr))
            
        */
        if(node instanceof Cola.AST_Sub && node.property instanceof Cola.AST_Noop){
            $_cola_hash[Cola.$_cola_array_last.i] = true;
            props = {
                start      : node.start, 
                end        : node.end, 
                args       : [node.expression],
                expression : new Cola.AST_SymbolRef({ name  : '$_cola_array_last' })
            };

            node = new Cola.AST_Call(props);
        } else

        /*
            arr[0..1] = 123

            to

            $_cola_array_asplice(arr, 0, 1, 123)
            
        */
        if(node instanceof Cola.AST_Assign && node.operator == '=' && node.left instanceof Cola.AST_Sub && node.left.property instanceof Cola.AST_ArrayRange){
            $_cola_hash[Cola.$_cola_array_asplice.i] = true;
            props = {
                start      : node.start,
                end        : node.end, 
                args       : [node.left.expression, node.left.property.from, node.left.property.to, node.right],
                expression : new Cola.AST_SymbolRef({ name  : '$_cola_array_asplice' })
            };

            if(node.left.property.to instanceof Cola.AST_Noop) props.args[2] = new Cola.AST_Number({ value : '9e9' });
            else if(node.left.property.triple) props.args[2] = new Cola.AST_Binary({
                operator : "-",
                left     : node.left.property.to,
                right    : new Cola.AST_Number({ value : 1 })
            });

            node = new Cola.AST_Call(props);
        } else

        /*
            func(arr[0..1])

            to

            func(arr.slice(0, 1 + 1))
            
        */
        if(node instanceof Cola.AST_Sub && node.property instanceof Cola.AST_ArrayRange){
            props = {
                property   : "slice",
                expression : node.expression
            };
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.property.from],
                expression : new Cola.AST_Dot(props)
            };

            if(!node.property.triple && !(node.property.to instanceof Cola.AST_Noop)) props.args[1] = new Cola.AST_Binary({
                operator : "+",
                left     : node.property.to,
                right    : new Cola.AST_Number({ value : 1 })
            }); else 
            if(!(node.property.to instanceof Cola.AST_Noop))  props.args[1] = node.property.to;


            node = new Cola.AST_Call(props);
        } else

        /*
            [0..3]

            to

            $_cola_array_range(0, 3)
            
        */
        if(node instanceof Cola.AST_ArrayRange){
            $_cola_hash[Cola.$_cola_array_range.i] = true;
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.from, node.to],
                expression : new Cola.AST_SymbolRef({ name : '$_cola_array_range' })
            };

            if(node.triple) props.args[1] = new Cola.AST_Binary({
                operator : "-",
                left     : node.to,
                right    : new Cola.AST_Number({ value : 1 })
            });

            node = new Cola.AST_Call(props);
        } else

        /*
            func(a, b, name : name, c)

            to

            func(a, b, c, new $_cola_func_named_args({ name : name }))
            
        */
        if(node instanceof Cola.AST_Call){
            props = { properties : [] };
            
            var delQueue = [];
            node.args.forEach(function(val, i){
                if(!(val instanceof Cola.AST_Namedarg)) return;

                $_cola_hash[Cola.$_cola_func_named_args.i] = true;
                delQueue.push(i);

                props.properties.push(new Cola.AST_ObjectKeyVal({
                    start : val.start,
                    end   : val.end,
                    key   : val.name,
                    value : val.value
                }));
            });

            if(delQueue.length != 0){
                delQueue.reverse().forEach(function(val){
                    node.args.splice(val, 1);
                });

                props = {
                    start      : node.start, 
                    end        : node.end, 
                    args       : [new Cola.AST_Object(props)],
                    expression : new Cola.AST_SymbolRef({ name : '$_cola_func_named_args' })
                };

                node.args.push(new Cola.AST_New(props));
            }
        } else

        /*
            func(String s, Number n:, Array list..., Boolean b = false, h: 123){
                
            }

            to

            function func(s){
                $_cola_func_set_named_args(arguments);
                var $_cola_i, list = 3 <= arguments.length ? [].slice.call(arguments, 1, $_cola_i = arguments.length - 1) : ($_cola_i = 2, []), 
                    b = arguments[$_cola_i+0] !== undefined ? arguments[$_cola_i+0] : false,
                    n = arguments.n,
                    h = arguments.h !== undefined ? arguments.h : 123;
            }
            
        */
        if((node instanceof Cola.AST_Function || node instanceof Cola.AST_Defun) && node.argnames.length != 0){
            var posed = [], named = [], onfront = true, delQueue = [], pos = 0, splated, aftersplated = -1;
            node.argnames.forEach(function(val, i){
                if(val.argtype == "positional"){
                    if(val.defval instanceof Cola.AST_Noop && onfront) pos++, node.argnames[i] = val.name;
                    else {
                        onfront = false;
                        delQueue.push(i);
                        posed.push({ pos : pos++, val : val });
                    }
                    splated && splated.after++;
                } else if(val.argtype == "named"){
                    delQueue.push(i);
                    named.push(val);
                } else if(val.argtype == "splated"){
                    onfront = false;
                    delQueue.push(i);
                    posed.push(splated = { pos : pos++, after : 0, val : val });
                }
            });

            if(delQueue.length != 0)
                delQueue.reverse().forEach(function(val){
                    node.argnames.splice(val, 1);
                });

            props = {
                type        : "dynamic",
                definitions : []
            };

            posed.forEach(function(val, i){
                var pos = val.pos; val = val.val;

                if(val.argtype == "splated"){
                    aftersplated = 0;
                    props.definitions.push(new Cola.AST_VarDef({
                        type  : "int",
                        name  : new Cola.AST_SymbolVar({ name : '$_cola_i' }),
                        value : null
                    }));

                    props.definitions.push(Cola.Constructions.SplatedVarDef(splated.val.name, splated.pos, splated.after, splated.pos + splated.after + 1));
                }
                else

                if(val.defval instanceof Cola.AST_Noop) props.definitions.push(Cola.Constructions.PosedVarDef(val.name, val.type, pos, aftersplated)), aftersplated++;
                else props.definitions.push(Cola.Constructions.PosedWithDefsVarDef(val.name, val.type, val.defval, pos, aftersplated)), aftersplated++;
            });

            named.forEach(function(val, i){
                if(val.defval instanceof Cola.AST_Noop) props.definitions.push(new Cola.AST_VarDef({
                    type  : val.type,
                    name  : new Cola.AST_SymbolVar(val.name),
                    value : new Cola.AST_Dot({
                        expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                        property   : val.name.name
                    })
                }));
                else props.definitions.push(Cola.Constructions.NamedVarDef(val.name, val.type, val.defval, val.name.name));
            });

            if(delQueue.length != 0 || named.length != 0) node.body.unshift(new Cola.AST_Var(props));

            if(named.length != 0){
                $_cola_hash[Cola.$_cola_func_named_args.i] = true;
                $_cola_hash[Cola.$_cola_func_set_named_args.i] = true;
                node.body.unshift(new Cola.AST_SimpleStatement({
                    body : new Cola.AST_Call({
                        args       : [new Cola.AST_SymbolRef({ name : 'arguments' })],
                        expression : new Cola.AST_SymbolRef({ name : '$_cola_func_set_named_args' })
                    })
                }));
            }
        } else

        /*
            obj
                ..[0] = yes
                ..foo = bar
                ..baz()
                ..sub:
                    ..subfoo = no
                    ..subaz();
                ;

            to
            
            (function($_cola_expr, arguments){
                $_cola_expr[0] = yes;
                $_cola_expr.foo = bar;
                $_cola_expr.baz();

                (function($_cola_expr, arguments){
                    $_cola_expr.subfoo = no;
                    $_cola_expr.subaz();

                    return $_cola_expr;
                }).call(this, $_cola_expr.sub, arguments);

                return $_cola_expr;
            }).call(this, obj, arguments);

        */
        if(node instanceof Cola.AST_Cascade){
            $_cola_hash[Cola.$_cola_arguments_def.i] = true;

            props = {
                type       : "dynamic",
                body       : [],
                argnames   : [new Cola.AST_ArgDef({
                    argtype : "positional",
                    type    : "dynamic",
                    defval  : new Cola.AST_Noop(),
                    name    : new Cola.AST_SymbolFunarg({ name : "$_cola_expr", start : node.expression.start, end : node.expression.end })
                }), new Cola.AST_ArgDef({
                    argtype : "positional",
                    type    : "dynamic",
                    defval  : new Cola.AST_Noop(),
                    name    : new Cola.AST_SymbolFunarg({ name : "arguments", start : new Cola.AST_Token(), end : new Cola.AST_Token() })
                })] 
            };

            var Expr, Parent = false; 
            node.subexpressions.forEach(function(expr){
                Expr = expr, Parent = false;
                while(true)
                    if( expr instanceof Cola.AST_Call || expr instanceof Cola.AST_Dot || 
                        expr instanceof Cola.AST_Sub || expr instanceof Cola.AST_Cascade){
                        Parent = expr;
                        expr = expr.expression;
                    } else 
                    if(expr instanceof Cola.AST_Binary){
                        Parent = expr;
                        expr = expr.left;
                    } else 
                    if(expr instanceof Cola.AST_Array || expr instanceof Cola.AST_ArrayRange || expr instanceof Cola.AST_SymbolRef) break;

                if(!Parent){
                    if(expr instanceof Cola.AST_Array || expr instanceof Cola.AST_ArrayRange) Expr = new Cola.AST_Sub({
                        start      : Expr.start,
                        end        : Expr.end,
                        expression : new Cola.AST_SymbolRef({ name : "$_cola_expr" }),
                        property   : expr instanceof Cola.AST_ArrayRange ? expr : ( expr.elements.length == 0 ? new Cola.AST_Noop() : expr.elements[0] )
                    }); else
                    if(expr instanceof Cola.AST_SymbolRef) Expr = new Cola.AST_Dot({
                        start      : Expr.start,
                        end        : Expr.end,
                        expression : new Cola.AST_SymbolRef({ name : "$_cola_expr" }),
                        property   : Expr.name
                    });
                } else {
                    if(expr instanceof Cola.AST_Array || expr instanceof Cola.AST_ArrayRange)
                        expr = new Cola.AST_Sub({
                            start      : expr.start,
                            end        : expr.end,
                            expression : new Cola.AST_SymbolRef({ name : "$_cola_expr" }),
                            property   : expr instanceof Cola.AST_ArrayRange ? expr : ( expr.elements.length == 0 ? new Cola.AST_Noop() : expr.elements[0] )
                        });
                    else
                        expr = new Cola.AST_Dot({
                            start      : expr.start,
                            end        : expr.end,
                            expression : new Cola.AST_SymbolRef({ name : "$_cola_expr" }),
                            property   : expr.name
                        });

                    if( Parent instanceof Cola.AST_Call || Parent instanceof Cola.AST_Dot || 
                        Parent instanceof Cola.AST_Sub || Parent instanceof Cola.AST_Cascade) Parent.expression = expr;
                    else 
                    if(Parent instanceof Cola.AST_Binary) Parent.left = expr;
                }

                props.body.push(new Cola.AST_SimpleStatement({
                    start : Expr.start,
                    end   : Expr.end,
                    body  : Expr
                }));
            });

            props.body.push(new Cola.AST_Return({
                value : new Cola.AST_SymbolRef({ name : "$_cola_expr" })
            }));

            props = {
                expression : new Cola.AST_Function(props),
                property   : "call"
            };
        
            node = new Cola.AST_Call({
                start      : node.start,
                end        : node.end,
                args       : [new Cola.AST_SymbolRef({ name : "this" }), node.expression, new Cola.AST_SymbolRef({ name : "arguments" })],
                expression : new Cola.AST_Dot(props)
            });    
        } else 

        /*
            var [c, [b, b2], ..., { key : a }] = obj;
            var { "key" : d } = { key : "val" };

            to

            var c = obj[0], b = obj[1][0], b2 = obj[1][1], $_cola_i = obj.length - 1, a = obj[$_cola_i++].key;
            var $_cola_tmp = { key : "val" }, d = $_cola_tmp["key"];

        */
        /*if(node instanceof Cola.AST_Var){
            var defs = [];
            node.definitions.forEach(function(def, i){
                if(!(def.name instanceof Cola.AST_ArrayTemplate || def.name instanceof Cola.AST_ObjectTemplate)){
                    defs.push(def);
                    return;
                }

                var Symbol = def.value instanceof Cola.AST_SymbolRef 
                    ? def.value 
                    : new Cola.AST_SymbolRef({ name : "$_cola_tmp" });
                if(!(def.value instanceof Cola.AST_SymbolRef)) defs.push(new Cola.AST_VarDef({
                    type  : node.type,
                    name  : new Cola.AST_SymbolVar(Symbol),
                    value : def.value
                }));

                (function _rec(def, symbol, uid){
                    var skiped = false, k = 0, is_arrayt = def instanceof Cola.AST_ArrayTemplate, _ = is_arrayt ? def.elements : def.properties;
                    _.forEach( is_arrayt 
                        ? function(el, j){
                            if(el instanceof Cola.AST_SymbolRef && el.splated){
                                skiped = true;
                                defs.push(new Cola.AST_VarDef({
                                    type  : "int",
                                    name  : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                    value : null
                                }));
                                el.splated = undefined;
                                defs.push(new Cola.AST_VarDef({
                                    name  : new Cola.AST_SymbolVar(el),
                                    value : new Cola.AST_Conditional({
                                        condition   : new Cola.AST_Binary({
                                            operator  : "<=",
                                            left      : new Cola.AST_Number({ value : _.length }),
                                            right     : new Cola.AST_Dot({
                                                expression : symbol,
                                                property   : "length"
                                            })
                                        }),
                                        consequent  : new Cola.AST_Call({
                                            expression  : new Cola.AST_Dot({ 
                                                property   : "call",
                                                expression : new Cola.AST_Dot({
                                                    property   : "slice",
                                                    expression : new Cola.AST_Array({ elements : [] })
                                                })
                                            }),
                                            args        : [
                                                symbol, 
                                                new Cola.AST_Number({ value : j }),
                                                new Cola.AST_Assign({
                                                    operator : '=',
                                                    left     : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                                    right    : new Cola.AST_Binary({
                                                        operator : '-',
                                                        left     : new Cola.AST_Dot({
                                                            property   : "length",
                                                            expression : symbol
                                                        }),
                                                        right    : new Cola.AST_Number({ value : _.length - j - 1 })
                                                    })
                                                })
                                            ]
                                        }),
                                        alternative : new Cola.AST_Seq({
                                            car : new Cola.AST_Assign({
                                                operator : '=',
                                                left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                                right    : new Cola.AST_Number({ value : j })
                                            }),
                                            cdr : new Cola.AST_Array({ elements : [] })
                                        })
                                    })
                                }));
                            } else
                            if(el instanceof Cola.AST_SymbolRef) defs.push(new Cola.AST_VarDef({
                                start : node.start,
                                end   : node.end,
                                type  : node.type,
                                name  : new Cola.AST_SymbolVar(el),
                                value : new Cola.AST_Sub({ 
                                    expression : symbol, 
                                    property   : !skiped 
                                        ? new Cola.AST_Number({ value : j }) 
                                        : new Cola.AST_Binary({
                                            operator : "+",
                                            left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                            right    : new Cola.AST_Number({ value : k++ })
                                        })
                                })
                            })); else 
                            if(el instanceof Cola.AST_Noop){
                                skiped = true;
                                defs.push(new Cola.AST_VarDef({
                                    type  : "int",
                                    name  : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                    value : new Cola.AST_Binary({
                                        operator : '-',
                                        left     : new Cola.AST_Dot({
                                            property   : "length",
                                            expression : symbol
                                        }),
                                        right    : new Cola.AST_Number({ value : _.length -1 - j })
                                    })
                                }));
                            } else 
                            if(el instanceof Cola.AST_Hole || el instanceof Cola.AST_ArrayTemplate && el.elements.length == 0 || el instanceof Cola.AST_ObjectTemplate && el.properties.length == 0)
                                k++;
                            else
                            _rec(el,  new Cola.AST_Sub({ 
                                expression : symbol, 
                                property   : !skiped 
                                    ? new Cola.AST_Number({ value : j }) 
                                    : new Cola.AST_Binary({
                                        operator : "+",
                                        left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                        right    : new Cola.AST_Number({ value : k++ })
                                    })
                            }), uid + "_");
                        }
                        : function(el, j){
                            if(el.value instanceof Cola.AST_SymbolRef || el.value instanceof Cola.AST_Noop && el.start.type == "name") defs.push(new Cola.AST_VarDef({
                                start : node.start,
                                end   : node.end,
                                type  : node.type,
                                name  : el.value instanceof Cola.AST_Noop ? new Cola.AST_SymbolVar({ name : el.key }) : new Cola.AST_SymbolVar(el.value),
                                value : el.start.type == "name"
                                    ? new Cola.AST_Dot({ 
                                        expression : symbol, 
                                        property   : el.key
                                    })
                                    : new Cola.AST_Sub({
                                        expression : symbol,
                                        property   : new Cola.AST_String({ value : el.key })
                                    })
                            })); else 
                            _rec(el.value,  el.start.type == "name"
                                ? new Cola.AST_Dot({ 
                                    expression : symbol, 
                                    property   : el.key
                                })
                                : new Cola.AST_Sub({
                                    expression : symbol,
                                    property   : new Cola.AST_String({ value : el.key })
                            }), uid + "_");
                        });
                })(def.name, Symbol, "_");
            });

            node.definitions = defs;
        } else*/

        /*
            {  String name, age : ages.age } = pro;

            to

            var name = pro.name;
            ages.age = pro.age;

        */
        if(node.body instanceof Cola.AST_Assign && (node.body.left instanceof Cola.AST_ArrayTemplate || node.body.left instanceof Cola.AST_ObjectTemplate ||
          (node.body.left instanceof Cola.AST_Array || node.body.left instanceof Cola.AST_Object) && node.body.left.template) &&
          node instanceof Cola.AST_SimpleStatement){
            if(node.body.left.vardef && node.body.operator != "=") Cola.Parser.prototype.unexpected.call(Cola.Parser.prototype, node.body.left.start);

            node = node.body;
            var defs = [];
            
            var Symbol = node.right instanceof Cola.AST_SymbolRef 
                ? node.right
                : new Cola.AST_SymbolRef({ name : "$_cola_tmp" });
            if(!(node.right instanceof Cola.AST_SymbolRef)) defs.push(new Cola.AST_VarDef({
                type  : "dynamic",
                name  : new Cola.AST_SymbolVar(Symbol),
                value : node.right
            }));

            (function _rec(def, symbol, uid){
                var skiped = false, k = 0, is_arrayt = def instanceof Cola.AST_Array || def instanceof Cola.AST_ArrayTemplate, _ = is_arrayt ? def.elements : def.properties;
                _.forEach( is_arrayt 
                    ? function(el, j){
                        if(el instanceof Cola.AST_VarDef && el.name.splated){
                            skiped = true;
                            defs.push(new Cola.AST_VarDef({
                                type  : "int",
                                name  : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                value : null
                            }));
                            el.name.splated = undefined; 
                            el.value = Cola.Constructions.SplatedConditional(symbol, uid, j, _.length - j - 1, _.length);
                            defs.push(el);
                        } else
                        if((el instanceof Cola.AST_SymbolRef || el instanceof Cola.AST_Sub || el instanceof Cola.AST_Dot) && el.splated){
                            skiped = true;
                            defs.push(new Cola.AST_VarDef({
                                type  : "int",
                                name  : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                value : null
                            }));
                            el.splated = undefined;
                            defs.push(new Cola.AST_Assign({
                                operator : node.operator,
                                left     : el,
                                right    : new Cola.AST_Conditional({
                                    condition   : new Cola.AST_Binary({
                                        operator  : "<=",
                                        left      : new Cola.AST_Number({ value : _.length }),
                                        right     : new Cola.AST_Dot({
                                            expression : symbol,
                                            property   : "length"
                                        })
                                    }),
                                    consequent  : new Cola.AST_Call({
                                        expression  : new Cola.AST_Dot({ 
                                            property   : "call",
                                            expression : new Cola.AST_Dot({
                                                property   : "slice",
                                                expression : new Cola.AST_Array({ elements : [] })
                                            })
                                        }),
                                        args        : [
                                            symbol, 
                                            new Cola.AST_Number({ value : j }),
                                            new Cola.AST_Assign({
                                                operator : '=',
                                                left     : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                                right    : new Cola.AST_Binary({
                                                    operator : '-',
                                                    left     : new Cola.AST_Dot({
                                                        property   : "length",
                                                        expression : symbol
                                                    }),
                                                    right    : new Cola.AST_Number({ value : _.length - j - 1 })
                                                })
                                            })
                                        ]
                                    }),
                                    alternative : new Cola.AST_Seq({
                                        car : new Cola.AST_Assign({
                                            operator : '=',
                                            left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                            right    : new Cola.AST_Number({ value : j })
                                        }),
                                        cdr : new Cola.AST_Array({ elements : [] })
                                    })
                                })
                            }));
                        } else
                        if(el instanceof Cola.AST_VarDef){
                            el.value = new Cola.AST_Sub({ 
                                expression : symbol, 
                                property   : !skiped 
                                    ? new Cola.AST_Number({ value : j }) 
                                    : new Cola.AST_Binary({
                                        operator : "+",
                                        left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                        right    : new Cola.AST_Number({ value : k++ })
                                    })
                            });
                            defs.push(el);
                        } else 
                        if(el instanceof Cola.AST_SymbolRef || el instanceof Cola.AST_Sub || el instanceof Cola.AST_Dot) defs.push(new Cola.AST_Assign({
                            operator : node.operator,
                            left     : el,
                            right    : new Cola.AST_Sub({ 
                                expression : symbol, 
                                property   : !skiped 
                                    ? new Cola.AST_Number({ value : j }) 
                                    : new Cola.AST_Binary({
                                        operator : "+",
                                        left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                        right    : new Cola.AST_Number({ value : k++ })
                                    })
                            })
                        })); else 
                        if(el instanceof Cola.AST_Noop){
                            skiped = true;
                            defs.push(new Cola.AST_VarDef({
                                type  : "int",
                                name  : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                value : new Cola.AST_Binary({
                                    operator : '-',
                                    left     : new Cola.AST_Dot({
                                        property   : "length",
                                        expression : symbol
                                    }),
                                    right    : new Cola.AST_Number({ value : _.length -1 - j })
                                })
                            }));
                        } else 
                        if(el instanceof Cola.AST_Hole || el instanceof Cola.AST_ArrayTemplate && el.elements.length == 0 || el instanceof Cola.AST_ObjectTemplate && el.properties.length == 0)
                            k++;
                        else
                        _rec(el,  new Cola.AST_Sub({ 
                            expression : symbol, 
                            property   : !skiped 
                                ? new Cola.AST_Number({ value : j }) 
                                : new Cola.AST_Binary({
                                    operator : "+",
                                    left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                    right    : new Cola.AST_Number({ value : k++ })
                                })
                        }), uid + "_");
                    }
                    : function(el, j){
                        if(el.type && (el.value instanceof Cola.AST_SymbolRef || el.value instanceof Cola.AST_Noop && el.start.type == "name")) defs.push(new Cola.AST_VarDef({
                            start : node.start,
                            end   : node.end,
                            type  : el.type,
                            name  : el.value instanceof Cola.AST_Noop ? new Cola.AST_SymbolVar({ name : el.key }) : new Cola.AST_SymbolVar(el.value),
                            value : el.start.type == "name"
                                ? new Cola.AST_Dot({ 
                                    expression : symbol, 
                                    property   : el.key
                                })
                                : new Cola.AST_Sub({
                                    expression : symbol,
                                    property   : new Cola.AST_String({ value : el.key })
                                })
                        })); else 
                        if(el.value instanceof Cola.AST_SymbolRef  || el.value instanceof Cola.AST_Sub || el.value instanceof Cola.AST_Dot || el.value instanceof Cola.AST_Noop && el.start.type == "name") defs.push(new Cola.AST_Assign({
                            operator : node.operator,
                            left     : el.value instanceof Cola.AST_Noop ? new Cola.AST_SymbolRef({ name : el.key }) : el.value,
                            right    : el.start.type == "name"
                                ? new Cola.AST_Dot({ 
                                    expression : symbol, 
                                    property   : el.key
                                })
                                : new Cola.AST_Sub({
                                    expression : symbol,
                                    property   : new Cola.AST_String({ value : el.key })
                                })
                        })); else 
                        _rec(el.value,  el.start.type == "name"
                            ? new Cola.AST_Dot({ 
                                expression : symbol, 
                                property   : el.key
                            })
                            : new Cola.AST_Sub({
                                expression : symbol,
                                property   : new Cola.AST_String({ value : el.key })
                        }), uid + "_");
                    });
            })(node.left, Symbol, "_");

            if (defs.length == 0) return node;
            node = [];

            var sdef, sdefs = [], prev = defs[0].CTOR;
            defs.forEach(function _(def, i){
                sdef = false;
                
                if(def instanceof prev) sdefs.push(def); 
                else {
                    if(prev == Cola.AST_VarDef) sdef = new Cola.AST_Var({
                        type        : "dynamic",
                        definitions : sdefs
                    }); else if(sdefs.length == 1) sdef = sdefs[0]
                    else {
                        sdefs.reverse().forEach(function(def){
                            if(!sdef) sdef = def;
                            else sdef = new Cola.AST_Seq({
                                car : def,
                                cdr : sdef
                            });
                        });
                    }
                    
                    node.push(!(sdef instanceof Cola.AST_Var)
                        ? new Cola.AST_SimpleStatement({ body : sdef })
                        : sdef
                    );
                    prev = def.CTOR;
                    sdefs = [def];
                }

                if(i == defs.length - 1) _(false);
            });
        } else

        /*
            func({ a : aname, b : bname } = obj)

            to

            func((function($_cola_expr, arguments){
                aname = $_cola_expr.a;
                bname = $_cola_expr.b;

                return $_cola_expr;
            }).call(this, obj, arguments))

        */
        if(node instanceof Cola.AST_Assign && (node.left instanceof Cola.AST_ArrayTemplate || node.left instanceof Cola.AST_ObjectTemplate ||
          (node.left instanceof Cola.AST_Array || node.left instanceof Cola.AST_Object) && node.left.template)){
            if(node.left.vardef) Cola.Parser.prototype.unexpected.call(Cola.Parser.prototype, node.start);
            $_cola_hash[Cola.$_cola_arguments_def.i] = true;

            var defs = [];
            
            var Symbol = new Cola.AST_SymbolRef({ name : "$_cola_expr" });

            (function _rec(def, symbol, uid){
                var skiped = false, k = 0, is_arrayt = def instanceof Cola.AST_Array || def instanceof Cola.AST_ArrayTemplate, _ = is_arrayt ? def.elements : def.properties;
                _.forEach( is_arrayt 
                    ? function(el, j){
                        if((el instanceof Cola.AST_SymbolRef || el instanceof Cola.AST_Sub || el instanceof Cola.AST_Dot) && el.splated){
                            skiped = true;
                            defs.push(new Cola.AST_VarDef({
                                type  : "int",
                                name  : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                value : null
                            }));
                            el.splated = undefined;
                            defs.push(new Cola.AST_Assign({
                                operator : node.operator,
                                left     : el,
                                right    : new Cola.AST_Conditional({
                                    condition   : new Cola.AST_Binary({
                                        operator  : "<=",
                                        left      : new Cola.AST_Number({ value : _.length }),
                                        right     : new Cola.AST_Dot({
                                            expression : symbol,
                                            property   : "length"
                                        })
                                    }),
                                    consequent  : new Cola.AST_Call({
                                        expression  : new Cola.AST_Dot({ 
                                            property   : "call",
                                            expression : new Cola.AST_Dot({
                                                property   : "slice",
                                                expression : new Cola.AST_Array({ elements : [] })
                                            })
                                        }),
                                        args        : [
                                            symbol, 
                                            new Cola.AST_Number({ value : j }),
                                            new Cola.AST_Assign({
                                                operator : '=',
                                                left     : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                                right    : new Cola.AST_Binary({
                                                    operator : '-',
                                                    left     : new Cola.AST_Dot({
                                                        property   : "length",
                                                        expression : symbol
                                                    }),
                                                    right    : new Cola.AST_Number({ value : _.length - j - 1 })
                                                })
                                            })
                                        ]
                                    }),
                                    alternative : new Cola.AST_Seq({
                                        car : new Cola.AST_Assign({
                                            operator : '=',
                                            left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                            right    : new Cola.AST_Number({ value : j })
                                        }),
                                        cdr : new Cola.AST_Array({ elements : [] })
                                    })
                                })
                            }));
                        } else
                        if(el instanceof Cola.AST_SymbolRef || el instanceof Cola.AST_Sub || el instanceof Cola.AST_Dot) defs.push(new Cola.AST_Assign({
                            operator : node.operator,
                            left     : el,
                            right    : new Cola.AST_Sub({ 
                                expression : symbol, 
                                property   : !skiped 
                                    ? new Cola.AST_Number({ value : j }) 
                                    : new Cola.AST_Binary({
                                        operator : "+",
                                        left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                        right    : new Cola.AST_Number({ value : k++ })
                                    })
                            })
                        })); else 
                        if(el instanceof Cola.AST_Noop){
                            skiped = true;
                            defs.push(new Cola.AST_VarDef({
                                type  : "int",
                                name  : new Cola.AST_SymbolVar({ name : "$_cola" + uid + "i" }),
                                value : new Cola.AST_Binary({
                                    operator : '-',
                                    left     : new Cola.AST_Dot({
                                        property   : "length",
                                        expression : symbol
                                    }),
                                    right    : new Cola.AST_Number({ value : _.length -1 - j })
                                })
                            }));
                        } else 
                        if(el instanceof Cola.AST_Hole || el instanceof Cola.AST_ArrayTemplate && el.elements.length == 0 || el instanceof Cola.AST_ObjectTemplate && el.properties.length == 0)
                            k++;
                        else
                        _rec(el,  new Cola.AST_Sub({ 
                            expression : symbol, 
                            property   : !skiped 
                                ? new Cola.AST_Number({ value : j }) 
                                : new Cola.AST_Binary({
                                    operator : "+",
                                    left     : new Cola.AST_SymbolRef({ name : "$_cola" + uid + "i" }),
                                    right    : new Cola.AST_Number({ value : k++ })
                                })
                        }), uid + "_");
                    }
                    : function(el, j){
                        if(el.value instanceof Cola.AST_SymbolRef  || el.value instanceof Cola.AST_Sub || el.value instanceof Cola.AST_Dot || el.value instanceof Cola.AST_Noop && el.start.type == "name") defs.push(new Cola.AST_Assign({
                            operator : node.operator,
                            left     : el.value instanceof Cola.AST_Noop ? new Cola.AST_SymbolRef({ name : el.key }) : el.value,
                            right    : el.start.type == "name"
                                ? new Cola.AST_Dot({ 
                                    expression : symbol, 
                                    property   : el.key
                                })
                                : new Cola.AST_Sub({
                                    expression : symbol,
                                    property   : new Cola.AST_String({ value : el.key })
                                })
                        })); else 
                        _rec(el.value,  el.start.type == "name"
                            ? new Cola.AST_Dot({ 
                                expression : symbol, 
                                property   : el.key
                            })
                            : new Cola.AST_Sub({
                                expression : symbol,
                                property   : new Cola.AST_String({ value : el.key })
                        }), uid + "_");
                    });
            })(node.left, Symbol, "_");

            if (defs.length == 0) return node;
            props = {
                type       : "dynamic",
                body       : [],
                argnames   : [new Cola.AST_ArgDef({
                    argtype : "positional",
                    type    : "dynamic",
                    defval  : new Cola.AST_Noop(),
                    name    : new Cola.AST_SymbolFunarg({ name : "$_cola_expr", start : node.right.start, end : node.right.end })
                }), new Cola.AST_ArgDef({
                    argtype : "positional",
                    type    : "dynamic",
                    defval  : new Cola.AST_Noop(),
                    name    : new Cola.AST_SymbolFunarg({ name : "arguments", start : new Cola.AST_Token(), end : new Cola.AST_Token() })
                })] 
            };

            var sdef, sdefs = [], prev = defs[0].CTOR;
            defs.forEach(function _(def, i){
                sdef = false;
                
                if(def instanceof prev) sdefs.push(def); 
                else {
                    if(prev == Cola.AST_VarDef) sdef = new Cola.AST_Var({
                        type        : "dynamic",
                        definitions : sdefs
                    }); else if(sdefs.length == 1) sdef = sdefs[0]
                    else {
                        sdefs.reverse().forEach(function(def){
                            if(!sdef) sdef = def;
                            else sdef = new Cola.AST_Seq({
                                car : def,
                                cdr : sdef
                            });
                        });
                    }
                    
                    props.body.push(!(sdef instanceof Cola.AST_Var)
                        ? new Cola.AST_SimpleStatement({ body : sdef })
                        : sdef
                    );
                    prev = def.CTOR;
                    sdefs = [def];
                }

                if(i == defs.length - 1) _(false);
            });

            props.body.push(new Cola.AST_Return({
                value : new Cola.AST_SymbolRef({ name : "$_cola_expr" })
            }));

            props = {
                expression : new Cola.AST_Function(props),
                property   : "call"
            }
        
            node = new Cola.AST_Call({
                start      : node.start,
                end        : node.end,
                args       : [new Cola.AST_SymbolRef({ name : "this" }), node.right, new Cola.AST_SymbolRef({ name : "arguments" })],
                expression : new Cola.AST_Dot(props)
            });
        } else

        /*
            var o = if(a) 'start' else 'finish'; 

            to

            var o = (function(){
                if(a) return 'start'; else return 'finish';
            }).apply(this, arguments);
            
        */
        if(node instanceof Cola.AST_If && node.inline && !(parent instanceof Cola.AST_If && parent.inline)){
            $_cola_hash[Cola.$_cola_arguments_def.i] = true;

            var s = node;

            while (true) {
                s.inline = false;
                s.body = new Cola.AST_Return({
                    value : s.body
                });

                if (s.alternative instanceof Cola.AST_If) s = s.alternative;
                else if (s.alternative == null) break;
                else {
                    s.alternative = new Cola.AST_Return({
                        value : s.alternative
                    });
                    break;
                }
            }

            props = {
                expression : new Cola.AST_Function({
                    type       : "dynamic",
                    body       : [node],
                    argnames   : [] 
                }),
                property   : "apply"
            }
        
            node = new Cola.AST_Call({
                args       : [new Cola.AST_SymbolRef({ name : "this" }), new Cola.AST_SymbolRef({ name : "arguments" })],
                expression : new Cola.AST_Dot(props)
            });
        } else

        /*
            var o = switch {
                case b < 10: f(b);
            };

            to

            var o = (function(){
                switch {
                    case b < 10: return f(b);
                }
            }).apply(this, arguments);
            
        */
        if(node instanceof Cola.AST_Switch && !(parent instanceof Cola.AST_Block)){
            $_cola_hash[Cola.$_cola_arguments_def.i] = true;

            node.body.forEach(function(branch){
                if(!branch.body.length) return;
                branch.body[0] = new Cola.AST_Return({
                    value : branch.body[0].body
                });
            });

            props = {
                expression : new Cola.AST_Function({
                    type       : "dynamic",
                    body       : [node],
                    argnames   : [] 
                }),
                property   : "apply"
            };
        
            node = new Cola.AST_Call({
                args       : [new Cola.AST_SymbolRef({ name : "this" }), new Cola.AST_SymbolRef({ name : "arguments" })],
                expression : new Cola.AST_Dot(props)
            });
        } else

        /*
            switch {
                when b < 10: f(b);
                case b < 15: y(b);
            }

            to

            switch (false) {
                when !(b < 10): f(b);
                case !(b < 15): y(b);
            }

        */
        if(node instanceof Cola.AST_Switch && node.expression instanceof Cola.AST_Noop){
            node.expression = new Cola.AST_False;

            node.body.forEach(function(branch){
                if(branch instanceof Cola.AST_Default) return;

                if(branch.expression instanceof Cola.AST_Seq){
                    var seq = branch.expression;

                    while(true){
                        seq.car = new Cola.AST_UnaryPrefix({
                            operator   : '!',
                            expression : seq.car
                        });
                        if(seq.cdr instanceof Cola.AST_Seq) seq = seq.cdr;
                        else {
                            seq.cdr = new Cola.AST_UnaryPrefix({
                                operator   : '!',
                                expression : seq.cdr
                            });
                            break;
                        }
                    }

                    return;
                }

                branch.expression = new Cola.AST_UnaryPrefix({
                    operator   : '!',
                    expression : branch.expression
                });
            });
        } else

        /*
            switch {
                when b < 10: f(b);
            }

            to

            switch {
                case b < 10: 
                    f(b);
                    break;
            }

        */
        if(node instanceof Cola.AST_When){
            node = new Cola.AST_Case(node);
            node.body.push(new Cola.AST_Break);
        } else 

        /*
            switch (g) {
                case 11, 22: f(g);
            }

            to

            switch (g) {
                case 11: case 22: f(g);
            }

        */
        if(node instanceof Cola.AST_SwitchBranch && !(node instanceof Cola.AST_Default) && node.expression instanceof Cola.AST_Seq){
            var branches = [], seq = node.expression;

            while(true){
                branches.push(new node.CTOR({ expression : seq.car, body : [] }));
                if(seq.cdr instanceof Cola.AST_Seq) seq = seq.cdr;
                else {
                    node.expression = seq.cdr
                    branches.push(node);
                    break;
                }
            }

            node = branches;
        } else 

        /*
            MyClass::prop = (){
    
            };

            to

            MyClass.prototype.prop = (){
    
            };

        */
        if(node instanceof Cola.AST_Proto){
            props = new Cola.AST_Dot(node);
            props.expression = new Cola.AST_Dot(node);
            props.expression.property = "prototype";
            node = props;
        } else 

        /*
            "test @a @{b} {{c}}"

            to

            "test "+a+" "+b+" "+c
            
        */
        if(node instanceof Cola.AST_StringTemplate){
            newNode = new Cola.AST_Binary({
                operator : '+',
                left     : node.body[0],
                right    : node.body[1]
            });
            for(var i = 2; i < node.body.length; i++)
                newNode = new Cola.AST_Binary({
                    operator : '+',
                    left     : newNode,
                    right    : node.body[i]
                });

            newNode.start = node.start;
            newNode.end   = node.end;

            node = newNode;
        } else 

        /*
            /
                ([\w-\.]+)
                @
                ((?:[\w]+\.)+)
                ([a-zA-Z]{2,4})
            /

            to

            /([\w-\.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/
            
        */
        if(node instanceof Cola.AST_RegExp && (node.value.indexOf('\n') != -1 || /\/[\w]*x[\w]*$/.test(node.value))){
            node.value = node.value.replace(/[\r\n\s]/g,'').replace(/(\/[\w]*)x([\w]*$)/, '$1$2');
        } else 

        if(node instanceof Cola.AST_Command && node.name == "include"){
            var included = [];

            node.args.forEach(function(file){

                options.parser.is_js = /\.js$/.test(file);
                options.parser.filename = Cola.notRoot(file) ? options.path + "/" + file : file;

                var tl = Cola.parse(Cola.getSource(options.parser.filename), options.parser);
                if (!options.parser.is_js) tl = tl.toJavaScript({
                    main_binding : options.main_binding,
                    main_event   : options.main_event,
                    parser       : options.parser,
                    path         : Cola.dirname(options.parser.filename),
                    std          : false
                });

                included = included.concat(tl.body);
            });

            return included;
        } else 

        if(node instanceof Cola.AST_Command && node.name == "require"){
            node.args.forEach(function(file){

                if (required_hash[file]) return;
                required_hash[file] = true;

                options.parser.is_js = /\.js$/.test(file);
                options.parser.filename = Cola.notRoot(file) ? options.path + "/" + file : file;

                var tl = Cola.parse(Cola.getSource(options.parser.filename), options.parser);
                if (!options.parser.is_js) tl = tl.toJavaScript({
                    main_binding : options.main_binding,
                    main_event   : options.main_event,
                    parser       : options.parser,
                    path         : Cola.dirname(options.parser.filename),
                    std          : false
                });

                required = required.concat(tl.body);
            });

            return false;
        } else 

        if (node instanceof Cola.AST_Command && node.name == "use") {
            if (node.args[0] == "closure") {
                props = new Cola.AST_Function({
                    type       : "dynamic",
                    body       : node.args[2].body,
                    argnames   : [] 
                });

                if (node.args[1]){
                    $_cola_hash[Cola.$_cola_arguments_def.i] = true;
                    
                    props = new Cola.AST_Dot({
                        expression : props,
                        property   : "apply"
                    });
                }

                node = new Cola.AST_Call({
                    args       : node.args[1] ? [new Cola.AST_SymbolRef({ name : "this" }), new Cola.AST_SymbolRef({ name : "arguments" })] : [],
                    expression : props
                });
                node = new Cola.AST_SimpleStatement({ body : node });
            } else

            node = new Cola.AST_Directive({ value : "use " + node.args[0] });
        }
        
        if(node instanceof Array){
            _this = this;
            node.forEach(function(nd){
                nd._descend(nd, _this);
            })
        } else node._descend(node, this);

        return node;
    });

    _this = this.transform(tt);
    
    _this.body = required.concat(_this.body);

    if(options.std){
        for(var i in $_cola_hash) if($_cola_hash.hasOwnProperty(i))
            _this.body.unshift($_cola_ast.body[i]);
    }

    return _this;
};