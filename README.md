![logo](https://raw.githubusercontent.com/TrigenSoftware/ColaScript/master/colalogo.png)

ColaScript is a language that compiles in JavaScript. This language is similar to Dart, CoffeeScript, Python and PHP, with some original ideas. Compiler based on [UglifyJS2](https://github.com/mishoo/UglifyJS2). You can play with language [here](http://develop.trigen.pro/cola/).


Installation
===

Firstly, make sure you have installed the latest version of [node.js](http://nodejs.org/)
(You may need to restart your computer after this step).

From NPM for use as a command line app:

    npm install cola-script -g

From NPM for programmatic use:

    npm install cola-script

From Git:

    git clone git://github.com/TrigenSoftware/ColaScript.git
    cd ColaScript
    npm link .
    
Use it same as in [UglifyJS2](https://github.com/mishoo/UglifyJS2), except:

	-j, --js, --javascript        Work with JavaScript (by default Cola will
	                              expect ColaScript).                    [boolean]
    -n, --no-main-binding         Disable `main` binding.                [boolean]
    
    
Simple example of usage:

	cola main.cola -o main.min.js -m -c    

    
In browser
===

In developing is more comfortable to compile the code directly in your browser, for this add `browser-cola.js` to `your.html` code:

	<script src="path/to/browser-cola.js"></script>
	
Now you can run your Cola-Code:

	<script type="text/colascript" src="path/to/your.cola"></script>
	
If `your.cola` depends on other scripts in `your.html`, it's better to notice `browser-cola` about it:

	<script type="text/colascript" src="angular.min.js"></script>
	<script type="text/colascript" src="path/to/your.cola"></script>
    

Overview
===

### Need to know
- not always valid-javascript is valid-colascript
- semicolon is always required
- in present time typing is just syntax


### Variables
You can set any type which you want in current version , to tell you the truth it's not so good. In future we will have static typing.

	var num = 1;           // valid JavaScript
	int i, j = 3;
	String str = `someString`; // yes, you can use ` quotes
	
In ColaScript, like in CoffeScript, exists boolean-aliases:

	yes == on == true;
	no == off == false;	


### Strings
We have templating! We can paste variable in string:

	console.log("my login in twitter \@@twLogin");
	
Also we can paste expression in this way:

	console.log("length of my name @{ name.length }");
	
and this way:

	console.log("first letter in my name is {{ name[0] }}");
	
It is still possible to use raw strings:

	console.log(r"\n\r\t@raw");
	
Any string in ColaScript is multiline:

	console.log("
	
		List1:
			- Write code
			- Drink tea
			- Watch Instagram
			
		List2
			* Write code
			* Read Habrahabr
			* Listen music
			
		");
		
align goes by closing-quote. 


### RegExps
Modifer `x` skips whitespaces and new-line same as if you use multiline RegExp:

	RegExp url = /
		^
			(https?:\/\/)?
			([\w\.]+)
			\.([a-z]{2,6}\.?)
			(\/[\w\.]*)*\/?
		$/;


### Arrays
Most of array features were taken from CoffeeScript:

	Array arr = [0..9];      // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
	// same as
	Array arr = [0...10];
	
	arr[0..2] = [584, 404];  // [584, 404, 3, 4, 5, 6, 7, 8, 9]
	console.log(arr[0..2]);  // [584, 404, 3]
	
one feature was taken from PHP:

	arr[] = 22;              // [584, 404, 3, 4, 5, 6, 7, 8, 9, 22]
	
absolutely new feature is: 

	console.log(arr[]);      // 22 

	
### Functions
You have opportunity to declarate functions without `function` keyword, with type and without it:

	function f1(){
	
	}
	
	void f2(){
	
	}
	
	f3(){
	
	}
	
From Dart we have borrowed arrow-functions:

	helloString(name) => "Hello @name!";
	
Arguments have `positional` or `named` types and can have default value:

	hello(String name:) => console.log("Hello @name!");
	hello(name: 'dangreen');                             // Hello dangreen!
		
	hello(name: "World") => console.log("Hello @name!");
	hello();                                             // Hello World!

	// or

    hello(String name = "World") => console.log("Hello @name!");
	hello('dangreen');                                   // Hello dangreen!
	hello();                                             // Hello World!

As in CoffeScript we can declare `splated` argument

	info(name, skills...){
    	console.log("My name is @name, my skills:");
    	skills.forEach((skill) => console.log("@skill,"));
	}

All `main` functions in root namespace will bind on `DOMContentLoaded` event:

	// lib.cola
		
	main(){
		console.log('Hello World from lib.cola!');
	}

	// main.cola
		
	@require "lib.cola";
		
	main(){
		console.log('Hello World!');
	}
	

### Operators
- `isset` operator:                

		bool a = true, b;
		console.log(isset a ? "seted" : "not seted"); // seted
		console.log(isset b ? "seted" : "not seted"); // not seted
		
- `clone` of variable:

		Array a = [], b = clone a;
		b[0] = 584; // a == []
		
	if object have method `__clone__`, object will be copied with it.

- Math.pow operator:           

		int pow = 5 ** 2; // 25
            
- CoffeeScript's modulo operator:  

		Array nums = [0..9];
		console.log(nums[4 %% nums.length]);  // 4
		console.log(nums[14 %% nums.length]); // 4
                    
- Existential assignment from CoffeeScript:                

		defaults(Object input, Object defaults){
    		for(int key in defaults) input[key] ?= defaults[key];
    		return input;
		}

		console.log(defaults({ 
			compress: true 
		}, { 
			compress: false, 
			mangle: false
		})); // { compress: true, mangle: false }
          
- Existential operator:

		int a, b = 3;
		
		console.log(a ? b); // 3
		a = 11;
		console.log(a ? b); // 11
                       
- Binary operator `is`:                       

		bool isRegExp = /[^\d]+/g is RegExp; // true

- Binary operator `isnt`:                         

		bool isntString = 3.14 isnt String; // true


### Constructions
In ColaScript you can use those syntax with object, in way not to repeat var names:

	String name = "dangreen";
	int age = 19;
	String about = "
	
	Web programmer, NSTU student.
	
	";
	
	Object info = { name, age, about };

Also you can use `destructuring assignment`:

	int a = 2, b = 3;
		
	// swap
	[a, b] = [b, a];
		
	// with object
    { name, age, about, friends : [firstFriend] } = info;
    
    // with array
    [firstSkill, ..., lastSkill] = skills; 

From Dart we have taken `cascade operator`:

	document.querySelector("#myelement").style
		..fontSize = "16px"
		..color   =  "black";
		
but we have made some modification:     

	document.querySelector("#myelement")
		..style:
			..fontSize = "16px"
			..color   =  "black";
		..innerHTML = "Hello World!";

                   
As in CoffeeScript, you can use `chained comprassions`:

	if( 1 < x < 100 ) console.log("x E ( 1 ; 100 )");
		
`inline conditions`:

	String name = 
		if (sex == "male") "Dan" 
		else if (sex == "female") "Dasha" 
		else "none";

`inline switch` and `switch without expression`:

	String grade = switch {
  		when score < 60: 'F';
  		when score < 70: 'D';
  		when score < 80: 'C';
  		when score < 90: 'B';
  		default: 'A';
  	};
  	
As you see, you can use keyword `when`, it's like `case`, but if the condition is satisfied, `switch` will `break`.

### Compiler commands              
- `@require`, pushed required code to front

		@require "./library/jquery.js" "./library/underscore.js" 
		
- `@include`, insert included code on `@include` place
		
		@include "./app/my.js"
		
- `@use`, enable one of mods

		@use strict
		@use asm
		@use closure
		
	`@use closure` wrapping code in closure:
	
		// cola
		
		@use closure
		
		NgModule app = angular.module('app', []);
		
		// js
		
		(function(){
			var app = angular.module('app', []);
		})(); 
		
	Also you can use multiple closures in one file:
	
		@use closure {
			int a = 123;
		}
		
		@use closure {
			int a = 321;
		}
   
   
Future plans
===
- Use inline `isset` expression instead function. status: done
- Use inline `is`.
- `some is NaN` to `isNaN(some)` status: done
- operator `?` instead `isset`, fix the operator with function call
- operator `?.`
- operator `?` to sign an argument as not-required

		int sqr(int x) => x ** 2;
		
		sqr(2); // 4
		sqr();  // Exception
		
		int sqrt(int x?) => x ** 2;
		sqr();  // NaN

- Negate array accessor ( getter )
 
		arr[-1]; // last element

	only for static negate index, for other cases you can use `%` unary prefix:
	
		int index = -10;
		arr[%index] = 34; // arr[index %% arr.length];

- static typing	
- rename runtime prefix `$_cola` to `_crt$$`
- inline using of `@use`

		@use meteor
		@use strict
		
		@use closure
		
		// or you can...
		
		@use meteor strict closure
		

- dotal names of refs

		String String::replaceAll(a, b){
  			String res = this;
    		while(res.indexOf(a) != -1) res = res.replace(a, b);
    		return res;
		}
		
		// or
		
		Object data = someData;
		int data.getFriendsCount() => this.friends.length;
		
		// or
		
		Cola.AST_Node node = new Cola.AST_Node;
		
- intarface

		inerface UserProfile {
			String name, email;					
			Date birth;
			String info?;
		}

- classes

		class A {
    
		    private int a = 123;
    		protected var o = {};
    
    		readonly String about = "class";
    
    		A(a){
        		about = "some else";
    		}
    
    		static Hello() => "hello!";
    
    		public String about() => about;
		}

		class B extends A {
    
    		B(){
        		parent();
        		about += "!";  
    		}
    
    		B.anotherConstructor(){
        		about = "ups!";  
    		}
    
    		get some => "some " + about;
    		set some(val) => about += val; 
		}
		
- classes and typing with templates

		class A<T> {
			// ...
		}
		
		Array<int> arr = [0...10];
		Object<String, String> obj = { name: "Eric" };
			
- singletones

		singleton S { // in fact this is object
    		int x = 45;
    		String s = "txt";
    
    		say(some){
        		alert(some);
    		}
    
    		int operator[](int index) => index + 584;
    		operator[]=(int index, int val) => x = index + val;
    
		}
		
- injectors

		injector String {
    		String replaceAll(a, b){
        		String res = this;
        		while(res.indexOf(a) != -1) res = res.replace(a, b);
        		return res;
    		}
		}
		
- destructed function arguments

		test({String name, String login, String photoUrl}){
			console.log(name, login, photoUrl);
		}
	
- ES6 `for` 
	
		for(name of names){
	
		}

- Compiler command `@import` to import modules ( AMD, CommonJS... )

		// node.js
		@import 'fs' as fs
		@import dirname from 'path'
		
		String code = fs.readFileSync(dirname(filePath) + "/main.cola", "utf8");

- set parameters to calling function

		$(".btn").on("click", *(){
			this; // parent context
		});
		
- namespaces, name of namespace must be cupitalized

		@use Cola {
			
			class AST_Node {
				...
			}
			
		}
		
		Cola.AST_Node node = new Cola.AST_Node();
		

- write documentation of tokenizer/parser methods
- more informative exceptions
- better source maps
- HTML and CSS stuff

		String width = 12px;
		String div = <div class="inline">
			<h1>Example of Embedded HTML</h1>
		</div>;
		
	by default it will parsed as `String`, but it may be handled by Plugins. 
	
- Plugin API to make native syntax for libraries and frameworks

		class MyComponent extends PolymerComponent {
			String tagname = "my-component";
			
			ready(){
				// ...
			}	
		}
		
		to 
		
		Polymer('my-component', {
      		ready: function(){ 
      			// ...
      		}
     	});
     	
- Compiler command `@use pluginname` , pluginname must be in lower case.
- asm.js native syntax, for example

		// cola
		// ...
	
		@use asm
	
		int f(double j){
			int i = 1;
			return i;
		}
	
		// js
		// ...
	
		"use asm";
	
		function f(j){
			j = +j;
	    	var i = 1|0;
	    	return i|0;
		}
		