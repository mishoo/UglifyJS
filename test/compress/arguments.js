replace_index: {
    options = {
        arguments: true,
        evaluate: true,
        properties: true,
    }
    input: {
        var arguments = [];
        console.log(arguments[0]);
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        var arguments = [];
        console.log(arguments[0]);
        (function() {
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "undefined",
        "42 42 undefined",
        "42 42 undefined",
        "a a undefined",
        "42 42 undefined",
    ]
}

replace_index_strict: {
    options = {
        arguments: true,
        evaluate: true,
        properties: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        "use strict";
        (function() {
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "42 42 undefined",
        "42 42 undefined",
    ]
}

replace_index_keep_fargs: {
    options = {
        arguments: true,
        evaluate: true,
        keep_fargs: false,
        properties: true,
    }
    input: {
        var arguments = [];
        console.log(arguments[0]);
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        var arguments = [];
        console.log(arguments[0]);
        (function(argument_0, argument_1) {
            console.log(argument_1, argument_1, arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
        (function(arguments) {
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
        (function() {
            var arguments;
            console.log(arguments[1], arguments[1], arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "undefined",
        "42 42 undefined",
        "42 42 undefined",
        "a a undefined",
        "42 42 undefined",
    ]
}

replace_index_keep_fargs_strict: {
    options = {
        arguments: true,
        evaluate: true,
        keep_fargs: false,
        properties: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        (function() {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
        (function(a, b) {
            console.log(arguments[1], arguments["1"], arguments["foo"]);
        })("bar", 42);
    }
    expect: {
        "use strict";
        (function(argument_0, argument_1) {
            console.log(argument_1, argument_1, arguments.foo);
        })("bar", 42);
        (function(a, b) {
            console.log(b, b, arguments.foo);
        })("bar", 42);
    }
    expect_stdout: [
        "42 42 undefined",
        "42 42 undefined",
    ]
}

modified: {
    options = {
        arguments: true,
    }
    input: {
        (function(a, b) {
            var c = arguments[0];
            var d = arguments[1];
            var a = "foo";
            b++;
            arguments[0] = "moo";
            arguments[1] *= 2;
            console.log(a, b, c, d, arguments[0], arguments[1]);
        })("bar", 42);
    }
    expect: {
        (function(a, b) {
            var c = a;
            var d = b;
            var a = "foo";
            b++;
            a = "moo";
            b *= 2;
            console.log(a, b, c, d, a, b);
        })("bar", 42);
    }
    expect_stdout: "moo 86 bar 42 moo 86"
}

modified_strict: {
    options = {
        arguments: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        (function(a, b) {
            var c = arguments[0];
            var d = arguments[1];
            var a = "foo";
            b++;
            arguments[0] = "moo";
            arguments[1] *= 2;
            console.log(a, b, c, d, arguments[0], arguments[1]);
        })("bar", 42);
    }
    expect: {
        "use strict";
        (function(a, b) {
            var c = arguments[0];
            var d = arguments[1];
            var a = "foo";
            b++;
            arguments[0] = "moo";
            arguments[1] *= 2;
            console.log(a, b, c, d, arguments[0], arguments[1]);
        })("bar", 42);
    }
    expect_stdout: "foo 43 bar 42 moo 84"
}

duplicate_argname: {
    options = {
        arguments: true,
    }
    input: {
        (function(a, b, a) {
            console.log(a, b, arguments[0], arguments[1], arguments[2]);
        })("foo", 42, "bar");
    }
    expect: {
        (function(a, b, a) {
            console.log(a, b, arguments[0], b, a);
        })("foo", 42, "bar");
    }
    expect_stdout: "bar 42 foo 42 bar"
}

issue_3273: {
    options = {
        arguments: true,
    }
    input: {
        function f(a) {
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect: {
        function f(a) {
            console.log(a, a);
            a++;
            console.log(a, a);
        }
        f(0);
    }
    expect_stdout: [
        "0 0",
        "1 1",
    ]
}

issue_3273_reduce_vars: {
    options = {
        arguments: true,
        reduce_vars: true,
    }
    input: {
        function f(a) {
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect: {
        function f(a) {
            console.log(a, a);
            a++;
            console.log(a, a);
        }
        f(0);
    }
    expect_stdout: [
        "0 0",
        "1 1",
    ]
}

issue_3273_local_strict: {
    options = {
        arguments: true,
    }
    input: {
        function f(a) {
            "use strict";
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect: {
        function f(a) {
            "use strict";
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect_stdout: [
        "0 0",
        "1 0",
    ]
}

issue_3273_local_strict_reduce_vars: {
    options = {
        arguments: true,
        reduce_vars: true,
    }
    input: {
        function f(a) {
            "use strict";
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect: {
        function f(a) {
            "use strict";
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect_stdout: [
        "0 0",
        "1 0",
    ]
}

issue_3273_global_strict: {
    options = {
        arguments: true,
    }
    input: {
        "use strict";
        function f(a) {
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect: {
        "use strict";
        function f(a) {
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect_stdout: [
        "0 0",
        "1 0",
    ]
}

issue_3273_global_strict_reduce_vars: {
    options = {
        arguments: true,
        reduce_vars: true,
    }
    input: {
        "use strict";
        function f(a) {
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect: {
        "use strict";
        function f(a) {
            console.log(arguments[0], a);
            arguments[0]++;
            console.log(arguments[0], a);
        }
        f(0);
    }
    expect_stdout: [
        "0 0",
        "1 0",
    ]
}

issue_3282_1: {
    options = {
        arguments: true,
        reduce_funcs: true,
        reduce_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function(t) {
            return function() {
                t();
            };
        })(function() {
            'use strict';
            function e() {
                return arguments[0];
            }
            e();
            e();
        })();
    }
    expect: {
        (function() {
            return function() {
                (function() {
                    "use strict";
                    function e() {
                        return arguments[0];
                    }
                    e();
                    e();
                })();
            };
        })()();
    }
    expect_stdout: true
}

issue_3282_1_passes: {
    options = {
        arguments: true,
        passes: 2,
        reduce_funcs: true,
        reduce_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function(t) {
            return function() {
                t();
            };
        })(function() {
            'use strict';
            function e() {
                return arguments[0];
            }
            e();
            e();
        })();
    }
    expect: {
        (function() {
            return function() {
                (function() {
                    "use strict";
                    function e(argument_0) {
                        return argument_0;
                    }
                    e();
                    e();
                })();
            };
        })()();
    }
    expect_stdout: true
}

issue_3282_2: {
    options = {
        arguments: true,
        reduce_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function(f) {
            f();
        })(function() {
            return (function(t) {
                return function() {
                    t();
                };
            })(function() {
                'use strict';
                function e() {
                    return arguments[0];
                }
                e();
                e();
            })();
        });
    }
    expect: {
        (function() {
            (function() {
                return function(t) {
                    return function() {
                        t();
                    };
                }(function() {
                    "use strict";
                    function e() {
                        return arguments[0];
                    }
                    e();
                    e();
                })();
            })();
        })();
    }
    expect_stdout: true
}

issue_3282_2_passes: {
    options = {
        arguments: true,
        passes: 2,
        reduce_vars: true,
        keep_fargs: false,
        unused: true,
    }
    input: {
        (function(f) {
            f();
        })(function() {
            return (function(t) {
                return function() {
                    t();
                };
            })(function() {
                'use strict';
                function e() {
                    return arguments[0];
                }
                e();
                e();
            })();
        });
    }
    expect: {
        (function() {
            (function() {
                return function(t) {
                    return function() {
                        t();
                    };
                }(function() {
                    "use strict";
                    function e(argument_0) {
                        return argument_0;
                    }
                    e();
                    e();
                })();
            })();
        })();
    }
    expect_stdout: true
}
