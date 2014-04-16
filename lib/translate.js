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

function translate(tree){

    var tt = new TreeTransformer(null, function(node){
        var newNode, props;

        if(node instanceof Cola.AST_Binary && node.operator == '**'){
            props = {
                args  : [node.left, node.right],
                start : new Cola.AST_Token({ nlb : false, type : 'name', value : 'Math' }),
                end   : new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
            };
            props.expression = new Cola.AST_Dot({
                property   : 'pow',
                start      : props.start,
                end        : new Cola.AST_Token({ nlb : false, type : 'name', value : 'pow' }),
                expression : new Cola.AST_SymbolRef({ name : 'Math', start : props.start, end : props.start })
            });

            node = new Cola.AST_Call(props);
        } else 

        if(node instanceof Cola.AST_Binary && node.operator == '%%'){
            props = {
                args  : [node.left, node.right],
                start : new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_modulo' }),
                end   : new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
            };
            props.expression = new Cola.AST_SymbolRef({ 
                name : '$_cola_modulo', 
                start : props.start, 
                end : props.start 
            });

            node = new Cola.AST_Call(props);
        } else 

        if(node instanceof Cola.AST_SimpleStatement && node.body instanceof Cola.AST_Assign && node.body.operator == '?='){
            node.body.operator = '=';

            props = {
                args  : [node.body.left],
                start : new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_isntset' }),
                end   : new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
            };
            props.expression = new Cola.AST_SymbolRef({ 
                name  : '$_cola_isntset', 
                start : props.start, 
                end   : props.start 
            });

            node = new Cola.AST_If({
                body      : node.clone(),
                start     : new Cola.AST_Token({ nlb : false, type : 'keyword', value : 'if' }),
                end       : new Cola.AST_Token({ nlb : false, type : 'punc', value : ';' }),
                condition : new Cola.AST_Call(props)
            });
        } else 

        if(node instanceof Cola.AST_Assign && node.operator == '?='){
            node.operator = '=';

            props = {
                args  : [node.left],
                start : new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_isntset' }),
                end   : new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
            };
            props.expression = new Cola.AST_SymbolRef({ 
                name  : '$_cola_isntset', 
                start : props.start, 
                end   : props.start 
                });

            node = new Cola.AST_Conditional({
                start       : new Cola.AST_Token({ nlb : false, type : 'punc', value : '(' }),
                end         : new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' }),
                condition   : new Cola.AST_Call(props),
                consequent  : node.clone(),
                alternative : node.left
            });
        } else 

        if(node instanceof Cola.AST_Binary && node.operator == 'is'){
            props = {
                args  : [node.left, node.right],
                start : new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_is' }),
                end   : new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
            };
            props.expression = new Cola.AST_SymbolRef({ 
                name : '$_cola_is', 
                start : props.start, 
                end : props.start 
            });

            node = new Cola.AST_Call(props);
        } else 

        if(node instanceof Cola.AST_Binary && node.operator == 'isnt'){
            props = {
                args  : [node.left, node.right],
                start : new Cola.AST_Token({ nlb : false, type : 'name', value : '$_cola_isnt' }),
                end   : new Cola.AST_Token({ nlb : false, type : 'punc', value : ')' })
            };
            props.expression = new Cola.AST_SymbolRef({ 
                name : '$_cola_isnt', 
                start : props.start, 
                end : props.start 
            });

            node = new Cola.AST_Call(props);
        } else 

        if(node instanceof Cola.AST_StringTemplate){
            newNode = new Cola.AST_Binary({
                operator : '+',
                left     : node.body[0],
                right    : node.body[1],
                start    : node.body[0].start,
                end      : node.body[1].end
            });
            for(var i = 2; i < node.body.length; i++)
                newNode = new Cola.AST_Binary({
                    operator : '+',
                    left     : newNode,
                    right    : node.body[i],
                    start    : newNode.start,
                    end      : node.body[i].end
                });

            node = newNode;
        } else 

        if(node instanceof Cola.AST_RegExp && (node.value.indexOf('\n') != -1 || /\/[\w]*x[\w]*$/.test(node.value))){
            node.value = node.value.replace(/[\r\n\s]/g,'').replace(/(\/[\w]*)x([\w]*$)/, '$1$2');
        }
    
        return node;
    });

    return tree.transform(tt);
}