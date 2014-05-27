![logo](http://trigen.pro/colalogo.png)

ColaScript is a language that compiles in JavaScript. This language is similar to Dart, CoffeeScript, Python and PHP, with some original ideas. Compiler based on [UglifyJS2](https://github.com/mishoo/UglifyJS2). In present time compiler in development. Play with language you can [here](http://develop.trigen.pro/cola/).


Install
===

First make sure you have installed the latest version of [node.js](http://nodejs.org/)
(You may need to restart your computer after this step).

From NPM for use as a command line app:

    npm install cola-script -g

From NPM for programmatic use:

    npm install cola-script

From Git:

    git clone git://github.com/TrigenSoftware/ColaScript.git
    cd ColaScript
    npm link .
    
Usage same as in [UglifyJS2](https://github.com/mishoo/UglifyJS2), except:

	-j, --js, --javascript        Work with JavaScript (by default Cola will
	                              expect ColaScript).                    [boolean]
    -n, --no-main-binding         Disable `main` binding.                [boolean]
    
    
Simple example of usage:

	cola main.cola -o main.min.js -m -c    

    
In browser
===

In developing more comfortable to compile the code directly in your browser, for this add `browser-cola.js` to `your.html` code:

	<script src="path/to/browser-cola.js"></script>
	
Now you can run your Cola-Code:

	<script type="text/colascript" src="path/to/your.cola"></script>
	
If `your.cola` depends on other scripts in `your.html`, better to notice `browser-cola` about it:

	<script type="text/colascript" src="angular.min.js"></script>
	<script type="text/colascript" src="path/to/your.cola"></script>
    

Overview
===

## Need to know:
- not always valid-javascript is valid-colascript
- semicolon is always required
- in present time typing is just syntax


## Variables
In current version you can set any type which you want, frankly speaking is not good.. In future we will have static typing.

	var num = 1;           // valid JavaScript
	int i, j = 3;
	String str = `someString`; // yes, you can use ` quotes
	
In ColaScript, like in CoffeScript, exists boolean-aliases:

	yes == on == true;
	no == off == false	


## Strings
We have templating! We can paste variable in string:

	console.log("my login in twitter \@@twLogin");
	
Also we can paset expression this way:

	console.log("length of my name @{ name.length }");
	
and this way:

	console.log("first letter in my name is {{ name[0] }}");
	
Still possible to use raw strings:

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


## RegExps
Modifer `x` skips whitespaces and new-line same as if you use multiline RegExp:

	RegExp url = /
		^
			(https?:\/\/)?
			([\w\.]+)
			\.([a-z]{2,6}\.?)
			(\/[\w\.]*)*\/?
		$/;


## Arrays
Most of array features was taken from CoffeeScript:

	Array arr = [0..9];      // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
	// same as
	Array arr = [0...10];
	
	arr[0..2] = [584, 404];  // [584, 404, 3, 4, 5, 6, 7, 8, 9]
	console.log(arr[0..2]);  // [584, 404]
	
one feature getted from PHP:

	arr[] = 22;              // [584, 404, 3, 4, 5, 6, 7, 8, 9, 22]
	
absolutely new feature is: 

	console.log(arr[]);      // 22 

	
## Functions
You have opportunity to declarate functions without `function` keyword, with and without type:

	function f1(){
	
	}
	
	void f2(){
	
	}
	
	f2(){
	
	}
	
From Dart we borrowd arrow-functions:

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
	

## Operators:

- `isset` operator, `??` alternative - which is better?                    

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

		int modulo = 5 %% 3; // 2
                    
- Existential assignment from CoffeeScript:                

		var undef, def = 5;
		
		def ?= undef; // def == 5
		undef = 6;
		def ?= undef; // def == 6
          
- `a ? b`, status: done

		var a = undefined, b = 3;
		
		a ? b == 3;
		a = 11;
		a ? b == 1;
                       
- `is`, status: done                           

		bool isRegExp = /[^\d]+/g is RegExp; // true

- `isnt`, status: done                         

		bool isntString = 3.14 isnt String; // true




### Multiple
- `..:`, status: done      

		Object profile = { 
			name : "dan",
			nick : "dan",
			friends : [
				{ name : "eric", nick : "eric" }
			], 
			"info" : "coder"
		}
    		..name += "iil"
    		..nick += "green"
    		..friends[0]:
        		..name = profile.friends[0].name.capitalize()
        		..nick += "bro";
   		 	..info += ", student"; 

                   
- `a > b > c`, status: done

		if( 0 < x < 100 ) console.log("x E (0; 100)");
		

### Compiler               
- `@require`, status: done

		@require "./library/jquery.js" "./library/underscore.js" 
		
- `@include`, status: done
		
		@include "./app/my.js"
		
- `@use`, status: done

		@use strict
		@use asmjs
		@use closure


## Expressions
- `switch` assignment, status: done!

		String weather = switch(temperature){
			when -10: 'cold';
			when 20: 'normal';
			when 35: 'hot';
		};


## Vars
   
- multiple assignment, status: done    

		[a, b, c] = [b, c, a];
    	var {poet: {String name, address: [street, city]}} = futurists;
    	[a, ..., b] = someArray; 
      
## Classes
- classes
- singletones
- injectors

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

		singleton S { // in fact this is object
    		int x = 45;
    		String s = "txt";
    
    		say(some){
        		alert(some);
    		}
    
    		int operator[](int index) => index + 584;
    		operator[]=(int index, int val) => x = index + val;
    
    		String operator.(String key) => key + "!";
    		operator.(String key, String value) => s = "@key @value";
    
		}

		injector String {
    		String replaceAll(a, b){
        		String res = this;
        		while(res.indexOf(a) != -1) res = res.replace(a, b);
        		return res;
    		}
		}

		// or 

		String String::replaceAll(a, b){
  			String res = this;
    		while(res.indexOf(a) != -1) res = res.replace(a, b);
    		return res;
		}
