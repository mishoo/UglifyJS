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
    if (methods) for (var i in methods) if (HOP(methods, i)) {
        ctor.prototype[i] = methods[i];
    }
    return ctor;
};

var AST_Token = DEFNODE("Token", "type value line col pos endpos nlb", {

}, null);

var AST_Node = DEFNODE("Node", "start end", {

}, null);

var AST_Directive = DEFNODE("Directive", "value", {

});

var AST_Debugger = DEFNODE("Debugger", null, {

});

var AST_Parenthesized = DEFNODE("Parenthesized", "expression", {
    documentation: "Represents an expression which is always parenthesized.  Used for the \
conditions in IF/WHILE."
});

var AST_Bracketed = DEFNODE("Bracketed", "body", {
    documentation: "Represents a block of statements that are always included in brackets. \
Used for bodies of FUNCTION/TRY/CATCH/THROW/SWITCH."
});

/* -----[ loops ]----- */

var AST_LabeledStatement = DEFNODE("LabeledStatement", "label body", {

});

var AST_Statement = DEFNODE("Statement", null, {

}, AST_LabeledStatement);

var AST_Do = DEFNODE("Do", "condition", {

}, AST_LabeledStatement);

var AST_While = DEFNODE("While", "condition", {

}, AST_LabeledStatement);

var AST_For = DEFNODE("For", "init condition step", {

}, AST_LabeledStatement);

var AST_ForIn = DEFNODE("ForIn", "init name object", {

}, AST_LabeledStatement);

var AST_With = DEFNODE("With", "expression body", {

});

var AST_LoopControl = DEFNODE("LoopControl", "label", {

});
var AST_Break = DEFNODE("Break", null, {

}, AST_LoopControl);
var AST_Continue = DEFNODE("Continue", null, {

}, AST_LoopControl);

/* -----[ functions ]----- */

var AST_Scope = DEFNODE("Scope", "identifiers body", {

});

var AST_Toplevel = DEFNODE("Toplevel", null, {

}, AST_Scope);

var AST_Lambda = DEFNODE("Lambda", "name argnames", {

}, AST_Scope);
var AST_Function = DEFNODE("Function", null, {

}, AST_Lambda);
var AST_Defun = DEFNODE("Defun", null, {

}, AST_Function);

/* -----[ JUMPS ]----- */

var AST_Jump = DEFNODE("Jump", "value");

var AST_Return = DEFNODE("Return", null, {

}, AST_Jump);

var AST_Throw = DEFNODE("Throw", null, {

}, AST_Jump);

/* -----[ IF ]----- */

var AST_If = DEFNODE("If", "condition consequent alternative", {

});

/* -----[ SWITCH ]----- */

var AST_Switch = DEFNODE("Switch", "expression", {

}, AST_LabeledStatement);

var AST_SwitchBlock = DEFNODE("SwitchBlock", null, {

}, AST_Bracketed);

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

var AST_Finally = DEFNODE("Finally", null, {

}, AST_Bracketed);

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

});

/* -----[ LITERALS ]----- */

var AST_RegExp = DEFNODE("Regexp", "pattern mods", {

});

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

var AST_String = DEFNODE("String", "value", {

});

var AST_Number = DEFNODE("Number", "value", {

});

var AST_Boolean = DEFNODE("Boolean", "value", {

});

var AST_Atom = DEFNODE("Atom", null, {

});

var AST_Null = DEFNODE("Null", null, {

}, AST_Atom);

var AST_Undefined = DEFNODE("Undefined", null, {

}, AST_Atom);

var AST_False = DEFNODE("False", null, {

}, AST_Atom);

var AST_True = DEFNODE("True", null, {

}, AST_Atom);
