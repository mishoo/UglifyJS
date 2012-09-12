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

// The layout of the compressor follows the code generator (see
// output.js).  Basically each node will have a "squeeze" method
// that will apply all known compression rules for that node, and
// return a new node (or the original node if there was no
// compression).  We can't quite use the TreeWalker for this
// because it's too simplistic.

// The Compressor object is for storing the options and for
// maintaining various internal state that might be useful for
// squeezing nodes.

function Compressor(options, false_by_default) {
    options = defaults(options, {
        sequences     : !false_by_default,
        properties    : !false_by_default,
        dead_code     : !false_by_default,
        drop_debugger : !false_by_default,
        unsafe        : !false_by_default,
        conditionals  : !false_by_default,
        comparations  : !false_by_default,
        evaluate      : !false_by_default,
        booleans      : !false_by_default,
        loops         : !false_by_default,
        unused_func   : !false_by_default,
        hoist_funs    : !false_by_default,
        hoist_vars    : !false_by_default,

        warnings      : true
    });
    var stack = [];
    function in_boolean_context() {
        var i = stack.length, self = stack[--i];
        while (i > 0) {
            var p = stack[--i];
            if ((p instanceof AST_If           && p.condition === self) ||
                (p instanceof AST_Conditional  && p.condition === self) ||
                (p instanceof AST_DWLoop       && p.condition === self) ||
                (p instanceof AST_For          && p.condition === self) ||
                (p instanceof AST_UnaryPrefix  && p.operator == "!" && p.expression === self))
            {
                return true;
            }
            if (!(p instanceof AST_Binary && (p.operator == "&&" || p.operator == "||")))
                return false;
            self = p;
        }
    };
    return {
        option    : function(key) { return options[key] },
        push_node : function(node) { stack.push(node) },
        pop_node  : function() { return stack.pop() },
        stack     : function() { return stack },
        parent    : function(n) {
            return stack[stack.length - 2 - (n || 0)];
        },
        warn      : function() {
            if (options.warnings)
                AST_Node.warn.apply(AST_Node, arguments);
        },
        in_boolean_context: in_boolean_context
    };
};

