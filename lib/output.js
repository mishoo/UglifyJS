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
        if (might_need_space) {
            var ch = str.charAt(0);
            if ((is_identifier_char(last_char()) && (is_identifier_char(ch) || ch == "\\"))
                || (/[\+\-]$/.test(OUTPUT) && /^[\+\-]/.test(str)))
            {
                OUTPUT += " ";
                current_col++;
                current_pos++;
            }
        }
        might_need_space = false;
        var a = str.split(/\r?\n/), n = a.length;
        current_line += n;
        current_col += a[n - 1].length;
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

    var newline = options.indent ? function() {
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
        newline();
        indent();
        print("}");
        return ret;
    };

    function with_parens(cont) {
        print("(");
        var ret = with_indent(current_col, cont);
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

    return {
        get          : function() { return OUTPUT },
        indent       : indent,
        newline      : newline,
        print        : print,
        space        : space,
        comma        : comma,
        colon        : colon,
        print_name   : function(name) { print(make_name(name)) },
        print_string : function(str) { print(encode_string(str)) },
        with_indent  : with_indent,
        with_block   : with_block,
        with_parens  : with_parens,
        with_square  : with_square,
        options      : function() { return options },
        line         : function() { return current_line },
        col          : function() { return current_col },
        pos          : function() { return current_pos }
    };

};

/* -----[ code generators ]----- */

