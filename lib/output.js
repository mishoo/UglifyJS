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

var EXPECT_DIRECTIVE = /^$|[;{][\s\n]*$/;

function is_some_comments(comment) {
    // multiline comment
    return comment.type == "comment2" && /@preserve|@license|@cc_on/i.test(comment.value);
}

function OutputStream(options) {

    options = defaults(options, {
        ascii_only       : false,
        beautify         : false,
        bracketize       : false,
        comments         : false,
        ecma             : 5,
        ie8              : false,
        indent_level     : 4,
        indent_start     : 0,
        inline_script    : true,
        keep_quoted_props: false,
        max_line_len     : false,
        preamble         : null,
        preserve_line    : false,
        quote_keys       : false,
        quote_style      : 0,
        semicolons       : true,
        shebang          : true,
        shorthand        : undefined,
        source_map       : null,
        webkit           : false,
        width            : 80,
        wrap_iife        : false,
    }, true);

    if (options.shorthand === undefined)
        options.shorthand = options.ecma > 5;

    // Convert comment option to RegExp if neccessary and set up comments filter
    var comment_filter = return_false; // Default case, throw all comments away
    if (options.comments) {
        var comments = options.comments;
        if (typeof options.comments === "string" && /^\/.*\/[a-zA-Z]*$/.test(options.comments)) {
            var regex_pos = options.comments.lastIndexOf("/");
            comments = new RegExp(
                options.comments.substr(1, regex_pos - 1),
                options.comments.substr(regex_pos + 1)
            );
        }
        if (comments instanceof RegExp) {
            comment_filter = function(comment) {
                return comment.type != "comment5" && comments.test(comment.value);
            };
        }
        else if (typeof comments === "function") {
            comment_filter = function(comment) {
                return comment.type != "comment5" && comments(this, comment);
            };
        }
        else if (comments === "some") {
            comment_filter = is_some_comments;
        } else { // NOTE includes "all" option
            comment_filter = return_true;
        }
    }

    var indentation = 0;
    var current_col = 0;
    var current_line = 1;
    var current_pos = 0;
    var OUTPUT = "";

    var to_utf8 = options.ascii_only ? function(str, identifier) {
        if (options.ecma >= 6) {
            str = str.replace(/[\ud800-\udbff][\udc00-\udfff]/g, function(ch) {
                var code = get_full_char_code(ch, 0).toString(16);
                return "\\u{" + code + "}";
            });
        }
        return str.replace(/[\u0000-\u001f\u007f-\uffff]/g, function(ch) {
            var code = ch.charCodeAt(0).toString(16);
            if (code.length <= 2 && !identifier) {
                while (code.length < 2) code = "0" + code;
                return "\\x" + code;
            } else {
                while (code.length < 4) code = "0" + code;
                return "\\u" + code;
            }
        });
    } : function(str) {
        return str.replace(/[\ud800-\udbff](?![\udc00-\udfff])/g, function(ch) {
            return "\\u" + ch.charCodeAt(0).toString(16);
        }).replace(/(^|[^\ud800-\udbff])([\udc00-\udfff])/g, function(match, prefix, ch) {
            return prefix + "\\u" + ch.charCodeAt(0).toString(16);
        });
    };

    function make_string(str, quote) {
        var dq = 0, sq = 0;
        str = str.replace(/[\\\b\f\n\r\v\t\x22\x27\u2028\u2029\0\ufeff]/g,
          function(s, i){
            switch (s) {
              case '"': ++dq; return '"';
              case "'": ++sq; return "'";
              case "\\": return "\\\\";
              case "\n": return "\\n";
              case "\r": return "\\r";
              case "\t": return "\\t";
              case "\b": return "\\b";
              case "\f": return "\\f";
              case "\x0B": return options.ie8 ? "\\x0B" : "\\v";
              case "\u2028": return "\\u2028";
              case "\u2029": return "\\u2029";
              case "\ufeff": return "\\ufeff";
              case "\0":
                  return /[0-9]/.test(get_full_char(str, i+1)) ? "\\x00" : "\\0";
            }
            return s;
        });
        function quote_single() {
            return "'" + str.replace(/\x27/g, "\\'") + "'";
        }
        function quote_double() {
            return '"' + str.replace(/\x22/g, '\\"') + '"';
        }
        function quote_template() {
            return '`' + str.replace(/`/g, '\\`') + '`';
        }
        str = to_utf8(str);
        if (quote === "`") return quote_template();
        switch (options.quote_style) {
          case 1:
            return quote_single();
          case 2:
            return quote_double();
          case 3:
            return quote == "'" ? quote_single() : quote_double();
          default:
            return dq > sq ? quote_single() : quote_double();
        }
    };

    function encode_string(str, quote) {
        var ret = make_string(str, quote);
        if (options.inline_script) {
            ret = ret.replace(/<\x2fscript([>\/\t\n\f\r ])/gi, "<\\/script$1");
            ret = ret.replace(/\x3c!--/g, "\\x3c!--");
            ret = ret.replace(/--\x3e/g, "--\\x3e");
        }
        return ret;
    };

    function make_name(name) {
        name = name.toString();
        name = to_utf8(name, true);
        return name;
    };

    function make_indent(back) {
        return repeat_string(" ", options.indent_start + indentation - back * options.indent_level);
    };

    /* -----[ beautification/minification ]----- */

    var might_need_space = false;
    var might_need_semicolon = false;
    var might_add_newline = 0;
    var last = "";
    var mapping_token, mapping_name, mappings = options.source_map && [];

    var do_add_mapping = mappings ? function() {
        mappings.forEach(function(mapping) {
            try {
                options.source_map.add(
                    mapping.token.file,
                    mapping.line, mapping.col,
                    mapping.token.line, mapping.token.col,
                    !mapping.name && mapping.token.type == "name" ? mapping.token.value : mapping.name
                );
            } catch(ex) {
                AST_Node.warn("Couldn't figure out mapping for {file}:{line},{col} → {cline},{ccol} [{name}]", {
                    file: mapping.token.file,
                    line: mapping.token.line,
                    col: mapping.token.col,
                    cline: mapping.line,
                    ccol: mapping.col,
                    name: mapping.name || ""
                })
            }
        });
        mappings = [];
    } : noop;

    var ensure_line_len = options.max_line_len ? function() {
        if (current_col > options.max_line_len) {
            if (might_add_newline) {
                var left = OUTPUT.slice(0, might_add_newline);
                var right = OUTPUT.slice(might_add_newline);
                if (mappings) {
                    var delta = right.length - current_col;
                    mappings.forEach(function(mapping) {
                        mapping.line++;
                        mapping.col += delta;
                    });
                }
                OUTPUT = left + "\n" + right;
                current_line++;
                current_pos++;
                current_col = right.length;
            }
            if (current_col > options.max_line_len) {
                AST_Node.warn("Output exceeds {max_line_len} characters", options);
            }
        }
        if (might_add_newline) {
            might_add_newline = 0;
            do_add_mapping();
        }
    } : noop;

    var requireSemicolonChars = makePredicate("( [ + * / - , . `");

    function print(str) {
        str = String(str);
        var ch = get_full_char(str, 0);
        var prev = get_full_char(last, last.length - 1);
        if (might_need_semicolon) {
            might_need_semicolon = false;

            if (prev == ":" && ch == "}" || (!ch || ";}".indexOf(ch) < 0) && prev != ";") {
                if (options.semicolons || requireSemicolonChars(ch)) {
                    OUTPUT += ";";
                    current_col++;
                    current_pos++;
                } else {
                    ensure_line_len();
                    OUTPUT += "\n";
                    current_pos++;
                    current_line++;
                    current_col = 0;

                    if (/^\s+$/.test(str)) {
                        // reset the semicolon flag, since we didn't print one
                        // now and might still have to later
                        might_need_semicolon = true;
                    }
                }

                if (!options.beautify)
                    might_need_space = false;
            }
        }

        if (!options.beautify && options.preserve_line && stack[stack.length - 1]) {
            var target_line = stack[stack.length - 1].start.line;
            while (current_line < target_line) {
                ensure_line_len();
                OUTPUT += "\n";
                current_pos++;
                current_line++;
                current_col = 0;
                might_need_space = false;
            }
        }

        if (might_need_space) {
            if ((is_identifier_char(prev)
                    && (is_identifier_char(ch) || ch == "\\"))
                || (ch == "/" && ch == prev)
                || ((ch == "+" || ch == "-") && ch == last))
            {
                OUTPUT += " ";
                current_col++;
                current_pos++;
            }
            might_need_space = false;
        }

        if (mapping_token) {
            mappings.push({
                token: mapping_token,
                name: mapping_name,
                line: current_line,
                col: current_col
            });
            mapping_token = false;
            if (!might_add_newline) do_add_mapping();
        }

        OUTPUT += str;
        current_pos += str.length;
        var a = str.split(/\r?\n/), n = a.length - 1;
        current_line += n;
        current_col += a[0].length;
        if (n > 0) {
            ensure_line_len();
            current_col = a[n].length;
        }
        last = str;
    };

    var star = function(){
        print("*");
    }

    var space = options.beautify ? function() {
        print(" ");
    } : function() {
        might_need_space = true;
    };

    var indent = options.beautify ? function(half) {
        if (options.beautify) {
            print(make_indent(half ? 0.5 : 0));
        }
    } : noop;

    var with_indent = options.beautify ? function(col, cont) {
        if (col === true) col = next_indent();
        var save_indentation = indentation;
        indentation = col;
        var ret = cont();
        indentation = save_indentation;
        return ret;
    } : function(col, cont) { return cont() };

    var newline = options.beautify ? function() {
        print("\n");
    } : options.max_line_len ? function() {
        ensure_line_len();
        might_add_newline = OUTPUT.length;
    } : noop;

    var semicolon = options.beautify ? function() {
        print(";");
    } : function() {
        might_need_semicolon = true;
    };

    function force_semicolon() {
        might_need_semicolon = false;
        print(";");
    };

    function next_indent() {
        return indentation + options.indent_level;
    };

    function with_block(cont) {
        var ret;
        print("{");
        newline();
        with_indent(next_indent(), function(){
            ret = cont();
        });
        indent();
        print("}");
        return ret;
    };

    function with_parens(cont) {
        print("(");
        //XXX: still nice to have that for argument lists
        //var ret = with_indent(current_col, cont);
        var ret = cont();
        print(")");
        return ret;
    };

    function with_square(cont) {
        print("[");
        //var ret = with_indent(current_col, cont);
        var ret = cont();
        print("]");
        return ret;
    };

    function comma() {
        print(",");
        space();
    };

    function colon() {
        print(":");
        space();
    };

    var add_mapping = mappings ? function(token, name) {
        mapping_token = token;
        mapping_name = name;
    } : noop;

    function get() {
        if (might_add_newline) {
            ensure_line_len();
        }
        return OUTPUT;
    };

    var stack = [];
    return {
        get             : get,
        toString        : get,
        indent          : indent,
        indentation     : function() { return indentation },
        current_width   : function() { return current_col - indentation },
        should_break    : function() { return options.width && this.current_width() >= options.width },
        newline         : newline,
        print           : print,
        star            : star,
        space           : space,
        comma           : comma,
        colon           : colon,
        last            : function() { return last },
        semicolon       : semicolon,
        force_semicolon : force_semicolon,
        to_utf8         : to_utf8,
        print_name      : function(name) { print(make_name(name)) },
        print_string    : function(str, quote, escape_directive) {
            var encoded = encode_string(str, quote);
            if (escape_directive === true && encoded.indexOf("\\") === -1) {
                // Insert semicolons to break directive prologue
                if (!EXPECT_DIRECTIVE.test(OUTPUT)) {
                    force_semicolon();
                }
                force_semicolon();
            }
            print(encoded);
        },
        print_template_string_chars: function(str) {
            var encoded = encode_string(str, '`').replace(/\${/g, "\\${");
            return print(encoded.substr(1, encoded.length - 2));
        },
        encode_string   : encode_string,
        next_indent     : next_indent,
        with_indent     : with_indent,
        with_block      : with_block,
        with_parens     : with_parens,
        with_square     : with_square,
        add_mapping     : add_mapping,
        option          : function(opt) { return options[opt] },
        comment_filter  : comment_filter,
        line            : function() { return current_line },
        col             : function() { return current_col },
        pos             : function() { return current_pos },
        push_node       : function(node) { stack.push(node) },
        pop_node        : function() { return stack.pop() },
        parent          : function(n) {
            return stack[stack.length - 2 - (n || 0)];
        }
    };

};

/* -----[ code generators ]----- */

(function(){

    /* -----[ utils ]----- */

    function DEFPRINT(nodetype, generator) {
        nodetype.DEFMETHOD("_codegen", generator);
    };

    var in_directive = false;
    var active_scope = null;
    var use_asm = null;

    AST_Node.DEFMETHOD("print", function(stream, force_parens){
        var self = this, generator = self._codegen;
        if (self instanceof AST_Scope) {
            active_scope = self;
        }
        else if (!use_asm && self instanceof AST_Directive && self.value == "use asm") {
            use_asm = active_scope;
        }
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
        if (self === use_asm) {
            use_asm = null;
        }
    });
    AST_Node.DEFMETHOD("_print", AST_Node.prototype.print);

    AST_Node.DEFMETHOD("print_to_string", function(options){
        var s = OutputStream(options);
        if (!options) s._readonly = true;
        this.print(s);
        return s.get();
    });

    /* -----[ comments ]----- */

    AST_Node.DEFMETHOD("add_comments", function(output){
        if (output._readonly) return;
        var self = this;
        var start = self.start;
        if (start && !start._comments_dumped) {
            start._comments_dumped = true;
            var comments = start.comments_before || [];

            // XXX: ugly fix for https://github.com/mishoo/UglifyJS2/issues/112
            //               and https://github.com/mishoo/UglifyJS2/issues/372
            if (self instanceof AST_Exit && self.value) {
                self.value.walk(new TreeWalker(function(node){
                    if (node.start && node.start.comments_before) {
                        comments = comments.concat(node.start.comments_before);
                        node.start.comments_before = [];
                    }
                    if (node instanceof AST_Function ||
                        node instanceof AST_Array ||
                        node instanceof AST_Object)
                    {
                        return true; // don't go inside.
                    }
                }));
            }

            if (output.pos() == 0) {
                if (comments.length > 0 && output.option("shebang") && comments[0].type == "comment5") {
                    output.print("#!" + comments.shift().value + "\n");
                    output.indent();
                }
                var preamble = output.option("preamble");
                if (preamble) {
                    output.print(preamble.replace(/\r\n?|[\n\u2028\u2029]|\s*$/g, "\n"));
                }
            }

            comments = comments.filter(output.comment_filter, self);

            // Keep single line comments after nlb, after nlb
            if (!output.option("beautify") && comments.length > 0 &&
                /comment[134]/.test(comments[0].type) &&
                output.col() !== 0 && comments[0].nlb)
            {
                output.print("\n");
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
    });

    /* -----[ PARENTHESES ]----- */

    function PARENS(nodetype, func) {
        if (Array.isArray(nodetype)) {
            nodetype.forEach(function(nodetype){
                PARENS(nodetype, func);
            });
        } else {
            nodetype.DEFMETHOD("needs_parens", func);
        }
    };

    PARENS(AST_Node, function(){
        return false;
    });

    // a function expression needs parens around it when it's provably
    // the first token to appear in a statement.
    PARENS(AST_Function, function(output){
        if (first_in_statement(output)) {
            return true;
        }

        if (output.option('webkit')) {
            var p = output.parent();
            if (p instanceof AST_PropAccess && p.expression === this) {
                return true;
            }
        }

        if (output.option('wrap_iife')) {
            var p = output.parent();
            return p instanceof AST_Call && p.expression === this;
        }

        return false;
    });

    PARENS(AST_Arrow, function(output){
        var p = output.parent();
        return p instanceof AST_PropAccess && p.expression === this;
    });

    PARENS(AST_ClassExpression, function(output){
        return output.parent() instanceof AST_SimpleStatement;
    });

    // same goes for an object literal, because otherwise it would be
    // interpreted as a block of code.
    PARENS(AST_Object, function(output){
        return first_in_statement(output);
    });

    PARENS(AST_Unary, function(output){
        var p = output.parent();
        return p instanceof AST_PropAccess && p.expression === this
            || p instanceof AST_Call && p.expression === this
            || p instanceof AST_Binary
                && p.operator === "**"
                && this instanceof AST_UnaryPrefix
                && p.left === this
                && this.operator !== "++"
                && this.operator !== "--";
    });

    PARENS(AST_Await, function(output){
        var p = output.parent();
        return p instanceof AST_PropAccess && p.expression === this
            || p instanceof AST_Call && p.expression === this;
    });

    PARENS(AST_Sequence, function(output){
        var p = output.parent();
        return p instanceof AST_Call                          // (foo, bar)() or foo(1, (2, 3), 4)
            || p instanceof AST_Unary                         // !(foo, bar, baz)
            || p instanceof AST_Binary                        // 1 + (2, 3) + 4 ==> 8
            || p instanceof AST_VarDef                        // var a = (1, 2), b = a + a; ==> b == 4
            || p instanceof AST_PropAccess                    // (1, {foo:2}).foo or (1, {foo:2})["foo"] ==> 2
            || p instanceof AST_Array                         // [ 1, (2, 3), 4 ] ==> [ 1, 3, 4 ]
            || p instanceof AST_ObjectProperty                // { foo: (1, 2) }.foo ==> 2
            || p instanceof AST_Conditional                   /* (false, true) ? (a = 10, b = 20) : (c = 30)
                                                               * ==> 20 (side effect, set a := 10 and b := 20) */
            || p instanceof AST_Arrow                         // x => (x, x)
            || p instanceof AST_DefaultAssign                 // x => (x = (0, function(){}))
            || p instanceof AST_Expansion                     // [...(a, b)]
        ;
    });

    PARENS(AST_Binary, function(output){
        var p = output.parent();
        // (foo && bar)()
        if (p instanceof AST_Call && p.expression === this)
            return true;
        // typeof (foo && bar)
        if (p instanceof AST_Unary)
            return true;
        // (foo && bar)["prop"], (foo && bar).prop
        if (p instanceof AST_PropAccess && p.expression === this)
            return true;
        // this deals with precedence: 3 * (2 + 1)
        if (p instanceof AST_Binary) {
            var po = p.operator, pp = PRECEDENCE[po];
            var so = this.operator, sp = PRECEDENCE[so];
            if (pp > sp
                || (pp == sp
                    && this === p.right)) {
                return true;
            }
        }
    });

    PARENS(AST_Yield, function(output){
        var p = output.parent();
        // (yield 1) + (yield 2)
        // a = yield 3
        if (p instanceof AST_Binary && p.operator !== "=")
            return true;
        // (yield 1) ? yield 2 : yield 3
        if (p instanceof AST_Conditional && p.condition === this)
            return true;
        // -(yield 4)
        if (p instanceof AST_Unary)
            return true;
        // (yield x).foo
        // (yield x)['foo']
        if (p instanceof AST_PropAccess && p.expression === this)
            return true;
    });

    PARENS(AST_PropAccess, function(output){
        var p = output.parent();
        if (p instanceof AST_New && p.expression === this) {
            // i.e. new (foo.bar().baz)
            //
            // if there's one call into this subtree, then we need
            // parens around it too, otherwise the call will be
            // interpreted as passing the arguments to the upper New
            // expression.
            var parens = false;
            this.walk(new TreeWalker(function(node) {
                if (parens || node instanceof AST_Scope) return true;
                if (node instanceof AST_Call) {
                    parens = true;
                    return true;
                }
            }));
            return parens;
        }
    });

    PARENS(AST_Call, function(output){
        var p = output.parent(), p1;
        if (p instanceof AST_New && p.expression === this)
            return true;

        // workaround for Safari bug.
        // https://bugs.webkit.org/show_bug.cgi?id=123506
        return this.expression instanceof AST_Function
            && p instanceof AST_PropAccess
            && p.expression === this
            && (p1 = output.parent(1)) instanceof AST_Assign
            && p1.left === p;
    });

    PARENS(AST_New, function(output){
        var p = output.parent();
        if (!need_constructor_parens(this, output)
            && (p instanceof AST_PropAccess // (new Date).getTime(), (new Date)["getTime"]()
                || p instanceof AST_Call && p.expression === this)) // (new foo)(bar)
            return true;
    });

    PARENS(AST_Number, function(output){
        var p = output.parent();
        if (p instanceof AST_PropAccess && p.expression === this) {
            var value = this.getValue();
            if (value < 0 || /^0/.test(make_num(value))) {
                return true;
            }
        }
    });

    PARENS([ AST_Assign, AST_Conditional ], function(output){
        var p = output.parent();
        // !(a = false) → true
        if (p instanceof AST_Unary)
            return true;
        // 1 + (a = 2) + 3 → 6, side effect setting a = 2
        if (p instanceof AST_Binary && !(p instanceof AST_Assign))
            return true;
        // (a = func)() —or— new (a = Object)()
        if (p instanceof AST_Call && p.expression === this)
            return true;
        // (a = foo) ? bar : baz
        if (p instanceof AST_Conditional && p.condition === this)
            return true;
        // (a = foo)["prop"] —or— (a = foo).prop
        if (p instanceof AST_PropAccess && p.expression === this)
            return true;
        // ({a, b} = {a: 1, b: 2}), a destructuring assignment
        if (this instanceof AST_Assign && this.left instanceof AST_Destructuring && this.left.is_array === false)
            return true;
    });

    /* -----[ PRINTERS ]----- */

    DEFPRINT(AST_Directive, function(self, output){
        output.print_string(self.value, self.quote);
        output.semicolon();
    });

    DEFPRINT(AST_Expansion, function (self, output) {
        output.print('...');
        self.expression.print(output);
    });

    DEFPRINT(AST_Destructuring, function (self, output) {
        output.print(self.is_array ? "[" : "{");
        var len = self.names.length;
        self.names.forEach(function (name, i) {
            if (i > 0) output.comma();
            name.print(output);
            // If the final element is a hole, we need to make sure it
            // doesn't look like a trailing comma, by inserting an actual
            // trailing comma.
            if (i == len - 1 && name instanceof AST_Hole) output.comma();
        });
        output.print(self.is_array ? "]" : "}");
    });

    DEFPRINT(AST_Debugger, function(self, output){
        output.print("debugger");
        output.semicolon();
    });

    /* -----[ statements ]----- */

    function display_body(body, is_toplevel, output, allow_directives) {
        var last = body.length - 1;
        in_directive = allow_directives;
        body.forEach(function(stmt, i){
            if (in_directive === true && !(stmt instanceof AST_Directive ||
                stmt instanceof AST_EmptyStatement ||
                (stmt instanceof AST_SimpleStatement && stmt.body instanceof AST_String)
            )) {
                in_directive = false;
            }
            if (!(stmt instanceof AST_EmptyStatement)) {
                output.indent();
                stmt.print(output);
                if (!(i == last && is_toplevel)) {
                    output.newline();
                    if (is_toplevel) output.newline();
                }
            }
            if (in_directive === true &&
                stmt instanceof AST_SimpleStatement &&
                stmt.body instanceof AST_String
            ) {
                in_directive = false;
            }
        });
        in_directive = false;
    };

    AST_StatementWithBody.DEFMETHOD("_do_print_body", function(output){
        force_statement(this.body, output);
    });

    DEFPRINT(AST_Statement, function(self, output){
        self.body.print(output);
        output.semicolon();
    });
    DEFPRINT(AST_Toplevel, function(self, output){
        display_body(self.body, true, output, true);
        output.print("");
    });
    DEFPRINT(AST_LabeledStatement, function(self, output){
        self.label.print(output);
        output.colon();
        self.body.print(output);
    });
    DEFPRINT(AST_SimpleStatement, function(self, output){
        self.body.print(output);
        output.semicolon();
    });
    function print_bracketed(body, output, allow_directives) {
        if (body.length > 0) output.with_block(function(){
            display_body(body, false, output, allow_directives);
        });
        else output.print("{}");
    };
    DEFPRINT(AST_BlockStatement, function(self, output){
        print_bracketed(self.body, output);
    });
    DEFPRINT(AST_EmptyStatement, function(self, output){
        output.semicolon();
    });
    DEFPRINT(AST_Do, function(self, output){
        output.print("do");
        output.space();
        make_block(self.body, output);
        output.space();
        output.print("while");
        output.space();
        output.with_parens(function(){
            self.condition.print(output);
        });
        output.semicolon();
    });
    DEFPRINT(AST_While, function(self, output){
        output.print("while");
        output.space();
        output.with_parens(function(){
            self.condition.print(output);
        });
        output.space();
        self._do_print_body(output);
    });
    DEFPRINT(AST_For, function(self, output){
        output.print("for");
        output.space();
        output.with_parens(function(){
            if (self.init) {
                if (self.init instanceof AST_Definitions) {
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
    DEFPRINT(AST_ForIn, function(self, output){
        output.print("for");
        output.space();
        output.with_parens(function(){
            self.init.print(output);
            output.space();
            if (self instanceof AST_ForOf) {
                output.print("of");
            } else {
                output.print("in");
            }
            output.space();
            self.object.print(output);
        });
        output.space();
        self._do_print_body(output);
    });
    DEFPRINT(AST_With, function(self, output){
        output.print("with");
        output.space();
        output.with_parens(function(){
            self.expression.print(output);
        });
        output.space();
        self._do_print_body(output);
    });

    /* -----[ functions ]----- */
    AST_Lambda.DEFMETHOD("_do_print", function(output, nokeyword){
        var self = this;
        if (!nokeyword) {
            if (self.async) {
                output.print("async");
                output.space();
            }
            output.print("function");
            if (self.is_generator) {
                output.star();
            }
            if (self.name) {
                output.space();
            }
        }
        if (self.name instanceof AST_Symbol) {
            self.name.print(output);
        } else if (nokeyword && self.name instanceof AST_Node) {
            output.with_square(function() {
                self.name.print(output); // Computed method name
            });
        }
        output.with_parens(function(){
            self.argnames.forEach(function(arg, i){
                if (i) output.comma();
                arg.print(output);
            });
        });
        output.space();
        print_bracketed(self.body, output, true);
    });
    DEFPRINT(AST_Lambda, function(self, output){
        self._do_print(output);
    });

    DEFPRINT(AST_PrefixedTemplateString, function(self, output) {
        self.prefix.print(output);
        self.template_string.print(output);
    });
    DEFPRINT(AST_TemplateString, function(self, output) {
        var is_tagged = output.parent() instanceof AST_PrefixedTemplateString;

        output.print("`");
        for (var i = 0; i < self.segments.length; i++) {
            if (!(self.segments[i] instanceof AST_TemplateSegment)) {
                output.print("${");
                self.segments[i].print(output);
                output.print("}");
            } else if (is_tagged) {
                output.print(self.segments[i].raw);
            } else {
                output.print_template_string_chars(self.segments[i].value);
            }
        }
        output.print("`");
    });

    AST_Arrow.DEFMETHOD("_do_print", function(output){
        var self = this;
        var parent = output.parent();
        var needs_parens = parent instanceof AST_Binary ||
            parent instanceof AST_Unary ||
            (parent instanceof AST_Call && self === parent.expression);
        if (needs_parens) { output.print("(") }
        if (self.async) {
            output.print("async");
            output.space();
        }
        if (self.argnames.length === 1 && self.argnames[0] instanceof AST_Symbol) {
            self.argnames[0].print(output);
        } else {
            output.with_parens(function(){
                self.argnames.forEach(function(arg, i){
                    if (i) output.comma();
                    arg.print(output);
                });
            });
        }
        output.space();
        output.print('=>');
        output.space();
        if (self.body instanceof AST_Node) {
            self.body.print(output);
        } else {
            print_bracketed(self.body, output);
        }
        if (needs_parens) { output.print(")") }
    });

    /* -----[ exits ]----- */
    AST_Exit.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        if (this.value) {
            output.space();
            this.value.print(output);
        }
        output.semicolon();
    });
    DEFPRINT(AST_Return, function(self, output){
        self._do_print(output, "return");
    });
    DEFPRINT(AST_Throw, function(self, output){
        self._do_print(output, "throw");
    });

    /* -----[ yield ]----- */

    DEFPRINT(AST_Yield, function(self, output){
        var star = self.is_star ? "*" : "";
        output.print("yield" + star);
        if (self.expression) {
            output.space();
            self.expression.print(output);
        }
    });

    DEFPRINT(AST_Await, function(self, output){
        output.print("await");
        output.space();
        var e = self.expression;
        var parens = !(
               e instanceof AST_Call
            || e instanceof AST_SymbolRef
            || e instanceof AST_PropAccess
            || e instanceof AST_Unary
            || e instanceof AST_Constant
        );
        if (parens) output.print("(");
        self.expression.print(output);
        if (parens) output.print(")");
    });

    /* -----[ loop control ]----- */
    AST_LoopControl.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        if (this.label) {
            output.space();
            this.label.print(output);
        }
        output.semicolon();
    });
    DEFPRINT(AST_Break, function(self, output){
        self._do_print(output, "break");
    });
    DEFPRINT(AST_Continue, function(self, output){
        self._do_print(output, "continue");
    });

    /* -----[ if ]----- */
    function make_then(self, output) {
        var b = self.body;
        if (output.option("bracketize")
            || output.option("ie8") && b instanceof AST_Do)
            return make_block(b, output);
        // The squeezer replaces "block"-s that contain only a single
        // statement with the statement itself; technically, the AST
        // is correct, but this can create problems when we output an
        // IF having an ELSE clause where the THEN clause ends in an
        // IF *without* an ELSE block (then the outer ELSE would refer
        // to the inner IF).  This function checks for this case and
        // adds the block brackets if needed.
        if (!b) return output.force_semicolon();
        while (true) {
            if (b instanceof AST_If) {
                if (!b.alternative) {
                    make_block(self.body, output);
                    return;
                }
                b = b.alternative;
            }
            else if (b instanceof AST_StatementWithBody) {
                b = b.body;
            }
            else break;
        }
        force_statement(self.body, output);
    };
    DEFPRINT(AST_If, function(self, output){
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
            if (self.alternative instanceof AST_If)
                self.alternative.print(output);
            else
                force_statement(self.alternative, output);
        } else {
            self._do_print_body(output);
        }
    });

    /* -----[ switch ]----- */
    DEFPRINT(AST_Switch, function(self, output){
        output.print("switch");
        output.space();
        output.with_parens(function(){
            self.expression.print(output);
        });
        output.space();
        var last = self.body.length - 1;
        if (last < 0) output.print("{}");
        else output.with_block(function(){
            self.body.forEach(function(branch, i){
                output.indent(true);
                branch.print(output);
                if (i < last && branch.body.length > 0)
                    output.newline();
            });
        });
    });
    AST_SwitchBranch.DEFMETHOD("_do_print_body", function(output){
        output.newline();
        this.body.forEach(function(stmt){
            output.indent();
            stmt.print(output);
            output.newline();
        });
    });
    DEFPRINT(AST_Default, function(self, output){
        output.print("default:");
        self._do_print_body(output);
    });
    DEFPRINT(AST_Case, function(self, output){
        output.print("case");
        output.space();
        self.expression.print(output);
        output.print(":");
        self._do_print_body(output);
    });

    /* -----[ exceptions ]----- */
    DEFPRINT(AST_Try, function(self, output){
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
    DEFPRINT(AST_Catch, function(self, output){
        output.print("catch");
        output.space();
        output.with_parens(function(){
            self.argname.print(output);
        });
        output.space();
        print_bracketed(self.body, output);
    });
    DEFPRINT(AST_Finally, function(self, output){
        output.print("finally");
        output.space();
        print_bracketed(self.body, output);
    });

    /* -----[ var/const ]----- */
    AST_Definitions.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        output.space();
        this.definitions.forEach(function(def, i){
            if (i) output.comma();
            def.print(output);
        });
        var p = output.parent();
        var in_for = p instanceof AST_For || p instanceof AST_ForIn;
        var avoid_semicolon = in_for && p.init === this;
        if (!avoid_semicolon)
            output.semicolon();
    });
    DEFPRINT(AST_Let, function(self, output){
        self._do_print(output, "let");
    });
    DEFPRINT(AST_Var, function(self, output){
        self._do_print(output, "var");
    });
    DEFPRINT(AST_Const, function(self, output){
        self._do_print(output, "const");
    });
    DEFPRINT(AST_Import, function(self, output) {
        output.print("import");
        output.space();
        if (self.imported_name) {
            self.imported_name.print(output);
        }
        if (self.imported_name && self.imported_names) {
            output.print(",");
            output.space();
        }
        if (self.imported_names) {
            if (self.imported_names.length === 1 && self.imported_names[0].foreign_name.name === "*") {
                self.imported_names[0].print(output);
            } else {
                output.print("{");
                self.imported_names.forEach(function (name_import, i) {
                    output.space();
                    name_import.print(output);
                    if (i < self.imported_names.length - 1) {
                        output.print(",");
                    }
                });
                output.space();
                output.print("}");
            }
        }
        if (self.imported_name || self.imported_names) {
            output.space();
            output.print("from")
            output.space();
        }
        self.module_name.print(output);
        output.semicolon();
    });

    DEFPRINT(AST_NameMapping, function(self, output) {
        var is_import = output.parent() instanceof AST_Import;
        var definition = self.name.definition();
        var names_are_different =
            (definition && definition.mangled_name || self.name.name) !==
            self.foreign_name.name;
        if (names_are_different) {
            if (is_import) {
                output.print(self.foreign_name.name);
            } else {
                self.name.print(output);
            }
            output.space();
            output.print("as");
            output.space();
            if (is_import) {
                self.name.print(output);
            } else {
                output.print(self.foreign_name.name);
            }
        } else {
            self.name.print(output);
        }
    });

    DEFPRINT(AST_Export, function(self, output) {
        output.print("export");
        output.space();
        if (self.is_default) {
            output.print("default");
            output.space();
        }
        if (self.exported_names) {
            if (self.exported_names.length === 1 && self.exported_names[0].name.name === "*") {
                self.exported_names[0].print(output);
            } else {
                output.print("{");
                self.exported_names.forEach(function(name_export, i) {
                    output.space();
                    name_export.print(output);
                    if (i < self.exported_names.length - 1) {
                        output.print(",");
                    }
                });
                output.space();
                output.print("}");
            }
        }
        else if (self.exported_value) {
            self.exported_value.print(output);
        } else if (self.exported_definition) {
            self.exported_definition.print(output);
            if (self.exported_definition instanceof AST_Definitions) return;
        }
        if (self.module_name) {
            output.space();
            output.print("from");
            output.space();
            self.module_name.print(output);
        }
        output.semicolon();
    });

    function parenthesize_for_noin(node, output, noin) {
        var parens = false;
        // need to take some precautions here:
        //    https://github.com/mishoo/UglifyJS2/issues/60
        if (noin) node.walk(new TreeWalker(function(node) {
            if (parens || node instanceof AST_Scope) return true;
            if (node instanceof AST_Binary && node.operator == "in") {
                parens = true;
                return true;
            }
        }));
        node.print(output, parens);
    };

    DEFPRINT(AST_VarDef, function(self, output){
        self.name.print(output);
        if (self.value) {
            output.space();
            output.print("=");
            output.space();
            var p = output.parent(1);
            var noin = p instanceof AST_For || p instanceof AST_ForIn;
            parenthesize_for_noin(self.value, output, noin);
        }
    });

    /* -----[ other expressions ]----- */
    DEFPRINT(AST_Call, function(self, output){
        self.expression.print(output);
        if (self instanceof AST_New && !need_constructor_parens(self, output))
            return;
        if (self.expression instanceof AST_Call || self.expression instanceof AST_Lambda) {
            output.add_mapping(self.start);
        }
        output.with_parens(function(){
            self.args.forEach(function(expr, i){
                if (i) output.comma();
                expr.print(output);
            });
        });
    });
    DEFPRINT(AST_New, function(self, output){
        output.print("new");
        output.space();
        AST_Call.prototype._codegen(self, output);
    });

    AST_Sequence.DEFMETHOD("_do_print", function(output){
        this.expressions.forEach(function(node, index) {
            if (index > 0) {
                output.comma();
                if (output.should_break()) {
                    output.newline();
                    output.indent();
                }
            }
            node.print(output);
        });
    });
    DEFPRINT(AST_Sequence, function(self, output){
        self._do_print(output);
        // var p = output.parent();
        // if (p instanceof AST_Statement) {
        //     output.with_indent(output.next_indent(), function(){
        //         self._do_print(output);
        //     });
        // } else {
        //     self._do_print(output);
        // }
    });
    DEFPRINT(AST_Dot, function(self, output){
        var expr = self.expression;
        expr.print(output);
        var prop = self.property;
        if (output.option("ie8") && RESERVED_WORDS(prop)) {
            output.print("[");
            output.add_mapping(self.end);
            output.print_string(prop);
            output.print("]");
        } else {
            if (expr instanceof AST_Number && expr.getValue() >= 0) {
                if (!/[xa-f.)]/i.test(output.last())) {
                    output.print(".");
                }
            }
            output.print(".");
            // the name after dot would be mapped about here.
            output.add_mapping(self.end);
            output.print_name(prop);
        }
    });
    DEFPRINT(AST_Sub, function(self, output){
        self.expression.print(output);
        output.print("[");
        self.property.print(output);
        output.print("]");
    });
    DEFPRINT(AST_UnaryPrefix, function(self, output){
        var op = self.operator;
        output.print(op);
        if (/^[a-z]/i.test(op)
            || (/[+-]$/.test(op)
                && self.expression instanceof AST_UnaryPrefix
                && /^[+-]/.test(self.expression.operator))) {
            output.space();
        }
        self.expression.print(output);
    });
    DEFPRINT(AST_UnaryPostfix, function(self, output){
        self.expression.print(output);
        output.print(self.operator);
    });
    DEFPRINT(AST_Binary, function(self, output){
        var op = self.operator;
        self.left.print(output);
        if (op[0] == ">" /* ">>" ">>>" ">" ">=" */
            && self.left instanceof AST_UnaryPostfix
            && self.left.operator == "--") {
            // space is mandatory to avoid outputting -->
            output.print(" ");
        } else {
            // the space is optional depending on "beautify"
            output.space();
        }
        output.print(op);
        if ((op == "<" || op == "<<")
            && self.right instanceof AST_UnaryPrefix
            && self.right.operator == "!"
            && self.right.expression instanceof AST_UnaryPrefix
            && self.right.expression.operator == "--") {
            // space is mandatory to avoid outputting <!--
            output.print(" ");
        } else {
            // the space is optional depending on "beautify"
            output.space();
        }
        self.right.print(output);
    });
    DEFPRINT(AST_Conditional, function(self, output){
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
    DEFPRINT(AST_Array, function(self, output){
        output.with_square(function(){
            var a = self.elements, len = a.length;
            if (len > 0) output.space();
            a.forEach(function(exp, i){
                if (i) output.comma();
                exp.print(output);
                // If the final element is a hole, we need to make sure it
                // doesn't look like a trailing comma, by inserting an actual
                // trailing comma.
                if (i === len - 1 && exp instanceof AST_Hole)
                  output.comma();
            });
            if (len > 0) output.space();
        });
    });
    DEFPRINT(AST_Object, function(self, output){
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
    DEFPRINT(AST_Class, function(self, output){
        output.print("class");
        output.space();
        if (self.name) {
            self.name.print(output);
            output.space();
        }
        if (self.extends) {
            var parens = (
                   !(self.extends instanceof AST_SymbolRef)
                && !(self.extends instanceof AST_PropAccess)
                && !(self.extends instanceof AST_ClassExpression)
                && !(self.extends instanceof AST_Function)
            );
            output.print("extends");
            if (parens) {
                output.print("(");
            } else {
                output.space();
            }
            self.extends.print(output);
            if (parens) {
                output.print(")");
            } else {
                output.space();
            }
        }
        if (self.properties.length > 0) output.with_block(function(){
            self.properties.forEach(function(prop, i){
                if (i) {
                    output.newline();
                }
                output.indent();
                prop.print(output);
            });
            output.newline();
        });
        else output.print("{}");
    });
    DEFPRINT(AST_NewTarget, function(self, output) {
        output.print("new.target");
    });

    function print_property_name(key, quote, output) {
        if (output.option("quote_keys")) {
            output.print_string(key + "");
        } else if ((typeof key == "number"
                    || !output.option("beautify")
                    && +key + "" == key)
                   && parseFloat(key) >= 0) {
            output.print(make_num(key));
        } else if (RESERVED_WORDS(key) ? !output.option("ie8") : is_identifier_string(key)) {
            if (quote && output.option("keep_quoted_props")) {
                output.print_string(key, quote);
            } else {
                output.print_name(key);
            }
        } else {
            output.print_string(key, quote);
        }
    }

    DEFPRINT(AST_ObjectKeyVal, function(self, output){
        function get_name(self) {
            var def = self.definition();
            return def ? def.mangled_name || def.name : self.name;
        }

        var allowShortHand = output.option("shorthand");
        if (allowShortHand &&
            self.value instanceof AST_Symbol &&
            is_identifier_string(self.key) &&
            get_name(self.value) === self.key &&
            is_identifier(self.key)
        ) {
            print_property_name(self.key, self.quote, output);

        } else if (allowShortHand &&
            self.value instanceof AST_DefaultAssign &&
            self.value.left instanceof AST_Symbol &&
            is_identifier_string(self.key) &&
            get_name(self.value.left) === self.key
        ) {
            print_property_name(self.key, self.quote, output);
            output.space();
            output.print("=");
            output.space();
            self.value.right.print(output);
        } else {
            if (!(self.key instanceof AST_Node)) {
                print_property_name(self.key, self.quote, output);
            } else {
                output.with_square(function() {
                    self.key.print(output);
                });
            }
            output.colon();
            self.value.print(output);
        }
    });
    AST_ObjectProperty.DEFMETHOD("_print_getter_setter", function(type, output) {
        var self = this;
        if (self.static) {
            output.print("static");
            output.space();
        }
        if (type) {
            output.print(type);
            output.space();
        }
        if (self.key instanceof AST_SymbolMethod) {
            print_property_name(self.key.name, self.quote, output);
        } else {
            output.with_square(function() {
                self.key.print(output);
            });
        }
        self.value._do_print(output, true);
    });
    DEFPRINT(AST_ObjectSetter, function(self, output){
        self._print_getter_setter("set", output);
    });
    DEFPRINT(AST_ObjectGetter, function(self, output){
        self._print_getter_setter("get", output);
    });
    DEFPRINT(AST_ConciseMethod, function(self, output){
        self._print_getter_setter(self.is_generator && "*" || self.async && "async", output);
    });
    AST_Symbol.DEFMETHOD("_do_print", function(output){
        var def = this.definition();
        output.print_name(def ? def.mangled_name || def.name : this.name);
    });
    DEFPRINT(AST_Symbol, function (self, output) {
        self._do_print(output);
    });
    DEFPRINT(AST_Hole, noop);
    DEFPRINT(AST_This, function(self, output){
        output.print("this");
    });
    DEFPRINT(AST_Super, function(self, output){
        output.print("super");
    });
    DEFPRINT(AST_Constant, function(self, output){
        output.print(self.getValue());
    });
    DEFPRINT(AST_String, function(self, output){
        output.print_string(self.getValue(), self.quote, in_directive);
    });
    DEFPRINT(AST_Number, function(self, output){
        if (use_asm && self.start && self.start.raw != null) {
            output.print(self.start.raw);
        } else {
            output.print(make_num(self.getValue()));
        }
    });

    DEFPRINT(AST_RegExp, function(self, output){
        var regexp = self.getValue();
        var str = regexp.toString();
        if (regexp.raw_source) {
            str = "/" + regexp.raw_source + str.slice(str.lastIndexOf("/"));
        }
        str = output.to_utf8(str);
        output.print(str);
        var p = output.parent();
        if (p instanceof AST_Binary && /^in/.test(p.operator) && p.left === self)
            output.print(" ");
    });

    function force_statement(stat, output) {
        if (output.option("bracketize")) {
            make_block(stat, output);
        } else {
            if (!stat || stat instanceof AST_EmptyStatement)
                output.force_semicolon();
            else
                stat.print(output);
        }
    };

    // self should be AST_New.  decide if we want to show parens or not.
    function need_constructor_parens(self, output) {
        // Always print parentheses with arguments
        if (self.args.length > 0) return true;

        return output.option("beautify");
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
        if (!stmt || stmt instanceof AST_EmptyStatement)
            output.print("{}");
        else if (stmt instanceof AST_BlockStatement)
            stmt.print(output);
        else output.with_block(function(){
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
    // would be quite wasteful, hence this noop in the base class.
    DEFMAP(AST_Node, noop);

    function basic_sourcemap_gen(self, output) {
        output.add_mapping(self.start);
    };

    // XXX: I'm not exactly sure if we need it for all of these nodes,
    // or if we should add even more.

    DEFMAP(AST_Directive, basic_sourcemap_gen);
    DEFMAP(AST_Debugger, basic_sourcemap_gen);
    DEFMAP(AST_Symbol, basic_sourcemap_gen);
    DEFMAP(AST_Jump, basic_sourcemap_gen);
    DEFMAP(AST_StatementWithBody, basic_sourcemap_gen);
    DEFMAP(AST_LabeledStatement, noop); // since the label symbol will mark it
    DEFMAP(AST_Lambda, basic_sourcemap_gen);
    DEFMAP(AST_Switch, basic_sourcemap_gen);
    DEFMAP(AST_SwitchBranch, basic_sourcemap_gen);
    DEFMAP(AST_BlockStatement, basic_sourcemap_gen);
    DEFMAP(AST_Toplevel, noop);
    DEFMAP(AST_New, basic_sourcemap_gen);
    DEFMAP(AST_Try, basic_sourcemap_gen);
    DEFMAP(AST_Catch, basic_sourcemap_gen);
    DEFMAP(AST_Finally, basic_sourcemap_gen);
    DEFMAP(AST_Definitions, basic_sourcemap_gen);
    DEFMAP(AST_Constant, basic_sourcemap_gen);
    DEFMAP(AST_ObjectSetter, function(self, output){
        output.add_mapping(self.start, self.key.name);
    });
    DEFMAP(AST_ObjectGetter, function(self, output){
        output.add_mapping(self.start, self.key.name);
    });
    DEFMAP(AST_ObjectProperty, function(self, output){
        output.add_mapping(self.start, self.key);
    });

})();
