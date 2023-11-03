truncate_constants: {
	options = {
		features	: "ASTREL"
	};
	input: {
		function chunkData() { 
			var x = "very long string, very long string, very long string, very long string, very long string, very long string, very long string, very long string, very long string, very long string, very long string, very long string";
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[0]:VarDef[1]-String"}
			],
			"assign":[
			{"v": 0,	"inf": "x"},
			{"v": 1,	"giv": "very%20long%20string%2C%20very%20long%20string%2C%20very%20long%20string%2C%20very%20long%20"}
			]
		}`
}

escape_constants: {
	options = {
		features	: "ASTREL"
	};
	input: {
		function chunkData() { 
			var x = '"quoted text"';
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[0]:VarDef[1]-String"}
			],
			"assign":[
			{"v": 0,	"inf": "x"},
			{"v": 1,	"giv": "%22quoted%20text%22"}
			]
		}`
}


var_scope: {
	options = {
		features	: "ASTREL"
	};
	input: {
		function chunkData() { 
			var a = 1;
			var b = 2;
			var x = a + b;
			x = a + b;
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[0]:VarDef[1]-Number"},
			{"a": 2,	"b": 3,	"f2": "[0]:VarDef[1]-Number"},
			{"a": 4,	"b": 0,	"f2": "[0]:VarDef[1]Binary+[0]"},
			{"a": 4,	"b": 2,	"f2": "[0]:VarDef[1]Binary+[1]"},
			{"a": 0,	"b": 2,	"f2": "[0]:Binary+[1]"},
			{"a": 4,	"b": 0,	"f2": "[0]:Assign=[1]Binary+[0]"},
			{"a": 4,	"b": 2,	"f2": "[0]:Assign=[1]Binary+[1]"}
			],
			"assign":[
			{"v": 0,	"inf": "a"},
			{"v": 1,	"giv": "1"},
			{"v": 2,	"inf": "b"},
			{"v": 3,	"giv": "2"},
			{"v": 4,	"inf": "x"}
			]
		}`
}

this_scope: {
	options = {
		features	: "ASTREL"
	};
	input: {
		function chunkData(a) {
			this.x = a;  
		}

		function chunkData2(a) {
			this.x = a;  
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[0]:Assign=[1]"},			
			{"a": 2,	"b": 1,	"f2": "[0]Dot[0]:Assign=[1]"},
			{"a": 0,	"b": 3,	"f2": "[0]:Assign=[1]"},			
			{"a": 2,	"b": 3,	"f2": "[0]Dot[0]:Assign=[1]"}
			],
			"assign":[
			{"v": 0,	"giv": "x"},
			{"v": 1,	"inf": "a"},
			{"v": 2,	"giv": "this"},
			{"v": 3,	"inf": "a"}			
			]
		}`
}

this_is_given: {
	options = {
		features	: "ASTREL"
	};
	input: {
		function chunkData(a) {
			this.x = a;  
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[0]:Assign=[1]"},			
			{"a": 2,	"b": 1,	"f2": "[0]Dot[0]:Assign=[1]"}
			],
			"assign":[
			{"v": 0,	"giv": "x"},
			{"v": 1,	"inf": "a"},
			{"v": 2,	"giv": "this"}
			]
		}`
}


this_attr_scope: {
	options = {
		features	: "ASTREL"
	};
	input: {
		function chunkData(a,b) {
			this.x = a;
			this.x = b;
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[0]:Assign=[1]"},			
			{"a": 2,	"b": 1,	"f2": "[0]Dot[0]:Assign=[1]"},
			{"a": 0,	"b": 3,	"f2": "[0]:Assign=[1]"},
			{"a": 2,	"b": 3,	"f2": "[0]Dot[0]:Assign=[1]"}
			],
			"assign":[
			{"v": 0,	"giv": "x"},
			{"v": 1,	"inf": "a"},
			{"v": 2,	"giv": "this"},
			{"v": 3,	"inf": "b"}
			]
		}`
}

bool_const_type: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData() { 
			var x = true;
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "FNDECL"}			
			],
			"assign":[
			{"v": 0,	"giv": "chunkData"},
			{"v": 1,	"inf": "x"}			
			]
		}`
}

handles_toString_call: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData() { 
			var x = true;
			x.toString();
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "FNDECL"}
			],
			"assign":[
			{"v": 0,	"giv": "chunkData"},
			{"v": 1,	"inf": "x"}			
			]
		}`
}

escape_backslash: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData(x) { 
			x.replace(/\s/g, "a");
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "FNPAR"}			
			],
			"assign":[
			{"v": 0,	"giv": "chunkData"},
			{"v": 1,	"inf": "x"}			
			]
		}`
}

func_no_duplicates: {
	options = {
		features	: "ASTREL"
	};
	input: {
		function chunkData() { 
			var a = new chunkData();
			a = new chunkData();			
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[0]:VarDef[1]New[0]"},
			{"a": 0,	"b": 1,	"f2": "[0]:Assign=[1]New[0]"}
			],
			"assign":[
			{"v": 0,	"inf": "a"},
			{"v": 1,	"giv": "chunkData"}
			]
		}`
}

func_allow_different_features_duplicates: {
	options = {
		features	: "ASTREL"
	};
	input: {
		function chunkData(x) { 
			x.foo(42, 42, 42, 42);
			return 42;
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[0]:Dot[0]"},
			{"a": 0,	"b": 2,	"f2": "[0]Dot[0]:Call[1]-Number"},
			{"a": 0,	"b": 2,	"f2": "[0]Dot[0]:Call[2]-Number"},
			{"a": 0,	"b": 2,	"f2": "[0]Dot[0]:Call[3]-Number"},
			{"a": 0,	"b": 2,	"f2": "[0]Dot[0]:Call[4]-Number"}
			],
			"assign":[
			{"v": 0,	"inf": "x"},
			{"v": 1,	"giv": "foo"},
			{"v": 2,	"giv": "42"}
			]
		}`
}

method_name_fixed: {	
	input: {
		function chunkData(x) { 
			x.foo();
			bar();
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[0]:Dot[0]"},
			{"a": 2,	"b": 0,	"f2": "FNPAR"}
			],
			"assign":[
			{"v": 0,	"inf": "x"},
			{"v": 1,	"giv": "foo"},
			{"v": 2,	"giv": "chunkData"}
			]
		}`
}