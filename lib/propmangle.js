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

function find_builtins() {

    // Compatibility fix for some standard defined globals not defined on every js environment
    var new_globals = ["Symbol", "Map", "Promise", "Proxy", "Reflect", "Set", "WeakMap", "WeakSet"];
    var objects = {};

    new_globals.forEach(function (new_global) {
        objects[new_global] = global[new_global] || new Function();
    });

    var a = [];
    [ Object, Array, Function, Number,
      String, Boolean, Error, Math,
      Date, RegExp, objects.Symbol, ArrayBuffer,
      DataView, decodeURI, decodeURIComponent,
      encodeURI, encodeURIComponent, eval, EvalError,
      Float32Array, Float64Array, Int8Array, Int16Array,
      Int32Array, isFinite, isNaN, JSON, objects.Map, parseFloat,
      parseInt, objects.Promise, objects.Proxy, RangeError, ReferenceError,
      objects.Reflect, objects.Set, SyntaxError, TypeError, Uint8Array,
      Uint8ClampedArray, Uint16Array, Uint32Array, URIError,
      objects.WeakMap, objects.WeakSet
    ].forEach(function(ctor){
        Object.getOwnPropertyNames(ctor).map(add);
        if (ctor.prototype) {
            Object.getOwnPropertyNames(ctor.prototype).map(add);
        }
    });
    function add(name) {
        push_uniq(a, name);
    }
    return a;
}

