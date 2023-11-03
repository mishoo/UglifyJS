
"use strict";

var INFER = '$';
var GIVEN = '#';

var EXPECTED_MAX_NODES_PER_NONOBFUSACATED_LINE = 25;
var MAX_RATIO_SHORT_NAMES = 0.45;
var NUM_NUMBERED_LOCALS = 5;

function isMinified(toplevel, code, file){
	var numLines = code.split(/\r\n|\r|\n/).length;
	var numStatements = 0;
  	var numNames = 0;
  	var numShortNames = 0;
  	var numNumberedNames = 0;

  	toplevel.walk(new TreeWalker(function(node, descend){
  		numStatements++;
  		if (node instanceof AST_Symbol && !(node instanceof AST_This)) {  			
  			numNames++;
  			if (node.name.length <= 2 && node.name != "el" && node.name != "$") {
  				numShortNames++;
  			}
  			if (node.name.length >= 2 && node.name[0] == '_') {
  				var c2 = node.name[1];
  				if (c2 >= '0' && c2 <= '9') ++numNumberedNames;
  			}
  		}
  	}));

    return (EXPECTED_MAX_NODES_PER_NONOBFUSACATED_LINE * numLines <= numStatements) ||
        (numShortNames > numNames * MAX_RATIO_SHORT_NAMES) ||
        numNumberedNames == numNames ||
        numNumberedNames >= NUM_NUMBERED_LOCALS;
}

function replaceMangled(code, file, infered_names) {
	var toplevel;
	try {
		toplevel = parseFile(code, file);
	} catch (ex){
		throw new Parse_Error(ex);
	}

	extendAst(toplevel);

	//feature_outputter.string_map defines what id is assigned to each node in the final output
	//therefore to assign same ids, we need to first populate string_map by running feature extraction
	var feature_outputter = new FeatureJsonOutputter();
	generateAstFeatures(toplevel, feature_outputter);
	generateFnamesFeatures(toplevel, feature_outputter);
	generateFscopeConstraints(toplevel, feature_outputter);

	var stream;
	if (typeof infered_names !== 'undefined') {
		//replace variables with inferred names
		stream = OutputStream({
			beautify: true, replace_mangled: function (node) {
				var label = nodeToProperty(node).toString();
				if (node.definition() && feature_outputter.string_map.hasId(label) && feature_outputter.string_map.getId(label) in infered_names){
					return infered_names[feature_outputter.string_map.getId(label)];
				} else {
					return node.name;
				}
				//return node.definition() ? infered_names[feature_outputter.string_map.getId("$" + node.definition().id + "-" + node.name)] : node.name;
			}
		});
	} else {
		//replace variables with placeholders. Using in the online demo for interactive renaming.
		stream = OutputStream({
			beautify: true, replace_mangled: function (node) {
				if (node.definition() && feature_outputter.string_map.hasId(nodeToProperty(node).toString())){
					return "local$$" + feature_outputter.string_map.getId(nodeToProperty(node).toString());
				} else {
					return node.name;
				}
				//return node.definition() ? "local$$" + feature_outputter.string_map.getId("$" + node.definition().id + "-" + node.name) : node.name;
			}
		});
	}
	toplevel.print(stream);
	return stream.toString();
}

function Minified_Error(message) {
	this.message = message;
}

function Parse_Error(ex) {
	this.message = ex.toString();
}

function extractFeatures(code, file, print_ast, features, skip_minified) {
	var toplevel;

	try {
		toplevel = parseFile(code, file);
	} catch (ex){
		throw new Parse_Error(ex);
	}

	extendAst(toplevel);

	if (print_ast) {
		return printAst(toplevel);
	}

	if (skip_minified && isMinified(toplevel, code, file)){
		throw new Minified_Error("Skipping minified file");
	}
	
	var feature_outputter = new FeatureJsonOutputter();
	feature_outputter.openElem();
	feature_outputter.openArray("query");

	if (features.indexOf("ASTREL") != -1) {
		generateAstFeatures(toplevel, feature_outputter);
	}

	if (features.indexOf("FNAMES") != -1) {
		generateFnamesFeatures(toplevel, feature_outputter);
	}

	if (features.indexOf("FSCOPE") != -1) {
		generateFscopeConstraints(toplevel, feature_outputter);
	}

	feature_outputter.closeArray();
	feature_outputter.dumpSymbols();
	feature_outputter.closeElem();

	return feature_outputter.output;
}

