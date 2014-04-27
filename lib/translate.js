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

Cola.AST_Toplevel.prototype.toJavaScript = function(options){
    if(this.language == 'js') return this;
    this.language = 'js';

    options = Cola.defaults(options, {
        main_binding : true,
        main_event   : 'DOMContentLoaded'
    });

    var $_cola_ast = Cola.parse(Cola.$_cola, { is_js : true}), $_cola_hash = {}, _this,
    tt = new Cola.TreeTransformer(function(node, descend){
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
            props = {
                args       : [new Cola.AST_String({ value : options.main_event }), node, new Cola.AST_False()],
                expression : new Cola.AST_Dot({
                    property   : 'addEventListener',
                    //start      : props.start,
                    //end        : new Cola.AST_Token({ nlb : false, type : 'name', value : 'pow' }),
                    expression : new Cola.AST_SymbolRef({ name : 'window' })
                })
            };
            
            node = new Cola.AST_SimpleStatement({
                body  : new Cola.AST_Call(props),
                start : node.start,
                end   : node.left
            });
        } else

        /*
            5 ** 2

            to

            Math.pow(5, 2)
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == '**'){
            props = {
                args       : [node.left, node.right],
                start      : node.start, //new Cola.AST_Token({ nlb : false, type : 'name', value : 'Math' }),
                end        : node.left,   //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
                expression : new Cola.AST_Dot({
                    property   : 'pow',
                    //start      : props.start,
                    //end        : new Cola.AST_Token({ nlb : false, type : 'name', value : 'pow' }),
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
                args       : [node.left, node.right],
                start      : node.start, //new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_modulo' }),
                end        : node.end,    //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
                expression : new Cola.AST_SymbolRef({ 
                    name  : '$_cola_modulo'
                    //start : props.start, 
                    //end   : props.start 
                })
            };
    
            node = new Cola.AST_Call(props);

        } else 

        /*
            a ?= b;

            to

            if($_cola_isntset(a)) a = b;
            
        */
        if(node instanceof Cola.AST_SimpleStatement && node.body instanceof Cola.AST_Assign && node.body.operator == '?='){
            if(node.body.left instanceof Cola.AST_Sub && node.body.left.property instanceof Cola.AST_Noop){
                props = {
                    property   : "length",
                    //start      : node.left.start,
                    //end        : new Cola.AST_Token({ nlb : false, type : 'name', value : 'push' }),
                    expression : node.body.left.expression
                };
                props = {
                    operator : "-",
                    left     : new Cola.AST_Dot(props),
                    right    : new Cola.AST_Number({ value : 1 })
                };

                node.body.left.property = new Cola.AST_Binary(props);
            }

            $_cola_hash[Cola.$_cola_isntset.i] = true;
            node.body.operator = '=';

            props = {
                args       : [node.body.left],
                //start : node.start, //new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_isntset' }),
                //end   : node.end   //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
                expression : new Cola.AST_SymbolRef({ 
                    name  : '$_cola_isntset'
                    //start : props.start, 
                    //end   : props.start 
                })
            };

            node = new Cola.AST_If({
                body      : node.clone(),
                start     : node.start, //new Cola.AST_Token({ nlb : false, type : 'keyword', value : 'if' }),
                end       : node.end,   //new Cola.AST_Token({ nlb : false, type : 'punc', value : ';' }),
                condition : new Cola.AST_Call(props)
            });
        } else 

        /*
            func(a ?= b);

            to

            func($_cola_isntset(a) ? a = b : a);
            
        */
        if(node instanceof Cola.AST_Assign && node.operator == '?='/* && !(parent instanceof Cola.AST_SimpleStatement)*/){
            if(node.left instanceof Cola.AST_Sub && node.left.property instanceof Cola.AST_Noop){
                props = {
                    property   : "length",
                    //start      : node.left.start,
                    //end        : new Cola.AST_Token({ nlb : false, type : 'name', value : 'push' }),
                    expression : node.left.expression
                };
                props = {
                    operator : "-",
                    left     : new Cola.AST_Dot(props),
                    right    : new Cola.AST_Number({ value : 1})
                };

                node.left.property = new Cola.AST_Binary(props);
            }

            $_cola_hash[Cola.$_cola_isntset.i] = true;
            node.operator = '=';

            props = {
                args       : [node.left],
                //start : new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_isntset' }),
                //end   : new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
                expression : new Cola.AST_SymbolRef({ 
                    name  : '$_cola_isntset'
                    //start : props.start, 
                    //end   : props.start 
                })
            };

            node = new Cola.AST_Conditional({
                start       : node.start, //new Cola.AST_Token({ nlb : false, type : 'punc', value : '(' }),
                end         : node.end,   //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' }),
                condition   : new Cola.AST_Call(props),
                consequent  : node.clone(),
                alternative : node.left
            });
        } else 

        /*
            a ? b

            to

            $_cola_isset(a) ? a : b
            
        */
        if(node instanceof Cola.AST_Conditional && node.alternative instanceof Cola.AST_Noop){
            $_cola_hash[Cola.$_cola_isset.i] = true;

            props = {
                args       : [node.condition],
                start      : node.start, //new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_isset' }),
                end        : node.end,    //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
                expression : new Cola.AST_SymbolRef({ 
                    name  : '$_cola_isset' 
                    //start : props.start, 
                    //end   : props.start 
                })
            };

            node.alternative = node.consequent;
            node.consequent = node.condition;
            node.condition = new Cola.AST_Call(props);
        } else 

        /*
            123 is Number

            to

            $_cola_is(123, Number)
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == 'is'){
            $_cola_hash[Cola.$_cola_is.i] = true;
            props = {
                args       : [node.left, node.right],
                start      : node.start, //new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_is' }),
                end        : node.end,    //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
                expression : new Cola.AST_SymbolRef({ 
                    name : '$_cola_is' 
                    //start : props.start, 
                    //end : props.start 
                })
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
                args       : [node.left, node.right],
                start      : node.start, //new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_isnt' }),
                end        : node.end,    //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
                expression : new Cola.AST_SymbolRef({ 
                    name : '$_cola_isnt' 
                    //start : props.start, 
                    //end : props.start 
                })
            };

            node = new Cola.AST_Call(props);
        } else 

        /*
            isset a

            or

            a??

            to

            $_cola_isset(a)
            
        */
        if(node instanceof Cola.AST_UnaryPostfix && node.operator == '??' || node instanceof Cola.AST_UnaryPrefix && node.operator == 'isset'){
            $_cola_hash[Cola.$_cola_isset.i] = true;
            props = {
                args       : [node.expression],
                start      : node.start, //new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_isset' }),
                end        : node.end,    //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
                expression : new Cola.AST_SymbolRef({ 
                    name : '$_cola_isset' 
                    //start : props.start, 
                    //end : props.start 
                })
            };

            node = new Cola.AST_Call(props);
        } else 

        /*
            a = clone b

            to

            a = $_cola_clone(b)
            
        */
        if(node instanceof Cola.AST_UnaryPrefix && node.operator == 'clone'){
            $_cola_hash[Cola.$_cola_clone.i] = true;
            props = {
                args       : [node.expression],
                start      : node.start, //new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_clone' }),
                end        : node.end,    //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
                expression : new Cola.AST_SymbolRef({ 
                    name : '$_cola_clone' 
                    //start : props.start, 
                    //end : props.start 
                })
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
                //start      : node.left.start,
                //end        : new Cola.AST_Token({ nlb : false, type : 'name', value : 'push' }),
                expression : node.left.expression
            };
            props = {
                args       : [node.right],
                start      : node.start, //props.start,
                end        : node.end,   //new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' }),
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
                args       : [node.expression],
                start      : node.start, 
                end        : node.end, 
                expression : new Cola.AST_SymbolRef({ 
                    name  : '$_cola_array_last' 
                })
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
                args       : [node.left.expression, node.left.property.from, node.left.property.to, node.right],
                start      : node.start,
                end        : node.end, 
                expression : new Cola.AST_SymbolRef({ 
                    name  : '$_cola_array_asplice' 
                })
            };

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
                args       : [node.property.from, new Cola.AST_Binary({
                    operator : "+",
                    left     : node.property.to,
                    right    : new Cola.AST_Number({ value : 1})
                })],
                start      : node.start,
                end        : node.end,
                expression : new Cola.AST_Dot(props)
            };

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
                args       : [node.from, node.to],
                start      : node.start,
                end        : node.end,
                expression : new Cola.AST_SymbolRef({ 
                    name : '$_cola_array_range' 
                })
            };

            node = new Cola.AST_Call(props);
        } else

        /*
            func(a, b, name : name, c)

            to

            func(a, b, c, new $_cola_func_named_args({ name : name }))
            
        */
        if(node instanceof Cola.AST_Call){
            props = {
                properties : []
            };
            
            var delQueue = [];
            node.args.forEach(function(val, i){
                if(!(val instanceof Cola.AST_Namedarg)) return;
                $_cola_hash[Cola.$_cola_func_named_args.i] = true;
                delQueue.push(i);
                props.properties.push(new Cola.AST_ObjectKeyVal({
                    key   : val.name,
                    value : val.value,
                    start : val.start,
                    end   : val.end
                }));
            });

            if(delQueue.length != 0){
                delQueue.reverse().forEach(function(val){
                    node.args.splice(val, 1);
                });

                props = {
                    args       : [new Cola.AST_Object(props)],
                    start      : node.start, 
                    end        : node.end,  
                    expression : new Cola.AST_SymbolRef({ 
                        name : '$_cola_func_named_args' 
                    })
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
                    b = arguments[$_cola_i+0] !== undefiend ? arguments[$_cola_i+0] : false,
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
                    splated = { pos : pos++, after : 0, val : val };
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
                
                if(splated && (pos - 1 == splated.pos || pos + 1 == splated.pos)){
                    aftersplated = 0;
                    props.definitions.push(new Cola.AST_VarDef({
                        name  : new Cola.AST_SymbolRef({ name : '$_cola_i' }),
                        value : null
                    }));

                    props.definitions.push(new Cola.AST_VarDef({
                        name  : splated.val.name,
                        value : new Cola.AST_Conditional({
                            condition   : new Cola.AST_Binary({
                                operator  : "<=",
                                left      : new Cola.AST_Number({ value : splated.pos + splated.after + 1 }),
                                right     : new Cola.AST_Dot({
                                    expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
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
                                    new Cola.AST_SymbolRef({ name : 'arguments' }), 
                                    new Cola.AST_Number({ value : splated.pos }),
                                    new Cola.AST_Assign({
                                        operator : '=',
                                        left     : new Cola.AST_SymbolRef({ name : '$_cola_i' }),
                                        right    : new Cola.AST_Binary({
                                            operator : '-',
                                            left     : new Cola.AST_Dot({
                                                property   : "length",
                                                expression : new Cola.AST_SymbolRef({ name : 'arguments' })
                                            }),
                                            right    : new Cola.AST_Number({ value : splated.after })
                                        })
                                    })
                                ]
                            }),
                            alternative : new Cola.AST_Seq({
                                car : new Cola.AST_Assign({
                                    operator : '=',
                                    left     : new Cola.AST_SymbolRef({ name : '$_cola_i' }),
                                    right    : new Cola.AST_Number({ value : splated.pos })
                                }),
                                cdr : new Cola.AST_Array({ elements : [] })
                            })
                        })
                    }));
    
                    splated = false; 
                }

                if(val.defval instanceof Cola.AST_Noop) props.definitions.push(new Cola.AST_VarDef({
                    name  : val.name,
                    value : new Cola.AST_Sub({
                        expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                        property   : aftersplated == -1
                            ? new Cola.AST_Number({ value : pos })
                            : new Cola.AST_Binary({
                                operator : '+',
                                left     : new Cola.AST_SymbolRef({ name : '$_cola_i' }),
                                right    : new Cola.AST_Number({ value : aftersplated++ })
                            })
                    })
                }));
                else props.definitions.push(new Cola.AST_VarDef({
                    name  : val.name,
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
                                    right    : new Cola.AST_Number({ value : aftersplated++ })
                                })
                        }),
                        alternative : val.defval
                    })
                }));
            });

            named.forEach(function(val, i){
                if(val.defval instanceof Cola.AST_Noop) props.definitions.push(new Cola.AST_VarDef({
                    name  : val.name,
                    value : new Cola.AST_Dot({
                        expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                        property   : val.name.name
                    })
                }));
                else props.definitions.push(new Cola.AST_VarDef({
                    name  : val.name,
                    value : new Cola.AST_Conditional({
                        condition   : new Cola.AST_Binary({
                            operator : "!==",
                            left     : new Cola.AST_Dot({
                                expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                                property   : val.name.name
                            }),
                            right    : new Cola.AST_SymbolRef({ name : 'undefined' })
                        }),
                        consequent  : new Cola.AST_Dot({
                            expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                            property   : val.name.name
                        }),
                        alternative : val.defval
                    })
                }));
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
        }
    
        node._descend(node, this);
        return node;
    });

    _this = this.transform(tt);
    
    for(var i in $_cola_hash) if($_cola_hash.hasOwnProperty(i))
        _this.body.unshift($_cola_ast.body[i]);

    return _this;
};