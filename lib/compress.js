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

function Compressor(options, false_by_default) {
    if (!(this instanceof Compressor))
        return new Compressor(options, false_by_default);
    TreeTransformer.call(this, this.before, this.after);
    this.options = defaults(options, {
        arguments     : !false_by_default,
        booleans      : !false_by_default,
        collapse_vars : !false_by_default,
        comparisons   : !false_by_default,
        conditionals  : !false_by_default,
        dead_code     : !false_by_default,
        drop_console  : false,
        drop_debugger : !false_by_default,
        evaluate      : !false_by_default,
        expression    : false,
        global_defs   : {},
        hoist_funs    : false,
        hoist_props   : !false_by_default,
        hoist_vars    : false,
        ie8           : false,
        if_return     : !false_by_default,
        inline        : !false_by_default,
        join_vars     : !false_by_default,
        keep_fargs    : true,
        keep_fnames   : false,
        keep_infinity : false,
        loops         : !false_by_default,
        negate_iife   : !false_by_default,
        passes        : 1,
        properties    : !false_by_default,
        pure_getters  : !false_by_default && "strict",
        pure_funcs    : null,
        reduce_funcs  : !false_by_default,
        reduce_vars   : !false_by_default,
        sequences     : !false_by_default,
        side_effects  : !false_by_default,
        switches      : !false_by_default,
        top_retain    : null,
        toplevel      : !!(options && options["top_retain"]),
        typeofs       : !false_by_default,
        unsafe        : false,
        unsafe_comps  : false,
        unsafe_Function: false,
        unsafe_math   : false,
        unsafe_proto  : false,
        unsafe_regexp : false,
        unsafe_undefined: false,
        unused        : !false_by_default,
        warnings      : false,
    }, true);
    var global_defs = this.options["global_defs"];
    if (typeof global_defs == "object") for (var key in global_defs) {
        if (/^@/.test(key) && HOP(global_defs, key)) {
            global_defs[key.slice(1)] = parse(global_defs[key], {
                expression: true
            });
        }
    }
    if (this.options["inline"] === true) this.options["inline"] = 3;
    var pure_funcs = this.options["pure_funcs"];
    if (typeof pure_funcs == "function") {
        this.pure_funcs = pure_funcs;
    } else {
        this.pure_funcs = pure_funcs ? function(node) {
            return pure_funcs.indexOf(node.expression.print_to_string()) < 0;
        } : return_true;
    }
    var top_retain = this.options["top_retain"];
    if (top_retain instanceof RegExp) {
        this.top_retain = function(def) {
            return top_retain.test(def.name);
        };
    } else if (typeof top_retain == "function") {
        this.top_retain = top_retain;
    } else if (top_retain) {
        if (typeof top_retain == "string") {
            top_retain = top_retain.split(/,/);
        }
        this.top_retain = function(def) {
            return top_retain.indexOf(def.name) >= 0;
        };
    }
    var toplevel = this.options["toplevel"];
    this.toplevel = typeof toplevel == "string" ? {
        funcs: /funcs/.test(toplevel),
        vars: /vars/.test(toplevel)
    } : {
        funcs: toplevel,
        vars: toplevel
    };
    var sequences = this.options["sequences"];
    this.sequences_limit = sequences == 1 ? 800 : sequences | 0;
    this.warnings_produced = {};
};

Compressor.prototype = new TreeTransformer;
merge(Compressor.prototype, {
    option: function(key) { return this.options[key] },
    exposed: function(def) {
        if (def.global) for (var i = 0, len = def.orig.length; i < len; i++)
            if (!this.toplevel[def.orig[i] instanceof AST_SymbolDefun ? "funcs" : "vars"])
                return true;
        return false;
    },
    in_boolean_context: function() {
        if (!this.option("booleans")) return false;
        var self = this.self();
        for (var i = 0, p; p = this.parent(i); i++) {
            if (p instanceof AST_SimpleStatement
                || p instanceof AST_Conditional && p.condition === self
                || p instanceof AST_DWLoop && p.condition === self
                || p instanceof AST_For && p.condition === self
                || p instanceof AST_If && p.condition === self
                || p instanceof AST_UnaryPrefix && p.operator == "!" && p.expression === self) {
                return true;
            }
            if (p instanceof AST_Binary && (p.operator == "&&" || p.operator == "||")
                || p instanceof AST_Conditional
                || p.tail_node() === self) {
                self = p;
            } else {
                return false;
            }
        }
    },
    compress: function(node) {
        if (this.option("expression")) {
            node.process_expression(true);
        }
        var passes = +this.options.passes || 1;
        var min_count = 1 / 0;
        var stopping = false;
        var mangle = { ie8: this.option("ie8") };
        for (var pass = 0; pass < passes; pass++) {
            node.figure_out_scope(mangle);
            if (pass > 0 || this.option("reduce_vars"))
                node.reset_opt_flags(this);
            node = node.transform(this);
            if (passes > 1) {
                var count = 0;
                node.walk(new TreeWalker(function() {
                    count++;
                }));
                this.info("pass " + pass + ": last_count: " + min_count + ", count: " + count);
                if (count < min_count) {
                    min_count = count;
                    stopping = false;
                } else if (stopping) {
                    break;
                } else {
                    stopping = true;
                }
            }
        }
        if (this.option("expression")) {
            node.process_expression(false);
        }
        return node;
    },
    info: function() {
        if (this.options.warnings == "verbose") {
            AST_Node.warn.apply(AST_Node, arguments);
        }
    },
    warn: function(text, props) {
        if (this.options.warnings) {
            // only emit unique warnings
            var message = string_template(text, props);
            if (!(message in this.warnings_produced)) {
                this.warnings_produced[message] = true;
                AST_Node.warn.apply(AST_Node, arguments);
            }
        }
    },
    clear_warnings: function() {
        this.warnings_produced = {};
    },
    before: function(node, descend, in_list) {
        if (node._squeezed) return node;
        var was_scope = false;
        if (node instanceof AST_Scope) {
            node = node.hoist_properties(this);
            node = node.hoist_declarations(this);
            was_scope = true;
        }
        // Before https://github.com/mishoo/UglifyJS2/pull/1602 AST_Node.optimize()
        // would call AST_Node.transform() if a different instance of AST_Node is
        // produced after OPT().
        // This corrupts TreeWalker.stack, which cause AST look-ups to malfunction.
        // Migrate and defer all children's AST_Node.transform() to below, which
        // will now happen after this parent AST_Node has been properly substituted
        // thus gives a consistent AST snapshot.
        descend(node, this);
        // Existing code relies on how AST_Node.optimize() worked, and omitting the
        // following replacement call would result in degraded efficiency of both
        // output and performance.
        descend(node, this);
        var opt = node.optimize(this);
        if (was_scope && opt instanceof AST_Scope) {
            opt.drop_unused(this);
            descend(opt, this);
        }
        if (opt === node) opt._squeezed = true;
        return opt;
    }
});

