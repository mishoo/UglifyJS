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
    ({{left}} === {{right}} || {{right}}.prototype && ({{left}} instanceof {{right}} || typeof {{left}} === typeof {{right}}()))

*/
Cola.Constructions.Is = function(left, right, ext){
    return this.setPos(new Cola.AST_Binary({
        left     : new Cola.AST_Binary({
            left     : left,
            operator : "===",
            right    : right
        }),
        operator : "||",
        right    : new Cola.AST_Binary({
            left     : new Cola.AST_Dot({
                expression : right,
                property   : "prototype"
            }),
            operator : "&&",
            right    : new Cola.AST_Binary({
                left     : new Cola.AST_Binary({
                    left     : left,
                    operator : "instanceof",
                    right    : right
                }),
                operator : "||",
                right    : new Cola.AST_Binary({
                    left     : new Cola.AST_UnaryPrefix({
                        operator   : "typeof",
                        expression : left
                    }),
                    operator : "===",
                    right    : new Cola.AST_UnaryPrefix({
                        operator   : "typeof",
                        expression : new Cola.AST_Call({
                            expression : right,
                            args       : []
                        })
                    })  
                })
            })
        })
    }), ext);
};

/*
    !({{left}} === {{right}} || {{right}}.prototype && ({{left}} instanceof {{right}} || typeof {{left}} === typeof {{right}}()))

*/
Cola.Constructions.Isnt = function(left, right, ext){
    return this.setPos(new Cola.AST_UnaryPrefix({
        operator   : "!",
        expression : new Cola.AST_Binary({
            left     : new Cola.AST_Binary({
                left     : left,
                operator : "===",
                right    : right
            }),
            operator : "||",
            right    : new Cola.AST_Binary({
                left     : new Cola.AST_Dot({
                    expression : right,
                    property   : "prototype"
                }),
                operator : "&&",
                right    : new Cola.AST_Binary({
                    left     : new Cola.AST_Binary({
                        left     : left,
                        operator : "instanceof",
                        right    : right
                    }),
                    operator : "||",
                    right    : new Cola.AST_Binary({
                        left     : new Cola.AST_UnaryPrefix({
                            operator   : "typeof",
                            expression : left
                        }),
                        operator : "===",
                        right    : new Cola.AST_UnaryPrefix({
                            operator   : "typeof",
                            expression : new Cola.AST_Call({
                                expression : right,
                                args       : []
                            })
                        })  
                    })
                })
            })
        })
    }), ext);
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
    {{length}} <= {{name}}.length ? [].slice.call({{name}}, {{pos}}, _ColaRuntime$${{uid}}i = {{name}}.length - {{after}}) : (_ColaRuntime$${{uid}}i = {{pos}}, [])

*/
Cola.Constructions.SplatedConditional = function(name, uid, pos, after, length){
    if(Cola._ColaRuntime$$is(name, String)) name = new Cola.AST_SymbolRef({ name : name });
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
                    left     : new Cola.AST_SymbolRef({ name :  "_ColaRuntime$$" + uid + "i" }),
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
                left     : new Cola.AST_SymbolRef({ name :  "_ColaRuntime$$" + uid + "i" }),
                right    : new Cola.AST_Number({ value : pos }) // pos
            }),
            cdr : new Cola.AST_Array({ elements : [] })
        })
    });
};

/*
    {{name}}[{{pos}}]

    or

    {{name}}[_ColaRuntime$${{uid}}i + {{after}}]

*/
Cola.Constructions.ValueWithOffset = function(name, uid, cond, pos, after){
    if(Cola._ColaRuntime$$is(name, String)) name = new Cola.AST_SymbolRef({ name : name });
    return new Cola.AST_Sub({ 
        expression : name, 
        property   : cond 
            ? new Cola.AST_Number({ value : pos }) 
            : new Cola.AST_Binary({
                operator : "+",
                left     : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$" + uid + "i" }),
                right    : new Cola.AST_Number({ value : after })
            })
    });
};

/*
    {{name}}.{{key}}

    or

    {{name}}["{{key}}"]

*/
Cola.Constructions.ValueWithKey = function(cond, name, key){
    return cond
        ? new Cola.AST_Dot({ 
            expression : name, 
            property   : key
        })
        : new Cola.AST_Sub({
            expression : name,
            property   : new Cola.AST_String({ value : key })
        });
};

/*
    {{name}} = {{length}} <= arguments.length ? [].slice.call(arguments, {{pos}}, _ColaRuntime$$i = arguments.length - {{after}}) : (_ColaRuntime$$i = {{pos}}, [])

*/
Cola.Constructions.SplatedVarDef = function(name, pos, after, length){
    if(Cola._ColaRuntime$$is(name, String)) name = { name : name };
    return new Cola.AST_VarDef({
        type  : "Array",
        name  : new Cola.AST_SymbolVar(name), // name
        value : Cola.Constructions.SplatedConditional('arguments', '_', pos, after, length)
    });
};

/*
    {{name}} = arguments[{{pos}}]

    or

    {{name}} = arguments[_ColaRuntime$$i + {{aftersplated}}]

*/
Cola.Constructions.PosedVarDef = function(name, type, pos, aftersplated){
    if(Cola._ColaRuntime$$is(name, String)) name = { name : name };
    return new Cola.AST_VarDef({
        type  : type,
        name  : new Cola.AST_SymbolVar(name),
        value : Cola.Constructions.ValueWithOffset('arguments', '_', aftersplated == -1, pos, aftersplated)
    });
};

/*
    {{name}} = arguments[{{pos}}] !== undefined ? arguments[{{pos}}] : {{defval}}

    or

    {{name}} = arguments[_ColaRuntime$$i + {{aftersplated}}] !== undefined ? arguments[_ColaRuntime$$i + {{aftersplated}}] : {{defval}}

*/
Cola.Constructions.PosedWithDefsVarDef = function(name, type, defval, pos, aftersplated){
    if(Cola._ColaRuntime$$is(name, String)) name = { name : name };
    return new Cola.AST_VarDef({
        type  : type,
        name  : new Cola.AST_SymbolVar(name),
        value : new Cola.AST_Conditional({
            condition   : new Cola.AST_Binary({
                operator : "!==",
                left     : Cola.Constructions.ValueWithOffset('arguments', '_', aftersplated == -1, pos, aftersplated),
                right    : new Cola.AST_SymbolRef({ name : 'undefined' })
            }),
            consequent  : Cola.Constructions.ValueWithOffset('arguments', '_', aftersplated == -1, pos, aftersplated),
            alternative : defval
        })
    });
};

