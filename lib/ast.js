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
    var proto = base && new base;
    if (proto && proto.initialize || (methods && methods.initialize))
        code += "this.initialize();";
    code += " } }";
    var ctor = new Function(code)();
    if (proto) {
        ctor.prototype = proto;
        ctor.BASE = base;
    }
    ctor.prototype.CTOR = ctor;
    ctor.PROPS = props || null;
    if (type) {
        ctor.prototype.TYPE = ctor.TYPE = type;
    }
    if (methods) for (i in methods) if (HOP(methods, i)) {
        ctor.prototype[i] = methods[i];
    }
    ctor.DEFMETHOD = function(name, method) {
        this.prototype[name] = method;
    };
    return ctor;
};

var AST_Token = DEFNODE("Token", "type value line col pos endpos nlb comments_before", {
}, null);

var AST_Node = DEFNODE("Node", "start end", {
    _walk: function(visitor) {
        return visitor._visit(this);
    },
    walk: function(visitor) {
        return this._walk(visitor); // not sure the indirection will be any help
    }
}, null);

var AST_Debugger = DEFNODE("Debugger", null, {
});

var AST_Directive = DEFNODE("Directive", "value", {
});

/* -----[ loops ]----- */

var AST_LabeledStatement = DEFNODE("LabeledStatement", "label statement", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.label._walk(visitor);
            this.statement._walk(visitor);
        });
    }
});

var AST_Statement = DEFNODE("Statement", "body", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.body._walk(visitor);
        });
    }
});

var AST_SimpleStatement = DEFNODE("SimpleStatement", null, {
}, AST_Statement);

var AST_BlockStatement = DEFNODE("BlockStatement", null, {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            var a = this.body, i = 0, n = a.length;
            while (i < n) {
                a[i++]._walk(visitor);
            }
        });
    }
}, AST_Statement);

var AST_EmptyStatement = DEFNODE("EmptyStatement", null, {
    _walk: function(visitor) {
        return visitor._visit(this);
    }
}, AST_Statement);

var AST_DWLoop = DEFNODE("DWLoop", "condition", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.condition._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, AST_Statement);

var AST_Do = DEFNODE("Do", null, {
}, AST_DWLoop);

var AST_While = DEFNODE("While", null, {
}, AST_DWLoop);

var AST_For = DEFNODE("For", "init condition step", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            if (this.init) this.init._walk(visitor);
            if (this.condition) this.condition._walk(visitor);
            if (this.step) this.step._walk(visitor);
        });
    }
}, AST_Statement);

var AST_ForIn = DEFNODE("ForIn", "init name object", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            if (this.init) this.init._walk(visitor);
            if (this.name) this.name._walk(visitor);
            if (this.object) this.object._walk(visitor);
        });
    }
}, AST_Statement);

var AST_With = DEFNODE("With", "expression", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, AST_Statement);

/* -----[ scope and functions ]----- */

var AST_Scope = DEFNODE("Scope", null, {
    initialize: function() {
        this.labels = {};
        this.variables = {};
        this.functions = {};
        this.uses_with = false;
        this.uses_eval = false;
        this.parent_scope = null;
    }
}, AST_BlockStatement);

var AST_Toplevel = DEFNODE("Toplevel", null, {
}, AST_Scope);

var AST_Lambda = DEFNODE("Lambda", "name argnames", {
    initialize: function() {
        AST_Scope.prototype.initialize.call(this);
        this.uses_arguments = false;
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            if (this.name) this.name._walk(visitor);
            this.argnames.forEach(function(arg){
                arg._walk(visitor);
            });
            this.body._walk(visitor);
        });
    }
}, AST_Scope);

var AST_Function = DEFNODE("Function", null, {
}, AST_Lambda);

var AST_Defun = DEFNODE("Defun", null, {
}, AST_Lambda);

/* -----[ JUMPS ]----- */

var AST_Jump = DEFNODE("Jump", null, {
});

var AST_Exit = DEFNODE("Exit", "value", {
    _walk: function(visitor) {
        return visitor._visit(this, this.value && function(){
            this.value._walk(visitor);
        });
    }
}, AST_Jump);

var AST_Return = DEFNODE("Return", null, {
}, AST_Exit);

var AST_Throw = DEFNODE("Throw", null, {
}, AST_Exit);

var AST_LoopControl = DEFNODE("LoopControl", "label", {
    _walk: function(visitor) {
        return visitor._visit(this, this.label && function(){
            this.label._walk(visitor);
        });
    }
}, AST_Jump);

var AST_Break = DEFNODE("Break", null, {
}, AST_LoopControl);

var AST_Continue = DEFNODE("Continue", null, {
}, AST_LoopControl);

/* -----[ IF ]----- */

var AST_If = DEFNODE("If", "condition consequent alternative", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.condition._walk(visitor);
            this.consequent._walk(visitor);
            if (this.alternative) this.alternative._walk(visitor);
        });
    }
});

/* -----[ SWITCH ]----- */

var AST_Switch = DEFNODE("Switch", "expression", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, AST_Statement);

var AST_SwitchBlock = DEFNODE("SwitchBlock", null, {
}, AST_BlockStatement);

var AST_SwitchBranch = DEFNODE("SwitchBranch", null, {
}, AST_BlockStatement);

var AST_Default = DEFNODE("Default", null, {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            AST_BlockStatement.prototype._walk.call(this, visitor);
        });
    }
}, AST_SwitchBranch);

var AST_Case = DEFNODE("Case", "expression", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            AST_BlockStatement.prototype._walk.call(this, visitor);
        });
    }
}, AST_SwitchBranch);

/* -----[ EXCEPTIONS ]----- */