(function(){

    function OPT(node, optimizer) {
        node.DEFMETHOD("optimize", function(compressor){
            var self = this;
            if (self._optimized) return self;
            if (compressor.has_directive("use asm")) return self;
            var opt = optimizer(self, compressor);
            opt._optimized = true;
            return opt;
        });
    };

    OPT(AST_Node, function(self, compressor){
        return self;
    });

    AST_Node.DEFMETHOD("equivalent_to", function(node){
        return this.TYPE == node.TYPE && this.print_to_string() == node.print_to_string();
    });

    AST_Scope.DEFMETHOD("process_expression", function(insert, compressor) {
        var self = this;
        var tt = new TreeTransformer(function(node) {
            if (insert && node instanceof AST_SimpleStatement) {
                return make_node(AST_Return, node, {
                    value: node.body
                });
            }
            if (!insert && node instanceof AST_Return) {
                if (compressor) {
                    var value = node.value && node.value.drop_side_effect_free(compressor, true);
                    return value ? make_node(AST_SimpleStatement, node, {
                        body: value
                    }) : make_node(AST_EmptyStatement, node);
                }
                return make_node(AST_SimpleStatement, node, {
                    body: node.value || make_node(AST_UnaryPrefix, node, {
                        operator: "void",
                        expression: make_node(AST_Number, node, {
                            value: 0
                        })
                    })
                });
            }
            if (node instanceof AST_Lambda && node !== self) {
                return node;
            }
            if (node instanceof AST_Block) {
                var index = node.body.length - 1;
                if (index >= 0) {
                    node.body[index] = node.body[index].transform(tt);
                }
            } else if (node instanceof AST_If) {
                node.body = node.body.transform(tt);
                if (node.alternative) {
                    node.alternative = node.alternative.transform(tt);
                }
            } else if (node instanceof AST_With) {
                node.body = node.body.transform(tt);
            }
            return node;
        });
        self.transform(tt);
    });

    (function(def){
        def(AST_Node, noop);

        function reset_def(compressor, def) {
            def.assignments = 0;
            def.chained = false;
            def.direct_access = false;
            def.escaped = false;
            if (def.scope.uses_eval || def.scope.uses_with) {
                def.fixed = false;
            } else if (!compressor.exposed(def)) {
                def.fixed = def.init;
            } else {
                def.fixed = false;
            }
            def.recursive_refs = 0;
            def.references = [];
            def.should_replace = undefined;
            def.single_use = undefined;
        }

        function reset_variables(tw, compressor, node) {
            node.variables.each(function(def) {
                reset_def(compressor, def);
                if (def.fixed === null) {
                    def.safe_ids = tw.safe_ids;
                    mark(tw, def, true);
                } else if (def.fixed) {
                    tw.loop_ids[def.id] = tw.in_loop;
                    mark(tw, def, true);
                }
            });
        }

        function push(tw) {
            tw.safe_ids = Object.create(tw.safe_ids);
        }

        function pop(tw) {
            tw.safe_ids = Object.getPrototypeOf(tw.safe_ids);
        }

        function mark(tw, def, safe) {
            tw.safe_ids[def.id] = safe;
        }

        function safe_to_read(tw, def) {
            if (tw.safe_ids[def.id]) {
                if (def.fixed == null) {
                    var orig = def.orig[0];
                    if (orig instanceof AST_SymbolFunarg || orig.name == "arguments") return false;
                    def.fixed = make_node(AST_Undefined, orig);
                }
                return true;
            }
            return def.fixed instanceof AST_Defun;
        }

        function safe_to_assign(tw, def, value) {
            if (def.fixed === undefined) return true;
            if (def.fixed === null && def.safe_ids) {
                def.safe_ids[def.id] = false;
                delete def.safe_ids;
                return true;
            }
            if (!HOP(tw.safe_ids, def.id)) return false;
            if (!safe_to_read(tw, def)) return false;
            if (def.fixed === false) return false;
            if (def.fixed != null && (!value || def.references.length > def.assignments)) return false;
            return all(def.orig, function(sym) {
                return !(sym instanceof AST_SymbolDefun
                    || sym instanceof AST_SymbolLambda);
            });
        }

        function ref_once(tw, compressor, def) {
            return compressor.option("unused")
                && !def.scope.uses_eval
                && !def.scope.uses_with
                && def.references.length - def.recursive_refs == 1
                && tw.loop_ids[def.id] === tw.in_loop;
        }

        function is_immutable(value) {
            if (!value) return false;
            return value.is_constant()
                || value instanceof AST_Lambda
                || value instanceof AST_This;
        }

        function read_property(obj, key) {
            key = get_value(key);
            if (key instanceof AST_Node) return;
            var value;
            if (obj instanceof AST_Array) {
                var elements = obj.elements;
                if (key == "length") return make_node_from_constant(elements.length, obj);
                if (typeof key == "number" && key in elements) value = elements[key];
            } else if (obj instanceof AST_Object) {
                key = "" + key;
                var props = obj.properties;
                for (var i = props.length; --i >= 0;) {
                    var prop = props[i];
                    if (!(prop instanceof AST_ObjectKeyVal)) return;
                    if (!value && props[i].key === key) value = props[i].value;
                }
            }
            return value instanceof AST_SymbolRef && value.fixed_value() || value;
        }

        function is_modified(tw, node, value, level, immutable) {
            var parent = tw.parent(level);
            if (is_lhs(node, parent)
                || !immutable
                    && parent instanceof AST_Call
                    && parent.expression === node
                    && (!(value instanceof AST_Function)
                        || !(parent instanceof AST_New) && value.contains_this())) {
                return true;
            } else if (parent instanceof AST_Array) {
                return is_modified(tw, parent, parent, level + 1);
            } else if (parent instanceof AST_ObjectKeyVal && node === parent.value) {
                var obj = tw.parent(level + 1);
                return is_modified(tw, obj, obj, level + 2);
            } else if (parent instanceof AST_PropAccess && parent.expression === node) {
                return !immutable && is_modified(tw, parent, read_property(value, parent.property), level + 1);
            }
        }

        function mark_escaped(tw, d, scope, node, value, level, depth) {
            var parent = tw.parent(level);
            if (value && value.is_constant()) return;
            if (parent instanceof AST_Assign && parent.operator == "=" && node === parent.right
                || parent instanceof AST_Call && node !== parent.expression
                || parent instanceof AST_Exit && node === parent.value && node.scope !== d.scope
                || parent instanceof AST_VarDef && node === parent.value) {
                if (depth > 1 && !(value && value.is_constant_expression(scope))) depth = 1;
                if (!d.escaped || d.escaped > depth) d.escaped = depth;
                return;
            } else if (parent instanceof AST_Array
                || parent instanceof AST_Binary && lazy_op(parent.operator)
                || parent instanceof AST_Conditional && node !== parent.condition
                || parent instanceof AST_Sequence && node === parent.tail_node()) {
                mark_escaped(tw, d, scope, parent, parent, level + 1, depth);
            } else if (parent instanceof AST_ObjectKeyVal && node === parent.value) {
                var obj = tw.parent(level + 1);
                mark_escaped(tw, d, scope, obj, obj, level + 2, depth);
            } else if (parent instanceof AST_PropAccess && node === parent.expression) {
                value = read_property(value, parent.property);
                mark_escaped(tw, d, scope, parent, value, level + 1, depth + 1);
                if (value) return;
            }
            if (level == 0) d.direct_access = true;
        }

        var suppressor = new TreeWalker(function(node) {
            if (!(node instanceof AST_Symbol)) return;
            var d = node.definition();
            if (!d) return;
            if (node instanceof AST_SymbolRef) d.references.push(node);
            d.fixed = false;
        });
        def(AST_Accessor, function(tw, descend, compressor) {
            push(tw);
            reset_variables(tw, compressor, this);
            descend();
            pop(tw);
            return true;
        });
        def(AST_Assign, function(tw) {
            var node = this;
            if (!(node.left instanceof AST_SymbolRef)) return;
            var d = node.left.definition();
            var fixed = d.fixed;
            if (!fixed && node.operator != "=") return;
            if (!safe_to_assign(tw, d, node.right)) return;
            d.references.push(node.left);
            d.assignments++;
            if (node.operator != "=") d.chained = true;
            d.fixed = node.operator == "=" ? function() {
                return node.right;
            } : function() {
                return make_node(AST_Binary, node, {
                    operator: node.operator.slice(0, -1),
                    left: fixed instanceof AST_Node ? fixed : fixed(),
                    right: node.right
                });
            };
            mark(tw, d, false);
            node.right.walk(tw);
            mark(tw, d, true);
            return true;
        });
        def(AST_Binary, function(tw) {
            if (!lazy_op(this.operator)) return;
            this.left.walk(tw);
            push(tw);
            this.right.walk(tw);
            pop(tw);
            return true;
        });
        def(AST_Case, function(tw) {
            push(tw);
            this.expression.walk(tw);
            pop(tw);
            push(tw);
            walk_body(this, tw);
            pop(tw);
            return true;
        });
        def(AST_Conditional, function(tw) {
            this.condition.walk(tw);
            push(tw);
            this.consequent.walk(tw);
            pop(tw);
            push(tw);
            this.alternative.walk(tw);
            pop(tw);
            return true;
        });
        def(AST_Default, function(tw, descend) {
            push(tw);
            descend();
            pop(tw);
            return true;
        });
        def(AST_Defun, function(tw, descend, compressor) {
            this.inlined = false;
            var save_ids = tw.safe_ids;
            tw.safe_ids = Object.create(null);
            reset_variables(tw, compressor, this);
            descend();
            tw.safe_ids = save_ids;
            return true;
        });
        def(AST_Do, function(tw) {
            var saved_loop = tw.in_loop;
            tw.in_loop = this;
            push(tw);
            this.body.walk(tw);
            this.condition.walk(tw);
            pop(tw);
            tw.in_loop = saved_loop;
            return true;
        });
        def(AST_For, function(tw) {
            if (this.init) this.init.walk(tw);
            var saved_loop = tw.in_loop;
            tw.in_loop = this;
            if (this.condition) {
                push(tw);
                this.condition.walk(tw);
                pop(tw);
            }
            push(tw);
            this.body.walk(tw);
            pop(tw);
            if (this.step) {
                push(tw);
                this.step.walk(tw);
                pop(tw);
            }
            tw.in_loop = saved_loop;
            return true;
        });
        def(AST_ForIn, function(tw) {
            this.init.walk(suppressor);
            this.object.walk(tw);
            var saved_loop = tw.in_loop;
            tw.in_loop = this;
            push(tw);
            this.body.walk(tw);
            pop(tw);
            tw.in_loop = saved_loop;
            return true;
        });
        def(AST_Function, function(tw, descend, compressor) {
            var node = this;
            node.inlined = false;
            push(tw);
            reset_variables(tw, compressor, node);
            var iife;
            if (!node.name
                && (iife = tw.parent()) instanceof AST_Call
                && iife.expression === node) {
                // Virtually turn IIFE parameters into variable definitions:
                //   (function(a,b) {...})(c,d) => (function() {var a=c,b=d; ...})()
                // So existing transformation rules can work on them.
                node.argnames.forEach(function(arg, i) {
                    var d = arg.definition();
                    if (!node.uses_arguments && d.fixed === undefined) {
                        d.fixed = function() {
                            return iife.args[i] || make_node(AST_Undefined, iife);
                        };
                        tw.loop_ids[d.id] = tw.in_loop;
                        mark(tw, d, true);
                    } else {
                        d.fixed = false;
                    }
                });
            }
            descend();
            pop(tw);
            return true;
        });
        def(AST_If, function(tw) {
            this.condition.walk(tw);
            push(tw);
            this.body.walk(tw);
            pop(tw);
            if (this.alternative) {
                push(tw);
                this.alternative.walk(tw);
                pop(tw);
            }
            return true;
        });
        def(AST_LabeledStatement, function(tw) {
            push(tw);
            this.body.walk(tw);
            pop(tw);
            return true;
        });
        def(AST_SymbolCatch, function() {
            this.definition().fixed = false;
        });
        def(AST_SymbolRef, function(tw, descend, compressor) {
            var d = this.definition();
            d.references.push(this);
            if (d.references.length == 1
                && !d.fixed
                && d.orig[0] instanceof AST_SymbolDefun) {
                tw.loop_ids[d.id] = tw.in_loop;
            }
            var value;
            if (d.fixed === undefined || !safe_to_read(tw, d) || d.single_use == "m") {
                d.fixed = false;
            } else if (d.fixed) {
                value = this.fixed_value();
                if (value instanceof AST_Lambda && recursive_ref(tw, d)) {
                    d.recursive_refs++;
                } else if (value && ref_once(tw, compressor, d)) {
                    d.single_use = value instanceof AST_Lambda
                        || d.scope === this.scope && value.is_constant_expression();
                } else {
                    d.single_use = false;
                }
                if (is_modified(tw, this, value, 0, is_immutable(value))) {
                    if (d.single_use) {
                        d.single_use = "m";
                    } else {
                        d.fixed = false;
                    }
                }
            }
            mark_escaped(tw, d, this.scope, this, value, 0, 1);
        });
        def(AST_Toplevel, function(tw, descend, compressor) {
            this.globals.each(function(def) {
                reset_def(compressor, def);
            });
            reset_variables(tw, compressor, this);
        });
        def(AST_Try, function(tw) {
            push(tw);
            walk_body(this, tw);
            pop(tw);
            if (this.bcatch) {
                push(tw);
                this.bcatch.walk(tw);
                pop(tw);
            }
            if (this.bfinally) this.bfinally.walk(tw);
            return true;
        });
        def(AST_Unary, function(tw, descend) {
            var node = this;
            if (node.operator != "++" && node.operator != "--") return;
            if (!(node.expression instanceof AST_SymbolRef)) return;
            var d = node.expression.definition();
            var fixed = d.fixed;
            if (!fixed) return;
            if (!safe_to_assign(tw, d, true)) return;
            d.references.push(node.expression);
            d.assignments++;
            d.chained = true;
            d.fixed = function() {
                return make_node(AST_Binary, node, {
                    operator: node.operator.slice(0, -1),
                    left: make_node(AST_UnaryPrefix, node, {
                        operator: "+",
                        expression: fixed instanceof AST_Node ? fixed : fixed()
                    }),
                    right: make_node(AST_Number, node, {
                        value: 1
                    })
                });
            };
            mark(tw, d, true);
            return true;
        });
        def(AST_VarDef, function(tw, descend) {
            var node = this;
            var d = node.name.definition();
            if (node.value) {
                if (safe_to_assign(tw, d, node.value)) {
                    d.fixed = function() {
                        return node.value;
                    };
                    tw.loop_ids[d.id] = tw.in_loop;
                    mark(tw, d, false);
                    descend();
                    mark(tw, d, true);
                    return true;
                } else {
                    d.fixed = false;
                }
            }
        });
        def(AST_While, function(tw) {
            var saved_loop = tw.in_loop;
            tw.in_loop = this;
            push(tw);
            this.condition.walk(tw);
            this.body.walk(tw);
            pop(tw);
            tw.in_loop = saved_loop;
            return true;
        });
    })(function(node, func){
        node.DEFMETHOD("reduce_vars", func);
    });

    AST_Toplevel.DEFMETHOD("reset_opt_flags", function(compressor) {
        var reduce_vars = compressor.option("reduce_vars");
        var tw = new TreeWalker(function(node, descend) {
            node._squeezed = false;
            node._optimized = false;
            if (reduce_vars) return node.reduce_vars(tw, descend, compressor);
        });
        // Stack of look-up tables to keep track of whether a `SymbolDef` has been
        // properly assigned before use:
        // - `push()` & `pop()` when visiting conditional branches
        // - backup & restore via `save_ids` when visiting out-of-order sections
        tw.safe_ids = Object.create(null);
        tw.in_loop = null;
        tw.loop_ids = Object.create(null);
        this.walk(tw);
    });

    AST_Symbol.DEFMETHOD("fixed_value", function() {
        var fixed = this.definition().fixed;
        if (!fixed || fixed instanceof AST_Node) return fixed;
        return fixed();
    });

    AST_SymbolRef.DEFMETHOD("is_immutable", function() {
        var orig = this.definition().orig;
        return orig.length == 1 && orig[0] instanceof AST_SymbolLambda;
    });

    function is_lhs_read_only(lhs) {
        if (lhs instanceof AST_This) return true;
        if (lhs instanceof AST_SymbolRef) return lhs.definition().orig[0] instanceof AST_SymbolLambda;
        if (lhs instanceof AST_PropAccess) {
            lhs = lhs.expression;
            if (lhs instanceof AST_SymbolRef) {
                if (lhs.is_immutable()) return false;
                lhs = lhs.fixed_value();
            }
            if (!lhs) return true;
            if (lhs.is_constant()) return true;
            return is_lhs_read_only(lhs);
        }
        return false;
    }

    function find_variable(compressor, name) {
        var scope, i = 0;
        while (scope = compressor.parent(i++)) {
            if (scope instanceof AST_Scope) break;
            if (scope instanceof AST_Catch) {
                scope = scope.argname.definition().scope;
                break;
            }
        }
        return scope.find_variable(name);
    }

    function make_node(ctor, orig, props) {
        if (!props) props = {};
        if (orig) {
            if (!props.start) props.start = orig.start;
            if (!props.end) props.end = orig.end;
        }
        return new ctor(props);
    };

    function make_sequence(orig, expressions) {
        if (expressions.length == 1) return expressions[0];
        return make_node(AST_Sequence, orig, {
            expressions: expressions.reduce(merge_sequence, [])
        });
    }

    function make_node_from_constant(val, orig) {
        switch (typeof val) {
          case "string":
            return make_node(AST_String, orig, {
                value: val
            });
          case "number":
            if (isNaN(val)) return make_node(AST_NaN, orig);
            if (isFinite(val)) {
                return 1 / val < 0 ? make_node(AST_UnaryPrefix, orig, {
                    operator: "-",
                    expression: make_node(AST_Number, orig, { value: -val })
                }) : make_node(AST_Number, orig, { value: val });
            }
            return val < 0 ? make_node(AST_UnaryPrefix, orig, {
                operator: "-",
                expression: make_node(AST_Infinity, orig)
            }) : make_node(AST_Infinity, orig);
          case "boolean":
            return make_node(val ? AST_True : AST_False, orig);
          case "undefined":
            return make_node(AST_Undefined, orig);
          default:
            if (val === null) {
                return make_node(AST_Null, orig, { value: null });
            }
            if (val instanceof RegExp) {
                return make_node(AST_RegExp, orig, { value: val });
            }
            throw new Error(string_template("Can't handle constant of type: {type}", {
                type: typeof val
            }));
        }
    };

    // we shouldn't compress (1,func)(something) to
    // func(something) because that changes the meaning of
    // the func (becomes lexical instead of global).
    function maintain_this_binding(parent, orig, val) {
        if (parent instanceof AST_UnaryPrefix && parent.operator == "delete"
            || parent instanceof AST_Call && parent.expression === orig
                && (val instanceof AST_PropAccess || val instanceof AST_SymbolRef && val.name == "eval")) {
            return make_sequence(orig, [ make_node(AST_Number, orig, { value: 0 }), val ]);
        }
        return val;
    }

    function merge_sequence(array, node) {
        if (node instanceof AST_Sequence) {
            array.push.apply(array, node.expressions);
        } else {
            array.push(node);
        }
        return array;
    }

    function as_statement_array(thing) {
        if (thing === null) return [];
        if (thing instanceof AST_BlockStatement) return thing.body;
        if (thing instanceof AST_EmptyStatement) return [];
        if (thing instanceof AST_Statement) return [ thing ];
        throw new Error("Can't convert thing to statement array");
    };

    function is_empty(thing) {
        if (thing === null) return true;
        if (thing instanceof AST_EmptyStatement) return true;
        if (thing instanceof AST_BlockStatement) return thing.body.length == 0;
        return false;
    };

    function loop_body(x) {
        if (x instanceof AST_IterationStatement) {
            return x.body instanceof AST_BlockStatement ? x.body : x;
        }
        return x;
    };

    function root_expr(prop) {
        while (prop instanceof AST_PropAccess) prop = prop.expression;
        return prop;
    }

    function is_iife_call(node) {
        if (node.TYPE != "Call") return false;
        return node.expression instanceof AST_Function || is_iife_call(node.expression);
    }

    function is_undeclared_ref(node) {
        return node instanceof AST_SymbolRef && node.definition().undeclared;
    }

    var global_names = makePredicate("Array Boolean clearInterval clearTimeout console Date decodeURI decodeURIComponent encodeURI encodeURIComponent Error escape eval EvalError Function isFinite isNaN JSON Math Number parseFloat parseInt RangeError ReferenceError RegExp Object setInterval setTimeout String SyntaxError TypeError unescape URIError");
    AST_SymbolRef.DEFMETHOD("is_declared", function(compressor) {
        return !this.definition().undeclared
            || compressor.option("unsafe") && global_names(this.name);
    });

    var identifier_atom = makePredicate("Infinity NaN undefined");
    function is_identifier_atom(node) {
        return node instanceof AST_Infinity
            || node instanceof AST_NaN
            || node instanceof AST_Undefined;
    }

    function tighten_body(statements, compressor) {
        var in_loop, in_try, scope;
        find_loop_scope_try();
        var CHANGED, max_iter = 10;
        do {
            CHANGED = false;
            eliminate_spurious_blocks(statements);
            if (compressor.option("dead_code")) {
                eliminate_dead_code(statements, compressor);
            }
            if (compressor.option("if_return")) {
                handle_if_return(statements, compressor);
            }
            if (compressor.sequences_limit > 0) {
                sequencesize(statements, compressor);
                sequencesize_2(statements, compressor);
            }
            if (compressor.option("join_vars")) {
                join_consecutive_vars(statements);
            }
            if (compressor.option("collapse_vars")) {
                collapse(statements, compressor);
            }
        } while (CHANGED && max_iter-- > 0);

        function find_loop_scope_try() {
            var node = compressor.self(), level = 0;
            do {
                if (node instanceof AST_Catch || node instanceof AST_Finally) {
                    level++;
                } else if (node instanceof AST_IterationStatement) {
                    in_loop = true;
                } else if (node instanceof AST_Scope) {
                    scope = node;
                    break;
                } else if (node instanceof AST_Try) {
                    in_try = true;
                }
            } while (node = compressor.parent(level++));
        }

        // Search from right to left for assignment-like expressions:
        // - `var a = x;`
        // - `a = x;`
        // - `++a`
        // For each candidate, scan from left to right for first usage, then try
        // to fold assignment into the site for compression.
        // Will not attempt to collapse assignments into or past code blocks
        // which are not sequentially executed, e.g. loops and conditionals.
        function collapse(statements, compressor) {
            if (scope.uses_eval || scope.uses_with) return statements;
            var args;
            var candidates = [];
            var stat_index = statements.length;
            var scanner = new TreeTransformer(function(node, descend) {
                if (abort) return node;
                // Skip nodes before `candidate` as quickly as possible
                if (!hit) {
                    if (node !== hit_stack[hit_index]) return node;
                    hit_index++;
                    if (hit_index < hit_stack.length) return handle_custom_scan_order(node);
                    hit = true;
                    stop_after = find_stop(node, 0);
                    if (stop_after === node) abort = true;
                    return node;
                }
                // Stop immediately if these node types are encountered
                var parent = scanner.parent();
                if (node instanceof AST_Assign && node.operator != "=" && lhs.equivalent_to(node.left)
                    || node instanceof AST_Call && lhs instanceof AST_PropAccess && lhs.equivalent_to(node.expression)
                    || node instanceof AST_Debugger
                    || node instanceof AST_IterationStatement && !(node instanceof AST_For)
                    || node instanceof AST_LoopControl
                    || node instanceof AST_Try
                    || node instanceof AST_With
                    || parent instanceof AST_For && node !== parent.init
                    || !replace_all
                        && (node instanceof AST_SymbolRef && !node.is_declared(compressor))) {
                    abort = true;
                    return node;
                }
                // Stop only if candidate is found within conditional branches
                if (!stop_if_hit
                    && (parent instanceof AST_Binary && lazy_op(parent.operator) && parent.left !== node
                        || parent instanceof AST_Conditional && parent.condition !== node
                        || parent instanceof AST_If && parent.condition !== node)) {
                    stop_if_hit = parent;
                }
                // Replace variable with assignment when found
                var hit_lhs, hit_rhs;
                if (can_replace
                    && !(node instanceof AST_SymbolDeclaration)
                    && (scan_lhs && (hit_lhs = lhs.equivalent_to(node))
                        || scan_rhs && (hit_rhs = rhs.equivalent_to(node)))) {
                    if (stop_if_hit && (hit_rhs || !lhs_local || !replace_all)) {
                        abort = true;
                        return node;
                    }
                    if (is_lhs(node, parent)) {
                        if (value_def) replaced++;
                        return node;
                    }
                    CHANGED = abort = true;
                    replaced++;
                    compressor.info("Collapsing {name} [{file}:{line},{col}]", {
                        name: node.print_to_string(),
                        file: node.start.file,
                        line: node.start.line,
                        col: node.start.col
                    });
                    if (candidate instanceof AST_UnaryPostfix) {
                        return make_node(AST_UnaryPrefix, candidate, candidate);
                    }
                    if (candidate instanceof AST_VarDef) {
                        if (value_def) {
                            abort = false;
                            return node;
                        }
                        var def = candidate.name.definition();
                        var value = candidate.value;
                        if (def.references.length - def.replaced == 1 && !compressor.exposed(def)) {
                            def.replaced++;
                            if (funarg && is_identifier_atom(value)) {
                                return value.transform(compressor);
                            } else {
                                return maintain_this_binding(parent, node, value);
                            }
                        }
                        return make_node(AST_Assign, candidate, {
                            operator: "=",
                            left: make_node(AST_SymbolRef, candidate.name, candidate.name),
                            right: value
                        });
                    }
                    candidate.write_only = false;
                    return candidate;
                }
                // These node types have child nodes that execute sequentially,
                // but are otherwise not safe to scan into or beyond them.
                var sym;
                if (node instanceof AST_Call
                    || node instanceof AST_Exit
                        && (side_effects || lhs instanceof AST_PropAccess || may_modify(lhs))
                    || node instanceof AST_PropAccess
                        && (side_effects || node.expression.may_throw_on_access(compressor))
                    || node instanceof AST_SymbolRef
                        && (symbol_in_lvalues(node) || side_effects && may_modify(node))
                    || node instanceof AST_VarDef && node.value
                        && (node.name.name in lvalues || side_effects && may_modify(node.name))
                    || (sym = is_lhs(node.left, node))
                        && (sym instanceof AST_PropAccess || sym.name in lvalues)
                    || may_throw
                        && (in_try ? node.has_side_effects(compressor) : side_effects_external(node))) {
                    stop_after = node;
                    if (node instanceof AST_Scope) abort = true;
                }
                return handle_custom_scan_order(node);
            }, function(node) {
                if (abort) return;
                if (stop_after === node) abort = true;
                if (stop_if_hit === node) stop_if_hit = null;
            });
            var multi_replacer = new TreeTransformer(function(node) {
                if (abort) return node;
                // Skip nodes before `candidate` as quickly as possible
                if (!hit) {
                    if (node !== hit_stack[hit_index]) return node;
                    hit_index++;
                    if (hit_index < hit_stack.length) return;
                    hit = true;
                    return node;
                }
                // Replace variable when found
                if (node instanceof AST_SymbolRef
                    && node.name == def.name) {
                    if (!--replaced) abort = true;
                    if (is_lhs(node, multi_replacer.parent())) return node;
                    def.replaced++;
                    value_def.replaced--;
                    return candidate.value;
                }
                // Skip (non-executed) functions and (leading) default case in switch statements
                if (node instanceof AST_Default || node instanceof AST_Scope) return node;
            });
            while (--stat_index >= 0) {
                // Treat parameters as collapsible in IIFE, i.e.
                //   function(a, b){ ... }(x());
                // would be translated into equivalent assignments:
                //   var a = x(), b = undefined;
                if (stat_index == 0 && compressor.option("unused")) extract_args();
                // Find collapsible assignments
                var hit_stack = [];
                extract_candidates(statements[stat_index]);
                while (candidates.length > 0) {
                    hit_stack = candidates.pop();
                    var hit_index = 0;
                    var candidate = hit_stack[hit_stack.length - 1];
                    var value_def = null;
                    var stop_after = null;
                    var stop_if_hit = null;
                    var lhs = get_lhs(candidate);
                    var rhs = get_rhs(candidate);
                    var side_effects = lhs && lhs.has_side_effects(compressor);
                    var scan_lhs = lhs && !side_effects && !is_lhs_read_only(lhs);
                    var scan_rhs = rhs && foldable(rhs);
                    if (!scan_lhs && !scan_rhs) continue;
                    // Locate symbols which may execute code outside of scanning range
                    var lvalues = get_lvalues(candidate);
                    var lhs_local = is_lhs_local(lhs);
                    if (!side_effects) side_effects = value_has_side_effects(candidate);
                    var replace_all = replace_all_symbols();
                    var may_throw = candidate.may_throw(compressor);
                    var funarg = candidate.name instanceof AST_SymbolFunarg;
                    var hit = funarg;
                    var abort = false, replaced = 0, can_replace = !args || !hit;
                    if (!can_replace) {
                        for (var j = compressor.self().argnames.lastIndexOf(candidate.name) + 1; !abort && j < args.length; j++) {
                            args[j].transform(scanner);
                        }
                        can_replace = true;
                    }
                    for (var i = stat_index; !abort && i < statements.length; i++) {
                        statements[i].transform(scanner);
                    }
                    if (value_def) {
                        var def = candidate.name.definition();
                        if (abort && def.references.length - def.replaced > replaced) replaced = false;
                        else {
                            abort = false;
                            hit_index = 0;
                            hit = funarg;
                            for (var i = stat_index; !abort && i < statements.length; i++) {
                                statements[i].transform(multi_replacer);
                            }
                            value_def.single_use = false;
                        }
                    }
                    if (replaced && !remove_candidate(candidate)) statements.splice(stat_index, 1);
                }
            }

            function handle_custom_scan_order(node) {
                // Skip (non-executed) functions
                if (node instanceof AST_Scope) return node;
                // Scan case expressions first in a switch statement
                if (node instanceof AST_Switch) {
                    node.expression = node.expression.transform(scanner);
                    for (var i = 0, len = node.body.length; !abort && i < len; i++) {
                        var branch = node.body[i];
                        if (branch instanceof AST_Case) {
                            if (!hit) {
                                if (branch !== hit_stack[hit_index]) continue;
                                hit_index++;
                            }
                            branch.expression = branch.expression.transform(scanner);
                            if (!replace_all) break;
                        }
                    }
                    abort = true;
                    return node;
                }
            }

            function extract_args() {
                var iife, fn = compressor.self();
                if (fn instanceof AST_Function
                    && !fn.name
                    && !fn.uses_arguments
                    && !fn.uses_eval
                    && (iife = compressor.parent()) instanceof AST_Call
                    && iife.expression === fn) {
                    var fn_strict = compressor.has_directive("use strict");
                    if (fn_strict && !member(fn_strict, fn.body)) fn_strict = false;
                    var len = fn.argnames.length;
                    args = iife.args.slice(len);
                    var names = Object.create(null);
                    for (var i = len; --i >= 0;) {
                        var sym = fn.argnames[i];
                        var arg = iife.args[i];
                        args.unshift(make_node(AST_VarDef, sym, {
                            name: sym,
                            value: arg
                        }));
                        if (sym.name in names) continue;
                        names[sym.name] = true;
                        if (!arg) arg = make_node(AST_Undefined, sym).transform(compressor);
                        else {
                            var tw = new TreeWalker(function(node) {
                                if (!arg) return true;
                                if (node instanceof AST_SymbolRef && fn.variables.has(node.name)) {
                                    var s = node.definition().scope;
                                    if (s !== scope) while (s = s.parent_scope) {
                                        if (s === scope) return true;
                                    }
                                    arg = null;
                                }
                                if (node instanceof AST_This && (fn_strict || !tw.find_parent(AST_Scope))) {
                                    arg = null;
                                    return true;
                                }
                            });
                            arg.walk(tw);
                        }
                        if (arg) candidates.unshift([ make_node(AST_VarDef, sym, {
                            name: sym,
                            value: arg
                        }) ]);
                    }
                }
            }

            function extract_candidates(expr) {
                hit_stack.push(expr);
                if (expr instanceof AST_Assign) {
                    candidates.push(hit_stack.slice());
                    extract_candidates(expr.right);
                } else if (expr instanceof AST_Binary) {
                    extract_candidates(expr.left);
                    extract_candidates(expr.right);
                } else if (expr instanceof AST_Call) {
                    extract_candidates(expr.expression);
                    expr.args.forEach(extract_candidates);
                } else if (expr instanceof AST_Case) {
                    extract_candidates(expr.expression);
                } else if (expr instanceof AST_Conditional) {
                    extract_candidates(expr.condition);
                    extract_candidates(expr.consequent);
                    extract_candidates(expr.alternative);
                } else if (expr instanceof AST_Definitions) {
                    expr.definitions.forEach(extract_candidates);
                } else if (expr instanceof AST_DWLoop) {
                    extract_candidates(expr.condition);
                    if (!(expr.body instanceof AST_Block)) {
                        extract_candidates(expr.body);
                    }
                } else if (expr instanceof AST_Exit) {
                    if (expr.value) extract_candidates(expr.value);
                } else if (expr instanceof AST_For) {
                    if (expr.init) extract_candidates(expr.init);
                    if (expr.condition) extract_candidates(expr.condition);
                    if (expr.step) extract_candidates(expr.step);
                    if (!(expr.body instanceof AST_Block)) {
                        extract_candidates(expr.body);
                    }
                } else if (expr instanceof AST_ForIn) {
                    extract_candidates(expr.object);
                    if (!(expr.body instanceof AST_Block)) {
                        extract_candidates(expr.body);
                    }
                } else if (expr instanceof AST_If) {
                    extract_candidates(expr.condition);
                    if (!(expr.body instanceof AST_Block)) {
                        extract_candidates(expr.body);
                    }
                    if (expr.alternative && !(expr.alternative instanceof AST_Block)) {
                        extract_candidates(expr.alternative);
                    }
                } else if (expr instanceof AST_Sequence) {
                    expr.expressions.forEach(extract_candidates);
                } else if (expr instanceof AST_SimpleStatement) {
                    extract_candidates(expr.body);
                } else if (expr instanceof AST_Switch) {
                    extract_candidates(expr.expression);
                    expr.body.forEach(extract_candidates);
                } else if (expr instanceof AST_Unary) {
                    if (expr.operator == "++" || expr.operator == "--") {
                        candidates.push(hit_stack.slice());
                    } else {
                        extract_candidates(expr.expression);
                    }
                } else if (expr instanceof AST_VarDef) {
                    if (expr.value) {
                        candidates.push(hit_stack.slice());
                        extract_candidates(expr.value);
                    }
                }
                hit_stack.pop();
            }

            function find_stop(node, level, write_only) {
                var parent = scanner.parent(level);
                if (parent instanceof AST_Assign) {
                    if (write_only
                        && !(parent.left instanceof AST_PropAccess
                            || parent.left.name in lvalues)) {
                        return find_stop(parent, level + 1, write_only);
                    }
                    return node;
                }
                if (parent instanceof AST_Binary) {
                    if (write_only && (!lazy_op(parent.operator) || parent.left === node)) {
                        return find_stop(parent, level + 1, write_only);
                    }
                    return node;
                }
                if (parent instanceof AST_Call) return node;
                if (parent instanceof AST_Case) return node;
                if (parent instanceof AST_Conditional) {
                    if (write_only && parent.condition === node) {
                        return find_stop(parent, level + 1, write_only);
                    }
                    return node;
                }
                if (parent instanceof AST_Definitions) {
                    return find_stop(parent, level + 1, true);
                }
                if (parent instanceof AST_Exit) {
                    return write_only ? find_stop(parent, level + 1, write_only) : node;
                }
                if (parent instanceof AST_If) {
                    if (write_only && parent.condition === node) {
                        return find_stop(parent, level + 1, write_only);
                    }
                    return node;
                }
                if (parent instanceof AST_IterationStatement) return node;
                if (parent instanceof AST_Sequence) {
                    return find_stop(parent, level + 1, parent.tail_node() !== node);
                }
                if (parent instanceof AST_SimpleStatement) {
                    return find_stop(parent, level + 1, true);
                }
                if (parent instanceof AST_Switch) return node;
                if (parent instanceof AST_Unary) return node;
                if (parent instanceof AST_VarDef) return node;
                return null;
            }

            function mangleable_var(var_def) {
                var value = var_def.value;
                if (!(value instanceof AST_SymbolRef)) return;
                if (value.name == "arguments") return;
                var def = value.definition();
                if (def.undeclared) return;
                return value_def = def;
            }

            function get_lhs(expr) {
                if (expr instanceof AST_VarDef) {
                    var def = expr.name.definition();
                    if (!member(expr.name, def.orig)) return;
                    var declared = def.orig.length - def.eliminated;
                    var referenced = def.references.length - def.replaced;
                    if (declared > 1 && !(expr.name instanceof AST_SymbolFunarg)
                        || (referenced > 1 ? mangleable_var(expr) : !compressor.exposed(def))) {
                        return make_node(AST_SymbolRef, expr.name, expr.name);
                    }
                } else {
                    return expr[expr instanceof AST_Assign ? "left" : "expression"];
                }
            }

            function get_rhs(expr) {
                if (!(candidate instanceof AST_Assign && candidate.operator == "=")) return;
                return candidate.right;
            }

            function get_rvalue(expr) {
                return expr[expr instanceof AST_Assign ? "right" : "value"];
            }

            function foldable(expr) {
                if (expr.is_constant()) return true;
                if (expr instanceof AST_Array) return false;
                if (expr instanceof AST_Function) return false;
                if (expr instanceof AST_Object) return false;
                if (expr instanceof AST_RegExp) return false;
                if (expr instanceof AST_Symbol) return true;
                if (!(lhs instanceof AST_SymbolRef)) return false;
                if (expr.has_side_effects(compressor)) return false;
                var circular;
                var def = lhs.definition();
                expr.walk(new TreeWalker(function(node) {
                    if (circular) return true;
                    if (node instanceof AST_SymbolRef && node.definition() === def) {
                        circular = true;
                    }
                }));
                return !circular;
            }

            function get_lvalues(expr) {
                var lvalues = Object.create(null);
                if (candidate instanceof AST_VarDef) {
                    lvalues[candidate.name.name] = lhs;
                }
                var tw = new TreeWalker(function(node) {
                    var sym = root_expr(node);
                    if (sym instanceof AST_SymbolRef || sym instanceof AST_This) {
                        lvalues[sym.name] = lvalues[sym.name] || is_lhs(node, tw.parent());
                    }
                });
                expr.walk(tw);
                return lvalues;
            }

            function remove_candidate(expr) {
                if (expr.name instanceof AST_SymbolFunarg) {
                    var index = compressor.self().argnames.indexOf(expr.name);
                    var args = compressor.parent().args;
                    if (args[index]) args[index] = make_node(AST_Number, args[index], {
                        value: 0
                    });
                    return true;
                }
                var found = false;
                return statements[stat_index].transform(new TreeTransformer(function(node, descend, in_list) {
                    if (found) return node;
                    if (node === expr || node.body === expr) {
                        found = true;
                        if (node instanceof AST_VarDef) {
                            node.value = null;
                            return node;
                        }
                        return in_list ? MAP.skip : null;
                    }
                }, function(node) {
                    if (node instanceof AST_Sequence) switch (node.expressions.length) {
                      case 0: return null;
                      case 1: return node.expressions[0];
                    }
                }));
            }

            function is_lhs_local(lhs) {
                var sym = root_expr(lhs);
                return sym instanceof AST_SymbolRef
                    && sym.definition().scope === scope
                    && !(in_loop
                        && (sym.name in lvalues && lvalues[sym.name] !== lhs
                            || candidate instanceof AST_Unary
                            || candidate instanceof AST_Assign && candidate.operator != "="));
            }

            function value_has_side_effects(expr) {
                if (expr instanceof AST_Unary) return false;
                return get_rvalue(expr).has_side_effects(compressor);
            }

            function replace_all_symbols() {
                if (side_effects) return false;
                if (value_def) return true;
                if (lhs instanceof AST_SymbolRef) {
                    var def = lhs.definition();
                    if (def.references.length - def.replaced == (candidate instanceof AST_VarDef ? 1 : 2)) {
                        return true;
                    }
                }
                return false;
            }

            function symbol_in_lvalues(sym) {
                var lvalue = lvalues[sym.name];
                if (!lvalue) return;
                if (lvalue !== lhs) return true;
                scan_rhs = false;
            }

            function may_modify(sym) {
                var def = sym.definition();
                if (def.orig.length == 1 && def.orig[0] instanceof AST_SymbolDefun) return false;
                if (def.scope !== scope) return true;
                return !all(def.references, function(ref) {
                    var s = ref.scope;
                    // "block" scope within AST_Catch
                    if (s.TYPE == "Scope") s = s.parent_scope;
                    return s === scope;
                });
            }

            function side_effects_external(node, lhs) {
                if (node instanceof AST_Assign) return side_effects_external(node.left, true);
                if (node instanceof AST_Unary) return side_effects_external(node.expression, true);
                if (node instanceof AST_VarDef) return node.value && side_effects_external(node.value);
                if (lhs) {
                    if (node instanceof AST_Dot) return side_effects_external(node.expression, true);
                    if (node instanceof AST_Sub) return side_effects_external(node.expression, true);
                    if (node instanceof AST_SymbolRef) return node.definition().scope !== scope;
                }
                return false;
            }
        }

        function eliminate_spurious_blocks(statements) {
            var seen_dirs = [];
            for (var i = 0; i < statements.length;) {
                var stat = statements[i];
                if (stat instanceof AST_BlockStatement) {
                    CHANGED = true;
                    eliminate_spurious_blocks(stat.body);
                    [].splice.apply(statements, [i, 1].concat(stat.body));
                    i += stat.body.length;
                } else if (stat instanceof AST_EmptyStatement) {
                    CHANGED = true;
                    statements.splice(i, 1);
                } else if (stat instanceof AST_Directive) {
                    if (seen_dirs.indexOf(stat.value) < 0) {
                        i++;
                        seen_dirs.push(stat.value);
                    } else {
                        CHANGED = true;
                        statements.splice(i, 1);
                    }
                } else i++;
            }
        }

        function handle_if_return(statements, compressor) {
            var self = compressor.self();
            var multiple_if_returns = has_multiple_if_returns(statements);
            var in_lambda = self instanceof AST_Lambda;
            for (var i = statements.length; --i >= 0;) {
                var stat = statements[i];
                var j = next_index(i);
                var next = statements[j];

                if (in_lambda && !next && stat instanceof AST_Return) {
                    if (!stat.value) {
                        CHANGED = true;
                        statements.splice(i, 1);
                        continue;
                    }
                    if (stat.value instanceof AST_UnaryPrefix && stat.value.operator == "void") {
                        CHANGED = true;
                        statements[i] = make_node(AST_SimpleStatement, stat, {
                            body: stat.value.expression
                        });
                        continue;
                    }
                }

                if (stat instanceof AST_If) {
                    var ab = aborts(stat.body);
                    if (can_merge_flow(ab)) {
                        if (ab.label) {
                            remove(ab.label.thedef.references, ab);
                        }
                        CHANGED = true;
                        stat = stat.clone();
                        stat.condition = stat.condition.negate(compressor);
                        var body = as_statement_array_with_return(stat.body, ab);
                        stat.body = make_node(AST_BlockStatement, stat, {
                            body: as_statement_array(stat.alternative).concat(extract_functions())
                        });
                        stat.alternative = make_node(AST_BlockStatement, stat, {
                            body: body
                        });
                        statements[i] = stat.transform(compressor);
                        continue;
                    }

                    var ab = aborts(stat.alternative);
                    if (can_merge_flow(ab)) {
                        if (ab.label) {
                            remove(ab.label.thedef.references, ab);
                        }
                        CHANGED = true;
                        stat = stat.clone();
                        stat.body = make_node(AST_BlockStatement, stat.body, {
                            body: as_statement_array(stat.body).concat(extract_functions())
                        });
                        var body = as_statement_array_with_return(stat.alternative, ab);
                        stat.alternative = make_node(AST_BlockStatement, stat.alternative, {
                            body: body
                        });
                        statements[i] = stat.transform(compressor);
                        continue;
                    }
                }

                if (stat instanceof AST_If && stat.body instanceof AST_Return) {
                    var value = stat.body.value;
                    //---
                    // pretty silly case, but:
                    // if (foo()) return; return; ==> foo(); return;
                    if (!value && !stat.alternative
                        && (in_lambda && !next || next instanceof AST_Return && !next.value)) {
                        CHANGED = true;
                        statements[i] = make_node(AST_SimpleStatement, stat.condition, {
                            body: stat.condition
                        });
                        continue;
                    }
                    //---
                    // if (foo()) return x; return y; ==> return foo() ? x : y;
                    if (value && !stat.alternative && next instanceof AST_Return && next.value) {
                        CHANGED = true;
                        stat = stat.clone();
                        stat.alternative = next;
                        statements.splice(i, 1, stat.transform(compressor));
                        statements.splice(j, 1);
                        continue;
                    }
                    //---
                    // if (foo()) return x; [ return ; ] ==> return foo() ? x : undefined;
                    if (value && !stat.alternative
                        && (!next && in_lambda && multiple_if_returns
                            || next instanceof AST_Return)) {
                        CHANGED = true;
                        stat = stat.clone();
                        stat.alternative = next || make_node(AST_Return, stat, {
                            value: null
                        });
                        statements.splice(i, 1, stat.transform(compressor));
                        if (next) statements.splice(j, 1);
                        continue;
                    }
                    //---
                    // if (a) return b; if (c) return d; e; ==> return a ? b : c ? d : void e;
                    //
                    // if sequences is not enabled, this can lead to an endless loop (issue #866).
                    // however, with sequences on this helps producing slightly better output for
                    // the example code.
                    var prev = statements[prev_index(i)];
                    if (compressor.option("sequences") && in_lambda && !stat.alternative
                        && prev instanceof AST_If && prev.body instanceof AST_Return
                        && next_index(j) == statements.length && next instanceof AST_SimpleStatement) {
                        CHANGED = true;
                        stat = stat.clone();
                        stat.alternative = make_node(AST_BlockStatement, next, {
                            body: [
                                next,
                                make_node(AST_Return, next, {
                                    value: null
                                })
                            ]
                        });
                        statements.splice(i, 1, stat.transform(compressor));
                        statements.splice(j, 1);
                        continue;
                    }
                }
            }

            function has_multiple_if_returns(statements) {
                var n = 0;
                for (var i = statements.length; --i >= 0;) {
                    var stat = statements[i];
                    if (stat instanceof AST_If && stat.body instanceof AST_Return) {
                        if (++n > 1) return true;
                    }
                }
                return false;
            }

            function is_return_void(value) {
                return !value || value instanceof AST_UnaryPrefix && value.operator == "void";
            }

            function can_merge_flow(ab) {
                if (!ab) return false;
                var lct = ab instanceof AST_LoopControl ? compressor.loopcontrol_target(ab) : null;
                return ab instanceof AST_Return && in_lambda && is_return_void(ab.value)
                    || ab instanceof AST_Continue && self === loop_body(lct)
                    || ab instanceof AST_Break && lct instanceof AST_BlockStatement && self === lct;
            }

            function extract_functions() {
                var tail = statements.slice(i + 1);
                statements.length = i + 1;
                return tail.filter(function(stat) {
                    if (stat instanceof AST_Defun) {
                        statements.push(stat);
                        return false;
                    }
                    return true;
                });
            }

            function as_statement_array_with_return(node, ab) {
                var body = as_statement_array(node).slice(0, -1);
                if (ab.value) {
                    body.push(make_node(AST_SimpleStatement, ab.value, {
                        body: ab.value.expression
                    }));
                }
                return body;
            }

            function next_index(i) {
                for (var j = i + 1, len = statements.length; j < len; j++) {
                    var stat = statements[j];
                    if (!(stat instanceof AST_Var && declarations_only(stat))) {
                        break;
                    }
                }
                return j;
            }

            function prev_index(i) {
                for (var j = i; --j >= 0;) {
                    var stat = statements[j];
                    if (!(stat instanceof AST_Var && declarations_only(stat))) {
                        break;
                    }
                }
                return j;
            }
        }

        function eliminate_dead_code(statements, compressor) {
            var has_quit;
            var self = compressor.self();
            for (var i = 0, n = 0, len = statements.length; i < len; i++) {
                var stat = statements[i];
                if (stat instanceof AST_LoopControl) {
                    var lct = compressor.loopcontrol_target(stat);
                    if (stat instanceof AST_Break
                            && !(lct instanceof AST_IterationStatement)
                            && loop_body(lct) === self
                        || stat instanceof AST_Continue
                            && loop_body(lct) === self) {
                        if (stat.label) {
                            remove(stat.label.thedef.references, stat);
                        }
                    } else {
                        statements[n++] = stat;
                    }
                } else {
                    statements[n++] = stat;
                }
                if (aborts(stat)) {
                    has_quit = statements.slice(i + 1);
                    break;
                }
            }
            statements.length = n;
            CHANGED = n != len;
            if (has_quit) has_quit.forEach(function(stat) {
                extract_declarations_from_unreachable_code(compressor, stat, statements);
            });
        }

        function declarations_only(node) {
            return all(node.definitions, function(var_def) {
                return !var_def.value;
            });
        }

        function sequencesize(statements, compressor) {
            if (statements.length < 2) return;
            var seq = [], n = 0;
            function push_seq() {
                if (!seq.length) return;
                var body = make_sequence(seq[0], seq);
                statements[n++] = make_node(AST_SimpleStatement, body, { body: body });
                seq = [];
            }
            for (var i = 0, len = statements.length; i < len; i++) {
                var stat = statements[i];
                if (stat instanceof AST_SimpleStatement) {
                    if (seq.length >= compressor.sequences_limit) push_seq();
                    var body = stat.body;
                    if (seq.length > 0) body = body.drop_side_effect_free(compressor);
                    if (body) merge_sequence(seq, body);
                } else if (stat instanceof AST_Definitions && declarations_only(stat)
                    || stat instanceof AST_Defun) {
                    statements[n++] = stat;
                } else {
                    push_seq();
                    statements[n++] = stat;
                }
            }
            push_seq();
            statements.length = n;
            if (n != len) CHANGED = true;
        }

        function to_simple_statement(block, decls) {
            if (!(block instanceof AST_BlockStatement)) return block;
            var stat = null;
            for (var i = 0, len = block.body.length; i < len; i++) {
                var line = block.body[i];
                if (line instanceof AST_Var && declarations_only(line)) {
                    decls.push(line);
                } else if (stat) {
                    return false;
                } else {
                    stat = line;
                }
            }
            return stat;
        }

        function sequencesize_2(statements, compressor) {
            function cons_seq(right) {
                n--;
                CHANGED = true;
                var left = prev.body;
                return make_sequence(left, [ left, right ]).transform(compressor);
            };
            var n = 0, prev;
            for (var i = 0; i < statements.length; i++) {
                var stat = statements[i];
                if (prev) {
                    if (stat instanceof AST_Exit) {
                        stat.value = cons_seq(stat.value || make_node(AST_Undefined, stat).transform(compressor));
                    } else if (stat instanceof AST_For) {
                        if (!(stat.init instanceof AST_Definitions)) {
                            var abort = false;
                            prev.body.walk(new TreeWalker(function(node) {
                                if (abort || node instanceof AST_Scope) return true;
                                if (node instanceof AST_Binary && node.operator == "in") {
                                    abort = true;
                                    return true;
                                }
                            }));
                            if (!abort) {
                                if (stat.init) stat.init = cons_seq(stat.init);
                                else {
                                    stat.init = prev.body;
                                    n--;
                                    CHANGED = true;
                                }
                            }
                        }
                    } else if (stat instanceof AST_ForIn) {
                        stat.object = cons_seq(stat.object);
                    } else if (stat instanceof AST_If) {
                        stat.condition = cons_seq(stat.condition);
                    } else if (stat instanceof AST_Switch) {
                        stat.expression = cons_seq(stat.expression);
                    } else if (stat instanceof AST_With) {
                        stat.expression = cons_seq(stat.expression);
                    }
                }
                if (compressor.option("conditionals") && stat instanceof AST_If) {
                    var decls = [];
                    var body = to_simple_statement(stat.body, decls);
                    var alt = to_simple_statement(stat.alternative, decls);
                    if (body !== false && alt !== false && decls.length > 0) {
                        var len = decls.length;
                        decls.push(make_node(AST_If, stat, {
                            condition: stat.condition,
                            body: body || make_node(AST_EmptyStatement, stat.body),
                            alternative: alt
                        }));
                        decls.unshift(n, 1);
                        [].splice.apply(statements, decls);
                        i += len;
                        n += len + 1;
                        prev = null;
                        CHANGED = true;
                        continue;
                    }
                }
                statements[n++] = stat;
                prev = stat instanceof AST_SimpleStatement ? stat : null;
            }
            statements.length = n;
        }

        function join_object_assignments(defn, body) {
            if (!(defn instanceof AST_Definitions)) return;
            var def = defn.definitions[defn.definitions.length - 1];
            if (!(def.value instanceof AST_Object)) return;
            var exprs;
            if (body instanceof AST_Assign) {
                exprs = [ body ];
            } else if (body instanceof AST_Sequence) {
                exprs = body.expressions.slice();
            }
            if (!exprs) return;
            var trimmed = false;
            do {
                var node = exprs[0];
                if (!(node instanceof AST_Assign)) break;
                if (node.operator != "=") break;
                if (!(node.left instanceof AST_PropAccess)) break;
                var sym = node.left.expression;
                if (!(sym instanceof AST_SymbolRef)) break;
                if (def.name.name != sym.name) break;
                if (!node.right.is_constant_expression(scope)) break;
                var prop = node.left.property;
                if (prop instanceof AST_Node) {
                    prop = prop.evaluate(compressor);
                }
                if (prop instanceof AST_Node) break;
                prop = "" + prop;
                var diff = compressor.has_directive("use strict") ? function(node) {
                    return node.key != prop && node.key.name != prop;
                } : function(node) {
                    return node.key.name != prop;
                };
                if (!all(def.value.properties, diff)) break;
                def.value.properties.push(make_node(AST_ObjectKeyVal, node, {
                    key: prop,
                    value: node.right
                }));
                exprs.shift();
                trimmed = true;
            } while (exprs.length);
            return trimmed && exprs;
        }

        function join_consecutive_vars(statements) {
            var defs;
            for (var i = 0, j = -1, len = statements.length; i < len; i++) {
                var stat = statements[i];
                var prev = statements[j];
                if (stat instanceof AST_Definitions) {
                    if (prev && prev.TYPE == stat.TYPE) {
                        prev.definitions = prev.definitions.concat(stat.definitions);
                        CHANGED = true;
                    } else if (defs && defs.TYPE == stat.TYPE && declarations_only(stat)) {
                        defs.definitions = defs.definitions.concat(stat.definitions);
                        CHANGED = true;
                    } else {
                        statements[++j] = stat;
                        defs = stat;
                    }
                } else if (stat instanceof AST_Exit) {
                    stat.value = extract_object_assignments(stat.value);
                } else if (stat instanceof AST_For) {
                    var exprs = join_object_assignments(prev, stat.init);
                    if (exprs) {
                        CHANGED = true;
                        stat.init = exprs.length ? make_sequence(stat.init, exprs) : null;
                        statements[++j] = stat;
                    } else if (prev instanceof AST_Var && (!stat.init || stat.init.TYPE == prev.TYPE)) {
                        if (stat.init) {
                            prev.definitions = prev.definitions.concat(stat.init.definitions);
                        }
                        stat.init = prev;
                        statements[j] = stat;
                        CHANGED = true;
                    } else if (defs && stat.init && defs.TYPE == stat.init.TYPE && declarations_only(stat.init)) {
                        defs.definitions = defs.definitions.concat(stat.init.definitions);
                        stat.init = null;
                        statements[++j] = stat;
                        CHANGED = true;
                    } else {
                        statements[++j] = stat;
                    }
                } else if (stat instanceof AST_ForIn) {
                    stat.object = extract_object_assignments(stat.object);
                } else if (stat instanceof AST_If) {
                    stat.condition = extract_object_assignments(stat.condition);
                } else if (stat instanceof AST_SimpleStatement) {
                    var exprs = join_object_assignments(prev, stat.body);
                    if (exprs) {
                        CHANGED = true;
                        if (!exprs.length) continue;
                        stat.body = make_sequence(stat.body, exprs);
                    }
                    statements[++j] = stat;
                } else if (stat instanceof AST_Switch) {
                    stat.expression = extract_object_assignments(stat.expression);
                } else if (stat instanceof AST_With) {
                    stat.expression = extract_object_assignments(stat.expression);
                } else {
                    statements[++j] = stat;
                }
            }
            statements.length = j + 1;

            function extract_object_assignments(value) {
                statements[++j] = stat;
                var exprs = join_object_assignments(prev, value);
                if (exprs) {
                    CHANGED = true;
                    if (exprs.length) {
                        return make_sequence(value, exprs);
                    } else if (value instanceof AST_Sequence) {
                        return value.tail_node().left;
                    } else {
                        return value.left;
                    }
                }
                return value;
            }
        }
    }

    function extract_declarations_from_unreachable_code(compressor, stat, target) {
        if (!(stat instanceof AST_Defun)) {
            compressor.warn("Dropping unreachable code [{file}:{line},{col}]", stat.start);
        }
        stat.walk(new TreeWalker(function(node){
            if (node instanceof AST_Definitions) {
                compressor.warn("Declarations in unreachable code! [{file}:{line},{col}]", node.start);
                node.remove_initializers();
                target.push(node);
                return true;
            }
            if (node instanceof AST_Defun) {
                target.push(node);
                return true;
            }
            if (node instanceof AST_Scope) {
                return true;
            }
        }));
    };

    function get_value(key) {
        if (key instanceof AST_Constant) {
            return key.getValue();
        }
        if (key instanceof AST_UnaryPrefix
            && key.operator == "void"
            && key.expression instanceof AST_Constant) {
            return;
        }
        return key;
    }

    function is_undefined(node, compressor) {
        return node.is_undefined
            || node instanceof AST_Undefined
            || node instanceof AST_UnaryPrefix
                && node.operator == "void"
                && !node.expression.has_side_effects(compressor);
    }

    // may_throw_on_access()
    // returns true if this node may be null, undefined or contain `AST_Accessor`
    (function(def) {
        AST_Node.DEFMETHOD("may_throw_on_access", function(compressor) {
            return !compressor.option("pure_getters")
                || this._dot_throw(compressor);
        });

        function is_strict(compressor) {
            return /strict/.test(compressor.option("pure_getters"));
        }

        def(AST_Node, is_strict);
        def(AST_Null, return_true);
        def(AST_Undefined, return_true);
        def(AST_Constant, return_false);
        def(AST_Array, return_false);
        def(AST_Object, function(compressor) {
            if (!is_strict(compressor)) return false;
            for (var i = this.properties.length; --i >=0;)
                if (this.properties[i].value instanceof AST_Accessor) return true;
            return false;
        });
        def(AST_Lambda, return_false);
        def(AST_UnaryPostfix, return_false);
        def(AST_UnaryPrefix, function() {
            return this.operator == "void";
        });
        def(AST_Binary, function(compressor) {
            return (this.operator == "&&" || this.operator == "||")
                && (this.left._dot_throw(compressor) || this.right._dot_throw(compressor));
        })
        def(AST_Assign, function(compressor) {
            return this.operator == "="
                && this.right._dot_throw(compressor);
        })
        def(AST_Conditional, function(compressor) {
            return this.consequent._dot_throw(compressor)
                || this.alternative._dot_throw(compressor);
        })
        def(AST_Dot, function(compressor) {
            if (!is_strict(compressor)) return false;
            var exp = this.expression;
            if (exp instanceof AST_SymbolRef) exp = exp.fixed_value();
            return !(exp instanceof AST_Lambda && this.property == "prototype");
        });
        def(AST_Sequence, function(compressor) {
            return this.tail_node()._dot_throw(compressor);
        });
        def(AST_SymbolRef, function(compressor) {
            if (this.is_undefined) return true;
            if (!is_strict(compressor)) return false;
            if (is_undeclared_ref(this) && this.is_declared(compressor)) return false;
            if (this.is_immutable()) return false;
            var fixed = this.fixed_value();
            return !fixed || fixed._dot_throw(compressor);
        });
    })(function(node, func) {
        node.DEFMETHOD("_dot_throw", func);
    });

    /* -----[ boolean/negation helpers ]----- */

    // methods to determine whether an expression has a boolean result type
    (function(def){
        var unary_bool = [ "!", "delete" ];
        var binary_bool = [ "in", "instanceof", "==", "!=", "===", "!==", "<", "<=", ">=", ">" ];
        def(AST_Node, return_false);
        def(AST_UnaryPrefix, function(){
            return member(this.operator, unary_bool);
        });
        def(AST_Binary, function(){
            return member(this.operator, binary_bool)
                || lazy_op(this.operator)
                    && this.left.is_boolean()
                    && this.right.is_boolean();
        });
        def(AST_Conditional, function(){
            return this.consequent.is_boolean() && this.alternative.is_boolean();
        });
        def(AST_Assign, function(){
            return this.operator == "=" && this.right.is_boolean();
        });
        def(AST_Sequence, function(){
            return this.tail_node().is_boolean();
        });
        def(AST_True, return_true);
        def(AST_False, return_true);
    })(function(node, func){
        node.DEFMETHOD("is_boolean", func);
    });

    // methods to determine if an expression has a numeric result type
    (function(def){
        def(AST_Node, return_false);
        def(AST_Number, return_true);
        var unary = makePredicate("+ - ~ ++ --");
        def(AST_Unary, function(){
            return unary(this.operator);
        });
        var binary = makePredicate("- * / % & | ^ << >> >>>");
        def(AST_Binary, function(compressor){
            return binary(this.operator) || this.operator == "+"
                && this.left.is_number(compressor)
                && this.right.is_number(compressor);
        });
        def(AST_Assign, function(compressor){
            return binary(this.operator.slice(0, -1))
                || this.operator == "=" && this.right.is_number(compressor);
        });
        def(AST_Sequence, function(compressor){
            return this.tail_node().is_number(compressor);
        });
        def(AST_Conditional, function(compressor){
            return this.consequent.is_number(compressor) && this.alternative.is_number(compressor);
        });
    })(function(node, func){
        node.DEFMETHOD("is_number", func);
    });

    // methods to determine if an expression has a string result type
    (function(def){
        def(AST_Node, return_false);
        def(AST_String, return_true);
        def(AST_UnaryPrefix, function(){
            return this.operator == "typeof";
        });
        def(AST_Binary, function(compressor){
            return this.operator == "+" &&
                (this.left.is_string(compressor) || this.right.is_string(compressor));
        });
        def(AST_Assign, function(compressor){
            return (this.operator == "=" || this.operator == "+=") && this.right.is_string(compressor);
        });
        def(AST_Sequence, function(compressor){
            return this.tail_node().is_string(compressor);
        });
        def(AST_Conditional, function(compressor){
            return this.consequent.is_string(compressor) && this.alternative.is_string(compressor);
        });
    })(function(node, func){
        node.DEFMETHOD("is_string", func);
    });

    var lazy_op = makePredicate("&& ||");
    var unary_side_effects = makePredicate("delete ++ --");

    function is_lhs(node, parent) {
        if (parent instanceof AST_Unary && unary_side_effects(parent.operator)) return parent.expression;
        if (parent instanceof AST_Assign && parent.left === node) return node;
    }

    (function(def){
        AST_Node.DEFMETHOD("resolve_defines", function(compressor) {
            if (!compressor.option("global_defs")) return;
            var def = this._find_defs(compressor, "");
            if (def) {
                var node, parent = this, level = 0;
                do {
                    node = parent;
                    parent = compressor.parent(level++);
                } while (parent instanceof AST_PropAccess && parent.expression === node);
                if (is_lhs(node, parent)) {
                    compressor.warn('global_defs ' + this.print_to_string() + ' redefined [{file}:{line},{col}]', this.start);
                } else {
                    return def;
                }
            }
        });
        function to_node(value, orig) {
            if (value instanceof AST_Node) return make_node(value.CTOR, orig, value);
            if (Array.isArray(value)) return make_node(AST_Array, orig, {
                elements: value.map(function(value) {
                    return to_node(value, orig);
                })
            });
            if (value && typeof value == "object") {
                var props = [];
                for (var key in value) if (HOP(value, key)) {
                    props.push(make_node(AST_ObjectKeyVal, orig, {
                        key: key,
                        value: to_node(value[key], orig)
                    }));
                }
                return make_node(AST_Object, orig, {
                    properties: props
                });
            }
            return make_node_from_constant(value, orig);
        }
        def(AST_Node, noop);
        def(AST_Dot, function(compressor, suffix){
            return this.expression._find_defs(compressor, "." + this.property + suffix);
        });
        def(AST_SymbolRef, function(compressor, suffix){
            if (!this.global()) return;
            var name;
            var defines = compressor.option("global_defs");
            if (defines && HOP(defines, (name = this.name + suffix))) {
                var node = to_node(defines[name], this);
                var top = compressor.find_parent(AST_Toplevel);
                node.walk(new TreeWalker(function(node) {
                    if (node instanceof AST_SymbolRef) {
                        node.scope = top;
                        node.thedef = top.def_global(node);
                    }
                }));
                return node;
            }
        });
    })(function(node, func){
        node.DEFMETHOD("_find_defs", func);
    });

    function best_of_expression(ast1, ast2) {
        return ast1.print_to_string().length >
            ast2.print_to_string().length
            ? ast2 : ast1;
    }

    function best_of_statement(ast1, ast2) {
        return best_of_expression(make_node(AST_SimpleStatement, ast1, {
            body: ast1
        }), make_node(AST_SimpleStatement, ast2, {
            body: ast2
        })).body;
    }

    function best_of(compressor, ast1, ast2) {
        return (first_in_statement(compressor) ? best_of_statement : best_of_expression)(ast1, ast2);
    }

    function convert_to_predicate(obj) {
        for (var key in obj) {
            obj[key] = makePredicate(obj[key]);
        }
    }

    var object_fns = [
        "constructor",
        "toString",
        "valueOf",
    ];
    var native_fns = {
        Array: [
            "indexOf",
            "join",
            "lastIndexOf",
            "slice",
        ].concat(object_fns),
        Boolean: object_fns,
        Function: object_fns,
        Number: [
            "toExponential",
            "toFixed",
            "toPrecision",
        ].concat(object_fns),
        Object: object_fns,
        RegExp: [
            "test",
        ].concat(object_fns),
        String: [
            "charAt",
            "charCodeAt",
            "concat",
            "indexOf",
            "italics",
            "lastIndexOf",
            "match",
            "replace",
            "search",
            "slice",
            "split",
            "substr",
            "substring",
            "toLowerCase",
            "toUpperCase",
            "trim",
        ].concat(object_fns),
    };
    convert_to_predicate(native_fns);
    var static_fns = {
        Array: [
            "isArray",
        ],
        Math: [
            "abs",
            "acos",
            "asin",
            "atan",
            "ceil",
            "cos",
            "exp",
            "floor",
            "log",
            "round",
            "sin",
            "sqrt",
            "tan",
            "atan2",
            "pow",
            "max",
            "min",
        ],
        Number: [
            "isFinite",
            "isNaN",
        ],
        Object: [
            "create",
            "getOwnPropertyDescriptor",
            "getOwnPropertyNames",
            "getPrototypeOf",
            "isExtensible",
            "isFrozen",
            "isSealed",
            "keys",
        ],
        String: [
            "fromCharCode",
        ],
    };
    convert_to_predicate(static_fns);

    // methods to evaluate a constant expression
    (function(def){
        // If the node has been successfully reduced to a constant,
        // then its value is returned; otherwise the element itself
        // is returned.
        // They can be distinguished as constant value is never a
        // descendant of AST_Node.
        AST_Node.DEFMETHOD("evaluate", function(compressor){
            if (!compressor.option("evaluate")) return this;
            var cached = [];
            var val = this._eval(compressor, cached, 1);
            cached.forEach(function(node) {
                delete node._eval;
            });
            if (!val || val instanceof RegExp) return val;
            if (typeof val == "function" || typeof val == "object") return this;
            return val;
        });
        var unaryPrefix = makePredicate("! ~ - + void");
        AST_Node.DEFMETHOD("is_constant", function(){
            // Accomodate when compress option evaluate=false
            // as well as the common constant expressions !0 and -1
            if (this instanceof AST_Constant) {
                return !(this instanceof AST_RegExp);
            } else {
                return this instanceof AST_UnaryPrefix
                    && this.expression instanceof AST_Constant
                    && unaryPrefix(this.operator);
            }
        });
        def(AST_Statement, function(){
            throw new Error(string_template("Cannot evaluate a statement [{file}:{line},{col}]", this.start));
        });
        def(AST_Lambda, return_this);
        def(AST_Node, return_this);
        def(AST_Constant, function(){
            return this.getValue();
        });
        def(AST_Function, function(compressor) {
            if (compressor.option("unsafe")) {
                var fn = function() {};
                fn.node = this;
                fn.toString = function() {
                    return "function(){}";
                };
                return fn;
            }
            return this;
        });
        def(AST_Array, function(compressor, cached, depth) {
            if (compressor.option("unsafe")) {
                var elements = [];
                for (var i = 0, len = this.elements.length; i < len; i++) {
                    var element = this.elements[i];
                    var value = element._eval(compressor, cached, depth);
                    if (element === value) return this;
                    elements.push(value);
                }
                return elements;
            }
            return this;
        });
        def(AST_Object, function(compressor, cached, depth) {
            if (compressor.option("unsafe")) {
                var val = {};
                for (var i = 0, len = this.properties.length; i < len; i++) {
                    var prop = this.properties[i];
                    var key = prop.key;
                    if (key instanceof AST_Symbol) {
                        key = key.name;
                    } else if (key instanceof AST_Node) {
                        key = key._eval(compressor, cached, depth);
                        if (key === prop.key) return this;
                    }
                    if (typeof Object.prototype[key] === 'function') {
                        return this;
                    }
                    if (prop.value instanceof AST_Function) continue;
                    val[key] = prop.value._eval(compressor, cached, depth);
                    if (val[key] === prop.value) return this;
                }
                return val;
            }
            return this;
        });
        var non_converting_unary = makePredicate("! typeof void");
        def(AST_UnaryPrefix, function(compressor, cached, depth) {
            var e = this.expression;
            // Function would be evaluated to an array and so typeof would
            // incorrectly return 'object'. Hence making is a special case.
            if (compressor.option("typeofs")
                && this.operator == "typeof"
                && (e instanceof AST_Lambda
                    || e instanceof AST_SymbolRef
                        && e.fixed_value() instanceof AST_Lambda)) {
                return typeof function(){};
            }
            if (!non_converting_unary(this.operator)) depth++;
            e = e._eval(compressor, cached, depth);
            if (e === this.expression) return this;
            switch (this.operator) {
              case "!": return !e;
              case "typeof":
                // typeof <RegExp> returns "object" or "function" on different platforms
                // so cannot evaluate reliably
                if (e instanceof RegExp) return this;
                return typeof e;
              case "void": return void e;
              case "~": return ~e;
              case "-": return -e;
              case "+": return +e;
            }
            return this;
        });
        var non_converting_binary = makePredicate("&& || === !==");
        def(AST_Binary, function(compressor, cached, depth) {
            if (!non_converting_binary(this.operator)) depth++;
            var left = this.left._eval(compressor, cached, depth);
            if (left === this.left) return this;
            var right = this.right._eval(compressor, cached, depth);
            if (right === this.right) return this;
            var result;
            switch (this.operator) {
              case "&&"  : result = left &&  right; break;
              case "||"  : result = left ||  right; break;
              case "|"   : result = left |   right; break;
              case "&"   : result = left &   right; break;
              case "^"   : result = left ^   right; break;
              case "+"   : result = left +   right; break;
              case "*"   : result = left *   right; break;
              case "/"   : result = left /   right; break;
              case "%"   : result = left %   right; break;
              case "-"   : result = left -   right; break;
              case "<<"  : result = left <<  right; break;
              case ">>"  : result = left >>  right; break;
              case ">>>" : result = left >>> right; break;
              case "=="  : result = left ==  right; break;
              case "===" : result = left === right; break;
              case "!="  : result = left !=  right; break;
              case "!==" : result = left !== right; break;
              case "<"   : result = left <   right; break;
              case "<="  : result = left <=  right; break;
              case ">"   : result = left >   right; break;
              case ">="  : result = left >=  right; break;
              default:
                  return this;
            }
            if (isNaN(result) && compressor.find_parent(AST_With)) {
                // leave original expression as is
                return this;
            }
            return result;
        });
        def(AST_Conditional, function(compressor, cached, depth) {
            var condition = this.condition._eval(compressor, cached, depth);
            if (condition === this.condition) return this;
            var node = condition ? this.consequent : this.alternative;
            var value = node._eval(compressor, cached, depth);
            return value === node ? this : value;
        });
        def(AST_SymbolRef, function(compressor, cached, depth) {
            var fixed = this.fixed_value();
            if (!fixed) return this;
            var value;
            if (cached.indexOf(fixed) >= 0) {
                value = fixed._eval();
            } else {
                this._eval = return_this;
                value = fixed._eval(compressor, cached, depth);
                delete this._eval;
                if (value === fixed) return this;
                fixed._eval = function() {
                    return value;
                };
                cached.push(fixed);
            }
            if (value && typeof value == "object") {
                var escaped = this.definition().escaped;
                if (escaped && depth > escaped) return this;
            }
            return value;
        });
        var global_objs = {
            Array: Array,
            Math: Math,
            Number: Number,
            Object: Object,
            String: String,
        };
        var static_values = {
            Math: [
                "E",
                "LN10",
                "LN2",
                "LOG2E",
                "LOG10E",
                "PI",
                "SQRT1_2",
                "SQRT2",
            ],
            Number: [
                "MAX_VALUE",
                "MIN_VALUE",
                "NaN",
                "NEGATIVE_INFINITY",
                "POSITIVE_INFINITY",
            ],
        };
        convert_to_predicate(static_values);
        def(AST_PropAccess, function(compressor, cached, depth) {
            if (compressor.option("unsafe")) {
                var key = this.property;
                if (key instanceof AST_Node) {
                    key = key._eval(compressor, cached, depth);
                    if (key === this.property) return this;
                }
                var exp = this.expression;
                var val;
                if (is_undeclared_ref(exp)) {
                    if (!(static_values[exp.name] || return_false)(key)) return this;
                    val = global_objs[exp.name];
                } else {
                    val = exp._eval(compressor, cached, depth + 1);
                    if (!val || val === exp || !HOP(val, key)) return this;
                    if (typeof val == "function") switch (key) {
                      case "name":
                        return val.node.name ? val.node.name.name : "";
                      case "length":
                        return val.node.argnames.length;
                      default:
                        return this;
                    }
                }
                return val[key];
            }
            return this;
        });
        def(AST_Call, function(compressor, cached, depth) {
            var exp = this.expression;
            if (compressor.option("unsafe") && exp instanceof AST_PropAccess) {
                var key = exp.property;
                if (key instanceof AST_Node) {
                    key = key._eval(compressor, cached, depth);
                    if (key === exp.property) return this;
                }
                var val;
                var e = exp.expression;
                if (is_undeclared_ref(e)) {
                    if (!(static_fns[e.name] || return_false)(key)) return this;
                    val = global_objs[e.name];
                } else {
                    val = e._eval(compressor, cached, depth + 1);
                    if (val === e || !(val && native_fns[val.constructor.name] || return_false)(key)) return this;
                }
                var args = [];
                for (var i = 0, len = this.args.length; i < len; i++) {
                    var arg = this.args[i];
                    var value = arg._eval(compressor, cached, depth);
                    if (arg === value) return this;
                    args.push(value);
                }
                try {
                    return val[key].apply(val, args);
                } catch (ex) {
                    compressor.warn("Error evaluating {code} [{file}:{line},{col}]", {
                        code: this.print_to_string(),
                        file: this.start.file,
                        line: this.start.line,
                        col: this.start.col
                    });
                }
            }
            return this;
        });
        def(AST_New, return_this);
    })(function(node, func){
        node.DEFMETHOD("_eval", func);
    });

    // method to negate an expression
    (function(def){
        function basic_negation(exp) {
            return make_node(AST_UnaryPrefix, exp, {
                operator: "!",
                expression: exp
            });
        }
        function best(orig, alt, first_in_statement) {
            var negated = basic_negation(orig);
            if (first_in_statement) {
                var stat = make_node(AST_SimpleStatement, alt, {
                    body: alt
                });
                return best_of_expression(negated, stat) === stat ? alt : negated;
            }
            return best_of_expression(negated, alt);
        }
        def(AST_Node, function(){
            return basic_negation(this);
        });
        def(AST_Statement, function(){
            throw new Error("Cannot negate a statement");
        });
        def(AST_Function, function(){
            return basic_negation(this);
        });
        def(AST_UnaryPrefix, function(){
            if (this.operator == "!")
                return this.expression;
            return basic_negation(this);
        });
        def(AST_Sequence, function(compressor){
            var expressions = this.expressions.slice();
            expressions.push(expressions.pop().negate(compressor));
            return make_sequence(this, expressions);
        });
        def(AST_Conditional, function(compressor, first_in_statement){
            var self = this.clone();
            self.consequent = self.consequent.negate(compressor);
            self.alternative = self.alternative.negate(compressor);
            return best(this, self, first_in_statement);
        });
        def(AST_Binary, function(compressor, first_in_statement){
            var self = this.clone(), op = this.operator;
            if (compressor.option("unsafe_comps")) {
                switch (op) {
                  case "<=" : self.operator = ">"  ; return self;
                  case "<"  : self.operator = ">=" ; return self;
                  case ">=" : self.operator = "<"  ; return self;
                  case ">"  : self.operator = "<=" ; return self;
                }
            }
            switch (op) {
              case "==" : self.operator = "!="; return self;
              case "!=" : self.operator = "=="; return self;
              case "===": self.operator = "!=="; return self;
              case "!==": self.operator = "==="; return self;
              case "&&":
                self.operator = "||";
                self.left = self.left.negate(compressor, first_in_statement);
                self.right = self.right.negate(compressor);
                return best(this, self, first_in_statement);
              case "||":
                self.operator = "&&";
                self.left = self.left.negate(compressor, first_in_statement);
                self.right = self.right.negate(compressor);
                return best(this, self, first_in_statement);
            }
            return basic_negation(this);
        });
    })(function(node, func){
        node.DEFMETHOD("negate", function(compressor, first_in_statement){
            return func.call(this, compressor, first_in_statement);
        });
    });

    var global_pure_fns = makePredicate("Boolean decodeURI decodeURIComponent Date encodeURI encodeURIComponent Error escape EvalError isFinite isNaN Number Object parseFloat parseInt RangeError ReferenceError String SyntaxError TypeError unescape URIError");
    AST_Call.DEFMETHOD("is_expr_pure", function(compressor) {
        if (compressor.option("unsafe")) {
            var expr = this.expression;
            if (is_undeclared_ref(expr) && global_pure_fns(expr.name)) return true;
            if (expr instanceof AST_Dot
                && is_undeclared_ref(expr.expression)
                && (static_fns[expr.expression.name] || return_false)(expr.property)) {
                return true;
            }
        }
        return this.pure || !compressor.pure_funcs(this);
    });
    AST_Node.DEFMETHOD("is_call_pure", return_false);
    AST_Dot.DEFMETHOD("is_call_pure", function(compressor) {
        if (!compressor.option("unsafe")) return;
        var expr = this.expression;
        var fns = return_false;
        if (expr instanceof AST_Array) {
            fns = native_fns.Array;
        } else if (expr.is_boolean()) {
            fns = native_fns.Boolean;
        } else if (expr.is_number(compressor)) {
            fns = native_fns.Number;
        } else if (expr instanceof AST_RegExp) {
            fns = native_fns.RegExp;
        } else if (expr.is_string(compressor)) {
            fns = native_fns.String;
        } else if (!this.may_throw_on_access(compressor)) {
            fns = native_fns.Object;
        }
        return fns(this.property);
    });

    // determine if expression has side effects
    (function(def){
        def(AST_Node, return_true);

        def(AST_EmptyStatement, return_false);
        def(AST_Constant, return_false);
        def(AST_This, return_false);

        function any(list, compressor) {
            for (var i = list.length; --i >= 0;)
                if (list[i].has_side_effects(compressor))
                    return true;
            return false;
        }

        def(AST_Block, function(compressor){
            return any(this.body, compressor);
        });
        def(AST_Call, function(compressor){
            if (!this.is_expr_pure(compressor)
                && (!this.expression.is_call_pure(compressor)
                    || this.expression.has_side_effects(compressor))) {
                return true;
            }
            return any(this.args, compressor);
        });
        def(AST_Switch, function(compressor){
            return this.expression.has_side_effects(compressor)
                || any(this.body, compressor);
        });
        def(AST_Case, function(compressor){
            return this.expression.has_side_effects(compressor)
                || any(this.body, compressor);
        });
        def(AST_Try, function(compressor){
            return any(this.body, compressor)
                || this.bcatch && this.bcatch.has_side_effects(compressor)
                || this.bfinally && this.bfinally.has_side_effects(compressor);
        });
        def(AST_If, function(compressor){
            return this.condition.has_side_effects(compressor)
                || this.body && this.body.has_side_effects(compressor)
                || this.alternative && this.alternative.has_side_effects(compressor);
        });
        def(AST_LabeledStatement, function(compressor){
            return this.body.has_side_effects(compressor);
        });
        def(AST_SimpleStatement, function(compressor){
            return this.body.has_side_effects(compressor);
        });
        def(AST_Lambda, return_false);
        def(AST_Binary, function(compressor){
            return this.left.has_side_effects(compressor)
                || this.right.has_side_effects(compressor);
        });
        def(AST_Assign, return_true);
        def(AST_Conditional, function(compressor){
            return this.condition.has_side_effects(compressor)
                || this.consequent.has_side_effects(compressor)
                || this.alternative.has_side_effects(compressor);
        });
        def(AST_Unary, function(compressor){
            return unary_side_effects(this.operator)
                || this.expression.has_side_effects(compressor);
        });
        def(AST_SymbolRef, function(compressor){
            return !this.is_declared(compressor);
        });
        def(AST_SymbolDeclaration, return_false);
        def(AST_Object, function(compressor){
            return any(this.properties, compressor);
        });
        def(AST_ObjectProperty, function(compressor){
            return this.value.has_side_effects(compressor);
        });
        def(AST_Array, function(compressor){
            return any(this.elements, compressor);
        });
        def(AST_Dot, function(compressor){
            return this.expression.may_throw_on_access(compressor)
                || this.expression.has_side_effects(compressor);
        });
        def(AST_Sub, function(compressor){
            return this.expression.may_throw_on_access(compressor)
                || this.expression.has_side_effects(compressor)
                || this.property.has_side_effects(compressor);
        });
        def(AST_Sequence, function(compressor){
            return any(this.expressions, compressor);
        });
        def(AST_Definitions, function(compressor){
            return any(this.definitions, compressor);
        });
        def(AST_VarDef, function(compressor){
            return this.value;
        });
    })(function(node, func){
        node.DEFMETHOD("has_side_effects", func);
    });

    // determine if expression may throw
    (function(def){
        def(AST_Node, return_true);

        def(AST_Constant, return_false);
        def(AST_EmptyStatement, return_false);
        def(AST_Lambda, return_false);
        def(AST_SymbolDeclaration, return_false);
        def(AST_This, return_false);

        function any(list, compressor) {
            for (var i = list.length; --i >= 0;)
                if (list[i].may_throw(compressor))
                    return true;
            return false;
        }

        def(AST_Array, function(compressor){
            return any(this.elements, compressor);
        });
        def(AST_Assign, function(compressor){
            if (this.right.may_throw(compressor)) return true;
            if (!compressor.has_directive("use strict")
                && this.operator == "="
                && this.left instanceof AST_SymbolRef) {
                return false;
            }
            return this.left.may_throw(compressor);
        });
        def(AST_Binary, function(compressor){
            return this.left.may_throw(compressor)
                || this.right.may_throw(compressor);
        });
        def(AST_Block, function(compressor){
            return any(this.body, compressor);
        });
        def(AST_Call, function(compressor){
            if (any(this.args, compressor)) return true;
            if (this.is_expr_pure(compressor)) return false;
            if (this.expression.may_throw(compressor)) return true;
            return !(this.expression instanceof AST_Lambda)
                || any(this.expression.body, compressor);
        });
        def(AST_Case, function(compressor){
            return this.expression.may_throw(compressor)
                || any(this.body, compressor);
        });
        def(AST_Conditional, function(compressor){
            return this.condition.may_throw(compressor)
                || this.consequent.may_throw(compressor)
                || this.alternative.may_throw(compressor);
        });
        def(AST_Definitions, function(compressor){
            return any(this.definitions, compressor);
        });
        def(AST_Dot, function(compressor){
            return this.expression.may_throw_on_access(compressor)
                || this.expression.may_throw(compressor);
        });
        def(AST_If, function(compressor){
            return this.condition.may_throw(compressor)
                || this.body && this.body.may_throw(compressor)
                || this.alternative && this.alternative.may_throw(compressor);
        });
        def(AST_LabeledStatement, function(compressor){
            return this.body.may_throw(compressor);
        });
        def(AST_Object, function(compressor){
            return any(this.properties, compressor);
        });
        def(AST_ObjectProperty, function(compressor){
            return this.value.may_throw(compressor);
        });
        def(AST_Return, function(compressor){
            return this.value && this.value.may_throw(compressor);
        });
        def(AST_Sequence, function(compressor){
            return any(this.expressions, compressor);
        });
        def(AST_SimpleStatement, function(compressor){
            return this.body.may_throw(compressor);
        });
        def(AST_Sub, function(compressor){
            return this.expression.may_throw_on_access(compressor)
                || this.expression.may_throw(compressor)
                || this.property.may_throw(compressor);
        });
        def(AST_Switch, function(compressor){
            return this.expression.may_throw(compressor)
                || any(this.body, compressor);
        });
        def(AST_SymbolRef, function(compressor){
            return !this.is_declared(compressor);
        });
        def(AST_Try, function(compressor){
            return this.bcatch ? this.bcatch.may_throw(compressor) : any(this.body, compressor)
                || this.bfinally && this.bfinally.may_throw(compressor);
        });
        def(AST_Unary, function(compressor){
            if (this.operator == "typeof" && this.expression instanceof AST_SymbolRef)
                return false;
            return this.expression.may_throw(compressor);
        });
        def(AST_VarDef, function(compressor){
            if (!this.value) return false;
            return this.value.may_throw(compressor);
        });
    })(function(node, func){
        node.DEFMETHOD("may_throw", func);
    });

    // determine if expression is constant
    (function(def){
        function all(list) {
            for (var i = list.length; --i >= 0;)
                if (!list[i].is_constant_expression())
                    return false;
            return true;
        }
        def(AST_Node, return_false);
        def(AST_Constant, return_true);
        def(AST_Lambda, function(scope){
            var self = this;
            var result = true;
            self.walk(new TreeWalker(function(node) {
                if (!result) return true;
                if (node instanceof AST_SymbolRef) {
                    if (self.inlined) {
                        result = false;
                        return true;
                    }
                    var def = node.definition();
                    if (member(def, self.enclosed)
                        && !self.variables.has(def.name)) {
                        if (scope) {
                            var scope_def = scope.find_variable(node);
                            if (def.undeclared ? !scope_def : scope_def === def) {
                                result = "f";
                                return true;
                            }
                        }
                        result = false;
                    }
                    return true;
                }
            }));
            return result;
        });
        def(AST_Unary, function(){
            return this.expression.is_constant_expression();
        });
        def(AST_Binary, function(){
            return this.left.is_constant_expression() && this.right.is_constant_expression();
        });
        def(AST_Array, function(){
            return all(this.elements);
        });
        def(AST_Object, function(){
            return all(this.properties);
        });
        def(AST_ObjectProperty, function(){
            return this.value.is_constant_expression();
        });
    })(function(node, func){
        node.DEFMETHOD("is_constant_expression", func);
    });

    // tell me if a statement aborts
    function aborts(thing) {
        return thing && thing.aborts();
    };
    (function(def){
        def(AST_Statement, return_null);
        def(AST_Jump, return_this);
        function block_aborts(){
            var n = this.body.length;
            return n > 0 && aborts(this.body[n - 1]);
        };
        def(AST_BlockStatement, block_aborts);
        def(AST_SwitchBranch, block_aborts);
        def(AST_If, function(){
            return this.alternative && aborts(this.body) && aborts(this.alternative) && this;
        });
    })(function(node, func){
        node.DEFMETHOD("aborts", func);
    });

    /* -----[ optimizers ]----- */

    OPT(AST_Directive, function(self, compressor){
        if (compressor.has_directive(self.value) !== self) {
            return make_node(AST_EmptyStatement, self);
        }
        return self;
    });

    OPT(AST_Debugger, function(self, compressor){
        if (compressor.option("drop_debugger"))
            return make_node(AST_EmptyStatement, self);
        return self;
    });

    OPT(AST_LabeledStatement, function(self, compressor){
        if (self.body instanceof AST_Break
            && compressor.loopcontrol_target(self.body) === self.body) {
            return make_node(AST_EmptyStatement, self);
        }
        return self.label.references.length == 0 ? self.body : self;
    });

    OPT(AST_Block, function(self, compressor){
        tighten_body(self.body, compressor);
        return self;
    });

    OPT(AST_BlockStatement, function(self, compressor){
        tighten_body(self.body, compressor);
        switch (self.body.length) {
          case 1: return self.body[0];
          case 0: return make_node(AST_EmptyStatement, self);
        }
        return self;
    });

    OPT(AST_Lambda, function(self, compressor){
        tighten_body(self.body, compressor);
        if (compressor.option("side_effects")
            && self.body.length == 1
            && self.body[0] === compressor.has_directive("use strict")) {
            self.body.length = 0;
        }
        return self;
    });

    AST_Scope.DEFMETHOD("drop_unused", function(compressor){
        if (!compressor.option("unused")) return;
        if (compressor.has_directive("use asm")) return;
        var self = this;
        if (self.uses_eval || self.uses_with) return;
        var drop_funcs = !(self instanceof AST_Toplevel) || compressor.toplevel.funcs;
        var drop_vars = !(self instanceof AST_Toplevel) || compressor.toplevel.vars;
        var assign_as_unused = /keep_assign/.test(compressor.option("unused")) ? return_false : function(node, props) {
            var sym;
            if (node instanceof AST_Assign && (node.write_only || node.operator == "=")) {
                sym = node.left;
            } else if (node instanceof AST_Unary && node.write_only) {
                sym = node.expression;
            }
            if (/strict/.test(compressor.option("pure_getters"))) {
                while (sym instanceof AST_PropAccess && !sym.expression.may_throw_on_access(compressor)) {
                    if (sym instanceof AST_Sub) props.unshift(sym.property);
                    sym = sym.expression;
                }
            }
            return sym;
        };
        var in_use = [];
        var in_use_ids = Object.create(null); // avoid expensive linear scans of in_use
        var fixed_ids = Object.create(null);
        var value_read = Object.create(null);
        var value_modified = Object.create(null);
        if (self instanceof AST_Toplevel && compressor.top_retain) {
            self.variables.each(function(def) {
                if (compressor.top_retain(def) && !(def.id in in_use_ids)) {
                    in_use_ids[def.id] = true;
                    in_use.push(def);
                }
            });
        }
        var var_defs_by_id = new Dictionary();
        var initializations = new Dictionary();
        // pass 1: find out which symbols are directly used in
        // this scope (not in nested scopes).
        var scope = this;
        var tw = new TreeWalker(function(node, descend){
            if (node === self) return;
            if (node instanceof AST_Defun) {
                var node_def = node.name.definition();
                if (!drop_funcs && scope === self) {
                    if (!(node_def.id in in_use_ids)) {
                        in_use_ids[node_def.id] = true;
                        in_use.push(node_def);
                    }
                }
                initializations.add(node_def.id, node);
                return true; // don't go in nested scopes
            }
            if (node instanceof AST_SymbolFunarg && scope === self) {
                var_defs_by_id.add(node.definition().id, node);
            }
            if (node instanceof AST_Definitions && scope === self) {
                node.definitions.forEach(function(def){
                    var node_def = def.name.definition();
                    if (def.name instanceof AST_SymbolVar) {
                        var_defs_by_id.add(node_def.id, def);
                    }
                    if (!drop_vars) {
                        if (!(node_def.id in in_use_ids)) {
                            in_use_ids[node_def.id] = true;
                            in_use.push(node_def);
                        }
                    }
                    if (def.value) {
                        initializations.add(node_def.id, def.value);
                        if (def.value.has_side_effects(compressor)) {
                            def.value.walk(tw);
                        }
                        if (!node_def.chained && def.name.fixed_value() === def.value) {
                            fixed_ids[node_def.id] = def;
                        }
                    }
                });
                return true;
            }
            return scan_ref_scoped(node, descend);
        });
        self.walk(tw);
        // pass 2: for every used symbol we need to walk its
        // initialization code to figure out if it uses other
        // symbols (that may not be in_use).
        tw = new TreeWalker(scan_ref_scoped);
        for (var i = 0; i < in_use.length; i++) {
            var init = initializations.get(in_use[i].id);
            if (init) init.forEach(function(init) {
                init.walk(tw);
            });
        }
        // pass 3: we should drop declarations not in_use
        var tt = new TreeTransformer(
            function before(node, descend, in_list) {
                var parent = tt.parent();
                if (drop_vars) {
                    var props = [], sym = assign_as_unused(node, props);
                    if (sym instanceof AST_SymbolRef) {
                        var def = sym.definition();
                        var in_use = def.id in in_use_ids;
                        var value = null;
                        if (node instanceof AST_Assign) {
                            if (!in_use || node.left === sym && def.id in fixed_ids && fixed_ids[def.id] !== node) {
                                value = node.right;
                            }
                        } else if (!in_use) {
                            value = make_node(AST_Number, node, {
                                value: 0
                            });
                        }
                        if (value) {
                            props.push(value);
                            return maintain_this_binding(parent, node, make_sequence(node, props.map(function(prop) {
                                return prop.transform(tt);
                            })));
                        }
                    }
                }
                if (scope !== self) return;
                if (node instanceof AST_Function
                    && node.name
                    && !compressor.option("keep_fnames")) {
                    var def = node.name.definition();
                    // any declarations with same name will overshadow
                    // name of this anonymous function and can therefore
                    // never be used anywhere
                    if (!(def.id in in_use_ids) || def.orig.length > 1)
                        node.name = null;
                }
                if (node instanceof AST_Lambda && !(node instanceof AST_Accessor)) {
                    var trim = !compressor.option("keep_fargs");
                    for (var a = node.argnames, i = a.length; --i >= 0;) {
                        var sym = a[i];
                        if (!(sym.definition().id in in_use_ids)) {
                            sym.__unused = true;
                            if (trim) {
                                a.pop();
                                compressor[sym.unreferenced() ? "warn" : "info"]("Dropping unused function argument {name} [{file}:{line},{col}]", template(sym));
                            }
                        }
                        else {
                            trim = false;
                        }
                    }
                }
                if (drop_funcs && node instanceof AST_Defun && node !== self) {
                    var def = node.name.definition();
                    if (!(def.id in in_use_ids)) {
                        compressor[node.name.unreferenced() ? "warn" : "info"]("Dropping unused function {name} [{file}:{line},{col}]", template(node.name));
                        def.eliminated++;
                        return make_node(AST_EmptyStatement, node);
                    }
                }
                if (node instanceof AST_Definitions && !(parent instanceof AST_ForIn && parent.init === node)) {
                    // place uninitialized names at the start
                    var body = [], head = [], tail = [];
                    // for unused names whose initialization has
                    // side effects, we can cascade the init. code
                    // into the next one, or next statement.
                    var side_effects = [];
                    node.definitions.forEach(function(def) {
                        if (def.value) def.value = def.value.transform(tt);
                        var sym = def.name.definition();
                        if (!drop_vars || sym.id in in_use_ids) {
                            if (def.value && sym.id in fixed_ids && fixed_ids[sym.id] !== def) {
                                def.value = def.value.drop_side_effect_free(compressor);
                            }
                            if (def.name instanceof AST_SymbolVar) {
                                var var_defs = var_defs_by_id.get(sym.id);
                                if (var_defs.length > 1 && (!def.value || sym.orig.indexOf(def.name) > sym.eliminated)) {
                                    compressor.warn("Dropping duplicated definition of variable {name} [{file}:{line},{col}]", template(def.name));
                                    if (def.value) {
                                        var ref = make_node(AST_SymbolRef, def.name, def.name);
                                        sym.references.push(ref);
                                        var assign = make_node(AST_Assign, def, {
                                            operator: "=",
                                            left: ref,
                                            right: def.value
                                        });
                                        if (fixed_ids[sym.id] === def) {
                                            fixed_ids[sym.id] = assign;
                                        }
                                        side_effects.push(assign.transform(tt));
                                    }
                                    remove(var_defs, def);
                                    sym.eliminated++;
                                    return;
                                }
                            }
                            if (def.value) {
                                if (side_effects.length > 0) {
                                    if (tail.length > 0) {
                                        side_effects.push(def.value);
                                        def.value = make_sequence(def.value, side_effects);
                                    } else {
                                        body.push(make_node(AST_SimpleStatement, node, {
                                            body: make_sequence(node, side_effects)
                                        }));
                                    }
                                    side_effects = [];
                                }
                                tail.push(def);
                            } else {
                                head.push(def);
                            }
                        } else if (sym.orig[0] instanceof AST_SymbolCatch) {
                            var value = def.value && def.value.drop_side_effect_free(compressor);
                            if (value) side_effects.push(value);
                            def.value = null;
                            head.push(def);
                        } else {
                            var value = def.value && def.value.drop_side_effect_free(compressor);
                            if (value) {
                                compressor.warn("Side effects in initialization of unused variable {name} [{file}:{line},{col}]", template(def.name));
                                side_effects.push(value);
                            } else {
                                compressor[def.name.unreferenced() ? "warn" : "info"]("Dropping unused variable {name} [{file}:{line},{col}]", template(def.name));
                            }
                            sym.eliminated++;
                        }
                    });
                    if (head.length > 0 || tail.length > 0) {
                        node.definitions = head.concat(tail);
                        body.push(node);
                    }
                    if (side_effects.length > 0) {
                        body.push(make_node(AST_SimpleStatement, node, {
                            body: make_sequence(node, side_effects)
                        }));
                    }
                    switch (body.length) {
                      case 0:
                        return in_list ? MAP.skip : make_node(AST_EmptyStatement, node);
                      case 1:
                        return body[0];
                      default:
                        return in_list ? MAP.splice(body) : make_node(AST_BlockStatement, node, {
                            body: body
                        });
                    }
                }
                // certain combination of unused name + side effect leads to:
                //    https://github.com/mishoo/UglifyJS2/issues/44
                //    https://github.com/mishoo/UglifyJS2/issues/1830
                //    https://github.com/mishoo/UglifyJS2/issues/1838
                // that's an invalid AST.
                // We fix it at this stage by moving the `var` outside the `for`.
                if (node instanceof AST_For) {
                    descend(node, this);
                    var block;
                    if (node.init instanceof AST_BlockStatement) {
                        block = node.init;
                        node.init = block.body.pop();
                        block.body.push(node);
                    }
                    if (node.init instanceof AST_SimpleStatement) {
                        node.init = node.init.body;
                    } else if (is_empty(node.init)) {
                        node.init = null;
                    }
                    return !block ? node : in_list ? MAP.splice(block.body) : block;
                }
                if (node instanceof AST_LabeledStatement && node.body instanceof AST_For) {
                    descend(node, this);
                    if (node.body instanceof AST_BlockStatement) {
                        var block = node.body;
                        node.body = block.body.pop();
                        block.body.push(node);
                        return in_list ? MAP.splice(block.body) : block;
                    }
                    return node;
                }
                if (node instanceof AST_Scope) {
                    var save_scope = scope;
                    scope = node;
                    descend(node, this);
                    scope = save_scope;
                    return node;
                }

                function template(sym) {
                    return {
                        name : sym.name,
                        file : sym.start.file,
                        line : sym.start.line,
                        col  : sym.start.col
                    };
                }
            }
        );
        self.transform(tt);

        function verify_safe_usage(def, read, modified) {
            if (def.id in in_use_ids) return;
            if (read && modified) {
                in_use_ids[def.id] = true;
                in_use.push(def);
            } else {
                value_read[def.id] = read;
                value_modified[def.id] = modified;
            }
        }

        function scan_ref_scoped(node, descend) {
            var node_def, props = [], sym = assign_as_unused(node, props);
            if (sym instanceof AST_SymbolRef
                && self.variables.get(sym.name) === (node_def = sym.definition())) {
                props.forEach(function(prop) {
                    prop.walk(tw);
                });
                if (node instanceof AST_Assign) {
                    node.right.walk(tw);
                    if (node.left === sym) {
                        if (!node_def.chained && sym.fixed_value() === node.right) {
                            fixed_ids[node_def.id] = node;
                        }
                        if (!node.write_only) {
                            verify_safe_usage(node_def, true, value_modified[node_def.id]);
                        }
                    } else {
                        var fixed = sym.fixed_value();
                        if (!fixed || !fixed.is_constant()) {
                            verify_safe_usage(node_def, value_read[node_def.id], true);
                        }
                    }
                }
                return true;
            }
            if (node instanceof AST_SymbolRef) {
                node_def = node.definition();
                if (!(node_def.id in in_use_ids)) {
                    in_use_ids[node_def.id] = true;
                    in_use.push(node_def);
                }
                return true;
            }
            if (node instanceof AST_Scope) {
                var save_scope = scope;
                scope = node;
                descend();
                scope = save_scope;
                return true;
            }
        }
    });

    AST_Scope.DEFMETHOD("hoist_declarations", function(compressor){
        var self = this;
        if (compressor.has_directive("use asm")) return self;
        var hoist_funs = compressor.option("hoist_funs");
        var hoist_vars = compressor.option("hoist_vars");
        if (hoist_funs || hoist_vars) {
            var dirs = [];
            var hoisted = [];
            var vars = new Dictionary(), vars_found = 0, var_decl = 0;
            // let's count var_decl first, we seem to waste a lot of
            // space if we hoist `var` when there's only one.
            self.walk(new TreeWalker(function(node){
                if (node instanceof AST_Scope && node !== self)
                    return true;
                if (node instanceof AST_Var) {
                    ++var_decl;
                    return true;
                }
            }));
            hoist_vars = hoist_vars && var_decl > 1;
            var tt = new TreeTransformer(
                function before(node) {
                    if (node !== self) {
                        if (node instanceof AST_Directive) {
                            dirs.push(node);
                            return make_node(AST_EmptyStatement, node);
                        }
                        if (hoist_funs && node instanceof AST_Defun
                            && (tt.parent() === self || !compressor.has_directive("use strict"))) {
                            hoisted.push(node);
                            return make_node(AST_EmptyStatement, node);
                        }
                        if (hoist_vars && node instanceof AST_Var) {
                            node.definitions.forEach(function(def){
                                vars.set(def.name.name, def);
                                ++vars_found;
                            });
                            var seq = node.to_assignments(compressor);
                            var p = tt.parent();
                            if (p instanceof AST_ForIn && p.init === node) {
                                if (seq == null) {
                                    var def = node.definitions[0].name;
                                    return make_node(AST_SymbolRef, def, def);
                                }
                                return seq;
                            }
                            if (p instanceof AST_For && p.init === node) {
                                return seq;
                            }
                            if (!seq) return make_node(AST_EmptyStatement, node);
                            return make_node(AST_SimpleStatement, node, {
                                body: seq
                            });
                        }
                        if (node instanceof AST_Scope)
                            return node; // to avoid descending in nested scopes
                    }
                }
            );
            self = self.transform(tt);
            if (vars_found > 0) {
                // collect only vars which don't show up in self's arguments list
                var defs = [];
                vars.each(function(def, name){
                    if (self instanceof AST_Lambda
                        && find_if(function(x){ return x.name == def.name.name },
                                   self.argnames)) {
                        vars.del(name);
                    } else {
                        def = def.clone();
                        def.value = null;
                        defs.push(def);
                        vars.set(name, def);
                    }
                });
                if (defs.length > 0) {
                    // try to merge in assignments
                    for (var i = 0; i < self.body.length;) {
                        if (self.body[i] instanceof AST_SimpleStatement) {
                            var expr = self.body[i].body, sym, assign;
                            if (expr instanceof AST_Assign
                                && expr.operator == "="
                                && (sym = expr.left) instanceof AST_Symbol
                                && vars.has(sym.name))
                            {
                                var def = vars.get(sym.name);
                                if (def.value) break;
                                def.value = expr.right;
                                remove(defs, def);
                                defs.push(def);
                                self.body.splice(i, 1);
                                continue;
                            }
                            if (expr instanceof AST_Sequence
                                && (assign = expr.expressions[0]) instanceof AST_Assign
                                && assign.operator == "="
                                && (sym = assign.left) instanceof AST_Symbol
                                && vars.has(sym.name))
                            {
                                var def = vars.get(sym.name);
                                if (def.value) break;
                                def.value = assign.right;
                                remove(defs, def);
                                defs.push(def);
                                self.body[i].body = make_sequence(expr, expr.expressions.slice(1));
                                continue;
                            }
                        }
                        if (self.body[i] instanceof AST_EmptyStatement) {
                            self.body.splice(i, 1);
                            continue;
                        }
                        if (self.body[i] instanceof AST_BlockStatement) {
                            var tmp = [ i, 1 ].concat(self.body[i].body);
                            self.body.splice.apply(self.body, tmp);
                            continue;
                        }
                        break;
                    }
                    defs = make_node(AST_Var, self, {
                        definitions: defs
                    });
                    hoisted.push(defs);
                };
            }
            self.body = dirs.concat(hoisted, self.body);
        }
        return self;
    });

    AST_Scope.DEFMETHOD("var_names", function() {
        var var_names = this._var_names;
        if (!var_names) {
            this._var_names = var_names = Object.create(null);
            this.enclosed.forEach(function(def) {
                var_names[def.name] = true;
            });
            this.variables.each(function(def, name) {
                var_names[name] = true;
            });
        }
        return var_names;
    });

    AST_Scope.DEFMETHOD("make_var_name", function(prefix) {
        var var_names = this.var_names();
        prefix = prefix.replace(/(?:^[^a-z_$]|[^a-z0-9_$])/ig, "_");
        var name = prefix;
        for (var i = 0; var_names[name]; i++) name = prefix + "$" + i;
        var_names[name] = true;
        return name;
    });

    AST_Scope.DEFMETHOD("hoist_properties", function(compressor){
        var self = this;
        if (!compressor.option("hoist_props") || compressor.has_directive("use asm")) return self;
        var top_retain = self instanceof AST_Toplevel && compressor.top_retain || return_false;
        var defs_by_id = Object.create(null);
        return self.transform(new TreeTransformer(function(node, descend) {
            if (node instanceof AST_VarDef) {
                var sym = node.name, def, value;
                if (sym.scope === self
                    && (def = sym.definition()).escaped != 1
                    && !def.single_use
                    && !def.direct_access
                    && !top_retain(def)
                    && (value = sym.fixed_value()) === node.value
                    && value instanceof AST_Object) {
                    descend(node, this);
                    var defs = new Dictionary();
                    var assignments = [];
                    value.properties.forEach(function(prop) {
                        assignments.push(make_node(AST_VarDef, node, {
                            name: make_sym(prop.key),
                            value: prop.value
                        }));
                    });
                    defs_by_id[def.id] = defs;
                    return MAP.splice(assignments);
                }
            }
            if (node instanceof AST_PropAccess && node.expression instanceof AST_SymbolRef) {
                var defs = defs_by_id[node.expression.definition().id];
                if (defs) {
                    var def = defs.get(get_value(node.property));
                    var sym = make_node(AST_SymbolRef, node, {
                        name: def.name,
                        scope: node.expression.scope,
                        thedef: def
                    });
                    sym.reference({});
                    return sym;
                }
            }

            function make_sym(key) {
                var new_var = make_node(sym.CTOR, sym, {
                    name: self.make_var_name(sym.name + "_" + key),
                    scope: self
                });
                var def = self.def_variable(new_var);
                defs.set(key, def);
                self.enclosed.push(def);
                return new_var;
            }
        }));
    });

    // drop_side_effect_free()
    // remove side-effect-free parts which only affects return value
    (function(def){
        // Drop side-effect-free elements from an array of expressions.
        // Returns an array of expressions with side-effects or null
        // if all elements were dropped. Note: original array may be
        // returned if nothing changed.
        function trim(nodes, compressor, first_in_statement) {
            var len = nodes.length;
            if (!len) return null;
            var ret = [], changed = false;
            for (var i = 0; i < len; i++) {
                var node = nodes[i].drop_side_effect_free(compressor, first_in_statement);
                changed |= node !== nodes[i];
                if (node) {
                    ret.push(node);
                    first_in_statement = false;
                }
            }
            return changed ? ret.length ? ret : null : nodes;
        }

        def(AST_Node, return_this);
        def(AST_Constant, return_null);
        def(AST_This, return_null);
        def(AST_Call, function(compressor, first_in_statement){
            if (!this.is_expr_pure(compressor)) {
                if (this.expression.is_call_pure(compressor)) {
                    var exprs = this.args.slice();
                    exprs.unshift(this.expression.expression);
                    exprs = trim(exprs, compressor, first_in_statement);
                    return exprs && make_sequence(this, exprs);
                }
                if (this.expression instanceof AST_Function
                    && (!this.expression.name || !this.expression.name.definition().references.length)) {
                    var node = this.clone();
                    var exp = node.expression;
                    exp.process_expression(false, compressor);
                    exp.walk(new TreeWalker(function(node) {
                        if (node instanceof AST_Return && node.value) {
                            node.value = node.value.drop_side_effect_free(compressor);
                            return true;
                        }
                        if (node instanceof AST_Scope && node !== exp) return true;
                    }));
                    return node;
                }
                return this;
            }
            if (this.pure) {
                compressor.warn("Dropping __PURE__ call [{file}:{line},{col}]", this.start);
            }
            var args = trim(this.args, compressor, first_in_statement);
            return args && make_sequence(this, args);
        });
        def(AST_Accessor, return_null);
        def(AST_Function, return_null);
        def(AST_Binary, function(compressor, first_in_statement){
            var right = this.right.drop_side_effect_free(compressor);
            if (!right) return this.left.drop_side_effect_free(compressor, first_in_statement);
            if (lazy_op(this.operator)) {
                if (right === this.right) return this;
                var node = this.clone();
                node.right = right;
                return node;
            } else {
                var left = this.left.drop_side_effect_free(compressor, first_in_statement);
                if (!left) return this.right.drop_side_effect_free(compressor, first_in_statement);
                return make_sequence(this, [ left, right ]);
            }
        });
        def(AST_Assign, function(compressor){
            var left = this.left;
            if (left.has_side_effects(compressor)
                || compressor.has_directive("use strict")
                    && left instanceof AST_PropAccess
                    && left.expression.is_constant()) {
                return this;
            }
            this.write_only = true;
            if (root_expr(left).is_constant_expression(compressor.find_parent(AST_Scope))) {
                return this.right.drop_side_effect_free(compressor);
            }
            return this;
        });
        def(AST_Conditional, function(compressor){
            var consequent = this.consequent.drop_side_effect_free(compressor);
            var alternative = this.alternative.drop_side_effect_free(compressor);
            if (consequent === this.consequent && alternative === this.alternative) return this;
            if (!consequent) return alternative ? make_node(AST_Binary, this, {
                operator: "||",
                left: this.condition,
                right: alternative
            }) : this.condition.drop_side_effect_free(compressor);
            if (!alternative) return make_node(AST_Binary, this, {
                operator: "&&",
                left: this.condition,
                right: consequent
            });
            var node = this.clone();
            node.consequent = consequent;
            node.alternative = alternative;
            return node;
        });
        def(AST_Unary, function(compressor, first_in_statement){
            if (unary_side_effects(this.operator)) {
                this.write_only = !this.expression.has_side_effects(compressor);
                return this;
            }
            if (this.operator == "typeof" && this.expression instanceof AST_SymbolRef) return null;
            var expression = this.expression.drop_side_effect_free(compressor, first_in_statement);
            if (first_in_statement && expression && is_iife_call(expression)) {
                if (expression === this.expression && this.operator == "!") return this;
                return expression.negate(compressor, first_in_statement);
            }
            return expression;
        });
        def(AST_SymbolRef, function(compressor) {
            return this.is_declared(compressor) ? null : this;
        });
        def(AST_Object, function(compressor, first_in_statement){
            var values = trim(this.properties, compressor, first_in_statement);
            return values && make_sequence(this, values);
        });
        def(AST_ObjectProperty, function(compressor, first_in_statement){
            return this.value.drop_side_effect_free(compressor, first_in_statement);
        });
        def(AST_Array, function(compressor, first_in_statement){
            var values = trim(this.elements, compressor, first_in_statement);
            return values && make_sequence(this, values);
        });
        def(AST_Dot, function(compressor, first_in_statement){
            if (this.expression.may_throw_on_access(compressor)) return this;
            return this.expression.drop_side_effect_free(compressor, first_in_statement);
        });
        def(AST_Sub, function(compressor, first_in_statement){
            if (this.expression.may_throw_on_access(compressor)) return this;
            var expression = this.expression.drop_side_effect_free(compressor, first_in_statement);
            if (!expression) return this.property.drop_side_effect_free(compressor, first_in_statement);
            var property = this.property.drop_side_effect_free(compressor);
            if (!property) return expression;
            return make_sequence(this, [ expression, property ]);
        });
        def(AST_Sequence, function(compressor){
            var last = this.tail_node();
            var expr = last.drop_side_effect_free(compressor);
            if (expr === last) return this;
            var expressions = this.expressions.slice(0, -1);
            if (expr) expressions.push(expr);
            return make_sequence(this, expressions);
        });
    })(function(node, func){
        node.DEFMETHOD("drop_side_effect_free", func);
    });

    OPT(AST_SimpleStatement, function(self, compressor){
        if (compressor.option("side_effects")) {
            var body = self.body;
            var node = body.drop_side_effect_free(compressor, true);
            if (!node) {
                compressor.warn("Dropping side-effect-free statement [{file}:{line},{col}]", self.start);
                return make_node(AST_EmptyStatement, self);
            }
            if (node !== body) {
                return make_node(AST_SimpleStatement, self, { body: node });
            }
        }
        return self;
    });

    OPT(AST_While, function(self, compressor){
        return compressor.option("loops") ? make_node(AST_For, self, self).optimize(compressor) : self;
    });

    OPT(AST_Do, function(self, compressor){
        if (!compressor.option("loops")) return self;
        var cond = self.condition.tail_node().evaluate(compressor);
        if (!(cond instanceof AST_Node)) {
            if (cond) return make_node(AST_For, self, {
                body: make_node(AST_BlockStatement, self.body, {
                    body: [
                        self.body,
                        make_node(AST_SimpleStatement, self.condition, {
                            body: self.condition
                        })
                    ]
                })
            }).optimize(compressor);
            var has_loop_control = false;
            var tw = new TreeWalker(function(node) {
                if (node instanceof AST_Scope || has_loop_control) return true;
                if (node instanceof AST_LoopControl && tw.loopcontrol_target(node) === self)
                    return has_loop_control = true;
            });
            var parent = compressor.parent();
            (parent instanceof AST_LabeledStatement ? parent : self).walk(tw);
            if (!has_loop_control) return make_node(AST_BlockStatement, self.body, {
                body: [
                    self.body,
                    make_node(AST_SimpleStatement, self.condition, {
                        body: self.condition
                    })
                ]
            }).optimize(compressor);
        }
        if (self.body instanceof AST_SimpleStatement) return make_node(AST_For, self, {
            condition: make_sequence(self.condition, [
                self.body.body,
                self.condition
            ]),
            body: make_node(AST_EmptyStatement, self)
        }).optimize(compressor);
        return self;
    });

    function if_break_in_loop(self, compressor) {
        var first = self.body instanceof AST_BlockStatement ? self.body.body[0] : self.body;
        if (compressor.option("dead_code") && is_break(first)) {
            var body = [];
            if (self.init instanceof AST_Statement) {
                body.push(self.init);
            } else if (self.init) {
                body.push(make_node(AST_SimpleStatement, self.init, {
                    body: self.init
                }));
            }
            if (self.condition) {
                body.push(make_node(AST_SimpleStatement, self.condition, {
                    body: self.condition
                }));
            }
            extract_declarations_from_unreachable_code(compressor, self.body, body);
            return make_node(AST_BlockStatement, self, {
                body: body
            });
        }
        if (first instanceof AST_If) {
            if (is_break(first.body)) {
                if (self.condition) {
                    self.condition = make_node(AST_Binary, self.condition, {
                        left: self.condition,
                        operator: "&&",
                        right: first.condition.negate(compressor),
                    });
                } else {
                    self.condition = first.condition.negate(compressor);
                }
                drop_it(first.alternative);
            } else if (is_break(first.alternative)) {
                if (self.condition) {
                    self.condition = make_node(AST_Binary, self.condition, {
                        left: self.condition,
                        operator: "&&",
                        right: first.condition,
                    });
                } else {
                    self.condition = first.condition;
                }
                drop_it(first.body);
            }
        }
        return self;

        function is_break(node) {
            return node instanceof AST_Break
                && compressor.loopcontrol_target(node) === compressor.self();
        }

        function drop_it(rest) {
            rest = as_statement_array(rest);
            if (self.body instanceof AST_BlockStatement) {
                self.body = self.body.clone();
                self.body.body = rest.concat(self.body.body.slice(1));
                self.body = self.body.transform(compressor);
            } else {
                self.body = make_node(AST_BlockStatement, self.body, {
                    body: rest
                }).transform(compressor);
            }
            self = if_break_in_loop(self, compressor);
        }
    }

    OPT(AST_For, function(self, compressor){
        if (!compressor.option("loops")) return self;
        if (compressor.option("side_effects") && self.init) {
            self.init = self.init.drop_side_effect_free(compressor);
        }
        if (self.condition) {
            var cond = self.condition.evaluate(compressor);
            if (!(cond instanceof AST_Node)) {
                if (cond) self.condition = null;
                else if (!compressor.option("dead_code")) {
                    var orig = self.condition;
                    self.condition = make_node_from_constant(cond, self.condition);
                    self.condition = best_of_expression(self.condition.transform(compressor), orig);
                }
            }
            if (compressor.option("dead_code")) {
                if (cond instanceof AST_Node) cond = self.condition.tail_node().evaluate(compressor);
                if (!cond) {
                    var body = [];
                    extract_declarations_from_unreachable_code(compressor, self.body, body);
                    if (self.init instanceof AST_Statement) {
                        body.push(self.init);
                    } else if (self.init) {
                        body.push(make_node(AST_SimpleStatement, self.init, {
                            body: self.init
                        }));
                    }
                    body.push(make_node(AST_SimpleStatement, self.condition, {
                        body: self.condition
                    }));
                    return make_node(AST_BlockStatement, self, { body: body }).optimize(compressor);
                }
            }
        }
        return if_break_in_loop(self, compressor);
    });

    OPT(AST_If, function(self, compressor){
        if (is_empty(self.alternative)) self.alternative = null;

        if (!compressor.option("conditionals")) return self;
        // if condition can be statically determined, warn and drop
        // one of the blocks.  note, statically determined implies
        // “has no side effects”; also it doesn't work for cases like
        // `x && true`, though it probably should.
        var cond = self.condition.evaluate(compressor);
        if (!compressor.option("dead_code") && !(cond instanceof AST_Node)) {
            var orig = self.condition;
            self.condition = make_node_from_constant(cond, orig);
            self.condition = best_of_expression(self.condition.transform(compressor), orig);
        }
        if (compressor.option("dead_code")) {
            if (cond instanceof AST_Node) cond = self.condition.tail_node().evaluate(compressor);
            if (!cond) {
                compressor.warn("Condition always false [{file}:{line},{col}]", self.condition.start);
                var body = [];
                extract_declarations_from_unreachable_code(compressor, self.body, body);
                body.push(make_node(AST_SimpleStatement, self.condition, {
                    body: self.condition
                }));
                if (self.alternative) body.push(self.alternative);
                return make_node(AST_BlockStatement, self, { body: body }).optimize(compressor);
            } else if (!(cond instanceof AST_Node)) {
                compressor.warn("Condition always true [{file}:{line},{col}]", self.condition.start);
                var body = [];
                if (self.alternative) {
                    extract_declarations_from_unreachable_code(compressor, self.alternative, body);
                }
                body.push(make_node(AST_SimpleStatement, self.condition, {
                    body: self.condition
                }));
                body.push(self.body);
                return make_node(AST_BlockStatement, self, { body: body }).optimize(compressor);
            }
        }
        var negated = self.condition.negate(compressor);
        var self_condition_length = self.condition.print_to_string().length;
        var negated_length = negated.print_to_string().length;
        var negated_is_best = negated_length < self_condition_length;
        if (self.alternative && negated_is_best) {
            negated_is_best = false; // because we already do the switch here.
            // no need to swap values of self_condition_length and negated_length
            // here because they are only used in an equality comparison later on.
            self.condition = negated;
            var tmp = self.body;
            self.body = self.alternative || make_node(AST_EmptyStatement, self);
            self.alternative = tmp;
        }
        if (is_empty(self.body) && is_empty(self.alternative)) {
            return make_node(AST_SimpleStatement, self.condition, {
                body: self.condition.clone()
            }).optimize(compressor);
        }
        if (self.body instanceof AST_SimpleStatement
            && self.alternative instanceof AST_SimpleStatement) {
            return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Conditional, self, {
                    condition   : self.condition,
                    consequent  : self.body.body,
                    alternative : self.alternative.body
                })
            }).optimize(compressor);
        }
        if (is_empty(self.alternative) && self.body instanceof AST_SimpleStatement) {
            if (self_condition_length === negated_length && !negated_is_best
                && self.condition instanceof AST_Binary && self.condition.operator == "||") {
                // although the code length of self.condition and negated are the same,
                // negated does not require additional surrounding parentheses.
                // see https://github.com/mishoo/UglifyJS2/issues/979
                negated_is_best = true;
            }
            if (negated_is_best) return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Binary, self, {
                    operator : "||",
                    left     : negated,
                    right    : self.body.body
                })
            }).optimize(compressor);
            return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Binary, self, {
                    operator : "&&",
                    left     : self.condition,
                    right    : self.body.body
                })
            }).optimize(compressor);
        }
        if (self.body instanceof AST_EmptyStatement
            && self.alternative instanceof AST_SimpleStatement) {
            return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Binary, self, {
                    operator : "||",
                    left     : self.condition,
                    right    : self.alternative.body
                })
            }).optimize(compressor);
        }
        if (self.body instanceof AST_Exit
            && self.alternative instanceof AST_Exit
            && self.body.TYPE == self.alternative.TYPE) {
            return make_node(self.body.CTOR, self, {
                value: make_node(AST_Conditional, self, {
                    condition   : self.condition,
                    consequent  : self.body.value || make_node(AST_Undefined, self.body),
                    alternative : self.alternative.value || make_node(AST_Undefined, self.alternative)
                }).transform(compressor)
            }).optimize(compressor);
        }
        if (self.body instanceof AST_If
            && !self.body.alternative
            && !self.alternative) {
            self = make_node(AST_If, self, {
                condition: make_node(AST_Binary, self.condition, {
                    operator: "&&",
                    left: self.condition,
                    right: self.body.condition
                }),
                body: self.body.body,
                alternative: null
            });
        }
        if (aborts(self.body)) {
            if (self.alternative) {
                var alt = self.alternative;
                self.alternative = null;
                return make_node(AST_BlockStatement, self, {
                    body: [ self, alt ]
                }).optimize(compressor);
            }
        }
        if (aborts(self.alternative)) {
            var body = self.body;
            self.body = self.alternative;
            self.condition = negated_is_best ? negated : self.condition.negate(compressor);
            self.alternative = null;
            return make_node(AST_BlockStatement, self, {
                body: [ self, body ]
            }).optimize(compressor);
        }
        return self;
    });

    OPT(AST_Switch, function(self, compressor){
        if (!compressor.option("switches")) return self;
        var branch;
        var value = self.expression.evaluate(compressor);
        if (!(value instanceof AST_Node)) {
            var orig = self.expression;
            self.expression = make_node_from_constant(value, orig);
            self.expression = best_of_expression(self.expression.transform(compressor), orig);
        }
        if (!compressor.option("dead_code")) return self;
        if (value instanceof AST_Node) {
            value = self.expression.tail_node().evaluate(compressor);
        }
        var decl = [];
        var body = [];
        var default_branch;
        var exact_match;
        for (var i = 0, len = self.body.length; i < len && !exact_match; i++) {
            branch = self.body[i];
            if (branch instanceof AST_Default) {
                if (!default_branch) {
                    default_branch = branch;
                } else {
                    eliminate_branch(branch, body[body.length - 1]);
                }
            } else if (!(value instanceof AST_Node)) {
                var exp = branch.expression.evaluate(compressor);
                if (!(exp instanceof AST_Node) && exp !== value) {
                    eliminate_branch(branch, body[body.length - 1]);
                    continue;
                }
                if (exp instanceof AST_Node) exp = branch.expression.tail_node().evaluate(compressor);
                if (exp === value) {
                    exact_match = branch;
                    if (default_branch) {
                        var default_index = body.indexOf(default_branch);
                        body.splice(default_index, 1);
                        eliminate_branch(default_branch, body[default_index - 1]);
                        default_branch = null;
                    }
                }
            }
            if (aborts(branch)) {
                var prev = body[body.length - 1];
                if (aborts(prev) && prev.body.length == branch.body.length
                    && make_node(AST_BlockStatement, prev, prev).equivalent_to(make_node(AST_BlockStatement, branch, branch))) {
                    prev.body = [];
                }
            }
            body.push(branch);
        }
        while (i < len) eliminate_branch(self.body[i++], body[body.length - 1]);
        if (body.length > 0) {
            body[0].body = decl.concat(body[0].body);
        }
        self.body = body;
        while (branch = body[body.length - 1]) {
            var stat = branch.body[branch.body.length - 1];
            if (stat instanceof AST_Break && compressor.loopcontrol_target(stat) === self)
                branch.body.pop();
            if (branch.body.length || branch instanceof AST_Case
                && (default_branch || branch.expression.has_side_effects(compressor))) break;
            if (body.pop() === default_branch) default_branch = null;
        }
        if (body.length == 0) {
            return make_node(AST_BlockStatement, self, {
                body: decl.concat(make_node(AST_SimpleStatement, self.expression, {
                    body: self.expression
                }))
            }).optimize(compressor);
        }
        if (body.length == 1 && (body[0] === exact_match || body[0] === default_branch)) {
            var has_break = false;
            var tw = new TreeWalker(function(node) {
                if (has_break
                    || node instanceof AST_Lambda
                    || node instanceof AST_SimpleStatement) return true;
                if (node instanceof AST_Break && tw.loopcontrol_target(node) === self)
                    has_break = true;
            });
            self.walk(tw);
            if (!has_break) {
                var statements = body[0].body.slice();
                var exp = body[0].expression;
                if (exp) statements.unshift(make_node(AST_SimpleStatement, exp, {
                    body: exp
                }));
                statements.unshift(make_node(AST_SimpleStatement, self.expression, {
                    body:self.expression
                }));
                return make_node(AST_BlockStatement, self, {
                    body: statements
                }).optimize(compressor);
            }
        }
        return self;

        function eliminate_branch(branch, prev) {
            if (prev && !aborts(prev)) {
                prev.body = prev.body.concat(branch.body);
            } else {
                extract_declarations_from_unreachable_code(compressor, branch, decl);
            }
        }
    });

    OPT(AST_Try, function(self, compressor){
        tighten_body(self.body, compressor);
        if (self.bcatch && self.bfinally && all(self.bfinally.body, is_empty)) self.bfinally = null;
        if (compressor.option("dead_code") && all(self.body, is_empty)) {
            var body = [];
            if (self.bcatch) {
                extract_declarations_from_unreachable_code(compressor, self.bcatch, body);
                body.forEach(function(stat) {
                    if (!(stat instanceof AST_Definitions)) return;
                    stat.definitions.forEach(function(var_def) {
                        var def = var_def.name.definition().redefined();
                        if (!def) return;
                        var_def.name = var_def.name.clone();
                        var_def.name.thedef = def;
                    });
                });
            }
            if (self.bfinally) body = body.concat(self.bfinally.body);
            return make_node(AST_BlockStatement, self, {
                body: body
            }).optimize(compressor);
        }
        return self;
    });

    AST_Definitions.DEFMETHOD("remove_initializers", function(){
        this.definitions.forEach(function(def){ def.value = null });
    });

    AST_Definitions.DEFMETHOD("to_assignments", function(compressor){
        var reduce_vars = compressor.option("reduce_vars");
        var assignments = this.definitions.reduce(function(a, def){
            if (def.value) {
                var name = make_node(AST_SymbolRef, def.name, def.name);
                a.push(make_node(AST_Assign, def, {
                    operator : "=",
                    left     : name,
                    right    : def.value
                }));
                if (reduce_vars) name.definition().fixed = false;
            }
            def = def.name.definition();
            def.eliminated++;
            def.replaced--;
            return a;
        }, []);
        if (assignments.length == 0) return null;
        return make_sequence(this, assignments);
    });

    OPT(AST_Definitions, function(self, compressor){
        if (self.definitions.length == 0)
            return make_node(AST_EmptyStatement, self);
        return self;
    });

    OPT(AST_Call, function(self, compressor){
        var exp = self.expression;
        var fn = exp;
        if (compressor.option("reduce_vars") && fn instanceof AST_SymbolRef) {
            fn = fn.fixed_value();
        }
        var is_func = fn instanceof AST_Lambda;
        if (compressor.option("unused")
            && is_func
            && !fn.uses_arguments
            && !fn.uses_eval) {
            var pos = 0, last = 0;
            for (var i = 0, len = self.args.length; i < len; i++) {
                var trim = i >= fn.argnames.length;
                if (trim || fn.argnames[i].__unused) {
                    var node = self.args[i].drop_side_effect_free(compressor);
                    if (node) {
                        self.args[pos++] = node;
                    } else if (!trim) {
                        self.args[pos++] = make_node(AST_Number, self.args[i], {
                            value: 0
                        });
                        continue;
                    }
                } else {
                    self.args[pos++] = self.args[i];
                }
                last = pos;
            }
            self.args.length = last;
        }
        if (compressor.option("unsafe")) {
            if (is_undeclared_ref(exp)) switch (exp.name) {
              case "Array":
                if (self.args.length != 1) {
                    return make_node(AST_Array, self, {
                        elements: self.args
                    }).optimize(compressor);
                }
                break;
              case "Object":
                if (self.args.length == 0) {
                    return make_node(AST_Object, self, {
                        properties: []
                    });
                }
                break;
              case "String":
                if (self.args.length == 0) return make_node(AST_String, self, {
                    value: ""
                });
                if (self.args.length <= 1) return make_node(AST_Binary, self, {
                    left: self.args[0],
                    operator: "+",
                    right: make_node(AST_String, self, { value: "" })
                }).optimize(compressor);
                break;
              case "Number":
                if (self.args.length == 0) return make_node(AST_Number, self, {
                    value: 0
                });
                if (self.args.length == 1) return make_node(AST_UnaryPrefix, self, {
                    expression: self.args[0],
                    operator: "+"
                }).optimize(compressor);
              case "Boolean":
                if (self.args.length == 0) return make_node(AST_False, self);
                if (self.args.length == 1) return make_node(AST_UnaryPrefix, self, {
                    expression: make_node(AST_UnaryPrefix, self, {
                        expression: self.args[0],
                        operator: "!"
                    }),
                    operator: "!"
                }).optimize(compressor);
                break;
              case "RegExp":
                var params = [];
                if (all(self.args, function(arg) {
                    var value = arg.evaluate(compressor);
                    params.unshift(value);
                    return arg !== value;
                })) {
                    try {
                        return best_of(compressor, self, make_node(AST_RegExp, self, {
                            value: RegExp.apply(RegExp, params),
                        }));
                    } catch (ex) {
                        compressor.warn("Error converting {expr} [{file}:{line},{col}]", {
                            expr: self.print_to_string(),
                            file: self.start.file,
                            line: self.start.line,
                            col: self.start.col
                        });
                    }
                }
                break;
            } else if (exp instanceof AST_Dot) switch(exp.property) {
              case "toString":
                if (self.args.length == 0 && !exp.expression.may_throw_on_access(compressor)) {
                    return make_node(AST_Binary, self, {
                        left: make_node(AST_String, self, { value: "" }),
                        operator: "+",
                        right: exp.expression
                    }).optimize(compressor);
                }
                break;
              case "join":
                if (exp.expression instanceof AST_Array) EXIT: {
                    var separator;
                    if (self.args.length > 0) {
                        separator = self.args[0].evaluate(compressor);
                        if (separator === self.args[0]) break EXIT; // not a constant
                    }
                    var elements = [];
                    var consts = [];
                    exp.expression.elements.forEach(function(el) {
                        var value = el.evaluate(compressor);
                        if (value !== el) {
                            consts.push(value);
                        } else {
                            if (consts.length > 0) {
                                elements.push(make_node(AST_String, self, {
                                    value: consts.join(separator)
                                }));
                                consts.length = 0;
                            }
                            elements.push(el);
                        }
                    });
                    if (consts.length > 0) {
                        elements.push(make_node(AST_String, self, {
                            value: consts.join(separator)
                        }));
                    }
                    if (elements.length == 0) return make_node(AST_String, self, { value: "" });
                    if (elements.length == 1) {
                        if (elements[0].is_string(compressor)) {
                            return elements[0];
                        }
                        return make_node(AST_Binary, elements[0], {
                            operator : "+",
                            left     : make_node(AST_String, self, { value: "" }),
                            right    : elements[0]
                        });
                    }
                    if (separator == "") {
                        var first;
                        if (elements[0].is_string(compressor)
                            || elements[1].is_string(compressor)) {
                            first = elements.shift();
                        } else {
                            first = make_node(AST_String, self, { value: "" });
                        }
                        return elements.reduce(function(prev, el){
                            return make_node(AST_Binary, el, {
                                operator : "+",
                                left     : prev,
                                right    : el
                            });
                        }, first).optimize(compressor);
                    }
                    // need this awkward cloning to not affect original element
                    // best_of will decide which one to get through.
                    var node = self.clone();
                    node.expression = node.expression.clone();
                    node.expression.expression = node.expression.expression.clone();
                    node.expression.expression.elements = elements;
                    return best_of(compressor, self, node);
                }
                break;
              case "charAt":
                if (exp.expression.is_string(compressor)) {
                    var arg = self.args[0];
                    var index = arg ? arg.evaluate(compressor) : 0;
                    if (index !== arg) {
                        return make_node(AST_Sub, exp, {
                            expression: exp.expression,
                            property: make_node_from_constant(index | 0, arg || exp)
                        }).optimize(compressor);
                    }
                }
                break;
              case "apply":
                if (self.args.length == 2 && self.args[1] instanceof AST_Array) {
                    var args = self.args[1].elements.slice();
                    args.unshift(self.args[0]);
                    return make_node(AST_Call, self, {
                        expression: make_node(AST_Dot, exp, {
                            expression: exp.expression,
                            property: "call"
                        }),
                        args: args
                    }).optimize(compressor);
                }
                break;
              case "call":
                var func = exp.expression;
                if (func instanceof AST_SymbolRef) {
                    func = func.fixed_value();
                }
                if (func instanceof AST_Lambda && !func.contains_this()) {
                    return make_sequence(this, [
                        self.args[0],
                        make_node(AST_Call, self, {
                            expression: exp.expression,
                            args: self.args.slice(1)
                        })
                    ]).optimize(compressor);
                }
                break;
            }
        }
        if (compressor.option("unsafe_Function")
            && is_undeclared_ref(exp)
            && exp.name == "Function") {
            // new Function() => function(){}
            if (self.args.length == 0) return make_node(AST_Function, self, {
                argnames: [],
                body: []
            });
            if (all(self.args, function(x) {
                return x instanceof AST_String;
            })) {
                // quite a corner-case, but we can handle it:
                //   https://github.com/mishoo/UglifyJS2/issues/203
                // if the code argument is a constant, then we can minify it.
                try {
                    var code = "n(function(" + self.args.slice(0, -1).map(function(arg) {
                        return arg.value;
                    }).join(",") + "){" + self.args[self.args.length - 1].value + "})";
                    var ast = parse(code);
                    var mangle = { ie8: compressor.option("ie8") };
                    ast.figure_out_scope(mangle);
                    var comp = new Compressor(compressor.options);
                    ast = ast.transform(comp);
                    ast.figure_out_scope(mangle);
                    ast.compute_char_frequency(mangle);
                    ast.mangle_names(mangle);
                    var fun;
                    ast.walk(new TreeWalker(function(node) {
                        if (fun) return true;
                        if (node instanceof AST_Lambda) {
                            fun = node;
                            return true;
                        }
                    }));
                    var code = OutputStream();
                    AST_BlockStatement.prototype._codegen.call(fun, fun, code);
                    self.args = [
                        make_node(AST_String, self, {
                            value: fun.argnames.map(function(arg) {
                                return arg.print_to_string();
                            }).join(",")
                        }),
                        make_node(AST_String, self.args[self.args.length - 1], {
                            value: code.get().replace(/^\{|\}$/g, "")
                        })
                    ];
                    return self;
                } catch (ex) {
                    if (ex instanceof JS_Parse_Error) {
                        compressor.warn("Error parsing code passed to new Function [{file}:{line},{col}]", self.args[self.args.length - 1].start);
                        compressor.warn(ex.toString());
                    } else {
                        throw ex;
                    }
                }
            }
        }
        var stat = is_func && fn.body[0];
        if (compressor.option("inline") && stat instanceof AST_Return) {
            var value = stat.value;
            if (!value || value.is_constant_expression()) {
                var args = self.args.concat(value || make_node(AST_Undefined, self));
                return make_sequence(self, args).optimize(compressor);
            }
        }
        if (is_func) {
            var def, value, scope, in_loop, level = -1;
            if (compressor.option("inline")
                && !fn.uses_arguments
                && !fn.uses_eval
                && !(fn.name && fn instanceof AST_Function)
                && (value = can_flatten_body(stat))
                && (exp === fn
                    || compressor.option("unused")
                        && (def = exp.definition()).references.length == 1
                        && !recursive_ref(compressor, def)
                        && fn.is_constant_expression(exp.scope))
                && !self.pure
                && !fn.contains_this()
                && can_inject_symbols()) {
                fn._squeezed = true;
                return make_sequence(self, flatten_fn()).optimize(compressor);
            }
            if (compressor.option("side_effects") && all(fn.body, is_empty)) {
                var args = self.args.concat(make_node(AST_Undefined, self));
                return make_sequence(self, args).optimize(compressor);
            }
        }
        if (compressor.option("drop_console")) {
            if (exp instanceof AST_PropAccess) {
                var name = exp.expression;
                while (name.expression) {
                    name = name.expression;
                }
                if (is_undeclared_ref(name) && name.name == "console") {
                    return make_node(AST_Undefined, self).optimize(compressor);
                }
            }
        }
        if (compressor.option("negate_iife")
            && compressor.parent() instanceof AST_SimpleStatement
            && is_iife_call(self)) {
            return self.negate(compressor, true);
        }
        var ev = self.evaluate(compressor);
        if (ev !== self) {
            ev = make_node_from_constant(ev, self).optimize(compressor);
            return best_of(compressor, ev, self);
        }
        return self;

        function return_value(stat) {
            if (!stat) return make_node(AST_Undefined, self);
            if (stat instanceof AST_Return) {
                if (!stat.value) return make_node(AST_Undefined, self);
                return stat.value.clone(true);
            }
            if (stat instanceof AST_SimpleStatement) {
                return make_node(AST_UnaryPrefix, stat, {
                    operator: "void",
                    expression: stat.body.clone(true)
                });
            }
        }

        function can_flatten_body(stat) {
            var len = fn.body.length;
            if (compressor.option("inline") < 3) {
                return len == 1 && return_value(stat);
            }
            stat = null;
            for (var i = 0; i < len; i++) {
                var line = fn.body[i];
                if (line instanceof AST_Var) {
                    if (stat && !all(line.definitions, function(var_def) {
                        return !var_def.value;
                    })) {
                        return false;
                    }
                } else if (line instanceof AST_EmptyStatement) {
                    continue;
                } else if (stat) {
                    return false;
                } else {
                    stat = line;
                }
            }
            return return_value(stat);
        }

        function can_inject_args(catches, safe_to_inject) {
            for (var i = 0, len = fn.argnames.length; i < len; i++) {
                var arg = fn.argnames[i];
                if (arg.__unused) continue;
                if (!safe_to_inject
                    || catches[arg.name]
                    || identifier_atom(arg.name)
                    || scope.var_names()[arg.name]) {
                    return false;
                }
                if (in_loop) in_loop.push(arg.definition());
            }
            return true;
        }

        function can_inject_vars(catches, safe_to_inject) {
            var len = fn.body.length;
            for (var i = 0; i < len; i++) {
                var stat = fn.body[i];
                if (!(stat instanceof AST_Var)) continue;
                if (!safe_to_inject) return false;
                for (var j = stat.definitions.length; --j >= 0;) {
                    var name = stat.definitions[j].name;
                    if (catches[name.name]
                        || identifier_atom(name.name)
                        || scope.var_names()[name.name]) {
                        return false;
                    }
                    if (in_loop) in_loop.push(name.definition());
                }
            }
            return true;
        }

        function can_inject_symbols() {
            var catches = Object.create(null);
            do {
                scope = compressor.parent(++level);
                if (scope instanceof AST_Catch) {
                    catches[scope.argname.name] = true;
                } else if (scope instanceof AST_IterationStatement) {
                    in_loop = [];
                } else if (scope instanceof AST_SymbolRef) {
                    if (scope.fixed_value() instanceof AST_Scope) return false;
                }
            } while (!(scope instanceof AST_Scope));
            var safe_to_inject = !(scope instanceof AST_Toplevel) || compressor.toplevel.vars;
            var inline = compressor.option("inline");
            if (!can_inject_vars(catches, inline >= 3 && safe_to_inject)) return false;
            if (!can_inject_args(catches, inline >= 2 && safe_to_inject)) return false;
            return !in_loop || in_loop.length == 0 || !is_reachable(fn, in_loop);
        }

        function append_var(decls, expressions, name, value) {
            var def = name.definition();
            scope.variables.set(name.name, def);
            scope.enclosed.push(def);
            if (!scope.var_names()[name.name]) {
                scope.var_names()[name.name] = true;
                decls.push(make_node(AST_VarDef, name, {
                    name: name,
                    value: null
                }));
            }
            var sym = make_node(AST_SymbolRef, name, name);
            def.references.push(sym);
            if (value) expressions.push(make_node(AST_Assign, self, {
                operator: "=",
                left: sym,
                right: value
            }));
        }

        function flatten_args(decls, expressions) {
            var len = fn.argnames.length;
            for (var i = self.args.length; --i >= len;) {
                expressions.push(self.args[i]);
            }
            for (i = len; --i >= 0;) {
                var name = fn.argnames[i];
                var value = self.args[i];
                if (name.__unused || scope.var_names()[name.name]) {
                    if (value) expressions.push(value);
                } else {
                    var symbol = make_node(AST_SymbolVar, name, name);
                    name.definition().orig.push(symbol);
                    if (!value && in_loop) value = make_node(AST_Undefined, self);
                    append_var(decls, expressions, symbol, value);
                }
            }
            decls.reverse();
            expressions.reverse();
        }

        function flatten_vars(decls, expressions) {
            var pos = expressions.length;
            for (var i = 0, lines = fn.body.length; i < lines; i++) {
                var stat = fn.body[i];
                if (!(stat instanceof AST_Var)) continue;
                for (var j = 0, defs = stat.definitions.length; j < defs; j++) {
                    var var_def = stat.definitions[j];
                    var name = var_def.name;
                    append_var(decls, expressions, name, var_def.value);
                    if (in_loop) {
                        var def = name.definition();
                        var sym = make_node(AST_SymbolRef, name, name);
                        def.references.push(sym);
                        expressions.splice(pos++, 0, make_node(AST_Assign, var_def, {
                            operator: "=",
                            left: sym,
                            right: make_node(AST_Undefined, name)
                        }));
                    }
                }
            }
        }

        function flatten_fn() {
            var decls = [];
            var expressions = [];
            flatten_args(decls, expressions);
            flatten_vars(decls, expressions);
            expressions.push(value);
            if (decls.length) {
                i = scope.body.indexOf(compressor.parent(level - 1)) + 1;
                scope.body.splice(i, 0, make_node(AST_Var, fn, {
                    definitions: decls
                }));
            }
            return expressions;
        }
    });

    OPT(AST_New, function(self, compressor){
        if (compressor.option("unsafe")) {
            var exp = self.expression;
            if (is_undeclared_ref(exp)) {
                switch (exp.name) {
                  case "Object":
                  case "RegExp":
                  case "Function":
                  case "Error":
                  case "Array":
                    return make_node(AST_Call, self, self).transform(compressor);
                }
            }
        }
        return self;
    });

    OPT(AST_Sequence, function(self, compressor){
        if (!compressor.option("side_effects")) return self;
        var expressions = [];
        filter_for_side_effects();
        var end = expressions.length - 1;
        trim_right_for_undefined();
        if (end == 0) {
            self = maintain_this_binding(compressor.parent(), compressor.self(), expressions[0]);
            if (!(self instanceof AST_Sequence)) self = self.optimize(compressor);
            return self;
        }
        self.expressions = expressions;
        return self;

        function filter_for_side_effects() {
            var first = first_in_statement(compressor);
            var last = self.expressions.length - 1;
            self.expressions.forEach(function(expr, index) {
                if (index < last) expr = expr.drop_side_effect_free(compressor, first);
                if (expr) {
                    merge_sequence(expressions, expr);
                    first = false;
                }
            });
        }

        function trim_right_for_undefined() {
            while (end > 0 && is_undefined(expressions[end], compressor)) end--;
            if (end < expressions.length - 1) {
                expressions[end] = make_node(AST_UnaryPrefix, self, {
                    operator   : "void",
                    expression : expressions[end]
                });
                expressions.length = end + 1;
            }
        }
    });

    AST_Unary.DEFMETHOD("lift_sequences", function(compressor){
        if (compressor.option("sequences")) {
            if (this.expression instanceof AST_Sequence) {
                var x = this.expression.expressions.slice();
                var e = this.clone();
                e.expression = x.pop();
                x.push(e);
                return make_sequence(this, x).optimize(compressor);
            }
        }
        return this;
    });

    OPT(AST_UnaryPostfix, function(self, compressor){
        return self.lift_sequences(compressor);
    });

    OPT(AST_UnaryPrefix, function(self, compressor){
        var e = self.expression;
        if (self.operator == "delete"
            && !(e instanceof AST_SymbolRef
                || e instanceof AST_PropAccess
                || is_identifier_atom(e))) {
            if (e instanceof AST_Sequence) {
                e = e.expressions.slice();
                e.push(make_node(AST_True, self));
                return make_sequence(self, e).optimize(compressor);
            }
            return make_sequence(self, [ e, make_node(AST_True, self) ]).optimize(compressor);
        }
        var seq = self.lift_sequences(compressor);
        if (seq !== self) {
            return seq;
        }
        if (compressor.option("side_effects") && self.operator == "void") {
            e = e.drop_side_effect_free(compressor);
            if (e) {
                self.expression = e;
                return self;
            } else {
                return make_node(AST_Undefined, self).optimize(compressor);
            }
        }
        if (compressor.in_boolean_context()) {
            switch (self.operator) {
              case "!":
                if (e instanceof AST_UnaryPrefix && e.operator == "!") {
                    // !!foo ==> foo, if we're in boolean context
                    return e.expression;
                }
                if (e instanceof AST_Binary) {
                    self = best_of(compressor, self, e.negate(compressor, first_in_statement(compressor)));
                }
                break;
              case "typeof":
                // typeof always returns a non-empty string, thus it's
                // always true in booleans
                compressor.warn("Boolean expression always true [{file}:{line},{col}]", self.start);
                return (e instanceof AST_SymbolRef ? make_node(AST_True, self) : make_sequence(self, [
                    e,
                    make_node(AST_True, self)
                ])).optimize(compressor);
            }
        }
        if (self.operator == "-" && e instanceof AST_Infinity) {
            e = e.transform(compressor);
        }
        if (e instanceof AST_Binary
            && (self.operator == "+" || self.operator == "-")
            && (e.operator == "*" || e.operator == "/" || e.operator == "%")) {
            return make_node(AST_Binary, self, {
                operator: e.operator,
                left: make_node(AST_UnaryPrefix, e.left, {
                    operator: self.operator,
                    expression: e.left
                }),
                right: e.right
            });
        }
        // avoids infinite recursion of numerals
        if (self.operator != "-"
            || !(e instanceof AST_Number || e instanceof AST_Infinity)) {
            var ev = self.evaluate(compressor);
            if (ev !== self) {
                ev = make_node_from_constant(ev, self).optimize(compressor);
                return best_of(compressor, ev, self);
            }
        }
        return self;
    });

    AST_Binary.DEFMETHOD("lift_sequences", function(compressor){
        if (compressor.option("sequences")) {
            if (this.left instanceof AST_Sequence) {
                var x = this.left.expressions.slice();
                var e = this.clone();
                e.left = x.pop();
                x.push(e);
                return make_sequence(this, x).optimize(compressor);
            }
            if (this.right instanceof AST_Sequence && !this.left.has_side_effects(compressor)) {
                var assign = this.operator == "=" && this.left instanceof AST_SymbolRef;
                var x = this.right.expressions;
                var last = x.length - 1;
                for (var i = 0; i < last; i++) {
                    if (!assign && x[i].has_side_effects(compressor)) break;
                }
                if (i == last) {
                    x = x.slice();
                    var e = this.clone();
                    e.right = x.pop();
                    x.push(e);
                    return make_sequence(this, x).optimize(compressor);
                } else if (i > 0) {
                    var e = this.clone();
                    e.right = make_sequence(this.right, x.slice(i));
                    x = x.slice(0, i);
                    x.push(e);
                    return make_sequence(this, x).optimize(compressor);
                }
            }
        }
        return this;
    });

    var commutativeOperators = makePredicate("== === != !== * & | ^");
    function is_object(node) {
        return node instanceof AST_Array
            || node instanceof AST_Lambda
            || node instanceof AST_Object;
    }

    OPT(AST_Binary, function(self, compressor){
        function reversible() {
            return self.left.is_constant()
                || self.right.is_constant()
                || !self.left.has_side_effects(compressor)
                    && !self.right.has_side_effects(compressor);
        }
        function reverse(op) {
            if (reversible()) {
                if (op) self.operator = op;
                var tmp = self.left;
                self.left = self.right;
                self.right = tmp;
            }
        }
        if (commutativeOperators(self.operator)) {
            if (self.right.is_constant()
                && !self.left.is_constant()) {
                // if right is a constant, whatever side effects the
                // left side might have could not influence the
                // result.  hence, force switch.

                if (!(self.left instanceof AST_Binary
                      && PRECEDENCE[self.left.operator] >= PRECEDENCE[self.operator])) {
                    reverse();
                }
            }
        }
        self = self.lift_sequences(compressor);
        if (compressor.option("comparisons")) switch (self.operator) {
          case "===":
          case "!==":
            var is_strict_comparison = true;
            if ((self.left.is_string(compressor) && self.right.is_string(compressor)) ||
                (self.left.is_number(compressor) && self.right.is_number(compressor)) ||
                (self.left.is_boolean() && self.right.is_boolean()) ||
                self.left.equivalent_to(self.right)) {
                self.operator = self.operator.substr(0, 2);
            }
            // XXX: intentionally falling down to the next case
          case "==":
          case "!=":
            // void 0 == x => null == x
            if (!is_strict_comparison && is_undefined(self.left, compressor)) {
                self.left = make_node(AST_Null, self.left);
            }
            // "undefined" == typeof x => undefined === x
            else if (compressor.option("typeofs")
                && self.left instanceof AST_String
                && self.left.value == "undefined"
                && self.right instanceof AST_UnaryPrefix
                && self.right.operator == "typeof") {
                var expr = self.right.expression;
                if (expr instanceof AST_SymbolRef ? expr.is_declared(compressor)
                    : !(expr instanceof AST_PropAccess && compressor.option("ie8"))) {
                    self.right = expr;
                    self.left = make_node(AST_Undefined, self.left).optimize(compressor);
                    if (self.operator.length == 2) self.operator += "=";
                }
            }
            // obj !== obj => false
            else if (self.left instanceof AST_SymbolRef
                && self.right instanceof AST_SymbolRef
                && self.left.definition() === self.right.definition()
                && is_object(self.left.fixed_value())) {
                return make_node(self.operator[0] == "=" ? AST_True : AST_False, self);
            }
            break;
          case "&&":
          case "||":
            var lhs = self.left;
            if (lhs.operator == self.operator) {
                lhs = lhs.right;
            }
            if (lhs instanceof AST_Binary
                && lhs.operator == (self.operator == "&&" ? "!==" : "===")
                && self.right instanceof AST_Binary
                && lhs.operator == self.right.operator
                && (is_undefined(lhs.left, compressor) && self.right.left instanceof AST_Null
                    || lhs.left instanceof AST_Null && is_undefined(self.right.left, compressor))
                && !lhs.right.has_side_effects(compressor)
                && lhs.right.equivalent_to(self.right.right)) {
                var combined = make_node(AST_Binary, self, {
                    operator: lhs.operator.slice(0, -1),
                    left: make_node(AST_Null, self),
                    right: lhs.right
                });
                if (lhs !== self.left) {
                    combined = make_node(AST_Binary, self, {
                        operator: self.operator,
                        left: self.left.left,
                        right: combined
                    });
                }
                return combined;
            }
            break;
        }
        if (self.operator == "+" && compressor.in_boolean_context()) {
            var ll = self.left.evaluate(compressor);
            var rr = self.right.evaluate(compressor);
            if (ll && typeof ll == "string") {
                compressor.warn("+ in boolean context always true [{file}:{line},{col}]", self.start);
                return make_sequence(self, [
                    self.right,
                    make_node(AST_True, self)
                ]).optimize(compressor);
            }
            if (rr && typeof rr == "string") {
                compressor.warn("+ in boolean context always true [{file}:{line},{col}]", self.start);
                return make_sequence(self, [
                    self.left,
                    make_node(AST_True, self)
                ]).optimize(compressor);
            }
        }
        if (compressor.option("comparisons") && self.is_boolean()) {
            if (!(compressor.parent() instanceof AST_Binary)
                || compressor.parent() instanceof AST_Assign) {
                var negated = make_node(AST_UnaryPrefix, self, {
                    operator: "!",
                    expression: self.negate(compressor, first_in_statement(compressor))
                });
                self = best_of(compressor, self, negated);
            }
            switch (self.operator) {
              case ">": reverse("<"); break;
              case ">=": reverse("<="); break;
            }
        }
        if (self.operator == "+") {
            if (self.right instanceof AST_String
                && self.right.getValue() == ""
                && self.left.is_string(compressor)) {
                return self.left;
            }
            if (self.left instanceof AST_String
                && self.left.getValue() == ""
                && self.right.is_string(compressor)) {
                return self.right;
            }
            if (self.left instanceof AST_Binary
                && self.left.operator == "+"
                && self.left.left instanceof AST_String
                && self.left.left.getValue() == ""
                && self.right.is_string(compressor)) {
                self.left = self.left.right;
                return self.transform(compressor);
            }
        }
        if (compressor.option("evaluate")) {
            switch (self.operator) {
              case "&&":
                var ll = self.left.truthy ? true : self.left.falsy ? false : self.left.evaluate(compressor);
                if (!ll) {
                    compressor.warn("Condition left of && always false [{file}:{line},{col}]", self.start);
                    return maintain_this_binding(compressor.parent(), compressor.self(), self.left).optimize(compressor);
                } else if (!(ll instanceof AST_Node)) {
                    compressor.warn("Condition left of && always true [{file}:{line},{col}]", self.start);
                    return make_sequence(self, [ self.left, self.right ]).optimize(compressor);
                }
                var rr = self.right.evaluate(compressor);
                if (!rr) {
                    if (compressor.in_boolean_context()) {
                        compressor.warn("Boolean && always false [{file}:{line},{col}]", self.start);
                        return make_sequence(self, [
                            self.left,
                            make_node(AST_False, self)
                        ]).optimize(compressor);
                    } else self.falsy = true;
                } else if (!(rr instanceof AST_Node)) {
                    var parent = compressor.parent();
                    if (parent.operator == "&&" && parent.left === compressor.self() || compressor.in_boolean_context()) {
                        compressor.warn("Dropping side-effect-free && [{file}:{line},{col}]", self.start);
                        return self.left.optimize(compressor);
                    }
                }
                // x || false && y ---> x ? y : false
                if (self.left.operator == "||") {
                    var lr = self.left.right.evaluate(compressor);
                    if (!lr) return make_node(AST_Conditional, self, {
                        condition: self.left.left,
                        consequent: self.right,
                        alternative: self.left.right
                    }).optimize(compressor);
                }
                break;
              case "||":
                var ll = self.left.truthy ? true : self.left.falsy ? false : self.left.evaluate(compressor);
                if (!ll) {
                    compressor.warn("Condition left of || always false [{file}:{line},{col}]", self.start);
                    return make_sequence(self, [ self.left, self.right ]).optimize(compressor);
                } else if (!(ll instanceof AST_Node)) {
                    compressor.warn("Condition left of || always true [{file}:{line},{col}]", self.start);
                    return maintain_this_binding(compressor.parent(), compressor.self(), self.left).optimize(compressor);
                }
                var rr = self.right.evaluate(compressor);
                if (!rr) {
                    var parent = compressor.parent();
                    if (parent.operator == "||" && parent.left === compressor.self() || compressor.in_boolean_context()) {
                        compressor.warn("Dropping side-effect-free || [{file}:{line},{col}]", self.start);
                        return self.left.optimize(compressor);
                    }
                } else if (!(rr instanceof AST_Node)) {
                    if (compressor.in_boolean_context()) {
                        compressor.warn("Boolean || always true [{file}:{line},{col}]", self.start);
                        return make_sequence(self, [
                            self.left,
                            make_node(AST_True, self)
                        ]).optimize(compressor);
                    } else self.truthy = true;
                }
                if (self.left.operator == "&&") {
                    var lr = self.left.right.evaluate(compressor);
                    if (lr && !(lr instanceof AST_Node)) return make_node(AST_Conditional, self, {
                        condition: self.left.left,
                        consequent: self.left.right,
                        alternative: self.right
                    }).optimize(compressor);
                }
                break;
            }
            var associative = true;
            switch (self.operator) {
              case "+":
                // "foo" + ("bar" + x) => "foobar" + x
                if (self.left instanceof AST_Constant
                    && self.right instanceof AST_Binary
                    && self.right.operator == "+"
                    && self.right.left instanceof AST_Constant
                    && self.right.is_string(compressor)) {
                    self = make_node(AST_Binary, self, {
                        operator: "+",
                        left: make_node(AST_String, self.left, {
                            value: "" + self.left.getValue() + self.right.left.getValue(),
                            start: self.left.start,
                            end: self.right.left.end
                        }),
                        right: self.right.right
                    });
                }
                // (x + "foo") + "bar" => x + "foobar"
                if (self.right instanceof AST_Constant
                    && self.left instanceof AST_Binary
                    && self.left.operator == "+"
                    && self.left.right instanceof AST_Constant
                    && self.left.is_string(compressor)) {
                    self = make_node(AST_Binary, self, {
                        operator: "+",
                        left: self.left.left,
                        right: make_node(AST_String, self.right, {
                            value: "" + self.left.right.getValue() + self.right.getValue(),
                            start: self.left.right.start,
                            end: self.right.end
                        })
                    });
                }
                // (x + "foo") + ("bar" + y) => (x + "foobar") + y
                if (self.left instanceof AST_Binary
                    && self.left.operator == "+"
                    && self.left.is_string(compressor)
                    && self.left.right instanceof AST_Constant
                    && self.right instanceof AST_Binary
                    && self.right.operator == "+"
                    && self.right.left instanceof AST_Constant
                    && self.right.is_string(compressor)) {
                    self = make_node(AST_Binary, self, {
                        operator: "+",
                        left: make_node(AST_Binary, self.left, {
                            operator: "+",
                            left: self.left.left,
                            right: make_node(AST_String, self.left.right, {
                                value: "" + self.left.right.getValue() + self.right.left.getValue(),
                                start: self.left.right.start,
                                end: self.right.left.end
                            })
                        }),
                        right: self.right.right
                    });
                }
                // a + -b => a - b
                if (self.right instanceof AST_UnaryPrefix
                    && self.right.operator == "-"
                    && self.left.is_number(compressor)) {
                    self = make_node(AST_Binary, self, {
                        operator: "-",
                        left: self.left,
                        right: self.right.expression
                    });
                    break;
                }
                // -a + b => b - a
                if (self.left instanceof AST_UnaryPrefix
                    && self.left.operator == "-"
                    && reversible()
                    && self.right.is_number(compressor)) {
                    self = make_node(AST_Binary, self, {
                        operator: "-",
                        left: self.right,
                        right: self.left.expression
                    });
                    break;
                }
              case "*":
                associative = compressor.option("unsafe_math");
              case "&":
              case "|":
              case "^":
                // a + +b => +b + a
                if (self.left.is_number(compressor)
                    && self.right.is_number(compressor)
                    && reversible()
                    && !(self.left instanceof AST_Binary
                        && self.left.operator != self.operator
                        && PRECEDENCE[self.left.operator] >= PRECEDENCE[self.operator])) {
                    var reversed = make_node(AST_Binary, self, {
                        operator: self.operator,
                        left: self.right,
                        right: self.left
                    });
                    if (self.right instanceof AST_Constant
                        && !(self.left instanceof AST_Constant)) {
                        self = best_of(compressor, reversed, self);
                    } else {
                        self = best_of(compressor, self, reversed);
                    }
                }
                if (associative && self.is_number(compressor)) {
                    // a + (b + c) => (a + b) + c
                    if (self.right instanceof AST_Binary
                        && self.right.operator == self.operator) {
                        self = make_node(AST_Binary, self, {
                            operator: self.operator,
                            left: make_node(AST_Binary, self.left, {
                                operator: self.operator,
                                left: self.left,
                                right: self.right.left,
                                start: self.left.start,
                                end: self.right.left.end
                            }),
                            right: self.right.right
                        });
                    }
                    // (n + 2) + 3 => 5 + n
                    // (2 * n) * 3 => 6 + n
                    if (self.right instanceof AST_Constant
                        && self.left instanceof AST_Binary
                        && self.left.operator == self.operator) {
                        if (self.left.left instanceof AST_Constant) {
                            self = make_node(AST_Binary, self, {
                                operator: self.operator,
                                left: make_node(AST_Binary, self.left, {
                                    operator: self.operator,
                                    left: self.left.left,
                                    right: self.right,
                                    start: self.left.left.start,
                                    end: self.right.end
                                }),
                                right: self.left.right
                            });
                        } else if (self.left.right instanceof AST_Constant) {
                            self = make_node(AST_Binary, self, {
                                operator: self.operator,
                                left: make_node(AST_Binary, self.left, {
                                    operator: self.operator,
                                    left: self.left.right,
                                    right: self.right,
                                    start: self.left.right.start,
                                    end: self.right.end
                                }),
                                right: self.left.left
                            });
                        }
                    }
                    // (a | 1) | (2 | d) => (3 | a) | b
                    if (self.left instanceof AST_Binary
                        && self.left.operator == self.operator
                        && self.left.right instanceof AST_Constant
                        && self.right instanceof AST_Binary
                        && self.right.operator == self.operator
                        && self.right.left instanceof AST_Constant) {
                        self = make_node(AST_Binary, self, {
                            operator: self.operator,
                            left: make_node(AST_Binary, self.left, {
                                operator: self.operator,
                                left: make_node(AST_Binary, self.left.left, {
                                    operator: self.operator,
                                    left: self.left.right,
                                    right: self.right.left,
                                    start: self.left.right.start,
                                    end: self.right.left.end
                                }),
                                right: self.left.left
                            }),
                            right: self.right.right
                        });
                    }
                }
            }
        }
        // x && (y && z)  ==>  x && y && z
        // x || (y || z)  ==>  x || y || z
        // x + ("y" + z)  ==>  x + "y" + z
        // "x" + (y + "z")==>  "x" + y + "z"
        if (self.right instanceof AST_Binary
            && self.right.operator == self.operator
            && (lazy_op(self.operator)
                || (self.operator == "+"
                    && (self.right.left.is_string(compressor)
                        || (self.left.is_string(compressor)
                            && self.right.right.is_string(compressor))))))
        {
            self.left = make_node(AST_Binary, self.left, {
                operator : self.operator,
                left     : self.left,
                right    : self.right.left
            });
            self.right = self.right.right;
            return self.transform(compressor);
        }
        var ev = self.evaluate(compressor);
        if (ev !== self) {
            ev = make_node_from_constant(ev, self).optimize(compressor);
            return best_of(compressor, ev, self);
        }
        return self;
    });

    function recursive_ref(compressor, def) {
        var node;
        for (var i = 0; node = compressor.parent(i); i++) {
            if (node instanceof AST_Lambda) {
                var name = node.name;
                if (name && name.definition() === def) break;
            }
        }
        return node;
    }

    OPT(AST_SymbolRef, function(self, compressor){
        var def = self.resolve_defines(compressor);
        if (def) {
            return def.optimize(compressor);
        }
        // testing against !self.scope.uses_with first is an optimization
        if (!compressor.option("ie8")
            && is_undeclared_ref(self)
            && (!self.scope.uses_with || !compressor.find_parent(AST_With))) {
            switch (self.name) {
              case "undefined":
                return make_node(AST_Undefined, self).optimize(compressor);
              case "NaN":
                return make_node(AST_NaN, self).optimize(compressor);
              case "Infinity":
                return make_node(AST_Infinity, self).optimize(compressor);
            }
        }
        if (compressor.option("reduce_vars")
            && is_lhs(self, compressor.parent()) !== self) {
            var d = self.definition();
            var fixed = self.fixed_value();
            var single_use = d.single_use;
            if (single_use && fixed instanceof AST_Lambda) {
                if (d.scope !== self.scope
                    && (!compressor.option("reduce_funcs")
                        || d.escaped == 1
                        || fixed.inlined)) {
                    single_use = false;
                } else if (recursive_ref(compressor, d)) {
                    single_use = false;
                } else if (d.scope !== self.scope || d.orig[0] instanceof AST_SymbolFunarg) {
                    single_use = fixed.is_constant_expression(self.scope);
                    if (single_use == "f") {
                        var scope = self.scope;
                        do {
                            if (scope instanceof AST_Defun || scope instanceof AST_Function) {
                                scope.inlined = true;
                            }
                        } while (scope = scope.parent_scope);
                    }
                }
            }
            if (single_use && fixed) {
                if (fixed instanceof AST_Defun) {
                    fixed._squeezed = true;
                    fixed = make_node(AST_Function, fixed, fixed);
                }
                var value;
                if (d.recursive_refs > 0 && fixed.name instanceof AST_SymbolDefun) {
                    value = fixed.clone(true);
                    var defun_def = value.name.definition();
                    var lambda_def = value.variables.get(value.name.name);
                    var name = lambda_def && lambda_def.orig[0];
                    if (!(name instanceof AST_SymbolLambda)) {
                        name = make_node(AST_SymbolLambda, value.name, value.name);
                        name.scope = value;
                        value.name = name;
                        lambda_def = value.def_function(name);
                    }
                    value.walk(new TreeWalker(function(node) {
                        if (node instanceof AST_SymbolRef && node.definition() === defun_def) {
                            node.thedef = lambda_def;
                            lambda_def.references.push(node);
                        }
                    }));
                } else {
                    value = fixed.optimize(compressor);
                    if (value === fixed) value = fixed.clone(true);
                }
                return value;
            }
            if (fixed && d.should_replace === undefined) {
                var init;
                if (fixed instanceof AST_This) {
                    if (!(d.orig[0] instanceof AST_SymbolFunarg)
                        && all(d.references, function(ref) {
                            return d.scope === ref.scope;
                        })) {
                        init = fixed;
                    }
                } else {
                    var ev = fixed.evaluate(compressor);
                    if (ev !== fixed && (compressor.option("unsafe_regexp") || !(ev instanceof RegExp))) {
                        init = make_node_from_constant(ev, fixed);
                    }
                }
                if (init) {
                    var value_length = init.optimize(compressor).print_to_string().length;
                    var fn;
                    if (has_symbol_ref(fixed)) {
                        fn = function() {
                            var result = init.optimize(compressor);
                            return result === init ? result.clone(true) : result;
                        };
                    } else {
                        value_length = Math.min(value_length, fixed.print_to_string().length);
                        fn = function() {
                            var result = best_of_expression(init.optimize(compressor), fixed);
                            return result === init || result === fixed ? result.clone(true) : result;
                        };
                    }
                    var name_length = d.name.length;
                    var overhead = 0;
                    if (compressor.option("unused") && !compressor.exposed(d)) {
                        overhead = (name_length + 2 + value_length) / (d.references.length - d.assignments);
                    }
                    d.should_replace = value_length <= name_length + overhead ? fn : false;
                } else {
                    d.should_replace = false;
                }
            }
            if (d.should_replace) {
                return d.should_replace();
            }
        }
        return self;

        function has_symbol_ref(value) {
            var found;
            value.walk(new TreeWalker(function(node) {
                if (node instanceof AST_SymbolRef) found = true;
                if (found) return true;
            }));
            return found;
        }
    });

    function is_atomic(lhs, self) {
        return lhs instanceof AST_SymbolRef || lhs.TYPE === self.TYPE;
    }

    OPT(AST_Undefined, function(self, compressor){
        if (compressor.option("unsafe_undefined")) {
            var undef = find_variable(compressor, "undefined");
            if (undef) {
                var ref = make_node(AST_SymbolRef, self, {
                    name   : "undefined",
                    scope  : undef.scope,
                    thedef : undef
                });
                ref.is_undefined = true;
                return ref;
            }
        }
        var lhs = is_lhs(compressor.self(), compressor.parent());
        if (lhs && is_atomic(lhs, self)) return self;
        return make_node(AST_UnaryPrefix, self, {
            operator: "void",
            expression: make_node(AST_Number, self, {
                value: 0
            })
        });
    });

    OPT(AST_Infinity, function(self, compressor){
        var lhs = is_lhs(compressor.self(), compressor.parent());
        if (lhs && is_atomic(lhs, self)) return self;
        if (compressor.option("keep_infinity")
            && !(lhs && !is_atomic(lhs, self))
            && !find_variable(compressor, "Infinity"))
            return self;
        return make_node(AST_Binary, self, {
            operator: "/",
            left: make_node(AST_Number, self, {
                value: 1
            }),
            right: make_node(AST_Number, self, {
                value: 0
            })
        });
    });

    OPT(AST_NaN, function(self, compressor){
        var lhs = is_lhs(compressor.self(), compressor.parent());
        if (lhs && !is_atomic(lhs, self)
            || find_variable(compressor, "NaN")) {
            return make_node(AST_Binary, self, {
                operator: "/",
                left: make_node(AST_Number, self, {
                    value: 0
                }),
                right: make_node(AST_Number, self, {
                    value: 0
                })
            });
        }
        return self;
    });

    function is_reachable(self, defs) {
        var reachable = false;
        var find_ref = new TreeWalker(function(node) {
            if (reachable) return true;
            if (node instanceof AST_SymbolRef && member(node.definition(), defs)) {
                return reachable = true;
            }
        });
        var scan_scope = new TreeWalker(function(node) {
            if (reachable) return true;
            if (node instanceof AST_Scope && node !== self) {
                var parent = scan_scope.parent();
                if (parent instanceof AST_Call && parent.expression === node) return;
                node.walk(find_ref);
                return true;
            }
        });
        self.walk(scan_scope);
        return reachable;
    }

    var ASSIGN_OPS = [ '+', '-', '/', '*', '%', '>>', '<<', '>>>', '|', '^', '&' ];
    var ASSIGN_OPS_COMMUTATIVE = [ '*', '|', '^', '&' ];
    OPT(AST_Assign, function(self, compressor){
        var def;
        if (compressor.option("dead_code")
            && self.left instanceof AST_SymbolRef
            && (def = self.left.definition()).scope === compressor.find_parent(AST_Lambda)) {
            var level = 0, node, parent = self;
            do {
                node = parent;
                parent = compressor.parent(level++);
                if (parent instanceof AST_Exit) {
                    if (in_try(level, parent)) break;
                    if (is_reachable(def.scope, [ def ])) break;
                    if (self.operator == "=") return self.right;
                    def.fixed = false;
                    return make_node(AST_Binary, self, {
                        operator: self.operator.slice(0, -1),
                        left: self.left,
                        right: self.right
                    }).optimize(compressor);
                }
            } while (parent instanceof AST_Binary && parent.right === node
                || parent instanceof AST_Sequence && parent.tail_node() === node);
        }
        self = self.lift_sequences(compressor);
        if (self.operator == "=" && self.left instanceof AST_SymbolRef && self.right instanceof AST_Binary) {
            // x = expr1 OP expr2
            if (self.right.left instanceof AST_SymbolRef
                && self.right.left.name == self.left.name
                && member(self.right.operator, ASSIGN_OPS)) {
                // x = x - 2  --->  x -= 2
                self.operator = self.right.operator + "=";
                self.right = self.right.right;
            }
            else if (self.right.right instanceof AST_SymbolRef
                && self.right.right.name == self.left.name
                && member(self.right.operator, ASSIGN_OPS_COMMUTATIVE)
                && !self.right.left.has_side_effects(compressor)) {
                // x = 2 & x  --->  x &= 2
                self.operator = self.right.operator + "=";
                self.right = self.right.left;
            }
        }
        return self;

        function in_try(level, node) {
            var right = self.right;
            self.right = make_node(AST_Null, right);
            var may_throw = node.may_throw(compressor);
            self.right = right;
            var scope = self.left.definition().scope;
            var parent;
            while ((parent = compressor.parent(level++)) !== scope) {
                if (parent instanceof AST_Try) {
                    if (parent.bfinally) return true;
                    if (may_throw && parent.bcatch) return true;
                }
            }
        }
    });

    OPT(AST_Conditional, function(self, compressor){
        if (!compressor.option("conditionals")) return self;
        // This looks like lift_sequences(), should probably be under "sequences"
        if (self.condition instanceof AST_Sequence) {
            var expressions = self.condition.expressions.slice();
            self.condition = expressions.pop();
            expressions.push(self);
            return make_sequence(self, expressions);
        }
        var cond = self.condition.evaluate(compressor);
        if (cond !== self.condition) {
            if (cond) {
                compressor.warn("Condition always true [{file}:{line},{col}]", self.start);
                return maintain_this_binding(compressor.parent(), compressor.self(), self.consequent);
            } else {
                compressor.warn("Condition always false [{file}:{line},{col}]", self.start);
                return maintain_this_binding(compressor.parent(), compressor.self(), self.alternative);
            }
        }
        var negated = cond.negate(compressor, first_in_statement(compressor));
        if (best_of(compressor, cond, negated) === negated) {
            self = make_node(AST_Conditional, self, {
                condition: negated,
                consequent: self.alternative,
                alternative: self.consequent
            });
        }
        var condition = self.condition;
        var consequent = self.consequent;
        var alternative = self.alternative;
        // x?x:y --> x||y
        if (condition instanceof AST_SymbolRef
            && consequent instanceof AST_SymbolRef
            && condition.definition() === consequent.definition()) {
            return make_node(AST_Binary, self, {
                operator: "||",
                left: condition,
                right: alternative
            });
        }
        // if (foo) exp = something; else exp = something_else;
        //                   |
        //                   v
        // exp = foo ? something : something_else;
        if (consequent instanceof AST_Assign
            && alternative instanceof AST_Assign
            && consequent.operator == alternative.operator
            && consequent.left.equivalent_to(alternative.left)
            && (!self.condition.has_side_effects(compressor)
                || consequent.operator == "="
                    && !consequent.left.has_side_effects(compressor))) {
            return make_node(AST_Assign, self, {
                operator: consequent.operator,
                left: consequent.left,
                right: make_node(AST_Conditional, self, {
                    condition: self.condition,
                    consequent: consequent.right,
                    alternative: alternative.right
                })
            });
        }
        // x ? y(a) : y(b) --> y(x ? a : b)
        var arg_index;
        if (consequent instanceof AST_Call
            && alternative.TYPE === consequent.TYPE
            && consequent.args.length > 0
            && consequent.args.length == alternative.args.length
            && consequent.expression.equivalent_to(alternative.expression)
            && !self.condition.has_side_effects(compressor)
            && !consequent.expression.has_side_effects(compressor)
            && typeof (arg_index = single_arg_diff()) == "number") {
            var node = consequent.clone();
            node.args[arg_index] = make_node(AST_Conditional, self, {
                condition: self.condition,
                consequent: consequent.args[arg_index],
                alternative: alternative.args[arg_index]
            });
            return node;
        }
        // x?y?z:a:a --> x&&y?z:a
        if (consequent instanceof AST_Conditional
            && consequent.alternative.equivalent_to(alternative)) {
            return make_node(AST_Conditional, self, {
                condition: make_node(AST_Binary, self, {
                    left: self.condition,
                    operator: "&&",
                    right: consequent.condition
                }),
                consequent: consequent.consequent,
                alternative: alternative
            });
        }
        // x ? y : y --> x, y
        if (consequent.equivalent_to(alternative)) {
            return make_sequence(self, [
                self.condition,
                consequent
            ]).optimize(compressor);
        }
        // x ? (y, w) : (z, w) --> x ? y : z, w
        if ((consequent instanceof AST_Sequence || alternative instanceof AST_Sequence)
            && consequent.tail_node().equivalent_to(alternative.tail_node())) {
            return make_sequence(self, [
                make_node(AST_Conditional, self, {
                    condition: self.condition,
                    consequent: pop_seq(consequent),
                    alternative: pop_seq(alternative)
                }),
                consequent.tail_node()
            ]).optimize(compressor);
        }
        // x ? y || z : z --> x && y || z
        if (consequent instanceof AST_Binary
            && consequent.operator == "||"
            && consequent.right.equivalent_to(alternative)) {
            return make_node(AST_Binary, self, {
                operator: "||",
                left: make_node(AST_Binary, self, {
                    operator: "&&",
                    left: self.condition,
                    right: consequent.left
                }),
                right: alternative
            }).optimize(compressor);
        }
        var in_bool = compressor.in_boolean_context();
        if (is_true(self.consequent)) {
            if (is_false(self.alternative)) {
                // c ? true : false ---> !!c
                return booleanize(self.condition);
            }
            // c ? true : x ---> !!c || x
            return make_node(AST_Binary, self, {
                operator: "||",
                left: booleanize(self.condition),
                right: self.alternative
            });
        }
        if (is_false(self.consequent)) {
            if (is_true(self.alternative)) {
                // c ? false : true ---> !c
                return booleanize(self.condition.negate(compressor));
            }
            // c ? false : x ---> !c && x
            return make_node(AST_Binary, self, {
                operator: "&&",
                left: booleanize(self.condition.negate(compressor)),
                right: self.alternative
            });
        }
        if (is_true(self.alternative)) {
            // c ? x : true ---> !c || x
            return make_node(AST_Binary, self, {
                operator: "||",
                left: booleanize(self.condition.negate(compressor)),
                right: self.consequent
            });
        }
        if (is_false(self.alternative)) {
            // c ? x : false ---> !!c && x
            return make_node(AST_Binary, self, {
                operator: "&&",
                left: booleanize(self.condition),
                right: self.consequent
            });
        }

        return self;

        function booleanize(node) {
            if (node.is_boolean()) return node;
            // !!expression
            return make_node(AST_UnaryPrefix, node, {
                operator: "!",
                expression: node.negate(compressor)
            });
        }

        // AST_True or !0
        function is_true(node) {
            return node instanceof AST_True
                || in_bool
                    && node instanceof AST_Constant
                    && node.getValue()
                || (node instanceof AST_UnaryPrefix
                    && node.operator == "!"
                    && node.expression instanceof AST_Constant
                    && !node.expression.getValue());
        }
        // AST_False or !1
        function is_false(node) {
            return node instanceof AST_False
                || in_bool
                    && node instanceof AST_Constant
                    && !node.getValue()
                || (node instanceof AST_UnaryPrefix
                    && node.operator == "!"
                    && node.expression instanceof AST_Constant
                    && node.expression.getValue());
        }

        function single_arg_diff() {
            var a = consequent.args;
            var b = alternative.args;
            for (var i = 0, len = a.length; i < len; i++) {
                if (!a[i].equivalent_to(b[i])) {
                    for (var j = i + 1; j < len; j++) {
                        if (!a[j].equivalent_to(b[j])) return;
                    }
                    return i;
                }
            }
        }

        function pop_seq(node) {
            if (!(node instanceof AST_Sequence)) return make_node(AST_Number, node, {
                value: 0
            });
            return make_sequence(node, node.expressions.slice(0, -1));
        }
    });

    OPT(AST_Boolean, function(self, compressor){
        if (compressor.in_boolean_context()) return make_node(AST_Number, self, {
            value: +self.value
        });
        if (compressor.option("booleans")) {
            var p = compressor.parent();
            if (p instanceof AST_Binary && (p.operator == "=="
                                            || p.operator == "!=")) {
                compressor.warn("Non-strict equality against boolean: {operator} {value} [{file}:{line},{col}]", {
                    operator : p.operator,
                    value    : self.value,
                    file     : p.start.file,
                    line     : p.start.line,
                    col      : p.start.col,
                });
                return make_node(AST_Number, self, {
                    value: +self.value
                });
            }
            return make_node(AST_UnaryPrefix, self, {
                operator: "!",
                expression: make_node(AST_Number, self, {
                    value: 1 - self.value
                })
            });
        }
        return self;
    });

    OPT(AST_Sub, function(self, compressor){
        var expr = self.expression;
        var prop = self.property;
        if (compressor.option("properties")) {
            var key = prop.evaluate(compressor);
            if (key !== prop) {
                if (typeof key == "string") {
                    if (key == "undefined") {
                        key = undefined;
                    } else {
                        var value = parseFloat(key);
                        if (value.toString() == key) {
                            key = value;
                        }
                    }
                }
                prop = self.property = best_of_expression(prop, make_node_from_constant(key, prop).transform(compressor));
                var property = "" + key;
                if (is_identifier_string(property)
                    && property.length <= prop.print_to_string().length + 1) {
                    return make_node(AST_Dot, self, {
                        expression: expr,
                        property: property
                    }).optimize(compressor);
                }
            }
        }
        if (is_lhs(self, compressor.parent())) return self;
        if (key !== prop) {
            var sub = self.flatten_object(property, compressor);
            if (sub) {
                expr = self.expression = sub.expression;
                prop = self.property = sub.property;
            }
        }
        if (compressor.option("properties") && compressor.option("side_effects")
            && prop instanceof AST_Number && expr instanceof AST_Array) {
            var index = prop.getValue();
            var elements = expr.elements;
            if (index in elements) {
                var flatten = true;
                var values = [];
                for (var i = elements.length; --i > index;) {
                    var value = elements[i].drop_side_effect_free(compressor);
                    if (value) {
                        values.unshift(value);
                        if (flatten && value.has_side_effects(compressor)) flatten = false;
                    }
                }
                var retValue = elements[index];
                retValue = retValue instanceof AST_Hole ? make_node(AST_Undefined, retValue) : retValue;
                if (!flatten) values.unshift(retValue);
                while (--i >= 0) {
                    var value = elements[i].drop_side_effect_free(compressor);
                    if (value) values.unshift(value);
                    else index--;
                }
                if (flatten) {
                    values.push(retValue);
                    return make_sequence(self, values).optimize(compressor);
                } else return make_node(AST_Sub, self, {
                    expression: make_node(AST_Array, expr, {
                        elements: values
                    }),
                    property: make_node(AST_Number, prop, {
                        value: index
                    })
                });
            }
        }
        var fn;
        if (compressor.option("arguments")
            && expr instanceof AST_SymbolRef
            && expr.name == "arguments"
            && expr.definition().orig.length == 1
            && (fn = expr.scope) instanceof AST_Lambda
            && prop instanceof AST_Number) {
            var index = prop.getValue();
            var argname = fn.argnames[index];
            if (!argname && !compressor.option("keep_fargs")) {
                while (index >= fn.argnames.length) {
                    argname = make_node(AST_SymbolFunarg, fn, {
                        name: fn.make_var_name("argument_" + fn.argnames.length),
                        scope: fn
                    });
                    fn.argnames.push(argname);
                    fn.enclosed.push(fn.def_variable(argname));
                }
            }
            if (argname) {
                var sym = make_node(AST_SymbolRef, self, argname);
                sym.reference({});
                return sym;
            }
        }
        var ev = self.evaluate(compressor);
        if (ev !== self) {
            ev = make_node_from_constant(ev, self).optimize(compressor);
            return best_of(compressor, ev, self);
        }
        return self;
    });

    AST_Lambda.DEFMETHOD("contains_this", function() {
        var result;
        var self = this;
        self.walk(new TreeWalker(function(node) {
            if (result) return true;
            if (node instanceof AST_This) return result = true;
            if (node !== self && node instanceof AST_Scope) return true;
        }));
        return result;
    });

    AST_PropAccess.DEFMETHOD("flatten_object", function(key, compressor) {
        if (!compressor.option("properties")) return;
        var expr = this.expression;
        if (expr instanceof AST_Object) {
            var props = expr.properties;
            for (var i = props.length; --i >= 0;) {
                var prop = props[i];
                if ("" + prop.key == key) {
                    if (!all(props, function(prop) {
                        return prop instanceof AST_ObjectKeyVal;
                    })) break;
                    var value = prop.value;
                    if (value instanceof AST_Function
                        && !(compressor.parent() instanceof AST_New)
                        && value.contains_this()) break;
                    return make_node(AST_Sub, this, {
                        expression: make_node(AST_Array, expr, {
                            elements: props.map(function(prop) {
                                return prop.value;
                            })
                        }),
                        property: make_node(AST_Number, this, {
                            value: i
                        })
                    });
                }
            }
        }
    });

    OPT(AST_Dot, function(self, compressor){
        if (self.property == "arguments" || self.property == "caller") {
            compressor.warn("Function.protoype.{prop} not supported [{file}:{line},{col}]", {
                prop: self.property,
                file: self.start.file,
                line: self.start.line,
                col: self.start.col
            });
        }
        var def = self.resolve_defines(compressor);
        if (def) {
            return def.optimize(compressor);
        }
        if (is_lhs(self, compressor.parent())) return self;
        if (compressor.option("unsafe_proto")
            && self.expression instanceof AST_Dot
            && self.expression.property == "prototype") {
            var exp = self.expression.expression;
            if (is_undeclared_ref(exp)) switch (exp.name) {
              case "Array":
                self.expression = make_node(AST_Array, self.expression, {
                    elements: []
                });
                break;
              case "Function":
                self.expression = make_node(AST_Function, self.expression, {
                    argnames: [],
                    body: []
                });
                break;
              case "Number":
                self.expression = make_node(AST_Number, self.expression, {
                    value: 0
                });
                break;
              case "Object":
                self.expression = make_node(AST_Object, self.expression, {
                    properties: []
                });
                break;
              case "RegExp":
                self.expression = make_node(AST_RegExp, self.expression, {
                    value: /t/
                });
                break;
              case "String":
                self.expression = make_node(AST_String, self.expression, {
                    value: ""
                });
                break;
            }
        }
        var sub = self.flatten_object(self.property, compressor);
        if (sub) return sub.optimize(compressor);
        var ev = self.evaluate(compressor);
        if (ev !== self) {
            ev = make_node_from_constant(ev, self).optimize(compressor);
            return best_of(compressor, ev, self);
        }
        return self;
    });

    function literals_in_boolean_context(self, compressor) {
        if (compressor.in_boolean_context()) {
            return best_of(compressor, self, make_sequence(self, [
                self,
                make_node(AST_True, self)
            ]).optimize(compressor));
        }
        return self;
    };
    OPT(AST_Array, literals_in_boolean_context);
    OPT(AST_Object, literals_in_boolean_context);
    OPT(AST_RegExp, literals_in_boolean_context);

    OPT(AST_Return, function(self, compressor){
        if (self.value && is_undefined(self.value, compressor)) {
            self.value = null;
        }
        return self;
    });

    OPT(AST_VarDef, function(self, compressor){
        var defines = compressor.option("global_defs");
        if (defines && HOP(defines, self.name.name)) {
            compressor.warn('global_defs ' + self.name.name + ' redefined [{file}:{line},{col}]', self.start);
        }
        return self;
    });

})();
