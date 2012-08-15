function DEFNODE(type, props, methods, base) {
    if (arguments.length < 4) base = AST_Node;
    if (!props) props = [];
    else props = props.split(/\s+/);
    if (base && base.PROPS)
        props = props.concat(base.PROPS);
    var code = "return function AST_" + type + "(props){ if (props) { ";
    for (var i = props.length; --i >= 0;) {
        code += "this." + props[i] + " = props." + props[i] + ";";
    }
    if (methods && methods.initialize)
        code += "this.initialize();"
    code += " } }";
    var ctor = new Function(code)();
    if (base) {
        ctor.prototype = new base;
    }
    ctor.prototype.CTOR = ctor;
    ctor.PROPS = props || null;
    if (type) {
        ctor.prototype.TYPE = ctor.TYPE = type;
    }
    if (methods) for (i in methods) if (HOP(methods, i)) {
        ctor.prototype[i] = methods[i];
    }
    return ctor;
};

var AST_Token = DEFNODE("Token", "type value line col pos endpos nlb comments_before", {

}, null);

var AST_Node = DEFNODE("Node", "start end", {
    clone: function() {
        return new this.CTOR(this);
    },
    // XXX: what was this for?
    // renew: function(args) {
    //     var ctor = this.CTOR, props = ctor.props;
    //     for (var i in props) if (!HOP(args, i)) args[i] = this[i];
    //     return new ctor(args);
    // },
    walk: function(w) {
        w._visit(this);
    }
}, null);

var AST_Directive = DEFNODE("Directive", "value", {
    print: function(output) {
        output.string(this.value);
    }
});

var AST_Debugger = DEFNODE("Debugger", null, {
    print: function(output) {
        output.print("debugger");
    }
});

var AST_Parenthesized = DEFNODE("Parenthesized", "expression", {
    $documentation: "Represents an expression which is always parenthesized.  Used for the \
conditions in IF/WHILE/DO and expression in SWITCH/WITH.",
    walk: function(w) {
        w._visit(this, function(){
            this.expression.walk(w);
        });
    }
});

var AST_Bracketed = DEFNODE("Bracketed", "body", {
    $documentation: "Represents a block of statements that are always included in brackets. \
Used for bodies of FUNCTION/TRY/CATCH/THROW/SWITCH.",
    walk: function(w) {
        w._visit(this, function(){
            this.body.forEach(function(stat){
                stat.walk(w);
            });
        });
    }
});

/* -----[ loops ]----- */

var AST_Statement = DEFNODE("Statement", "label body", {
    walk: function(w) {
        w._visit(this, function(){
            if (this.label) this.label.walk(w);
            if (this.body) {
                if (this.body instanceof AST_Node)
                    this.body.walk(w);
                else
                    this.walk_array(w);
            }
        });
    },
    walk_array: AST_Bracketed.prototype.walk
});

var AST_SimpleStatement = DEFNODE("SimpleStatement", null, {

}, AST_Statement);

var AST_BlockStatement = DEFNODE("BlockStatement", null, {

}, AST_Statement);

var AST_EmptyStatement = DEFNODE("EmptyStatement", null, {

}, AST_Statement);

var AST_Do = DEFNODE("Do", "condition", {
    walk: function(w) {
        w._visit(this, function(){
            this.condition.walk(w);
            AST_Statement.prototype.walk.call(this, w);
        });
    }
}, AST_Statement);

var AST_While = DEFNODE("While", "condition", {
    walk: function(w) {
        w._visit(this, function(){
            this.condition.walk(w);
            AST_Statement.prototype.walk.call(this, w);
        });
    }
}, AST_Statement);

var AST_For = DEFNODE("For", "init condition step", {
    walk: function(w) {
        w._visit(this, function(){
            if (this.init) this.init.walk(w);
            if (this.condition) this.condition.walk(w);
            if (this.step) this.step.walk(w);
            AST_Statement.prototype.walk.call(this, w);
        });
    }
}, AST_Statement);

var AST_ForIn = DEFNODE("ForIn", "init name object", {
    walk: function(w) {
        w._visit(this, function(){
            if (this.init) this.init.walk(w);
            this.object.walk(w);
            AST_Statement.prototype.walk.call(this, w);
        });
    }
}, AST_Statement);

var AST_With = DEFNODE("With", "expression", {
    walk: function(w) {
        w._visit(this, function(){
            this.expression.walk(w);
            AST_Statement.prototype.walk.call(this, w);
        });
    }
}, AST_Statement);

/* -----[ functions ]----- */