var AST_Try = DEFNODE("Try", "btry bcatch bfinally", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.btry._walk(visitor);
            if (this.bcatch) this.bcatch._walk(visitor);
            if (this.bfinally) this.bfinally._walk(visitor);
        });
    }
});

// XXX: this is wrong according to ECMA-262 (12.4).  the catch block
// should introduce another scope, as the argname should be visible
// only inside the catch block.  However, doing it this way because of
// IE which simply introduces the name in the surrounding scope.  If
// we ever want to fix this then AST_Catch should inherit from
// AST_Scope.
var AST_Catch = DEFNODE("Catch", "argname", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.argname._walk(visitor);
            this.body._walk(visitor);
        });
    }
}, AST_BlockStatement);

var AST_Finally = DEFNODE("Finally", null, {
}, AST_BlockStatement);

/* -----[ VAR/CONST ]----- */

var AST_Definitions = DEFNODE("Definitions", "definitions", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.definitions.forEach(function(def){
                def._walk(visitor);
            });
        });
    }
});

var AST_Var = DEFNODE("Var", null, {
}, AST_Definitions);

var AST_Const = DEFNODE("Const", null, {
}, AST_Definitions);

var AST_VarDef = DEFNODE("VarDef", "name value", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.name._walk(visitor);
            if (this.value) this.value._walk(visitor);
        });
    }
});

/* -----[ OTHER ]----- */

var AST_Call = DEFNODE("Call", "expression args", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            this.args.forEach(function(arg){
                arg._walk(visitor);
            });
        });
    }
});

var AST_New = DEFNODE("New", null, {
}, AST_Call);

var AST_Seq = DEFNODE("Seq", "first second", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.first._walk(visitor);
            this.second._walk(visitor);
        });
    }
});

var AST_PropAccess = DEFNODE("PropAccess", "expression property", {
});

var AST_Dot = DEFNODE("Dot", null, {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
        });
    }
}, AST_PropAccess);

var AST_Sub = DEFNODE("Sub", null, {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            this.property._walk(visitor);
        });
    }
}, AST_PropAccess);

var AST_Unary = DEFNODE("Unary", "operator expression", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
        });
    }
});

var AST_UnaryPrefix = DEFNODE("UnaryPrefix", null, {
}, AST_Unary);

var AST_UnaryPostfix = DEFNODE("UnaryPostfix", null, {
}, AST_Unary);

var AST_Binary = DEFNODE("Binary", "left operator right", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.left._walk(visitor);
            this.right._walk(visitor);
        });
    }
});

var AST_Conditional = DEFNODE("Conditional", "condition consequent alternative", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.condition._walk(visitor);
            this.consequent._walk(visitor);
            this.alternative._walk(visitor);
        });
    }
});

var AST_Assign = DEFNODE("Assign", "left operator right", {
}, AST_Binary);

/* -----[ LITERALS ]----- */

var AST_Array = DEFNODE("Array", "elements", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.elements.forEach(function(el){
                el._walk(visitor);
            });
        });
    }
});

var AST_Object = DEFNODE("Object", "properties", {
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.properties.forEach(function(prop){
                prop._walk(visitor);
            });
        });
    }
});

var AST_ObjectProperty = DEFNODE("ObjectProperty", "key value");

var AST_ObjectKeyVal = DEFNODE("ObjectKeyval", null, {
}, AST_ObjectProperty);

var AST_ObjectSetter = DEFNODE("ObjectSetter", null, {
}, AST_ObjectProperty);

var AST_ObjectGetter = DEFNODE("ObjectGetter", null, {
}, AST_ObjectProperty);

var AST_Symbol = DEFNODE("Symbol", "scope name", {
});

var AST_SymbolDeclaration = DEFNODE("SymbolDeclaration", "references", {
    initialize: function() {
        this.references = [];
    }
}, AST_Symbol);

var AST_SymbolVar = DEFNODE("SymbolVar", null, {
    $documentation: "Symbol defining a variable or constant"
}, AST_SymbolDeclaration);

var AST_SymbolFunarg = DEFNODE("SymbolFunarg", null, {
    $documentation: "Symbol naming a function argument"
}, AST_SymbolVar);

var AST_SymbolDefun = DEFNODE("SymbolDefun", null, {
    $documentation: "Symbol defining a function"
}, AST_SymbolDeclaration);

var AST_SymbolLambda = DEFNODE("SymbolLambda", null, {
    $documentation: "Symbol naming a function expression"
}, AST_SymbolDeclaration);

var AST_SymbolCatch = DEFNODE("SymbolCatch", null, {
    $documentation: "Symbol naming the exception in catch"
}, AST_SymbolDeclaration);

var AST_Label = DEFNODE("Label", null, {
    $documentation: "Symbol naming a label (declaration)"
}, AST_SymbolDeclaration);

var AST_SymbolRef = DEFNODE("SymbolRef", "symbol", {
    $documentation: "Reference to some symbol (not definition/declaration)",
    reference: function(symbol) {
        if (symbol) {
            this.symbol = symbol;
            symbol.references.push(this);
            this.global = symbol.scope.parent_scope == null;
        } else {
            this.undeclared = true;
            this.global = true;
        }
    }
}, AST_Symbol);

var AST_LabelRef = DEFNODE("LabelRef", null, {
    $documentation: "Reference to a label symbol"
}, AST_SymbolRef);

var AST_This = DEFNODE("This", null, {
}, AST_Symbol);

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

/* -----[ TreeWalker ]----- */

function TreeWalker(callback) {
    this.visit = callback;
    this.stack = [];
};
TreeWalker.prototype = {
    _visit: function(node, descend) {
        this.stack.push(node);
        var ret = this.visit(node, descend);
        if (!ret && descend) {
            descend.call(node);
        }
        this.stack.pop(node);
        return ret;
    }
};
