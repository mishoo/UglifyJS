![logo](http://trigen.pro/colalogo.png)

ColaScript is a language that compiles in JavaScript. This language is similar to Dart, CoffeeScript, Python and PHP, with some original ideas. Compiler based on [UglifyJS2](https://github.com/mishoo/UglifyJS2). In present time compiler in development. Play with language you can [here](http://develop.trigen.pro/cola/).

# to do:

- semicolon is always required, status: done

## Operators:

### Unary
- `varname??` and alternative `isset varname` - which is better? status: done                     

		bool exist = SOME??;
		bool exist2 = isset SOME;
		
- `clone`, status: done

		a = [];
		b = [];
		Array b = clone a;
		b[0] = 584; // a == []
		
	if object have method `__clone__`, object will be copied with it.


### Binary
- `**`, status: done                

		int pow = 5 ** 2; // 25
            
- `%%`, status: done       

		int modulo = 5 %% 3; // 2
                    
- `?=`, status: done                 

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

                   
- `a > b > c`

		if( 0 < x < 100 ) console.log("x E (0; 100)");
		

### Compiler               
- `@require`

		@require "./library/jquery.js", "./library/underscore.js" 
		
- `@use`

		@use strict, typing
		@use asmjs

- `@if @end_if @else`

		@if target == 'web'
			@require './main.cola'
		@else
			@require './mobile/main.cola'
		@end_if


## Expressions
- `switch` assignment

		String weather = switch(temperature){
			case -10: 'cold';
			case 20: 'normal';
			case 35: 'hot';
		};

- `with` scoping, status: it need??       

		with(document.body.querySelectorAll('ul').childNodes){
			var txt = 'text';
			
			forEach((li){
				li.innerHTML = txt;
			});
		}
		
		console.log(txt); // undefined


## Vars
- declaration with type, status: done, only declaration

		int b = 584;
		Array arr = [];
		Object obj = {};
		String str = "";
   
- multiple assignment    

		[a, b, c] = [b, c, a];
    	{poet: {String name, address: [street, city]}} = futurists;
    	[a, ..., b] = someArray; 
      

### bool
- aliases, status: done 

		yes === on === true;
		no === off === false; 
                 

### String
- \` new string \`, status: done  

		String name = `dangreen`; 
            
- multiline, status: done                    

		String ml = "
		
		Lorem ipsum,
		Lorem ipsum.
		
		";

- raw, status: done   

		String str = r"\n \r"; // "\\n \\r" 
                     
- templating, status: done      

		String name = "dan";
		
		console.log("My name is @name."); // My name is dan.
		name = "eric";  
        console.log("My name is @name."); // My name is eric.
        console.log("My name is @{name.capitalize()} or {{name.capitalize()}}"); // My name is Eric.   

### RegExp
- multiline ( and x flag ), status: done      

		RegExp re = /
			([^\d]+)-
			(\w+)
		/gx; 
             

### Arrays
- pushing and getting last, status: done       

		var arr = [3, 5, 6, 7];
		arr[] = 4; // [3, 5, 6, 7, 4]
		console.log(arr[]); // 4
              
- part assignment, status: done  

		arr[0..2] = [0,1]; // [0, 1, 7, 4]
		arr[0..2] = [];    // [7, 4]
		
- slice, status: done 

		arr = arr[0..2]; 

             
- inline array ranging, status: done  

		arr = [10..1]; // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
		arr = [1..10]; // [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]     

### Functions
- without `function` keyword, status: done

		void main(){
			console.log('Hello World!');
		}

- binding toplevel `main` functions to onload event, status: done

		// lib.cola
		
		main(){
			console.log('Hello World from lib.cola!');
		}

		// main.cola
		
		require "./lib.cola";
		
		main(){
			console.log('Hello World!');
		}
		
- arrow functions, status: done

		print(str) => console.log(str);


- named arguments, status: done

		hello(String name:) => console.log("Hello @name!");
		hello(name: 'dangreen'); // Hello dangreen!
		
		hello(name: "World") => console.log("Hello @name!");
		hello(); // Hello World!
		
- defaults for positional arguments, status: done

		hello(String name = "World") => console.log("Hello @name!");
		hello('dangreen'); // Hello dangreen!
		hello(); // Hello World!

- some arguments into array, status: done

		main(name, skills...){
    		console.log("My name is @name, my skills:");
    		skills.forEach((skill) => console.log("@skill,"));
		}


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

### Statistic

- 34 features ( without classes )
- 27 done
