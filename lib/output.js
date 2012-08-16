function OutputStream(options) {

    options = defaults(options, {
        indent_start  : 0,
        indent_level  : 4,
        quote_keys    : false,
        space_colon   : false,
        ascii_only    : false,
        inline_script : false,
        width         : 80,
        beautify      : true
    });

    function noop() {};

    var indentation = 0;
    var current_col = 0;
    var current_line = 0;
    var current_pos = 0;
    var OUTPUT = "";

    function to_ascii(str) {
        return str.replace(/[\u0080-\uffff]/g, function(ch) {
            var code = ch.charCodeAt(0).toString(16);
            while (code.length < 4) code = "0" + code;
            return "\\u" + code;
        });
    };

    function make_string(str) {
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
              case "\0": return "\\0";
            }
            return s;
        });
        if (options.ascii_only) str = to_ascii(str);
        if (dq > sq) return "'" + str.replace(/\x27/g, "\\'") + "'";
        else return '"' + str.replace(/\x22/g, '\\"') + '"';
    };

    function encode_string(str) {
        var ret = make_string(str);
        if (options.inline_script)
            ret = ret.replace(/<\x2fscript([>\/\t\n\f\r ])/gi, "<\\/script$1");
        return ret;
    };

    function make_name(name) {
        name = name.toString();
        if (options.ascii_only)
            name = to_ascii(name);
        return name;
    };

    function make_indent(line) {
        if (line == null)
            line = "";
        line = repeat_string(" ", options.indent_start + indentation) + line;
        return line;
    };

    function last_char() {
        return OUTPUT.charAt(OUTPUT.length - 1);
    };

    /* -----[ beautification/minification ]----- */

    var might_need_space = false;

    function print(str) {
        str = String(str);
        if (might_need_space) {
            var ch = str.charAt(0);
            if ((is_identifier_char(last_char())
                 && (is_identifier_char(ch) || ch == "\\"))
                ||
                (/[\+\-]$/.test(OUTPUT) && /^[\+\-]/.test(str)))
            {
                OUTPUT += " ";
                current_col++;
                current_pos++;
            }
        }
        might_need_space = false;
        var a = str.split(/\r?\n/), n = a.length;
        current_line += n;
        if (n == 1) {
            current_col = a[n - 1].length;
        } else {
            current_col += a[n - 1].length;
        }
        current_pos += str.length;
        OUTPUT += str;
    };

    var space = options.beautify ? function() {
        print(" ");
    } : function() {
        might_need_space = true;
    };

    var indent = options.beautify ? function() {
        if (options.beautify) {
            print(make_indent());
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
    } : noop;

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
        var ret = with_indent(current_col, cont);
        print("]");
        return ret;
    };

    function semicolon() {
        print(";");
    };

    function comma() {
        print(",");
        space();
    };

    function colon() {
        print(":");
        space();
    };

    var stack = [];
    return {
        get          : function() { return OUTPUT },
        indent       : indent,
        newline      : newline,
        print        : print,
        space        : space,
        comma        : comma,
        colon        : colon,
        semicolon    : semicolon,
        print_name   : function(name) { print(make_name(name)) },
        print_string : function(str) { print(encode_string(str)) },
        with_indent  : with_indent,
        with_block   : with_block,
        with_parens  : with_parens,
        with_square  : with_square,
        options      : function() { return options },
        line         : function() { return current_line },
        col          : function() { return current_col },
        pos          : function() { return current_pos },
        push_node    : function(node) { stack.push(node) },
        pop_node     : function() { return stack.pop() },
        stack        : function() { return stack },
        parent       : function() { return stack[stack.length - 2] }
    };

};

/* -----[ code generators ]----- */