/* -----[ functions ]----- */

function Property(must_infer, name, annotation) {
	this.must_infer = must_infer;
	this.name = name;
	this.annotation = annotation;
}

Property.prototype.toString = function () {
	return (this.must_infer ? INFER : GIVEN) + this.name;
}

function nodeToProperty(node, parent) {
	if (node == null) return null;

	if (node instanceof AST_Symbol){
		if (node instanceof AST_This ){
			//return GIVEN + node.name;
			return new Property(false, node.name, "");
		}
		// AST_Symbol::unmangleable() returns true if this symbol cannot be renamed (it's either global, undeclared, or defined in scope where eval or with are in use.
		if (node.unmangleable({})){
			//return GIVEN + node.name;
			return new Property(false, node.name, "");
		}		
		//return INFER + node.definition().id + "-" + node.name;
		return new Property(true, node.definition().id + "-" + node.name, "");
	} else if (node instanceof AST_Constant){
		//var name = GIVEN + String(node.value).slice(0,64);
		//name.annotation = "!" + nodeType(node) + "!";
		//return name;
		return new Property(false, String(node.value).slice(0,64), nodeType(node));
	} else if (node instanceof AST_Sub){
		//x[1], x -> expression, 1 -> property

		if (nodeToProperty(node.expression, node) == null) {
			return null;
		}
		var prop = nodeToProperty(node.expression, node);
		prop.annotation += "[]";
		return prop;
	} else if (node instanceof AST_PropAccess){
		//return GIVEN + node.property;
		return new Property(false, node.property, "");
	} else if (node instanceof AST_Defun) {
		//function foo(...) { ... }		
		return nodeToProperty(node.name, node);
	} else if (node instanceof AST_VarDef){
		// var x = function () { ... }
		return nodeToProperty(node.name, node);
	} else if (node instanceof AST_Assign){
		//x = function () { ... }
		return nodeToProperty(node.left, node);
	} else if (node instanceof AST_ObjectProperty){
		// { "x" : function () { ... } }
		//return GIVEN + node.key;
		return new Property(false, node.key, "");
	} else if (node instanceof AST_Call){
		//x.foo( function () { ... } )
		//foo( function () { ... } )
		return nodeToProperty(node.expression,  node);
	} else if (node instanceof AST_Lambda) {
		if (node.parent instanceof AST_Call){
			//'node.parent.expression != node' as lambda can call itself
			if (node.parent.expression == node) {
				return null;
			}

			if (nodeToProperty(node.parent.expression, node) == null) {
				return null;
			}

			//var name = nodeToProperty(node.parent.expression, node);
			//name.annotation = "(" + node.child_id + ")";
			//return name;
			var prop = nodeToProperty(node.parent.expression, node);
			prop.annotation += "(" + node.child_id + ")";
			return prop;
		}
		if (node.parent != parent) {
			return nodeToProperty(node.parent, node);
		}
	}

	return null;
}

function nodeType(node) {
	if (node instanceof AST_Binary || node instanceof AST_Unary) {
		return Object.getPrototypeOf(node).TYPE + node.operator;
	} else if (node instanceof AST_Boolean) {
		return "Bool";	
	} else if (node instanceof AST_Atom && !(node instanceof AST_Constant)) {
		//atoms are special constant values as Nan, Undefined, Infinity,..
		return "Atom";
	} 

	return Object.getPrototypeOf(node).TYPE;
}

function pathToStringFw(path, start){
	var res = "";
	for (var i = start; i < path.length - 1; i++) {
		res += nodeType(path[i]);
		res += "[" + path[i+1].child_id + "]";
	}

	return res;
}

function pathToStringBw(path, start){
	var res = "[" + path[path.length-1].child_id + "]";
	for (var i = path.length - 2; i >= start; i--) {
		res += nodeType(path[i]);
		res += "[" + path[i].child_id + "]";
	}

	return res;
}

