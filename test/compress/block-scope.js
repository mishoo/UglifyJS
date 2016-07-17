
let_statement: {
    input: {
        let x = 6;
    }
    expect_exact: "let x=6;"
}

do_not_hoist_let: {
    options = {
        hoist_vars: true,
    };
    input: {
        function x() {
            if (FOO) {
                let let1;
                let let2;
                var var1;
                var var2;
            }
        }
    }
    expect: {
        function x() {
            var var1, var2;
            if (FOO) {
                let let1;
                let let2;
            }
        }
    }
}

do_not_remove_anon_blocks_if_they_have_decls: {
    input: {
        function x() {
            {
                let x;
            }
            {
                var x;
            }
            {
                const y;
                class Zee {};
            }
        }
        {
            let y;
        }
        {
            var y;
        }
    }
    expect: {
        function x(){
            {
                let x
            }
            var x;
            {
                const y;
                class Zee {}
            }
        }
        {
            let y
        }
        var y;
    }
}

remove_unused_in_global_block: {
    options = {
        unused: true,
    }
    input: {
        {
            let x;
            const y;
            class Zee {};
            var w;
        }
        let ex;
        const why;
        class Zed {};
        var wut;
        console.log(x, y, Zee);
    }
    expect: {
        var w;
        var wut;
        console.log(x, y, Zee);
    }
}

regression_block_scope_resolves: {
    mangle = { };
    options = {
        dead_code: false
    };
    input: {
        (function () {
            if(1) {
                let x;
                const y;
                class Zee {};
            }
            if(1) {
                let ex;
                const why;
                class Zi {};
            }
            console.log(x, y, Zee, ex, why, Zi);
        }());
    }
    expect: {
        (function () {
            if (1) {
                let o;
                const n;
                class c {};
            }
            if (1) {
                let o;
                const n;
                class c {};
            }
            console.log(x, y, Zee, ex, why, Zi);
        }());
    }
}