var AST_Scope = DEFNODE("Scope", "identifiers", {
    walk: function(w) {
        w._visit(this, function(){
            if (this.identifiers) this.identifiers.forEach(function(el){
                el.walk(w);
            });
            AST_Statement.prototype.walk.call(this, w);
        });
    }
}, AST_Statement);

var AST_Toplevel = DEFNODE("Toplevel", null, {

}, AST_Scope);

var AST_Lambda = DEFNODE("Lambda", "name argnames", {
    walk: function(w) {
        w._visit(this, function(){
            if (this.name) this.name.walk(w);
            this.argnames.forEach(function(el){
                el.walk(w);
            });
            AST_Scope.prototype.walk.call(this, w);
        });
    }
}, AST_Scope);

var AST_Function = DEFNODE("Function", null, {

}, AST_Lambda);

var AST_Defun = DEFNODE("Defun", null, {

}, AST_Function);

/* -----[ JUMPS ]----- */

var AST_Jump = DEFNODE("Jump", null, {

});

var AST_Exit = DEFNODE("Exit", "value", {
    walk: function(w) {
        w._visit(this, function(){
            if (this.value) this.value.walk(w);
        });
    }
}, AST_Jump);

var AST_Return = DEFNODE("Return", null, {

}, AST_Exit);

var AST_Throw = DEFNODE("Throw", null, {

}, AST_Exit);

var AST_LoopControl = DEFNODE("LoopControl", "label", {
    walk: function(w) {
        w._visit(this, function(){
            if (this.label) this.label.walk(w);
        });
    }
}, AST_Jump);

var AST_Break = DEFNODE("Break", null, {

}, AST_LoopControl);

var AST_Continue = DEFNODE("Continue", null, {

}, AST_LoopControl);

/* -----[ IF ]----- */

var AST_If = DEFNODE("If", "condition consequent alternative", {
    walk: function(w) {
        w._visit(this, function(){
            this.condition.walk(w);
            this.consequent.walk(w);
            if (this.alternative) this.alternative.walk(w);
        });
    }
});

/* -----[ SWITCH ]----- */

var AST_Switch = DEFNODE("Switch", "expression", {
    walk: function(w) {
        w._visit(this, function(){
            this.expression.walk(w);
            AST_Statement.prototype.walk.call(this, w);
        });
    }
}, AST_Statement);

var AST_SwitchBlock = DEFNODE("SwitchBlock", null, {
    walk       : AST_Statement.prototype.walk,
    walk_array : AST_Bracketed.prototype.walk
}, AST_Bracketed);

var AST_SwitchBranch = DEFNODE("SwitchBranch", "body", {
    walk       : AST_Statement.prototype.walk,
    walk_array : AST_Bracketed.prototype.walk
});

var AST_Default = DEFNODE("Default", null, {

}, AST_SwitchBranch);

var AST_Case = DEFNODE("Case", "expression", {
    walk: function(w) {
        w._visit(this, function(){
            this.expression.walk(w);
            AST_Statement.prototype.walk.call(this, w);
        });
    }
}, AST_SwitchBranch);

/* -----[ EXCEPTIONS ]----- */

var AST_Try = DEFNODE("Try", "btry bcatch bfinally", {
    walk: function(w) {
        w._visit(this, function(){
            this.btry.walk(w);
            if (this.bcatch) this.bcatch.walk(w);
            if (this.bfinally) this.bfinally.walk(w);
        });
    }
});

var AST_Catch = DEFNODE("Catch", "argname body", {
    walk: function(w) {
        w._visit(this, function(){
            this.argname.walk(w);
            this.body.walk(w);
        });
    }
});

var AST_Finally = DEFNODE("Finally", null, {

}, AST_Bracketed);

/* -----[ VAR/CONST ]----- */

var AST_Definitions = DEFNODE("Definitions", "definitions", {
    walk: function(w) {
        w._visit(this, function(){
            this.definitions.forEach(function(el){
                el.walk(w);
            });
        });
    }
});

var AST_Var = DEFNODE("Var", null, {

}, AST_Definitions);

var AST_Const = DEFNODE("Const", null, {

}, AST_Definitions);

var AST_VarDef = DEFNODE("VarDef", "name value", {
    walk: function(w) {
        w._visit(this, function(){
            this.name.walk(w);
            if (this.value) this.value.walk(w);
        });
    }
});

/* -----[ OTHER ]----- */

var AST_Call = DEFNODE("Call", "expression args", {
    walk: function(w) {
        w._visit(this, function(){
            this.expression.walk(w);
            this.args.forEach(function(el){
                el.walk(w);
            });
        });
    }
});

var AST_New = DEFNODE("New", null, {

}, AST_Call);

