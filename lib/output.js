function OutputStream(options) {
    options = defaults(options, {
        indent_start  : 0,
        indent_level  : 4,
        quote_keys    : false,
        space_colon   : false,
        ascii_only    : false,
        inline_script : false,
        width         : 80
    });

    var indentation = 0;
    var current_col = 0;
    var current_line = 0;
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

    function print(str) {
        var a = str.split(/\r?\n/), n = a.length;
        current_line += n;
        current_col += a[n - 1].length;
        OUTPUT += str;
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

    function with_indent(col, cont) {
        if (col === true) col = next_indent();
        var save_indentation = indentation;
        indentation = col;
        var ret = cont();
        indentation = save_indentation;
        return ret;
    };

    function indent() {
        print(make_indent());
    };

    function newline() {
        print("\n");
    };

    function next_indent() {
        return indentation + options.indent_level;
    };

    function with_block(cont, beautify) {
        var ret;
        print("{");
        with_indent(next_indent(), function(){
            if (beautify) newline();
            ret = cont();
            if (beautify) newline();
        });
        if (beautify) indent();
        print("}");
        return ret;
    };

    function with_parens(cont, beautify) {
        print("(");
        var ret = with_indent(current_col, cont);
        print(")");
        return ret;
    };

    return {
        get         : function() { return OUTPUT },
        indent      : indent,
        newline     : newline,
        print       : print,
        string      : function(str) { print(encode_string(str)) },
        with_indent : with_indent,
        with_block  : with_block,
        with_parens : with_parens,
        options     : function() { return options },
        line        : function() { return current_line },
        col         : function() { return current_col },
        pos         : function() { return OUTPUT.length }
    };

};