(function(DEFPRINT){
    DEFPRINT(AST_Directive, function(self, output){
        output.print_string(self.value);
    });
    DEFPRINT(AST_Debugger, function(self, output){
        output.print_string("debugger");
    });
    DEFPRINT(AST_Parenthesized, function(self, output){
        output.with_parens(function(){
            self.expression.print(output);
        });
    });
    DEFPRINT(AST_Bracketed, function(self, output){
        if (self.body.length > 0) output.with_block(function(){
            self.body.forEach(function(stmt){
                output.indent();
                stmt.print(output);
                output.newline();
            });
        });
        else output.print("{}");
    });
    /* -----[ statements ]----- */
    DEFPRINT(AST_Statement, function(self, output){
        if (self.body instanceof AST_Node) {
            self.body.print(output);
            output.semicolon();
        } else {
            self.body.forEach(function(stmt){
                stmt.print(output);
                output.newline();
            });
        }
    });
    DEFPRINT(AST_LabeledStatement, function(self, output){
        output.print(self.label + ":");
        output.space();
        self.statement.print(output);
    });
    DEFPRINT(AST_SimpleStatement, function(self, output){
        self.body.print(output);
        output.semicolon();
    });
    DEFPRINT(AST_BlockStatement, function(self, output){
        AST_Bracketed.prototype.print.call(self, output);
    });
    DEFPRINT(AST_EmptyStatement, function(self, output){
        output.semicolon();
    });
    DEFPRINT(AST_Do, function(self, output){
        output.print("do");
        output.space();
        self.body.print(output);
        output.space();
        output.print("while");
        self.condition.print(output);
        self.semicolon();
    });
    DEFPRINT(AST_For, function(self, output){
        output.print("for");
        output.space();
        output.with_parens(function(){
            if (self.init) {
                self.init.print(output);
                output.semicolon();
                output.space();
            } else {
                output.semicolon();
            }
            if (self.condition) {
                self.condition.print(output);
                output.semicolon();
                output.space();
            } else {
                output.semicolon();
            }
            if (self.step) {
                self.step.print(output);
            }
        });
        output.space();
        self.body.print(output);
    });
    DEFPRINT(AST_ForIn, function(self, output){
        output.print("for");
        output.space();
        output.with_parens(function(){
            if (self.init) {
                self.init.print(output);
            } else {
                self.name.print(output);
            }
            output.print(" in ");
            self.object.print(output);
        });
        output.space();
        self.body.print(output);
    });
    DEFPRINT(AST_With, function(self, output){
        output.print("with");
        output.space();
        output.with_parens(function(){
            self.expression.print(output);
        });
        output.space();
        self.body.print(output);
    });
    /* -----[ functions ]----- */
    DEFPRINT(AST_Lambda, function(self, output){
        output.print("function");
        output.space();
        if (self.name) {
            self.name.print(output);
        }
        output.with_parens(function(){
            self.argnames.forEach(function(arg, i){
                if (i) output.comma();
                arg.print(output);
            });
        });
        output.space();
        self.body.print(output);
    });
    /* -----[ exits ]----- */
    AST_Exit.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        output.space();
        this.value.print(output);
        output.semicolon();
    });
    DEFPRINT(AST_Return, function(self, output){
        self._do_print(output, "return");
    });
    DEFPRINT(AST_Throw, function(self, output){
        self._do_print(output, "throw");
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
    DEFPRINT(AST_If, function(self, output){
        output.print("if");
        output.space();
        output.with_parens(function(){
            self.condition.print(output);
        });
        output.space();
        self.consequent.print(output);
        if (self.alternative) {
            output.space();
            self.alternative.print(output);
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
        self.body.print(output);
    });
    AST_SwitchBranch.DEFMETHOD("_do_print_body", function(output){
        this.body.forEach(function(stmt){
            output.indent();
            stmt.print(output);
            output.newline();
        });
    });
    DEFPRINT(AST_Default, function(self, output){
        output.print("default:");
        output.newline();
        self._do_print_body(output);
    });
    DEFPRINT(AST_Case, function(self, output){
        output.print("case");
        output.space();
        self.expression.print(output);
        output.print(":");
        output.newline();
        self._do_print_body(output);
    });
    /* -----[ exceptions ]----- */
    DEFPRINT(AST_Try, function(self, output){
        output.print("try");
        output.space();
        self.btry.print(output);
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
        self.body.print(output);
    });
    DEFPRINT(AST_Finally, function(self, output){
        output.print("finally");
        output.space();
        self.body.print(output);
    });
    /* -----[ var/const ]----- */
    AST_Definitions.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        output.space();
        this.definitions.forEach(function(def, i){
            if (i) output.comma();
            def.print(output);
        });
        if (!this.inline) output.semicolon();
    });
    DEFPRINT(AST_Var, function(self, output){
        self._do_print(output, "var");
    });
    DEFPRINT(AST_Const, function(self, output){
        self._do_print(output, "const");
    });
    DEFPRINT(AST_VarDef, function(self, output){
        self.name.print(output);
        if (self.value) {
            output.space();
            output.print("=");
            output.space();
            self.value.print(output);
        }
    });
    /* -----[ other expressions ]----- */
    DEFPRINT(AST_Call, function(self, output){
        self.expression.print(output);
        output.with_parens(function(){
            self.args.forEach(function(arg, i){
                if (i) output.comma();
                arg.print(output);
            });
        });
    });
    DEFPRINT(AST_New, function(self, output){
        output.print("new");
        output.space();
        AST_Call.prototype.print.call(self, output);
    });
    DEFPRINT(AST_Seq, function(self, output){
        self.first.print(output);
        output.comma();
        self.second.print(output);
    });
    DEFPRINT(AST_Dot, function(self, output){
        self.expression.print(output);
        output.print(".");
        output.print_name(self.property);
    });
    DEFPRINT(AST_Sub, function(self, output){
        self.expression.print(output);
        output.print("[");
        self.property.print(output);
        output.print("]");
    });
    DEFPRINT(AST_UnaryPrefix, function(self, output){
        output.print(self.operator);
        self.expression.print(output);
    });
    DEFPRINT(AST_UnaryPostfix, function(self, output){
        self.expression.print(output);
        output.print(self.operator);
    });
    AST_Binary.DEFMETHOD("_do_print", function(output){
        this.left.print(output);
        output.space();
        output.print(this.operator);
        output.space();
        this.right.print(output);
    });
    DEFPRINT(AST_Binary, function(self, output){
        var p = output.parent();
        if (p instanceof AST_Binary) {
            var po = p.operator, pp = PRECEDENCE[po];
            var so = self.operator, sp = PRECEDENCE[so];
            if (pp > sp
                || (pp == sp
                    && self === p.right
                    && !(so == po &&
                         (so == "*" ||
                          so == "&&" ||
                          so == "||")))) {
                output.with_parens(function(){
                    self._do_print(output);
                });
                return;
            }
        }
        self._do_print(output);
    });
    // XXX: this is quite similar as for AST_Binary, except for the parens.
    DEFPRINT(AST_Assign, function(self, output){
        var p = output.parent();
        if (p instanceof AST_Binary) {
            output.with_parens(function(){
                self._do_print(output);
            });
            return;
        }
        self._do_print(output);
    });
    DEFPRINT(AST_Conditional, function(self, output){
        self.condition.print(output);
        output.space();
        output.print("?");
        output.space();
        self.consequent.print(output);
        output.colon();
        self.alternative.print(output);
    });
    /* -----[ literals ]----- */
    DEFPRINT(AST_Array, function(self, output){
        output.with_square(function(){
            self.elements.forEach(function(exp, i){
                if (i) output.comma();
                exp.print(output);
            });
        });
    });
    DEFPRINT(AST_Object, function(self, output){
        if (self.properties.length > 0) output.with_block(function(){
            self.properties.forEach(function(prop, i){
                if (i) output.comma();
                output.indent();
                prop.print(output);
                output.newline();
            });
        });
        else output.print("{}");
    });
    DEFPRINT(AST_ObjectKeyVal, function(self, output){
        output.print_name(self.key);
        output.colon();
        self.value.print(output);
    });
    DEFPRINT(AST_ObjectSetter, function(self, output){
        throw "not yet done";
    });
    DEFPRINT(AST_ObjectGetter, function(self, output){
        throw "not yet done";
    });
    DEFPRINT(AST_Symbol, function(self, output){
        output.print_name(self.name);
    });
    DEFPRINT(AST_This, function(self, output){
        output.print("this");
    });
    DEFPRINT(AST_Label, function(self, output){
        output.print_name(self.name);
    });
    DEFPRINT(AST_Constant, function(self, output){
        output.print(self.getValue());
    });
    DEFPRINT(AST_String, function(self, output){
        output.print_string(self.getValue());
    });
    DEFPRINT(AST_RegExp, function(self, output){
        output.print("/");
        output.print(self.pattern);
        output.print("/");
        if (self.mods) output.print(self.mods);
    });
})(function DEF(nodetype, generator) {
    nodetype.DEFMETHOD("print", function(stream){
        stream.push_node(this);
        generator(this, stream);
        stream.pop_node();
    });
});
