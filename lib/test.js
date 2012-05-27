var func = function tokenizer($TEXT) {

    var S = {
        text            : $TEXT.replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, ''),
        pos             : 0,
        tokpos          : 0,
        line            : 0,
        tokline         : 0,
        col             : 0,
        tokcol          : 0,
        newline_before  : false,
        regex_allowed   : false,
        comments_before : []
    };

    function peek() { return S.text.charAt(S.pos); };

    function next(signal_eof, in_string) {
        var ch = S.text.charAt(S.pos++);
        if (signal_eof && !ch)
            throw EX_EOF;
        if (ch == "\n") {
            S.newline_before = S.newline_before || !in_string;
            ++S.line;
            S.col = 0;
        } else {
            ++S.col;
        }
        return ch;
    };

    function eof() {
        return !S.peek();
    };

    function find(what, signal_eof) {
        var pos = S.text.indexOf(what, S.pos);
        if (signal_eof && pos == -1) throw EX_EOF;
        return pos;
    };

    function start_token() {
        S.tokline = S.line;
        S.tokcol = S.col;
        S.tokpos = S.pos;
    };

    function token(type, value, is_comment) {
        S.regex_allowed = ((type == "operator" && !HOP(UNARY_POSTFIX, value)) ||
                           (type == "keyword" && HOP(KEYWORDS_BEFORE_EXPRESSION, value)) ||
                           (type == "punc" && HOP(PUNC_BEFORE_EXPRESSION, value)));
        var ret = {
            type   : type,
            value  : value,
            line   : S.tokline,
            col    : S.tokcol,
            pos    : S.tokpos,
            endpos : S.pos,
            nlb    : S.newline_before
        };
        if (!is_comment) {
            ret.comments_before = S.comments_before;
            S.comments_before = [];
            // make note of any newlines in the comments that came before
            for (var i = 0, len = ret.comments_before.length; i < len; i++) {
                ret.nlb = ret.nlb || ret.comments_before[i].nlb;
            }
        }
        S.newline_before = false;
        return new AST_Token(ret);
    };

    function skip_whitespace() {
        while (HOP(WHITESPACE_CHARS, peek()))
            next();
    };

    function read_while(pred) {
        var ret = "", ch = peek(), i = 0;
        while (ch && pred(ch, i++)) {
            ret += next();
            ch = peek();
        }
        return ret;
    };

    function parse_error(err) {
        js_error(err, S.tokline, S.tokcol, S.tokpos);
    };

    function read_num(prefix) {
        var has_e = false, after_e = false, has_x = false, has_dot = prefix == ".";
        var num = read_while(function(ch, i){
            if (ch == "x" || ch == "X") {
                if (has_x) return false;
                return has_x = true;
            }
            if (!has_x && (ch == "E" || ch == "e")) {
                if (has_e) return false;
                return has_e = after_e = true;
            }
            if (ch == "-") {
                if (after_e || (i == 0 && !prefix)) return true;
                return false;
            }
            if (ch == "+") return after_e;
            after_e = false;
            if (ch == ".") {
                if (!has_dot && !has_x && !has_e)
                    return has_dot = true;
                return false;
            }
            return is_alphanumeric_char(ch);
        });
        if (prefix)
            num = prefix + num;
        var valid = parse_js_number(num);
        if (!isNaN(valid)) {
            return token("num", valid);
        } else {
            parse_error("Invalid syntax: " + num);
        }
    };

    function read_escaped_char(in_string) {
        var ch = next(true, in_string);
        switch (ch) {
          case "n" : return "\n";
          case "r" : return "\r";
          case "t" : return "\t";
          case "b" : return "\b";
          case "v" : return "\u000b";
          case "f" : return "\f";
          case "0" : return "\0";
          case "x" : return String.fromCharCode(hex_bytes(2));
          case "u" : return String.fromCharCode(hex_bytes(4));
          case "\n": return "";
          default  : return ch;
        }
    };

    function hex_bytes(n) {
        var num = 0;
        for (; n > 0; --n) {
            var digit = parseInt(next(true), 16);
            if (isNaN(digit))
                parse_error("Invalid hex-character pattern in string");
            num = (num << 4) | digit;
        }
        return num;
    };

    function read_string() {
        return with_eof_error("Unterminated string constant", function(){
            var quote = next(), ret = "";
            for (;;) {
                var ch = next(true);
                if (ch == "\\") {
                    // read OctalEscapeSequence (XXX: deprecated if "strict mode")
                    // https://github.com/mishoo/UglifyJS/issues/178
                    var octal_len = 0, first = null;
                    ch = read_while(function(ch){
                        if (ch >= "0" && ch <= "7") {
                            if (!first) {
                                first = ch;
                                return ++octal_len;
                            }
                            else if (first <= "3" && octal_len <= 2) return ++octal_len;
                            else if (first >= "4" && octal_len <= 1) return ++octal_len;
                        }
                        return false;
                    });
                    if (octal_len > 0) ch = String.fromCharCode(parseInt(ch, 8));
                    else ch = read_escaped_char(true);
                }
                else if (ch == quote) break;
                ret += ch;
            }
            return token("string", ret);
        });
    };

    function read_line_comment() {
        next();
        var i = find("\n"), ret;
        if (i == -1) {
            ret = S.text.substr(S.pos);
            S.pos = S.text.length;
        } else {
            ret = S.text.substring(S.pos, i);
            S.pos = i;
        }
        return token("comment1", ret, true);
    };

    function read_multiline_comment() {
        next();
        return with_eof_error("Unterminated multiline comment", function(){
            var i = find("*/", true),
            text = S.text.substring(S.pos, i);
            S.pos = i + 2;
            S.line += text.split("\n").length - 1;
            S.newline_before = S.newline_before || text.indexOf("\n") >= 0;

            // https://github.com/mishoo/UglifyJS/issues/#issue/100
            if (/^@cc_on/i.test(text)) {
                warn("WARNING: at line " + S.line);
                warn("*** Found \"conditional comment\": " + text);
                warn("*** UglifyJS DISCARDS ALL COMMENTS.  This means your code might no longer work properly in Internet Explorer.");
            }

            return token("comment2", text, true);
        });
    };

    function read_name() {
        var backslash = false, name = "", ch, escaped = false, hex;
        while ((ch = peek()) != null) {
            if (!backslash) {
                if (ch == "\\") escaped = backslash = true, next();
                else if (is_identifier_char(ch)) name += next();
                else break;
            }
            else {
                if (ch != "u") parse_error("Expecting UnicodeEscapeSequence -- uXXXX");
                ch = read_escaped_char();
                if (!is_identifier_char(ch)) parse_error("Unicode char: " + ch.charCodeAt(0) + " is not valid in identifier");
                name += ch;
                backslash = false;
            }
        }
        if (HOP(KEYWORDS, name) && escaped) {
            hex = name.charCodeAt(0).toString(16).toUpperCase();
            name = "\\u" + "0000".substr(hex.length) + hex + name.slice(1);
        }
        return name;
    };

    function read_regexp(regexp) {
        return with_eof_error("Unterminated regular expression", function(){
            var prev_backslash = false, ch, in_class = false;
            while ((ch = next(true))) if (prev_backslash) {
                regexp += "\\" + ch;
                prev_backslash = false;
            } else if (ch == "[") {
                in_class = true;
                regexp += ch;
            } else if (ch == "]" && in_class) {
                in_class = false;
                regexp += ch;
            } else if (ch == "/" && !in_class) {
                break;
            } else if (ch == "\\") {
                prev_backslash = true;
            } else {
                regexp += ch;
            }
            var mods = read_name();
            return token("regexp", [ regexp, mods ]);
        });
    };

    function read_operator(prefix) {
        function grow(op) {
            if (!peek()) return op;
            var bigger = op + peek();
            if (HOP(OPERATORS, bigger)) {
                next();
                return grow(bigger);
            } else {
                return op;
            }
        };
        return token("operator", grow(prefix || next()));
    };

    function handle_slash() {
        next();
        var regex_allowed = S.regex_allowed;
        switch (peek()) {
          case "/":
            S.comments_before.push(read_line_comment());
            S.regex_allowed = regex_allowed;
            return next_token();
          case "*":
            S.comments_before.push(read_multiline_comment());
            S.regex_allowed = regex_allowed;
            return next_token();
        }
        return S.regex_allowed ? read_regexp("") : read_operator("/");
    };

    function handle_dot() {
        next();
        return is_digit(peek())
            ? read_num(".")
            : token("punc", ".");
    };

    function read_word() {
        var word = read_name();
        return HOP(KEYWORDS_ATOM, word)
            ? token("atom", word)
            : !HOP(KEYWORDS, word)
            ? token("name", word)
            : HOP(OPERATORS, word)
            ? token("operator", word)
            : token("keyword", word);
    };

    function with_eof_error(eof_error, cont) {
        try {
            return cont();
        } catch(ex) {
            if (ex === EX_EOF) parse_error(eof_error);
            else throw ex;
        }
    };

    function next_token(force_regexp) {
        if (force_regexp != null)
            return read_regexp(force_regexp);
        skip_whitespace();
        start_token();
        var ch = peek();
        if (!ch) return token("eof");
        if (is_digit(ch)) return read_num();
        if (ch == '"' || ch == "'") return read_string();
        if (HOP(PUNC_CHARS, ch)) return token("punc", next());
        if (ch == ".") return handle_dot();
        if (ch == "/") return handle_slash();
        if (HOP(OPERATOR_CHARS, ch)) return read_operator();
        if (ch == "\\" || is_identifier_start(ch)) return read_word();
        parse_error("Unexpected character '" + ch + "'");
    };

    next_token.context = function(nc) {
        if (nc) S = nc;
        return S;
    };

    return next_token;

};

console.time("parse");
var ast = parse(func.toString());
console.timeEnd("parse");



ast.walk({
    _visit: function(node, descend) {
        console.log(node);
        console.log(node.TYPE, ":", node.start.pos);
        if (descend) descend.call(node);
    }
});