/*
    {{name}} = arguments.{{key}} !== undefined ? arguments.{{key}} : {{defval}}

*/
Cola.Constructions.NamedVarDef = function(name, type, defval, key){
    if(Cola._ColaRuntime$$is(name, String)) name = { name : name };
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

Cola.ContainCondAccess = function(node){
    if(!(node instanceof Cola.AST_Call || node instanceof Cola.AST_PropAccess)) return false;
    if(node instanceof Cola.AST_CondAccess) return node.expression;

    var expr = node;
    while(expr.expression instanceof Cola.AST_Call || expr.expression instanceof Cola.AST_PropAccess){
        expr = expr.expression;
        if(expr instanceof Cola.AST_CondAccess) return expr.expression;
    }

    return false;
};

Cola.DefPropWithMods = function(def, mods){
    if(mods.length == 0) return new Cola.AST_Assign({
        start    : def.start,
        end      : def.end,
        operator : '=',
        left     : def.name,
        right    : def.value
    });

    var dp = { properties : [] };

    if(def.value)
        dp.properties.push(new Cola.AST_ObjectKeyVal({
            key   : "value",
            value : def.value
        }));

    if(!(def.name.expression instanceof Cola.AST_Symbol && def.name.expression.name == "this" || def.name instanceof Cola.AST_Proto))
        dp.properties.push(new Cola.AST_ObjectKeyVal({
            key   : "configurable",
            value : new Cola.AST_True
        }));

    if(mods.indexOf("const") == -1)
        dp.properties.push(new Cola.AST_ObjectKeyVal({
            key   : "writable",
            value : new Cola.AST_True
        }));

    if(mods.indexOf("covert") == -1)
        dp.properties.push(new Cola.AST_ObjectKeyVal({
            key   : "enumerable",
            value : new Cola.AST_True
        }));
    
    return new Cola.AST_Call({
        args       : [
            def.name.expression, 
            def.name instanceof Cola.AST_Sub
                ? def.name.property
                : new Cola.AST_String({ value: def.name.property }), 
            new Cola.AST_Object(dp)],
        expression : new Cola.AST_Dot({
            expression : new Cola.AST_SymbolRef({ name: "Object" }),
            property   : "defineProperty"
        })
    });
};

Cola.DefFunWithMods = function(func, mods){
    if(!mods || mods.length == 0){ 
        if(func instanceof Cola.AST_Defun || func instanceof Cola.AST_Function)
            return new Cola.AST_Assign({
                start    : func.start,
                end      : func.end,
                operator : '=',
                left     : func.name,
                right    : (function(node){
                    node.name = new Cola.AST_SymbolLambda({
                        start : node.name.start,
                        end   : node.name.end,
                        name  : node.name.property
                    });
                    return new Cola.AST_Function(node);
                })(func)
            });
        else if(func instanceof Cola.AST_Getter)
            return new Cola.AST_Call({
                expression : new Cola.AST_Dot({
                    expression : func.name instanceof Cola.AST_Proto
                        ? new Cola.AST_Dot({ expression: func.name.expression, property: "prototype" })
                        : func.name.expression,
                    property   : "__defineGetter__"
                }),
                args       : [
                    new Cola.AST_String({ value: func.name.property}),
                    (function(node){
                        node.name = new Cola.AST_SymbolLambda({
                            start : node.name.start,
                            end   : node.name.end,
                            name  : node.name.property
                        });
                        return new Cola.AST_Function(node);
                    })(func)
                ],
            });
        else if(func instanceof Cola.AST_Setter)
            return new Cola.AST_Call({
                expression : new Cola.AST_Dot({
                    expression : func.name instanceof Cola.AST_Proto
                        ? new Cola.AST_Dot({ expression: func.name.expression, property: "prototype" })
                        : func.name.expression,
                    property   : "__defineSetter__"
                }),
                args       : [
                    new Cola.AST_String({ value: func.name.property}),
                    (function(node){
                        node.name = new Cola.AST_SymbolLambda({
                            start : node.name.start,
                            end   : node.name.end,
                            name  : node.name.property
                        });
                        return new Cola.AST_Function(node);
                    })(func)
                ],
            });
    }

    var sname = func.name, dp = { properties : [
        new Cola.AST_ObjectKeyVal({
            key   : (function(node){
                if(node instanceof Cola.AST_Getter) return "get";
                if(node instanceof Cola.AST_Setter) return "set";
                return "value";
            })(func),
            value : (function(node){
                node.name = new Cola.AST_SymbolLambda({
                    start : node.name.start,
                    end   : node.name.end,
                    name  : node.name.property
                });
                return new Cola.AST_Function(node);
            })(func)
        })
    ] };

    if(!(sname instanceof Cola.AST_Proto || mods.indexOf("method") != -1))
        dp.properties.push(new Cola.AST_ObjectKeyVal({
            key   : "configurable",
            value : new Cola.AST_True
        }));

    if(!(func instanceof Cola.AST_Getter || func instanceof Cola.AST_Setter || mods.indexOf("method") != -1))
        dp.properties.push(new Cola.AST_ObjectKeyVal({
            key   : "writable",
            value : new Cola.AST_True
        }));

    if(mods.indexOf("covert") == -1)
        dp.properties.push(new Cola.AST_ObjectKeyVal({
            key   : "enumerable",
            value : new Cola.AST_True
        }));
    
    return new Cola.AST_Call({
        args       : [
            sname instanceof Cola.AST_Proto
                ? (mods.indexOf("static") != -1 ? sname.expression : new Cola.AST_Dot({ expression: sname.expression, property: "prototype" }))
                : sname.expression, 
            sname instanceof Cola.AST_Sub
                ? sname.property 
                : new Cola.AST_String({ value: sname.property }), 
            new Cola.AST_Object(dp)],
        expression : func instanceof Cola.AST_Getter || func instanceof Cola.AST_Setter
            ? new Cola.AST_SymbolRef({ name: "_ColaRuntime$$updateProperty" })
            : new Cola.AST_Dot({
                expression : new Cola.AST_SymbolRef({ name: "Object" }),
                property   : "defineProperty"
            })
    });
};

Cola.FuncAsync = function(func) {
    if (!func.body.length) return func;
    var newBody = [];

    if (func.argnames.length) newBody.push(new Cola.AST_Var({
        mods        : [],
        type        : "dynamic",
        definitions : [new Cola.AST_VarDef({
            type  : "dynamic",
            name  : new Cola.AST_SymbolVar({ name: "_ColaRuntime$$arguments" }),
            value : new Cola.AST_SymbolRef({ name: "arguments" })
        })]
    }));

    newBody.push(new Cola.AST_Return({
        value : new Cola.AST_New({
            args       : [],
            expression : new Cola.AST_SymbolRef({ name: "Promise" })
        })
    }));

    newBody[newBody.length - 1].value.args.push(new Cola.AST_Call({
        args       : [new Cola.AST_This],
        expression : new Cola.AST_Dot({ expression: false, property: "bind" })
    }));

    func.body.unshift(new Cola.AST_SimpleStatement({
        body  : new Cola.AST_Assign({
            left     : new Cola.AST_SymbolRef({ name: "arguments" }),
            operator : "=",
            right    : func.argnames.length
                ? new Cola.AST_SymbolRef({ name: "_ColaRuntime$$arguments" })
                : new Cola.AST_Object
        })
    }));

    newBody[newBody.length - 1].value.args[0].expression.expression = new Cola.AST_Function({
        body       : func.body,
        argnames   : [
            new Cola.AST_SymbolFunarg({ name : "_ColaRuntime$$resolve" }),
            new Cola.AST_SymbolFunarg({ name : "_ColaRuntime$$reject" })
        ] 
    });

    func.body = newBody;

    return func;
};

Cola.PushModuleToCommonWrapper = function(module, commonWrapper, name, id) {
    commonWrapper.body.args[0].elements.push(new Cola.AST_Function({
        body       : module.body,
        argnames   : [
            new Cola.AST_SymbolFunarg({ name : "require" }),
            new Cola.AST_SymbolFunarg({ name : "module" }),
            new Cola.AST_SymbolFunarg({ name : "exports" })
        ] 
    }));

    if (!name || !id) return;

    commonWrapper.body.args[2].properties.push(new Cola.AST_ObjectKeyVal({
        key   : name,
        value : new Cola.AST_Number({ value : id })
    })); 
};


Cola.AST_Toplevel.prototype.toJavaScript = function(options){
    if(this.language == 'js') return this;
    this.language = 'js';

    options = Cola.defaults(options, {
        main_binding : true,
        main_event   : 'DOMContentLoaded',
        parser       : {},
        is_node      : false,
        std_hash     : {},
        path         : "",
        modules      : {},
        root         : true
    });

    var _ColaRuntime$$ast = Cola.parse(Cola._ColaRuntime, { is_js : true }), 
        _ColaRuntime$$hash = options.std_hash, 

        _this = this, deep = 0, 

        required = [], required_hash = {}, exports = [], 
        awaitData = {
            "with"           : false,
            "level"          : null,
            "indent"         : -1,
            "expression"     : [],
            "origExpression" : [],
            "body"           : [],
        },

    tt = new Cola.TreeTransformer(function(node, descend, in_list){
        var newNode, props = {}, parent = this.parent();
        node = node.clone();     

        /*
            async GET(String url) {
                var xhr = new XMLHttpRequest();
                
                xhr.onreadystatechange() {
                    if (xhr.readyState != 4) return;
                    if (xhr.status == 200) resolve xhr.response;
                    
                    reject false;
                }
                
                xhr.open("GET", url, true);
                xhr.send();
            }
            
            to
            
            function GET(url) {
                var _ColaRuntime$$arguments = arguments;
                return new Promise(function(_ColaRuntime$$resolve, _ColaRuntime$$reject) {
                    arguments = _ColaRuntime$$arguments;
                    var xhr = new XMLHttpRequest();
                
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState != 4) return;
                        if (xhr.status == 200) return _ColaRuntime$$resolve(xhr.response);
                    
                        return _ColaRuntime$$reject(false);
                    }
                
                    xhr.open("GET", url, true);
                    xhr.send();
                }.bind(this));
            }

         */
        if (node instanceof Cola.AST_Defun && node.mods.indexOf("async") != -1) {
            node = Cola.FuncAsync(node);
        }

        /*
            main(){
                console.log("hello world");
            }

            to

            window.addEventListener('DOMContentLoaded',
            function main(){
                console.log("hello world");
            }, false);

            or node

            (function main(){
                console.log("hello world");
            })();

        */
        if(options.main_binding && parent instanceof Cola.AST_Toplevel && node instanceof Cola.AST_Defun && node.name instanceof Cola.AST_SymbolDefun && node.name.name == "main"){
            node.name = new Cola.AST_SymbolLambda(node.name);
            node = new Cola.AST_Function(node);

            props = !options.is_node ? {
                args       : [new Cola.AST_String({ value : options.main_event }), node, new Cola.AST_False()],
                expression : new Cola.AST_Dot({
                    property   : 'addEventListener',
                    expression : new Cola.AST_SymbolRef({ name : 'window' })
                })
            } : {
                args       : [],
                expression : node
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

            _ColaRuntime$$modulo(5, 2)
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == '%%'){
            _ColaRuntime$$hash[Cola._ColaRuntime$$modulo.i] = true;
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.left, node.right],
                expression : new Cola.AST_SymbolRef({ name  : '_ColaRuntime$$modulo' })
            };
    
            node = new Cola.AST_Call(props);
        } else 

        /*
            a.b?.c();

            to

            if(!(typeof a.b === "undefined" || a.b === null)) a.b.c();

        */
        if(node instanceof Cola.AST_SimpleStatement && (props = Cola.ContainCondAccess(node.body))){
            if(node.body instanceof Cola.AST_CondAccess) node.body = new Cola.AST_Dot(node.body);
            else {
                var expr = node.body;
                while(expr.expression instanceof Cola.AST_Call || expr.expression instanceof Cola.AST_PropAccess){
                    if(expr.expression instanceof Cola.AST_CondAccess){
                        expr.expression = new Cola.AST_Dot(expr.expression);
                        break;
                    }
                    expr = expr.expression;
                }
            }

            node = new Cola.AST_If({
                condition   : Cola.Constructions.IsSet(props),
                body        : node
            });
        } else

        /*
            alert(a.b?.c());

            to

            alert(typeof a.b === "undefined" && a.b === null ? undefined : a.b.c());

        */
        if(props = Cola.ContainCondAccess(node)){
            if(node instanceof Cola.AST_CondAccess) node = new Cola.AST_Dot(node);
            else {
                var expr = node;
                while(expr.expression instanceof Cola.AST_Call || expr.expression instanceof Cola.AST_PropAccess){
                    if(expr.expression instanceof Cola.AST_CondAccess){
                        expr.expression = new Cola.AST_Dot(expr.expression);
                        break;
                    }
                    expr = expr.expression;
                }
            }

            node = new Cola.AST_Conditional({
                condition   : Cola.Constructions.IsntSet(props),
                consequent  : new Cola.AST_Undefined,
                alternative : node
            });
        } else

        /*
            a.b?.c = 123;

            to

            if(a.b !== "undefined" && a.b !== null) a.b.c = 123;

        */
        if(node instanceof Cola.AST_SimpleStatement && node.body instanceof Cola.AST_Assign && (props = Cola.ContainCondAccess(node.body.left))){
            if(node.body.left instanceof Cola.AST_CondAccess) node.body.left = new Cola.AST_Dot(node.body.left);
            else {
                var expr = node.body.left;
                while(expr.expression instanceof Cola.AST_Call || expr.expression instanceof Cola.AST_PropAccess){
                    if(expr.expression instanceof Cola.AST_CondAccess){
                        expr.expression = new Cola.AST_Dot(expr.expression);
                        break;
                    }
                    expr = expr.expression;
                }
            }

            node = new Cola.AST_If({
                condition   : Cola.Constructions.IsSet(props),
                body        : node
            });
        } else

        /*
            alert(a.b?.c = 123);

            to

            alert(typeof a.b === "undefined" && a.b === null ? undefined : a.b?.c = 123);

        */
        if(node instanceof Cola.AST_Assign && (props = Cola.ContainCondAccess(node.left))){
            if(node.left instanceof Cola.AST_CondAccess) node.left = new Cola.AST_Dot(node.left);
            else {
                var expr = node.left;
                while(expr.expression instanceof Cola.AST_Call || expr.expression instanceof Cola.AST_PropAccess){
                    if(expr.expression instanceof Cola.AST_CondAccess){
                        expr.expression = new Cola.AST_Dot(expr.expression);
                        break;
                    }
                    expr = expr.expression;
                }
            }

            node = new Cola.AST_Conditional({
                condition   : Cola.Constructions.IsntSet(props),
                consequent  : new Cola.AST_Undefined,
                alternative : node
            });
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

            123 === Number || Number.prototype && (123 instanceof Number || typeof 123 === typeof Number()))
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == 'is'){
            node = Cola.Constructions.Is(node.left, node.right, node);
        } else 

        /*
            true isnt String

            to

            !(true === String || String.prototype && (true instanceof String || typeof true === typeof String())))
            
        */
        if(node instanceof Cola.AST_Binary && node.operator == 'isnt'){
            node = Cola.Constructions.Isnt(node.left, node.right, node);
        } else 

        /*
            a?

            to

            _ColaRuntime$$isset(a)
            
        */
        if(node instanceof Cola.AST_UnaryPostfix && node.operator == '?'){
            node = Cola.Constructions.IsSet(node.expression, node);
        } else 

        /*
            a = clone b

            to

            a = _ColaRuntime$$clone(b)
            
        */
        if(node instanceof Cola.AST_UnaryPrefix && node.operator == 'clone'){
            _ColaRuntime$$hash[Cola._ColaRuntime$$clone.i] = true;
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.expression],
                expression : new Cola.AST_SymbolRef({ name : '_ColaRuntime$$clone' })
            };

            node = new Cola.AST_Call(props);
        } else

        /*
            resolve a

            to

            return _ColaRuntime$$resolve(a)
            
        */
        if(node instanceof Cola.AST_Resolve){
            node = new Cola.AST_Return({
                value : new Cola.AST_Call({
                    args       : [node.value],
                    expression : new Cola.AST_SymbolRef({ name: "_ColaRuntime$$resolve" })
                })
            });
        } else

        /*
            reject a

            to

            return _ColaRuntime$$reject(a)
            
        */
        if(node instanceof Cola.AST_Reject){
            node = new Cola.AST_Return({
                value : new Cola.AST_Call({
                    args       : [node.value],
                    expression : new Cola.AST_SymbolRef({ name: "_ColaRuntime$$reject" })
                })
            });
        } else

        /*
            await a

            to

            _ColaRuntime$$fulfilled
            
        */
        if(node instanceof Cola.AST_UnaryPrefix && node.operator == 'await'){
            awaitData.with = true;
            awaitData.expression.push(node.expression);

            node = new Cola.AST_SymbolRef({ name: "_ColaRuntime$$fulfilled" });

            awaitData.origExpression.push(node);
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

            func(_ColaRuntime$$array_last(arr))
            
        */
        if(node instanceof Cola.AST_Sub && node.property instanceof Cola.AST_Noop){
            _ColaRuntime$$hash[Cola._ColaRuntime$$array_last.i] = true;
            props = {
                start      : node.start, 
                end        : node.end, 
                args       : [node.expression],
                expression : new Cola.AST_SymbolRef({ name  : '_ColaRuntime$$array_last' })
            };

            node = new Cola.AST_Call(props);
        } else

        /*
            arr[-1]

            to

            arr[_ColaRuntime$$array_negate_access(arr, -1)]

        */
        if(node instanceof Cola.AST_Sub && node.property instanceof Cola.AST_UnaryPrefix && node.property.operator == "-" && node.property.expression instanceof Cola.AST_Number){
            _ColaRuntime$$hash[Cola._ColaRuntime$$array_negate_access.i] = true;
            node.property = new Cola.AST_Call({ 
                args       : [node.expression, node.property],
                expression : new Cola.AST_SymbolRef({ name  : '_ColaRuntime$$array_negate_access' })
            });
        } else

        /*
            arr[%index]

            to

            arr[_ColaRuntime$$array_modulo_access(arr, index)]

        */
        if(node instanceof Cola.AST_Sub && node.property instanceof Cola.AST_UnaryPrefix && node.property.operator == "%"){
            _ColaRuntime$$hash[Cola._ColaRuntime$$array_modulo_access.i] = true;
            node.property = new Cola.AST_Call({ 
                args       : [node.expression, node.property.expression],
                expression : new Cola.AST_SymbolRef({ name  : '_ColaRuntime$$array_modulo_access' })
            });
        } else

        /*
            arr[0..1] = 123

            to

            _ColaRuntime$$array_asplice(arr, 0, 1, 123)
            
        */
        if(node instanceof Cola.AST_Assign && node.operator == '=' && node.left instanceof Cola.AST_Sub && node.left.property instanceof Cola.AST_ArrayRange){
            _ColaRuntime$$hash[Cola._ColaRuntime$$array_asplice.i] = true;
            props = {
                start      : node.start,
                end        : node.end, 
                args       : [node.left.expression, node.left.property.from, node.left.property.to, node.right],
                expression : new Cola.AST_SymbolRef({ name  : '_ColaRuntime$$array_asplice' })
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

            _ColaRuntime$$array_range(0, 3)
            
        */
        if(node instanceof Cola.AST_ArrayRange){
            _ColaRuntime$$hash[Cola._ColaRuntime$$array_range.i] = true;
            props = {
                start      : node.start,
                end        : node.end,
                args       : [node.from, node.to],
                expression : new Cola.AST_SymbolRef({ name : '_ColaRuntime$$array_range' })
            };

            if(node.triple) props.args[1] = new Cola.AST_Binary({
                operator : "-",
                left     : node.to,
                right    : new Cola.AST_Number({ value : 1 })
            });

            node = new Cola.AST_Call(props);
        } else

        /*
            const int num = 1, obj.num = 0;

            to

            const num = 1;
            Object.defineProperty(obj, "num", { value: 0, enumerable: true });
            
        */
        if(node instanceof Cola.AST_Var && !(parent instanceof Cola.AST_IterationStatement)){
            var defCache = []; newNode = [];
            node.definitions.forEach(function(def, i){
                if(def.name instanceof Cola.AST_SymbolVar){
                    defCache.push(def);
                } else if(def.value || node.mods.indexOf("covert") != -1){ 
                    if(defCache.length != 0){
                        newNode.push(node.mods.length == 1 ? new Cola.AST_Const(node) : node.clone());
                        newNode[newNode.length - 1].definitions = defCache.map(function(def){
                            if (node.mods && node.mods.indexOf("const") != -1) 
                                def.name = new Cola.AST_SymbolConst(def.name);
                            if (node.mods && node.mods.indexOf("export") != -1)
                                exports.push(def.name.name); 
                            return def;
                        });
                        defCache = [];
                    }

                    var texpr = def.name;
                    while(!(texpr.expression instanceof Cola.AST_Symbol || texpr.expression instanceof Cola.AST_Constant)) texpr = texpr.expression;
                    if(texpr.expression instanceof Cola.AST_Symbol && !(texpr.expression instanceof Cola.AST_This)) texpr.expression = new Cola.AST_SymbolRef(texpr.expression);

                    newNode.push(Cola.DefPropWithMods(def, node.mods));                    
                    newNode[newNode.length - 1] = new Cola.AST_SimpleStatement({
                        body  : newNode[newNode.length - 1]
                    });
                }
            });

            if(defCache.length != 0){
                newNode.push(node.mods && node.mods.indexOf("const") != -1 ? new Cola.AST_Const(node) : node.clone());
                newNode[newNode.length - 1].definitions = defCache.map(function(def){
                    if (node.mods && node.mods.indexOf("const") != -1) 
                        def.name = new Cola.AST_SymbolConst(def.name);
                    if (node.mods && node.mods.indexOf("export") != -1)
                        exports.push(def.name.name); 
                    return def;
                });

                defCache = []; 
            }

            node = newNode;
        } else

        /*
            int Math.rand(){} or Math.rand(){}

            to

            Math.rand = function rand(){}
        */
        if(node instanceof Cola.AST_Lambda && node.name && !(node.name instanceof Cola.AST_Symbol)){
            var texpr = node.name, notst = node instanceof Cola.AST_Function;
            while(!(texpr.expression instanceof Cola.AST_Symbol || texpr.expression instanceof Cola.AST_Constant)) texpr = texpr.expression;
            if(texpr.expression instanceof Cola.AST_Symbol && !(texpr.expression instanceof Cola.AST_This)) texpr.expression = new Cola.AST_SymbolRef(texpr.expression);

            node = Cola.DefFunWithMods(node, node.mods);

            if(node instanceof Cola.AST_Call && node.expression instanceof Cola.AST_SymbolRef && node.expression.name == "_ColaRuntime$$updateProperty") _ColaRuntime$$hash[Cola._ColaRuntime$$updateProperty.i] = true;

            if(!notst) node = new Cola.AST_SimpleStatement({
                body : node
            });
        } else

        /*
            func(a, b, name : name, c)

            to

            func(a, b, c, new _ColaRuntime$$func_named_args({ name : name }))
            
        */
        if(node instanceof Cola.AST_Call){
            props = { properties : [] };
            
            var delQueue = [];
            node.args.forEach(function(val, i){
                if(!(val instanceof Cola.AST_Namedarg)) return;

                _ColaRuntime$$hash[Cola._ColaRuntime$$func_named_args.i] = true;
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
                    expression : new Cola.AST_SymbolRef({ name : '_ColaRuntime$$func_named_args' })
                };

                node.args.push(new Cola.AST_New(props));
            }
        } else

        /*
            class Test extends ParentTest {
        
                const int i = 123;

                Test(){ // constructor
                    super();
                }

                Test.Test2(){ // named constructor
                    super.Test2();
                }

                queryAll("ul li a").forEach((el) => 
                    el.onclick = () => console.log("click")
                );

                covert String method1() => console.log("method");

                get getter() => i;
                set setter(int val) => console.log(val); 

                superExample(){
                    super.superExample();
                }

                selfExample(){
                    query("*").onclick = () => console.log(self);
                }

            }

            to

            Test(){
                this.pre_constructor();

                this.super.constructor.call(this);

                this.post_constructor();
            }
            Test.prototype = _ColaRuntime$$proto(ParentTest);
            Test.prototype.$uper = ParentTest.prototype.

            Test::Test2 = Test.Test2(){
                this.pre_constructor();

                this.super.Test2.call(this);
        
                this.post_constructor();
            };
            Test.Test2.prototype = Test.prototype;

            Test::pre_constructor(){
                this.super = ParentTest.prototype;
                const int this.i = 123;
            }

            Test::post_constructor(){
                queryAll("ul li a").forEach((el) => 
                    el.onclick = () => console.log("click")
                );
            }

            covert String Test::method1() => console.log("method");

            get Test::getter() => i;
            set Test::setter(int val) => console.log(val); 

            Test::superExample(){
                this.super.superExample.call(this);
            }

            Test::selfExample(){
                var self = this;
                query("*").onclick = () => console.log(self);
            }

        */
        if(node instanceof Cola.AST_Class){
            var pre_constructor, post_constructor, main_constructors = [], 
                is_pre = true, members = ["super"], binder;
            
            newNode = [];
            node.name = new Cola.AST_SymbolRef(node.name);

            if (node.mods.length) 
                exports.push(node.name.name);

            pre_constructor = new Cola.AST_Defun({
                mods     : ["covert"],
                type     : "dynamic",
                name     : new Cola.AST_Proto({
                    expression : new Cola.AST_SymbolDefun(node.name),
                    property   : "pre_constructor"
                }),
                argnames : [],
                body     : []
            });

            post_constructor = new Cola.AST_Defun({
                mods     : ["covert"],
                type     : "dynamic",
                name     : new Cola.AST_Proto({
                    expression : new Cola.AST_SymbolDefun(node.name),
                    property   : "post_constructor"
                }),
                argnames : [],
                body     : []
            });

            var has_main_constr = false;
            node.body.forEach(function(member){
                if(member instanceof Cola.AST_Defun && member.name instanceof Cola.AST_SymbolDefun && member.name.name == node.name.name){
                    main_constructors.push(member);
                    newNode.push(member);

                    has_main_constr = true;

                    if(node.extends){
                        _ColaRuntime$$hash[Cola._ColaRuntime$$proto.i] = true;
                        newNode.push(new Cola.AST_Assign({
                            left     : new Cola.AST_Dot({ expression: node.name, property: "prototype" }),
                            operator : "=",
                            right    : new Cola.AST_Call({
                                expression : new Cola.AST_SymbolRef({ name: "_ColaRuntime$$proto" }),
                                args       : [node.extends]
                            })
                        }));
                        newNode[newNode.length - 1] = new Cola.AST_SimpleStatement({
                            body : newNode[newNode.length - 1]
                        });
                    }

                    is_pre = false;
                } else

                if(member instanceof Cola.AST_Defun && member.name instanceof Cola.AST_Dot && 
                   member.name.expression instanceof Cola.AST_SymbolDefun && member.name.expression.name == node.name.name){
                    main_constructors.push(member);
                    newNode.push(member);

                    newNode.push(new Cola.AST_Assign({
                        left     : new Cola.AST_Dot({ 
                            expression : (function(name){
                                name.expression = new Cola.AST_SymbolRef(name.expression);
                                return name;
                            })(member.name),
                            property   : "prototype"
                        }),
                        operator : "=",
                        right    : new Cola.AST_Dot({ expression: node.name, property: "prototype" })
                    }));
                    newNode[newNode.length - 1] = new Cola.AST_SimpleStatement({
                        body : newNode[newNode.length - 1]
                    });

                    is_pre = false;
                } else

                if(member instanceof Cola.AST_Lambda && member.name instanceof Cola.AST_SymbolDefun){
                    if(members.indexOf(member.name.name) == -1) members.push(member.name.name);
                    member.name = new Cola.AST_Proto({
                        expression : node.name,
                        property   : member.name.name
                    });
                    newNode.push(member);
                } else 

                if(member instanceof Cola.AST_Var && member.mods.indexOf("static") != -1){
                    member.definitions.forEach(function(def){
                        var texpr = def.name;

                        if(!(texpr instanceof Cola.AST_Symbol)){
                            while(!(texpr.expression instanceof Cola.AST_Symbol || texpr.expression instanceof Cola.AST_Constant)) texpr = texpr.expression;
                        }

                        if(def.name instanceof Cola.AST_Symbol && (def.value || member.mods.indexOf("covert") != -1)){
                            newNode.push(new Cola.AST_VarDef({
                                name     : new Cola.AST_Dot({ expression: node.name, property: def.name.name }),
                                value    : def.value
                            }));

                            member.mods.splice(member.mods.indexOf("static"), 1);

                            newNode[newNode.length - 1] = new Cola.AST_Var({
                                type        : member.type,
                                mods        : member.mods,
                                definitions : [newNode[newNode.length - 1]]
                            });
                        } else 

                        if((def.value || member.mods.indexOf("covert") != -1) && !(texpr.expression instanceof Cola.AST_This)){
                            texpr.expression = new Cola.AST_Dot({ expression: node.name, property: texpr.expression.name });
                            newNode.push(new Cola.AST_VarDef({
                                name     : def.name,
                                value    : def.value
                            }));

                            member.mods.splice(member.mods.indexOf("static"), 1);

                            newNode[newNode.length - 1] = new Cola.AST_Var({
                                type        : member.type,
                                mods        : member.mods,
                                definitions : [newNode[newNode.length - 1]]
                            });
                        }
                    });
                }

                else {
                    if(member instanceof Cola.AST_Var)
                        member.definitions.forEach(function(def){
                            var texpr = def.name;

                            if(!(texpr instanceof Cola.AST_Symbol)){
                                while(!(texpr.expression instanceof Cola.AST_Symbol || texpr.expression instanceof Cola.AST_Constant)) texpr = texpr.expression;
                                texpr = texpr.expression;
                            }

                            if(texpr instanceof Cola.AST_Symbol && !(texpr instanceof Cola.AST_This) && members.indexOf(texpr.name) == -1)
                                members.push(texpr.name);
                        });

                    if(is_pre) pre_constructor.body.push(member);
                    else post_constructor.body.push(member);
                }
            }); 
            
            if(!has_main_constr){
                newNode.unshift(new Cola.AST_Defun({
                    mods       : [],
                    type       : "dynamic",
                    name       : new Cola.AST_SymbolDefun(node.name),
                    argnames   : [],
                    body       : []
                }));

                main_constructors.push(newNode[0]);

                if(node.extends){
                    newNode[0].body.push(new Cola.AST_SimpleStatement({
                        body : new Cola.AST_Call({
                            expression : new Cola.AST_SymbolRef({ name: "super" }),
                            args       : []
                        })
                    }));

                    _ColaRuntime$$hash[Cola._ColaRuntime$$proto.i] = true;
                    newNode.push(new Cola.AST_Assign({
                        left     : new Cola.AST_Dot({ expression: node.name, property: "prototype" }),
                        operator : "=",
                        right    : new Cola.AST_Call({
                            expression : new Cola.AST_SymbolRef({ name: "_ColaRuntime$$proto" }),
                            args       : [node.extends]
                        })
                    }));
                    newNode[newNode.length - 1] = new Cola.AST_SimpleStatement({
                        body : newNode[newNode.length - 1]
                    });
                }
            }

            if(pre_constructor.body.length != 0){
                newNode.push(pre_constructor);
                main_constructors.forEach(function(constr){
                    constr.body.unshift(new Cola.AST_Call({
                        expression : new Cola.AST_Dot({ 
                            expression : new Cola.AST_Proto({ expression: node.name, property: "pre_constructor" }),
                            property   : "call"
                        }),
                        args       : [new Cola.AST_This]
                    }));
                    constr.body[0] = new Cola.AST_SimpleStatement({
                        body : constr.body[0]
                    });
                });
            }

            if(post_constructor.body.length != 0){
                newNode.push(post_constructor);
                main_constructors.forEach(function(constr){
                    constr.body.push(new Cola.AST_Call({
                        expression : new Cola.AST_Dot({ 
                            expression : new Cola.AST_Proto({ expression: node.name, property: "post_constructor" }),
                            property   : "call"
                        }),
                        args       : [new Cola.AST_This]
                    }));
                    constr.body[constr.body.length - 1] = new Cola.AST_SimpleStatement({
                        body : constr.body[constr.body.length - 1]
                    });
                });
            }
            
            var scope, lvl = 0, hmembers, with_super = false, with_self = false, self_def = false, flvl_this = [];
            binder = new Cola.TreeTransformer(function(member){
                var tmembers, tscope, tlvl, tself_def;
                member = member.clone();
                
                if(lvl > 1 && member instanceof Cola.AST_Var){
                    member.definitions.forEach(function(def){
                        if(def.name instanceof Cola.AST_Symbol){
                            if(hmembers.indexOf(def.name.name) != -1)
                                hmembers.splice(hmembers.indexOf(def.name.name), 1);
                            if(def.name.name == "self")
                                self_def = true;
                        }
                    });
                } else 

                if(lvl > 1 && (member instanceof Cola.AST_Defun || member instanceof Cola.AST_Getter || member instanceof Cola.AST_Setter) && member.name instanceof Cola.AST_Symbol && hmembers.indexOf(member.name.name) != -1){
                    hmembers.splice(hmembers.indexOf(member.name.name), 1);
                } else 

                if(member instanceof Cola.AST_Scope) 
                    scope = (lvl++, member);
                else 

                if(member instanceof Cola.AST_Call && member.expression instanceof Cola.AST_Symbol && member.expression.name == "super" && node.extends){
                    member.expression = new Cola.AST_Dot({
                        expression : node.extends,
                        property   : "call"
                    });
                    member.args.unshift(new Cola.AST_This);
                } else

                if(member instanceof Cola.AST_Call && member.expression instanceof Cola.AST_Dot && member.expression.expression.name == "super" && node.extends){
                    member.expression = new Cola.AST_Dot({
                        expression : member.expression,
                        property   : "call"
                    });
                    member.args.unshift(new Cola.AST_This);
                } else

                if(member instanceof Cola.AST_SymbolRef && hmembers.indexOf(member.name) != -1){
                    if(member.name == "super"){
                        with_super = true;
                        member.name = "$uper";
                    }

                    member = new Cola.AST_Dot({ 
                        expression : lvl > 1
                            ? (with_self = true, new Cola.AST_SymbolRef({ name: "self" }))
                            : new Cola.AST_This,
                        property   : member.name
                    });

                    if(lvl == 1) flvl_this.push(member);
                } else

                if(member instanceof Cola.AST_SymbolRef && member.name == "self" && !self_def){
                    with_self = true;
                } else

                if(member instanceof Cola.AST_SymbolVar && scope.name instanceof Cola.AST_Proto && (scope.name.property == "pre_constructor" || scope.name.property == "post_constructor")
                && hmembers.indexOf(member.name) != -1){
                    member = new Cola.AST_Dot({ 
                        expression : lvl > 1
                            ? (with_self = true, new Cola.AST_SymbolVar({ name: "self" }))
                            : new Cola.AST_This,
                        property   : member.name
                    });

                    if(lvl == 1) flvl_this.push(member);
                }

                tscope = scope; tlvl = lvl; tmembers = hmembers.slice(); tself_def = self_def;
                member._descend(member, this);
                scope = tscope; lvl = tlvl; hmembers = tmembers; self_def = tself_def;

                return member;
            });

            newNode.forEach(function(member, i){
                lvl = 0;
                flvl_this = [];
                with_self = false;
                self_def = false;
                hmembers = members.slice();

                if(member instanceof Cola.AST_Lambda){
                    newNode[i] = member.transform(binder);
                    newNode[i].mods ? newNode[i].mods.push("method") : (newNode[i].mods = ["method"]);

                    if(with_self) {
                        newNode[i].body.unshift(new Cola.AST_Var({
                            mods        : [],
                            type        : "dynamic",
                            definitions : [new Cola.AST_VarDef({
                                type  : "dynamic",
                                name  : new Cola.AST_SymbolVar({ name: "self" }),
                                value : new Cola.AST_This
                            })]
                        }));

                        flvl_this.forEach(function(th){
                            th.expression = new Cola.AST_SymbolRef({ name: "self" });
                        });
                    }
                }

            });

            if(with_super){
                newNode.push(new Cola.AST_Assign({
                    left     : new Cola.AST_Proto({ expression: node.name, property: "$uper" }),
                    operator : "=",
                    right    : new Cola.AST_Dot({ expression: node.extends, property: "prototype" }),
                }));
                newNode[newNode.length - 1] = new Cola.AST_SimpleStatement({
                    body : newNode[newNode.length - 1]
                });
            }

            node = new Cola.AST_BlockStatement({ body: newNode });
        } else

        /*
            singleton Test {
        
                const int i = 123;

                Test(){ // constructor
                    alert("test");
                }

                queryAll("ul li a").forEach((el) => 
                    el.onclick = () => console.log("click")
                );

                covert String method1() => console.log("method");

                get getter() => i;
                set setter(int val) => console.log(val); 

                selfExample(){
                    query("*").onclick = () => console.log(self);
                }

            }

            to

            Test Test = ((){  
                Test(){
                    this.pre_constructor();

                    alert("test")

                    this.post_constructor();
                }

                Test::pre_constructor(){
                    const int this.i = 123;
                }

                Test::post_constructor(){
                    queryAll("ul li a").forEach((el) => 
                        el.onclick = () => console.log("click")
                    );
                }

                covert String Test::method1() => console.log("method");

                get Test::getter() => i;
                set Test::setter(int val) => console.log(val); 

                Test::selfExample(){
                    var self = this;
                    query("*").onclick = () => console.log(self);
                }

                return new Test();
            }))();

        */
        if(node instanceof Cola.AST_Singleton){
            var pre_constructor, post_constructor, main_constructors = [], 
                is_pre = true, members = [], binder;
            
            newNode = [];
            node.name = new Cola.AST_SymbolRef(node.name);

            if (node.mods.length) 
                exports.push(node.name.name);

            pre_constructor = new Cola.AST_Defun({
                mods     : ["covert"],
                type     : "dynamic",
                name     : new Cola.AST_Proto({
                    expression : new Cola.AST_SymbolDefun(node.name),
                    property   : "pre_constructor"
                }),
                argnames : [],
                body     : []
            });

            post_constructor = new Cola.AST_Defun({
                mods     : ["covert"],
                type     : "dynamic",
                name     : new Cola.AST_Proto({
                    expression : new Cola.AST_SymbolDefun(node.name),
                    property   : "post_constructor"
                }),
                argnames : [],
                body     : []
            });

            var has_main_constr = false;
            node.body.forEach(function(member){
                if(member instanceof Cola.AST_Defun && member.name instanceof Cola.AST_SymbolDefun && member.name.name == node.name.name){
                    main_constructors.push(member);
                    newNode.push(member);

                    has_main_constr = true;

                    is_pre = false;
                } else

                if(member instanceof Cola.AST_Lambda && member.name instanceof Cola.AST_SymbolDefun){
                    if(members.indexOf(member.name.name) == -1) members.push(member.name.name);
                    member.name = new Cola.AST_Proto({
                        expression : node.name,
                        property   : member.name.name
                    });
                    newNode.push(member);
                } else 

                if(member instanceof Cola.AST_Var && member.mods.indexOf("static") != -1){
                    member.definitions.forEach(function(def){
                        var texpr = def.name;

                        if(!(texpr instanceof Cola.AST_Symbol)){
                            while(!(texpr.expression instanceof Cola.AST_Symbol || texpr.expression instanceof Cola.AST_Constant)) texpr = texpr.expression;
                        }

                        if(def.name instanceof Cola.AST_Symbol && (def.value || member.mods.indexOf("covert") != -1)){
                            newNode.push(new Cola.AST_VarDef({
                                name     : new Cola.AST_Dot({ expression: node.name, property: def.name.name }),
                                value    : def.value
                            }));

                            member.mods.splice(member.mods.indexOf("static"), 1);

                            newNode[newNode.length - 1] = new Cola.AST_Var({
                                type        : member.type,
                                mods        : member.mods,
                                definitions : [newNode[newNode.length - 1]]
                            });
                        } else 

                        if((def.value || member.mods.indexOf("covert") != -1) && !(texpr.expression instanceof Cola.AST_This)){
                            texpr.expression = new Cola.AST_Dot({ expression: node.name, property: texpr.expression.name });
                            newNode.push(new Cola.AST_VarDef({
                                name     : def.name,
                                value    : def.value
                            }));

                            member.mods.splice(member.mods.indexOf("static"), 1);

                            newNode[newNode.length - 1] = new Cola.AST_Var({
                                type        : member.type,
                                mods        : member.mods,
                                definitions : [newNode[newNode.length - 1]]
                            });
                        }
                    });
                }

                else {
                    if(member instanceof Cola.AST_Var)
                        member.definitions.forEach(function(def){
                            var texpr = def.name;

                            if(!(texpr instanceof Cola.AST_Symbol)){
                                while(!(texpr.expression instanceof Cola.AST_Symbol || texpr.expression instanceof Cola.AST_Constant)) texpr = texpr.expression;
                                texpr = texpr.expression;
                            }

                            if(texpr instanceof Cola.AST_Symbol && !(texpr instanceof Cola.AST_This) && members.indexOf(texpr.name) == -1)
                                members.push(texpr.name);
                        });

                    if(is_pre) pre_constructor.body.push(member);
                    else post_constructor.body.push(member);
                }
            }); 
            
            if(!has_main_constr){
                newNode.unshift(new Cola.AST_Defun({
                    mods       : [],
                    type       : "dynamic",
                    name       : new Cola.AST_SymbolDefun(node.name),
                    argnames   : [],
                    body       : []
                }));

                main_constructors.push(newNode[0]);
            }

            if(pre_constructor.body.length != 0){
                newNode.push(pre_constructor);
                main_constructors.forEach(function(constr){
                    constr.body.unshift(new Cola.AST_Call({
                        expression : new Cola.AST_Dot({ expression: new Cola.AST_This, property: "pre_constructor" }),
                        args       : []
                    }));
                    constr.body[0] = new Cola.AST_SimpleStatement({
                        body : constr.body[0]
                    });
                });
            }

            if(post_constructor.body.length != 0){
                newNode.push(post_constructor);
                main_constructors.forEach(function(constr){
                    constr.body.push(new Cola.AST_Call({
                        expression : new Cola.AST_Dot({ expression: new Cola.AST_This, property: "post_constructor" }),
                        args       : []
                    }));
                    constr.body[constr.body.length - 1] = new Cola.AST_SimpleStatement({
                        body : constr.body[constr.body.length - 1]
                    });
                });
            }
            
            var scope, lvl = 0, hmembers, with_self = false, self_def = false, flvl_this = [];
            binder = new Cola.TreeTransformer(function(member){
                var tmembers, tscope, tlvl, tself_def;
                member = member.clone();
                
                if(lvl > 1 && member instanceof Cola.AST_Var){
                    member.definitions.forEach(function(def){
                        if(def.name instanceof Cola.AST_Symbol){
                            if(hmembers.indexOf(def.name.name) != -1)
                                hmembers.splice(hmembers.indexOf(def.name.name), 1);
                            if(def.name.name == "self")
                                self_def = true;
                        }
                    });
                } else 

                if(lvl > 1 && (member instanceof Cola.AST_Defun || member instanceof Cola.AST_Getter || member instanceof Cola.AST_Setter) && member.name instanceof Cola.AST_Symbol && hmembers.indexOf(member.name.name) != -1){
                    hmembers.splice(hmembers.indexOf(member.name.name), 1);
                } else 

                if(member instanceof Cola.AST_Scope) 
                    scope = (lvl++, member);
                else 

                if(member instanceof Cola.AST_SymbolRef && hmembers.indexOf(member.name) != -1){

                    member = new Cola.AST_Dot({ 
                        expression : lvl > 1
                            ? (with_self = true, new Cola.AST_SymbolRef({ name: "self" }))
                            : new Cola.AST_This,
                        property   : member.name
                    });

                    if(lvl == 1) flvl_this.push(member);
                } else

                if(member instanceof Cola.AST_SymbolRef && member.name == "self" && !self_def){
                    with_self = true;
                } else

                if(member instanceof Cola.AST_SymbolVar && scope.name instanceof Cola.AST_Proto && (scope.name.property == "pre_constructor" || scope.name.property == "post_constructor")
                && hmembers.indexOf(member.name) != -1){
                    member = new Cola.AST_Dot({ 
                        expression : lvl > 1
                            ? (with_self = true, new Cola.AST_SymbolVar({ name: "self" }))
                            : new Cola.AST_This,
                        property   : member.name
                    });

                    if(lvl == 1) flvl_this.push(member);
                }

                tscope = scope; tlvl = lvl; tmembers = hmembers.slice(); tself_def = self_def;
                member._descend(member, this);
                scope = tscope; lvl = tlvl; hmembers = tmembers; self_def = tself_def;

                return member;
            });

            newNode.forEach(function(member, i){
                lvl = 0;
                flvl_this = [];
                with_self = false;
                self_def = false;
                hmembers = members.slice();

                if(member instanceof Cola.AST_Lambda){
                    newNode[i] = member.transform(binder);
                    newNode[i].mods ? newNode[i].mods.push("method") : (newNode[i].mods = ["method"]);

                    if(with_self) {
                        newNode[i].body.unshift(new Cola.AST_Var({
                            mods        : [],
                            type        : "dynamic",
                            definitions : [new Cola.AST_VarDef({
                                type  : "dynamic",
                                name  : new Cola.AST_SymbolVar({ name: "self" }),
                                value : new Cola.AST_This
                            })]
                        }));

                        flvl_this.forEach(function(th){
                            th.expression = new Cola.AST_SymbolRef({ name: "self" });
                        });
                    }
                }

            });

            newNode.push(new Cola.AST_Return({
                value : new Cola.AST_New({
                    args       : [],
                    expression : node.name
                })
            }));
            //node = new Cola.AST_BlockStatement({ body: newNode });
            newNode = new Cola.AST_Function({
                type       : node.name.name,
                body       : newNode,
                argnames   : [] 
            });

            newNode = new Cola.AST_Call({
                args       : [],
                expression : newNode
            });

            node = new Cola.AST_Var({
                type        : node.name.name,
                mods        : [],
                definitions : [new Cola.AST_VarDef({
                    type  : node.name.name,
                    name  : new Cola.AST_SymbolVar(node.name),
                    value : newNode
                })]
            });
        } else

        /*
            func(String s, Number n:, Array list..., Boolean b = false, h: 123){
                
            }

            to

            function func(s){
                _ColaRuntime$$func_set_named_args(arguments);
                var _ColaRuntime$$i, list = 3 <= arguments.length ? [].slice.call(arguments, 1, _ColaRuntime$$i = arguments.length - 1) : (_ColaRuntime$$i = 2, []), 
                    b = arguments[_ColaRuntime$$i+0] !== undefined ? arguments[_ColaRuntime$$i+0] : false,
                    n = arguments.n,
                    h = arguments.h !== undefined ? arguments.h : 123;
            }
            
        */
        if((node instanceof Cola.AST_Function || node instanceof Cola.AST_Defun) && node.argnames.length != 0){
            var posed = [], named = [], onfront = true, delQueue = [], pos = 0, splated, aftersplated = -1;

            node.argnames.forEach(function(val, i){
                if(val.argtype == "positional"){
                    if(val.defval instanceof Cola.AST_Noop && onfront && !val.required) pos++, node.argnames[i] = val.name;
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
                        name  : new Cola.AST_SymbolVar({ name : '_ColaRuntime$$_i' }),
                        value : null
                    }));

                    props.definitions.push(Cola.Constructions.SplatedVarDef(splated.val.name, splated.pos, splated.after, splated.pos + splated.after + 1));
                }
                else

                if(val.defval instanceof Cola.AST_Noop && !val.required) 
                    props.definitions.push(Cola.Constructions.PosedVarDef(val.name, val.type, pos, aftersplated++));
                else if(val.defval instanceof Cola.AST_Noop && val.required){ 
                    _ColaRuntime$$hash[Cola._ColaRuntime$$error.i] = true;
                    props.definitions.push(Cola.Constructions.PosedWithDefsVarDef(val.name, val.type, new Cola.AST_Call({
                        args       : [new Cola.AST_String({ value : "Argument `" + val.name.name + "` is required!" })],
                        expression : new Cola.AST_SymbolRef({ name : '_ColaRuntime$$error' })
                    }), pos, aftersplated++));
                } else 
                    props.definitions.push(Cola.Constructions.PosedWithDefsVarDef(val.name, val.type, val.defval, pos, aftersplated++));
            });

            named.forEach(function(val, i){
                if(val.defval instanceof Cola.AST_Noop && !val.required) props.definitions.push(new Cola.AST_VarDef({
                    type  : val.type,
                    name  : new Cola.AST_SymbolVar(val.name),
                    value : new Cola.AST_Dot({
                        expression : new Cola.AST_SymbolRef({ name : 'arguments' }),
                        property   : val.name.name
                    })
                })); 
                else if(val.defval instanceof Cola.AST_Noop && val.required){
                    _ColaRuntime$$hash[Cola._ColaRuntime$$error.i] = true;
                    props.definitions.push(Cola.Constructions.NamedVarDef(val.name, val.type, new Cola.AST_Call({
                        args       : [new Cola.AST_String({ value : "Argument `" + val.name.name + "` is required!" })],
                        expression : new Cola.AST_SymbolRef({ name : '_ColaRuntime$$error' })
                    }), val.name.name));
                } else 
                    props.definitions.push(Cola.Constructions.NamedVarDef(val.name, val.type, val.defval, val.name.name));
            });

            if(delQueue.length != 0 || named.length != 0) node.body.unshift(new Cola.AST_Var(props));

            if(named.length != 0){
                _ColaRuntime$$hash[Cola._ColaRuntime$$func_named_args.i] = true;
                _ColaRuntime$$hash[Cola._ColaRuntime$$func_set_named_args.i] = true;
                node.body.unshift(new Cola.AST_SimpleStatement({
                    body : new Cola.AST_Call({
                        args       : [new Cola.AST_SymbolRef({ name : 'arguments' })],
                        expression : new Cola.AST_SymbolRef({ name : '_ColaRuntime$$func_set_named_args' })
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
            
            (function(_ColaRuntime$$expr, arguments){
                _ColaRuntime$$expr[0] = yes;
                _ColaRuntime$$expr.foo = bar;
                _ColaRuntime$$expr.baz();

                (function(_ColaRuntime$$expr, arguments){
                    _ColaRuntime$$expr.subfoo = no;
                    _ColaRuntime$$expr.subaz();

                    return _ColaRuntime$$expr;
                }).call(this, _ColaRuntime$$expr.sub, arguments);

                return _ColaRuntime$$expr;
            }).call(this, obj, arguments);

        */
        if(node instanceof Cola.AST_Cascade){
            _ColaRuntime$$hash[Cola._ColaRuntime$$arguments_def.i] = true;

            props = {
                type       : "dynamic",
                body       : [],
                argnames   : [new Cola.AST_ArgDef({
                    argtype : "positional",
                    type    : "dynamic",
                    defval  : new Cola.AST_Noop(),
                    name    : new Cola.AST_SymbolFunarg({ name : "_ColaRuntime$$expr", start : node.expression.start, end : node.expression.end })
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
                    if( expr instanceof Cola.AST_Call || expr instanceof Cola.AST_PropAccess){
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
                        expression : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$expr" }),
                        property   : expr instanceof Cola.AST_ArrayRange ? expr : ( expr.elements.length == 0 ? new Cola.AST_Noop() : expr.elements[0] )
                    }); else
                    if(expr instanceof Cola.AST_SymbolRef) Expr = new Cola.AST_Dot({
                        start      : Expr.start,
                        end        : Expr.end,
                        expression : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$expr" }),
                        property   : Expr.name
                    });
                } else {
                    if(expr instanceof Cola.AST_Array || expr instanceof Cola.AST_ArrayRange)
                        expr = new Cola.AST_Sub({
                            start      : expr.start,
                            end        : expr.end,
                            expression : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$expr" }),
                            property   : expr instanceof Cola.AST_ArrayRange ? expr : ( expr.elements.length == 0 ? new Cola.AST_Noop() : expr.elements[0] )
                        });
                    else
                        expr = new Cola.AST_Dot({
                            start      : expr.start,
                            end        : expr.end,
                            expression : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$expr" }),
                            property   : expr.name
                        });

                    if( Parent instanceof Cola.AST_Call || Parent instanceof Cola.AST_PropAccess) Parent.expression = expr;
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
                value : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$expr" })
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

            var c = obj[0], b = obj[1][0], b2 = obj[1][1], _ColaRuntime$$i = obj.length - 1, a = obj[_ColaRuntime$$i++].key;
            var _ColaRuntime$$tmp = { key : "val" }, d = _ColaRuntime$$tmp["key"];

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
                    : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$tmp" });
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
                                    name  : new Cola.AST_SymbolVar({ name : "_ColaRuntime$$" + uid + "i" }),
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
                                                    left     : new Cola.AST_SymbolVar({ name : "_ColaRuntime$$" + uid + "i" }),
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
                                                left     : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$" + uid + "i" }),
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
                                            left     : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$" + uid + "i" }),
                                            right    : new Cola.AST_Number({ value : k++ })
                                        })
                                })
                            })); else 
                            if(el instanceof Cola.AST_Noop){
                                skiped = true;
                                defs.push(new Cola.AST_VarDef({
                                    type  : "int",
                                    name  : new Cola.AST_SymbolVar({ name : "_ColaRuntime$$" + uid + "i" }),
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
                                        left     : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$" + uid + "i" }),
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
            { String name, age : ages.age } = pro;

            to

            var name = pro.name;
            ages.age = pro.age;

        */
        if(node.body instanceof Cola.AST_Assign && (node.body.left instanceof Cola.AST_ArrayTemplate || node.body.left instanceof Cola.AST_ObjectTemplate ||
          (node.body.left instanceof Cola.AST_Array || node.body.left instanceof Cola.AST_Object) && node.body.left.template) &&
          node instanceof Cola.AST_SimpleStatement){
            node = node.body;
            var defs = [];
            
            var Symbol = node.right instanceof Cola.AST_SymbolRef 
                ? node.right
                : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$tmp" });
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
                                name  : new Cola.AST_SymbolVar({ name : "_ColaRuntime$$" + uid + "i" }),
                                value : null
                            }));
                            el.name.splated = undefined; 
                            el.value = Cola.Constructions.SplatedConditional(symbol, uid, j, _.length - j - 1, _.length);
                            defs.push(el);
                        } else
                        if((el instanceof Cola.AST_SymbolRef || el instanceof Cola.AST_PropAccess) && el.splated){
                            skiped = true;
                            defs.push(new Cola.AST_VarDef({
                                type  : "int",
                                name  : new Cola.AST_SymbolVar({ name : "_ColaRuntime$$" + uid + "i" }),
                                value : null
                            }));
                            el.splated = undefined;
                            defs.push(new Cola.AST_Assign({
                                operator : node.operator,
                                left     : el,
                                right    : Cola.Constructions.SplatedConditional(symbol, uid, j, _.length - j - 1, _.length)
                            }));
                        } else
                        if(el instanceof Cola.AST_VarDef){
                            el.value = Cola.Constructions.ValueWithOffset(symbol, uid, !skiped, j, k++);
                            defs.push(el);
                        } else 
                        if(el instanceof Cola.AST_SymbolRef || el instanceof Cola.AST_PropAccess) defs.push(new Cola.AST_Assign({
                            operator : node.operator,
                            left     : el,
                            right    : Cola.Constructions.ValueWithOffset(symbol, uid, !skiped, j, k++)
                        })); else 
                        if(el instanceof Cola.AST_Noop){
                            skiped = true;
                            defs.push(new Cola.AST_VarDef({
                                type  : "int",
                                name  : new Cola.AST_SymbolVar({ name : "_ColaRuntime$$" + uid + "i" }),
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
                        _rec(el, Cola.Constructions.ValueWithOffset(symbol, uid, !skiped, j, k++), uid + "_");
                    }
                    : function(el, j){
                        if(el.type && (el.value instanceof Cola.AST_SymbolRef || el.value instanceof Cola.AST_Noop && el.start.type == "name")) defs.push(new Cola.AST_VarDef({
                            start : node.start,
                            end   : node.end,
                            type  : el.type,
                            name  : el.value instanceof Cola.AST_Noop ? new Cola.AST_SymbolVar({ name : el.key }) : new Cola.AST_SymbolVar(el.value),
                            value : Cola.Constructions.ValueWithKey(el.start.type == "name" || el.start.type == "keyword", symbol, el.key)
                        })); else 
                        if(el.value instanceof Cola.AST_SymbolRef  || el.value instanceof Cola.AST_PropAccess || el.value instanceof Cola.AST_Noop && el.start.type == "name") defs.push(new Cola.AST_Assign({
                            operator : node.operator,
                            left     : el.value instanceof Cola.AST_Noop ? new Cola.AST_SymbolRef({ name : el.key }) : el.value,
                            right    : Cola.Constructions.ValueWithKey(el.start.type == "name" || el.start.type == "keyword", symbol, el.key)
                        })); else 
                        _rec(el.value, Cola.Constructions.ValueWithKey(el.start.type == "name" || el.start.type == "keyword", symbol, el.key), uid + "_");
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

        if(node instanceof Cola.AST_ArrayTemplate || node instanceof Cola.AST_ObjectTemplate){
            Cola.Parser.prototype.token_error.call(Cola.Parser.prototype, node.start, "Incorrect usage of distructive templates.");
        } else

        /*
            func({ a : aname, b : bname } = obj)

            to

            func((function(_ColaRuntime$$expr, arguments){
                aname = _ColaRuntime$$expr.a;
                bname = _ColaRuntime$$expr.b;

                return _ColaRuntime$$expr;
            }).call(this, obj, arguments))

        */
        if(node instanceof Cola.AST_Assign && (node.left instanceof Cola.AST_ArrayTemplate || node.left instanceof Cola.AST_ObjectTemplate ||
          (node.left instanceof Cola.AST_Array || node.left instanceof Cola.AST_Object) && node.left.template)){
            _ColaRuntime$$hash[Cola._ColaRuntime$$arguments_def.i] = true;

            var defs = [];
            
            var Symbol = new Cola.AST_SymbolRef({ name : "_ColaRuntime$$expr" });

            (function _rec(def, symbol, uid){
                var skiped = false, k = 0, is_arrayt = def instanceof Cola.AST_Array || def instanceof Cola.AST_ArrayTemplate, _ = is_arrayt ? def.elements : def.properties;
                _.forEach( is_arrayt 
                    ? function(el, j){
                        if((el instanceof Cola.AST_SymbolRef || el instanceof Cola.AST_PropAccess) && el.splated){
                            skiped = true;
                            defs.push(new Cola.AST_VarDef({
                                type  : "int",
                                name  : new Cola.AST_SymbolVar({ name : "_ColaRuntime$$" + uid + "i" }),
                                value : null
                            }));
                            el.splated = undefined;
                            defs.push(new Cola.AST_Assign({
                                operator : node.operator,
                                left     : el,
                                right    : Cola.Constructions.SplatedConditional(symbol, uid, j, _.length - j - 1, _.length)
                            }));
                        } else
                        if(el instanceof Cola.AST_SymbolRef || el instanceof Cola.AST_PropAccess) defs.push(new Cola.AST_Assign({
                            operator : node.operator,
                            left     : el,
                            right    : Cola.Constructions.ValueWithOffset(symbol, uid, !skiped, j, k++)
                        })); else 
                        if(el instanceof Cola.AST_Noop){
                            skiped = true;
                            defs.push(new Cola.AST_VarDef({
                                type  : "int",
                                name  : new Cola.AST_SymbolVar({ name : "_ColaRuntime$$" + uid + "i" }),
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
                        _rec(el, Cola.Constructions.ValueWithOffset(symbol, uid, !skiped, j, k++), uid + "_");
                    }
                    : function(el, j){
                        if(el.value instanceof Cola.AST_SymbolRef  || el.value instanceof Cola.AST_PropAccess || el.value instanceof Cola.AST_Noop && el.start.type == "name") defs.push(new Cola.AST_Assign({
                            operator : node.operator,
                            left     : el.value instanceof Cola.AST_Noop ? new Cola.AST_SymbolRef({ name : el.key }) : el.value,
                            right    : Cola.Constructions.ValueWithKey(el.start.type == "name" || el.start.type == "keyword", symbol, el.key)
                        })); else 
                        _rec(el.value, Cola.Constructions.ValueWithKey(el.start.type == "name" || el.start.type == "keyword", symbol, el.key), uid + "_");
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
                    name    : new Cola.AST_SymbolFunarg({ name : "_ColaRuntime$$expr", start : node.right.start, end : node.right.end })
                }), new Cola.AST_ArgDef({
                    argtype : "positional",
                    type    : "dynamic",
                    defval  : new Cola.AST_Noop(),
                    name    : new Cola.AST_SymbolFunarg({ name : "arguments" })
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

            props.body.push(new Cola.AST_Return({ value : new Cola.AST_SymbolRef({ name : "_ColaRuntime$$expr" }) }));

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
            _ColaRuntime$$hash[Cola._ColaRuntime$$arguments_def.i] = true;

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
                start      : node.start,
                end        : node.end,
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
            _ColaRuntime$$hash[Cola._ColaRuntime$$arguments_def.i] = true;

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
                start      : node.start,
                end        : node.end,
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
            for _ of [0...9] {
                
            }

            to

            var _ColaRuntime$$forOfHolder;
            for (_ in [0...9]) {
                _ = _ColaRuntime$$forOfHolder[_];
            }

        */
        if(node instanceof Cola.AST_ForOf){
            node = new Cola.AST_ForIn(node);
            newNode = [new Cola.AST_Var({
                type        : "dynamic",
                definitions : [new Cola.AST_VarDef({
                    type  : "dynamic",
                    name  : new Cola.AST_SymbolVar({ name: '_ColaRuntime$$forOfHolder' })
            })]}), node];

            node.object = new Cola.AST_Assign({
                operator : '=',
                left     : new Cola.AST_SymbolRef({ name :  "_ColaRuntime$$forOfHolder" }),
                right    : node.object
            });

            node.body.body.unshift(new Cola.AST_SimpleStatement({ body : new Cola.AST_Assign({
                operator : '=',
                left     : new Cola.AST_SymbolRef(node.name || node.init),
                right    : new Cola.AST_Sub({ 
                    expression : new Cola.AST_SymbolRef({ name :  "_ColaRuntime$$forOfHolder" }), 
                    property   : new Cola.AST_SymbolRef(node.name || node.init)
                })
            })}));

            node = newNode;
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
                    is_node      : options.is_node,
                    parser       : options.parser,
                    path         : Cola.dirname(options.parser.filename),
                    std_hash     : options.std_hash,
                    root         : false
                });

                tl.requiredModules.forEach(function(moduleName){
                    Cola.push_uniq(_this.requiredModules, moduleName);
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
                    is_node      : options.is_node,
                    parser       : options.parser,
                    path         : Cola.dirname(options.parser.filename),
                    std_hash     : options.std_hash,
                    root         : false
                });

                tl.requiredModules.forEach(function(moduleName){
                    Cola.push_uniq(_this.requiredModules, moduleName);
                });

                required = required.concat(tl.body);
            });

            return false;
        } else 

        if(node instanceof Cola.AST_Command && node.name == "import"){

            if (node.args.length == 1) {
                    
                newNode = new Cola.AST_SimpleStatement({ 
                    start : node.start,
                    end   : node.end,
                    body  : new Cola.AST_Call({
                        args       : [new Cola.AST_String({ value: node.args[0][0] })],
                        expression : new Cola.AST_SymbolRef({ name  : 'require' })
                    }) 
                });

                if (node.args[0][2]) 
                newNode = new Cola.AST_Const({
                    start       : node.start,
                    end         : node.end,
                    type        : "dynamic",
                    definitions : [new Cola.AST_VarDef({
                        type  : "dynamic",
                        name  : new Cola.AST_SymbolVar({ name: node.args[0][2] }),
                        value : newNode.body
                    })]
                }); else {
                    _ColaRuntime$$hash[Cola._ColaRuntime$$rootImport.i] = true;
                    newNode.body = new Cola.AST_Call({
                        args       : [newNode.body],
                        expression : new Cola.AST_SymbolRef({ name  : '_ColaRuntime$$rootImport' })
                    });
                }

                if (node.args[0][1]) 
                newNode.definitions[0].value = new Cola.AST_Dot({
                    expression : newNode.definitions[0].value,
                    property   : node.args[0][1]
                });
            } else {
                newNode = [new Cola.AST_Var({
                    start       : node.start,
                    end         : node.end,
                    type        : "dynamic",
                    definitions : [new Cola.AST_VarDef({
                        type  : "dynamic",
                        name  : new Cola.AST_SymbolVar({ name: '_ColaRuntime$$tmp' }),
                        value : new Cola.AST_Call({
                            args       : [new Cola.AST_String({ value: node.args[0][0] })],
                            expression : new Cola.AST_SymbolRef({ name  : 'require' })
                        }) 
                    })]
                })];

                newNode.push(new Cola.AST_Const({
                    start       : node.start,
                    end         : node.end,
                    type        : "dynamic",
                    definitions : []
                }));

                node.args.forEach(function(args) {
                    newNode[1].definitions.push(new Cola.AST_VarDef({
                        type  : "dynamic",
                        name  : new Cola.AST_SymbolVar({ name: args[2] }),
                        value : new Cola.AST_Dot({
                            expression : new Cola.AST_SymbolRef({ name: '_ColaRuntime$$tmp' }),
                            property   : args[1]
                        })
                    }));
                });
            }

            node = newNode;
        } else 

        if(node instanceof Cola.AST_Command && node.name == "export"){

            if (node.args.length == 1 && !node.args[0][1]) {
                    
                _ColaRuntime$$hash[Cola._ColaRuntime$$rootExport.i] = true;

                newNode = new Cola.AST_SimpleStatement({ 
                    start : node.start,
                    end   : node.end,
                    body  : new Cola.AST_Call({
                        args       : [new Cola.AST_String({ value: node.args[0][0] })],
                        expression : new Cola.AST_SymbolRef({ name  : 'require' })
                    }) 
                });

                newNode.body = new Cola.AST_Call({
                    args       : [new Cola.AST_SymbolRef({ name  : 'exports' }), newNode.body],
                    expression : new Cola.AST_SymbolRef({ name  : '_ColaRuntime$$rootExport' })
                });

            } else 
            if (node.args[0][0]) {
                newNode = [new Cola.AST_Var({
                    start       : node.start,
                    end         : node.end,
                    type        : "dynamic",
                    definitions : [new Cola.AST_VarDef({
                        type  : "dynamic",
                        name  : new Cola.AST_SymbolVar({ name: '_ColaRuntime$$tmp' }),
                        value : new Cola.AST_Call({
                            args       : [new Cola.AST_String({ value: node.args[0][0] })],
                            expression : new Cola.AST_SymbolRef({ name  : 'require' })
                        }) 
                    })]
                })];

                node.args.forEach(function(args) {
                    newNode.push(new Cola.AST_SimpleStatement({ body : new Cola.AST_Assign({
                        operator : '=',
                        left     : new Cola.AST_Dot({
                            expression : new Cola.AST_SymbolRef({ name :  "exports" }),
                            property   : args[2]
                        }),
                        right    : new Cola.AST_Dot({
                            expression : new Cola.AST_SymbolRef({ name :  "_ColaRuntime$$tmp" }),
                            property   : args[1]
                        })
                    })}));
                });
            } else {
                newNode = [];

                node.args.forEach(function(args) {
                    newNode.push(new Cola.AST_SimpleStatement({ body : new Cola.AST_Assign({
                        operator : '=',
                        left     : new Cola.AST_Dot({
                            expression : new Cola.AST_SymbolRef({ name :  "exports" }),
                            property   : args[2]
                        }),
                        right    : new Cola.AST_SymbolRef({ name :  args[1] })
                    })}));
                });
            }

            node = newNode;
        } else 

        if (node instanceof Cola.AST_Command && node.name == "use") {
            if (node.args[0] == "closure") {
                props = new Cola.AST_Function({
                    type       : "dynamic",
                    body       : node.args[2].body,
                    argnames   : [] 
                });

                
                _ColaRuntime$$hash[Cola._ColaRuntime$$arguments_def.i] = true;
                
                props = new Cola.AST_Dot({
                    expression : props,
                    property   : "apply"
                });
                

                node = new Cola.AST_Call({
                    args       : [new Cola.AST_SymbolRef({ name : "this" }), new Cola.AST_SymbolRef({ name : "arguments" })],
                    expression : props
                });
                node = new Cola.AST_SimpleStatement({ body : node });
            } else

            if (node.args[0] == "client") {
                if (options.is_node) return false;
                node = new Cola.AST_BlockStatement({ body: node.args[2].body });
            } else

            if (node.args[0] == "server") {
                if (!options.is_node) return false;
                node = new Cola.AST_BlockStatement({ body: node.args[2].body });
            } else

            node = new Cola.AST_Directive({ value : "use " + node.args[0] });
        }

        if (node instanceof Cola.AST_Defun && node.mods && node.mods.indexOf("export") != -1)
            exports.push(node.name.name);

        ++deep;
        if(node instanceof Array){
            _this = this;
            node.forEach(function(nd){
                nd._descend(nd, _this);
            })
        } else node._descend(node, this);
        --deep;

        if (awaitData.level !== null && awaitData.level > deep) {
            awaitData.level = null;
            awaitData.indent = -1;
            awaitData.body = [];
        }
        
        if (parent instanceof Cola.AST_Scope && awaitData.with) {
            _ColaRuntime$$hash[Cola._ColaRuntime$$arguments_def.i] = true;
            _ColaRuntime$$hash[Cola._ColaRuntime$$promise.i] = true;
            awaitData.level = deep;
            awaitData.indent++;

            awaitData.with = false;
            if (!(node instanceof Array)) node = [node];
            awaitData.body[awaitData.indent] = node;
            node = [];    

            node.push(new Cola.AST_Var({
                mods        : [],
                type        : "dynamic",
                definitions : [new Cola.AST_VarDef({
                    type  : "dynamic",
                    name  : new Cola.AST_SymbolVar({ name: "_ColaRuntime$$arguments" }),
                    value : new Cola.AST_SymbolRef({ name: "arguments" })
                })]
            }));

            var awaitBody = (awaitData.body[awaitData.indent].unshift(new Cola.AST_SimpleStatement({
                body  : new Cola.AST_Assign({
                    left     : new Cola.AST_SymbolRef({ name: "arguments" }),
                    operator : "=",
                    right    : new Cola.AST_SymbolRef({ name: "_ColaRuntime$$arguments" })
                })
            })), awaitData.body[awaitData.indent]);

            awaitData.expression = awaitData.expression.reverse();
            awaitData.origExpression = awaitData.origExpression.reverse();

            awaitData.expression.forEach(function(expression, i) {
                awaitBody = new Cola.AST_SimpleStatement({ body : new Cola.AST_Call({
                    args       : [expression, new Cola.AST_Function({
                        body       : awaitBody instanceof Array 
                            ? awaitBody : [awaitBody],
                        argnames   : [
                            new Cola.AST_SymbolFunarg({ name : "_ColaRuntime$$fulfilled" + i }),
                            new Cola.AST_SymbolFunarg({ name : "_ColaRuntime$$rejected"  + i })
                        ] 
                    }), new Cola.AST_This],
                    expression : new Cola.AST_SymbolRef({ name: "_ColaRuntime$$promise" })
                })});
                awaitData.origExpression[i].name += i;
            });

            node.push(awaitBody);
            awaitData.expression = [];
            awaitData.origExpression = [];

            if (awaitData.level !== null && awaitData.level == deep && awaitData.indent > 0) {
                Array.prototype.push
                    .apply(awaitData.body[awaitData.indent - 1], node);

                return false;
            }
        } else 

        if (awaitData.level !== null && awaitData.level == deep) {
            if (node) 
                Array.prototype.push
                    .apply(awaitData.body[awaitData.indent], node instanceof Array 
                        ? node : [node]);

            return false;
        }

        return node;
    });

    _this = this.transform(tt);
    _this.body = required.concat(_this.body);

    exports.forEach(function(name) {
        _this.body.push(new Cola.AST_SimpleStatement({ body : new Cola.AST_Assign({
            operator : '=',
            left     : new Cola.AST_Dot({
                expression : new Cola.AST_SymbolRef({ name :  "exports" }),
                property   : name
            }),
            right    : new Cola.AST_SymbolRef({ name :  name })
        })}));
    });

    if (options.root && !options.is_node && _this.requiredModules.length && !exports.length) {
        var commonWrapper = _ColaRuntime$$ast.body[17].clone(), moduleId = 1;

        Cola.PushModuleToCommonWrapper(_this, commonWrapper);

        (function handleModules(modules){
            if (!modules.length) return;

            var requiredModules = [];

            modules.forEach(function(moduleName) {
                var file = [options.modules[moduleName]];

                if (!file[0]) file = Cola.tryGetRequiredSource(moduleName);
                if (!file) return;

                options.parser.is_js = /\.js$/.test(file[0]);
                options.parser.filename = Cola.notRoot(file[0]) ? options.path + "/" + file[0] : file[0];

                if (!file[1]) file[1] = Cola.getSource(options.parser.filename);

                var tl = Cola.parse(file[1], options.parser);
                if (!options.parser.is_js) tl = tl.toJavaScript({
                    main_binding : options.main_binding,
                    main_event   : options.main_event,
                    is_node      : options.is_node,
                    parser       : options.parser,
                    path         : Cola.dirname(options.parser.filename),
                    std_hash     : options.std_hash,
                    root         : false
                });

                Cola.PushModuleToCommonWrapper(tl, commonWrapper, moduleName, moduleId++);

                tl.requiredModules.forEach(function(moduleName){
                    if (!Cola.push_uniq(_this.requiredModules, moduleName)) return;
                    requiredModules.push(moduleName);
                });
            });

            handleModules(requiredModules);
        })(_this.requiredModules.slice());

        _this.body = [commonWrapper];
    }

    if (options.root) {
        for(var i in _ColaRuntime$$hash) if(_ColaRuntime$$hash.hasOwnProperty(i))
            _this.body.unshift(_ColaRuntime$$ast.body[i]);
    }

    return _this;
};