function printAst(toplevel){
	var output = "";

	var walker = new TreeWalker(function(node){
		output += string_template('  node{id} [label="{label}"];\n', {
			id: node.id,
			label: nodeType(node)
		});

		if (walker.parent() != null) {
			output += string_template('  node{id1} -> node{id2} [weight=1];\n', {
				id1: walker.parent().id,
				id2: node.id
			});
		}
	});

	output += "digraph AST {\n";
	toplevel.walk(walker);
	output += "}\n";
	return output;
}

function generateAstFeatures(toplevel, feature_outputter) {
	var walker = new TreeWalker(function(node){
		// console.log(nodeType(node) + " - " + nodeToProperty(node));
		var paths = this.node_finder.find(node);
		for (var i = 0; i < paths.length; i++) {
			var path1 = paths[i];
			var node1 = path1[path1.length - 1];

			for (var j = i + 1; j < paths.length; j++) {
				var common_prefix_len = 0;
				var path2 = paths[j];
				var node2 = path2[path2.length - 1];

				//determine common prefix to be skipped
				while(common_prefix_len < path1.length && common_prefix_len < path2.length 
					&& path1[common_prefix_len] === path2[common_prefix_len]){
					common_prefix_len++;
				}

				if (common_prefix_len == 0) {
					throw  "common prefix not greater than 0!";
				}

				feature_outputter.addFeature(
					nodeToProperty(node1),
					nodeToProperty(node2),
					//pathToStringBw(path1, common_prefix_len) + ":" + nodeType(path1[common_prefix_len - 1]) + ":" + pathToStringFw(path2, common_prefix_len)
					(path2.length != common_prefix_len)
						? pathToStringBw(path1, common_prefix_len) + ":" + pathToStringFw(path2, common_prefix_len - 1)
						: pathToStringBw(path2, common_prefix_len) + ":" + pathToStringFw(path1, common_prefix_len - 1)
				);

			}
		}
	});

	walker.node_finder = new NodePathFinder(3, function(node) {
		return (node instanceof AST_Symbol || node instanceof AST_Constant || node instanceof AST_PropAccess);
	});

	toplevel.walk(walker);
}

function addFeatures(lhss, lhs_label, rhs, rhs_label, feature_outputter){	
	var prefix = "";
	for (var i = lhss.length - 1; i >= 0; i--) {
		prefix += lhs_label;
		feature_outputter.addFeature(lhss[i], rhs, prefix + rhs_label);
	}
}

function addScopeConstraints(node, toplevel, feature_outputter){
	feature_outputter.beginScope();
	var name = nodeToProperty(node);
	if (name != null)
		feature_outputter.addToScope(name);

	for (var i = 0; i < node.enclosed.length; i++){
		feature_outputter.addToScope(nodeToProperty(node.enclosed[i].orig[0]));
	}

	node.variables.each(function(symbol){
		if (symbol.name === "arguments" && !symbol.scope.uses_arguments) return;
		feature_outputter.addToScope(nodeToProperty(symbol.orig[0]));
	});

	toplevel.globals.each(function(symbol){
		feature_outputter.addToScope(nodeToProperty(symbol.orig[0]));
	});

	feature_outputter.endScope();
}


function generateFscopeConstraints(toplevel, feature_outputter){
	addScopeConstraints(toplevel, toplevel, feature_outputter);
	toplevel.walk(new TreeWalker(function(node) {
		if (node instanceof AST_Defun || node instanceof AST_Lambda) {
			addScopeConstraints(node, toplevel, feature_outputter);
		}
	}));
}

