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
!this.Cola && (this.Cola = {});

Cola.OutputStream = function (options) {

    this.options = Cola.defaults(options, {
        indent_start     : 0,
        indent_level     : 4,
        quote_keys       : false,
        space_colon      : true,
        ascii_only       : false,
        unescape_regexps : false,
        inline_script    : false,
        width            : 80,
        max_line_len     : 32000,
        beautify         : false,
        source_map       : null,
        bracketize       : false,
        semicolons       : true,
        comments         : false,
        preserve_line    : false,
        screw_ie8        : false,
        preamble         : null
        //,is_js            : false
    }, true);

    this.indentation = 0;
    this.current_col = 0;
    this.current_line = 1;
    this.current_pos = 0;
    this.OUTPUT = "";

    this.might_need_space = false;
    this.might_need_semicolon = false;
    this.last = null;

    this.requireSemicolonChars = Cola.makePredicate("( [ + * / - , .");

    if (this.options.preamble) {
        this.print(this.options.preamble.replace(/\r\n?|[\n\u2028\u2029]|\s*$/g, "\n"));
    }

    this.stack = [];
};

Cola.OutputStream.prototype.to_ascii = function (str, identifier) {
    return str.replace(/[\u0080-\uffff]/g, function(ch) {
        var code = ch.charCodeAt(0).toString(16);
        if (code.length <= 2 && !identifier) {
            while (code.length < 2) code = "0" + code;
            return "\\x" + code;
        } else {
            while (code.length < 4) code = "0" + code;
            return "\\u" + code;
        }
    });
};

Cola.OutputStream.prototype.make_string = function (str) {
    var dq = 0, sq = 0;
    str = str.replace(/[\\\b\f\n\r\t\x22\x27\u2028\u2029\0]/g, function(s){
        switch (s) {
          case "\\": return "\\\\";
          case "\b": return "\\b";
          case "\f": return "\\f";
          case "\n": return "\\n";
          case "\r": return "\\r";
          case "\u2028": return "\\u2028";
          case "\u2029": return "\\u2029";
          case '"': ++dq; return '"';
          case "'": ++sq; return "'";
          case "\0": return "\\x00";
        }
        return s;
    });
    if (this.options.ascii_only) str = this.to_ascii(str);
    if (dq > sq) return "'" + str.replace(/\x27/g, "\\'") + "'";
    else return '"' + str.replace(/\x22/g, '\\"') + '"';
};

Cola.OutputStream.prototype.encode_string = function (str) {
    var ret = this.make_string(str);
    if (this.options.inline_script)
        ret = ret.replace(/<\x2fscript([>\/\t\n\f\r ])/gi, "<\\/script$1");
    return ret;
};

Cola.OutputStream.prototype.make_name = function (name) {
    name = name.toString();
    if (this.options.ascii_only)
        name = this.to_ascii(name, true);
    return name;
};

Cola.OutputStream.prototype.make_indent = function (back) {
    return Cola.repeat_string(" ", this.options.indent_start + this.indentation - back * this.options.indent_level);
};

/* -----[ beautification/minification ]----- */

Cola.OutputStream.prototype.last_char = function () {
    return this.last.charAt(this.last.length - 1);
};

Cola.OutputStream.prototype.maybe_newline = function () {
    if (this.options.max_line_len && this.current_col > this.options.max_line_len)
        this.print("\n");
};

Cola.OutputStream.prototype.print = function (str) {
    str = String(str);
    var ch = str.charAt(0);
    if (this.might_need_semicolon) {
        if ((!ch || ";}".indexOf(ch) < 0) && !/[;]$/.test(this.last)) {
            if (this.options.semicolons || this.requireSemicolonChars(ch)) {
                this.OUTPUT += ";";
                this.current_col++;
                this.current_pos++;
            } else {
                this.OUTPUT += "\n";
                this.current_pos++;
                this.current_line++;
                this.current_col = 0;
            }
            if (!this.options.beautify)
                this.might_need_space = false;
        }
        this.might_need_semicolon = false;
        this.maybe_newline();
    }

    if (!this.options.beautify && this.options.preserve_line && this.stack[stack.length - 1]) {
        var target_line = this.stack[stack.length - 1].start.line;
        while (this.current_line < target_line) {
            this.OUTPUT += "\n";
            this.current_pos++;
            this.current_line++;
            this.current_col = 0;
            this.might_need_space = false;
        }
    }

    if (this.might_need_space) {
        var prev = this.last_char();
        if ((Cola.is_identifier_char(prev)
             && (Cola.is_identifier_char(ch) || ch == "\\"))
            || (/^[\+\-\/]$/.test(ch) && ch == prev))
        {
            this.OUTPUT += " ";
            this.current_col++;
            this.current_pos++;
        }
        this.might_need_space = false;
    }
    var a = str.split(/\r?\n/), n = a.length - 1;
    this.current_line += n;
    if (n == 0) {
        this.current_col += a[n].length;
    } else {
        this.current_col = a[n].length;
    }
    this.current_pos += str.length;
    this.last = str;
    this.OUTPUT += str;
};

