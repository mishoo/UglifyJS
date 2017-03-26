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

negate_iife_1_off: {
    options = {
        negate_iife: false,
    };
    input: {
        (function(){ stuff() })();
    }
    expect_exact: '(function(){stuff()})();'
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

negate_iife_2_side_effects: {
    options = {
        negate_iife: true,
        side_effects: true,
    }
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
        conditionals: true
    };
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
    }
    expect: {
        !function(){ return t }() ? console.log(false) : console.log(true);
    }
}

negate_iife_3_evaluate: {
    options = {
        conditionals: true,
        evaluate: true,
        negate_iife: true,
    }
    input: {
        (function(){ return true })() ? console.log(true) : console.log(false);
    }
    expect: {
        console.log(true);
    }
    expect_stdout: true
}

negate_iife_3_side_effects: {
    options = {
        conditionals: true,
        negate_iife: true,
        side_effects: true,
    }
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
    }
    expect: {
        !function(){ return t }() ? console.log(false) : console.log(true);
    }
}

negate_iife_3_off: {
    options = {
        negate_iife: false,
        conditionals: true,
    };
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
    }
    expect: {
        !function(){ return t }() ? console.log(false) : console.log(true);
    }
}

negate_iife_3_off_evaluate: {
    options = {
        conditionals: true,
        evaluate: true,
        negate_iife: false,
    }
    input: {
        (function(){ return true })() ? console.log(true) : console.log(false);
    }
    expect: {
        console.log(true);
    }
    expect_stdout: true
}

negate_iife_4: {
    options = {
        negate_iife: true,
        conditionals: true,
        sequences: true
    };
    input: {
        (function(){ return t })() ? console.log(true) : console.log(false);
        (function(){
            console.log("something");
        })();
    }
    expect: {
        !function(){ return t }() ? console.log(false) : console.log(true), function(){
            console.log("something");
        }();
    }
}

sequence_off: {
    options = {
        negate_iife: false,
        conditionals: true,
        sequences: true,
        passes: 2,
    };
    input: {
        function f() {
            (function(){ return t })() ? console.log(true) : console.log(false);
            (function(){
                console.log("something");
            })();
        }
        function g() {
            (function(){
                console.log("something");
            })();
            (function(){ return t })() ? console.log(true) : console.log(false);
        }
    }
    expect: {
        function f() {
            !function(){ return t }() ? console.log(false) : console.log(true), function(){
                console.log("something");
            }();
        }
        function g() {
            (function(){
                console.log("something");
            })(), function(){ return t }() ? console.log(true) : console.log(false);
        }
    }
}

negate_iife_5: {
    options = {
        negate_iife: true,
        sequences: true,
        conditionals: true,
    };
    input: {
        if ((function(){ return t })()) {
            foo(true);
        } else {
            bar(false);
        }
        (function(){
            console.log("something");
        })();
    }
    expect: {
        !function(){ return t }() ? bar(false) : foo(true), function(){
            console.log("something");
        }();
    }
}

negate_iife_5_off: {
    options = {
        negate_iife: false,
        sequences: true,
        conditionals: true,
    };
    input: {
        if ((function(){ return t })()) {
            foo(true);
        } else {
            bar(false);
        }
        (function(){
            console.log("something");
        })();
    }
    expect: {
        !function(){ return t }() ? bar(false) : foo(true), function(){
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
    expect_stdout: true
}

negate_iife_nested_off: {
    options = {
        negate_iife: false,
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
            (function(x) {
                (function(y) {
                    console.log(y);
                })(x);
            })(7);
        }).f();
    }
    expect_stdout: true
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
    expect_stdout: true
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
    expect_stdout: true
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
    expect_stdout: true
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
    expect_stdout: true
}

issue_1288: {
    options = {
        conditionals: true,
        negate_iife: true,
        side_effects: false,
    };
    input: {
        if (w) ;
        else {
            (function f() {})();
        }
        if (!x) {
            (function() {
                x = {};
            })();
        }
        if (y)
            (function() {})();
        else
            (function(z) {
                return z;
            })(0);
    }
    expect: {
        w || !function f() {}();
        x || !function() {
            x = {};
        }();
        y ? !function() {}() : !function(z) {
            return z;
        }(0);
    }
}

issue_1288_side_effects: {
    options = {
        conditionals: true,
        negate_iife: true,
        side_effects: true,
    }
    input: {
        if (w) ;
        else {
            (function f() {})();
        }
        if (!x) {
            (function() {
                x = {};
            })();
        }
        if (y)
            (function() {})();
        else
            (function(z) {
                return z;
            })(0);
    }
    expect: {
        w;
        x || function() {
            x = {};
        }();
        y;
    }
}