(function(undefined){

    AST_Node.DEFMETHOD("squeeze", function(){
        return this;
    });

    AST_Node.DEFMETHOD("optimize", function(){
        return this;
    });

    function make_node(ctor, orig, props) {
        if (!props) props = {};
        if (!props.start) props.start = orig.start;
        if (!props.end) props.end = orig.end;
        return new ctor(props);
    };

    function SQUEEZE(nodetype, squeeze) {
        nodetype.DEFMETHOD("squeeze", function(compressor){
            compressor.push_node(this);
            var new_node = squeeze(this, compressor);
            compressor.pop_node();
            return new_node !== undefined ? new_node : this;
        });
    };

    function do_list(array, compressor, splice_blocks) {
        return MAP(array, function(node){
            node = node.squeeze(compressor);
            if (splice_blocks) {
                if (node instanceof AST_BlockStatement) {
                    return MAP.splice(eliminate_spurious_blocks(node.body));
                }
                if (node instanceof AST_EmptyStatement)
                    return MAP.skip;
            }
            return node;
        });
    };

    function eliminate_spurious_blocks(statements) {
        return statements.reduce(function(a, stat){
            if (stat instanceof AST_BlockStatement) {
                a.push.apply(a, stat.body);
            } else if (!(stat instanceof AST_EmptyStatement)) {
                a.push(stat);
            }
            return a;
        }, []);
    };

    function tighten_body(statements, compressor) {
        statements = do_list(statements, compressor, true);
        if (compressor.option("dead_code")) {
            statements = eliminate_dead_code(statements, compressor);
        }
        if (compressor.option("sequences")) {
            statements = sequencesize(statements, compressor);
        }
        return statements;
    };

    function extract_declarations_from_unreachable_code(compressor, stat, target) {
        warn_dead_code(stat);
        stat.walk(new TreeWalker(function(node){
            if (node instanceof AST_Definitions || node instanceof AST_Defun) {
                compressor.warn("Declarations in unreachable code! [{line},{col}]", node.start);
                if (node instanceof AST_Definitions) {
                    node = node.clone();
                    node.remove_initializers();
                    target.push(node);
                }
                else if (node instanceof AST_Defun) {
                    target.push(node);
                }
                return true; // no point to descend
            }
            if (node instanceof AST_Scope) {
                // also don't descend any other nested scopes
                return true;
            }
        }));
    };

    function eliminate_dead_code(statements, compressor) {
        var has_quit = false;
        return statements.reduce(function(a, stat){
            if (has_quit) {
                if (stat instanceof AST_Defun) {
                    a.push(stat);
                }
                else {
                    extract_declarations_from_unreachable_code(compressor, stat, a);
                };
            } else {
                a.push(stat);
                if (stat instanceof AST_Jump) {
                    has_quit = true;
                }
            }
            return a;
        }, []);
    };

    // XXX: this is destructive -- it modifies tree nodes.
    function sequencesize(statements) {
        var prev = null, last = statements.length - 1;
        if (last) statements = statements.reduce(function(a, cur, i){
            if (prev instanceof AST_SimpleStatement
                && cur instanceof AST_SimpleStatement) {
                var seq = make_node(AST_Seq, prev, {
                    first: prev.body,
                    second: cur.body
                });
                prev.body = seq;
            }
            else if (i == last
                     && cur instanceof AST_Exit && cur.value
                     && a.length == 1 && prev instanceof AST_SimpleStatement) {
                // it only makes sense to do this transformation
                // if the AST gets to a single statement.
                var seq = make_node(AST_Seq, prev, {
                    first: prev.body,
                    second: cur.value
                });
                cur.value = seq;
                return [ cur ];
            }
            else {
                a.push(cur);
                prev = cur;
            }
            return a;
        }, []);
        return statements;
    };

    /* -----[ boolean/negation helpers ]----- */

    // methods to determine whether an expression has a boolean result type
    (function (def){
        var unary_bool = [ "!", "delete" ];
        var binary_bool = [ "in", "instanceof", "==", "!=", "===", "!==", "<", "<=", ">=", ">" ];
        def(AST_Node, function(){ return false });
        def(AST_UnaryPrefix, function(){
            return member(this.operator, unary_bool);
        });
        def(AST_Binary, function(){
            return member(this.operator, binary_bool) ||
                ( (this.operator == "&&" || this.operator == "||") &&
                  this.left.is_boolean() && this.right.is_boolean() );
        });
        def(AST_Conditional, function(){
            return this.consequent.is_boolean() && this.alternative.is_boolean();
        });
        def(AST_Assign, function(){
            return this.operator == "=" && this.right.is_boolean();
        });
        def(AST_Seq, function(){
            return this.second.is_boolean();
        });
        def(AST_True, function(){ return true });
        def(AST_False, function(){ return true });
    })(function(node, func){
        node.DEFMETHOD("is_boolean", func);
    });

    // methods to determine if an expression has a string result type
    (function (def){
        def(AST_Node, function(){ return false });
        def(AST_String, function(){ return true });
        def(AST_UnaryPrefix, function(){
            return this.operator == "typeof";
        });
        def(AST_Binary, function(){
            return this.operator == "+" &&
                (this.left.is_string() || this.right.is_string());
        });
        def(AST_Assign, function(){
            return this.operator == "=" && this.right.is_string();
        });
    })(function(node, func){
        node.DEFMETHOD("is_string", func);
    });

    function best_of(ast1, ast2) {
        return ast1.print_to_string().length >
            ast2.print_to_string().length
            ? ast2 : ast1;
    };

    // methods to evaluate a constant expression
    (function (def){
        // The evaluate method returns an array with one or two
        // elements.  If the node has been successfully reduced to a
        // constant, then the second element tells us the value;
        // otherwise the second element is missing.  The first element
        // of the array is always an AST_Node descendant; when
        // evaluation was successful it's a node that represents the
        // constant; otherwise it's the original node.
        AST_Node.DEFMETHOD("evaluate", function(compressor){
            if (!compressor.option("evaluate")) return [ this ];
            try {
                var val = this._eval(), ast;
                switch (typeof val) {
                  case "string":
                    ast = make_node(AST_String, this, {
                        value: val
                    });
                    break;
                  case "number":
                    ast = make_node(AST_Number, this, {
                        value: val
                    });
                    break;
                  case "boolean":
                    ast = make_node(val ? AST_True : AST_False, this);
                    break;
                  case "undefined":
                    ast = make_node(AST_Undefined, this);
                    break;
                  default:
                    if (val === null) {
                        ast = make_node(AST_Null, this);
                        break;
                    }
                    throw new Error(string_template("Can't handle constant of type: {type}", {
                        type: typeof val
                    }));
                }
                return [ ast, val ];
            } catch(ex) {
                if (ex !== def) throw ex;
                return [ this ];
            }
        });
        def(AST_Statement, function(){
            throw new Error("Cannot evaluate a statement");
        });
        function ev(node) {
            return node._eval();
        };
        def(AST_Node, function(){
            throw def;          // not constant
        });
        def(AST_Constant, function(){
            return this.getValue();
        });
        def(AST_UnaryPrefix, function(){
            var e = this.expression;
            switch (this.operator) {
              case "!": return !ev(e);
              case "typeof": return typeof ev(e);
              case "~": return ~ev(e);
              case "-": return -ev(e);
              case "+": return +ev(e);
            }
            throw def;
        });
        def(AST_Binary, function(){
            var left = this.left, right = this.right;
            switch (this.operator) {
              case "&&"         : return ev(left) &&         ev(right);
              case "||"         : return ev(left) ||         ev(right);
              case "|"          : return ev(left) |          ev(right);
              case "&"          : return ev(left) &          ev(right);
              case "^"          : return ev(left) ^          ev(right);
              case "+"          : return ev(left) +          ev(right);
              case "*"          : return ev(left) *          ev(right);
              case "/"          : return ev(left) /          ev(right);
              case "%"          : return ev(left) %          ev(right);
              case "-"          : return ev(left) -          ev(right);
              case "<<"         : return ev(left) <<         ev(right);
              case ">>"         : return ev(left) >>         ev(right);
              case ">>>"        : return ev(left) >>>        ev(right);
              case "=="         : return ev(left) ==         ev(right);
              case "==="        : return ev(left) ===        ev(right);
              case "!="         : return ev(left) !=         ev(right);
              case "!=="        : return ev(left) !==        ev(right);
              case "<"          : return ev(left) <          ev(right);
              case "<="         : return ev(left) <=         ev(right);
              case ">"          : return ev(left) >          ev(right);
              case ">="         : return ev(left) >=         ev(right);
              case "in"         : return ev(left) in         ev(right);
              case "instanceof" : return ev(left) instanceof ev(right);
            }
            throw def;
        });
        def(AST_Conditional, function(){
            return ev(this.condition)
                ? ev(this.consequent)
                : ev(this.alternative);
        });
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
        };
        def(AST_Node, function(){
            return basic_negation(this);
        });
        def(AST_Statement, function(){
            throw new Error("Cannot negate a statement");
        });
        def(AST_UnaryPrefix, function(){
            if (this.operator == "!")
                return this.expression;
            return basic_negation(this);
        });
        def(AST_Seq, function(compressor){
            var self = this.clone();
            self.second = self.second.negate(compressor);
            return self;
        });
        def(AST_Conditional, function(compressor){
            var self = this.clone();
            self.consequent = self.consequent.negate(compressor);
            self.alternative = self.alternative.negate(compressor);
            //return best_of(basic_negation(this), self);
            return self;
        });
        def(AST_Binary, function(compressor){
            var self = this.clone(), op = this.operator;
            if (compressor.option("comparations")) switch (op) {
              case "<=" : self.operator = ">"  ; return self;
              case "<"  : self.operator = ">=" ; return self;
              case ">=" : self.operator = "<"  ; return self;
              case ">"  : self.operator = "<=" ; return self;
            }
            switch (op) {
              case "==" : self.operator = "!="; return self;
              case "!=" : self.operator = "=="; return self;
              case "===": self.operator = "!=="; return self;
              case "!==": self.operator = "==="; return self;
              case "&&":
                self.operator = "||";
                self.left = self.left.negate(compressor);
                self.right = self.right.negate(compressor);
                return best_of(basic_negation(this), self);
              case "||":
                self.operator = "&&";
                self.left = self.left.negate(compressor);
                self.right = self.right.negate(compressor);
                return best_of(basic_negation(this), self);
            }
            return basic_negation(this);
        });
    })(function(node, func){
        node.DEFMETHOD("negate", func);
    });

    // determine if expression has side effects
    (function(def){
        def(AST_Node, function(){ return true });

        def(AST_EmptyStatement, function(){ return false });
        def(AST_Constant, function(){ return false });
        def(AST_This, function(){ return false });
        def(AST_Function, function(){ return false });

        def(AST_SimpleStatement, function(){
            return this.body.has_side_effects();
        });
        def(AST_Binary, function(){
            return this.left.has_side_effects()
                || this.right.has_side_effects ();
        });
        def(AST_Conditional, function(){
            return this.condition.has_side_effects()
                || this.consequent.has_side_effects()
                || this.alternative.has_side_effects();
        });
        def(AST_Unary, function(){
            return this.operator == "delete"
                || this.operator == "++"
                || this.operator == "--";
        });
    })(function(node, func){
        node.DEFMETHOD("has_side_effects", func);
    });

    /* -----[ node squeezers ]----- */

    SQUEEZE(AST_Debugger, function(self, compressor){
        if (compressor.option("drop_debugger"))
            return new AST_EmptyStatement(self);
    });

    SQUEEZE(AST_LabeledStatement, function(self, compressor){
        self = self.clone();
        self.body = self.body.squeeze(compressor);
        return self.label.references.length == 0 ? self.body : self;
    });

    SQUEEZE(AST_Statement, function(self, compressor){
        self = self.clone();
        self.body = self.body.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_BlockStatement, function(self, compressor){
        self = self.clone();
        self.body = tighten_body(self.body, compressor);
        if (self.body.length == 1)
            return self.body[0];
        return self;
    });

    SQUEEZE(AST_Block, function(self, compressor){
        self = self.clone();
        self.body = tighten_body(self.body, compressor);
        return self;
    });

    SQUEEZE(AST_Scope, function(self, compressor){
        self = self.clone();
        self.hoist_declarations(compressor);
        self.body = tighten_body(self.body, compressor);
        return self;
    });

    AST_Scope.DEFMETHOD("hoist_declarations", function(compressor){
        var hoist_funs = compressor.option("hoist_funs");
        var hoist_vars = compressor.option("hoist_vars");
        if (hoist_funs || hoist_vars) {
            var self = this;
            var hoisted = [];
            var defuns = {};
            var vars = {}, vars_found = 0, vardecl = [];
            var tw = new TreeWalker(function(node){
                if (node !== self) {
                    if (node instanceof AST_Defun && hoist_funs && !node.hoisted) {
                        hoisted.push(node.clone());
                        node.hoisted = true;
                        defuns[node.name.name] = true;
                    }
                    if (node instanceof AST_Var && hoist_vars && !node.hoisted) {
                        node.definitions.forEach(function(def){
                            vars[def.name.name] = def;
                            ++vars_found;
                        });
                        vardecl.push(node);
                    }
                    if (node instanceof AST_Scope)
                        return true;
                }
            });
            self.walk(tw);
            if (vars_found > 0 && vardecl.length > 1) {
                vardecl.forEach(function(v){ v.hoisted = true });
                var node = make_node(AST_Var, self, {
                    definitions: Object.keys(vars).map(function(name){
                        var def = vars[name].clone();
                        def.value = null;
                        return def;
                    })
                });
                hoisted.unshift(node);
            }
            self.body = hoisted.concat(self.body);
        }
    });

    SQUEEZE(AST_SimpleStatement, function(self, compressor){
        self = self.clone();
        self.body = self.body.squeeze(compressor);
        return self.optimize(compressor);
    });

    AST_SimpleStatement.DEFMETHOD("optimize", function(compressor){
        if (!this.body.has_side_effects()) {
            AST_Node.warn("Dropping side-effect-free statement [{line},{col}]", this.start);
            return make_node(AST_EmptyStatement, this);
        }
        return this;
    });

    SQUEEZE(AST_EmptyStatement, function(self, compressor){
        return self;
    });

    SQUEEZE(AST_DWLoop, function(self, compressor){
        self = self.clone();
        self.condition = self.condition.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
        return self.optimize(compressor);
    });

    function warn_dead_code(node) {
        AST_Node.warn("Dropping unreachable code [{line},{col}]", node.start);
    };

    AST_DWLoop.DEFMETHOD("optimize", function(compressor){
        var self = this;
        var cond = self.condition.evaluate(compressor);
        self.condition = cond[0];
        if (!compressor.option("loops")) return self;
        if (cond.length == 2) {
            if (cond[1]) {
                return make_node(AST_For, self, {
                    body: self.body
                });
            } else if (self instanceof AST_While) {
                if (compressor.option("dead_code")) {
                    var a = [];
                    extract_declarations_from_unreachable_code(compressor, self.body, a);
                    return make_node(AST_BlockStatement, self, { body: a }).optimize(compressor);
                }
            } else {
                return self.body;
            }
        }
        return self;
    });

    // while(cond){ ... } ==> for(;cond;){ ... }
    //
    // not helpful, it seems (output is a bit bigger after gzip)
    //
    // AST_While.DEFMETHOD("optimize", function(compressor){
    //     var self = AST_DWLoop.prototype.optimize.call(this, compressor);
    //     if (self instanceof AST_While) {
    //         self = make_node(AST_For, self, {
    //             condition: self.condition,
    //             body: self.body
    //         }).optimize(compressor);
    //     }
    //     return self;
    // });

    SQUEEZE(AST_For, function(self, compressor){
        self = self.clone();
        if (self.init) self.init = self.init.squeeze(compressor);
        if (self.condition) self.condition = self.condition.squeeze(compressor);
        if (self.step) self.step = self.step.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
        return self.optimize(compressor);
    });

    AST_For.DEFMETHOD("optimize", function(compressor){
        var cond = this.condition;
        if (cond) {
            cond = cond.evaluate(compressor);
            this.condition = cond[0];
        }
        if (!compressor.option("loops")) return this;
        if (cond) {
            if (cond.length == 2 && !cond[1]) {
                if (compressor.option("dead_code")) {
                    var a = [];
                    if (this.init instanceof AST_Statement) {
                        a.push(this.init);
                    }
                    else if (this.init) {
                        a.push(make_node(AST_SimpleStatement, this.init, {
                            body: this.init
                        }));
                    }
                    extract_declarations_from_unreachable_code(compressor, this.body, a);
                    return make_node(AST_BlockStatement, this, { body: a });
                }
            }
        }
        return this;
    });

    SQUEEZE(AST_ForIn, function(self, compressor){
        self = self.clone();
        self.init = self.init.squeeze(compressor);
        self.object = self.object.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_With, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
    });

    SQUEEZE(AST_Exit, function(self, compressor){
        self = self.clone();
        if (self.value) self.value = self.value.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_LoopControl, function(self, compressor){
        self = self.clone();
        if (self.label) self.label = self.label.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_If, function(self, compressor){
        self = self.clone();
        self.condition = self.condition.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
        if (self.alternative)
            self.alternative = self.alternative.squeeze(compressor);
        return self.optimize(compressor);
    });

    AST_If.DEFMETHOD("optimize", function(compressor){
        var self = this;
        if (!compressor.option("conditionals")) return self;
        // if condition can be statically determined, warn and drop
        // one of the blocks.  note, statically determined implies
        // “has no side effects”; also it doesn't work for cases like
        // `x && true`, though it probably should.
        var cond = self.condition.evaluate(compressor);
        self.condition = cond[0];
        if (cond.length == 2) {
            if (cond[1]) {
                AST_Node.warn("Condition always true [{line},{col}]", self.condition.start);
                if (compressor.option("dead_code")) {
                    var a = [];
                    if (self.alternative) {
                        extract_declarations_from_unreachable_code(compressor, self.alternative, a);
                    }
                    a.push(self.body);
                    return make_node(AST_BlockStatement, self, { body: a });
                }
            } else {
                AST_Node.warn("Condition always false [{line},{col}]", self.condition.start);
                if (compressor.option("dead_code")) {
                    var a = [];
                    extract_declarations_from_unreachable_code(compressor, self.body, a);
                    if (self.alternative) a.push(self.alternative);
                    return make_node(AST_BlockStatement, self, { body: a });
                }
            }
        }
        var negated = self.condition.negate(compressor);
        var negated_is_best = best_of(self.condition, negated) === negated;
        if (self.alternative && negated_is_best) {
            negated_is_best = false; // because we already do the switch here.
            self.condition = negated;
            var tmp = self.body;
            self.body = self.alternative || new AST_EmptyStatement();
            self.alternative = tmp;
        }
        if (self.body instanceof AST_EmptyStatement
            && self.alternative instanceof AST_EmptyStatement) {
            return make_node(AST_SimpleStatement, self.condition, {
                body: self.condition
            });
        }
        if (self.body instanceof AST_SimpleStatement
            && self.alternative instanceof AST_SimpleStatement) {
            return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Conditional, self, {
                    condition   : self.condition,
                    consequent  : self.body.body,
                    alternative : self.alternative.body
                }).optimize(compressor)
            });
        }
        if ((!self.alternative
             || self.alternative instanceof AST_EmptyStatement)
            && self.body instanceof AST_SimpleStatement) {
            if (negated_is_best) return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Binary, self, {
                    operator : "||",
                    left     : negated,
                    right    : self.body.body
                }).optimize(compressor)
            });
            return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Binary, self, {
                    operator : "&&",
                    left     : self.condition,
                    right    : self.body.body
                }).optimize(compressor)
            });
        }
        if (self.body instanceof AST_EmptyStatement
            && self.alternative
            && self.alternative instanceof AST_SimpleStatement) {
            return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Binary, self, {
                    operator : "||",
                    left     : self.condition,
                    right    : self.alternative.body
                }).optimize(compressor)
            });
        }
        if (self.body instanceof AST_Exit
            && self.alternative instanceof AST_Exit
            && self.body.TYPE == self.alternative.TYPE) {
            return make_node(self.body.CTOR, self, {
                value: make_node(AST_Conditional, self, {
                    condition   : self.condition,
                    consequent  : self.body.value,
                    alternative : self.alternative.value
                }).optimize(compressor)
            });
        }
        return self;
    });

    SQUEEZE(AST_Switch, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        self.body = self.body.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Case, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        self.body = tighten_body(self.body, compressor);
        return self;
    });

    SQUEEZE(AST_Try, function(self, compressor){
        self = self.clone();
        self.body = tighten_body(self.body, compressor);
        if (self.bcatch) self.bcatch = self.bcatch.squeeze(compressor);
        if (self.bfinally) self.bfinally = self.bfinally.squeeze(compressor);
        return self;
    });

    AST_Definitions.DEFMETHOD("remove_initializers", function(){
        this.definitions = this.definitions.map(function(def){
            def = def.clone();
            def.value = null;
            return def;
        });
    });

    AST_Definitions.DEFMETHOD("to_assignments", function(){
        var assignments = this.definitions.reduce(function(a, def){
            if (def.value) {
                var name = make_node(AST_SymbolRef, def.name, def.name);
                a.push(make_node(AST_Assign, def, {
                    operator : "=",
                    left     : name,
                    right    : def.value
                }));
            }
            return a;
        }, []);
        if (assignments.length == 0) return null;
        return (function seq(list){
            var first = list[0];
            if (list.length == 1) return first;
            return make_node(AST_Seq, first, {
                first: first,
                second: seq(list.slice(1))
            });
        })(assignments);
    });

    SQUEEZE(AST_Definitions, function(self, compressor){
        if (self.hoisted) {
            var seq = self.to_assignments();
            var p = compressor.parent();
            if (seq) seq = seq.squeeze(compressor);
            if (p instanceof AST_ForIn && p.init === self) {
                if (seq == null) return self.definitions[0].name; //XXX: is this fine?
                return seq;
            }
            if (p instanceof AST_For && p.init === self) {
                return seq;
            }
            if (!seq) return make_node(AST_EmptyStatement, self);
            return make_node(AST_SimpleStatement, self, { body: seq });
        }
        self = self.clone();
        self.definitions = do_list(self.definitions, compressor);
        return self;
    });

    SQUEEZE(AST_VarDef, function(self, compressor){
        self = self.clone();
        if (self.value) self.value = self.value.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Lambda, function(self, compressor){
        if (self.hoisted) return make_node(AST_EmptyStatement, self);
        self = self.clone();
        if (self.name) self.name = self.name.squeeze(compressor);
        self.argnames = do_list(self.argnames, compressor);
        self.hoist_declarations(compressor);
        self.body = tighten_body(self.body, compressor);
        return self.optimize(compressor);
    });

    AST_Lambda.DEFMETHOD("optimize", function(compressor){
        if (compressor.option("unused_func")) {
            if (this.name && this.name.unreferenced()) {
                this.name = null;
            }
        }
        return this;
    });

    AST_Defun.DEFMETHOD("optimize", function(compressor){
        if (compressor.option("unused_func")) {
            if (this.name.unreferenced()
                && !(this.parent_scope instanceof AST_Toplevel)) {
                AST_Node.warn("Dropping unused function {name} [{line},{col}]", {
                    name: this.name.name,
                    line: this.start.line,
                    col: this.start.col
                });
                return make_node(AST_EmptyStatement, this);
            }
        }
        return this;
    });

    SQUEEZE(AST_Call, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        self.args = do_list(self.args, compressor);
        return self.optimize(compressor);
    });

    AST_Call.DEFMETHOD("optimize", function(compressor){
        if (compressor.option("unsafe")) {
            var exp = this.expression;
            if (exp instanceof AST_SymbolRef && exp.undeclared) {
                switch (exp.name) {
                  case "Array":
                    if (this.args.length != 1) {
                        return make_node(AST_Array, this, {
                            elements: this.args
                        }).optimize(compressor);
                    }
                    break;
                  case "Object":
                    if (this.args.length == 0) {
                        return make_node(AST_Object, this, {
                            properties: []
                        }).optimize(compressor);
                    }
                    break;
                  case "String":
                    return make_node(AST_Binary, this, {
                        left: this.args[0],
                        operator: "+",
                        right: make_node(AST_String, this, { value: "" })
                    });
                }
            }
            else if (exp instanceof AST_Dot && exp.property == "toString" && this.args.length == 0) {
                return make_node(AST_Binary, this, {
                    left: exp.expression,
                    operator: "+",
                    right: make_node(AST_String, this, { value: "" })
                });
            }
        }
        return this;
    });

    AST_New.DEFMETHOD("optimize", function(compressor){
        if (compressor.option("unsafe")) {
            var exp = this.expression;
            if (exp instanceof AST_SymbolRef && exp.undeclared) {
                switch (exp.name) {
                  case "Object":
                  case "RegExp":
                  case "Function":
                  case "Error":
                  case "Array":
                    return make_node(AST_Call, this, this).optimize(compressor);
                }
            }
        }
    });

    SQUEEZE(AST_Seq, function(self, compressor){
        self = self.clone();
        self.first = self.first.squeeze(compressor);
        self.second = self.second.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Dot, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Sub, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        var prop = self.property = self.property.squeeze(compressor);
        if (prop instanceof AST_String && compressor.option("properties")) {
            prop = prop.getValue();
            if (is_identifier(prop)) {
                self = new AST_Dot(self);
                self.property = prop;
            }
        }
        return self;
    });

    SQUEEZE(AST_Unary, function(self, compressor){
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_UnaryPrefix, function(self, compressor){
        // need to determine the context before cloning the node
        self = self.clone();
        self.expression = self.expression.squeeze(compressor);
        return self.optimize(compressor);
    });

    AST_UnaryPrefix.DEFMETHOD("optimize", function(compressor){
        if (compressor.option("booleans") && compressor.in_boolean_context()) {
            var e = this.expression;
            switch (this.operator) {
              case "!":
                if (e instanceof AST_UnaryPrefix && e.operator == "!") {
                    // !!foo ==> foo, if we're in boolean context
                    return e.expression;
                }
                break;
              case "typeof":
                // typeof always returns a non-empty string, thus it's
                // always true in booleans
                AST_Node.warn("Boolean expression always true [{line},{col}]", this.start);
                return make_node(AST_True, this).optimize(compressor);
            }
        }
        return this.evaluate(compressor)[0];
    });

    SQUEEZE(AST_Binary, function(self, compressor){
        self = self.clone();
        self.left = self.left.squeeze(compressor);
        self.right = self.right.squeeze(compressor);
        return self.optimize(compressor);
    });

    AST_Binary.DEFMETHOD("optimize", function(compressor){
        if (compressor.option("comparations")) switch (this.operator) {
          case "===":
          case "!==":
            if ((this.left.is_string() && this.right.is_string()) ||
                (this.left.is_boolean() && this.right.is_boolean())) {
                this.operator = this.operator.substr(0, 2);
            }
            break;
        }
        if (compressor.option("booleans") && compressor.in_boolean_context()) switch (this.operator) {
          case "&&":
            var ll = this.left.evaluate(compressor), left = ll[0];
            var rr = this.right.evaluate(compressor), right = rr[0];
            if ((ll.length == 2 && !ll[1]) || (rr.length == 2 && !rr[1])) {
                AST_Node.warn("Boolean && always false [{line},{col}]", this.start);
                return make_node(AST_False, this).optimize(compressor);
            }
            if (ll.length == 2 && ll[1]) {
                return rr[0];
            }
            if (rr.length == 2 && rr[1]) {
                return ll[0];
            }
            break;
          case "||":
            var ll = this.left.evaluate(compressor), left = ll[0];
            var rr = this.right.evaluate(compressor), right = rr[0];
            if ((ll.length == 2 && ll[1]) || (rr.length == 2 && rr[1])) {
                AST_Node.warn("Boolean || always true [{line},{col}]", this.start);
                return make_node(AST_True, this).optimize(compressor);
            }
            if (ll.length == 2 && !ll[1]) {
                return rr[0];
            }
            if (rr.length == 2 && !rr[1]) {
                return ll[0];
            }
            break;
          case "+":
            var ll = this.left.evaluate(compressor), left = ll[0];
            var rr = this.right.evaluate(compressor), right = rr[0];
            if ((ll.length == 2 && ll[0] instanceof AST_String && ll[1]) ||
                (rr.length == 2 && rr[0] instanceof AST_String && rr[1])) {
                AST_Node.warn("+ in boolean context always true [{line},{col}]", this.start);
                return make_node(AST_True, this).optimize(compressor);
            }
            break;
        }
        return this.evaluate(compressor)[0];
    });

    SQUEEZE(AST_Assign, function(self, compressor){
        self = self.clone();
        self.left = self.left.squeeze(compressor);
        self.right = self.right.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_Conditional, function(self, compressor){
        self = self.clone();
        self.condition = self.condition.squeeze(compressor);
        self.consequent = self.consequent.squeeze(compressor);
        self.alternative = self.alternative.squeeze(compressor);
        return self.optimize(compressor);
    });

    AST_Conditional.DEFMETHOD("optimize", function(compressor){
        var self = this;
        if (!compressor.option("conditionals")) return self;
        var cond = self.condition.evaluate(compressor);
        if (cond.length == 2) {
            if (cond[1]) {
                AST_Node.warn("Condition always true [{line},{col}]", self.start);
                return self.consequent;
            } else {
                AST_Node.warn("Condition always false [{line},{col}]", self.start);
                return self.alternative;
            }
        }
        var negated = cond[0].negate(compressor);
        if (best_of(cond[0], negated) === negated) {
            self = make_node(AST_Conditional, self, {
                condition: negated,
                consequent: self.alternative,
                alternative: self.consequent
            });
        }
        var consequent = self.consequent;
        var alternative = self.alternative;
        if (consequent instanceof AST_Assign
            && alternative instanceof AST_Assign
            && consequent.operator == alternative.operator
            // XXX: this is a rather expensive way to test two node's equivalence:
            && consequent.left.print_to_string() == alternative.left.print_to_string()
           ) {
            /*
             * Stuff like this:
             * if (foo) exp = something; else exp = something_else;
             * ==>
             * exp = foo ? something : something_else;
             */
            self = make_node(AST_Assign, self, {
                operator: consequent.operator,
                left: consequent.left,
                right: make_node(AST_Conditional, self, {
                    condition: self.condition,
                    consequent: consequent.right,
                    alternative: alternative.right
                })
            });
        }
        return self;
    });

    SQUEEZE(AST_Array, function(self, compressor){
        self = self.clone();
        self.elements = do_list(self.elements, compressor);
        return self;
    });

    SQUEEZE(AST_Object, function(self, compressor){
        self = self.clone();
        self.properties = do_list(self.properties, compressor);
        return self;
    });

    SQUEEZE(AST_ObjectProperty, function(self, compressor){
        self = self.clone();
        self.value = self.value.squeeze(compressor);
        return self;
    });

    SQUEEZE(AST_True, function(self, compressor){
        return self.optimize(compressor);
    });

    AST_True.DEFMETHOD("optimize", function(compressor){
        if (compressor.option("booleans")) return make_node(AST_UnaryPrefix, this, {
            operator: "!",
            expression: make_node(AST_Number, this, {
                value: 0
            })
        });
        return this;
    });

    SQUEEZE(AST_False, function(self, compressor){
        return self.optimize(compressor);
    });

    AST_False.DEFMETHOD("optimize", function(compressor){
        if (compressor.option("booleans")) return make_node(AST_UnaryPrefix, this, {
            operator: "!",
            expression: make_node(AST_Number, this, {
                value: 1
            })
        });
        return this;
    });

})();