Cola.OutputStream.prototype.space = function () {
    this.options.beautify ? this.print(" ") : this.might_need_space = true;
}

Cola.OutputStream.prototype.indent = function (half) {
    if (this.options.beautify) {
        this.print(this.make_indent(half ? 0.5 : 0));
    }
}

Cola.OutputStream.prototype.with_indent = function (col, cont) {
    if(!this.options.beautify) return cont();

    if (col === true) col = this.next_indent();
    var save_indentation = this.indentation;
    this.indentation = col;
    var ret = cont();
    this.indentation = save_indentation;
    return ret;
}

Cola.OutputStream.prototype.newline = function () {
    if (this.options.beautify) this.print("\n");
}

Cola.OutputStream.prototype.semicolon = function () {
    this.options.beautify ? this.print(";") : this.might_need_semicolon = true;
}

Cola.OutputStream.prototype.force_semicolon = function () {
    this.might_need_semicolon = false;
    this.print(";");
};

Cola.OutputStream.prototype.next_indent = function () {
    return this.indentation + this.options.indent_level;
};

Cola.OutputStream.prototype.with_block = function (cont) {
    var ret;
    this.print("{");
    this.newline();
    this.with_indent(this.next_indent(), function(){
        ret = cont();
    });
    this.indent();
    this.print("}");
    return ret;
};

Cola.OutputStream.prototype.with_parens = function (cont) {
    this.print("(");
    //XXX: still nice to have that for argument lists
    //var ret = this.with_indent(this.current_col, cont);
    var ret = cont();
    this.print(")");
    return ret;
};

Cola.OutputStream.prototype.with_square = function (cont) {
    this.print("[");
    //var ret = this.with_indent(this.current_col, cont);
    var ret = cont();
    this.print("]");
    return ret;
};

Cola.OutputStream.prototype.comma = function () {
    this.print(",");
    this.space();
};

Cola.OutputStream.prototype.colon = function () {
    this.print(":");
    if (this.options.space_colon) this.space();
};

Cola.OutputStream.prototype.add_mapping = function (token, name) {
    if(!this.options.source_map) return;

    try {
        if (token && !token.file) console.log(token);
        if (token) this.options.source_map.add(
            token.file || "?",
            this.current_line, this.current_col,
            token.line, token.col,
            (!name && token.type == "name") ? token.value : name
        );
    } catch(ex) {
        Cola.AST_Node.warn("Couldn't figure out mapping for {file}:{line},{col} → {cline},{ccol} [{name}]", {
            file: token.file,
            line: token.line,
            col: token.col,
            cline: this.current_line,
            ccol: this.current_col,
            name: name || ""
        })
    }
}

Cola.OutputStream.prototype.get = function () {
    return this.OUTPUT;
};

Cola.OutputStream.prototype.toString      = function() { return this.OUTPUT };
Cola.OutputStream.prototype.current_width = function() { return this.current_col - this.indentation };
Cola.OutputStream.prototype.should_break  = function() { return this.options.width && this.current_width() >= this.options.width };
Cola.OutputStream.prototype.print_name    = function(name) { this.print(this.make_name(name)) };
Cola.OutputStream.prototype.print_string  = function(str) { this.print(this.encode_string(str)) };
Cola.OutputStream.prototype.option        = function(opt) { return this.options[opt] };
Cola.OutputStream.prototype.push_node     = function(node) { this.stack.push(node) };
Cola.OutputStream.prototype.pop_node      = function() { return this.stack.pop() };
Cola.OutputStream.prototype.parent        = function(n) {
    return this.stack[this.stack.length - 2 - (n || 0)];
};

/* -----[ code generators ]----- */