function generateFnamesFeatures(toplevel, feature_outputter){
	var outer_funcs = [];

	toplevel.walk(new TreeWalker(function(node, descend){

		if ((node instanceof AST_Defun || node instanceof AST_Lambda) && nodeToProperty(node) != null) {
			var name = nodeToProperty(node);

			for (var i = 0; i < node.argnames.length; i++) {
				addFeatures([name], "FN", nodeToProperty(node.argnames[i]), "PAR", feature_outputter);
			}

			outer_funcs.push(name);
			descend();	//traverse childs
			outer_funcs.pop();

			return true; //do not traverse childs again
		}

		if (node instanceof AST_New) {	
			addFeatures(outer_funcs, "FN", nodeToProperty(node), "NEW", feature_outputter);
		} else if (node instanceof AST_Call) {			
			addFeatures(outer_funcs, "FN", nodeToProperty(node), "CALL", feature_outputter);
		} else if (node instanceof AST_Constant){
			addFeatures(outer_funcs, "FN", nodeToProperty(node), nodeType(node).toUpperCase(), feature_outputter);
		} else if (node instanceof AST_VarDef){
			addFeatures(outer_funcs, "FN", nodeToProperty(node.name), "DECL", feature_outputter);
		} else if (node instanceof AST_Dot && !(node.parent instanceof AST_Call)) {			
			addFeatures(outer_funcs, "FN", nodeToProperty(node), "PROP", feature_outputter);
		} else if (node instanceof AST_Return && nodeToProperty(node.value) != null) {
			addFeatures(outer_funcs, "FN", nodeToProperty(node.value), "RETURN", feature_outputter);
		}
	}));
}

/* -----[ NodePathFinder ]----- */

function NodePathFinder(max_depth, filter) { 
	this.max_depth = max_depth;
	this.paths = [];
	this.filter = filter;
}

NodePathFinder.prototype = new TreeWalker(function(node, descend){
	if (this.stack.length > this.max_depth || node instanceof AST_Defun){
		return true;
	}

	//enforce in-order traversal
	//otherwise we get for "x.foo()" feature foo - x instead of x - foo as x is a parent of foo in the AST
	descend();

	if (this.filter(node)) {
		this.paths.push(this.stack.slice(0));
	} 

	return true;
});

NodePathFinder.prototype.find = function(node) {
	this.root = node;
	this.paths = [];
	node.walk(this);
	return this.paths;
};

/* ---[ JsonOutputter ]--- */

function FeatureJsonOutputter() {
	this.string_map = new StringMap();
	this.first_element = true;
	this.output = "";
	this.depth = 0;
	this.pairs = {};
	this.cur_scope = {};
	this.has_features = false;
}

FeatureJsonOutputter.prototype.indent = function() {
	var res = "";
	for (var i = 0; i < this.depth; i++) {
		res += " ";
	}
	return res;
};

FeatureJsonOutputter.prototype.openElem = function() {
	if (!this.first_element) {
		this.output += ",";
	}
	this.output += "\n" + this.indent() + "{";
	this.first_element = true;
	this.depth++;
};

FeatureJsonOutputter.prototype.closeElem = function() {	
	this.depth--;
	this.output += "}";
	this.first_element = false;	
};


FeatureJsonOutputter.prototype.openArray = function(name){
	if (!this.first_element) {
		this.output += ",";
	}
	this.output += "\n" + this.indent() + "\"" + name + "\":[";
	this.first_element = true;
	this.depth++;
};

FeatureJsonOutputter.prototype.closeArray = function(){
	this.depth--;
	this.output += "\n" + this.indent() + "]";
	this.first_element = false;
};

FeatureJsonOutputter.prototype.visitFeature = function(a_id, b_id, name){
	if (! (a_id in this.pairs) ) {
		this.pairs[a_id] = [];
	}
	var visited = this.pairs[a_id];

	if (visited.indexOf(b_id + "-" + name) >= 0) {
		return true;
	}
	visited.push(b_id + "-" + name);
	return false;
};

FeatureJsonOutputter.prototype.addFeature = function(a, b, name){
	if (a == null || b == null){
		return;
	}

	//do not add features between two fixed nodes
	//if (a[0] == GIVEN && b[0] == GIVEN) {
	if (!a.must_infer && !b.must_infer) {
		return;
	}

	if (a.annotation != "") {
		name = a.annotation + "-" + name;
	}
	if (b.annotation != "") {
		name = name + "-" + b.annotation;
	}

	var a_id = this.string_map.getId(a.toString());
	var b_id = this.string_map.getId(b.toString());

	if (a_id == b_id || this.visitFeature(a_id, b_id, name)){
		return;
	}

	this.has_features = true;

	this.openElem();

	this.output += '"a": ' + a_id + ",";
	this.output += '\t"b": ' + b_id + ",";
	this.output += '\t"f2": "' + name + '"';

	this.closeElem();
};