var AST_Seq = DEFNODE("Seq", "first second", {
    walk: function(w) {
        w._visit(this, function(){
            this.first.walk(w);
            this.second.walk(w);
        });
    }
});

var AST_PropAccess = DEFNODE("PropAccess", "expression property", {

});

var AST_Dot = DEFNODE("Dot", null, {
    walk: function(w) {
        w._visit(this, function(){
            this.expression.walk(w);
        });
    }
}, AST_PropAccess);

var AST_Sub = DEFNODE("Sub", null, {
    walk: function(w) {
        w._visit(this, function(){
            this.expression.walk(w);
            this.property.walk(w);
        });
    }
}, AST_PropAccess);

var AST_Unary = DEFNODE("Unary", "operator expression", {
    walk: function(w) {
        w._visit(this, function(){
            this.expression.walk(w);
        });
    }
});

var AST_UnaryPrefix = DEFNODE("UnaryPrefix", null, {

}, AST_Unary);

var AST_UnaryPostfix = DEFNODE("UnaryPostfix", null, {

}, AST_Unary);

var AST_Binary = DEFNODE("Binary", "left operator right", {
    walk: function(w) {
        w._visit(this, function(){
            this.left.walk(w);
            this.right.walk(w);
        });
    }
});

var AST_Conditional = DEFNODE("Conditional", "condition consequent alternative", {
    walk: function(w) {
        w._visit(this, function(){
            this.condition.walk(w);
            this.consequent.walk(w);
            this.alternative.walk(w);
        });
    }
});

var AST_Assign = DEFNODE("Assign", null, {

}, AST_Binary);

/* -----[ LITERALS ]----- */

var AST_Array = DEFNODE("Array", "elements", {
    walk: function(w) {
        w._visit(this, function(){
            this.elements.forEach(function(el){
                el.walk(w);
            });
        });
    }
});

var AST_Object = DEFNODE("Object", "properties", {
    walk: function(w) {
        w._visit(this, function(){
            this.properties.forEach(function(prop){
                prop.walk(w);
            });
        });
    }
});

var AST_ObjectProperty = DEFNODE("ObjectProperty");

var AST_ObjectKeyVal = DEFNODE("ObjectKeyval", "key value", {
    walk: function(w) {
        w._visit(this, function(){
            this.value.walk(w);
        });
    }
}, AST_ObjectProperty);

var AST_ObjectSetter = DEFNODE("ObjectSetter", "name func", {
    walk: function(w) {
        w._visit(this, function(){
            this.func.walk(w);
        });
    }
}, AST_ObjectProperty);

var AST_ObjectGetter = DEFNODE("ObjectGetter", "name func", {
    walk: function(w) {
        w._visit(this, function(){
            this.func.walk(w);
        });
    }
}, AST_ObjectProperty);

var AST_Symbol = DEFNODE("Symbol", "name", {
});

var AST_This = DEFNODE("This", null, {

}, AST_Symbol);

var AST_SymbolRef = DEFNODE("SymbolRef", "scope symbol", {

}, AST_Symbol);

var AST_Label = DEFNODE("Label", null, {

}, AST_SymbolRef);

var AST_Constant = DEFNODE("Constant", null, {
    getValue: function() {
        return this.value;
    }
});

var AST_String = DEFNODE("String", "value", {

}, AST_Constant);

var AST_Number = DEFNODE("Number", "value", {

}, AST_Constant);

var AST_RegExp = DEFNODE("Regexp", "pattern mods", {
    initialize: function() {
        this.value = new RegExp(this.pattern, this.mods);
    }
}, AST_Constant);

var AST_Atom = DEFNODE("Atom", null, {

}, AST_Constant);

var AST_Null = DEFNODE("Null", null, {
    value: null
}, AST_Atom);

var AST_Undefined = DEFNODE("Undefined", null, {
    value: (function(){}())
}, AST_Atom);

var AST_False = DEFNODE("False", null, {
    value: false
}, AST_Atom);

var AST_True = DEFNODE("True", null, {
    value: true
}, AST_Atom);

/* -----[ Walker ]----- */

function TreeWalker(visitor) {
    this.stack = [];
    if (visitor) this.visit = visitor;
};

TreeWalker.prototype = {
    visit: function(node){},
    parent: function(n) {
        if (n == null) n = 1;
        return this.stack[this.stack.length - n];
    },
    find_parent: function(type) {
        for (var a = this.stack, i = a.length; --i >= 0;)
            if (a[i] instanceof type) return a[i];
        return null;
    },
    _visit: function(node, descend) {
        this.visit(node);
        if (descend) {
            this.stack.push(node);
            descend.call(node);
            this.stack.pop();
        }
    }
};
