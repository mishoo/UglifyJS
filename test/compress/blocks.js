remove_blocks: {
    input: {
        {;}
        foo();
        {};
        {
            {};
        };
        bar();
        {}
    }
    expect: {
        foo();
        bar();
    }
}

keep_some_blocks: {
    input: {
        // 1.
        if (foo) {
            {{{}}}
            if (bar) { baz(); }
            {{}}
        } else {
            stuff();
        }

        // 2.
        if (foo) {
            for (var i = 0; i < 5; ++i)
                if (bar) baz();
        } else {
            stuff();
        }
    }
    expect: {
        // 1.
        if (foo) {
            if (bar) baz();
        } else stuff();

        // 2.
        if (foo) {
            for (var i = 0; i < 5; ++i)
                if (bar) baz();
        } else stuff();
    }
}

issue_1664: {
    input: {
        var a = 1;
        function f() {
            if (undefined) a = 2;
            {
                function undefined() {}
                undefined();
            }
        }
        f();
        console.log(a);
    }
    expect: {
        var a = 1;
        function f() {
            if (undefined) a = 2;
            {
                function undefined() {}
                undefined();
            }
        }
        f();
        console.log(a);
    }
    expect_stdout: "1"
    node_version: ">=6"
    reminify: false // FIXME - block scoped function
}

issue_1672_for: {
    input: {
        switch (function() {
            return xxx;
        }) {
          case xxx:
            for (; console.log("FAIL");) {
                function xxx() {}
            }
            break;
        }
    }
    expect: {
        switch (function() {
            return xxx;
        }) {
          case xxx:
            for (; console.log("FAIL");) {
                function xxx() {}
            }
            break;
        }
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_1672_for_strict: {
    input: {
        "use strict";
        switch (function() {
            return xxx;
        }) {
          case xxx:
            for (; console.log("FAIL");) {
                function xxx() {}
            }
            break;
        }
    }
    expect: {
        "use strict";
        switch (function() {
            return xxx;
        }) {
          case xxx:
            for (; console.log("FAIL");) {
                function xxx() {}
            }
            break;
        }
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_1672_if: {
    input: {
        switch (function() {
            return xxx;
        }) {
          case xxx:
            if (console.log("FAIL")) {
                function xxx() {}
            }
            break;
        }
    }
    expect: {
        switch (function() {
            return xxx;
        }) {
          case xxx:
            if (console.log("FAIL")) function xxx() {}
            break;
        }
    }
    expect_stdout: true
    node_version: ">=6"
}

issue_1672_if_strict: {
    input: {
        "use strict";
        switch (function() {
            return xxx;
        }) {
          case xxx:
            if (console.log("FAIL")) {
                function xxx() {}
            }
            break;
        }
    }
    expect: {
        "use strict";
        switch (function() {
            return xxx;
        }) {
          case xxx:
            if (console.log("FAIL")) {
                function xxx() {}
            }
            break;
        }
    }
    expect_stdout: true
    node_version: ">=6"
}
