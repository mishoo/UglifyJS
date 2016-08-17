negate_iife_1: {
    options = {
        negate_iife: true
    };
    input: {
        (function(){ stuff() })();
    }
    expect: {
        !function(){ stuff() }();
    }
}

negate_iife_2: {
    options = {
        negate_iife: true
    };
    input: {
        (function(){ return {} })().x = 10; // should not transform this one
    }
    expect: {
        (function(){ return {} })().x = 10;
    }
}

negate_iife_3: {
    options = {
        negate_iife: true,
    };
    input: {
        (function(){ return true })() ? console.log(true) : console.log(false);
    }
    expect: {
        !function(){ return true }() ? console.log(false) : console.log(true);
    }
}

negate_iife_3: {
    options = {
        negate_iife: true,
        sequences: true
    };
    input: {
        (function(){ return true })() ? console.log(true) : console.log(false);
        (function(){
            console.log("something");
        })();
    }
    expect: {
        !function(){ return true }() ? console.log(false) : console.log(true), function(){
            console.log("something");
        }();
    }
}

negate_iife_4: {
    options = {
        negate_iife: true,
        sequences: true,
        conditionals: true,
    };
    input: {
        if ((function(){ return true })()) {
            foo(true);
        } else {
            bar(false);
        }
        (function(){
            console.log("something");
        })();
    }
    expect: {
        !function(){ return true }() ? bar(false) : foo(true), function(){
            console.log("something");
        }();
    }
}

negate_iife_nested: {
    options = {
        negate_iife: true,
        sequences: true,
        conditionals: true,
    };
    input: {
        function Foo(f) {
            this.f = f;
        }
        new Foo(function() {
            (function(x) {
                (function(y) {
                    console.log(y);
                })(x);
            })(7);
        }).f();
    }
    expect: {
        function Foo(f) {
            this.f = f;
        }
        new Foo(function() {
            !function(x) {
                !function(y) {
                    console.log(y);
                }(x);
            }(7);
        }).f();
    }
}

negate_iife_issue_1073: {
    options = {
        negate_iife: true,
        sequences: true,
        conditionals: true,
    };
    input: {
        new (function(a) {
            return function Foo() {
                this.x = a;
                console.log(this);
            };
        }(7))();
    }
    expect: {
        new (function(a) {
            return function Foo() {
                this.x = a,
                console.log(this);
            };
        }(7))();
    }
}

issue_1254_negate_iife_false: {
    options = {
        negate_iife: false,
    }
    input: {
        (function() {
            return function() {
                console.log('test')
            };
        })()();
    }
    expect_exact: '(function(){return function(){console.log("test")}})()();'
}

issue_1254_negate_iife_true: {
    options = {
        negate_iife: true,
    }
    input: {
        (function() {
            return function() {
                console.log('test')
            };
        })()();
    }
    expect_exact: '!function(){return function(){console.log("test")}}()();'
}

issue_1254_negate_iife_nested: {
    options = {
        negate_iife: true,
    }
    input: {
        (function() {
            return function() {
                console.log('test')
            };
        })()()()()();
    }
    expect_exact: '!function(){return function(){console.log("test")}}()()()()();'
}
