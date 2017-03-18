make_sequences_1: {
    options = {
        sequences: true
    };
    input: {
        foo();
        bar();
        baz();
    }
    expect: {
        foo(),bar(),baz();
    }
}

make_sequences_2: {
    options = {
        sequences: true
    };
    input: {
        if (boo) {
            foo();
            bar();
            baz();
        } else {
            x();
            y();
            z();
        }
    }
    expect: {
        if (boo) foo(),bar(),baz();
        else x(),y(),z();
    }
}

make_sequences_3: {
    options = {
        sequences: true
    };
    input: {
        function f() {
            foo();
            bar();
            return baz();
        }
        function g() {
            foo();
            bar();
            throw new Error();
        }
    }
    expect: {
        function f() {
            return foo(), bar(), baz();
        }
        function g() {
            throw foo(), bar(), new Error();
        }
    }
}

make_sequences_4: {
    options = {
        sequences: true
    };
    input: {
        x = 5;
        if (y) z();

        x = 5;
        for (i = 0; i < 5; i++) console.log(i);

        x = 5;
        for (; i < 5; i++) console.log(i);

        x = 5;
        switch (y) {}

        x = 5;
        with (obj) {}
    }
    expect: {
        if (x = 5, y) z();
        for (x = 5, i = 0; i < 5; i++) console.log(i);
        for (x = 5; i < 5; i++) console.log(i);
        switch (x = 5, y) {}
        with (x = 5, obj);
    }
    expect_stdout: true
}

lift_sequences_1: {
    options = { sequences: true };
    input: {
        var foo, x, y, bar;
        foo = !(x(), y(), bar());
    }
    expect: {
        var foo, x, y, bar;
        x(), y(), foo = !bar();
    }
}

lift_sequences_2: {
    options = { sequences: true, evaluate: true };
    input: {
        var foo = 1, bar;
        foo.x = (foo = {}, 10);
        bar = (bar = {}, 10);
        console.log(foo, bar);
    }
    expect: {
        var foo = 1, bar;
        foo.x = (foo = {}, 10),
        bar = {}, bar = 10,
        console.log(foo, bar);
    }
    expect_stdout: true
}

lift_sequences_3: {
    options = { sequences: true, conditionals: true };
    input: {
        var x, foo, bar, baz;
        x = (foo(), bar(), baz()) ? 10 : 20;
    }
    expect: {
        var x, foo, bar, baz;
        foo(), bar(), x = baz() ? 10 : 20;
    }
}

lift_sequences_4: {
    options = { side_effects: true };
    input: {
        var x, foo, bar, baz;
        x = (foo, bar, baz);
    }
    expect: {
        var x, foo, bar, baz;
        x = baz;
    }
}

lift_sequences_5: {
    options = {
        sequences: true,
    }
    input: {
        var a = 2, b;
        a *= (b, a = 4, 3);
        console.log(a);
    }
    expect: {
        var a = 2, b;
        b, a *= (a = 4, 3),
        console.log(a);
    }
    expect_stdout: "6"
}

for_sequences: {
    options = { sequences: true };
    input: {
        // 1
        foo();
        bar();
        for (; false;);
        // 2
        foo();
        bar();
        for (x = 5; false;);
        // 3
        x = (foo in bar);
        for (; false;);
        // 4
        x = (foo in bar);
        for (y = 5; false;);
    }
    expect: {
        // 1
        for (foo(), bar(); false;);
        // 2
        for (foo(), bar(), x = 5; false;);
        // 3
        x = (foo in bar);
        for (; false;);
        // 4
        x = (foo in bar);
        for (y = 5; false;);
    }
}

limit_1: {
    options = {
        sequences: 3,
    };
    input: {
        a;
        b;
        c;
        d;
        e;
        f;
        g;
        h;
        i;
        j;
        k;
    }
    expect: {
        a, b, c;
        d, e, f;
        g, h, i;
        j, k;
    }
}

limit_2: {
    options = {
        sequences: 3,
    };
    input: {
        a, b;
        c, d;
        e, f;
        g, h;
        i, j;
        k;
    }
    expect: {
        a, b, c, d;
        e, f, g, h;
        i, j, k;
    }
}

negate_iife_for: {
    options = {
        sequences: true,
        negate_iife: true,
    };
    input: {
        (function() {})();
        for (i = 0; i < 5; i++) console.log(i);

        (function() {})();
        for (; i < 5; i++) console.log(i);
    }
    expect: {
        for (!function() {}(), i = 0; i < 5; i++) console.log(i);
        for (function() {}(); i < 5; i++) console.log(i);
    }
    expect_stdout: true
}

iife: {
    options = {
        sequences: true,
    };
    input: {
        x = 42;
        (function a() {})();
        !function b() {}();
        ~function c() {}();
        +function d() {}();
        -function e() {}();
        void function f() {}();
        typeof function g() {}();
    }
    expect: {
        x = 42, function a() {}(), function b() {}(), function c() {}(),
        function d() {}(), function e() {}(), function f() {}(), function g() {}();
    }
}

unsafe_undefined: {
    options = {
        conditionals: true,
        if_return: true,
        sequences: true,
        side_effects: true,
        unsafe: true,
    }
    input: {
        function f(undefined) {
            if (a)
                return b;
            if (c)
                return d;
        }
        function g(undefined) {
            if (a)
                return b;
            if (c)
                return d;
            e();
        }
    }
    expect: {
        function f(undefined) {
            return a ? b : c ? d : undefined;
        }
        function g(undefined) {
            return a ? b : c ? d : void e();
        }
    }
}
