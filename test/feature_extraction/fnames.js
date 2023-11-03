func_decl_params: {
	options = {
		features   : "FNAMES"
	};
	input: {
		function chunkData(e, t) { }
	}
	expect: `{
			"query":[
			{"a": 0,  "b": 1, "f2": "FNPAR"},
			{"a": 0,  "b": 2, "f2": "FNPAR"}
			],
			"assign":[
			{"v": 0,  "giv": "chunkData"},
			{"v": 1,  "inf": "e"},
			{"v": 2,  "inf": "t"}
			]
		}`
}

func_simple_call: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData() { 
			foo();
		}
	}
	expect: `{
			"query":[
			],
			"assign":[
			]
		}
		`
}

func_args: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData(x) { 
			var n1 = "hello";
			x.foo(b, n1, 42, n1, 42);
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "FNPAR"},
			{"a": 0,	"b": 2,	"f2": "FNDECL"}			
			],
			"assign":[
			{"v": 0,	"giv": "chunkData"},
			{"v": 1,	"inf": "x"},
			{"v": 2,	"inf": "n1"}			
			]
		}
		`
}

inner_lambda_assign_local: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData(x) { 
			var local = function () {
				console.log("hello");
			};
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "FNPAR"},
			{"a": 0,	"b": 2,	"f2": "FNDECL"},
			{"a": 2,	"b": 3,	"f2": "FNCALL"},			
			{"a": 2,	"b": 4,	"f2": "FNSTRING-String"}
			],
			"assign":[
			{"v": 0,	"giv": "chunkData"},
			{"v": 1,	"inf": "x"},
			{"v": 2,	"inf": "local"},
			{"v": 3,	"giv": "log"},
			{"v": 4,	"giv": "hello"}
			]
		}`
}

inner_lambda_assign_global: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData() { 
			global = function (a) {
				console.log("hello");
			};
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "FNPAR"}
			],
			"assign":[
			{"v": 0,	"giv": "global"},
			{"v": 1,	"inf": "a"}
			]
		}`
}

inner_lambda_assign_sub: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData() { 
			global[42] = function (a) {
				console.log("hello");
			};
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "[]-FNPAR"}
			],
			"assign":[
			{"v": 0,	"giv": "global"},
			{"v": 1,	"inf": "a"}
			]
		}`
}

inner_lambda_prop: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData(x) { 
			n17.substring( {
				"awesome_key" : function(a) {
					console.log("hello");  
				}
			});
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "FNPAR"},			
			{"a": 2,	"b": 3,	"f2": "FNPAR"}			
			],
			"assign":[
			{"v": 0,	"giv": "chunkData"},
			{"v": 1,	"inf": "x"},			
			{"v": 2,	"giv": "awesome_key"},
			{"v": 3,	"inf": "a"}			
			]
		}`
}

inner_lambda_arg: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData() { 
			foo.substring(a, function(x) {
				console.log("hello");      
			});
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "(2)-FNPAR"}
			],
			"assign":[
			{"v": 0,	"giv": "substring"},
			{"v": 1,	"inf": "x"}
			]
		}`
}

inner_lambda_arg2: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData() { 
			substring(a, function(b) {
				console.log("hello");      
			});
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "(2)-FNPAR"}
			],
			"assign":[
			{"v": 0,	"giv": "substring"},
			{"v": 1,	"inf": "b"}
			]
		}`
}

func_return: {
	options = {
		features	: "FNAMES"
	};
	input: {
		function chunkData() { 
			var a = "foo";
			return a;
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "FNDECL"},			
			{"a": 0,	"b": 1,	"f2": "FNRETURN"}
			],
			"assign":[
			{"v": 0,	"giv": "chunkData"},
			{"v": 1,	"inf": "a"}			
			]
		}`
}

func_scopes: {
	options = {
		features	: "FNAMES, FSCOPE"
	};
	input: {
		function foo(x,b){
			var a = x + y + 1;
			(function(r) {
				return r + x;
			})(2);
		}
	}
	expect: `{
			"query":[
			{"a": 0,	"b": 1,	"f2": "FNPAR"},
			{"a": 0,	"b": 2,	"f2": "FNPAR"},
			{"a": 0,	"b": 3,	"f2": "FNDECL"},
			{"cn":"!=", "n":[0,4]},
			{"cn":"!=", "n":[0,1,2,3,4]},
			{"cn":"!=", "n":[1,4,5]}
			],
			"assign":[
			{"v": 0,	"giv": "foo"},
			{"v": 1,	"inf": "x"},
			{"v": 2,	"inf": "b"},
			{"v": 3,	"inf": "a"},
			{"v": 4,	"giv": "y"},
			{"v": 5,	"inf": "r"}
			]
		}`
}