(function(){

    /* -----[ utils ]----- */

    function DEFPRINT(nodetype, generator) {
        nodetype.DEFMETHOD("_codegen", generator);
    };

    Cola.AST_Node.DEFMETHOD("print", function(stream, force_parens){
        var self = this, generator = self._codegen;
        function doit() {
            self.add_comments(stream);
            self.add_source_map(stream);
            generator(self, stream);
        }
        stream.push_node(self);
        if (force_parens || self.needs_parens(stream)) {
            stream.with_parens(doit);
        } else {
            doit();
        }
        stream.pop_node();
    });

    Cola.AST_Node.DEFMETHOD("print_to_string", function(options){
        var s = new Cola.OutputStream(options);
        this.print(s);
        return s.get();
    });

    /* -----[ comments ]----- */

    Cola.AST_Node.DEFMETHOD("add_comments", function(output){
        var c = output.option("comments"), self = this;
        if (c) {
            var start = self.start;
            if (start && !start._comments_dumped) {
                start._comments_dumped = true;
                var comments = start.comments_before || [];

                // XXX: ugly fix for https://github.com/mishoo/UglifyJS2/issues/112
                //               and https://github.com/mishoo/UglifyJS2/issues/372
                if (self instanceof Cola.AST_Exit && self.value) {
                    self.value.walk(new Cola.TreeWalker(function(node){
                        if (node.start && node.start.comments_before) {
                            comments = comments.concat(node.start.comments_before);
                            node.start.comments_before = [];
                        }
                        if (node instanceof Cola.AST_Function ||
                            node instanceof Cola.AST_Array ||
                            node instanceof Cola.AST_Object)
                        {
                            return true; // don't go inside.
                        }
                    }));
                }

                if (c.test) {
                    comments = comments.filter(function(comment){
                        return c.test(comment.value);
                    });
                } else if (typeof c == "function") {
                    comments = comments.filter(function(comment){
                        return c(self, comment);
                    });
                }
                comments.forEach(function(c){
                    if (/comment[134]/.test(c.type)) {
                        output.print("//" + c.value + "\n");
                        output.indent();
                    }
                    else if (c.type == "comment2") {
                        output.print("/*" + c.value + "*/");
                        if (start.nlb) {
                            output.print("\n");
                            output.indent();
                        } else {
                            output.space();
                        }
                    }
                });
            }
        }
    });

    /* -----[ PARENTHESES ]----- */

    function PARENS(nodetype, func) {
        nodetype.DEFMETHOD("needs_parens", func);
    };

    PARENS(Cola.AST_Node, function(){
        return false;
    });

    // a function expression needs parens around it when it's provably
    // the first token to appear in a statement.
    PARENS(Cola.AST_Function, function(output){
        return first_in_statement(output);
    });

    // same goes for an object literal, because otherwise it would be
    // interpreted as a block of code.
    PARENS(Cola.AST_Object, function(output){
        return first_in_statement(output);
    });

    PARENS(Cola.AST_Unary, function(output){
        var p = output.parent();
        return p instanceof Cola.AST_PropAccess && p.expression === this;
    });

    PARENS(Cola.AST_Seq, function(output){
        var p = output.parent();
        return p instanceof Cola.AST_Call             // (foo, bar)() or foo(1, (2, 3), 4)
            || p instanceof Cola.AST_Unary            // !(foo, bar, baz)
            || p instanceof Cola.AST_Binary           // 1 + (2, 3) + 4 ==> 8
            || p instanceof Cola.AST_VarDef           // var a = (1, 2), b = a + a; ==> b == 4
            || p instanceof Cola.AST_PropAccess       // (1, {foo:2}).foo or (1, {foo:2})["foo"] ==> 2
            || p instanceof Cola.AST_Array            // [ 1, (2, 3), 4 ] ==> [ 1, 3, 4 ]
            || p instanceof Cola.AST_ObjectProperty   // { foo: (1, 2) }.foo ==> 2
            || p instanceof Cola.AST_Conditional      /* (false, true) ? (a = 10, b = 20) : (c = 30)
                                                  * ==> 20 (side effect, set a := 10 and b := 20) */
        ;
    });

    PARENS(Cola.AST_Binary, function(output){
        var p = output.parent();
        // (foo && bar)()
        if (p instanceof Cola.AST_Call && p.expression === this)
            return true;
        // typeof (foo && bar)
        if (p instanceof Cola.AST_Unary)
            return true;
        // (foo && bar)["prop"], (foo && bar).prop
        if (p instanceof Cola.AST_PropAccess && p.expression === this)
            return true;
        // this deals with precedence: 3 * (2 + 1)
        if (p instanceof Cola.AST_Binary) {
            var po = p.operator, pp = Cola.PRECEDENCE[po];
            var so = this.operator, sp = Cola.PRECEDENCE[so];
            if (pp > sp
                || (pp == sp
                    && this === p.right)) {
                return true;
            }
        }
    });

    PARENS(Cola.AST_PropAccess, function(output){
        var p = output.parent();
        if (p instanceof Cola.AST_New && p.expression === this) {
            // i.e. new (foo.bar().baz)
            //
            // if there's one call into this subtree, then we need
            // parens around it too, otherwise the call will be
            // interpreted as passing the arguments to the upper New
            // expression.
            try {
                this.walk(new Cola.TreeWalker(function(node){
                    if (node instanceof Cola.AST_Call) throw p;
                }));
            } catch(ex) {
                if (ex !== p) throw ex;
                return true;
            }
        }
    });

    PARENS(Cola.AST_Call, function(output){
        var p = output.parent(), p1;
        if (p instanceof Cola.AST_New && p.expression === this)
            return true;

        // workaround for Safari bug.
        // https://bugs.webkit.org/show_bug.cgi?id=123506
        return this.expression instanceof Cola.AST_Function
            && p instanceof Cola.AST_PropAccess
            && p.expression === this
            && (p1 = output.parent(1)) instanceof Cola.AST_Assign
            && p1.left === p;
    });

    PARENS(Cola.AST_New, function(output){
        var p = output.parent();
        if (no_constructor_parens(this, output)
            && (p instanceof Cola.AST_PropAccess // (new Date).getTime(), (new Date)["getTime"]()
                || p instanceof Cola.AST_Call && p.expression === this)) // (new foo)(bar)
            return true;
    });

    PARENS(Cola.AST_Number, function(output){
        var p = output.parent();
        if (this.getValue() < 0 && p instanceof Cola.AST_PropAccess && p.expression === this)
            return true;
    });

    function assign_and_conditional_paren_rules(output) {
        var p = output.parent();
        // !(a = false) → true
        if (p instanceof Cola.AST_Unary)
            return true;
        // 1 + (a = 2) + 3 → 6, side effect setting a = 2
        if (p instanceof Cola.AST_Binary && !(p instanceof Cola.AST_Assign))
            return true;
        // (a = func)() —or— new (a = Object)()
        if (p instanceof Cola.AST_Call && p.expression === this)
            return true;
        // (a = foo) ? bar : baz
        if (p instanceof Cola.AST_Conditional && p.condition === this)
            return true;
        // (a = foo)["prop"] —or— (a = foo).prop
        if (p instanceof Cola.AST_PropAccess && p.expression === this)
            return true;
    };

    PARENS(Cola.AST_Assign, assign_and_conditional_paren_rules);
    PARENS(Cola.AST_Conditional, assign_and_conditional_paren_rules);

    /* -----[ PRINTERS ]----- */

    DEFPRINT(Cola.AST_Directive, function(self, output){
        output.print_string(self.value);
        output.semicolon();
    });
    DEFPRINT(Cola.AST_Debugger, function(self, output){
        output.print("debugger");
        output.semicolon();
    });

    /* -----[ statements ]----- */

    function display_body(body, is_toplevel, output) {
        var last = body.length - 1;
        body.forEach(function(stmt, i){
            if (!(stmt instanceof Cola.AST_EmptyStatement)) {
                output.indent();
                stmt.print(output);
                if (!(i == last && is_toplevel)) {
                    output.newline();
                    if (is_toplevel) output.newline();
                }
            }
        });
    };

    Cola.AST_StatementWithBody.DEFMETHOD("_do_print_body", function(output){
        force_statement(this.body, output);
    });

    DEFPRINT(Cola.AST_Statement, function(self, output){
        self.body.print(output);
        output.semicolon();
    });
    DEFPRINT(Cola.AST_Toplevel, function(self, output){
        display_body(self.body, true, output);
        output.print("");
    });
    DEFPRINT(Cola.AST_LabeledStatement, function(self, output){
        self.label.print(output);
        output.colon();
        self.body.print(output);
    });
    DEFPRINT(Cola.AST_SimpleStatement, function(self, output){
        self.body.print(output);
        output.semicolon();
    });
    function print_bracketed(body, output) {
        if (body.length > 0) output.with_block(function(){
            display_body(body, false, output);
        });
        else output.print("{}");
    };
    DEFPRINT(Cola.AST_BlockStatement, function(self, output){
        print_bracketed(self.body, output);
    });
    DEFPRINT(Cola.AST_EmptyStatement, function(self, output){
        output.semicolon();
    });
    DEFPRINT(Cola.AST_Do, function(self, output){
        output.print("do");
        output.space();
        self._do_print_body(output);
        output.space();
        output.print("while");
        output.space();
        output.with_parens(function(){
            self.condition.print(output);
        });
        output.semicolon();
    });
    DEFPRINT(Cola.AST_While, function(self, output){
        output.print("while");
        output.space();
        output.with_parens(function(){
            self.condition.print(output);
        });
        output.space();
        self._do_print_body(output);
    });
    DEFPRINT(Cola.AST_For, function(self, output){
        output.print("for");
        output.space();
        output.with_parens(function(){
            if (self.init) {
                if (self.init instanceof Cola.AST_Definitions) {
                    self.init.print(output);
                } else {
                    parenthesize_for_noin(self.init, output, true);
                }
                output.print(";");
                output.space();
            } else {
                output.print(";");
            }
            if (self.condition) {
                self.condition.print(output);
                output.print(";");
                output.space();
            } else {
                output.print(";");
            }
            if (self.step) {
                self.step.print(output);
            }
        });
        output.space();
        self._do_print_body(output);
    });
    DEFPRINT(Cola.AST_ForIn, function(self, output){
        output.print("for");
        output.space();
        output.with_parens(function(){
            self.init.print(output);
            output.space();
            output.print("in");
            output.space();
            self.object.print(output);
        });
        output.space();
        self._do_print_body(output);
    });
    DEFPRINT(Cola.AST_With, function(self, output){
        output.print("with");
        output.space();
        output.with_parens(function(){
            self.expression.print(output);
        });
        output.space();
        self._do_print_body(output);
    });

    /* -----[ functions ]----- */
    Cola.AST_Lambda.DEFMETHOD("_do_print", function(output, nokeyword){
        var self = this;
        if (!nokeyword) {
            output.print("function");
        }
        if (self.name) {
            output.space();
            self.name.print(output);
        }
        output.with_parens(function(){
            self.argnames.forEach(function(arg, i){
                if (i) output.comma();
                arg.print(output);
            });
        });
        output.space();
        print_bracketed(self.body, output);
    });
    DEFPRINT(Cola.AST_Lambda, function(self, output){
        self._do_print(output);
    });

    /* -----[ exits ]----- */
    Cola.AST_Exit.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        if (this.value) {
            output.space();
            this.value.print(output);
        }
        output.semicolon();
    });
    DEFPRINT(Cola.AST_Return, function(self, output){
        self._do_print(output, "return");
    });
    DEFPRINT(Cola.AST_Throw, function(self, output){
        self._do_print(output, "throw");
    });

    /* -----[ loop control ]----- */
    Cola.AST_LoopControl.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        if (this.label) {
            output.space();
            this.label.print(output);
        }
        output.semicolon();
    });
    DEFPRINT(Cola.AST_Break, function(self, output){
        self._do_print(output, "break");
    });
    DEFPRINT(Cola.AST_Continue, function(self, output){
        self._do_print(output, "continue");
    });

    /* -----[ if ]----- */
    function make_then(self, output) {
        if (output.option("bracketize")) {
            make_block(self.body, output);
            return;
        }
        // The squeezer replaces "block"-s that contain only a single
        // statement with the statement itself; technically, the AST
        // is correct, but this can create problems when we output an
        // IF having an ELSE clause where the THEN clause ends in an
        // IF *without* an ELSE block (then the outer ELSE would refer
        // to the inner IF).  This function checks for this case and
        // adds the block brackets if needed.
        if (!self.body)
            return output.force_semicolon();
        if (self.body instanceof Cola.AST_Do
            && !output.option("screw_ie8")) {
            // https://github.com/mishoo/UglifyJS/issues/#issue/57 IE
            // croaks with "syntax error" on code like this: if (foo)
            // do ... while(cond); else ...  we need block brackets
            // around do/while
            make_block(self.body, output);
            return;
        }
        var b = self.body;
        while (true) {
            if (b instanceof Cola.AST_If) {
                if (!b.alternative) {
                    make_block(self.body, output);
                    return;
                }
                b = b.alternative;
            }
            else if (b instanceof Cola.AST_StatementWithBody) {
                b = b.body;
            }
            else break;
        }
        force_statement(self.body, output);
    };
    DEFPRINT(Cola.AST_If, function(self, output){
        output.print("if");
        output.space();
        output.with_parens(function(){
            self.condition.print(output);
        });
        output.space();
        if (self.alternative) {
            make_then(self, output);
            output.space();
            output.print("else");
            output.space();
            force_statement(self.alternative, output);
        } else {
            self._do_print_body(output);
        }
    });

    /* -----[ switch ]----- */
    DEFPRINT(Cola.AST_Switch, function(self, output){
        output.print("switch");
        output.space();
        output.with_parens(function(){
            self.expression.print(output);
        });
        output.space();
        if (self.body.length > 0) output.with_block(function(){
            self.body.forEach(function(stmt, i){
                if (i) output.newline();
                output.indent(true);
                stmt.print(output);
            });
        });
        else output.print("{}");
    });
    Cola.AST_SwitchBranch.DEFMETHOD("_do_print_body", function(output){
        if (this.body.length > 0) {
            output.newline();
            this.body.forEach(function(stmt){
                output.indent();
                stmt.print(output);
                output.newline();
            });
        }
    });
    DEFPRINT(Cola.AST_Default, function(self, output){
        output.print("default:");
        self._do_print_body(output);
    });
    DEFPRINT(Cola.AST_Case, function(self, output){
        output.print("case");
        output.space();
        self.expression.print(output);
        output.print(":");
        self._do_print_body(output);
    });

    /* -----[ exceptions ]----- */
    DEFPRINT(Cola.AST_Try, function(self, output){
        output.print("try");
        output.space();
        print_bracketed(self.body, output);
        if (self.bcatch) {
            output.space();
            self.bcatch.print(output);
        }
        if (self.bfinally) {
            output.space();
            self.bfinally.print(output);
        }
    });
    DEFPRINT(Cola.AST_Catch, function(self, output){
        output.print("catch");
        output.space();
        output.with_parens(function(){
            self.argname.print(output);
        });
        output.space();
        print_bracketed(self.body, output);
    });
    DEFPRINT(Cola.AST_Finally, function(self, output){
        output.print("finally");
        output.space();
        print_bracketed(self.body, output);
    });

    /* -----[ var/const ]----- */
    Cola.AST_Definitions.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        output.space();
        this.definitions.forEach(function(def, i){
            if (i) output.comma();
            def.print(output);
        });
        var p = output.parent();
        var in_for = p instanceof Cola.AST_For || p instanceof Cola.AST_ForIn;
        var avoid_semicolon = in_for && p.init === this;
        if (!avoid_semicolon)
            output.semicolon();
    });
    DEFPRINT(Cola.AST_Var, function(self, output){
        self._do_print(output, "var");
    });
    DEFPRINT(Cola.AST_Const, function(self, output){
        self._do_print(output, "const");
    });

    function parenthesize_for_noin(node, output, noin) {
        if (!noin) node.print(output);
        else try {
            // need to take some precautions here:
            //    https://github.com/mishoo/UglifyJS2/issues/60
            node.walk(new Cola.TreeWalker(function(node){
                if (node instanceof Cola.AST_Binary && node.operator == "in")
                    throw output;
            }));
            node.print(output);
        } catch(ex) {
            if (ex !== output) throw ex;
            node.print(output, true);
        }
    };

    DEFPRINT(Cola.AST_VarDef, function(self, output){
        self.name.print(output);
        if (self.value) {
            output.space();
            output.print("=");
            output.space();
            var p = output.parent(1);
            var noin = p instanceof Cola.AST_For || p instanceof Cola.AST_ForIn;
            parenthesize_for_noin(self.value, output, noin);
        }
    });

    /* -----[ other expressions ]----- */
    DEFPRINT(Cola.AST_Call, function(self, output){
        self.expression.print(output);
        if (self instanceof Cola.AST_New && no_constructor_parens(self, output))
            return;
        output.with_parens(function(){
            self.args.forEach(function(expr, i){
                if (i) output.comma();
                expr.print(output);
            });
        });
    });
    DEFPRINT(Cola.AST_New, function(self, output){
        output.print("new");
        output.space();
        Cola.AST_Call.prototype._codegen(self, output);
    });

    Cola.AST_Seq.DEFMETHOD("_do_print", function(output){
        this.car.print(output);
        if (this.cdr) {
            output.comma();
            if (output.should_break()) {
                output.newline();
                output.indent();
            }
            this.cdr.print(output);
        }
    });
    DEFPRINT(Cola.AST_Seq, function(self, output){
        self._do_print(output);
        // var p = output.parent();
        // if (p instanceof Cola.AST_Statement) {
        //     output.with_indent(output.next_indent(), function(){
        //         self._do_print(output);
        //     });
        // } else {
        //     self._do_print(output);
        // }
    });
    DEFPRINT(Cola.AST_Dot, function(self, output){
        var expr = self.expression;
        expr.print(output);
        if (expr instanceof Cola.AST_Number && expr.getValue() >= 0) {
            if (!/[xa-f.]/i.test(output.last())) {
                output.print(".");
            }
        }
        output.print(".");
        // the name after dot would be mapped about here.
        output.add_mapping(self.end);
        output.print_name(self.property);
    });
    DEFPRINT(Cola.AST_Sub, function(self, output){
        self.expression.print(output);
        output.print("[");
        self.property.print(output);
        output.print("]");
    });
    DEFPRINT(Cola.AST_UnaryPrefix, function(self, output){
        var op = self.operator;
        output.print(op);
        if (/^[a-z]/i.test(op))
            output.space();
        self.expression.print(output);
    });
    DEFPRINT(Cola.AST_UnaryPostfix, function(self, output){
        self.expression.print(output);
        output.print(self.operator);
    });
    DEFPRINT(Cola.AST_Binary, function(self, output){
        self.left.print(output);
        output.space();
        output.print(self.operator);
        if (self.operator == "<"
            && self.right instanceof Cola.AST_UnaryPrefix
            && self.right.operator == "!"
            && self.right.expression instanceof Cola.AST_UnaryPrefix
            && self.right.expression.operator == "--") {
            // space is mandatory to avoid outputting <!--
            // http://javascript.spec.whatwg.org/#comment-syntax
            output.print(" ");
        } else {
            // the space is optional depending on "beautify"
            output.space();
        }
        self.right.print(output);
    });
    DEFPRINT(Cola.AST_Conditional, function(self, output){
        self.condition.print(output);
        output.space();
        output.print("?");
        output.space();
        self.consequent.print(output);
        output.space();
        output.colon();
        self.alternative.print(output);
    });

    /* -----[ literals ]----- */
    DEFPRINT(Cola.AST_Array, function(self, output){
        output.with_square(function(){
            var a = self.elements, len = a.length;
            if (len > 0) output.space();
            a.forEach(function(exp, i){
                if (i) output.comma();
                exp.print(output);
                // If the final element is a hole, we need to make sure it
                // doesn't look like a trailing comma, by inserting an actual
                // trailing comma.
                if (i === len - 1 && exp instanceof Cola.AST_Hole)
                  output.comma();
            });
            if (len > 0) output.space();
        });
    });
    DEFPRINT(Cola.AST_Object, function(self, output){
        if (self.properties.length > 0) output.with_block(function(){
            self.properties.forEach(function(prop, i){
                if (i) {
                    output.print(",");
                    output.newline();
                }
                output.indent();
                prop.print(output);
            });
            output.newline();
        });
        else output.print("{}");
    });
    DEFPRINT(Cola.AST_ObjectKeyVal, function(self, output){
        var key = self.key;
        if (output.option("quote_keys")) {
            output.print_string(key + "");
        } else if ((typeof key == "number"
                    || !output.option("beautify")
                    && +key + "" == key)
                   && parseFloat(key) >= 0) {
            output.print(make_num(key));
        } else if (Cola.RESERVED_WORDS(key) ? output.option("screw_ie8") : Cola.is_identifier_string(key)) {
            output.print_name(key);
        } else {
            output.print_string(key);
        }
        output.colon();
        self.value.print(output);
    });
    DEFPRINT(Cola.AST_ObjectSetter, function(self, output){
        output.print("set");
        output.space();
        self.key.print(output);
        self.value._do_print(output, true);
    });
    DEFPRINT(Cola.AST_ObjectGetter, function(self, output){
        output.print("get");
        output.space();
        self.key.print(output);
        self.value._do_print(output, true);
    });
    DEFPRINT(Cola.AST_Symbol, function(self, output){
        var def = self.definition();
        output.print_name(def ? def.mangled_name || def.name : self.name);
    });
    DEFPRINT(Cola.AST_Undefined, function(self, output){
        output.print("void 0");
    });
    DEFPRINT(Cola.AST_Hole, Cola.noop);
    DEFPRINT(Cola.AST_Infinity, function(self, output){
        output.print("Infinity");
    });
    DEFPRINT(Cola.AST_NaN, function(self, output){
        output.print("NaN");
    });
    DEFPRINT(Cola.AST_This, function(self, output){
        output.print("this");
    });
    DEFPRINT(Cola.AST_Constant, function(self, output){
        output.print(self.getValue());
    });
    DEFPRINT(Cola.AST_String, function(self, output){
        output.print_string(self.getValue());
    });
    DEFPRINT(Cola.AST_Number, function(self, output){
        output.print(make_num(self.getValue()));
    });

    function regexp_safe_literal(code) {
        return [
            0x5c   , // \
            0x2f   , // /
            0x2e   , // .
            0x2b   , // +
            0x2a   , // *
            0x3f   , // ?
            0x28   , // (
            0x29   , // )
            0x5b   , // [
            0x5d   , // ]
            0x7b   , // {
            0x7d   , // }
            0x24   , // $
            0x5e   , // ^
            0x3a   , // :
            0x7c   , // |
            0x21   , // !
            0x0a   , // \n
            0x0d   , // \r
            0x00   , // \0
            0xfeff , // Unicode BOM
            0x2028 , // unicode "line separator"
            0x2029 , // unicode "paragraph separator"
        ].indexOf(code) < 0;
    };

    DEFPRINT(Cola.AST_RegExp, function(self, output){
        var str = self.getValue().toString();
        if (output.option("ascii_only")) {
            str = output.to_ascii(str);
        } else if (output.option("unescape_regexps")) {
            str = str.split("\\\\").map(function(str){
                return str.replace(/\\u[0-9a-fA-F]{4}|\\x[0-9a-fA-F]{2}/g, function(s){
                    var code = parseInt(s.substr(2), 16);
                    return regexp_safe_literal(code) ? String.fromCharCode(code) : s;
                });
            }).join("\\\\");
        }
        output.print(str);
        var p = output.parent();
        if (p instanceof Cola.AST_Binary && /^in/.test(p.operator) && p.left === self)
            output.print(" ");
    });

    function force_statement(stat, output) {
        if (output.option("bracketize")) {
            if (!stat || stat instanceof Cola.AST_EmptyStatement)
                output.print("{}");
            else if (stat instanceof Cola.AST_BlockStatement)
                stat.print(output);
            else output.with_block(function(){
                output.indent();
                stat.print(output);
                output.newline();
            });
        } else {
            if (!stat || stat instanceof Cola.AST_EmptyStatement)
                output.force_semicolon();
            else
                stat.print(output);
        }
    };

    // return true if the node at the top of the stack (that means the
    // innermost node in the current output) is lexically the first in
    // a statement.
    function first_in_statement(output) {
        var a = output.stack, i = a.length, node = a[--i], p = a[--i];
        while (i > 0) {
            if (p instanceof Cola.AST_Statement && p.body === node)
                return true;
            if ((p instanceof Cola.AST_Seq           && p.car === node        ) ||
                (p instanceof Cola.AST_Call          && p.expression === node && !(p instanceof Cola.AST_New) ) ||
                (p instanceof Cola.AST_Dot           && p.expression === node ) ||
                (p instanceof Cola.AST_Sub           && p.expression === node ) ||
                (p instanceof Cola.AST_Conditional   && p.condition === node  ) ||
                (p instanceof Cola.AST_Binary        && p.left === node       ) ||
                (p instanceof Cola.AST_UnaryPostfix  && p.expression === node ))
            {
                node = p;
                p = a[--i];
            } else {
                return false;
            }
        }
    };

    // self should be Cola.AST_New.  decide if we want to show parens or not.
    function no_constructor_parens(self, output) {
        return self.args.length == 0 && !output.option("beautify");
    };

    function best_of(a) {
        var best = a[0], len = best.length;
        for (var i = 1; i < a.length; ++i) {
            if (a[i].length < len) {
                best = a[i];
                len = best.length;
            }
        }
        return best;
    };

    function make_num(num) {
        var str = num.toString(10), a = [ str.replace(/^0\./, ".").replace('e+', 'e') ], m;
        if (Math.floor(num) === num) {
            if (num >= 0) {
                a.push("0x" + num.toString(16).toLowerCase(), // probably pointless
                       "0" + num.toString(8)); // same.
            } else {
                a.push("-0x" + (-num).toString(16).toLowerCase(), // probably pointless
                       "-0" + (-num).toString(8)); // same.
            }
            if ((m = /^(.*?)(0+)$/.exec(num))) {
                a.push(m[1] + "e" + m[2].length);
            }
        } else if ((m = /^0?\.(0+)(.*)$/.exec(num))) {
            a.push(m[2] + "e-" + (m[1].length + m[2].length),
                   str.substr(str.indexOf(".")));
        }
        return best_of(a);
    };

    function make_block(stmt, output) {
        if (stmt instanceof Cola.AST_BlockStatement) {
            stmt.print(output);
            return;
        }
        output.with_block(function(){
            output.indent();
            stmt.print(output);
            output.newline();
        });
    };

    /* -----[ source map generators ]----- */

    function DEFMAP(nodetype, generator) {
        nodetype.DEFMETHOD("add_source_map", function(stream){
            generator(this, stream);
        });
    };

    // We could easily add info for ALL nodes, but it seems to me that
    // would be quite wasteful, hence this Cola.noop in the base class.
    DEFMAP(Cola.AST_Node, Cola.noop);

    function basic_sourcemap_gen(self, output) {
        output.add_mapping(self.start);
    };

    // XXX: I'm not exactly sure if we need it for all of these nodes,
    // or if we should add even more.

    DEFMAP(Cola.AST_Directive, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Debugger, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Symbol, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Jump, basic_sourcemap_gen);
    DEFMAP(Cola.AST_StatementWithBody, basic_sourcemap_gen);
    DEFMAP(Cola.AST_LabeledStatement, Cola.noop); // since the label symbol will mark it
    DEFMAP(Cola.AST_Lambda, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Switch, basic_sourcemap_gen);
    DEFMAP(Cola.AST_SwitchBranch, basic_sourcemap_gen);
    DEFMAP(Cola.AST_BlockStatement, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Toplevel, Cola.noop);
    DEFMAP(Cola.AST_New, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Try, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Catch, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Finally, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Definitions, basic_sourcemap_gen);
    DEFMAP(Cola.AST_Constant, basic_sourcemap_gen);
    DEFMAP(Cola.AST_ObjectProperty, function(self, output){
        output.add_mapping(self.start, self.key);
    });

})();