function mangle_properties(ast, options) {
    options = defaults(options, {
        reserved : null,
        cache : null,
        only_cache : false,
        regex : null,
        ignore_quoted : false,
        treat_as_global : []
    });

    var reserved = options.reserved;
    if (reserved == null)
        reserved = find_builtins();

    var cache = options.cache;
    if (cache == null) {
        cache = {
            cname: -1,
            props: new Dictionary()
        };
    }

    var regex = options.regex;
    var ignore_quoted = options.ignore_quoted;

    var names_to_mangle = [];
    var unmangleable = [];
    var ignored = {};
    
    if (!cache.global_defs) cache.global_defs = {};
    
    var treat_as_global = options.treat_as_global;
    var mangle_globals = !!treat_as_global.length;
    
    function is_global_alias(name)
    {
        return treat_as_global.indexOf(name) >= 0;
    }
    
    // TODO: don't know if this is necessary to get scope information?
    //if (mangle_globals)
    //    ast.figure_out_scope();
    
    // step 1: find candidates to mangle
    ast.walk(new TreeWalker(function(node){
        if (node instanceof AST_ObjectKeyVal) {
            add(node.key, ignore_quoted && node.quote);
        }
        else if (node instanceof AST_ObjectProperty) {
            // setter or getter, since KeyVal is handled above
            add(node.key.name);
        }
        else if (node instanceof AST_Dot) {
            add(node.property);
            
            // if the left side of the dot is a global alias (e.g. window.foo), and the left side
            // does not refer to a local variable, add it to a list of global definitions.
            if (mangle_globals &&
                node.expression instanceof AST_SymbolRef &&
                node.expression.global() &&
                is_global_alias(node.expression.name) &&
                !is_global_alias(node.property))
            {
                cache.global_defs[node.property] = true;
            }
        }
        else if (node instanceof AST_Sub) {
            addStrings(node.property, ignore_quoted);
        }
        else if (node instanceof AST_ConciseMethod) {
            add(node.name.name);
        }
        else if (node instanceof AST_SymbolRef) {
            // if this term stands alone (e.g. just 'foo' where 'foo' cannot be shown to
            // be a local variable in scope), also treat it as a global definition.
            if (mangle_globals &&
                node.global() &&
                !is_global_alias(node.name))
            {
                cache.global_defs[node.name] = true;
            }
        }
    }));

    // step 2: transform the tree, renaming properties
    return ast.transform(new TreeTransformer(function(node){
        if (node instanceof AST_ObjectKeyVal) {
            if (!(ignore_quoted && node.quote))
                node.key = mangle(node.key);
        }
        else if (node instanceof AST_ObjectProperty) {
            // setter or getter
            node.key.name = mangle(node.key.name);
        }
        else if (node instanceof AST_Dot) {
            node.property = mangle(node.property);
        }
        else if (node instanceof AST_Sub) {
            if (!ignore_quoted)
                node.property = mangleStrings(node.property);
        }
        else if (node instanceof AST_ConciseMethod) {
            if (should_mangle(node.name.name)) {
                node.name.name = mangle(node.name.name);
            }
        }
        else if (node instanceof AST_SymbolRef) {
            // if this is a standalone global reference which does not refer to a local variable in scope,
            // and it's on our list of global definitions, then mangle it.
            if (mangle_globals &&
                node.global() &&
                node.name in cache.global_defs)
            {
                var mangled_name = mangle(node.name);
                node.name = mangled_name;
                node.definition().mangled_name = mangled_name;
            }
        }
        // else if (node instanceof AST_String) {
        //     if (should_mangle(node.value)) {
        //         AST_Node.warn(
        //             "Found \"{prop}\" property candidate for mangling in an arbitrary string [{file}:{line},{col}]", {
        //                 file : node.start.file,
        //                 line : node.start.line,
        //                 col  : node.start.col,
        //                 prop : node.value
        //             }
        //         );
        //     }
        // }
    }));

    // only function declarations after this line

    function can_mangle(name) {
        if (unmangleable.indexOf(name) >= 0) return false;
        if (reserved.indexOf(name) >= 0) return false;
        if (options.only_cache) {
            return cache.props.has(name);
        }
        if (/^[0-9.]+$/.test(name)) return false;
        return true;
    }

    function should_mangle(name) {
        if (ignore_quoted && name in ignored) return false;
        if (regex && !regex.test(name)) return false;
        if (reserved.indexOf(name) >= 0) return false;
        return cache.props.has(name)
            || names_to_mangle.indexOf(name) >= 0
            || (mangle_globals && name in cache.global_defs);
    }

    function add(name, ignore) {
        if (ignore) {
            ignored[name] = true;
            return;
        }

        if (can_mangle(name))
            push_uniq(names_to_mangle, name);

        if (!should_mangle(name)) {
            push_uniq(unmangleable, name);
        }
    }

    function mangle(name) {
        if (!should_mangle(name)) {
            return name;
        }

        var mangled = cache.props.get(name);
        if (!mangled) {
            do {
                mangled = base54(++cache.cname);
            } while (!can_mangle(mangled));
            
            // HACK: to avoid mangled global references colliding with local variable names, use
            // a prefix on all mangled global names to effectively move them to a different namespace.
            if (mangle_globals && name in cache.global_defs)
                mangled = "g_" + mangled;
            
            cache.props.set(name, mangled);
        }
        return mangled;
    }

    function addStrings(node, ignore) {
        var out = {};
        try {
            (function walk(node){
                node.walk(new TreeWalker(function(node){
                    if (node instanceof AST_Seq) {
                        walk(node.cdr);
                        return true;
                    }
                    if (node instanceof AST_String) {
                        add(node.value, ignore);
                        return true;
                    }
                    if (node instanceof AST_Conditional) {
                        walk(node.consequent);
                        walk(node.alternative);
                        return true;
                    }
                    throw out;
                }));
            })(node);
        } catch(ex) {
            if (ex !== out) throw ex;
        }
    }

    function mangleStrings(node) {
        return node.transform(new TreeTransformer(function(node){
            if (node instanceof AST_Seq) {
                node.cdr = mangleStrings(node.cdr);
            }
            else if (node instanceof AST_String) {
                node.value = mangle(node.value);
            }
            else if (node instanceof AST_Conditional) {
                node.consequent = mangleStrings(node.consequent);
                node.alternative = mangleStrings(node.alternative);
            }
            return node;
        }));
    }

}
