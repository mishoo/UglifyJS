var func = function parse($TEXT, exigent_mode) {

    var S = {
        input         : typeof $TEXT == "string" ? tokenizer($TEXT, true) : $TEXT,
        token         : null,
        prev          : null,
        peeked        : null,
        in_function   : 0,
        in_directives : true,
        in_loop       : 0,
        labels        : []
    };

    S.token = next();

    function is(type, value) {
        return is_token(S.token, type, value);
    };

    function peek() { return S.peeked || (S.peeked = S.input()); };

    function next() {
        S.prev = S.token;
        if (S.peeked) {
            S.token = S.peeked;
            S.peeked = null;
        } else {
            S.token = S.input();
        }
        S.in_directives = S.in_directives && (
            S.token.type == "string" || is("punc", ";")
        );
        return S.token;
    };

    function prev() {
        return S.prev;
    };

    function croak(msg, line, col, pos) {
        var ctx = S.input.context();
        js_error(msg,
                 line != null ? line : ctx.tokline,
                 col != null ? col : ctx.tokcol,
                 pos != null ? pos : ctx.tokpos);
    };

    function token_error(token, msg) {
        croak(msg, token.line, token.col);
    };

    function unexpected(token) {
        if (token == null)
            token = S.token;
        token_error(token, "Unexpected token: " + token.type + " (" + token.value + ")");
    };

    function expect_token(type, val) {
        if (is(type, val)) {
            return next();
        }
        token_error(S.token, "Unexpected token " + S.token.type + ", expected " + type);
    };

    function expect(punc) { return expect_token("punc", punc); };

    function can_insert_semicolon() {
        return !exigent_mode && (
            S.token.nlb || is("eof") || is("punc", "}")
        );
    };

    function semicolon() {
        if (is("punc", ";")) next();
        else if (!can_insert_semicolon()) unexpected();
    };

    function parenthesised() {
        expect("(");
        var ex = expression();
        expect(")");
        return ex;
    };

    function embed_tokens(parser) {
        return function() {
            var start = S.token;
            var expr = parser.apply(this, arguments);
            var end = prev();
            expr.start = start;
            expr.end = end;
            return expr;
        };
    };

    var statement = embed_tokens(function() {
        if (is("operator", "/") || is("operator", "/=")) {
            S.peeked = null;
            S.token = S.input(S.token.value.substr(1)); // force regexp
        }
        switch (S.token.type) {
          case "string":
            var dir = S.in_directives, stat = simple_statement();
            // XXXv2: decide how to fix directives
            // if (dir && stat instanceof AST_String && !is("punc", ","))
            //     return new AST_Directive({ value: stat.value });
            return stat;
          case "num":
          case "regexp":
          case "operator":
          case "atom":
            return simple_statement();

          case "name":
            return is_token(peek(), "punc", ":")
                ? labeled_statement()
                : simple_statement();

          case "punc":
            switch (S.token.value) {
              case "{":
                return new AST_Statement({ body: block_() });
              case "[":
              case "(":
                return simple_statement();
              case ";":
                next();
                return new AST_Statement();
              default:
                unexpected();
            }

          case "keyword":
            switch (prog1(S.token.value, next)) {
              case "break":
                return break_cont(AST_Break);

              case "continue":
                return break_cont(AST_Continue);

              case "debugger":
                semicolon();
                return new AST_Debugger();

              case "do":
                return new AST_Do({
                    body      : in_loop(statement),
                    condition : (expect_token("while"), prog1(parenthesised, semicolon))
                });

              case "while":
                return new AST_While({
                    condition : parenthesised(),
                    body      : in_loop(statement)
                });

              case "for":
                return for_();

              case "function":
                return function_(true);

              case "if":
                return if_();

              case "return":
                if (S.in_function == 0)
                    croak("'return' outside of function");
                return new AST_Return({
                    value: ( is("punc", ";")
                             ? (next(), null)
                             : can_insert_semicolon()
                             ? null
                             : prog1(expression, semicolon) )
                });

              case "switch":
                return new AST_Switch({
                    expression : parenthesised(),
                    body       : switch_block_()
                });

              case "throw":
                if (S.token.nlb)
                    croak("Illegal newline after 'throw'");
                return new AST_Throw({
                    value: prog1(expression, semicolon)
                });

              case "try":
                return try_();

              case "var":
                return prog1(var_, semicolon);

              case "const":
                return prog1(const_, semicolon);

              case "with":
                return new AST_With({
                    expression : parenthesised(),
                    body       : statement()
                });

              default:
                unexpected();
            }
        }
    });

    function labeled_statement() {
        var label = S.token.value;
        next();
        expect(":");
        S.labels.push(label);
        var start = S.token, stat = statement();
        if (exigent_mode && !(stat instanceof AST_LabeledStatement))
            unexpected(start);
        S.labels.pop();
        stat.label = label;
        return stat;
    };

    function simple_statement() {
        return new AST_Statement({ body: prog1(expression, semicolon) });
    };

    function break_cont(type) {
        var name = null;
        if (!can_insert_semicolon()) {
            name = is("name") ? S.token.value : null;
        }
        if (name != null) {
            next();
            if (!member(name, S.labels))
                croak("Label " + name + " without matching loop or statement");
        }
        else if (S.in_loop == 0)
            croak(type.TYPE + " not inside a loop or switch");
        semicolon();
        return new type({ label: name });
    };

    function for_() {
        expect("(");
        var init = null;
        if (!is("punc", ";")) {
            init = is("keyword", "var")
                ? (next(), var_(true))
                : expression(true, true);
            if (is("operator", "in")) {
                if (init instanceof AST_Var && init.definitions.length > 1)
                    croak("Only one variable declaration allowed in for..in loop");
                next();
                return for_in(init);
            }
        }
        return regular_for(init);
    };

    function regular_for(init) {
        expect(";");
        var test = is("punc", ";") ? null : expression();
        expect(";");
        var step = is("punc", ")") ? null : expression();
        expect(")");
        return new AST_For({
            init      : init,
            condition : test,
            step      : step,
            body      : in_loop(statement)
        });
    };

    function for_in(init) {
        var lhs = init instanceof AST_Var ? init.definitions[0].name : init;
        var obj = expression();
        expect(")");
        return new AST_ForIn({
            init   : init,
            lhs    : lhs,
            object : obj,
            body   : in_loop(statement)
        });
    };

    var function_ = function(in_statement) {
        var name = is("name") ? as_symbol() : null;
        if (in_statement && !name)
            unexpected();
        expect("(");
        var ctor = in_statement ? AST_Defun : AST_Function;
        return new ctor({
            name: name,
            argnames: (function(first, a){
                while (!is("punc", ")")) {
                    if (first) first = false; else expect(",");
                    a.push(as_symbol());
                }
                next();
                return a;
            })(true, []),
            body: embed_tokens(function(){
                ++S.in_function;
                var loop = S.in_loop;
                S.in_directives = true;
                S.in_loop = 0;
                var a = block_();
                --S.in_function;
                S.in_loop = loop;
                return new AST_Bracketed({ body: a });
            })()
        });
    };

    function if_() {
        var cond = parenthesised(), body = statement(), belse = null;
        if (is("keyword", "else")) {
            next();
            belse = statement();
        }
        return new AST_If({
            condition   : cond,
            consequent  : body,
            alternative : belse
        });
    };

    function block_() {
        expect("{");
        var a = [];
        while (!is("punc", "}")) {
            if (is("eof")) unexpected();
            a.push(statement());
        }
        next();
        return a;
    };

    var switch_block_ = embed_tokens(curry(in_loop, function(){
        expect("{");
        var a = [], cur = null;
        while (!is("punc", "}")) {
            if (is("eof")) unexpected();
            if (is("keyword", "case")) {
                next();
                cur = [];
                a.push(new AST_Case({ expression: expression(), body: cur }));
                expect(":");
            }
            else if (is("keyword", "default")) {
                next();
                expect(":");
                cur = [];
                a.push(new AST_Default({ body: cur }));
            }
            else {
                if (!cur) unexpected();
                cur.push(statement());
            }
        }
        next();
        return new AST_SwitchBlock({ body: a });
    }));

    function try_() {
        var body = new AST_Bracketed({
            body: block_()
        }), bcatch = null, bfinally = null;
        if (is("keyword", "catch")) {
            next();
            expect("(");
            var name = as_symbol();
            next();
            expect(")");
            bcatch = new AST_Catch({
                argname : name,
                body    : new AST_Bracketed({ body: block_() })
            });
        }
        if (is("keyword", "finally")) {
            next();
            bfinally = new AST_Finally({ body: block_() });
        }
        if (!bcatch && !bfinally)
            croak("Missing catch/finally blocks");
        return new AST_Try({
            btry     : body,
            bcatch   : bcatch,
            bfinally : bfinally
        });
    };

    function vardefs(no_in) {
        var a = [];
        for (;;) {
            a.push(new AST_VarDef({
                start : S.token,
                name  : as_symbol(),
                value : is("operator", "=") ? (next(), expression(false, no_in)) : null,
                end   : prev()
            }));
            if (!is("punc", ","))
                break;
            next();
        }
        return a;
    };

    var var_ = embed_tokens(function(no_in) {
        return new AST_Var({
            definitions: vardefs(no_in)
        });
    });

    var const_ = embed_tokens(function() {
        return new AST_Const({
            definitions: vardefs()
        });
    });

    var new_ = embed_tokens(function() {
        var newexp = expr_atom(false), args;
        if (is("punc", "(")) {
            next();
            args = expr_list(")");
        } else {
            args = [];
        }
        return subscripts(new AST_New({
            expression : newexp,
            args       : args
        }), true);
    });

    function as_atom_node() {
        var tok = S.token, ret;
        switch (tok.type) {
          case "name":
            return as_symbol();
          case "num":
            ret = new AST_Number({ start: tok, end: tok, value: tok.value });
            break;
          case "string":
            ret = new AST_String({ start: tok, end: tok, value: tok.value });
            break;
          case "regexp":
            ret = new AST_RegExp({ start: tok, end: tok, pattern: tok.value[0], mods: tok.value[1] });
            break;
          case "atom":
            switch (tok.value) {
              case "false":
                ret = new AST_False({ start: tok, end: tok });
                break;
              case "true":
                ret = new AST_True({ start: tok, end: tok });
                break;
              case "null":
                ret = new AST_Null({ start: tok, end: tok });
                break;
            }
            break;
        }
        next();
        return ret;
    };

    var expr_atom = function(allow_calls) {
        if (is("operator", "new")) {
            next();
            return new_();
        }
        if (is("punc")) {
            switch (S.token.value) {
              case "(":
                next();
                return subscripts(prog1(expression, curry(expect, ")")), allow_calls);
              case "[":
                next();
                return subscripts(array_(), allow_calls);
              case "{":
                next();
                return subscripts(object_(), allow_calls);
            }
            unexpected();
        }
        if (is("keyword", "function")) {
            var start = S.token;
            next();
            var func = function_(false);
            func.start = start;
            func.end = prev();
            return subscripts(func, allow_calls);
        }
        if (HOP(ATOMIC_START_TOKEN, S.token.type)) {
            return subscripts(as_atom_node(), allow_calls);
        }
        unexpected();
    };

    function expr_list(closing, allow_trailing_comma, allow_empty) {
        var first = true, a = [];
        while (!is("punc", closing)) {
            if (first) first = false; else expect(",");
            if (allow_trailing_comma && is("punc", closing)) break;
            if (is("punc", ",") && allow_empty) {
                a.push(new AST_Undefined({ start: S.token, end: S.token }));
            } else {
                a.push(expression(false));
            }
        }
        next();
        return a;
    };

    function array_() {
        return new AST_Array({
            elements: expr_list("]", !exigent_mode, true)
        });
    };

    var object_ = embed_tokens(function() {
        var first = true, a = [];
        while (!is("punc", "}")) {
            if (first) first = false; else expect(",");
            if (!exigent_mode && is("punc", "}"))
                // allow trailing comma
                break;
            var start = S.token;
            var type = start.type;
            var name = as_property_name();
            if (type == "name" && !is("punc", ":")) {
                if (name.name == "get") {
                    a.push(new AST_ObjectGetter({
                        start : start,
                        name  : name,
                        func  : function_(false),
                        end   : prev()
                    }));
                    continue;
                }
                if (name.name == "set") {
                    a.push(new AST_ObjectSetter({
                        start : start,
                        name  : name,
                        func  : function_(false),
                        end   : prev()
                    }));
                    continue;
                }
            }
            expect(":");
            a.push(new AST_ObjectKeyVal({
                start : start,
                key   : name,
                value : expression(false),
                end   : prev()
            }));
        }
        next();
        return new AST_Object({ properties: a });
    });

    function as_property_name() {
        switch (S.token.type) {
          case "num":
          case "string":
            return as_symbol(true);
        }
        return as_name();
    };

    function as_name() {
        switch (S.token.type) {
          case "name":
          case "operator":
          case "keyword":
          case "atom":
            return as_symbol(true);
          default:
            unexpected();
        }
    };

    function as_symbol(noerror) {
        if (!noerror && !is("name")) croak("Name expected");
        var sym = new AST_Symbol({
            name  : String(S.token.value),
            start : S.token,
            end   : S.token
        });
        next();
        return sym;
    };

    var subscripts = embed_tokens(function(expr, allow_calls) {
        if (is("punc", ".")) {
            next();
            return subscripts(new AST_Dot({
                expression : expr,
                property   : as_name()
            }), allow_calls);
        }
        if (is("punc", "[")) {
            next();
            return subscripts(new AST_Sub({
                expression : expr,
                property   : prog1(expression, curry(expect, "]"))
            }), allow_calls);
        }
        if (allow_calls && is("punc", "(")) {
            next();
            return subscripts(new AST_Call({
                expression : expr,
                args       : expr_list(")")
            }), true);
        }
        return expr;
    });

    var maybe_unary = embed_tokens(function(allow_calls) {
        if (is("operator") && HOP(UNARY_PREFIX, S.token.value)) {
            return make_unary(AST_UnaryPrefix,
                              prog1(S.token.value, next),
                              maybe_unary(allow_calls));
        }
        var val = expr_atom(allow_calls);
        while (is("operator") && HOP(UNARY_POSTFIX, S.token.value) && !S.token.nlb) {
            val = make_unary(AST_UnaryPostfix, S.token.value, val);
            next();
        }
        return val;
    });

    function make_unary(ctor, op, expr) {
        if ((op == "++" || op == "--") && !is_assignable(expr))
            croak("Invalid use of " + op + " operator");
        return new ctor({ operator: op, expression: expr });
    };

    var expr_op = embed_tokens(function(left, min_prec, no_in) {
        var op = is("operator") ? S.token.value : null;
        if (op == "in" && no_in) op = null;
        var prec = op != null ? PRECEDENCE[op] : null;
        if (prec != null && prec > min_prec) {
            next();
            var right = expr_op(maybe_unary(true), prec, no_in);
            return expr_op(new AST_Binary({
                left     : left,
                operator : op,
                right    : right
            }), min_prec, no_in);
        }
        return left;
    });

    function expr_ops(no_in) {
        return expr_op(maybe_unary(true), 0, no_in);
    };

    var maybe_conditional = embed_tokens(function(no_in) {
        var expr = expr_ops(no_in);
        if (is("operator", "?")) {
            next();
            var yes = expression(false);
            expect(":");
            return new AST_Conditional({
                condition: expr,
                consequent: yes,
                alternative: expression(false, no_in)
            });
        }
        return expr;
    });

    function is_assignable(expr) {
        if (!exigent_mode) return true;
        switch (expr[0]+"") {
          case "dot":
          case "sub":
          case "new":
          case "call":
            return true;
          case "name":
            return expr[1] != "this";
        }
    };

    var maybe_assign = embed_tokens(function(no_in) {
        var left = maybe_conditional(no_in), val = S.token.value;
        if (is("operator") && HOP(ASSIGNMENT, val)) {
            if (is_assignable(left)) {
                next();
                return new AST_Assign({
                    left     : left,
                    operator : ASSIGNMENT[val],
                    right    : maybe_assign(no_in)
                });
            }
            croak("Invalid assignment");
        }
        return left;
    });

    var expression = embed_tokens(function(commas, no_in) {
        if (arguments.length == 0)
            commas = true;
        var expr = maybe_assign(no_in);
        if (commas && is("punc", ",")) {
            next();
            return new AST_Seq({
                first  : expr,
                second : expression(true, no_in)
            });
        }
        return expr;
    });

    function in_loop(cont) {
        ++S.in_loop;
        var ret = cont();
        --S.in_loop;
        return ret;
    };

    return new AST_Toplevel({
        body: (function(a){
            while (!is("eof"))
                a.push(statement());
            return a;
        })([])
    });

};

console.time("parse");
var ast = parse(func.toString());
console.timeEnd("parse");

console.log(ast);



    // var moo = 1, i, man = moo + bar;
    // try {
    //     loop: while (/foobar/.test(bar)) {
    //         alert(bar);
    //         continue loop;
    //     }
    // } finally {
    //     return crap;
    // }
