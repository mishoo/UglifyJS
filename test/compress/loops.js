while_becomes_for: {
    options = { loops: true };
    input: {
        while (foo()) bar();
    }
    expect: {
        for (; foo(); ) bar();
    }
}

drop_if_break_1: {
    options = { loops: true };
    input: {
        for (;;)
            if (foo()) break;
    }
    expect: {
        for (; !foo(););
    }
}

drop_if_break_2: {
    options = { loops: true };
    input: {
        for (;bar();)
            if (foo()) break;
    }
    expect: {
        for (; bar() && !foo(););
    }
}

drop_if_break_3: {
    options = { loops: true };
    input: {
        for (;bar();) {
            if (foo()) break;
            stuff1();
            stuff2();
        }
    }
    expect: {
        for (; bar() && !foo();) {
            stuff1();
            stuff2();
        }
    }
}

drop_if_break_4: {
    options = { loops: true, sequences: true };
    input: {
        for (;bar();) {
            x();
            y();
            if (foo()) break;
            z();
            k();
        }
    }
    expect: {
        for (; bar() && (x(), y(), !foo());) z(), k();
    }
}

drop_if_else_break_1: {
    options = { loops: true };
    input: {
        for (;;) if (foo()) bar(); else break;
    }
    expect: {
        for (; foo(); ) bar();
    }
}

drop_if_else_break_2: {
    options = { loops: true };
    input: {
        for (;bar();) {
            if (foo()) baz();
            else break;
        }
    }
    expect: {
        for (; bar() && foo();) baz();
    }
}

drop_if_else_break_3: {
    options = { loops: true };
    input: {
        for (;bar();) {
            if (foo()) baz();
            else break;
            stuff1();
            stuff2();
        }
    }
    expect: {
        for (; bar() && foo();) {
            baz();
            stuff1();
            stuff2();
        }
    }
}

drop_if_else_break_4: {
    options = { loops: true, sequences: true };
    input: {
        for (;bar();) {
            x();
            y();
            if (foo()) baz();
            else break;
            z();
            k();
        }
    }
    expect: {
        for (; bar() && (x(), y(), foo());) baz(), z(), k();
    }
}

parse_do_while_with_semicolon: {
    options = { loops: false };
    input: {
        do {
            x();
        } while (false);y()
    }
    expect: {
        do x(); while (false);y();
    }
}

parse_do_while_without_semicolon: {
    options = { loops: false };
    input: {
        do {
            x();
        } while (false)y()
    }
    expect: {
        do x(); while (false);y();
    }
}


keep_collapse_const_in_own_block_scope: {
    options = {
        join_vars: true,
        loops: true
    }
    input: {
        var i=2;
        const c=5;
        while(i--)
            console.log(i);
        console.log(c);
    }
    expect: {
        var i=2;
        const c=5;
        for(;i--;)
            console.log(i);
        console.log(c);
    }
}

keep_collapse_const_in_own_block_scope_2: {
    options = {
        join_vars: true,
        loops: true
    }
    input: {
        const c=5;
        var i=2; // Moves to loop, while it did not in previous test
        while(i--)
            console.log(i);
        console.log(c);
    }
    expect: {
        const c=5;
        for(var i=2;i--;)
            console.log(i);
        console.log(c);
    }
}