FeatureJsonOutputter.prototype.addSymbol = function(key){
	this.openElem();
	
	this.output += '"v": ' + this.string_map.getId(key) + ",";
	if (key[0] == INFER){
		//${id}-{name}		
		this.output += '\t"inf": "' + escapeString(key.split("-")[1]) + '"';
	} else {
		//#{name}
		this.output += '\t"giv": "' + escapeString(key.slice(1)) + '"';
	}
	
	this.closeElem();
};

FeatureJsonOutputter.prototype.dumpSymbols = function(){
	if (!this.has_features) {
		this.openArray("assign");
		this.closeArray();
		return;
	}

	this.openArray("assign");

	// var keys = Object.keys( this.string_map.map );
	var keys = this.string_map.keys;	
 	for( var i = 0,length = keys.length; i < length; i++ ) {
 		this.addSymbol(keys[i]);
 	}

	this.closeArray();
};

FeatureJsonOutputter.prototype.beginScope = function(){
	this.cur_scope = {};
};

FeatureJsonOutputter.prototype.addToScope = function(a){
	var a_id = this.string_map.getId(a);
	this.cur_scope[a_id] = true;
};

FeatureJsonOutputter.prototype.endScope = function(){
	//{"cn":"!=","n":[14,366,370,372,108,40,356]}
	if (!this.has_features) {
		return;
	}

	var keys = Object.keys(this.cur_scope);
	if (keys.length <= 1) {
		return;
	}

	this.openElem();
	this.output += '"cn":"!=", "n":[';

	this.output += keys[0];
	for(var i = 1,length = keys.length; i < length; i++ ) {
		this.output += ',';
		this.output += keys[i];
	}

	this.output += "]";
	this.closeElem();
};

/* -----[ StringMap ]----- */

function StringMap() {
	this.map = {};
	this.current_id = 0;
	this.keys = [];
}

StringMap.prototype.hasId = function(input){
	if (input == null){
		throw new Error("error null");
	}

	//we add a special character in from to allow for keys such as "toString"
	var escaped_input = "#" + input.toString();
	return escaped_input in this.map;
};

StringMap.prototype.getId = function(input){
	if (input == null){
		throw new Error("error null");
	}

	input = input.toString();
	//we add a special character in from to allow for keys such as "toString"
	var escaped_input = "#" + input;

	if (!(escaped_input in this.map)) {
		this.map[escaped_input] = this.current_id;

		//keep ordered map of keys for iterating later
		this.keys.push(input);
		this.current_id++;	
	}
	
	return this.map[escaped_input];
};

/* ------------------------ */

function escapeString(input){
	try {
		return encodeURIComponent(input);
	} catch (ex){
		throw new Parse_Error(" unable to encode '" + input.replace(/^!(String|Number|RegExp|Atom|Bool')!/, '') + "'");
	}
}

function unescapeString(input){
	return decodeURIComponent(input);
}

function parseFile(code, file) {	
	var toplevel = parse(code, {
		filename	: file
	});
	toplevel.figure_out_scope();
	return toplevel;
}

function extendAst(root){
	var current_id = 0;

	var walker = new TreeWalker(function(node){
		
		if (!Object.prototype.hasOwnProperty.call(node, "id")){
			node.id = current_id;
			current_id += 1;
		}
		if (!Object.prototype.hasOwnProperty.call(node, "parent")){
			node.parent = walker.parent();
		}
		node.num_childs = 0;
		node.child_id = 0;
		if (walker.parent() !== undefined){
			node.child_id = walker.parent().num_childs;
			walker.parent().num_childs++;
		}

		if (node instanceof AST_Symbol) {
			if (node.definition() != null) {
				node.definition().id = current_id;
				current_id++;
			}
		}
	});
	root.walk(walker);
}