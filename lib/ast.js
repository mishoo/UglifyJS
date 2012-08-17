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
        code += "this.initialize();";
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
    ctor.DEFMETHOD = function(name, method) {
        this.prototype[name] = method;
    };
    return ctor;
};

var AST_Token = DEFNODE("Token", "type value line col pos endpos nlb comments_before", {

}, null);

var AST_Node = DEFNODE("Node", "start end", {
    clone: function() {
        return new this.CTOR(this);
    }
}, null);

var AST_Directive = DEFNODE("Directive", "value", {

});

var AST_Debugger = DEFNODE("Debugger", null, {

});

/* -----[ loops ]----- */

var AST_LabeledStatement = DEFNODE("LabeledStatement", "label statement", {

});

var AST_Statement = DEFNODE("Statement", "body", {
});

var AST_SimpleStatement = DEFNODE("SimpleStatement", null, {

}, AST_Statement);

var AST_BlockStatement = DEFNODE("BlockStatement", null, {

}, AST_Statement);

var AST_EmptyStatement = DEFNODE("EmptyStatement", null, {

}, AST_Statement);

var AST_DWLoop = DEFNODE("DWLoop", "condition", {
}, AST_Statement);

var AST_Do = DEFNODE("Do", null, {
}, AST_DWLoop);

var AST_While = DEFNODE("While", null, {
}, AST_DWLoop);

var AST_For = DEFNODE("For", "init condition step", {
}, AST_Statement);

var AST_ForIn = DEFNODE("ForIn", "init name object", {
}, AST_Statement);

var AST_With = DEFNODE("With", "expression", {
}, AST_Statement);

/* -----[ functions ]----- */

var AST_Scope = DEFNODE("Scope", "identifiers", {
}, AST_Statement);

var AST_Toplevel = DEFNODE("Toplevel", null, {

}, AST_Scope);

var AST_Lambda = DEFNODE("Lambda", "name argnames", {
}, AST_Scope);

var AST_Function = DEFNODE("Function", null, {

}, AST_Lambda);

var AST_Defun = DEFNODE("Defun", null, {

}, AST_Function);

/* -----[ JUMPS ]----- */

var AST_Jump = DEFNODE("Jump", null, {

});

var AST_Exit = DEFNODE("Exit", "value", {
}, AST_Jump);

var AST_Return = DEFNODE("Return", null, {

}, AST_Exit);

var AST_Throw = DEFNODE("Throw", null, {

}, AST_Exit);

var AST_LoopControl = DEFNODE("LoopControl", "label", {
}, AST_Jump);

var AST_Break = DEFNODE("Break", null, {

}, AST_LoopControl);

var AST_Continue = DEFNODE("Continue", null, {

}, AST_LoopControl);

/* -----[ IF ]----- */

var AST_If = DEFNODE("If", "condition consequent alternative", {
});

/* -----[ SWITCH ]----- */

var AST_Switch = DEFNODE("Switch", "expression", {
}, AST_Statement);

var AST_SwitchBlock = DEFNODE("SwitchBlock", null, {
}, AST_BlockStatement);

var AST_SwitchBranch = DEFNODE("SwitchBranch", "body", {
});

var AST_Default = DEFNODE("Default", null, {

}, AST_SwitchBranch);

var AST_Case = DEFNODE("Case", "expression", {
}, AST_SwitchBranch);

/* -----[ EXCEPTIONS ]----- */

var AST_Try = DEFNODE("Try", "btry bcatch bfinally", {
});

var AST_Catch = DEFNODE("Catch", "argname body", {
});

var AST_Finally = DEFNODE("Finally", "body", {
});

/* -----[ VAR/CONST ]----- */

var AST_Definitions = DEFNODE("Definitions", "definitions", {
});

var AST_Var = DEFNODE("Var", null, {

}, AST_Definitions);

var AST_Const = DEFNODE("Const", null, {

}, AST_Definitions);

var AST_VarDef = DEFNODE("VarDef", "name value", {
});

/* -----[ OTHER ]----- */

var AST_Call = DEFNODE("Call", "expression args", {
});

var AST_New = DEFNODE("New", null, {

}, AST_Call);

var AST_Seq = DEFNODE("Seq", "first second", {
});

var AST_PropAccess = DEFNODE("PropAccess", "expression property", {

});

var AST_Dot = DEFNODE("Dot", null, {
}, AST_PropAccess);

var AST_Sub = DEFNODE("Sub", null, {
}, AST_PropAccess);

var AST_Unary = DEFNODE("Unary", "operator expression", {
});

var AST_UnaryPrefix = DEFNODE("UnaryPrefix", null, {

}, AST_Unary);

var AST_UnaryPostfix = DEFNODE("UnaryPostfix", null, {

}, AST_Unary);

var AST_Binary = DEFNODE("Binary", "left operator right", {
});

var AST_Conditional = DEFNODE("Conditional", "condition consequent alternative", {
});

var AST_Assign = DEFNODE("Assign", "left operator right", {

}, AST_Binary);

/* -----[ LITERALS ]----- */

var AST_Array = DEFNODE("Array", "elements", {
});

var AST_Object = DEFNODE("Object", "properties", {
});

var AST_ObjectProperty = DEFNODE("ObjectProperty");

var AST_ObjectKeyVal = DEFNODE("ObjectKeyval", "key value", {
}, AST_ObjectProperty);

var AST_ObjectSetter = DEFNODE("ObjectSetter", "name func", {
}, AST_ObjectProperty);

var AST_ObjectGetter = DEFNODE("ObjectGetter", "name func", {
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