(function(DEF){
    DEF(AST_Directive, function(self, output){
        output.print_string(self.value);
    });
    DEF(AST_Debugger, function(self, output){
        output.print_string("debugger");
    });
    DEF(AST_Parenthesized, function(self, output){
        output.with_parens(function(){
            self.expression.print(output);
        });
    });
    DEF(AST_Bracketed, function(self, output){
        output.with_block(function(){
            self.body.forEach(function(stmt){
                output.indent();
                stmt.print(output);
            });
        });
    });
    /* -----[ statements ]----- */
    DEF(AST_LabeledStatement, function(self, output){
        output.print(self.label + ":");
        output.space();
        self.statement.print(output);
    });
    DEF(AST_SimpleStatement, function(self, output){
        self.body.print(output);
        output.semicolon();
    });
    DEF(AST_BlockStatement, function(self, output){
        AST_Bracketed.prototype.print.call(self, output);
    });
    DEF(AST_EmptyStatement, function(self, output){
        // do nothing here?
        // output.semicolon();
    });
    DEF(AST_Do, function(self, output){
        output.print("do");
        output.space();
        self.body.print(output);
        output.space();
        output.print("while");
        self.condition.print(output);
        self.semicolon();
    });
    DEF(AST_For, function(self, output){
        output.print("for");
        output.space();
        output.with_parens(function(){
            self.init.print(output);
            output.semicolon();
            self.condition.print(output);
            output.semicolon();
            self.step.print(output);
        });
        output.space();
        self.body.print(output);
    });
    DEF(AST_ForIn, function(self, output){
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
    DEF(AST_With, function(self, output){
        output.print("with");
        output.space();
        output.with_parens(function(){
            self.expression.print(output);
        });
        output.space();
        self.body.print(output);
    });
    /* -----[ functions ]----- */
    DEF(AST_Lambda, function(self, output){
        output.print("function");
        output.space();
        if (self.name) {
            self.name.print(output);
            output.space();
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
        self.value.print(output);
        output.semicolon();
    });
    DEF(AST_Return, function(self, output){
        self._do_print(output, "return");
    });
    DEF(AST_Throw, function(self, output){
        self._do_print(output, "throw");
    });
    /* -----[ loop control ]----- */
    AST_LoopControl.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        if (self.label) {
            output.space();
            self.label.print(output);
        }
        output.semicolon();
    });
    DEF(AST_Break, function(self, output){
        self._do_print(output, "break");
    });
    DEF(AST_Continue, function(self, output){
        self._do_print(output, "continue");
    });
    /* -----[ if ]----- */
    DEF(AST_If, function(self, output){
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
    DEF(AST_Switch, function(self, output){
        output.print("switch");
        output.space();
        output.with_parens(function(){
            self.expression.print(output);
        });
        output.space();
        self.body.print(output);
    });
    AST_SwitchBranch.DEFMETHOD("_do_print_body", function(output){
        self.body.forEach(function(stmt){
            output.indent();
            stmt.print(output);
            output.newline();
        });
    });
    DEF(AST_Default, function(self, output){
        output.print("default:");
        output.newline();
        self._do_print_body(output);
    });
    DEF(AST_Case, function(self, output){
        output.print("case");
        output.space();
        self.expression.print(output);
        output.print(":");
        output.newline();
        self._do_print_body(output);
    });
    /* -----[ exceptions ]----- */
    DEF(AST_Try, function(self, output){
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
    DEF(AST_Catch, function(self, output){
        output.print("catch");
        output.space();
        self.body.print(output);
    });
    DEF(AST_Finally, function(self, output){
        output.print("finally");
        output.space();
        self.body.print(output);
    });
    /* -----[ var/const ]----- */
    AST_Definitions.DEFMETHOD("_do_print", function(output, kind){
        output.print(kind);
        output.space();
        self.definitions.forEach(function(def, i){
            if (i) output.space();
            def.print(output);
        });
        output.semicolon();
    });
    DEF(AST_Var, function(self, output){
        self._do_print(output, "var");
    });
    DEF(AST_Const, function(self, output){
        self._do_print(output, "const");
    });
    DEF(AST_VarDef, function(self, output){
        self.name.print(output);
        if (self.value) {
            output.space();
            output.print("=");
            output.space();
            self.value.print(output);
        }
    });
    /* -----[ other expressions ]----- */
    DEF(AST_Call, function(self, output){
        self.expression.print(output);
        output.with_parens(function(){
            self.args.forEach(function(arg, i){
                if (i) output.comma();
                arg.print(output);
            });
        });
    });
    DEF(AST_New, function(self, output){
        output.print("new");
        output.space();
        AST_Call.prototype.print.call(self, output);
    });
    DEF(AST_Seq, function(self, output){
        self.first.print(output);
        output.comma();
        self.second.print(output);
    });
    DEF(AST_Dot, function(self, output){
        self.expression.print(output);
        output.print(".");
        output.print_name(self.property);
    });
    DEF(AST_Sub, function(self, output){
        self.expression.print(output);
        output.print("[");
        self.property.print(output);
        output.print("]");
    });
    DEF(AST_UnaryPrefix, function(self, output){
        output.print(self.operator);
        self.expression.print(output);
    });
    DEF(AST_UnaryPostfix, function(self, output){
        self.expression.print(output);
        output.print(self.operator);
    });
    DEF(AST_Binary, function(self, output){
        self.left.print(output);
        output.print(self.operator);
        self.right.print(output);
    });
    DEF(AST_Conditional, function(self, output){
        self.condition.print(output);
        output.space();
        output.print("?");
        output.space();
        self.consequent.print(output);
        output.colon();
        self.alternative.print(output);
    });
    /* -----[ literals ]----- */
    DEF(AST_Array, function(self, output){
        output.with_square(function(){
            self.elements.forEach(function(exp, i){
                if (i) output.comma();
                exp.print(output);
            });
        });
    });
    DEF(AST_Object, function(self, output){
        output.with_block(function(){
            self.properties.forEach(function(prop, i){
                if (i) output.comma();
                prop.print(output);
            });
        });
    });
    DEF(AST_ObjectKeyVal, function(self, output){
        output.print_name(self.key);
        output.colon();
        self.value.print(output);
    });
    DEF(AST_ObjectSetter, function(self, output){
        throw "not yet done";
    });
    DEF(AST_ObjectGetter, function(self, output){
        throw "not yet done";
    });
    DEF(AST_Symbol, function(self, output){
        output.print_name(self.name);
    });
    DEF(AST_This, function(self, output){
        output.print("this");
    });
    DEF(AST_Label, function(self, output){
        output.print_name(self.name);
    });
    DEF(AST_Constant, function(self, output){
        output.print(self.getValue());
    });
    DEF(AST_String, function(self, output){
        output.print_string(self.getValue());
    });
    DEF(AST_RegExp, function(self, output){
        output.print("/");
        output.print(self.pattern);
        output.print("/");
        if (self.mods) output.print(self.mods);
    });
})(function DEF(nodetype, generator) {
    nodetype.DEFMETHOD("print", function(stream){
        generator(this, stream);
    });
});
